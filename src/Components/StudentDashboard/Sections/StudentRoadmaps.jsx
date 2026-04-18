import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaRoad, FaCode, FaLaptopCode, FaJava, FaPython, FaServer, FaCheckCircle, FaSpinner,
    FaChevronRight, FaArrowLeft, FaTrophy, FaSearch, FaFilter, FaLayerGroup, FaLink, FaExternalLinkAlt, FaBookOpen
} from 'react-icons/fa';
import { apiGet, apiPost } from '../../../utils/apiClient';
import './StudentRoadmaps.css';

const StudentRoadmaps = ({ studentData, preloadedData }) => {
    const [roadmaps, setRoadmaps] = useState(preloadedData || []);
    const [loading, setLoading] = useState(!preloadedData);
    const [selectedRoadmap, setSelectedRoadmap] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [completedTopics, setCompletedTopics] = useState(studentData?.roadmapProgress || {});

    const fetchRoadmaps = useCallback(async () => {
        try {
            setLoading(true);
            const res = await apiGet('/api/roadmaps');
            let maps = Array.isArray(res) ? res : (res?.data || []);

            if (maps.length === 0) {
                // Seed some defaults if DB is empty
                maps = [
                    {
                        _id: 'dsa_core', title: 'Data Structures & Algorithms', slug: 'dsa', category: 'Algorithms',
                        description: 'Master DSA logically with visual patterns and complexity analysis.', icon: 'FaCode', color: '#f59e0b',
                        levels: [
                            { title: 'Basics: Arrays & Strings', description: 'Master the fundamentals', topics: ['Time Complexity', 'Arrays', 'Strings', 'Sliding Window'] },
                            { title: 'Sorting & Searching', description: 'Advanced search patterns', topics: ['Binary Search', 'Quick Sort', 'Merge Sort'] }
                        ]
                    },
                    {
                        _id: 'fullstack_web', title: 'Modern Fullstack Web', slug: 'web', category: 'Web Dev',
                        description: 'Build industrial scale apps with React, Node, and Cloud patterns.', icon: 'FaLaptopCode', color: '#6366f1',
                        levels: [
                            { title: 'Frontend Basics', description: 'HTML, CSS and JavaScript', topics: ['Modern CSS', 'ES6+', 'DOM Manipulation'] },
                            { title: 'React Mastery', description: 'Hooks and State Management', topics: ['React Hooks', 'Context API', 'Performance'] }
                        ]
                    }
                ];
            }
            setRoadmaps(maps);
        } catch (err) {
            console.error('Failed to fetch roadmaps:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!preloadedData) fetchRoadmaps();
    }, [preloadedData, fetchRoadmaps]);

    const toggleTopic = async (roadmapSlug, topicName) => {
        const prevTopics = { ...completedTopics };
        const roadmapProgress = prevTopics[roadmapSlug] || [];
        const isCompleted = roadmapProgress.includes(topicName);

        const newProgress = isCompleted
            ? roadmapProgress.filter(t => t !== topicName)
            : [...roadmapProgress, topicName];

        const newState = { ...prevTopics, [roadmapSlug]: newProgress };
        setCompletedTopics(newState);

        try {
            const sid = studentData?.sid || localStorage.getItem('user_id');
            if (sid) {
                await apiPost('/api/students/update-roadmap', {
                    sid,
                    roadmapSlug,
                    completedTopics: newProgress
                });
            }
        } catch (err) {
            console.error('Failed to save progress:', err);
            setCompletedTopics(prevTopics);
        }
    };

    const getIcon = (iconName) => {
        const icons = { FaPython, FaJava, FaServer, FaLaptopCode, FaRoad, FaReact: FaCode, FaCode };
        const IconComp = icons[iconName] || FaCode;
        return <IconComp />;
    };

    const filteredRoadmaps = roadmaps.filter(map => {
        const matchesSearch = map.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            map.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'All' || map.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ['All', ...new Set(roadmaps.map(m => m.category || 'General'))];

    if (loading) return <div className="nexus-loading-center"><FaSpinner className="fa-spin" /><p>Orchestrating Learning Paths...</p></div>;

    if (!selectedRoadmap) {
        return (
            <div className="roadmaps-container">
                <div className="roadmaps-header">
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--v-text-main)' }}>LEARNING <span>ROADMAPS</span></h2>
                    <p style={{ color: 'var(--v-text-dim)', fontWeight: 600 }}>Master technologies with industry-verified curricula</p>
                </div>

                <div className="filters-container">
                    <div className="search-wrapper">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            className="roadmap-search-input"
                            placeholder="Identify your next skill (e.g. React, Python, DSA)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="categories-scroll">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="roadmap-grid">
                    {filteredRoadmaps.map((map, idx) => {
                        const slug = map.slug || map._id;
                        const progress = completedTopics[slug]?.length || 0;
                        const totalTopics = map.levels?.reduce((acc, l) => acc + (l.topics?.length || 0), 0) || 1;
                        const percent = Math.round((progress / totalTopics) * 100);

                        return (
                            <motion.div
                                key={map._id || `map-${idx}`}
                                className="roadmap-card premium-hover-effect"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => setSelectedRoadmap(map)}
                            >
                                <div className="card-glass-glow" style={{ background: map.color || 'var(--v-primary)' }} />
                                <div className="roadmap-category-badge">{map.category || 'General'}</div>
                                <div className="roadmap-icon-box" style={{ color: map.color || 'var(--v-primary)' }}>
                                    {getIcon(map.icon)}
                                </div>
                                <h3>{map.title}</h3>
                                <p className="roadmap-desc">{map.description}</p>

                                <div className="roadmap-meta">
                                    <div className="level-count">{map.levels?.length || 0} Levels • {percent}% Done</div>
                                    <div className="arrow-circle"><FaChevronRight /></div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        );
    }

    const mapSlug = selectedRoadmap.slug || selectedRoadmap._id;
    const progress = completedTopics[mapSlug]?.length || 0;
    const totalTopics = selectedRoadmap.levels?.reduce((acc, l) => acc + (l.topics?.length || 0), 0) || 1;
    const percent = Math.round((progress / totalTopics) * 100);

    return (
        <div className="roadmaps-container">
            <div className="detail-header">
                <button className="back-btn" onClick={() => setSelectedRoadmap(null)}><FaArrowLeft /></button>
                <div className="header-content">
                    <div className="header-top">
                        <h2>{selectedRoadmap.title}</h2>
                        <div className="progress-stat">{percent}% Completed</div>
                    </div>
                    <div className="progress-track">
                        <motion.div
                            className="progress-bar"
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            style={{ background: selectedRoadmap.color || 'var(--v-primary)' }}
                        />
                    </div>
                </div>
            </div>

            <div className="detail-layout">
                <aside className="info-sidebar">
                    <div className="roadmap-info-card" style={{ background: selectedRoadmap.color || 'var(--v-primary)' }}>
                        <div className="info-icon-large">{getIcon(selectedRoadmap.icon)}</div>
                        <p style={{ fontWeight: 600, opacity: 0.9 }}>{selectedRoadmap.description}</p>
                        <div className="info-rank-box">
                            <FaTrophy fontSize="1.5rem" />
                            <div className="rank-text">
                                <span className="rank-label">Rank Status</span>
                                <div className="rank-value">{percent === 100 ? 'LEGENDARY' : percent > 50 ? 'MASTER' : 'INITIATE'}</div>
                            </div>
                        </div>
                    </div>
                </aside>

                <div className="timeline-column">
                    {selectedRoadmap.levels?.map((level, lIdx) => (
                        <div key={level.title ? `${level.title}-${lIdx}` : lIdx} className="level-card active">
                            <div className="level-connector" />
                            <div className="level-header">
                                <div>
                                    <span className="phase-tag">PHASE 0{lIdx + 1}</span>
                                    <h3 className="level-title">{level.title}</h3>
                                    <p className="level-desc">{level.description}</p>
                                </div>
                                <div className="level-badge"><FaBookOpen /></div>
                            </div>
                            <div className="topics-grid">
                                {level.topics?.map((topic, tIdx) => {
                                    const isDone = (completedTopics[mapSlug] || []).includes(topic);
                                    return (
                                        <div
                                            key={`${topic}-${tIdx}`}
                                            className={`topic-item ${isDone ? 'done' : ''}`}
                                            onClick={() => toggleTopic(mapSlug, topic)}
                                        >
                                            <div className="topic-check">
                                                {isDone && <FaCheckCircle size={14} />}
                                            </div>
                                            <span className="topic-label">{topic}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StudentRoadmaps;
