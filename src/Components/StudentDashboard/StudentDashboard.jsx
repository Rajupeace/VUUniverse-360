import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiGet } from '../../utils/apiClient';
import sseClient from '../../utils/sseClient';
import {
    FaChartBar, FaLayerGroup, FaRobot, FaBriefcase, FaBars
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import VuAiAgent from '../VuAiAgent/VuAiAgent';

// Sections
import StudentSidebar from './Sections/StudentSidebar';
import StudentProfileCard from './Sections/StudentProfileCard';
import AcademicBrowser from './Sections/AcademicBrowser';
import SemesterNotes from './Sections/SemesterNotes';
import SubjectAttendanceMarks from './Sections/SubjectAttendanceMarks';
import StudentResults from './Sections/StudentResults';
import AdvancedLearning from './Sections/AdvancedLearning';
import StudentHeader from './Sections/StudentHeader';

import StudentExams from './StudentExams';
import StudentAchievementForm from '../StudentAchievements/StudentAchievementForm';
import StudentAchievementsList from '../StudentAchievements/StudentAchievementsList';
import StudentFacultyList from './StudentFacultyList';
import StudentSchedule from './StudentSchedule';
import PlacementPrep from './Sections/PlacementPrep';
import StudentRoadmaps from './Sections/StudentRoadmaps';
import StudentAnnouncements from './Sections/StudentAnnouncements';
import StudentSettings from './Sections/StudentSettings';
import StudentSupport from './Sections/StudentSupport';
import { getYearData } from './branchData';
import AcademicPulse from './AcademicPulse';
import CollegeFees from './Sections/CollegeFees';
import ClassBoards from './Sections/ClassBoards';

import './StudentDashboard.css';
import SkillsRadar from './Sections/SkillsRadar';
import GlobalNotifications from '../GlobalNotifications/GlobalNotifications';
import StudentTasks from './Sections/StudentTasks';
import CareerReadiness from './Sections/CareerReadiness';
import CommandPalette from '../CommandPalette/CommandPalette';
// StudyTools intentionally removed (unused) to satisfy linting

/**
 * Vu UniVerse360 Student Dashboard
 * A high-fidelity, interactive workstation for modern students.
 */
export default function StudentDashboard({ studentData, onLogout }) {
    const navigate = useNavigate();
    const location = useLocation();

    // Auth & Data Initialization
    let stored = null;
    try {
        stored = (typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('userData'))
            ? JSON.parse(window.localStorage.getItem('userData'))
            : null;
    } catch (e) { stored = null; }

    const initialData = { ...(studentData || stored || { studentName: 'Vignan Student', sid: 'STU001', branch: 'CSE', year: 1, section: 'A', role: 'student' }) };
    const branch = String(initialData.branch || 'CSE').toUpperCase();

    // UI & App State
    const [view, setView] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('view') || 'overview';
    });
    const [isDashboardLoaded, setIsDashboardLoaded] = useState(false);
    const [userData, setUserData] = useState(initialData);
    const [overviewData, setOverviewData] = useState(null);
    const [extraCourses, setExtraCourses] = useState([]);
    const [serverMaterials, setServerMaterials] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [messages, setMessages] = useState([]);
    const [marksData, setMarksData] = useState(null);
    const [scheduleData, setScheduleData] = useState(null);
    const [examsData, setExamsData] = useState(null);
    const [advancedData, setAdvancedData] = useState(null);
    const [roadmapData, setRoadmapData] = useState(null);
    const [assignedFaculty, setAssignedFaculty] = useState([]);

    // Modals & UI Flags
    const [showAiModal, setShowAiModal] = useState(false);
    const [aiInitialPrompt, setAiInitialPrompt] = useState('');
    const [aiDocumentContext, setAiDocumentContext] = useState(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const [navTarget, setNavTarget] = useState('');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isSyncing, setIsSyncing] = useState(false);
    const [networkError, setNetworkError] = useState(false);


    const openAiWithPrompt = (prompt) => {
        setAiInitialPrompt(prompt);
        setShowAiModal(true);
    };

    const openAiWithDoc = (title, url, videoAnalysis = null) => {
        setAiDocumentContext({ title, url, videoAnalysis });
        setAiInitialPrompt(`I have questions about this video/document: ${title}`);
        setView('ai-agent');
    };

    const toggleAiModal = () => {
        setShowAiModal(prev => {
            if (prev) setAiInitialPrompt('');
            return !prev;
        });
    };

    // Update time for countdowns
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);


    // Initial load animation & search param sync
    useEffect(() => {
        const timer = setTimeout(() => setIsDashboardLoaded(true), 100);

        // Sync view with search params if present
        const params = new URLSearchParams(location.search);
        const viewParam = params.get('view');
        if (viewParam) {
            setView(viewParam);
        }

        const handleOpenAi = () => setShowAiModal(true);
        window.addEventListener('open-ai-modal', handleOpenAi);

        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setShowCommandPalette(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('open-ai-modal', handleOpenAi);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [location.search]);

    // --- Data Fetching ---
    const fetchData = useCallback(async () => {
        try {
            setIsSyncing(true);
            try {
                const agg = await apiGet(`/api/student-data/${userData.sid}/dashboard`);
                if (agg) {
                    console.log('🛰️ StudentDashboard: aggregated dashboard payload:', agg);
                    if (agg.overview) setOverviewData(agg.overview);
                    if (agg.student) {
                        setUserData(prev => {
                            const updatedUser = {
                                ...prev,
                                ...agg.student,
                                studentName: agg.student.name || agg.student.studentName || prev.studentName,
                                profilePic: agg.student.profilePic || agg.student.profileImage || prev.profilePic,
                                stats: agg.student.stats || prev.stats
                            };
                            // Persist to local storage for refresh safety
                            localStorage.setItem('userData', JSON.stringify(updatedUser));
                            return updatedUser;
                        });
                    }

                    if (Array.isArray(agg.courses)) setExtraCourses(agg.courses);
                    if (Array.isArray(agg.materials)) setServerMaterials(agg.materials);
                    if (Array.isArray(agg.todos)) setTasks(agg.todos);
                    if (Array.isArray(agg.messages)) setMessages(agg.messages);
                    if (Array.isArray(agg.schedule)) setScheduleData(agg.schedule);
                    if (Array.isArray(agg.marks)) setMarksData(agg.marks);
                    if (Array.isArray(agg.exams)) setExamsData(agg.exams);
                    if (Array.isArray(agg.faculties)) setAssignedFaculty(agg.faculties);

                    // aggregated fetch succeeded; skip individual calls if it returns materials
                    if (Array.isArray(agg.materials) && agg.materials.length > 0) return;
                }
            } catch (e) {
                // aggregator not available or failed — fall back to existing per-endpoint fetching
            }

            if (!serverMaterials || serverMaterials.length === 0) {
                try {
                    const materials = await apiGet(`/api/materials?year=${encodeURIComponent(userData.year || 1)}&branch=${encodeURIComponent(branch)}&section=${encodeURIComponent(userData.section || 'All')}`);
                    if (Array.isArray(materials)) setServerMaterials(materials);
                } catch (e) {
                    console.debug('Fallback materials fetch failed', e);
                }
            }

            const queryParams = new URLSearchParams({
                year: Number(userData.year) || 3,
                section: String(userData.section || '13'),
                branch: userData.branch || 'CSE'
            });

            // console.debug('✅ StudentDashboard: All data loaded successfully');

            if (networkError) setNetworkError(false);
        } catch (e) {
            console.error("❌ StudentDashboard: Sync Failed:", e);
            if (e.name === 'TypeError' || e.message?.includes('fetch')) {
                setNetworkError(true);
            }
        } finally {
            setIsSyncing(false);
        }
    }, [userData.sid, userData.year, userData.section, userData.branch]);

    useEffect(() => {
        // Initial fetch
        fetchData();

        // Scalable polling: 30 seconds (Background fallback for faster updates)
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') fetchData();
        }, 30000); // 30s background sync

        // Scalable messages update
        const msgInterval = setInterval(async () => {
            try {
                if (document.visibilityState !== 'visible') return;
                const query = new URLSearchParams({
                    userId: userData.sid,
                    role: 'student',
                    year: userData.year,
                    section: userData.section
                }).toString();
                const msgData = await apiGet(`/api/messages?${query}`);
                if (Array.isArray(msgData)) {
                    setMessages(msgData.sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0)));
                }
            } catch (e) {
                console.debug('Messages update failed fallback', e);
            }
        }, 60000);

        return () => {
            // console.debug('🛑 StudentDashboard: Cleaning up intervals');
            clearInterval(interval);
            clearInterval(msgInterval);
        };
    }, [fetchData, userData.sid, userData.year, userData.section]);

    // SSE real-time updates for student data
    useEffect(() => {
        try {
            const unsub = sseClient.onUpdate((ev) => {
                if (!ev || !ev.resource) return;
                // Broaden triggers for real-time update
                const triggers = ['messages', 'tasks', 'announcements', 'marks', 'attendance', 'students', 'studentData', 'assignments', 'whiteboard'];
                if (triggers.includes(ev.resource)) {
                    fetchData();
                }
            });
            return unsub;
        } catch (e) {
            console.debug('SSE client error', e);
        }
    }, [fetchData]);

    // Sync URL with view state
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('view') !== view) {
            params.set('view', view);
            navigate({ search: params.toString() }, { replace: true });
        }
    }, [view, navigate, location.search]);

    // --- CURRICULUM LOGIC ---
    const selectedYear = userData.year || 1;
    const yearData = useMemo(() => {
        // Initialize semesters structure (1-8)
        const semesters = [];
        for (let i = 1; i <= 8; i++) {
            semesters.push({ sem: i, subjects: [] });
        }

        const generateDefaultModules = (id) => [
            { id: `${id}-m1`, name: 'Module 1: Fundamental Concepts', description: 'Core principles and architectural basics.' },
            { id: `${id}-m2`, name: 'Module 2: Structural Analysis', description: 'Deep dive into patterns and structural logic.' },
            { id: `${id}-m3`, name: 'Module 3: Advanced Implementation', description: 'Real-world application and system scaling.' },
            { id: `${id}-m4`, name: 'Module 4: Optimization & Security', description: 'Ensuring performance and stability.' },
            { id: `${id}-m5`, name: 'Module 5: Capstone Synthesis', description: 'Integration of all core competencies.' }
        ];

        // 1. Populate from DB Courses (now includes migrated static data)
        extraCourses.forEach(course => {
            // Filter by Section
            const courseSection = course.section || 'All';
            const studentSection = userData.section || 'A';

            // Allow if course is for 'All' or matches student section specifically
            if (courseSection !== 'All' && courseSection !== studentSection) return;

            // Skip system markers (Empty Semester Overrides)
            if (course.code === 'EMPTY__OVERRIDE' || course.courseCode === 'EMPTY__OVERRIDE') return;

            if (course.semester) {
                const semIndex = Number(course.semester) - 1;
                if (semIndex >= 0 && semIndex < 8) {
                    const sem = semesters[semIndex];

                    // Prevent duplicates
                    const courseId = course.id || course._id;
                    const courseCode = course.code || course.courseCode;
                    const existing = sem.subjects.find(s =>
                        s.code === courseCode || (s.id && s.id === courseId)
                    );

                    if (!existing) {
                        sem.subjects.push({
                            id: courseId || `dyn-${courseCode}`,
                            name: course.name || course.courseName,
                            code: courseCode,
                            modules: course.modules && course.modules.length > 0 ? course.modules : generateDefaultModules(courseId || courseCode)
                        });
                    }
                }
            }
        });

        // 1.5. Merge Static Curriculum Fallback (from branchData.js)
        const staticData = getYearData(branch, String(selectedYear));
        if (staticData && staticData.semesters) {
            staticData.semesters.forEach(sData => {
                const semIndex = sData.sem - 1;
                if (semIndex >= 0 && semIndex < 8) {
                    const sem = semesters[semIndex];
                    sData.subjects.forEach(staticSub => {
                        // Check if subject is already in DB courses for this semester
                        const exists = sem.subjects.find(s => s.code === staticSub.code);

                        // Check if it's explicitly hidden via override marker
                        const isOverridden = extraCourses.some(c =>
                            c.code === 'EMPTY__OVERRIDE' &&
                            (c.name === staticSub.name || c.courseName === staticSub.name || c.name === 'Empty Semester Override') &&
                            String(c.semester) === String(sData.sem)
                        );

                        if (!exists && !isOverridden) {
                            sem.subjects.push({
                                ...staticSub,
                                modules: staticSub.modules && staticSub.modules.length > 0 ? staticSub.modules : generateDefaultModules(staticSub.code),
                                isStatic: true
                            });
                        }
                    });
                }
            });
        }


        // 2. Merge Server Materials (Legacy logic, kept if needed for loose material mapping)
        serverMaterials.forEach(m => {
            if (m.year && m.year !== 'All' && String(m.year) !== String(selectedYear)) return;
            // ... (rest of material logic could remain or be simplified, but for now focusing on subjects)
            const mBranch = (m.branch || 'All').toLowerCase();
            if (mBranch !== 'all' && mBranch !== branch.toLowerCase()) return;
            // Minimal inclusion for materials without explicit courses
        });

        return { semesters: semesters.filter(s => s.subjects.length > 0) };
    }, [extraCourses, serverMaterials, branch, selectedYear, userData.section]);

    const enrolledSubjects = useMemo(() => {
        // Enforce strict semester filtering: Only show subjects for the current academic year's semesters
        const currentYear = Number(userData.year) || 1;
        const minSem = (currentYear * 2) - 1; // e.g., Year 3 -> Sem 5
        const maxSem = currentYear * 2;       // e.g., Year 3 -> Sem 6

        return (yearData.semesters || [])
            .filter(s => s.sem >= minSem && s.sem <= maxSem)
            .flatMap(s => s.subjects || []);
    }, [yearData, userData.year]);

    const filteredSchedule = useMemo(() => {
        if (!scheduleData || !enrolledSubjects) return [];
        const enrolledCodes = new Set(enrolledSubjects.map(s => String(s.code).toLowerCase()));
        const enrolledNames = new Set(enrolledSubjects.map(s => String(s.name).toLowerCase()));

        return scheduleData.filter(s => {
            return enrolledCodes.has(String(s.courseCode || '').toLowerCase()) ||
                enrolledCodes.has(String(s.subject || '').toLowerCase()) ||
                enrolledNames.has(String(s.subject || '').toLowerCase());
        });
    }, [scheduleData, enrolledSubjects]);

    const todayClassesCount = useMemo(() => {
        const today = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
        return filteredSchedule.filter(s => s.day === today).length;
    }, [filteredSchedule]);

    const currentUpcomingClass = useMemo(() => {
        const today = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
        const futureClasses = filteredSchedule.filter(s => s.day === today).sort((a, b) => a.time.localeCompare(b.time));

        const now = new Date();
        const upcoming = futureClasses.find(c => {
            try {
                const startTime = c.time.split(' - ')[0];
                const [h, m] = startTime.split(':');
                const classDate = new Date();
                classDate.setHours(parseInt(h), parseInt(m), 0);
                return classDate > now;
            } catch (e) { return false; }
        });
        return upcoming || futureClasses[0] || null;
    }, [filteredSchedule]);

    const activeFocus = useMemo(() => {
        if (currentUpcomingClass) return currentUpcomingClass.subject;
        if (enrolledSubjects.length > 0) return enrolledSubjects[0].name;
        return "Academic Excellence";
    }, [currentUpcomingClass, enrolledSubjects]);

    // `StatCard` removed — it was defined but not used. Keep compact UI directly in JSX where needed.

    const handleAiNavigate = (target) => {
        const t = String(target).toLowerCase();
        setNavTarget(t);
        setIsNavigating(true);

        const viewMap = {
            'attendance': 'attendance',
            'schedule': 'schedule',
            'exam': 'exams',
            'mark': 'marks',
            'grade': 'marks',
            'result': 'marks',
            'task': 'tasks',
            'todo': 'tasks',
            'academic': 'semester',
            'classroom': 'semester',
            'library': 'semester',
            'placement': 'placement',
            'career': 'roadmaps',
            'roadmap': 'roadmaps',
            'settings': 'settings',
            'profile': 'settings',
            'support': 'support',
            'help': 'support',
            'advanced': 'advanced',
            'video': 'advanced',
            'note': 'semester',
            'journal': 'journal',
            'overview': 'overview',
            'demo-notes': 'semester',
            'demo-videos': 'advanced',
            'demo-papers': 'exams'
        };

        let matchedView = 'overview';
        Object.keys(viewMap).forEach(key => {
            if (t.includes(key)) {
                matchedView = viewMap[key];
            }
        });

        setTimeout(() => {
            setView(matchedView);
            setIsNavigating(false);
            if (showAiModal) setShowAiModal(false);
        }, 800);
    };

    const renderOverview = () => (
        <>
            <div className="nexus-bento-viewport">

                {/* 🌅 Welcome Hero */}
                <motion.div
                    className="bento-hero"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="hero-content">
                        <div className="hero-greeting">
                            <div className="hero-badge-row">
                                {overviewData?.activity?.streak > 5 && (
                                    <span className="hero-streak-badge">🔥 {overviewData.activity.streak} DAY STREAK</span>
                                )}
                                {examsData?.some(ex => {
                                    const diff = new Date(ex.date) - new Date();
                                    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
                                }) && (
                                        <span className="hero-exam-warning">📅 EXAM THIS WEEK</span>
                                    )}
                            </div>
                            <h2>Welcome back, <span>{(userData.studentName || 'Student').split(' ')[0]}</span></h2>
                            <p>You have <strong>{todayClassesCount} lectures</strong> today. Your current focus area is <strong>{activeFocus}</strong>.</p>
                        </div>
                        <div className="hero-actions">
                            <button className="quick-btn" onClick={() => setView('ai-agent')}>Ask VU AI</button>
                            <button className="quick-btn outline" onClick={() => handleAiNavigate('tasks')}>Today's Agenda</button>
                        </div>
                    </div>
                </motion.div>

                <div className="bento-grid">
                    {/* 📊 KPI Row */}
                    <div className="bento-card stat-card-premium animate-bento" style={{ '--accent': 'var(--v-primary)' }}>
                        <div className="stat-label">Academic Progress</div>
                        <div className="stat-value">{overviewData?.semesterProgress || 0}%</div>
                        <div className="stat-mini-chart">
                            <div className="mini-bar-flow" style={{ width: `${overviewData?.semesterProgress || 0}%` }}></div>
                        </div>
                        <div className="stat-sub">Semester Completion</div>
                    </div>

                    <div className="bento-card stat-card-premium animate-bento" style={{ animationDelay: '0.1s', '--accent': 'var(--v-secondary)' }}>
                        <div className="stat-label">Current CGPA</div>
                        <div className="stat-value">{overviewData?.student?.stats?.cgpa ? (overviewData.student.stats.cgpa).toFixed(2) : '8.20'}</div>
                        <div className="stat-sub">Ranked in Top 5%</div>
                    </div>

                    <div className="bento-card stat-card-premium animate-bento" style={{ animationDelay: '0.2s', '--accent': '#f97316' }}>
                        <div className="stat-label">Study Streak</div>
                        <div className="stat-value">{overviewData?.activity?.streak || 0}d</div>
                        <div className="stat-sub">Consistency: Peak</div>
                    </div>

                    <div className="bento-card stat-card-premium animate-bento" style={{ animationDelay: '0.3s', '--accent': '#0ea5e9' }}>
                        <div className="stat-label">Intelligence Score</div>
                        <div className="stat-value">{overviewData?.activity?.aiUsage || 94}</div>
                        <div className="stat-sub">AI Engagement High</div>
                    </div>

                    {/* 💓 Main Data Pulse */}
                    <div className="bento-card span-grid-3 bento-pulse animate-bento" style={{ animationDelay: '0.4s' }}>
                        <div className="bento-card-header">
                            <h3><FaChartBar /> Academic Vitality</h3>
                            <span>Live Analytics</span>
                        </div>
                        <AcademicPulse data={overviewData} enrolledSubjects={enrolledSubjects} />
                    </div>

                    {/* 🎯 Next Class */}
                    <div className="bento-card bento-mini-widget animate-bento" style={{ animationDelay: '0.5s' }}>
                        <div className="bento-card-header">
                            <h3>Next Class</h3>
                            {currentUpcomingClass && (
                                <span className="live-tag">
                                    IN {(() => {
                                        try {
                                            const startTime = currentUpcomingClass.time.split(' - ')[0];
                                            const [h, m] = startTime.split(':');
                                            const classDate = new Date();
                                            classDate.setHours(parseInt(h), parseInt(m), 0);
                                            const diff = classDate - currentTime;
                                            const diffMins = Math.floor(diff / 60000);
                                            if (diffMins < 0) return 'STARTED';
                                            if (diffMins < 60) return `${diffMins}M`;
                                            return `${Math.floor(diffMins / 60)}H`;
                                        } catch (e) { return '...'; }
                                    })()}
                                </span>
                            )}
                        </div>
                        {currentUpcomingClass ? (
                            <div className="session-compact">
                                <h4 className="s-subject">{currentUpcomingClass.subject}</h4>
                                <p className="s-meta">{currentUpcomingClass.time} | Room {currentUpcomingClass.room}</p>
                                <span className="s-faculty">with Prof. {currentUpcomingClass.faculty?.split(' ')[0]}</span>
                                <button className="s-action" onClick={() => setView('schedule')}>GO TO SCHEDULE</button>
                            </div>
                        ) : (
                            <div className="session-empty">No active classes today</div>
                        )}
                    </div>

                    {/* 💼 Career Insights */}
                    <div className="bento-card span-grid-2 animate-bento" style={{ animationDelay: '0.6s' }}>
                        <div className="bento-card-header">
                            <h3><FaBriefcase /> Career Readiness</h3>
                            <button onClick={() => setView('placement')}>Track Prep</button>
                        </div>
                        <CareerReadiness
                            score={overviewData?.activity?.careerReadyScore || 0}
                            academics={overviewData?.academics || {}}
                            attendance={overviewData?.attendance || {}}
                            roadmapCount={Object.keys(overviewData?.roadmapProgress || {}).length}
                        />
                    </div>

                    {/* 🎯 Skill Radar */}
                    <div className="bento-card animate-bento" style={{ animationDelay: '0.7s' }}>
                        <div className="bento-card-header">
                            <h3><FaLayerGroup /> Skill Mastery</h3>
                        </div>
                        <SkillsRadar studentData={userData} />
                    </div>

                    <div className="bento-card span-grid-2 animate-bento" style={{ animationDelay: '0.8s' }}>
                        <StudentProfileCard 
                            userData={userData} 
                            setView={setView} 
                            onProfileUpdate={(updated) => {
                                setUserData(prev => {
                                    const combined = { ...prev, ...updated };
                                    localStorage.setItem('userData', JSON.stringify(combined));
                                    return combined;
                                });
                            }} 
                        />
                    </div>
                </div>
            </div>
        </>
    );



    const [focusMode] = useState(false);

    return (
        <div className={`student-dashboard-layout ${isDashboardLoaded ? 'loaded' : ''} ${sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'} ${focusMode ? 'focus-active' : ''} ${mobileSidebarOpen ? 'mobile-open' : ''}`}>

            {!focusMode && (
                <>
                    <button className="mobile-sidebar-toggle" onClick={() => setMobileSidebarOpen(true)} aria-label="Open menu">
                        <FaBars />
                    </button>
                    {mobileSidebarOpen && (
                        <div className="mobile-overlay" onClick={() => setMobileSidebarOpen(false)}></div>
                    )}
                    <StudentSidebar
                        userData={userData}
                        view={view}
                        setView={setView}
                        collapsed={sidebarCollapsed}
                        setCollapsed={setSidebarCollapsed}
                        onLogout={onLogout}
                        onNavigate={() => setMobileSidebarOpen(false)}
                        isSyncing={isSyncing}
                    />
                </>
            )}

            <div className="dashboard-content-area">
                {/* 🌌 Ambient Background Layer */}
                <div className="nexus-mesh-bg content-bg-fixed"></div>

                {/* Modern Dynamic Header with Glassmorphism */}
                <StudentHeader 
                    view={view} 
                    isSyncing={isSyncing} 
                    userData={userData}
                />

                <AnimatePresence>
                    {networkError && (
                        <motion.div 
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                            className="network-warning-bar"
                            style={{ 
                                position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)',
                                background: '#ef4444', color: 'white', padding: '8px 24px', borderRadius: '40px',
                                fontSize: '0.75rem', fontWeight: 900, zIndex: 9999, display: 'flex', alignItems: 'center', gap: '10px',
                                boxShadow: '0 10px 25px rgba(239, 68, 68, 0.4)'
                            }}
                        >
                            <div className="pulse-dot-red"></div>
                            LINK DISCONNECTED - RECONNECTING TO BACKEND INFRASTRUCTURE...
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    {isNavigating && (
                        <motion.div
                            key="navigating"
                            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
                            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                            transition={{ duration: 0.5 }}
                            className="navigating-overlay"
                        >
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="navigating-pulse"
                            ></motion.div>
                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                style={{ marginTop: '2.5rem', fontWeight: 950, color: 'var(--v-primary)', letterSpacing: '0.1em' }}
                            >
                                ACCESSING {navTarget.toUpperCase()}...
                            </motion.h2>
                        </motion.div>
                    )}

                    {view === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, scale: 0.98, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.02, y: -15 }}
                            transition={{ type: "spring", stiffness: 120, damping: 20 }}
                            style={{ height: '100%' }}
                        >
                            {renderOverview()}
                        </motion.div>
                    )}


                    {view === 'announcements' && (
                        <motion.div
                            key="announcements"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.05, y: -20 }}
                            transition={{ type: "spring", stiffness: 120, damping: 20 }}
                            className="nexus-page-container"
                        >
                            <StudentAnnouncements messages={messages} userData={userData} />
                        </motion.div>
                    )}


                    {view === 'semester' && (
                        <motion.div
                            key="semester"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.05, y: -20 }}
                            transition={{ type: "spring", stiffness: 120, damping: 20 }}
                            className="nexus-page-container"
                        >
                            <AcademicBrowser
                                yearData={yearData}
                                selectedYear={userData.year}
                                serverMaterials={serverMaterials}
                                userData={userData}
                                setView={setView}
                                branch={userData.branch}
                                assignedFaculty={assignedFaculty}
                                onRefresh={fetchData}
                                openAiWithDoc={openAiWithDoc}
                            />
                        </motion.div>
                    )}

                    {view === 'journal' && (
                        <motion.div
                            key="journal"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.05, y: -20 }}
                            transition={{ type: "spring", stiffness: 120, damping: 20 }}
                            className="nexus-page-container"
                        >
                            <SemesterNotes
                                semester={userData.semester || 'Current'}
                                studentData={userData}
                                enrolledSubjects={enrolledSubjects}
                                serverMaterials={serverMaterials}
                                assignedFaculty={assignedFaculty}
                            />
                        </motion.div>
                    )}

                    {view === 'class-boards' && (
                        <motion.div
                            key="class-boards"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.05, y: -20 }}
                            transition={{ type: "spring", stiffness: 120, damping: 20 }}
                            className="nexus-page-container"
                        >
                            <ClassBoards
                                studentId={userData._id}
                                year={userData.year}
                                branch={userData.branch}
                                section={userData.section}
                                openAiWithPrompt={openAiWithPrompt}
                            />
                        </motion.div>
                    )}

                    {view === 'advanced' && (
                        <motion.div
                            key="advanced"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.05, y: -20 }}
                            transition={{ type: "spring", stiffness: 120, damping: 20 }}
                            className="nexus-page-container"
                        >
                            <AdvancedLearning userData={userData} overviewData={overviewData} preloadedData={advancedData} openAiWithDoc={openAiWithDoc} />
                        </motion.div>
                    )}

                    {view === 'tasks' && (
                        <motion.div
                            key="tasks"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.05, y: -20 }}
                            transition={{ type: "spring", stiffness: 120, damping: 20 }}
                            className="nexus-page-container"
                        >
                            <StudentTasks tasks={tasks} userData={userData} onRefresh={fetchData} />
                        </motion.div>
                    )}




                    {view === 'attendance' && (
                        <motion.div
                            key="attendance"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.05, y: -20 }}
                            transition={{ type: "spring", stiffness: 120, damping: 20 }}
                            className="nexus-page-container"
                        >
                            <SubjectAttendanceMarks
                                overviewData={overviewData}
                                enrolledSubjects={enrolledSubjects}
                                setView={setView}
                                openAiWithPrompt={openAiWithPrompt}
                            />
                        </motion.div>
                    )}

                    {view === 'exams' && (
                        <motion.div
                            key="exams"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.05, y: -20 }}
                            transition={{ type: "spring", stiffness: 120, damping: 20 }}
                            className="nexus-page-container"
                        >
                            <StudentExams studentData={userData} preloadedData={examsData} enrolledSubjects={enrolledSubjects} />
                        </motion.div>
                    )}

                    {view === 'faculty' && (
                        <motion.div
                            key="faculty"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.05, y: -20 }}
                            transition={{ type: "spring", stiffness: 120, damping: 20 }}
                            className="nexus-page-container"
                        >
                            <StudentFacultyList studentData={userData} preloadedData={assignedFaculty} />
                        </motion.div>
                    )}

                    {view === 'achievements' && (
                        <motion.div
                            key="achievements"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.05, y: -20 }}
                            transition={{ type: "spring", stiffness: 120, damping: 20 }}
                            className="nexus-page-container"
                        >
                            <StudentAchievementsList studentId={userData._id || userData.sid} userData={userData} />
                        </motion.div>
                    )}

                    {
                        view === 'schedule' && (
                            <motion.div
                                key="schedule"
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 1.05, y: -20 }}
                                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                                className="nexus-page-container"
                            >
                                <StudentSchedule studentData={userData} preloadedData={scheduleData} enrolledSubjects={enrolledSubjects} />
                            </motion.div>
                        )
                    }


                    {
                        view === 'placement' && (
                            <motion.div
                                key="placement"
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 1.05, y: -20 }}
                                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                                className="nexus-page-container"
                            >
                                <PlacementPrep userData={userData} />
                            </motion.div>
                        )
                    }

                    {
                        view === 'roadmaps' && (
                            <motion.div
                                key="roadmaps"
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 1.05, y: -20 }}
                                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                                className="nexus-page-container"
                            >
                                <StudentRoadmaps studentData={userData} preloadedData={roadmapData} />
                            </motion.div>
                        )
                    }

                    {
                        view === 'settings' && (
                            <motion.div
                                key="settings"
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 1.05, y: -20 }}
                                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                                className="nexus-page-container"
                            >
                                <StudentSettings
                                    userData={userData}
                                    onProfileUpdate={(updated) => {
                                        setUserData(prev => {
                                            const combined = { ...prev, ...updated };
                                            localStorage.setItem('userData', JSON.stringify(combined));
                                            return combined;
                                        });
                                    }}
                                />
                            </motion.div>
                        )
                    }

                    {
                        view === 'marks' && (
                            <motion.div
                                key="marks"
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 1.05, y: -20 }}
                                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                                className="nexus-hub-viewport"
                            >
                                <StudentResults studentData={userData} preloadedData={marksData} enrolledSubjects={enrolledSubjects} />
                            </motion.div>
                        )
                    }

                    {
                        view === 'fees' && (
                            <motion.div
                                key="fees"
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 1.05, y: -20 }}
                                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                                className="nexus-page-container"
                            >
                                <CollegeFees userData={userData} />
                            </motion.div>
                        )
                    }

                    {
                        view === 'support' && (
                            <motion.div
                                key="support"
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 1.05, y: -20 }}
                                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                                className="nexus-page-container"
                            >
                                <StudentSupport userData={userData} />
                            </motion.div>
                        )
                    }

                    {
                        view === 'ai-agent' && (
                            <motion.div
                                key="ai-agent-view"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.02 }}
                                transition={{ duration: 0.3 }}
                                className="nexus-hub-viewport"
                                style={{ padding: '0 2rem', height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}
                            >
                                <div style={{ flex: 1, height: '100%', paddingBottom: '2rem', position: 'relative', zIndex: 10 }}>
                                    <VuAiAgent onNavigate={handleAiNavigate} initialMessage={aiInitialPrompt} documentContext={aiDocumentContext} />
                                </div>
                            </motion.div>
                        )
                    }
                </AnimatePresence >
            </div >


            {mobileSidebarOpen && <div className="mobile-sidebar-overlay" onClick={() => setMobileSidebarOpen(false)}></div>}

            <button className="ai-fab" onClick={toggleAiModal}>
                <FaRobot />
                <span className="fab-label">AI Tutor</span>
            </button>

            {
                showAiModal && (
                    <div className="nexus-modal-overlay" onClick={() => setShowAiModal(false)}>
                        <div className="nexus-modal-content" onClick={e => e.stopPropagation()}>
                            <button className="nexus-modal-close" onClick={() => setShowAiModal(false)}>
                                &times;
                            </button>
                            <div className="nexus-modal-body" style={{ padding: 0 }}>
                                <VuAiAgent onNavigate={handleAiNavigate} />
                            </div>
                        </div>
                    </div>
                )
            }

            {/* ⌨️ Command Palette (Quick Navigation) */}
            <CommandPalette
                isOpen={showCommandPalette}
                onClose={() => setShowCommandPalette(false)}
                role="student"
                userData={userData}
            />

            {/* 🏗️ Core Global Components */}
            <GlobalNotifications />
        </div >
    );
}
