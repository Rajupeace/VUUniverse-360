import React, { useState, useEffect, useCallback } from 'react';
import { apiGet } from '../../utils/apiClient';
import { FaSearch, FaUserCheck, FaUserTimes, FaChartPie, FaUsers } from 'react-icons/fa';
import sseClient from '../../utils/sseClient';

/**
 * SENTINEL ATTENDANCE TELEMETRY
 * Strategic monitoring of personnel presence across academic sectors.
 */
const AdminAttendancePanel = () => {
    const [filters, setFilters] = useState({
        year: '1',
        branch: 'CSE',
        section: 'A',
        subject: '',
        date: new Date().toISOString().split('T')[0]
    });

    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ total: 0, present: 0 });
    const [classStudents, setClassStudents] = useState([]);

    const fetchAttendance = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(filters);
            for (const [key, value] of Object.entries(filters)) {
                if (!value) params.delete(key);
            }

            const data = await apiGet(`/api/attendance/all?${params.toString()}`);

            if (Array.isArray(data)) {
                setAttendanceData(data);
                let total = 0;
                let present = 0;
                data.forEach(record => {
                    const recs = record.records || [];
                    total += recs.length;
                    present += recs.filter(r => r.status === 'Present').length;
                });
                setStats({ total, present });
            } else {
                setAttendanceData([]);
                setStats({ total: 0, present: 0 });
            }

        } catch (error) {
            console.error("Attendance fetch error", error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    // Real-time Update Listener
    useEffect(() => {
        const unsub = sseClient.onUpdate((ev) => {
            if (ev && ev.resource === 'attendance') {
                console.log('📡 Attendance Refresh Triggered via SSE');
                fetchAttendance();
            }
        });
        return () => unsub();
    }, [fetchAttendance]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const getPercentage = () => {
        if (stats.total === 0) return 0;
        return Math.round((stats.present / stats.total) * 100);
    };

    return (
        <div className="animate-fade-in">
            <header className="admin-page-header">
                <div className="admin-page-title">
                    <h1>ATTENDANCE <span>INSIGHTS</span></h1>
                    <p>Real-time attendance and presence monitoring</p>
                </div>
            </header>

            {/* Strategic Filters */}
            <div className="admin-card mb-lg">
                <div className="admin-filter-bar">
                    <div className="admin-search-wrapper" style={{ minWidth: 'auto', flex: 1 }}>
                        <label className="admin-detail-label block-label">ACADEMIC YEAR</label>
                        <select
                            className="admin-filter-select full-width"
                            value={filters.year}
                            onChange={e => handleFilterChange('year', e.target.value)}
                        >
                            <option value="">All Years</option>
                            {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                        </select>
                    </div>

                    <div className="admin-search-wrapper" style={{ minWidth: 'auto', flex: 1 }}>
                        <label className="admin-detail-label block-label">BRANCH</label>
                        <select
                            className="admin-filter-select full-width"
                            value={filters.branch}
                            onChange={e => handleFilterChange('branch', e.target.value)}
                        >
                            <option value="">All Branches</option>
                            {['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIML'].map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>

                    <div className="admin-search-wrapper" style={{ minWidth: 'auto', flex: 1 }}>
                        <label className="admin-detail-label block-label">SECTION</label>
                        <select
                            className="admin-filter-select full-width"
                            value={filters.section}
                            onChange={e => handleFilterChange('section', e.target.value)}
                        >
                            <option value="">All Sections</option>
                            {(() => {
                                const alphaSections = Array.from({ length: 16 }, (_, i) => String.fromCharCode(65 + i)); // A-P
                                const numSections = Array.from({ length: 20 }, (_, i) => String(i + 1)); // 1-20
                                const SECTION_OPTIONS = [...alphaSections, ...numSections];
                                return SECTION_OPTIONS.map(s => <option key={s} value={s}>Section {s}</option>);
                            })()}
                        </select>
                    </div>

                    <div className="admin-search-wrapper" style={{ minWidth: 'auto', flex: 1 }}>
                        <label className="admin-detail-label block-label">DATE</label>
                        <input
                            type="date"
                            className="admin-filter-select full-width"
                            value={filters.date}
                            onChange={e => handleFilterChange('date', e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                        <button onClick={fetchAttendance} className="admin-btn admin-btn-primary" style={{ height: '48px' }}>
                            <FaSearch size={14} /> LOAD DATA
                        </button>
                        <button onClick={async () => {
                            try {
                                const resp = await apiGet(`/api/admin/class-attendance/${filters.year}/${filters.section}/${filters.branch}`);
                                setClassStudents(Array.isArray(resp.students) ? resp.students : resp.students || []);
                            } catch (e) {
                                console.error('Failed to fetch class attendance', e);
                            }
                        }} className="admin-btn admin-btn-outline" style={{ height: '48px' }}>
                            <FaUsers size={14} /> CLASS REPORT
                        </button>
                    </div>
                </div>
            </div>

            {/* Real-time Stats */}
            <div className="admin-stats-grid mb-lg">
                <div className="admin-summary-card">
                    <div className="summary-icon-box" style={{ background: '#dcfce7', color: 'var(--admin-success)' }}><FaUserCheck /></div>
                    <div className="value">{stats.present}</div>
                    <div className="label">PRESENT</div>
                </div>
                <div className="admin-summary-card">
                    <div className="summary-icon-box" style={{ background: '#fee2e2', color: 'var(--admin-danger)' }}><FaUserTimes /></div>
                    <div className="value">{stats.total - stats.present}</div>
                    <div className="label">ABSENT</div>
                </div>
                <div className="admin-summary-card">
                    <div className="summary-icon-box" style={{ background: '#eff6ff', color: 'var(--admin-primary)' }}><FaChartPie /></div>
                    <div className="value">{getPercentage()}%</div>
                    <div className="label">ATTENDANCE RATE</div>
                </div>
                <div className="admin-summary-card">
                    <div className="summary-icon-box" style={{ background: '#f8fafc', color: 'var(--admin-text-muted)' }}><FaUsers /></div>
                    <div className="value">{stats.total}</div>
                    <div className="label">TOTAL STUDENTS</div>
                </div>
            </div>

            {/* Attendance Record Grid */}
            <div className="admin-card">
                <div className="admin-table-wrap">
                    <table className="admin-grid-table">
                        <thead>
                            <tr>
                                <th>DATE</th>
                                <th>SUBJECT</th>
                                <th>CLASS INFO</th>
                                <th>FACULTY</th>
                                <th>STATUS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendanceData.map((record) => {
                                const recs = record.records || [];
                                const p = recs.filter(r => r.status === 'Present').length;
                                const t = recs.length;
                                return (
                                    <tr key={record._id || record.id}>
                                        <td>
                                            <div style={{ fontWeight: 950, color: 'var(--admin-secondary)' }}>
                                                {new Date(record.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td><span className="admin-badge primary">{record.subject}</span></td>
                                        <td>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 850 }}>
                                                {record.branch} | YEAR {record.year} | SEC {record.section}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '6px',
                                                    background: '#f1f5f9',
                                                    overflow: 'hidden',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.6rem',
                                                    fontWeight: 900,
                                                    color: '#64748b'
                                                }}>
                                                    {(() => {
                                                        const pic = record.facultyImage;
                                                        if (pic) {
                                                            return (
                                                                <img
                                                                    src={(pic.includes('dicebear') || pic.startsWith('data:') || pic.startsWith('http'))
                                                                        ? pic
                                                                        : `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${pic.startsWith('/') ? '' : '/'}${pic}`}
                                                                    alt="F"
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                        e.target.nextSibling.style.display = 'block';
                                                                    }}
                                                                />
                                                            );
                                                        }
                                                        return record.facultyName?.charAt(0) || 'F';
                                                    })()}
                                                    <div style={{ display: 'none' }}>{record.facultyName?.charAt(0) || 'F'}</div>
                                                </div>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 850, color: 'var(--admin-text-muted)' }}>
                                                    {record.facultyName || record.facultyId || 'Unassigned'}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                <div style={{
                                                    width: '40px', height: '4px', background: 'var(--admin-border)', borderRadius: '2px', overflow: 'hidden'
                                                }}>
                                                    <div style={{
                                                        width: `${t > 0 ? (p / t) * 100 : 0}%`, height: '100%', background: (p / t > 0.75) ? 'var(--admin-success)' : 'var(--admin-warning)'
                                                    }}></div>
                                                </div>
                                                <span style={{ fontWeight: 950, color: (p / t > 0.75) ? 'var(--admin-success)' : 'var(--admin-warning)' }}>{p} / {t}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <button className="admin-btn admin-btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.65rem' }}>
                                                VIEW DETAILS
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {attendanceData.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '6rem' }}>
                                        <div className="f-empty-text">
                                            {loading ? 'LOADING DATA...' : 'NO RECORDS FOUND FOR THIS SELECTION.'}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Per-student attendance view (if loaded) */}
            {classStudents.length > 0 && (
                <div className="admin-card" style={{ marginTop: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 1rem 0' }}>Class Attendance — Student Overview</h3>
                    <div className="admin-table-wrap">
                        <table className="admin-grid-table">
                            <thead>
                                <tr>
                                    <th>STUDENT ID</th>
                                    <th>NAME</th>
                                    <th>TOTAL CLASSES</th>
                                    <th>PRESENT</th>
                                    <th>OVERALL %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {classStudents.map(s => (
                                    <tr key={s.sid}>
                                        <td>{s.sid}</td>
                                        <td>{s.name}</td>
                                        <td>{s.totalClasses}</td>
                                        <td>{s.totalPresent}</td>
                                        <td>{s.overallPercentage}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAttendancePanel;
