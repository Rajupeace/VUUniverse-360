import React from 'react';
import { motion } from 'framer-motion';
import { FaBolt, FaTrophy } from 'react-icons/fa';
import './SkillsRadar.css';

const SkillsRadar = ({ studentData }) => {
    // Dynamically derive skills from student performance data if available
    const stats = studentData?.stats || {};

    const skills = [
        { name: 'Algorithms', value: stats.algorithms || 85 },
        { name: 'Sys Design', value: stats.systemDesign || 70 },
        { name: 'AI/ML', value: stats.ai || 92 },
        { name: 'Web Dev', value: stats.webDev || 78 },
        { name: 'Soft Skills', value: stats.communication || 65 },
        { name: 'Cloud', value: stats.cloud || 80 }
    ];

    const numPoints = skills.length;
    const radius = 100;
    const centerX = 150;
    const centerY = 150;
    const angleStep = (Math.PI * 2) / numPoints;

    const getCoordinates = (value, index) => {
        const angle = index * angleStep - Math.PI / 2; // Start from top
        const r = (value / 100) * radius;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        return [x, y];
    };

    const points = skills.map((s, i) => getCoordinates(s.value, i).join(',')).join(' ');
    // Points at 0 for animation start
    const startPoints = skills.map((s, i) => getCoordinates(0, i).join(',')).join(' ');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="radar-card"
        >
            <div className="radar-header">
                <h3>
                    <FaBolt style={{ color: '#f59e0b', marginRight: '8px' }} />
                    <span style={{ color: '#4f46e5' }}>SKILL</span> BOOST
                </h3>
                <span className="pro-badge"><FaTrophy className="mr-1 inline" /> ELITE</span>
            </div>

            <div className="radar-body" style={{ width: '100%', display: 'flex', justifyItems: 'center', justifyContent: 'center' }}>
                <svg width="100%" height="100%" viewBox="0 0 300 300" style={{ maxWidth: '250px', maxHeight: '250px', overflow: 'visible' }}>
                    {/* Background Grid */}
                    {[20, 40, 60, 80, 100].map((level, j) => {
                        const gridPoints = skills.map((_, i) => {
                            const angle = i * angleStep - Math.PI / 2;
                            const r = (level / 100) * radius;
                            return `${centerX + Math.cos(angle) * r},${centerY + Math.sin(angle) * r}`;
                        }).join(' ');
                        return (
                            <polygon
                                key={j}
                                points={gridPoints}
                                fill={j % 2 === 0 ? "rgba(241, 245, 249, 0.4)" : "none"}
                                stroke={j === 4 ? "#cbd5e1" : "#e2e8f0"}
                                strokeWidth={j === 4 ? "2" : "1"}
                                strokeDasharray={j === 4 ? "0" : "4 4"}
                            />
                        );
                    })}

                    {/* Axes */}
                    {skills.map((s, i) => {
                        const [x, y] = getCoordinates(100, i);
                        return <line key={`axis-${i}`} x1={centerX} y1={centerY} x2={x} y2={y} stroke="#e2e8f0" strokeWidth="1" />;
                    })}

                    {/* Data Polygon with Animation */}
                    <motion.polygon
                        initial={{ points: startPoints }}
                        animate={{ points: points }}
                        transition={{ duration: 1.5, type: 'spring', bounce: 0.4 }}
                        fill="rgba(79, 70, 229, 0.25)"
                        stroke="#4f46e5"
                        strokeWidth="3"
                        style={{ filter: 'drop-shadow(0 0 10px rgba(79, 70, 229, 0.3))' }}
                    />

                    {/* Points with Animation */}
                    {skills.map((s, i) => {
                        const [x, y] = getCoordinates(s.value, i);
                        return (
                            <motion.circle
                                key={`point-${i}`}
                                initial={{ cx: centerX, cy: centerY, opacity: 0 }}
                                animate={{ cx: x, cy: y, opacity: 1 }}
                                transition={{ duration: 1.5, type: 'spring', bounce: 0.4, delay: 0.1 }}
                                r="5"
                                fill="white"
                                stroke="#4f46e5"
                                strokeWidth="2"
                                className="radar-point hover-expand"
                            >
                                <title>{s.name}: {s.value}%</title>
                            </motion.circle>
                        );
                    })}

                    {/* Labels */}
                    {skills.map((s, i) => {
                        const angle = i * angleStep - Math.PI / 2;
                        const labelR = radius + 25;
                        const x = centerX + Math.cos(angle) * labelR;
                        const y = centerY + Math.sin(angle) * labelR;

                        return (
                            <foreignObject key={`label-${i}`} x={x - 40} y={y - 12} width="80" height="24">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1 }}
                                    className="radar-label"
                                    style={{ textAlign: 'center', fontSize: '10px', fontWeight: '800', color: '#475569', letterSpacing: '0.05em', textTransform: 'uppercase' }}
                                >
                                    {s.name}
                                </motion.div>
                            </foreignObject>
                        );
                    })}
                </svg>
            </div>

            <div className="radar-footer">
                <div className="skill-stat">
                    <span className="val" style={{ color: '#10b981' }}>Top 5%</span>
                    <span className="lbl">COHORT RANK</span>
                </div>
                <div className="skill-stat">
                    <span className="val" style={{ color: '#f59e0b' }}>A+</span>
                    <span className="lbl">READINESS</span>
                </div>
            </div>
        </motion.div>
    );
};

export default SkillsRadar;
