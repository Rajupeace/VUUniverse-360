import React, { useState, useEffect, useCallback } from 'react';
import {
    FaMapMarkerAlt, FaBook,
    FaChevronRight, FaFlask, FaCalendarAlt,
    FaBolt, FaSync, FaClock
} from 'react-icons/fa';
import { apiGet } from '../../utils/apiClient';
import StudentLabsSchedule from './StudentLabsSchedule';
import './StudentSchedule.css';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Type colours (matches badge + left strip) ─────────────── */
const TYPE_META = {
    Theory: { bg: '#eef2ff', color: '#6366f1', label: 'Theory' },
    Lab: { bg: '#ecfeff', color: '#06b6d4', label: 'Lab' },
    Tutorial: { bg: '#fef9c3', color: '#d97706', label: 'Tutorial' },
    Seminar: { bg: '#faf5ff', color: '#9333ea', label: 'Seminar' },
    Other: { bg: '#f1f5f9', color: '#64748b', label: 'Other' },
};

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEK_DAYS = DAYS_OF_WEEK.filter(d => d !== 'Sunday');

/**
 * Sentinel V5 — Student Schedule
 * Premium timeline layout with type-coded session cards.
 */
const StudentSchedule = ({ studentData, preloadedData, enrolledSubjects = [] }) => {
    studentData = studentData || {};
    const [subView, setSubView] = useState('theory');
    const [schedule, setSchedule] = useState(preloadedData || []);
    const [loading, setLoading] = useState(!preloadedData);
    const [selectedDay, setSelectedDay] = useState(new Date().getDay() || 1);

    const sYear = studentData?.year || 3;
    const sSection = studentData?.section || '13';
    const sBranch = studentData?.branch || 'CSE';

    /* ── Fetch ──────────────────────────────────────────────── */
    const fetchSchedule = useCallback(async () => {
        setLoading(true);
        try {
            const q = new URLSearchParams({
                year: Number(sYear) || 3,
                section: String(sSection),
                branch: sBranch,
            });
            console.log('[StudentSchedule] GET /api/schedule?' + q.toString());
            const res = await apiGet(`/api/schedule?${q.toString()}`);
            console.log('[StudentSchedule] fetched', Array.isArray(res) ? res.length : 0, 'sessions');
            setSchedule(Array.isArray(res) ? res : []);
        } catch (err) {
            console.error('Schedule fetch failed:', err);
            setSchedule([]);
        } finally {
            setLoading(false);
        }
    }, [sYear, sSection, sBranch]);

    useEffect(() => {
        if (preloadedData?.length > 0) {
            setSchedule(preloadedData);
            setLoading(false);
        } else {
            fetchSchedule();
        }
    }, [fetchSchedule, preloadedData]);

    /* ── Helpers ────────────────────────────────────────────── */
    const isClassOngoing = (timeRange) => {
        if (!timeRange?.includes(' - ')) return false;
        try {
            const [startStr, endStr] = timeRange.split(' - ');
            const now = new Date();
            const start = new Date();
            const end = new Date();
            const [sH, sM] = startStr.split(':');
            const [eH, eM] = endStr.split(':');
            start.setHours(+sH, +sM, 0);
            end.setHours(+eH, +eM, 0);
            return now >= start && now <= end;
        } catch { return false; }
    };

    const sessionsForDay = (dayName) =>
        schedule.filter(s => s.day === dayName).sort((a, b) => a.time.localeCompare(b.time));

    const todayClasses = sessionsForDay(DAYS_OF_WEEK[selectedDay]);

    /* ── Render ─────────────────────────────────────────────── */
    return (
        <div className="v5-schedule-shell">

            {/* ── Header ─────────────────────────────────────── */}
            <header className="v5-schedule-header">
                <div>
                    <h2 className="v5-title">MISSION <span>TIMELINE</span></h2>
                    <p className="v5-subtitle">
                        Year {studentData?.year} • Section {studentData?.section} • {studentData?.branch}
                        {schedule.length > 0 && (
                            <span style={{ background: '#eef2ff', color: '#6366f1', padding: '1px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 900 }}>
                                {schedule.length} sessions
                            </span>
                        )}
                        {!loading && schedule.length === 0 && (
                            <span style={{ background: '#fef2f2', color: '#dc2626', padding: '1px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 900 }}>
                                No data — refresh
                            </span>
                        )}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <button
                        onClick={fetchSchedule}
                        disabled={loading}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            background: '#eef2ff', color: '#6366f1', border: '1.5px solid #6366f1',
                            borderRadius: 10, padding: '0.48rem 0.9rem',
                            fontWeight: 900, fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'inherit'
                        }}
                    >
                        <FaSync style={{ animation: loading ? 'ss-spin 0.85s linear infinite' : 'none' }} />
                        {loading ? 'SYNCING' : 'REFRESH'}
                    </button>
                    <div className="v5-view-pills">
                        <button className={`v5-pill ${subView === 'theory' ? 'active theory' : ''}`} onClick={() => setSubView('theory')}>
                            <FaBook /> THEORY
                        </button>
                        <button className={`v5-pill ${subView === 'labs' ? 'active labs' : ''}`} onClick={() => setSubView('labs')}>
                            <FaFlask /> LABS
                        </button>
                    </div>
                </div>
            </header>

            {/* ── Body ───────────────────────────────────────── */}
            <main className="v5-schedule-main">
                {subView === 'theory' ? (
                    <div className="v5-theory-layout">

                        {/* Day nav strip */}
                        <nav className="v5-day-nav">
                            {WEEK_DAYS.map(day => {
                                const idx = DAYS_OF_WEEK.indexOf(day);
                                const sessions = sessionsForDay(day);
                                const isSelected = selectedDay === idx;
                                const isToday = new Date().getDay() === idx;
                                return (
                                    <motion.button
                                        key={day}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setSelectedDay(idx)}
                                        className={`v5-day-btn ${isSelected ? 'active' : ''} ${isToday ? 'today' : ''}`}
                                        title={day}
                                    >
                                        <span className="day-name">{day.substring(0, 3)}</span>
                                        {sessions.length > 0 && (
                                            <span className="day-count">{sessions.length}</span>
                                        )}
                                        <div className="day-dot" />
                                    </motion.button>
                                );
                            })}
                        </nav>

                        {/* Sessions timeline */}
                        <div className="v5-timeline-area">
                            {loading ? (
                                <div className="v5-loading-state">
                                    <div className="v5-spinner" />
                                    Loading schedule…
                                </div>
                            ) : (
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={selectedDay}
                                        initial={{ opacity: 0, x: 24 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -18 }}
                                        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                                        className="v5-class-list"
                                    >
                                        {/* Day heading */}
                                        <div className="v5-day-heading">
                                            <span className="v5-day-heading-text">{DAYS_OF_WEEK[selectedDay]}</span>
                                            {todayClasses.length > 0 && (
                                                <span className="v5-day-heading-count">{todayClasses.length} sessions</span>
                                            )}
                                        </div>

                                        {todayClasses.length > 0 ? (() => {
                                            const elements = [];
                                            let prevEndTime = null;

                                            todayClasses.forEach((item, i) => {
                                                const ongoing = isClassOngoing(item.time);
                                                const tm = TYPE_META[item.type] || TYPE_META.Theory;
                                                const isMulti = (item.duration || 50) >= 100;
                                                const startMin = item.time ? parseInt(item.time.split(':')[0]) * 60 + parseInt(item.time.split(':')[1]) : 0;

                                                // Insert SHORT BREAK divider if gap crosses 09:55
                                                if (prevEndTime !== null && prevEndTime <= 595 && startMin >= 610) {
                                                    elements.push(
                                                        <div key="break-morning" className="v5-break-divider">
                                                            <span className="v5-break-icon">☕</span>
                                                            <span>SHORT BREAK · 09:55 – 10:10</span>
                                                        </div>
                                                    );
                                                }
                                                // Insert LUNCH BREAK divider if gap crosses 12:40
                                                if (prevEndTime !== null && prevEndTime <= 760 && startMin >= 820) {
                                                    elements.push(
                                                        <div key="break-lunch" className="v5-break-divider lunch">
                                                            <span className="v5-break-icon">🍽</span>
                                                            <span>LUNCH BREAK · 12:40 – 13:40</span>
                                                        </div>
                                                    );
                                                }

                                                // Compute end time in minutes for next comparison
                                                if (item.time?.includes(' - ')) {
                                                    const [, endStr] = item.time.split(' - ');
                                                    const [eh, em] = endStr.trim().split(':').map(Number);
                                                    prevEndTime = eh * 60 + em;
                                                }

                                                elements.push(
                                                    <motion.div
                                                        key={i}
                                                        className={`v5-schedule-card ${ongoing ? 'ongoing' : ''} ${isMulti ? 'multi-hour' : ''}`}
                                                        data-type={item.type || 'Theory'}
                                                        initial={{ opacity: 0, y: 14 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.06 }}
                                                        style={{ minHeight: isMulti ? 140 : 90 }}
                                                    >
                                                        {/* Time column */}
                                                        <div className="v5-card-time">
                                                            <span className="time-val">{item.time.split(' - ')[0]}</span>
                                                            <span className="time-sep">– {item.time.split(' - ')[1]}</span>
                                                            {isMulti && (
                                                                <span style={{ fontSize: '0.52rem', fontWeight: 900, color: '#6366f1', background: '#eef2ff', padding: '1px 6px', borderRadius: 4, marginTop: 4 }}>
                                                                    {item.duration}min
                                                                </span>
                                                            )}
                                                            {ongoing && (
                                                                <div className="live-tag"><FaBolt /> LIVE</div>
                                                            )}
                                                        </div>

                                                        {/* Content column */}
                                                        <div className="v5-card-content">
                                                            <div className="v5-card-top">
                                                                <span className="v5-badge-type" style={{ background: tm.bg, color: tm.color }}>
                                                                    {item.type || 'Theory'}
                                                                </span>
                                                                {item.courseCode && (
                                                                    <span className="v5-badge-type" style={{ background: '#f1f5f9', color: '#64748b' }}>
                                                                        {item.courseCode}
                                                                    </span>
                                                                )}
                                                                <span className="v5-badge-room">
                                                                    <FaMapMarkerAlt size={9} /> {item.room}
                                                                </span>
                                                            </div>
                                                            <h3 className="v5-subject-title" style={{ fontSize: isMulti ? '1.15rem' : '1rem' }}>
                                                                {item.subject}
                                                            </h3>
                                                            <div className="v5-faculty-row">
                                                                <div className="v5-avatar-mini">{(item.faculty || 'F')[0].toUpperCase()}</div>
                                                                <span>{item.faculty}</span>
                                                            </div>
                                                        </div>

                                                        <div className="v5-card-actions">
                                                            <button className="v5-btn-action"><FaChevronRight /></button>
                                                        </div>
                                                    </motion.div>
                                                );
                                            });
                                            return elements;
                                        })() : (
                                            <div className="v5-empty-state">
                                                <div className="v5-empty-icon"><FaCalendarAlt /></div>
                                                <h3>No Classes</h3>
                                                <p>No sessions scheduled for {DAYS_OF_WEEK[selectedDay]}.</p>

                                                {/* Upcoming peek */}
                                                {schedule.length > 0 && (
                                                    <div style={{ marginTop: '1.5rem', width: '100%', maxWidth: 380 }}>
                                                        <p style={{ fontSize: '0.65rem', fontWeight: 900, color: '#94a3b8', letterSpacing: '1px', marginBottom: '0.65rem', textAlign: 'left' }}>
                                                            UPCOMING THIS WEEK:
                                                        </p>
                                                        {WEEK_DAYS
                                                            .filter(d => d !== DAYS_OF_WEEK[selectedDay])
                                                            .flatMap(d => sessionsForDay(d).slice(0, 1).map(s => ({ ...s, _day: d })))
                                                            .slice(0, 5)
                                                            .map((s, i) => {
                                                                const tm2 = TYPE_META[s.type] || TYPE_META.Theory;
                                                                return (
                                                                    <div key={i} className="v5-upcoming-card">
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                            <div style={{ width: 36, height: 36, borderRadius: 10, background: tm2.bg, color: tm2.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem', flexShrink: 0 }}>
                                                                                <FaBook />
                                                                            </div>
                                                                            <div>
                                                                                <div style={{ fontWeight: 900, fontSize: '0.82rem', color: '#1e293b' }}>{s.subject}</div>
                                                                                <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                                    <FaClock size={9} /> {s._day} · {s.time.split(' - ')[0]}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <span style={{ fontSize: '0.58rem', fontWeight: 900, color: tm2.color, background: tm2.bg, padding: '2px 8px', borderRadius: 6 }}>
                                                                            {s.type}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })
                                                        }
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            )}
                        </div>
                    </div>
                ) : (
                    <StudentLabsSchedule studentData={studentData} enrolledSubjects={enrolledSubjects} />
                )}
            </main>
        </div>
    );
};

export default StudentSchedule;
