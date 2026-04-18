import React, { useState, useEffect } from 'react';
import { apiGet } from '../../utils/apiClient';
import { FaUserClock, FaChartLine, FaTrophy, FaCalendarAlt, FaStar, FaLevelUpAlt, FaFire } from 'react-icons/fa';
import './StudentAttendanceView.css';

/**
 * ACADEMIC ANALYTICS (Attendance & Performance)
 * A premium, data-driven visualization for academic tracking.
 */
const StudentAttendanceView = ({ studentId }) => {
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const data = await apiGet(`/api/students/${studentId}/overview`);
                if (data) setOverview(data);
            } catch (error) {
                console.error("Analytics Failed:", error);
            } finally {
                setLoading(false);
            }
        };
        if (studentId) fetchAnalytics();
    }, [studentId]);

    const getReportCards = () => {
        if (!overview) return [];
        const attDetails = overview.attendance?.details || {};
        const acaDetails = overview.academics?.details || {};
        const subjects = new Set([...Object.keys(attDetails), ...Object.keys(acaDetails)]);

        return Array.from(subjects).map(sub => {
            const att = attDetails[sub] || { percentage: 0, present: 0, total: 0 };
            const aca = acaDetails[sub] || { percentage: 0, average: 0 };
            return {
                subject: sub,
                attendance: att,
                academics: aca,
                score: (att.percentage * 0.4 + (aca.percentage || 0) * 0.6).toFixed(1)
            };
        }).sort((a, b) => b.score - a.score);
    };

    if (loading) {
        return (
            <div className="nexus-schedule-loading">
                <div className="nexus-loading-ring"></div>
                <div className="loading-text">LOADING ANALYTICS...</div>
            </div>
        );
    }

    const reportCards = getReportCards();
    // Use real overview values where available; fall back to zeros to avoid showing demo metrics
    const stats = overview?.attendance || { overall: 0, totalPresent: 0, totalClasses: 0 };
    const academics = overview?.academics || { overallPercentage: 0, totalExamsTaken: 0 };

    return (
        <div className="nexus-page-container">
            {/* Header Section */}
            <div className="nexus-page-header">
                <div>
                    <div className="nexus-page-subtitle">
                        <FaChartLine /> Performance Overview
                    </div>
                    <h1 className="nexus-page-title">
                        ACADEMIC <span>INSIGHTS</span>
                    </h1>
                </div>
                <div className="nexus-date-pill">
                    <FaCalendarAlt /> SESSION 2025-26
                </div>
            </div>

            {/* Top Metric Cards */}
            <div className="nexus-analytics-hero">
                {/* Attendance Card */}
                <div className="analytics-card">
                    <div className="card-content">
                        <div className="card-head">
                            <span className="card-label">TOTAL ATTENDANCE</span>
                            <div className="card-icon-box"><FaUserClock /></div>
                        </div>
                        <div className="card-body">
                            <div className="big-value">{stats.overall}%</div>
                            <div className="sub-value">{stats.totalPresent} of {stats.totalClasses} Sessions</div>
                        </div>
                        <div className="card-foot">
                            <div className="nexus-progress-bar"><div style={{ width: `${stats.overall}%` }}></div></div>
                            <span className="status-tag">{stats.overall >= 75 ? 'REGULAR' : stats.overall >= 40 ? 'IRREGULAR' : 'ABSENT'}</span>
                        </div>
                    </div>
                </div>

                {/* Performance Card */}
                <div className="analytics-card">
                    <div className="card-content">
                        <div className="card-head">
                            <span className="card-label">GPA PERFORMANCE</span>
                            <div className="card-icon-box"><FaTrophy /></div>
                        </div>
                        <div className="card-body">
                            <div className="big-value">{academics.overallPercentage}%</div>
                            <div className="sub-value">Ranked Top 5% Globally</div>
                        </div>
                        <div className="card-foot">
                            <div className="nexus-progress-bar perf"><div style={{ width: `${academics.overallPercentage}%` }}></div></div>
                            <span className="status-tag pulse">EXCELLENT</span>
                        </div>
                    </div>
                </div>

                {/* Consistency Card */}
                <div className="analytics-card">
                    <div className="card-content">
                        <div className="card-head">
                            <span className="card-label">LEARNING STREAK</span>
                            <div className="card-icon-box fire"><FaFire /></div>
                        </div>
                        <div className="card-body">
                            <div className="big-value">{overview?.activity?.streak || 0} DAYS</div>
                            <div className="sub-value">{overview?.activity?.streak ? 'Uninterrupted Presence' : 'No recent activity'}</div>
                        </div>
                        <div className="card-foot">
                            <div className="streak-stars">
                                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                            </div>
                            <span className="status-tag gold">ON FIRE</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Per-Day, Per-Hour Attendance Breakdown */}
            {overview?.attendance?.daily && overview.attendance.daily.length > 0 && (
                <div className="attendance-daily-breakdown">
                    <div className="analytics-matrix-header">
                        <h3 className="matrix-title">
                            HOURLY ATTENDANCE DETAILS <div className="matrix-line"></div>
                        </h3>
                    </div>
                    <div className="daily-cards-grid">
                        {overview.attendance.daily.slice(0, 10).map((day, idx) => (
                            <div key={idx} className={`daily-card classification-${day.classification.toLowerCase()}`}>
                                <div className="daily-header">
                                    <div className="daily-date">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                                    <span className={`classification-badge ${day.classification.toLowerCase()}`}>
                                        {day.classification.toUpperCase()}
                                    </span>
                                </div>
                                <div className="daily-summary">
                                    <div className="daily-stat">
                                        <span className="stat-label">Hours</span>
                                        <span className="stat-value">{day.presentHours}/{day.totalHours}</span>
                                    </div>
                                    <div className="daily-stat">
                                        <span className="stat-label">Attendance</span>
                                        <span className="stat-value">{day.percentage}%</span>
                                    </div>
                                </div>
                                <div className="hourly-dots">
                                    {Object.entries(day.hours).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).map(([hour, detail]) => (
                                        <div 
                                            key={hour} 
                                            className={`hour-dot ${detail.status === 'Present' ? 'present' : 'absent'}`}
                                            title={`Hour ${hour}: ${detail.subject} - ${detail.status}`}
                                        >
                                            {hour}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Subject Matrix */}
            <div className="analytics-matrix-header">
                <h3 className="matrix-title">
                    SUBJECT PERFORMANCE <div className="matrix-line"></div>
                </h3>
            </div>

            <div className="nexus-subject-grid">
                {reportCards.map((card, i) => (
                    <div key={i} className="nexus-subject-card">
                        <div className="subject-head">
                            <div className="subject-icon">{(card.subject || '??').substring(0, 2).toUpperCase()}</div>
                            <div className="subject-info">
                                <h4>{card.subject}</h4>
                                <span>OVERALL SCORE: {card.score}</span>
                            </div>
                            <div className="subject-score-badge">{card.attendance.percentage}%</div>
                        </div>

                        <div className="subject-body">
                            <div className="metric-row">
                                <div className="metric-label">ATTENDANCE</div>
                                <div className="metric-bar"><div className="bg-indigo" style={{ width: `${card.attendance.percentage}%` }}></div></div>
                                <div className="metric-val">{card.attendance.present}/{card.attendance.total}</div>
                            </div>
                            <div className="metric-row">
                                <div className="metric-label">ACADEMICS</div>
                                <div className="metric-bar"><div className="bg-purple" style={{ width: `${card.academics.percentage || 0}%` }}></div></div>
                                <div className="metric-val">{card.academics.percentage || 0}%</div>
                            </div>
                        </div>

                        <button className="subject-drilldown">
                            VIEW DETAILS <FaLevelUpAlt className="rotate-90" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentAttendanceView;
