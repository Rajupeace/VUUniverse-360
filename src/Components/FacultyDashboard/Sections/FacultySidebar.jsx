// src/Components/FacultyDashboard/Sections/FacultySidebar.jsx
import React from 'react';
import { motion } from 'framer-motion';
import {
    FaEnvelope, FaSignOutAlt,
    FaLayerGroup, FaUserCheck, FaBullhorn, FaShieldAlt, FaUserGraduate, FaBook,
    FaClipboardList, FaPencilAlt, FaTimes, FaCalendarAlt, FaThLarge, FaCog, FaMicrochip, FaRobot
} from 'react-icons/fa';

/**
 * MINIMALIST GLASS SIDEBAR (FACULTY)
 */
const FacultySidebar = ({
    facultyData,
    view,
    setView,
    collapsed,
    setCollapsed,
    onLogout,
    onNavigate
}) => {
    facultyData = facultyData || { facultyName: 'Faculty', department: 'Academic' };

    const handleItemClick = (id) => {
        setView(id);
        if (onNavigate) onNavigate();
    };

    const navItems = [
        { id: 'overview', label: 'Overview', icon: <FaThLarge /> },
        { id: 'materials', label: 'Resources', icon: <FaBook /> },
        { id: 'assignments', label: 'Assignments', icon: <FaClipboardList /> },
        { id: 'marks', label: 'Grading', icon: <FaPencilAlt /> },
        { id: 'attendance', label: 'Attendance', icon: <FaUserCheck /> },
        { id: 'exams', label: 'Assessments', icon: <FaShieldAlt /> },
        { id: 'schedule', label: 'Schedule', icon: <FaCalendarAlt /> },
        { id: 'students', label: 'Students', icon: <FaUserGraduate /> },
        { id: 'curriculum', label: 'Curriculum', icon: <FaLayerGroup /> },
        { id: 'broadcast', label: 'Broadcast', icon: <FaBullhorn /> },
        { id: 'messages', label: 'Messages', icon: <FaEnvelope /> },
        { id: 'ai-agent', label: 'AI Agent', icon: <FaRobot /> },
        { id: 'settings', label: 'Settings', icon: <FaCog /> }
    ];

    const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 1100);
    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 1100);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const sidebarStyle = {
        width: isMobile ? '100%' : (collapsed ? '85px' : '280px'),
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(35px)',
        WebkitBackdropFilter: 'blur(35px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        height: '100vh',
        position: isMobile ? 'fixed' : 'sticky',
        top: 0,
        left: 0,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 1rem',
        transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    };

    return (
        <aside style={sidebarStyle} className={`faculty-sidebar-minimal ${collapsed ? 'collapsed' : ''}`}>
            {isMobile && (
                <button 
                    onClick={onNavigate}
                    style={{ position: 'absolute', top: '1.5rem', right: '1rem', background: 'none', border: 'none', color: '#0f172a', fontSize: '1.2rem' }}
                >
                    <FaTimes />
                </button>
            )}

            <div className="sidebar-header" style={{ marginBottom: '2.5rem', padding: '0 0.5rem' }}>
                <div 
                    onClick={() => !isMobile && setCollapsed(!collapsed)}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}
                >
                    <div style={{ width: '40px', height: '40px', background: '#0f172a', color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                        <FaMicrochip />
                    </div>
                    {(!collapsed || isMobile) && (
                        <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 950, color: '#0f172a', letterSpacing: '-1px' }}>
                            VU <span style={{ color: '#6366f1' }}>UNI</span>
                        </h1>
                    )}
                </div>
            </div>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem', overflowY: 'auto', paddingRight: '4px' }}>
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => handleItemClick(item.id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem 1rem',
                            borderRadius: '14px', border: 'none', 
                            background: view === item.id ? 'rgba(15, 23, 42, 0.05)' : 'transparent',
                            color: view === item.id ? '#0f172a' : '#64748b',
                            fontWeight: view === item.id ? 800 : 700,
                            fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s ease',
                            width: '100%', textAlign: 'left', position: 'relative'
                        }}
                    >
                        <span style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px' }}>{item.icon}</span>
                        {(!collapsed || isMobile) && <span>{item.label}</span>}
                        {view === item.id && !collapsed && (
                            <motion.div layoutId="active-pill-f" style={{ position: 'absolute', right: '12px', width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1' }} />
                        )}
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                <button
                    onClick={onLogout}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem 1rem',
                        borderRadius: '14px', border: 'none', background: 'rgba(239, 68, 68, 0.05)',
                        color: '#ef4444', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
                        width: '100%', transition: 'all 0.2s ease'
                    }}
                >
                    <FaSignOutAlt style={{ width: '24px' }} />
                    {(!collapsed || isMobile) && <span>LOGOUT</span>}
                </button>
            </div>
        </aside>
    );
};

export default FacultySidebar;


export default FacultySidebar;
