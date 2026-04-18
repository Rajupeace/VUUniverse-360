import React, { useState } from 'react';
import {
    FaTrophy, FaChartLine, FaUsers, FaGraduationCap, FaSignOutAlt,
    FaBars, FaChevronLeft, FaChevronRight, FaSync, FaShieldAlt, FaRobot
} from 'react-icons/fa';
import VuAiAgent from '../VuAiAgent/VuAiAgent';
import FacultyAchievementManager from '../FacultyDashboard/FacultyAchievementManager';
import './AchievementManagerDashboard.css';

export default function AchievementManagerDashboard({ managerData, onLogout }) {
    const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [activeTab, setActiveTab] = useState('overview');
    // Normalize managerData to ensure it has required fields for FacultyAchievementManager
    const normalizedData = {
        ...managerData,
        facultyId: managerData.facultyId || managerData.sid || managerData._id,
        facultyName: managerData.facultyName || managerData.name || 'Manager',
        department: managerData.department || 'Academic'
    };

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="am-shell">
            {/* Sidebar */}
            <aside className={`am-sidebar ${!isSidebarOpen ? 'collapsed' : ''}`}>
                <div className="am-sidebar-header">
                    <div className="am-logo">
                        <FaTrophy className="am-logo-icon" />
                        {isSidebarOpen && <span>Vu UniVerse360 Success</span>}
                    </div>
                    <button className="am-toggle-btn" onClick={() => setSidebarOpen(!isSidebarOpen)}>
                        <FaBars />
                    </button>
                </div>

                <nav className="am-nav">
                    <button className={`am-nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                        <FaChartLine />
                        {isSidebarOpen && <span>Overview</span>}
                    </button>
                    <button className={`am-nav-item ${activeTab === 'ai-agent' ? 'active' : ''}`} onClick={() => setActiveTab('ai-agent')}>
                        <FaRobot />
                        {isSidebarOpen && <span>AI Agent</span>}
                    </button>
                </nav>

                <div className="am-sidebar-footer">
                    <button className="am-logout-btn" onClick={onLogout}>
                        <FaSignOutAlt />
                        {isSidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="am-main">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 12px', borderRadius: '4px', margin: '1rem', width: 'fit-content' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#10b981', letterSpacing: '2px' }}>CLOUD SYNC LIVE</span>
                </div>
                <div className="am-content-area">
                    {activeTab === 'overview' ? (
                        <FacultyAchievementManager facultyData={normalizedData} key={refreshTrigger} />
                    ) : (
                        <div style={{ height: 'calc(100vh - 40px)' }}>
                            <VuAiAgent onNavigate={setActiveTab} documentContext={{ title: "Success Hub", content: "Agent is assisting the achievement manager with student rewards, verification, and performance insights.", data: { normalizedData } }} />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
