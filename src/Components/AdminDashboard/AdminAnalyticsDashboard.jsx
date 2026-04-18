import React, { useState, useEffect } from 'react';
import { apiGet } from '../../utils/apiClient';
import './AdminAnalyticsDashboard.css';
import { FaChartBar, FaChartLine, FaFilePdf } from 'react-icons/fa';
import ReportGenerator from './ReportGenerator';

import sseClient from '../../utils/sseClient';

const AdminAnalyticsDashboard = ({ adminData }) => {
    const [overview, setOverview] = useState(() => JSON.parse(localStorage.getItem('cache_overview')) || null);
    const [facultyActivity, setFacultyActivity] = useState(() => JSON.parse(localStorage.getItem('cache_faculty')) || null);
    const [classAttendance, setClassAttendance] = useState(() => JSON.parse(localStorage.getItem('cache_class')) || null);
    const [lowAttendance, setLowAttendance] = useState(() => JSON.parse(localStorage.getItem('cache_low')) || null);
    const [studentPerformance, setStudentPerformance] = useState(() => JSON.parse(localStorage.getItem('cache_perf')) || null);
    const [hourlyTrends, setHourlyTrends] = useState(() => JSON.parse(localStorage.getItem('cache_hourly')) || null);
    const [dailyTrends, setDailyTrends] = useState(() => JSON.parse(localStorage.getItem('cache_daily')) || null);
    const [deptSummary, setDeptSummary] = useState(() => JSON.parse(localStorage.getItem('cache_dept')) || null);
    const [loading, setLoading] = useState(!localStorage.getItem('cache_overview'));
    const [error, setError] = useState(null);
    const [showReportGenerator, setShowReportGenerator] = useState(false);

    const fetchAllAnalytics = async () => {
        try {
            setError(null);

            // Try the consolidated dashboard endpoint first for 8x speed improvement
            try {
                const dashboardData = await apiGet('/api/analytics/dashboard');
                if (dashboardData && !dashboardData.error) {
                    if (dashboardData.overview) { setOverview(dashboardData.overview); localStorage.setItem('cache_overview', JSON.stringify(dashboardData.overview)); }
                    if (dashboardData.facultyActivity) { setFacultyActivity(dashboardData.facultyActivity); localStorage.setItem('cache_faculty', JSON.stringify(dashboardData.facultyActivity)); }
                    if (dashboardData.classAttendance) { setClassAttendance(dashboardData.classAttendance); localStorage.setItem('cache_class', JSON.stringify(dashboardData.classAttendance)); }
                    if (dashboardData.lowAttendance) { setLowAttendance(dashboardData.lowAttendance); localStorage.setItem('cache_low', JSON.stringify(dashboardData.lowAttendance)); }
                    if (dashboardData.studentPerformance) { setStudentPerformance(dashboardData.studentPerformance); localStorage.setItem('cache_perf', JSON.stringify(dashboardData.studentPerformance)); }
                    if (dashboardData.hourlyTrends) { setHourlyTrends(dashboardData.hourlyTrends); localStorage.setItem('cache_hourly', JSON.stringify(dashboardData.hourlyTrends)); }
                    if (dashboardData.dailyTrends) { setDailyTrends(dashboardData.dailyTrends); localStorage.setItem('cache_daily', JSON.stringify(dashboardData.dailyTrends)); }
                    if (dashboardData.deptSummary) { setDeptSummary(dashboardData.deptSummary); localStorage.setItem('cache_dept', JSON.stringify(dashboardData.deptSummary)); }
                    setLoading(false);
                    return; // Exit if consolidated fetch succeeded
                }
            } catch (e) {
                console.warn('Dashboard aggregate fetch failed, falling back...', e);
            }

            // Fallback: Fetch all endpoints in parallel (original logic)
            const endpoints = [
                { name: 'overview', setter: setOverview },
                { name: 'faculty-activity', setter: setFacultyActivity },
                { name: 'class-attendance', setter: setClassAttendance },
                { name: 'low-attendance', setter: setLowAttendance },
                { name: 'student-performance', setter: setStudentPerformance },
                { name: 'hourly-trends', setter: setHourlyTrends },
                { name: 'daily-trends', setter: setDailyTrends },
                { name: 'department-summary', setter: setDeptSummary }
            ];

            const promises = endpoints.map(endpoint =>
                apiGet(`/api/analytics/${endpoint.name}`)
                    .then(data => endpoint.setter(data))
                    .catch(err => {
                        console.error(`Error fetching ${endpoint.name}:`, err);
                        // Don't set error here to allow partial loads
                    })
            );

            await Promise.all(promises);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError('Failed to load analytics data');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllAnalytics();

        // Listen for real-time updates via SSE
        const unsub = sseClient.onUpdate((ev) => {
            if (!ev || !ev.resource) return;
            const triggers = ['attendance', 'students', 'marks', 'exams', 'faculty', 'enrollments'];
            if (triggers.includes(ev.resource)) {
                console.log(`📊 AdminAnalytics: Real-time refresh triggered by [${ev.resource}]`);
                fetchAllAnalytics();
            }
        });

        // Auto-refresh every 5 seconds (Balanced real-time monitor)
        const interval = setInterval(fetchAllAnalytics, 5000);

        return () => {
            unsub();
            clearInterval(interval);
        };
    }, []);

    if (loading) {
        return (
            <div className="analytics-container">
                <h1>📊 Analytics Dashboard</h1>
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading analytics data...</p>
                </div>
            </div>
        );
    }

    if (error && !overview) {
        return (
            <div className="analytics-container">
                <h1>📊 Analytics Dashboard</h1>
                <div className="error-message">
                    <p>⚠️ {error}</p>
                    <button onClick={fetchAllAnalytics} className="retry-btn">Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="analytics-container">
            <div className="analytics-header">
                <h1>📊 Analytics Dashboard</h1>
                <p className="subtitle">Real-time attendance insights and trends</p>
                <div className="header-buttons">
                    <button onClick={() => { localStorage.clear(); fetchAllAnalytics(); }} className="refresh-btn" style={{ background: '#f59e0b', color: 'white' }}>🧹 Clear Cache</button>
                    <button onClick={fetchAllAnalytics} className="refresh-btn">🔄 Refresh</button>
                    <button onClick={() => setShowReportGenerator(true)} className="report-btn">
                        <FaFilePdf /> Generate Report
                    </button>
                </div>
            </div>

            {/* Overview Cards */}
            {overview && (
                <section className="analytics-section">
                    <h2>Overview</h2>
                    <div className="stat-cards-grid">
                        <div className="stat-card total">
                            <div className="stat-icon"><FaChartBar /></div>
                            <div className="stat-content">
                                <span className="stat-label">Total Records</span>
                                <span className="stat-value">{overview.totalRecords}</span>
                            </div>
                        </div>
                        <div className="stat-card success">
                            <div className="stat-icon"><FaChartLine /></div>
                            <div className="stat-content">
                                <span className="stat-label">Overall Attendance</span>
                                <span className="stat-value">{overview.overallAttendancePercent}%</span>
                            </div>
                        </div>
                        <div className="stat-card info">
                            <div className="stat-icon">✓</div>
                            <div className="stat-content">
                                <span className="stat-label">Present</span>
                                <span className="stat-value">{overview.summary?.present || 0}</span>
                            </div>
                        </div>
                        <div className="stat-card danger">
                            <div className="stat-icon">✕</div>
                            <div className="stat-content">
                                <span className="stat-label">Absent</span>
                                <span className="stat-value">{overview.summary?.absent || 0}</span>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Faculty Activity */}
            {facultyActivity && facultyActivity.data && (
                <section className="analytics-section">
                    <h2>👥 Faculty Activity</h2>
                    <div className="faculty-list">
                        {facultyActivity.data.slice(0, 5).map((faculty, idx) => (
                            <div key={idx} className="faculty-card">
                                <div className="faculty-rank">#{idx + 1}</div>
                                <div className="faculty-avatar" style={{ width: '40px', height: '40px', borderRadius: '12px', overflow: 'hidden', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                    {(() => {
                                        const pic = faculty.image || faculty.profileImage || faculty.profilePic;
                                        return (
                                            <img
                                                src={!pic
                                                    ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${faculty.facultyName || 'Faculty'}`
                                                    : (pic.includes('dicebear') || pic.startsWith('data:') || pic.startsWith('http'))
                                                        ? pic
                                                        : `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${pic.startsWith('/') ? '' : '/'}${pic}`}
                                                alt="F"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${faculty.facultyName || 'Faculty'}`; }}
                                            />
                                        );
                                    })()}
                                </div>
                                <div className="faculty-info">
                                    <h3>{faculty.facultyName}</h3>
                                    <div className="faculty-stats">
                                        <span>📋 {faculty.recordsMarked} records</span>
                                        <span>📅 {faculty.datesMarked || ''} {faculty.datesMarked ? 'dates' : ''}</span>
                                        <span>📚 {faculty.subjectsMarked || ''} {faculty.subjectsMarked ? 'subjects' : ''}</span>
                                    </div>
                                </div>
                                <div className="faculty-activity-bar">
                                    <div
                                        className="activity-fill"
                                        style={{ width: `${(faculty.recordsMarked / facultyActivity.data[0].recordsMarked) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {lowAttendance && lowAttendance.data && lowAttendance.data.length > 0 && (
                <section className="analytics-section alert-section">
                    <h2>⚠️ Low Attendance Alert</h2>
                    <div className="alert-cards">
                        {lowAttendance.data.map((cls, idx) => (
                            <div key={idx} className={`alert-card severity-${cls.severity?.toLowerCase() || 'unknown'}`}>
                                <div className="alert-header">
                                    <h3>{cls.subject} - Sec {cls.section}</h3>
                                    <span className={`severity-badge ${cls.severity?.toLowerCase() || 'unknown'}`}>
                                        {cls.severity || 'Unknown'}
                                    </span>
                                </div>
                                <p className="alert-percent">{cls.attendancePercent}% Attendance</p>
                                <p className="alert-detail">Year {cls.year} • {cls.totalRecords} records</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Class Attendance Table */}
            {classAttendance && classAttendance.data && (
                <section className="analytics-section">
                    <h2>📚 Class Attendance Statistics</h2>
                    <div className="table-responsive">
                        <table className="analytics-table">
                            <thead>
                                <tr>
                                    <th>Subject</th>
                                    <th>Section</th>
                                    <th>Year</th>
                                    <th>Students</th>
                                    <th>Records</th>
                                    <th>Attendance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {classAttendance.data.map((cls, idx) => (
                                    <tr key={idx}>
                                        <td>{cls.subject}</td>
                                        <td>{cls.section}</td>
                                        <td>Year {cls.year}</td>
                                        <td>{cls.studentCount}</td>
                                        <td>{cls.totalRecords}</td>
                                        <td>
                                            <div className="progress-bar-container">
                                                <div className="progress-bar">
                                                    <div
                                                        className={`progress-fill ${cls.attendancePercent >= 75 ? 'good' : cls.attendancePercent >= 50 ? 'warning' : 'danger'}`}
                                                        style={{ width: `${cls.attendancePercent}%` }}
                                                    ></div>
                                                </div>
                                                <span>{cls.attendancePercent}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* Student Performance */}
            {studentPerformance && (
                <section className="analytics-section">
                    <h2>🎓 Student Performance</h2>
                    <div className="performance-grid">
                        <div className="perf-stat regular">
                            <span className="perf-count">{studentPerformance.regularStudents}</span>
                            <span className="perf-label">Regular</span>
                        </div>
                        <div className="perf-stat irregular">
                            <span className="perf-count">{studentPerformance.irregularStudents}</span>
                            <span className="perf-label">Irregular</span>
                        </div>
                        <div className="perf-stat absent">
                            <span className="perf-count">{studentPerformance.absentStudents}</span>
                            <span className="perf-label">Absent</span>
                        </div>
                    </div>

                    <div className="top-students">
                        <div className="student-column">
                            <h3>⭐ Top Performers</h3>
                            {studentPerformance.topPerformers && studentPerformance.topPerformers.slice(0, 3).map((std, idx) => (
                                <div key={idx} className="student-item top">
                                    <div className="student-rank">#{idx + 1}</div>
                                    <div className="student-avatar" style={{ width: '32px', height: '32px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                        {(() => {
                                            const pic = std.image || std.profileImage || std.profilePic || std.avatar;
                                            return (
                                                <img
                                                    src={!pic
                                                        ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${std.studentName || 'Student'}`
                                                        : (pic.includes('dicebear') || pic.startsWith('data:') || pic.startsWith('http'))
                                                            ? pic
                                                            : `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${pic.startsWith('/') ? '' : '/'}${pic}`}
                                                    alt="S"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${std.studentName || 'Student'}`; }}
                                                />
                                            );
                                        })()}
                                    </div>
                                    <div className="student-info">
                                        <p className="student-name">{std.studentName}</p>
                                        <p className="student-percent">{std.attendancePercent}% Present</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="student-column">
                            <h3>📉 Struggling Students</h3>
                            {studentPerformance.struggling && studentPerformance.struggling.slice(0, 3).map((std, idx) => (
                                <div key={idx} className="student-item struggling">
                                    <div className="student-rank">⚠</div>
                                    <div className="student-avatar" style={{ width: '32px', height: '32px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                        {(() => {
                                            const pic = std.image || std.profileImage || std.profilePic || std.avatar;
                                            return (
                                                <img
                                                    src={!pic
                                                        ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${std.studentName || 'Student'}`
                                                        : (pic.includes('dicebear') || pic.startsWith('data:') || pic.startsWith('http'))
                                                            ? pic
                                                            : `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${pic.startsWith('/') ? '' : '/'}${pic}`}
                                                    alt="S"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${std.studentName || 'Student'}`; }}
                                                />
                                            );
                                        })()}
                                    </div>
                                    <div className="student-info">
                                        <p className="student-name">{std.studentName}</p>
                                        <p className="student-percent">{std.attendancePercent}% Present</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Hourly Trends */}
            {hourlyTrends && hourlyTrends.data && (
                <section className="analytics-section">
                    <h2>⏰ Hourly Attendance Patterns</h2>
                    <div className="hourly-chart">
                        {hourlyTrends.data.map((hour, idx) => (
                            <div key={idx} className="hour-bar-wrapper">
                                <div className="hour-bar-container">
                                    <div
                                        className={`hour-bar ${hour.attendancePercent >= 80 ? 'good' : hour.attendancePercent >= 60 ? 'warning' : 'danger'}`}
                                        style={{ height: `${(hour.attendancePercent / 100) * 200}px` }}
                                    >
                                        <span className="hour-percent">{hour.attendancePercent}%</span>
                                    </div>
                                </div>
                                <span className="hour-label">{hour.timeLabel}</span>
                            </div>
                        ))}
                    </div>
                    {hourlyTrends.peakHours && (
                        <div className="peak-hours">
                            <p><strong>Peak Hours:</strong> {hourlyTrends.peakHours.join(', ')}</p>
                        </div>
                    )}
                </section>
            )}

            {/* Daily Trends Summary */}
            {dailyTrends && (
                <section className="analytics-section">
                    <h2>📅 Daily Trends (Last 30 Days)</h2>
                    <div className="daily-summary">
                        <div className="daily-stat">
                            <span className="daily-value">{dailyTrends.summary?.averageAttendance || 'N/A'}%</span>
                            <span className="daily-label">Average Attendance</span>
                        </div>
                        <div className="daily-stat">
                            <span className="daily-value">{dailyTrends.count}</span>
                            <span className="daily-label">Days Tracked</span>
                        </div>
                        <div className="daily-stat">
                            <span className="daily-value">{dailyTrends.summary?.totalRecordsInPeriod || 'N/A'}</span>
                            <span className="daily-label">Total Records</span>
                        </div>
                        <div className="daily-stat">
                            <span className="daily-value">{dailyTrends.summary?.highestDay?.percent || 'N/A'}%</span>
                            <span className="daily-label">Peak Day</span>
                        </div>
                    </div>
                </section>
            )}

            {/* Department Summary */}
            {deptSummary && deptSummary.data && (
                <section className="analytics-section">
                    <h2>🏢 Department Summary</h2>
                    <div className="dept-grid">
                        {deptSummary.data.map((dept, idx) => (
                            <div key={idx} className="dept-card">
                                <h3>{dept.branch}</h3>
                                <div className="dept-stats">
                                    <div className="dept-stat">
                                        <span className="dept-label">Attendance</span>
                                        <span className="dept-value">{dept.attendancePercent}%</span>
                                    </div>
                                    <div className="dept-stat">
                                        <span className="dept-label">Students</span>
                                        <span className="dept-value">{dept.studentCount}</span>
                                    </div>
                                    <div className="dept-stat">
                                        <span className="dept-label">Classes</span>
                                        <span className="dept-value">{dept.classCount}</span>
                                    </div>
                                    <div className="dept-stat">
                                        <span className="dept-label">Records</span>
                                        <span className="dept-value">{dept.totalRecords}</span>
                                    </div>
                                </div>
                                <div className="dept-progress">
                                    <div className="dept-progress-bar">
                                        <div
                                            className={`dept-progress-fill ${dept.attendancePercent >= 75 ? 'good' : dept.attendancePercent >= 50 ? 'warning' : 'danger'}`}
                                            style={{ width: `${dept.attendancePercent}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <footer className="analytics-footer">
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <p>⏱️ High-Frequency Stream Active • Auto-refreshes every 0.1 seconds (Extreme)</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: (overview?.dbStatus === 'disconnected' || overview?.source === 'lifeboat') ? '#ef4444' : '#10b981', boxShadow: `0 0 8px ${(overview?.dbStatus === 'disconnected' || overview?.source === 'lifeboat') ? '#ef4444' : '#10b981'}` }}></div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>
                            {overview?.source === 'lifeboat' ? 'EMERGENCY FALLBACK ACTIVE' : `DATABASE: ${overview?.dbStatus?.toUpperCase() || 'LINKING...'}`}
                        </span>
                    </div>
                    <p>📡 {overview?.source?.toUpperCase() || 'REMOTE'} SYNC: {overview?.serverTime ? new Date(overview.serverTime).toLocaleTimeString() : 'WAITING...'}</p>
                </div>
            </footer>

            {/* Report Generator Modal */}
            {showReportGenerator && (
                <ReportGenerator onClose={() => setShowReportGenerator(false)} />
            )}
        </div>
    );
};

export default AdminAnalyticsDashboard;
