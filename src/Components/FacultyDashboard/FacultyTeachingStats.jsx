// src/Components/FacultyDashboard/FacultyTeachingStats.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { apiGet } from '../../utils/apiClient';
import { FaBookOpen, FaUsers, FaThLarge, FaBookmark, FaCalendarAlt, FaCircleNotch } from 'react-icons/fa';
import './FacultyTeachingStats.css';

/**
 * OPERATIONAL DIAGNOSTICS
 * Structural analytics suite for monitoring academic footprint and student segment metrics.
 */
const FacultyTeachingStats = ({ facultyId }) => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        bySubject: [],
        bySection: [],
        totalClasses: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchTeachingStats = useCallback(async () => {
        try {
            const facultyData = await apiGet(`/api/faculty/${facultyId}`);
            const assignments = facultyData.assignments || [];
            const allStudents = await apiGet('/api/students');

            const studentsBySubject = {};
            const studentsBySection = {};
            let totalStudents = new Set();

            assignments.forEach(assignment => {
                const year = String(assignment.year || '').trim();
                const section = String((assignment.section || '')).trim().toUpperCase();
                const subject = assignment.subject || assignment.name || 'Unknown';

                const matchingStudents = allStudents.filter(student =>
                    String(student.year).trim() === year &&
                    String((student.section || '')).trim().toUpperCase() === section
                );

                if (!studentsBySubject[subject]) {
                    studentsBySubject[subject] = { subject, year, section, count: 0 };
                }
                studentsBySubject[subject].count += matchingStudents.length;

                const sectionKey = `Year ${year}-Section ${section}`;
                if (!studentsBySection[sectionKey]) {
                    studentsBySection[sectionKey] = { year, section, count: 0, subjects: [] };
                }
                studentsBySection[sectionKey].count += matchingStudents.length;
                if (!studentsBySection[sectionKey].subjects.includes(subject)) {
                    studentsBySection[sectionKey].subjects.push(subject);
                }
                matchingStudents.forEach(s => totalStudents.add(s.sid));
            });

            setStats({
                totalStudents: totalStudents.size,
                bySubject: Object.values(studentsBySubject),
                bySection: Object.values(studentsBySection),
                totalClasses: assignments.length
            });
        } catch (error) {
            console.error("Failed to fetch diagnostics telemetry", error);
        } finally {
            setLoading(false);
        }
    }, [facultyId]);

    useEffect(() => {
        fetchTeachingStats();
    }, [fetchTeachingStats]);

    if (loading && stats.totalStudents === 0) {
        return (
            <div className="f-center-empty" style={{ padding: '8rem 2rem' }}>
                <FaCircleNotch className="f-spinner" style={{ fontSize: '3rem', color: 'var(--dia-primary)' }} />
                <p style={{ marginTop: '2rem', fontWeight: 900, color: 'var(--dia-slate-700)', letterSpacing: '0.1em' }}>SYNCHRONIZING TELEMETRY...</p>
            </div>
        );
    }

    return (
        <div className="diagnostics-container">
            <header className="f-view-header">
                <div>
                    <h2>OPERATIONAL <span>DIAGNOSTICS</span></h2>
                    <p className="nexus-subtitle">Structural analytics and real-time academic footprint telemetry</p>
                </div>
            </header>

            <div className="f-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                {[
                    { label: 'TOTAL STUDENTS', value: stats.totalStudents, icon: <FaUsers />, color: 'var(--dia-primary)' },
                    { label: 'SUBJECT NODES', value: stats.bySubject.length, icon: <FaBookOpen />, color: 'var(--dia-success)' },
                    { label: 'ACTIVE PIPELINES', value: stats.bySection.length, icon: <FaThLarge />, color: 'var(--dia-warning)' }
                ].map((stat, i) => (
                    <div key={i} className="dia-stat-card" style={{ borderLeft: `6px solid ${stat.color}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div className="com-stat-label">{stat.label}</div>
                                <div className="com-stat-value" style={{ marginTop: '0.5rem' }}>{stat.value}</div>
                            </div>
                            <div className="com-stat-icon-box" style={{ background: stat.color, color: 'white', marginBottom: 0 }}>
                                {stat.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                <div className="dia-node-box">
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 950, marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <FaCalendarAlt style={{ color: 'var(--dia-primary)' }} /> SEGMENT METRICS
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {stats.bySection.map((sec, idx) => (
                            <div key={idx} className="dia-list-item">
                                <div>
                                    <div style={{ fontWeight: 950, fontSize: '1.1rem' }}>SECTION {sec.section}</div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 850, color: '#94a3b8', textTransform: 'uppercase', marginTop: '0.2rem' }}>
                                        YEAR {sec.year} • {sec.subjects.length} SUBJECT NODES
                                    </div>
                                </div>
                                <div style={{ background: 'white', padding: '0.6rem 1.2rem', borderRadius: '12px', fontWeight: 950, fontSize: '0.9rem', color: 'var(--dia-primary)', border: '1px solid var(--dia-slate-100)' }}>
                                    {sec.count} NODES
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="dia-node-box">
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 950, marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <FaBookmark style={{ color: 'var(--dia-success)' }} /> SUBJECT CLUSTERS
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {stats.bySubject.map((sub, idx) => (
                            <div key={idx} className="dia-list-item">
                                <div>
                                    <div style={{ fontWeight: 950, fontSize: '1.1rem' }}>{sub.subject}</div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 850, color: '#94a3b8', textTransform: 'uppercase', marginTop: '0.2rem' }}>
                                        ACTIVE ACADEMIC COMPONENT
                                    </div>
                                </div>
                                <div style={{ background: 'white', padding: '0.6rem 1.2rem', borderRadius: '12px', fontWeight: 950, fontSize: '0.9rem', color: 'var(--dia-success)', border: '1px solid var(--dia-slate-100)' }}>
                                    {sub.count} STUDENTS
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacultyTeachingStats;
