import React, { useState, useEffect } from 'react';
import { FaChevronRight } from 'react-icons/fa';
import './StudentHeader.css';

/**
 * STUDENT HEADER
 * Top bar with breadcrumbs and time, matching the Sentinel theme.
 */
const StudentHeader = ({ view, isSyncing, userData }) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const lastSyncDate = userData?.lastSyncAt || userData?.updatedAt;

    return (
        <header className="nexus-glass-header">
            <div className="header-left">
                <div className="breadcrumb-box">
                    <span className="bc-main">DASHBOARD</span>
                    <FaChevronRight className="bc-sep" />
                    <span className="bc-active">{view ? view.toUpperCase() : 'OVERVIEW'}</span>
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div className="sync-info-box" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em' }}>SYSTEM STATUS</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: isSyncing ? '#3b82f6' : '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        <div className={`sync-dot ${isSyncing ? 'pulsing' : ''}`} style={{ width: '6px', height: '6px', borderRadius: '50%', background: isSyncing ? '#3b82f6' : '#10b981' }}></div>
                        {isSyncing ? 'SYNCING...' : `SYNCED: ${lastSyncDate ? new Date(lastSyncDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'NOW'}`}
                    </div>
                </div>
                <div className="header-time-box">
                    <span className="time-val">
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="date-val">
                        {currentTime.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                </div>
            </div>
        </header>
    );
};

export default StudentHeader;
