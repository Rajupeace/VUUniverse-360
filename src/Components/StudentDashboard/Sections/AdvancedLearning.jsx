import React, { useState, useEffect, useCallback } from 'react';
import {
    FaVideo, FaFileAlt, FaBrain,
    FaClock, FaRocket, FaTerminal, FaQuestionCircle,
    FaUserTie, FaCalendarAlt, FaShieldAlt,
    FaPython, FaJava, FaCode, FaNodeJs, FaCss3Alt,
    FaDatabase, FaJs, FaChevronRight, FaLock, FaEye, FaSync
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { apiGet, API_BASE } from '../../../utils/apiClient';
import '../AdvancedLearning.css';

/**
 * ADVANCED LEARNING HUB
 * A premium workstation for advanced programming and full-stack development.
 */
const AdvancedLearning = ({ userData, overviewData, preloadedData, openAiWithDoc }) => {
    // Proactive hardening
    overviewData = overviewData || { myFaculty: [] };
    preloadedData = preloadedData || [];
    const [activeTab, setActiveTab] = useState('languages'); // 'languages' | 'fullstack' | 'faculty' | 'exams' | 'placement'
    const [selectedTech, setSelectedTech] = useState('Python');
    const [materials, setMaterials] = useState(preloadedData || []);
    const [loading, setLoading] = useState(!preloadedData);
    const [unlockedDomains, setUnlockedDomains] = useState([]);

    useEffect(() => {
        const fetchUnlocked = () => {
            const stored = JSON.parse(localStorage.getItem('unlocked_domains') || '[]');
            setUnlockedDomains(stored);
        };
        fetchUnlocked();
        window.addEventListener('roadmap_unlocked', fetchUnlocked);
        return () => window.removeEventListener('roadmap_unlocked', fetchUnlocked);
    }, []);

    // Dynamic Faculty Data from Synchronized Database
    const facultyMembers = overviewData?.myFaculty || [];

    const techCategories = {
        languages: [
            { name: 'Python', icon: <FaPython />, color: '#3776ab', desc: 'Advanced AI & Automation' },
            { name: 'Java', icon: <FaJava />, color: '#007396', desc: 'Enterprise Distributed Systems' },
            { name: 'Go', icon: <FaCode />, color: '#00add8', desc: 'Cloud-Native Concurrency' },
            { name: 'Rust', icon: <FaTerminal />, color: '#dea584', desc: 'Safe Systems Programming' },
            { name: 'C++', icon: <FaCode />, color: '#00599c', desc: 'System & Game Engineering' },
            { name: 'Swift', icon: <FaCode />, color: '#f05138', desc: 'Modern iOS Ecosystems' }
        ],
        fullstack: [
            { name: 'React', icon: <FaJs />, color: '#61dafb', desc: 'Reactive UI Architectures' },
            { name: 'Node.js', icon: <FaNodeJs />, color: '#339933', desc: 'Scalable Backend Applications' },
            { name: 'DevOps', icon: <FaTerminal />, color: '#2496ed', desc: 'Docker & Kubernetes Infra' },
            { name: 'Cloud', icon: <FaDatabase />, color: '#ff9900', desc: 'AWS & Azure Architectures' },
            { name: 'Modern CSS', icon: <FaCss3Alt />, color: '#1572b6', desc: 'Grid/Flex & Glassmorphism' },
            { name: 'AI Engineering', icon: <FaBrain />, color: '#8e44ad', desc: 'AI Model Deployment' }
        ],
        placement: [
            { name: 'Quantitative Aptitude', icon: <FaBrain />, color: '#f59e0b', desc: 'Number System, Probability, Speed Math' },
            { name: 'Logical Reasoning', icon: <FaBrain />, color: '#8b5cf6', desc: 'Puzzles, Data Interpretation, Logic' },
            { name: 'Company Interviews', icon: <FaUserTie />, color: '#10b981', desc: 'SDE, Analyst, Consultant Roles' },
            { name: 'Resume & HR', icon: <FaFileAlt />, color: '#ec4899', desc: 'Corporate communication & CVs' }
        ]
    };

    const fetchAdvancedMaterials = useCallback(async () => {
        setLoading(true);
        try {
            // Fetching materials filtered by tech name and isAdvanced flag
            const data = await apiGet(`/api/materials?subject=${selectedTech}&isAdvanced=true`);
            setMaterials(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Advanced Data Load Failed:", e);
        } finally {
            setLoading(false);
        }
    }, [selectedTech]);

    useEffect(() => {
        // If preloadedData already contains materials for the default selection, skip fetching.
        if (preloadedData && selectedTech === 'Python' && materials && materials.length > 0) {
            return;
        }
        fetchAdvancedMaterials();
    }, [fetchAdvancedMaterials, preloadedData, selectedTech, materials]);

    const renderResources = (type) => {
        const filtered = materials.filter(m => m.type === type);
        if (filtered.length === 0) {
            return <div className="empty-resource">NO {type.toUpperCase()} FOUND FOR {selectedTech.toUpperCase()}</div>;
        }

        // Use centralized API_BASE

        return (
            <div className="resource-stack">
                {filtered.map((m, i) => {
                    const rawUrl = m.fileUrl || m.url || '#';
                    const finalUrl = (rawUrl.startsWith('http') || rawUrl.startsWith('data:') || rawUrl.startsWith('blob:'))
                        ? rawUrl
                        : `${API_BASE}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;

                    return (
                        <div key={i} className="resource-item">
                            <div className="res-icon">
                                {type === 'videos' ? <FaVideo /> : type === 'interviewQnA' ? <FaQuestionCircle /> : <FaFileAlt />}
                            </div>
                            <div className="res-text">
                                <h4>{m.title}</h4>
                                <span>{m.description || 'Advanced Tutorial'}</span>
                            </div>
                            <div className="res-meta-actions">
                                <button
                                    className="ai-ask-btn-mini"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (openAiWithDoc) openAiWithDoc(m.title, finalUrl, m.videoAnalysis);
                                    }}
                                >
                                    <FaBrain /> ASK AI
                                </button>
                                <div className="res-quick-actions">
                                    <a href={finalUrl} target="_blank" rel="noopener noreferrer" title="View"><FaEye /></a>
                                    <a href={finalUrl} download={m.title} title="Download"><FaSync style={{ transform: 'rotate(180deg)' }} /></a>
                                </div>
                            </div>
                            <FaChevronRight className="arrow" />
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="nexus-advanced-container">
            {/* Cinematic Effects */}
            <div className="nexus-cyber-grid"></div>
            <div className="nexus-scanline"></div>

            {/* Header Area */}
            <div className="nexus-adv-header">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className="nexus-page-subtitle">
                        <FaRocket /> Advanced Learning Track
                    </div>
                    <h1 className="nexus-page-title">
                        LEARNING <span>HUB</span>
                    </h1>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="stat-node"
                >
                    <span className="val">85%</span>
                    <span className="lab">COMPLETION</span>
                </motion.div>
            </div>

            {/* Main Navigation Tabs */}
            <div className="nexus-adv-tabs">
                <button
                    className={`adv-tab ${activeTab === 'languages' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('languages'); setSelectedTech('Python'); }}
                >
                    <FaTerminal /> LANGUAGES
                </button>
                <button
                    className={`adv-tab ${activeTab === 'fullstack' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('fullstack'); setSelectedTech('React'); }}
                >
                    <FaCode /> FULL STACK
                </button>
                <button
                    className={`adv-tab ${activeTab === 'placement' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('placement'); setSelectedTech('Quantitative Aptitude'); }}
                >
                    <FaBrain /> APTITUDE & ROLES
                </button>
                <button
                    className={`adv-tab ${activeTab === 'faculty' ? 'active' : ''}`}
                    onClick={() => setActiveTab('faculty')}
                >
                    <FaUserTie /> FACULTY
                </button>
                <button
                    className={`adv-tab ${activeTab === 'exams' ? 'active' : ''}`}
                    onClick={() => setActiveTab('exams')}
                >
                    <FaShieldAlt /> ASSESSMENTS
                </button>
            </div>

            <div className="nexus-adv-content">
                {(activeTab === 'languages' || activeTab === 'fullstack' || activeTab === 'placement') && (
                    <div className="tech-workstation">
                        {/* Sidebar: Tech Selector */}
                        <div className="tech-selector">
                            {techCategories[activeTab].map(tech => {
                                const isLocked = activeTab === 'languages' && unlockedDomains.length > 0 && !unlockedDomains.some(d => d.toLowerCase().includes(tech.name.toLowerCase()));

                                return (
                                    <div
                                        key={tech.name}
                                        className={`tech-node ${selectedTech === tech.name ? 'active' : ''} ${isLocked ? 'locked-node' : ''}`}
                                        onClick={() => {
                                            if (!isLocked) setSelectedTech(tech.name);
                                        }}
                                        style={{ '--tech-color': isLocked ? '#94a3b8' : tech.color, opacity: isLocked ? 0.6 : 1 }}
                                    >
                                        <div className="tech-icon">{isLocked ? <FaLock /> : tech.icon}</div>
                                        <div className="tech-info">
                                            <h4>{tech.name} {isLocked && <span style={{ fontSize: '0.6rem', color: '#ef4444', marginLeft: '5px' }}>LOCKED</span>}</h4>
                                            <p>{tech.desc}</p>
                                        </div>
                                        {selectedTech === tech.name && <div className="tech-active-bar" style={{ background: tech.color }}></div>}
                                    </div>
                                )
                            })}
                        </div>

                        {/* Main Interaction Pane */}
                        <div className="interaction-pane">
                            <div className="pane-header">
                                <div className="pane-title">
                                    <h2>{selectedTech.toUpperCase()} RESOURCES</h2>
                                    <span>KNOWLEDGE DATABASE CONNECTED</span>
                                </div>
                                {loading && <div className="nexus-loading-ring"></div>}
                            </div>

                            <div className="resource-grid">
                                <div className="resource-column">
                                    <h3 className="col-title"><FaVideo /> VIDEO TUTORIALS</h3>
                                    {renderResources('videos')}
                                </div>
                                <div className="resource-column">
                                    <h3 className="col-title"><FaFileAlt /> ACADEMIC NOTES</h3>
                                    {renderResources('notes')}
                                </div>
                                <div className="resource-column">
                                    <h3 className="col-title"><FaQuestionCircle /> INTERVIEW PREP</h3>
                                    {renderResources('interviewQnA')}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'faculty' && (
                    <div className="faculty-nexus">
                        <div className="faculty-header">
                            <h2 className="mission-commanders-title">Subject Faculty</h2>
                            <p className="mission-commanders-desc">Connect with faculty members assigned to your subject.</p>
                        </div>
                        <div className="f-grid">
                            {facultyMembers.length > 0 ? facultyMembers.map((f, i) => (
                                <div key={i} className="f-card">
                                    <div className="f-avatar"><FaUserTie /></div>
                                    <div className="f-main">
                                        <h3>{f.name}</h3>
                                        <span className="f-subj">{f.subject}</span>
                                        <div className="f-details">
                                            <div className="f-detail"><FaUserTie className="text-primary" /> {f.email}</div>
                                            <div className="f-detail"><FaClock className="text-primary" /> {f.time || 'Office Hours Available'}</div>
                                            <div className="f-detail"><FaCalendarAlt className="text-primary" /> {f.room || 'Department Faculty Hub'}</div>
                                        </div>
                                    </div>
                                    <button className="f-connect">CONTACT</button>
                                </div>
                            )) : (
                                <div className="nexus-empty-journal no-synced-faculty">
                                    <FaUserTie className="no-synced-icon" />
                                    <h3>NO FACULTY ASSIGNED</h3>
                                    <p>Faculty assignment data is currently being updated.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'exams' && (
                    <div className="exam-nexus">
                        {loading ? (
                            <div className="nexus-loading-ring"></div>
                        ) : materials.filter(m => m.type === 'exam' || m.type === 'assignment').length === 0 ? (
                            <div className="nexus-empty-journal">
                                <FaShieldAlt className="no-synced-icon" />
                                <h3>NO ACTIVE ASSESSMENTS</h3>
                                <p>No upcoming exams or assignments found.</p>
                            </div>
                        ) : (
                            <>
                                {materials.filter(m => m.type === 'exam').sort((a, b) => new Date(a.date) - new Date(b.date))[0] && (
                                    <div className="exam-status-banner">
                                        <FaShieldAlt /> NEXT UPCOMING EXAM: {materials.filter(m => m.type === 'exam').sort((a, b) => new Date(a.date) - new Date(b.date))[0].title.toUpperCase()}
                                    </div>
                                )}
                                <div className="exam-grid">
                                    {materials.filter(m => m.type === 'exam' || m.type === 'assignment').map((exam, idx) => (
                                        <div key={idx} className="exam-card">
                                            <h3>{exam.title}</h3>
                                            <p>{exam.subject} - {exam.desc || 'Scheduled Assessment'}</p>
                                            <div className="exam-meta">
                                                <span>TIME: {exam.duration || '60m'}</span>
                                                <span>TYPE: {exam.mode || 'THEORY'}</span>
                                            </div>
                                            <div className="exam-meta" style={{ marginTop: '0.5rem', color: '#64748b' }}>
                                                <FaCalendarAlt /> {new Date(exam.date || Date.now()).toLocaleDateString()}
                                            </div>
                                            <button className="exam-btn" onClick={() => window.open(exam.link || '#', '_blank')}>START TEST</button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdvancedLearning;
