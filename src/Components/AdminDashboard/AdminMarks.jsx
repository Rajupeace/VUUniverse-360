import React, { useState, useEffect, useCallback } from 'react';
import { FaChartBar, FaTrophy, FaUsers, FaBook, FaFilter } from 'react-icons/fa';
import { apiGet } from '../../utils/apiClient';
import sseClient from '../../utils/sseClient';
import './AdminMarks.css';

const AdminMarks = () => {
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ year: '', section: '', subject: '' });

    const fetchOverview = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.year) params.append('year', filters.year);
            if (filters.section) params.append('section', filters.section);
            if (filters.subject) params.append('subject', filters.subject);

            const data = await apiGet(`/api/admin/marks/overview?${params.toString()}`);
            setOverview(data || { totalStudents: 0, subjectsAnalyzed: [], averagesBySubject: {}, overallAverage: 0 });
        } catch (error) {
            console.error('Error fetching marks overview:', error);
            setOverview({ totalStudents: 0, subjectsAnalyzed: [], averagesBySubject: {}, overallAverage: 0 });
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchOverview();
    }, [fetchOverview]);

    // Real-time Update Listener
    useEffect(() => {
        const unsub = sseClient.onUpdate((ev) => {
            if (ev && ev.resource === 'marks') {
                console.log('📡 Marks Overview Refresh Triggered via SSE');
                fetchOverview();
            }
        });
        return () => unsub();
    }, [fetchOverview]);

    const getGradeColor = (percentage) => {
        if (percentage >= 90) return '#10b981';
        if (percentage >= 80) return '#3b82f6';
        if (percentage >= 70) return '#6366f1';
        if (percentage >= 60) return '#8b5cf6';
        if (percentage >= 50) return '#ec4899';
        if (percentage >= 40) return '#f59e0b';
        return '#ef4444';
    };

    if (loading) {
        return (
            <div className="admin-marks-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading marks overview...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-marks-container animate-fade-in">
            <header className="admin-page-header">
                <div className="admin-page-title">
                    <h1>MARKS & GRADES <span>OVERVIEW</span></h1>
                    <p>Class performance analysis and subject-wise averages</p>
                </div>
            </header>

            <div className="filter-bar">
                <div className="filter-group" style={{ display: 'flex', gap: '1rem', alignItems: 'center', width: '100%' }}>
                    <FaFilter style={{ color: 'var(--admin-text-light)' }} />
                    <select
                        value={filters.year}
                        onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                        className="filter-select"
                    >
                        <option value="">All Years</option>
                        <option value="1">Year 1</option>
                        <option value="2">Year 2</option>
                        <option value="3">Year 3</option>
                        <option value="4">Year 4</option>
                    </select>

                    <select
                        value={filters.section}
                        onChange={(e) => setFilters({ ...filters, section: e.target.value })}
                        className="filter-select"
                    >
                        <option value="">All Sections</option>
                        {['A', 'B', 'C', 'D', 'E', 'F'].map(s => (
                            <option key={s} value={s}>Section {s}</option>
                        ))}
                    </select>

                    <button className="filter-reset" onClick={() => setFilters({ year: '', section: '', subject: '' })} style={{ marginLeft: 'auto' }}>
                        RESET FILTERS
                    </button>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card primary">
                    <div className="stat-icon">
                        <FaUsers />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{overview?.totalStudents || 0}</div>
                        <div className="stat-label">Total Students</div>
                    </div>
                </div>

                <div className="stat-card success">
                    <div className="stat-icon">
                        <FaBook />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{overview?.subjectsAnalyzed?.length || 0}</div>
                        <div className="stat-label">Subjects Analyzed</div>
                    </div>
                </div>

                <div className="stat-card warning">
                    <div className="stat-icon">
                        <FaTrophy />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{overview?.overallAverage || 0}%</div>
                        <div className="stat-label">Class Average</div>
                    </div>
                </div>

                <div className="stat-card accent">
                    <div className="stat-icon">
                        <FaChartBar />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">
                            {overview?.averagesBySubject ? Object.keys(overview.averagesBySubject).length : 0}
                        </div>
                        <div className="stat-label">Active Assessments</div>
                    </div>
                </div>
            </div>

            {/* Subject-wise Performance */}
            <div className="performance-section">
                <h3>SUBJECT-WISE PERFORMANCE</h3>

                {overview && overview.averagesBySubject && Object.keys(overview.averagesBySubject).length > 0 ? (
                    <div className="subject-cards-grid">
                        {Object.entries(overview.averagesBySubject).map(([subject, data]) => (
                            <div key={subject} className="subject-performance-card">
                                <div className="subject-header">
                                    <FaBook />
                                    <h4>{subject}</h4>
                                </div>

                                <div className="percentage-display">
                                    <div
                                        className="percentage-circle"
                                        style={{ borderColor: getGradeColor(data.percentage) }}
                                    >
                                        <span className="percentage-value">{data.percentage}%</span>
                                    </div>
                                </div>

                                <div className="subject-stats">
                                    <div className="subject-stat-item">
                                        <span className="subject-stat-label">Total Scored</span>
                                        <span className="subject-stat-value">{data.totalMarks}</span>
                                    </div>
                                    <div className="subject-stat-item">
                                        <span className="subject-stat-label">Max Marks</span>
                                        <span className="subject-stat-value">{data.maxMarks}</span>
                                    </div>
                                </div>

                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{
                                            width: `${data.percentage}%`,
                                            backgroundColor: getGradeColor(data.percentage)
                                        }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="admin-empty-state">
                        <FaChartBar className="admin-empty-icon" />
                        <h4 className="admin-empty-title">No Data Available</h4>
                        <p className="admin-empty-text">Marks will appear here once faculty enters them</p>
                    </div>
                )}
            </div>

            {/* Info Banner */}
            <div className="info-banner" style={{ marginTop: '2rem' }}>
                <FaTrophy />
                <div>
                    <strong>Assessment Structure:</strong>
                    <span>CLA (5 tests × 20 marks) + Module 1 (4 targets × 10 marks) + Module 2 (4 targets × 10 marks) = 180 marks total per subject</span>
                </div>
            </div>
        </div>
    );
};

export default AdminMarks;
