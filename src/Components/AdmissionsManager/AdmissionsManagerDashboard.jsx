import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaUserGraduate, FaChalkboardTeacher, FaUserCheck, FaSignOutAlt, FaBars, FaNetworkWired,
    FaTimes, FaSave, FaPlus, FaSearch, FaFilter, FaSyncAlt, FaRobot
} from 'react-icons/fa';
import { apiGet, apiPost, apiPut, apiDelete } from '../../utils/apiClient';
import sseClient from '../../utils/sseClient';
import StudentSection from '../AdminDashboard/Sections/StudentSection';
import FacultySection from '../AdminDashboard/Sections/FacultySection';
import AdmissionSection from '../AdminDashboard/Sections/AdmissionSection';
import VuAiAgent from '../VuAiAgent/VuAiAgent';
import './AdmissionsManagerDashboard.css';

const AdmissionsManagerDashboard = ({ managerData, onLogout, isEmbedded }) => {
    const [activeSection, setActiveSection] = useState('admissions');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [students, setStudents] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('student'); // 'student' | 'faculty'
    const [editItem, setEditItem] = useState(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({});

    useEffect(() => {
        loadData();
        // 0.1s hyper-sync for high-velocity data
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') loadData();
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Listen for SSE updates to keep registry updated in real-time
    useEffect(() => {
        const triggers = ['students', 'faculty', 'admissions'];
        const unsub = sseClient.onUpdate((ev) => {
            if (ev && triggers.includes(ev.resource)) {
                console.log(`🔄 Admissions SSE Sync [${ev.resource}]: Reloading data...`);
                loadData();
            }
        });
        return unsub;
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
                password: '',
                isTransportUser: false,
                isHosteller: false
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
                assignments: [],
                isTransportUser: false,
                isHosteller: false
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditItem(null);
        setFormData({});
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
        { id: 'admissions', label: 'Admissions Desk', icon: FaUserCheck },
        { id: 'students', label: 'Student Directory', icon: FaUserGraduate },
        { id: 'faculty', label: 'Faculty Directory', icon: FaChalkboardTeacher }
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'admissions':
                return (
                    <div className="admd-section-container">
                        <div className="admd-section-header">
                            <h2 className="admd-section-title">Admission Registry</h2>
                        </div>
                        <AdmissionSection />
                    </div>
                );
            case 'students':
                return (
                    <div className="admd-section-container">
                        <div className="admd-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 className="admd-section-title">Enrolled Student Registry</h2>
                            <button className="admd-btn-pri" onClick={() => openModal('student')} style={{ padding: '0.6rem 1.2rem' }}>
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
                    <div className="admd-section-container">
                        <div className="admd-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 className="admd-section-title">Active Faculty Members</h2>
                            <button className="admd-btn-pri" onClick={() => openModal('faculty')} style={{ padding: '0.6rem 1.2rem' }}>
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
                    <div className="admd-section-container" style={{ padding: 0, height: 'calc(100vh - 100px)' }}>
                        <VuAiAgent onNavigate={setActiveSection} documentContext={{ title: "Admissions Hub", content: "Agent is assisting the admissions officer with enrollment pipelines, incoming student queries, and verification.", data: { students } }} />
                    </div>
                );
            default:
                return null;
        }
    };

    if (loading && students.length === 0) {
        return (
            <div className="admd-loading">
                <div className="admd-spinner"></div>
                <div>Synchronizing Admissions Mesh...</div>
            </div>
        );
    }

    return (
        <div className={`admissions-dashboard-container ${sidebarCollapsed ? 'collapsed' : ''} ${isEmbedded ? 'embedded' : ''}`}>
            {!isEmbedded && (
                <aside className="admissions-sidebar">
                    <div className="sidebar-brand">
                        <FaNetworkWired />
                        {!sidebarCollapsed && <span>Vu UniVerse360 Admissions</span>}
                    </div>

                    <nav className="sidebar-nav">
                        <button
                            className={`nav-item ${activeSection === 'admissions' ? 'active' : ''}`}
                            onClick={() => setActiveSection('admissions')}
                        >
                            <FaUserCheck /> {!sidebarCollapsed && <span>Admissions Hub</span>}
                        </button>
                        <button
                            className={`nav-item ${activeSection === 'students' ? 'active' : ''}`}
                            onClick={() => setActiveSection('students')}
                        >
                            <FaUserGraduate /> {!sidebarCollapsed && <span>Student Registry</span>}
                        </button>
                        <button
                            className={`nav-item ${activeSection === 'faculty' ? 'active' : ''}`}
                            onClick={() => setActiveSection('faculty')}
                        >
                            <FaChalkboardTeacher /> {!sidebarCollapsed && <span>Faculty Registry</span>}
                        </button>
                        <button
                            className={`nav-item ${activeSection === 'ai-agent' ? 'active' : ''}`}
                            onClick={() => setActiveSection('ai-agent')}
                        >
                            <FaRobot /> {!sidebarCollapsed && <span>Admissions Agent</span>}
                        </button>
                    </nav>

                    <div className="sidebar-footer">
                        <div className="manager-badge">
                            <div className="m-avatar">{managerData?.name?.charAt(0)}</div>
                            {!sidebarCollapsed && (
                                <div className="m-info">
                                    <div className="m-name">{managerData?.name}</div>
                                    <div className="m-role">Enrollment Officer</div>
                                </div>
                            )}
                        </div>
                        <button className="logout-btn" onClick={onLogout}>
                            <FaSignOutAlt /> {!sidebarCollapsed && <span>Logout</span>}
                        </button>
                    </div>
                </aside>
            )}

            <main className="admissions-main-content">
                <header className="admissions-header">
                    <div className="header-left">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '1rem' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></div>
                            <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#10b981', letterSpacing: '1px' }}>CLOUD SYNC LIVE</span>
                        </div>
                        {isEmbedded ? (
                            <div className="embedded-tabs" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <button className={`tab-btn ${activeSection === 'admissions' ? 'active' : ''}`} onClick={() => setActiveSection('admissions')}>Overview</button>
                                <button className={`tab-btn ${activeSection === 'students' ? 'active' : ''}`} onClick={() => setActiveSection('students')}>Students</button>
                                <button className={`tab-btn ${activeSection === 'faculty' ? 'active' : ''}`} onClick={() => setActiveSection('faculty')}>Faculty</button>
                                <button className={`tab-btn ${activeSection === 'ai-agent' ? 'active' : ''}`} onClick={() => setActiveSection('ai-agent')}>Admissions Agent</button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <button className="menu-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                                    <FaBars />
                                </button>
                                <h1>{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Node</h1>
                            </div>
                        )}
                    </div>
                    <div className="admd-header-right">
                        <h1 className="admd-header-title">Admissions Dashboard</h1>
                        <div className="admd-header-sub">
                            <FaNetworkWired /> Live Node Connection Secured
                        </div>
                    </div>
                </header>

                <div className="admd-content">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            style={{ height: '100%' }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            <AnimatePresence>
                {showModal && (
                    <div className="admd-modal-overlay" onClick={closeModal}>
                        <motion.div
                            className="admd-modal"
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="admd-modal-header">
                                <h2 className="admd-modal-title">
                                    {editItem ? `Refine ${modalType === 'student' ? 'Student' : 'Faculty'} Record` : `Commence New ${modalType === 'student' ? 'Student Registration' : 'Faculty Onboarding'}`}
                                </h2>
                                <button className="admd-modal-close" onClick={closeModal}><FaTimes /></button>
                            </div>

                            <form className="admd-form" onSubmit={handleSave}>
                                <div className="admd-form-grid">
                                    {modalType === 'student' ? (
                                        <>
                                            <div className="admd-input full">
                                                <label>Legal Name</label>
                                                <input required value={formData.studentName || ''} onChange={e => setFormData({ ...formData, studentName: e.target.value })} placeholder="Full legal name" />
                                            </div>
                                            <div className="admd-input">
                                                <label>Identity USN</label>
                                                <input required value={formData.sid || ''} onChange={e => setFormData({ ...formData, sid: e.target.value })} placeholder="e.g. 1MS21CS001" disabled={!!editItem} />
                                            </div>
                                            <div className="admd-input">
                                                <label>Gender Orientation</label>
                                                <select value={formData.gender || ''} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                                                    <option value="">Select Gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div className="admd-input">
                                                <label>Department</label>
                                                <select value={formData.branch || 'CSE'} onChange={e => setFormData({ ...formData, branch: e.target.value })}>
                                                    <option>CSE</option><option>ISE</option><option>ECE</option><option>EEE</option><option>MECH</option><option>CIVIL</option><option>AI&ML</option>
                                                </select>
                                            </div>
                                            <div className="admd-input">
                                                <label>Academic Year</label>
                                                <select value={formData.year || '1'} onChange={e => setFormData({ ...formData, year: e.target.value })}>
                                                    <option>1</option><option>2</option><option>3</option><option>4</option>
                                                </select>
                                            </div>
                                            <div className="admd-input">
                                                <label>Section Node</label>
                                                <input value={formData.section || ''} onChange={e => setFormData({ ...formData, section: e.target.value })} placeholder="e.g. A" />
                                            </div>
                                            <div className="admd-input">
                                                <label>Contact Number</label>
                                                <input value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 XXX..." />
                                            </div>
                                            <div className="admd-input full">
                                                <label>Residential Address</label>
                                                <textarea value={formData.address || ''} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Enter permanent address..." rows="2" style={{ resize: 'none' }} />
                                            </div>
                                            <div className="admd-input full" style={{ display: 'flex', gap: '2rem', padding: '0.5rem 0' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700, color: '#475569', fontSize: '0.85rem' }}>
                                                    <input type="checkbox" checked={!!formData.isTransportUser} onChange={e => setFormData({ ...formData, isTransportUser: e.target.checked })} /> Transport User
                                                </label>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700, color: '#475569', fontSize: '0.85rem' }}>
                                                    <input type="checkbox" checked={!!formData.isHosteller} onChange={e => setFormData({ ...formData, isHosteller: e.target.checked })} /> Hosteller
                                                </label>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="admd-input full">
                                                <label>Staff Identity Profile</label>
                                                <input required value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Full staff name" />
                                            </div>
                                            <div className="admd-input">
                                                <label>Faculty Identity ID</label>
                                                <input required value={formData.facultyId || ''} onChange={e => setFormData({ ...formData, facultyId: e.target.value })} placeholder="e.g. FAC501" disabled={!!editItem} />
                                            </div>
                                            <div className="admd-input">
                                                <label>Gender</label>
                                                <select value={formData.gender || ''} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                                                    <option value="">Select Gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div className="admd-input">
                                                <label>Primary Department</label>
                                                <select value={formData.department || 'CSE'} onChange={e => setFormData({ ...formData, department: e.target.value })}>
                                                    <option>CSE</option><option>ISE</option><option>ECE</option><option>Basic Sciences</option>
                                                </select>
                                            </div>
                                            <div className="admd-input">
                                                <label>Contact Number</label>
                                                <input value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 XXX..." />
                                            </div>
                                            <div className="admd-input full">
                                                <label>Permanent Home Address</label>
                                                <textarea value={formData.address || ''} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Enter permanent residential address..." rows="2" style={{ resize: 'none' }} />
                                            </div>
                                            <div className="admd-input full" style={{ display: 'flex', gap: '2rem', padding: '0.5rem 0' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700, color: '#475569', fontSize: '0.85rem' }}>
                                                    <input type="checkbox" checked={!!formData.isTransportUser} onChange={e => setFormData({ ...formData, isTransportUser: e.target.checked })} /> Transport Authority
                                                </label>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700, color: '#475569', fontSize: '0.85rem' }}>
                                                    <input type="checkbox" checked={!!formData.isHosteller} onChange={e => setFormData({ ...formData, isHosteller: e.target.checked })} /> Campus Resident
                                                </label>
                                            </div>
                                        </>
                                    )}
                                    <div className="admd-input full">
                                        <label>Academic Communication Email</label>
                                        <input type="email" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="staff@college.edu" />
                                    </div>
                                    {!editItem && (
                                        <div className="admd-input full">
                                            <label>Access Credentials (Password)</label>
                                            <input type="password" required value={formData.password || ''} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="Initialize password" />
                                        </div>
                                    )}
                                </div>

                                <div className="admd-modal-actions">
                                    <button type="button" className="admd-btn-sec" onClick={closeModal}>ABORT</button>
                                    <button type="submit" className="admd-btn-pri" disabled={saving}>
                                        {saving ? <FaSyncAlt className="fa-spin" /> : <><FaSave /> {editItem ? 'COMMIT CHANGES' : 'EXECUTE ONBOARDING'}</>}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default AdmissionsManagerDashboard;
