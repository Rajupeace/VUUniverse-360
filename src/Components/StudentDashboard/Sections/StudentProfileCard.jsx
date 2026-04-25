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
            className="profile-card-minimal"
            style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                borderRadius: '30px',
                padding: '2rem 1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative'
            }}
        >
            <div className="profile-avatar-wrapper" onClick={() => setView('settings')}>
                <div className="profile-avatar-inner">
                    {uploading ? (
                        <FaSpinner className="spinner" />
                    ) : (
                        <img
                            src={resolveImageUrl(userData?.profileImage || userData?.profilePic || userData?.avatar, userData?.studentName)}
                            alt="Profile"
                            className="profile-img"
                        />
                    )}
                    <div className="avatar-hover-ring" />
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                    style={{ display: 'none' }} 
                    accept="image/*" 
                />
            </div>

            <div className="profile-basic-info">
                <h3 className="profile-name-minimal">{userData?.studentName || 'Student'}</h3>
                <span className="profile-id-minimal">{userData?.sid?.toUpperCase()}</span>
            </div>

            <div className="profile-grid-minimal">
                <div className="minimal-pill">
                    <span className="minimal-label">SECTION</span>
                    <span className="minimal-value">{userData?.section || 'A'}</span>
                </div>
                <div className="minimal-pill">
                    <span className="minimal-label">YEAR</span>
                    <span className="minimal-value">{userData?.year || '1'}</span>
                </div>
            </div>

            <button className="minimal-edit-btn" onClick={() => setView('settings')}>
                <FaPen size={10} /> EDIT PROFILE
            </button>
        </motion.div>
    );
};

export default StudentProfileCard;
