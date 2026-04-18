import React from 'react';
import { FaTimes, FaUserCheck, FaPlus, FaRobot, FaBullhorn, FaSyncAlt } from 'react-icons/fa';

const QuickActionsMenu = ({
    setShowQuickMenu,
    setActiveTab,
    setActiveContext,
    myClasses,
    refreshAll,
    setShowMsgModal
}) => {
    return (
        <div style={{
            position: 'fixed',
            top: '120px',
            right: '30px',
            background: 'white',
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            border: '1px solid var(--pearl-border)',
            padding: '1.5rem',
            zIndex: 1000,
            minWidth: '280px',
            animation: 'slideInRight 0.3s ease'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Quick Actions</h3>
                <button onClick={() => setShowQuickMenu(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--text-muted)' }}>
                    <FaTimes />
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <button
                    onClick={() => { setActiveTab('attendance'); if (myClasses.length > 0) setActiveContext(myClasses[0]); setShowQuickMenu(false); }}
                    className="cyber-btn"
                    style={{ width: '100%', justifyContent: 'flex-start', background: 'rgba(99, 102, 241, 0.05)', color: 'var(--accent-primary)', border: '1px solid rgba(99, 102, 241, 0.2)' }}
                >
                    <FaUserCheck /> Take Attendance
                </button>

                <button
                    onClick={() => { setActiveTab('materials'); if (myClasses.length > 0) setActiveContext(myClasses[0]); setShowQuickMenu(false); }}
                    className="cyber-btn"
                    style={{ width: '100%', justifyContent: 'flex-start', background: 'rgba(16, 185, 129, 0.05)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.2)' }}
                >
                    <FaPlus /> Upload Material
                </button>

                <button
                    onClick={() => { setActiveContext('ai-agent'); setShowQuickMenu(false); }}
                    className="cyber-btn"
                    style={{ width: '100%', justifyContent: 'flex-start', background: 'rgba(168, 85, 247, 0.05)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.2)' }}
                >
                    <FaRobot /> AI Assistant
                </button>

                <button
                    onClick={() => { setView('curriculum'); setShowQuickMenu(false); }}
                    className="cyber-btn"
                    style={{ width: '100%', justifyContent: 'flex-start', background: 'rgba(249, 115, 22, 0.05)', color: '#f97316', border: '1px solid rgba(249, 115, 22, 0.2)' }}
                >
                    <FaSyncAlt /> Curriculum Architect
                </button>

                <button
                    onClick={() => { setShowMsgModal(true); setShowQuickMenu(false); }}
                    className="cyber-btn"
                    style={{ width: '100%', justifyContent: 'flex-start', background: 'rgba(244, 63, 94, 0.05)', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.2)' }}
                >
                    <FaBullhorn /> Broadcast Message
                </button>

                <button
                    onClick={() => { refreshAll(); setShowQuickMenu(false); }}
                    className="cyber-btn"
                    style={{ width: '100%', justifyContent: 'flex-start', background: 'rgba(14, 165, 233, 0.05)', color: '#0ea5e9', border: '1px solid rgba(14, 165, 233, 0.2)' }}
                >
                    <FaSyncAlt /> Refresh Data
                </button>
            </div>
        </div>
    );
};

export default QuickActionsMenu;
