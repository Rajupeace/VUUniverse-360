import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    FaClock, FaMapMarkerAlt, FaUsers, FaChalkboardTeacher,
    FaCalendarDay, FaChartBar, FaBolt, FaGraduationCap,
    FaBook, FaFlask, FaLayerGroup, FaSync
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { apiGet } from '../../utils/apiClient';
import './FacultyScheduleView.css';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEK_DAYS = DAYS.filter(d => d !== 'Sunday');

const TYPE_COLOR = {
    Theory: { bg: '#eef2ff', border: '#6366f1', text: '#4338ca' },
    Lab: { bg: '#ecfdf5', border: '#10b981', text: '#065f46' },
    Tutorial: { bg: '#fefce8', border: '#eab308', text: '#854d0e' },
    Seminar: { bg: '#fdf4ff', border: '#a855f7', text: '#6b21a8' },
};

function parseHH(timeRange) {
    if (!timeRange?.includes(' - ')) return null;
    try {
        const [s] = timeRange.split(' - ');
        const [h, m] = s.trim().split(':').map(Number);
        return h * 60 + m;
    } catch { return null; }
}

function isOngoing(timeRange) {
    if (!timeRange?.includes(' - ')) return false;
    try {
        const [startStr, endStr] = timeRange.split(' - ');
        const now = new Date();
        const [sh, sm] = startStr.trim().split(':').map(Number);
        const [eh, em] = endStr.trim().split(':').map(Number);
        const start = new Date(); start.setHours(sh, sm, 0);
        const end = new Date(); end.setHours(eh, em, 0);
        return now >= start && now <= end;
    } catch { return false; }
}

/**
 * Sentinel V5 — Faculty Schedule View (Redesigned)
 * Shows weekly timetable with clear Day / Time / Section / Room layout.
 * Example: SE, Monday 08:15–09:05 | Year 3 • Sec 13 • CSE | N-318
 */
const FacultyScheduleView = ({ facultyData = {}, schedule: scheduleProp = [] }) => {
    const [selDay, setSelDay] = useState(new Date().getDay() || 1);
    const [schedule, setSchedule] = useState(scheduleProp);
    const [loading, setLoading] = useState(false);

    const name = facultyData?.name || facultyData?.facultyName || '';

    /* ── Fetch ──────────────────────────────────────────────── */
    const fetchSchedule = useCallback(async () => {
        if (!name) return;
        setLoading(true);
        try {
            const res = await apiGet(`/api/schedule?faculty=${encodeURIComponent(name.split('/')[0].trim())}`);
            if (Array.isArray(res)) setSchedule(res);
        } catch (e) { console.warn('FacultyScheduleView fetch:', e); }
        finally { setLoading(false); }
    }, [name]);

    useEffect(() => {
        if (scheduleProp?.length > 0) setSchedule(scheduleProp);
        else fetchSchedule();
    }, [scheduleProp, fetchSchedule]);

    /* ── Derived stats ──────────────────────────────────────── */
    const todaySessions = useMemo(() =>
        schedule
            .filter(s => s.day === DAYS[selDay])
            .sort((a, b) => (parseHH(a.time) || 0) - (parseHH(b.time) || 0)),
        [schedule, selDay]
    );

    // Group unique sections this faculty teaches
    const mySections = useMemo(() => {
        const map = new Map();
        schedule.forEach(s => {
            const k = `Y${s.year}S${s.section}${s.branch}`;
            if (!map.has(k)) map.set(k, { year: s.year, section: s.section, branch: s.branch });
        });
        return Array.from(map.values());
    }, [schedule]);

    // Weekly summary — sessions per day
    const weekSummary = useMemo(() =>
        WEEK_DAYS.map(d => ({
            day: d,
            short: d.substring(0, 3),
            count: schedule.filter(s => s.day === d).length,
        })),
        [schedule]
    );

    const typeStats = useMemo(() => ({
        theory: schedule.filter(s => s.type === 'Theory').length,
        lab: schedule.filter(s => s.type === 'Lab').length,
        tutorial: schedule.filter(s => s.type === 'Tutorial').length,
        seminar: schedule.filter(s => s.type === 'Seminar').length,
    }), [schedule]);

    /* ── Render ─────────────────────────────────────────────── */
    return (
        <div className="fsv-shell">

            {/* ── Top header ─────────────────────────────────── */}
            <header className="fsv-header">
                <div className="fsv-header-left">
                    <h2 className="fsv-title">📅  MY SCHEDULE</h2>
                    <p className="fsv-subtitle">{name || 'Faculty'}</p>
                </div>

                <div className="fsv-header-stats">
                    <div className="fsv-hstat"><span className="fsv-hs-num">{schedule.length}</span><span className="fsv-hs-lbl">Total</span></div>
                    <div className="fsv-hstat"><span className="fsv-hs-num" style={{ color: '#6366f1' }}>{typeStats.theory}</span><span className="fsv-hs-lbl">Theory</span></div>
                    <div className="fsv-hstat"><span className="fsv-hs-num" style={{ color: '#10b981' }}>{typeStats.lab}</span><span className="fsv-hs-lbl">Labs</span></div>
                    <div className="fsv-hstat"><span className="fsv-hs-num" style={{ color: '#f59e0b' }}>{typeStats.tutorial}</span><span className="fsv-hs-lbl">Tutorials</span></div>
                    <div className="fsv-hstat"><span className="fsv-hs-num" style={{ color: '#a855f7' }}>{typeStats.seminar}</span><span className="fsv-hs-lbl">Seminars</span></div>
                    <button className="fsv-refresh-btn" onClick={fetchSchedule} title="Refresh">
                        <FaSync className={loading ? 'fa-spin' : ''} />
                    </button>
                </div>
            </header>

            {/* ── My Sections banner ─────────────────────────── */}
            {mySections.length > 0 && (
                <div className="fsv-sections-bar">
                    <span className="fsv-sections-label"><FaUsers size={11} /> My Sections:</span>
                    {mySections.map((s, i) => (
                        <span key={i} className="fsv-section-chip">
                            Y{s.year} · Sec {s.section} · {s.branch}
                        </span>
                    ))}
                </div>
            )}

            {/* ── Weekly overview row ─────────────────────────── */}
            <div className="fsv-week-row">
                {weekSummary.map(({ day, short, count }) => {
                    const idx = DAYS.indexOf(day);
                    const isToday = new Date().getDay() === idx;
                    const isSel = selDay === idx;
                    return (
                        <motion.button
                            key={day}
                            whileTap={{ scale: 0.9 }}
                            className={`fsv-day-pill ${isSel ? 'active' : ''} ${isToday ? 'today' : ''}`}
                            onClick={() => setSelDay(idx)}
                        >
                            <span className="fsv-dp-short">{short}</span>
                            <span className={`fsv-dp-count ${count === 0 ? 'zero' : ''}`}>
                                {count > 0 ? count : '–'}
                            </span>
                            {isToday && <div className="fsv-today-dot" />}
                        </motion.button>
                    );
                })}
            </div>

            {/* ── Day session list ────────────────────────────── */}
            <div className="fsv-session-list-wrap">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selDay}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="fsv-session-list"
                    >
                        {loading ? (
                            <div className="fsv-loading">
                                <div className="fsv-spinner" />
                                <span>Loading schedule…</span>
                            </div>
                        ) : todaySessions.length > 0 ? (
                            todaySessions.map((item, i) => {
                                const live = isOngoing(item.time);
                                const tc = TYPE_COLOR[item.type] || TYPE_COLOR.Theory;
                                return (
                                    <motion.div
                                        key={i}
                                        className={`fsv-session-card ${live ? 'live' : ''}`}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.055 }}
                                        style={{ borderLeft: `4px solid ${tc.border}` }}
                                    >
                                        {/* Period number */}
                                        <div className="fsv-period-num" style={{ background: tc.bg, color: tc.border }}>
                                            P{i + 1}
                                        </div>

                                        {/* Time block */}
                                        <div className="fsv-time-block">
                                            <span className="fsv-time-start">
                                                {item.time?.split(' - ')[0]}
                                            </span>
                                            <span className="fsv-time-divider">→</span>
                                            <span className="fsv-time-end">
                                                {item.time?.split(' - ')[1]}
                                            </span>
                                            {live && (
                                                <span className="fsv-live-tag">
                                                    <FaBolt size={8} /> LIVE
                                                </span>
                                            )}
                                        </div>

                                        {/* Main info */}
                                        <div className="fsv-card-main">
                                            <div className="fsv-card-top-row">
                                                <span className="fsv-type-badge" style={{ background: tc.bg, color: tc.text }}>
                                                    {item.type}
                                                </span>
                                                {item.courseCode && (
                                                    <span className="fsv-code-badge">{item.courseCode}</span>
                                                )}
                                            </div>
                                            <h3 className="fsv-subject">{item.subject}</h3>
                                            {/* Section + Room row */}
                                            <div className="fsv-detail-row">
                                                <span className="fsv-detail-chip">
                                                    <FaGraduationCap size={9} />
                                                    Year {item.year} · Sec {item.section} · {item.branch}
                                                </span>
                                                <span className="fsv-detail-chip">
                                                    <FaMapMarkerAlt size={9} />
                                                    {item.room}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div className="fsv-empty">
                                <FaCalendarDay size={36} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
                                <h3>No Classes on {DAYS[selDay]}</h3>
                                <p>Free day — no sessions scheduled.</p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* ── Sidebar: Weekly metrics ─────────────────── */}
                <aside className="fsv-aside">
                    <div className="fsv-aside-card">
                        <div className="fsv-aside-title"><FaChartBar /> Weekly Overview</div>
                        <div className="fsv-week-bars">
                            {weekSummary.map(({ short, count }) => {
                                const maxCount = Math.max(...weekSummary.map(w => w.count), 1);
                                return (
                                    <div key={short} className="fsv-bar-item">
                                        <div className="fsv-bar-track">
                                            <div
                                                className="fsv-bar-fill"
                                                style={{ height: `${(count / maxCount) * 100}%`, background: count > 0 ? '#6366f1' : '#e2e8f0' }}
                                            />
                                        </div>
                                        <span className="fsv-bar-label">{short}</span>
                                        <span className="fsv-bar-num">{count || '–'}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="fsv-aside-card" style={{ marginTop: '0.85rem' }}>
                        <div className="fsv-aside-title"><FaLayerGroup /> Session Types</div>
                        {[
                            { label: 'Theory', val: typeStats.theory, color: '#6366f1', Icon: FaBook },
                            { label: 'Lab', val: typeStats.lab, color: '#10b981', Icon: FaFlask },
                            { label: 'Tutorial', val: typeStats.tutorial, color: '#f59e0b', Icon: FaChalkboardTeacher },
                            { label: 'Seminar', val: typeStats.seminar, color: '#a855f7', Icon: FaUsers },
                        ].map(({ label, val, color, Icon }) => (
                            <div key={label} className="fsv-type-row">
                                <Icon size={11} style={{ color }} />
                                <span className="fsv-type-label">{label}</span>
                                <div className="fsv-type-bar">
                                    <div style={{ width: `${schedule.length ? (val / schedule.length) * 100 : 0}%`, background: color, height: '100%', borderRadius: 4, transition: 'width 0.6s ease' }} />
                                </div>
                                <span className="fsv-type-num" style={{ color }}>{val}</span>
                            </div>
                        ))}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default FacultyScheduleView;
