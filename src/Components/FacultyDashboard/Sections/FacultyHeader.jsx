import React from 'react';
import {
    FaGraduationCap, FaEnvelope, FaSignOutAlt,
    FaLayerGroup, FaBolt, FaChartLine, FaUserCheck, FaBullhorn, FaShieldAlt, FaUserGraduate
} from 'react-icons/fa';
import { resolveImageUrl } from '../../../utils/apiClient';

/**
 * Vu UniVerse360 HEADER
 * FACULTY DASHBOARD (OVERVIEW)
 * Clean analytics and activity monitoring.
 * Theme: Vu UniVerse360
 */
const FacultyHeader = ({
    facultyData,
    view,
    setView,
    onLogout,
    toggleMsgModal
}) => {

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

    const navItems = [
        { id: 'overview', label: 'DASHBOARD', iconType: 'chart-line', color: '#6366f1' },
        { id: 'materials', label: 'MATERIALS', iconType: 'layer-group', color: '#3b82f6' },
        { id: 'attendance', label: 'ATTENDANCE', iconType: 'user-check', color: '#10b981' },
        { id: 'exams', label: 'EXAMS', iconType: 'shield-alt', color: '#f59e0b' },
        { id: 'schedule', label: 'SCHEDULE', iconType: 'bolt', color: '#ec4899' },
        { id: 'students', label: 'STUDENTS', iconType: 'user-graduate', color: '#3b82f6' },
        { id: 'curriculum', label: 'CURRICULUM', iconType: 'layer-group', color: '#6366f1' },
        { id: 'broadcast', label: 'BROADCAST', iconType: 'bullhorn', color: '#f43f5e' },
        { id: 'messages', label: 'ANNOUNCEMENTS', iconType: 'envelope', color: '#8b5cf6' },
        { id: 'settings', label: 'SYSTEM', iconType: 'graduation-cap', color: '#64748b' }
    ];

    const getFacultyNavIcon = (iconType) => {
        switch (iconType) {
            case 'chart-line': return <FaChartLine />;
            case 'layer-group': return <FaLayerGroup />;
            case 'user-check': return <FaUserCheck />;
            case 'shield-alt': return <FaShieldAlt />;
            case 'bolt': return <FaBolt />;
            case 'user-graduate': return <FaUserGraduate />;
            case 'bullhorn': return <FaBullhorn />;
            case 'envelope': return <FaEnvelope />;
            case 'graduation-cap': return <FaGraduationCap />;
            default: return <FaChartLine />;
        }
    };

    return (
        <header className="sd-header animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                <div className="sd-brand-group">
                    <FaGraduationCap className="sd-brand-icon" style={{ fontSize: '2.4rem' }} />
                    <div>
                        <h1 className="sd-brand-name">FBN Admin</h1>
                        <span className="sd-brand-tag">FACULTY PORTAL</span>
                    </div>
                </div>

                <div className="sd-nav-scroll-container">
                    <nav className="sd-nav-bar">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setView(item.id)}
                                className={`sd-nav-btn ${view === item.id ? 'active' : ''}`}
                            >
                                <span className="nav-icon" style={{ color: view === item.id ? 'white' : item.color }}>{getFacultyNavIcon(item.iconType)}</span>
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            <div className="sd-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                    <img
                        src={resolveImageUrl(facultyData.profileImage || facultyData.profilePic, facultyData.name || 'Faculty')}
                        alt="Faculty Avatar"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>
                <div className="f-header-userinfo">
                    <div className="f-header-username">{facultyData.name || 'Faculty Member'}</div>
                    <div className="f-header-userdept">{facultyData.department || 'Academic Dept'}</div>
                </div>

                <div className="header-icon-stack" style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="f-msg-btn" onClick={toggleMsgModal}>
                        <FaEnvelope />
                    </button>
                </div>

                <div style={{ width: '1px', height: '30px', background: '#f1f5f9', margin: '0 0.5rem' }}></div>

                <button
                    onClick={() => window.location.href = '/student'}
                    className="f-logout-btn"
                    style={{ background: '#3b82f6', color: '#fff' }}
                    title="Switch to Student View"
                >
                    <FaUserGraduate /> VIEW STUDENT PORTAL
                </button>

                <button onClick={localHandleLogout} className="f-logout-btn">
                    <FaSignOutAlt /> LOGOUT
                </button>
            </div>
        </header>
    );
};

export default FacultyHeader;
