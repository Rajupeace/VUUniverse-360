import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrophy, FaFileAlt, FaCloudUploadAlt, FaStar, FaSchool, FaMapMarkerAlt, FaPenNib, FaLink, FaCalendarAlt, FaTimes } from 'react-icons/fa';
import { apiPost } from '../../utils/apiClient';
import './StudentAchievements.css';

const StudentAchievementForm = ({ studentData, onSuccess }) => {
    const [uploadType, setUploadType] = useState(null); // 'achievement' | 'document' | null
    const [formData, setFormData] = useState({
        title: '',
        category: 'Technical',
        level: 'College Level',
        achievementType: 'Individual',
        position: 'Winner',
        rank: '',
        achievementDate: '',
        description: '',
        eventName: '',
        organizingInstitution: '',
        eventLocation: '',
        eventMode: 'Offline',
        resultLink: ''
    });

    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef(null);

    const isPersonalDoc = uploadType === 'document';

    const handleSelectType = (type) => {
        setUploadType(type);
        if (type === 'document') {
            setFormData(prev => ({
                ...prev,
                category: 'Personal Document',
                level: 'College Level',
                achievementType: 'Individual',
                position: 'Winner'
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                category: 'Technical'
            }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length + files.length > 5) {
            setError('Maximum 5 files allowed');
            return;
        }
        setFiles(prev => [...prev, ...selectedFiles]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (files.length === 0) {
            setError('Please upload at least one document as evidence.');
            return;
        }

        setLoading(true);

        try {
            const submitData = new FormData();
            submitData.append('studentId', studentData._id || studentData.id);
            submitData.append('rollNumber', studentData.sid);
            submitData.append('studentName', studentData.studentName);
            submitData.append('department', studentData.branch);
            submitData.append('year', studentData.year);
            submitData.append('section', studentData.section);

            Object.keys(formData).forEach(key => {
                let val = formData[key];
                if (isPersonalDoc) {
                    if (key === 'level' && !val) val = 'College Level';
                    if (key === 'position' && !val) val = 'Participation';
                    if (key === 'achievementDate' && !val) val = new Date().toISOString().split('T')[0];
                }
                if (val) submitData.append(key, val);
            });

            files.forEach((file, index) => {
                submitData.append('documents', file);
            });

            const response = await apiPost('/api/achievements/submit', submitData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.success) {
                setSuccess('Achievement successfully submitted for verification!');
                setFormData({
                    title: '',
                    category: 'Technical',
                    level: 'College Level',
                    achievementType: 'Individual',
                    position: 'Winner',
                    rank: '',
                    achievementDate: '',
                    description: '',
                    eventName: '',
                    organizingInstitution: '',
                    eventLocation: '',
                    eventMode: 'Offline',
                    resultLink: ''
                });
                setFiles([]);
                setTimeout(() => {
                    setSuccess('');
                    setUploadType(null);
                    if (onSuccess) onSuccess();
                }, 2500);
            } else {
                setError(response.message || 'Submission failed');
            }
        } catch (err) {
            setError(err.message || 'An error occurred during submission');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="achievement-form-container"
        >
            <div className="nexus-mesh-bg"></div>

            {!uploadType ? (
                <div className="upload-type-selector">
                    <h2><span style={{ color: 'var(--ach-primary)' }}>SELECT</span> UPLOAD TYPE</h2>
                    <p className="selector-subtitle">Choose what you want to add to your profile</p>

                    <div className="type-cards-grid">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="type-select-card"
                            onClick={() => handleSelectType('achievement')}
                        >
                            <div className="type-icon"><FaTrophy /></div>
                            <h3>Academic Achievement</h3>
                            <p>Certificates, Awards, Hackathons, Publications</p>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="type-select-card personal-doc"
                            onClick={() => handleSelectType('document')}
                        >
                            <div className="type-icon"><FaFileAlt /></div>
                            <h3>Personal Document</h3>
                            <p>ID Cards, Transcripts, Skills Proof</p>
                        </motion.button>
                    </div>
                </div>
            ) : (
                <div className="form-inner-wrapper">
                    <div className="form-header-v2">
                        <button className="back-btn" onClick={() => setUploadType(null)}><FaTimes /></button>
                        <h2><FaTrophy style={{ color: 'var(--ach-warning)' }} /> {isPersonalDoc ? 'ARCHIVE PERSONAL DOCUMENT' : 'ADD NEW ACHIEVEMENT RECORD'}</h2>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="error-message">
                                {error}
                            </motion.div>
                        )}
                        {success && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="success-message">
                                ✅ {success}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="achievement-form">
                        <div className="form-section">
                            <h3><FaStar /> {isPersonalDoc ? 'DOCUMENT DETAILS' : 'ACHIEVEMENT IDENTITY'}</h3>

                            <div className="form-group">
                                <label>{isPersonalDoc ? 'Select Document Type' : 'Honor Title'}</label>
                                {isPersonalDoc ? (
                                    <select name="title" value={formData.title} onChange={handleChange} required>
                                        <option value="" disabled>-- Select Document --</option>
                                        <option value="Aadhar Card">Aadhar Card</option>
                                        <option value="PAN Card">PAN Card</option>
                                        <option value="Voter ID">Voter ID</option>
                                        <option value="Passport">Passport</option>
                                        <option value="10th Marksheet">10th Marksheet</option>
                                        <option value="12th Marksheet">12th Marksheet</option>
                                        <option value="Diploma/Degree Certificate">Diploma/Degree Certificate</option>
                                        <option value="Residing Certificate">Residing Certificate</option>
                                        <option value="Caste Certificate">Caste Certificate</option>
                                        <option value="Other">Other Document</option>
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="e.g., Grand Winner of National Design Challenge"
                                        required
                                    />
                                )}
                            </div>

                            {!isPersonalDoc && (
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Domain Category</label>
                                        <select name="category" value={formData.category} onChange={handleChange} required>
                                            <option value="Technical">Technical / Coding</option>
                                            <option value="Sports">Sports / Athletics</option>
                                            <option value="Cultural">Arts / Cultural</option>
                                            <option value="Academics">Academic Excellence</option>
                                            <option value="Social">Social / Volunteering</option>
                                            <option value="NSS/NCC">NSS / NCC</option>
                                            <option value="Other">Miscellaneous</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Global Level</label>
                                        <select name="level" value={formData.level} onChange={handleChange} required>
                                            <option value="College Level">Intra-College</option>
                                            <option value="Inter-College">Inter-Institutional</option>
                                            <option value="State Level">Regional / State</option>
                                            <option value="National Level">National Impact</option>
                                            <option value="International Level">Global / International</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {!isPersonalDoc && (
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Engagement Type</label>
                                        <select name="achievementType" value={formData.achievementType} onChange={handleChange} required>
                                            <option value="Individual">Solo Achievement</option>
                                            <option value="Team">Collaborative Team</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Validation Rank</label>
                                        <select name="position" value={formData.position} onChange={handleChange} required>
                                            <option value="Winner">First Place / Winner</option>
                                            <option value="Runner-up">Runner-up / Second</option>
                                            <option value="Participation">Official Delegate</option>
                                            <option value="Rank">Numeric Ranking</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {!isPersonalDoc && (
                                <div className="form-group">
                                    <label><FaCalendarAlt /> Date of Distinction</label>
                                    <input
                                        type="date"
                                        name="achievementDate"
                                        value={formData.achievementDate}
                                        onChange={handleChange}
                                        max={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        {!isPersonalDoc && (
                            <div className="form-section">
                                <h3><FaSchool /> HOST & LOGISTICS</h3>
                                <div className="form-group">
                                    <label>Prime Event Name</label>
                                    <input
                                        type="text"
                                        name="eventName"
                                        value={formData.eventName}
                                        onChange={handleChange}
                                        placeholder="e.g., Nexus Global Hackathon Phase II"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Hosting Organization</label>
                                    <input
                                        type="text"
                                        name="organizingInstitution"
                                        value={formData.organizingInstitution}
                                        onChange={handleChange}
                                        placeholder="e.g., Google Cloud Community India"
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label><FaMapMarkerAlt /> Deployment Location</label>
                                        <input
                                            type="text"
                                            name="eventLocation"
                                            value={formData.eventLocation}
                                            onChange={handleChange}
                                            placeholder="Virtual / On-site"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Protocol Mode</label>
                                        <select name="eventMode" value={formData.eventMode} onChange={handleChange}>
                                            <option value="Online">Cloud (Online)</option>
                                            <option value="Offline">Physical (Offline)</option>
                                            <option value="Hybrid">Hybrid / Phygital</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="form-section">
                            <h3><FaPenNib /> NARRATIVE & LINKS</h3>
                            <div className="form-group">
                                <label>Impact Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Share the details..."
                                />
                            </div>
                            {!isPersonalDoc && (
                                <div className="form-group">
                                    <label><FaLink /> Public Result Link (Optional)</label>
                                    <input
                                        type="url"
                                        name="resultLink"
                                        value={formData.resultLink}
                                        onChange={handleChange}
                                        placeholder="https://nexus.com/certificate/verify"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="form-section">
                            <h3><FaCloudUploadAlt /> VERIFICATION ASSETS</h3>
                            <div className="file-upload-zone" onClick={() => fileInputRef.current.click()}>
                                <FaCloudUploadAlt style={{ fontSize: '3rem', color: 'var(--ach-primary)', marginBottom: '1rem' }} />
                                <p style={{ fontWeight: 850 }}>TAP TO UPLOAD EVIDENCE / DOCUMENTS</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--ach-text-light)' }}>PDF / PNG / JPG allowed (Max: 5MB)</p>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    multiple
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileChange}
                                />
                            </div>

                            <AnimatePresence>
                                {files.length > 0 && (
                                    <div className="file-list">
                                        {files.map((file, index) => (
                                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={index} className="file-item">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <FaFileAlt />
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{file.name}</span>
                                                </div>
                                                <button type="button" onClick={() => removeFile(index)} className="remove-btn"><FaTimes /></button>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-submit" disabled={loading || !!success}>
                                {loading ? 'PROCESSING...' : success ? 'SUBMITTED!' : 'SAVE RECORD'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </motion.div>
    );
};

export default StudentAchievementForm;
