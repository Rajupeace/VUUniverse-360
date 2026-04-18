import React, { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaTrash, FaClipboardList, FaArrowLeft, FaShieldAlt, FaEdit, FaFilter, FaCheckCircle, FaLayerGroup, FaClock, FaTrophy, FaUsers } from 'react-icons/fa';
import { apiPost, apiGet, apiDelete, apiPut } from '../../utils/apiClient';
import sseClient from '../../utils/sseClient';
import './FacultyExams.css';

/**
 * FACULTY ASSESSMENT HUB
 * Advanced interface for orchestrating academic examinations and MCQ assessments.
 */
const FacultyExams = ({ subject, year, sections, facultyId, branch }) => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [editId, setEditId] = useState(null);
    const [selectedSectionFilter, setSelectedSectionFilter] = useState('All');

    const [formData, setFormData] = useState({
        title: '', topic: '', week: 'Week 1',
        durationMinutes: 20, totalMarks: 10,
        section: sections && sections.length > 0 ? sections[0] : '', branch: branch || 'CSE',
        questions: []
    });

    const [currentQuestion, setCurrentQuestion] = useState({
        questionText: '', options: ['', '', '', ''],
        correctOptionIndex: 0, marks: 1
    });

    const fetchExams = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiGet(`/api/exams/faculty/${facultyId}`);
            if (data) setExams(data);
        } catch (error) {
            console.error("Failed to load assessments:", error);
        } finally {
            setLoading(false);
        }
    }, [facultyId]);

    useEffect(() => {
        fetchExams();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [facultyId]);

    // Real-time Update Listener
    useEffect(() => {
        const unsub = sseClient.onUpdate((ev) => {
            if (ev && (ev.resource === 'exams' || ev.resource === 'examResults')) {
                console.log(`📡 Faculty Exams Refresh Triggered via SSE: ${ev.resource}`);
                fetchExams();
            }
        });
        return () => unsub();
    }, [facultyId, fetchExams]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleQuestionChange = (e) => {
        const { name, value } = e.target;
        setCurrentQuestion(prev => ({ ...prev, [name]: value }));
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...currentQuestion.options];
        newOptions[index] = value;
        setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
    };

    const addQuestion = () => {
        if (!currentQuestion.questionText || currentQuestion.options.some(o => !o)) {
            alert("Error: Question parameters incomplete. Please ensure all fields are filled.");
            return;
        }
        setFormData(prev => ({
            ...prev,
            questions: [...prev.questions, currentQuestion]
        }));
        setCurrentQuestion({
            questionText: '', options: ['', '', '', ''],
            correctOptionIndex: 0, marks: 1
        });
    };

    const removeQuestion = (index) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.questions.length === 0) {
            alert("Configuration Error: Minimum one question node required for publication.");
            return;
        }

        try {
            const payload = {
                ...formData,
                totalMarks: formData.questions.reduce((acc, q) => acc + parseFloat(q.marks || 1), 0),
                subject, year, facultyId
            };

            if (editId) {
                await apiPut(`/api/exams/${editId}`, payload);
                alert("Assessment Module Updated Successfully.");
            } else {
                await apiPost('/api/exams/create', payload);
                alert("New Assessment Published to Student Feed.");
            }

            setShowCreate(false);
            setEditId(null);
            setFormData({
                title: '', topic: '', week: 'Week 1',
                durationMinutes: 20, totalMarks: 10,
                section: '', branch: branch || 'CSE',
                questions: []
            });
            fetchExams();
        } catch (err) {
            alert("Publication Failed: " + err.message);
        }
    };

    const handleEditExam = (exam) => {
        setFormData({
            title: exam.title,
            topic: exam.topic,
            week: exam.week,
            durationMinutes: exam.durationMinutes,
            totalMarks: exam.totalMarks,
            section: exam.section,
            branch: exam.branch,
            questions: exam.questions
        });
        setEditId(exam._id);
        setShowCreate(true);
    };

    const handleDeleteExam = async (id) => {
        if (!window.confirm("Archive and permanently delete this assessment?")) return;
        try {
            await apiDelete(`/api/exams/${id}`);
            fetchExams();
        } catch (err) {
            alert("Erasure Failed: Contact system administrator.");
        }
    };

    if (showCreate) {
        return (
            <div className="assessments-container">
                <header className="f-view-header">
                    <div>
                        <h2>{editId ? 'REFINE' : 'CONFIGURE'} <span>ASSESSMENT</span></h2>
                        <p className="nexus-subtitle">Define structural parameters and question nodes for: <strong>{subject}</strong></p>
                    </div>
                    <button onClick={() => { setShowCreate(false); setEditId(null); }} className="f-node-btn secondary" style={{ width: 'auto', padding: '0 1.5rem', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <FaArrowLeft /> RETURN TO PORTAL
                    </button>
                </header>

                <div className="exm-builder-card animate-slide-up">
                    <div className="form-header-v6">
                        <div className="icon-box-v6">
                            <FaShieldAlt />
                        </div>
                        <div>
                            <h3>ASSESSMENT SPECIFICATIONS</h3>
                            <p>Global configuration for the exam environment</p>
                        </div>
                    </div>

                    <div className="nexus-form-grid" style={{ marginBottom: '3rem' }}>
                        <div className="nexus-group">
                            <label className="f-form-label">Assessment Title</label>
                            <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="f-form-select" placeholder="e.g. Mid-Term Proficiency Exam" />
                        </div>
                        <div className="nexus-group">
                            <label className="f-form-label">Subject Topic / Scope</label>
                            <input type="text" name="topic" value={formData.topic} onChange={handleInputChange} className="f-form-select" placeholder="e.g. System Architecture v2" />
                        </div>
                        <div className="nexus-group">
                            <label className="f-form-label">Academic Sequence</label>
                            <select name="week" value={formData.week} onChange={handleInputChange} className="f-form-select">
                                <option value="Week 1">Week 1 Sequence</option>
                                <option value="Week 2">Week 2 Sequence</option>
                                <option value="Week 3">Week 3 Sequence</option>
                                <option value="Week 4">Week 4 Sequence</option>
                                <option value="Mid Term">Mid-Term Assessment</option>
                                <option value="Final">Final Examination</option>
                            </select>
                        </div>
                        <div className="nexus-group">
                            <label className="f-form-label">Time Limit (Minutes)</label>
                            <input type="number" name="durationMinutes" value={formData.durationMinutes} onChange={handleInputChange} className="f-form-select" />
                        </div>
                        <div className="nexus-group">
                            <label className="f-form-label">Department / Branch</label>
                            <input type="text" name="branch" value={formData.branch} onChange={handleInputChange} className="f-form-select" />
                        </div>
                        <div className="nexus-group">
                            <label className="f-form-label">Target Section</label>
                            <select name="section" value={formData.section} onChange={handleInputChange} className="f-form-select">
                                <option value="">Global Broadcast (All Sections)</option>
                                {sections && sections.map(s => <option key={s} value={s}>Section {s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="question-architect">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--exm-slate-200)', paddingBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ background: 'var(--exm-primary)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '10px', fontWeight: 950, fontSize: '0.7rem' }}>STEP 02</div>
                                <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'var(--exm-slate-900)' }}>QUESTION BUILDER</h4>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <span className="tag-v6 priority">{formData.questions.length} QUESTIONS</span>
                                <span className="tag-v6">{formData.questions.reduce((acc, q) => acc + parseFloat(q.marks || 1), 0)} TOTAL MARKS</span>
                            </div>
                        </div>

                        {/* Question Builder Box */}
                        <div className="question-builder-box">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div className="nexus-group">
                                    <label className="f-form-label">Question Stem</label>
                                    <input
                                        type="text"
                                        name="questionText"
                                        value={currentQuestion.questionText}
                                        onChange={handleQuestionChange}
                                        className="f-form-select"
                                        placeholder="Formulate the assessment prompt..."
                                        style={{ marginBottom: 0 }}
                                    />
                                </div>
                                <div className="nexus-group">
                                    <label className="f-form-label">Weight (Pts)</label>
                                    <input
                                        type="number"
                                        name="marks"
                                        value={currentQuestion.marks}
                                        onChange={handleQuestionChange}
                                        className="f-form-select"
                                        style={{ marginBottom: 0 }}
                                    />
                                </div>
                            </div>

                            <div className="nexus-form-grid" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
                                {currentQuestion.options.map((opt, idx) => (
                                    <div key={idx} className="nexus-group">
                                        <label className="f-form-label">Distractor {idx + 1}</label>
                                        <input
                                            type="text"
                                            value={opt}
                                            onChange={(e) => handleOptionChange(idx, e.target.value)}
                                            className="f-form-select"
                                            placeholder={`Option ${idx + 1}...`}
                                            style={currentQuestion.correctOptionIndex === idx ? { borderColor: 'var(--exm-success)', background: 'rgba(16, 185, 129, 0.05)', fontWeight: 800 } : {}}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--exm-slate-100)', padding: '1.25rem', borderRadius: '18px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ fontWeight: 850, fontSize: '0.7rem', color: 'var(--exm-slate-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Correct Key:</span>
                                    <select
                                        name="correctOptionIndex"
                                        value={currentQuestion.correctOptionIndex}
                                        onChange={(e) => setCurrentQuestion(prev => ({ ...prev, correctOptionIndex: parseInt(e.target.value) }))}
                                        className="f-form-select"
                                        style={{ width: '140px', marginBottom: 0, padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                                    >
                                        <option value={0}>Distractor 1</option>
                                        <option value={1}>Distractor 2</option>
                                        <option value={2}>Distractor 3</option>
                                        <option value={3}>Distractor 4</option>
                                    </select>
                                </div>
                                <button onClick={addQuestion} className="nexus-btn-primary" style={{ padding: '0 1.5rem', height: '44px', fontSize: '0.8rem', borderRadius: '12px' }}>
                                    <FaPlus /> APPEND QUESTION NODE
                                </button>
                            </div>
                        </div>

                        {/* Roster of added questions */}
                        <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {formData.questions.map((q, i) => (
                                <div key={i} className="q-node-v6 animate-fade-in">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <div style={{ fontWeight: 900, color: 'var(--exm-slate-900)', fontSize: '1rem' }}>{i + 1}. {q.questionText}</div>
                                        <div className="tag-v6">{q.marks} PTS</div>
                                    </div>
                                    <div className="option-preview-v6">
                                        {q.options.map((opt, idx) => (
                                            <div key={idx} className={`opt-chip-v6 ${q.correctOptionIndex === idx ? 'correct' : ''}`}>
                                                {opt}
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => removeQuestion(i)}
                                        style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', transition: 'all 0.2s' }}
                                        onMouseEnter={e => e.target.style.color = 'var(--exm-accent)'}
                                        onMouseLeave={e => e.target.style.color = '#94a3b8'}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button onClick={handleSubmit} className="nexus-btn-primary" style={{ width: '100%', height: '64px', fontSize: '1.1rem' }}>
                        {editId ? <><FaCheckCircle /> CONFIRM REVISIONS</> : <><FaShieldAlt /> DEPLOY ASSESSMENT HUB</>}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="assessments-container">
            <header className="f-view-header">
                <div>
                    <h2>ASSESSMENT <span>HUB</span></h2>
                    <p className="nexus-subtitle">Orchestrate and publish high-fidelity academic examinations</p>
                </div>
                <button onClick={() => { setShowCreate(true); setEditId(null); setFormData({ title: '', topic: '', week: 'Week 1', durationMinutes: 20, totalMarks: 10, section: '', branch: branch || 'CSE', questions: [] }); }} className="nexus-btn-primary">
                    <FaPlus /> INITIATE ASSESSMENT
                </button>
            </header>

            {loading ? (
                <div className="f-node-card f-center-empty">
                    <div className="loading-spinner-small"></div>
                    <p style={{ marginTop: '1.5rem', fontWeight: 900, color: 'var(--exm-slate-900)' }}>Synchronizing Assessment Portal...</p>
                </div>
            ) : exams.length === 0 ? (
                <div className="f-node-card f-center-empty" style={{ padding: '8rem 2rem' }}>
                    <div style={{ background: 'rgba(99, 102, 241, 0.05)', color: '#cbd5e1', width: '110px', height: '110px', borderRadius: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2.5rem' }}>
                        <FaClipboardList style={{ fontSize: '3.5rem' }} />
                    </div>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 950, color: '#1e293b', margin: 0 }}>PORTAL VACANT</h3>
                    <p style={{ color: '#94a3b8', fontWeight: 800, marginTop: '1rem', maxWidth: '450px', textAlign: 'center', fontSize: '0.95rem' }}>No examinations have been published in this environment. Initialize an assessment node to track student academic progress.</p>
                    <button onClick={() => setShowCreate(true)} className="nexus-btn-primary" style={{ marginTop: '3rem' }}>
                        <FaPlus /> CONFIGURE NEW EXAM
                    </button>
                </div>
            ) : (
                <>
                    <div className="exm-filter-bar">
                        <div className="filter-label">
                            <FaFilter />
                            <span>Pipeline Filter</span>
                        </div>
                        <div className="section-buttons">
                            <button className={`section-btn ${selectedSectionFilter === 'All' ? 'active' : ''}`} onClick={() => setSelectedSectionFilter('All')}>
                                ALL DEPLOYMENTS
                            </button>
                            {sections && sections.map((sec, idx) => (
                                <button key={idx} className={`section-btn ${selectedSectionFilter === sec ? 'active' : ''}`} onClick={() => setSelectedSectionFilter(sec)}>
                                    SECTION {sec}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="exm-grid">
                        {exams.filter(exam => selectedSectionFilter === 'All' || exam.section === selectedSectionFilter).map(exam => (
                            <div key={exam._id} className="exm-card-v6 animate-slide-up">
                                <div className="exm-card-accent"></div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 950, color: 'var(--exm-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        {exam.topic || 'General Assessment'}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => handleEditExam(exam)} className="res-action-btn" title="Refine Exam"><FaEdit /></button>
                                        <button onClick={() => handleDeleteExam(exam._id)} className="res-action-btn delete" title="Archive Exam"><FaTrash /></button>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="asgn-title">{exam.title}</h3>
                                    <div className="tag-v6" style={{ marginTop: '0.5rem', display: 'inline-block' }}>{exam.week} SEQUENCE</div>
                                </div>

                                <div className="exm-stats-area">
                                    <div className="exm-stat-item">
                                        <div className="exm-stat-label"><FaLayerGroup /> Nodes</div>
                                        <div className="exm-stat-value">{exam.questions.length} Items</div>
                                    </div>
                                    <div className="exm-stat-item">
                                        <div className="exm-stat-label"><FaClock /> Time</div>
                                        <div className="exm-stat-value">{exam.durationMinutes} Min</div>
                                    </div>
                                    <div className="exm-stat-item">
                                        <div className="exm-stat-label"><FaTrophy /> Points</div>
                                        <div className="exm-stat-value">{exam.totalMarks || exam.questions.length} Pts</div>
                                    </div>
                                    <div className="exm-stat-item">
                                        <div className="exm-stat-label"><FaUsers /> Target</div>
                                        <div className="exm-stat-value" style={{ color: 'var(--exm-success)' }}>{exam.section ? `Sec ${exam.section}` : 'Universal'}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
                                    <span style={{ fontSize: '0.65rem', color: '#cbd5e1', fontWeight: 800 }}>
                                        ID: {String(exam._id).substring(0, 10).toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default FacultyExams;
