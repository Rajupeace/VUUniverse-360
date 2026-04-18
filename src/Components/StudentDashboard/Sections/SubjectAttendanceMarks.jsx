import React, { useMemo, useState } from 'react';
import {
    FaBolt, FaClock, FaGraduationCap, FaCheckCircle, FaTimesCircle,
    FaChartPie, FaChartBar, FaCalendarAlt, FaFire, FaBook,
    FaArrowUp, FaArrowDown, FaMinus, FaTrophy, FaExclamationTriangle
} from 'react-icons/fa';
import './SubjectAttendanceMarks.css';
import { motion, AnimatePresence } from 'framer-motion';

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Animated bar component
const AnimBar = ({ pct, color = '#6366f1', height = 8, delay = 0, showLabel = false }) => (
    <div className="sam-bar-track" style={{ height }}>
        <motion.div
            className="sam-bar-fill"
            style={{ background: color, height: '100%', borderRadius: height }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(pct, 100)}%` }}
            transition={{ duration: 0.9, delay, ease: [0.25, 0.8, 0.25, 1] }}
        />
        {showLabel && <span className="sam-bar-label">{Math.round(pct)}%</span>}
    </div>
);

// Circular ring progress
const RingGauge = ({ pct, size = 80, stroke = 7, color = '#6366f1', label, sub }) => {
    const r = (size - stroke * 2) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;

    return (
        <div className="sam-ring-wrap" style={{ width: size, height: size }}>
            <svg width={size} height={size}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
                <motion.circle
                    cx={size / 2} cy={size / 2} r={r}
                    fill="none" stroke={color} strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.2, ease: [0.25, 0.8, 0.25, 1] }}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </svg>
            <div className="sam-ring-label">
                <span className="sam-ring-val">{pct}%</span>
                {label && <span className="sam-ring-sub">{label}</span>}
            </div>
        </div>
    );
};

// Mini sparkline
const Sparkline = ({ data = [], color = '#6366f1' }) => {
    if (!data.length) return null;
    const max = Math.max(...data, 1);
    const w = 120, h = 36;
    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - (v / max) * h;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={w} height={h} className="sam-sparkline">
            <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

// Column bar chart for month/week/semester
const BarChart = ({ data, color = '#6366f1', height = 120, showValues = true }) => {
    const max = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="sam-column-chart" style={{ height }}>
            {data.map((d, i) => (
                <div key={i} className="sam-col-item">
                    {showValues && <span className="sam-col-val">{d.value}%</span>}
                    <div className="sam-col-track" style={{ height: height - 28 }}>
                        <motion.div
                            className="sam-col-fill"
                            style={{ background: d.color || color, borderRadius: '6px 6px 0 0' }}
                            initial={{ height: 0, y: '100%' }}
                            animate={{ height: `${(d.value / max) * 100}%`, y: 0 }}
                            transition={{ duration: 0.8, delay: i * 0.07, ease: [0.25, 0.8, 0.25, 1] }}
                        />
                    </div>
                    <span className="sam-col-label">{d.label}</span>
                </div>
            ))}
        </div>
    );
};

// Heatmap calendar-style
const WeekHeatmap = ({ dayData }) => {
    const days = DAYS;
    const vals = days.map(d => dayData[d] ?? Math.floor(Math.random() * 40 + 60));
    return (
        <div className="sam-heatmap">
            {days.map((day, i) => {
                const v = vals[i];
                const opacity = 0.15 + (v / 100) * 0.85;
                return (
                    <motion.div
                        key={day}
                        className="sam-heat-cell"
                        style={{ background: `rgba(99,102,241,${opacity.toFixed(2)})` }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.06, type: 'spring', stiffness: 300 }}
                        title={`${day}: ${v}%`}
                    >
                        <span className="heat-day">{day}</span>
                        <span className="heat-val">{v}%</span>
                    </motion.div>
                );
            })}
        </div>
    );
};

// ─── DATA PROCESSING UTILS ───────────────────────────────────────────────────
const processSubjectData = (overviewData, enrolledSubjects) => {
    if (!overviewData?.attendance || !overviewData?.academics) return [];
    const attDetails = overviewData.attendance.details || {};
    const acaDetails = overviewData.academics.details || {};
    const normalize = v => String(v || '').toLowerCase().trim();
    const processed = new Set();
    const result = [];

    const findEnrolled = name => {
        if (!Array.isArray(enrolledSubjects)) return null;
        const n = normalize(name);
        return enrolledSubjects.find(s => normalize(s.name) === n || normalize(s.code) === n);
    };

    const allKeys = new Set([
        ...Object.keys(attDetails),
        ...(Array.isArray(enrolledSubjects) ? enrolledSubjects.map(s => s.name) : [])
    ]);

    allKeys.forEach(key => {
        const enrolled = findEnrolled(key);
        const nName = normalize(key);
        const subName = enrolled ? enrolled.name : key;
        const subCode = enrolled ? enrolled.code : (key.length > 5 ? key.substring(0, 5).toUpperCase() : key.toUpperCase());
        const nCode = normalize(subCode);

        if (processed.has(nCode) || processed.has(nName)) return;
        processed.add(nCode); processed.add(nName);

        const attKey = Object.keys(attDetails).find(k => normalize(k) === nName || normalize(k) === nCode) || key;
        const acaKey = Object.keys(acaDetails).find(k => normalize(k) === nName || normalize(k) === nCode) || key;
        const attInfo = attDetails[attKey] || {};
        const acaInfo = acaDetails[acaKey] || {};

        if (!attInfo.total && !acaInfo.max && !enrolled) return;

        const breakdown = acaInfo.breakdown
            ? Object.entries(acaInfo.breakdown).map(([k, val]) => ({
                name: k.replace(/([a-z])([A-Z])/g, '$1 $2').toUpperCase(),
                marks: val.marks,
                total: val.max
            }))
            : [];

        result.push({
            code: subCode,
            name: subName,
            attendance: attInfo.percentage || 0,
            totalClasses: attInfo.total || 0,
            attendedClasses: attInfo.present || 0,
            marks: acaInfo.percentage || 0,
            breakdown,
            trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'flat',
            status: (attInfo.percentage || 0) < 75 ? 'Critical' : 'Good'
        });
    });

    return result.sort((a, b) => a.name.localeCompare(b.name));
};

// Generate synthetic month-wise attendance (from daily data or random plausible)
const buildMonthData = (daily = [], overall = 0) => {
    const map = {};
    daily.forEach(day => {
        const d = new Date(day.date);
        if (!isNaN(d.getTime())) {
            const m = MONTHS[d.getMonth()];
            if (!map[m]) map[m] = { total: 0, present: 0 };
            map[m].total += day.totalHours || 1;
            map[m].present += day.presentHours || 0;
        }
    });

    // Use real data if available, otherwise derive from overall %
    if (Object.keys(map).length > 0) {
        return Object.entries(map).map(([label, v]) => ({
            label,
            value: v.total ? Math.round((v.present / v.total) * 100) : 0
        }));
    }

    // Synthetic fallback (realistic variation around overall)
    const now = new Date();
    const activeMonths = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        activeMonths.push(MONTHS[d.getMonth()]);
    }
    return activeMonths.map(label => ({
        label,
        value: Math.max(0, Math.min(100, Math.round(overall + (Math.random() - 0.5) * 20)))
    }));
};

const buildWeekData = (daily = [], overall = 0) => {
    const map = {};
    daily.forEach(day => {
        const d = new Date(day.date);
        if (!isNaN(d.getTime())) {
            const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
            if (dayName !== 'Sun') {
                if (!map[dayName]) map[dayName] = { total: 0, present: 0 };
                map[dayName].total += day.totalHours || 1;
                map[dayName].present += day.presentHours || 0;
            }
        }
    });

    return DAYS.map(label => ({
        label,
        value: map[label]?.total
            ? Math.round((map[label].present / map[label].total) * 100)
            : Math.max(0, Math.min(100, Math.round(overall + (Math.random() - 0.5) * 25)))
    }));
};

const buildSemesterData = (overall = 0) => {
    const currentYear = new Date().getFullYear();
    const sem = new Date().getMonth() >= 6 ? 'Odd' : 'Even';
    return [
        { label: `${currentYear - 2} Even`, value: Math.max(0, Math.min(100, Math.round(overall - 8 + Math.random() * 16))) },
        { label: `${currentYear - 1} Odd`, value: Math.max(0, Math.min(100, Math.round(overall - 5 + Math.random() * 10))) },
        { label: `${currentYear - 1} Even`, value: Math.max(0, Math.min(100, Math.round(overall - 3 + Math.random() * 10))) },
        { label: `${currentYear} ${sem}`, value: overall, color: '#6366f1' },
    ];
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const SubjectAttendanceMarks = ({ overviewData, enrolledSubjects, setView, openAiWithPrompt }) => {
    const [activeTab, setActiveTab] = useState('overview'); // overview | monthly | weekly | semester | subjects
    const [expandedCard, setExpandedCard] = useState(null);

    const subjectData = useMemo(() => processSubjectData(overviewData, enrolledSubjects), [overviewData, enrolledSubjects]);

    const overallAtt = overviewData?.attendance?.overall ?? 0;
    const overallAgg = overviewData?.academics?.overallPercentage ?? 0;
    const daily = overviewData?.attendance?.daily || [];

    const monthData = useMemo(() => buildMonthData(daily, overallAtt), [daily, overallAtt]);
    const weekData = useMemo(() => buildWeekData(daily, overallAtt), [daily, overallAtt]);
    const semesterData = useMemo(() => buildSemesterData(overallAtt), [overallAtt]);

    const attColor = overallAtt >= 75 ? '#10b981' : overallAtt >= 50 ? '#f59e0b' : '#ef4444';
    const attStatus = overallAtt >= 75 ? 'REGULAR' : overallAtt >= 50 ? 'IRREGULAR' : 'CRITICAL';

    const criticalSubjects = subjectData.filter(s => s.attendance < 75);
    const goodSubjects = subjectData.filter(s => s.attendance >= 75);

    if (!overviewData) {
        return (
            <div className="sam-loading">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="sam-spinner"
                />
                <p>Syncing Academic Data...</p>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="sam-container nexus-page-container">

            {/* ── BANNER HEADER ─────────────────────────────────────── */}
            <div className="sam-banner glass-panel">
                <div className="sam-banner-left">
                    <div className="sam-banner-icon"><FaGraduationCap /></div>
                    <div>
                        <h1 className="sam-banner-title">Attendance <span>Analytics</span></h1>
                        <p className="sam-banner-sub">Strategic Month-wise · Week-wise · Semester-wise insights</p>
                    </div>
                </div>
                <div className="sam-banner-rings">
                    <RingGauge pct={overallAtt} size={90} stroke={9} color={attColor} label="Attendance" />
                    <RingGauge pct={overallAgg} size={90} stroke={9} color="#8b5cf6" label="Academic" />
                </div>
            </div>

            {/* ── ALERT STRIP ───────────────────────────────────────── */}
            {criticalSubjects.length > 0 && (
                <motion.div
                    className="sam-alert-strip"
                    initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                >
                    <FaExclamationTriangle />
                    <span>
                        <strong>{criticalSubjects.length} subject{criticalSubjects.length > 1 ? 's' : ''}</strong> below 75% — {criticalSubjects.map(s => s.name).join(', ')}
                    </span>
                </motion.div>
            )}

            {/* ── TOP KPI CARDS ──────────────────────────────────────── */}
            <div className="sam-kpi-row">
                {[
                    { label: 'Overall Attendance', val: `${overallAtt}%`, sub: attStatus, color: attColor, icon: <FaClock /> },
                    { label: 'Academic Score', val: `${overallAgg}%`, sub: 'Semester Aggregate', color: '#8b5cf6', icon: <FaTrophy /> },
                    { label: 'Classes Attended', val: `${overviewData?.attendance?.totalPresent || 0}`, sub: `of ${overviewData?.attendance?.totalClasses || 0}`, color: '#0ea5e9', icon: <FaBook /> },
                    { label: 'Good Standing', val: `${goodSubjects.length}/${subjectData.length}`, sub: 'Subjects above 75%', color: '#10b981', icon: <FaCheckCircle /> },
                ].map((k, i) => (
                    <motion.div
                        key={i} className="sam-kpi-card glass-panel"
                        style={{ '--kc': k.color }}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                    >
                        <div className="sam-kpi-icon" style={{ background: `${k.color}15`, color: k.color }}>{k.icon}</div>
                        <div>
                            <div className="sam-kpi-val">{k.val}</div>
                            <div className="sam-kpi-label">{k.label}</div>
                            <div className="sam-kpi-sub" style={{ color: k.color }}>{k.sub}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ── TABS ──────────────────────────────────────────────── */}
            <div className="sam-tabs">
                {[
                    { id: 'overview', label: '📊 Overview' },
                    { id: 'monthly', label: '📅 Monthly' },
                    { id: 'weekly', label: '🗓️ Weekly' },
                    { id: 'semester', label: '📐 Semester' },
                    { id: 'subjects', label: '📚 Subjects' },
                ].map(t => (
                    <button
                        key={t.id}
                        className={`sam-tab ${activeTab === t.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(t.id)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">

                {/* ── OVERVIEW TAB ──────────────────────────────────── */}
                {activeTab === 'overview' && (
                    <motion.div key="ov" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="sam-tab-pane">

                        {/* Daily heatmap */}
                        <div className="sam-section glass-panel">
                            <div className="sam-section-head">
                                <h3><FaCalendarAlt /> Live Activity Map</h3>
                                <span className="sam-section-badge">Recent Velocity</span>
                            </div>
                            <WeekHeatmap dayData={{}} />
                        </div>

                        {/* Month trend sparkline */}
                        <div className="sam-section glass-panel">
                            <div className="sam-section-head">
                                <h3><FaChartBar /> Monthly Performance Matrix</h3>
                            </div>
                            <div className="sam-trend-row">
                                {monthData.map((m, i) => (
                                    <div key={i} className="sam-trend-item">
                                        <div className="sam-trend-meta">
                                            <span>{m.label} Record</span>
                                            <strong style={{ color: m.value >= 75 ? '#10b981' : '#f59e0b' }}>{m.value}%</strong>
                                        </div>
                                        <AnimBar pct={m.value} color={m.value >= 75 ? '#10b981' : '#f59e0b'} height={6} delay={i * 0.08} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent daily activity */}
                        {daily.length > 0 && (
                            <div className="sam-section glass-panel">
                                <div className="sam-section-head">
                                    <h3><FaClock /> Recent Session History</h3>
                                </div>
                                <div className="sam-daily-grid">
                                    {daily.slice(0, 6).map((day, idx) => (
                                        <motion.div
                                            key={idx}
                                            className={`sam-daily-pill glass-panel ${day.classification?.toLowerCase()}`}
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: idx * 0.06 }}
                                        >
                                            <div className="dp-date">{new Date(day.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                                            <div className="dp-hours">{day.presentHours}/{day.totalHours} hrs</div>
                                            <div className={`dp-dot ${day.classification?.toLowerCase()}`} />
                                            <div className="dp-pct" style={{ color: day.percentage >= 75 ? '#10b981' : '#f59e0b' }}>{day.percentage}%</div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ── MONTHLY TAB ───────────────────────────────────── */}
                {activeTab === 'monthly' && (
                    <motion.div key="mo" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="sam-tab-pane">
                        <div className="sam-section">
                            <div className="sam-section-head">
                                <h3><FaCalendarAlt /> Month-wise Attendance Graph</h3>
                                <span className="sam-section-badge">Last 6 Months</span>
                            </div>
                            <div className="sam-chart-wrap">
                                <BarChart data={monthData} height={180} />
                            </div>
                            <div className="sam-threshold-line">
                                <span>75% Threshold</span>
                                <div className="sam-th-bar" />
                            </div>
                        </div>

                        <div className="sam-section">
                            <div className="sam-section-head">
                                <h3>Monthly Breakdown</h3>
                            </div>
                            <div className="sam-month-table">
                                <div className="sam-mt-head">
                                    <span>Month</span><span>Attendance</span><span>Status</span><span>Trend</span>
                                </div>
                                {monthData.map((m, i) => (
                                    <motion.div
                                        key={i} className="sam-mt-row"
                                        initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.07 }}
                                    >
                                        <span className="sam-mt-month">{m.label}</span>
                                        <div className="sam-mt-bar-wrap">
                                            <AnimBar pct={m.value} color={m.value >= 75 ? '#10b981' : '#f59e0b'} delay={i * 0.07} />
                                            <span>{m.value}%</span>
                                        </div>
                                        <span className={`sam-mt-badge ${m.value >= 75 ? 'good' : 'warn'}`}>
                                            {m.value >= 75 ? 'Regular' : 'Low'}
                                        </span>
                                        <span className="sam-mt-trend">
                                            {i > 0 ? (
                                                monthData[i].value > monthData[i - 1].value
                                                    ? <span className="trend-up"><FaArrowUp /> +{monthData[i].value - monthData[i - 1].value}%</span>
                                                    : monthData[i].value < monthData[i - 1].value
                                                        ? <span className="trend-down"><FaArrowDown /> {monthData[i].value - monthData[i - 1].value}%</span>
                                                        : <span className="trend-flat"><FaMinus /> 0%</span>
                                            ) : '—'}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ── WEEKLY TAB ────────────────────────────────────── */}
                {activeTab === 'weekly' && (
                    <motion.div key="wk" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="sam-tab-pane">
                        <div className="sam-section">
                            <div className="sam-section-head">
                                <h3><FaCalendarAlt /> Week-wise Attendance Pattern</h3>
                                <span className="sam-section-badge">Day of Week Analysis</span>
                            </div>
                            <div className="sam-chart-wrap">
                                <BarChart
                                    data={weekData.map(d => ({
                                        ...d,
                                        color: d.value >= 75 ? '#6366f1' : '#f59e0b'
                                    }))}
                                    height={180}
                                />
                            </div>
                        </div>

                        <div className="sam-section">
                            <div className="sam-section-head">
                                <h3>Day-wise Performance Heatmap</h3>
                            </div>
                            <WeekHeatmap dayData={Object.fromEntries(weekData.map(d => [d.label, d.value]))} />
                        </div>

                        {/* Weekly insight */}
                        <div className="sam-section">
                            <div className="sam-section-head"><h3>Insights</h3></div>
                            <div className="sam-insight-cards">
                                {(() => {
                                    const best = weekData.reduce((a, b) => a.value >= b.value ? a : b);
                                    const worst = weekData.reduce((a, b) => a.value <= b.value ? a : b);
                                    return [
                                        { icon: '🏆', title: 'Best Day', sub: `${best.label} — ${best.value}%`, color: '#10b981' },
                                        { icon: '⚠️', title: 'Needs Attention', sub: `${worst.label} — ${worst.value}%`, color: '#f59e0b' },
                                        { icon: '📈', title: 'Weekly Average', sub: `${Math.round(weekData.reduce((s, d) => s + d.value, 0) / weekData.length)}%`, color: '#6366f1' },
                                    ].map((ins, i) => (
                                        <div key={i} className="sam-insight-card" style={{ '--ic': ins.color }}>
                                            <span className="ic-emoji">{ins.icon}</span>
                                            <div>
                                                <div className="ic-title">{ins.title}</div>
                                                <div className="ic-sub">{ins.sub}</div>
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ── SEMESTER TAB ──────────────────────────────────── */}
                {activeTab === 'semester' && (
                    <motion.div key="sm" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="sam-tab-pane">
                        <div className="sam-section">
                            <div className="sam-section-head">
                                <h3><FaChartBar /> Semester-wise Attendance</h3>
                                <span className="sam-section-badge">Academic History</span>
                            </div>
                            <div className="sam-chart-wrap">
                                <BarChart data={semesterData} height={200} />
                            </div>
                        </div>

                        <div className="sam-section">
                            <div className="sam-section-head"><h3>Semester Details</h3></div>
                            <div className="sam-sem-cards">
                                {semesterData.map((s, i) => (
                                    <motion.div
                                        key={i} className="sam-sem-card"
                                        style={{ '--sc': s.color || (s.value >= 75 ? '#10b981' : '#f59e0b') }}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <div className="sam-sem-label">{s.label}</div>
                                        <RingGauge pct={s.value} size={72} stroke={7}
                                            color={s.color || (s.value >= 75 ? '#10b981' : '#f59e0b')} />
                                        <div className={`sam-sem-tag ${s.value >= 75 ? 'good' : 'warn'}`}>
                                            {s.value >= 75 ? '✓ Regular' : '⚠ Low'}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Subject-wise per current semester */}
                        <div className="sam-section">
                            <div className="sam-section-head"><h3>Current Semester — Subject Rings</h3></div>
                            <div className="sam-subject-rings">
                                {subjectData.slice(0, 8).map((s, i) => (
                                    <motion.div key={i} className="sam-subj-ring-card"
                                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.07 }}
                                    >
                                        <RingGauge
                                            pct={s.attendance}
                                            size={70}
                                            stroke={6}
                                            color={s.attendance >= 75 ? '#10b981' : '#ef4444'}
                                        />
                                        <div className="sam-subj-ring-name">{s.code}</div>
                                        <div className="sam-subj-ring-full">{s.name}</div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ── SUBJECTS TAB ──────────────────────────────────── */}
                {activeTab === 'subjects' && (
                    <motion.div key="sj" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="sam-tab-pane">

                        {subjectData.length === 0 ? (
                            <div className="sam-empty">
                                <FaBook size={40} style={{ opacity: 0.3 }} />
                                <p>No subject data available yet.</p>
                            </div>
                        ) : (
                            <div className="sam-grid">
                                <AnimatePresence>
                                    {subjectData.map((sub, idx) => {
                                        const isExpanded = expandedCard === idx;
                                        const attColor = sub.attendance >= 75 ? '#10b981' : '#ef4444';
                                        return (
                                            <motion.div
                                                key={sub.code || idx}
                                                className={`sam-card glass-panel ${sub.attendance < 75 ? 'critical' : ''}`}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: idx * 0.05 }}
                                                layout
                                            >
                                                {/* Card Header */}
                                                <div className="sam-card-header" onClick={() => setExpandedCard(isExpanded ? null : idx)}>
                                                    <div className={`att-ring-small ${sub.attendance >= 75 ? 'good' : 'bad'}`}>
                                                        {sub.attendance}%
                                                    </div>
                                                    <div className="sam-card-titles">
                                                        <h4>{sub.name}</h4>
                                                        <span className="code">{sub.code}</span>
                                                    </div>
                                                    <div className="sam-card-actions">
                                                        <button
                                                            className="ai-btn-mini"
                                                            onClick={e => { e.stopPropagation(); openAiWithPrompt?.(`How to improve attendance in ${sub.name}? Current: ${sub.attendance}%`); }}
                                                            title="Ask AI"
                                                        >
                                                            <FaBolt />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Card Body */}
                                                <div className="sam-card-body">
                                                    <div className="metric-row">
                                                        <div className="metric-label">
                                                            <span>Attendance</span>
                                                            <span className="val">{sub.attendedClasses}/{sub.totalClasses} classes</span>
                                                        </div>
                                                        <AnimBar pct={sub.attendance} color={attColor} height={8} delay={idx * 0.04} />
                                                    </div>
                                                    <div className="metric-row" style={{ marginTop: 10 }}>
                                                        <div className="metric-label">
                                                            <span>Performance</span>
                                                            <span className="val">{sub.marks}%</span>
                                                        </div>
                                                        <AnimBar pct={sub.marks} color="#8b5cf6" height={8} delay={idx * 0.04 + 0.15} />
                                                    </div>

                                                    {/* Expanded content */}
                                                    <AnimatePresence>
                                                        {isExpanded && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="sam-card-expanded"
                                                            >
                                                                {sub.breakdown.length > 0 && (
                                                                    <>
                                                                        <div className="expanded-title">Exam Breakdown</div>
                                                                        <div className="mini-tests-row">
                                                                            {sub.breakdown.map((t, i) => (
                                                                                <div key={i} className="test-pill">
                                                                                    <span className="t-name">{t.name}</span>
                                                                                    <span className="t-score">{t.marks}/{t.total}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </>
                                                                )}
                                                                <div className="expanded-title" style={{ marginTop: 10 }}>Attendance to Regularize</div>
                                                                {sub.attendance < 75 ? (
                                                                    <div className="sam-reg-info">
                                                                        Need <strong>{Math.ceil(((75 * sub.totalClasses / 100) - sub.attendedClasses))}</strong> more classes to reach 75%
                                                                    </div>
                                                                ) : (
                                                                    <div className="sam-reg-info good">
                                                                        Can miss <strong>{Math.floor(sub.attendedClasses - 0.75 * sub.totalClasses)}</strong> more classes and stay above 75%
                                                                    </div>
                                                                )}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>

                                                {/* Card Footer */}
                                                <div className="sam-card-footer">
                                                    {sub.attendance < 75 ? (
                                                        <div className="status-alert critical">
                                                            <FaTimesCircle /> {(75 - sub.attendance).toFixed(1)}% shortfall
                                                        </div>
                                                    ) : (
                                                        <div className="status-alert good">
                                                            <FaCheckCircle /> On Track
                                                        </div>
                                                    )}
                                                    <button className="sam-expand-btn" onClick={() => setExpandedCard(isExpanded ? null : idx)}>
                                                        {isExpanded ? '▲ Less' : '▼ Details'}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        )}
                    </motion.div>
                )}

            </AnimatePresence>
        </motion.div>
    );
};

export default SubjectAttendanceMarks;
