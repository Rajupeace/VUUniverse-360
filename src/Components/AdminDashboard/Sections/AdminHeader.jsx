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
    isSyncing = false
}) => {
    const [currentTime, setCurrentTime] = React.useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Proactive hardening for null prop usage
    adminData = adminData || { name: 'System Administrator', role: 'Administrator' };

    const localHandleLogout = (e) => {
        e.preventDefault();
        if (window.confirm('Are you sure you want to log out?')) {
            if (onLogout) {
                onLogout();
            } else {
                localStorage.clear();
                window.location.reload();
            }
        }
    };

    const navGroups = [
        {
            label: 'CORE SYSTEMS',
            items: [
                { id: 'overview', label: 'Command Center', icon: <FaChartLine /> },
                { id: 'students', label: 'Student Manager', icon: <FaUserGraduate /> },
                { id: 'faculty', label: 'Faculty Manager', icon: <FaChalkboardTeacher /> },
                { id: 'courses', label: 'Academic Hub', icon: <FaLayerGroup /> },
                { id: 'achievements', label: 'Achievements', icon: <FaGem /> },
            ]
        },
        {
            label: 'OPERATION NODES',
            items: [
                { id: 'attendance', label: 'Attendance Manager', icon: <FaClipboardList /> },
                { id: 'schedule', label: 'Schedule Manager', icon: <FaCalendarAlt /> },
                { id: 'admissions', label: 'Admissions Manager', icon: <FaUserGraduate /> },
                { id: 'finance', label: 'Finance Manager', icon: <FaCreditCard /> },
                { id: 'events', label: 'Events Manager', icon: <FaBullhorn /> },
                { id: 'hostel', label: 'Hostel Manager', icon: <FaLayerGroup /> },
                { id: 'library', label: 'Library Manager', icon: <FaBook /> },
                { id: 'transport', label: 'Transport Manager', icon: <FaLayerGroup /> },
                { id: 'placement', label: 'Placement Manager', icon: <FaGem /> },
                { id: 'research', label: 'Research Manager', icon: <FaRobot /> },
                { id: 'materials', label: 'Resource Manager', icon: <FaLayerGroup /> },
                { id: 'marks', label: 'Marks Manager', icon: <FaTerminal /> },
                { id: 'analytics', label: 'System Analytics', icon: <FaChartBar /> },
                { id: 'staff-roles', label: 'Access Control', icon: <FaShieldAlt /> },
            ]
        },
    ];

    const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 1024);
    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <motion.aside
            className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}
            initial={false}
            animate={isMobile ? {} : { width: collapsed ? 90 : 280 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{
                background: 'rgba(255, 255, 255, 0.98)',
                boxShadow: collapsed ? '4px 0 20px rgba(0,0,0,0.05)' : '10px 0 30px rgba(0,0,0,0.05)',
                ...(isMobile ? { width: 'auto' } : {})
            }}
        >
            <div className="admin-sidebar-header" style={{ height: '100px', display: 'flex', alignItems: 'center', padding: '0 1.5rem' }}>
                <motion.div
                    className="admin-brand-group"
                    onClick={() => setCollapsed(!collapsed)}
                    whileHover={{ scale: 1.02 }}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}
                >
                    <motion.div
                        className="admin-brand-icon"
                        animate={{ rotate: collapsed ? 0 : 360 }}
                        style={{
                            width: '44px',
                            height: '44px',
                            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                            color: 'white',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                            boxShadow: '0 8px 16px rgba(79, 70, 229, 0.3)'
                        }}
                    >
                        <FaShieldAlt />
                    </motion.div>
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="admin-brand-text-block"
                            >
                                <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 950, color: 'var(--admin-secondary)', letterSpacing: '-1px' }}>VU</h1>
                                <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--admin-primary)', letterSpacing: '2px', textTransform: 'uppercase' }}>UNIVERSE</span>
                                 <span style={{ fontSize: '0.55rem', fontWeight: 900, color: '#10b981', letterSpacing: '1px' }}>
                                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <div style={{ fontSize: '0.5rem', fontWeight: 900, color: 'var(--admin-secondary)', letterSpacing: '0.5px', marginTop: '2px', opacity: 0.8 }}>
                                    {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', background: 'rgba(79, 70, 229, 0.05)', padding: '2px 6px', borderRadius: '4px', width: 'fit-content' }}>
                                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#4f46e5', boxShadow: '0 0 4px #4f46e5' }}></div>
                                    <span style={{ fontSize: '0.45rem', fontWeight: 950, color: '#4f46e5' }}>METADATA LINKED</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            <nav className="admin-nav" style={{ padding: collapsed ? '1rem 0.75rem' : '1.5rem', overflowY: 'auto', flex: 1 }}>
                {navGroups.map((group, idx) => (
                    <div key={idx} className="admin-nav-group" style={{ marginBottom: '2rem' }}>
                        <span
                            className={`admin-nav-label ${collapsed ? 'label-hidden' : ''}`}
                            style={{ fontSize: '0.6rem', fontWeight: 950, letterSpacing: '2px' }}
                        >
                            {group.label}
                        </span>
                        <div style={{ marginTop: '0.75rem' }}>
                            {group.items.map(item => (
                                <motion.div
                                    key={item.id}
                                    onClick={() => setView(item.id)}
                                    className={`admin-nav-item ${view === item.id ? 'active' : ''} ${item.id === 'ai-agent' ? 'ai-core-item' : ''}`}
                                    whileHover={{ x: 8, background: view === item.id ? '' : 'rgba(79, 70, 229, 0.05)' }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{
                                        borderRadius: '14px',
                                        marginBottom: '6px',
                                        background: view === item.id ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'transparent',
                                        color: view === item.id ? 'white' : '#64748b',
                                        boxShadow: view === item.id ? '0 10px 20px rgba(79, 70, 229, 0.25)' : 'none'
                                    }}
                                >
                                    <div className="nav-icon" style={{ fontSize: '1.1rem' }}>{item.icon}</div>
                                    <span className={`nav-item-label ${collapsed ? 'label-hidden' : ''}`} style={{ fontWeight: 800, fontSize: '0.85rem' }}>
                                        {item.label}
                                    </span>
                                    {item.id === 'ai-agent' && <div className={`ai-pulse-dot ${collapsed ? 'label-hidden' : ''}`} style={{ background: '#10b981', boxShadow: '0 0 10px #10b981' }}></div>}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="admin-sidebar-footer" style={{ padding: collapsed ? '1.5rem 0.5rem' : '1.5rem', borderTop: '1px solid #f1f5f9', background: '#fcfdfe' }}>
                <motion.div
                    className={`admin-user-profile ${collapsed ? 'label-hidden' : ''}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        marginBottom: '1.5rem',
                        padding: '1rem',
                        background: 'white',
                        borderRadius: '16px',
                        border: '1px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}
                >
                    <div style={{ width: '40px', height: '40px', background: '#eef2ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', fontWeight: 950, overflow: 'hidden' }}>
                        <img
                            src={resolveImageUrl(adminData.profileImage || adminData.profilePic, adminData.name || 'Admin')}
                            alt="Admin Avatar"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                    <div>
                        <div className="user-name" style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--admin-secondary)' }}>{adminData.name}</div>
                        <div className="user-role" style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--admin-primary)' }}>{adminData.role}</div>
                    </div>
                </motion.div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="admin-btn admin-btn-outline"
                        style={{ width: '100%', borderRadius: '12px', height: '42px', fontSize: '0.75rem' }}
                    >
                    </motion.button>

                    <motion.button
                        onClick={localHandleLogout}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="admin-btn admin-btn-danger"
                        style={{ width: '100%', borderRadius: '12px', height: '42px', fontSize: '0.75rem' }}
                    >
                        <FaSignOutAlt /> <span className={`${collapsed ? 'label-hidden' : ''}`}>TERMINATE</span>
                    </motion.button>
                </div>
            </div>
        </motion.aside >
    );
};

export default AdminHeader;
