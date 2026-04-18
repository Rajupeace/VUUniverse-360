import React, { useState, useEffect } from 'react';
import { apiGet, apiPut } from '../../../utils/apiClient';
import { FaTrophy, FaCheck, FaTimes, FaSearch, FaExternalLinkAlt, FaSpinner, FaEye } from 'react-icons/fa';
import './AdminAchievements.css';
import sseClient from '../../../utils/sseClient';
import DocViewer from '../../DocViewer/DocViewer';

const AdminAchievements = () => {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Pending');
    const [search, setSearch] = useState('');
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });
    const [viewerDoc, setViewerDoc] = useState(null);

    const fetchAchievements = async () => {
        setLoading(true);
        try {
            const res = await apiGet('/api/achievements/all/list');
            if (res.success) {
                setAchievements(res.achievements);
                // Calculate stats
                const total = res.achievements.length;
                const pending = res.achievements.filter(a => a.status === 'Pending').length;
                const approved = res.achievements.filter(a => a.status === 'Approved').length;
                setStats({ total, pending, approved });
            }
        } catch (error) {
            console.error('Failed to fetch achievements:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAchievements();

        // Listen for real-time updates
        const unsub = sseClient.onUpdate((ev) => {
            if (ev?.resource === 'achievements') {
                fetchAchievements();
            }
        });

        // Fast polling fallback structure
        const interval = setInterval(fetchAchievements, 30000); // SSE handles real-time; poll every 30s as fallback

        return () => {
            unsub();
            clearInterval(interval);
        };
    }, []);

    const handleApprove = async (id) => {
        if (!window.confirm('Approve this achievement?')) return;
        try {
            await apiPut(`/api/achievements/${id}/approve`, {
                facultyId: 'admin',
                role: 'Admin'
            });
            fetchAchievements(); // Refresh list
        } catch (error) {
            alert('Failed to approve: ' + error.message);
        }
    };

    const handleReject = async (id) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;
        try {
            await apiPut(`/api/achievements/${id}/reject`, {
                facultyId: 'admin',
                role: 'Admin',
                reason
            });
            fetchAchievements(); // Refresh list
        } catch (error) {
            alert('Failed to reject: ' + error.message);
        }
    };

    const filteredList = achievements.filter(item => {
        const matchesFilter = filter === 'All' ? true : item.status === filter;
        const matchesSearch = search === '' ||
            (item.title && item.title.toLowerCase().includes(search.toLowerCase())) ||
            (item.studentId?.studentName && item.studentId.studentName.toLowerCase().includes(search.toLowerCase())) ||
            (item.studentId?.sid && item.studentId.sid.toLowerCase().includes(search.toLowerCase()));

        return matchesFilter && matchesSearch;
    });

    return (
        <>
            <div className="admin-achievements-container">
                {/* Stats Overview */}
                <div className="achievements-stats-row">
                    <div className="ach-stat-card">
                        <span className="val">{stats.total}</span>
                        <span className="lbl">Total Submissions</span>
                    </div>
                    <div className="ach-stat-card highlight">
                        <span className="val">{stats.pending}</span>
                        <span className="lbl">Pending Review</span>
                    </div>
                    <div className="ach-stat-card">
                        <span className="val">{stats.approved}</span>
                        <span className="lbl">Approved</span>
                    </div>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div className="achievements-filters">
                        <button
                            className={`ach-filter-btn ${filter === 'Pending' ? 'active' : ''}`}
                            onClick={() => setFilter('Pending')}
                        >
                            Pending Review
                        </button>
                        <button
                            className={`ach-filter-btn ${filter === 'Approved' ? 'active' : ''}`}
                            onClick={() => setFilter('Approved')}
                        >
                            Approved
                        </button>
                        <button
                            className={`ach-filter-btn ${filter === 'Rejected' ? 'active' : ''}`}
                            onClick={() => setFilter('Rejected')}
                        >
                            Rejected
                        </button>
                        <button
                            className={`ach-filter-btn ${filter === 'All' ? 'active' : ''}`}
                            onClick={() => setFilter('All')}
                        >
                            All Records
                        </button>
                    </div>

                    <div className="admin-search-box" style={{ width: '300px' }}>
                        <FaSearch color="#94a3b8" />
                        <input
                            type="text"
                            placeholder="Search student or title..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ border: 'none', background: 'transparent', outline: 'none', marginLeft: '0.5rem', width: '100%' }}
                        />
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--v-text-muted)' }}>
                        <FaSpinner className="spinner" style={{ fontSize: '2rem', marginBottom: '1rem' }} />
                        <p>Loading achievements...</p>
                    </div>
                ) : (
                    <div className="achievements-grid">
                        {filteredList.length > 0 ? (
                            filteredList.map(item => (
                                <div key={item._id} className="admin-ach-card">
                                    <div className="ach-card-header">
                                        <div className="student-mini-profile">
                                            <div className="student-avatar">
                                                {item.studentId?.studentName?.charAt(0) || '?'}
                                            </div>
                                            <div className="student-info">
                                                <h4>{item.studentId?.studentName || 'Unknown Student'}</h4>
                                                <p>{item.studentId?.branch} • {item.studentId?.year} Year</p>
                                            </div>
                                        </div>
                                        <span className={`status-badge ${item.status.toLowerCase()}`}>
                                            {item.status}
                                        </span>
                                    </div>

                                    <div className="ach-card-body">
                                        <h3 className="ach-title">{item.title}</h3>
                                        <div className="ach-meta">
                                            {item.category !== 'Personal Document' && <span className="meta-pill">{item.level}</span>}
                                            <span className="meta-pill">{new Date(item.achievementDate).toLocaleDateString()}</span>
                                        </div>
                                        {item.category !== 'Personal Document' && (
                                            <p className="ach-desc">
                                                {item.description || "No description provided."}
                                            </p>
                                        )}
                                    </div>

                                    <div className="ach-card-footer">
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            {item.documents && item.documents.length > 0 && item.documents.map((doc, dIdx) => (
                                                <button
                                                    key={dIdx}
                                                    onClick={() => setViewerDoc({ fileUrl: doc.fileUrl, fileName: doc.fileName || `Doc ${dIdx + 1}` })}
                                                    className="proof-link"
                                                    style={{ background: 'none', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                                                >
                                                    <FaEye /> View Doc {dIdx + 1}
                                                </button>
                                            ))}
                                            {item.resultLink && (
                                                <a href={item.resultLink} target="_blank" rel="noopener noreferrer" className="proof-link">
                                                    <FaExternalLinkAlt /> Link
                                                </a>
                                            )}
                                        </div>

                                        {item.status === 'Pending' && (
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-action reject"
                                                    title="Reject"
                                                    onClick={() => handleReject(item._id)}
                                                >
                                                    <FaTimes />
                                                </button>
                                                <button
                                                    className="btn-action approve"
                                                    title="Approve"
                                                    onClick={() => handleApprove(item._id)}
                                                >
                                                    <FaCheck />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="admin-empty-ach">
                                <FaTrophy style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }} />
                                <h3>No Achievements Found</h3>
                                <p>Try adjusting your search or filters.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <DocViewer
                open={!!viewerDoc}
                fileUrl={viewerDoc?.fileUrl}
                fileName={viewerDoc?.fileName}
                onClose={() => setViewerDoc(null)}
            />
        </>
    );
};

export default AdminAchievements;
