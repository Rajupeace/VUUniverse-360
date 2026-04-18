import React from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaBroadcastTower, FaUserShield, FaClock } from 'react-icons/fa';

/**
 * Communications Center
 * Hub for messages and global announcements.
 */
const MessageSection = ({ messages, openModal }) => {
    return (
        <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
            <header className="admin-page-header" style={{ marginBottom: '2rem', borderBottom: 'none' }}>
                <div className="admin-page-title">
                    <h1 style={{ fontSize: '2.8rem', fontWeight: 950, letterSpacing: '-0.04em', background: 'linear-gradient(135deg, #0f172a, #334155)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        COMMS <span style={{ color: '#06b6d4', WebkitTextFillColor: '#06b6d4' }}>CENTER</span>
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06b6d4', boxShadow: '0 0 10px #06b6d4' }}></div>
                        <p style={{ margin: 0, fontWeight: 800, color: '#64748b', fontSize: '0.9rem' }}>{messages.length} ACTIVE TRANSMISSIONS</p>
                    </div>
                </div>
                <div className="admin-action-bar" style={{ display: 'flex', gap: '1rem' }}>
                    <button className="admin-btn admin-btn-primary" onClick={() => openModal('message')} style={{ height: '48px', borderRadius: '16px', fontWeight: 900, fontSize: '0.8rem', background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}>
                        <FaBroadcastTower /> BROADCAST MESSAGE
                    </button>
                </div>
            </header>

            <div className="admin-list-container" style={{ display: 'grid', gap: '1.25rem' }}>
                {messages.map((msg, i) => (
                    <motion.div
                        key={msg.id || i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="admin-card"
                        style={{
                            padding: '1.5rem',
                            borderRadius: '24px',
                            border: '1px solid #f1f5f9',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
                            borderLeft: msg.type === 'urgent' ? '6px solid #ef4444' : '1px solid #f1f5f9',
                            background: 'white'
                        }}
                    >
                        <div className="admin-msg-meta" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <span style={{
                                    fontSize: '0.65rem',
                                    fontWeight: 950,
                                    color: msg.target === 'all' ? '#10b981' : '#6366f1',
                                    background: msg.target === 'all' ? '#f0fdf4' : '#eef2ff',
                                    padding: '4px 10px',
                                    borderRadius: '100px',
                                    border: `1px solid ${msg.target === 'all' ? '#dcfce7' : '#e0e7ff'}`,
                                    letterSpacing: '0.5px'
                                }}>
                                    {(msg.target || 'ANNOUNCEMENT').toUpperCase()}
                                </span>
                                {msg.type === 'urgent' && (
                                    <span style={{ fontSize: '0.65rem', fontWeight: 950, color: '#ef4444', background: '#fef2f2', padding: '4px 10px', borderRadius: '100px', border: '1px solid #fee2e2' }}>
                                        URGENT ALERT
                                    </span>
                                )}
                                {msg.targetYear && (
                                    <span style={{ fontSize: '0.65rem', fontWeight: 950, color: '#f59e0b', background: '#fffbeb', padding: '4px 10px', borderRadius: '100px', border: '1px solid #fef3c7' }}>
                                        YEAR {msg.targetYear}
                                    </span>
                                )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800 }}>
                                <FaClock /> {new Date(msg.createdAt || msg.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '16px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', fontSize: '1rem', overflow: 'hidden' }}>
                                {(() => {
                                    const pic = msg.senderImage || msg.image || msg.profileImage || msg.profilePic || msg.avatar;
                                    if (pic) {
                                        return (
                                            <img
                                                src={(pic.includes('dicebear') || pic.startsWith('data:') || pic.startsWith('http'))
                                                    ? pic
                                                    : `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${pic.startsWith('/') ? '' : '/'}${pic}`}
                                                alt="S"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'block';
                                                }}
                                            />
                                        );
                                    }
                                    return null;
                                })()}
                                <div style={{ display: (msg.senderImage || msg.image || msg.profileImage || msg.profilePic || msg.avatar) ? 'none' : 'block' }}>
                                    <FaUserShield />
                                </div>
                            </div>
                            <div>
                                <div style={{ fontWeight: 900, color: '#1e293b', fontSize: '0.85rem' }}>
                                    {msg.facultyId ? `PROCTOR: ${msg.sender || msg.facultyId}` : 'CENTRAL COMMAND'}
                                </div>
                                <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>VERIFIED ORIGIN</div>
                            </div>
                        </div>

                        <div className="admin-msg-body" style={{ color: '#334155', fontSize: '1rem', lineHeight: '1.7', fontWeight: 700 }}>
                            {msg.message || msg.text}
                        </div>
                    </motion.div>
                ))}

                {messages.length === 0 && (
                    <div className="admin-empty-state" style={{ padding: '8rem 2rem' }}>
                        <div style={{ fontSize: '4rem', color: '#cbd5e1', marginBottom: '1.5rem' }}><FaEnvelope /></div>
                        <h3 style={{ margin: 0, color: '#1e293b', fontWeight: 950 }}>NO RECENT COMMS</h3>
                        <p style={{ color: '#94a3b8', fontWeight: 600, marginTop: '0.5rem' }}>The broadcast history is currently empty.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageSection;
