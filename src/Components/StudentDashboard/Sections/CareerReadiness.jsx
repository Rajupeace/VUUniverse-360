import React from 'react';
import { motion } from 'framer-motion';
import { FaRocket, FaShieldAlt, FaBriefcase, FaGraduationCap, FaChartLine } from 'react-icons/fa';
import './CareerReadiness.css';

/**
 * CAREER READINESS WIDGET
 */
const CareerReadiness = ({ score = 0, academics = {}, attendance = {}, roadmapCount = 0 }) => {

    const getStatus = (val) => {
        if (val >= 85) return { label: 'ELITE CANDIDATE', color: '#10b981', desc: 'Ready for top-tier Tech Giants (Apple, Google).' };
        if (val >= 70) return { label: 'STRATEGIC READY', color: '#6366f1', desc: 'Securely placed for MNCs and Startups.' };
        if (val >= 50) return { label: 'EVOLVING', color: '#f59e0b', desc: 'Focus on Roadmaps to boost your score.' };
        return { label: 'POTENTIAL', color: '#ef4444', desc: 'Establish a study routine to improve standby.' };
    };

    const status = getStatus(score);

    return (
        <div className="cr-container animate-fade-in">
            <div className="cr-header">
                <div>
                    <h3>CAREER <span>READINESS</span></h3>
                    <p className="subtitle">Real-time market fit analysis</p>
                </div>
                <div className="cr-status-badge" style={{ background: `${status.color}15`, border: `1px solid ${status.color}30` }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 950, color: status.color, letterSpacing: '1px' }}>{status.label}</span>
                </div>
            </div>

            <div className="cr-main">
                <div className="cr-score-ring">
                    <svg width="180" height="180" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                        <motion.circle
                            cx="50" cy="50" r="45" fill="none"
                            stroke={status.color} strokeWidth="8"
                            strokeDasharray="282.6"
                            initial={{ strokeDashoffset: 282.6 }}
                            animate={{ strokeDashoffset: 282.6 - (282.6 * score) / 100 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="cr-score-value">
                        <div className="val">{score}</div>
                        <div className="lab">POINTS</div>
                    </div>
                </div>

                <div className="cr-breakdown">
                    <div className="cr-item">
                        <div className="cr-item-header">
                            <span className="cr-item-label">
                                <FaShieldAlt style={{ color: '#10b981' }} /> Attendance Weight
                            </span>
                            <span className="cr-item-val">{attendance.overall || 0}%</span>
                        </div>
                        <div className="cr-progress-bg">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${attendance.overall || 0}%` }} className="cr-progress-fill" style={{ background: '#10b981' }} />
                        </div>
                    </div>

                    <div className="cr-item">
                        <div className="cr-item-header">
                            <span className="cr-item-label">
                                <FaGraduationCap style={{ color: '#6366f1' }} /> Academic Score
                            </span>
                            <span className="cr-item-val">{academics.overallPercentage || 0}%</span>
                        </div>
                        <div className="cr-progress-bg">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${academics.overallPercentage || 0}%` }} className="cr-progress-fill" style={{ background: '#6366f1' }} />
                        </div>
                    </div>

                    <div className="cr-item">
                        <div className="cr-item-header">
                            <span className="cr-item-label">
                                <FaBriefcase style={{ color: '#f59e0b' }} /> Placement Readiness
                            </span>
                            <span className="cr-item-val">{Math.min(roadmapCount * 20, 100)}%</span>
                        </div>
                        <div className="cr-progress-bg">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(roadmapCount * 20, 100)}%` }} className="cr-progress-fill" style={{ background: '#f59e0b' }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="cr-footer">
                <div className="cr-footer-icon" style={{ color: status.color }}>
                    <FaRocket />
                </div>
                <div className="cr-footer-text">
                    <div className="desc">{status.desc}</div>
                    <div className="trend">
                        <FaChartLine /> TRENDING UPWARD
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CareerReadiness;
