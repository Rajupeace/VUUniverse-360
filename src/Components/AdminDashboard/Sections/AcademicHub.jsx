import React, { useState, useMemo } from 'react';
import {
    FaPlus, FaBook, FaEdit, FaTrash,
    FaThLarge, FaColumns, FaChartPie, FaListUl,
    FaSearch, FaCheckCircle, FaExclamationCircle, FaUserGraduate, FaFileUpload, FaRobot,
    FaCloud, FaCube
} from 'react-icons/fa';
import { getYearData } from '../../StudentDashboard/branchData';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Unified Academic Hub V4
 * Professional Curriculum Management with Live Sync Indicators
 */
const AcademicHub = ({
    courses,
    students,
    materials,
    openModal,
    handleDeleteCourse,
    initialSection,
    onSectionChange,
    openAiWithPrompt,
    isSyncing = false
}) => {
    // Core Hub State
    const [hubView, setHubView] = useState('syllabus'); // 'syllabus', 'sections', 'management'

    // Syllabus View State
    const [selectedBranchFilter, setSelectedBranchFilter] = useState('CSE');
    const [selectedSectionFilter, setSelectedSectionFilter] = useState(initialSection || 'All');
    const [activeYearTab, setActiveYearTab] = useState(1);
    const [gridMode, setGridMode] = useState('tabs'); // 'tabs' or 'all-years'
    const [searchTerm, setSearchTerm] = useState('');

    // Sync from parent
    React.useEffect(() => {
        if (initialSection) setSelectedSectionFilter(initialSection);
    }, [initialSection]);

    const handleSectionChangeInternal = (val) => {
        setSelectedSectionFilter(val);
        if (onSectionChange) onSectionChange(val);
    };

    const SECTION_OPTIONS = useMemo(() => {
        const alpha = Array.from({ length: 16 }, (_, i) => String.fromCharCode(65 + i));
        const num = Array.from({ length: 20 }, (_, i) => String(i + 1));
        return [...alpha, ...num];
    }, []);

    // --- Memoized Data Source ---
    const memoizedMergedData = useMemo(() => {
        const results = {};
        [1, 2, 3, 4].forEach(year => {
            // 1. Get Live DB Courses
            const dynamicCourses = courses.filter(c =>
                String(c.year) === String(year) &&
                (selectedBranchFilter === 'All' || c.branch?.toLowerCase() === selectedBranchFilter.toLowerCase() || c.branch === 'All' || c.branch === 'Common') &&
                (selectedSectionFilter === 'All' || c.section === 'All' || c.section === selectedSectionFilter)
            );

            let merged = [...dynamicCourses];

            // 2. Merge Static Data if applicable
            if (selectedBranchFilter !== 'All') {
                const staticData = getYearData(selectedBranchFilter, String(year));
                if (staticData && staticData.semesters) {
                    staticData.semesters.forEach(sem => {
                        sem.subjects.forEach(staticSub => {
                            const exists = dynamicCourses.some(c =>
                                (c.code === staticSub.code || c.courseCode === staticSub.code) &&
                                String(c.semester) === String(sem.sem)
                            );
                            const isOverridden = dynamicCourses.some(c =>
                                c.code === 'EMPTY__OVERRIDE' &&
                                (c.name === staticSub.name || c.courseName === staticSub.name) &&
                                String(c.semester) === String(sem.sem)
                            );

                            if (!exists && !isOverridden) {
                                merged.push({
                                    ...staticSub,
                                    year: year,
                                    semester: sem.sem,
                                    branch: selectedBranchFilter,
                                    section: selectedSectionFilter === 'All' ? 'All' : selectedSectionFilter,
                                    isStatic: true,
                                    id: `static-${staticSub.code}-${year}-${sem.sem}`
                                });
                            }
                        });
                    });
                }
            }
            results[year] = merged.filter(c => c.code !== 'EMPTY__OVERRIDE').sort((a, b) => a.semester - b.semester);
        });
        return results;
    }, [courses, selectedBranchFilter, selectedSectionFilter]);

    const getMergedCoursesForYear = (year) => memoizedMergedData[year] || [];

    // Helper: Find active override for a semester
    const getOverrideForSemester = (year, semester) => {
        return courses.find(c =>
            c.code === 'EMPTY__OVERRIDE' &&
            String(c.year) === String(year) &&
            String(c.semester) === String(semester) &&
            (c.branch === selectedBranchFilter || c.branch === 'All' || c.branch === 'Common')
        );
    };

    // Helper: Restore default subjects (Delete Override)
    const handleRestoreDefaults = async (overrideId) => {
        if (window.confirm('Restore default subjects for this semester?')) {
            await handleDeleteCourse(overrideId);
        }
    };

    // Helper for Management View (All Years)
    const allManagementCourses = useMemo(() => {
        let all = [];
        Object.values(memoizedMergedData).forEach(yearList => {
            all = [...all, ...yearList];
        });
        if (searchTerm) {
            const lowTerm = searchTerm.toLowerCase();
            all = all.filter(c =>
                c.name.toLowerCase().includes(lowTerm) ||
                c.code.toLowerCase().includes(lowTerm)
            );
        }
        return all;
    }, [memoizedMergedData, searchTerm]);

    const sectionTelemetryData = useMemo(() => {
        return SECTION_OPTIONS.filter(sec =>
            ['A', 'B', 'C', 'D'].includes(sec) ||
            students.some(s => s.section === sec) ||
            courses.some(c => c.section === sec)
        ).map(sec => ({
            sec,
            sCount: students.filter(s => s.section === sec).length,
            cCount: courses.filter(c => (c.section === sec || c.section === 'All') && c.code !== 'EMPTY__OVERRIDE').length
        }));
    }, [SECTION_OPTIONS, students, courses]);

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    // --- RENDERERS ---

    const renderSectionsAnalytics = () => (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '0 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.5rem', fontWeight: 900 }}>SECTION TELEMETRY</h3>
                <button
                    className="admin-btn admin-btn-primary"
                    style={{
                        gap: '0.75rem', background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                        boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '12px', border: 'none', fontStyle: 'italic', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center'
                    }}
                    onClick={() => {
                        const activeSections = sectionTelemetryData.map(d => d.sec);
                        const prompt = `Can you provide a detailed academic performance and resource allocation report for the following active sections: ${activeSections.join(', ')}? Analyze student distribution (Total: ${students.length}) and subject coverage.`;
                        openAiWithPrompt(prompt);
                    }}
                >
                    <FaRobot /> AI PERFORMANCE REPORT
                </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                {sectionTelemetryData.map(({ sec, sCount, cCount }) => (
                    <motion.div
                        whileHover={{ y: -5 }}
                        key={sec}
                        onClick={() => { setHubView('management'); setSearchTerm(`Sec ${sec}`); }}
                        style={{
                            cursor: 'pointer', textAlign: 'center', background: 'white', padding: '2rem',
                            borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9'
                        }}
                    >
                        <div style={{ fontWeight: 800, color: '#94a3b8', fontSize: '0.75rem', letterSpacing: '0.1em' }}>SECTION</div>
                        <div style={{ fontSize: '3rem', fontWeight: 900, color: '#1e293b', margin: '0.5rem 0', lineHeight: 1 }}>{sec}</div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1.5rem', fontSize: '0.9rem', fontWeight: 700, color: '#64748b' }}>
                            <span title="Students" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FaUserGraduate style={{ color: '#4f46e5' }} /> {sCount}</span>
                            <span title="Subjects" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FaBook style={{ color: '#0ea5e9' }} /> {cCount}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );

    const renderManagementTable = () => {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <th style={{ padding: '1.2rem 1.5rem' }}>Subject & Branch</th>
                                <th style={{ padding: '1.2rem 1.5rem' }}>Code</th>
                                <th style={{ padding: '1.2rem 1.5rem' }}>Year/Sem</th>
                                <th style={{ padding: '1.2rem 1.5rem' }}>Section</th>
                                <th style={{ padding: '1.2rem 1.5rem' }}>Content Status</th>
                                <th style={{ padding: '1.2rem 1.5rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allManagementCourses.map(c => (
                                <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} className="hover:bg-slate-50">
                                    <td style={{ padding: '1.2rem 1.5rem' }}>
                                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{c.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.branch || 'Common'}</div>
                                    </td>
                                    <td style={{ padding: '1.2rem 1.5rem' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.3rem 0.6rem', background: '#f1f5f9', borderRadius: '6px', color: '#475569' }}>{c.code}</span>
                                    </td>
                                    <td style={{ padding: '1.2rem 1.5rem', fontWeight: 600, color: '#475569' }}>Y{c.year} • S{c.semester}</td>
                                    <td style={{ padding: '1.2rem 1.5rem' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0ea5e9' }}>SEC {c.section || 'All'}</span>
                                    </td>
                                    <td style={{ padding: '1.2rem 1.5rem' }}>
                                        {materials.some(m => m.subject === c.name) ?
                                            <span style={{ color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}><FaCheckCircle /> READY</span> :
                                            <span style={{ color: '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}><FaExclamationCircle /> EMPTY</span>
                                        }
                                    </td>
                                    <td style={{ padding: '1.2rem 1.5rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => openModal('material', { subject: c.name, year: c.year, semester: c.semester, branch: c.branch })} style={{ cursor: 'pointer', border: '1px solid #e2e8f0', background: 'white', borderRadius: '8px', padding: '0.4rem', color: '#3b82f6' }} title="Upload"><FaFileUpload /></button>
                                            <button onClick={() => openModal('course', c)} style={{ cursor: 'pointer', border: '1px solid #e2e8f0', background: 'white', borderRadius: '8px', padding: '0.4rem', color: '#f59e0b' }} title="Edit"><FaEdit /></button>
                                            <button onClick={() => handleDeleteCourse(c)} style={{ cursor: 'pointer', border: '1px solid #fee2e2', background: '#fef2f2', borderRadius: '8px', padding: '0.4rem', color: '#ef4444' }} title="Delete"><FaTrash /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        );
    };

    const renderSyllabusGrid = (year) => {
        const allCourses = getMergedCoursesForYear(year);
        const semesters = Array.from({ length: 2 }, (_, i) => (year - 1) * 2 + i + 1);

        return (
            <React.Fragment key={year}>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                        marginTop: '2.5rem', marginBottom: '1.5rem',
                        display: 'flex', alignItems: 'center', gap: '1.5rem'
                    }}
                >
                    <div style={{
                        padding: '0.6rem 1.4rem',
                        background: 'linear-gradient(135deg, #1e293b, #334155)',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        fontWeight: 950,
                        letterSpacing: '1px',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                    }}>
                        LEVEL {year}
                    </div>
                    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, #e2e8f0 0%, transparent 100%)' }}></div>
                </motion.div>

                <div className="hub-sem-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2.5rem', marginBottom: '4rem' }}>
                    {semesters.map(sem => {
                        const semCourses = allCourses.filter(c => String(c.semester) === String(sem));
                        return (
                            <motion.div
                                key={sem}
                                className="admin-card hub-sem-card"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                whileHover={{ y: -8 }}
                                style={{
                                    border: '1px solid rgba(255,255,255,0.7)',
                                    background: 'rgba(255,255,255,0.95)',
                                    backdropFilter: 'blur(16px)',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
                                    borderRadius: '32px',
                                    padding: '2.5rem',
                                    position: 'relative',
                                    overflow: 'visible'
                                }}
                            >
                                <div style={{
                                    position: 'absolute',
                                    top: '-15px',
                                    right: '30px',
                                    background: '#4f46e5',
                                    color: 'white',
                                    padding: '6px 15px',
                                    borderRadius: '10px',
                                    fontSize: '0.7rem',
                                    fontWeight: 950,
                                    boxShadow: '0 8px 16px rgba(79, 70, 229, 0.3)'
                                }}>
                                    TERM 0{sem}
                                </div>

                                <div className="hub-sem-header" style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                        <div style={{
                                            width: '36px', height: '36px', borderRadius: '10px',
                                            background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.2rem'
                                        }}>
                                            <FaBook />
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '1.2rem', fontWeight: 950, color: '#0f172a', letterSpacing: '-0.5px' }}>Semester {sem}</span>
                                            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800 }}>{semCourses.length} Subjects Active</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => openModal('course', { year, semester: sem, branch: selectedBranchFilter, section: selectedSectionFilter })}
                                        style={{
                                            padding: '0.6rem 1.2rem', borderRadius: '12px',
                                            fontSize: '0.75rem', fontWeight: 900,
                                            border: '1px solid #e2e8f0', color: '#4f46e5',
                                            background: 'white',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            transition: 'all 0.2s'
                                        }}
                                        className="hub-add-btn"
                                    >
                                        <FaPlus /> ENROLL
                                    </button>
                                </div>

                                <div className="hub-subjects-list" style={{ display: 'grid', gap: '1.2rem' }}>
                                    {semCourses.map(c => {
                                        const hasMaterials = materials.some(m => m.subject === c.name || (m.subject && c.name && m.subject.includes(c.name)));
                                        const isLive = !c.isStatic;

                                        return (
                                            <motion.div
                                                key={c.id || c.code}
                                                variants={itemVariants}
                                                whileHover={{ x: 10, background: '#f8fafc' }}
                                                style={{
                                                    padding: '1.2rem', borderRadius: '20px',
                                                    background: isLive ? 'white' : 'rgba(248, 250, 252, 0.5)',
                                                    border: isLive ? '1.5px solid #e0e7ff' : '1.5px dashed #cbd5e1',
                                                    display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem',
                                                    alignItems: 'center', position: 'relative', overflow: 'hidden',
                                                    boxShadow: isLive ? '0 4px 12px rgba(79, 70, 229, 0.05)' : 'none'
                                                }}
                                            >
                                                {isLive && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '5px', background: 'linear-gradient(to bottom, #4f46e5, #7c3aed)' }}></div>}

                                                <div className="hub-subject-info">
                                                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                        <span style={{
                                                            fontSize: '0.65rem', fontWeight: 900, padding: '0.25rem 0.6rem', borderRadius: '7px',
                                                            background: isLive ? '#eef2ff' : '#f1f5f9', color: isLive ? '#4f46e5' : '#64748b',
                                                            letterSpacing: '0.5px'
                                                        }}>
                                                            {c.code || 'NO-CODE'}
                                                        </span>
                                                        {isLive ? (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', fontWeight: 950, color: '#10b981' }}>
                                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }}></div>
                                                                ACTIVE
                                                            </div>
                                                        ) : (
                                                            <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#94a3b8', background: '#f8fafc', padding: '2px 8px', borderRadius: '5px' }}>SYSTEM</span>
                                                        )}
                                                    </div>
                                                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.3px' }}>{c.name}</h4>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <span>SEC {c.section || 'All'}</span>
                                                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#cbd5e1' }}></span>
                                                        {hasMaterials ? (
                                                            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                <FaFileUpload /> {materials.filter(m => m.subject === c.name).length} ASSETS
                                                            </span>
                                                        ) : (
                                                            <span style={{ color: '#f43f5e' }}>EMPTY REPOSITORY</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="hub-subject-actions" style={{ display: 'flex', gap: '0.6rem' }}>
                                                    <button onClick={() => openModal('material', { subject: c.name, year: c.year, semester: c.semester, branch: c.branch || selectedBranchFilter })} style={{ cursor: 'pointer', border: 'none', borderRadius: '12px', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: '#4f46e5', background: '#f5f3ff', transition: 'all 0.2s' }} title="Upload"><FaFileUpload /></button>
                                                    <button onClick={() => openModal('course', c)} style={{ cursor: 'pointer', border: 'none', borderRadius: '12px', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: '#f59e0b', background: '#fffbeb', transition: 'all 0.2s' }} title="Edit"><FaEdit /></button>
                                                    <button onClick={() => handleDeleteCourse(c)} style={{ cursor: 'pointer', border: 'none', borderRadius: '12px', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: '#ef4444', background: '#fef2f2', transition: 'all 0.2s' }} title="Delete"><FaTrash /></button>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                    {semCourses.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '3rem 2rem', border: '2px dashed #f1f5f9', borderRadius: '24px', color: '#94a3b8' }}>
                                            <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.3 }}><FaBook /></div>
                                            <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem', color: '#64748b' }}>No Subject Records</p>
                                            <p style={{ margin: '0.5rem 0 1.5rem 0', fontSize: '0.75rem', fontWeight: 600 }}>Semester instance is currently unpopulated.</p>

                                            {getOverrideForSemester(year, sem) && (
                                                <div style={{ background: '#fef2f2', padding: '1.2rem', borderRadius: '16px', border: '1px solid #fee2e2' }}>
                                                    <p style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 900, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                        <FaExclamationCircle /> SYSTEM SHIELDS ACTIVE
                                                    </p>
                                                    <button
                                                        onClick={() => handleRestoreDefaults(getOverrideForSemester(year, sem)._id || getOverrideForSemester(year, sem).id)}
                                                        style={{
                                                            padding: '0.6rem 1.2rem',
                                                            background: 'white',
                                                            border: '1.5px solid #fecaca',
                                                            color: '#dc2626',
                                                            borderRadius: '10px',
                                                            fontWeight: 900,
                                                            cursor: 'pointer',
                                                            fontSize: '0.8rem',
                                                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)'
                                                        }}
                                                    >
                                                        RESTORE ARCHIVE
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </React.Fragment>
        );
    };

    return (
        <div className="academic-hub-v4 animate-fade-in" style={{ paddingBottom: '4rem' }}>
            <header className="admin-page-header" style={{ marginBottom: '2rem' }}>
                <div className="admin-page-title">
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 950, letterSpacing: '-0.03em', background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        ACADEMIC <span style={{ color: '#4f46e5', WebkitTextFillColor: '#4f46e5' }}>HUB</span>
                        {isSyncing && (
                            <motion.span
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{ marginLeft: '1rem', fontSize: '0.7rem', verticalAlign: 'middle', background: '#eef2ff', color: '#4f46e5', padding: '4px 10px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '5px', border: '1px solid #e0e7ff', fontWeight: 900 }}
                            >
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><FaCloud /></motion.div>
                                SYNCING...
                            </motion.span>
                        )}
                    </h1>
                    <p style={{ fontSize: '1rem', color: '#64748b' }}>Curriculum Synchronization & Resource Management</p>
                </div>

                <div className="hub-nav-controls" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div className="admin-segmented-control" style={{ background: '#f1f5f9', padding: '0.4rem', borderRadius: '14px', display: 'flex', gap: '0.4rem' }}>
                        {['syllabus', 'sections', 'management'].map(mode => (
                            <button
                                key={mode}
                                onClick={() => setHubView(mode)}
                                style={{
                                    padding: '0.6rem 1.2rem',
                                    borderRadius: '10px',
                                    border: 'none',
                                    fontWeight: 800,
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    background: hubView === mode ? 'white' : 'transparent',
                                    color: hubView === mode ? '#4f46e5' : '#64748b',
                                    boxShadow: hubView === mode ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {mode === 'syllabus' && <FaColumns />}
                                {mode === 'sections' && <FaChartPie />}
                                {mode === 'management' && <FaListUl />}
                                {mode.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* FILTERS & TOOLS */}
            <div className="admin-filter-bar" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', background: 'white', padding: '1rem', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                <select
                    className="admin-select"
                    style={{ padding: '0.8rem 1.2rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontWeight: 700, outline: 'none' }}
                    value={selectedBranchFilter}
                    onChange={e => setSelectedBranchFilter(e.target.value)}
                >
                    <option value="All">All Branches</option>
                    {['CSE', 'ECE', 'EEE', 'Mechanical', 'Civil', 'IT', 'AIML'].map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <select
                    className="admin-select"
                    style={{ padding: '0.8rem 1.2rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontWeight: 700, outline: 'none' }}
                    value={selectedSectionFilter}
                    onChange={e => handleSectionChangeInternal(e.target.value)}
                >
                    <option value="All">All Sections</option>
                    {SECTION_OPTIONS.map(s => <option key={s} value={s}>Sec {s}</option>)}
                </select>

                {hubView === 'management' && (
                    <div style={{ flex: 1, position: 'relative' }}>
                        <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            style={{
                                width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', borderRadius: '12px',
                                border: '1px solid #e2e8f0', outline: 'none', fontWeight: 600,
                                background: '#f8fafc'
                            }}
                            placeholder="Search subjects..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                )}

                <button
                    style={{
                        marginLeft: 'auto',
                        padding: '0.8rem 1.5rem',
                        background: '#4f46e5', color: 'white',
                        border: 'none', borderRadius: '12px',
                        fontWeight: 800,
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                    }}
                    onClick={() => openModal('course')}
                >
                    <FaPlus /> ADD SUBJECT
                </button>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={hubView}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    {hubView === 'syllabus' && (
                        <div className="hub-syllabus-wrap">
                            <div className="admin-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                {[1, 2, 3, 4].map(y => (
                                    <button
                                        key={y}
                                        onClick={() => setActiveYearTab(y)}
                                        style={{
                                            padding: '0.8rem 1.5rem',
                                            borderRadius: '12px',
                                            border: activeYearTab === y ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                                            background: activeYearTab === y ? '#eef2ff' : 'white',
                                            color: activeYearTab === y ? '#4f46e5' : '#64748b',
                                            fontWeight: 900,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        YEAR {y}
                                    </button>
                                ))}
                                <div style={{ flex: 1 }} />
                                <button
                                    onClick={() => setGridMode(gridMode === 'tabs' ? 'all-years' : 'tabs')}
                                    style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 700, cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                                >
                                    <FaThLarge /> {gridMode === 'tabs' ? 'Expand All' : 'Tab View'}
                                </button>
                            </div>

                            {gridMode === 'tabs' ? renderSyllabusGrid(activeYearTab) : [1, 2, 3, 4].map(y => renderSyllabusGrid(y))}
                        </div>
                    )}

                    {hubView === 'sections' && renderSectionsAnalytics()}
                    {hubView === 'management' && renderManagementTable()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default AcademicHub;
