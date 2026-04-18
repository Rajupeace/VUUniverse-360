import React, { useState, useEffect, useCallback } from 'react';
import { FaPencilAlt, FaTrash, FaStickyNote, FaBook, FaPlus, FaFileAlt, FaSync, FaEye } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { apiGet, apiPost, apiPut, apiDelete } from '../../../utils/apiClient';
import sseClient from '../../../utils/sseClient';
import './SemesterNotes.css';

/**
 * Student Journal
 * Subject-wise note taking interface.
 */
const SemesterNotes = ({ semester, studentData, enrolledSubjects = [], serverMaterials = [], assignedFaculty = [] }) => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);

    const [selectedSubject, setSelectedSubject] = useState(enrolledSubjects[0]?.code || 'General');
    const [newNote, setNewNote] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [saveStatus, setSaveStatus] = useState('Ready');

    const subjectsList = enrolledSubjects.length > 0
        ? enrolledSubjects
        : [{ name: 'General Notes', code: 'General' }];

    const fetchNotes = useCallback(async () => {
        if (!studentData?.sid) return;
        setLoading(true);
        try {
            const data = await apiGet(`/api/student-notes?sid=${studentData.sid}`);
            if (Array.isArray(data)) setNotes(data);
            setSaveStatus('Synced');
        } catch (e) {
            console.error('Failed to fetch notes:', e);
            if (e.status === 401 || e.status === 403) {
                setSaveStatus('Unauthorized');
                window.alert('Please login to access your notes');
            } else {
                setSaveStatus('Offline');
            }
        } finally {
            setLoading(false);
        }
    }, [studentData?.sid]);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    // Real-time Update Listener
    useEffect(() => {
        const unsub = sseClient.onUpdate((ev) => {
            if (ev && ev.resource === 'notes') {
                console.log('📡 Semester Notes Refresh Triggered via SSE');
                fetchNotes();
            }
        });
        return () => unsub();
    }, [studentData?.sid, fetchNotes]);

    useEffect(() => {
        if (selectedSubject !== 'General' && !enrolledSubjects.find(s => s.code === selectedSubject)) {
            if (enrolledSubjects.length > 0) setSelectedSubject(enrolledSubjects[0].code);
            else setSelectedSubject('General');
        }
    }, [enrolledSubjects, selectedSubject]);

    const addNote = async () => {
        if (newNote.trim()) {
            setSaveStatus('Saving...');
            try {
                // Find courseId if possible
                const subjectObj = enrolledSubjects.find(s => s.code === selectedSubject);
                const payload = {
                    sid: studentData.sid,
                    courseId: subjectObj?._id || subjectObj?.id,
                    title: subjectObj?.name || 'General Note',
                    content: newNote,
                    category: selectedSubject === 'General' ? 'personal-notes' : 'lecture-notes',
                    semester: studentData.semester || '1st',
                    academicYear: new Date().getFullYear().toString()
                };

                const savedNote = await apiPost('/api/student-notes', payload);
                if (savedNote) {
                    setNotes([savedNote, ...notes]);
                    setNewNote('');
                    setShowForm(false);
                    setSaveStatus('Saved');
                }
            } catch (e) {
                console.error('Failed to save note:', e);
                if (e.status === 401 || e.status === 403) {
                    setSaveStatus('Unauthorized');
                    window.alert('Please login to save notes');
                } else {
                    setSaveStatus('Error');
                }
            }
        }
    };

    const deleteNote = async (id) => {
        if (window.confirm('Delete this note?')) {
            try {
                await apiDelete(`/api/student-notes/${id}`);
                setNotes(notes.filter(n => (n._id || n.id) !== id));
                setSaveStatus('Deleted');
            } catch (e) {
                console.error('Failed to delete note:', e);
                if (e.status === 401 || e.status === 403) {
                    window.alert('Not authorized to delete this note. Please login.');
                    setSaveStatus('Unauthorized');
                }
            }
        }
    };

    const startEdit = (id, text) => {
        setEditingId(id);
        setEditText(text);
    };

    const saveEdit = async (id) => {
        setSaveStatus('Updating...');
        try {
            const updated = await apiPut(`/api/student-notes/${id}`, { content: editText });
            if (updated) {
                setNotes(notes.map(n => (n._id || n.id) === id ? { ...n, content: editText } : n));
                setEditingId(null);
                setSaveStatus('Saved');
            }
        } catch (e) {
            console.error('Failed to update note:', e);
            if (e.status === 401 || e.status === 403) {
                window.alert('Not authorized to update this note. Please login.');
                setSaveStatus('Unauthorized');
            } else {
                setSaveStatus('Error');
            }
        }
    };

    const filteredNotes = notes.filter(n => {
        if (selectedSubject === 'General') {
            return n.category === 'personal-notes';
        }
        const subjectObj = enrolledSubjects.find(s => s.code === selectedSubject);
        return (n.courseId && (n.courseId === subjectObj?._id || n.courseId === subjectObj?.id)) ||
            (n.title && n.title.includes(subjectObj?.name));
    });

    const currentSubjectName = subjectsList.find(s => s.code === selectedSubject)?.name || 'General Notes';

    const publishedMaterials = (() => {
        try {
            const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';
            const apiMaterials = (serverMaterials || []).map(m => ({ ...m, url: m.url && m.url.startsWith('http') ? m.url : `${API_BASE}${m.url}` }));
            const year = String(studentData.year || '1');

            return apiMaterials.filter(m => {
                const matchYear = !m.year || String(m.year) === 'All' || String(m.year) === year;
                const sections = m.section ? (Array.isArray(m.section) ? m.section : String(m.section).split(',').map(s => s.trim())) : [];
                const matchSection = !m.section || sections.length === 0 || sections.includes('All') || sections.includes(studentData.section) || sections.includes(String(studentData.section));
                const subj = m.subject ? String(m.subject).trim().toLowerCase() : '';
                const code = String(selectedSubject || '').trim().toLowerCase();
                const subjNameMatch = enrolledSubjects.find(s => s.code === selectedSubject)?.name?.toLowerCase() || '';

                const subjectMatch = subj === code ||
                    (subj && subj.includes(code)) ||
                    (subjNameMatch && subj.includes(subjNameMatch));

                const uploaderName = m.uploadedBy?.name || (typeof m.uploadedBy === 'string' ? m.uploadedBy : '');

                const isAssignedFaculty = (assignedFaculty || []).some(f =>
                    (f.name && uploaderName && f.name.toLowerCase().includes(uploaderName.toLowerCase())) ||
                    (f.facultyId && m.uploadedBy === f.facultyId)
                );

                return matchYear && matchSection && (subjectMatch || isAssignedFaculty);
            });
        } catch (e) { return []; }
    })();

    return (
        <div className="journal-container">
            <div className="journal-sidebar">
                <div className="js-header">
                    <h3>
                        <FaBook style={{ color: 'var(--v-primary)' }} /> Notebooks
                    </h3>
                </div>
                <div className="js-list">
                    {subjectsList.map((sub, idx) => (
                        <button
                            key={sub.code || `sub-${idx}`}
                            onClick={() => setSelectedSubject(sub.code)}
                            className={`subject-btn ${selectedSubject === sub.code ? 'active' : ''}`}
                        >
                            <div className="subject-btn-content">{sub.name}</div>
                        </button>
                    ))}
                </div>
                <button onClick={() => setSelectedSubject('General')} className="general-notes-btn">
                    <FaStickyNote /> General Notes
                </button>
            </div>

            <div className="journal-main">
                <div className="jm-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="jm-title">
                            <h2>{currentSubjectName}</h2>
                            <p className="jm-meta">
                                {filteredNotes.length} notes • {saveStatus}
                            </p>
                        </div>
                        {loading && <div className="jm-loading-spinner"></div>}
                    </div>
                    <div className="jm-actions">
                        <button onClick={fetchNotes} className="admin-btn admin-btn-outline" style={{ padding: '0.75rem', borderRadius: '8px' }} title="Sync Notes"><FaSync /></button>
                        <button onClick={() => setShowForm(true)} className="admin-btn admin-btn-primary" style={{ padding: '0.75rem 1.5rem', gap: '0.5rem' }}><FaPlus /> Add Note</button>
                    </div>
                </div>

                <div className="jm-content-area">
                    {publishedMaterials.length > 0 && (
                        <div className="published-resources">
                            <div className="pr-header">
                                <h4>Published Resources</h4>
                                <small style={{ color: 'var(--v-text-muted)' }}>{publishedMaterials.length} items</small>
                            </div>
                            <div className="pr-grid">
                                {publishedMaterials.map((m, i) => (
                                    <div key={m._id || m.id || `res-${i}`} className="resource-item-v2">
                                        <div className="ri-icon">
                                            <FaFileAlt />
                                        </div>
                                        <div className="ri-info">
                                            <span className="ri-title">{m.title || m.name}</span>
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                <small className="ri-type">{m.type.replace('_', ' ').toUpperCase()}</small>
                                                <span style={{ fontSize: '0.65rem', color: 'var(--v-primary)', fontWeight: 700 }}>
                                                    • {m.uploadedByName || m.uploadedBy?.name || m.uploadedBy || 'Instructor'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="ri-actions">
                                            <a href={m.url} target="_blank" rel="noopener noreferrer" title="View Document" className="ri-action-btn view">
                                                <FaEye />
                                            </a>
                                            <a href={m.url} download={m.title} title="Download" className="ri-action-btn download">
                                                <FaSync style={{ transform: 'rotate(180deg)' }} />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <AnimatePresence>
                        {showForm && (
                            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="note-input-card">
                                <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder={`Write something about ${currentSubjectName}...`} className="note-textarea" autoFocus />
                                <div className="form-actions">
                                    <button onClick={() => setShowForm(false)} className="admin-btn admin-btn-outline" style={{ border: 'none' }}>Cancel</button>
                                    <button onClick={addNote} className="admin-btn admin-btn-primary">Save Note</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {loading && notes.length === 0 ? (
                        <div className="notes-loading">
                            <div className="jm-loading-spinner" style={{ width: '40px', height: '40px', marginBottom: '1rem' }}></div>
                            <p>Loading your journal...</p>
                        </div>
                    ) : filteredNotes.length === 0 ? (
                        <div className="notes-empty">
                            <div className="empty-emoji">📝</div>
                            <p>No notes for this subject yet. Start by adding one!</p>
                        </div>
                    ) : (
                        <div className="notes-grid">
                            {filteredNotes.map(note => (
                                <motion.div key={note._id || note.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="note-card">
                                    {editingId === (note._id || note.id) ? (
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="note-textarea" style={{ minHeight: '100px', flex: 1, marginBottom: '1rem' }} autoFocus />
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => saveEdit(note._id || note.id)} className="admin-btn admin-btn-primary">Save</button>
                                                <button onClick={() => setEditingId(null)} className="admin-btn admin-btn-outline">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="note-content">
                                                <p className="note-text-display">{note.content}</p>
                                            </div>
                                            <div className="note-footer">
                                                <span className="note-date">{new Date(note.updatedAt || note.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                <div className="note-actions">
                                                    <button onClick={() => startEdit(note._id || note.id, note.content)} className="icon-btn edit" title="Edit"><FaPencilAlt /></button>
                                                    <button onClick={() => deleteNote(note._id || note.id)} className="icon-btn danger" title="Delete"><FaTrash /></button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SemesterNotes;
