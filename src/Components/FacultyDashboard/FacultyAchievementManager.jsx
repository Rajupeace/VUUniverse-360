import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiGet, apiPut, apiPatch } from '../../utils/apiClient';
import {
    FaTrophy, FaCheck, FaTimes, FaSearch, FaExternalLinkAlt, FaSpinner,
    FaEye, FaDownload, FaFilter, FaUsers, FaFileExcel,
    FaChevronDown, FaChevronUp, FaFileAlt, FaCalendarAlt,
    FaRedo, FaUserCircle, FaLayerGroup, FaCheckDouble, FaChartPie,
    FaSort, FaCloudDownloadAlt, FaTimes as FaX, FaMagic,
    FaChartBar, FaChartLine, FaClock, FaStar, FaExclamationTriangle,
    FaArrowUp, FaArrowDown, FaUserGraduate
} from 'react-icons/fa';
import DocViewer from '../DocViewer/DocViewer';
import StudentProfileModal from '../Shared/StudentProfileModal';
import '../Shared/StudentProfileModal.css';
import sseClient from '../../utils/sseClient';
import './FacultyAchievementManager.css';

// Chart.js imports
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Doughnut, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const BATCHES = ['All', '2021', '2022', '2023', '2024', '2025', '2026', '2027'];
const YEARS = ['All', '1', '2', '3', '4'];
const BRANCHES = ['All', 'CSE', 'ECE', 'EEE', 'IT', 'AIML', 'MECH', 'CIVIL'];

// Sections: A-T (20 letters) + 1-19 (numbers)
const LETTER_SECTIONS = Array.from({ length: 20 }, (_, i) => String.fromCharCode(65 + i));
const NUM_SECTIONS = Array.from({ length: 19 }, (_, i) => String(i + 1));
const SECTIONS_LIST = ['All', ...LETTER_SECTIONS, ...NUM_SECTIONS];

const STATUSES = ['All', 'Pending', 'Approved', 'Rejected'];

// Document type mapping for better categorization
const DOCUMENT_TYPE_MAPPING = {
    'Academic Certificates': ['Certificate', 'Report'],
    'Sports Certificates': ['Certificate'],
    'Technical Certificates': ['Certificate', 'Screenshot'],
    'Personal Document Certificates': ['Certificate', 'Other'],
    'Research': ['Certificate', 'Report'],
    'Cultural': ['Certificate'],
    'Community Service': ['Certificate'],
    'Other': ['Certificate', 'Screenshot', 'Report', 'Other']
};

const CAT_ICONS = {
    'Technical Certificates': '💻',
    'Sports Certificates': '⚽',
    'Cultural': '🎭',
    'Academic Certificates': '📚',
    'Research': '🔬',
    'Community Service': '🤝',
    'Personal Document Certificates': '📄',
    'Semester Certificates': '📋',
    'Core Activity Certificates': '🎯',
    'Achievement Certificates': '🏆',
    'Other': '🏅'
};
const LEVEL_CLR = { 'International Level': '#7c3aed', 'National Level': '#2563eb', 'State Level': '#0891b2', 'Inter-College': '#059669', 'College Level': '#d97706' };

const API = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const fileUrl = (u) => !u ? '' : u.startsWith('http') ? u : `${API}${u.startsWith('/') ? u : '/' + u}`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const getBatch = (a) => {
    const sid = a.studentId?.sid || a.rollNumber || '';
    const m = sid.match(/^(\d{2})/);
    if (m) return '20' + m[1];
    return a.studentId?.admissionYear || a.studentId?.batch || '';
};

const getYear = (a) => String(a.year || a.studentId?.year || '');
const getSec = (a) => String(a.section || a.studentId?.section || '');
const getBranch = (a) => (a.department || a.studentId?.branch || '').toUpperCase();
const getName = (a) => a.studentId?.studentName || a.studentName || 'Unknown';
const getSid = (a) => a.studentId?.sid || a.rollNumber || '';

// ─── ANIMATION VARIANTS ───────────────────────────────────────────────────────
const containerVar = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const itemVar = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
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
    'Description': a.description || ''
});

// ─── MINI COMPONENTS ──────────────────────────────────────────────────────────
const Spinner = () => <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="ach-mgr-loading-spin" /></div>;

const Badge = ({ color, children }) => (
    <span className="ach-mgr-badge" style={{ background: color + '18', color, border: `1px solid ${color}40` }}>{children}</span>
);

// ─── V5 CARD COMPONENT ────────────────────────────────────────────────────────
const AchCard = ({ item, onView, onViewStudent, facultyData, bulkSelectMode, isSelected, onToggleSelect, onDocumentVerification }) => {
    const [exp, setExp] = useState(false);
    const lc = LEVEL_CLR[item.level] || '#6366f1';

    return (
        <motion.div
            layout
            variants={itemVar}
            whileHover={{ y: -5, boxShadow: '0 20px 40px -12px rgba(0,0,0,0.1)' }}
            className={`ach-v5-card ${item.status?.toLowerCase()} ${isSelected ? 'selected-card' : ''}`}
            onClick={() => bulkSelectMode && onToggleSelect(item._id)}
            style={{ position: 'relative', border: isSelected ? '2px solid #6366f1' : '1px solid transparent' }}
        >
            {bulkSelectMode && (
                <div className="v5-select-indicator" style={{
                    position: 'absolute', top: '1rem', right: '1rem', width: '24px', height: '24px',
                    borderRadius: '50%', border: isSelected ? 'none' : '2px solid #cbd5e1',
                    background: isSelected ? '#6366f1' : 'white', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10
                }}>
                    {isSelected && <FaCheck size={12} />}
                </div>
            )}

            <div className="v5-card-top">
                <div className="v5-card-type-icon" style={{ background: `${lc}15`, color: lc }}>
                    {CAT_ICONS[item.category] || '🏅'}
                </div>
            </div>

            <div className="v5-card-content" onClick={() => !bulkSelectMode && setExp(!exp)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                    <div className="v5-mini-avatar"
                        style={{ background: `linear-gradient(135deg, ${lc}, ${lc}aa)`, cursor: 'pointer' }}
                        onClick={(e) => { e.stopPropagation(); onViewStudent(getSid(item)); }}
                    >
                        {getName(item).charAt(0).toUpperCase()}
                    </div>
                    <div style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); onViewStudent(getSid(item)); }}>
                        <div className="v5-student-name">{getName(item)}</div>
                        <div className="v5-student-meta">{getSid(item)} • {getBranch(item)}</div>
                    </div>
                </div>

                <h3 className="v5-ach-title">{item.title}</h3>
                <div className="v5-ach-cat">{item.category}</div>

                <AnimatePresence>
                    {exp && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="v5-card-details">
                            {item.description && <p>{item.description}</p>}
                            {item.category !== 'Professional Development' && <div className="detail-row"><span>Event:</span> {item.eventName}</div>}
                            <div className="detail-row"><span>Date:</span> {item.achievementDate ? new Date(item.achievementDate).toLocaleDateString() : 'N/A'}</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="v5-card-footer">
                <div className="v5-doc-strip">
                    {(item.documents || []).map((doc, i) => (
                        <motion.button
                            key={i}
                            whileHover={{ scale: 1.1 }}
                            className={`v5-view-doc-btn ${doc.verified ? 'verified' : ''}`}
                            onClick={(e) => { e.stopPropagation(); onView({ fileUrl: fileUrl(doc.fileUrl), fileName: doc.fileName }); }}
                            title={doc.verified ? 'Verified Document' : 'Pending Verification'}
                        >
                            <FaEye />
                            <span
                                className="v5-verify-dot"
                                onClick={(e) => { e.stopPropagation(); onDocumentVerification(item._id, i, !doc.verified); }}
                                style={{ background: doc.verified ? '#10b981' : '#cbd5e1' }}
                            />
                        </motion.button>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

// ─── ENHANCED ANALYTICS COMPONENT ─────────────────────────────────────────────
const AnalyticsView = ({ stats, onViewStudent }) => {
    const [timeRange, setTimeRange] = useState('all');
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [backendAnalytics, setBackendAnalytics] = useState(null);
    const [exportLoading, setExportLoading] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState(null);

    // Fetch comprehensive analytics from backend
    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const response = await apiGet('/achievements/analytics/comprehensive');
                if (response.success) {
                    setBackendAnalytics(response.analytics);
                }
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [timeRange]);

    // Calculate comprehensive analytics from frontend data (fallback)
    useEffect(() => {
        if (!stats) return;

        const calculateAdvancedStats = () => {
            const data = {
                overview: {
                    totalDocuments: stats.totalDocuments || 0,
                    approvedDocuments: stats.approvedDocuments || 0,
                    pendingDocuments: stats.pendingDocuments || 0,
                    rejectedDocuments: (stats.totalDocuments || 0) - (stats.approvedDocuments || 0) - (stats.pendingDocuments || 0),
                    approvalRate: stats.totalDocuments ? ((stats.approvedDocuments / stats.totalDocuments) * 100).toFixed(1) : 0,
                    pendingRate: stats.totalDocuments ? ((stats.pendingDocuments / stats.totalDocuments) * 100).toFixed(1) : 0
                },
                categoryData: Object.entries(stats.documentsByCategory || {}).map(([category, count]) => ({
                    category,
                    count,
                    percentage: stats.totalDocuments ? ((count / stats.totalDocuments) * 100).toFixed(1) : 0,
                    icon: CAT_ICONS[category] || '🏅'
                })).sort((a, b) => b.count - a.count),
                typeData: Object.entries(stats.documentsByType || {}).map(([type, count]) => ({
                    type,
                    count,
                    percentage: stats.totalDocuments ? ((count / stats.totalDocuments) * 100).toFixed(1) : 0
                })).sort((a, b) => b.count - a.count),
                studentMetrics: {
                    totalStudents: Object.keys(stats.documentsByStudent || {}).length,
                    avgDocsPerStudent: Object.keys(stats.documentsByStudent || {}).length ?
                        (stats.totalDocuments / Object.keys(stats.documentsByStudent || {}).length).toFixed(1) : 0,
                    topPerformers: Object.entries(stats.documentsByStudent || {})
                        .map(([studentId, data]) => ({
                            studentId: data.studentId,
                            name: data.studentName,
                            documentCount: data.documents.length,
                            categories: data.categories.length
                        }))
                        .sort((a, b) => b.documentCount - a.documentCount)
                        .slice(0, 5)
                },
                statusDistribution: [
                    { status: 'Approved', count: stats.approvedDocuments || 0, color: '#10b981' },
                    { status: 'Pending', count: stats.pendingDocuments || 0, color: '#f59e0b' },
                    { status: 'Rejected', count: (stats.totalDocuments || 0) - (stats.approvedDocuments || 0) - (stats.pendingDocuments || 0), color: '#ef4444' }
                ].filter(item => item.count > 0)
            };

            setAnalyticsData(data);
        };

        calculateAdvancedStats();
    }, [stats]);

    // Use backend analytics if available, otherwise use frontend calculations
    const displayData = backendAnalytics || analyticsData;

    // Export analytics data
    const exportAnalytics = async () => {
        try {
            setExportLoading(true);
            const exportData = {
                timestamp: new Date().toISOString(),
                timeRange,
                metrics: displayData?.overview,
                categoryBreakdown: displayData?.categoryData,
                topPerformers: displayData?.studentMetrics?.topPerformers,
                documentTypes: displayData?.typeData
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `achievement-analytics-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setExportLoading(false);
        }
    };

    // Handle metric card click
    const handleMetricClick = (metricType) => {
        setSelectedMetric(selectedMetric === metricType ? null : metricType);
    };

    // Chart configurations
    const categoryChartData = {
        labels: displayData?.categoryData?.map(item => item.category) || [],
        datasets: [{
            label: 'Documents',
            data: displayData?.categoryData?.map(item => item.count) || [],
            backgroundColor: [
                '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
                '#3b82f6', '#f97316', '#84cc16', '#06b6d4', '#a855f7'
            ],
            borderWidth: 1
        }]
    };

    const statusChartData = {
        labels: displayData?.statusDistribution?.map(item => item.status) || [],
        datasets: [{
            data: displayData?.statusDistribution?.map(item => item.count) || [],
            backgroundColor: displayData?.statusDistribution?.map(item => item.color) || [],
            borderWidth: 2
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { padding: 20, usePointStyle: true }
            },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                titleColor: 'white',
                bodyColor: 'white'
            }
        }
    };

    if (loading || !displayData) {
        return (
            <div className="ach-analytics-loading">
                <FaSpinner className="spinning" size={30} />
                <p>Loading comprehensive analytics...</p>
            </div>
        );
    }

    return (
        <div className="ach-analytics-dashboard animate-fade-in">
            {/* Enhanced Header */}
            <div className="ach-analytics-header">
                <div className="ach-analytics-title">
                    <FaChartBar size={28} />
                    <div>
                        <h2>Advanced Analytics Dashboard</h2>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>
                            Comprehensive insights into achievement data and performance metrics
                        </p>
                    </div>
                </div>
                <div className="ach-analytics-controls">
                    <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                        <option value="all">📊 All Time</option>
                        <option value="month">📅 This Month</option>
                        <option value="quarter">📆 This Quarter</option>
                        <option value="year">📈 This Year</option>
                    </select>
                    <button
                        className="ach-export-btn"
                        onClick={exportAnalytics}
                        disabled={exportLoading}
                        style={{
                            padding: '0.75rem 1.25rem',
                            border: '2px solid rgba(99, 102, 241, 0.3)',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                            color: '#6366f1',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            backdropFilter: 'blur(10px)'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 8px 16px rgba(99, 102, 241, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        {exportLoading ? <FaSpinner className="spinning" size={14} /> : <FaCloudDownloadAlt size={14} />}
                        Export Data
                    </button>
                </div>
            </div>

            {/* Enhanced Key Metrics Cards */}
            <div className="ach-stats-row">
                <motion.div
                    className="ach-stat-card total"
                    style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
                    whileHover={{ scale: 1.02, y: -5 }}
                >
                    <div className="ach-stat-label">Total Documents</div>
                    <div className="ach-stat-value">{displayData.overview.totalDocuments}</div>
                    <div className="metric-trend" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '4px 8px', borderRadius: '8px', fontSize: '0.75rem', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaFileAlt /> <span>System Records</span>
                    </div>
                </motion.div>

                <motion.div
                    className="ach-stat-card approved"
                    whileHover={{ scale: 1.02, y: -5 }}
                >
                    <div className="ach-stat-label">Active Categories</div>
                    <div className="ach-stat-value">{displayData.categoryData.length}</div>
                    <div className="metric-trend" style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 800, marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaLayerGroup /> <span>Diverse Excellence</span>
                    </div>
                </motion.div>

                <motion.div
                    className="ach-stat-card pending"
                    whileHover={{ scale: 1.02, y: -5 }}
                >
                    <div className="ach-stat-label">Verified Profiles</div>
                    <div className="ach-stat-value">{displayData.studentMetrics.totalStudents}</div>
                    <div className="metric-trend" style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 800, marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaUserGraduate /> <span>Student Base</span>
                    </div>
                </motion.div>

                <motion.div
                    className="ach-stat-card"
                    style={{ borderLeft: '4px solid #8b5cf6' }}
                    whileHover={{ scale: 1.02, y: -5 }}
                >
                    <div className="ach-stat-label">Avg. Achievements</div>
                    <div className="ach-stat-value">{displayData.studentMetrics.avgDocsPerStudent}</div>
                    <div className="metric-trend" style={{ color: '#6366f1', fontSize: '0.75rem', fontWeight: 800, marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaChartLine /> <span>Per Student</span>
                    </div>
                </motion.div>

                <motion.div
                    className="ach-stat-card"
                    style={{ borderLeft: '4px solid #8b5cf6' }}
                    whileHover={{ scale: 1.02, y: -5 }}
                >
                    <div className="ach-stat-label">Active Students</div>
                    <div className="ach-stat-value">{displayData.studentMetrics.totalStudents}</div>
                    <div className="metric-trend" style={{ color: '#6366f1', fontSize: '0.75rem', fontWeight: 800, marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaUsers /> <span>Engagement Peak</span>
                    </div>
                </motion.div>
            </div>

            {/* Charts Section */}
            <div className="ach-charts-section">
                {/* Summary Insights */}
                <motion.div
                    className="ach-insights-banner"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    style={{
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        marginBottom: '2rem',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <FaMagic size={20} style={{ color: '#6366f1' }} />
                        <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.125rem', fontWeight: '700' }}>Key Insights</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                            <span style={{ fontSize: '0.875rem', color: '#475569' }}>
                                <strong>{displayData.overview.approvalRate}%</strong> approval rate indicates efficient review process
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1' }}></div>
                            <span style={{ fontSize: '0.875rem', color: '#475569' }}>
                                Top category: <strong>{displayData.categoryData[0]?.category || 'N/A'}</strong> with {displayData.categoryData[0]?.count || 0} documents
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></div>
                            <span style={{ fontSize: '0.875rem', color: '#475569' }}>
                                <strong>{displayData.studentMetrics.totalStudents}</strong> students actively participating
                            </span>
                        </div>
                    </div>
                </motion.div>

                <div className="ach-chart-row">
                    {/* Category Distribution */}
                    <div className="ach-chart-container">
                        <div className="ach-chart-header">
                            <h3><FaChartPie /> Category Distribution</h3>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                                Document distribution across achievement categories
                            </div>
                        </div>
                        <div className="ach-chart-wrapper">
                            <Doughnut data={categoryChartData} options={chartOptions} />
                        </div>
                    </div>

                    {/* Status Distribution */}
                    <div className="ach-chart-container">
                        <div className="ach-chart-header">
                            <h3><FaChartBar /> Approval Status</h3>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                                Current status breakdown of all documents
                            </div>
                        </div>
                        <div className="ach-chart-wrapper">
                            <Pie data={statusChartData} options={chartOptions} />
                        </div>
                    </div>
                </div>

                {/* Category Details Table */}
                <div className="ach-analytics-table">
                    <div className="ach-table-header">
                        <h3><FaTrophy /> Category Performance</h3>
                    </div>
                    <div className="ach-table-content">
                        <table>
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Documents</th>
                                    <th>Percentage</th>
                                    <th>Progress</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayData.categoryData.map((item, index) => (
                                    <tr key={index}>
                                        <td>
                                            <span className="category-icon">{item.icon}</span>
                                            {item.category}
                                        </td>
                                        <td className="number-cell">{item.count}</td>
                                        <td className="number-cell">{item.percentage}%</td>
                                        <td>
                                            <div className="progress-bar">
                                                <motion.div
                                                    className="progress-fill"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${item.percentage}%` }}
                                                    transition={{ duration: 1, delay: index * 0.1 }}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Performers */}
                <div className="ach-top-performers">
                    <div className="ach-section-header">
                        <h3><FaStar /> Top Performing Students</h3>
                    </div>
                    <div className="ach-performers-list">
                        {displayData.studentMetrics.topPerformers.map((student, index) => (
                            <motion.div
                                key={student.studentId}
                                className="ach-performer-card"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="performer-rank">#{index + 1}</div>
                                <div className="performer-info" style={{ cursor: 'pointer' }} onClick={() => onViewStudent(student.studentId)}>
                                    <div className="performer-name">{student.name}</div>
                                    <div className="performer-id">{student.studentId}</div>
                                </div>
                                <div className="performer-stats">
                                    <div className="stat-item">
                                        <FaFileAlt size={12} />
                                        {student.documentCount} docs
                                    </div>
                                    <div className="stat-item">
                                        <FaLayerGroup size={12} />
                                        {student.categories} categories
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Document Types Breakdown */}
                <div className="ach-document-types">
                    <div className="ach-section-header">
                        <h3><FaFileAlt /> Document Types</h3>
                    </div>
                    <div className="ach-types-grid">
                        {displayData.typeData.map((type, index) => (
                            <motion.div
                                key={type.type}
                                className="ach-type-card"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="type-name">{type.type}</div>
                                <div className="type-count">{type.count}</div>
                                <div className="type-percentage">{type.percentage}%</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const FacultyAchievementManager = ({ facultyData }) => {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('grid');
    const [viewerDoc, setViewerDoc] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [expandedRows, setExpandedRows] = useState({});

    // New state for advanced features
    const [selectedDocType, setSelectedDocType] = useState('All');
    const [bulkSelectMode, setBulkSelectMode] = useState(false);
    const [selectedAchievements, setSelectedAchievements] = useState(new Set());
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    // Viewed Student States
    const [viewedStudent, setViewedStudent] = useState(null);
    const [viewedStudentAchievements, setViewedStudentAchievements] = useState([]);
    const [fetchingProfile, setFetchingProfile] = useState(false);

    // Profile Fetcher
    const handleViewStudentProfile = async (sid) => {
        if (!sid) return;
        try {
            setFetchingProfile(true);
            const [overviewRes, achRes] = await Promise.all([
                apiGet(`/api/students/${sid}/overview`),
                apiGet(`/api/achievements/student/${sid}`)
            ]);

            if (overviewRes && overviewRes.student) {
                setViewedStudent({
                    ...overviewRes.student,
                    academics: overviewRes.academics,
                    attendance: overviewRes.attendance,
                    activity: overviewRes.activity
                });
            }
            if (achRes && achRes.success) {
                setViewedStudentAchievements(achRes.achievements || []);
            }
        } catch (err) {
            console.error('Failed to fetch student profile:', err);
        } finally {
            setFetchingProfile(false);
        }
    };
    const [documentStats, setDocumentStats] = useState({
        totalDocuments: 0,
        documentsByType: {},
        documentsByCategory: {},
        studentsWithDocuments: [],
        documentsByStudent: {},
        pendingDocuments: 0,
        approvedDocuments: 0
    });

    // Filters
    const [fBatch, setFBatch] = useState('All');
    const [fYear, setFYear] = useState('All');
    const [fBranch, setFBranch] = useState('All');
    const [fSection, setFSection] = useState('All');
    const [fCat, setFCat] = useState('All');
    const [fStatus, setFStatus] = useState('All');
    const [fSearch, setFSearch] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [showFilters, setShowFilters] = useState(true);

    const fetchRef = useRef(false);

    // Calculate document statistics for fast data dashboard
    const calculateDocumentStats = useCallback((achievements) => {
        const stats = {
            totalDocuments: 0,
            documentsByType: {},
            documentsByCategory: {},
            studentsWithDocuments: new Set(),
            documentsByStudent: {},
            pendingDocuments: 0,
            approvedDocuments: 0
        };

        achievements.forEach(achievement => {
            const studentId = achievement.studentId?._id || achievement.studentId;
            const studentName = getName(achievement);
            const category = achievement.category;

            if (!stats.documentsByStudent[studentId]) {
                stats.documentsByStudent[studentId] = {
                    studentName,
                    studentId: getSid(achievement),
                    documents: [],
                    categories: new Set()
                };
            }

            (achievement.documents || []).forEach(doc => {
                stats.totalDocuments++;
                stats.studentsWithDocuments.add(studentId);

                // Count by document type
                stats.documentsByType[doc.fileType] = (stats.documentsByType[doc.fileType] || 0) + 1;

                // Count by achievement category
                stats.documentsByCategory[category] = (stats.documentsByCategory[category] || 0) + 1;

                // Add to student's documents
                stats.documentsByStudent[studentId].documents.push({
                    ...doc,
                    achievementTitle: achievement.title,
                    achievementCategory: category,
                    status: achievement.status,
                    achievementId: achievement._id
                });
                stats.documentsByStudent[studentId].categories.add(category);

                // Count by status
                if (achievement.status === 'Pending') stats.pendingDocuments++;
                else if (achievement.status === 'Approved') stats.approvedDocuments++;
            });
        });

        // Convert sets to arrays for easier rendering
        stats.studentsWithDocuments = Array.from(stats.studentsWithDocuments);
        Object.values(stats.documentsByStudent).forEach(student => {
            student.categories = Array.from(student.categories);
        });

        return stats;
    }, []);

    const fetchAll = useCallback(async () => {
        if (fetchRef.current) return;
        fetchRef.current = true;
        setLoading(true);
        try {
            const res = await apiGet('/api/achievements/all/list');
            if (res?.success) {
                const achData = res.achievements || [];
                setAchievements(achData);

                // Calculate document statistics
                const stats = calculateDocumentStats(achData);
                setDocumentStats(stats);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); fetchRef.current = false; }
    }, []);

    useEffect(() => {
        fetchAll();
        const unsub = sseClient.onUpdate(ev => {
            if (['achievements'].includes(ev?.resource)) fetchAll();
        });
        const t = setInterval(fetchAll, 30000);
        return () => { unsub(); clearInterval(t); };
    }, [fetchAll]);

    const filtered = useMemo(() => {
        return achievements.filter(a => {
            if (fBatch !== 'All' && getBatch(a) !== fBatch) return false;
            if (fYear !== 'All' && getYear(a) !== fYear) return false;
            if (fBranch !== 'All' && !getBranch(a).includes(fBranch)) return false;
            if (fSection !== 'All' && getSec(a) !== fSection) return false;
            if (fCat !== 'All' && a.category !== fCat) return false;
            if (selectedDocType !== 'All') {
                const hasDocType = (a.documents || []).some(doc => doc.fileType === selectedDocType);
                if (!hasDocType) return false;
            }
            if (fSearch) {
                const q = fSearch.toLowerCase();
                if (!getName(a).toLowerCase().includes(q) &&
                    !getSid(a).toLowerCase().includes(q) &&
                    !(a.title || '').toLowerCase().includes(q)) return false;
            }
            return true;
        }).sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0);
            if (sortBy === 'oldest') return new Date(a.submittedAt || 0) - new Date(b.submittedAt || 0);
            if (sortBy === 'name') return getName(a).localeCompare(getName(b));
            return 0;
        });
    }, [achievements, fBatch, fYear, fBranch, fSection, fCat, fSearch, sortBy, selectedDocType]);

    const stats = useMemo(() => ({
        total: achievements.length,
        categories: new Set(achievements.map(a => a.category)).size,
        students: new Set(achievements.map(a => getSid(a))).size
    }), [achievements]);

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

    const handleApprove = async (id) => {
        if (!window.confirm('Approve this achievement?')) return;
        try {
            await apiPut(`/api/achievements/${id}/approve`, {
                facultyId: facultyData.facultyId,
                role: 'Faculty' // Achievement Managers are technically faculty with permissions
            });
            fetchAll();
        }
        catch (e) { alert('Failed: ' + e.message); }
    };

    const handleReject = async (id) => {
        const reason = prompt('Rejection reason:');
        if (!reason) return;
        try {
            await apiPut(`/api/achievements/${id}/reject`, {
                facultyId: facultyData.facultyId,
                role: 'Faculty',
                reason
            });
            fetchAll();
        }
        catch (e) { alert('Failed: ' + e.message); }
    };

    // Bulk operations
    const handleBulkApprove = async () => {
        if (selectedAchievements.size === 0) return alert('No achievements selected');
        if (!window.confirm(`Approve ${selectedAchievements.size} selected achievements?`)) return;
        try {
            const promises = Array.from(selectedAchievements).map(id =>
                apiPut(`/api/achievements/${id}/approve`, {
                    facultyId: facultyData.facultyId,
                    role: 'Faculty'
                })
            );
            await Promise.all(promises);
            setSelectedAchievements(new Set());
            setBulkSelectMode(false);
            fetchAll();
            alert(`✅ ${selectedAchievements.size} achievements approved successfully!`);
        } catch (e) {
            alert('❌ Bulk approval failed: ' + e.message);
        }
    };

    const handleBulkReject = async () => {
        if (selectedAchievements.size === 0) return alert('No achievements selected');
        const reason = prompt('Bulk rejection reason:');
        if (!reason) return;
        try {
            const promises = Array.from(selectedAchievements).map(id =>
                apiPut(`/api/achievements/${id}/reject`, {
                    facultyId: facultyData.facultyId,
                    role: 'Faculty',
                    reason
                })
            );
            await Promise.all(promises);
            setSelectedAchievements(new Set());
            setBulkSelectMode(false);
            fetchAll();
            alert(`❌ ${selectedAchievements.size} achievements rejected`);
        } catch (e) {
            alert('❌ Bulk rejection failed: ' + e.message);
        }
    };

    const toggleAchievementSelection = (achievementId) => {
        const newSelected = new Set(selectedAchievements);
        if (newSelected.has(achievementId)) {
            newSelected.delete(achievementId);
        } else {
            newSelected.add(achievementId);
        }
        setSelectedAchievements(newSelected);
    };

    const selectAllVisible = () => {
        const visibleIds = filtered.filter(a => a.status === 'Pending').map(a => a._id);
        setSelectedAchievements(new Set(visibleIds));
    };

    const clearSelection = () => {
        setSelectedAchievements(new Set());
    };

    const handleDocumentVerification = async (achievementId, documentIndex, verified) => {
        try {
            await apiPatch(`/api/achievements/${achievementId}/verify-document`, {
                documentIndex,
                verified,
                facultyId: facultyData.facultyId,
            });
            fetchAll();
            alert(`✅ Document ${verified ? 'verified' : 'marked for review'}`);
        } catch (e) {
            alert('❌ Document verification failed: ' + e.message);
        }
    };

    const exportCurrentFilter = () => {
        const reportData = filtered.map((a, i) => ({
            'S.No': i + 1,
            'Student Name': getName(a),
            'Roll Number': getSid(a),
            'Title': a.title || '',
            'Category': a.category || '',
            'Level': a.level || '',
            'Event': a.eventName || '',
            'Date': a.achievementDate ? new Date(a.achievementDate).toLocaleDateString('en-IN') : ''
        }));
        exportToExcel(reportData, `Achievements_Archive_Export_${new Date().toISOString().slice(0, 10)}.xlsx`, 'Achievement Records');
    };

    const bulkDownloadDocs = async (items) => {
        try {
            alert('Initiating bulk download for ' + items.length + ' documents...');
            items.forEach(item => {
                (item.documents || []).forEach(doc => {
                    const url = fileUrl(doc.fileUrl);
                    window.open(url, '_blank');
                });
            });
        } catch (err) {
            console.error('Bulk download failed:', err);
        }
    };

    const exportVerificationReport = () => {
        const reportData = achievements.map((a, i) => ({
            'S.No': i + 1,
            'Student Name': getName(a),
            'Roll Number': getSid(a),
            'Achievement Title': a.title,
            'Category': a.category,
            'Total Documents': (a.documents || []).length,
            'Verified Documents': (a.documents || []).filter(d => d.verified).length,
            'Unverified Documents': (a.documents || []).filter(d => !d.verified).length,
            'Document Details': (a.documents || []).map(d => `${d.fileType}: ${d.verified ? 'Verified' : 'Unverified'}`).join(' | ')
        }));

        const filename = `Document_Verification_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
        exportToExcel(reportData, filename, 'Verification Report');
    };

    const activeFilterCount = [fBatch, fYear, fBranch, fSection, fCat].filter(x => x !== 'All').length + (fSearch ? 1 : 0);

    return (
        <div className="ach-mgr-root">
            <div className="ach-mgr-header-v5">
                <div className="header-content-v5">
                    <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="header-icon-v5">
                        <FaTrophy />
                    </motion.div>
                    <div className="header-text-v5">
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 950 }}>ACHIEVEMENT <span style={{ color: '#fbbf24' }}>HUB</span></h1>
                        <p style={{ fontSize: '1rem', opacity: 0.8, fontWeight: 600 }}>{facultyData.department} Department • VU V5 Hub</p>
                    </div>
                </div>
                <div className="header-actions-v5">
                    <button className="v5-btn glass" onClick={fetchAll}><FaRedo /> SYNC</button>
                    <button className={`v5-btn ${bulkSelectMode ? 'primary' : 'glass'}`} onClick={() => { setBulkSelectMode(!bulkSelectMode); setSelectedAchievements(new Set()); }}><FaCheckDouble /> {bulkSelectMode ? 'CANCEL' : 'BULK'}</button>
                    <button className="v5-btn gold" onClick={exportCurrentFilter}><FaFileExcel /> EXPORT</button>
                </div>
            </div>

            <div className="ach-mgr-tabs">
                <button className={`ach-mgr-tab ${activeTab === 'grid' ? 'active' : ''}`} onClick={() => setActiveTab('grid')}>📋 Grid View</button>
                <button className={`ach-mgr-tab ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>📊 Analytics</button>
                <button className={`ach-mgr-tab ${activeTab === 'batch' ? 'active' : ''}`} onClick={() => setActiveTab('batch')}>📦 Batch View</button>
                <button className={`ach-mgr-tab ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>👥 Student View</button>
            </div>

            <div className="ach-mgr-filter-bar">
                <div className="ach-mgr-filter-row">
                    <div className="ach-mgr-search-box">
                        <FaSearch size={13} />
                        <input type="text" placeholder="Search..." value={fSearch} onChange={e => setFSearch(e.target.value)} />
                    </div>
                    <button className="ach-mgr-toggle-filters" onClick={() => setShowFilters(!showFilters)}>
                        <FaFilter size={11} /> Filters {activeFilterCount > 0 && <span className="ach-mgr-tab-badge">{activeFilterCount}</span>}
                    </button>
                </div>

                {showFilters && (
                    <div className="ach-mgr-advanced-filters">
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
                            <label>Section</label>
                            <select value={fSection} onChange={e => setFSection(e.target.value)}>
                                {SECTIONS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Bulk Operations Bar */}
            <AnimatePresence>
                {bulkSelectMode && activeTab === 'grid' && (
                    <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="ach-bulk-bar">
                        <div className="bulk-info">
                            <span className="count">{selectedAchievements.size}</span> Selected
                            <button className="bulk-link" onClick={selectAllVisible}>Select All Visible</button>
                        </div>
                        <div className="bulk-actions">
                            <button className="v5-btn glass" onClick={() => bulkDownloadDocs(Array.from(selectedAchievements).map(id => achievements.find(a => a._id === id)).filter(Boolean))} disabled={selectedAchievements.size === 0}>
                                <FaCloudDownloadAlt /> Download Selected
                            </button>
                            <button className="v5-btn glass" onClick={handleBulkApprove} disabled={selectedAchievements.size === 0} style={{ color: '#10b981', borderColor: '#10b981' }}>
                                <FaCheck /> Approve
                            </button>
                            <button className="v5-btn glass" onClick={handleBulkReject} disabled={selectedAchievements.size === 0} style={{ color: '#ef4444', borderColor: '#ef4444' }}>
                                <FaTimes /> Reject
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Advanced Filters Toggle */}
            <div className="ach-advanced-controls">
                <button className="ach-control-btn" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
                    🔍 Advanced Filters {showAdvancedFilters ? '▲' : '▼'}
                </button>
            </div>

            {showAdvancedFilters && (
                <div className="ach-advanced-filter-panel">
                    <div className="ach-filter-row">
                        <div className="ach-filter-item">
                            <label>Document Type</label>
                            <select value={selectedDocType} onChange={e => setSelectedDocType(e.target.value)}>
                                <option value="All">All Types</option>
                                <option value="Certificate">Certificates</option>
                                <option value="Screenshot">Screenshots</option>
                                <option value="Report">Reports</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {loading ? <Spinner /> : (
                <div className="ach-mgr-content">
                    {activeTab === 'grid' && (
                        <motion.div layout className="ach-mgr-grid">
                            {filtered.length === 0 ? <div className="ach-mgr-empty-state">No records found</div> : filtered.map(item => (
                                <AchCard
                                    key={item._id}
                                    item={item}
                                    onApprove={handleApprove}
                                    onReject={handleReject}
                                    onView={setViewerDoc}
                                    onViewStudent={handleViewStudentProfile}
                                    facultyData={facultyData}
                                    bulkSelectMode={bulkSelectMode}
                                    isSelected={selectedAchievements.has(item._id)}
                                    onToggleSelect={toggleAchievementSelection}
                                    onDocumentVerification={handleDocumentVerification}
                                />
                            ))}
                        </motion.div>
                    )}

                    {activeTab === 'batch' && (
                        <div className="ach-mgr-batch-view">
                            {byBatch.map(batchData => (
                                <div key={batchData.batch} style={{ marginBottom: '3rem' }}>
                                    <h2 style={{ fontSize: '1.75rem', fontWeight: 950, color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <FaLayerGroup style={{ color: '#6366f1' }} /> Batch {batchData.batch}
                                    </h2>
                                    {Object.entries(batchData.years).map(([yr, yearData]) => (
                                        <div key={yr} style={{ marginLeft: '1.5rem', marginBottom: '2rem' }}>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 850, color: '#475569', marginBottom: '1rem' }}>Year {yr}</h3>
                                            {Object.entries(yearData.sections).map(([sec, items]) => (
                                                <div key={sec} style={{ marginLeft: '1.5rem', marginTop: '1.5rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                                        <div className="v5-badge blur" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>Section {sec} • {items.length} records</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'students' && (
                        <motion.div variants={containerVar} initial="hidden" animate="show" className="ach-mgr-by-student">
                            <div className="ach-mgr-fa-header" style={{ marginBottom: '2rem', background: 'transparent', padding: 0 }}>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 950, color: '#1e293b' }}>📚 Student Document Overview</h3>
                                <p style={{ color: '#64748b', fontWeight: 600 }}>In-depth analysis of student-wise achievement portfolios</p>
                            </div>
                            {Object.entries(documentStats.documentsByStudent || {}).map(([studentId, studentData]) => (
                                <motion.div variants={itemVar} key={studentId} className="ach-mgr-student-row">
                                    <div className="ach-mgr-student-row-head" onClick={() => setExpandedRows(p => ({ ...p, [studentId]: !p[studentId] }))}>
                                        <div className="ach-mgr-row-avatar">{studentData.studentName.charAt(0).toUpperCase()}</div>
                                        <div className="ach-mgr-row-info">
                                            <strong onClick={(e) => { e.stopPropagation(); handleViewStudentProfile(studentId); }} style={{ cursor: 'pointer' }}>{studentData.studentName}</strong>
                                            <div style={{ fontSize: '0.8rem', opacity: 0.7, fontWeight: 700 }}>
                                                {studentId} • {studentData.branch || 'N/A'} • {studentData.documents.length} Achievements
                                            </div>
                                        </div>
                                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <div className="ach-mgr-status-pills" style={{ marginBottom: 0 }}>
                                                {studentData.categories.slice(0, 2).map(cat => (
                                                    <span key={cat} className="v5-badge blur" style={{ fontSize: '0.65rem' }}>{CAT_ICONS[cat]} {cat}</span>
                                                ))}
                                            </div>
                                            <motion.div animate={{ rotate: expandedRows[studentId] ? 180 : 0 }} transition={{ duration: 0.3 }}>
                                                <FaChevronDown color="#94a3b8" />
                                            </motion.div>
                                        </div>
                                    </div>
                                    <AnimatePresence>
                                        {expandedRows[studentId] && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                style={{ overflow: 'hidden' }}
                                            >
                                                <div className="ach-mgr-grid" style={{ padding: '2rem', background: '#f8fafc' }}>
                                                    {studentData.documents.map(item => (
                                                        <AchCard
                                                            key={item._id}
                                                            item={item}
                                                            onApprove={handleApprove}
                                                            onReject={handleReject}
                                                            onView={setViewerDoc}
                                                            onViewStudent={handleViewStudentProfile}
                                                            facultyData={facultyData}
                                                            bulkSelectMode={false}
                                                            isSelected={false}
                                                            onToggleSelect={() => { }}
                                                            onDocumentVerification={handleDocumentVerification}
                                                        />
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {activeTab === 'analytics' && <AnalyticsView stats={documentStats} onViewStudent={handleViewStudentProfile} />}
                </div>
            )}

            <DocViewer open={!!viewerDoc} fileUrl={viewerDoc?.fileUrl} fileName={viewerDoc?.fileName} onClose={() => setViewerDoc(null)} />

            <StudentProfileModal
                isOpen={!!viewedStudent}
                onClose={() => setViewedStudent(null)}
                student={viewedStudent}
                achievements={viewedStudentAchievements}
                fetching={fetchingProfile}
            />
        </div>
    );
}

export default FacultyAchievementManager;
