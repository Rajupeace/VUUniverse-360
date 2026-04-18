// src/Components/FacultyDashboard/Sections/FacultyMessages.jsx
import React from 'react';
import { FaBullhorn, FaInfoCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './FacultyMessages.css';

/**
 * ACADEMIC NOTICE BOARD
 * Interface for viewing official administrative communications and faculty-wide alerts.
 */
const FacultyMessages = ({ messages }) => {
    // Safety check
    messages = messages || [];

    return (
        <div className="notice-board-container">
            <header className="f-view-header">
                <div>
                    <h2>ACADEMIC <span>BOARD</span></h2>
                    <p className="nexus-subtitle">Official administrative orders and institutional communications</p>
                </div>
            </header>

            <div className="f-messages-container" style={{ marginTop: '1rem' }}>
                {messages.length > 0 ? (
                    <div className="notice-grid">
                        {messages.map((msg, i) => (
                            <motion.div
                                key={msg.id || i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="notice-card-v6"
                            >
                                <div className="notice-accent-line"></div>
                                <div className="notice-header">
                                    <div className="notice-tag">
                                        {msg.target?.toUpperCase() || 'INSTITUTIONAL NOTICE'}
                                    </div>
                                    <span className="notice-date">
                                        {new Date(msg.createdAt || msg.date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                                <div className="notice-text">
                                    {msg.message || msg.text}
                                </div>
                                <div className="notice-footer-bar"></div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="f-node-card f-center-empty" style={{ padding: '8rem 2rem' }}>
                        <div style={{ background: 'rgba(99, 102, 241, 0.05)', color: '#cbd5e1', width: '100px', height: '100px', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
                            <FaBullhorn style={{ fontSize: '3rem' }} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 950, color: '#1e293b', margin: 0 }}>NOTICE BOARD VACANT</h3>
                        <p style={{ color: '#94a3b8', fontWeight: 850, marginTop: '1rem', textAlign: 'center' }}>No administrative communications have been issued at this time.</p>
                    </div>
                )}
            </div>

            <footer style={{ marginTop: '3rem', display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1.5rem', background: 'rgba(241, 245, 249, 0.5)', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                <FaInfoCircle style={{ color: '#6366f1' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>
                    Note: Only verified administrative accounts can publish notices to this board.
                </span>
            </footer>
        </div>
    );
};

export default FacultyMessages;
