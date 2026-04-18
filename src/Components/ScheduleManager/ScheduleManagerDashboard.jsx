import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaCalendarAlt, FaSignOutAlt, FaBook, FaTasks,
    FaPlus, FaTrash, FaChevronLeft, FaChevronRight,
    FaMapMarkerAlt, FaChalkboardTeacher, FaCalendarPlus,
    FaUserTie, FaUserGraduate, FaSyncAlt, FaEdit,
    FaSeedling, FaTimes, FaCheck, FaCoffee, FaUtensils, FaBars, FaSearch, FaLayerGroup, FaRobot, FaClock, FaHistory
} from 'react-icons/fa';
import VuAiAgent from '../VuAiAgent/VuAiAgent';
import { apiGet, apiPost, apiPut, apiDelete } from '../../utils/apiClient';
import './ScheduleManagerDashboard.css';

/* ─── Constants ───────────────────────────────────────────── */
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const YEARS = ['1', '2', '3', '4'];
const SECTIONS = Array.from({ length: 13 }, (_, i) => String(i + 1));
const BRANCHES = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AI&ML', 'AI&DS', 'AIDS', 'AIML'];
const SESSION_TYPES = ['Theory', 'Lab', 'Tutorial', 'Seminar'];
const TODAY_DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];

const TYPE_META = {
    Theory: { bg: '#eef2ff', text: '#4f46e5', strip: '#6366f1', dot: '#6366f1' },
    Lab: { bg: '#f0fdf4', text: '#16a34a', strip: '#10b981', dot: '#10b981' },
    Tutorial: { bg: '#fffbeb', text: '#d97706', strip: '#f59e0b', dot: '#f59e0b' },
    Seminar: { bg: '#faf5ff', text: '#9333ea', strip: '#a855f7', dot: '#a855f7' },
};

const DEFAULT_TIMES = [
    '08:15 - 09:05', '09:05 - 09:55', '10:10 - 11:00', '11:00 - 11:50',
    '11:50 - 12:40', '13:40 - 14:30', '14:30 - 15:20', '15:20 - 16:05',
];

const DAY_ABBR = { Monday: 'MON', Tuesday: 'TUE', Wednesday: 'WED', Thursday: 'THU', Friday: 'FRI', Saturday: 'SAT' };

function formatDate(dayName) {
    const now = new Date();
    const wday = now.getDay();
    const days = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
    const diff = (days[dayName] || 1) - wday;
    const d = new Date(now); d.setDate(now.getDate() + diff);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

function isOngoing(timeRange) {
    if (!timeRange?.includes(' - ')) return false;
    try {
        const [s, e] = timeRange.split(' - ');
        const now = new Date();
        const [sh, sm] = s.trim().split(':');
        const [eh, em] = e.trim().split(':');

        const start = new Date(); start.setHours(+sh, +sm, 0);
        const end = new Date(); end.setHours(+eh, +em, 0);

        return now >= start && now <= end;
    } catch { return false; }
}

/* ══════════════════════════════════════════════════════════ */
const ScheduleManagerDashboard = ({ managerData, onLogout, isEmbedded }) => {
    const [sidebar, setSidebar] = useState(true);
    const [activeTab, setActiveTab] = useState('timetables');
    const [viewMode, setViewMode] = useState('student');
    const [cardView, setCardView] = useState(true);

    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingSlot, setEditingSlot] = useState(null);
    const [toast, setToast] = useState(null);
    const [search, setSearch] = useState('');

    const [selDay, setSelDay] = useState(TODAY_DAY === 'Sunday' ? 'Monday' : TODAY_DAY);
    const [filters, setFilters] = useState({ year: '3', branch: 'CSE', section: '13', faculty: '' });
    const [formData, setFormData] = useState({
        day: DAYS[0], time: DEFAULT_TIMES[0],
        subject: '', faculty: '', room: '', type: 'Theory', courseCode: ''
    });

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const openSlot = (day, time) => {
        setFormData(p => ({ ...p, day, time, subject: '', faculty: '', room: '', courseCode: '', type: 'Theory' }));
        setEditingSlot(null);
        setShowModal(true);
    };

    /* ── Load ──────────────────────────────────────────────── */
    const isFetchingRef = useRef(false);
    const loadSchedules = useCallback(async () => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;
        setLoading(true);
        try {
            const q = new URLSearchParams();
            if (viewMode === 'faculty') {
                if (!filters.faculty) { setSchedules([]); setLoading(false); isFetchingRef.current = false; return; }
                q.set('faculty', filters.faculty.trim());
            } else {
                q.set('year', filters.year);
                q.set('section', filters.section);
                q.set('branch', filters.branch);
            }
            const res = await apiGet(`/api/schedule?${q.toString()}`);
            setSchedules(Array.isArray(res) ? res : []);
        } catch { showToast('Transmission interference detected', 'error'); }
        finally { setLoading(false); isFetchingRef.current = false; }
    }, [filters, viewMode]);

    useEffect(() => {
        loadSchedules();
    }, [loadSchedules]);

    /* ── CRUD ──────────────────────────────────────────────── */
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...formData,
                year: filters.year,
                branch: filters.branch,
                section: filters.section
            };

            if (editingSlot) {
                await apiPut(`/api/schedule/${editingSlot._id}`, payload);
                showToast('Schedule matrix updated');
            } else {
                await apiPost('/api/schedule', payload);
                showToast('Session synchronized to mesh');
            }
            setShowModal(false);
            loadSchedules();
        } catch (err) {
            showToast(err.message || 'Quantum instability detected', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this session from history?')) return;
        try {
            await apiDelete(`/api/schedule/${id}`);
            showToast('Session purged from timeline');
            loadSchedules();
        } catch (err) {
            showToast('Purge protocol failed', 'error');
        }
    };

    const handleEdit = (slot) => {
        setEditingSlot(slot);
        setFormData({
            day: slot.day,
            time: slot.time,
            subject: slot.subject,
            faculty: slot.faculty,
            room: slot.room,
            type: slot.type || 'Theory',
            courseCode: slot.courseCode || ''
        });
        setShowModal(true);
    };

    const seedSection13 = async () => {
        if (!window.confirm('Force-load Section 13 timetable? This will overwrite local data nodes.')) return;
        try {
            const res = await apiPost('/api/schedule/seed/section13', { section: '13', year: '3', branch: 'CSE' });
            showToast(`✅ ${res.message || 'Seeded!'}`);
            setFilters(p => ({ ...p, year: '3', section: '13', branch: 'CSE' }));
            setTimeout(loadSchedules, 500);
        } catch { showToast('Seed injection failed', 'error'); }
    };

    /* ── Derived data ──────────────────────────────────────── */
    const daySchedule = useMemo(() =>
        schedules
            .filter(s => s.day === selDay && (
                !search || s.subject?.toLowerCase().includes(search.toLowerCase()) ||
                s.faculty?.toLowerCase().includes(search.toLowerCase()) ||
                s.room?.toLowerCase().includes(search.toLowerCase())
            ))
            .sort((a, b) => a.time.localeCompare(b.time)),
        [schedules, selDay, search]
    );

    const dayCounts = useMemo(() =>
        Object.fromEntries(DAYS.map(d => [d, schedules.filter(s => s.day === d).length])),
        [schedules]
    );

    const liveCount = useMemo(() =>
        selDay === TODAY_DAY ? dayCounts[selDay] ? schedules.filter(s => s.day === TODAY_DAY && isOngoing(s.time)).length : 0 : 0,
        [schedules, selDay, dayCounts]);

    const stats = useMemo(() => ({
        total: schedules.length,
        theory: schedules.filter(s => s.type === 'Theory').length,
        lab: schedules.filter(s => s.type === 'Lab').length,
        tutorial: schedules.filter(s => s.type === 'Tutorial').length,
        seminar: schedules.filter(s => s.type === 'Seminar').length,
        live: liveCount,
    }), [schedules, liveCount]);

    /* ═══════════════════════════════════════════════════════ */
    return (
        <div className={`smd-shell ${isEmbedded ? 'embedded' : ''}`}>

            {/* Toast Notifications */}
            <AnimatePresence>
                {toast && (
                    <motion.div className={`smd-toast ${toast.type}`}
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}>
                        {toast.type === 'error' ? '⚠ ' : '✔ '}{toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Sidebar (Only if not embedded) ─────────────── */}
            {!isEmbedded && (
                <motion.aside className="smd-sidebar"
                    animate={{ width: sidebar ? 260 : 70 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}>

                    <button className="smd-sidebar-toggle" onClick={() => setSidebar(!sidebar)}>
                        {sidebar ? <FaChevronLeft /> : <FaBars />}
                    </button>

                    <div className="smd-logo">
                        <div className="smd-logo-icon"><FaCalendarAlt /></div>
                        {sidebar && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="smd-logo-name">VU V5</div>
                                <div className="smd-logo-sub">Focus Hub</div>
                            </motion.div>
                        )}
                    </div>

                    <nav className="smd-nav">
                        {[
                            { id: 'timetables', label: 'Academic Mesh', icon: <FaCalendarAlt /> },
                            { id: 'ai-agent', label: 'Neural Core', icon: <FaRobot /> }
                        ].map(t => (
                            <button key={t.id} className={`smd-nav-item ${activeTab === t.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(t.id)} title={t.label}>
                                {t.icon}{sidebar && <span>{t.label}</span>}
                            </button>
                        ))}
                    </nav>

                    <div className="smd-sidebar-footer">
                        <button className="smd-logout" onClick={onLogout}>
                            <FaSignOutAlt />{sidebar && <span>TERMINATE SESSION</span>}
                        </button>
                    </div>
                </motion.aside>
            )}

            {/* ── Main Dashboard Content ──────────────────── */}
            <main className="smd-main">

                {/* Top Header Section */}
                <header className="smd-topbar" style={isEmbedded ? { padding: '1rem 0', background: 'transparent' } : {}}>
                    <div className="smd-topbar-left">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '4px', marginRight: '1rem' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></div>
                            <span style={{ fontSize: '0.6rem', fontWeight: 900, color: '#10b981', letterSpacing: '1px' }}>CLOUD SYNC LIVE</span>
                        </div>
                        {isEmbedded ? (
                            <div className="embedded-tabs">
                                <button className={`tab-btn ${activeTab === 'timetables' ? 'active' : ''}`} onClick={() => setActiveTab('timetables')}>Timetables</button>
                                <button className={`tab-btn ${activeTab === 'ai-agent' ? 'active' : ''}`} onClick={() => setActiveTab('ai-agent')}>Neural Agent</button>
                            </div>
                        ) : (
                            <div className="smd-date-block">
                                <span className="smd-day-name">{selDay}</span>
                                <span className="smd-date-str">{formatDate(selDay)}</span>
                            </div>
                        )}

                        {!isEmbedded && (
                            <div className="smd-mini-stats">
                                <span className="smd-mstat"><b>{stats.total}</b> Sessions</span>
                                {stats.live > 0 && <span className="smd-mstat" style={{ color: '#10b981', background: '#f0fdf4', border: '1px solid #10b981' }}><b>{stats.live}</b> LIVE</span>}
                                <span className="smd-mstat"><b>{stats.theory}</b> Theory</span>
                                <span className="smd-mstat"><b>{stats.lab}</b> Lab</span>
                            </div>
                        )}
                    </div>

                    <div className="smd-topbar-right">
                        <div className="smd-view-toggle">
                            <button className={viewMode === 'student' ? 'active' : ''} onClick={() => setViewMode('student')}><FaUserGraduate /> Students</button>
                            <button className={viewMode === 'faculty' ? 'active' : ''} onClick={() => setViewMode('faculty')}><FaUserTie /> Faculty</button>
                        </div>

                        {viewMode === 'student' ? (
                            <>
                                <select className="smd-sel" value={filters.year} onChange={e => setFilters(p => ({ ...p, year: e.target.value }))}>
                                    {YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}
                                </select>
                                <select className="smd-sel" value={filters.section} onChange={e => setFilters(p => ({ ...p, section: e.target.value }))}>
                                    {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
                                </select>
                                <select className="smd-sel" value={filters.branch} onChange={e => setFilters(p => ({ ...p, branch: e.target.value }))}>
                                    {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </>
                        ) : (
                            <input className="smd-sel smd-faculty-input" placeholder="Search Faculty..." value={filters.faculty} onChange={e => setFilters(p => ({ ...p, faculty: e.target.value }))} />
                        )}

                        <button className="smd-btn-refresh" onClick={seedSection13} title="Seed Mesh"><FaSeedling /></button>
                        <button className="smd-btn-add" onClick={() => openSlot(selDay, DEFAULT_TIMES[0])}><FaPlus /> ADD SESSION</button>
                        <button className="smd-btn-refresh" onClick={loadSchedules}><FaSyncAlt className={loading ? 'fa-spin' : ''} /></button>
                    </div>
                </header>

                {activeTab === 'ai-agent' ? (
                    <div style={{ flex: 1, padding: 0 }}>
                        <VuAiAgent onNavigate={setActiveTab} documentContext={{ title: "Schedule Hub", content: "Agent is assisting the schedule manager with timetables, class schedules, and faculty assignments.", data: { schedules, filters } }} />
                    </div>
                ) : (
                    <>
                        {/* Day Selector Strip */}
                        <div className="smd-day-strip">
                            <div className="smd-day-pills">
                                {DAYS.map(day => (
                                    <motion.button
                                        key={day}
                                        whileTap={{ scale: 0.96 }}
                                        className={`smd-day-pill ${selDay === day ? 'active' : ''}`}
                                        onClick={() => setSelDay(day)}
                                    >
                                        <span className="smd-dp-abbr">{DAY_ABBR[day]}</span>
                                        <span className={`smd-dp-count ${dayCounts[day] === 0 ? 'zero' : ''}`}>
                                            {dayCounts[day] || 0}
                                        </span>
                                        {day === TODAY_DAY && <div className="smd-today-pip" />}
                                    </motion.button>
                                ))}
                            </div>

                            <div className="smd-strip-right">
                                <div className="smd-search-wrap">
                                    <FaSearch className="smd-search-icon" />
                                    <input className="smd-search" placeholder="Filter by subject, room, teacher..."
                                        value={search} onChange={e => setSearch(e.target.value)} />
                                </div>
                                <button className={`smd-view-btn ${cardView ? 'active' : ''}`} onClick={() => setCardView(true)}><FaLayerGroup /></button>
                                <button className={`smd-view-btn ${!cardView ? 'active' : ''}`} onClick={() => setCardView(false)}><FaBars /></button>
                            </div>
                        </div>

                        {/* Main Grid View */}
                        <div className="smd-schedule-content">
                            {loading ? (
                                <div className="smd-loader">
                                    <FaSyncAlt className="fa-spin" style={{ fontSize: '3rem' }} />
                                    <span>SYNCHRONIZING MESH...</span>
                                </div>
                            ) : daySchedule.length === 0 ? (
                                <div className="smd-loader" style={{ color: '#94a3b8' }}>
                                    <FaCalendarPlus style={{ fontSize: '4rem', opacity: 0.2, marginBottom: '1rem' }} />
                                    <h3 style={{ margin: 0, fontWeight: 900 }}>EMPTY TIME SLOT</h3>
                                    <p style={{ fontWeight: 700, opacity: 0.5 }}>Initialize the timeline for {selDay}</p>
                                </div>
                            ) : (
                                <div className={cardView ? "smd-grid" : "smd-list"}>
                                    {daySchedule.map((s, i) => {
                                        const ongoing = isOngoing(s.time) && selDay === TODAY_DAY;
                                        return (
                                            <motion.div key={s._id || i} layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className={`smd-slot-card ${ongoing ? 'ongoing' : ''}`}>

                                                <div className="smd-slot-type" style={{ background: TYPE_META[s.type]?.strip || '#ccc' }} />

                                                <div className="smd-slot-body">
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <div className="smd-slot-time">
                                                            <FaClock style={{ marginRight: 6 }} /> {s.time}
                                                            {ongoing && <span style={{ marginLeft: 10, color: '#10b981', fontWeight: 950 }}>● LIVE</span>}
                                                        </div>
                                                        <div className="smd-slot-tag" style={{ background: TYPE_META[s.type]?.bg, color: TYPE_META[s.type]?.text }}>{s.type}</div>
                                                    </div>

                                                    <h3 className="smd-slot-sub">{s.subject} <span className="smd-slot-code">{s.courseCode}</span></h3>

                                                    <div className="smd-slot-faculty"><FaChalkboardTeacher /> {s.faculty}</div>
                                                    <div className="smd-slot-room"><FaMapMarkerAlt /> {s.room}</div>

                                                    <div className="smd-slot-actions">
                                                        <button onClick={() => handleEdit(s)}><FaEdit /></button>
                                                        <button onClick={() => handleDelete(s._id)} className="del"><FaTrash /></button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>

            {/* Transition Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="smd-overlay" onClick={() => setShowModal(false)}>
                        <motion.div className="smd-modal"
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="smd-modal-header">
                                <h2 className="smd-modal-title">{editingSlot ? 'UPDATE NODE' : 'DEPLOY SESSION'}</h2>
                                <button className="smd-modal-close" onClick={() => setShowModal(false)}><FaTimes /></button>
                            </div>

                            <form className="smd-form" onSubmit={handleSave}>
                                <div className="smd-form-grid">
                                    <div className="smd-input full">
                                        <label>Subject / Module Title</label>
                                        <input required value={formData.subject} onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))} placeholder="e.g. Distributed Systems" />
                                    </div>
                                    <div className="smd-input">
                                        <label>Course Code</label>
                                        <input value={formData.courseCode} onChange={e => setFormData(p => ({ ...p, courseCode: e.target.value }))} placeholder="e.g. CS401" />
                                    </div>
                                    <div className="smd-input">
                                        <label>Instructor</label>
                                        <input required value={formData.faculty} onChange={e => setFormData(p => ({ ...p, faculty: e.target.value }))} placeholder="Full Name" />
                                    </div>
                                    <div className="smd-input">
                                        <label>Venue (Room)</label>
                                        <input required value={formData.room} onChange={e => setFormData(p => ({ ...p, room: e.target.value }))} placeholder="e.g. LH-302" />
                                    </div>
                                    <div className="smd-input">
                                        <label>Temporal Slot</label>
                                        <select value={formData.time} onChange={e => setFormData(p => ({ ...p, time: e.target.value }))}>
                                            {DEFAULT_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="smd-input">
                                        <label>Protocol Type</label>
                                        <select value={formData.type} onChange={e => setFormData(p => ({ ...p, type: e.target.value }))}>
                                            {SESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="smd-input">
                                        <label>Operational Day</label>
                                        <select value={formData.day} onChange={e => setFormData(p => ({ ...p, day: e.target.value }))}>
                                            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="smd-modal-actions">
                                    <button type="button" className="sec" onClick={() => setShowModal(false)}>ABORT</button>
                                    <button type="submit" disabled={saving} className="pri">
                                        {saving ? 'SYNCING...' : (editingSlot ? 'COMMIT CHANGES' : 'DEPLOY TO MESH')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ScheduleManagerDashboard;
