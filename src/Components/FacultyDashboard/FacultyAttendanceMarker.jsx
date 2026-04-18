import React, { useState } from 'react';
import { apiPost, apiGet } from '../../utils/apiClient';
import { FaCheckCircle, FaTimesCircle, FaClock, FaUsers, FaBook, FaCalendarDay, FaSearch } from 'react-icons/fa';
import './FacultyAttendanceMarker.css';

/**
 * SESSION ATTENDANCE TRACKER
 * Sophisticated interface for orchestrating hourly academic attendance and roster verification.
 */
const FacultyAttendanceMarker = ({ facultyData, allCourses = [], allStudentsList, myClasses = [] }) => {
    const facultyId = facultyData?.facultyId || facultyData?.id;
    const facultyName = facultyData?.name || facultyData?.facultyName;

    // Form state
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [subject, setSubject] = useState('');
    const [section, setSection] = useState('');
    const [classDate, setClassDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedHour, setSelectedHour] = useState(1);
    const [selectedTopic, setSelectedTopic] = useState('');
    const [year, setYear] = useState('');
    const [branch, setBranch] = useState('');

    // Data state
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const setStatus = (studentId, status) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const filteredStudents = React.useMemo(() => {
        return students.filter(s =>
            (s.studentName || s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.sid || s.studentId || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [students, searchTerm]);

    // Extract topics from curriculum for the selected subject
    const availableTopics = React.useMemo(() => {
        if (!subject || !allCourses.length) return [];
        const courseObj = allCourses.find(c =>
            (c.name?.toLowerCase() === subject.toLowerCase()) ||
            (c.subject?.toLowerCase() === subject.toLowerCase()) ||
            (c.code?.toLowerCase().includes(subject.toLowerCase()))
        );
        if (!courseObj || !courseObj.modules) return [];

        let topics = [];
        courseObj.modules.forEach(mod => {
            if (mod.units) {
                mod.units.forEach(unit => {
                    topics.push({ id: unit.id, name: unit.name, module: mod.name });
                    if (unit.topics) {
                        unit.topics.forEach(t => topics.push({ id: t.id, name: t.name, module: mod.name, parent: unit.name }));
                    }
                });
            }
        });
        return topics;
    }, [subject, allCourses]);

    // Unified assignments (grouped by subject and year to allow "Overall" marking)
    const unifiedAssignments = React.useMemo(() => {
        return myClasses;
    }, [myClasses]);

    const fetchStudents = React.useCallback(async () => {
        if (!facultyId) return;
        setLoading(true);
        setError(null);
        try {
            let studentList = (allStudentsList && allStudentsList.length > 0) ? allStudentsList : [];
            if (studentList.length === 0) {
                const res = await apiGet(`/api/faculty-stats/${facultyId}/students`);
                studentList = Array.isArray(res) ? res : (res?.students || []);
            }

            if (selectedAssignment) {
                studentList = studentList.filter(s => {
                    const sYear = String(s.year || s.Year);
                    const sSec = String(s.section || s.Section).toUpperCase();
                    const sBranch = String(s.branch || s.Branch || '').toUpperCase();

                    const tYear = String(selectedAssignment.year);
                    const tBranch = String(selectedAssignment.branch || '').toUpperCase();

                    // Specific logic for "OVERALL" vs single section
                    let tSections = [];
                    if (section === 'OVERALL') {
                        tSections = Array.isArray(selectedAssignment.sections)
                            ? selectedAssignment.sections.map(s => String(s).toUpperCase())
                            : [String(selectedAssignment.section || section).toUpperCase()];
                    } else {
                        tSections = [String(section).toUpperCase()];
                    }

                    const matchesBranch = !tBranch || tBranch === 'ALL' || tBranch === 'COMMON' || sBranch === tBranch;
                    const matchesSection = tSections.includes(sSec);

                    return sYear === tYear && matchesBranch && matchesSection;
                });
            }

            setStudents(studentList);
            const initialAttendance = {};
            studentList.forEach(s => {
                initialAttendance[s.sid || s.studentId || s._id] = 'Present';
            });
            setAttendance(initialAttendance);
        } catch (err) {
            setError('Failed to fetch students.');
        } finally {
            setLoading(false);
        }
    }, [facultyId, selectedAssignment, allStudentsList, section]);

    React.useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    const handleAssignmentChange = (e) => {
        const value = e.target.value;
        if (value === '') {
            setSelectedAssignment(null);
            setSubject('');
            setSection('');
            setYear('');
            setBranch('');
            return;
        }

        if (value.startsWith('overall-')) {
            const index = parseInt(value.replace('overall-', ''));
            const assign = unifiedAssignments[index];
            setSelectedAssignment(assign);
            setSubject(assign.subject);
            setSection('OVERALL');
            setYear(assign.year);
            setBranch(assign.branch || 'CSE');
        } else {
            const [assignIndex, secIndex] = value.split('|').map(Number);
            const assign = unifiedAssignments[assignIndex];
            const sec = assign.sections[secIndex];
            setSelectedAssignment({ ...assign, section: sec });
            setSubject(assign.subject);
            setSection(sec);
            setYear(assign.year);
            setBranch(assign.branch || 'CSE');
        }
    };


    const bulkMarkPresent = () => {
        const updated = {};
        students.forEach(s => { updated[s.sid || s.studentId || s._id] = 'Present'; });
        setAttendance(updated);
    };

    const bulkMarkAbsent = () => {
        const updated = {};
        students.forEach(s => { updated[s.sid || s.studentId || s._id] = 'Absent'; });
        setAttendance(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!subject || !section) {
            setError('Please select an assignment');
            return;
        }

        setLoading(true);
        setSuccessMessage('');
        try {
            const records = students.map(student => ({
                studentId: student.sid || student.studentId || student._id,
                studentName: student.studentName || student.name,
                branch: student.branch || student.Branch || branch,
                year: student.year || student.Year || year,
                section: student.section || student.Section || section,
                status: attendance[student.sid || student.studentId || student._id] || 'Present',
                remarks: `Marked for hour ${selectedHour}`
            }));

            const targetSections = section === 'OVERALL' ? selectedAssignment.sections : [section];

            // Submit for each section or unified if API supports multiple
            // Our API supports single section but we can loop or the API handles it
            // Let's check api/attendance in attendanceRoutes.js - it takes 'section' as string.
            // If section is 'OVERALL', we might need to send multiple requests or update API.
            // Actually, many systems allow comma separated sections.

            await apiPost('/api/attendance', {
                date: classDate,
                subject,
                year,
                section: targetSections.join(','),
                branch,
                hour: selectedHour,
                topic: selectedTopic,
                facultyId,
                facultyName,
                records
            });

            setSuccessMessage(`✅ Attendance marked successfully for Hour ${selectedHour}`);
            setSubmitted(true);
            setTimeout(() => {
                setSubmitted(false);
                setSuccessMessage('');
            }, 3000);
        } catch (err) {
            setError('Failed to submit: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const presentCount = Object.values(attendance).filter(s => s === 'Present').length;
    const absentCount = Object.values(attendance).filter(s => s === 'Absent').length;
    const leaveCount = Object.values(attendance).filter(s => s === 'Leave').length;
    const lateCount = Object.values(attendance).filter(s => s === 'Late').length;

    return (
        <div className="faculty-marking-container animate-fade-in">
            <div className="marking-header">
                <h1><FaClock /> SESSION ATTENDANCE <span>TRACKER</span></h1>
                <p className="nexus-subtitle">Precision roster verification and hourly attendance logging for {facultyName}</p>
            </div>

            <form onSubmit={handleSubmit} className="marking-form">
                <div className="form-section">
                    <div className="form-header-v6">
                        <div className="icon-box-v6" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                            <FaBook />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontWeight: 950, fontSize: '1.1rem' }}>SESSION CONFIGURATION</h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', fontWeight: 800 }}>Define the academic scope for this attendance session</p>
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-group flex-2">
                            <label>Assigned Class & Subject <span className="required">*</span></label>
                            <select onChange={handleAssignmentChange} required value={selectedAssignment ? (section === 'OVERALL' ? `overall-${unifiedAssignments.indexOf(selectedAssignment)}` : `${unifiedAssignments.indexOf(unifiedAssignments.find(u => u.subject === subject && u.year === year))}|${unifiedAssignments.find(u => u.subject === subject && u.year === year)?.sections.indexOf(section)}`) : ''}>
                                <option value="">Select Assignment...</option>
                                {unifiedAssignments.map((a, i) => (
                                    <React.Fragment key={i}>
                                        <option value={`overall-${i}`} style={{ fontWeight: 'bold', color: '#4f46e5', background: '#f8fafc' }}>
                                            OVERALL SECTIONS - {a.subject} ({a.branch})
                                        </option>
                                        {a.sections.map((sec, si) => (
                                            <option key={`${i}-${si}`} value={`${i}|${si}`}>
                                                &nbsp;&nbsp;&nbsp;Section {sec} - {a.subject}
                                            </option>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label><FaCalendarDay /> Date</label>
                            <input type="date" value={classDate} onChange={(e) => setClassDate(e.target.value)} />
                        </div>

                        <div className="form-group">
                            <label><FaClock /> Class Hour</label>
                            <select value={selectedHour} onChange={(e) => setSelectedHour(parseInt(e.target.value))}>
                                {Array.from({ length: 8 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>Hour {i + 1}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group flex-2">
                            <label><FaBook /> Teaching Topic (Curriculum Progress)</label>
                            <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}>
                                <option value="">Select Topic from Syllabus...</option>
                                {availableTopics.map((t, i) => (
                                    <option key={i} value={t.name}>
                                        {t.module} {t.parent ? `> ${t.parent} >` : ''} {t.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                {students.length > 0 && (
                    <div className="statistics">
                        <div className="stat-card green">
                            <div className="stat-icon"><FaCheckCircle /></div>
                            <div className="stat-value">{presentCount}</div>
                            <div className="stat-label">Present</div>
                        </div>
                        <div className="stat-card red">
                            <div className="stat-icon"><FaTimesCircle /></div>
                            <div className="stat-value">{absentCount}</div>
                            <div className="stat-label">Absent</div>
                        </div>
                        <div className="stat-card yellow" style={{ color: '#f59e0b' }}>
                            <div className="stat-icon"><FaClock /></div>
                            <div className="stat-value">{leaveCount}</div>
                            <div className="stat-label">Leave</div>
                        </div>
                        <div className="stat-card blue" style={{ color: '#0ea5e9' }}>
                            <div className="stat-icon"><FaClock /></div>
                            <div className="stat-value">{lateCount}</div>
                            <div className="stat-label">Late</div>
                        </div>
                        <div className="stat-card total">
                            <div className="stat-icon"><FaUsers /></div>
                            <div className="stat-value">{students.length}</div>
                            <div className="stat-label">Total</div>
                        </div>
                    </div>
                )}

                {/* Bulk Actions */}
                {students.length > 0 && (
                    <div className="bulk-actions">
                        <button
                            type="button"
                            className="bulk-btn mark-all-present"
                            onClick={bulkMarkPresent}
                        >
                            Mark All Present
                        </button>
                        <button
                            type="button"
                            className="bulk-btn mark-all-absent"
                            onClick={bulkMarkAbsent}
                        >
                            Mark All Absent
                        </button>
                    </div>
                )}

                {/* Student List */}
                {loading ? (
                    <div className="loading">
                        <div className="loading-spinner-small"></div>
                        <p>Loading class roster...</p>
                    </div>
                ) : students.length > 0 ? (
                    <div className="student-list-section">
                        <div className="list-header">
                            <h3>Class Roster <span className="count">({students.length} students)</span></h3>
                            <div className="search-wrapper">
                                <FaSearch />
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Find student by name or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="student-list">
                            {filteredStudents.map(student => {
                                const sid = student.sid || student.studentId || student._id;
                                const status = attendance[sid] || 'Present';
                                return (
                                    <div key={sid} className={`student-row ${status.toLowerCase()}`}>
                                        <div className="student-info">
                                            <div className="sid-pill">
                                                {sid}
                                                <span className="sec-badge" style={{ marginLeft: '8px', opacity: 0.6, fontSize: '0.65rem', borderLeft: '1px solid currentColor', paddingLeft: '8px' }}>
                                                    SEC {student.section || student.Section || 'N/A'}
                                                </span>
                                            </div>
                                            <div className="name-box" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div className="student-avatar-v6" style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '8px',
                                                    background: '#f1f5f9',
                                                    overflow: 'hidden',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 900,
                                                    color: '#64748b',
                                                    border: '1px solid #e2e8f0'
                                                }}>
                                                    {(() => {
                                                        const pic = student.profileImage || student.profilePic || student.avatar || student.image;
                                                        if (pic) {
                                                            return (
                                                                <img
                                                                    src={(pic.includes('dicebear') || pic.startsWith('data:') || pic.startsWith('http'))
                                                                        ? pic
                                                                        : `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${pic.startsWith('/') ? '' : '/'}${pic}`}
                                                                    alt="S"
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                        e.target.nextSibling.style.display = 'block';
                                                                    }}
                                                                />
                                                            );
                                                        }
                                                        return (student.studentName || student.name || 'S').charAt(0);
                                                    })()}
                                                    <div style={{ display: 'none' }}>{(student.studentName || student.name || 'S').charAt(0)}</div>
                                                </div>
                                                <span className="student-name">{student.studentName || student.name || 'Unknown Student'}</span>
                                            </div>
                                        </div>

                                        <div className="status-actions">
                                            {['Present', 'Absent', 'Leave', 'Late'].map(s => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    className={`status-chip ${s.toLowerCase()} ${status === s ? 'active' : ''}`}
                                                    onClick={() => setStatus(sid, s)}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                            {filteredStudents.length === 0 && (
                                <div className="no-results" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                                    No students match "{searchTerm}"
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="no-data">
                        <FaUsers style={{ fontSize: '4rem', opacity: 0.1, marginBottom: '1.5rem', color: '#4f46e5' }} />
                        <p style={{ fontWeight: 600, color: '#64748b' }}>Initialize Class Roster to begin session.</p>
                        <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Select an assignment from the dropdown above.</p>
                    </div>
                )}

                {/* Messages */}
                {error && <div className="error-message">{error}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}

                {/* Submit Button */}
                {students.length > 0 && (
                    <div className="form-actions">
                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={loading || submitted}
                        >
                            {loading ? 'Submitting...' : submitted ? 'Submitted ✓' : 'Submit Attendance'}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default FacultyAttendanceMarker;
