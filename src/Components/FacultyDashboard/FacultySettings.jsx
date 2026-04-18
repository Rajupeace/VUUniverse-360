// src/Components/FacultyDashboard/FacultySettings.jsx
import React, { useState, useEffect } from 'react';
import { FaUser, FaShieldAlt, FaSave, FaChalkboardTeacher, FaPlus, FaTrash, FaCircle, FaExclamationTriangle, FaCamera, FaExpand, FaTimes } from 'react-icons/fa';
import { apiPut, resolveImageUrl } from '../../utils/apiClient';
import { motion, AnimatePresence } from 'framer-motion';
import './FacultySettings.css';

/**
 * SYSTEM CONFIGURATION HUB
 * Advanced interface for managing faculty identity, academic load, and security protocols.
 */
const FacultySettings = ({ facultyData, onProfileUpdate }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const [profile, setProfile] = useState({
        name: '',
        email: '',
        facultyId: '',
        department: 'CSE',
        designation: 'Faculty',
        phone: '',
        qualification: '',
        experience: '',
        specialization: '',
        assignments: [],
        profilePic: ''
    });

    const [passwords, setPasswords] = useState({
        new: '',
        confirm: ''
    });

    const [newAssign, setNewAssign] = useState({
        year: '1',
        section: 'A',
        branch: 'CSE',
        subject: ''
    });

    useEffect(() => {
        if (facultyData) {
            setProfile({
                name: facultyData.name || '',
                email: facultyData.email || '',
                facultyId: facultyData.facultyId || '',
                department: facultyData.department || 'CSE',
                designation: facultyData.designation || 'Faculty',
                phone: facultyData.phone || '',
                qualification: facultyData.qualification || '',
                experience: facultyData.experience || '',
                specialization: facultyData.specialization || '',
                assignments: facultyData.assignments || [],
                profilePic: facultyData.image || facultyData.profileImage || facultyData.profilePic || facultyData.avatar || ''
            });
        }
    }, [facultyData]);

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    };

    const handleProfileChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handlePassChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const addAssignment = (e) => {
        e.preventDefault();
        if (!newAssign.subject) return showMessage("Subject designation required.", "error");
        const updatedAssignments = [...profile.assignments, newAssign];
        setProfile({ ...profile, assignments: updatedAssignments });
        setNewAssign({ ...newAssign, subject: '' });
    };

    const removeAssignment = (index) => {
        const updatedAssignments = profile.assignments.filter((_, i) => i !== index);
        setProfile({ ...profile, assignments: updatedAssignments });
    };


    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const token = localStorage.getItem('facultyToken') || localStorage.getItem('adminToken');
                const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5001').replace(/\/$/, '');
                const response = await fetch(`${API_URL}/api/faculty/profile/upload-pic`, {
                    method: 'POST',
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                    body: formData
                });

                if (!response.ok) throw new Error('Upload failed');
                const res = await response.json();

                if (res && res.url) {
                    const newPicUrl = res.url;
                    setProfile(prev => ({ ...prev, profilePic: newPicUrl }));

                    try {
                        const payload = { ...profile, profileImage: newPicUrl, profilePic: newPicUrl };
                        const saveRes = await apiPut(`/api/faculty/${profile.facultyId}`, payload);
                        if (saveRes) {
                            showMessage('Profile picture updated instantly!');
                            if (onProfileUpdate) onProfileUpdate({
                                ...facultyData,
                                ...payload,
                                image: newPicUrl,
                                profileImage: newPicUrl,
                                profilePic: newPicUrl
                            });
                        }
                    } catch (err) {
                        showMessage('Image uploaded! Click "Publish" to finalize.');
                    }
                }
            } catch (error) {
                showMessage(error.message || 'Failed to upload image.', 'error');
            }
        }
    };

    const handleImageDelete = async () => {
        if (window.confirm('Remove current profile picture and revert to generated avatar?')) {
            const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name || 'faculty'}`;
            setProfile(prev => ({ ...prev, profilePic: defaultAvatar }));
            try {
                const payload = { ...profile, profileImage: defaultAvatar, profilePic: defaultAvatar };
                const saveRes = await apiPut(`/api/faculty/${profile.facultyId}`, payload);
                if (saveRes) {
                    showMessage('Profile picture removed.');
                    if (onProfileUpdate) onProfileUpdate({
                        ...facultyData,
                        ...payload,
                        image: defaultAvatar,
                        profileImage: defaultAvatar,
                        profilePic: defaultAvatar
                    });
                }
            } catch (err) {
                showMessage('Picture removed. Click "Publish" to persist.');
            }
        }
    };

    const ImageModal = ({ src, onClose }) => (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.9)', zIndex: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(10px)'
            }}
            onClick={onClose}
        >
            <motion.img
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                src={src}
                style={{ maxHeight: '80vh', maxWidth: '90vw', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                onClick={e => e.stopPropagation()}
            />
            <button onClick={onClose} style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '48px', height: '48px', color: 'white', fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaTimes /></button>
        </motion.div>
    );

    const saveProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await apiPut(`/api/faculty/${profile.facultyId}`, profile);
            if (response) {
                if (onProfileUpdate) onProfileUpdate(response);
                showMessage("Institutional profile synchronized successfully.");
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Update failed:', error);
            showMessage("Synchronization error in profile core.", "error");
        } finally {
            setLoading(false);
        }
    };

    const changePassword = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            showMessage("Access keys do not match.", "error");
            return;
        }
        if (passwords.new.length < 6) {
            showMessage("Security key must meet minimum entropy requirements (6+ chars).", "error");
            return;
        }
        setLoading(true);
        try {
            await apiPut(`/api/faculty/${profile.facultyId}`, { password: passwords.new });
            showMessage("Security protocol updated. Key rotation successful.");
            setPasswords({ new: '', confirm: '' });
        } catch (error) {
            showMessage("Critical failure in security core update.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="config-container">
            <header className="f-view-header">
                <div>
                    <h2>SYSTEM <span>CONFIG</span></h2>
                    <p className="nexus-subtitle">Configure institutional identity and security infrastructure</p>
                </div>
                {message.text && (
                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className={`f-sync-badge ${message.type === 'error' ? 'error' : 'success'}`} style={{
                        background: message.type === 'error' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: message.type === 'error' ? 'var(--cfg-accent)' : 'var(--cfg-success)',
                        padding: '0.8rem 1.5rem',
                        borderRadius: '14px',
                        fontWeight: 900,
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        {message.type === 'error' ? <FaExclamationTriangle /> : <FaCircle />}
                        {message.text.toUpperCase()}
                    </motion.div>
                )}
            </header>

            <div className="config-card-v6">
                <nav className="config-nav">
                    <button className={`config-tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                        <FaUser /> IDENTITY
                    </button>
                    <button className={`config-tab-btn ${activeTab === 'assignments' ? 'active' : ''}`} onClick={() => setActiveTab('assignments')}>
                        <FaChalkboardTeacher /> ACADEMIC LOAD
                    </button>
                    <button className={`config-tab-btn ${activeTab === 'password' ? 'active' : ''}`} onClick={() => setActiveTab('password')}>
                        <FaShieldAlt /> PROTECTION
                    </button>
                </nav>

                <div className="config-content">
                    <AnimatePresence>
                        {showImageModal && <ImageModal src={resolveImageUrl(profile.profilePic, profile.name || 'faculty')} onClose={() => setShowImageModal(false)} />}
                    </AnimatePresence>
                    <AnimatePresence mode="wait">
                        {activeTab === 'profile' && (
                            <motion.form key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onSubmit={saveProfile}>

                                {/* AVATAR UPLOAD SECTION */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '3rem' }}>
                                    <div style={{ position: 'relative', width: '200px', height: '200px' }}>
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            onClick={() => profile.profilePic && !profile.profilePic.includes('dicebear') && setShowImageModal(true)}
                                            style={{
                                                width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden',
                                                boxShadow: '0 12px 30px rgba(0,0,0,0.15)', border: '5px solid white',
                                                background: '#f8fafc', cursor: profile.profilePic && !profile.profilePic.includes('dicebear') ? 'pointer' : 'default',
                                                position: 'relative'
                                            }}
                                        >
                                            <img
                                                src={resolveImageUrl(profile.profilePic, profile.name || 'faculty')}
                                                alt="Faculty Profile"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name || 'faculty'}`;
                                                }}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                            {profile.profilePic && !profile.profilePic.includes('dicebear') && (
                                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', opacity: 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem' }} className="hover-overlay">
                                                    <FaExpand />
                                                </div>
                                            )}
                                        </motion.div>

                                        <label
                                            title="Update Profile Picture"
                                            style={{
                                                position: 'absolute', bottom: '10px', right: '10px',
                                                background: '#4f46e5', color: 'white', width: '48px', height: '48px',
                                                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)',
                                                zIndex: 10, transition: 'all 0.2s', border: '3px solid white'
                                            }}
                                        >
                                            <FaCamera size={20} />
                                            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                                        </label>

                                        {profile.profilePic && !profile.profilePic.includes('dicebear') && (
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                onClick={(e) => { e.preventDefault(); handleImageDelete(); }}
                                                title="Remove Picture"
                                                style={{
                                                    position: 'absolute', bottom: '10px', left: '10px',
                                                    background: '#ef4444', color: 'white', width: '48px', height: '48px',
                                                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    cursor: 'pointer', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                                                    zIndex: 10, border: '3px solid white'
                                                }}
                                            >
                                                <FaTrash size={18} />
                                            </motion.button>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--cfg-slate-200)' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--cfg-slate-700)' }}>INSTITUTIONAL IDENTITY</h3>
                                    <button type="button" onClick={() => setIsEditing(!isEditing)} className="f-quick-btn shadow primary" style={{ height: '40px', padding: '0 1.5rem', borderRadius: '10px', fontSize: '0.8rem', background: isEditing ? 'var(--cfg-slate-700)' : 'var(--cfg-primary)' }}>
                                        {isEditing ? 'LOCK EDITS' : 'EDIT DETAILS'}
                                    </button>
                                </div>

                                <div className="form-grid-v6" style={{ marginBottom: '3rem' }}>
                                    <div className="form-group-v6" style={{ gridColumn: '1 / -1' }}>
                                        <label className="form-label-v6">FULL LEGAL NAME</label>
                                        <input className="form-input-v6" name="name" value={profile.name} onChange={handleProfileChange} disabled={!isEditing || loading} placeholder="Enter operational designation..." />
                                    </div>
                                    <div className="form-group-v6">
                                        <label className="form-label-v6">FACULTY IDENTIFIER</label>
                                        <input className="form-input-v6" name="facultyId" value={profile.facultyId} disabled style={{ background: 'var(--cfg-slate-50)', color: '#94a3b8' }} />
                                    </div>
                                    <div className="form-group-v6">
                                        <label className="form-label-v6">INSTITUTIONAL EMAIL</label>
                                        <input className="form-input-v6" name="email" value={profile.email} onChange={handleProfileChange} disabled={!isEditing || loading} />
                                    </div>
                                    <div className="form-group-v6">
                                        <label className="form-label-v6">PRIMARY PHONE</label>
                                        <input className="form-input-v6" name="phone" value={profile.phone} onChange={handleProfileChange} disabled={!isEditing || loading} />
                                    </div>
                                    <div className="form-group-v6">
                                        <label className="form-label-v6">DEPARTMENTAL SECTOR</label>
                                        <input className="form-input-v6" name="department" value={profile.department} onChange={handleProfileChange} disabled={!isEditing || loading} />
                                    </div>
                                    <div className="form-group-v6">
                                        <label className="form-label-v6">ACADEMIC RANK</label>
                                        <input className="form-input-v6" name="designation" value={profile.designation} onChange={handleProfileChange} disabled={!isEditing || loading} />
                                    </div>
                                    <div className="form-group-v6">
                                        <label className="form-label-v6">QUALIFICATION</label>
                                        <input className="form-input-v6" name="qualification" value={profile.qualification} onChange={handleProfileChange} disabled={!isEditing || loading} />
                                    </div>
                                    <div className="form-group-v6">
                                        <label className="form-label-v6">ACADEMIC EXPERIENCE</label>
                                        <input className="form-input-v6" name="experience" value={profile.experience} onChange={handleProfileChange} disabled={!isEditing || loading} />
                                    </div>
                                    <div className="form-group-v6">
                                        <label className="form-label-v6">MAIN SPECIALIZATION</label>
                                        <input className="form-input-v6" name="specialization" value={profile.specialization} onChange={handleProfileChange} disabled={!isEditing || loading} />
                                    </div>
                                </div>
                                <button type="submit" className="f-node-btn primary" style={{ width: '100%', height: '60px', fontSize: '1rem', opacity: !isEditing ? 0.5 : 1, pointerEvents: !isEditing ? 'none' : 'auto' }} disabled={loading || !isEditing}>
                                    {loading ? 'SYNCHRONIZING CORE...' : <><FaSave /> PUBLISH IDENTITY UPDATES</>}
                                </button>
                            </motion.form>
                        )}

                        {activeTab === 'assignments' && (
                            <motion.div key="assignments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 450px) 1fr', gap: '3rem' }}>
                                <div className="f-node-card shadow-none" style={{ background: 'var(--cfg-slate-50)', padding: '2.5rem', borderRadius: '24px' }}>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 950, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <FaPlus style={{ color: 'var(--cfg-primary)' }} /> APPEND LOAD NODE
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        <div className="form-group-v6">
                                            <label className="form-label-v6">ACADEMIC YEAR</label>
                                            <select className="form-input-v6" value={newAssign.year} onChange={e => setNewAssign({ ...newAssign, year: e.target.value })}>
                                                {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group-v6">
                                            <label className="form-label-v6">BRANCH SECTOR</label>
                                            <select className="form-input-v6" value={newAssign.branch} onChange={e => setNewAssign({ ...newAssign, branch: e.target.value })}>
                                                {['CSE', 'IT', 'ECE', 'EEE'].map(b => <option key={b} value={b}>{b}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group-v6">
                                            <label className="form-label-v6">TARGET SECTION</label>
                                            <select className="form-input-v6" value={newAssign.section} onChange={e => setNewAssign({ ...newAssign, section: e.target.value })}>
                                                {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(s => <option key={s} value={s}>Section {s}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group-v6">
                                            <label className="form-label-v6">SUBJECT DESIGNATION</label>
                                            <input className="form-input-v6" value={newAssign.subject} onChange={e => setNewAssign({ ...newAssign, subject: e.target.value })} placeholder="e.g. Theoretical Physics" />
                                        </div>
                                        <button className="f-quick-btn shadow primary" onClick={addAssignment} style={{ height: '54px', marginTop: '1rem' }}><FaPlus /> ATTACH NODE</button>
                                    </div>
                                </div>

                                <div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 950, marginBottom: '2rem' }}>ACTIVE ACADEMIC LOAD</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '420px', overflowY: 'auto' }}>
                                        {profile.assignments.length === 0 ? (
                                            <div style={{ padding: '4rem', textAlign: 'center', opacity: 0.3 }}>
                                                <FaChalkboardTeacher style={{ fontSize: '3rem', marginBottom: '1rem' }} />
                                                <p style={{ fontWeight: 950 }}>EMPTY LOAD REGISTRY</p>
                                            </div>
                                        ) : (
                                            profile.assignments.map((assign, i) => (
                                                <div key={i} className="assign-card-v6">
                                                    <div>
                                                        <div style={{ fontWeight: 950, color: 'var(--cfg-slate-900)' }}>{assign.subject}</div>
                                                        <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginTop: '0.2rem' }}>
                                                            {assign.branch} • Year {assign.year} • Sec {assign.section}
                                                        </div>
                                                    </div>
                                                    <button onClick={() => removeAssignment(i)} className="f-quick-btn shadow delete" style={{ width: '40px', height: '40px' }}><FaTrash /></button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div style={{ marginTop: '3rem' }}>
                                        <button className="f-node-btn primary" style={{ width: '100%', height: '60px' }} onClick={saveProfile}>
                                            <FaSave /> DEPLOY LOAD CONFIGURATION
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'password' && (
                            <motion.form key="password" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onSubmit={changePassword} style={{ maxWidth: '500px', margin: '0 auto' }}>
                                <div className="form-group-v6" style={{ marginBottom: '1.5rem' }}>
                                    <label className="form-label-v6">NEW SECURITY ACCESS KEY</label>
                                    <input type="password" name="new" className="form-input-v6" value={passwords.new} onChange={handlePassChange} placeholder="Define high-entropy key..." />
                                </div>
                                <div className="form-group-v6" style={{ marginBottom: '2.5rem' }}>
                                    <label className="form-label-v6">VALIDATE ACCESS KEY</label>
                                    <input type="password" name="confirm" className="form-input-v6" value={passwords.confirm} onChange={handlePassChange} placeholder="Synchronize key input..." />
                                </div>
                                <button type="submit" className="f-node-btn primary" style={{ width: '100%', height: '60px' }}>
                                    <FaShieldAlt /> INITIALIZE KEY ROTATION
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default FacultySettings;
