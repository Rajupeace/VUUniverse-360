import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaCalendarAlt, FaChalkboardTeacher, FaUserGraduate, FaPlus,
    FaFilter, FaSync, FaBars, FaTrash, FaTimes, FaClock,
    FaMapMarkerAlt, FaChevronLeft, FaFlask, FaBook,
    FaBolt, FaUserTie, FaLayerGroup, FaSeedling
} from 'react-icons/fa';
import { apiGet, apiPost, apiPut, apiDelete } from '../../utils/apiClient';

/* ── Constants ───────────────────────────────────────────────────────── */
const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const DAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TODAY_DAY_IDX = new Date().getDay() - 1; // 0 = Mon, -1 = Sun

// Real time slots from Section 13 (N-512) timetable sheet
const TIME_SLOTS = [
    '08:15 - 09:05',
    '09:05 - 09:55',
    '10:10 - 11:00',
    '11:00 - 11:50',
    '11:50 - 12:40',
    '13:40 - 14:30',
    '14:30 - 15:20',
    '15:20 - 16:05',
];

const YEARS = Array.from({ length: 4 }, (_, i) => i + 1);
// Sections 1-13 matching real academic structure
const SECTIONS = Array.from({ length: 13 }, (_, i) => String(i + 1));
const BRANCHES = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AI&DS', 'AIDS', 'AIML'];

const TYPE_ACCENT = {
    Theory: { bg: '#eef2ff', border: '#6366f1', text: '#4338ca', dot: '#6366f1' },
    Lab: { bg: '#ecfdf5', border: '#10b981', text: '#065f46', dot: '#10b981' },
    Tutorial: { bg: '#fef9c3', border: '#f59e0b', text: '#92400e', dot: '#f59e0b' },
    Seminar: { bg: '#fdf4ff', border: '#a855f7', text: '#6b21a8', dot: '#a855f7' },
    Other: { bg: '#f8fafc', border: '#94a3b8', text: '#475569', dot: '#94a3b8' },
};

/* ── Section 13 Faculty Directory ─────────────────────────────────── */
const SEC13_FACULTY = [
    { subject: 'ML', name: 'Mr. N. Uttej Kumar', phone: '9573793892' },
    { subject: 'SE', name: 'Mr. N. Uttej Kumar', phone: '9573793892' },
    { subject: 'CNS', name: 'Dr. S. Deva Kumar', phone: '9959949221' },
    { subject: 'CNS-L', name: 'Ms. V.Anusha', phone: '9704754065' },
    { subject: 'PDC', name: 'Mr. P. Vijaya Babu / Ms. Swarna Lalitha', phone: '9985333934' },
    { subject: 'CSA', name: 'Mr. K. Raj Kiran', phone: '9542687850' },
    { subject: 'QLR', name: 'Mr. J. Naresh', phone: '' },
    { subject: 'IDP', name: 'Ms. V.Anusha / Dr. Vijitha Ananthi', phone: '9704754065' },
    { subject: 'SE-L', name: 'Mr. N. Uttej Kumar / Ms. V.Nandini', phone: '9573793892' },
];

/* ================================================================
   MAIN COMPONENT
================================================================ */
const ScheduleSection = ({ defaultSection = '13', defaultYear = 3, defaultBranch = 'CSE' }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [viewMode, setViewMode] = useState('student'); // 'student' | 'faculty'
    const [activePanel, setActivePanel] = useState('grid');   // 'grid' | 'faculty'
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [scheduleData, setScheduleData] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingSlot, setEditingSlot] = useState(null);
    const [slotTarget, setSlotTarget] = useState({ day: 'Monday', time: '08:15 - 09:05' });
    const [toast, setToast] = useState(null);
    const [lastSync, setLastSync] = useState(null);

    // Filters
    const [selectedYear, setSelectedYear] = useState(defaultYear);
    const [selectedSection, setSelectedSection] = useState(defaultSection);
    const [selectedBranch, setSelectedBranch] = useState(defaultBranch);
    const [facultySearch, setFacultySearch] = useState('');

    const [formData, setFormData] = useState({
        subject: '', faculty: '', room: '', type: 'Theory',
        day: 'Monday', time: '08:15 - 09:05', courseCode: ''
    });

    const toastTimer = useRef(null);

    /* ── Toast ───────────────────────────────────────────────────── */
    const showToast = (msg, type = 'success') => {
        clearTimeout(toastTimer.current);
        setToast({ msg, type });
        toastTimer.current = setTimeout(() => setToast(null), 3500);
    };

    /* ── Fetch Schedule ──────────────────────────────────────────── */
    const fetchSchedule = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ year: selectedYear, section: selectedSection, branch: selectedBranch });
            if (viewMode === 'faculty' && facultySearch) params.set('faculty', facultySearch);
            const res = await apiGet(`/api/schedule?${params}`);
            setScheduleData(Array.isArray(res) ? res : []);
            setLastSync(new Date());
        } catch (e) {
            console.error('Schedule fetch failed:', e);
            showToast('Failed to load schedule', 'error');
            setScheduleData([]);
        } finally {
            setLoading(false);
        }
    }, [selectedYear, selectedSection, selectedBranch, viewMode, facultySearch]);

    useEffect(() => { fetchSchedule(); }, [fetchSchedule]);

    /* ── Seed Section 13 ─────────────────────────────────────────── */
    const seedSection13 = async () => {
        if (!window.confirm('Load Section 13 (N-512) real timetable? Existing data for this section will be replaced.')) return;
        try {
            const res = await apiPost('/api/schedule/seed/section13', {});
            showToast(`✅ ${res.message || 'Section 13 seeded successfully'}`);
            setSelectedYear(3); setSelectedSection('13'); setSelectedBranch('CSE');
            setTimeout(fetchSchedule, 300);
        } catch { showToast('Seed failed – check backend', 'error'); }
    };

    /* ── CRUD helpers ────────────────────────────────────────────── */
    const findSlot = (day, time) => scheduleData.find(s => s.day === day && s.time === time);

    const openSlot = (day, time) => {
        const existing = findSlot(day, time);
        setEditingSlot(existing || null);
        setSlotTarget({ day, time });
        setFormData(existing ? {
            subject: existing.subject, faculty: existing.faculty, room: existing.room,
            type: existing.type || 'Theory', day: existing.day, time: existing.time,
            courseCode: existing.courseCode || ''
        } : { subject: '', faculty: '', room: '', type: 'Theory', day, time, courseCode: '' });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...formData, year: selectedYear, section: selectedSection, branch: selectedBranch, semester: selectedYear * 2 - 1 };
            if (editingSlot) await apiPut(`/api/schedule/${editingSlot._id}`, payload);
            else await apiPost('/api/schedule', payload);
            setShowModal(false);
            fetchSchedule();
            showToast(editingSlot ? 'Session updated ✔' : 'Session deployed ✔');
        } catch (err) {
            showToast('Save failed: ' + err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('Remove this session?')) return;
        try { await apiDelete(`/api/schedule/${id}`); fetchSchedule(); showToast('Session removed'); }
        catch { showToast('Delete failed', 'error'); }
    };

    /* ── Drag-and-drop swap ──────────────────────────────────────── */
    const handleDragStart = (e, slot) => e.dataTransfer.setData('application/json', JSON.stringify(slot));
    const handleDrop = async (e, targetDay, targetTime) => {
        e.preventDefault();
        const raw = e.dataTransfer.getData('application/json');
        if (!raw) return;
        const src = JSON.parse(raw);
        if (src.day === targetDay && src.time === targetTime) return;
        try { await apiPut(`/api/schedule/${src._id}`, { day: targetDay, time: targetTime }); fetchSchedule(); showToast('Session moved'); }
        catch { showToast('Drag-drop failed', 'error'); }
    };

    const isBreak = (time) => ['09:55 - 10:10', '12:40 - 13:40'].includes(time);

    /* ── Render ──────────────────────────────────────────────────── */
    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', gap: '1.25rem', fontFamily: "'Plus Jakarta Sans', 'Outfit', sans-serif" }}>

            {/* ── Toast ──────────────────────────────────────────── */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -24, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -24, scale: 0.9 }}
                        style={{
                            position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
                            background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
                            border: `1px solid ${toast.type === 'error' ? '#fca5a5' : '#86efac'}`,
                            color: toast.type === 'error' ? '#dc2626' : '#16a34a',
                            padding: '0.9rem 1.5rem', borderRadius: '16px',
                            fontWeight: 800, fontSize: '0.85rem',
                            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)',
                            display: 'flex', alignItems: 'center', gap: '0.6rem', maxWidth: 380
                        }}
                    >
                        {toast.type === 'error' ? '⚠' : '✔'} {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Header ─────────────────────────────────────────── */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div>
                    <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '2rem', fontWeight: 950, color: '#1e293b', margin: 0, letterSpacing: '-1px' }}>
                        SCHEDULE <span style={{ color: '#6366f1' }}>COMMANDER</span>
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', animation: 'ss-pulse 2s infinite' }} />
                        <p style={{ margin: 0, fontWeight: 800, color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            LIVE • {lastSync ? `SYNCED ${lastSync.toLocaleTimeString()}` : 'LOADING…'}
                            &nbsp;&nbsp;|&nbsp;&nbsp;
                            Year {selectedYear} · Section {selectedSection} · {selectedBranch}
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {/* View mode pills */}
                    <div style={{ background: '#f1f5f9', padding: 4, borderRadius: 14, display: 'flex', gap: 4, border: '1px solid #e8edf4' }}>
                        {[
                            { id: 'student', label: 'STUDENT', icon: <FaUserGraduate /> },
                            { id: 'faculty', label: 'FACULTY', icon: <FaUserTie /> }
                        ].map(t => (
                            <button key={t.id} onClick={() => setViewMode(t.id)} style={{
                                display: 'flex', alignItems: 'center', gap: 7,
                                padding: '0.55rem 1.1rem', borderRadius: 10, border: 'none', fontWeight: 800,
                                fontSize: '0.74rem', cursor: 'pointer', fontFamily: 'inherit',
                                background: viewMode === t.id ? 'white' : 'transparent',
                                color: viewMode === t.id ? '#6366f1' : '#64748b',
                                boxShadow: viewMode === t.id ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                                transition: 'all 0.25s'
                            }}>
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Panel toggle (Grid / Faculty Dir) */}
                    <div style={{ background: '#f1f5f9', padding: 4, borderRadius: 14, display: 'flex', gap: 4, border: '1px solid #e8edf4' }}>
                        {[
                            { id: 'grid', icon: <FaLayerGroup />, label: 'GRID' },
                            { id: 'faculty', icon: <FaBook />, label: 'FACULTY' }
                        ].map(t => (
                            <button key={t.id} onClick={() => setActivePanel(t.id)} style={{
                                display: 'flex', alignItems: 'center', gap: 7,
                                padding: '0.55rem 1.1rem', borderRadius: 10, border: 'none', fontWeight: 800,
                                fontSize: '0.74rem', cursor: 'pointer', fontFamily: 'inherit',
                                background: activePanel === t.id ? 'white' : 'transparent',
                                color: activePanel === t.id ? '#6366f1' : '#64748b',
                                boxShadow: activePanel === t.id ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                                transition: 'all 0.25s'
                            }}>
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Seed Sec 13 */}
                    <button onClick={seedSection13} title="Seed Section 13 (N-512) real timetable" style={{
                        display: 'flex', alignItems: 'center', gap: 7,
                        padding: '0.6rem 1.1rem', borderRadius: 12, border: '1.5px solid #6366f1',
                        background: '#eef2ff', color: '#6366f1', fontWeight: 800, fontSize: '0.72rem',
                        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.25s'
                    }}>
                        <FaSeedling /> SEED SEC.13
                    </button>

                    {/* Refresh */}
                    <button onClick={fetchSchedule} disabled={loading} style={{
                        display: 'flex', alignItems: 'center', gap: 7,
                        padding: '0.6rem 1.1rem', borderRadius: 12, border: '1px solid #e2e8f0',
                        background: 'white', color: '#64748b', fontWeight: 800, fontSize: '0.72rem',
                        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.25s'
                    }}>
                        <FaSync style={{ animation: loading ? 'ss-spin 1s linear infinite' : 'none' }} />
                        {loading ? 'SYNCING…' : 'REFRESH'}
                    </button>
                </div>
            </header>

            {/* ── Body ───────────────────────────────────────────── */}
            <div style={{ display: 'flex', gap: '1.25rem', flex: 1, overflow: 'hidden', minHeight: 0 }}>

                {/* ─ Sidebar ─────────────────────────────────────── */}
                <motion.div
                    animate={{ width: sidebarOpen ? 260 : 0, opacity: sidebarOpen ? 1 : 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 32 }}
                    style={{
                        background: 'linear-gradient(170deg, #1e293b 0%, #0f172a 100%)',
                        borderRadius: 22, display: 'flex', flexDirection: 'column',
                        overflow: 'hidden', flexShrink: 0,
                        boxShadow: '4px 0 30px rgba(0,0,0,0.18)'
                    }}
                >
                    <div style={{ minWidth: 260 }}>
                        {/* Sidebar header */}
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <FaFilter style={{ color: '#6366f1', fontSize: '0.85rem' }} />
                            <span style={{ fontWeight: 900, fontSize: '0.72rem', color: '#94a3b8', letterSpacing: '1.5px' }}>FILTER CONTROLS</span>
                        </div>

                        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                            {viewMode === 'faculty' ? (
                                /* Faculty search */
                                <div>
                                    <p style={{ margin: '0 0 0.75rem', fontSize: '0.6rem', fontWeight: 950, color: '#475569', letterSpacing: '1.5px' }}>FACULTY NAME</p>
                                    <input
                                        type="text"
                                        value={facultySearch}
                                        onChange={e => setFacultySearch(e.target.value)}
                                        placeholder="Search faculty…"
                                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: 'white', fontWeight: 700, fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                                    />
                                </div>
                            ) : (
                                <>
                                    {/* Branch */}
                                    <div>
                                        <p style={{ margin: '0 0 0.75rem', fontSize: '0.6rem', fontWeight: 950, color: '#475569', letterSpacing: '1.5px' }}>DEPARTMENT</p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                                            {BRANCHES.map(b => (
                                                <button key={b} onClick={() => setSelectedBranch(b)} style={{
                                                    padding: '5px 10px', borderRadius: 8, fontFamily: 'inherit',
                                                    border: `1.5px solid ${selectedBranch === b ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
                                                    background: selectedBranch === b ? '#6366f1' : 'transparent',
                                                    color: selectedBranch === b ? 'white' : '#64748b',
                                                    fontWeight: 800, fontSize: '0.68rem', cursor: 'pointer', transition: 'all 0.2s'
                                                }}>
                                                    {b}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Year 1-4 */}
                                    <div>
                                        <p style={{ margin: '0 0 0.75rem', fontSize: '0.6rem', fontWeight: 950, color: '#475569', letterSpacing: '1.5px' }}>ACADEMIC YEAR</p>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5 }}>
                                            {YEARS.map(y => (
                                                <button key={y} onClick={() => setSelectedYear(y)} style={{
                                                    padding: '8px 0', borderRadius: 10, fontFamily: 'inherit',
                                                    border: `1.5px solid ${selectedYear === y ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
                                                    background: selectedYear === y ? '#6366f1' : 'rgba(255,255,255,0.04)',
                                                    color: selectedYear === y ? 'white' : '#64748b',
                                                    fontWeight: 900, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s'
                                                }}>
                                                    {y}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Section 1-13 */}
                                    <div>
                                        <p style={{ margin: '0 0 0.75rem', fontSize: '0.6rem', fontWeight: 950, color: '#475569', letterSpacing: '1.5px' }}>SECTION (1 – 13)</p>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5 }}>
                                            {SECTIONS.map(s => (
                                                <button key={s} onClick={() => setSelectedSection(s)} style={{
                                                    padding: '8px 0', borderRadius: 10, fontFamily: 'inherit',
                                                    border: `1.5px solid ${selectedSection === s ? '#ec4899' : 'rgba(255,255,255,0.1)'}`,
                                                    background: selectedSection === s ? '#ec4899' : 'rgba(255,255,255,0.04)',
                                                    color: selectedSection === s ? 'white' : '#64748b',
                                                    fontWeight: 900, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s'
                                                }}>
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Stats */}
                            <div style={{ marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {[
                                    { label: 'TOTAL SESSIONS', val: scheduleData.length },
                                    { label: 'LAB SESSIONS', val: scheduleData.filter(s => s.type === 'Lab').length },
                                    { label: 'TUTORIAL SESSIONS', val: scheduleData.filter(s => s.type === 'Tutorial').length },
                                ].map(r => (
                                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 800 }}>
                                        <span style={{ color: '#475569', letterSpacing: '0.5px' }}>{r.label}</span>
                                        <span style={{ color: '#e2e8f0', fontFamily: "'Outfit', sans-serif" }}>{r.val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ─ Main Panel ──────────────────────────────────── */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'white', borderRadius: 22, border: '1px solid #f1f5f9', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.04)' }}>
                    {/* Toolbar */}
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                {sidebarOpen ? <FaChevronLeft /> : <FaBars />}
                            </button>
                            <div>
                                <h3 style={{ margin: 0, fontWeight: 900, color: '#1e293b', fontSize: '0.95rem' }}>
                                    {viewMode === 'student' ? `${selectedBranch} — Year ${selectedYear} — Section ${selectedSection}` : 'Faculty Schedule View'}
                                </h3>
                                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.68rem', fontWeight: 800 }}>
                                    {scheduleData.length} sessions &nbsp;·&nbsp; {scheduleData.filter(s => s.type === 'Lab').length} labs
                                </p>
                            </div>
                        </div>
                        {activePanel === 'grid' && (
                            <button onClick={() => openSlot(DAY_FULL[0], TIME_SLOTS[0])} style={{
                                background: '#6366f1', color: 'white', border: 'none',
                                padding: '0.6rem 1.25rem', borderRadius: 12, fontWeight: 800, fontSize: '0.78rem',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'inherit',
                                boxShadow: '0 8px 20px -6px rgba(99,102,241,0.4)'
                            }}>
                                <FaPlus /> ADD SESSION
                            </button>
                        )}
                    </div>

                    {/* ─ Grid Panel ───────────────────────────────── */}
                    <AnimatePresence mode="wait">
                        {activePanel === 'grid' ? (
                            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                style={{ flex: 1, overflow: 'auto', padding: '1.25rem' }}>
                                {loading ? (
                                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                                        <div style={{ width: 40, height: 40, border: '3px solid #eef2ff', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'ss-spin 1s linear infinite' }} />
                                        <p style={{ color: '#94a3b8', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '1px' }}>SYNCHRONIZING TIMELINE…</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: `100px repeat(${DAYS.length}, 1fr)`, gap: 7, minWidth: 900 }}>
                                        {/* Top-left corner */}
                                        <div style={{ borderRadius: 12, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 950, color: '#94a3b8', letterSpacing: '1px', padding: '0.75rem 0.5rem' }}>
                                            TIME\DAY
                                        </div>
                                        {/* Day headers */}
                                        {DAYS.map((day, i) => (
                                            <div key={day} style={{
                                                borderRadius: 12, padding: '0.9rem 0.5rem', textAlign: 'center',
                                                background: i === TODAY_DAY_IDX ? '#eef2ff' : '#f8fafc',
                                                fontWeight: 950, fontSize: '0.78rem', letterSpacing: '1px',
                                                color: i === TODAY_DAY_IDX ? '#6366f1' : '#64748b',
                                                border: i === TODAY_DAY_IDX ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent'
                                            }}>
                                                {day}
                                                {i === TODAY_DAY_IDX && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#6366f1', margin: '4px auto 0', animation: 'ss-pulse 2s infinite' }} />}
                                            </div>
                                        ))}

                                        {/* Time rows */}
                                        {TIME_SLOTS.map((time, timeIdx) => (
                                            <React.Fragment key={time}>
                                                {/* Time label */}
                                                <div style={{
                                                    borderRadius: 12, background: '#f8fafc', display: 'flex', flexDirection: 'column',
                                                    alignItems: 'center', justifyContent: 'center', padding: '0.75rem 0.4rem',
                                                    fontSize: '0.62rem', fontWeight: 900, color: '#64748b', textAlign: 'center', lineHeight: 1.6
                                                }}>
                                                    <span style={{ fontSize: '1rem', fontFamily: "'Outfit', sans-serif", color: '#6366f1', fontWeight: 950 }}>
                                                        {time.split(' - ')[0]}
                                                    </span>
                                                    <span style={{ color: '#cbd5e1' }}>to</span>
                                                    <span>{time.split(' - ')[1]}</span>
                                                </div>

                                                {/* Day cells */}
                                                {DAY_FULL.map((day, dayIdx) => {
                                                    const slot = findSlot(day, time);
                                                    const ac = slot ? (TYPE_ACCENT[slot.type] || TYPE_ACCENT.Other) : null;
                                                    return (
                                                        <motion.div
                                                            key={`${day}-${timeIdx}`}
                                                            whileHover={{ scale: 1.025, y: -2 }}
                                                            onClick={() => openSlot(day, time)}
                                                            onDragOver={e => e.preventDefault()}
                                                            onDrop={e => handleDrop(e, day, time)}
                                                            style={{
                                                                minHeight: 108, borderRadius: 14, padding: '0.7rem',
                                                                cursor: 'pointer', transition: 'all 0.22s',
                                                                background: slot ? ac.bg : 'white',
                                                                border: slot ? `1px solid ${ac.border}30` : '1.5px dashed #f1f5f9',
                                                                borderLeft: slot ? `3px solid ${ac.border}` : undefined,
                                                                boxShadow: slot ? `0 6px 16px -4px ${ac.border}20` : 'none',
                                                                display: 'flex', flexDirection: 'column', gap: 3,
                                                                position: 'relative', overflow: 'hidden'
                                                            }}
                                                        >
                                                            {slot ? (
                                                                <div
                                                                    draggable
                                                                    onDragStart={e => handleDragStart(e, slot)}
                                                                    style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                                                                    onClick={e => e.stopPropagation()}
                                                                >
                                                                    {/* Type badge */}
                                                                    <span style={{
                                                                        position: 'absolute', top: 5, right: 5,
                                                                        fontSize: '0.48rem', fontWeight: 950,
                                                                        background: ac.text + '20', color: ac.text,
                                                                        padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.4px'
                                                                    }}>
                                                                        {slot.type}
                                                                    </span>
                                                                    {/* Subject */}
                                                                    <div style={{ fontWeight: 900, fontSize: '0.8rem', color: '#1e293b', lineHeight: 1.25, paddingRight: 36, marginBottom: 3 }}>
                                                                        {slot.subject}
                                                                    </div>
                                                                    {slot.courseCode && (
                                                                        <span style={{ fontSize: '0.55rem', fontWeight: 950, color: ac.text, opacity: 0.7, letterSpacing: '0.5px', marginBottom: 2 }}>
                                                                            {slot.courseCode}
                                                                        </span>
                                                                    )}
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.6rem', fontWeight: 800, color: '#64748b', marginTop: 2 }}>
                                                                        <FaChalkboardTeacher size={8} /> {slot.faculty}
                                                                    </div>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.6rem', fontWeight: 700, color: '#94a3b8', marginTop: 1 }}>
                                                                        <FaMapMarkerAlt size={8} /> {slot.room}
                                                                    </div>
                                                                    {/* Delete */}
                                                                    <button
                                                                        onClick={e => handleDelete(slot._id, e)}
                                                                        style={{ marginTop: 'auto', alignSelf: 'flex-end', background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5', padding: '2px', transition: '0.2s', opacity: 0.6 }}
                                                                        onMouseOver={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = '#ef4444'; }}
                                                                        onMouseOut={e => { e.currentTarget.style.opacity = 0.6; e.currentTarget.style.color = '#fca5a5'; }}
                                                                    >
                                                                        <FaTrash size={10} />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e2e8f0', transition: '0.2s' }}
                                                                    onMouseOver={e => { e.currentTarget.style.color = '#6366f1'; e.currentTarget.style.transform = 'scale(1.2) rotate(90deg)'; }}
                                                                    onMouseOut={e => { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.transform = ''; }}
                                                                >
                                                                    <FaPlus size={17} />
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    );
                                                })}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            /* ─ Faculty Directory Panel ─────────── */
                            <motion.div key="faculty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
                                <h3 style={{ margin: '0 0 1.25rem', fontFamily: "'Outfit', sans-serif", fontWeight: 950, color: '#1e293b', letterSpacing: '-0.5px' }}>
                                    SECTION {selectedSection} — FACULTY DIRECTORY
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                    {SEC13_FACULTY.map((f, i) => (
                                        <motion.div
                                            key={f.subject}
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            style={{ background: '#f8faff', borderRadius: 18, padding: '1.25rem 1.5rem', border: '1.5px solid #eef2ff', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.25s', cursor: 'default' }}
                                            onMouseOver={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.boxShadow = '0 10px 24px -6px rgba(99,102,241,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                            onMouseOut={e => { e.currentTarget.style.borderColor = '#eef2ff'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = ''; }}
                                        >
                                            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #6366f1, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 950, fontSize: '0.9rem', flexShrink: 0 }}>
                                                {f.subject.replace(/-/g, '').substring(0, 2)}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 950, fontSize: '0.82rem', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.subject}</div>
                                                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1e293b', marginTop: 2, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                                                {f.phone && (
                                                    <div style={{ fontWeight: 700, fontSize: '0.72rem', color: '#64748b', marginTop: 3 }}>📞 {f.phone}</div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ── Session Modal ───────────────────────────────────── */}
            <AnimatePresence>
                {showModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
                        onClick={() => setShowModal(false)}>
                        <motion.div
                            initial={{ scale: 0.88, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.88, opacity: 0, y: 40 }}
                            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                            onClick={e => e.stopPropagation()}
                            style={{ background: 'white', borderRadius: 28, padding: '2.5rem', width: '90%', maxWidth: 520, boxShadow: '0 40px 80px -20px rgba(0,0,0,0.3)', position: 'relative', fontFamily: 'inherit' }}
                        >
                            {/* Gradient top bar */}
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderRadius: '28px 28px 0 0', background: 'linear-gradient(90deg, #6366f1, #818cf8, #06b6d4)' }} />

                            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}>
                                <FaTimes size={13} />
                            </button>

                            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 950, fontSize: '1.4rem', margin: '0 0 0.25rem', color: '#1e293b' }}>
                                {editingSlot ? '⚙ EDIT SESSION' : '＋ DEPLOY SESSION'}
                            </h2>
                            <p style={{ margin: '0 0 2rem', color: '#94a3b8', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.5px' }}>
                                {slotTarget.day.toUpperCase()} • {slotTarget.time} • Year {selectedYear} Sec {selectedSection} {selectedBranch}
                            </p>

                            <form onSubmit={handleSave}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    {[
                                        { label: 'SUBJECT', key: 'subject', placeholder: 'e.g. Machine Learning', full: true },
                                        { label: 'FACULTY / INSTRUCTOR', key: 'faculty', placeholder: 'e.g. Mr. N. Uttej Kumar', full: false },
                                        { label: 'ROOM / SECTOR', key: 'room', placeholder: 'e.g. N-318', full: false },
                                        { label: 'COURSE CODE', key: 'courseCode', placeholder: 'e.g. ML / CNS', full: false },
                                    ].map(field => (
                                        <div key={field.key} style={{ gridColumn: field.full ? '1 / -1' : 'auto' }}>
                                            <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 950, color: '#94a3b8', marginBottom: '0.5rem', letterSpacing: '1px' }}>{field.label}</label>
                                            <input
                                                required={field.key !== 'courseCode'}
                                                value={formData[field.key]}
                                                onChange={e => setFormData(p => ({ ...p, [field.key]: e.target.value }))}
                                                placeholder={field.placeholder}
                                                style={{ width: '100%', padding: '0.85rem 1rem', background: '#f8fafc', border: '1.5px solid transparent', borderRadius: 14, fontWeight: 700, fontSize: '0.9rem', transition: '0.25s', boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none' }}
                                                onFocus={e => { e.target.style.border = '1.5px solid #6366f1'; e.target.style.background = '#fafbff'; }}
                                                onBlur={e => { e.target.style.border = '1.5px solid transparent'; e.target.style.background = '#f8fafc'; }}
                                            />
                                        </div>
                                    ))}

                                    {/* Day */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 950, color: '#94a3b8', marginBottom: '0.5rem', letterSpacing: '1px' }}>DAY</label>
                                        <select value={formData.day} onChange={e => setFormData(p => ({ ...p, day: e.target.value }))}
                                            style={{ width: '100%', padding: '0.85rem 1rem', background: '#f8fafc', border: '1.5px solid transparent', borderRadius: 14, fontWeight: 700, fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none' }}>
                                            {DAY_FULL.map(d => <option key={d}>{d}</option>)}
                                        </select>
                                    </div>

                                    {/* Time */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 950, color: '#94a3b8', marginBottom: '0.5rem', letterSpacing: '1px' }}>TIME SLOT</label>
                                        <select value={formData.time} onChange={e => setFormData(p => ({ ...p, time: e.target.value }))}
                                            style={{ width: '100%', padding: '0.85rem 1rem', background: '#f8fafc', border: '1.5px solid transparent', borderRadius: 14, fontWeight: 700, fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none' }}>
                                            {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
                                        </select>
                                    </div>

                                    {/* Session Type */}
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 950, color: '#94a3b8', marginBottom: '0.5rem', letterSpacing: '1px' }}>SESSION TYPE</label>
                                        <div style={{ display: 'flex', gap: 7 }}>
                                            {Object.entries(TYPE_ACCENT).filter(([k]) => k !== 'Other').map(([type, ac]) => (
                                                <button key={type} type="button" onClick={() => setFormData(p => ({ ...p, type }))} style={{
                                                    flex: 1, padding: '0.7rem', borderRadius: 12, fontFamily: 'inherit',
                                                    border: `2px solid ${formData.type === type ? ac.border : 'transparent'}`,
                                                    background: formData.type === type ? ac.bg : '#f8fafc',
                                                    color: formData.type === type ? ac.text : '#94a3b8',
                                                    fontWeight: 900, fontSize: '0.68rem', cursor: 'pointer', transition: 'all 0.2s'
                                                }}>
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.85rem', marginTop: '2rem' }}>
                                    <button type="submit" disabled={saving} style={{
                                        flex: 1, background: '#6366f1', color: 'white', border: 'none',
                                        padding: '1rem', borderRadius: 14, fontWeight: 900, cursor: 'pointer',
                                        fontSize: '0.88rem', fontFamily: 'inherit',
                                        boxShadow: '0 10px 24px -6px rgba(99,102,241,0.4)',
                                        transition: 'all 0.25s', opacity: saving ? 0.7 : 1
                                    }}>
                                        {saving ? 'DEPLOYING…' : 'DEPLOY CHANGES'}
                                    </button>
                                    <button type="button" onClick={() => setShowModal(false)} style={{
                                        background: '#f1f5f9', color: '#64748b', border: 'none',
                                        padding: '1rem 1.5rem', borderRadius: 14, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit'
                                    }}>
                                        ABORT
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Keyframes */}
            <style>{`
                @keyframes ss-spin  { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
                @keyframes ss-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.7)} }
            `}</style>
        </div>
    );
};

export default ScheduleSection;
