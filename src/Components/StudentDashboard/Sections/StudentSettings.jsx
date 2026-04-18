import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaLock, FaCheckCircle, FaExclamationCircle, FaSpinner, FaEdit, FaSave, FaShieldAlt, FaCamera, FaLinkedin, FaGithub } from 'react-icons/fa';
import { apiPut, apiUpload, resolveImageUrl } from '../../../utils/apiClient';
import { motion, AnimatePresence } from 'framer-motion';
import './StudentSettings.css';

const StudentSettings = ({ userData, onProfileUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [notification, setNotification] = useState(null);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        studentName: '',
        sid: '',
        email: '',
        phone: '',
        profilePic: '',
        bio: '',
        gender: '',
        dateOfBirth: '',
        religion: '',
        address: '',
        branch: '',
        year: '',
        section: '',
        batch: '',
        admissionMode: '',
        schoolName: '',
        schoolLocation: '',
        sscMarks: '',
        sscPassOutYear: '',
        interCollegeName: '',
        interLocation: '',
        intermediateMarks: '',
        intermediatePassOutYear: '',
        socials: { linkedin: '', github: '' }
    });

    useEffect(() => {
        if (userData) {
            setFormData({
                studentName: userData.studentName || userData.name || '',
                sid: userData.sid || '',
                email: userData.email || '',
                phone: userData.phone || '',
                profilePic: userData.profilePic || userData.profileImage || '',
                bio: userData.bio || '',
                gender: userData.gender || '',
                dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
                religion: userData.religion || '',
                address: userData.address || '',
                branch: userData.branch || '',
                year: userData.year || '',
                section: userData.section || '',
                batch: userData.batch || '',
                admissionMode: userData.admissionMode || '',
                schoolName: userData.schoolName || '',
                schoolLocation: userData.schoolLocation || '',
                sscMarks: userData.sscMarks || '',
                sscPassOutYear: userData.sscPassOutYear || '',
                interCollegeName: userData.interCollegeName || '',
                interLocation: userData.interLocation || '',
                intermediateMarks: userData.intermediateMarks || '',
                intermediatePassOutYear: userData.intermediatePassOutYear || '',
                socials: userData.socials || { linkedin: '', github: '' }
            });
        }
    }, [userData]);

    const showNotification = (type, msg) => {
        setNotification({ type, msg });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('image', file);
            const res = await apiUpload('/api/students/profile-pic/upload', fd);
            if (res.success) {
                const newPic = res.url;
                
                // Immediately update local state
                setFormData(prev => ({ 
                    ...prev, 
                    profilePic: newPic,
                    profileImage: newPic,
                    profilePicture: newPic,
                    avatar: newPic,
                    image: newPic
                }));

                // Immediately sync with backend for "Instant Profile Update"
                const updateRes = await apiPut(`/api/students/profile/${formData.sid}`, {
                    ...formData,
                    profilePic: newPic,
                    profileImage: newPic,
                    profilePicture: newPic,
                    avatar: newPic,
                    image: newPic
                });

                if (updateRes.success) {
                    showNotification('success', 'Profile identity updated instantly!');
                    if (onProfileUpdate) onProfileUpdate({
                        ...formData,
                        profilePic: newPic,
                        profileImage: newPic
                    });
                }
            }
        } catch (err) {
            showNotification('error', 'Critical synchronization failure in image core.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            const res = await apiPut(`/api/students/profile/${formData.sid}`, formData);
            if (res.success) {
                showNotification('success', 'Profile updated successfully');
                setIsEditing(false);
                if (onProfileUpdate) onProfileUpdate(formData);
            }
        } catch (error) {
            showNotification('error', error.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async () => {
        alert('Password update functionality will be available in the security patch.');
    };

    return (
        <div className="settings-dashboard-container">
            <div className="settings-mesh-bg" />

            <div className="settings-header">
                <div>
                    <h2>Account <span>Settings</span></h2>
                    <p>Manage your professional profile and security preferences</p>
                </div>
            </div>

            <div className="settings-layout">
                <div className="settings-sidebar">
                    <button
                        className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <FaUser /> Personal Portfolio
                    </button>
                    <button
                        className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
                        onClick={() => setActiveTab('security')}
                    >
                        <FaShieldAlt /> Security & Access
                    </button>
                    <button className="settings-tab" disabled>
                        <FaCamera /> Notifications (Coming Soon)
                    </button>
                </div>

                <div className="settings-content">
                    <AnimatePresence mode="wait">
                        {activeTab === 'profile' ? (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="glass-panel settings-content-card"
                            >
                                <div className="settings-section-header">
                                    <h3>Personal Portfolio</h3>
                                    <div className="actions">
                                        {isEditing ? (
                                            <button className="settings-btn-primary settings-btn-success" onClick={handleSaveProfile} disabled={loading}>
                                                {loading ? <FaSpinner className="fa-spin" /> : <FaSave />} Save Changes
                                            </button>
                                        ) : (
                                            <button className="settings-btn-primary" onClick={() => setIsEditing(true)}>
                                                <FaEdit /> Edit Profile
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="profile-pic-wrapper">
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        style={{ display: 'none' }} 
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    <div className="profile-pic-container">
                                        <div className="profile-pic-circle" onClick={() => isEditing && fileInputRef.current.click()}>
                                            <img src={resolveImageUrl(formData.profilePic, formData.studentName)} alt="Profile" />
                                            <div className="hover-overlay"><FaCamera /></div>
                                        </div>
                                        <button className="profile-pic-upload-btn" onClick={() => isEditing && fileInputRef.current.click()}>
                                            <FaCamera />
                                        </button>
                                    </div>
                                </div>

                                <div className="settings-form-grid">
                                    <div className="settings-form-section">
                                        <h4>Personal Information</h4>
                                        <div className="form-row">
                                            <div className="settings-group">
                                                <label>Full Name</label>
                                                <input className="settings-input" value={formData.studentName} onChange={e => setFormData({ ...formData, studentName: e.target.value })} disabled={!isEditing} />
                                            </div>
                                            <div className="settings-group">
                                                <label>Student ID</label>
                                                <input className="settings-input" value={formData.sid} disabled />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="settings-group">
                                                <label>Official Email</label>
                                                <input className="settings-input" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} disabled={!isEditing} />
                                            </div>
                                            <div className="settings-group">
                                                <label>Contact Phone</label>
                                                <input className="settings-input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} disabled={!isEditing} />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="settings-group">
                                                <label>Date of Birth</label>
                                                <input type="date" className="settings-input" value={formData.dateOfBirth} onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })} disabled={!isEditing} />
                                            </div>
                                            <div className="settings-group">
                                                <label>Gender</label>
                                                <select className="settings-input" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} disabled={!isEditing}>
                                                    <option value="">Select Gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="settings-group">
                                                <label>Religion</label>
                                                <input className="settings-input" value={formData.religion} onChange={e => setFormData({ ...formData, religion: e.target.value })} disabled={!isEditing} />
                                            </div>
                                            <div className="settings-group">
                                                <label>Address</label>
                                                <input className="settings-input" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} disabled={!isEditing} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="settings-form-section">
                                        <h4>Academic Details (Read Only)</h4>
                                        <div className="form-row">
                                            <div className="settings-group">
                                                <label>Branch</label>
                                                <input className="settings-input" value={formData.branch} disabled />
                                            </div>
                                            <div className="settings-group">
                                                <label>Year / Section</label>
                                                <input className="settings-input" value={`${formData.year} / ${formData.section}`} disabled />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="settings-group">
                                                <label>Batch</label>
                                                <input className="settings-input" value={formData.batch} disabled />
                                            </div>
                                            <div className="settings-group">
                                                <label>Admission Mode</label>
                                                <input className="settings-input" value={formData.admissionMode} disabled />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="settings-form-section">
                                        <h4>Previous Education - SSC</h4>
                                        <div className="form-row">
                                            <div className="settings-group">
                                                <label>School Name</label>
                                                <input className="settings-input" value={formData.schoolName} onChange={e => setFormData({ ...formData, schoolName: e.target.value })} disabled={!isEditing} />
                                            </div>
                                            <div className="settings-group">
                                                <label>School Location</label>
                                                <input className="settings-input" value={formData.schoolLocation} onChange={e => setFormData({ ...formData, schoolLocation: e.target.value })} disabled={!isEditing} />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="settings-group">
                                                <label>SSC Marks/CGPA</label>
                                                <input className="settings-input" value={formData.sscMarks} onChange={e => setFormData({ ...formData, sscMarks: e.target.value })} disabled={!isEditing} />
                                            </div>
                                            <div className="settings-group">
                                                <label>Pass Out Year</label>
                                                <input className="settings-input" value={formData.sscPassOutYear} onChange={e => setFormData({ ...formData, sscPassOutYear: e.target.value })} disabled={!isEditing} />
                                            </div>
                                        </div>

                                        <h4 style={{ marginTop: '20px' }}>Previous Education - Intermediate</h4>
                                        <div className="form-row">
                                            <div className="settings-group">
                                                <label>College Name</label>
                                                <input className="settings-input" value={formData.interCollegeName} onChange={e => setFormData({ ...formData, interCollegeName: e.target.value })} disabled={!isEditing} />
                                            </div>
                                            <div className="settings-group">
                                                <label>College Location</label>
                                                <input className="settings-input" value={formData.interLocation} onChange={e => setFormData({ ...formData, interLocation: e.target.value })} disabled={!isEditing} />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="settings-group">
                                                <label>Intermediate Marks/CGPA</label>
                                                <input className="settings-input" value={formData.intermediateMarks} onChange={e => setFormData({ ...formData, intermediateMarks: e.target.value })} disabled={!isEditing} />
                                            </div>
                                            <div className="settings-group">
                                                <label>Pass Out Year</label>
                                                <input className="settings-input" value={formData.intermediatePassOutYear} onChange={e => setFormData({ ...formData, intermediatePassOutYear: e.target.value })} disabled={!isEditing} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="settings-form-section">
                                        <h4>Social Connectivity</h4>
                                        <div className="form-row">
                                            <div className="settings-group">
                                                <label><FaLinkedin /> LinkedIn URL</label>
                                                <input 
                                                    className="settings-input" 
                                                    value={formData.socials?.linkedin} 
                                                    onChange={e => setFormData({ ...formData, socials: { ...formData.socials, linkedin: e.target.value } })} 
                                                    disabled={!isEditing} 
                                                    placeholder="https://linkedin.com/in/yourprofile"
                                                />
                                            </div>
                                            <div className="settings-group">
                                                <label><FaGithub /> GitHub URL</label>
                                                <input 
                                                    className="settings-input" 
                                                    value={formData.socials?.github} 
                                                    onChange={e => setFormData({ ...formData, socials: { ...formData.socials, github: e.target.value } })} 
                                                    disabled={!isEditing} 
                                                    placeholder="https://github.com/yourusername"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="settings-form-section">
                                        <h4>Biography & Vision</h4>
                                        <div className="form-row single">
                                            <div className="settings-group">
                                                <label>Tell your story</label>
                                                <textarea className="settings-input" value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} disabled={!isEditing} placeholder="Short bio about yourself..." />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="security"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="glass-panel settings-content-card"
                            >
                                <div className="settings-section-header">
                                    <h3>Security & Access</h3>
                                </div>
                                <div className="security-wrapper">
                                    <div className="settings-form-section">
                                        <h4>Credential Management</h4>
                                        <div className="settings-group" style={{ marginBottom: '1.5rem' }}>
                                            <label>Current Password</label>
                                            <input className="settings-input" type="password" placeholder="••••••••" />
                                        </div>
                                        <div className="settings-group" style={{ marginBottom: '1.5rem' }}>
                                            <label>New Password</label>
                                            <input className="settings-input" type="password" placeholder="••••••••" />
                                        </div>
                                        <button className="settings-btn-primary" onClick={handlePasswordUpdate}>
                                            <FaLock /> Update Credentials
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className={`notification ${notification.type}`}
                        style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000 }}
                    >
                        {notification.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
                        {notification.msg}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StudentSettings;
