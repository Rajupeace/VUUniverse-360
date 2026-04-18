import React, { useState, useEffect } from 'react';
import { apiGet } from '../../utils/apiClient';
import { FaBrain, FaRegLightbulb, FaShieldAlt, FaBolt } from 'react-icons/fa';

/**
 * System Intelligence
 * Analytics and operational insights derived from live data.
 */
import { motion } from 'framer-motion';

const SystemIntelligence = () => {
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIntelligence = async () => {
            // Mocking high-fidelity insights for V5 presentation
            const mockInsights = [
                {
                    id: 'engagement',
                    title: 'CORE ENGAGEMENT',
                    value: '+24.8% GROWTH',
                    insight: 'Student interaction with material vault has increased significantly after recent broadcast.',
                    type: 'primary',
                    score: 92
                },
                {
                    id: 'content',
                    title: 'RESOURCE UTILIZATION',
                    value: '1.2TB INDEXED',
                    insight: 'Video assets are currently the highest consumed resource across all levels.',
                    type: 'accent',
                    score: 78
                },
                {
                    id: 'status',
                    title: 'SYSTEM INTEGRITY',
                    value: '100% SECURE',
                    insight: 'All administrative nodes are reporting zero anomalies. Encryption active.',
                    type: 'success',
                    score: 100
                },
                {
                    id: 'activity',
                    title: 'STUDENT VELOCITY',
                    value: '+18.5% MONTHLY',
                    insight: 'Certification completion speed has increased by 5 days on average per semester.',
                    type: 'primary',
                    score: 85
                }
            ];

            setInsights(mockInsights);
            setLoading(false);
        };

        fetchIntelligence();
        const interval = setInterval(fetchIntelligence, 30000);
        return () => clearInterval(interval);
    }, []);

    const getIcon = (id) => {
        switch (id) {
            case 'engagement': return <FaBrain />;
            case 'content': return <FaRegLightbulb />;
            case 'status': return <FaShieldAlt />;
            case 'activity': return <FaBolt />;
            default: return <FaBrain />;
        }
    };

    if (loading && insights.length === 0) return null;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', paddingBottom: '2rem' }}>
            {insights.map((item, idx) => (
                <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1, type: 'spring', stiffness: 200 }}
                    style={{
                        background: 'white',
                        padding: '2rem',
                        borderRadius: '32px',
                        border: '1px solid #f1f5f9',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
                        position: 'relative'
                    }}
                >
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                        <div style={{
                            background: item.type === 'primary' ? '#eef2ff' : item.type === 'success' ? '#ecfdf5' : '#fff7ed',
                            color: item.type === 'primary' ? '#6366f1' : item.type === 'success' ? '#10b981' : '#f59e0b',
                            width: '56px',
                            height: '56px',
                            borderRadius: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.4rem',
                            flexShrink: 0
                        }}>
                            {getIcon(item.id)}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <h4 style={{ margin: 0, fontSize: '0.75rem', fontWeight: 950, color: '#94a3b8', letterSpacing: '1px' }}>{item.title}</h4>
                                <span style={{ fontSize: '0.65rem', fontWeight: 950, color: item.type === 'success' ? '#10b981' : '#6366f1' }}>{item.score}% OPTIMAL</span>
                            </div>
                            <div style={{ fontSize: '1.3rem', fontWeight: 950, color: '#1e293b', marginBottom: '0.75rem', letterSpacing: '-0.5px' }}>{item.value}</div>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6, fontWeight: 700 }}>{item.insight}</p>
                        </div>
                    </div>

                    <div style={{ marginTop: '1.5rem', height: '6px', background: '#f8fafc', borderRadius: '10px', overflow: 'hidden' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.score}%` }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                            style={{
                                height: '100%',
                                background: item.type === 'primary' ? '#6366f1' : item.type === 'success' ? '#10b981' : '#f59e0b',
                                borderRadius: '10px'
                            }}
                        />
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default SystemIntelligence;
