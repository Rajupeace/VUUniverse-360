import React from 'react';
import {
    FaGraduationCap, FaSignOutAlt, FaRocket, FaChartBar, FaPen, FaShieldAlt, FaClipboardList, FaBriefcase, FaRoad, FaBullhorn, FaUniversity, FaHeadset, FaLayerGroup, FaAward, FaChalkboardTeacher, FaBolt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import './StudentSidebar.css';

/**
 * Student Sidebar
 * Collapsible sidebar for streamlined navigation.
 */
const StudentSidebar = ({
    userData,
    view,
    setView,
    collapsed,
    setCollapsed,
    onLogout,
    onNavigate,
    isSyncing = false
}) => {

    const localHandleLogout = (e) => {
        if (e) e.preventDefault();
        if (onLogout) {
            onLogout();
        } else {
            localStorage.clear();
            window.location.reload();
        }
    };

    const menuGroups = [
        {
            title: 'CORE',
            items: [
                { id: 'overview', label: 'Dashboard', icon: <FaLayerGroup /> },
                { id: 'tasks', label: 'Task List', icon: <FaClipboardList /> },
                { id: 'announcements', label: 'Announcements', icon: <FaBullhorn /> },
                { id: 'ai-agent', label: 'AI Tutor', icon: <FaBolt /> },
            ]
        },
        {
            title: 'ACADEMICS',
            items: [
                { id: 'semester', label: 'Classroom', icon: <FaChalkboardTeacher /> },
                { id: 'journal', label: 'My Notes', icon: <FaPen /> },
                { id: 'marks', label: 'Grades & Results', icon: <FaChartBar /> },
                { id: 'attendance', label: 'Attendance Intel', icon: <FaClipboardList /> },
                { id: 'schedule', label: 'Daily Schedule', icon: <FaClipboardList /> },
                { id: 'faculty', label: 'My Faculty', icon: <FaGraduationCap /> },
                { id: 'class-boards', label: 'Shared Boards', icon: <FaChalkboardTeacher /> },
                { id: 'achievements', label: 'My Achievements', icon: <FaAward /> },
                { id: 'exams', label: 'Exam Portal', icon: <FaShieldAlt /> },
            ]
        },
        {
            title: 'FINANCE',
            items: [
                { id: 'fees', label: 'College Fees', icon: <FaUniversity /> },
            ]
        },
        {
            title: 'PREPARATION',
            items: [
                { id: 'placement', label: 'Placement Prep', icon: <FaBriefcase /> },
                { id: 'academic-browser', label: 'Academic Sections', icon: <FaBook /> },
                { id: 'advanced', label: 'Skill Boost', icon: <FaRocket /> },
            ]
        },
        {
            title: 'ACCOUNT',
            items: [
                { id: 'settings', label: 'Settings', icon: <FaShieldAlt /> },
                { id: 'support', label: 'Support', icon: <FaHeadset /> },
            ]
        }
    ];

    const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 1024);
    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <motion.aside 
            className={`nexus-sidebar ${collapsed ? 'collapsed' : ''}`}
            initial={false}
            animate={isMobile ? {} : { width: collapsed ? 80 : 280 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            <div className="sidebar-header">
                <div
                    className="brand-toggle"
                    onClick={() => setCollapsed(!collapsed)}
                    title={collapsed ? "Expand" : "Collapse"}
                >
                    <div className="brand-icon-box">
                        <FaGraduationCap />
                    </div>
                    <div className={`brand-text ${collapsed && !isMobile ? 'label-hidden' : 'fade-in'}`}>
                        <h1>Vu UniVerse360</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span>Student Dashboard</span>
                            {isSyncing ? (
                                <motion.div
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}
                                ></motion.div>
                            ) : (
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#818cf8', boxShadow: '0 0 5px #818cf8' }}></div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <nav className="sidebar-nav">
                {menuGroups.map((group, gIdx) => (
                    <div key={gIdx} className="nav-group">
                        <div className={`group-title ${(collapsed && !isMobile) ? 'label-hidden' : ''}`}>{group.title}</div>
                        {group.items.map(item => (
                            <button
                                key={item.id}
                                onClick={() => { setView(item.id); if (onNavigate) onNavigate(); }}
                                className={`nav-item ${view === item.id ? 'active' : ''}`}
                                title={collapsed ? item.label : ''}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                <span className={`nav-label ${(collapsed && !isMobile) ? 'label-hidden' : 'fade-in'}`}>{item.label}</span>
                                {view === item.id && <div className="active-indicator"></div>}
                            </button>
                        ))}
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className={`user-profile-mini ${(collapsed && !isMobile) ? 'label-hidden' : 'fade-in'}`} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="sidebar-profile-pic" style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid rgba(255,255,255,0.2)' }}>
                        <img 
                            src={userData?.profileImage || userData?.profilePic || userData?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData?.studentName || 'Student'}`} 
                            alt="Profile" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            onError={(e) => { e.target.onerror = null; e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData?.studentName || 'Student'}`; }}
                        />
                    </div>
                    <div>
                        <div className="u-name">{userData.studentName}</div>
                        <div className="u-meta">{userData.sid} • Y{userData.year}</div>
                    </div>
                </div>

                <button onClick={localHandleLogout} className="logout-btn" title="Logout">
                    <FaSignOutAlt />
                    <span className={`logout-text ${(collapsed && !isMobile) ? 'label-hidden' : 'fade-in'}`} style={{ marginLeft: '10px', fontWeight: 800 }}>LOGOUT</span>
                </button>
            </div>
        </motion.aside>
    );
};

export default StudentSidebar;
