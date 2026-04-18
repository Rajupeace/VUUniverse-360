import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaTimes, FaEnvelope, FaPhone, FaBuilding,
    FaUserGraduate, FaChalkboardTeacher, FaUserTie,
    FaLinkedin, FaGithub, FaBriefcase, FaGraduationCap,
    FaLightbulb, FaAward, FaMapMarkerAlt, FaTransgender
} from 'react-icons/fa';
import './FacultyProfileModal.css';

const FacultyProfileModal = ({ isOpen, onClose, faculty, getFileUrl, onEdit }) => {
    if (!faculty) return null;

    // Helper for role background color
    const getRoleColor = (role) => {
        const r = (role || '').toLowerCase();
        if (r.includes('placement')) return '#7c3aed';
        if (r.includes('attendance')) return '#0ea5e9';
        if (r.includes('schedule')) return '#f59e0b';
        if (r.includes('achievement')) return '#4f46e5';
        return '#10b981';
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fpm-overlay" onClick={onClose}>
                    <motion.div
                        className="fpm-container"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button className="fpm-close-btn" onClick={onClose}>
                            <FaTimes />
                        </button>

                        {/* Header Section */}
                        <div className="fpm-header">
                            <div className="fpm-avatar-wrapper">
                                <img
                                    src={(() => {
                                        const pic = faculty.image || faculty.profileImage || faculty.profilePic || faculty.avatar;
                                        if (!pic) return `https://api.dicebear.com/7.x/avataaars/svg?seed=${faculty.name || 'Faculty'}`;
                                        if (pic.includes('dicebear') || pic.startsWith('data:') || pic.startsWith('http')) return pic;
                                        return `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${pic.startsWith('/') ? '' : '/'}${pic}`;
                                    })()}
                                    alt={faculty.name}
                                    className="fpm-avatar"
                                    onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${faculty.name || 'Faculty'}`; }}
                                />
                            </div>
                            <div className="fpm-basic-info">
                                <h2 className="fpm-name">{faculty.name}</h2>
                                <div className="fpm-badges">
                                    <span className="fpm-badge primary">{faculty.facultyId || faculty.id}</span>
                                    <span className="fpm-badge accent">{faculty.designation || 'PROFESSOR'}</span>
                                    <span className="fpm-badge warning">{faculty.department || faculty.branch || 'CSE'}</span>
                                    <span className="fpm-badge success" style={{ background: getRoleColor(faculty.role) }}>
                                        {(faculty.role || 'FACULTY').toUpperCase()}
                                    </span>
                                    {faculty.isTransportUser && <span className="fpm-badge primary" style={{ background: '#6366f1' }}>TRANSPORT</span>}
                                    {faculty.isHosteller && <span className="fpm-badge warning" style={{ background: '#f59e0b' }}>HOSTELLER</span>}
                                </div>
                                <div className="fpm-contact-row">
                                    <div className="fpm-contact-item">
                                        <FaEnvelope /> {faculty.email || 'mentor@vignan.edu'}
                                    </div>
                                    {faculty.phone && (
                                        <div className="fpm-contact-item">
                                            <FaPhone /> {faculty.phone}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="fpm-body">
                            <div className="fpm-grid">
                                {/* LEFT COLUMN */}
                                <div className="fpm-column">
                                    <section className="fpm-section">
                                        <h3 className="fpm-section-title"><FaUserGraduate /> Academic Credentials</h3>
                                        <div className="fpm-info-list">
                                            <div className="fpm-info-item">
                                                <span className="label">Qualification</span>
                                                <span className="value">{faculty.qualification || 'PhD Scholar'}</span>
                                            </div>
                                            <div className="fpm-info-item">
                                                <span className="label">Experience</span>
                                                <span className="value">{faculty.experience || '8+ Academic Years'}</span>
                                            </div>
                                            <div className="fpm-info-item">
                                                <span className="label">Specialization</span>
                                                <span className="value">{faculty.specialization || 'Core Engineering'}</span>
                                            </div>
                                            <div className="fpm-info-item">
                                                <span className="label">Gender</span>
                                                <span className="value">{faculty.gender || 'Not Specified'}</span>
                                            </div>
                                            <div className="fpm-info-item" style={{ gridColumn: 'span 2' }}>
                                                <span className="label">Home Address</span>
                                                <span className="value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <FaMapMarkerAlt style={{ color: '#64748b' }} /> {faculty.address || 'No address provided'}
                                                </span>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="fpm-section">
                                        <h3 className="fpm-section-title"><FaChalkboardTeacher /> Teaching Nodes</h3>
                                        <div className="fpm-assignments-list">
                                            {faculty.assignments && faculty.assignments.length > 0 ? (
                                                faculty.assignments.map((assign, idx) => (
                                                    <div key={idx} className="fpm-assign-card">
                                                        <div className="assign-icon"><FaBriefcase /></div>
                                                        <div className="assign-details">
                                                            <h4>{assign.subject}</h4>
                                                            <p>Year {assign.year} • {assign.branch} • Sec {assign.section}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="fpm-empty-state">No active teaching assignments synced.</div>
                                            )}
                                        </div>
                                    </section>
                                </div>

                                {/* RIGHT COLUMN */}
                                <div className="fpm-column">
                                    <section className="fpm-section">
                                        <h3 className="fpm-section-title"><FaLightbulb /> Research & Specialization</h3>
                                        <div className="fpm-tags">
                                            {(faculty.specialization || 'Distributed Systems, Cloud Computing, Neural Networks').split(',').map((tag, i) => (
                                                <span key={i} className="fpm-tag">{tag.trim()}</span>
                                            ))}
                                        </div>
                                    </section>

                                    <section className="fpm-section">
                                        <h3 className="fpm-section-title"><FaAward /> Connectivity</h3>
                                        <div className="fpm-social-links">
                                            <div className="fpm-social-btn glass">
                                                <FaLinkedin /> LinkedIn
                                            </div>
                                            <div className="fpm-social-btn glass">
                                                <FaGithub /> GitHub
                                            </div>
                                        </div>
                                        <div className="fpm-availability-box">
                                            <div className="status-indicator online"></div>
                                            <div>
                                                <div className="status-label">AVAILABLE FOR SUPPORT</div>
                                                <div className="status-sub">Responds within 24 hours</div>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>

                        <div className="fpm-footer">
                            {onEdit && (
                                <button
                                    className="fpm-btn secondary"
                                    onClick={() => {
                                        onEdit(faculty);
                                    }}
                                    style={{ marginRight: '1rem' }}
                                >
                                    EDIT PROFILE
                                </button>
                            )}
                            <button className="fpm-btn primary" onClick={onClose}>CLOSE PROFILE</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default FacultyProfileModal;
