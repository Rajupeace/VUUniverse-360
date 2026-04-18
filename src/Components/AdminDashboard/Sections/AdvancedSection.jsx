import React from 'react';
import { FaPlus, FaEye, FaMicrochip, FaCogs, FaProjectDiagram, FaGlobe } from 'react-icons/fa';
import { motion } from 'framer-motion';

/**
 * Advanced Studies (Specializations)
 * Manage specialized advanced topics and materials.
 */
const AdvancedSection = ({ topics, materials, openModal }) => {
    const containerVar = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVar = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } }
    };

    const getTopicIcon = (topic) => {
        if (topic.includes('AI') || topic.includes('Machine')) return <FaMicrochip />;
        if (topic.includes('Web') || topic.includes('Cloud')) return <FaGlobe />;
        if (topic.includes('Logic') || topic.includes('Design')) return <FaCogs />;
        return <FaProjectDiagram />;
    };

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={containerVar}
            className="nexus-hub-viewport"
        >
            <motion.header variants={itemVar} className="admin-page-header" style={{ marginBottom: '3rem' }}>
                <div className="admin-page-title">
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--admin-secondary)', letterSpacing: '-1.5px' }}>
                        ADVANCED <span style={{ color: 'var(--admin-primary)' }}>SPECIALIZATIONS</span>
                    </h1>
                    <p style={{ fontWeight: 850, color: 'var(--admin-text-muted)' }}>Curated modules for high-level technical expertise.</p>
                </div>
                <div className="admin-action-bar" style={{ margin: 0 }}>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="admin-btn admin-btn-primary"
                        onClick={() => openModal('material', { isAdvanced: true })}
                        style={{ height: '48px', padding: '0 1.5rem', borderRadius: '12px' }}
                    >
                        <FaPlus /> DEPLOY MATERIAL
                    </motion.button>
                </div>
            </motion.header>

            <motion.div variants={containerVar} className="admin-grid">
                {topics.map(topic => {
                    const count = materials.filter(m => m.subject === topic).length;
                    return (
                        <motion.div
                            variants={itemVar}
                            whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
                            key={topic}
                            className="admin-summary-card"
                            style={{
                                padding: '2rem',
                                border: '1px solid var(--admin-border)',
                                borderRadius: '24px',
                                background: 'white',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: '-20px',
                                right: '-20px',
                                fontSize: '100px',
                                color: 'rgba(0,0,0,0.02)',
                                pointerEvents: 'none'
                            }}>
                                {getTopicIcon(topic)}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                    <div className="summary-icon-box" style={{
                                        background: 'rgba(79, 70, 229, 0.08)',
                                        color: 'var(--admin-primary)',
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '14px',
                                        fontSize: '1.4rem'
                                    }}>
                                        {getTopicIcon(topic)}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, color: 'var(--admin-secondary)', fontSize: '1.25rem', fontWeight: 950, letterSpacing: '-0.5px' }}>{topic}</h3>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase' }}>Tier 3 Specialization</div>
                                    </div>
                                </div>
                                <span className={`admin-badge ${count > 0 ? 'primary' : 'secondary'}`} style={{ fontWeight: 950, fontSize: '0.65rem' }}>
                                    {count} MODULES
                                </span>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden', marginBottom: '8px' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(count * 20, 100)}%` }}
                                        style={{ height: '100%', background: 'var(--admin-primary)', borderRadius: '10px' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 850, color: 'var(--admin-text-muted)' }}>
                                    <span>CAPACITY</span>
                                    <span>{Math.min(count * 20, 100)}%</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    className="admin-btn admin-btn-outline"
                                    style={{ flex: 1, borderRadius: '12px', fontWeight: 950 }}
                                    onClick={() => openModal('syllabus-view', { name: topic, isAdvanced: true })}
                                >
                                    <FaEye /> ANALYZE
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    className="admin-btn admin-btn-primary"
                                    style={{ flex: 1, borderRadius: '12px', fontWeight: 950 }}
                                    onClick={() => openModal('material', { subject: topic, isAdvanced: true })}
                                >
                                    <FaPlus /> EXPAND
                                </motion.button>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>
        </motion.div>
    );
};

export default AdvancedSection;
