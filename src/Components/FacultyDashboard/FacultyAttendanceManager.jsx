import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './FacultyDashboard.css';
import './FacultyAttendanceManager.css';
import { FaCalendarAlt, FaUserCheck, FaHistory, FaUsers, FaExclamationTriangle, FaClock } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { apiGet, apiPost } from '../../utils/apiClient';
import sseClient from '../../utils/sseClient';

/**
 * ATTENDANCE COMMAND HUB
 * Centralized executive interface for real-time student presence monitoring and hourly session diagnostics.
 */
const FacultyAttendanceManager = ({ facultyId, subject, year, sections, currentFaculty, openAiWithPrompt, allStudentsList }) => {
    // 1. Setup Faculty Data Context
    const facultyData = useMemo(() => {
        if (currentFaculty && Object.keys(currentFaculty).length > 0) return currentFaculty;
        return {
            facultyId, subject, year,
            sections: Array.isArray(sections) ? sections.map(s => ({ year: String(year), section: String(s) })) : [],
            assignments: Array.isArray(sections) ? sections.map(s => ({ year: String(year), section: String(s), subject })) : []
        };
    }, [currentFaculty, facultyId, subject, year, sections]);

    // 2. State Variables
    const [availableSections, setAvailableSections] = useState([]);
    const [selectedSection, setSelectedSection] = useState({ year: '', section: '', subject: '' });
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    // eslint-disable-next-line no-unused-vars
    const [scheduleSlots, setScheduleSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null); // { hour: 1, time: '09:00', subject: 'Math' }

    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({}); // Current marking state { studentId: 'Present' }
    const [dailyLog, setDailyLog] = useState({}); // { studentId: [{ hour: 1, status: 'Present' }] }

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [viewMode, setViewMode] = useState('take'); // 'take' | 'history'

    // 3. Initialize Sections
    const initializeSections = useCallback(() => {
        const extracted = extractSectionsFromData(facultyData);
        setAvailableSections(extracted);
        if (extracted.length > 0) {
            setSelectedSection(extracted[0]);
        }
    }, [facultyData]);

    const extractSectionsFromData = (data) => {
        if (!data) return [];
        if (data.assignments?.length > 0) {
            const map = new Map();
            data.assignments.forEach(a => {
                const y = parseInt(a.year || a.Year);
                const s = String(a.section || a.Section || 'A').toUpperCase();
                const b = String(a.branch || a.Branch || 'CSE').toUpperCase();
                const subj = a.subject || a.Subject || data.subject || 'General';

                // Key needs to include branch now to differentiate
                if (y) map.set(`${y}|${s}|${b}|${subj}`, { year: y, section: s, branch: b, subject: subj });
            });
            return Array.from(map.values());
        }
        return [];
    };

    useEffect(() => { initializeSections(); }, [initializeSections]);


    // 3.5 Initialize Scheduler Slots (Bug Fix: Was missing population)
    useEffect(() => {
        const slots = [
            { id: 1, hour: 1, time: '09:00 AM', subject: selectedSection.subject || 'General' },
            { id: 2, hour: 2, time: '10:00 AM', subject: selectedSection.subject || 'General' },
            { id: 3, hour: 3, time: '11:00 AM', subject: selectedSection.subject || 'General' },
            { id: 4, hour: 4, time: '12:00 PM', subject: selectedSection.subject || 'General' },
            { id: 5, hour: 5, time: '01:00 PM', subject: selectedSection.subject || 'General' },
            { id: 6, hour: 6, time: '02:00 PM', subject: selectedSection.subject || 'General' },
            { id: 7, hour: 7, time: '03:00 PM', subject: selectedSection.subject || 'General' },
            { id: 8, hour: 8, time: '04:00 PM', subject: selectedSection.subject || 'General' }
        ];
        setScheduleSlots(slots);

        // Auto-select current slot based on time
        const currentHour = new Date().getHours();
        const adjustedHour = currentHour > 12 ? currentHour - 12 : currentHour;
        const found = slots.find(s => s.hour === adjustedHour) || slots[0];
        setSelectedSlot(found);
    }, [selectedSection]);

    // 4. Fetch Activity Log (Overall daily activity for this section)
    const fetchDailyActivity = useCallback(async () => {
        if (!selectedSection.year || !date) return;
        try {
            // Fetch ALL attendance for this section on this date
            const query = `date=${date}&section=${selectedSection.section}&year=${selectedSection.year}&branch=${selectedSection.branch || 'CSE'}`;
            const res = await apiGet(`/api/attendance/all?${query}`);

            // Process into a map: { studentId: [ { hour: 1, status: 'P' }, ... ] }
            const log = {};
            if (Array.isArray(res)) {
                res.forEach(group => {
                    // group is by subject/section, contains records
                    group.records.forEach(r => {
                        if (!log[r.studentId]) log[r.studentId] = [];
                        // r might have 'hour' if we successfully saved it before
                        // If not, we might not be able to plot it perfectly, but let's try.
                        log[r.studentId].push({
                            hour: r.hour || 0, // 0 if unknown
                            status: r.status,
                            subject: group.subject
                        });
                    });
                });
            }
            setDailyLog(log);
        } catch (e) { console.error("Daily log error:", e); }
    }, [selectedSection, date]);

    // 5. Real-time Update Listener (Moved here to avoid hoisting ReferenceError)
    useEffect(() => {
        const unsub = sseClient.onUpdate((ev) => {
            if (ev && ev.resource === 'attendance') {
                console.log('📡 Faculty Attendance Refresh Triggered via SSE');
                fetchDailyActivity();
            }
        });
        return () => unsub();
    }, [selectedSection, date, fetchDailyActivity]);


    // 6. Main Data Fetch (Students + Current Slot Attendance)
    // 6. Main Data Fetch (Students + Current Slot Attendance)
    const fetchData = useCallback(async () => {
        if (!selectedSection.year || !selectedSection.section) return;
        setLoading(true);
        try {
            // Use cached student list if available
            let studentList = [];
            if (allStudentsList && allStudentsList.length > 0) {
                // Filter from cached list
                studentList = allStudentsList.filter(s => {
                    const sYear = String(s.year || s.Year);
                    const sSec = String(s.section || s.Section).toUpperCase();
                    const sBranch = String(s.branch || s.Branch || '').toUpperCase();

                    const tYear = String(selectedSection.year);
                    const tSec = String(selectedSection.section).toUpperCase();
                    const tBranch = String(selectedSection.branch || 'CSE').toUpperCase();

                    const matchesBranch = tBranch === 'ALL' || tBranch === 'COMMON' || sBranch === tBranch;

                    return sYear === tYear && (tSec === 'ALL' || sSec === tSec) && matchesBranch;
                });
            }

            // Fallback to API if cache is empty
            if (studentList.length === 0) {
                const query = `year=${selectedSection.year}&section=${selectedSection.section}&branch=${selectedSection.branch || 'CSE'}`;
                const res = await apiGet(`/api/students?${query}`);
                if (res && res.success && res.students) {
                    studentList = res.students;
                } else if (Array.isArray(res)) {
                    studentList = res;
                }
            }

            setStudents(studentList);
        } catch (e) {
            console.error("Main fetch error:", e);
        } finally {
            setLoading(false);
        }
    }, [selectedSection, allStudentsList]);

    // Trigger Initial Fetch
    useEffect(() => {
        if (selectedSection.year && selectedSection.section) {
            fetchData();
            fetchDailyActivity();
        }
    }, [selectedSection, date, fetchData, fetchDailyActivity]);


    // Sync Attendance State with Selected Slot
    useEffect(() => {
        if (!selectedSlot || !students.length) return;

        const newAttendance = {};
        // Default to 'Present'
        students.forEach(s => newAttendance[s.sid || s.id] = 'Present');

        // Overwrite with existing data from dailyLog
        Object.keys(dailyLog).forEach(sid => {
            const studentRecords = dailyLog[sid];
            // Find record matching current hour/subject
            const match = studentRecords.find(r => r.hour === selectedSlot.hour || r.subject === selectedSlot.subject);
            if (match) {
                newAttendance[sid] = match.status;
            }
        });
        setAttendance(newAttendance);

    }, [selectedSlot, dailyLog, students]);


    // Handlers
    const handleStatusChange = (sid, status) => {
        setAttendance(prev => ({ ...prev, [sid]: status }));
    };

    const markAll = (status) => {
        const newStatus = {};
        students.forEach(s => newStatus[s.sid || s.id] = status);
        setAttendance(newStatus);
    };

    const handleSubmit = async () => {
        setSaving(true);
        const records = students.map(s => ({
            studentId: s.sid || s.id,
            studentName: s.studentName || s.name,
            status: attendance[s.sid || s.id] || 'Present',
            hour: selectedSlot?.hour // Critical: Send the hour
        }));

        try {
            await apiPost('/api/attendance', {
                date,
                subject: selectedSlot?.subject || selectedSection.subject || 'General',
                year: selectedSection.year,
                section: selectedSection.section,
                branch: selectedSection.branch || 'CSE',
                facultyId: facultyData.facultyId,
                facultyName: facultyData.name,
                records
            });
            alert("Attendance Commit Successful.");
            fetchDailyActivity(); // Refresh logs
        } catch (e) {
            alert('Save Failed: ' + e.message);
        } finally {
            setSaving(false);
        }
    };


    // Render Helpers

    // Calculate Stats for current view
    const stats = useMemo(() => {
        const total = students.length;
        const present = Object.values(attendance).filter(v => v === 'Present').length;
        return { total, present, absent: total - present, pct: total ? Math.round((present / total) * 100) : 0 };
    }, [attendance, students]);


    if (availableSections.length === 0) {
        return (
            <div className="attendance-manager f-center-empty">
                <FaExclamationTriangle size={48} color="#f59e0b" />
                <h3>No Assigned Sections</h3>
                <p>Contact admin to assign classes.</p>
            </div>
        );
    }

    return (
        <div className="attendance-manager animate-fade-in">
            <header className="f-view-header">
                <div>
                    <h2>ATTENDANCE <span>COMMAND HUB</span></h2>
                    <p className="nexus-subtitle">Live executive monitoring and session-based presence diagnostics</p>
                </div>
                <div className="nexus-glass-pills" style={{ marginBottom: 0 }}>
                    <button className={`nexus-pill ${viewMode === 'take' ? 'active' : ''}`} onClick={() => setViewMode('take')}>
                        <FaUserCheck /> ACTIVITY
                    </button>
                    <button className={`nexus-pill ${viewMode === 'history' ? 'active' : ''}`} onClick={() => setViewMode('history')}>
                        <FaHistory /> LOGS
                    </button>
                </div>
            </header>

            {/* CONTROLS BAR */}
            <div className="f-attendance-controls animate-slide-up">

                {/* 1. Date Selector */}
                <div className="control-item">
                    <div className="control-icon-box" style={{ background: '#eff6ff', color: 'var(--ach-primary)' }}><FaCalendarAlt /></div>
                    <div className="control-field">
                        <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, color: 'var(--ach-text-muted)', marginBottom: '2px' }}>DATE</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
                    </div>
                </div>

                {/* 2. Section Selector */}
                <div className="control-item">
                    <div className="control-icon-box" style={{ background: '#f0fdf4', color: '#15803d' }}><FaUsers /></div>
                    <div className="control-field">
                        <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, color: 'var(--ach-text-muted)', marginBottom: '2px' }}>SELECT CLASS</label>
                        <select
                            value={`${selectedSection.year}|${selectedSection.section}|${selectedSection.branch || 'CSE'}|${selectedSection.subject}`}
                            onChange={(e) => {
                                const [y, s, b, ...subjParts] = e.target.value.split('|');
                                const subj = subjParts.join('|');
                                const found = availableSections.find(sec =>
                                    String(sec.year) === y &&
                                    sec.section === s &&
                                    (sec.branch || 'CSE') === b &&
                                    sec.subject === subj
                                );
                                if (found) setSelectedSection(found);
                            }}
                        >
                            {availableSections.map((s, i) => (
                                <option key={i} value={`${s.year}|${s.section}|${s.branch || 'CSE'}|${s.subject}`}>
                                    {s.branch} - Y{s.year} ({s.section}) - {s.subject}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 3. Slot Selector */}
                <div className="control-item" style={{ flex: 1, overflowX: 'auto' }}>
                    <div className="control-icon-box" style={{ background: '#fff7ed', color: '#ea580c' }}><FaClock /></div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {scheduleSlots.map(slot => (
                            <button
                                key={slot.id}
                                onClick={() => setSelectedSlot(slot)}
                                className={`slot-pill ${selectedSlot?.id === slot.id ? 'active' : ''}`}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '12px',
                                    border: '1.5px solid var(--ach-border)',
                                    background: 'white',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    minWidth: '110px'
                                }}
                            >
                                <div style={{ fontSize: '0.8rem', fontWeight: 900 }}>{slot.time}</div>
                                <div style={{ fontSize: '0.6rem', opacity: 0.6, fontWeight: 700 }}>{slot.subject}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* MAIN ROSTER AREA */}
            <div style={{ position: 'relative', minHeight: '300px' }}>
                {loading && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', zIndex: 10, backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="spinner"></div>
                    </div>
                )}

                {/* Stats Bar */}
                <div className="f-weekly-stats">
                    <div className="f-stat-card">
                        <span className="val" style={{ color: 'var(--ach-success)' }}>{stats.present}</span>
                        <span className="lab">STUDENTS PRESENT</span>
                    </div>
                    <div className="f-stat-card">
                        <span className="val" style={{ color: 'var(--ach-danger)' }}>{stats.absent}</span>
                        <span className="lab">STUDENTS ABSENT</span>
                    </div>
                    <div className="f-stat-card">
                        <span className="val" style={{ color: 'var(--ach-primary)' }}>{stats.pct}%</span>
                        <span className="lab">ATTENDANCE RATE</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <button onClick={() => markAll('Present')} className="nexus-btn-primary" style={{ flex: 1, fontSize: '0.7rem', padding: '0.5rem', background: 'var(--ach-success)' }}>MARK ALL PRESENT</button>
                        <button onClick={() => markAll('Absent')} className="nexus-btn-primary" style={{ flex: 1, fontSize: '0.7rem', padding: '0.5rem', background: 'var(--ach-danger)' }}>MARK ALL ABSENT</button>
                    </div>
                </div>

                {/* List */}
                {students.length === 0 && !loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--ach-text-muted)', background: 'var(--ach-card)', borderRadius: '24px', border: '1.5px dashed var(--ach-border)' }}>
                        <FaUsers size={64} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--ach-text-main)' }}>No Roster Found</h3>
                        <p style={{ fontWeight: 600 }}>Filtering: Branch {selectedSection.branch} • Year {selectedSection.year} • Section {selectedSection.section}</p>
                        <button onClick={fetchData} className="nexus-btn-primary" style={{ marginTop: '1.5rem' }}>
                            Force Sync Student Registry
                        </button>
                    </div>
                ) : (
                    <div className="f-roster-list">
                        {students.map((student, idx) => {
                            const isAbsent = attendance[student.sid || student.id] === 'Absent';
                            const history = dailyLog[student.sid || student.id] || [];

                            return (
                                <motion.div
                                    layout
                                    key={student.sid || student.id}
                                    className={`f-node-card ${isAbsent ? 'absent-node' : ''}`}
                                    style={{
                                        padding: '1.25rem',
                                        background: isAbsent ? '#fff1f2' : 'white',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => handleStatusChange(student.sid || student.id, isAbsent ? 'Present' : 'Absent')}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <div className="sid-pill" style={{ minWidth: '80px', textAlign: 'center', padding: '0.4rem', background: 'var(--ach-card)', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 900, border: '1.5px solid var(--ach-border)' }}>
                                                {student.sid}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 850, color: 'var(--ach-text-main)', fontSize: '1rem' }}>{student.studentName || student.name}</div>
                                                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--ach-text-muted)', textTransform: 'uppercase' }}>SEC {student.section || student.Section || 'N/A'} • {student.branch || student.Branch || 'CSE'}</div>
                                            </div>
                                        </div>
                                        <div className={`status-badge ${isAbsent ? 'absent' : 'present'}`} style={{
                                            padding: '0.5rem 1rem', borderRadius: 10,
                                            fontSize: '0.7rem', fontWeight: 950,
                                            background: isAbsent ? 'var(--ach-danger)' : 'var(--ach-success)',
                                            color: 'white'
                                        }}>
                                            {isAbsent ? 'ABSENT' : 'PRESENT'}
                                        </div>
                                    </div>

                                    {/* Hourly Activity Log */}
                                    <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--ach-border)', display: 'flex', gap: '6px', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--ach-text-muted)', marginRight: '10px' }}>ACTIVITY TRACK:</span>
                                        {scheduleSlots.map(slot => {
                                            const rec = history.find(h => h.hour === slot.hour);
                                            let color = '#e2e8f0';
                                            if (rec) color = rec.status === 'Present' ? 'var(--ach-success)' : 'var(--ach-danger)';

                                            const isCurrent = selectedSlot?.hour === slot.hour;

                                            return (
                                                <div key={slot.hour} className="daily-log-marker" title={`Hour ${slot.hour}: ${rec ? rec.status : 'No Data'}`} style={{
                                                    background: color,
                                                    border: isCurrent ? '2px solid var(--ach-primary)' : 'none',
                                                    transform: isCurrent ? 'scale(1.4)' : 'scale(1)',
                                                    boxShadow: isCurrent ? '0 0 8px rgba(79, 70, 229, 0.4)' : 'none'
                                                }}></div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            <footer className="f-submit-footer">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--ach-text-muted)', textTransform: 'uppercase' }}>Session Context</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 950, color: 'var(--ach-text-main)' }}>
                        {selectedSlot?.subject || selectedSection.subject} <span style={{ color: 'var(--ach-primary)' }}>• Hour {selectedSlot?.hour}</span>
                    </span>
                </div>
                <button
                    className="nexus-btn-primary"
                    onClick={handleSubmit}
                    disabled={saving}
                >
                    {saving ? 'Synchronizing Pipeline...' : 'Commit Session Log'}
                </button>
            </footer>
        </div>
    );
};

export default FacultyAttendanceManager;
