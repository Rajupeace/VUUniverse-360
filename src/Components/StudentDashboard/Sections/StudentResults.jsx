import React, { useState, useEffect, useCallback } from 'react';
import { apiGet } from '../../../utils/apiClient';
import sseClient from '../../../utils/sseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChartBar, FaTrophy, FaClock, FaFileAlt } from 'react-icons/fa';
import './StudentResults.css';

const StudentResults = ({ studentData, preloadedData, enrolledSubjects = [] }) => {
    const [resultsBySubject, setResultsBySubject] = useState(preloadedData || []);
    const [loading, setLoading] = useState(!preloadedData);
    const [overallStats, setOverallStats] = useState({ total: 0, max: 0, percentage: 0, grade: 'A', status: 'Excellent' });

    const calculateStats = (data) => {
        let totalScored = 0;
        let totalMax = 0;
        if (Array.isArray(data)) {
            data.forEach(subject => {
                if (subject && subject.overall) {
                    totalScored += Number(subject.overall.total || 0);
                    totalMax += Number(subject.overall.max || 0);
                }
            });
        }
        const percentage = totalMax > 0 ? (totalScored / totalMax) * 100 : 0;

        let grade = 'F';
        let status = 'Needs Improvement';
        if (percentage >= 90) { grade = 'O'; status = 'Outstanding'; }
        else if (percentage >= 80) { grade = 'A+'; status = 'Excellent'; }
        else if (percentage >= 70) { grade = 'A'; status = 'Very Good'; }
        else if (percentage >= 60) { grade = 'B'; status = 'Good'; }
        else if (percentage >= 50) { grade = 'C'; status = 'Average'; }

        setOverallStats({ total: totalScored, max: totalMax, percentage, grade, status });
    };

    const processData = useCallback((data) => {
        const safeData = Array.isArray(data) ? data : [];

        if (!enrolledSubjects || enrolledSubjects.length === 0) {
            setResultsBySubject(safeData);
            calculateStats(safeData);
            return;
        }

        const processed = enrolledSubjects.map((sub, index) => {
            const match = safeData.find(item => {
                const subName = String(sub.name || '').toLowerCase().trim();
                const itemName = String(item.subject || '').toLowerCase().trim();
                const subCode = String(sub.code || '').toLowerCase().trim();
                const itemCode = String(item.courseCode || '').toLowerCase().trim();
                return (subCode && itemCode && subCode === itemCode) ||
                    (subName && itemName && (subName === itemName || subName.includes(itemName) || itemName.includes(subName)));
            });

            return match || {
                subject: sub.name,
                courseCode: sub.code,
                overall: { total: 0, max: 0, percentage: 0 },
                cla: [],
                module1: [],
                module2: []
            };
        });

        setResultsBySubject(processed);
        calculateStats(processed);
    }, [enrolledSubjects]);

    const fetchResults = useCallback(async (background = false) => {
        if (!studentData?.sid) return;
        try {
            if (!background) setLoading(true);
            const data = await apiGet(`/api/students/${studentData.sid}/marks-by-subject`);
            processData(data);
        } catch (error) {
            console.error('Error fetching results:', error);
            processData([]);
        } finally {
            if (!background) setLoading(false);
        }
    }, [studentData?.sid, processData]);

    useEffect(() => {
        if (preloadedData) {
            processData(preloadedData);
            setLoading(false);
        } else {
            fetchResults();
        }
    }, [preloadedData, fetchResults, processData]);

    useEffect(() => {
        const unsub = sseClient.onUpdate((ev) => {
            if (ev.resource === 'marks') fetchResults(true);
        });
        return unsub;
    }, [fetchResults]);

    if (loading) {
        return (
            <div className="res-loading-container">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="res-spinner" />
                <p>Retrieving Academic Records...</p>
            </div>
        );
    }

    return (
        <div className="res-dashboard-container">
            <div className="res-mesh-bg" />

            <div className="res-header">
                <div className="res-header-left">
                    <div className="res-icon-wrapper"><FaChartBar /></div>
                    <div>
                        <h2>Academic <span>Report</span></h2>
                        <p>Detailed performance breakdown across all modules</p>
                    </div>
                </div>
                <button className="res-btn-refresh" onClick={() => fetchResults()}>
                    Refresh Data
                </button>
            </div>

            <div className="res-stats-overview">
                <motion.div
                    className="glass-panel res-stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="res-stat-details">
                        <h3>Overall Performance</h3>
                        <p className="res-stat-desc">Your aggregate standing in the current semester</p>
                        <div className="res-score-huge">
                            <span className="res-score-val">{overallStats.percentage.toFixed(1)}</span>
                            <span className="res-score-total">%</span>
                        </div>
                        <div className="res-total-marks">
                            Cumulative across {resultsBySubject.length} subjects
                        </div>
                    </div>
                    <div className="res-grade-showcase" style={{ borderColor: 'var(--v-primary)', color: 'var(--v-primary)' }}>
                        <span className="res-grade-letter">{overallStats.grade}</span>
                        <span className="res-grade-label">{overallStats.status}</span>
                    </div>
                </motion.div>

                <div className="glass-panel res-insights-panel">
                    <h3>Performance Insights</h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div className="res-insight-item">
                            <div className="res-insight-icon" style={{ background: '#ecfdf5', color: '#10b981' }}><FaTrophy /></div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Top Performance</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Consistently high in technical modules</div>
                            </div>
                        </div>
                        <div className="res-insight-item">
                            <div className="res-insight-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}><FaClock /></div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Consistency</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>On track for Dean's List inclusion</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="res-subjects-grid">
                <AnimatePresence>
                    {resultsBySubject.map((subject, index) => (
                        <motion.div
                            key={subject.courseCode || subject.subject || `sub-${index}`}
                            className="glass-panel res-subject-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="res-subj-accent" style={{ background: index % 2 === 0 ? 'var(--v-primary)' : 'var(--v-secondary)' }} />
                            <div className="res-subj-header">
                                <div className="res-subj-info">
                                    <h4>{subject.subject}</h4>
                                    <span>{subject.courseCode}</span>
                                </div>
                                <div className="res-subj-grade" style={{ color: subject.overall?.percentage >= 75 ? '#10b981' : '#f59e0b' }}>
                                    {subject.overall?.percentage ? (subject.overall.percentage >= 90 ? 'O' : subject.overall.percentage >= 80 ? 'A+' : subject.overall.percentage >= 70 ? 'A' : 'B') : '—'}
                                </div>
                            </div>

                            <div className="res-subj-body">
                                <div className="res-assess-row">
                                    <div className="res-assess-title"><FaFileAlt /> Assessment Breakdown</div>
                                    <div className="res-marks-wrap">
                                        <div className="res-mark-tag">
                                            <span className="res-mark-label">Agg. Score</span>
                                            <span className="res-mark-val">{subject.overall?.percentage || 0}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="res-subj-footer">
                                <div className="res-subj-total">
                                    <span>Subject Weighted Total</span>
                                    <strong>{subject.overall?.total || 0}<span>/{subject.overall?.max || 100}</span></strong>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default StudentResults;
