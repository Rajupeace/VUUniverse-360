// src/Components/FacultyDashboard/Sections/FacultySidebar.jsx
import React from 'react';
import { motion } from 'framer-motion';
import {
    FaEnvelope, FaSignOutAlt,
    FaLayerGroup, FaUserCheck, FaBullhorn, FaShieldAlt, FaUserGraduate, FaBook,
    FaClipboardList, FaPencilAlt, FaTimes, FaCalendarAlt, FaThLarge, FaCog, FaMicrochip, FaRobot
} from 'react-icons/fa';

/**
 * PREMIUM NEXUS SIDEBAR (FACULTY) V6
 * Specialized interface for academic Command & Control.
 */
const FacultySidebar = ({
    facultyData,
    view,
    setView,
    collapsed,
    setCollapsed,
    onLogout,
    onNavigate,
    isSyncing = false
}) => {
    facultyData = facultyData || { facultyName: 'Faculty', department: 'Academic' };

    const handleItemClick = (id) => {
        setView(id);
        if (onNavigate) onNavigate();
    };

    const baseNavItems = [
        { id: 'overview', label: 'Intelligence Hub', icon: <FaThLarge /> },
        { id: 'materials', label: 'Resource Hub', icon: <FaBook /> },
        { id: 'assignments', label: 'Coursework Hub', icon: <FaClipboardList /> },
        { id: 'marks', label: 'Grading Control', icon: <FaPencilAlt /> },
        { id: 'attendance', label: 'Attendance logs', icon: <FaUserCheck /> },
        { id: 'mark-attendance', label: 'Launch Attendance', icon: <FaClipboardList /> },
        { id: 'exams', label: 'Assessment Hub', icon: <FaShieldAlt /> },
        { id: 'schedule', label: 'Academic Schedule', icon: <FaCalendarAlt /> },
        { id: 'students', label: 'Student Registry', icon: <FaUserGraduate /> },
        { id: 'curriculum', label: 'Curriculum Arch', icon: <FaLayerGroup /> },
        { id: 'broadcast', label: 'Global Directives', icon: <FaBullhorn /> },
        { id: 'messages', label: 'Academic Board', icon: <FaEnvelope /> },
        { id: 'whiteboard', label: 'Creative Canvas', icon: <FaPencilAlt /> },
        { id: 'ai-agent', label: 'AI Assistant', icon: <FaRobot /> },
        { id: 'settings', label: 'System Config', icon: <FaCog /> }
    ];

    let navItems = [...baseNavItems];

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
            <button className="mobile-close-btn" onClick={onNavigate}><FaTimes /></button>

            <div className="sidebar-header">
                <div className="brand-box" onClick={() => setCollapsed(!collapsed)}>
                    <div className="brand-icon-box">
                        <FaMicrochip />
                    </div>
                    <div className={`brand-text ${collapsed && !isMobile ? 'label-hidden' : ''}`}>
                        <h1>VU</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span>NOTEBOOK</span>
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
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => handleItemClick(item.id)}
                        className={`nav-item ${view === item.id ? 'active' : ''}`}
                        title={collapsed ? item.label : ''}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className={`nav-label ${collapsed && !isMobile ? 'label-hidden' : ''}`}>{item.label}</span>
                        {view === item.id && <div className="active-dot"></div>}
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className={`user-profile-mini ${collapsed && !isMobile ? 'label-hidden' : ''}`}>
                    <div className="u-name">{(facultyData.facultyName || 'ACADEMIC')}</div>
                    <div className="u-meta">{facultyData.department || 'INSTITUTIONAL CORE'}</div>
                </div>
                <button
                    onClick={() => {
                        onLogout();
                    }}
                    className="logout-btn"
                    title="Terminate Session"
                >
                    <FaSignOutAlt />
                    <span className={`${collapsed && !isMobile ? 'label-hidden' : ''}`} style={{ marginLeft: '10px' }}>TERMINATE</span>
                </button>
            </div>
        </motion.aside>
    );
};

export default FacultySidebar;
