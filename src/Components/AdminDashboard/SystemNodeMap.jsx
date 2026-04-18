import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaDatabase, FaUsers, FaChalkboardTeacher, FaFileUpload, FaServer, FaShieldAlt } from 'react-icons/fa';

/**
 * System Node Map
 * A interactive visual representation of system infrastructure and entity status.
 */
const SystemNodeMap = ({ studentsCount = 0, facultyCount = 0, materialsCount = 0, status = 'OPERATIONAL' }) => {
    // Define nodes
    const nodes = useMemo(() => [
        { id: 'core', label: 'Vu UniVerse360 CORE', icon: <FaServer />, x: 0, y: 0, size: 90, color: '#6366f1' },
        { id: 'db', label: 'DATALAKE', icon: <FaDatabase />, x: -160, y: -80, size: 75, color: '#10b981' },
        { id: 'students', label: `USER NODES (${studentsCount})`, icon: <FaUsers />, x: 180, y: -70, size: 75, color: '#0ea5e9' },
        { id: 'faculty', label: `OPS NODES (${facultyCount})`, icon: <FaChalkboardTeacher />, x: 150, y: 120, size: 75, color: '#8b5cf6' },
        { id: 'storage', label: `ASSET VAULT (${materialsCount})`, icon: <FaFileUpload />, x: -170, y: 90, size: 70, color: '#f59e0b' },
        { id: 'security', label: 'FIREWALL', icon: <FaShieldAlt />, x: 0, y: -170, size: 65, color: '#f43f5e' },
    ], [studentsCount, facultyCount, materialsCount]);

    // Define connections
    const connections = [
        { from: 'core', to: 'db' },
        { from: 'core', to: 'students' },
        { from: 'core', to: 'faculty' },
        { from: 'core', to: 'storage' },
        { from: 'core', to: 'security' },
        { from: 'students', to: 'db' },
        { from: 'faculty', to: 'db' }
    ];

    return (
        <div className="node-map-container" style={{
            height: '500px',
            width: '100%',
            background: 'white',
            borderRadius: '40px',
            border: '1px solid #f1f5f9',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '3rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.03)'
        }}>
            {/* Ambient Background Glows */}
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(40px)' }}></div>
            <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(40px)' }}></div>

            {/* Grid Pattern Background */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'radial-gradient(circle, #e2e8f0 1.2px, transparent 1.2px)',
                backgroundSize: '48px 48px',
                opacity: 0.4
            }} />

            <div style={{ position: 'relative', width: '700px', height: '500px' }}>
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                    {connections.map((conn, idx) => {
                        const from = nodes.find(n => n.id === conn.from);
                        const to = nodes.find(n => n.id === conn.to);
                        if (!from || !to) return null;

                        const fx = 350 + from.x;
                        const fy = 250 + from.y;
                        const tx = 350 + to.x;
                        const ty = 250 + to.y;

                        return (
                            <React.Fragment key={idx}>
                                <motion.path
                                    d={`M ${fx} ${fy} Q ${(fx + tx) / 2} ${(fy + ty) / 2 + 20}, ${tx} ${ty}`}
                                    stroke="#e2e8f0"
                                    strokeWidth="2"
                                    fill="none"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 2, delay: idx * 0.1 }}
                                />
                                <motion.circle
                                    r="3"
                                    fill={from.color}
                                    initial={{ offsetDistance: "0%" }}
                                    animate={{
                                        offsetDistance: ["0%", "100%"],
                                        opacity: [0, 1, 0]
                                    }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        delay: idx * 0.8,
                                        ease: "linear"
                                    }}
                                    style={{
                                        offsetPath: `path('M ${fx} ${fy} Q ${(fx + tx) / 2} ${(fy + ty) / 2 + 20}, ${tx} ${ty}')`,
                                        boxShadow: `0 0 10px ${from.color}`
                                    }}
                                />
                            </React.Fragment>
                        );
                    })}
                </svg>

                {nodes.map((node, idx) => (
                    <motion.div
                        key={node.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                            type: 'spring',
                            stiffness: 200,
                            damping: 18,
                            delay: idx * 0.1
                        }}
                        style={{
                            position: 'absolute',
                            left: `calc(50% + ${node.x}px - ${node.size / 2}px)`,
                            top: `calc(50% + ${node.y}px - ${node.size / 2}px)`,
                            width: `${node.size}px`,
                            height: `${node.size}px`,
                            borderRadius: node.id === 'core' ? '32px' : '28px',
                            background: 'white',
                            border: `1px solid #f1f5f9`,
                            boxShadow: `0 12px 30px rgba(0,0,0,0.04)`,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            zIndex: 10,
                            overflow: 'hidden'
                        }}
                        whileHover={{
                            scale: 1.08,
                            boxShadow: `0 20px 40px ${node.color}15`,
                            borderColor: node.color,
                            y: -8
                        }}
                    >
                        {/* Internal Glow */}
                        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at top left, ${node.color}08, transparent 70%)` }}></div>

                        <motion.div
                            animate={{ y: [0, -3, 0] }}
                            transition={{ duration: 2.5, repeat: Infinity, delay: idx * 0.2 }}
                            style={{ color: node.color, fontSize: `${node.size * 0.38}px`, display: 'flex', zIndex: 1 }}
                        >
                            {node.icon}
                        </motion.div>
                        <div style={{
                            fontSize: '0.65rem',
                            fontWeight: 950,
                            color: '#1e293b',
                            marginTop: '8px',
                            textAlign: 'center',
                            whiteSpace: 'nowrap',
                            zIndex: 1,
                            letterSpacing: '0.5px'
                        }}>
                            {node.label}
                        </div>

                        {node.id === 'core' && (
                            <motion.div
                                animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0, 0.1] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    borderRadius: '32px',
                                    background: node.color,
                                    pointerEvents: 'none'
                                }}
                            />
                        )}
                    </motion.div>
                ))}
            </div>

            <div style={{ position: 'absolute', top: '2rem', right: '2.5rem', display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '10px 18px', borderRadius: '100px', border: '1px solid #e2e8f0' }}>
                <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 12px #10b981' }}
                ></motion.div>
                <span style={{ fontSize: '0.75rem', fontWeight: 950, color: '#64748b', letterSpacing: '1px' }}>SYSTEM: {status}</span>
            </div>
        </div>
    );
};

export default SystemNodeMap;
