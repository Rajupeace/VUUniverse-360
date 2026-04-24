import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaBus, FaPlus, FaEdit, FaTrash, FaRoute, FaUsers,
    FaClock, FaSearch, FaFilter, FaSignOutAlt, FaBars, FaTimes, FaCheck,
    FaGasPump, FaTools, FaExclamationTriangle, FaMapMarkerAlt,
    FaMapMarkedAlt, FaHammer, FaList, FaCalendarCheck, FaHistory, FaBell,
    FaUserGraduate, FaChalkboardTeacher, FaRobot
} from 'react-icons/fa';
import VuAiAgent from '../VuAiAgent/VuAiAgent';
import { apiGet, apiPost, apiPut, apiDelete } from '../../utils/apiClient';
import sseClient from '../../utils/sseClient';
import StudentSection from '../AdminDashboard/Sections/StudentSection';
import FacultySection from '../AdminDashboard/Sections/FacultySection';
import './TransportManagerDashboard.css';

const TransportManagerDashboard = ({ managerData, onLogout, isEmbedded }) => {
    const [activeSection, setActiveSection] = useState('fleet'); // 'fleet' | 'students' | 'faculty'
    const [transportList, setTransportList] = useState([]);
    const [students, setStudents] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('transport'); // 'transport' | 'student' | 'faculty'
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [viewMode, setViewMode] = useState('list');
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        id: null,
        routeNumber: '',
        routeName: '',
        driverName: '',
        capacity: 60,
        busModel: '',
        availabilityStatus: 'Active',
        timing: '',
        lastMaintenance: '',
        nextMaintenance: '',
        maintenanceNotes: ''
    });

    const [personFormData, setPersonFormData] = useState({});
    const isFetchingRef = useRef(false);

    useEffect(() => {
        loadAllData();
        // 30s refresh interval to prevent backend overload
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') loadAllData();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadAllData = async () => {
        if (isFetchingRef.current) return; // Skip if already fetching
        isFetchingRef.current = true;
        try {
            setLoading(true);
            const [transportRes, studentsRes, facultyRes] = await Promise.all([
                apiGet('/api/transport'),
                apiGet('/api/students'),
                apiGet('/api/faculty')
            ]);
            setTransportList(Array.isArray(transportRes) ? transportRes : []);
            const sData = Array.isArray(studentsRes) ? studentsRes : [];
            const fData = Array.isArray(facultyRes) ? facultyRes : [];
            setStudents(sData.filter(s => s.isTransportUser === true || s.isTransportUser === 'true'));
            setFaculty(fData.filter(f => f.isTransportUser === true || f.isTransportUser === 'true'));
        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    };

    useEffect(() => {
        const alerts = [];
        const now = new Date();
        transportList.forEach(item => {
            if (item.nextMaintenance) {
                const nextDate = new Date(item.nextMaintenance);
                if (nextDate < now) {
                    alerts.push({
                        id: item._id || item.id,
                        type: 'overdue',
                        title: 'Maintenance Overdue',
                        message: `${item.routeNumber} - ${item.busModel}`,
                        date: nextDate
                    });
                } else if ((nextDate - now) / (1000 * 60 * 60 * 24) < 7) {
                    alerts.push({
                        id: item._id || item.id,
                        type: 'due-soon',
                        title: 'Maintenance Due Soon',
                        message: `${item.routeNumber} - ${item.busModel}`,
                        date: nextDate
                    });
                }
            }
        });
        setNotifications(alerts.sort((a, b) => a.date - b.date));
    }, [transportList]);

    useEffect(() => {
        const unsub = sseClient.onUpdate((ev) => {
            if (ev && (ev.resource === 'transport' || ev.resource === 'students' || ev.resource === 'faculty')) {
                loadAllData();
            }
        });
        return unsub;
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (modalType === 'transport') {
                if (formData.id) {
                    await apiPut(`/api/transport/${formData.id}`, formData);
                } else {
                    await apiPost('/api/transport', formData);
                }
            } else {
                const endpoint = modalType === 'student' ? '/api/students' : '/api/faculty';
                const id = modalType === 'student' ? (personFormData.sid || personFormData._id) : (personFormData.facultyId || personFormData._id);

                // Ensure the data is captured from personFormData state
                const submissionData = { ...personFormData };

                if (personFormData._id || (modalType === 'student' && personFormData.sid) || (modalType === 'faculty' && personFormData.facultyId)) {
                    await apiPut(`${endpoint}/${id}`, submissionData);
                } else {
                    await apiPost(endpoint, submissionData);
                }
            }
            setShowModal(false);
            loadAllData();
        } catch (error) {
            console.error('Save failed', error);
            alert('Failed to save record: ' + (error.message || 'Transmission error'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, type = 'transport') => {
        if (!window.confirm(`Are you sure you want to delete this ${type} record?`)) return;
        try {
            const endpoint = type === 'transport' ? `/api/transport/${id}` : type === 'student' ? `/api/students/${id}` : `/api/faculty/${id}`;
            await apiDelete(endpoint);
            loadAllData();
        } catch (error) {
            console.error('Delete failed', error);
            alert(`Failed to delete ${type}: ` + error.message);
        }
    };

    const openModal = (type, item = null) => {
        setModalType(type);
        if (type === 'transport') {
            if (item) {
                setFormData({
                    id: item._id || item.id,
                    routeNumber: item.routeNumber || item.busNumber || '',
                    routeName: item.routeName || '',
                    driverName: item.driverName || '',
                    capacity: item.capacity || 60,
                    busModel: item.busModel || '',
                    availabilityStatus: item.availabilityStatus || 'Active',
                    timing: item.timing || '',
                    lastMaintenance: item.lastMaintenance ? item.lastMaintenance.split('T')[0] : '',
                    nextMaintenance: item.nextMaintenance ? item.nextMaintenance.split('T')[0] : '',
                    maintenanceNotes: item.maintenanceNotes || ''
                });
            } else {
                setFormData({
                    id: null,
                    routeNumber: '',
                    routeName: '',
                    driverName: '',
                    capacity: 60,
                    busModel: '',
                    availabilityStatus: 'Active',
                    timing: '',
                    lastMaintenance: '',
                    nextMaintenance: '',
                    maintenanceNotes: ''
                });
            }
        } else if (type === 'student') {
            setPersonFormData(item || {
                studentName: '',
                sid: '',
                email: '',
                phone: '',
                year: '1',
                branch: 'CSE',
                section: 'A',
                password: '',
                isTransportUser: true
            });
        } else if (type === 'faculty') {
            setPersonFormData(item || {
                name: '',
                facultyId: '',
                email: '',
                phone: '',
                department: 'CSE',
                designation: 'Assistant Professor',
                password: '',
                isTransportUser: true
            });
        }
        setShowModal(true);
    };

    const filteredList = transportList.filter(item => {
        const matchesSearch = (item.routeName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.routeNumber?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.driverName?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesFilter = filterStatus === 'All' || item.availabilityStatus === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const totalBuses = transportList.length;
    const activeBuses = transportList.filter(t => t.availabilityStatus === 'Active').length;
    const maintenanceBuses = transportList.filter(t => t.availabilityStatus === 'Maintenance').length;

    const managerName = managerData?.name || 'Transport Manager';
    const managerInitial = managerName.charAt(0).toUpperCase();

    const renderMap = () => (
        <div className="td-map-view">
            <div className="td-map-container">
                <div className="td-map-bg">
                    <div className="map-grid-lines"></div>
                </div>
                {filteredList.map((route, index) => {
                    const seed = route._id ? route._id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) : index * 123;
                    const top = (seed % 75) + 12;
                    const left = ((seed * 17) % 80) + 10;
                    return (
                        <motion.div
                            key={route._id || index}
                            className="td-map-pin"
                            style={{ top: `${top}%`, left: `${left}%` }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            whileHover={{ scale: 1.15, zIndex: 50 }}
                            onClick={() => openModal('transport', route)}
                        >
                            <div className="pin-pulse"></div>
                            <div className={`pin-head ${route.availabilityStatus?.toLowerCase()}`}>
                                <FaBus />
                            </div>
                            <div className="pin-label">
                                <span className="pin-route">{route.routeNumber}</span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );

    const renderMaintenance = () => {
        const sortedList = [...filteredList].sort((a, b) => {
            const dateA = new Date(a.nextMaintenance || '2099-12-31');
            const dateB = new Date(b.nextMaintenance || '2099-12-31');
            return dateA - dateB;
        });
        return (
            <div className="td-maintenance-grid" style={{ padding: '0 2rem 2rem 2rem' }}>
                {sortedList.map(item => {
                    const nextDate = item.nextMaintenance ? new Date(item.nextMaintenance) : null;
                    const isOverdue = nextDate && nextDate < new Date();
                    const isDueSoon = nextDate && (nextDate - new Date()) / (1000 * 60 * 60 * 24) < 7;
                    return (
                        <motion.div
                            key={item._id || item.id}
                            className={`td-maint-card ${isOverdue ? 'overdue' : isDueSoon ? 'due-soon' : ''}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ translateY: -5 }}
                        >
                            <div className="maint-header">
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Vehicle ID: {item.routeNumber}</span>
                                    <h4>{item.busModel || 'Transit Vehicle'}</h4>
                                </div>
                                <span className={`status-tag ${isOverdue ? 'danger' : isDueSoon ? 'warning' : 'success'}`}>
                                    {isOverdue ? 'CRITICAL' : isDueSoon ? 'URGENT' : 'STABLE'}
                                </span>
                            </div>

                            <div className="maint-dates">
                                <div className="maint-date-item">
                                    <span className="label">Last Inspection</span>
                                    <span className="value">{item.lastMaintenance ? new Date(item.lastMaintenance).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</span>
                                </div>
                                <div className="maint-date-item">
                                    <span className="label">Service Due</span>
                                    <span className="value" style={{ color: isOverdue ? '#ef4444' : isDueSoon ? '#f59e0b' : '#10b981' }}>
                                        {item.nextMaintenance ? new Date(item.nextMaintenance).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not Set'}
                                    </span>
                                </div>
                            </div>

                            <div className="maint-notes" style={{ overflowY: 'auto', maxHeight: '100px' }}>
                                <p style={{ margin: 0 }}>{item.maintenanceNotes || 'No anomalies reported in recent logs.'}</p>
                            </div>

                            <button className="maint-action-btn" onClick={() => openModal('transport', item)}>
                                <FaCalendarCheck /> Update Logistics Log
                            </button>
                        </motion.div>
                    );
                })}
            </div>
        );
    };

    const renderFleetContent = () => (
        <>
            <div className="td-stats-ribbon">
                <motion.div className="td-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="stat-icon primary"><FaBus /></div>
                    <div className="stat-info">
                        <h3>{totalBuses}</h3>
                        <p>Total Fleet</p>
                        <div style={{ height: '4px', width: '40px', background: 'var(--tm-primary)', borderRadius: '2px', marginTop: '4px', opacity: 0.3 }}></div>
                    </div>
                </motion.div>
                <motion.div className="td-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="stat-icon success"><FaCheck /></div>
                    <div className="stat-info">
                        <h3>{activeBuses}</h3>
                        <p>Active Routes</p>
                        <div style={{ height: '4px', width: '40px', background: 'var(--tm-accent)', borderRadius: '2px', marginTop: '4px', opacity: 0.3 }}></div>
                    </div>
                </motion.div>
                <motion.div className="td-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div className="stat-icon warning"><FaTools /></div>
                    <div className="stat-info">
                        <h3>{maintenanceBuses}</h3>
                        <p>In Service</p>
                        <div style={{ height: '4px', width: '40px', background: 'var(--tm-secondary)', borderRadius: '2px', marginTop: '4px', opacity: 0.3 }}></div>
                    </div>
                </motion.div>
            </div>

            <div className="td-controls">
                <div className="td-search">
                    <FaSearch style={{ color: '#6366f1' }} />
                    <input
                        type="text"
                        placeholder="Search IDs, routes, or assigned drivers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="td-filter">
                    <FaFilter style={{ color: '#6366f1' }} />
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="All">All Operations</option>
                        <option value="Active">Active Duty</option>
                        <option value="Maintenance">Under Service</option>
                        <option value="Inactive">Decommissioned</option>
                    </select>
                </div>
                <div className="td-view-toggle">
                    <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')} title="Grid View"><FaList /></button>
                    <button className={viewMode === 'map' ? 'active' : ''} onClick={() => setViewMode('map')} title="Tactical Map"><FaMapMarkedAlt /></button>
                    <button className={viewMode === 'maintenance' ? 'active' : ''} onClick={() => setViewMode('maintenance')} title="Maintenance Logs"><FaHammer /></button>
                </div>
            </div>

            {viewMode === 'list' && (
                <div className="td-grid">
                    {loading ? (
                        <div className="loading-shimmer">
                            <p>Establishing secure link to fleet database...</p>
                        </div>
                    ) : filteredList.length > 0 ? (
                        filteredList.map((item, idx) => (
                            <motion.div
                                key={item._id || item.id}
                                className="td-card"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <div className={`td-card-status ${item.availabilityStatus?.toLowerCase()}`}>
                                    <div className="status-dot"></div>
                                    {item.availabilityStatus}
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>{item.routeNumber || 'N/A'}</h3>
                                <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1.5rem' }}>{item.routeName}</p>

                                <div className="td-card-meta">
                                    <span><FaUsers style={{ color: 'var(--tm-primary)' }} /> <strong>{item.capacity}</strong> Seats</span>
                                    <span><FaGasPump style={{ color: 'var(--tm-primary)' }} /> {item.busModel || 'Transit'}</span>
                                </div>
                                {item.driverName && (
                                    <div className="td-driver">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>OP</div>
                                            <span><strong>{item.driverName}</strong></span>
                                        </div>
                                    </div>
                                )}
                                {item.timing && <div className="td-timing"><FaClock /> {item.timing}</div>}

                                <div className="td-card-actions">
                                    <button onClick={() => openModal('transport', item)} title="Edit Specifications"><FaEdit /></button>
                                    <button onClick={() => handleDelete(item._id || item.id, 'transport')} className="delete" title="Decommission Vehicle"><FaTrash /></button>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="td-empty" style={{
                            gridColumn: '1/-1',
                            textAlign: 'center',
                            padding: '8rem 2rem',
                            background: '#ffffff',
                            borderRadius: '32px',
                            border: '1px solid var(--tm-border)',
                            boxShadow: 'inset 0 0 40px rgba(0,0,0,0.02)'
                        }}>
                            <div style={{
                                width: '100px',
                                height: '100px',
                                background: 'var(--tm-bg)',
                                borderRadius: '30px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 2rem auto',
                                color: '#e2e8f0',
                                fontSize: '3rem'
                            }}>
                                <FaBus />
                            </div>
                            <h2 style={{ color: '#0f172a', fontWeight: 800, fontFamily: 'Outfit', fontSize: '1.75rem', marginBottom: '0.5rem' }}>No Fleet Data Detected</h2>
                            <p style={{ color: '#64748b', fontWeight: 500, maxWidth: '400px', margin: '0 auto' }}>Establishing connection to GPS nodes... If this persists, please manually register your first vehicle unit.</p>
                        </div>
                    )}
                </div>
            )}
            {viewMode === 'map' && renderMap()}
            {viewMode === 'maintenance' && renderMaintenance()}
        </>
    );

    const renderContent = () => {
        switch (activeSection) {
            case 'fleet':
                return renderFleetContent();
            case 'students':
                return (
                    <div className="manager-section" style={{ padding: '0 2rem' }}>
                        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', background: 'white', padding: '1.5rem 2rem', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <h2 style={{ margin: 0, fontWeight: 800, color: '#0f172a', fontFamily: 'Outfit', fontSize: '1.75rem' }}>Student Transit Ledger</h2>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Managing all registered student commuters</p>
                            </div>
                            <button className="td-add-btn" onClick={() => openModal('student')}>
                                <FaPlus /> Enrollment Profile
                            </button>
                        </div>
                        <StudentSection
                            students={students}
                            openModal={(type, item) => openModal('student', item)}
                            handleDeleteStudent={(sid) => handleDelete(sid, 'student')}
                            onRefresh={loadAllData}
                        />
                    </div>
                );
            case 'faculty':
                return (
                    <div className="manager-section" style={{ padding: '0 2rem' }}>
                        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', background: 'white', padding: '1.5rem 2rem', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <h2 style={{ margin: 0, fontWeight: 800, color: '#0f172a', fontFamily: 'Outfit', fontSize: '1.75rem' }}>Faculty Transit Access</h2>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Logistics management for teaching personnel</p>
                            </div>
                            <button className="td-add-btn" onClick={() => openModal('faculty')}>
                                <FaPlus /> Grant Access
                            </button>
                        </div>
                        <FacultySection
                            faculty={faculty}
                            students={students}
                            openModal={(type, item) => openModal('faculty', item)}
                            handleDeleteFaculty={(fid) => handleDelete(fid, 'faculty')}
                            allSubjects={[]}
                        />
                    </div>
                );
            case 'ai-agent':
                return (
                    <div className="manager-section" style={{ padding: 0, height: 'calc(100vh - 120px)' }}>
                        <VuAiAgent onNavigate={setActiveSection} documentContext={{ title: "Logistics Intelligence Platform", content: "AI Agent specializing in fleet optimization, route efficiency, predictive maintenance, and real-time transit telemetry for the Sentin-Transport system.", data: { transportList } }} />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={`transport-dashboard-layout ${sidebarCollapsed ? 'collapsed' : ''} ${isEmbedded ? 'embedded' : ''}`}>
            {!isEmbedded && (
                <aside className="transport-sidebar">
                    <div className="sidebar-header" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                        <FaBus className="brand-icon" />
                        {!sidebarCollapsed && <span>Sentin-Transport</span>}
                    </div>

                    <nav className="sidebar-nav">
                        <button
                            className={`nav-item ${activeSection === 'fleet' ? 'active' : ''}`}
                            onClick={() => setActiveSection('fleet')}
                            title="Fleet/Vehicle Management"
                        >
                            <FaBus /> {!sidebarCollapsed && <span>Fleet / Routes</span>}
                        </button>
                        <button
                            className={`nav-item ${activeSection === 'students' ? 'active' : ''}`}
                            onClick={() => setActiveSection('students')}
                            title="Student Registry"
                        >
                            <FaUserGraduate /> {!sidebarCollapsed && <span>Students</span>}
                        </button>
                        <button
                            className={`nav-item ${activeSection === 'faculty' ? 'active' : ''}`}
                            onClick={() => setActiveSection('faculty')}
                            title="Faculty Registry"
                        >
                            <FaChalkboardTeacher /> {!sidebarCollapsed && <span>Faculty Members</span>}
                        </button>
                        <button
                            className={`nav-item ${activeSection === 'ai-agent' ? 'active' : ''}`}
                            onClick={() => setActiveSection('ai-agent')}
                            title="Transport AI Agent"
                        >
                            <FaRobot /> {!sidebarCollapsed && <span>AI Logistics Agent</span>}
                        </button>
                    </nav>

                    <div className="sidebar-footer">
                        {!sidebarCollapsed && (
                            <div className="manager-info" style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                padding: '1rem',
                                borderRadius: '16px',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                marginBottom: '0.75rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '10px',
                                        background: 'var(--tm-primary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                        color: 'white'
                                    }}>
                                        {managerInitial}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                        <div className="m-name" style={{ color: 'white' }}>{managerName}</div>
                                        <div className="m-role" style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 600 }}>{managerData?.role || 'Fleet Operations'}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <button className="logout-button" onClick={onLogout} style={{ height: '48px' }}>
                            <FaSignOutAlt /> {!sidebarCollapsed && <span>Secure Termination</span>}
                        </button>
                    </div>
                </aside>
            )}

            <main className="transport-main-content">
                <div className="decorative-glow"></div>

                <header className="transport-header">
                    <div className="header-left">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.5rem' }}>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: '#10b981',
                                boxShadow: '0 0 12px #10b981',
                                position: 'relative'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    inset: '-4px',
                                    borderRadius: '50%',
                                    border: '2px solid #10b981',
                                    animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
                                }}></div>
                            </div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#059669', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Operational Frequency: 18ms</span>
                        </div>
                        {isEmbedded ? (
                            <div className="embedded-nav" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <button className={`tab-btn ${activeSection === 'fleet' ? 'active' : ''}`} onClick={() => setActiveSection('fleet')}>Fleet Hub</button>
                                <button className={`tab-btn ${activeSection === 'students' ? 'active' : ''}`} onClick={() => setActiveSection('students')}>Students</button>
                                <button className={`tab-btn ${activeSection === 'faculty' ? 'active' : ''}`} onClick={() => setActiveSection('faculty')}>Faculty</button>
                                <button className={`tab-btn ${activeSection === 'ai-agent' ? 'active' : ''}`} onClick={() => setActiveSection('ai-agent')}>Logistics AI</button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                <button className="td-menu-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                                    <FaBars />
                                </button>
                                <h1 style={{ marginBottom: 0 }}>
                                    {activeSection === 'fleet' ? 'Logistics Fleet Control' :
                                        activeSection === 'students' ? 'Student Transit Hub' :
                                            activeSection === 'faculty' ? 'Faculty Transit Hub' : 'Logistics Intelligence'}
                                </h1>
                            </div>
                        )}
                    </div>

                    <div className="td-header-actions">
                        <div className="td-notification-wrapper">
                            <button className="td-icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
                                <FaBell />
                                {notifications.length > 0 && <span className="td-badge">{notifications.length}</span>}
                            </button>
                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div
                                        className="td-notifications-dropdown"
                                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                                    >
                                        <h3>Fleet Maintenance Alerts</h3>
                                        {notifications.length > 0 ? (
                                            <ul>
                                                {notifications.map((notif, idx) => (
                                                    <li key={idx} className={`notif-item ${notif.type}`} onClick={() => {
                                                        const item = transportList.find(t => (t._id || t.id) === notif.id);
                                                        if (item) openModal('transport', item);
                                                        setShowNotifications(false);
                                                    }}>
                                                        <div className="notif-header">
                                                            <FaExclamationTriangle />
                                                            <strong>{notif.title}</strong>
                                                        </div>
                                                        <span className="notif-msg">{notif.message}</span>
                                                        <span className="notif-date">{new Date(notif.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="no-notifs">
                                                <FaCheck style={{ color: '#10b981', fontSize: '2rem', marginBottom: '1rem' }} />
                                                <p>All vehicles are currently healthy</p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        {activeSection === 'fleet' && (
                            <button className="td-add-btn" onClick={() => openModal('transport')} style={{
                                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                                padding: '0.75rem 1.75rem',
                                border: 'none',
                                borderRadius: '14px',
                                color: 'white',
                                fontWeight: 800,
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                boxShadow: '0 8px 20px -5px rgba(79, 70, 229, 0.4)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}>
                                <FaPlus style={{ fontSize: '1rem' }} /> REGISTER UNIT
                            </button>
                        )}
                        {!isEmbedded && managerInitial && (
                            <div className="td-avatar" style={{
                                width: '44px', height: '44px', borderRadius: '12px',
                                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                                color: 'white', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem',
                                boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)'
                            }}>
                                {managerInitial}
                            </div>
                        )}
                    </div>
                </header>

                <div className="td-content">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            <AnimatePresence>
                {showModal && (
                    <div className="td-modal-overlay">
                        <motion.div
                            className="td-modal"
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                            style={{ maxHeight: '92vh', overflowY: 'auto' }}
                        >
                            <div className="td-modal-header" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                                        {modalType === 'transport' ? <FaBus /> : modalType === 'student' ? <FaUserGraduate /> : <FaChalkboardTeacher />}
                                    </div>
                                    <h2 style={{ margin: 0, letterSpacing: '-0.5px' }}>
                                        {modalType === 'transport' ? (formData.id ? 'Modify Route' : 'Register New Vehicle') :
                                            modalType === 'student' ? (personFormData._id ? 'Update Student Profile' : 'Enroll New Student') :
                                                (personFormData._id ? 'Update Faculty Access' : 'Add Faculty Member')}
                                    </h2>
                                </div>
                                <button className="td-icon-btn" style={{ border: 'none', background: '#f8fafc' }} onClick={() => setShowModal(false)}><FaTimes /></button>
                            </div>

                            <form onSubmit={handleSave} className="premium-form">
                                {modalType === 'transport' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        <div className="td-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                            <div className="td-form-group">
                                                <label>Route / Bus ID</label>
                                                <input value={formData.routeNumber} onChange={e => setFormData({ ...formData, routeNumber: e.target.value })} required placeholder="e.g. B-104" />
                                            </div>
                                            <div className="td-form-group">
                                                <label>Max Seating Capacity</label>
                                                <input type="number" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="td-form-group">
                                            <label>Destination / Primary Route Path</label>
                                            <input value={formData.routeName} onChange={e => setFormData({ ...formData, routeName: e.target.value })} required placeholder="Main Campus to Tech Park" />
                                        </div>
                                        <div className="td-form-group">
                                            <label>Assigned Operator / Driver</label>
                                            <input value={formData.driverName} onChange={e => setFormData({ ...formData, driverName: e.target.value })} placeholder="Enter driver full name" />
                                        </div>
                                        <div className="td-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                            <div className="td-form-group">
                                                <label>Vehicle Model / Spec</label>
                                                <input value={formData.busModel} onChange={e => setFormData({ ...formData, busModel: e.target.value })} placeholder="e.g. Volvo Intercity" />
                                            </div>
                                            <div className="td-form-group">
                                                <label>Deployment Status</label>
                                                <select value={formData.availabilityStatus} onChange={e => setFormData({ ...formData, availabilityStatus: e.target.value })}>
                                                    <option>Active</option><option>Maintenance</option><option>Inactive</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="td-form-group">
                                            <label>Operating Schedule (Timing)</label>
                                            <input value={formData.timing} onChange={e => setFormData({ ...formData, timing: e.target.value })} placeholder="08:00 AM - 05:30 PM" />
                                        </div>
                                        <div className="td-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                            <div className="td-form-group">
                                                <label>Last Technical Inspection</label>
                                                <input type="date" value={formData.lastMaintenance} onChange={e => setFormData({ ...formData, lastMaintenance: e.target.value })} />
                                            </div>
                                            <div className="td-form-group">
                                                <label>Next Service Date</label>
                                                <input type="date" value={formData.nextMaintenance} onChange={e => setFormData({ ...formData, nextMaintenance: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="td-form-group">
                                            <label>Internal Technical Log / Notes</label>
                                            <textarea value={formData.maintenanceNotes} onChange={e => setFormData({ ...formData, maintenanceNotes: e.target.value })} placeholder="Log any technical issues or service history..." rows="4" style={{ resize: 'none' }} />
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        <div style={{ gridColumn: 'span 2' }} className="td-form-group">
                                            <label>Full Name</label>
                                            <input value={modalType === 'student' ? personFormData.studentName : personFormData.name} onChange={e => setPersonFormData(modalType === 'student' ? { ...personFormData, studentName: e.target.value } : { ...personFormData, name: e.target.value })} required placeholder="Enter full legal name" />
                                        </div>
                                        <div className="td-form-group">
                                            <label>{modalType === 'student' ? 'Access ID (SID)' : 'Employee Code (FID)'}</label>
                                            <input value={modalType === 'student' ? personFormData.sid : personFormData.facultyId} onChange={e => setPersonFormData(modalType === 'student' ? { ...personFormData, sid: e.target.value } : { ...personFormData, facultyId: e.target.value })} required readOnly={!!(modalType === 'student' ? personFormData.sid : personFormData.facultyId) && !!personFormData._id} placeholder={modalType === 'student' ? "e.g. S1001" : "e.g. F201"} />
                                        </div>
                                        <div className="td-form-group">
                                            <label>Gender</label>
                                            <select value={personFormData.gender} onChange={e => setPersonFormData({ ...personFormData, gender: e.target.value })}>
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="td-form-group">
                                            <label>Official Email</label>
                                            <input type="email" value={personFormData.email} onChange={e => setPersonFormData({ ...personFormData, email: e.target.value })} required placeholder="email@college.edu" />
                                        </div>
                                        <div className="td-form-group">
                                            <label>Mobile Number</label>
                                            <input value={personFormData.phone} onChange={e => setPersonFormData({ ...personFormData, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
                                        </div>
                                        <div className="td-form-group">
                                            <label>{modalType === 'student' ? 'Registration Year' : 'Primary Dept'}</label>
                                            <input value={modalType === 'student' ? personFormData.year : personFormData.department} onChange={e => setPersonFormData(modalType === 'student' ? { ...personFormData, year: e.target.value } : { ...personFormData, department: e.target.value })} placeholder={modalType === 'student' ? "1, 2, 3..." : "e.g. CSE"} />
                                        </div>
                                        <div className="td-form-group">
                                            <label>{modalType === 'student' ? 'Academic Branch' : 'Professional Designation'}</label>
                                            <input value={modalType === 'student' ? personFormData.branch : personFormData.designation} onChange={e => setPersonFormData(modalType === 'student' ? { ...personFormData, branch: e.target.value } : { ...personFormData, designation: e.target.value })} placeholder={modalType === 'student' ? "e.g. B.Tech CSE" : "e.g. Professor"} />
                                        </div>
                                        {modalType === 'student' && (
                                            <div className="td-form-group">
                                                <label>Class Section</label>
                                                <input value={personFormData.section} onChange={e => setPersonFormData({ ...personFormData, section: e.target.value })} placeholder="e.g. A" />
                                            </div>
                                        )}
                                        <div style={{ gridColumn: 'span 2' }} className="td-form-group">
                                            <label>Permanent Residential Address</label>
                                            <textarea value={personFormData.address} onChange={e => setPersonFormData({ ...personFormData, address: e.target.value })} placeholder="Enter complete address..." rows="3" style={{ resize: 'none' }} />
                                        </div>
                                        <div style={{ display: 'flex', gap: '2rem', gridColumn: 'span 2', padding: '0.5rem 0' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700, color: '#475569', fontSize: '0.85rem' }}>
                                                <input type="checkbox" checked={!!personFormData.isTransportUser} onChange={e => setPersonFormData({ ...personFormData, isTransportUser: e.target.checked })} /> Transport User
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700, color: '#475569', fontSize: '0.85rem' }}>
                                                <input type="checkbox" checked={!!personFormData.isHosteller} onChange={e => setPersonFormData({ ...personFormData, isHosteller: e.target.checked })} /> Hosteller
                                            </label>
                                        </div>
                                        {!personFormData._id && (
                                            <div style={{ gridColumn: 'span 2' }} className="td-form-group">
                                                <label>Secure Access Password</label>
                                                <input type="password" value={personFormData.password} onChange={e => setPersonFormData({ ...personFormData, password: e.target.value })} required placeholder="••••••••" />
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="td-modal-footer" style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                                    <button type="button" className="td-cancel-btn" style={{ background: 'transparent', border: '1px solid #e2e8f0', color: '#64748b' }} onClick={() => setShowModal(false)}>Cancel Action</button>
                                    <button type="submit" className="td-save-btn save-btn" disabled={saving}>{saving ? 'Syncing...' : 'Confirm & Save'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TransportManagerDashboard;
