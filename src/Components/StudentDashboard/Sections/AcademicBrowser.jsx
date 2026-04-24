import React, { useState, useMemo } from 'react';
import { FaDownload, FaArrowLeft, FaChevronRight, FaRegFolder, FaRegFileAlt, FaVideo, FaLightbulb, FaFileAlt, FaSync, FaFolderOpen, FaLayerGroup, FaBook } from 'react-icons/fa';
import './AcademicBrowser.css';
import { apiPost, API_BASE } from '../../../utils/apiClient';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * PREMIUM NEXUS ACADEMIC BROWSER V4
 * Professional Glassmorphism Interface for Student Curriculum
 */
const AcademicBrowser = ({ yearData, selectedYear, serverMaterials, userData, setView, branch, onRefresh, assignedFaculty = [], openAiWithDoc }) => {
    const [navPath, setNavPath] = useState([]);
    const [selectedResource, setSelectedResource] = useState(null);

    const currentViewData = useMemo(() => {
        if (navPath.length === 0) {
            const yearToUse = selectedYear || 1;
            return { type: 'year', id: yearToUse, name: `Academic Year ${yearToUse}`, data: yearData.semesters };
        }
        return navPath[navPath.length - 1];
    }, [navPath, selectedYear, yearData]);


    const handleNavigateTo = (item, type, data) => {
        setNavPath([...navPath, { type, id: item.id || item, name: item.name || `Semester ${item}`, data }]);
    };

    const handleBreadcrumbClick = (index) => {
        setNavPath(navPath.slice(0, index + 1));
    };

    const handleBack = () => {
        setNavPath(parent => parent.slice(0, -1));
    };

    const resetNavigation = () => {
        setNavPath([]);
    };

    const containerVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0, transition: { staggerChildren: 0.1 } },
        exit: { opacity: 0, x: -20 }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    const renderEmpty = (msg) => (
        <div className="nexus-empty-state" style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
            <div className="empty-state-icon" style={{ marginBottom: '1rem' }}>
                <FaFolderOpen style={{ fontSize: '3rem', opacity: 0.3 }} />
            </div>
            <h3 className="empty-state-title" style={{ fontSize: '1.2rem', fontWeight: 600, color: '#475569' }}>No Content Found</h3>
            <p className="empty-state-msg" style={{ fontSize: '0.9rem' }}>{msg}</p>
        </div>
    );

    const getBestPdfResource = (resources) => {
        if (!resources || !Array.isArray(resources)) return null;
        return resources.find(r => ['notes', 'modelPapers', 'assignments', 'previousQuestions'].includes(r.type)) || resources.find(r => r.url) || null;
    };

    const formatResourceDate = (dateValue) => {
        const date = new Date(dateValue || Date.now());
        if (isNaN(date.getTime())) return 'Recent';
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const openPdf = (resource) => {
        if (!resource || !resource.url) return;
        window.open(resource.url, '_blank');
    };

    const openVideo = (resource) => {
        if (!resource || !resource.url) return;
        window.open(resource.url, '_blank');
    };

    const selectResource = (resource) => {
        setSelectedResource(resource);
        if (resource?.type === 'videos') {
            openVideo(resource);
        } else {
            openPdf(resource);
        }
    };

    const renderSelectedPreview = () => {
        if (!selectedResource) return null;
        const previewUrl = selectedResource.url;
        return (
            <div className="resource-preview-card" style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>{selectedResource.title || selectedResource.name || 'Selected Resource'}</div>
                        <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.35rem' }}>{selectedResource.type?.toUpperCase() || 'RESOURCE'} • {formatResourceDate(selectedResource.uploadedAt || selectedResource.createdAt)}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        { (selectedResource.type === 'videos' || selectedResource.type === 'video') ? (
                            <button onClick={() => openVideo(selectedResource)} style={{ border: 'none', background: '#2563eb', color: 'white', padding: '0.6rem 1rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 }}>Play Video</button>
                        ) : (
                            <button onClick={() => openPdf(selectedResource)} style={{ border: 'none', background: '#1d4ed8', color: 'white', padding: '0.6rem 1rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 }}>Open PDF</button>
                        )}
                        <button onClick={() => setSelectedResource(null)} style={{ border: '1px solid #cbd5e1', background: 'white', color: '#475569', padding: '0.6rem 1rem', borderRadius: '10px', cursor: 'pointer' }}>Clear</button>
                    </div>
                </div>
                {previewUrl && (
                    <div style={{ marginTop: '1.5rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', background: 'white' }}>
                        {(selectedResource.type === 'videos' || selectedResource.type === 'video') ? (
                            <video 
                                src={previewUrl} 
                                controls 
                                style={{ width: '100%', maxHeight: '450px', display: 'block' }}
                                poster="https://img.freepik.com/premium-photo/abstract-dark-blue-gradient-background-blue-background-with-soft-faded-light-white-glow-center_67340-420.jpg"
                            >
                                Your browser does not support the video tag.
                            </video>
                        ) : (
                            <iframe 
                                src={previewUrl} 
                                title="Resource Preview"
                                style={{ width: '100%', height: '500px', border: 'none' }}
                            />
                        )}
                    </div>
                )}
            </div>
        );
    };

    const renderContent = () => {
        const current = currentViewData;

        // Level: Year (Semesters)
        if (current.type === 'year') {
            return (
                <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="nexus-grid-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {(current.data || []).map(sem => (
                        <motion.div
                            variants={itemVariants}
                            whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
                            key={sem.sem}
                            onClick={() => handleNavigateTo({ id: sem.sem, name: `Semester ${selectedYear}.${sem.sem % 2 === 0 ? 2 : 1}` }, 'semester', sem.subjects)}
                            style={{
                                background: 'white', borderRadius: '20px', padding: '2rem', cursor: 'pointer',
                                border: '1px solid #f1f5f9', position: 'relative', overflow: 'hidden'
                            }}
                        >
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '6px', height: '100%', background: 'linear-gradient(to bottom, #4f46e5, #818cf8)' }}></div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '3rem', opacity: 0.1 }}>{sem.sem}</span>
                                <div style={{ background: '#eef2ff', color: '#4f46e5', padding: '0.5rem', borderRadius: '10px' }}><FaLayerGroup /></div>
                            </div>
                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>
                                Semester {selectedYear}.{sem.sem % 2 === 0 ? 2 : 1}
                            </h3>
                            <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>{(sem.subjects || []).length} Specialized Subjects</span>
                        </motion.div>
                    ))}
                    {(!current.data || current.data.length === 0) && renderEmpty("No semesters configured for this year.")}
                </motion.div>
            );
        }

        // Level: Semester (Subjects)
        if (current.type === 'semester') {
            return (
                <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="nexus-grid-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {(current.data || []).map(sub => (
                        <motion.div
                            variants={itemVariants}
                            whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
                            key={sub.id}
                            onClick={() => handleNavigateTo(sub, 'subject', sub.modules)}
                            style={{
                                background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)',
                                borderRadius: '18px', padding: '1.5rem', cursor: 'pointer',
                                border: '1px solid #e2e8f0'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f0f9ff', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                    <FaBook />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1e293b', lineHeight: 1.3 }}>{sub.name}</h3>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', background: '#f8fafc', padding: '0.1rem 0.4rem', borderRadius: '4px', marginTop: '0.2rem', display: 'inline-block' }}>{sub.code}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <FaChevronRight style={{ color: '#cbd5e1' }} />
                            </div>
                        </motion.div>
                    ))}
                    {(!current.data || current.data.length === 0) && renderEmpty("No subjects found in this semester.")}
                </motion.div>
            );
        }

        // Level: Subject (Modules + Resources)
        if (current.type === 'subject') {
            // Use centralized API_BASE instead of hardcoded fallback
            const apiMaterials = serverMaterials.map(m => ({ ...m, url: m.url && m.url.startsWith('http') ? m.url : `${API_BASE}${m.url}` }));

            // ... (Resource Filtering Logic Preserved) ...
            const semesterItem = navPath.find(p => p.type === 'semester');
            const currentSemester = semesterItem ? semesterItem.id : null;
            const subjectResources = apiMaterials.filter(m => {
                const matchYear = !m.year || String(m.year) === 'All' || String(m.year) === String(selectedYear);
                const matchSemester = !m.semester || String(m.semester) === 'All' || (currentSemester && (String(m.semester) === String(currentSemester) || String(currentSemester).includes(String(m.semester))));
                
                const sections = m.section ? (Array.isArray(m.section) ? m.section : String(m.section).split(',').map(s => s.trim())) : [];
                const matchSection = !m.section || sections.length === 0 || sections.includes('All') || sections.includes('all') || sections.includes(userData.section) || sections.includes(String(userData.section));
                
                const subj = m.subject ? String(m.subject).trim().toLowerCase() : '';
                const nodeName = String(current.name || '').trim().toLowerCase();
                const courseName = m.course && (m.course.courseName || m.course.name) ? String(m.course.courseName || m.course.name).trim().toLowerCase() : '';
                const courseCode = m.course && (m.course.courseCode || m.course.code) ? String(m.course.courseCode || m.course.code).trim().toLowerCase() : '';
                
                const matchSubject = !subj || subj === 'all' || 
                    (subj && (subj === nodeName || subj === courseCode || subj === courseName || nodeName.includes(subj) || subj.includes(nodeName))) ||
                    (courseName && (courseName === nodeName || courseCode === nodeName || nodeName.includes(courseName))) ||
                    (courseCode && (courseCode === nodeName || courseCode === subj));
                
                const uploaderName = m.uploadedBy?.name || m.uploadedBy || '';
                const isAssignedFaculty = !uploaderName || (assignedFaculty || []).some(f => (f.name && uploaderName && f.name.toLowerCase().includes(uploaderName.toLowerCase())) || (f.facultyId && m.uploadedBy === f.facultyId));
                
                return matchYear && matchSemester && matchSection && Boolean(matchSubject);
            });

            const notes = subjectResources.filter(m => m.type === 'notes');
            const videos = subjectResources.filter(m => m.type === 'videos');
            const papers = subjectResources.filter(m => ['modelPapers', 'previousQuestions'].includes(m.type));
            const models = subjectResources.filter(m => m.type === 'models');

            const classroomResource = getBestPdfResource([...notes, ...papers, ...models]);
            return (
                <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="nexus-subject-view">
                    <div className="subject-summary-card">
                        <div>
                            <div className="summary-label">Classroom</div>
                            <div className="summary-value">Section {userData.section || 'A'}</div>
                        </div>
                        <div>
                            <div className="summary-label">Semester</div>
                            <div className="summary-value">{(navPath.find(p => p.type === 'semester')?.id) || selectedYear}</div>
                        </div>
                        <div>
                            <div className="summary-label">Subject</div>
                            <div className="summary-value">{current.name}</div>
                        </div>
                        <div>
                            <div className="summary-label">Modules</div>
                            <div className="summary-value">{(current.data || []).length}</div>
                        </div>
                        <div>
                            <div className="summary-label">Last updated</div>
                            <div className="summary-value">{classroomResource ? formatResourceDate(classroomResource.uploadedAt || classroomResource.createdAt) : 'Unknown'}</div>
                        </div>
                        <button className="view-pdf-btn" onClick={() => openPdf(classroomResource)} disabled={!classroomResource}>
                            {classroomResource ? 'View PDF Now' : 'No PDF Available'}
                        </button>
                    </div>
                    <h3 className="section-title" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#334155', marginBottom: '1rem' }}>COURSE MODULES</h3>
                    <div className="nexus-list" style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                        {(current.data || []).map(mod => (
                            <motion.div
                                variants={itemVariants}
                                key={mod.id}
                                className="nexus-list-item"
                                onClick={() => handleNavigateTo(mod, 'module', mod.units)}
                                style={{
                                    background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0',
                                    display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer'
                                }}
                            >
                                <FaRegFolder style={{ color: '#f59e0b', fontSize: '1.2rem' }} />
                                <div style={{ flex: 1, fontWeight: 700, color: '#1e293b' }}>{mod.name}</div>
                                <span style={{ fontSize: '0.8rem', color: '#64748b', background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '10px' }}>{(mod.units || []).length} units</span>
                                <FaChevronRight style={{ color: '#cbd5e1' }} />
                            </motion.div>
                        ))}
                        {(!current.data || current.data.length === 0) && <p className="text-muted" style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', textAlign: 'center', border: '1px dashed #e2e8f0' }}>No modules defined.</p>}
                    </div>

                    {(notes.length > 0 || videos.length > 0 || papers.length > 0 || models.length > 0) && (
                        <div className="nexus-resources-preview" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '2rem' }}>
                            <h3 className="section-title" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#334155', marginBottom: '1.5rem' }}>LEARNING RESOURCES</h3>

                            {notes.length > 0 && (
                                <div style={{ marginBottom: '2rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaRegFileAlt /> NOTES & HANDOUTS</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                                        {notes.map((n, i) => (
                                            <div key={i} style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ overflow: 'hidden' }}>
                                                    <div style={{ fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.title}</div>
                                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.7rem', color: '#64748b' }}>
                                                        <span>By {n.uploadedBy?.name || n.uploadedBy || 'Instructor'}</span>
                                                        <span>• {formatResourceDate(n.uploadedAt || n.createdAt)}</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button onClick={() => selectResource(n)} style={{ border: 'none', background: '#2563eb', color: 'white', padding: '0.5rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>Open Notes</button>
                                                    <a href={n.url} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', background: '#eff6ff', padding: '0.5rem', borderRadius: '8px' }}><FaDownload /></a>
                                                    <button onClick={() => openAiWithDoc ? openAiWithDoc(n.name || n.title, n.url) : setView('ai-agent')} style={{ border: 'none', background: '#f0fdf4', color: '#16a34a', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>AI</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {videos.length > 0 && (
                                <div style={{ marginBottom: '2rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaVideo /> VIDEO LECTURES</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                        {videos.map((v, i) => (
                                            <div key={i} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                                <div style={{ padding: '1rem', background: '#f8fafc' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                        <div style={{ width: '30px', height: '30px', background: '#fffbeb', color: '#f59e0b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaVideo /></div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontWeight: 700, color: '#1e293b' }}>{v.title}</div>
                                                            {v.duration && <small style={{ color: '#64748b' }}>{v.duration}</small>}
                                                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem' }}>Uploaded {formatResourceDate(v.uploadedAt || v.createdAt)}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <button onClick={() => openVideo(v)} style={{ border: 'none', background: '#2563eb', color: 'white', padding: '0.4rem 0.85rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>Play Video</button>
                                                    <button onClick={() => apiPost(`/api/materials/${v._id || v.id}/like`)} style={{ border: 'none', background: 'none', color: '#f43f5e', cursor: 'pointer', fontWeight: 600 }}>❤️ {v.likes || 0}</button>
                                                    <button onClick={() => openAiWithDoc ? openAiWithDoc(v.name || v.title, v.url || v.fileUrl, v.videoAnalysis) : setView('ai-agent')} style={{ border: 'none', background: '#eff6ff', color: '#3b82f6', padding: '0.3rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>ASK AI</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Papers and Models sections skipped for brevity but similar structure */}
                            {(papers.length > 0 || models.length > 0) && (
                                <div style={{ marginBottom: '2rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaFileAlt /> SUPPLEMENTARY MATERIALS</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                                        {[...papers, ...models].map((m, i) => (
                                            <div key={i} style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ overflow: 'hidden' }}>
                                                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{m.title}</div>
                                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.7rem', color: '#64748b' }}>
                                                        <span style={{ textTransform: 'uppercase' }}>{m.type}</span>
                                                        <span>• {formatResourceDate(m.uploadedAt || m.createdAt)}</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <button onClick={() => selectResource(m)} style={{ border: 'none', background: '#2563eb', color: 'white', padding: '0.5rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>Open Paper</button>
                                                    <a href={m.url} target="_blank" rel="noopener noreferrer" style={{ color: '#4f46e5', background: '#eef2ff', padding: '0.5rem', borderRadius: '8px' }}><FaDownload /></a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            );
        }

        // ... Module/Unit/Topic views similar logic (using list style) ...
        if (current.type === 'module') {
            const moduleResources = (current.data || []).flatMap(unit => (unit.topics || []).flatMap(topic => topic.resources || []));
            const moduleResource = getBestPdfResource(moduleResources);
            return (
                <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="nexus-list" style={{ display: 'grid', gap: '1rem' }}>
                    <div className="subject-summary-card">
                        <div>
                            <div className="summary-label">Section</div>
                            <div className="summary-value">{userData.section || 'A'}</div>
                        </div>
                        <div>
                            <div className="summary-label">Semester</div>
                            <div className="summary-value">{(navPath.find(p => p.type === 'semester')?.id) || selectedYear}</div>
                        </div>
                        <div>
                            <div className="summary-label">Subject</div>
                            <div className="summary-value">{navPath.find(item => item.type === 'subject')?.name || 'N/A'}</div>
                        </div>
                        <div>
                            <div className="summary-label">Module</div>
                            <div className="summary-value">{current.name}</div>
                        </div>
                        <button className="view-pdf-btn" onClick={() => openPdf(moduleResource)} disabled={!moduleResource}>
                            {moduleResource ? 'View PDF Now' : 'No PDF Available'}
                        </button>
                    </div>
                    {(current.data || []).map(unit => (
                        <motion.div variants={itemVariants} key={unit.id} className="nexus-list-item" onClick={() => handleNavigateTo(unit, 'unit', unit.topics)} style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                            <FaRegFolder style={{ color: '#10b981', fontSize: '1.2rem' }} />
                            <div style={{ flex: 1, fontWeight: 700, color: '#1e293b' }}>{unit.name}</div>
                            <span style={{ fontSize: '0.8rem', color: '#64748b', background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '10px' }}>{(unit.topics || []).length} topics</span>
                            <FaChevronRight style={{ color: '#cbd5e1' }} />
                        </motion.div>
                    ))}
                </motion.div>
            );
        }

        if (current.type === 'unit') {
            return (
                <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="nexus-list" style={{ display: 'grid', gap: '1rem' }}>
                    {(current.data || []).map(topic => (
                        <motion.div variants={itemVariants} key={topic.id} className="nexus-list-item" onClick={() => handleNavigateTo(topic, 'topic', topic.resources)} style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                            <FaLightbulb style={{ color: '#f59e0b', fontSize: '1.2rem' }} />
                            <div style={{ flex: 1, fontWeight: 700, color: '#1e293b' }}>{topic.name}</div>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>View Resources</span>
                            <FaChevronRight style={{ color: '#cbd5e1' }} />
                        </motion.div>
                    ))}
                    {(!current.data || current.data.length === 0) && renderEmpty("No topics listed.")}
                </motion.div>
            );
        }

        if (current.type === 'topic') {
            // Use centralized API_BASE instead of hardcoded fallback
            const apiMaterials = serverMaterials.map(m => ({ ...m, url: m.url && m.url.startsWith('http') ? m.url : `${API_BASE}${m.url}` }));

            const subjectObj = navPath.find(item => item.type === 'subject');
            const moduleObj = navPath.find(item => item.type === 'module');
            const unitObj = navPath.find(item => item.type === 'unit');

            const currentSubject = subjectObj ? subjectObj.name : '';
            const currentModule = moduleObj ? moduleObj.name.replace('Module ', '') : '';
            // eslint-disable-next-line no-unused-vars
            const currentUnit = unitObj ? unitObj.name.replace('Unit ', '') : '';


            const dynamicResources = apiMaterials.filter(m => {
                const matchYear = !m.year || String(m.year) === 'All' || String(m.year) === String(selectedYear);
                const semesterItem = navPath.find(p => p.type === 'semester');
                const currentSemester = semesterItem ? semesterItem.id : null;
                const matchSemester = !m.semester || String(m.semester) === 'All' || (currentSemester && (String(m.semester) === String(currentSemester) || String(currentSemester).includes(String(m.semester))));
                
                const sections = m.section ? (Array.isArray(m.section) ? m.section : String(m.section).split(',').map(s => s.trim())) : [];
                const matchSection = !m.section || sections.length === 0 || sections.includes('All') || sections.includes('all') || sections.includes(userData.section) || sections.includes(String(userData.section));

                const subj = m.subject ? String(m.subject).trim().toLowerCase() : '';
                const nodeName = String(currentSubject || '').trim().toLowerCase();
                const courseName = m.course && (m.course.courseName || m.course.name) ? String(m.course.courseName || m.course.name).trim().toLowerCase() : '';
                const courseCode = m.course && (m.course.courseCode || m.course.code) ? String(m.course.courseCode || m.course.code).trim().toLowerCase() : '';
                
                const matchSubject = !subj || subj === 'all' || 
                    (subj && (subj === nodeName || subj === courseCode || subj === courseName || nodeName.includes(subj) || subj.includes(nodeName))) ||
                    (courseName && (courseName === nodeName || courseCode === nodeName || nodeName.includes(courseName))) ||
                    (courseCode && (courseCode === nodeName || courseCode === subj));

                const modStr = m.module ? String(m.module).trim().toLowerCase() : '';
                const matchModule = !m.module || modStr === 'all' || modStr === currentModule || modStr === `module ${currentModule}` || (moduleObj && moduleObj.name && moduleObj.name.toLowerCase().includes(modStr));
                
                const unitStr = m.unit ? String(m.unit).trim().toLowerCase() : '';
                const matchUnit = !m.unit || unitStr === 'all' || unitStr === currentUnit || unitStr === `unit ${currentUnit}` || (unitObj && unitObj.name && unitObj.name.toLowerCase().includes(unitStr));

                return matchYear && matchSemester && matchSection && Boolean(matchSubject) && matchModule && matchUnit;
            });

            const staticResources = current.data || {}; // From JSON structure
            // Merge static and dynamic
            const notes = [...(staticResources.notes || []), ...dynamicResources.filter(m => m.type === 'notes')];
            const videos = [...(staticResources.videos || []), ...dynamicResources.filter(m => m.type === 'videos')];
            const papers = [...(staticResources.modelPapers || []), ...dynamicResources.filter(m => ['modelPapers', 'previousQuestions'].includes(m.type))];
            const models = [...(staticResources.models || []), ...dynamicResources.filter(m => m.type === 'models')];
            const topicResource = getBestPdfResource([...notes, ...papers, ...models]);

            return (
                <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="nexus-resources">
                    <div className="subject-summary-card">
                        <div>
                            <div className="summary-label">Section</div>
                            <div className="summary-value">{userData.section || 'A'}</div>
                        </div>
                        <div>
                            <div className="summary-label">Semester</div>
                            <div className="summary-value">{(navPath.find(p => p.type === 'semester')?.id) || selectedYear}</div>
                        </div>
                        <div>
                            <div className="summary-label">Subject</div>
                            <div className="summary-value">{currentSubject || 'N/A'}</div>
                        </div>
                        <div>
                            <div className="summary-label">Topic</div>
                            <div className="summary-value">{current.name}</div>
                        </div>
                        <div>
                            <div className="summary-label">Last updated</div>
                            <div className="summary-value">{topicResource ? formatResourceDate(topicResource.uploadedAt || topicResource.createdAt) : 'Unknown'}</div>
                        </div>
                        <button className="view-pdf-btn" onClick={() => openPdf(topicResource)} disabled={!topicResource}>
                            {topicResource ? 'View PDF Now' : 'No PDF Available'}
                        </button>
                    </div>
                    {(notes.length > 0 || videos.length > 0 || papers.length > 0 || models.length > 0) ? (
                        <>
                            {notes.length > 0 && (
                                <div style={{ marginBottom: '2rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaRegFileAlt /> TOPIC NOTES</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                                        {notes.map((n, i) => (
                                            <div key={i} style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ overflow: 'hidden' }}>
                                                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{n.title || n.name}</div>
                                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.7rem', color: '#64748b' }}>
                                                        <span>By {n.uploadedBy?.name || n.uploadedBy || 'Instructor'}</span>
                                                        <span>• {formatResourceDate(n.uploadedAt || n.createdAt)}</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button onClick={() => selectResource(n)} style={{ border: 'none', background: '#2563eb', color: 'white', padding: '0.5rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>Open Notes</button>
                                                    <a href={n.url} target="_blank" rel="noopener noreferrer" download style={{ color: '#3b82f6', background: '#eff6ff', padding: '0.5rem', borderRadius: '8px' }}><FaDownload /></a>
                                                    <button onClick={() => openAiWithDoc ? openAiWithDoc(n.name || n.title, n.url) : setView('ai-agent')} style={{ border: 'none', background: '#f0fdf4', color: '#16a34a', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>AI</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {videos.length > 0 && (
                                <div style={{ marginBottom: '2rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaVideo /> CONCEPT VIDEOS</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                        {videos.map((v, i) => (
                                            <div key={i} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                                <div style={{ padding: '1rem', cursor: 'pointer', background: '#f8fafc' }} onClick={() => window.open(v.url, '_blank')}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                        <div style={{ width: '30px', height: '30px', background: '#fffbeb', color: '#f59e0b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaVideo /></div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontWeight: 700, color: '#1e293b' }}>{v.title || v.name}</div>
                                                            {v.duration && <small style={{ color: '#64748b' }}>{v.duration}</small>}
                                                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>Uploaded {formatResourceDate(v.uploadedAt || v.createdAt)}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <button onClick={() => apiPost(`/api/materials/${v._id || v.id}/like`)} style={{ border: 'none', background: 'none', color: '#f43f5e', cursor: 'pointer', fontWeight: 600 }}>❤️ {v.likes || 0}</button>
                                                    <button onClick={() => openAiWithDoc ? openAiWithDoc(v.name || v.title, v.url || v.fileUrl, v.videoAnalysis) : setView('ai-agent')} style={{ border: 'none', background: '#eff6ff', color: '#3b82f6', padding: '0.3rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>ASK AI</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Skipping Papers/Models repetition for brevity, assuming standard blocks if needed or generic renderer */}
                            {(papers.length > 0 || models.length > 0) && (
                                <div style={{ marginTop: '2rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b', marginBottom: '1rem' }}>ADDITIONAL RESOURCES</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                                        {[...papers, ...models].map((m, i) => (
                                            <div key={i} style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ overflow: 'hidden' }}>
                                                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{m.title || m.name}</div>
                                                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>{formatResourceDate(m.uploadedAt || m.createdAt)}</div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button onClick={() => selectResource(m)} style={{ border: 'none', background: '#2563eb', color: 'white', padding: '0.5rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>Open Paper</button>
                                                    <a href={m.url} target="_blank" rel="noopener noreferrer" download style={{ color: '#4f46e5', background: '#eef2ff', padding: '0.5rem', borderRadius: '8px' }}><FaDownload /></a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        renderEmpty("No specific resources found for this topic. Check the main Unit or Module folder.")
                    )}
                </motion.div>
            );
        }

        return renderEmpty("Layer not found.");
    };

    return (
        <div className="nexus-browser-container animate-fade-in" style={{ padding: '0 2rem 4rem 2rem' }}>
            {renderSelectedPreview()}
            <div className="browser-header" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>{currentViewData.name}</h2>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: '#64748b', fontSize: '0.9rem', fontWeight: 600, marginTop: '0.5rem' }}>
                        <span onClick={resetNavigation} style={{ cursor: 'pointer', hover: { color: '#4f46e5' } }}>ROOT</span>
                        {navPath.map((item, i) => (
                            <React.Fragment key={i}>
                                <FaChevronRight style={{ fontSize: '0.7rem', color: '#cbd5e1' }} />
                                <span onClick={() => handleBreadcrumbClick(i)} style={{ cursor: 'pointer', hover: { color: '#4f46e5' } }}>{item.name}</span>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.8rem' }}>
                    {onRefresh && (
                        <button onClick={onRefresh} style={{ width: '40px', height: '40px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Refresh Content">
                            <FaSync />
                        </button>
                    )}
                    {navPath.length > 0 && (
                        <button onClick={handleBack} style={{ padding: '0.6rem 1.2rem', borderRadius: '12px', border: 'none', background: '#4f46e5', color: 'white', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaArrowLeft /> BACK
                        </button>
                    )}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {renderContent()}
            </AnimatePresence>
        </div>
    );
};

export default AcademicBrowser;
