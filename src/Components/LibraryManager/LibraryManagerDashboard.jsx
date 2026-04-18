import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaUserGraduate, FaChalkboardTeacher, FaBook, FaPlus, FaSearch, FaEye, FaEdit, FaTrash,
    FaFilter, FaSignOutAlt, FaBars, FaNetworkWired, FaRobot
} from 'react-icons/fa';
import VuAiAgent from '../VuAiAgent/VuAiAgent';
import { apiGet, apiPost, apiPut, apiDelete } from '../../utils/apiClient';
import StudentSection from '../AdminDashboard/Sections/StudentSection';
import FacultySection from '../AdminDashboard/Sections/FacultySection';
import LibrarySection from '../AdminDashboard/Sections/LibrarySection';
import './LibraryManagerDashboard.css';

const LibraryManagerDashboard = ({ managerData, onLogout, isEmbedded }) => {
    const [activeSection, setActiveSection] = useState('library');
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
        { id: 'library', label: 'Library Catalog', icon: FaBook },
        { id: 'students', label: 'Student Access', icon: FaUserGraduate },
        { id: 'faculty', label: 'Faculty Access', icon: FaChalkboardTeacher },
        { id: 'ai-agent', label: 'Library Agent', icon: FaRobot }
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'library':
                return (
                    <div className="lmd-section-container">
                        <div className="lmd-section-header">
                            <h2 className="lmd-section-title">Library Master Catalog</h2>
                        </div>
                        <LibrarySection />
                    </div>
                );
            case 'students':
                return (
                    <div className="lmd-section-container">
                        <div className="lmd-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 className="lmd-section-title">Student Borrowers & Registry</h2>
                            <button className="lmd-btn-pri" onClick={() => openModal('student')} style={{ background: '#475569', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
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
                    <div className="lmd-section-container">
                        <div className="lmd-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 className="lmd-section-title">Faculty Borrowers & Registry</h2>
                            <button className="lmd-btn-pri" onClick={() => openModal('faculty')} style={{ background: '#475569', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
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
            case 'ai-agent':
                return (
                    <div className="lmd-section-container" style={{ padding: 0, height: 'calc(100vh - 100px)' }}>
                        <VuAiAgent onNavigate={setActiveSection} documentContext={{ title: "Library Master Catalog", content: "Agent is assisting the library manager with book registry, borrowers, and overdue fines.", data: { students } }} />
                    </div>
                );
            default:
                return null;
        }
    };

    if (loading && students.length === 0) {
        return (
            <div className="lmd-loading" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                <div className="lmd-spinner" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #475569', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                <div>Initializing Library Systems...</div>
            </div>
        );
    }

    return (
        <div className={`lmd-shell ${isEmbedded ? 'embedded' : ''}`} style={{ display: 'flex', height: isEmbedded ? 'auto' : '100vh', background: isEmbedded ? 'transparent' : '#f8fafc' }}>
            {/* Sidebar */}
            {!isEmbedded && (
                <aside className={`lmd-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} style={{
                    width: sidebarCollapsed ? '70px' : '260px', background: 'white', borderRight: '1px solid #e2e8f0', transition: 'width 0.3s ease', display: 'flex', flexDirection: 'column'
                }}>
                    <div className="lmd-logo" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                        <div className="lmd-logo-icon" style={{ background: '#475569', color: 'white', padding: '8px', borderRadius: '10px' }}><FaBook /></div>
                        {!sidebarCollapsed && (
                            <div>
                                <div className="lmd-logo-title" style={{ fontWeight: 800, color: '#1e293b' }}>Vu UniVerse360 Library</div>
                                <div className="lmd-logo-sub" style={{ fontSize: '0.7rem', color: '#64748b' }}>Operations Hub</div>
                            </div>
                        )}
                    </div>

                    <nav className="lmd-nav" style={{ flex: 1, padding: '1rem' }}>
                        {navigationItems.map(item => (
                            <button
                                key={item.id}
                                className={`lmd-nav-item ${activeSection === item.id ? 'active' : ''}`}
                                onClick={() => setActiveSection(item.id)}
                                title={sidebarCollapsed ? item.label : ''}
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: 'none', background: activeSection === item.id ? '#f1f5f9' : 'transparent', color: activeSection === item.id ? '#475569' : '#64748b', borderRadius: '12px', cursor: 'pointer', marginBottom: '4px', textAlign: 'left', fontWeight: activeSection === item.id ? 700 : 600
                                }}
                            >
                                <div className="lmd-nav-icon"><item.icon /></div>
                                {!sidebarCollapsed && <span>{item.label}</span>}
                            </button>
                        ))}
                    </nav>

                    <div className="lmd-sidebar-footer" style={{ padding: '1rem', borderTop: '1px solid #f1f5f9' }}>
                        <div className="lmd-user-card" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                            <div className="lmd-user-avatar" style={{ width: '35px', height: '35px', background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                {managerData?.name ? managerData.name.charAt(0).toUpperCase() : 'M'}
                            </div>
                            {!sidebarCollapsed && (
                                <div style={{ overflow: 'hidden' }}>
                                    <div className="lmd-user-name" style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{managerData?.name || 'Library Manager'}</div>
                                    <div className="lmd-user-role" style={{ fontSize: '0.7rem', color: '#64748b' }}>SYSTEM ADMIN</div>
                                </div>
                            )}
                        </div>
                        <button onClick={onLogout} className="lmd-logout-btn" title="Logout" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', border: 'none', background: '#fee2e2', color: '#ef4444', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 }}>
                            <FaSignOutAlt />
                            {!sidebarCollapsed && <span>Logout</span>}
                        </button>
                    </div>
                </aside>
            )}

            {/* Main Content Area */}
            <div className="lmd-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <header className="lmd-header" style={{ background: isEmbedded ? 'transparent' : 'white', borderBottom: '1px solid #e2e8f0', padding: isEmbedded ? '0.5rem 0' : '0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div className="lmd-header-left" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></div>
                            <span style={{ fontSize: '0.6rem', fontWeight: 900, color: '#10b981', letterSpacing: '1px' }}>CLOUD SYNC LIVE</span>
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
                                    className="lmd-sidebar-toggle"
                                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.2rem' }}
                                >
                                    <FaBars />
                                </button>
                                <div>
                                    <h1 className="lmd-header-title" style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Library Dashboard</h1>
                                </div>
                            </>
                        )}
                    </div>
                </header>

                <div className="lmd-content" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

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
                                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{editItem ? 'Edit Profile' : 'New Registration'}</h2>
                                <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
                            </div>

                            <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                {modalType === 'student' ? (
                                    <>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>Full Name</label>
                                            <input style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }} required value={formData.studentName || ''} onChange={e => setFormData({ ...formData, studentName: e.target.value })} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>USN/SID</label>
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
                                                <option>CSE</option><option>ECE</option><option>Library Sciences</option>
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
                                    <button type="submit" disabled={saving} style={{ flex: 2, padding: '0.75rem', borderRadius: '12px', border: 'none', background: '#475569', color: 'white', fontWeight: 700, cursor: 'pointer' }}>{saving ? 'Saving...' : 'Confirm Registration'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LibraryManagerDashboard;
