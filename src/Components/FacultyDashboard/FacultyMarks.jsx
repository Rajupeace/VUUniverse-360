// src/Components/FacultyDashboard/FacultyMarks.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FaEdit, FaSave, FaTimes, FaFilter, FaFileDownload, FaFileUpload, FaCalculator, FaRobot, FaUserGraduate, FaCircle } from 'react-icons/fa';
import { apiGet, apiPost } from '../../utils/apiClient';
import sseClient from '../../utils/sseClient';
import './FacultyMarks.css';

/**
 * GRADEMONT CONTROL HUB
 * Professional precision grading system with AI-assisted auditing and bulk processing.
 */
const FacultyMarks = ({ facultyData, openAiWithPrompt, allStudentsList }) => {
    const [students, setStudents] = useState([]);
    const [allStudents, setAllStudents] = useState([]);
    const [selectedSection, setSelectedSection] = useState({ year: '', section: '', subject: '' });
    const [availableSections, setAvailableSections] = useState([]);
    const [marksData, setMarksData] = useState({});
    const [originalMarksData, setOriginalMarksData] = useState({});
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState({ text: '', type: '' });
    const fileInputRef = useRef(null);

    // Assessment structure with max marks
    const assessmentStructure = useMemo(() => ({
        cla: [
            { id: 'cla1', label: 'CLA 1', max: 20 },
            { id: 'cla2', label: 'CLA 2', max: 20 },
            { id: 'cla3', label: 'CLA 3', max: 20 },
            { id: 'cla4', label: 'CLA 4', max: 20 },
            { id: 'cla5', label: 'CLA 5', max: 20 }
        ],
        module1: [
            { id: 'm1pre', label: '(PRE T1)', max: 10 },
            { id: 'm1t1', label: 'T1', max: 10 },
            { id: 'm1t2', label: 'T2', max: 10 },
            { id: 'm1t3', label: 'T3', max: 10 },
            { id: 'm1t4', label: 'T4', max: 10 }
        ],
        module2: [
            { id: 'm2pre', label: '(PRE T1)', max: 10 },
            { id: 'm2t1', label: 'T1', max: 10 },
            { id: 'm2t2', label: 'T2', max: 10 },
            { id: 'm2t3', label: 'T3', max: 10 },
            { id: 'm2t4', label: 'T4', max: 10 }
        ]
    }), []);

    const fetchStudents = useCallback(async () => {
        if (!facultyData?.facultyId) return [];
        try {
            let data = [];
            try {
                data = await apiGet(`/api/faculty-stats/${facultyData.facultyId}/students`);
            } catch (e) {
                console.warn('Protected students endpoint failed, trying public fallback', e && e.message);
            }

            if ((!data || !Array.isArray(data) || data.length === 0)) {
                try {
                    const pub = await apiGet(`/api/faculty-stats/${facultyData.facultyId}/students/public`);
                    if (Array.isArray(pub) && pub.length > 0) data = pub;
                } catch (e2) {
                    console.warn('Public students endpoint failed too', e2 && e2.message);
                }
            }

            setAllStudents(data || []);
            return data || [];
        } catch (error) {
            console.error('Error fetching students:', error);
            setAllStudents([]);
            return [];
        }
    }, [facultyData?.facultyId]);

    const filterStudentsBySection = (studentList, section) => {
        if (!section.year || !section.section) {
            setStudents([]);
            return;
        }
        const filtered = studentList.filter(student => {
            const studentYear = student.year || student.Year || student.currentYear;
            const studentSection = student.section || student.Section || student.class;

            const yearMatch = String(studentYear) === String(section.year);
            const isAllSection = String(section.section).toUpperCase() === 'ALL';
            const sectionMatch = isAllSection ||
                (String(studentSection).toUpperCase().trim() === String(section.section).toUpperCase().trim());

            return yearMatch && sectionMatch;
        });
        setStudents(filtered);
    };

    const initializeData = useCallback(async () => {
        try {
            setLoading(true);
            let sections = extractSectionsFromData(facultyData);

            if (sections.length === 0 && facultyData?.facultyId) {
                try {
                    const response = await apiGet(`/api/faculty/${facultyData.facultyId}`);
                    sections = extractSectionsFromData(response);
                } catch (apiError) {
                    console.error('Failed to fetch faculty from API:', apiError);
                }
            }

            setAvailableSections(sections);
            if (sections.length > 0) {
                setSelectedSection(sections[0]);
            }

            const fetched = (allStudentsList && allStudentsList.length > 0) ? allStudentsList : await fetchStudents();
            setAllStudents(fetched);
            if (sections.length > 0) {
                filterStudentsBySection(fetched || [], sections[0]);
            }
        } catch (error) {
            console.error('Error initializing:', error);
            showMessage('Failed to synchronize initial data suite.', 'error');
        } finally {
            setLoading(false);
        }
    }, [facultyData, fetchStudents, allStudentsList]);

    const extractSectionsFromData = (data) => {
        if (!data) return [];
        if (data.assignments && Array.isArray(data.assignments) && data.assignments.length > 0) {
            const sectionsMap = new Map();
            data.assignments.forEach(assignment => {
                const year = parseInt(assignment.year);
                const section = String(assignment.section).toUpperCase();
                const subject = assignment.subject || data.subject || 'General';
                if (year && section) {
                    const key = `${year}-${section}-${subject}`;
                    if (!sectionsMap.has(key)) {
                        sectionsMap.set(key, { year, section, subject });
                    }
                }
            });
            return Array.from(sectionsMap.values());
        }
        return [];
    };

    const handleSectionChange = (newSection) => {
        setSelectedSection(newSection);
        filterStudentsBySection(allStudents, newSection);
        setEditMode(false);
    };

    const fetchMarks = useCallback(async () => {
        if (!selectedSection.subject || students.length === 0) return;
        try {
            const subject = selectedSection.subject;
            const data = await apiGet(`/api/marks/${encodeURIComponent(subject)}/all`);
            const organized = {};
            students.forEach(student => {
                const sid = student.sid || student.studentId;
                organized[sid] = {};
                [...assessmentStructure.cla, ...assessmentStructure.module1, ...assessmentStructure.module2].forEach(a => {
                    organized[sid][a.id] = '';
                });
            });

            if (Array.isArray(data)) {
                data.forEach(mark => {
                    const sid = mark.studentId || mark.sid;
                    if (organized[sid]) {
                        organized[sid][mark.assessmentType] = mark.marks;
                    }
                });
            }
            setMarksData(organized);
            setOriginalMarksData(JSON.parse(JSON.stringify(organized)));
        } catch (error) {
            console.error('Error fetching marks:', error);
        }
    }, [selectedSection.subject, students, assessmentStructure]);

    const handleMarkChange = (studentId, assessmentId, value) => {
        if (value === '') {
            setMarksData(prev => ({ ...prev, [studentId]: { ...prev[studentId], [assessmentId]: '' } }));
            return;
        }
        const val = parseFloat(value);
        const assessment = [...assessmentStructure.cla, ...assessmentStructure.module1, ...assessmentStructure.module2].find(a => a.id === assessmentId);
        if (val < 0 || (assessment && val > assessment.max)) return;

        setMarksData(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], [assessmentId]: val }
        }));
    };

    const saveMarks = async () => {
        try {
            setSaving(true);
            const marksArray = [];
            Object.keys(marksData).forEach(sid => {
                Object.keys(marksData[sid]).forEach(aid => {
                    const val = marksData[sid][aid];
                    if (val !== '' && val !== null) {
                        marksArray.push({
                            studentId: sid,
                            subject: selectedSection.subject,
                            year: selectedSection.year,
                            section: selectedSection.section,
                            assessmentType: aid,
                            marks: parseFloat(val)
                        });
                    }
                });
            });

            const response = await apiPost('/api/marks/bulk-save', { marks: marksArray });
            if (response.success || response.modified >= 0) {
                showMessage(`✅ Published marks for ${marksArray.length} assessment nodes`, 'success');
                setEditMode(false);
                setOriginalMarksData(JSON.parse(JSON.stringify(marksData)));
            } else {
                showMessage('Publication Error: Protocol rejected data packet.', 'error');
            }
        } catch (error) {
            showMessage('Critical Error: Sync pipeline failure.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const calculateTotal = (studentId) => {
        const marks = marksData[studentId] || {};
        let total = 0;
        const activeIds = [...assessmentStructure.cla, ...assessmentStructure.module1, ...assessmentStructure.module2].map(a => a.id);

        activeIds.forEach(id => {
            const mark = marks[id];
            if (mark !== '' && mark !== null && !isNaN(mark)) {
                total += parseFloat(mark);
            }
        });
        return { total };
    };

    const showMessage = (text, type) => {
        setSaveMessage({ text, type });
        setTimeout(() => setSaveMessage({ text: '', type: '' }), 4000);
    };

    const handleAiAudit = () => {
        const studentCount = students.length;
        const subject = selectedSection.subject;
        const avg = (students.length > 0 ? (students.reduce((acc, s) => acc + calculateTotal(s.sid || s.studentId).total, 0) / students.length) : 0).toFixed(1);

        const prompt = `Perform a comprehensive Academic Performance Audit for ${subject} with ${studentCount} students. 
        Current Section Average: ${avg}/200.
        Analyze the grading distribution across CLA, Module 1, and Module 2. 
        Identify specific structural weaknesses in the class performance and suggest remedial pedagogical strategies. 
        Highlight students requiring immediate intervention.`;

        if (openAiWithPrompt) openAiWithPrompt(prompt);
    };

    const handleBulkUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            const text = evt.target.result;
            const rows = text.split('\n').map(r => r.split(','));
            const newMarks = JSON.parse(JSON.stringify(marksData));

            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                if (!row[0]) continue;
                const sid = row[0].trim();
                if (newMarks[sid]) {
                    const allAssessments = [...assessmentStructure.cla, ...assessmentStructure.module1, ...assessmentStructure.module2];
                    allAssessments.forEach((a, idx) => {
                        const val = row[idx + 2];
                        if (val) {
                            const mark = parseFloat(val);
                            if (!isNaN(mark) && mark >= 0 && mark <= a.max) {
                                newMarks[sid][a.id] = mark;
                            }
                        }
                    });
                }
            }
            setMarksData(newMarks);
            setEditMode(true);
            showMessage('CSV Data Synchronized. Review required before finalization.', 'success');
        };
        reader.readAsText(file);
    };

    const handleDownloadCSV = () => {
        const headers = ['Roll No', 'Name', ...assessmentStructure.cla.map(a => a.label), ...assessmentStructure.module1.map(a => a.label), ...assessmentStructure.module2.map(a => a.label), 'Total'];
        let csv = headers.join(',') + '\n';
        students.forEach(s => {
            const sid = s.sid || s.studentId;
            const { total } = calculateTotal(sid);
            const row = [sid, `"${s.studentName || s.name}"`];
            [...assessmentStructure.cla, ...assessmentStructure.module1, ...assessmentStructure.module2].forEach(a => {
                row.push(marksData[sid]?.[a.id] || '');
            });
            row.push(total);
            csv += row.join(',') + '\n';
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Grading_Registry_${selectedSection.subject}_${selectedSection.year}${selectedSection.section}.csv`;
        a.click();
    };

    useEffect(() => { initializeData(); }, [initializeData]);
    useEffect(() => {
        if (selectedSection.year && selectedSection.subject) {
            fetchMarks();
        }
    }, [selectedSection, fetchMarks]);

    // Real-time Update Listener
    useEffect(() => {
        const unsub = sseClient.onUpdate((ev) => {
            if (ev && ev.resource === 'marks') {
                console.log('📡 Faculty Marks Refresh Triggered via SSE');
                fetchMarks();
            }
        });
        return () => unsub();
    }, [fetchMarks]);

    if (loading) return (
        <div className="grading-container">
            <div className="spinner"></div>
            <p style={{ marginTop: '1.5rem', fontWeight: 900, color: '#94a3b8' }}>FETCHING ACADEMIC DATA SUITE...</p>
        </div>
    );

    return (
        <div className="grading-container animate-fade-in">
            <header className="f-view-header" style={{ flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ minWidth: '280px' }}>
                    <h2>GRADING <span>CONTROL</span></h2>
                    <p className="nexus-subtitle">Precision assessment and academic ledger for: <strong>{selectedSection.subject || 'Faculty Courses'}</strong></p>
                </div>
                <div className="f-header-actions" style={{ display: 'flex', gap: '0.8rem', flex: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <button className="f-node-btn ai" onClick={handleAiAudit}>
                        <FaRobot /> AI ASSISTANT
                    </button>
                    {editMode ? (
                        <>
                            <button className="f-node-btn success" onClick={saveMarks} disabled={saving}>
                                <FaSave /> {saving ? 'PUBLISHING...' : 'SAVE DATA'}
                            </button>
                            <button className="f-node-btn secondary" onClick={() => { setMarksData(originalMarksData); setEditMode(false); }}>
                                <FaTimes /> ABORT
                            </button>
                        </>
                    ) : (
                        <>
                            <input type="file" ref={fileInputRef} onChange={handleBulkUpload} style={{ display: 'none' }} accept=".csv" />
                            <button className="f-node-btn secondary" onClick={() => fileInputRef.current.click()}>
                                <FaFileUpload /> BULK UPLOAD
                            </button>
                            <button className="f-node-btn secondary" onClick={handleDownloadCSV}>
                                <FaFileDownload /> EXPORT
                            </button>
                            <button className="f-node-btn primary" onClick={() => setEditMode(true)}>
                                <FaEdit /> ENTER GRADES
                            </button>
                        </>
                    )}
                </div>
            </header>

            {saveMessage.text && (
                <div className={`save-message ${saveMessage.type}`} style={{ borderRadius: '16px', fontWeight: 900, fontSize: '0.85rem' }}>
                    <FaCircle style={{ marginRight: '0.6rem' }} /> {saveMessage.text}
                </div>
            )}

            <div className="grading-filter-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, overflow: 'hidden' }}>
                    <FaFilter style={{ color: 'var(--grd-primary)', minWidth: '16px' }} />
                    <div className="section-buttons">
                        {availableSections.map((sec, idx) => (
                            <button key={idx} className={`section-btn ${selectedSection.year === sec.year && selectedSection.section === sec.section ? 'active' : ''}`} onClick={() => handleSectionChange(sec)}>
                                YEAR {sec.year} ({sec.section}) • {sec.subject}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grd-stats-ribbon">
                    <div className="ribbon-item-v6">
                        <span className="ribbon-label">SECTION AVG</span>
                        <span className="ribbon-value">
                            {(students.length > 0 ? (students.reduce((acc, s) => acc + calculateTotal(s.sid || s.studentId).total, 0) / students.length) : 0).toFixed(1)}
                        </span>
                    </div>
                    <div className="ribbon-item-v6">
                        <span className="ribbon-label">STRENGTH</span>
                        <span className="ribbon-value" style={{ color: 'var(--grd-primary)' }}>{students.length}</span>
                    </div>
                </div>
            </div>

            <div className="grd-table-wrapper">
                {students.length > 0 ? (
                    <table className="grd-table-v6">
                        <thead>
                            <tr>
                                <th rowSpan="2" style={{ zIndex: 100 }}>ROLL NO</th>
                                <th rowSpan="2" style={{ textAlign: 'left', zIndex: 100 }}>STUDENT NAME</th>
                                <th colSpan={assessmentStructure.cla.length} className="cla-header-v6">CLA ASSESSMENTS (MAX 20)</th>
                                <th colSpan={assessmentStructure.module1.length} className="mod1-header-v6">MODULE 1 • PRE-T1 + TARGETS</th>
                                <th colSpan={assessmentStructure.module2.length} className="mod2-header-v6">MODULE 2 • PRE-T1 + TARGETS</th>
                                <th rowSpan="2">TOTAL (200)</th>
                            </tr>
                            <tr>
                                {assessmentStructure.cla.map(a => <th key={a.id} className="cla-header-v6">{a.label}</th>)}
                                {assessmentStructure.module1.map(a => <th key={a.id} className="mod1-header-v6">{a.label}</th>)}
                                {assessmentStructure.module2.map(a => <th key={a.id} className="mod2-header-v6">{a.label}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, sIdx) => {
                                const sid = student.sid || student.studentId;
                                const { total } = calculateTotal(sid);
                                return (
                                    <tr key={sid}>
                                        <td style={{ color: 'var(--grd-primary)', fontWeight: 900 }}>{sid}</td>
                                        <td style={{ color: 'var(--grd-slate-900)', fontWeight: 800, textAlign: 'left' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{
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
                                                        const pic = student.profileImage || student.profilePic || student.profilePicture || student.avatar || student.image;
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
                                                {student.studentName || student.name}
                                            </div>
                                        </td>
                                        {assessmentStructure.cla.map(a => (
                                            <td key={a.id} style={{ background: 'rgba(99, 102, 241, 0.02)' }}>
                                                <input type="number" step="0.5" disabled={!editMode} value={marksData[sid]?.[a.id] ?? ''} onChange={(e) => handleMarkChange(sid, a.id, e.target.value)} className="grd-input-v6" />
                                            </td>
                                        ))}
                                        {assessmentStructure.module1.map(a => (
                                            <td key={a.id} style={{ background: 'rgba(168, 85, 247, 0.02)' }}>
                                                <input type="number" step="0.5" disabled={!editMode} value={marksData[sid]?.[a.id] ?? ''} onChange={(e) => handleMarkChange(sid, a.id, e.target.value)} className="grd-input-v6" />
                                            </td>
                                        ))}
                                        {assessmentStructure.module2.map(a => (
                                            <td key={a.id} style={{ background: 'rgba(244, 63, 94, 0.02)' }}>
                                                <input type="number" step="0.5" disabled={!editMode} value={marksData[sid]?.[a.id] ?? ''} onChange={(e) => handleMarkChange(sid, a.id, e.target.value)} className="grd-input-v6" />
                                            </td>
                                        ))}
                                        <td style={{ fontWeight: 950, color: 'var(--grd-primary)', background: 'var(--grd-slate-50)' }}>{total.toFixed(1)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', color: '#cbd5e1', gap: '1.5rem' }}>
                        <FaUserGraduate style={{ fontSize: '4rem', opacity: 0.2 }} />
                        <p style={{ fontWeight: 900, fontSize: '1rem' }}>SELECT A TARGET SECTION TO COMMENCE GRADING</p>
                    </div>
                )}
            </div>

            <footer className="marks-info-footer" style={{ background: 'var(--grd-glass)', backdropFilter: 'blur(10px)', border: '1px solid var(--grd-border)', borderRadius: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontWeight: 800 }}>
                    <FaCalculator style={{ color: 'var(--grd-primary)' }} />
                    Total Assessment Weight: <strong style={{ color: 'var(--grd-primary)' }}>200.0 Marks</strong>
                </div>
                <div style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.5, letterSpacing: '0.05em' }}>
                    POWERED BY VUAI ADVANCED GRADING ENGINE • SECURE SYNC ACTIVE
                </div>
            </footer>
        </div>
    );
};

export default FacultyMarks;
