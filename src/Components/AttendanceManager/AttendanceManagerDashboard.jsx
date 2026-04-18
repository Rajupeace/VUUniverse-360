import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { apiGet, apiPost } from '../../utils/apiClient';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaUsers, FaCheckCircle, FaTimesCircle, FaClock, FaSignOutAlt,
    FaChartLine, FaCalendarCheck, FaSearch, FaBell,
    FaCog, FaChevronDown, FaChevronLeft, FaChevronRight,
    FaGraduationCap, FaExclamationTriangle, FaLayerGroup,
    FaFileAlt, FaBook, FaStickyNote, FaFilter, FaDownload,
    FaSyncAlt, FaUserCheck, FaEllipsisV, FaEye, FaTachometerAlt, FaBars, FaRobot
} from 'react-icons/fa';
import VuAiAgent from '../VuAiAgent/VuAiAgent';
import * as XLSX from 'xlsx';
import './AttendanceManagerDashboard.css';

/* ─── Helpers ──────────────────────────────────────────────── */
const YEARS = ['All', '1', '2', '3', '4'];
const BRANCHES = ['All', 'CSE', 'ECE', 'EEE', 'MECH', 'IT', 'AI&ML'];
const SECTIONS = ['All', 'A', 'B', 'C', 'D', 'E', 'F', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_SH = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const NOW = new Date();
const TODAY = NOW.toISOString().split('T')[0];
const DATE_STR = NOW.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

function initials(name = '') {
    return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'AM';
}
function avatarColor(name = '') {
    const palette = ['#6366f1', '#22c55e', '#f59e0b', '#0ea5e9', '#a855f7', '#ef4444', '#14b8a6', '#f97316'];
    let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
    return palette[Math.abs(h) % palette.length];
}

/* ── Donut chart ─────────────────────────────────────────── */
function DonutChart({ pct = 0, colorA = '#6366f1', colorB = '#22c55e', colorC = '#f59e0b', size = 160 }) {
    const r = 55, cx = size / 2, cy = size / 2, c = 2 * Math.PI * r;
    // Three segments like reference: Excellent, Good, Average
    const excellent = Math.min(pct, 60);
    const good = Math.min(Math.max(pct - 60, 0), 30);
    const avg = Math.max(pct - 90, 0);
    const segA = c * (excellent / 100);
    const segB = c * (good / 100);
    const segC = c * (avg / 100);
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth="14" />
            {pct > 0 && <>
                <motion.circle cx={cx} cy={cy} r={r} fill="none" stroke={colorA} strokeWidth="14"
                    strokeDasharray={`${segA} ${c - segA}`}
                    initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * 0.25 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} />
                {good > 0 && <motion.circle cx={cx} cy={cy} r={r} fill="none" stroke={colorB} strokeWidth="14"
                    strokeDasharray={`${segB} ${c - segB}`}
                    initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c - segA }}
                    transition={{ duration: 1.2, delay: 0.2, ease: 'easeOut' }}
                    strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} />}
            </>}
            <text x={cx} y={cy - 4} textAnchor="middle" dominantBaseline="middle" fontSize="22" fontWeight="900" fill="#0f172a">{pct}%</text>
            <text x={cx} y={cy + 16} textAnchor="middle" fontSize="9" fontWeight="700" fill="#94a3b8">Attendance</text>
        </svg>
    );
}

/* ── Mini Calendar ───────────────────────────────────────── */
function MiniCalendar({ selectedDate, onSelectDate }) {
    const [cur, setCur] = useState(new Date());
    const y = cur.getFullYear(), m = cur.getMonth();
    const fd = new Date(y, m, 1).getDay(), dim = new Date(y, m + 1, 0).getDate();
    const today = new Date();
    const cells = []; for (let i = 0; i < fd; i++) cells.push(null); for (let d = 1; d <= dim; d++) cells.push(d);
    return (
        <div className="amd-calendar">
            <div className="amd-cal-nav">
                <button onClick={() => setCur(new Date(y, m - 1))}><FaChevronLeft size={9} /></button>
                <span>{MONTHS[m]} {y}</span>
                <button onClick={() => setCur(new Date(y, m + 1))}><FaChevronRight size={9} /></button>
            </div>
            <div className="amd-cal-grid">
                {DAY_SH.map((d, i) => <span key={i} className="amd-cal-hdr">{d}</span>)}
                {cells.map((d, i) => {
                    const ds = d ? `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` : null;
                    const isTd = d && y === today.getFullYear() && m === today.getMonth() && d === today.getDate();
                    const isSel = ds === selectedDate;
                    return (
                        <span key={i}
                            className={`amd-cal-cell ${!d ? 'empty' : ''} ${isTd ? 'today' : ''} ${isSel && !isTd ? 'selected' : ''}`}
                            onClick={() => d && onSelectDate && onSelectDate(ds)}>
                            {d || ''}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}

/* ── Timetable slot ──────────────────────────────────────── */
function TimetableSlot({ time, subject, section, color = '#6366f1' }) {
    return (
        <div className="amd-tt-slot">
            <div className="amd-tt-time" style={{ background: color + '18', color }}>{time}</div>
            <div className="amd-tt-info">
                <div className="amd-tt-subject">{subject}</div>
                <div className="amd-tt-section">{section}</div>
            </div>
            <button className="amd-tt-btn" style={{ background: color }}><FaEye size={9} /></button>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════ */
const MarkAttendanceTab = ({ year, branch, section, date, onAttendanceMarked }) => {
    const [students, setStudents] = useState([]);
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [subject, setSubject] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Load available subjects from DB
    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const res = await apiGet('/api/courses');
                if (res && Array.isArray(res)) {
                    // Filter subjects by year and branch on client side if API doesn't filter perfectly
                    const filtered = res.filter(c => String(c.year) === String(year) && (c.branch === branch || c.branch === 'Common'));
                    setAvailableSubjects(filtered);
                    if (filtered.length > 0) setSubject(filtered[0].name);
                }
            } catch (e) {
                console.error('Error fetching subjects:', e);
            }
        };
        fetchSubjects();
    }, [year, branch]);

    // Load students for the selected class
    useEffect(() => {
        const loadStudents = async () => {
            setLoading(true);
            try {
                const res = await apiGet(`/api/students?year=${year}&branch=${branch}&section=${section}`);
                if (res && Array.isArray(res)) {
                    setStudents(res);
                    // Initialize attendance status for each student
                    const initialAttendance = {};
                    res.forEach(student => {
                        initialAttendance[student.sid] = 'Present'; // Default to present
                    });
                    setAttendance(initialAttendance);
                }
            } catch (e) {
                console.error('Error loading students:', e);
            } finally {
                setLoading(false);
            }
        };
        loadStudents();
    }, [year, branch, section]);

    const handleStatusChange = (studentId, status) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const handleMarkAll = (status) => {
        const newAttendance = {};
        students.forEach(student => {
            newAttendance[student.sid] = status;
        });
        setAttendance(newAttendance);
    };

    const handleSaveAttendance = async () => {
        if (!subject.trim()) {
            alert('Please enter a subject name');
            return;
        }

        setSaving(true);
        try {
            const records = students.map(student => ({
                studentId: student.sid,
                studentName: student.studentName,
                status: attendance[student.sid] || 'Present'
            }));

            const response = await apiPost('/api/attendance', {
                date,
                records,
                subject: subject.trim(),
                year,
                section,
                branch,
                facultyId: 'ADMIN001',
                facultyName: 'Attendance Manager',
                topic: `Attendance for ${subject}`
            });

            if (response) {
                alert('Attendance marked successfully!');
                onAttendanceMarked();
                setSubject('');
                setAttendance({});
            }
        } catch (e) {
            console.error('Error saving attendance:', e);
            alert('Error saving attendance. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="amd-sub-page">
            <div className="amd-sub-header">
                <h2>Mark Attendance — Yr {year} · Sec {section} · {branch}</h2>
                <div className="amd-mark-controls">
                    {availableSubjects.length > 0 ? (
                        <select
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            className="amd-subject-input"
                        >
                            <option value="">Select Subject...</option>
                            {availableSubjects.map(s => (
                                <option key={s.id} value={s.name}>{s.name} ({s.courseCode || s.code})</option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type="text"
                            placeholder="Enter subject name..."
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            className="amd-subject-input"
                        />
                    )}
                    <input
                        type="date"
                        value={date}
                        onChange={e => {/* Date change handled by parent */ }}
                        className="amd-fsel"
                    />
                </div>
            </div>

            <div className="amd-mark-actions">
                <button
                    className="amd-mark-btn present"
                    onClick={() => handleMarkAll('Present')}
                >
                    Mark All Present
                </button>
                <button
                    className="amd-mark-btn absent"
                    onClick={() => handleMarkAll('Absent')}
                >
                    Mark All Absent
                </button>
                <button
                    className="amd-mark-btn late"
                    onClick={() => handleMarkAll('Late')}
                >
                    Mark All Late
                </button>
            </div>

            {loading ? (
                <div className="amd-loading-pulse full" />
            ) : students.length === 0 ? (
                <div className="amd-empty-state">
                    <FaGraduationCap size={36} style={{ opacity: 0.2 }} />
                    <p>No students found for this class.</p>
                </div>
            ) : (
                <div className="amd-attendance-table">
                    <div className="amd-attendance-header">
                        <span>#</span>
                        <span>Student</span>
                        <span>ID</span>
                        <span>Status</span>
                    </div>
                    {students.map((student, i) => (
                        <div key={student.sid} className="amd-attendance-row">
                            <span className="amd-row-num">{i + 1}</span>
                            <div className="amd-row-student">
                                <div className="amd-row-av" style={{ background: avatarColor(student.studentName) }}>
                                    {initials(student.studentName)}
                                </div>
                                <span>{student.studentName}</span>
                            </div>
                            <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>{student.sid}</span>
                            <div className="amd-status-buttons">
                                {['Present', 'Absent', 'Late', 'Leave'].map(status => (
                                    <button
                                        key={status}
                                        className={`amd-status-btn ${attendance[student.sid] === status ? status.toLowerCase() : ''}`}
                                        onClick={() => handleStatusChange(student.sid, status)}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="amd-save-section">
                <button
                    className="amd-save-btn"
                    onClick={handleSaveAttendance}
                    disabled={saving || !subject.trim()}
                >
                    {saving ? 'Saving...' : 'Save Attendance'}
                </button>
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════════════════ */
const AttendanceManagerDashboard = ({ managerData, onLogout, isEmbedded }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [year, setYear] = useState('All');
    const [branch, setBranch] = useState('All');
    const [section, setSection] = useState('All');
    const [date, setDate] = useState(TODAY);
    const [search, setSearch] = useState('');
    const [notes, setNotes] = useState('');

    const [sectionSummary, setSectionSummary] = useState([]);
    const [subjectSummary, setSubjectSummary] = useState([]);
    const [studentList, setStudentList] = useState([]);
    const [dailyRaw, setDailyRaw] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentSubjectSummary, setStudentSubjectSummary] = useState([]);
    const [matrixData, setMatrixData] = useState(null);
    const [loading, setLoading] = useState(true);

    /* ── Load data ──────────────────────────────────────── */
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const [secs, subs, studs, daily] = await Promise.allSettled([
                apiGet('/api/attendance/analysis/sections'),
                apiGet('/api/attendance/analysis/subjects'),
                apiGet(`/api/students?year=${year}&branch=${branch}&section=${section}`),
                apiGet(`/api/attendance/daily?date=${date}`)
            ]);
            if (secs.status === 'fulfilled' && Array.isArray(secs.value)) setSectionSummary(secs.value);
            if (subs.status === 'fulfilled' && Array.isArray(subs.value)) setSubjectSummary(subs.value);
            if (studs.status === 'fulfilled' && Array.isArray(studs.value)) setStudentList(studs.value);
            if (daily.status === 'fulfilled' && Array.isArray(daily.value)) setDailyRaw(daily.value);

            // Conditional Matrix Load (For Detailed View)
            if (year !== 'All' && section !== 'All') {
                const matrix = await apiGet(`/api/attendance/matrix?year=${year}&branch=${branch}&section=${section}`);
                if (matrix && matrix.subjects) setMatrixData(matrix);
            } else {
                setMatrixData(null);
            }

            setLastUpdated(new Date());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [year, branch, section, date]);

    const openStudentDetails = async (student) => {
        setSelectedStudent(student);
        setStudentSubjectSummary([]);
        try {
            const res = await apiGet(`/api/attendance/student/${student.sid}/summary`);
            if (res && Array.isArray(res)) {
                setStudentSubjectSummary(res);
            }
        } catch (e) {
            console.error('Error fetching student subject summary:', e);
        }
    };

    const handleExportStudents = () => {
        if (!studentList.length) return;
        const data = studentList.map((s, i) => ({
            'S.No': i + 1,
            'Student Name': s.studentName,
            'Student Id': s.studentId,
            'Email': s.email || 'N/A',
            'Phone': s.phone || 'N/A',
            'Year': s.year,
            'Branch': s.branch,
            'Section': s.section,
            'Attendance %': s.percentage + '%',
            'Present Count': s.present,
            'Absent Count': s.absent,
            'Total Classes': s.totalClasses,
            'Attendance Status': s.percentage < 75 ? 'At Risk' : 'Regular'
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Detailed_Student_Roster');
        XLSX.writeFile(wb, `Students_Detailed_Yr${year}_Sec${section}_${branch}.xlsx`);
    };

    const handleExportAttendance = () => {
        if (!dailyRaw.length) return;
        const data = dailyRaw.map((sess, i) => ({
            'S.No': i + 1,
            'Date': sess.date,
            'Subject': sess.subject,
            'Section': sess.section,
            'Year': sess.year,
            'Faculty': sess.facultyName,
            'Present': sess.records?.filter(r => r.status === 'Present').length || 0,
            'Total': sess.records?.length || 0
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance_Reports');
        XLSX.writeFile(wb, `Attendance_Report_${date}.xlsx`);
    };

    useEffect(() => {
        loadAll();
        // Hyper-Sync: 100ms polling for real-time responsiveness (handled by backend micro-cache)
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') loadAll();
        }, 3000); 
        return () => clearInterval(interval);
    }, [loadAll]);

    /* ── Computed stats ─────────────────────────────────── */
    const stats = useMemo(() => {
        const sec = sectionSummary.find(s =>
            (year === 'All' || s.year === year) &&
            (branch === 'All' || s.branch === branch) &&
            (section === 'All' || s.section === section)
        );
        const totalStudents = sec?.studentCount || studentList.length;
        const totalSessions = sectionSummary.filter(s =>
            (year === 'All' || s.year === year) &&
            (branch === 'All' || s.branch === branch)
        ).length;

        const overallPct = sec && typeof sec.percentage === 'number' && year !== 'All' && section !== 'All'
            ? sec.percentage
            : studentList.length > 0
                ? Math.round((studentList.reduce((acc, s) => acc + (s.percentage || 0), 0) / studentList.length) * 10) / 10
                : 0;

        // Today counts from daily raw
        const seen = new Set();
        let todayPresent = 0, todayAbsent = 0;
        dailyRaw.forEach(sess => {
            sess.records?.forEach(r => {
                if (!seen.has(r.studentId)) {
                    seen.add(r.studentId);
                    if (r.status === 'Present') todayPresent++;
                    else todayAbsent++;
                }
            });
        });
        return { totalStudents, totalSessions, overallPct, todayPresent, todayAbsent };
    }, [sectionSummary, studentList, dailyRaw, section, year, branch]);

    const lowAttendance = useMemo(() =>
        studentList.filter(s => s.percentage < 75).sort((a, b) => a.percentage - b.percentage),
        [studentList]
    );

    const currentSections = useMemo(() =>
        sectionSummary.filter(s =>
            (year === 'All' || s.year === year) &&
            (branch === 'All' || s.branch === branch)
        ).sort((a, b) => Number(a.section) - Number(b.section)),
        [sectionSummary, year, branch]
    );

    const filteredStudents = useMemo(() =>
        studentList.filter(s =>
            !search ||
            s.studentName?.toLowerCase().includes(search.toLowerCase()) ||
            s.studentId?.toLowerCase().includes(search.toLowerCase())
        ),
        [studentList, search]
    );

    /* Recent sessions as "messages" */
    const recentSessions = useMemo(() =>
        dailyRaw.slice(0, 4).map(sess => ({
            title: sess.subject || 'Session',
            sub: `Sec ${sess.section} · ${sess.facultyName || 'Faculty'}`,
            count: sess.records?.length || 0,
            present: sess.records?.filter(r => r.status === 'Present').length || 0
        })),
        [dailyRaw]
    );

    /* Static timetable items (replace with schedule data later) */
    const timetable = [
        { time: '10:00', subject: 'Morning Roll Call', section: `Yr${year} · Sec ${section}`, color: '#6366f1' },
        { time: '11:30', subject: 'Mid-Day Check', section: `${branch} Department`, color: '#22c55e' },
        { time: '14:00', subject: 'Afternoon Attendance', section: `Yr${year} · All Sections`, color: '#f59e0b' },
    ];

    /* ═══════════════════════════════════════════════════════ */
    return (
        <div className={`amd-shell ${isSidebarCollapsed ? 'collapsed' : ''} ${isEmbedded ? 'embedded' : ''}`}>

            {/* ══ SIDEBAR ══════════════════════════════════ */}
            {!isEmbedded && (
                <aside className={`amd-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
                    {/* Logo */}
                    <div className="amd-sidebar-logo" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} style={{ cursor: 'pointer' }}>
                        <div className="amd-logo-wrap" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="amd-logo-mark"><FaCheckCircle size={14} /></div>
                            {!isSidebarCollapsed && <div className="amd-logo-name">Vu UniVerse360 Attendance</div>}
                        </div>
                    </div>

                    {/* Profile card CTA */}
                    {!isSidebarCollapsed && (
                        <div className="amd-profile-cta">
                            <div className="amd-profile-av-wrap">
                                <div className="amd-profile-av" style={{ background: avatarColor(managerData?.name || 'A') }}>
                                    {initials(managerData?.name || 'A')}
                                </div>
                            </div>
                            <div className="amd-profile-title">{managerData?.name || 'Manager'}</div>
                            <button className="amd-profile-action" onClick={loadAll}>
                                <FaSyncAlt size={11} /> Refresh Data
                            </button>
                        </div>
                    )}

                    {/* Nav items */}
                    <nav className="amd-nav">
                        {[
                            { id: 'overview', icon: <FaTachometerAlt size={14} />, label: 'Dashboard' },
                            { id: 'mark', icon: <FaUserCheck size={14} />, label: 'Mark Attendance' },
                            { id: 'students', icon: <FaGraduationCap size={14} />, label: 'Students' },
                            { id: 'reports', icon: <FaChartLine size={14} />, label: 'Performance' },
                            { id: 'logs', icon: <FaFileAlt size={14} />, label: 'View Results' },
                            { id: 'notes', icon: <FaStickyNote size={14} />, label: 'Notes' },
                            { id: 'ai-agent', icon: <FaRobot size={14} />, label: 'Attend Agent' },
                        ].map(t => (
                            <button key={t.id} className={`amd-nav-item ${activeTab === t.id ? 'active' : ''}`}
                                onClick={(e) => { e.stopPropagation(); setActiveTab(t.id); }} title={isSidebarCollapsed ? t.label : ''}>
                                {t.icon}<span>{!isSidebarCollapsed && t.label}</span>
                            </button>
                        ))}
                    </nav>

                    {/* Footer */}
                    <div className="amd-sidebar-foot">
                        <div className="amd-org-name">
                            <div className="amd-org-icon">📚</div>
                            <span>Vu UniVerse360 System</span>
                        </div>
                        <button className="amd-logout" onClick={onLogout}><FaSignOutAlt size={11} /></button>
                    </div>
                </aside>
            )}

            {/* ══ MAIN CONTENT ═══════════════════════════ */}
            <main className="amd-main">

                {/* Top Header */}
                <header className="amd-header" style={{ background: isEmbedded ? 'transparent' : 'white', boxShadow: isEmbedded ? 'none' : '', padding: isEmbedded ? '1rem 0' : '1rem 1.5rem' }}>
                    <div className="amd-header-left">
                        {isEmbedded ? (
                            <div className="embedded-tabs" style={{ display: 'flex', gap: '0.75rem' }}>
                                {[
                                    { id: 'overview', label: 'Dashboard' },
                                    { id: 'mark', label: 'Mark' },
                                    { id: 'students', label: 'Students' },
                                    { id: 'reports', label: 'Performance' },
                                    { id: 'logs', label: 'Logs' },
                                    { id: 'ai-agent', label: 'Attend Agent' },
                                ].map(t => (
                                    <button
                                        key={t.id}
                                        className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
                                        onClick={() => setActiveTab(t.id)}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></div>
                                    <span style={{ fontSize: '0.6rem', fontWeight: 900, color: '#10b981', letterSpacing: '1px' }}>CLOUD SYNC LIVE</span>
                                </div>
                                <h1 className="amd-welcome">Welcome back, {(managerData?.name || 'Manager').split(' ')[0]} 👋</h1>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div className="amd-date-pill">
                                        <FaCalendarCheck size={10} style={{ marginRight: 6 }} />
                                        <span>{date === TODAY ? 'TODAY' : date}</span>
                                    </div>
                                    <p className="amd-date-line">{DATE_STR}</p>
                                    <span style={{ fontSize: '0.65rem', color: '#6366f1', background: '#f5f3ff', padding: '2px 8px', borderRadius: '12px', fontWeight: '800' }}>
                                        <FaSyncAlt size={8} style={{ marginRight: 4 }} className={loading ? 'amd-spinning' : ''} />
                                        Synced {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>

                            </div>
                        )}
                    </div>
                    <div className="amd-header-right">
                        <div className="amd-search-box">
                            <FaSearch size={12} style={{ opacity: 0.45 }} />
                            <input
                                placeholder="Search students…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <button className="amd-head-btn" onClick={loadAll} title="Refresh">
                            <FaSyncAlt size={13} className={loading ? 'amd-spinning' : ''} />
                        </button>
                        {!isEmbedded && (
                            <>
                                <button className="amd-head-btn"><FaBell size={13} /></button>
                                <button className="amd-head-btn"><FaCog size={13} /></button>
                                <div className="amd-head-avatar" style={{ background: avatarColor(managerData?.name || 'A') }}>
                                    {initials(managerData?.name || 'A')}
                                </div>
                            </>
                        )}
                    </div>
                </header>

                {/* Scrollable body */}
                <div className="amd-body">
                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            style={{ height: '100%' }}>

                            {/* ════ AI AGENT ══════════════════════ */}
                            {activeTab === 'ai-agent' && (
                                <div className="amd-sub-page" style={{ padding: 0, height: 'calc(100vh - 100px)' }}>
                                    <VuAiAgent onNavigate={setActiveTab} documentContext={{ title: "Attendance Manager", content: "Agent is assisting the attendance manager with student logs, absentee rates, and attendance statistics.", data: { sectionSummary } }} />
                                </div>
                            )}

                            {/* ════ MARK ATTENDANCE ══════════════════ */}
                            {activeTab === 'mark' && (
                                <MarkAttendanceTab
                                    year={year}
                                    branch={branch}
                                    section={section}
                                    date={date}
                                    onAttendanceMarked={loadAll}
                                />
                            )}

                            {/* ════ OVERVIEW ════════════════════ */}
                            {activeTab === 'overview' && (
                                <>
                                    {/* Filters row */}
                                    <div className="amd-filter-row">
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <p className="amd-section-title">Overview Dashboard</p>
                                            <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                {year === 'All' ? 'Consolidated All Years' : `Year ${year}`} • {branch === 'All' ? 'All Branches' : branch} • {section === 'All' ? 'All Sections' : `Section ${section}`}
                                            </span>
                                        </div>
                                        <div className="amd-filter-group">
                                            <select className="amd-fsel" value={year} onChange={e => setYear(e.target.value)}>
                                                {YEARS.map(y => <option key={y} value={y}>{y === 'All' ? 'All Years' : `Year ${y}`}</option>)}
                                            </select>
                                            <select className="amd-fsel" value={branch} onChange={e => setBranch(e.target.value)}>
                                                {BRANCHES.map(b => <option key={b} value={b}>{b === 'All' ? 'All Branches' : b}</option>)}
                                            </select>
                                            <select className="amd-fsel" value={section} onChange={e => setSection(e.target.value)}>
                                                {SECTIONS.map(s => <option key={s} value={s}>{s === 'All' ? 'All Sections' : `Section ${s}`}</option>)}
                                            </select>
                                            <input type="date" className="amd-fsel" value={date} onChange={e => setDate(e.target.value)} />
                                            <button className="amd-fbtn" onClick={handleExportStudents} title="Export Student List"><FaDownload size={11} /> List</button>
                                            <button className="amd-fbtn purple" onClick={handleExportAttendance} title="Export Detailed Attendance"><FaFileAlt size={11} /> Logs</button>
                                        </div>
                                    </div>

                                    {/* Year-Wise Distribution (New Feature) */}
                                    <div className="amd-year-dist-grid">
                                        {['1', '2', '3', '4'].map(y => {
                                            const yData = sectionSummary.filter(s => s.year === y);
                                            const yPct = yData.length > 0 ? Math.round(yData.reduce((acc, s) => acc + s.percentage, 0) / yData.length) : 0;
                                            const yCount = yData.reduce((acc, s) => acc + s.studentCount, 0);
                                            return (
                                                <div key={y} className={`amd-year-card ${year === y ? 'active' : ''}`} onClick={() => setYear(y)}>
                                                    <div className="amd-y-label">Year {y}</div>
                                                    <div className="amd-y-val">{yPct}%</div>
                                                    <div className="amd-y-sub">{yCount} Students</div>
                                                    <div className="amd-y-progress"><div style={{ width: `${yPct}%`, background: yPct < 75 ? '#ef4444' : '#22c55e' }} /></div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* ── Stat cards row ────────── */}
                                    <div className="amd-stats-row">
                                        {[
                                            { label: 'No of Students', val: stats.totalStudents, color: '#6366f1', icon: <FaUsers size={16} /> },
                                            { label: 'Present Today', val: stats.todayPresent, color: '#ef4444', icon: <FaCheckCircle size={16} /> },
                                            { label: 'Avg Attendance', val: `${stats.overallPct}%`, color: '#22c55e', icon: <FaUserCheck size={16} /> },
                                        ].map((s, i) => (
                                            <motion.div key={i} className="amd-stat-card"
                                                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.07 }}>
                                                <div className="amd-stat-icon" style={{ color: s.color, background: s.color + '14' }}>
                                                    {s.icon}
                                                </div>
                                                <div>
                                                    <div className="amd-stat-lbl">{s.label}</div>
                                                    <div className="amd-stat-val">{s.val}</div>
                                                </div>
                                                <div className="amd-stat-bar" style={{ background: s.color }} />
                                            </motion.div>
                                        ))}

                                        {/* Profile card (Improved info) */}
                                        <div className="amd-manager-card">
                                            <div className="amd-mc-av" style={{ background: avatarColor(managerData?.name || 'A') }}>
                                                {initials(managerData?.name || 'A')}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div className="amd-mc-name">{managerData?.name || 'Manager'}</div>
                                                <div className="amd-mc-email">{managerData?.email || 'manager@college.edu'}</div>
                                            </div>
                                            <div className="amd-mc-stats">
                                                <div className="amd-ms-row"><span>Sections</span><b>{currentSections.length}</b></div>
                                                <div className="amd-ms-row"><span>Roster</span><b>{stats.totalStudents}</b></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── Mid row ────────────────── */}
                                    <div className="amd-mid-row tri">
                                        {/* Sessions / "Messages" panel */}
                                        <div className="amd-panel">
                                            <div className="amd-panel-head">
                                                <span>Recent Sessions</span>
                                                <button className="amd-view-all-btn" onClick={() => setActiveTab('logs')}>View all</button>
                                            </div>
                                            {recentSessions.length ? recentSessions.map((s, i) => (
                                                <div key={i} className="amd-session-row">
                                                    <div className="amd-session-icon" style={{ background: avatarColor(s.title) }}>
                                                        <FaBook size={11} style={{ color: 'white' }} />
                                                    </div>
                                                    <div className="amd-session-info">
                                                        <div className="amd-session-title">{s.title}</div>
                                                        <div className="amd-session-sub">{s.sub}</div>
                                                    </div>
                                                    <div className={`amd-session-badge ${(s.present / s.count) >= 0.75 ? 'success' : 'risk'}`}>{s.present}/{s.count}</div>
                                                </div>
                                            )) : (
                                                <div className="amd-empty-small">No sessions today.</div>
                                            )}
                                        </div>

                                        <div className="amd-panel amd-panel-chart">
                                            <div className="amd-panel-head">
                                                <span>Performance</span>
                                            </div>
                                            <div className="amd-donut-wrap">
                                                {loading ? <div className="amd-spinner" /> :
                                                    <DonutChart pct={stats.overallPct} size={130} />}
                                            </div>
                                            <div className="amd-donut-legend compact">
                                                <span><i className="lx purple" /> Regular</span>
                                                <span><i className="lx amber" /> Low</span>
                                            </div>
                                        </div>

                                        {/* Mini Calendar Re-Added */}
                                        <div className="amd-panel amd-panel-cal">
                                            <div className="amd-panel-head">
                                                <span>Calendar</span>
                                            </div>
                                            <MiniCalendar selectedDate={date} onSelectDate={setDate} />
                                        </div>
                                    </div>

                                    {/* ── Bottom row ─────────────── */}
                                    <div className="amd-bottom-row">

                                        {/* Students table */}
                                        <div className="amd-panel amd-panel-table">
                                            <div className="amd-panel-head">
                                                <span>Section {section} Students roster</span>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <button className="amd-view-all-btn" onClick={() => setActiveTab('students')}>View all</button>
                                                </div>
                                            </div>
                                            <div className="amd-table-head-row">
                                                <span>#</span>
                                                <span>Student</span>
                                                <span>Classes</span>
                                                <span>Present</span>
                                                <span>Rate</span>
                                            </div>
                                            {loading ? <div className="amd-loading-pulse" /> :
                                                !filteredStudents.length ? (
                                                    <div className="amd-no-data">No students found for Yr{year} Sec{section}</div>
                                                ) : filteredStudents.slice(0, 5).map((s, i) => (
                                                    <div key={i} className={`amd-table-row clickable ${s.percentage < 75 ? 'at-risk' : ''}`} onClick={() => openStudentDetails(s)}>
                                                        <span className="amd-row-num">{i + 1}</span>
                                                        <div className="amd-row-student">
                                                            <div className="amd-row-av" style={{ background: avatarColor(s.studentName) }}>{initials(s.studentName)}</div>
                                                            <div className="amd-row-name-wrap">
                                                                <span className="amd-row-n">{s.studentName}</span>
                                                                <span className="amd-row-id">{s.studentId}</span>
                                                            </div>
                                                        </div>
                                                        <span className="amd-row-meta">{s.totalClasses}</span>
                                                        <span className="amd-row-meta green">{s.present}</span>
                                                        <span className={`amd-row-status ${s.percentage >= 75 ? 'good' : s.percentage >= 50 ? 'avg' : 'bad'}`}>
                                                            {s.percentage}%
                                                        </span>
                                                    </div>
                                                ))}
                                        </div>

                                        {/* Section Status (Batch Level) */}
                                        <div className="amd-panel amd-panel-sections-mini">
                                            <div className="amd-panel-head">
                                                <span>{year === 'All' ? 'Across All Years' : `Branch Overview (Yr ${year})`}</span>
                                                <button className="amd-view-all-btn" onClick={() => setActiveTab('reports')}>Reports</button>
                                            </div>
                                            <div className="amd-mini-sec-grid">
                                                {currentSections.map((sec, i) => (
                                                    <div key={i} className={`amd-mini-sec-card ${sec.percentage < 75 ? 'warning' : ''} ${sec.section === section ? 'active' : ''}`} onClick={() => setSection(sec.section)}>
                                                        <div className="amd-ms-top">
                                                            <b>Sec {sec.section}</b>
                                                            <span>{sec.percentage}%</span>
                                                        </div>
                                                        <div className="amd-pct-bar tint"><div style={{ width: `${sec.percentage}%`, background: sec.percentage >= 75 ? '#22c55e' : '#ef4444' }} /></div>
                                                        <div className="amd-ms-meta">{sec.studentCount} students</div>
                                                    </div>
                                                ))}
                                                {currentSections.length === 0 && <div className="amd-empty-small">No batch data.</div>}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* ════ STUDENTS ══════════════════ */}
                            {activeTab === 'students' && (
                                <div className="amd-sub-page">
                                    <div className="amd-sub-header">
                                        <h2>Students — Yr {year} · Sec {section} · {branch}</h2>
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                            <select className="amd-fsel" value={year} onChange={e => setYear(e.target.value)}>{YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}</select>
                                            <select className="amd-fsel" value={section} onChange={e => setSection(e.target.value)}>{SECTIONS.map(s => <option key={s} value={s}>Sec {s}</option>)}</select>
                                            <select className="amd-fsel" value={branch} onChange={e => setBranch(e.target.value)}>{BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}</select>
                                            <button className="amd-fbtn"><FaDownload size={11} /> Export</button>
                                        </div>
                                    </div>
                                    <div className="amd-chip-row">
                                        <span className="amd-chip purple"><FaUsers size={12} />{filteredStudents.length} Total</span>
                                        <span className="amd-chip green"><FaCheckCircle size={12} />{filteredStudents.filter(s => s.percentage >= 75).length} Regular</span>
                                        <span className="amd-chip red"><FaTimesCircle size={12} />{filteredStudents.filter(s => s.percentage < 75).length} At Risk</span>
                                        <span className="amd-chip blue"><FaUserCheck size={12} />{stats.overallPct}% Avg</span>
                                    </div>
                                    {loading ? <div className="amd-loading-pulse full" /> :
                                        !filteredStudents.length ? (
                                            <div className="amd-empty-state"><FaGraduationCap size={36} style={{ opacity: 0.2 }} /><p>No students found. Faculty must mark attendance first.</p></div>
                                        ) : (
                                            <div className="amd-full-table-wrap">
                                                <table className="amd-full-table">
                                                    <thead>
                                                        <tr><th>#</th><th>Student</th><th>ID</th><th>Present</th><th>Absent</th><th>Total Classes</th><th>Last Seen</th><th>Status</th><th>Attendance %</th></tr>
                                                    </thead>
                                                    <tbody>
                                                        {filteredStudents.map((s, i) => {
                                                            const risk = s.percentage < 75;
                                                            return (
                                                                <tr key={i} className={risk ? 'risk' : ''} onClick={() => openStudentDetails(s)} style={{ cursor: 'pointer' }}>
                                                                    <td>{i + 1}</td>
                                                                    <td>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                            <div className="amd-row-av sm" style={{ background: avatarColor(s.studentName) }}>{initials(s.studentName)}</div>
                                                                            <b>{s.studentName}</b>
                                                                        </div>
                                                                    </td>
                                                                    <td style={{ color: '#94a3b8', fontSize: '0.72rem' }}>{s.studentId}</td>
                                                                    <td><span className="amd-tbl-badge green">{s.present}</span></td>
                                                                    <td><span className="amd-tbl-badge red">{s.absent}</span></td>
                                                                    <td>{s.totalClasses}</td>
                                                                    <td style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{s.lastDate || '–'}</td>
                                                                    <td><span className={`amd-row-status ${s.lastStatus === 'Present' ? 'good' : 'bad'}`}>{s.lastStatus || '–'}</span></td>
                                                                    <td>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                            <div className="amd-pct-bar"><div style={{ width: `${s.percentage}%`, background: s.percentage >= 75 ? '#22c55e' : s.percentage >= 50 ? '#f59e0b' : '#ef4444' }} /></div>
                                                                            <span style={{ fontSize: '0.65rem', fontWeight: 900, color: risk ? '#ef4444' : '#22c55e' }}>{s.percentage.toFixed(1)}%</span>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                </div>
                            )}



                            {/* ════ PERFORMANCE ═══════════════ */}
                            {activeTab === 'reports' && (
                                <div className="amd-sub-page">
                                    <div className="amd-sub-header">
                                        <h2>Performance Analysis</h2>
                                        <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Year {year} • Section {section} • {branch}</p>
                                    </div>

                                    {/* Subject Wise Performance */}
                                    <div className="amd-panel mb-4">
                                        <div className="amd-panel-head">
                                            <span>Subject-wise Attendance (Semester View)</span>
                                        </div>
                                        <div className="amd-report-grid">
                                            {subjectSummary.map((sub, i) => (
                                                <div key={i} className="amd-report-card">
                                                    <div className="amd-report-info">
                                                        <div className="amd-report-main">
                                                            <div className="amd-report-icon" style={{ background: avatarColor(sub.subject) + '20', color: avatarColor(sub.subject) }}>
                                                                <FaBook size={14} />
                                                            </div>
                                                            <div>
                                                                <div className="amd-report-name">{sub.subject}</div>
                                                                <div className="amd-report-sub">{sub.sessionCount} Total Sessions</div>
                                                            </div>
                                                        </div>
                                                        <div className="amd-report-stat">
                                                            <span className="amd-report-pct">{sub.percentage}%</span>
                                                        </div>
                                                    </div>
                                                    <div className="amd-pct-bar wide">
                                                        <div style={{
                                                            width: `${sub.percentage}%`,
                                                            background: sub.percentage >= 75 ? '#22c55e' : sub.percentage >= 50 ? '#f59e0b' : '#ef4444'
                                                        }} />
                                                    </div>
                                                    <div className="amd-report-foot">
                                                        <span>{sub.presentCount} Present</span>
                                                        <span>{sub.absentCount} Absent</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {!subjectSummary.length && (
                                                <div className="amd-empty-state w-full">
                                                    <FaBook size={36} style={{ opacity: 0.1 }} />
                                                    <p>No subject data recorded for this section yet.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Subject Matrix View (New Feature) */}
                                    {matrixData && (
                                        <div className="amd-panel mt-6">
                                            <div className="amd-panel-head">
                                                <span>Student vs Subject Distribution Matrix (Yr {year} Sec {section})</span>
                                                <span style={{ fontSize: '0.65rem', color: '#6366f1', background: '#f5f3ff', padding: '2px 8px', borderRadius: '12px', fontWeight: '800' }}>
                                                    Cross-Subject Analysis Engine
                                                </span>
                                            </div>
                                            <div className="amd-matrix-wrap">
                                                <table className="amd-matrix-table">
                                                    <thead>
                                                        <tr>
                                                            <th className="sticky-col">#</th>
                                                            <th className="sticky-col name">Student Name</th>
                                                            {matrixData.subjects.map((sub, i) => (
                                                                <th key={i} title={sub}>{sub}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {Object.keys(matrixData.matrix).map((sid, idx) => {
                                                            const row = matrixData.matrix[sid];
                                                            return (
                                                                <tr key={sid}>
                                                                    <td className="sticky-col">{idx + 1}</td>
                                                                    <td className="sticky-col name">
                                                                        <div className="amd-matrix-name-cell">
                                                                            <b>{row.name}</b>
                                                                            <span>{sid}</span>
                                                                        </div>
                                                                    </td>
                                                                    {matrixData.subjects.map((sub, i) => {
                                                                        const cell = row.subjects[sub];
                                                                        if (!cell) return <td key={i} className="empty">–</td>;
                                                                        const risk = cell.pct < 75;
                                                                        return (
                                                                            <td key={i} className={risk ? 'risk' : 'good'} title={`${cell.p}/${cell.t} Classes`}>
                                                                                <div className="amd-matrix-cell">
                                                                                    <span className="pct">{cell.pct}%</span>
                                                                                    <span className="count">{cell.p}/{cell.t}</span>
                                                                                </div>
                                                                            </td>
                                                                        );
                                                                    })}
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Section Overview */}
                                    <div className="amd-panel mt-4">
                                        <div className="amd-panel-head">
                                            <span>Batch Comparison (All Sections)</span>
                                        </div>
                                        <div className="amd-sec-grid">
                                            {currentSections.map((sec, i) => {
                                                const regularCount = studentList.filter(s => s.percentage >= 75).length;
                                                const riskCount = studentList.filter(s => s.percentage < 75).length;
                                                return (
                                                    <div key={i} className={`amd-stat-card vertical ${sec.percentage < 75 ? 'at-risk' : ''}`}>
                                                        <div className="amd-sec-top">
                                                            <b>Section {sec.section}</b>
                                                            <span className={`amd-sec-badge ${sec.percentage >= 75 ? 'good' : 'warn'}`}>{sec.percentage}%</span>
                                                        </div>
                                                        <div className="amd-pct-bar wide"><div style={{ width: `${sec.percentage}%`, background: sec.percentage >= 75 ? '#22c55e' : sec.percentage >= 50 ? '#f59e0b' : '#ef4444' }} /></div>
                                                        <div style={{ display: 'flex', gap: '8px', fontSize: '0.68rem', fontWeight: 800, color: '#64748b', marginTop: 8, flexWrap: 'wrap' }}>
                                                            <span style={{ color: '#22c55e', background: '#f0fdf4', padding: '2px 6px', borderRadius: '4px' }}>{sec.presentCount} P</span>
                                                            <span style={{ color: '#ef4444', background: '#fef2f2', padding: '2px 6px', borderRadius: '4px' }}>{sec.absentCount} A</span>
                                                            <span style={{ background: '#f8fafc', padding: '2px 6px', borderRadius: '4px' }}>{sec.studentCount} Stud.</span>
                                                        </div>
                                                        {sec.percentage < 75 && (
                                                            <div style={{ marginTop: 8, padding: 8, background: '#fff1f2', borderRadius: 8, border: '1px solid #fecdd3', fontSize: '0.65rem', color: '#be123c', fontWeight: 700 }}>
                                                                ⚠️ Low Attendance Section
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            {!currentSections.length && <div className="amd-empty-state"><FaChartLine size={36} style={{ opacity: 0.2 }} /><p>No section comparison data available.</p></div>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ════ NOTES ═════════════════════ */}
                            {activeTab === 'notes' && (
                                <div className="amd-sub-page">
                                    <div className="amd-sub-header"><h2>Notes</h2></div>
                                    <div className="amd-panel" style={{ maxWidth: 600 }}>
                                        <textarea className="amd-notes-input large" placeholder="Type your attendance notes, remarks, or action plans here…" value={notes} onChange={e => setNotes(e.target.value)} />
                                    </div>
                                </div>
                            )}

                            {/* ════ LOGS ══════════════════════ */}
                            {(activeTab === 'logs') && (
                                <div className="amd-sub-page">
                                    <div className="amd-sub-header"><h2>Attendance Logs</h2></div>
                                    {loading ? <div className="amd-loading-pulse full" /> :
                                        !dailyRaw.length ? (
                                            <div className="amd-empty-state"><FaFileAlt size={36} style={{ opacity: 0.2 }} /><p>No attendance logs found for the selected filters.</p></div>
                                        ) : (
                                            <div className="amd-full-table-wrap">
                                                <table className="amd-full-table">
                                                    <thead><tr><th>#</th><th>Date</th><th>Subject</th><th>Section</th><th>Faculty</th><th>Present</th><th>Absent</th><th>Rate</th></tr></thead>
                                                    <tbody>
                                                        {dailyRaw.map((sess, i) => {
                                                            const p = sess.records?.filter(r => r.status === 'Present').length || 0;
                                                            const t = sess.records?.length || 1;
                                                            const pct = Math.round((p / t) * 100);
                                                            return (
                                                                <tr key={i}>
                                                                    <td>{i + 1}</td>
                                                                    <td style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{sess.date}</td>
                                                                    <td><b>{sess.subject}</b></td>
                                                                    <td>Yr{sess.year}·Br{sess.branch}·Sc{sess.section}</td>
                                                                    <td style={{ color: '#64748b' }}>{sess.facultyName}</td>
                                                                    <td><span className="amd-tbl-badge green">{p}</span></td>
                                                                    <td><span className="amd-tbl-badge red">{t - p}</span></td>
                                                                    <td>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                            <div className="amd-pct-bar"><div style={{ width: `${pct}%`, background: pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444' }} /></div>
                                                                            <span style={{ fontSize: '0.62rem', fontWeight: 900, color: pct >= 75 ? '#22c55e' : '#ef4444' }}>{pct}%</span>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Student Details Modal */}
                {
                    selectedStudent && (
                        <div className="amd-modal-overlay" onClick={() => setSelectedStudent(null)}>
                            <motion.div
                                className="amd-modal"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="amd-modal-head">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                                        <div className="amd-row-av" style={{ background: avatarColor(selectedStudent.studentName) }}>{initials(selectedStudent.studentName)}</div>
                                        <div>
                                            <h3 className="m-0">{selectedStudent.studentName}</h3>
                                            <p className="amd-modal-sub">{selectedStudent.studentId} · Yr{year}·Br{branch}·Sc{section}</p>
                                        </div>
                                    </div>
                                    <button className="amd-modal-close" onClick={() => setSelectedStudent(null)}>✕</button>
                                </div>

                                <div className="amd-modal-body">
                                    <h4>Subject-wise Attendance</h4>
                                    <div className="amd-subject-list">
                                        {studentSubjectSummary.map((sub, idx) => (
                                            <div key={idx} className="amd-subject-row">
                                                <div className="amd-subject-info">
                                                    <span className="amd-subject-name">{sub.subject}</span>
                                                    <span className="amd-subject-meta">{sub.present}/{sub.totalClasses} classes</span>
                                                </div>
                                                <div className="amd-subject-stat">
                                                    <div className="amd-pct-bar wide"><div style={{ width: `${sub.percentage}%`, background: sub.percentage >= 75 ? '#22c55e' : '#ef4444' }} /></div>
                                                    <span className="amd-subject-pct">{sub.percentage}%</span>
                                                </div>
                                            </div>
                                        ))}
                                        {studentSubjectSummary.length === 0 && <p className="amd-empty-text">No subject data available.</p>}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </main >
        </div >
    );
};

export default AttendanceManagerDashboard;
