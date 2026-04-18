import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaTrophy, FaSearch, FaFilter, FaDownload, FaFileExcel, FaRedo,
    FaClock, FaCheckCircle, FaTimesCircle, FaEye, FaCalendarAlt,
    FaUserCircle, FaChevronDown, FaGlobeAmericas, FaAward, FaCloudUploadAlt,
    FaCheck, FaTimes, FaSpinner, FaExternalLinkAlt, FaTrash, FaLayerGroup,
    FaUsers, FaFolderOpen, FaCheckDouble, FaChartPie, FaMagic, FaTrashAlt, FaFilePdf, FaImage, FaFileAlt, FaCloudDownloadAlt, FaTasks
} from 'react-icons/fa';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Pie, Bar } from 'react-chartjs-2';
import { apiGet, apiPut, apiPatch } from '../../../utils/apiClient';
import sseClient from '../../../utils/sseClient';
import './AchievementManager.css';
import DocViewer from '../../DocViewer/DocViewer';
import StudentProfileModal from '../../Shared/StudentProfileModal';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// ─── ANIMATION VARIANTS ────────────────────────────────────────────────────────
const containerVar = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08
        }
    }
};

const itemVar = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
};

const cardVar = {
    hidden: { scale: 0.95, opacity: 0 },
    show: {
        scale: 1,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15
        }
    }
};

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const BATCHES = ['All', '2020', '2021', '2022', '2023', '2024'];
const YEARS = ['All', '1', '2', '3', '4'];
const BRANCHES = ['All', 'CSE', 'ECE', 'EEE', 'IT', 'AIML', 'MECH', 'CIVIL'];

const CATEGORIES = [
    'All',
    'Academic Certificates',
    'Core Activity Certificates',
    'Achievement Certificates',
    'Personal Document Certificates',
    'Other'
];

const STATUSES = ['All', 'Pending', 'Approved', 'Rejected'];

const LETTER_SECTIONS = Array.from({ length: 20 }, (_, i) => String.fromCharCode(65 + i));
const NUM_SECTIONS = Array.from({ length: 19 }, (_, i) => String(i + 1));
const SECTIONS_LIST = ['All', ...LETTER_SECTIONS, ...NUM_SECTIONS];


const CAT_ICONS = {
    'Academic Certificates': '🎓',
    'Core Activity Certificates': '⭐',
    'Achievement Certificates': '🏅',
    'Personal Document Certificates': '📁',
    'Other': '✨'
};

const LEVEL_CLR = {
    'International Level': '#7c3aed',
    'National Level': '#2563eb',
    'State Level': '#0891b2',
    'Inter-College': '#059669',
    'College Level': '#d97706'
};

const API = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const fileUrl = (u) => !u ? '' : u.startsWith('http') ? u : `${API}${u.startsWith('/') ? u : '/' + u}`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const getBatch = (a) => {
    const sid = a.studentId?.sid || a.rollNumber || '';
    if (sid.startsWith('20')) return sid.substring(0, 4);
    return a.studentId?.admissionYear || a.studentId?.batch || '';
};

const getYear = (a) => String(a.year || a.studentId?.year || '');
const getSec = (a) => String(a.section || a.studentId?.section || '');
const getBranch = (a) => (a.department || a.studentId?.branch || '').toUpperCase();
const getName = (a) => a.studentId?.studentName || a.studentName || 'Unknown';
const getSid = (a) => a.studentId?.sid || a.rollNumber || '';

const getDocIcon = (type) => {
    if (type === 'pdf') return <FaFilePdf />;
    if (type === 'image' || type === 'jpg' || type === 'png') return <FaImage />;
    return <FaFileAlt />;
};

// ─── CLIENT-SIDE EXCEL EXPORT (using xlsx) ────────────────────────────────────
const exportToExcel = async (rows, filename, sheetName = 'Achievements') => {
    try {
        const XLSX = await import('xlsx');
        const ws = XLSX.utils.json_to_sheet(rows);
        ws['!cols'] = Object.keys(rows[0] || {}).map(() => ({ wch: 22 }));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        XLSX.writeFile(wb, filename);
    } catch (e) {
        alert('Excel export failed: ' + e.message);
    }
};

const exportMultiSheet = async (sheets, filename) => {
    try {
        const XLSX = await import('xlsx');
        const wb = XLSX.utils.book_new();
        sheets.forEach(({ name, rows }) => {
            if (!rows.length) return;
            const ws = XLSX.utils.json_to_sheet(rows);
            ws['!cols'] = Object.keys(rows[0]).map(() => ({ wch: 22 }));
            XLSX.utils.book_append_sheet(wb, ws, name);
        });
        XLSX.writeFile(wb, filename);
    } catch (e) {
        alert('Multi-sheet export failed: ' + e.message);
    }
};

const achToRow = (a, i) => ({
    'S.No': i + 1,
    'Student Name': getName(a),
    'Roll Number': getSid(a),
    'Batch': getBatch(a),
    'Year': getYear(a),
    'Section': getSec(a),
    'Branch': getBranch(a),
    'Title': a.title || '',
    'Category': a.category || '',
    'Level': a.level || '',
    'Position': a.position || '',
    'Event': a.eventName || '',
    'Date': a.achievementDate ? new Date(a.achievementDate).toLocaleDateString('en-IN') : '',
    'Status': a.status || '',
    'Docs': (a.documents || []).length,
    'Doc URLs': (a.documents || []).map(d => fileUrl(d.fileUrl)).join(' | '),
    'Description': a.description || 'N/A',
    'Submitted': a.submittedAt ? new Date(a.submittedAt).toLocaleDateString('en-IN') : ''
});

// ─── MINI COMPONENTS ──────────────────────────────────────────────────────────
const Spinner = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8rem', gap: '1.5rem' }}>
        <motion.div
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="ach-mgr-loading-spin"
            style={{ width: '60px', height: '60px', border: '5px solid #e2e8f0', borderTop: '5px solid #4f46e5', borderRadius: '50%' }}
        />
        <p style={{ fontWeight: 900, color: '#64748b', letterSpacing: '2px', fontSize: '0.8rem' }}>SYNCING RECORDS...</p>
    </div>
);

const AnimateNumber = ({ val }) => {
    const [d, setD] = useState(0);
    useEffect(() => {
        let start = 0;
        const end = parseInt(val) || 0;
        if (start === end) return;
        let totalMilSecDur = 1000;
        let incrementTime = (totalMilSecDur / end) > 10 ? (totalMilSecDur / end) : 10;
        let timer = setInterval(() => {
            start += Math.ceil(end / 50);
            if (start >= end) {
                setD(end);
                clearInterval(timer);
            } else {
                setD(start);
            }
        }, incrementTime);
        return () => clearInterval(timer);
    }, [val]);
    return <>{d}</>;
};

const Badge = ({ color, children }) => (
    <span className="ach-v5-badge-inline" style={{
        background: color + '15',
        color,
        border: `1px solid ${color}35`,
        padding: '3px 10px',
        borderRadius: '8px',
        fontSize: '0.65rem',
        fontWeight: 950,
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    }}>{children}</span>
);

const StatusPill = ({ s }) => {
    const map = { Approved: ['#10b981', '✓'], Pending: ['#f59e0b', '⏳'], Rejected: ['#ef4444', '✕'] };
    const [clr, ic] = map[s] || ['#94a3b8', '–'];
    return (
        <span className="v5-status-pill-minimal" style={{
            background: clr + '15',
            color: clr,
            border: `1px solid ${clr}35`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '100px',
            fontSize: '0.7rem',
            fontWeight: 850
        }}>
            {ic} {s?.toUpperCase()}
        </span>
    );
};

// ─── ACHIEVEMENT CARD ─────────────────────────────────────────────────────────
const AchCard = ({ item, onApprove, onReject, onView, onViewStudent, selectionMode, isSelected, onToggleSelect }) => {
    const [exp, setExp] = useState(false);
    const lc = LEVEL_CLR[item.level] || '#6366f1';
    const isPending = item.status === 'Pending';

    return (
        <motion.div
            layout
            variants={cardVar}
            whileHover={{ y: -12, boxShadow: '0 40px 80px -20px rgba(0,0,0,0.15)' }}
            className={`ach-v5-card ${item.status?.toLowerCase()} ${isSelected ? 'selected-card' : ''}`}
            onClick={() => selectionMode && onToggleSelect(item._id)}
            style={{
                position: 'relative',
                border: isSelected ? '3px solid #6366f1' : '1px solid #f1f5f9',
                background: isSelected ? '#f5f7ff' : 'white',
                overflow: 'visible'
            }}
        >
            {/* Status Ribbon */}
            <div className={`v5-status-ribbon ${item.status?.toLowerCase()}`}>
                {item.status}
            </div>

            <div className="v5-card-top">
                <div className="v5-card-type-icon" style={{ background: `${lc}15`, color: lc }}>
                    {CAT_ICONS[item.category] || '🏅'}
                </div>
                {selectionMode && (
                    <div className={`v5-card-selector ${isSelected ? 'active' : ''}`}>
                        {isSelected ? <FaCheckCircle /> : <div className="circle-outline" />}
                    </div>
                )}
            </div>

            <div className="v5-card-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1.25rem' }}>
                    <div className="v5-mini-avatar-w" style={{ background: `linear-gradient(135deg, ${lc}, ${lc}aa)` }}>
                        {getName(item).charAt(0).toUpperCase()}
                    </div>
                    <div className="v5-info-box" onClick={(e) => { e.stopPropagation(); onViewStudent(getSid(item)); }}>
                        <div className="v5-student-name">{getName(item)}</div>
                        <div className="v5-student-meta">{getSid(item)} • {getBranch(item)}</div>
                    </div>
                </div>

                <h3 className="v5-ach-title" title={item.title}>{item.title}</h3>
                <div className="v5-ach-cat-bar">
                    <span className="dot" style={{ backgroundColor: lc }}></span>
                    {item.category}
                </div>

                <div className="v5-ach-badges">
                    <div className="v5-pill blur">Y{getYear(item)} - {getSec(item)}</div>
                    <div className="v5-pill solid" style={{ background: `${lc}15`, color: lc }}>{item.level}</div>
                </div>

                <div className="v5-details-toggle" onClick={() => setExp(!exp)}>
                    {exp ? 'Hide Details' : 'View Details'} {exp ? <FaChevronDown style={{ transform: 'rotate(180deg)' }} /> : <FaChevronDown />}
                </div>

                <AnimatePresence>
                    {exp && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: -10 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -10 }}
                            className="v5-card-details-box"
                        >
                            <div className="details-scroll">
                                <p className="desc-text">{item.description || 'No description.'}</p>
                                {item.eventName && <div className="d-row"><strong>Event</strong> <span>{item.eventName}</span></div>}
                                {item.position && <div className="d-row"><strong>Result</strong> <span>{item.position}</span></div>}
                                {item.organizingInstitution && <div className="d-row"><strong>Host</strong> <span>{item.organizingInstitution}</span></div>}
                                {item.achievementDate && <div className="d-row"><strong>Date</strong> <span>{new Date(item.achievementDate).toLocaleDateString()}</span></div>}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="v5-card-footer-v2">
                <div className="v5-doc-group">
                    {(item.documents || []).map((doc, i) => (
                        <motion.button
                            key={i}
                            whileHover={{ scale: 1.2, rotate: 5, zIndex: 10 }}
                            whileTap={{ scale: 0.9 }}
                            className="v5-btn-mini"
                            onClick={(e) => { e.stopPropagation(); onView({ fileUrl: fileUrl(doc.fileUrl), fileName: doc.fileName || `Doc ${i + 1}` }); }}
                            title={doc.fileName}
                        >
                            {getDocIcon(doc.fileType)}
                        </motion.button>
                    ))}
                    {item.resultLink && (
                        <motion.a
                            whileHover={{ scale: 1.2 }}
                            href={item.resultLink} target="_blank"
                            className="v5-btn-mini link"
                            onClick={e => e.stopPropagation()}
                        >
                            <FaExternalLinkAlt />
                        </motion.a>
                    )}
                </div>

                {isPending && !selectionMode && (
                    <div className="v5-quick-actions">
                        <button className="q-btn approve" onClick={(e) => { e.stopPropagation(); onApprove(item._id); }} title="Approve">
                            <FaCheck />
                        </button>
                        <button className="q-btn reject" onClick={(e) => { e.stopPropagation(); onReject(item._id); }} title="Reject">
                            <FaTimes />
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// ─── ANALYTICS COMPONENT ──────────────────────────────────────────────────────
const AnalyticsView = ({ data }) => {
    const stats = useMemo(() => {
        const s = {
            total: data.length,
            approved: data.filter(i => i.status === 'Approved').length,
            pending: data.filter(i => i.status === 'Pending').length,
            rejected: data.filter(i => i.status === 'Rejected').length,
            groups: {}
        };
        data.forEach(i => {
            s.groups[i.category] = (s.groups[i.category] || 0) + 1;
        });
        return s;
    }, [data]);

    const chartData = {
        labels: Object.keys(stats.groups),
        datasets: [{
            data: Object.values(stats.groups),
            backgroundColor: [
                '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
                '#3b82f6', '#ec4899', '#14b8a6', '#f97316'
            ],
            borderWidth: 0,
            hoverOffset: 20
        }]
    };

    const barData = {
        labels: ['Approved', 'Pending', 'Rejected'],
        datasets: [{
            label: 'Status Overview',
            data: [stats.approved, stats.pending, stats.rejected],
            backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
            borderRadius: 12,
            barThickness: 40
        }]
    };

    return (
        <div className="ach-analytics-root animate-fade-in">
            <div className="meta-grid-v5">
                <div className="meta-card-v5 gradient-1">
                    <div className="meta-icon"><FaTrophy /></div>
                    <div className="meta-info">
                        <h3>{stats.total}</h3>
                        <p>Cumulative Successes</p>
                    </div>
                </div>
                <div className="meta-card-v5 gradient-2">
                    <div className="meta-icon"><FaCheckDouble /></div>
                    <div className="meta-info">
                        <h3>{stats.approved}</h3>
                        <p>Verified Certificates</p>
                    </div>
                </div>
                <div className="meta-card-v5 gradient-3">
                    <div className="meta-icon"><FaClock /></div>
                    <div className="meta-info">
                        <h3>{stats.pending}</h3>
                        <p>Awaiting Protocol</p>
                    </div>
                </div>
            </div>

            <div className="charts-flex-v5">
                <div className="chart-box-v5 glass">
                    <div className="chart-header">
                        <h4>Category Volume</h4>
                        <p>Distribution by accomplishment type</p>
                    </div>
                    <div className="chart-wrapper-mini">
                        <Doughnut
                            data={chartData}
                            options={{
                                cutout: '75%',
                                plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { weight: 'bold', size: 10 } } } }
                            }}
                        />
                    </div>
                </div>
                <div className="chart-box-v5 glass">
                    <div className="chart-header">
                        <h4>Workflow Efficiency</h4>
                        <p>Approval vs Rejection throughput</p>
                    </div>
                    <div className="chart-wrapper-mini">
                        <Pie
                            data={barData}
                            options={{
                                plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { weight: 'bold', size: 10 } } } }
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const AchievementManager = () => {
    const [achievements, setAchievements] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('batch-view');
    const [expandedRows, setExpandedRows] = useState({});
    const [viewerDoc, setViewerDoc] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [batchViewMode, setBatchViewMode] = useState('summary'); // 'summary' | 'details'

    // Bulk Selection
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());

    // Filters
    const [fBatch, setFBatch] = useState('All');
    const [fYear, setFYear] = useState('All');
    const [fCalYear, setFCalYear] = useState('All');
    const [fBranch, setFBranch] = useState('All');
    const [fSection, setFSection] = useState('All');
    const [fCat, setFCat] = useState('All');
    const [fStatus, setFStatus] = useState('All');
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [showFilters, setShowFilters] = useState(false);
    const [viewingStudent, setViewingStudent] = useState(null);
    const [viewingStudentAchievements, setViewingStudentAchievements] = useState([]);
    const [fetchingProfile, setFetchingProfile] = useState(false);
    const [facSearch, setFacSearch] = useState('');
    const [assigning, setAssigning] = useState({});


    const fetchRef = useRef(false);

    // ── FETCH ──────────────────────────────────────────────────────────────────
    const fetchAll = useCallback(async () => {
        if (fetchRef.current) return;
        fetchRef.current = true;
        setLoading(true);
        try {
            const [achRes, facRes] = await Promise.all([
                apiGet('/api/achievements/all/list'),
                apiGet('/api/faculty')
            ]);
            if (achRes?.success) setAchievements(achRes.achievements || []);
            if (Array.isArray(facRes)) setFaculty(facRes);
        } catch (e) { console.error(e); }
        finally { setLoading(false); fetchRef.current = false; }
    }, []);

    useEffect(() => {
        fetchAll();
        const unsub = sseClient.onUpdate(ev => {
            if (['achievements', 'faculty'].includes(ev?.resource)) fetchAll();
        });
        const t = setInterval(fetchAll, 60000);
        return () => { unsub(); clearInterval(t); };
    }, [fetchAll]);

    // ── FILTERED LIST ──────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        return achievements.filter(a => {
            const batch = getBatch(a);
            const yr = getYear(a);
            const br = getBranch(a);
            const sec = getSec(a);
            const cat = a.category || 'Other';
            const name = getName(a).toLowerCase();
            const sid = getSid(a).toLowerCase();
            const title = (a.title || '').toLowerCase();
            const calYear = a.achievementDate ? new Date(a.achievementDate).getFullYear().toString() : '';

            if (fBatch !== 'All' && batch !== fBatch) return false;
            if (fYear !== 'All' && yr !== fYear) return false;
            if (fCalYear !== 'All' && calYear !== fCalYear) return false;
            if (fBranch !== 'All' && !br.includes(fBranch)) return false;
            if (fSection !== 'All' && sec !== fSection) return false;
            if (fCat !== 'All' && cat !== fCat) return false;
            if (fStatus !== 'All' && a.status !== fStatus) return false;
            if (search && !name.includes(search.toLowerCase()) && !sid.includes(search.toLowerCase()) && !title.includes(search.toLowerCase())) return false;
            return true;
        }).sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0);
            if (sortBy === 'oldest') return new Date(a.submittedAt || 0) - new Date(b.submittedAt || 0);
            if (sortBy === 'name') return getName(a).localeCompare(getName(b));
            if (sortBy === 'batch') return getBatch(a).localeCompare(getBatch(b));
            if (sortBy === 'year') return getYear(a).localeCompare(getYear(b));
            return 0;
        });
    }, [achievements, fBatch, fYear, fCalYear, fBranch, fSection, fCat, fStatus, search, sortBy]);

    // Grouping
    const byStudent = useMemo(() => {
        const map = {};
        filtered.forEach(a => {
            const key = getSid(a) || (a._id + '');
            if (!map[key]) map[key] = { name: getName(a), sid: getSid(a), batch: getBatch(a), year: getYear(a), section: getSec(a), branch: getBranch(a), items: [] };
            map[key].items.push(a);
        });
        return Object.values(map).sort((a, b) => a.name.localeCompare(b.name));
    }, [filtered]);

    const byBatch = useMemo(() => {
        const map = {};
        filtered.forEach(a => {
            const b = getBatch(a) || 'Unknown';
            if (!map[b]) map[b] = { batch: b, years: {} };
            const yr = getYear(a) || 'Unknown';
            if (!map[b].years[yr]) map[b].years[yr] = { sections: {} };
            const sec = getSec(a) || 'Unknown';
            if (!map[b].years[yr].sections[sec]) map[b].years[yr].sections[sec] = [];
            map[b].years[yr].sections[sec].push(a);
        });
        return Object.values(map).sort((a, b) => b.batch.localeCompare(a.batch));
    }, [filtered]);

    // ── BULK ACTIONS ──────────────────────────────────────────────────────────
    const toggleSelection = (id) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const selectAllVisible = () => {
        if (selectedIds.size === filtered.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(filtered.map(a => a._id)));
    };


    // ── BATCH DOWNLOAD ────────────────────────────────────────────────────────
    const handleBatchDownload = async (batchData, batchName) => {
        if (!window.confirm(`Initialize bulk download for Batch ${batchName}? This will compile all certificates into a ZIP archive.`)) return;

        setLoading(true);
        try {
            // Dynamic import to ensure libraries are loaded only when needed
            const JSZip = (await import('jszip')).default;
            const { saveAs } = await import('file-saver');

            const zip = new JSZip();
            const folder = zip.folder(`Batch_${batchName}_Certificates`);
            let count = 0;

            // Flatten structure to get all achievements in the batch
            const achievements = Object.values(batchData.years)
                .flatMap(y => Object.values(y.sections).flat());

            // Create an array of download promises
            const downloadPromises = achievements.flatMap(ach =>
                (ach.documents || []).map(async (doc, idx) => {
                    try {
                        const url = fileUrl(doc.fileUrl);
                        const ext = doc.fileName.split('.').pop() || 'jpg';
                        // Sanitize filename components
                        const safeName = getName(ach).replace(/[^a-z0-9]/gi, '_');
                        const safeTitle = (ach.title || 'doc').replace(/[^a-z0-9]/gi, '_').substring(0, 30);
                        const filename = `${getSid(ach)}_${safeName}_${safeTitle}_${idx + 1}.${ext}`;

                        const response = await fetch(url);
                        if (!response.ok) throw new Error(`Failed to fetch ${url}`);
                        const blob = await response.blob();
                        folder.file(filename, blob);
                        count++;
                    } catch (err) {
                        console.warn(`Skipping file for ${ach._id}:`, err);
                    }
                })
            );

            await Promise.all(downloadPromises);

            if (count === 0) {
                alert('No accessible documents found in this batch.');
            } else {
                const content = await zip.generateAsync({ type: "blob" });
                saveAs(content, `Batch_${batchName}_Certificates.zip`);
            }
        } catch (e) {
            console.error('Batch download error:', e);
            alert('Download failed: ' + (e.message || 'Unknown error. Ensure jszip/file-saver are installed.'));
        } finally {
            setLoading(false);
        }
    };

    // ── ACTIONS ────────────────────────────────────────────────────────────────
    const handleViewStudentProfile = async (target) => {
        const sid = typeof target === 'string' ? target : (target.sid || target.studentId?.sid || target.rollNumber);
        if (!sid) return;

        setFetchingProfile(true);
        try {
            const [overviewRes, achRes] = await Promise.all([
                apiGet(`/api/students/${sid}/overview`),
                apiGet(`/api/achievements/student/${sid}`)
            ]);

            if (overviewRes && overviewRes.student) {
                setViewingStudent(overviewRes.student);
            }
            if (achRes && achRes.success) {
                setViewingStudentAchievements(achRes.achievements || []);
            }
        } catch (error) {
            console.error('Failed to fetch student details:', error);
        } finally {
            setFetchingProfile(false);
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm('Approve this achievement?')) return;
        try { await apiPut(`/api/achievements/${id}/approve`, { facultyId: 'admin', role: 'Admin' }); fetchAll(); }
        catch (e) { alert('Failed: ' + e.message); }
    };

    const handleReject = async (id) => {
        const reason = prompt('Rejection reason:');
        if (reason === null) return;
        try { await apiPut(`/api/achievements/${id}/reject`, { facultyId: 'admin', role: 'Admin', reason }); fetchAll(); }
        catch (e) { alert('Failed: ' + e.message); }
    };

    const toggleFacultyRole = async (f) => {
        const isManager = f.isAchievementManager;
        setAssigning(prev => ({ ...prev, [f.facultyId]: true }));
        try {
            await apiPatch(`/api/faculty/${f.facultyId}/role`, {
                isAchievementManager: !isManager
            });
            fetchAll();
        } catch (e) {
            alert('Failed to update role: ' + e.message);
        } finally {
            setAssigning(prev => ({ ...prev, [f.facultyId]: false }));
        }
    };

    const exportCurrentFilter = () => {
        const rows = filtered.map(achToRow);
        exportToExcel(rows, `Achievements_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const exportAllSheets = async () => {
        const sheets = [
            { name: 'All Achievements', rows: filtered.map(achToRow) },
            {
                name: 'Summary',
                rows: [
                    { Metric: 'Total Records', value: filtered.length },
                    ...BATCHES.filter(b => b !== 'All').map(b => ({ Metric: `Batch ${b}`, value: filtered.filter(a => getBatch(a) === b).length }))
                ]
            }
        ];
        await exportMultiSheet(sheets, `Achievements_Archive_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    return (
        <div className="ach-mgr-root">
            {/* HEADER */}
            <div className="ach-mgr-header-v5">
                <div className="header-content-v5">
                    <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="header-icon-v5">
                        <FaTrophy />
                    </motion.div>
                    <div className="header-text-v5" style={{ marginLeft: '1rem' }}>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 950 }}>ACHIEVEMENT <span style={{ color: '#fbbf24' }}>HUB</span></h1>
                        <p style={{ fontSize: '1rem', opacity: 0.8, fontWeight: 600 }}>VU V5 Hub • Premium Verification System</p>
                    </div>
                </div>
                <div className="header-actions-v5">
                    <button className="v5-btn glass" onClick={fetchAll}><FaRedo /> SYNC RECORDS</button>
                    <button className="v5-btn gold" onClick={exportAllSheets}><FaFileExcel /> EXPORT ARCHIVE</button>
                </div>
            </div>

            {/* TABS & META */}
            <div className="v5-tabs-container">
                <button className={`v5-tab ${activeTab === 'batch-view' ? 'active' : ''}`} onClick={() => setActiveTab('batch-view')}>
                    <FaLayerGroup /> Hub Archive
                </button>
                <button className={`v5-tab ${activeTab === 'team' ? 'active' : ''}`} onClick={() => setActiveTab('team')}>
                    <FaUsers /> Team & Managers
                </button>
                <button className={`v5-tab ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
                    <FaChartPie /> Insights
                </button>
            </div>

            {/* Hub Archive Stats Section */}
            {activeTab === 'batch-view' && (
                <div className="v5-hub-stats-hero">
                    <div className="stat-pill-v5">
                        <div className="icon"><FaTasks /></div>
                        <div className="info">
                            <span className="val">{achievements.length}</span>
                            <span className="lab">Global Records</span>
                        </div>
                    </div>
                    <div className="stat-pill-v5">
                        <div className="icon warning"><FaClock /></div>
                        <div className="info">
                            <span className="val">{achievements.filter(a => a.status === 'Pending').length}</span>
                            <span className="lab">Pending Review</span>
                        </div>
                    </div>
                    <div className="stat-pill-v5">
                        <div className="icon success"><FaCheckDouble /></div>
                        <div className="info">
                            <span className="val">{achievements.filter(a => a.status === 'Approved').length}</span>
                            <span className="lab">Verified Success</span>
                        </div>
                    </div>
                    <div className="v5-live-indicator">
                        <div className="pulse-dot"></div>
                        <span>SYSTEM LIVE · REAL-TIME SYNC</span>
                    </div>
                </div>
            )}

            {/* FILTERS Hub (Show only if not in team tab) */}
            {activeTab !== 'team' && (
                <div className="ach-mgr-filter-bar">
                    <div className="ach-mgr-filter-row">
                        <div className="ach-mgr-search-box">
                            <FaSearch />
                            <input type="text" placeholder="Search by name, roll number, or achievement title..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <div className="ach-mgr-status-pills">
                            {STATUSES.map(s => (
                                <button key={s} className={`ach-mgr-status-pill ${s.toLowerCase()} ${fStatus === s ? 'active' : ''}`} onClick={() => setFStatus(s)}>
                                    {s} <span>{achievements.filter(a => (s === 'All' || a.status === s)).length}</span>
                                </button>
                            ))}
                        </div>
                        <button className="v5-btn glass ach-mgr-toggle-filters" onClick={() => setShowFilters(!showFilters)}>
                            <FaFilter /> {showFilters ? 'HIDE' : 'REFINE'}
                        </button>
                        <button className="v5-btn gold" onClick={exportCurrentFilter}><FaFileExcel /> EXCEL</button>
                    </div>

                    <AnimatePresence>
                        {showFilters && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="ach-mgr-advanced-filters">
                                <div className="ach-mgr-filter-group">
                                    <label>Batch</label>
                                    <select value={fBatch} onChange={e => setFBatch(e.target.value)}>
                                        {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                                <div className="ach-mgr-filter-group">
                                    <label>Year</label>
                                    <select value={fYear} onChange={e => setFYear(e.target.value)}>
                                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                                <div className="ach-mgr-filter-group">
                                    <label>Branch</label>
                                    <select value={fBranch} onChange={e => setFBranch(e.target.value)}>
                                        {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                                <div className="ach-mgr-filter-group">
                                    <label>Category</label>
                                    <select value={fCat} onChange={e => setFCat(e.target.value)}>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="ach-mgr-filter-group">
                                    <label>Sort</label>
                                    <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                                        <option value="newest">Newest</option>
                                        <option value="oldest">Oldest</option>
                                        <option value="name">Name</option>
                                    </select>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}


            {/* CONTENT */}
            {loading ? <Spinner /> : (
                <div style={{ marginTop: '2rem' }}>
                    {activeTab === 'batch-view' && (
                        <div className="ach-mgr-batch-view">
                            {byBatch.map(batch => (
                                <div key={batch.batch} style={{ marginBottom: '3.5rem' }}>
                                    <div className="batch-header-v5">
                                        <div className="batch-label">BATCH {batch.batch}</div>
                                        <button className="v5-btn-mini blur" onClick={() => handleBatchDownload(batch, batch.batch)}>
                                            <FaCloudDownloadAlt /> DOWNLOAD BATCH ZIP
                                        </button>
                                    </div>
                                    {Object.entries(batch.years).map(([yr, data]) => (
                                        <div key={yr} className="year-section-v5">
                                            <div className="year-indicator">YEAR {yr}</div>
                                            {Object.entries(data.sections).map(([sec, items]) => (
                                                <div key={sec} className="section-container-v5" style={{ marginBottom: '2rem' }}>
                                                    <div className="section-title" style={{ fontSize: '0.9rem', fontWeight: 900, color: '#64748b', marginBottom: '1rem', paddingLeft: '1rem', borderLeft: '4px solid #e2e8f0' }}>SECTION {sec} • {items.length} RECORDS</div>
                                                    <div className="ach-mgr-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                                                        {items.map(item => (
                                                            <AchCard
                                                                key={item._id}
                                                                item={item}
                                                                onApprove={handleApprove}
                                                                onReject={handleReject}
                                                                onView={setViewerDoc}
                                                                onViewStudent={handleViewStudentProfile}
                                                                selectionMode={selectionMode}
                                                                isSelected={selectedIds.has(item._id)}
                                                                onToggleSelect={toggleSelection}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ))}
                            {byBatch.length === 0 && (
                                <div className="ach-mgr-empty-state">
                                    <FaFolderOpen size={48} />
                                    <h3>No records found for the selected filters.</h3>
                                    <p>Try adjusting your refined search or clear filters to see more.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'team' && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="faculty-management-view">
                            <div className="team-header-box">
                                <h2><FaUsers /> Verifier Network</h2>
                                <p>Manage institutional achievement managers and verification roles.</p>
                                <div className="team-search">
                                    <FaSearch />
                                    <input type="text" placeholder="Search faculty by name or ID..." value={facSearch} onChange={e => setFacSearch(e.target.value)} />
                                </div>
                            </div>
                            <div className="faculty-grid-v5">
                                {faculty.filter(f => !facSearch || f.name?.toLowerCase().includes(facSearch.toLowerCase()) || f.facultyId?.toLowerCase().includes(facSearch.toLowerCase())).map(f => {
                                    const isManager = f.isAchievementManager;
                                    return (
                                        <div key={f.facultyId} className={`faculty-card-v5 ${isManager ? 'manager' : ''}`}>
                                            <div className="f-avatar-v5">{f.name?.charAt(0)}</div>
                                            <div className="f-info-v5">
                                                <strong>{f.name}</strong>
                                                <span>{f.facultyId} • {f.department || 'General'}</span>
                                                <div className="role-badge" style={{ background: isManager ? '#fbbf24' : '#f1f5f9', color: isManager ? '#000' : '#64748b' }}>
                                                    {isManager ? 'Achievement Manager' : 'Faculty'}
                                                </div>
                                            </div>
                                            <button
                                                className={`role-toggle-btn ${isManager ? 'active' : ''}`}
                                                disabled={assigning[f.facultyId]}
                                                onClick={() => toggleFacultyRole(f)}
                                            >
                                                {assigning[f.facultyId] ? <FaSpinner className="fa-spin" /> : (isManager ? 'Remove Manager' : 'Make Manager')}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'analytics' && <AnalyticsView data={filtered} />}
                </div>
            )}

            {/* OVERLAYS */}
            <AnimatePresence>
                {selectedStudent && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="ach-mgr-panel-overlay" onClick={() => setSelectedStudent(null)}>
                        <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="ach-mgr-panel-container" onClick={e => e.stopPropagation()}>
                            <div className="ach-mgr-panel-header">
                                <div className="ach-mgr-panel-avatar">{selectedStudent.name.charAt(0).toUpperCase()}</div>
                                <div className="ach-mgr-panel-info">
                                    <h2>{selectedStudent.name}</h2>
                                    <div className="ach-mgr-panel-tags">
                                        <span className="tag blue">{selectedStudent.sid}</span>
                                        <span className="tag purple">Batch {selectedStudent.batch}</span>
                                        <span className="tag green">{selectedStudent.branch}</span>
                                    </div>
                                </div>
                                <button className="ach-mgr-panel-close" onClick={() => setSelectedStudent(null)}><FaTimes /></button>
                            </div>
                            <div className="ach-mgr-panel-body">
                                <div className="ach-mgr-panel-grid">
                                    {selectedStudent.items.map(item => <AchCard key={item._id} item={item} onApprove={handleApprove} onReject={handleReject} onView={setViewerDoc} onViewStudent={handleViewStudentProfile} />)}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <StudentProfileModal
                isOpen={!!viewingStudent}
                onClose={() => setViewingStudent(null)}
                student={viewingStudent}
                viewedAchievements={viewingStudentAchievements}
                getFileUrl={fileUrl}
                fetching={fetchingProfile}
            />

            <DocViewer isOpen={!!viewerDoc} fileUrl={viewerDoc?.fileUrl} fileName={viewerDoc?.fileName} onClose={() => setViewerDoc(null)} />
        </div>
    );
};

export default AchievementManager;
