import React from 'react';
import {
    FaGraduationCap, FaSignOutAlt, FaRocket, FaChartBar, FaPen, FaShieldAlt, FaClipboardList, FaBriefcase, FaRoad, FaBullhorn, FaUniversity, FaHeadset, FaLayerGroup, FaAward, FaChalkboardTeacher, FaBolt, FaBook
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import './StudentSidebar.css';

/**
 * Student Sidebar
 * Collapsible sidebar for streamlined navigation.
 */
const StudentSidebar = ({
    userData = {},
    view,
    setView,
    collapsed,
    setCollapsed,
    onLogout,
    onNavigate,
    isSyncing = false,
    mobileOpen = false
}) => {
    const [currentTime, setCurrentTime] = React.useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const localHandleLogout = (e) => {
        if (e) e.preventDefault();
        if (onLogout) onLogout();
        else {
            localStorage.clear();
            window.location.reload();
        }
    };

    const menuItems = [
        { id: 'overview', label: 'Dashboard', icon: <FaLayerGroup /> },
        { id: 'semester', label: 'Classroom', icon: <FaChalkboardTeacher /> },
        { id: 'schedule', label: 'Schedule', icon: <FaClipboardList /> },
        { id: 'marks', label: 'Grades', icon: <FaChartBar /> },
        { id: 'attendance', label: 'Attendance', icon: <FaClipboardList /> },
        { id: 'placement', label: 'Placements', icon: <FaBriefcase /> },
        { id: 'advanced', label: 'Skill Forge', icon: <FaRocket /> },
        { id: 'announcements', label: 'Broadcasts', icon: <FaBullhorn /> },
        { id: 'ai-agent', label: 'VU AI', icon: <FaBolt /> },
    ];

    const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 1100);
    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 1100);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const sidebarVariants = {
        expanded: { width: 280, x: 0 },
        collapsed: { width: 85, x: 0 },
        mobileOpen: { x: 0, width: '280px' },
        mobileClosed: { x: '-100%', width: '280px' }
    };

    const activeState = isMobile ? (mobileOpen ? 'mobileOpen' : 'mobileClosed') : (collapsed ? 'collapsed' : 'expanded');

    return (
        <motion.aside 
            className={`glass-minimal-sidebar ${collapsed ? 'is-collapsed' : ''} ${mobileOpen ? 'is-open' : ''}`}
            initial={false}
            animate={activeState}
            variants={sidebarVariants}
            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
        >
            <div className="sidebar-branding-minimal">
                <div className="minimal-logo-orb" onClick={() => !isMobile && setCollapsed(!collapsed)}>
                    <FaGraduationCap />
                </div>
                {(!collapsed || isMobile) && (
                    <div className="minimal-brand-text">
                        <span className="v-main">VU</span>
                        <span className="v-sub">Universe</span>
                    </div>
                )}
            </div>

            <div className="minimal-nav-list">
                {menuItems.map(item => (
                    <motion.div
                        key={item.id}
                        className={`minimal-nav-link ${view === item.id ? 'is-active' : ''} ${item.id === 'ai-agent' ? 'ai-glow-link' : ''}`}
                        onClick={() => {
                            setView(item.id);
                            if (isMobile && onNavigate) onNavigate();
                        }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <div className="link-icon-minimal">{item.icon}</div>
                        {(!collapsed || isMobile) && <span className="link-label-minimal">{item.label}</span>}
                    </motion.div>
                ))}
            </div>

            <div className="sidebar-footer-minimal">
                {(!collapsed || isMobile) && (
                    <div className="footer-user-minimal">
                        <img 
                            src={userData?.profileImage || userData?.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData?.studentName || 'Student'}`} 
                            alt="Student" 
                        />
                        <div className="user-meta-minimal">
                            <span className="u-name-min">{userData.studentName?.split(' ')[0]}</span>
                            <span className="u-id-min">{userData.sid}</span>
                        </div>
                    </div>
                )}

                <button className="minimal-logout-btn" onClick={localHandleLogout}>
                    <FaSignOutAlt />
                    {(!collapsed || isMobile) && <span>Logout</span>}
                </button>
                
                {(!collapsed || isMobile) && (
                    <div className="minimal-time">
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                )}
            </div>
        </motion.aside>
    );
};

export default StudentSidebar;
