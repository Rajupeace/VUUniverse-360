import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaEnvelope, FaClipboardList, FaSignOutAlt,
    FaChartLine, FaUserGraduate, FaChalkboardTeacher, FaLayerGroup, FaBullhorn, FaRobot, FaCog, FaCalendarAlt, FaFileAlt, FaShieldAlt,
    FaGem, FaTerminal, FaChartBar, FaCreditCard, FaBook
} from 'react-icons/fa';
import { resolveImageUrl } from '../../../utils/apiClient';

/**
 * Admin Sidebar
 * Main navigation for admin system.
 * Theme: Sentinel Premium V5
 */
const AdminHeader = ({
    adminData = { name: 'System Administrator', role: 'Administrator' },
    view,
    setView,
    openModal,
    onLogout,
    collapsed,
    setCollapsed,
    isSyncing = false,
    mobileOpen = false,
    setMobileOpen
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
        { id: 'overview', label: 'Dashboard', icon: <FaChartLine /> },
        { id: 'students', label: 'Students', icon: <FaUserGraduate /> },
        { id: 'faculty', label: 'Faculty', icon: <FaChalkboardTeacher /> },
        { id: 'courses', label: 'Courses', icon: <FaLayerGroup /> },
        { id: 'attendance', label: 'Attendance', icon: <FaClipboardList /> },
        { id: 'schedule', label: 'Schedule', icon: <FaCalendarAlt /> },
        { id: 'marks', label: 'Grades', icon: <FaTerminal /> },
        { id: 'finance', label: 'Finance', icon: <FaCreditCard /> },
        { id: 'ai-agent', label: 'VU AI', icon: <FaRobot /> },
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

    const activeSidebarState = isMobile ? (mobileOpen ? 'mobileOpen' : 'mobileClosed') : (collapsed ? 'collapsed' : 'expanded');

    return (
        <motion.aside
            className={`admin-sidebar-minimal ${collapsed ? 'is-collapsed' : ''} ${mobileOpen ? 'is-open' : ''}`}
            initial={false}
            animate={activeSidebarState}
            variants={sidebarVariants}
            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
        >
            <div className="sidebar-branding-minimal">
                <div className="minimal-logo-orb" onClick={() => !isMobile && setCollapsed(!collapsed)}>
                    <FaTerminal />
                </div>
                {(!collapsed || isMobile) && (
                    <div className="minimal-brand-text">
                        <span className="v-main">ADMIN</span>
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
                            if (isMobile && setMobileOpen) setMobileOpen(false);
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
                            src={resolveImageUrl(adminData.profileImage || adminData.profilePic || '') || `https://api.dicebear.com/7.x/avataaars/svg?seed=${adminData.name}`} 
                            alt="Admin" 
                        />
                        <div className="user-meta-minimal">
                            <span className="u-name-min">{adminData.name.split(' ')[0]}</span>
                            <span className="u-id-min">{adminData.role}</span>
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

export default AdminHeader;
