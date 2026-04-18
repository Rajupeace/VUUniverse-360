import React, { useState, useEffect, useRef } from 'react';
import './PersonalDetailsBall.css';
import { FaUser, FaChalkboardTeacher, FaUserShield } from 'react-icons/fa';

const PersonalDetailsBall = ({ role, data }) => {
    // Safety Fallback
    data = data || {};
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const toggleOpen = () => setIsOpen(!isOpen);

    const renderContent = () => {
        if (role === 'student') {
            return (
                <div className="pdb-details">
                    <div className="pdb-header">
                        <div className="pdb-portrait-container">
                            <img
                                src={(() => {
                                    const pic = data.profileImage || data.profilePic || data.avatar;
                                    if (!pic) return `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.studentName || 'Student'}`;
                                    if (pic.includes('dicebear') || pic.startsWith('data:') || pic.startsWith('http')) return pic;
                                    return `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${pic.startsWith('/') ? '' : '/'}${pic}`;
                                })()}
                                alt="Profile"
                                className="pdb-portrait"
                                onError={(e) => { e.target.onerror = null; e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.studentName || 'Student'}`; }}
                            />
                        </div>
                        <h3>{data.studentName || 'Student'}</h3>
                        <span className="pdb-role-badge student">Student</span>
                    </div>
                    <div className="pdb-info-grid">
                        <div className="pdb-info-item">
                            <label>ID</label>
                            <span>{data.sid || 'N/A'}</span>
                        </div>
                        <div className="pdb-info-item">
                            <label>Branch</label>
                            <span>{data.branch || 'N/A'}</span>
                        </div>
                        <div className="pdb-info-item">
                            <label>Section</label>
                            <span>{data.section || 'N/A'}</span>
                        </div>
                        <div className="pdb-info-item">
                            <label>Year</label>
                            <span>{data.year || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            );
        } else if (role === 'faculty') {
            return (
                <div className="pdb-details">
                    <div className="pdb-header">
                        <div className="pdb-portrait-container">
                            <img
                                src={(() => {
                                    const pic = data.image || data.profileImage || data.profilePic || data.avatar;
                                    if (!pic) return `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name || 'Faculty'}`;
                                    if (pic.includes('dicebear') || pic.startsWith('data:') || pic.startsWith('http')) return pic;
                                    return `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${pic.startsWith('/') ? '' : '/'}${pic}`;
                                })()}
                                alt="Profile"
                                className="pdb-portrait"
                                onError={(e) => { e.target.onerror = null; e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name || 'Faculty'}`; }}
                            />
                        </div>
                        <h3>{data.name || 'Faculty'}</h3>
                        <span className="pdb-role-badge faculty">Faculty</span>
                    </div>
                    <div className="pdb-info-grid">
                        <div className="pdb-info-item">
                            <label>ID</label>
                            <span>{data.facultyId || 'N/A'}</span>
                        </div>
                        <div className="pdb-info-item">
                            <label>Designation</label>
                            <span>{data.designation || 'Lecturer'}</span>
                        </div>
                        <div className="pdb-info-item full">
                            <label>Department</label>
                            <span>{data.department || 'General'}</span>
                        </div>
                        <div className="pdb-info-item full">
                            <label>Teaching Assignments</label>
                            <div className="pdb-tags">
                                {data.assignments && data.assignments.length > 0 ? (
                                    data.assignments.map((a, i) => (
                                        <span key={i} className="pdb-tag">{a.branch} - {a.section} ({a.subject})</span>
                                    ))
                                ) : (
                                    <span>No active assignments</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else if (role === 'admin') {
            return (
                <div className="pdb-details">
                    <div className="pdb-header">
                        <FaUserShield className="pdb-icon-lg" />
                        <h3>{data.name || 'Administrator'}</h3>
                        <span className="pdb-role-badge admin">System Admin</span>
                    </div>
                    <div className="pdb-info-grid">
                        <div className="pdb-info-item full">
                            <label>Role</label>
                            <span>{data.role || 'Super Admin'}</span>
                        </div>
                        <div className="pdb-info-item full">
                            <label>System Status</label>
                            <span className="status-ok">● Online</span>
                        </div>
                        <div className="pdb-footer-note">
                            <p>Created by <strong>bobbymartin</strong></p>
                            <p className="pdb-sub">Database & System Architect</p>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="pdb-container" ref={containerRef}>
            <div className={`pdb-card ${isOpen ? 'open' : ''}`}>
                {renderContent()}
            </div>

            <button className="pdb-ball" onClick={toggleOpen} title="Personal Details">
                <div className="pdb-inner-ball">
                    <div className="pdb-core">
                        {(() => {
                            const pic = role === 'faculty' ? (data.image || data.profileImage) : (data.profileImage || data.profilePic);
                            if (pic) {
                                return (
                                    <img
                                        src={(pic.includes('dicebear') || pic.startsWith('data:') || pic.startsWith('http'))
                                            ? pic
                                            : `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${pic.startsWith('/') ? '' : '/'}${pic}`}
                                        alt="P"
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
                        <div className="pdb-icon-fallback" style={{ display: (data.image || data.profileImage || data.profilePic) ? 'none' : 'block' }}>
                            {role === 'admin' ? <FaUserShield /> : role === 'faculty' ? <FaChalkboardTeacher /> : <FaUser />}
                        </div>
                    </div>
                    <div className="pdb-ring"></div>
                </div>
            </button>
        </div>
    );
};

export default PersonalDetailsBall;
