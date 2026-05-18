import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaEnvelope, FaClipboardList, FaSignOutAlt,
    FaChartLine, FaUserGraduate, FaChalkboardTeacher, FaLayerGroup, FaBullhorn, FaRobot, FaCog, FaCalendarAlt, FaFileAlt, FaShieldAlt,
    FaGem, FaTerminal, FaChartBar, FaCreditCard, FaBook, FaUserCheck, FaBuilding,
    FaBars, FaChevronLeft
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

    const managerItems = [
        { id: 'admissions', label: 'Admissions', icon: <FaUserCheck /> },
        { id: 'events', label: 'Events', icon: <FaCalendarAlt /> },
        { id: 'hostel', label: 'Hostel', icon: <FaBuilding /> },
        { id: 'library', label: 'Library', icon: <FaBook /> },
        { id: 'transport', label: 'Transport', icon: <FaLayerGroup /> },
        { id: 'placement', label: 'Placements', icon: <FaGem /> },
        { id: 'research', label: 'Research', icon: <FaTerminal /> },
        { id: 'achievements', label: 'Achievements', icon: <FaGem /> },
    ];

    const [managersOpen, setManagersOpen] = React.useState(false);

    // Auto-open managers accordion if the active view is a manager section
    React.useEffect(() => {
        if (managerItems.some(item => item.id === view)) {
            setManagersOpen(true);
        }
    }, [view]);

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
                <div className="minimal-logo-orb" onClick={(e) => { e.stopPropagation(); setView('overview'); }}>
                    <FaTerminal />
                </div>
                {(!collapsed || isMobile) && (
                    <div className="minimal-brand-text" onClick={() => setView('overview')} style={{ cursor: 'pointer' }}>
                        <span className="v-main">ADMIN</span>
                        <span className="v-sub">Universe</span>
                    </div>
                )}
                {!isMobile && (
                    <button className="sidebar-collapse-toggle" onClick={() => setCollapsed(!collapsed)} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
                        {collapsed ? <FaBars /> : <FaChevronLeft />}
                    </button>
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

                {/* Collapsible Manager Portals Accordion */}
                <div className={`minimal-nav-group ${managersOpen ? 'is-expanded' : ''}`}>
                    <div 
                        className={`minimal-nav-link group-header ${managerItems.some(item => item.id === view) ? 'child-active' : ''}`}
                        onClick={() => {
                            if (collapsed && !isMobile) {
                                setCollapsed(false);
                                setManagersOpen(true);
                            } else {
                                setManagersOpen(!managersOpen);
                            }
                        }}
                    >
                        <div className="link-icon-minimal"><FaLayerGroup /></div>
                        {(!collapsed || isMobile) && (
                            <>
                                <span className="link-label-minimal" style={{ marginRight: 'auto' }}>Managers</span>
                                <div className="group-chevron">
                                    <span style={{ 
                                        display: 'inline-block', 
                                        transition: 'transform 0.3s ease', 
                                        transform: managersOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                                        fontSize: '0.65rem'
                                    }}>▶</span>
                                </div>
                            </>
                        )}
                    </div>

                    <AnimatePresence>
                        {managersOpen && (!collapsed || isMobile) && (
                            <motion.div 
                                className="group-children-minimal"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.2rem' }}
                            >
                                {managerItems.map(item => (
                                    <motion.div
                                        key={item.id}
                                        className={`minimal-nav-link sub-link ${view === item.id ? 'is-active' : ''}`}
                                        onClick={() => {
                                            setView(item.id);
                                            if (isMobile && setMobileOpen) setMobileOpen(false);
                                        }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <div className="link-icon-minimal" style={{ fontSize: '0.95rem', opacity: 0.8 }}>{item.icon}</div>
                                        <span className="link-label-minimal">{item.label}</span>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
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
