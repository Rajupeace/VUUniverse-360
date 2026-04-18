import React, { useState, useEffect } from 'react';
import { apiGet } from '../../utils/apiClient';
import { FaUserGraduate, FaChartBar, FaUsers, FaLayerGroup, FaDotCircle } from 'react-icons/fa';

/**
 * STUDENT ANALYTICS
 * Comprehensive demographics and engagement metrics for students.
 */
const StudentStatistics = () => {
    const [students, setStudents] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        byYear: {},
        byBranch: {},
        bySection: {},
        loggedInToday: 0
    });

    useEffect(() => {
        fetchStudentData();
        const interval = setInterval(fetchStudentData, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchStudentData = async () => {
        try {
            const data = await apiGet('/api/students');
            if (Array.isArray(data)) {
                setStudents(data);
                calculateStats(data);
            }
        } catch (error) {
            console.error("Failed to fetch student data", error);
        }
    };

    const calculateStats = (data) => {
        const byYear = {};
        const byBranch = {};
        const bySection = {};
        const today = new Date().toDateString();
        let loggedInToday = 0;

        if (Array.isArray(data)) {
            data.forEach(student => {
                const year = student.year || 'Unknown';
                byYear[year] = (byYear[year] || 0) + 1;

                const branch = student.branch || 'Unknown';
                byBranch[branch] = (byBranch[branch] || 0) + 1;

                const section = student.section || 'Unknown';
                bySection[section] = (bySection[section] || 0) + 1;

                if (student.lastLogin && new Date(student.lastLogin).toDateString() === today) {
                    loggedInToday++;
                }
            });
        }

        setStats({
            total: Array.isArray(data) ? data.length : 0,
            byYear,
            byBranch,
            bySection,
            loggedInToday
        });
    };

    const getYearColor = (year) => {
        const colors = { '1': '#3b82f6', '2': '#10b981', '3': '#f59e0b', '4': '#ef4444' };
        return colors[year] || '#94a3b8';
    };

    const getBranchColor = (branch) => {
        const colors = { 'CSE': '#6366f1', 'ECE': '#8b5cf6', 'EEE': '#ec4899', 'MECH': '#f97316', 'CIVIL': '#14b8a6', 'IT': '#3b82f6', 'AIML': '#a855f7' };
        return colors[branch] || '#94a3b8';
    };

    return (
        <div className="animate-fade-in">
            <header className="admin-page-header">
                <div className="admin-page-title">
                    <h1>STUDENT <span>ANALYTICS</span></h1>
                    <p>Student demographics and engagement metrics</p>
                </div>
            </header>

            {/* Strategic Metrics Overview */}
            <div className="admin-stats-grid" style={{ marginBottom: '3rem' }}>
                <div className="admin-summary-card" style={{ background: 'var(--admin-primary)', color: 'white' }}>
                    <div className="value" style={{ color: 'white' }}>{stats.total}</div>
                    <div className="label" style={{ color: 'rgba(255,255,255,0.7)' }}>TOTAL STUDENTS</div>
                </div>
                <div className="admin-summary-card" style={{ background: 'var(--admin-success)', color: 'white' }}>
                    <div className="value" style={{ color: 'white' }}>{stats.loggedInToday}</div>
                    <div className="label" style={{ color: 'rgba(255,255,255,0.7)' }}>ACTIVE TODAY</div>
                </div>
                <div className="admin-summary-card" style={{ background: 'var(--admin-warning)', color: 'white' }}>
                    <div className="value" style={{ color: 'white' }}>{Object.keys(stats.byBranch).length}</div>
                    <div className="label" style={{ color: 'rgba(255,255,255,0.7)' }}>ACTIVE BRANCHES</div>
                </div>
            </div>

            {/* Phase Distribution */}
            <div className="f-node-card" style={{ marginBottom: '3.5rem' }}>
                <div className="f-node-head" style={{ borderBottom: '1px solid var(--admin-border)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                    <h2 className="f-node-title" style={{ fontSize: '1.2rem' }}>YEAR DISTRIBUTION</h2>
                    <span className="admin-badge primary">YEAR-WISE</span>
                </div>

                <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                    {Object.entries(stats.byYear).sort().map(([year, count]) => (
                        <div key={year} className="admin-summary-card" style={{ borderTop: `4px solid ${getYearColor(year)}` }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 950, color: 'var(--admin-text-muted)', marginBottom: '0.75rem' }}>YEAR {year}</div>
                            <div style={{ fontSize: '2rem', fontWeight: 950, color: 'var(--admin-secondary)' }}>{count}</div>
                            <div style={{ marginTop: '1rem', height: '4px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${(count / stats.total) * 100}%`, height: '100%', background: getYearColor(year) }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sector Operations */}
            <div className="f-node-card" style={{ marginBottom: '3.5rem' }}>
                <div className="f-node-head" style={{ borderBottom: '1px solid var(--admin-border)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                    <h2 className="f-node-title" style={{ fontSize: '1.2rem' }}>BRANCH OVERVIEW</h2>
                    <span className="admin-badge accent">BRANCH-WISE</span>
                </div>

                <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {Object.entries(stats.byBranch).map(([branch, count]) => (
                        <div key={branch} className="admin-summary-card" style={{ borderLeft: `5px solid ${getBranchColor(branch)}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 950, color: 'var(--admin-secondary)' }}>{branch} BRANCH</div>
                                <div style={{ fontSize: '0.7rem', fontWeight: 850, color: 'var(--admin-text-muted)' }}>{((count / stats.total) * 100).toFixed(1)}%</div>
                            </div>
                            <div style={{ fontSize: '2.25rem', fontWeight: 950, color: getBranchColor(branch) }}>{count}</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--admin-text-muted)', fontWeight: 850, marginTop: '0.25rem' }}>TOTAL STUDENTS</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sub-Sector Mapping */}
            <div className="f-node-card">
                <div className="f-node-head" style={{ borderBottom: '1px solid var(--admin-border)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                    <h2 className="f-node-title" style={{ fontSize: '1.2rem' }}>SECTION OVERVIEW</h2>
                    <span className="admin-badge primary">SECTION-WISE</span>
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    {Object.entries(stats.bySection).sort().map(([section, count]) => (
                        <div key={section} className="admin-summary-card" style={{
                            display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1rem 2rem', width: 'auto'
                        }}>
                            <div className="summary-icon-box" style={{ background: '#f8fafc', width: '40px', height: '40px' }}>
                                <FaLayerGroup style={{ color: 'var(--admin-primary)' }} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.65rem', fontWeight: 950, color: 'var(--admin-text-muted)' }}>SEC {section}</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 950, color: 'var(--admin-secondary)' }}>{count} <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>STUDENTS</span></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StudentStatistics;
