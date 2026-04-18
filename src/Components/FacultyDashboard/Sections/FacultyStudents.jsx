// src/Components/FacultyDashboard/Sections/FacultyStudents.jsx
import React, { useState } from 'react';
import { FaSearch, FaGraduationCap, FaCodeBranch, FaLayerGroup, FaRobot, FaEye, FaTrophy, FaCheckCircle, FaTimesCircle, FaCalendarAlt, FaBuilding, FaLink, FaArrowLeft, FaIdBadge, FaEnvelope, FaDownload } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { apiGet, apiPut, resolveImageUrl } from '../../../utils/apiClient';
import sseClient from '../../../utils/sseClient';
import DocViewer from '../../DocViewer/DocViewer';
import StudentProfileModal from '../../Shared/StudentProfileModal';
import './FacultyStudents.css';

/**
 * STUDENT INTELLIGENCE REGISTRY
 * Advanced interface for monitoring student performance, achievements, and identity profiles.
 */
const FacultyStudents = ({ studentsList, openAiWithPrompt }) => {
    // Safety check
    studentsList = studentsList || [];
    const [searchTerm, setSearchTerm] = useState('');
    const [filterYear, setFilterYear] = useState('All');

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentAchievements, setStudentAchievements] = useState([]);
    const [studentOverview, setStudentOverview] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [viewerDoc, setViewerDoc] = useState(null);

    // Real-time Update Listener (SSE)
    React.useEffect(() => {
        const unsubscribe = sseClient.onUpdate((event) => {
            if (event.resource === 'achievements' && selectedStudent) {
                // If update is for the currently viewed student, refresh their achievements
                if (event.data?.studentId === selectedStudent.sid || event.data?.studentId === selectedStudent.id || event.data?.studentId === selectedStudent._id) {
                    console.log('📡 Achievement Update Received via SSE (Faculty View)');

                    // Trigger a quiet refresh
                    apiGet(`/api/achievements/student/${selectedStudent._id}`)
                        .then(res => {
                            if (res.success) {
                                setStudentAchievements(res.achievements || []);
                            }
                        })
                        .catch(err => console.error('Silent refresh failed', err));
                }
            }
        });

        return () => unsubscribe();
    }, [selectedStudent]);

    const filteredStudents = studentsList.filter(student => {
        const name = (student.studentName || student.name || '').toLowerCase();
        const sid = (student.sid || student.id || '').toLowerCase();
        const matchesSearch = name.includes(searchTerm.toLowerCase()) || sid.includes(searchTerm.toLowerCase());
        const matchesYear = filterYear === 'All' || String(student.year) === String(filterYear);
        return matchesSearch && matchesYear;
    });

    const years = ['All', ...new Set(studentsList.map(s => s.year).filter(Boolean))].sort();

    const handleStudentClick = async (student) => {
        try {
            setSelectedStudent(student);
            setLoadingDetails(true);
            const studentId = student.sid || student.id;
            const mongoId = student._id;

            const [achievementRes, overviewRes] = await Promise.all([
                apiGet(`/api/achievements/student/${mongoId}`),
                apiGet(`/api/students/${studentId}/overview`)
            ]);

            if (achievementRes.success) {
                setStudentAchievements(achievementRes.achievements || []);
            }
            if (overviewRes) {
                setStudentOverview(overviewRes);
            }
        } catch (error) {
            console.error('Error fetching student intelligence data:', error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleCloseProfile = () => {
        setSelectedStudent(null);
        setStudentAchievements([]);
        setStudentOverview(null);
    };

    const handleApprove = async (achievementId) => {
        // Optimistic Update
        setStudentAchievements(prev => prev.map(a => a._id === achievementId ? { ...a, status: 'Approved' } : a));

        try {
            const response = await apiPut(`/api/achievements/${achievementId}/approve`, { role: 'Faculty' });
            if (!response.success) {
                // Revert on failure
                handleStudentClick(selectedStudent);
                alert('Approval failed on server.');
            }
        } catch (error) {
            console.error('Approval process failed:', error);
            handleStudentClick(selectedStudent); // Revert
        }
    };

    const handleReject = async (achievementId) => {
        const reason = prompt('Specify rejection rationale:');
        if (!reason) return;

        // Optimistic Update
        setStudentAchievements(prev => prev.map(a => a._id === achievementId ? { ...a, status: 'Rejected' } : a));

        try {
            const response = await apiPut(`/api/achievements/${achievementId}/reject`, { reason, role: 'Faculty' });
            if (!response.success) {
                // Revert
                handleStudentClick(selectedStudent);
                alert('Rejection failed on server.');
            }
        } catch (error) {
            console.error('Rejection process failed:', error);
            handleStudentClick(selectedStudent); // Revert
        }
    };


    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div className="student-intelligence-container">
            <header className="f-view-header">
                <div>
                    <h2>STUDENT <span>REGISTRY</span></h2>
                    <p className="nexus-subtitle">Comprehensive intelligence suite for student identity and performance data</p>
                </div>
                <div style={{ background: 'var(--std-primary)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '16px', fontWeight: 950, fontSize: '0.9rem', boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)' }}>
                    {studentsList.length} TOTAL RECORDS
                </div>
            </header>

            <div className="intelligence-controls">
                <div className="std-search-wrapper">
                    <FaSearch style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.2rem' }} />
                    <input type="text" placeholder="Probe identity or serial number..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="std-search-input" />
                </div>

                <div className="nexus-glass-pills">
                    {years.map(y => (
                        <button key={y} onClick={() => setFilterYear(y)} className={`nexus-pill ${filterYear === String(y) ? 'active' : ''}`}>{y === 'All' ? 'GLOBAL REGISTRY' : `YEAR ${y}`}</button>
                    ))}
                </div>
            </div>

            <div className="student-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
                <AnimatePresence>
                    {filteredStudents.map((student, i) => (
                        <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }} key={student.sid || i} className="student-card-v6" onClick={() => handleStudentClick(student)}>
                            <div className="std-card-banner"></div>
                            <div style={{ padding: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                    <div className="std-avatar-box">
                                        <img
                                            src={resolveImageUrl(student.profileImage || student.profilePic || student.avatar, student.studentName || 'Student')}
                                            alt="Student"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.studentName || 'Student'}`;
                                            }}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 950, color: '#94a3b8', background: 'var(--std-slate-50)', padding: '0.4rem 0.8rem', borderRadius: '10px', border: '1px solid var(--std-slate-200)' }}>ID: {student.sid || student.id}</span>
                                </div>
                                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem', fontWeight: 950, color: 'var(--std-slate-900)' }}>{student.studentName || student.name}</h3>
                                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#64748b' }}>{student.email || 'PROTOCOL-GENERIC-EMAIL'}</p>

                                <div className="std-meta-row">
                                    <span className="std-pill-v6"><FaGraduationCap style={{ color: 'var(--std-primary)' }} /> YR {student.year}</span>
                                    <span className="std-pill-v6"><FaLayerGroup style={{ color: 'var(--std-success)' }} /> SEC {student.section}</span>
                                    <span className="std-pill-v6" style={{ flex: 1, justifyContent: 'center' }}><FaCodeBranch style={{ color: 'var(--std-warning)' }} /> {student.branch || 'GENERAL'}</span>
                                </div>

                                <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.5rem' }}>
                                    <button className="f-quick-btn shadow secondary" style={{ flex: 1, fontSize: '0.8rem' }} onClick={(e) => { e.stopPropagation(); handleStudentClick(student); }}>
                                        <FaEye /> PROFILE
                                    </button>
                                    <button className="f-quick-btn shadow ai" style={{ flex: 1, fontSize: '0.8rem' }} onClick={(e) => { e.stopPropagation(); openAiWithPrompt(`Analyze pedagogical potential for student ${student.studentName}.`); }}>
                                        <FaRobot /> AI EVAL
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <StudentProfileModal
                isOpen={!!selectedStudent}
                onClose={handleCloseProfile}
                student={studentOverview?.student || selectedStudent}
                viewedAchievements={studentAchievements}
                getFileUrl={(url) => {
                    if (!url) return null;
                    if (url.startsWith('data:') || url.startsWith('http')) return url;
                    const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
                    return `${backendUrl}${url.startsWith('/') ? '' : '/'}${url}`;
                }}
            />

            <DocViewer
                open={!!viewerDoc}
                fileUrl={viewerDoc?.fileUrl}
                fileName={viewerDoc?.fileName}
                onClose={() => setViewerDoc(null)}
            />
        </div>
    );
};

export default FacultyStudents;
