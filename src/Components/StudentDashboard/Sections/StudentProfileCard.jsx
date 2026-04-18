import React from 'react';
import { FaIdBadge, FaPen, FaBus, FaHome } from 'react-icons/fa';
import './StudentProfileCard.css';
import { motion } from 'framer-motion';
import { resolveImageUrl, apiUpload, apiPut } from '../../../utils/apiClient';
import { FaCamera, FaSpinner } from 'react-icons/fa';

/**
 * Student Profile Card V4
 * Premium Glassmorphism Identity Card
 */
const StudentProfileCard = ({ userData, setView, onProfileUpdate }) => {
    const [uploading, setUploading] = React.useState(false);
    const fileInputRef = React.useRef(null);

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
                const updateRes = await apiPut(`/api/students/profile/${userData.sid}`, {
                    ...userData,
                    profilePic: newPic,
                    profileImage: newPic
                });

                if (updateRes.success) {
                    if (onProfileUpdate) onProfileUpdate({
                        ...userData,
                        profilePic: newPic,
                        profileImage: newPic
                    });
                }
            }
        } catch (err) {
            console.error('Profile pic upload failed:', err);
        } finally {
            setUploading(false);
        }
    };
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="profile-card"
            style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                padding: '1.5rem',
                border: '1px solid rgba(255,255,255,0.5)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '6px', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }}></div>

            <div
                className="profile-avatar-container"
                onClick={() => setView('settings')}
                style={{ position: 'relative', marginBottom: '1rem', cursor: 'pointer' }}
            >
                <div className="profile-avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden', background: '#f1f5f9', position: 'relative' }}>
                    {uploading ? (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.8)' }}>
                            <FaSpinner className="spinner" />
                        </div>
                    ) : (
                        <img
                            src={resolveImageUrl(userData?.profileImage || userData?.profilePic || userData?.avatar, userData?.studentName)}
                            alt="Profile"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData?.studentName || 'Student'}`;
                            }}
                            className="profile-img"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    )}
                    <div 
                        className="avatar-edit-overlay" 
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                        style={{ 
                            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            color: 'white', opacity: 0, transition: 'opacity 0.2s', fontSize: '1.2rem' 
                        }}
                    >
                        <FaCamera />
                    </div>
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                    style={{ display: 'none' }} 
                    accept="image/*" 
                />
                <div className="profile-status-dot pulse" title="Active" style={{ position: 'absolute', bottom: '5px', right: '5px', width: '14px', height: '14px', background: '#10b981', borderRadius: '50%', border: '2px solid white', zIndex: 10 }}></div>
                <div style={{ position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>
                    {userData?.isTransportUser && (
                        <div title="Transport User" style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', border: '2.5px solid white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                            <FaBus style={{ fontSize: '0.7rem' }} />
                        </div>
                    )}
                    {userData?.isHosteller && (
                        <div title="Hosteller" style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f59e0b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', border: '2.5px solid white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                            <FaHome style={{ fontSize: '0.7rem' }} />
                        </div>
                    )}
                </div>
            </div>

            <div className="profile-info" style={{ width: '100%' }}>
                <h3 style={{ margin: '0 0 0.2rem 0', fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>{userData?.studentName || 'Student'}</h3>
                <div className="profile-id" style={{ alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600, background: '#f8fafc', padding: '0.2rem 0.6rem', borderRadius: '12px', display: 'inline-flex', marginBottom: '1rem' }}>
                    <FaIdBadge /> {userData?.sid ? userData.sid.toUpperCase() : 'ID'}
                </div>
                {userData?.bio && (
                    <p className="profile-bio" style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 1rem 0', fontStyle: 'italic', lineHeight: 1.4, padding: '0 0.5rem' }}>
                        "{userData.bio}"
                    </p>
                )}
            </div>

            <div className="profile-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', width: '100%' }}>
                <div className="nexus-info-pill" style={{ background: 'white', padding: '0.6rem', borderRadius: '12px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span className="pill-label" style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' }}>BRANCH & SEC</span>
                    <span className="pill-value" style={{ fontSize: '0.9rem', fontWeight: 800, color: '#334155' }}>
                        {userData?.branch || 'General'} - {userData?.section || 'A'}
                    </span>
                </div>
                <div className="nexus-info-pill" style={{ background: 'white', padding: '0.6rem', borderRadius: '12px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span className="pill-label" style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' }}>PERIOD</span>
                    <span className="pill-value" style={{ fontSize: '0.9rem', fontWeight: 800, color: '#334155' }}>Year {userData?.year || '1'}</span>
                </div>
            </div>

            <button
                className="nexus-logout-btn"
                style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    background: 'white', color: '#475569', border: '1px solid #e2e8f0',
                    marginTop: '1rem', padding: '0.6rem', borderRadius: '10px',
                    fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s'
                }}
                onClick={() => setView('settings')}
            >
                <FaPen size={12} /> Edit Profile
            </button>
            <div style={{ marginTop: '1rem', fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>
                LAST SYNC: {userData?.updatedAt ? new Date(userData.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TODAY'}
            </div>
        </motion.div>
    );
};

export default StudentProfileCard;
