// src/Components/FacultyDashboard/FacultyAssignments.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaPlus, FaSave, FaTrash, FaClipboardList, FaCalendarAlt, FaBook, FaUsers, FaFilter, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import { apiGet, apiPost, apiDelete } from '../../utils/apiClient';
import './FacultyAssignments.css';

/**
 * COURSEWORK HUB
 * Advanced interface for managing and distributing student assignments.
 */
const FacultyAssignments = ({ facultyId }) => {
    const [assignments, setAssignments] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedSectionFilter, setSelectedSectionFilter] = useState('All');
    const [formData, setFormData] = useState({
        year: '',
        section: '',
        subject: '',
        title: '',
        description: ''
    });

    const uniqueSections = [...new Set(assignments.map(a => `${a.year}-${a.section}`))];

    const fetchAssignments = async () => {
        try {
            const data = await apiGet(`/api/teaching-assignments/faculty/${facultyId}`);
            setAssignments(data || []);
        } catch (e) {
            console.error('Failed to load assignments', e);
        }
    };

    useEffect(() => {
        fetchAssignments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [facultyId]);

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const payload = { ...formData, facultyId };
        try {
            await apiPost('/api/teaching-assignments', payload);
            setShowForm(false);
            setFormData({ year: '', section: '', subject: '', title: '', description: '' });
            fetchAssignments();
        } catch (err) {
            console.error('Error creating assignment', err);
            alert('Mission Failed: Could not deploy assignment.');
        }
    };

    const handleDelete = async assignmentId => {
        if (!window.confirm('Are you sure you want to permanently delete this assignment?')) return;
        try {
            await apiDelete(`/api/teaching-assignments/${assignmentId}`);
            fetchAssignments();
        } catch (e) {
            console.error('Delete failed', e);
            alert('Purge Error: System could not remove node.');
        }
    };

    return (
        <div className="coursework-container">
            <header className="f-view-header">
                <div>
                    <h2>COURSEWORK <span>HUB</span></h2>
                    <p className="nexus-subtitle">Manage, publish, and track student assignments across all streams</p>
                </div>
                <button
                    className="nexus-btn-primary"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? <><FaArrowLeft /> BACK TO LIST</> : <><FaPlus /> CREATE ASSIGNMENT</>}
                </button>
            </header>

            {showForm ? (
                <div className="asgn-form-overlay animate-slide-up">
                    <div className="form-header-v6">
                        <div className="icon-box-v6">
                            <FaClipboardList />
                        </div>
                        <div>
                            <h3>CONFIGURE NEW ASSIGNMENT</h3>
                            <p>Set parameters and requirements for student submissions</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="nexus-form-grid" style={{ marginBottom: '2rem' }}>
                            <div className="nexus-group">
                                <label className="f-form-label"><FaCalendarAlt /> Academic Year</label>
                                <input name="year" className="f-form-select" placeholder="e.g. 3" value={formData.year} onChange={handleChange} required />
                            </div>
                            <div className="nexus-group">
                                <label className="f-form-label"><FaUsers /> Target Section</label>
                                <input name="section" className="f-form-select" placeholder="e.g. A" value={formData.section} onChange={handleChange} required />
                            </div>
                            <div className="nexus-group">
                                <label className="f-form-label"><FaBook /> Course Subject</label>
                                <input name="subject" className="f-form-select" placeholder="e.g. Neural Networks" value={formData.subject} onChange={handleChange} required />
                            </div>
                            <div className="nexus-group">
                                <label className="f-form-label"><FaCheckCircle /> Assignment Title</label>
                                <input name="title" className="f-form-select" placeholder="e.g. Lab Project 01" value={formData.title} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="nexus-group" style={{ marginBottom: '2.5rem' }}>
                            <label className="f-form-label">Submission Instructions</label>
                            <textarea
                                name="description"
                                className="f-form-textarea"
                                placeholder="Detail the scope, requirements, and evaluation criteria..."
                                value={formData.description}
                                onChange={handleChange}
                                style={{ height: '180px' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                type="button"
                                className="f-cancel-btn"
                                style={{ flex: 1 }}
                                onClick={() => setShowForm(false)}
                            >
                                DISCARD
                            </button>
                            <button type="submit" className="nexus-btn-primary" style={{ flex: 2 }}>
                                <FaSave /> PUBLISH TO STUDENTS
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <>
                    {assignments.length > 0 && (
                        <div className="filter-glass-bar">
                            <div className="filter-label">
                                <FaFilter />
                                <span>Class Filter</span>
                            </div>
                            <div className="section-buttons">
                                <button className={`section-btn ${selectedSectionFilter === 'All' ? 'active' : ''}`} onClick={() => setSelectedSectionFilter('All')}>
                                    ALL COURSES
                                </button>
                                {uniqueSections.map((sec, idx) => (
                                    <button key={idx} className={`section-btn ${selectedSectionFilter === sec ? 'active' : ''}`} onClick={() => setSelectedSectionFilter(sec)}>
                                        YEAR {sec.split('-')[0]} • SEC {sec.split('-')[1]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {assignments.length === 0 ? (
                        <div className="f-node-card f-center-empty" style={{ padding: '8rem 2rem' }}>
                            <div style={{ background: 'rgba(99, 102, 241, 0.05)', color: '#cbd5e1', width: '100px', height: '100px', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
                                <FaClipboardList style={{ fontSize: '3rem' }} />
                            </div>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 950, color: '#1e293b', margin: 0 }}>ASSIGNMENT LIST EMPTY</h3>
                            <p style={{ color: '#94a3b8', fontWeight: 850, marginTop: '0.8rem', textAlign: 'center' }}>No coursework nodes have been published yet.</p>
                            <button onClick={() => setShowForm(true)} className="nexus-btn-primary" style={{ marginTop: '2.5rem' }}>
                                <FaPlus /> PUBLISH FIRST ASSIGNMENT
                            </button>
                        </div>
                    ) : (
                        <div className="assignments-grid">
                            {assignments.filter(a => selectedSectionFilter === 'All' || `${a.year}-${a.section}` === selectedSectionFilter).map(a => (
                                <div key={a.id || a._id} className="asgn-card-v6 animate-slide-up">
                                    <div className="asgn-card-accent"></div>
                                    <div className="asgn-head">
                                        <div className="asgn-meta-tags">
                                            <div className="tag-v6">YEAR {a.year}</div>
                                            <div className="tag-v6 priority">SEC {a.section}</div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(a.id || a._id)}
                                            className="f-quick-btn shadow delete"
                                            title="Delete Assignment"
                                            style={{ width: '36px', height: '36px' }}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>

                                    <div>
                                        <h4 className="asgn-title">{a.title}</h4>
                                        <div className="asgn-subject">{a.subject}</div>
                                    </div>

                                    <div className="asgn-body">
                                        <p className="asgn-description">
                                            {a.description || 'No detailed instructions provided.'}
                                        </p>
                                    </div>

                                    <div className="asgn-actions">
                                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>
                                            DATA NODE: {String(a.id || a._id).substring(0, 8).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

FacultyAssignments.propTypes = {
    facultyId: PropTypes.string.isRequired
};

export default FacultyAssignments;
