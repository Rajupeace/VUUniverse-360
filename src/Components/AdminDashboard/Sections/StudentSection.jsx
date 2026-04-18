import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaFileUpload, FaSearch, FaEye, FaEdit, FaTrash, FaUserGraduate, FaBook, FaFilter, FaCalendarAlt, FaSync, FaChartBar, FaBus, FaHome } from 'react-icons/fa';
import { resolveImageUrl } from '../../../utils/apiClient';

/**
/**
 * Student Management
 * Comprehensive student registry and controls.
 */
const StudentSection = ({ students = [], openModal, handleDeleteStudent, onRefresh }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [yearFilter, setYearFilter] = useState('all');
    const [sectionFilter, setSectionFilter] = useState('all');
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
    const [isRefreshing, setIsRefreshing] = useState(false);

    const yearOptions = ['all', '1', '2', '3', '4'];
    const sectionOptions = ['all', ...Array.from({ length: 16 }, (_, i) => String.fromCharCode(65 + i)), ...Array.from({ length: 20 }, (_, i) => String(i + 1))];

    const filteredStudents = (students || []).filter(s => {
        const matchesSearch = (s.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.sid || '').toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (filterType !== 'all') {
            const pic = s.profileImage || s.profilePic || s.avatar;
            const hasUploaded = pic && !pic.includes('dicebear');

            if (filterType === 'uploaded' && !hasUploaded) return false;
            if (filterType === 'default' && hasUploaded) return false;
            if (filterType === 'transport' && !s.isTransportUser) return false;
            if (filterType === 'hostel' && !s.isHosteller) return false;
        }

        if (yearFilter !== 'all' && String(s.year) !== String(yearFilter)) return false;
        if (sectionFilter !== 'all' && String(s.section) !== String(sectionFilter)) return false;

        return true;
    });

    const yearStats = useMemo(() => {
        const stats = { '1': 0, '2': 0, '3': 0, '4': 0 };
        students.forEach(s => {
            if (stats[s.year] !== undefined) stats[s.year]++;
        });
        return stats;
    }, [students]);

    const maxYearCount = Math.max(...Object.values(yearStats));

    const groupedStudents = useMemo(() => {
        const groups = {};
        filteredStudents.forEach(s => {
            const key = `${s.year}-${s.section}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(s);
        });
        return groups;
    }, [filteredStudents]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (onRefresh && !isRefreshing) {
                handleRefresh();
            }
        }, 30000); // Auto refresh every 30 seconds

        return () => clearInterval(interval);
    }, [onRefresh, isRefreshing]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        if (onRefresh) await onRefresh();
        setIsRefreshing(false);
    };

    return (
        <div className="animate-fade-in" style={{ padding: '0' }}>
            <header className="admin-page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="admin-page-title">
                    <h1 style={{ fontSize: '2.8rem', fontWeight: 950, letterSpacing: '-0.04em', background: 'linear-gradient(135deg, #0f172a, #334155)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        STUDENT <span style={{ color: '#4f46e5', WebkitTextFillColor: '#4f46e5' }}>REGISTRY</span>
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                        <p style={{ margin: 0, fontWeight: 800, color: '#64748b', fontSize: '0.9rem' }}>{students.length} ENROLLED OPERATIVES</p>
                    </div>
                </div>
                <div className="admin-action-bar" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                        <FaSearch style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }} />
                        <input
                            className="admin-search-input"
                            placeholder="Search records..."
                            style={{
                                padding: '0.9rem 1.5rem 0.9rem 3.5rem',
                                borderRadius: '16px',
                                border: '1px solid #e2e8f0',
                                width: '100%',
                                background: 'white',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                            }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <FaFilter style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }} />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            style={{
                                padding: '0.9rem 1.5rem 0.9rem 3rem',
                                borderRadius: '16px',
                                border: '1px solid #e2e8f0',
                                background: 'white',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                                cursor: 'pointer',
                                appearance: 'none',
                                minWidth: '140px',
                                height: '48px',
                                color: '#475569'
                            }}
                        >
                            <option value="all">All Profiles</option>
                            <option value="uploaded">Uploaded Pic</option>
                            <option value="default">Default Avatar</option>
                            <option value="transport">Commuters</option>
                            <option value="hostel">Hostellers</option>
                        </select>
                        <div style={{ position: 'absolute', right: '1.2rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #94a3b8' }}></div>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <select
                            value={yearFilter}
                            onChange={(e) => setYearFilter(e.target.value)}
                            style={{
                                padding: '0.9rem 1.5rem',
                                borderRadius: '16px',
                                border: '1px solid #e2e8f0',
                                background: 'white',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                                cursor: 'pointer',
                                appearance: 'none',
                                minWidth: '100px',
                                height: '48px',
                                color: '#475569'
                            }}
                        >
                            {yearOptions.map(year => (
                                <option key={year} value={year}>{year === 'all' ? 'All Years' : `Year ${year}`}</option>
                            ))}
                        </select>
                        <div style={{ position: 'absolute', right: '1.2rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #94a3b8' }}></div>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <select
                            value={sectionFilter}
                            onChange={(e) => setSectionFilter(e.target.value)}
                            style={{
                                padding: '0.9rem 1.5rem',
                                borderRadius: '16px',
                                border: '1px solid #e2e8f0',
                                background: 'white',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                                cursor: 'pointer',
                                appearance: 'none',
                                minWidth: '120px',
                                height: '48px',
                                color: '#475569'
                            }}
                        >
                            {sectionOptions.map(section => (
                                <option key={section} value={section}>{section === 'all' ? 'All Sections' : `Sec ${section}`}</option>
                            ))}
                        </select>
                        <div style={{ position: 'absolute', right: '1.2rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #94a3b8' }}></div>
                    </div>
                    <button
                        onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
                        style={{
                            height: '48px',
                            borderRadius: '16px',
                            border: '1px solid #e2e8f0',
                            background: 'white',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '0 1rem'
                        }}
                    >
                        <FaChartBar /> {viewMode === 'table' ? 'Card View' : 'Table View'}
                    </button>
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        style={{
                            height: '48px',
                            borderRadius: '16px',
                            border: '1px solid #e2e8f0',
                            background: isRefreshing ? '#f1f5f9' : 'white',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                            cursor: isRefreshing ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '0 1rem'
                        }}
                    >
                        <motion.div
                            animate={{ rotate: isRefreshing ? 360 : 0 }}
                            transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: 'linear' }}
                        >
                            <FaSync />
                        </motion.div>
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                    <button
                        className="admin-btn admin-btn-outline"
                        onClick={() => openModal('bulk-student')}
                        style={{ height: '48px', borderRadius: '16px', fontWeight: 900, fontSize: '0.8rem' }}
                    >
                        <FaFileUpload /> BATCH ARCHIVE
                    </button>
                    <button
                        className="admin-btn admin-btn-primary"
                        onClick={() => openModal('student')}
                        style={{ height: '48px', borderRadius: '16px', fontWeight: 900, fontSize: '0.8rem', background: 'linear-gradient(135deg, #4f46e5, #4338ca)' }}
                    >
                        <FaPlus /> INITIALIZE STUDENT
                    </button>
                </div>
            </header>

            {/* Summary Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem'
                }}
            >
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    color: 'white',
                    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                }}>
                    <div style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>{filteredStudents.length}</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Filtered Students</div>
                </div>
                <div style={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    color: 'white',
                    boxShadow: '0 10px 30px rgba(245, 87, 108, 0.3)'
                }}>
                    <div style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>{Object.keys(groupedStudents).length}</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Active Classes</div>
                </div>
                <div style={{
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    color: 'white',
                    boxShadow: '0 10px 30px rgba(79, 172, 254, 0.3)'
                }}>
                    <div style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>
                        {Object.values(groupedStudents).reduce((sum, group) => sum + group.length, 0) / Math.max(Object.keys(groupedStudents).length, 1).toFixed(1)}
                    </div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Avg Class Size</div>
                </div>
                <div style={{
                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    color: 'white',
                    boxShadow: '0 10px 30px rgba(67, 233, 123, 0.3)',
                    gridColumn: 'span 2'
                }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '1rem' }}>Year Distribution</div>
                    <div style={{ display: 'flex', alignItems: 'end', gap: '1rem', height: '60px' }}>
                        {Object.entries(yearStats).map(([year, count]) => (
                            <div key={year} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(count / maxYearCount) * 100}%` }}
                                    transition={{ delay: 0.5, duration: 0.8 }}
                                    style={{
                                        width: '100%',
                                        background: 'rgba(255,255,255,0.3)',
                                        borderRadius: '4px 4px 0 0',
                                        marginBottom: '0.5rem',
                                        minHeight: '4px'
                                    }}
                                />
                                <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{count}</div>
                                <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Year {year}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="admin-card"
                style={{
                    borderRadius: '28px',
                    border: '1px solid #f1f5f9',
                    overflow: 'hidden',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.03)',
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(20px)'
                }}
            >
                {viewMode === 'table' ? (
                    <div className="admin-table-wrap">
                        <table className="admin-grid-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #f1f5f9' }}>
                                    <th style={{ padding: '1.5rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 950, letterSpacing: '1px' }}>NAME / IDENTITY</th>
                                    <th style={{ padding: '1.5rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 950, letterSpacing: '1px' }}>BRANCH</th>
                                    <th style={{ padding: '1.5rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 950, letterSpacing: '1px' }}>ACADEMIC LVL</th>
                                    <th style={{ padding: '1.5rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 950, letterSpacing: '1px' }}>DEPT SECTION</th>
                                    <th style={{ padding: '1.5rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 950, letterSpacing: '1px' }}>GENDER</th>
                                    <th style={{ padding: '1.5rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 950, letterSpacing: '1px', textAlign: 'right' }}>COMMANDS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map((s, idx) => (
                                        <motion.tr
                                            key={s.sid}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            style={{ borderBottom: '1px solid #f1f5f9' }}
                                        >
                                            <td style={{ padding: '1.2rem 1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                                                    <div style={{
                                                        width: '44px',
                                                        height: '44px',
                                                        background: '#eef2ff',
                                                        borderRadius: '14px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#4f46e5',
                                                        fontSize: '1.2rem',
                                                        fontWeight: 950,
                                                        boxShadow: 'inset 0 0 0 1px rgba(79, 70, 229, 0.1)',
                                                        overflow: 'hidden',
                                                        flexShrink: 0
                                                    }}>
                                                        <img
                                                            src={resolveImageUrl(s.profileImage || s.profilePic || s.avatar, s.studentName)}
                                                            alt="Profile"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.studentName || 'Student'}`;
                                                            }}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '1rem' }}>{s.studentName}</div>
                                                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginTop: '4px' }}>
                                                            <div style={{ fontSize: '0.7rem', color: '#4f46e5', fontWeight: 900, background: '#e0e7ff', padding: '2px 8px', borderRadius: '6px' }}>ID: {s.sid}</div>
                                                            {s.isTransportUser && <div title="Transport User" style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}><FaBus /></div>}
                                                            {s.isHosteller && <div title="Hosteller" style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#f59e0b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}><FaHome /></div>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.2rem 1.5rem' }}>
                                                <span style={{ fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4f46e5' }}></div>
                                                    {s.branch}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.2rem 1.5rem', fontWeight: 900, color: '#64748b', fontSize: '0.85rem' }}>LEVEL 0{s.year}</td>
                                            <td style={{ padding: '1.2rem 1.5rem' }}>
                                                <span style={{
                                                    fontSize: '0.8rem',
                                                    fontWeight: 950,
                                                    color: '#0ea5e9',
                                                    background: '#f0f9ff',
                                                    padding: '4px 10px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e0f2fe'
                                                }}>SEC {s.section || '---'}</span>
                                            </td>
                                            <td style={{ padding: '1.2rem 1.5rem' }}>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: 800,
                                                    color: s.gender === 'Female' ? '#db2777' : s.gender === 'Male' ? '#2563eb' : '#64748b',
                                                    background: s.gender === 'Female' ? '#fdf2f8' : s.gender === 'Male' ? '#eff6ff' : '#f8fafc',
                                                    padding: '4px 10px',
                                                    borderRadius: '8px',
                                                    border: `1px solid ${s.gender === 'Female' ? '#fbcfe8' : s.gender === 'Male' ? '#bfdbfe' : '#e2e8f0'}`
                                                }}>{s.gender || 'Not Set'}</span>
                                            </td>
                                            <td style={{ padding: '1.2rem 1.5rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                    <button onClick={() => openModal('student-view', s)} style={{ cursor: 'pointer', border: 'none', background: '#f8fafc', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }} title="View Profile"><FaEye /></button>
                                                    <button onClick={() => openModal('student-view', s)} style={{ cursor: 'pointer', border: 'none', background: '#e0f2fe', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9' }} title="Full Academic Record"><FaBook /></button>
                                                    <button onClick={() => openModal('student-view', s)} style={{ cursor: 'pointer', border: 'none', background: '#f3e8ff', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9333ea' }} title="View All Data"><FaCalendarAlt /></button>
                                                    <button onClick={() => openModal('student', s)} style={{ cursor: 'pointer', border: 'none', background: '#fffbeb', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }} title="Edit"><FaEdit /></button>
                                                    <button onClick={() => handleDeleteStudent(s.sid)} style={{ cursor: 'pointer', border: 'none', background: '#fef2f2', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }} title="Delete"><FaTrash /></button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5">
                                            <div className="admin-empty-state" style={{ padding: '8rem 2rem' }}>
                                                <div style={{ fontSize: '4rem', color: '#cbd5e1', marginBottom: '1.5rem' }}><FaUserGraduate /></div>
                                                <h3 style={{ margin: 0, color: '#1e293b', fontWeight: 900 }}>NO MATCHING RECORDS</h3>
                                                <p style={{ color: '#94a3b8', fontWeight: 600, marginTop: '0.5rem' }}>The student registry contains no entries matching your query.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ padding: '2rem' }}>
                        {Object.keys(groupedStudents).length > 0 ? (
                            <div style={{ display: 'grid', gap: '2rem' }}>
                                {Object.entries(groupedStudents).map(([key, group], groupIdx) => (
                                    <motion.div
                                        key={key}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: groupIdx * 0.1 }}
                                        style={{
                                            background: '#f8fafc',
                                            borderRadius: '16px',
                                            padding: '1.5rem',
                                            border: '1px solid #e2e8f0'
                                        }}
                                    >
                                        <h3 style={{
                                            margin: '0 0 1rem 0',
                                            color: '#1e293b',
                                            fontWeight: 900,
                                            fontSize: '1.2rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <div style={{
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #4f46e5, #4338ca)'
                                            }}></div>
                                            Year {key.split('-')[0]} - Section {key.split('-')[1]} ({group.length} students)
                                        </h3>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                            gap: '1rem'
                                        }}>
                                            {group.map((s, idx) => (
                                                <motion.div
                                                    key={s.sid}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    style={{
                                                        background: 'white',
                                                        borderRadius: '12px',
                                                        padding: '1rem',
                                                        border: '1px solid #e2e8f0',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '1rem'
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '50px',
                                                        height: '50px',
                                                        background: '#eef2ff',
                                                        borderRadius: '12px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#4f46e5',
                                                        fontSize: '1.4rem',
                                                        fontWeight: 950,
                                                        overflow: 'hidden',
                                                        flexShrink: 0
                                                    }}>
                                                        <img
                                                            src={resolveImageUrl(s.profileImage || s.profilePic || s.avatar, s.studentName)}
                                                            alt="Profile"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.studentName || 'Student'}`;
                                                            }}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        />
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '1rem', marginBottom: '0.25rem' }}>{s.studentName}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>ID: {s.sid}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: 700 }}>{s.branch}</div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                        <button onClick={() => openModal('student-view', s)} style={{ cursor: 'pointer', border: 'none', background: '#f8fafc', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.8rem' }} title="View"><FaEye /></button>
                                                        <button onClick={() => openModal('student', s)} style={{ cursor: 'pointer', border: 'none', background: '#fffbeb', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', fontSize: '0.8rem' }} title="Edit"><FaEdit /></button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="admin-empty-state" style={{ padding: '8rem 2rem' }}>
                                <div style={{ fontSize: '4rem', color: '#cbd5e1', marginBottom: '1.5rem' }}><FaUserGraduate /></div>
                                <h3 style={{ margin: 0, color: '#1e293b', fontWeight: 900 }}>NO MATCHING RECORDS</h3>
                                <p style={{ color: '#94a3b8', fontWeight: 600, marginTop: '0.5rem' }}>The student registry contains no entries matching your query.</p>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default StudentSection;
