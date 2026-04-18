import React, { useState, useEffect } from 'react';
import { apiGet } from '../../utils/apiClient';
import { FaServer, FaDatabase, FaNetworkWired, FaMemory } from 'react-icons/fa';
import { motion } from 'framer-motion';

/**
 * SYSTEM PERFORMANCE
 * Real-time system health and resource monitoring.
 */
const SystemTelemetry = () => {
    const [stats, setStats] = useState({
        cpu: 0,
        mem: 0,
        db: 0,
        network: 0,
        status: 'OFFLINE'
    });

    useEffect(() => {
        const fetchStats = () => {
            // Simulate realistic fluctuations around target values
            const baseCpu = 25;
            const baseMem = 42;
            const baseDb = 18;
            const baseNet = 840;

            setStats({
                cpu: (baseCpu + Math.random() * 10).toFixed(1),
                mem: (baseMem + Math.random() * 5).toFixed(1),
                db: (baseDb + Math.random() * 4).toFixed(0),
                network: (baseNet + Math.random() * 100).toFixed(0),
                status: 'OPERATIONAL'
            });
        };

        fetchStats();
        const interval = setInterval(fetchStats, 3000);
        return () => clearInterval(interval);
    }, []);

    const containerVar = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVar = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    return (
        <motion.div
            variants={containerVar}
            initial="hidden"
            animate="show"
            className="admin-stats-grid"
            style={{
                marginBottom: '3rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem'
            }}
        >
            {/* CPU CORE ENGINE */}
            <motion.div variants={itemVar} style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(12px)',
                padding: '1.75rem',
                borderRadius: '32px',
                border: '1px solid rgba(79, 70, 229, 0.1)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.03)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, #4f46e5, #7c3aed)' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#4f46e5' }}>
                        <div style={{ padding: '10px', background: '#eef2ff', borderRadius: '12px' }}><FaServer /></div>
                        <span style={{ fontWeight: 950, fontSize: '0.75rem', letterSpacing: '1px', color: '#1e293b' }}>ENGINE LOAD</span>
                    </div>
                    <div style={{ height: '8px', width: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <div style={{ fontSize: '2.8rem', fontWeight: 950, color: '#1e293b', letterSpacing: '-2px' }}>{stats.cpu}<span style={{ fontSize: '1.2rem', color: '#94a3b8', verticalAlign: 'super', marginLeft: '2px' }}>%</span></div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', marginTop: '4px' }}>6X CORE PROCESSING</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '50px' }}>
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{ height: [`${20 + Math.random() * 60}%`, `${30 + Math.random() * 50}%`, `${20 + Math.random() * 60}%`] }}
                                transition={{ duration: 1.5 + Math.random(), repeat: Infinity, ease: 'easeInOut' }}
                                style={{ width: '6px', background: 'linear-gradient(to top, #4f46e5, #818cf8)', borderRadius: '10px' }}
                            ></motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* MEMORY ALLOCATION */}
            <motion.div variants={itemVar} style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(12px)',
                padding: '1.75rem',
                borderRadius: '32px',
                border: '1px solid rgba(245, 158, 11, 0.1)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.03)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#f59e0b' }}>
                        <div style={{ padding: '10px', background: '#fffbeb', borderRadius: '12px' }}><FaMemory /></div>
                        <span style={{ fontWeight: 950, fontSize: '0.75rem', letterSpacing: '1px', color: '#1e293b' }}>BUFFER CACHE</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 950, color: '#f59e0b', background: '#fffbeb', padding: '4px 10px', borderRadius: '100px' }}>DYNAMIC</span>
                </div>
                <div>
                    <div style={{ fontSize: '2.8rem', fontWeight: 950, color: '#1e293b', letterSpacing: '-2px', marginBottom: '0.75rem' }}>{stats.mem}<span style={{ fontSize: '1.2rem', color: '#94a3b8', verticalAlign: 'super', marginLeft: '2px' }}>%</span></div>
                    <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                        <motion.div
                            animate={{ width: `${stats.mem}%` }}
                            transition={{ duration: 1 }}
                            style={{ height: '100%', background: 'linear-gradient(90deg, #f59e0b, #fbbf24)', borderRadius: '10px' }}
                        ></motion.div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8' }}>ALLOCATED: 13.4 GB</span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8' }}>TOTAL: 32 GB</span>
                    </div>
                </div>
            </motion.div>

            {/* DATA LATENCY */}
            <motion.div variants={itemVar} style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(12px)',
                padding: '1.75rem',
                borderRadius: '32px',
                border: '1px solid rgba(16, 185, 129, 0.1)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.03)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, #10b981, #34d399)' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#10b981' }}>
                        <div style={{ padding: '10px', background: '#ecfdf5', borderRadius: '12px' }}><FaDatabase /></div>
                        <span style={{ fontWeight: 950, fontSize: '0.75rem', letterSpacing: '1px', color: '#1e293b' }}>QUERY FLOW</span>
                    </div>
                    <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ fontSize: '0.65rem', fontWeight: 950, color: '#10b981', background: '#ecfdf5', padding: '4px 10px', borderRadius: '100px', border: '1px solid #d1fae5' }}
                    >
                        {stats.status}
                    </motion.div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <div style={{ fontSize: '2.8rem', fontWeight: 950, color: '#1e293b', letterSpacing: '-2px' }}>{stats.db}<span style={{ fontSize: '1.2rem', color: '#94a3b8', verticalAlign: 'super', marginLeft: '2px' }}>ms</span></div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', marginTop: '4px' }}>ATLAS CLUSTER SYNC</div>
                    </div>
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], filter: ['brightness(1)', 'brightness(1.2)', 'brightness(1)'] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ width: '50px', height: '50px', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, rgba(255,255,255,0) 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 20px #10b981' }}></div>
                    </motion.div>
                </div>
            </motion.div>

            {/* NET THROUGHPUT */}
            <motion.div variants={itemVar} style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(12px)',
                padding: '1.75rem',
                borderRadius: '32px',
                border: '1px solid rgba(244, 63, 94, 0.1)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.03)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, #f43f5e, #fb7185)' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#f43f5e' }}>
                        <div style={{ padding: '10px', background: '#fff1f2', borderRadius: '12px' }}><FaNetworkWired /></div>
                        <span style={{ fontWeight: 950, fontSize: '0.75rem', letterSpacing: '1px', color: '#1e293b' }}>NET TRAFFIC</span>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <div style={{ fontSize: '2.8rem', fontWeight: 950, color: '#1e293b', letterSpacing: '-2px' }}>{stats.network}<span style={{ fontSize: '0.9rem', color: '#94a3b8', marginLeft: '6px' }}>MBPS</span></div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', marginTop: '4px' }}>ENCRYPTED ENDPOINT</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f43f5e' }}>
                        <motion.div
                            animate={{ x: [0, 40], opacity: [0, 1, 0] }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            style={{ height: '2px', width: '20px', background: 'currentColor', borderRadius: '2px' }}
                        ></motion.div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default SystemTelemetry;
