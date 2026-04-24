import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaEnvelope, FaUser, FaIdCard, FaGraduationCap, FaLayerGroup, FaUserGraduate, FaChalkboardTeacher, FaUserShield, FaArrowLeft, FaEye, FaEyeSlash, FaUserCircle, FaBook, FaLaptopCode, FaStar, FaChartLine, FaLightbulb, FaCog, FaDatabase } from 'react-icons/fa';
import { unifiedLogin, studentRegister } from '../../utils/apiClient';
import './LoginRegister.css';

const LoginRegister = ({
    setIsAuthenticated,
    setStudentData,
    setIsAdmin,
    setIsFaculty,
    setFacultyData,
    setIsAttendanceManager,
    setAttendanceManagerData,
    setIsScheduleManager,
    setScheduleManagerData,
    setIsAchievementManager,
    setAchievementManagerData,
    setIsAdmissionsManager,
    setAdmissionsManagerData,
    setIsEventsManager,
    setEventsManagerData,
    setIsFinanceManager,
    setFinanceManagerData,
    setIsHostelManager,
    setHostelManagerData,
    setIsLibraryManager,
    setLibraryManagerData,
    setIsTransportManager,
    setTransportManagerData,
    setIsPlacementManager,
    setPlacementManagerData,
    setIsResearchManager,
    setResearchManagerData,
}) => {
    const navigate = useNavigate();
    const [formToShow, setFormToShow] = useState('unifiedLogin'); // Single unified login form
    const [showPassword, setShowPassword] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState('Midnight');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [transitionStudentName, setTransitionStudentName] = useState('');
    const [otpStep, setOtpStep] = useState(false);
    const [resetIdentifier, setResetIdentifier] = useState('');
    const [resetRole, setResetRole] = useState('student');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // Form States
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        sid: '',
        name: '',
        year: '',
        section: '',
        branch: 'CSE'
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({
            email: '',
            password: '',
            sid: '',
            name: '',
            year: '',
            section: '',
            branch: 'CSE'
        });
        setError('');
        setOtpStep(false);
        setOtp('');
        setNewPassword('');
    };

    const handleAuthSuccess = (data, role) => {
        if (role === 'admin') {
            setIsAdmin(true);
            setIsAuthenticated(true);
        } else if (role === 'faculty') {
            const facultyInfo = data.facultyData || {};
            const roleMap = {
                'Attendance Manager': 'attendance_manager',
                'Schedule Manager': 'schedule_manager',
                'Achievement Manager': 'achievement_manager',
                'Admissions Manager': 'admissions_manager',
                'Events Manager': 'events_manager',
                'Finance Manager': 'finance_manager',
                'Hostel Manager': 'hostel_manager',
                'Library Manager': 'library_manager',
                'Transport Manager': 'transport_manager',
                'Placement Manager': 'placement_manager',
                'Research Manager': 'research_manager',
                'Faculty': 'faculty'
            };
            const storageRole = roleMap[facultyInfo.role] || 'faculty';

            window.localStorage.setItem('userData', JSON.stringify({ ...facultyInfo, role: storageRole }));
            if (data.token) window.localStorage.setItem('facultyToken', data.token);

            if (storageRole === 'attendance_manager') {
                setAttendanceManagerData({ ...facultyInfo, role: storageRole });
                setIsAttendanceManager(true);
            } else if (storageRole === 'schedule_manager') {
                setScheduleManagerData({ ...facultyInfo, role: storageRole });
                setIsScheduleManager(true);
            } else if (storageRole === 'achievement_manager') {
                setAchievementManagerData({ ...facultyInfo, role: storageRole });
                setIsAchievementManager(true);
            } else if (storageRole === 'admissions_manager') {
                setAdmissionsManagerData({ ...facultyInfo, role: storageRole });
                setIsAdmissionsManager(true);
            } else if (storageRole === 'events_manager') {
                setEventsManagerData({ ...facultyInfo, role: storageRole });
                setIsEventsManager(true);
            } else if (storageRole === 'finance_manager') {
                setFinanceManagerData({ ...facultyInfo, role: storageRole });
                setIsFinanceManager(true);
            } else if (storageRole === 'hostel_manager') {
                setHostelManagerData({ ...facultyInfo, role: storageRole });
                setIsHostelManager(true);
            } else if (storageRole === 'library_manager') {
                setLibraryManagerData({ ...facultyInfo, role: storageRole });
                setIsLibraryManager(true);
            } else if (storageRole === 'transport_manager') {
                setTransportManagerData({ ...facultyInfo, role: storageRole });
                setIsTransportManager(true);
            } else if (storageRole === 'placement_manager') {
                setPlacementManagerData({ ...facultyInfo, role: storageRole });
                setIsPlacementManager(true);
            } else if (storageRole === 'research_manager') {
                setResearchManagerData({ ...facultyInfo, role: storageRole });
                setIsResearchManager(true);
            } else {
                setFacultyData(facultyInfo);
                setIsFaculty(true);
            }
            setIsAuthenticated(true);
        } else if (role === 'student') {
            const studentName = data.studentData?.studentName || data.studentData?.name || formData.name || 'Student';
            setStudentData(data.studentData);
            setIsAuthenticated(true);
            setIsTransitioning(true);
            setTransitionStudentName(studentName);
            setTimeout(() => { navigate('/dashboard'); }, 3000);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await unifiedLogin(formData.email || formData.sid, formData.password);
            const role = res.userType || res.role || 'student';
            handleAuthSuccess(res, role);
        } catch (err) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const regData = {
                studentName: formData.name,
                sid: formData.sid,
                email: formData.email,
                year: formData.year,
                section: formData.section,
                branch: formData.branch,
                password: formData.password,
                avatar: selectedAvatar
            };
            const res = await studentRegister(regData);
            handleAuthSuccess(res, 'student');
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { apiPost } = await import('../../utils/apiClient');
            const res = await apiPost('/api/forgot-password', {
                identifier: resetIdentifier,
                role: resetRole
            });
            if (res.success) {
                setOtpStep(true);
                setFormData({ ...formData, email: res.email });
                if (res.otp) setOtp(res.otp); // Auto-fill for "Fast" response
                alert(res.message);
            }
        } catch (err) {
            setError(err.message || 'Failed to request password reset');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { apiPost } = await import('../../utils/apiClient');
            const res = await apiPost('/api/reset-password', {
                email: formData.email,
                otp: otp,
                newPassword: newPassword
            });
            if (res.success) {
                alert(res.message);
                setFormToShow('selection');
                resetForm();
            }
        } catch (err) {
            setError(err.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    const renderForm = () => {
        switch (formToShow) {
            case 'unifiedLogin':
                return (
                    <div className="inner-glass-panel animate-slide-up unified-login">
                        <div className="form-header">
                            <div className="role-avatar-mini">
                                <FaUserShield />
                            </div>
                            <h2>VU UniVerse360 Login</h2>
                            <p>Student • Faculty • Admin - All in One Portal</p>
                        </div>
                        {error && <div className="auth-error">{error}</div>}
                        <form className="auth-form" onSubmit={handleLogin}>
                            <div className="input-group">
                                <FaEnvelope className="input-icon" />
                                <input
                                    type="text"
                                    name="email"
                                    placeholder="ID / Email / Admin ID"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <FaLock className="input-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="Secure Password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                />
                                <div className="pwd-toggle" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </div>
                            </div>
                            <button type="submit" className="btn-primary-glow" disabled={loading}>
                                {loading ? 'Authenticating...' : 'Login to Portal'}
                            </button>
                            <div className="form-links">
                                <span onClick={() => setFormToShow('register')}>Create Student Account</span>
                                <span onClick={() => setFormToShow('forgotPassword')}>Forgot Password?</span>
                            </div>
                        </form>
                    </div>
                );

            case 'studentLogin':
            case 'facultyLogin':
            case 'adminLogin': {
                const roleName = formToShow.replace('Login', '');
                const RoleIcon = roleName === 'student' ? FaUserGraduate :
                    roleName === 'faculty' ? FaChalkboardTeacher : FaUserShield;
                const roleLabel = roleName.charAt(0).toUpperCase() + roleName.slice(1);
                return (
                    <div className={`inner-glass-panel animate-slide-up ${roleName}`}>
                        <button className="back-circle-btn" onClick={() => { setFormToShow('selection'); resetForm(); }}>
                            <FaArrowLeft />
                        </button>
                        <div className="form-header">
                            <div className="role-avatar-mini">
                                <RoleIcon />
                            </div>
                            <h2>{roleLabel} Login</h2>
                            <p>Vignan University Secure Portal</p>
                        </div>
                        {error && <div className="auth-error">{error}</div>}
                        <form className="auth-form" onSubmit={handleLogin}>
                            <div className="input-group">
                                <FaEnvelope className="input-icon" />
                                <input
                                    type="text"
                                    name="email"
                                    placeholder={roleName === 'admin' ? 'Admin ID' : roleName === 'faculty' ? 'Faculty ID / Email' : 'Student ID / Email'}
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <FaLock className="input-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="Secure Password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                />
                                <div className="pwd-toggle" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </div>
                            </div>
                            <button type="submit" className="btn-primary-glow" disabled={loading}>
                                {loading ? 'Authorizing...' : 'Authorize Access'}
                            </button>
                            <div className="form-links">
                                {roleName === 'student' && <span onClick={() => setFormToShow('register')}>Create Account</span>}
                                <span onClick={() => setFormToShow('forgotPassword')}>Forgot Password?</span>
                            </div>
                        </form>
                    </div>
                );
            }


            case 'register':
                return (
                    <div className="inner-glass-panel animate-slide-up registration-panel">
                        <button className="back-circle-btn" onClick={() => { setFormToShow('selection'); resetForm(); }}>
                            <FaArrowLeft />
                        </button>
                        <div className="form-header">
                            <h2>Join Academy</h2>
                            <p>Personalize your student identity.</p>
                        </div>
                        {error && <div className="auth-error">{error}</div>}
                        <div className="avatar-grid-v2">
                            {['Midnight', 'Aria', 'Jasper', 'Sasha', 'Leo'].map((name, index) => {
                                const icons = [<FaUserGraduate />, <FaChalkboardTeacher />, <FaUserShield />, <FaIdCard />, <FaUserCircle />];
                                return (
                                    <div
                                        key={name}
                                        className={`reg-avatar-icon ${selectedAvatar === name ? 'active' : ''}`}
                                        onClick={() => setSelectedAvatar(name)}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'var(--primary)', opacity: 0.8 }}
                                    >
                                        {icons[index % icons.length]}
                                    </div>
                                );
                            })}
                        </div>
                        <form className="auth-form" onSubmit={handleRegister}>
                            <div className="input-group">
                                <FaUser className="input-icon" />
                                <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleInputChange} required />
                            </div>
                            <div className="input-group">
                                <FaIdCard className="input-icon" />
                                <input type="text" name="sid" placeholder="Student ID (e.g. 23VF...)" value={formData.sid} onChange={handleInputChange} required />
                            </div>
                            <div className="input-row">
                                <div className="input-group field-half">
                                    <FaGraduationCap className="input-icon" />
                                    <input type="text" name="year" placeholder="Year" value={formData.year} onChange={handleInputChange} required />
                                </div>
                                <div className="input-group field-half">
                                    <FaLayerGroup className="input-icon" />
                                    <input type="text" name="section" placeholder="Section" value={formData.section} onChange={handleInputChange} required />
                                </div>
                            </div>
                            <div className="input-group">
                                <FaLayerGroup className="input-icon" />
                                <select name="branch" value={formData.branch} onChange={handleInputChange} required className="branch-select">
                                    <option value="CSE">CSE</option>
                                    <option value="ECE">ECE</option>
                                    <option value="AIML">AIML</option>
                                    <option value="IT">IT</option>
                                    <option value="EEE">EEE</option>
                                    <option value="MECH">MECH</option>
                                    <option value="CIVIL">CIVIL</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <FaEnvelope className="input-icon" />
                                <input type="email" name="email" placeholder="Institutional Email" value={formData.email} onChange={handleInputChange} required />
                            </div>
                            <div className="input-group">
                                <FaLock className="input-icon" />
                                <input type="password" name="password" placeholder="Create Password" value={formData.password} onChange={handleInputChange} required />
                            </div>
                            <button type="submit" className="btn-primary-glow" disabled={loading}>
                                {loading ? 'Creating Account...' : 'Register Account'}
                            </button>
                        </form>
                    </div>
                );

            case 'forgotPassword':
                return (
                    <div className="inner-glass-panel animate-slide-up">
                        <button className="back-circle-btn" onClick={() => { setFormToShow('selection'); resetForm(); }}>
                            <FaArrowLeft />
                        </button>
                        <div className="form-header">
                            <div className="role-avatar-mini">
                                <FaLock />
                            </div>
                            <h2>Password Recovery</h2>
                            <p>{otpStep ? "Enter the verification code sent to your email" : "Generate a verification code to reset your password"}</p>
                        </div>
                        {error && <div className="auth-error">{error}</div>}

                        {!otpStep ? (
                            <form className="auth-form" onSubmit={handleForgotPassword}>
                                <div className="input-group">
                                    <FaUserShield className="input-icon" />
                                    <select className="branch-select" value={resetRole} onChange={(e) => setResetRole(e.target.value)} required style={{ background: 'var(--panel-bg)', color: '#fff', padding: '12px 12px 12px 50px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', width: '100%' }}>
                                        <option value="student">Student Account</option>
                                        <option value="faculty">Faculty Account</option>
                                        <option value="admin">Administrator Account</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <FaIdCard className="input-icon" />
                                    <input
                                        type="text"
                                        placeholder="Enter your ID or Email"
                                        value={resetIdentifier}
                                        onChange={(e) => setResetIdentifier(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn-primary-glow" disabled={loading}>
                                    {loading ? 'Processing...' : 'Send Verification Code'}
                                </button>
                            </form>
                        ) : (
                            <form className="auth-form" onSubmit={handleResetPassword}>
                                <div className="input-group">
                                    <FaLock className="input-icon" />
                                    <input
                                        type="text"
                                        placeholder="6-Digit Verification Code"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <FaLock className="input-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="New Secure Password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                    <div className="pwd-toggle" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </div>
                                </div>
                                <button type="submit" className="btn-primary-glow" disabled={loading}>
                                    {loading ? 'Updating Password...' : 'Create New Password'}
                                </button>
                            </form>
                        )}
                    </div>
                );

            default:
                return (
                    <div className="selection-content">
                        <div className="hero-section animate-slide-up">
                            <h1 className="hero-title">
                                {"Vu UniVerse360".split("").map((char, index) => (
                                    <span
                                        key={index}
                                        className="letter-3d-login"
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        {char === " " ? "\u00A0" : char}
                                    </span>
                                ))}
                            </h1>
                            <p className="hero-subtitle">Welcome to Your Learning Space</p>
                        </div>

                        <div className="modern-role-grid">
                            <div className="modern-role-card student" onClick={() => { setFormToShow('studentLogin'); resetForm(); }}>
                                <div className="role-icon-wrapper live-avatar-canvas">
                                    <div className="avatar-backdrop"></div>
                                    <div className="live-avatar-core pupil-core">
                                        <FaUserGraduate className="core-icon" />
                                    </div>
                                    <div className="orbit-track track-1">
                                        <div className="orbit-item item-a"><FaBook /></div>
                                    </div>
                                    <div className="orbit-track track-2">
                                        <div className="orbit-item item-b"><FaLaptopCode /></div>
                                    </div>
                                    <div className="orbit-track track-3">
                                        <div className="orbit-item item-c"><FaStar /></div>
                                    </div>
                                </div>
                                <div className="role-content">
                                    <h3>Student Portal</h3>
                                    <p>Access notes, labs and real-time analytics.</p>
                                </div>
                                <div className="role-action-btn">Enter Workspace</div>
                            </div>

                            <div className="modern-role-card faculty" onClick={() => { setFormToShow('facultyLogin'); resetForm(); }}>
                                <div className="role-icon-wrapper live-avatar-canvas">
                                    <div className="avatar-backdrop"></div>
                                    <div className="live-avatar-core prof-core">
                                        <FaChalkboardTeacher className="core-icon" />
                                    </div>
                                    <div className="orbit-track track-1">
                                        <div className="orbit-item item-a"><FaChartLine /></div>
                                    </div>
                                    <div className="orbit-track track-2">
                                        <div className="orbit-item item-b"><FaLightbulb /></div>
                                    </div>
                                    <div className="orbit-track track-3">
                                        <div className="orbit-item item-c"><FaBook /></div>
                                    </div>
                                </div>
                                <div className="role-content">
                                    <h3>Faculty & Manager Hub</h3>
                                    <p>Faculty & Specialized Managers — manage curriculum, achievements, and drives.</p>
                                </div>
                                <div className="role-action-btn">Manage Portal</div>
                            </div>

                            <div className="modern-role-card admin" onClick={() => { setFormToShow('adminLogin'); resetForm(); }}>
                                <div className="role-icon-wrapper live-avatar-canvas">
                                    <div className="avatar-backdrop"></div>
                                    <div className="live-avatar-core admin-core">
                                        <FaUserShield className="core-icon" />
                                    </div>
                                    <div className="orbit-track track-1">
                                        <div className="orbit-item item-a"><FaCog /></div>
                                    </div>
                                    <div className="orbit-track track-2">
                                        <div className="orbit-item item-b"><FaDatabase /></div>
                                    </div>
                                    <div className="orbit-track track-3">
                                        <div className="orbit-item item-c"><FaLock /></div>
                                    </div>
                                </div>
                                <div className="role-content">
                                    <h3>Admin Central</h3>
                                    <p>System control and organizational management.</p>
                                </div>
                                <div className="role-action-btn">Authorize</div>
                            </div>
                        </div>


                        <div className="selection-footer animate-slide-up">
                            <div>Next-Gen Academy Portal • 2026</div>
                            <div className="creator-credit" style={{ marginTop: '0.8rem', opacity: 0.8, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                Created by <span style={{ fontWeight: 800, color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>Bobbymartin <span style={{ color: '#fbce37' }}>♛</span></span>
                            </div>
                        </div>
                    </div>
                );
        }
    };


    const isFormActive = formToShow !== 'selection';

    return (
        <div className="modern-auth-wrapper">
            {/* Enhanced Transition Overlay */}
            {isTransitioning && (
                <div className="login-transition-overlay-enhanced">
                    <div className="transition-background">
                        <div className="particles">
                            <div className="particle particle-1"></div>
                            <div className="particle particle-2"></div>
                            <div className="particle particle-3"></div>
                            <div className="particle particle-4"></div>
                            <div className="particle particle-5"></div>
                            <div className="particle particle-6"></div>
                        </div>
                    </div>

                    <div className="transition-content-enhanced">
                        <div className="person-avatars-container">
                            <div className="avatar-wrapper avatar-1">
                                <FaUserCircle className="person-avatar avatar-icon-1" />
                                <div className="avatar-glow glow-1"></div>
                            </div>
                            <div className="avatar-wrapper avatar-2">
                                <FaUserCircle className="person-avatar avatar-icon-2" />
                                <div className="avatar-glow glow-2"></div>
                            </div>
                            <div className="avatar-wrapper avatar-3">
                                <FaUserCircle className="person-avatar avatar-icon-3" />
                                <div className="avatar-glow glow-3"></div>
                            </div>
                        </div>

                        <div className="student-welcome-section">
                            <div className="welcome-title">
                                <span className="welcome-text">Welcome Back</span>
                                <div className="title-underline"></div>
                            </div>
                            <div className="student-name-enhanced">
                                <span className="name-text">{transitionStudentName}</span>
                                <div className="name-sparkle sparkle-1"></div>
                                <div className="name-sparkle sparkle-2"></div>
                                <div className="name-sparkle sparkle-3"></div>
                            </div>
                        </div>

                        <div className="loading-section">
                            <div className="progress-container">
                                <div className="progress-track">
                                    <div className="progress-fill"></div>
                                </div>
                                <div className="progress-text">Preparing Dashboard</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="academic-bg">
                <div className="glowing-orb orb-1"></div>
                <div className="glowing-orb orb-2"></div>

                <div className="knowledge-particle" style={{ top: '5%', left: '8%' }}>🧪</div>
                <div className="knowledge-particle" style={{ top: '15%', right: '12%', animationDelay: '-2s' }}>🧬</div>
                <div className="knowledge-particle" style={{ top: '45%', left: '4%', animationDelay: '-5s' }}>🔬</div>
                <div className="knowledge-particle" style={{ top: '65%', right: '8%', animationDelay: '-8s' }}>⚛️</div>
                <div className="knowledge-particle" style={{ top: '10%', left: '40%', animationDelay: '-12s' }}>📖</div>
                <div className="knowledge-particle" style={{ bottom: '8%', left: '15%', animationDelay: '-3s' }}>🧠</div>
                <div className="knowledge-particle" style={{ bottom: '15%', right: '25%', animationDelay: '-6s' }}>⚖️</div>
                <div className="knowledge-particle" style={{ top: '35%', right: '4%', animationDelay: '-10s' }}>🛰️</div>
            </div>

            {isFormActive ? (
                renderForm()
            ) : (
                <div className="auth-card-container">
                    {renderForm()}
                </div>
            )}
        </div>
    );
};

export default LoginRegister;
