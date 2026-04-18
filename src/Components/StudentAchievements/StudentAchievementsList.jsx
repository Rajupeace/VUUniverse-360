import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaCalendarAlt, FaStar, FaFileAlt, FaMapMarkerAlt, FaSchool,
    FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaTrophy, FaChild,
    FaEye, FaDownload, FaSave, FaCloudUploadAlt, FaEdit, FaTimes
} from 'react-icons/fa';
import { apiGet, apiDelete, apiUpload, API_BASE } from '../../utils/apiClient';
import sseClient from '../../utils/sseClient';
import DocViewer from '../DocViewer/DocViewer';
import StudentAchievementForm from './StudentAchievementForm';
import { FaPlus } from 'react-icons/fa';

const StudentAchievementsList = ({ studentId, userData }) => {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [isAdding, setIsAdding] = useState(false);
    const [viewerDoc, setViewerDoc] = useState(null);

    // Edit state
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [editFiles, setEditFiles] = useState([]);
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');
    const [editSuccess, setEditSuccess] = useState('');
    const editFileRef = useRef(null);

    // Delete state
    const [deletingId, setDeletingId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const fetchAchievements = useCallback(async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            const response = await apiGet(`/api/achievements/student/${studentId}`);
            if (response.success) {
                setAchievements(response.achievements || []);
            }
        } catch (error) {
            console.error('Error fetching achievements:', error);
        } finally {
            if (!isBackground) setLoading(false);
        }
    }, [studentId]);

    useEffect(() => { fetchAchievements(); }, [fetchAchievements]);

    // Real-time SSE updates
    useEffect(() => {
        const unsubscribe = sseClient.onUpdate((event) => {
            if (event.resource === 'achievements') fetchAchievements(true);
        });
        return () => { unsubscribe(); };
    }, [fetchAchievements]);

    // Stats derivation
    const stats = useMemo(() => {
        const total = achievements.length;
        const verified = achievements.filter(a => a.status === 'Approved').length;
        const points = achievements.reduce((acc, curr) => acc + (curr.meritPoints || 0), 0);
        return { total, verified, points };
    }, [achievements]);

    const filteredAchievements = useMemo(() => {
        if (filter === 'all') return achievements;
        return achievements.filter(a => a.category?.toLowerCase() === filter.toLowerCase());
    }, [achievements, filter]);

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'short', day: 'numeric'
    });

    const getCategoryIcon = (cat) => {
        switch (cat?.toLowerCase()) {
            case 'technical': return <FaFileAlt />;
            case 'sports': return <FaChild />;
            case 'cultural': return <FaStar />;
            default: return <FaTrophy />;
        }
    };

    // ── Edit Handlers ──────────────────────────────────────────────────
    const startEdit = (achievement) => {
        setEditingId(achievement._id);
        setEditFiles([]);
        setEditError('');
        setEditSuccess('');
        setEditForm({
            title: achievement.title || '',
            category: achievement.category || 'Technical',
            level: achievement.level || 'College Level',
            achievementType: achievement.achievementType || 'Individual',
            position: achievement.position || 'Winner',
            rank: achievement.rank || '',
            achievementDate: achievement.achievementDate ? achievement.achievementDate.split('T')[0] : '',
            description: achievement.description || '',
            eventName: achievement.eventName || '',
            organizingInstitution: achievement.organizingInstitution || '',
            eventLocation: achievement.eventLocation || '',
            eventMode: achievement.eventMode || 'Offline',
            resultLink: achievement.resultLink || '',
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({});
        setEditFiles([]);
        setEditError('');
        setEditSuccess('');
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const handleEditSubmit = async (achievementId) => {
        setEditLoading(true);
        setEditError('');
        setEditSuccess('');
        try {
            const formData = new FormData();
            Object.entries(editForm).forEach(([k, v]) => { if (v) formData.append(k, v); });
            editFiles.forEach((file, i) => {
                formData.append('documents', file);
                formData.append(`fileType_${i}`, 'Certificate');
            });
            const res = await apiUpload(`/api/achievements/${achievementId}`, formData, 'PUT');
            if (res.success) {
                setEditSuccess('✅ Achievement updated successfully!');
                setTimeout(() => {
                    cancelEdit();
                    fetchAchievements(true);
                }, 500);
            }
        } catch (err) {
            setEditError(err.message || 'Update failed');
        } finally {
            setEditLoading(false);
        }
    };

    const handleDelete = async (achievementId, title) => {
        if (!window.confirm(`Delete "${title}"?`)) return;
        setDeletingId(achievementId);
        setDeleteLoading(true);
        try {
            const res = await apiDelete(`/api/achievements/${achievementId}`);
            if (res.success) {
                setAchievements(prev => prev.filter(a => a._id !== achievementId));
            }
        } catch (err) {
            alert('Delete failed');
        } finally {
            setDeleteLoading(false);
            setDeletingId(null);
        }
    };

    if (isAdding) {
        return (
            <div className="achievements-dashboard">
                <div className="nexus-mesh-bg" />
                <div className="achievements-dashboard-header">
                    <div className="header-title-box">
                        <button className="back-btn-v6" onClick={() => setIsAdding(false)}><FaTimes /></button>
                        <div>
                            <h2>NEW <span>RECORD</span></h2>
                            <p>Submit evidence for verification to update your portfolio</p>
                        </div>
                    </div>
                </div>
                <div className="achievement-form-wrapper">
                    <StudentAchievementForm
                        studentData={userData || { _id: studentId }}
                        onSuccess={() => { setIsAdding(false); fetchAchievements(); }}
                    />
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="res-loading-container">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="res-spinner" />
                <p>Syncing Portfolio...</p>
            </div>
        );
    }

    return (
        <div className="achievements-dashboard">
            <div className="nexus-mesh-bg" />

            <div className="achievements-dashboard-header">
                <div className="header-title-box">
                    <div className="icon-box-lg"><FaTrophy /></div>
                    <div>
                        <h2>MY <span>PORTFOLIO</span></h2>
                        <p>A consolidated registry of your verified academic and personal milestones</p>
                    </div>
                </div>
                <div className="stats-pills-row">
                    <div className="stat-pill primary">
                        <span className="val">{stats.points}</span>
                        <span className="lbl">MERIT POINTS</span>
                    </div>
                    <div className="stat-pill success">
                        <span className="val">{stats.verified}</span>
                        <span className="lbl">VERIFIED</span>
                    </div>
                    <button className="add-achievement-btn-v6" onClick={() => setIsAdding(true)}>
                        <FaPlus /> <span>ADD NEW RECORD</span>
                    </button>
                </div>
            </div>

            <div className="achievements-controls">
                <div className="filter-tabs">
                    {[
                        { key: 'all', label: 'All Records', count: achievements.length },
                        { key: 'technical', label: 'Technical', count: achievements.filter(a => a.category?.toLowerCase() === 'technical').length },
                        { key: 'sports', label: 'Sports', count: achievements.filter(a => a.category?.toLowerCase() === 'sports').length },
                        { key: 'cultural', label: 'Cultural', count: achievements.filter(a => a.category?.toLowerCase() === 'cultural').length }
                    ].map(({ key, label, count }) => (
                        <button key={key} className={`filter-tab ${filter === key ? 'active' : ''}`} onClick={() => setFilter(key)}>
                            {label} <span className="count-badge">{count}</span>
                        </button>
                    ))}
                </div>
            </div>

            {filteredAchievements.length === 0 ? (
                <div className="empty-achievements">
                    <FaFileAlt />
                    <h3>REGISTRY EMPTY</h3>
                    <p>No records found for the selected filter.</p>
                </div>
            ) : (
                <div className="achievements-grid-v2">
                    <AnimatePresence mode="popLayout">
                        {filteredAchievements.map((achievement, idx) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.04 }}
                                key={achievement._id}
                                className="achievement-card-v6"
                            >
                                <div className="card-status-strip" style={{ background: achievement.status === 'Approved' ? '#10b981' : '#f59e0b' }}></div>
                                <div className="card-header">
                                    <div className="cat-icon">{getCategoryIcon(achievement.category)}</div>
                                    <div className="achievement-info">
                                        <h3 className="achievement-title">{achievement.title}</h3>
                                        <div className="achievement-meta">
                                            <span className="meta-tag">{achievement.category}</span>
                                            <span className="meta-tag">{achievement.level}</span>
                                        </div>
                                    </div>
                                    <div className="action-buttons">
                                        <button className="btn-action-v6 view" onClick={() => startEdit(achievement)}><FaEdit /></button>
                                        <button className="btn-action-v6 delete" onClick={() => handleDelete(achievement._id, achievement.title)}><FaTimes /></button>
                                    </div>
                                </div>
                                <div className="achievement-body">
                                    <p className="achievement-description">{achievement.description || 'No description provided.'}</p>
                                    <div className="achievement-details">
                                        <div className="detail-item">
                                            <span className="detail-label">Event</span>
                                            <span className="detail-value">{achievement.eventName}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Date</span>
                                            <span className="detail-value">{formatDate(achievement.achievementDate)}</span>
                                        </div>
                                    </div>
                                    <div className="docs-row">
                                        {achievement.documents?.map((doc, dIdx) => (
                                            <button key={dIdx} className="doc-pill" onClick={() => setViewerDoc({ fileUrl: doc.fileUrl, fileName: doc.fileName })}>
                                                <FaEye /> Doc {dIdx + 1}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="achievement-footer">
                                    <div className="points-display">
                                        <FaStar />
                                        <span>{achievement.meritPoints || 0} Points</span>
                                    </div>
                                    <div className={`status-badge ${achievement.status?.toLowerCase()}`}>
                                        {achievement.status}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <DocViewer open={!!viewerDoc} fileUrl={viewerDoc?.fileUrl} fileName={viewerDoc?.fileName} onClose={() => setViewerDoc(null)} />
        </div>
    );
};

export default StudentAchievementsList;
