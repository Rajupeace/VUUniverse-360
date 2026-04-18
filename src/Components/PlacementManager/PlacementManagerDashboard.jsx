import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaBriefcase, FaBuilding, FaPlus, FaEdit, FaTrash, FaUsers,
    FaCheckCircle, FaClock, FaTimesCircle, FaChartBar, FaSignOutAlt,
    FaSearch,
    FaTrophy, FaGraduationCap, FaSave, FaTimes, FaSpinner, FaBars, FaChevronLeft, FaChevronRight, FaDownload, FaSync, FaEye, FaStickyNote, FaFileArchive,
    FaArrowUp, FaArrowDown, FaRobot
} from 'react-icons/fa';
import StudentProfileModal from '../Shared/StudentProfileModal';
import VuAiAgent from '../VuAiAgent/VuAiAgent';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from '../../utils/apiClient';
import './PlacementManagerDashboard.css';

const STATUS_COLORS = {
    'Live': { bg: '#ecfdf5', text: '#059669', dot: '#10b981' },
    'Upcoming': { bg: '#fffbeb', text: '#d97706', dot: '#f59e0b' },
    'Closed': { bg: '#f8fafc', text: '#64748b', dot: '#94a3b8' }
};

const APP_STATUS_COLORS = {
    'Applied': '#6366f1',
    'Shortlisted': '#f59e0b',
    'Rejected': '#ef4444',
    'Selected': '#10b981',
    'On Hold': '#94a3b8'
};

const BRANCHES = ['All Branches', 'CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AIML'];
const YEARS = ['3', '4'];
const CATEGORIES = ['Top MNCs', 'Product Based', 'Service Based'];

export default function PlacementManagerDashboard({ managerData, onLogout, isEmbedded }) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingCompany, setEditingCompany] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [driveFilter, setDriveFilter] = useState('All');
    const [appFilter, setAppFilter] = useState('All');
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [bulkStatus, setBulkStatus] = useState('');
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [currentAppNote, setCurrentAppNote] = useState({ studentId: '', name: '', text: '' });
    const [downloadingZip, setDownloadingZip] = useState(false);
    const [viewingStudent, setViewingStudent] = useState(null);
    const [viewingStudentAchievements, setViewingStudentAchievements] = useState([]);
    const [fetchingStudent, setFetchingStudent] = useState(false);

    const emptyForm = {
        name: '', slug: '', color: '#4f46e5', description: '', hiringRole: '',
        package: '', minCgpa: 7.0, driveStatus: 'Upcoming', driveType: 'On-Campus',
        applyDeadline: '', eligibleBranches: ['CSE', 'IT'], eligibleYears: ['3', '4'],
        category: 'Product Based', domains: ['Algorithms', 'Aptitude']
    };
    const [formData, setFormData] = useState(emptyForm);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const loadCompanies = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiGet('/api/placements');
            setCompanies(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
            showToast('Failed to load companies', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    // Hyper-sync for high-velocity data
    useEffect(() => {
        loadCompanies();
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') loadCompanies();
        }, 100);
        return () => clearInterval(interval);
    }, [loadCompanies]);

    const handleViewStudentProfile = async (sid) => {
        if (!sid) return;
        setFetchingStudent(true);
        try {
            const [overviewRes, achRes] = await Promise.all([
            ]);

            if (overviewRes && overviewRes.student) {
                setViewingStudent(overviewRes.student);
            } else {
                showToast('Student profile not found', 'error');
            }
            if (achRes && achRes.success) {
                setViewingStudentAchievements(achRes.achievements || []);
            }
        } catch (err) {
            console.error('Failed to fetch student profile:', err);
            showToast('Failed to fetch student details', 'error');
        } finally {
            setFetchingStudent(false);
        }
    };

    // Keep selectedCompany in sync with main companies list (e.g. after refresh)
    useEffect(() => {
        if (selectedCompany) {
            const fresh = companies.find(c => c._id === selectedCompany._id);
            if (fresh && fresh !== selectedCompany) setSelectedCompany(fresh);
        }
    }, [companies, selectedCompany]);

    const stats = {
        total: companies.length,
        live: companies.filter(c => c.driveStatus === 'Live').length,
        upcoming: companies.filter(c => c.driveStatus === 'Upcoming').length,
        totalApplications: companies.reduce((s, c) => s + (c.applications?.length || 0), 0),
        selected: companies.reduce((s, c) => s + (c.applications?.filter(a => a.status === 'Selected').length || 0), 0),
    };

    const filteredCompanies = companies.filter(c => {
        const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchFilter = driveFilter === 'All' || c.driveStatus === driveFilter;
        return matchSearch && matchFilter;
    });

    const openAdd = () => { setFormData(emptyForm); setEditingCompany(null); setShowAddModal(true); };
    const openEdit = (c) => { setFormData({ ...c, domains: c.domains || [], eligibleBranches: c.eligibleBranches || [], eligibleYears: c.eligibleYears || ['3', '4'] }); setEditingCompany(c); setShowAddModal(true); };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editingCompany) {
                showToast(`${formData.name} drive created`);
            }
            setShowAddModal(false);
            loadCompanies();
        } catch (e) {
            showToast(e.message || 'Save failed', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete ${name}? This action cannot be undone.`)) return;
        try {
            showToast(`${name} deleted`);
            setSelectedCompany(null);
            loadCompanies();
        } catch (e) {
            showToast('Delete failed', 'error');
        }
    };

    const handleStatusChange = async (id, driveStatus) => {
        try {
            await apiPatch(`/api/placements/${id}/status`, { driveStatus });
            showToast('Drive status updated');
            loadCompanies();
        } catch (e) {
            showToast('Status update failed', 'error');
        }
    };

    const handleAppStatus = async (companyId, studentId, status) => {
        try {
            await apiPatch(`/api/placements/${companyId}/application/${studentId}`, { status });
            showToast('Application status updated');

            // Update main companies list locally to keep sync
            setCompanies(prev => prev.map(c => {
                if (c._id === companyId) {
                    return {
                        ...c,
                        applications: c.applications.map(a => a.studentId === studentId ? { ...a, status } : a)
                    };
                }
                return c;
            }));
        } catch (e) {
            showToast('Update failed', 'error');
        }
    };

    const toggleSelect = (studentId) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(studentId)) newSet.delete(studentId);
        else newSet.add(studentId);
        setSelectedIds(newSet);
    };

    const toggleSelectAll = (filteredApps) => {
        if (selectedIds.size === filteredApps.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredApps.map(a => a.studentId)));
        }
    };

    const handleBulkUpdate = async () => {
        if (!bulkStatus || selectedIds.size === 0) return;
        setSaving(true);
        try {
            const promises = Array.from(selectedIds).map(sid =>
                apiPatch(`/api/placements/${selectedCompany._id}/application/${sid}`, { status: bulkStatus })
            );
            await Promise.all(promises);
            showToast(`Updated ${selectedIds.size} applications`);
            setSelectedIds(new Set());
            setBulkStatus('');
            // Refresh local state
            setCompanies(prev => prev.map(c => {
                if (c._id === selectedCompany._id) {
                    return {
                        ...c,
                        applications: c.applications.map(a => selectedIds.has(a.studentId) ? { ...a, status: bulkStatus } : a)
                    };
                }
                return c;
            }));
        } catch (e) {
            showToast('Bulk update failed', 'error');
        } finally {
            setSaving(false);
        }
    };

    const toggleBranch = (b) => {
        setFormData(prev => ({
            ...prev,
            eligibleBranches: prev.eligibleBranches.includes(b)
                ? prev.eligibleBranches.filter(x => x !== b)
                : [...prev.eligibleBranches, b]
        }));
    };

    const toggleYear = (y) => {
        setFormData(prev => ({
            ...prev,
            eligibleYears: prev.eligibleYears.includes(y)
                ? prev.eligibleYears.filter(x => x !== y)
                : [...prev.eligibleYears, y]
        }));
    };

    const exportToCSV = () => {
        if (!selectedCompany || !selectedCompany.applications) return;

        const filteredApps = selectedCompany.applications.filter(app => appFilter === 'All' || app.status === appFilter);

        if (filteredApps.length === 0) {
            showToast('No applications to export', 'error');
            return;
        }

        const headers = ['Student Name', 'SID', 'Branch', 'Year', 'CGPA', 'Status', 'Resume Link', 'Applied On'];
        const csvContent = [
            headers.join(','),
            ...filteredApps.map(app => [
                `"${app.studentName || ''}"`,
                `"${app.sid || app.studentId || ''}"`,
                `"${app.branch || ''}"`,
                `"${app.year || ''}"`,
                `"${app.cgpa || ''}"`,
                `"${app.status || ''}"`,
                `"${app.resume ? (app.resume.startsWith('http') ? app.resume : `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${app.resume}`) : ''}"`,
                `"${app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-IN') : ''}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${selectedCompany.name}_Applications_${appFilter}.csv`;
        link.click();
    };

    const openNoteModal = (app) => {
        setCurrentAppNote({ studentId: app.studentId, name: app.studentName, text: app.notes || '' });
        setShowNoteModal(true);
    };

    const handleSaveNote = async () => {
        try {
            await apiPatch(`/api/placements/${selectedCompany._id}/application/${currentAppNote.studentId}/notes`, { notes: currentAppNote.text });
            showToast('Note saved');
            setShowNoteModal(false);
            // Update local state
            setCompanies(prev => prev.map(c => {
                if (c._id === selectedCompany._id) {
                    return {
                        ...c,
                        applications: c.applications.map(a => a.studentId === currentAppNote.studentId ? { ...a, notes: currentAppNote.text } : a)
                    };
                }
                return c;
            }));
        } catch (e) {
            showToast('Failed to save note', 'error');
        }
    };

    const handleBulkDownload = async () => {
        if (selectedIds.size === 0) return;
        setDownloadingZip(true);
        try {
            const zip = new JSZip();
            const folder = zip.folder("resumes");

            const appsToDownload = selectedCompany.applications.filter(a => selectedIds.has(a.studentId) && a.resume);

            if (appsToDownload.length === 0) {
                showToast('No resumes found for selected students', 'error');
                setDownloadingZip(false);
                return;
            }

            const promises = appsToDownload.map(async (app) => {
                try {
                    const url = app.resume.startsWith('http') ? app.resume : `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${app.resume}`;
                    const response = await fetch(url);
                    const blob = await response.blob();
                    const ext = app.resume.split('.').pop() || 'pdf';
                    const filename = `${app.studentName}_${app.sid}.${ext}`;
                    folder.file(filename, blob);
                } catch (e) {
                    console.error(`Failed to download resume for ${app.studentName}`, e);
                }
            });

            await Promise.all(promises);

            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, `${selectedCompany.name}_Resumes.zip`);
            showToast('Resumes downloaded successfully');
        } catch (e) {
            console.error(e);
            showToast('Failed to generate ZIP', 'error');
        } finally {
            setDownloadingZip(false);
        }
    };

    return (
        <div className="pm-shell">
            {/* Sidebar */}
            {!isEmbedded && (
                <aside className={`pm-sidebar ${!isSidebarOpen ? 'collapsed' : ''} ${isSidebarOpen ? 'mobile-open' : ''}`}>
                    <div className="pm-logo">
                        <div className="pm-logo-icon"><FaBriefcase /></div>
                        {isSidebarOpen && (
                            <div className="pm-logo-text">
                                <div className="pm-logo-title">Vu UniVerse360 Placement</div>
                                <div className="pm-logo-sub">Manager Portal</div>
                            </div>
                        )}
                    </div>

                    <nav className="pm-nav">
                        {[
                            { id: 'dashboard', icon: <FaChartBar />, label: 'Overview' },
                            { id: 'drives', icon: <FaBuilding />, label: 'Manage Drives' },
                            { id: 'applications', icon: <FaUsers />, label: 'Applications' },
                            { id: 'ai-agent', icon: <FaRobot />, label: 'Placement Agent' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                className={`pm-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    if (window.innerWidth <= 768) setSidebarOpen(false);
                                }}
                            >
                                <span className="pm-nav-icon">{tab.icon}</span>
                                {isSidebarOpen && <span className="pm-nav-label">{tab.label}</span>}
                            </button>
                        ))}
                    </nav>

                    <div className="pm-sidebar-footer">
                        <div className="pm-user-card">
                            <div className="pm-user-avatar">{(managerData?.name || 'P')[0]}</div>
                            {isSidebarOpen && (
                                <div className="pm-user-info">
                                </div>
                            )}
                        </div>
                        <button className="pm-logout-btn" onClick={onLogout} title="Logout">
                            <FaSignOutAlt /> {isSidebarOpen && 'Logout'}
                        </button>

                        <button className="pm-sidebar-toggle" onClick={() => setSidebarOpen(!isSidebarOpen)}>
                            {isSidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
                        </button>
                    </div>
                </aside>
            )}

            {/* Main Content */}
            <main className="pm-main">
                {/* Header */}
                <header className="pm-header" style={{ background: isEmbedded ? 'transparent' : 'white', boxShadow: isEmbedded ? 'none' : '', padding: isEmbedded ? '0.5rem 0' : '1.5rem 2.5rem' }}>
                    {isEmbedded ? (
                        <div className="embedded-tabs" style={{ display: 'flex', gap: '0.75rem', flex: 1 }}>
                            {[
                                { id: 'dashboard', label: 'Overview' },
                                { id: 'drives', label: 'Manage Drives' },
                                { id: 'applications', label: 'Applications' },
                                { id: 'ai-agent', label: 'Placement Agent' },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <>
                            <button className="pm-mobile-toggle" onClick={() => setSidebarOpen(!isSidebarOpen)}>
                                <FaBars />
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></div>
                                    <span style={{ fontSize: '0.6rem', fontWeight: 900, color: '#10b981', letterSpacing: '1px' }}>CLOUD SYNC LIVE</span>
                                </div>
                                <div>
                                    <h1 className="pm-header-title">
                                        {activeTab === 'dashboard' ? 'Drive Overview' : activeTab === 'drives' ? 'Manage Drives' : 'Student Applications'}
                                    </h1>
                                    <p className="pm-header-sub">Vignan University Placement Management</p>
                                </div>
                            </div>
                        </>
                    )}
                    <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                        <button className="pm-icon-btn" onClick={loadCompanies} title="Refresh Data" style={{ background: 'white', border: '1px solid #e2e8f0', width: '42px', height: '42px' }}>
                            <FaSync className={loading ? 'pm-spin' : ''} />
                        </button>
                        {activeTab === 'drives' && (
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                className="pm-add-btn" onClick={openAdd}>
                                <FaPlus /> Add Drive
                            </motion.button>
                        )}
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {/* DASHBOARD TAB */}
                    {activeTab === 'dashboard' && (
                        <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="pm-content">
                            <div className="pm-stats-grid">
                                {[
                                    { label: 'Total Drives', value: stats.total, icon: <FaBuilding />, color: '#6366f1', trend: '+12% month', trendUp: true },
                                    { label: 'Live Drives', value: stats.live, icon: <FaCheckCircle />, color: '#10b981', trend: 'Active now', trendUp: true },
                                    { label: 'Upcoming', value: stats.upcoming, icon: <FaClock />, color: '#f59e0b', trend: 'Next 30 days', trendUp: true },
                                    { label: 'Total Applications', value: stats.totalApplications, icon: <FaUsers />, color: '#3b82f6', trend: '+25% hike', trendUp: true },
                                    { label: 'Students Selected', value: stats.selected, icon: <FaTrophy />, color: '#8b5cf6', trend: 'Goal: 500', trendUp: true },
                                ].map((stat, i) => (
                                    <motion.div key={i} className="pm-stat-card"
                                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                                        <div className="pm-stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>{stat.icon}</div>
                                        <div className="pm-stat-value">{stat.value}</div>
                                        <div className="pm-stat-label">{stat.label}</div>
                                        <div className="pm-stat-trend" style={{
                                            display: 'flex', alignItems: 'center', gap: '4px',
                                            fontSize: '0.7rem', marginTop: '8px',
                                            color: stat.trendUp ? '#10b981' : '#ef4444',
                                            fontWeight: 800
                                        }}>
                                            {stat.trendUp ? <FaArrowUp /> : <FaArrowDown />}
                                            <span>{stat.trend}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="pm-section-title">All Drives at a Glance</div>
                            <div className="pm-drives-table">
                                <div className="pm-table-head">
                                    <span>Company</span><span>Drive Type</span><span>Status</span>
                                    <span>Applications</span><span>Deadline</span><span>Actions</span>
                                </div>
                                {companies.map(c => (
                                    <div key={c._id} className="pm-table-row">
                                        <span className="pm-company-cell">
                                            <div className="pm-company-dot" style={{ background: c.color }}></div>
                                            {c.name}
                                        </span>
                                        <span>{c.driveType || '—'}</span>
                                        <span>
                                            <div className="pm-status-pill" style={{ background: STATUS_COLORS[c.driveStatus]?.bg || '#f8fafc', color: STATUS_COLORS[c.driveStatus]?.text || '#64748b' }}>
                                                <span className="pm-status-dot" style={{ background: STATUS_COLORS[c.driveStatus]?.dot }}></span>
                                                {c.driveStatus}
                                            </div>
                                        </span>
                                        <span>{c.applications?.length || 0}</span>
                                        <span>{c.applyDeadline || '—'}</span>
                                        <span className="pm-action-btns">
                                            <button onClick={() => { setSelectedCompany(c); setActiveTab('applications'); }} className="pm-icon-btn blue"><FaUsers /></button>
                                            <button onClick={() => openEdit(c)} className="pm-icon-btn amber"><FaEdit /></button>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* DRIVES TAB */}
                    {activeTab === 'drives' && (
                        <motion.div key="drives" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="pm-content">
                            {/* Filters */}
                            <div className="pm-filters-bar">
                                <div className="pm-search-box">
                                    <FaSearch className="pm-search-icon" />
                                    <input placeholder="Search companies..." value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)} className="pm-search-input" />
                                </div>
                                <div className="pm-filter-pills">
                                    {['All', 'Live', 'Upcoming', 'Closed'].map(f => (
                                        <button key={f} className={`pm-filter-pill ${driveFilter === f ? 'active' : ''}`}
                                            onClick={() => setDriveFilter(f)}>{f}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Company Cards */}
                            {loading ? (
                                <div className="pm-center"><FaSpinner className="pm-spinner" /><p>Loading drives...</p></div>
                            ) : (
                                <div className="pm-drives-grid">
                                    {filteredCompanies.map((c, i) => (
                                        <motion.div key={c._id} className="pm-drive-card"
                                            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.07 }}>
                                            <div className="pm-drive-banner" style={{ background: `linear-gradient(135deg, ${c.color}, ${c.color}aa)` }}>
                                                <div className="pm-drive-status-badge" style={{ background: STATUS_COLORS[c.driveStatus]?.dot }}>
                                                    {c.driveStatus === 'Live' && <span className="pm-pulse"></span>}
                                                    {c.driveStatus}
                                                </div>
                                                <div className="pm-drive-logo">{c.name[0]}</div>
                                            </div>
                                            <div className="pm-drive-body">
                                                <div className="pm-drive-name">{c.name}</div>
                                                <div className="pm-drive-role">{c.hiringRole}</div>
                                                <div className="pm-drive-meta">
                                                    <span className="pm-meta-tag">{c.driveType}</span>
                                                    <span className="pm-meta-tag green">{c.package}</span>
                                                </div>
                                                <div className="pm-drive-info-row">
                                                    <span><FaGraduationCap />&nbsp;{(c.eligibleYears || ['3', '4']).join(', ')} Year</span>
                                                    <span><FaUsers />&nbsp;{c.applications?.length || 0} applied</span>
                                                </div>
                                                {c.applyDeadline && (
                                                    <div className="pm-deadline">📅 Deadline: <strong>{c.applyDeadline}</strong></div>
                                                )}

                                                {/* Status Switcher */}
                                                <div className="pm-status-switcher">
                                                    <span className="pm-switch-label">Status:</span>
                                                    {['Live', 'Upcoming', 'Closed'].map(s => (
                                                        <button key={s}
                                                            className={`pm-switch-btn ${c.driveStatus === s ? 'active' : ''}`}
                                                            style={c.driveStatus === s ? { background: STATUS_COLORS[s]?.dot, color: 'white' } : {}}
                                                            onClick={() => handleStatusChange(c._id, s)}>
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>

                                                <div className="pm-drive-actions">
                                                    <button className="pm-btn-outline" onClick={() => { setSelectedCompany(c); setActiveTab('applications'); }}>
                                                        <FaUsers /> Applications ({c.applications?.length || 0})
                                                    </button>
                                                    <button className="pm-btn-icon-sm amber" onClick={() => openEdit(c)}><FaEdit /></button>
                                                    <button className="pm-btn-icon-sm red" onClick={() => handleDelete(c._id, c.name)}><FaTrash /></button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {filteredCompanies.length === 0 && (
                                        <div className="pm-empty">
                                            <FaBuilding size={48} />
                                            <h3>No Drives Found</h3>
                                            <p>Click "Add Company Drive" to post a new placement drive.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* APPLICATIONS TAB */}
                    {activeTab === 'applications' && (
                        <motion.div key="apps" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="pm-content">
                            {/* Company Selector */}
                            <div className="pm-company-selector">
                                <label className="pm-form-label">Select Company Drive</label>
                                <div className="pm-company-pills">
                                    {companies.map(c => (
                                        <button key={c._id}
                                            className={`pm-company-pill ${selectedCompany?._id === c._id ? 'active' : ''}`}
                                            style={selectedCompany?._id === c._id ? { background: c.color, borderColor: c.color } : {}}
                                            onClick={() => setSelectedCompany(companies.find(x => x._id === c._id))}>
                                            {c.name}
                                            <span className="pm-app-count">{c.applications?.length || 0}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {selectedCompany ? (
                                <div className="pm-apps-panel">
                                    <div className="pm-apps-header">
                                        <div>
                                            <h2 className="pm-apps-title">{selectedCompany.name} — Applications</h2>
                                            <p className="pm-apps-sub">{selectedCompany.applications?.length || 0} total applicants</p>
                                        </div>
                                        <div className="pm-apps-stats">
                                            {Object.entries(APP_STATUS_COLORS).map(([s, col]) => (
                                                <div key={s} className="pm-app-stat-pill" style={{ background: `${col}15`, color: col }}>
                                                    {selectedCompany.applications?.filter(a => a.status === s).length || 0} {s}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Application Status Filter & Export */}
                                    <div className="pm-filters-bar" style={{ marginBottom: '1.5rem', marginTop: '-1rem', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <span className="pm-switch-label">Filter Status:</span>
                                            <div className="pm-filter-pills">
                                                {['All', 'Selected', 'Shortlisted', 'Applied', 'Rejected'].map(status => (
                                                    <button
                                                        key={status}
                                                        className={`pm-filter-pill ${appFilter === status ? 'active' : ''}`}
                                                        onClick={() => setAppFilter(status)}
                                                    >
                                                        {status}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <button className="pm-btn-outline" onClick={exportToCSV} title="Export filtered list" style={{ flex: 'none' }}>
                                            <FaDownload /> Export CSV
                                        </button>
                                    </div>

                                    {/* Bulk Actions Bar */}
                                    {selectedIds.size > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="pm-filters-bar"
                                            style={{ background: '#f0f9ff', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #bae6fd', marginBottom: '1.5rem' }}
                                        >
                                            <span style={{ fontWeight: 700, color: '#0284c7', fontSize: '0.9rem' }}>{selectedIds.size} Selected</span>
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginLeft: 'auto' }}>
                                                <select
                                                    className="pm-status-select"
                                                    value={bulkStatus}
                                                    onChange={e => setBulkStatus(e.target.value)}
                                                >
                                                    <option value="">Select Status...</option>
                                                    {Object.keys(APP_STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                                <button className="pm-btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={handleBulkUpdate} disabled={!bulkStatus || saving}>
                                                    {saving ? 'Updating...' : 'Update All'}
                                                </button>
                                                <button className="pm-btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={handleBulkDownload} disabled={downloadingZip}>
                                                    {downloadingZip ? <FaSpinner className="pm-spin" /> : <><FaFileArchive /> ZIP Resumes</>}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {(!selectedCompany.applications || selectedCompany.applications.length === 0) ? (
                                        <div className="pm-empty" style={{ marginTop: '3rem' }}>
                                            <FaUsers size={48} />
                                            <h3>No Applications Yet</h3>
                                            <p>Students will appear here after they apply to this drive.</p>
                                        </div>
                                    ) : (
                                        <div className="pm-apps-table-wrap">
                                            <table className="pm-apps-table">
                                                <thead>
                                                    <tr>
                                                        <th>
                                                            <input
                                                                type="checkbox"
                                                                onChange={() => toggleSelectAll(selectedCompany.applications.filter(app => appFilter === 'All' || app.status === appFilter))}
                                                                checked={selectedIds.size > 0 && selectedIds.size === selectedCompany.applications.filter(app => appFilter === 'All' || app.status === appFilter).length}
                                                            />
                                                        </th>
                                                        <th>Student</th><th>SID</th>
                                                        <th>Branch</th><th>Year</th><th>CGPA</th><th>Resume</th>
                                                        <th>Applied On</th><th>Status</th><th>Notes</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedCompany.applications
                                                        .filter(app => appFilter === 'All' || app.status === appFilter)
                                                        .map((app, i) => (
                                                            <tr key={i}>
                                                                <td>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedIds.has(app.studentId)}
                                                                        onChange={() => toggleSelect(app.studentId)}
                                                                    />
                                                                </td>
                                                                <td className="pm-app-name">
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                        {app.studentName || '—'}
                                                                        <button
                                                                            className="pm-icon-btn blue"
                                                                            onClick={() => handleViewStudentProfile(app.studentId)}
                                                                            title="View Full Profile"
                                                                            disabled={fetchingStudent}
                                                                            style={{ width: '24px', height: '24px', fontSize: '0.75rem', opacity: fetchingStudent ? 0.5 : 1 }}
                                                                        >
                                                                            {fetchingStudent ? <FaSpinner className="pm-spinner" /> : <FaEye />}
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                                <td>{app.sid || app.studentId}</td>
                                                                <td>{app.branch || '—'}</td>
                                                                <td>{app.year ? `${app.year}rd/th` : '—'}</td>
                                                                <td><span className="pm-cgpa-badge">{app.cgpa || '—'}</span></td>
                                                                <td>
                                                                    {app.resume ? (
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                            <span style={{
                                                                                background: '#dcfce7', color: '#166534',
                                                                                padding: '2px 8px', borderRadius: '6px',
                                                                                fontSize: '0.75rem', fontWeight: '800'
                                                                            }}>Yes</span>
                                                                            <a
                                                                                href={app.resume.startsWith('http') ? app.resume : `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${app.resume}`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="pm-icon-btn blue"
                                                                                title="View Resume"
                                                                                style={{ width: '26px', height: '26px', fontSize: '0.8rem', textDecoration: 'none' }}
                                                                            ><FaEye /></a>
                                                                            <a
                                                                                href={app.resume.startsWith('http') ? app.resume : `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${app.resume}`}
                                                                                download
                                                                                className="pm-icon-btn blue"
                                                                                title="Download Resume"
                                                                                style={{ width: '26px', height: '26px', fontSize: '0.8rem', textDecoration: 'none' }}
                                                                            ><FaDownload /></a>
                                                                        </div>
                                                                    ) : (
                                                                        <span style={{
                                                                            background: '#fee2e2', color: '#991b1b',
                                                                            padding: '2px 8px', borderRadius: '6px',
                                                                            fontSize: '0.75rem', fontWeight: '800'
                                                                        }}>No</span>
                                                                    )}
                                                                </td>
                                                                <td>{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-IN') : '—'}</td>
                                                                <td>
                                                                    <select
                                                                        className="pm-status-select"
                                                                        style={{ borderColor: APP_STATUS_COLORS[app.status], color: APP_STATUS_COLORS[app.status] }}
                                                                        value={app.status}
                                                                        onChange={e => handleAppStatus(selectedCompany._id, app.studentId, e.target.value)}
                                                                    >
                                                                        {Object.keys(APP_STATUS_COLORS).map(s => (
                                                                            <option key={s}>{s}</option>
                                                                        ))}
                                                                    </select>
                                                                </td>
                                                                <td>
                                                                    <button className="pm-icon-btn" style={{ background: app.notes ? '#fff7ed' : 'transparent', color: app.notes ? '#ea580c' : '#94a3b8' }} onClick={() => openNoteModal(app)} title={app.notes || "Add Note"}>
                                                                        <FaStickyNote />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="pm-empty" style={{ marginTop: '3rem' }}>
                                    <FaBuilding size={48} />
                                    <p>Select a company above to view its applications.</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* AI AGENT TAB */}
                    {activeTab === 'ai-agent' && (
                        <motion.div key="ai-agent" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="pm-content" style={{ padding: 0 }}>
                            <div style={{ height: 'calc(100vh - 100px)' }}>
                                <VuAiAgent onNavigate={setActiveTab} documentContext={{ title: "Placement Hub", content: "Agent is assisting the placement manager with campus drives, eligible students, packages, and application statuses.", data: { companies } }} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Add/Edit Company Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div className="pm-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setShowAddModal(false)}>
                        <motion.div className="pm-modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
                            <div className="pm-modal-header">
                                <h2>{editingCompany ? `Edit — ${editingCompany.name}` : 'Add New Company Drive'}</h2>
                                <button className="pm-modal-close" onClick={() => setShowAddModal(false)}><FaTimes /></button>
                            </div>
                            <div className="pm-modal-body">
                                <div className="pm-form-grid">
                                    <div className="pm-form-group">
                                        <label className="pm-form-label">Company Name *</label>
                                        <input className="pm-form-input" value={formData.name}
                                            onChange={e => setFormData(p => ({ ...p, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                                            placeholder="e.g. Google" />
                                    </div>
                                    <div className="pm-form-group">
                                        <label className="pm-form-label">Hiring Role *</label>
                                        <input className="pm-form-input" value={formData.hiringRole}
                                            onChange={e => setFormData(p => ({ ...p, hiringRole: e.target.value }))}
                                            placeholder="e.g. Software Engineer" />
                                    </div>
                                    <div className="pm-form-group">
                                        <label className="pm-form-label">Package (CTC)</label>
                                        <input className="pm-form-input" value={formData.package}
                                            onChange={e => setFormData(p => ({ ...p, package: e.target.value }))}
                                            placeholder="e.g. 12.5 LPA" />
                                    </div>
                                    <div className="pm-form-group">
                                        <label className="pm-form-label">Min CGPA</label>
                                        <input className="pm-form-input" type="number" step="0.1" value={formData.minCgpa}
                                            onChange={e => setFormData(p => ({ ...p, minCgpa: parseFloat(e.target.value) }))} />
                                    </div>
                                    <div className="pm-form-group">
                                        <label className="pm-form-label">Drive Status</label>
                                        <select className="pm-form-input" value={formData.driveStatus}
                                            onChange={e => setFormData(p => ({ ...p, driveStatus: e.target.value }))}>
                                            <option>Upcoming</option><option>Live</option><option>Closed</option>
                                        </select>
                                    </div>
                                    <div className="pm-form-group">
                                        <label className="pm-form-label">Drive Type</label>
                                        <select className="pm-form-input" value={formData.driveType}
                                            onChange={e => setFormData(p => ({ ...p, driveType: e.target.value }))}>
                                            <option>On-Campus</option><option>Off-Campus</option><option>Pool Campus</option>
                                        </select>
                                    </div>
                                    <div className="pm-form-group">
                                        <label className="pm-form-label">Apply Deadline</label>
                                        <input className="pm-form-input" value={formData.applyDeadline}
                                            onChange={e => setFormData(p => ({ ...p, applyDeadline: e.target.value }))}
                                            placeholder="e.g. Oct 15, 2026" />
                                    </div>
                                    <div className="pm-form-group">
                                        <label className="pm-form-label">Brand Color</label>
                                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                            <input type="color" value={formData.color}
                                                onChange={e => setFormData(p => ({ ...p, color: e.target.value }))}
                                                style={{ width: 50, height: 42, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
                                            <input className="pm-form-input" value={formData.color}
                                                onChange={e => setFormData(p => ({ ...p, color: e.target.value }))} style={{ flex: 1 }} />
                                        </div>
                                    </div>
                                    <div className="pm-form-group pm-full-width">
                                        <label className="pm-form-label">Category</label>
                                        <div className="pm-toggle-group">
                                            {CATEGORIES.map(cat => (
                                                <button key={cat} type="button"
                                                    className={`pm-toggle-btn ${formData.category === cat ? 'active' : ''}`}
                                                    onClick={() => setFormData(p => ({ ...p, category: cat }))}>
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="pm-form-group pm-full-width">
                                        <label className="pm-form-label">Eligible Years</label>
                                        <div className="pm-toggle-group">
                                            {YEARS.map(y => (
                                                <button key={y} type="button"
                                                    className={`pm-toggle-btn ${formData.eligibleYears?.includes(y) ? 'active' : ''}`}
                                                    onClick={() => toggleYear(y)}>
                                                    Year {y}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="pm-form-group pm-full-width">
                                        <label className="pm-form-label">Eligible Branches</label>
                                        <div className="pm-toggle-group pm-wrap">
                                            {BRANCHES.map(b => (
                                                <button key={b} type="button"
                                                    className={`pm-toggle-btn ${formData.eligibleBranches?.includes(b) ? 'active' : ''}`}
                                                    onClick={() => toggleBranch(b)}>
                                                    {b}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="pm-form-group pm-full-width">
                                        <label className="pm-form-label">Description</label>
                                        <textarea className="pm-form-input pm-textarea" value={formData.description}
                                            onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                                            placeholder="Brief company description..." rows={3} />
                                    </div>
                                </div>
                            </div>
                            <div className="pm-modal-footer">
                                <button className="pm-btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <motion.button className="pm-btn-primary" whileTap={{ scale: 0.97 }}
                                    onClick={handleSave} disabled={saving}>
                                    {saving ? <><FaSpinner className="pm-spin" /> Saving...</> : <><FaSave /> {editingCompany ? 'Save Changes' : 'Create Drive'}</>}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Notes Modal */}
            <AnimatePresence>
                {showNoteModal && (
                    <motion.div className="pm-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNoteModal(false)}>
                        <motion.div className="pm-modal" style={{ maxWidth: '500px' }} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
                            <div className="pm-modal-header">
                                <h2>Notes for {currentAppNote.name}</h2>
                                <button className="pm-modal-close" onClick={() => setShowNoteModal(false)}><FaTimes /></button>
                            </div>
                            <div className="pm-modal-body">
                                <textarea className="pm-form-input pm-textarea" rows={6} placeholder="Add internal comments here..." value={currentAppNote.text} onChange={e => setCurrentAppNote(p => ({ ...p, text: e.target.value }))} autoFocus />
                            </div>
                            <div className="pm-modal-footer">
                                <button className="pm-btn-ghost" onClick={() => setShowNoteModal(false)}>Cancel</button>
                                <button className="pm-btn-primary" onClick={handleSaveNote}>Save Note</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div className={`pm-toast ${toast.type}`}
                        initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 100, opacity: 0 }}>
                        {toast.type === 'success' ? <FaCheckCircle /> : <FaTimesCircle />} {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            <StudentProfileModal
                isOpen={!!viewingStudent}
                onClose={() => {
                    setViewingStudent(null);
                    setViewingStudentAchievements([]);
                }}
                student={viewingStudent}
                viewedAchievements={viewingStudentAchievements}
                getFileUrl={(u) => {
                    if (!u) return '';
                    if (u.startsWith('http')) return u;
                    const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';
                    return `${API_BASE}${u.startsWith('/') ? '' : '/'}${u}`;
                }}
            />
        </div>
    );
}
