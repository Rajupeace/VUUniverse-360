import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaPhone, FaBook, FaUserTie, FaFilter, FaLinkedin, FaGithub, FaEye } from 'react-icons/fa';
import { apiGet } from '../../utils/apiClient';
import FacultyProfileModal from '../Shared/FacultyProfileModal';
import './StudentFacultyList.css';

/**
 * FACULTY DIRECTORY
 * An interface for students to connect with their academic faculty and mentors.
 */
const StudentFacultyList = ({ studentData, preloadedData }) => {
    // Safety check
    studentData = studentData || {};
    const [facultyList, setFacultyList] = useState(preloadedData || []);
    const [loading, setLoading] = useState(!preloadedData || preloadedData.length === 0);
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchFacultyList = async () => {
            if (!preloadedData || preloadedData.length === 0) setLoading(true);
            
            if (!studentData || !studentData.year) {
                if (!preloadedData) setFacultyList([]);
                setLoading(false);
                return;
            }

            try {
                // Fetch faculty teaching this specific student's year/section/branch
                const response = await apiGet(`/api/faculty/teaching?year=${studentData.year}&section=${studentData.section}&branch=${studentData.branch}`);
                const list = (response || []).map(f => {
                    const assignment = (f.assignments || []).find(a =>
                        String(a.year) === String(studentData.year) &&
                        String(a.section).toUpperCase() === String(studentData.section).toUpperCase() &&
                        String(a.branch).toUpperCase() === String(studentData.branch).toUpperCase());

                    return {
                        id: f.facultyId,
                        name: f.name || f.facultyName || 'Unknown Instructor',
                        subject: assignment?.subject || f.subject || 'Specialized Topic',
                        email: f.email || 'mentor@vignan.edu',
                        phone: f.phone || f.contact || 'No contact sync',
                        semester: assignment?.semester || f.semester || 'Current Semester',
                        branch: f.department || f.branch || 'Core Engineering',
                        image: f.image || f.profilePic || f.profileImage || null,
                        qualification: f.qualification || 'PhD Scholar',
                        experience: f.experience || '8+ Academic Years',
                        specialization: f.specialization || 'Distributed Systems',
                        isAvailable: Math.random() > 0.3 // Mock availability
                    };
                });
                setFacultyList(list);
            } catch (error) {
                console.error('Faculty List Synchronization Failed:', error);
                if (!preloadedData) setFacultyList([]);
            } finally {
                setLoading(false);
            }
        };

        fetchFacultyList();
    }, [studentData, preloadedData]);

    const getFilteredFaculty = () => {
        if (selectedDepartment === 'all') return facultyList;
        return facultyList.filter(f => f.branch.toLowerCase().includes(selectedDepartment.toLowerCase()));
    };

    if (loading) {
        return (
            <div className="nexus-schedule-loading">
                <div className="nexus-loading-ring"></div>
                <div className="loading-text">LOADING FACULTY LIST...</div>
            </div>
        );
    }

    const sectors = ['all', ...new Set(facultyList.map(f => f.branch))];
    const filtered = getFilteredFaculty();

    return (
        <div className="nexus-page-container">
            {/* Header Area */}
            <div className="nexus-page-header">
                <div>
                    <div className="nexus-page-subtitle"><FaUserTie /> Academic Faculty</div>
                    <h1 className="nexus-page-title">FACULTY <span>DIRECTORY</span></h1>
                </div>
                <div className="hub-stats">
                    <div className="nexus-intel-badge">
                        TOTAL FACULTY: {filtered.length}
                    </div>
                </div>
            </div>

            {/* Department Navigation */}
            <div className="sector-nav">
                <div className="sector-label">
                    <FaFilter /> DEPARTMENT FILTER
                </div>
                <div className="nexus-glass-pills">
                    {sectors.map((dept, idx) => (
                        <button
                            key={dept || idx}
                            onClick={() => setSelectedDepartment(dept)}
                            className={`nexus-pill ${selectedDepartment === dept ? 'active' : ''}`}
                        >
                            {dept === 'all' ? 'ALL DEPARTMENTS' : dept.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Mentor Grid */}
            <div className="mentor-quantum-grid">
                {filtered.map((mentor, index) => (
                    <div key={mentor.id || `faculty-${index}`} className="quantum-mentor-card">
                        <div className="card-top">
                            <div className="mentor-portrait">
                                <img
                                    src={(() => {
                                        const pic = mentor.image; // mentor.image already has f.image || f.profilePic from line 43
                                        if (!pic) return `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.name || 'Faculty'}`;
                                        if (pic.includes('dicebear') || pic.startsWith('data:') || pic.startsWith('http')) return pic;
                                        return `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${pic.startsWith('/') ? '' : '/'}${pic}`;
                                    })()}
                                    alt={mentor.name}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.name || 'Faculty'}`;
                                    }}
                                />
                                <div className={`status-dot ${mentor.isAvailable ? 'online' : 'busy'}`}></div>
                            </div>
                            <div className="mentor-bio">
                                <h3>{mentor.name}</h3>
                                <div className="mentor-role">{mentor.qualification}</div>
                                <div className={`status-tag ${mentor.isAvailable ? '' : 'gold'}`}>
                                    {mentor.isAvailable ? 'AVAILABLE FOR SUPPORT' : 'IN SESSION'}
                                </div>
                            </div>
                        </div>

                        <div className="mentor-subject-box">
                            <FaBook />
                            <div className="subject-info">
                                <span className="active-module-label">
                                    SUBJECT
                                </span>
                                <span className="active-module-val">{mentor.subject}</span>
                            </div>
                        </div>

                        <div className="mentor-attributes">
                            <div className="attr">
                                <span className="label">DOMAIN</span>
                                <span className="val">{mentor.specialization}</span>
                            </div>
                            <div className="attr">
                                <span className="label">EXPERIENCE</span>
                                <span className="val">{mentor.experience}</span>
                            </div>
                        </div>

                        <div className="mentor-channels">
                            <div className="channel-group">
                                <a href={`mailto:${mentor.email}`} title="Send Email" className="channel-link"><FaEnvelope /></a>
                                <a href={`tel:${mentor.phone}`} title="Call Faculty" className="channel-link"><FaPhone /></a>
                                <div className="channel-link"><FaLinkedin /></div>
                                <div className="channel-link"><FaGithub /></div>
                            </div>
                            <button
                                className="counsel-btn"
                                onClick={() => {
                                    setSelectedFaculty(mentor);
                                    setShowModal(true);
                                }}
                            >
                                VIEW PROFILE
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <FacultyProfileModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                faculty={selectedFaculty}
                getFileUrl={(url) => (url && (url.startsWith('http') || url.startsWith('data:'))) ? url : `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${url?.startsWith('/') ? '' : '/'}${url}`}
            />

            {
                filtered.length === 0 && (
                    <div className="nexus-empty-sector">
                        <FaUserTie className="empty-sector-icon" />
                        <h3>NO FACULTY FOUND</h3>
                        <p className="empty-sector-msg">No faculty members are currently registered in this department. Please check the All Departments view.</p>
                        <button onClick={() => setSelectedDepartment('all')} className="counsel-btn center-btn">ALL DEPARTMENTS</button>
                    </div>
                )
            }
        </div >
    );
};

export default StudentFacultyList;
