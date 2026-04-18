import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBullhorn, FaUniversity, FaChalkboardTeacher, FaCalendarAlt, FaExclamationCircle, FaInfoCircle, FaCheckCircle, FaBell } from 'react-icons/fa';
import './StudentAnnouncements.css';

const StudentAnnouncements = ({ messages = [], userData }) => {
    // Proactive hardening
    userData = userData || { year: '1', section: 'A' };

    const sortedMessages = useMemo(() => {
        // Filter messages relevant to the student (already filtered by backend API usually, but double check)
        return messages.filter(msg => {
            if (msg.target === 'all') return true;
            if (msg.target === 'students') return true;
            if (msg.target === 'students-specific') {
                const yearMatch = !msg.targetYear || String(msg.targetYear) === String(userData.year);
                const sectionMatch = !msg.targetSections || msg.targetSections.length === 0 || msg.targetSections.includes(userData.section);
                return yearMatch && sectionMatch;
            }
            return false;
        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [messages, userData]);

    const getIcon = (type) => {
        switch (type) {
            case 'urgent': return <FaExclamationCircle className="sa-icon urgent" />;
            case 'warning': return <FaExclamationCircle className="sa-icon warning" />;
            case 'success': return <FaCheckCircle className="sa-icon success" />;
            default: return <FaInfoCircle className="sa-icon info" />;
        }
    };

    const getSenderIcon = (role) => {
        if (role === 'admin' || role === 'system') return <FaUniversity />;
        return <FaChalkboardTeacher />;
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Recently'; // Fallback for invalid date
            return new Intl.DateTimeFormat('en-US', {
                month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            }).format(date);
        } catch (e) {
            return 'Recently';
        }
    };

    return (
        <div className="sa-container">
            <header className="sa-header">
                <div>
                    <h2 className="sa-title">
                        <FaBullhorn /> Campus <span>Broadcasts</span>
                    </h2>
                    <p className="sa-subtitle">Official announcements from Admin & Faculty</p>
                </div>
                <div className="sa-badge">
                    <FaBell /> {sortedMessages.length} Messages
                </div>
            </header>

            <div className="sa-grid">
                <AnimatePresence>
                    {sortedMessages.length > 0 ? (
                        sortedMessages.map((msg, index) => (
                            <motion.div
                                key={msg._id || index}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className={`sa-card ${msg.type || 'info'}`}
                            >
                                <div className="sa-card-header">
                                    <div className="sa-sender-info">
                                        <div className={`sa-avatar ${msg.senderRole || 'admin'}`}>
                                            {msg.senderImage ? (
                                                <img
                                                    src={(msg.senderImage.includes('dicebear') || msg.senderImage.startsWith('data:') || msg.senderImage.startsWith('http'))
                                                        ? msg.senderImage
                                                        : `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${msg.senderImage.startsWith('/') ? '' : '/'}${msg.senderImage}`}
                                                    alt="Sender"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'block';
                                                    }}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : null}
                                            <div style={{ display: msg.senderImage ? 'none' : 'block' }}>
                                                {getSenderIcon(msg.senderRole)}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="sa-sender-name">{msg.sender || 'Administration'}</span>
                                            <span className="sa-sender-role">{msg.senderRole === 'faculty' ? 'Faculty' : 'System Admin'}</span>
                                        </div>
                                    </div>
                                    <div className="sa-time">
                                        <FaCalendarAlt /> {formatDate(msg.createdAt)}
                                    </div>
                                </div>

                                <div className="sa-content">
                                    {msg.subject && <h3 className="sa-msg-subject">{msg.subject}</h3>}
                                    <p className="sa-msg-text">{msg.message}</p>
                                </div>

                                <div className="sa-footer">
                                    <span className={`sa-type-badge ${msg.type || 'info'}`}>
                                        {getIcon(msg.type)} {(msg.type || 'Notice').toUpperCase()}
                                    </span>
                                    {msg.target === 'students-specific' && (
                                        <span className="sa-target-badge">
                                            For: Year {msg.targetYear} - {msg.targetSections?.join(', ')}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="sa-empty"
                        >
                            <FaCheckCircle size={40} />
                            <p>You're all caught up! No new announcements.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

        </div>
    );
};

export default StudentAnnouncements;
