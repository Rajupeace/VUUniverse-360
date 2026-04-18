import React, { useState, useEffect } from 'react';
import { FaLock, FaArrowLeft, FaUser, FaEnvelope, FaIdCard, FaCalendarAlt, FaUserEdit } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import './PasswordSettings.css';
import { resolveImageUrl } from '../../utils/apiClient';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Standard Section Options
const alphaSections = Array.from({ length: 16 }, (_, i) => String.fromCharCode(65 + i)); // A-P
const numSections = Array.from({ length: 20 }, (_, i) => String(i + 1)); // 1-20
const SECTION_OPTIONS = [...alphaSections, ...numSections];

const PasswordSettings = ({ onBack, onProfileUpdate, userData }) => {
  // Profile state
  const [profile, setProfile] = useState({
    name: userData?.studentName || '',
    email: userData?.email || '',
    studentId: userData?.sid || '',
    year: userData?.year || 1,
    branch: userData?.branch || 'CSE',
    section: userData?.section || 'A',
    profilePic: userData?.profilePic || ''
  });

  // Keep state in sync if userData prop changes
  useEffect(() => {
    if (userData) {
      setProfile({
        name: userData.studentName || '',
        email: userData.email || '',
        studentId: userData.sid || '',
        year: userData.year || 1,
        branch: userData.branch || 'CSE',
        section: userData.section || 'A',
        profilePic: userData.profilePic || ''
      });
    }
  }, [userData]);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'password'
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState(null);

  // Reset token when component unmounts or user goes back
  useEffect(() => {
    if (!showForgotPassword) {
      setResetToken(null);
    }
  }, [showForgotPassword]);

  // Handle profile field changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      setIsLoading(true);
      // Use new student endpoint
      await axios.put(`${API_BASE}/api/students/change-password/${profile.studentId}`, {
        currentPassword,
        newPassword
      });
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_BASE}/api/auth/forgot-password`, { email });
      if (response.data.resetToken) {
        setResetToken(response.data.resetToken); // If backend implements token immediate return
        toast.success('Please enter your new password');
      } else {
        toast.success(response.data.message || 'Password reset link sent');
        setShowForgotPassword(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  // Save profile changes
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      const updatedUser = {
        ...profile,
        studentName: profile.name, // Mapping back to schema
        sid: profile.studentId,
        year: parseInt(profile.year, 10)
      };

      // 1. Update Backend (Mongo/File)
      // Use the ID from the prop (current ID in DB) to find the record
      const currentSid = userData?.sid || profile.studentId;
      await axios.put(`${API_BASE}/api/students/profile/${currentSid}`, updatedUser);

      // 2. Update Local Storage for Session
      const currentUser = JSON.parse(localStorage.getItem('user')) || {};
      const mergedUser = { ...currentUser, ...updatedUser };

      localStorage.setItem('user', JSON.stringify(mergedUser));
      localStorage.setItem('studentData', JSON.stringify(mergedUser)); // Backup key

      toast.success('Profile updated successfully!');

      // 3. Notify Parent
      if (onProfileUpdate) {
        onProfileUpdate(mergedUser);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <button onClick={onBack} className="back-button">
        <FaArrowLeft /> Back to Dashboard
      </button>

      <div className="settings-card">
        <div className="settings-tabs">
          <button
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <FaUser /> Profile
          </button>
          <button
            className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <FaLock /> Password
          </button>
        </div>

        {activeTab === 'profile' ? (
          <form onSubmit={handleSaveProfile} className="profile-form">
            <h2><FaUser /> Edit Profile</h2>

            {/* Avatar Section */}
            <div className="form-group avatar-selection-section">
              <label>Profile Avatar</label>

              {/* Current Avatar Preview with File Input */}
              <div className="avatar-preview-container">
                <div className="avatar-main-box">
                    <img
                      src={resolveImageUrl(profile.profilePic, profile.name || 'User')}
                      alt="Current Profile"
                      className="avatar-img-main"
                    />
                  <label htmlFor="avatar-upload" className="avatar-upload-trigger">
                    <FaUserEdit size={14} />
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setProfile(prev => ({ ...prev, profilePic: reader.result }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
                <span className="avatar-hint">Click pencil to upload your photo</span>
              </div>

              <div className="avatar-divider"></div>
              <label className="avatar-choice-label">Or Choose an Avatar</label>
              <div className="avatar-choice-grid">
                {['https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
                  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
                  'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
                  'https://api.dicebear.com/7.x/avataaars/svg?seed=Caitlyn',
                  'https://api.dicebear.com/7.x/avataaars/svg?seed=Dieter',
                  'https://api.dicebear.com/7.x/avataaars/svg?seed=Evelyn',
                  'https://api.dicebear.com/7.x/avataaars/svg?seed=Flo',
                  'https://api.dicebear.com/7.x/avataaars/svg?seed=Gunnar',
                  'https://api.dicebear.com/7.x/avataaars/svg?seed=Heidi',
                  'https://api.dicebear.com/7.x/avataaars/svg?seed=Ivan'].map((u, i) => (
                    <img
                      key={i}
                      src={u}
                      alt="avatar"
                      className={`avatar-choice-img ${profile.profilePic === u ? 'selected' : ''}`}
                      onClick={() => setProfile({ ...profile, profilePic: u })}
                    />
                  ))}
              </div>
            </div>

            <div className="form-group">
              <label><FaUser /> Full Name</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label><FaIdCard /> Student ID</label>
                <input
                  type="text"
                  name="studentId"
                  value={profile.studentId}
                  onChange={handleProfileChange}
                  required
                  placeholder="Enter student ID"
                />
              </div>

              <div className="form-group">
                <label><FaCalendarAlt /> Year</label>
                <select
                  name="year"
                  value={profile.year}
                  onChange={handleProfileChange}
                  className="form-control"
                >
                  {[1, 2, 3, 4].map(year => (
                    <option key={year} value={year}>Year {year}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Branch</label>
                <select
                  name="branch"
                  value={profile.branch}
                  onChange={handleProfileChange}
                  className="form-control"
                >
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="MECH">MECH</option>
                  <option value="CIVIL">CIVIL</option>
                </select>
              </div>

              <div className="form-group">
                <label>Section</label>
                <select
                  name="section"
                  value={profile.section}
                  onChange={handleProfileChange}
                  className="form-control"
                >
                  {SECTION_OPTIONS.map(s => (
                    <option key={s} value={s}>Section {s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label><FaEnvelope /> Email</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                required
                placeholder="Enter your email"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        ) : (
          <div className="password-section">
            <h2><FaLock /> Change Password</h2>
            {!showForgotPassword && !resetToken ? (
              <form onSubmit={handlePasswordChange} className="password-form">
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="Enter current password"
                  />
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength="8"
                    placeholder="Enter new password (min 8 characters)"
                  />
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm new password"
                  />
                </div>

                <button type="submit" className="btn-primary" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update Password'}
                </button>

                <div className="forgot-password-link">
                  <button
                    type="button"
                    className="text-link"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot your password?
                  </button>
                </div>
              </form>
            ) : (
              <form
                onSubmit={resetToken ? handlePasswordChange : handleForgotPassword}
                className="forgot-password-form"
              >
                {!resetToken ? (
                  <>
                    <p>Enter your email address and we'll send you a link to reset your password.</p>

                    <div className="form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Enter your email"
                      />
                    </div>

                    <button type="submit" className="btn-primary" disabled={isLoading}>
                      {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>

                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setEmail('');
                      }}
                    >
                      Back to Login
                    </button>
                  </>
                ) : (
                  <>
                    <p>Please enter your new password.</p>

                    <div className="form-group">
                      <label>New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength="8"
                        placeholder="Enter new password (min 8 characters)"
                      />
                    </div>

                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="Confirm new password"
                      />
                    </div>

                    <button type="submit" className="btn-primary" disabled={isLoading}>
                      {isLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </>
                )}
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordSettings;
