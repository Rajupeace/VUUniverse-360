import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaUserGraduate, FaChalkboardTeacher, FaFlask, FaPlus, FaSearch, FaEye, FaEdit, FaTrash,
    FaFilter, FaSignOutAlt, FaBars, FaRobot
} from 'react-icons/fa';
import VuAiAgent from '../VuAiAgent/VuAiAgent';
import { apiGet, apiPost, apiPut, apiDelete } from '../../utils/apiClient';
import StudentSection from '../AdminDashboard/Sections/StudentSection';
import FacultySection from '../AdminDashboard/Sections/FacultySection';
import ResearchPlacementSection from '../AdminDashboard/Sections/ResearchPlacementSection';

const ResearchManagerDashboard = ({ managerData, onLogout, isEmbedded }) => {
    const [activeSection, setActiveSection] = useState('research');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [students, setStudents] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('student');
    const [editItem, setEditItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [studentsRes, facultyRes] = await Promise.all([
                apiGet('/api/students'),
                apiGet('/api/faculty')
            ]);
            setStudents(Array.isArray(studentsRes) ? studentsRes : []);
            setFaculty(Array.isArray(facultyRes) ? facultyRes : []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (type, item = null) => {
        setModalType(type);
        setEditItem(item);
        if (type === 'student') {
            setFormData(item || {
                studentName: '',
                sid: '',
                email: '',
                phone: '',
                year: '1',
                branch: 'CSE',
                section: 'A',
                password: ''
            });
        } else {
            setFormData(item || {
                name: '',
                facultyId: '',
                email: '',
                phone: '',
                department: 'CSE',
                designation: 'Assistant Professor',
                password: '',
                assignments: []
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditItem(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const endpoint = modalType === 'student' ? '/api/students' : '/api/faculty';
            const id = modalType === 'student' ? (editItem?.sid || editItem?._id) : (editItem?.facultyId || editItem?._id);

            if (editItem) {
                await apiPut(`${endpoint}/${id}`, formData);
            } else {
                await apiPost(endpoint, formData);
            }

            closeModal();
            loadData();
            alert('Record saved successfully');
        } catch (err) {
            alert('Save failed: ' + (err.message || 'Transmission error'));
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteStudent = async (sid) => {
        if (!window.confirm(`Are you sure you want to remove student ${sid}?`)) return;
        try {
            await apiDelete(`/api/students/${sid}`);
            loadData();
        } catch (err) {
            alert('Failed to delete student: ' + err.message);
        }
    };

    const handleDeleteFaculty = async (fid) => {
        if (!window.confirm(`Are you sure you want to remove faculty member ${fid}?`)) return;
        try {
            await apiDelete(`/api/faculty/${fid}`);
            loadData();
        } catch (err) {
            alert('Failed to delete faculty: ' + err.message);
        }
    };

    const navigationItems = [
        { id: 'research', label: 'Research & Placements', icon: FaFlask },
        { id: 'students', label: 'Students', icon: FaUserGraduate },
        { id: 'faculty', label: 'Faculty', icon: FaChalkboardTeacher },
        { id: 'ai-agent', label: 'Research Agent', icon: FaRobot }
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'students':
                return (
                    <div className="manager-section">
                        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>Student Research Registry</h2>
                            <button className="add-btn" onClick={() => openModal('student')} style={{
                                background: '#4f46e5', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600
                            }}>
                                <FaPlus /> Register Student
                            </button>
                        </div>
                        <StudentSection
                            students={students}
                            openModal={(type, item) => openModal('student', item)}
                            handleDeleteStudent={handleDeleteStudent}
                            onRefresh={loadData}
                        />
                    </div>
                );
            case 'faculty':
                return (
                    <div className="manager-section">
                        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>Faculty Research Registry</h2>
                            <button className="add-btn" onClick={() => openModal('faculty')} style={{
                                background: '#4f46e5', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600
                            }}>
                                <FaPlus /> Add Faculty
                            </button>
                        </div>
                        <FacultySection
                            faculty={faculty}
                            students={students}
                            openModal={(type, item) => openModal('faculty', item)}
                            handleDeleteFaculty={handleDeleteFaculty}
                            allSubjects={[]}
                        />
                    </div>
                );
            case 'research':
                return (
                    <div className="manager-section">
                        <ResearchPlacementSection />
                    </div>
                );
            case 'ai-agent':
                return (
                    <div className="manager-section" style={{ padding: 0, height: 'calc(100vh - 100px)' }}>
                        <VuAiAgent onNavigate={setActiveSection} documentContext={{ title: "Research & Placements", content: "Agent is assisting the research manager with research placements and registry.", data: { students } }} />
                    </div>
                );
            default:
                return null;
        }
    };

    if (loading && students.length === 0) {
        return <div className="loading" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
            <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            <span>Synchronizing Research Node...</span>
        </div>;
    }

    return (
        <div className={`research-manager-dashboard ${isEmbedded ? 'embedded' : ''}`} style={{ display: 'flex', flexDirection: 'column', height: isEmbedded ? 'auto' : '100vh', background: isEmbedded ? 'transparent' : '#f8fafc' }}>
            <header className="manager-header" style={{ background: isEmbedded ? 'transparent' : 'white', borderBottom: '1px solid #e2e8f0', padding: isEmbedded ? '0.5rem 0' : '0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: isEmbedded ? 'relative' : 'sticky', top: 0, zIndex: 10 }}>
                <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.5rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></div>
                        <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#10b981', letterSpacing: '1px' }}>CLOUD SYNC LIVE</span>
                    </div>
                    {isEmbedded ? (
                        <div className="embedded-tabs" style={{ display: 'flex', gap: '0.75rem' }}>
                            {navigationItems.map(item => (
                                <button
                                    key={item.id}
                                    className={`tab-btn ${activeSection === item.id ? 'active' : ''}`}
                                    onClick={() => setActiveSection(item.id)}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <>
                            <button
                                className="sidebar-toggle"
                                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
                            >
                                <FaBars />
                            </button>
                            <div className="header-title-group">
                                <h1 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b', fontWeight: 800 }}>Vu UniVerse360 Research</h1>
                                <div className="manager-info-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px' }}>
                                    <span className="manager-name-badge" style={{ fontSize: '0.7rem', color: '#4f46e5', fontWeight: 850, background: '#eef2ff', padding: '1px 10px', borderRadius: '10px', textTransform: 'uppercase' }}>
                                        Manager: {managerData?.name || 'Assigned Staff'}
                                    </span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                {!isEmbedded && (
                    <div className="header-right">
                        <button onClick={onLogout} className="logout-btn" style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.85rem' }}>
                            <FaSignOutAlt /> Logout
                        </button>
                    </div>
                )}
            </header>

            <div className="manager-layout" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {!isEmbedded && (
                    <nav className={`manager-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} style={{
                        width: sidebarCollapsed ? '70px' : '260px', background: 'white', borderRight: '1px solid #e2e8f0', transition: 'width 0.3s ease', overflowY: 'auto', display: 'flex', flexDirection: 'column'
                    }}>
                        <div className="sidebar-content" style={{ padding: '1rem', flex: 1 }}>
                            {navigationItems.map(item => (
                                <button
                                    key={item.id}
                                    className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                                    onClick={() => setActiveSection(item.id)}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: 'none', background: activeSection === item.id ? '#eef2ff' : 'transparent', color: activeSection === item.id ? '#4f46e5' : '#64748b', borderRadius: '12px', cursor: 'pointer', marginBottom: '4px', transition: 'all 0.2s', fontWeight: activeSection === item.id ? 700 : 600
                                    }}
                                >
                                    <item.icon style={{ fontSize: '1.1rem' }} />
                                    {!sidebarCollapsed && <span>{item.label}</span>}
                                </button>
                            ))}
                        </div>
                    </nav>
                )}

                <main className="manager-main" style={{ flex: 1, overflowY: isEmbedded ? 'visible' : 'auto', padding: isEmbedded ? '1.5rem 0' : '2rem' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* Reuse Admission-style Modal for simplicity */}
            <AnimatePresence>
                {showModal && (
                    <div className="modal-overlay" style={{
                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
                    }} onClick={closeModal}>
                        <motion.div
                            className="modal-card"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{ background: 'white', borderRadius: '20px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{editItem ? 'Edit Record' : 'Register New'}</h2>
                                <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
                            </div>

                            <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                {modalType === 'student' ? (
                                    <>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>Student Name</label>
                                            <input style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }} required value={formData.studentName || ''} onChange={e => setFormData({ ...formData, studentName: e.target.value })} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>SID</label>
                                            <input style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }} required value={formData.sid || ''} onChange={e => setFormData({ ...formData, sid: e.target.value })} disabled={!!editItem} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>Email</label>
                                            <input style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }} type="email" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>Branch</label>
                                            <select style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }} value={formData.branch || 'CSE'} onChange={e => setFormData({ ...formData, branch: e.target.value })}>
                                                <option>CSE</option><option>ECE</option><option>IT</option><option>ME</option><option>CIVIL</option>
                                            </select>
                                        </div>
                                        {!editItem && (
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>Password</label>
                                                <input style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }} type="password" required onChange={e => setFormData({ ...formData, password: e.target.value })} />
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>Faculty Name</label>
                                            <input style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }} required value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>Faculty ID</label>
                                            <input style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }} required value={formData.facultyId || ''} onChange={e => setFormData({ ...formData, facultyId: e.target.value })} disabled={!!editItem} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>Department</label>
                                            <select style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }} value={formData.department || 'CSE'} onChange={e => setFormData({ ...formData, department: e.target.value })}>
                                                <option>CSE</option><option>ECE</option><option>Basic Sciences</option>
                                            </select>
                                        </div>
                                        {!editItem && (
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>Password</label>
                                                <input style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }} type="password" required onChange={e => setFormData({ ...formData, password: e.target.value })} />
                                            </div>
                                        )}
                                    </>
                                )}
                                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="button" onClick={closeModal} style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                                    <button type="submit" disabled={saving} style={{ flex: 2, padding: '0.75rem', borderRadius: '12px', border: 'none', background: '#4f46e5', color: 'white', fontWeight: 700, cursor: 'pointer' }}>{saving ? 'Saving...' : 'Confirm Details'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ResearchManagerDashboard;
