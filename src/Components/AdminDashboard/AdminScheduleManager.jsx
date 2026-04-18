import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaCalendarAlt, FaPlus, FaEdit, FaTrash, FaClock,
    FaChalkboardTeacher, FaMapMarkerAlt, FaSave, FaTimes,
    FaFileAlt, FaCalendarCheck, FaSync, FaSearch, FaLayerGroup,
    FaBolt, FaCheckCircle, FaExclamationTriangle, FaFilter
} from 'react-icons/fa';
import { apiGet, apiPost, apiPut, apiDelete } from '../../utils/apiClient';
import sseClient from '../../utils/sseClient';
import './AdminScheduleManager.css';

const BRANCHES = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AIML', 'IT', 'AIDS'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TYPES = ['Theory', 'Lab', 'Tutorial', 'Seminar', 'Other'];
// Sections 1-13 as per actual academic structure
const SECTIONS = Array.from({ length: 13 }, (_, i) => String(i + 1));

const EVENT_TYPES = ['academic', 'cultural', 'sports', 'meeting', 'other'];

const TYPE_ACCENT = {
    Theory: '#6366f1', Lab: '#10b981', Tutorial: '#f59e0b',
    Seminar: '#a855f7', Other: '#64748b'
};

const TOAST_ICONS = { success: <FaCheckCircle />, error: <FaExclamationTriangle /> };

/**
 * Sentinel V5 — Admin Schedule Commander
 * Fully redesigned three-tab management hub:
 *   • Class Schedules  • Examinations  • System Events
 */
const AdminScheduleManager = () => {
    const [activeTab, setActiveTab] = useState('schedules');
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    // ── Data ───────────────────────────────────────────────────────────────────
    const [schedules, setSchedules] = useState([]);
    const [exams, setExams] = useState([]);
    const [events, setEvents] = useState([]);

    // ── Editing state ──────────────────────────────────────────────────────────
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [editingExam, setEditingExam] = useState(null);
    const [editingEvent, setEditingEvent] = useState(null);

    // ── Filters ────────────────────────────────────────────────────────────────
    const [filters, setFilters] = useState({ year: '3', section: '13', branch: 'CSE', day: '' });
    const [searchText, setSearchText] = useState('');

    // ── Forms ──────────────────────────────────────────────────────────────────
    const blankSchedule = { day: 'Monday', time: '08:15 - 09:05', subject: '', faculty: '', room: '', type: 'Theory', year: 3, section: '13', branch: 'CSE', semester: 5, batch: '', courseCode: '', credits: 3 };
    const blankExam = { title: '', subject: '', topic: '', week: '', branch: 'CSE', year: '1', section: '', durationMinutes: 20, totalMarks: 10 };
    const blankEvent = { title: '', description: '', date: '', time: '', location: '', type: 'academic', branch: '', year: '', section: '' };

    const [scheduleForm, setScheduleForm] = useState(blankSchedule);
    const [examForm, setExamForm] = useState(blankExam);
    const [eventForm, setEventForm] = useState(blankEvent);

    // ── Toast helper ───────────────────────────────────────────────────────────
    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    // ── Data fetchers ──────────────────────────────────────────────────────────
    const fetchSchedules = useCallback(async () => {
        setLoading(true);
        try {
            const q = new URLSearchParams();
            if (filters.year) q.append('year', filters.year);
            if (filters.section) q.append('section', filters.section);
            if (filters.branch) q.append('branch', filters.branch);
            if (filters.day) q.append('day', filters.day);
            const res = await apiGet(`/api/schedule?${q.toString()}`);
            setSchedules(Array.isArray(res) ? res : []);
        } catch { showToast('Failed to load schedules', 'error'); }
        finally { setLoading(false); }
    }, [filters]);

    const fetchExams = useCallback(async () => {
        try {
            const res = await apiGet('/api/exams');
            setExams(Array.isArray(res) ? res : []);
        } catch { showToast('Failed to load exams', 'error'); }
    }, []);

    const fetchEvents = useCallback(async () => {
        try {
            const res = await apiGet('/api/events');
            setEvents(Array.isArray(res) ? res : []);
        } catch { showToast('Failed to load events', 'error'); }
    }, []);

    useEffect(() => { fetchSchedules(); fetchExams(); fetchEvents(); }, [fetchSchedules, fetchExams, fetchEvents]);

    // SSE Live Updates
    useEffect(() => {
        const unsub = sseClient.onUpdate((ev) => {
            if (!ev) return;
            if (ev.resource === 'schedules') fetchSchedules();
            else if (ev.resource === 'exams') fetchExams();
            else if (ev.resource === 'events') fetchEvents();
        });
        return () => unsub();
    }, [fetchSchedules, fetchExams, fetchEvents]);

    // ── Open/Close modal ───────────────────────────────────────────────────────
    const openCreate = () => {
        setEditingSchedule(null); setEditingExam(null); setEditingEvent(null);
        setScheduleForm(blankSchedule); setExamForm(blankExam); setEventForm(blankEvent);
        setShowModal(true);
    };

    const openEdit = (tab, item) => {
        if (tab === 'schedules') { setEditingSchedule(item); setScheduleForm({ ...item }); }
        if (tab === 'exams') { setEditingExam(item); setExamForm({ ...item }); }
        if (tab === 'events') { setEditingEvent(item); setEventForm({ ...item, date: item.date ? item.date.substring(0, 10) : '' }); }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingSchedule(null); setEditingExam(null); setEditingEvent(null);
    };

    // ── Save handlers ──────────────────────────────────────────────────────────
    const handleSaveSchedule = async () => {
        try {
            if (editingSchedule) await apiPut(`/api/schedule/${editingSchedule._id}`, scheduleForm);
            else await apiPost('/api/schedule', scheduleForm);
            closeModal(); fetchSchedules(); showToast('Schedule saved ✔');
        } catch { showToast('Failed to save schedule', 'error'); }
    };

    const handleSaveExam = async () => {
        try {
            if (editingExam) await apiPut(`/api/exams/${editingExam._id}`, examForm);
            else await apiPost('/api/exams/create', examForm);
            closeModal(); fetchExams(); showToast('Exam saved ✔');
        } catch { showToast('Failed to save exam', 'error'); }
    };

    const handleSaveEvent = async () => {
        try {
            if (editingEvent) await apiPut(`/api/events/${editingEvent._id}`, eventForm);
            else await apiPost('/api/events', eventForm);
            closeModal(); fetchEvents(); showToast('Event saved ✔');
        } catch { showToast('Failed to save event', 'error'); }
    };

    // ── Delete handlers ────────────────────────────────────────────────────────
    const del = async (type, id) => {
        if (!window.confirm('Permanently delete this entry?')) return;
        try {
            if (type === 'schedule') { await apiDelete(`/api/schedule/${id}`); fetchSchedules(); }
            if (type === 'exam') { await apiDelete(`/api/exams/${id}`); fetchExams(); }
            if (type === 'event') { await apiDelete(`/api/events/${id}`); fetchEvents(); }
            showToast('Deleted successfully');
        } catch { showToast('Delete failed', 'error'); }
    };

    const handleSeedSection13 = async () => {
        if (!window.confirm('Seed Section 13 (N-512) timetable into database? Existing Section 13 data will be replaced.')) return;
        try {
            const res = await apiPost('/api/schedule/seed/section13', {});
            showToast(`✅ ${res.message}`);
            fetchSchedules();
        } catch { showToast('Seed failed — check backend connection', 'error'); }
    };

    // ── Grouped schedules ──────────────────────────────────────────────────────
    const grouped = schedules.reduce((acc, s) => {
        const key = `${s.year}-${s.section}-${s.branch}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(s);
        return acc;
    }, {});

    const filteredExams = exams.filter(e =>
        !searchText || e.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        e.subject?.toLowerCase().includes(searchText.toLowerCase())
    );
    const filteredEvents = events.filter(e =>
        !searchText || e.title?.toLowerCase().includes(searchText.toLowerCase())
    );

    // ── Tabs config ────────────────────────────────────────────────────────────
    const TABS = [
        { id: 'schedules', label: 'Class Schedules', icon: <FaCalendarAlt />, count: schedules.length },
        { id: 'exams', label: 'Examinations', icon: <FaFileAlt />, count: exams.length },
        { id: 'events', label: 'System Events', icon: <FaCalendarCheck />, count: events.length },
    ];

    return (
        <div className="v5-admin-sm">
            {/* ── Toast ─────────────────────────────────────────────────────── */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        className={`v5-toast ${toast.type}`}
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                    >
                        {TOAST_ICONS[toast.type]} {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Page Header ───────────────────────────────────────────────── */}
            <header className="v5-sm-header">
                <div>
                    <h1 className="v5-sm-title">SCHEDULE <span>COMMANDER</span></h1>
                    <p className="v5-sm-subtitle">Academic scheduling, exams &amp; event management hub</p>
                </div>
                <div className="v5-sm-hactions">
                    <button className="v5-icon-btn" onClick={() => { fetchSchedules(); fetchExams(); fetchEvents(); }} title="Refresh all">
                        <FaSync />
                    </button>
                    <button className="v5-btn-primary" onClick={openCreate}>
                        <FaPlus />
                        {activeTab === 'schedules' ? 'NEW SCHEDULE' : activeTab === 'exams' ? 'NEW EXAM' : 'NEW EVENT'}
                    </button>
                </div>
            </header>

            {/* ── Tab Nav ───────────────────────────────────────────────────── */}
            <div className="v5-tabs-bar">
                {TABS.map(t => (
                    <button
                        key={t.id}
                        className={`v5-tab ${activeTab === t.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(t.id)}
                    >
                        {t.icon}
                        <span>{t.label}</span>
                        <span className="v5-tab-badge">{t.count}</span>
                    </button>
                ))}
            </div>

            {/* ── Schedules Tab ─────────────────────────────────────────────── */}
            {activeTab === 'schedules' && (
                <div className="v5-tab-body">
                    {/* Filter Bar */}
                    <div className="v5-filter-row">
                        <div className="v5-filter-item">
                            <label>ACADEMIC YEAR</label>
                            <select value={filters.year} onChange={e => setFilters(p => ({ ...p, year: e.target.value }))}>
                                <option value="">All Years</option>
                                {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                            </select>
                        </div>
                        <div className="v5-filter-item">
                            <label>SECTION</label>
                            <select value={filters.section} onChange={e => setFilters(p => ({ ...p, section: e.target.value }))}>
                                <option value="">All Sections</option>
                                {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
                            </select>
                        </div>
                        <div className="v5-filter-item">
                            <label>BRANCH</label>
                            <select value={filters.branch} onChange={e => setFilters(p => ({ ...p, branch: e.target.value }))}>
                                <option value="">All Branches</option>
                                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                        <div className="v5-filter-item">
                            <label>DAY</label>
                            <select value={filters.day} onChange={e => setFilters(p => ({ ...p, day: e.target.value }))}>
                                <option value="">All Days</option>
                                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        {/* Seed Section 13 from real timetable */}
                        <div className="v5-filter-item" style={{ justifyContent: 'flex-end', alignItems: 'flex-end', display: 'flex', flexDirection: 'column' }}>
                            <label>QUICK SEED</label>
                            <button
                                className="v5-btn-primary"
                                style={{ width: '100%', justifyContent: 'center' }}
                                onClick={handleSeedSection13}
                                title="Load Section 13 (N-512) real timetable from database"
                            >
                                <FaBolt /> SEED SEC.13
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="v5-loading"><div className="v5-spinner" /><p>Loading schedules…</p></div>
                    ) : Object.keys(grouped).length > 0 ? (
                        Object.entries(grouped).map(([key, slots]) => {
                            const [year, section, branch] = key.split('-');
                            return (
                                <div key={key} className="v5-group-block">
                                    <div className="v5-group-header">
                                        <div className="v5-group-tag">
                                            <FaLayerGroup />
                                            YEAR {year} • SEC {section} • {branch}
                                        </div>
                                        <span className="v5-count-badge">{slots.length} sessions</span>
                                    </div>
                                    <div className="v5-cards-grid">
                                        {slots.map((s, i) => (
                                            <motion.div
                                                key={s._id || i}
                                                className="v5-slot-card"
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.04 }}
                                                style={{ borderTopColor: TYPE_ACCENT[s.type] || '#6366f1' }}
                                            >
                                                <div className="v5-slot-top">
                                                    <div className="v5-slot-time">
                                                        <FaClock className="ico" />
                                                        <div>
                                                            <div className="day-label">{s.day}</div>
                                                            <div className="time-val">{s.time}</div>
                                                        </div>
                                                    </div>
                                                    <span className="v5-type-badge" style={{ color: TYPE_ACCENT[s.type], background: TYPE_ACCENT[s.type] + '18' }}>
                                                        {s.type}
                                                    </span>
                                                </div>
                                                <h3 className="v5-slot-subject">{s.subject}</h3>
                                                <div className="v5-slot-meta">
                                                    <span><FaChalkboardTeacher /> {s.faculty}</span>
                                                    <span><FaMapMarkerAlt /> {s.room}</span>
                                                </div>
                                                {(s.courseCode || s.batch) && (
                                                    <div className="v5-slot-tags">
                                                        {s.courseCode && <span className="v5-micro-tag">{s.courseCode}</span>}
                                                        {s.batch && <span className="v5-micro-tag accent">Batch {s.batch}</span>}
                                                    </div>
                                                )}
                                                <div className="v5-card-actions">
                                                    <button className="v5-btn-edit" onClick={() => openEdit('schedules', s)}><FaEdit /></button>
                                                    <button className="v5-btn-del" onClick={() => del('schedule', s._id)}><FaTrash /></button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="v5-empty">
                            <FaCalendarAlt className="v5-empty-ico" />
                            <h3>NO SCHEDULES FOUND</h3>
                            <p>Adjust filters or create a new schedule entry.</p>
                        </div>
                    )}
                </div>
            )}

            {/* ── Exams Tab ─────────────────────────────────────────────────── */}
            {activeTab === 'exams' && (
                <div className="v5-tab-body">
                    <div className="v5-search-row">
                        <FaSearch className="search-ico" />
                        <input placeholder="Search exams by title or subject…" value={searchText} onChange={e => setSearchText(e.target.value)} />
                    </div>
                    {loading ? (
                        <div className="v5-loading"><div className="v5-spinner" /><p>Loading exams…</p></div>
                    ) : filteredExams.length > 0 ? (
                        <div className="v5-cards-grid">
                            {filteredExams.map((ex, i) => (
                                <motion.div
                                    key={ex._id || i}
                                    className="v5-exam-card"
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                >
                                    <div className="v5-exam-icon"><FaFileAlt /></div>
                                    <div className="v5-exam-body">
                                        <h3>{ex.title}</h3>
                                        <p className="v5-exam-sub">{ex.subject} {ex.topic ? `• ${ex.topic}` : ''}</p>
                                        <div className="v5-exam-meta">
                                            <span>⏱ {ex.durationMinutes} min</span>
                                            <span>📊 {ex.totalMarks} marks</span>
                                            <span>📚 {ex.branch} — Year {ex.year}</span>
                                            {ex.section && <span>Sec {ex.section}</span>}
                                        </div>
                                    </div>
                                    <div className="v5-exam-actions">
                                        <button className="v5-btn-edit" onClick={() => openEdit('exams', ex)}><FaEdit /></button>
                                        <button className="v5-btn-del" onClick={() => del('exam', ex._id)}><FaTrash /></button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="v5-empty">
                            <FaFileAlt className="v5-empty-ico" />
                            <h3>NO EXAMS FOUND</h3>
                            <p>Create a new exam to get started.</p>
                        </div>
                    )}
                </div>
            )}

            {/* ── Events Tab ────────────────────────────────────────────────── */}
            {activeTab === 'events' && (
                <div className="v5-tab-body">
                    <div className="v5-search-row">
                        <FaSearch className="search-ico" />
                        <input placeholder="Search events by title…" value={searchText} onChange={e => setSearchText(e.target.value)} />
                    </div>
                    {loading ? (
                        <div className="v5-loading"><div className="v5-spinner" /><p>Loading events…</p></div>
                    ) : filteredEvents.length > 0 ? (
                        <div className="v5-events-grid">
                            {filteredEvents.map((ev, i) => (
                                <motion.div
                                    key={ev._id || i}
                                    className="v5-event-card"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                >
                                    <div className="v5-event-date-col">
                                        <div className="date-month">{ev.date ? new Date(ev.date).toLocaleString('default', { month: 'short' }).toUpperCase() : 'N/A'}</div>
                                        <div className="date-day">{ev.date ? new Date(ev.date).getDate() : '--'}</div>
                                        <div className="date-year">{ev.date ? new Date(ev.date).getFullYear() : ''}</div>
                                    </div>
                                    <div className="v5-event-info">
                                        <div className="event-type-chip" data-type={ev.type}>{ev.type?.toUpperCase()}</div>
                                        <h3>{ev.title}</h3>
                                        {ev.description && <p className="event-desc">{ev.description}</p>}
                                        <div className="event-meta-row">
                                            {ev.time && <span>🕐 {ev.time}</span>}
                                            {ev.location && <span>📍 {ev.location}</span>}
                                            {ev.branch && <span>🏢 {ev.branch}</span>}
                                        </div>
                                    </div>
                                    <div className="v5-exam-actions">
                                        <button className="v5-btn-edit" onClick={() => openEdit('events', ev)}><FaEdit /></button>
                                        <button className="v5-btn-del" onClick={() => del('event', ev._id)}><FaTrash /></button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="v5-empty">
                            <FaCalendarCheck className="v5-empty-ico" />
                            <h3>NO EVENTS FOUND</h3>
                            <p>Schedule a new event to see it here.</p>
                        </div>
                    )}
                </div>
            )}

            {/* ── Modal ─────────────────────────────────────────────────────── */}
            <AnimatePresence>
                {showModal && (
                    <div className="v5-overlay" onClick={closeModal}>
                        <motion.div
                            className="v5-modal"
                            onClick={e => e.stopPropagation()}
                            initial={{ scale: 0.88, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.88, opacity: 0, y: 40 }}
                            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        >
                            <div className="v5-modal-head">
                                <h2>
                                    {activeTab === 'schedules' && (editingSchedule ? 'EDIT SCHEDULE' : 'CREATE SCHEDULE')}
                                    {activeTab === 'exams' && (editingExam ? 'EDIT EXAM' : 'CREATE EXAM')}
                                    {activeTab === 'events' && (editingEvent ? 'EDIT EVENT' : 'CREATE EVENT')}
                                </h2>
                                <button className="v5-close-btn" onClick={closeModal}><FaTimes /></button>
                            </div>

                            <div className="v5-modal-body">
                                {/* Schedule Form */}
                                {activeTab === 'schedules' && (
                                    <div className="v5-form-grid">
                                        <div className="v5-fg full">
                                            <label>SUBJECT / MODULE NAME *</label>
                                            <input value={scheduleForm.subject} onChange={e => setScheduleForm(p => ({ ...p, subject: e.target.value }))} placeholder="e.g. Advanced Algorithms" />
                                        </div>
                                        <div className="v5-fg">
                                            <label>DAY *</label>
                                            <select value={scheduleForm.day} onChange={e => setScheduleForm(p => ({ ...p, day: e.target.value }))}>
                                                {DAYS.map(d => <option key={d}>{d}</option>)}
                                            </select>
                                        </div>
                                        <div className="v5-fg">
                                            <label>TIME SLOT *</label>
                                            <input value={scheduleForm.time} onChange={e => setScheduleForm(p => ({ ...p, time: e.target.value }))} placeholder="e.g. 09:00 - 10:00" />
                                        </div>
                                        <div className="v5-fg">
                                            <label>INSTRUCTOR *</label>
                                            <input value={scheduleForm.faculty} onChange={e => setScheduleForm(p => ({ ...p, faculty: e.target.value }))} placeholder="Faculty name" />
                                        </div>
                                        <div className="v5-fg">
                                            <label>ROOM / SECTOR *</label>
                                            <input value={scheduleForm.room} onChange={e => setScheduleForm(p => ({ ...p, room: e.target.value }))} placeholder="e.g. Nexus 301" />
                                        </div>
                                        <div className="v5-fg">
                                            <label>SESSION TYPE</label>
                                            <select value={scheduleForm.type} onChange={e => setScheduleForm(p => ({ ...p, type: e.target.value }))}>
                                                {TYPES.map(t => <option key={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div className="v5-fg">
                                            <label>COHORT YEAR *</label>
                                            <select value={scheduleForm.year} onChange={e => setScheduleForm(p => ({ ...p, year: parseInt(e.target.value) }))}>
                                                {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                                            </select>
                                        </div>
                                        <div className="v5-fg">
                                            <label>SECTION *</label>
                                            <select value={scheduleForm.section} onChange={e => setScheduleForm(p => ({ ...p, section: e.target.value }))}>
                                                {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
                                            </select>
                                        </div>
                                        <div className="v5-fg">
                                            <label>BRANCH *</label>
                                            <select value={scheduleForm.branch} onChange={e => setScheduleForm(p => ({ ...p, branch: e.target.value }))}>
                                                {BRANCHES.map(b => <option key={b}>{b}</option>)}
                                            </select>
                                        </div>
                                        <div className="v5-fg">
                                            <label>COURSE CODE</label>
                                            <input value={scheduleForm.courseCode} onChange={e => setScheduleForm(p => ({ ...p, courseCode: e.target.value }))} placeholder="e.g. CS401" />
                                        </div>
                                        <div className="v5-fg">
                                            <label>BATCH (Lab only)</label>
                                            <input value={scheduleForm.batch} onChange={e => setScheduleForm(p => ({ ...p, batch: e.target.value }))} placeholder="e.g. A1" />
                                        </div>
                                    </div>
                                )}

                                {/* Exam Form */}
                                {activeTab === 'exams' && (
                                    <div className="v5-form-grid">
                                        <div className="v5-fg full">
                                            <label>EXAM TITLE *</label>
                                            <input value={examForm.title} onChange={e => setExamForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Mid-Term Unit Test" />
                                        </div>
                                        <div className="v5-fg">
                                            <label>SUBJECT *</label>
                                            <input value={examForm.subject} onChange={e => setExamForm(p => ({ ...p, subject: e.target.value }))} placeholder="Subject name" />
                                        </div>
                                        <div className="v5-fg">
                                            <label>TOPIC / UNIT</label>
                                            <input value={examForm.topic} onChange={e => setExamForm(p => ({ ...p, topic: e.target.value }))} placeholder="e.g. Unit 2" />
                                        </div>
                                        <div className="v5-fg">
                                            <label>BRANCH *</label>
                                            <select value={examForm.branch} onChange={e => setExamForm(p => ({ ...p, branch: e.target.value }))}>
                                                {BRANCHES.map(b => <option key={b}>{b}</option>)}
                                            </select>
                                        </div>
                                        <div className="v5-fg">
                                            <label>YEAR *</label>
                                            <select value={examForm.year} onChange={e => setExamForm(p => ({ ...p, year: e.target.value }))}>
                                                {[1, 2, 3, 4].map(y => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                        </div>
                                        <div className="v5-fg">
                                            <label>SECTION</label>
                                            <input value={examForm.section} onChange={e => setExamForm(p => ({ ...p, section: e.target.value }))} placeholder="e.g. A" />
                                        </div>
                                        <div className="v5-fg">
                                            <label>WEEK</label>
                                            <input value={examForm.week} onChange={e => setExamForm(p => ({ ...p, week: e.target.value }))} placeholder="e.g. Week 3" />
                                        </div>
                                        <div className="v5-fg">
                                            <label>DURATION (MIN) *</label>
                                            <input type="number" min="5" value={examForm.durationMinutes} onChange={e => setExamForm(p => ({ ...p, durationMinutes: parseInt(e.target.value) }))} />
                                        </div>
                                        <div className="v5-fg">
                                            <label>TOTAL MARKS *</label>
                                            <input type="number" min="1" value={examForm.totalMarks} onChange={e => setExamForm(p => ({ ...p, totalMarks: parseInt(e.target.value) }))} />
                                        </div>
                                    </div>
                                )}

                                {/* Event Form */}
                                {activeTab === 'events' && (
                                    <div className="v5-form-grid">
                                        <div className="v5-fg full">
                                            <label>EVENT TITLE *</label>
                                            <input value={eventForm.title} onChange={e => setEventForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Annual Tech Fest" />
                                        </div>
                                        <div className="v5-fg full">
                                            <label>DESCRIPTION</label>
                                            <textarea rows="2" value={eventForm.description} onChange={e => setEventForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief event description…" />
                                        </div>
                                        <div className="v5-fg">
                                            <label>DATE *</label>
                                            <input type="date" value={eventForm.date} onChange={e => setEventForm(p => ({ ...p, date: e.target.value }))} />
                                        </div>
                                        <div className="v5-fg">
                                            <label>TIME</label>
                                            <input type="time" value={eventForm.time} onChange={e => setEventForm(p => ({ ...p, time: e.target.value }))} />
                                        </div>
                                        <div className="v5-fg">
                                            <label>LOCATION</label>
                                            <input value={eventForm.location} onChange={e => setEventForm(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Main Auditorium" />
                                        </div>
                                        <div className="v5-fg">
                                            <label>EVENT TYPE</label>
                                            <select value={eventForm.type} onChange={e => setEventForm(p => ({ ...p, type: e.target.value }))}>
                                                {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div className="v5-fg">
                                            <label>BRANCH</label>
                                            <select value={eventForm.branch} onChange={e => setEventForm(p => ({ ...p, branch: e.target.value }))}>
                                                <option value="">All</option>
                                                {BRANCHES.map(b => <option key={b}>{b}</option>)}
                                            </select>
                                        </div>
                                        <div className="v5-fg">
                                            <label>YEAR</label>
                                            <select value={eventForm.year} onChange={e => setEventForm(p => ({ ...p, year: e.target.value }))}>
                                                <option value="">All</option>
                                                {[1, 2, 3, 4].map(y => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                        </div>
                                        <div className="v5-fg">
                                            <label>SECTION</label>
                                            <input value={eventForm.section} onChange={e => setEventForm(p => ({ ...p, section: e.target.value }))} placeholder="e.g. A or All" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="v5-modal-foot">
                                <button className="v5-btn-ghost" onClick={closeModal}>CANCEL</button>
                                <button className="v5-btn-primary" onClick={
                                    activeTab === 'schedules' ? handleSaveSchedule :
                                        activeTab === 'exams' ? handleSaveExam : handleSaveEvent
                                }>
                                    <FaSave />
                                    {activeTab === 'schedules' ? 'SAVE SCHEDULE' : activeTab === 'exams' ? 'SAVE EXAM' : 'SAVE EVENT'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminScheduleManager;
