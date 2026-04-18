import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaTimes, FaUser, FaEnvelope, FaGraduationCap, FaBuilding,
    FaCalendarAlt, FaStar, FaCertificate, FaChartLine, FaMapMarkerAlt,
    FaSchool, FaBookOpen, FaDownload, FaEye, FaLock
} from 'react-icons/fa';
import './StudentProfileModal.css';
import { resolveImageUrl, apiUpload, apiPut } from '../../utils/apiClient';
import { FaCamera, FaSpinner } from 'react-icons/fa';

const StudentProfileModal = ({
    isOpen,
    onClose,
    student,
    viewedAchievements = [],
    getFileUrl,
    isAdmin = false,
    isManager = false,
    isFaculty = false
}) => {
    const [uploading, setUploading] = useState(false);
    const [permissions, setPermissions] = useState({
        personal: false,
        academic: false,
    });

    useEffect(() => {
        setPermissions({
            // Achievement/Placement Managers and Admins see personal data
            personal: isManager || isAdmin,
            // Faculty and Admins see deep academic history and performance metrics
            academic: isFaculty || isAdmin
        });
    }, [isOpen, isManager, isAdmin, isFaculty]);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('image', file);
            const res = await apiUpload('/api/students/profile-pic/upload', fd);
            if (res.success) {
                const newPic = res.url;
                await apiPut(`/api/students/profile/${student.sid}`, {
                    ...student,
                    profilePic: newPic,
                    profileImage: newPic
                });
                // Note: We'd ideally want to refresh the parent list here too, 
                // but real-world SSE or local state sync will handle most cases.
                student.profilePic = newPic;
                student.profileImage = newPic;
            }
        } catch (err) {
            console.error('Modal pic upload failed:', err);
        } finally {
            setUploading(false);
        }
    };

    if (!student) return null;

    // Helper to format date
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            return new Date(dateStr).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="spm-overlay" onClick={onClose}>
                    <motion.div
                        className="spm-container"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button className="spm-close-btn" onClick={onClose}>
                            <FaTimes />
                        </button>

                        {/* Sidebar / Header Section */}
                        <div className="spm-header">
                            <div className="spm-avatar-wrapper" style={{ position: 'relative' }}>
                                {uploading ? (
                                    <div className="spm-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FaSpinner className="spm-spin" />
                                    </div>
                                ) : (
                                    <img
                                        src={resolveImageUrl(student.profileImage || student.profilePic || student.avatar, student.studentName)}
                                        alt={student.studentName}
                                        className="spm-avatar"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.studentName}`;
                                        }}
                                    />
                                )}
                                {(isAdmin || isManager) && (
                                    <>
                                        <div 
                                            className="spm-avatar-edit" 
                                            onClick={() => document.getElementById('spm-file-input').click()}
                                            title="Update Student Photo"
                                        >
                                            <FaCamera />
                                        </div>
                                        <input 
                                            type="file" 
                                            id="spm-file-input" 
                                            style={{ display: 'none' }} 
                                            accept="image/*" 
                                            onChange={handleImageChange} 
                                        />
                                    </>
                                )}
                            </div>
                            <div className="spm-basic-info">
                                <h2 className="spm-name">{student.studentName}</h2>
                                <div className="spm-badges">
                                    <span className="spm-badge primary">{student.sid}</span>
                                    <span className="spm-badge accent">{student.branch}</span>
                                    <span className="spm-badge warning">YEAR {student.year}</span>
                                    <span className="spm-badge info">SEC {student.section || 'A'}</span>
                                    <span className="spm-badge success">CGPA {student.cgpa || 'N/A'}</span>
                                    {student.isTransportUser && <span className="spm-badge primary" style={{ background: '#6366f1' }}>TRANSPORT</span>}
                                    {student.isHosteller && <span className="spm-badge warning" style={{ background: '#f59e0b' }}>HOSTELLER</span>}
                                </div>
                                <div className="spm-email">
                                    <FaEnvelope /> {student.email}
                                </div>
                            </div>
                        </div>

                        <div className="spm-body">
                            {/* Role-Based Content Restriction Notifications */}
                            {!permissions.personal && !permissions.academic && (
                                <div className="spm-restriction-alert">
                                    <FaLock /> Your profile access is limited to basic identity and portfolio.
                                </div>
                            )}
                            {!permissions.personal && permissions.academic && (
                                <div className="spm-restriction-alert">
                                    <FaLock /> Personal bio-data is restricted to Achievement & Placement Managers.
                                </div>
                            )}
                            {permissions.personal && !permissions.academic && (
                                <div className="spm-restriction-alert">
                                    <FaLock /> Deep academic history is restricted to Faculty and Administrators.
                                </div>
                            )}

                            <div className="spm-grid">
                                {/* LEFT COLUMN: Personal & Academic Info */}
                                <div className="spm-column">
                                    {/* PERSONAL DETAILS SECTION */}
                                    <section className={`spm-section ${!permissions.personal ? 'restricted' : ''}`}>
                                        <h3 className="spm-section-title"><FaUser /> Personal Information</h3>
                                        {permissions.personal ? (
                                            <div className="spm-info-list">
                                                <div className="spm-info-item">
                                                    <span className="label">Date of Birth</span>
                                                    <span className="value">{formatDate(student.dateOfBirth)}</span>
                                                </div>
                                                <div className="spm-info-item">
                                                    <span className="label">Gender</span>
                                                    <span className="value">{student.gender || 'Not Specified'}</span>
                                                </div>
                                                <div className="spm-info-item">
                                                    <span className="label">Phone Number</span>
                                                    <span className="value">{student.phone || 'N/A'}</span>
                                                </div>
                                                <div className="spm-info-item" style={{ gridColumn: 'span 2' }}>
                                                    <span className="label">Address</span>
                                                    <span className="value">{student.address || 'No address provided'}</span>
                                                </div>
                                                <div className="spm-info-item">
                                                    <span className="label">Religion</span>
                                                    <span className="value">{student.religion || 'N/A'}</span>
                                                </div>
                                                <div className="spm-info-item">
                                                    <span className="label">Admission Mode</span>
                                                    <span className="value">{student.admissionMode || 'N/A'}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="spm-locked-content">
                                                <p>Sensitive personal data is hidden.</p>
                                            </div>
                                        )}
                                    </section>

                                    {/* ACADEMIC BACKGROUND SECTION */}
                                    <section className={`spm-section ${!permissions.academic ? 'restricted' : ''}`}>
                                        <h3 className="spm-section-title"><FaGraduationCap /> Academic Background</h3>
                                        {permissions.academic ? (
                                            <div className="spm-info-list">
                                                <div className="spm-info-item">
                                                    <span className="label">SSC Marks / CGPA</span>
                                                    <span className="value">{student.sscMarks || 'N/A'} ({student.sscPassOutYear || '—'})</span>
                                                </div>
                                                <div className="spm-info-item">
                                                    <span className="label">Intermediate Marks</span>
                                                    <span className="value">{student.intermediateMarks || 'N/A'} ({student.intermediatePassOutYear || '—'})</span>
                                                </div>
                                                <div className="spm-info-item">
                                                    <span className="label">School Name</span>
                                                    <span className="value">{student.schoolName || 'N/A'}</span>
                                                </div>
                                                <div className="spm-info-item">
                                                    <span className="label">School Location</span>
                                                    <span className="value">{student.schoolLocation || 'N/A'}</span>
                                                </div>
                                                <div className="spm-info-item">
                                                    <span className="label">College Location</span>
                                                    <span className="value">{student.intermediateCollegeLocation || 'N/A'}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="spm-locked-content">
                                                <p>Previous academic records are hidden.</p>
                                            </div>
                                        )}
                                    </section>

                                    {/* STATS PREVIEW */}
                                    <section className={`spm-section ${!permissions.academic ? 'restricted' : ''}`}>
                                        <h3 className="spm-section-title"><FaChartLine /> Performance Metrics</h3>
                                        {permissions.academic ? (
                                            <div className="spm-stats-grid">
                                                <div className="spm-stat-card">
                                                    <span className="val">{student.stats?.totalClasses > 0 ? Math.round((student.stats?.totalPresent / student.stats?.totalClasses) * 100) : 0}%</span>
                                                    <span className="lab">Attendance</span>
                                                </div>
                                                <div className="spm-stat-card">
                                                    <span className="val">{student.stats?.tasksCompleted || 0}</span>
                                                    <span className="lab">Tasks</span>
                                                </div>
                                                <div className="spm-stat-card">
                                                    <span className="val">{student.stats?.streak || 0}</span>
                                                    <span className="lab">Streak</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="spm-locked-content">
                                                <p>Current academic performance is restricted.</p>
                                            </div>
                                        )}
                                    </section>
                                </div>

                                {/* RIGHT COLUMN: Achievements & Resume */}
                                <div className="spm-column">
                                    {/* ACHIEVEMENTS SECTION */}
                                    <section className="spm-section">
                                        <div className="spm-section-header">
                                            <h3 className="spm-section-title"><FaCertificate /> Achievements Showcase</h3>
                                            <span className="spm-count-badge">{viewedAchievements.length}</span>
                                        </div>
                                        <div className="spm-ach-list">
                                            {viewedAchievements.length > 0 ? (
                                                viewedAchievements.map(ach => (
                                                    <div key={ach._id} className="spm-ach-card">
                                                        <div className="spm-ach-status" style={{ background: ach.status === 'Approved' ? '#10b981' : '#f59e0b' }}></div>
                                                        <div className="spm-ach-content">
                                                            <h4>{ach.title}</h4>
                                                            <p>{ach.category} • {ach.level}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="spm-empty-state">No achievements recorded.</div>
                                            )}
                                        </div>
                                    </section>

                                    {/* RESUME SECTION */}
                                    <section className="spm-section">
                                        <h3 className="spm-section-title"><FaBookOpen /> Career Portfolio</h3>
                                        {student.resume ? (
                                            <div className="spm-resume-box">
                                                <div className="spm-resume-info">
                                                    <FaFileAlt size={24} color="#6366f1" />
                                                    <span>Digital Resume / CV</span>
                                                </div>
                                                <div className="spm-resume-actions">
                                                    <a href={getFileUrl(student.resume)} target="_blank" rel="noopener noreferrer" className="spm-btn glass">
                                                        <FaEye /> View
                                                    </a>
                                                    <a href={getFileUrl(student.resume)} download className="spm-btn primary">
                                                        <FaDownload /> Download
                                                    </a>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="spm-empty-state">No resume uploaded.</div>
                                        )}
                                    </section>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const FaFileAlt = ({ ...props }) => <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm64 236c0 6.6-5.4 12-12 12H108c-6.6 0-12-5.4-12-12v-8c0-6.6 5.4-12 12-12h168c6.6 0 12 5.4 12 12v8zm0-64c0 6.6-5.4 12-12 12H108c-6.6 0-12-5.4-12-12v-8c0-6.6 5.4-12 12-12h168c6.6 0 12 5.4 12 12v8zm0-64c0 6.6-5.4 12-12 12H108c-6.6 0-12-5.4-12-12v-8c0-6.6 5.4-12 12-12h168c6.6 0 12 5.4 12 12v8zM384 121.9v6.1H256V0h6.1c6.4 0 12.5 2.5 17 7l97.9 97.9c4.5 4.5 7 10.6 7 17z"></path></svg>;

export default StudentProfileModal;
