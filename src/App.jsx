import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginRegister from './Components/LoginRegister/LoginRegister';
import StudentDashboard from './Components/StudentDashboard/StudentDashboard';
import SemesterNotes from './Components/StudentDashboard/Sections/SemesterNotes';
import AdminDashboard from './Components/AdminDashboard/AdminDashboard';
import FacultyDashboard from './Components/FacultyDashboard/FacultyDashboard';
import AdvancedLearning from './Components/StudentDashboard/Sections/AdvancedLearning';
import './App.css';
import RocketSplash from './Components/RocketSplash/RocketSplash';
import CommandPalette from './Components/CommandPalette/CommandPalette';
import GlobalNotifications from './Components/GlobalNotifications/GlobalNotifications';
import AttendanceManagerDashboard from './Components/AttendanceManager/AttendanceManagerDashboard';
import ScheduleManagerDashboard from './Components/ScheduleManager/ScheduleManagerDashboard';
import AchievementManagerDashboard from './Components/AchievementManager/AchievementManagerDashboard';
import AdmissionsManagerDashboard from './Components/AdmissionsManager/AdmissionsManagerDashboard';
import EventsManagerDashboard from './Components/EventsManager/EventsManagerDashboard';
import FinanceManagerDashboard from './Components/FinanceManager/FinanceManagerDashboard';
import HostelManagerDashboard from './Components/HostelManager/HostelManagerDashboard';
import LibraryManagerDashboard from './Components/LibraryManager/LibraryManagerDashboard';
import TransportManagerDashboard from './Components/TransportManager/TransportManagerDashboard';
import PlacementManagerDashboard from './Components/PlacementManager/PlacementManagerDashboard';
import ResearchManagerDashboard from './Components/ResearchManager/ResearchManagerDashboard';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [showSplash, setShowSplash] = useState(true);
    const [studentData, setStudentData] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isFaculty, setIsFaculty] = useState(false);
    const [facultyData, setFacultyData] = useState(null);
    const [isAttendanceManager, setIsAttendanceManager] = useState(false);
    const [attendanceManagerData, setAttendanceManagerData] = useState(null);
    const [isScheduleManager, setIsScheduleManager] = useState(false);
    const [scheduleManagerData, setScheduleManagerData] = useState(null);
    const [isAchievementManager, setIsAchievementManager] = useState(false);
    const [achievementManagerData, setAchievementManagerData] = useState(null);
    const [isAdmissionsManager, setIsAdmissionsManager] = useState(false);
    const [admissionsManagerData, setAdmissionsManagerData] = useState(null);
    const [isEventsManager, setIsEventsManager] = useState(false);
    const [eventsManagerData, setEventsManagerData] = useState(null);
    const [isFinanceManager, setIsFinanceManager] = useState(false);
    const [financeManagerData, setFinanceManagerData] = useState(null);
    const [isHostelManager, setIsHostelManager] = useState(false);
    const [hostelManagerData, setHostelManagerData] = useState(null);
    const [isLibraryManager, setIsLibraryManager] = useState(false);
    const [libraryManagerData, setLibraryManagerData] = useState(null);
    const [isTransportManager, setIsTransportManager] = useState(false);
    const [transportManagerData, setTransportManagerData] = useState(null);
    const [isPlacementManager, setIsPlacementManager] = useState(false);
    const [placementManagerData, setPlacementManagerData] = useState(null);
    const [isResearchManager, setIsResearchManager] = useState(false);
    const [researchManagerData, setResearchManagerData] = useState(null);
    const [isCmdOpen, setIsCmdOpen] = useState(false);

    useEffect(() => {
        const handleKeys = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsCmdOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, []);

    useEffect(() => {
        document.body.removeAttribute('data-theme');
        localStorage.removeItem('system-theme');
    }, []);

    const userRole = isAdmin ? 'admin' :
        isFaculty ? 'faculty' :
            isAttendanceManager ? 'attendance_manager' :
                isScheduleManager ? 'schedule_manager' :
                    isAchievementManager ? 'achievement_manager' :
                        isAdmissionsManager ? 'admissions_manager' :
                            isEventsManager ? 'events_manager' :
                                isFinanceManager ? 'finance_manager' :
                                    isHostelManager ? 'hostel_manager' :
                                        isLibraryManager ? 'library_manager' :
                                            isTransportManager ? 'transport_manager' :
                                                isPlacementManager ? 'placement_manager' :
                                                    isResearchManager ? 'research_manager' :
                                                        studentData ? 'student' : null;

    const currentUser = studentData || facultyData || attendanceManagerData || scheduleManagerData || achievementManagerData || admissionsManagerData || eventsManagerData || financeManagerData || hostelManagerData || libraryManagerData || transportManagerData || placementManagerData || researchManagerData || (isAdmin ? { name: 'Admin' } : null);

    useEffect(() => {
        const restoreSession = () => {
            const storedUserData = localStorage.getItem('userData');
            if (storedUserData) {
                try {
                    const user = JSON.parse(storedUserData);
                    if (user.role === 'admin') {
                        const token = localStorage.getItem('adminToken');
                        if (token) { setIsAdmin(true); setIsAuthenticated(true); }
                        else localStorage.removeItem('userData');
                    } else if (user.role === 'attendance_manager') {
                        const token = localStorage.getItem('facultyToken');
                        if (token) {
                            setIsAttendanceManager(true);
                            setAttendanceManagerData(user);
                            setIsAuthenticated(true);
                        } else localStorage.removeItem('userData');
                    } else if (user.role === 'schedule_manager') {
                        const token = localStorage.getItem('facultyToken');
                        if (token) {
                            setIsScheduleManager(true);
                            setScheduleManagerData(user);
                            setIsAuthenticated(true);
                        } else localStorage.removeItem('userData');
                    } else if (user.role === 'achievement_manager') {
                        const token = localStorage.getItem('facultyToken');
                        if (token) {
                            setIsAchievementManager(true);
                            setAchievementManagerData(user);
                            setIsAuthenticated(true);
                        } else localStorage.removeItem('userData');
                    } else if (user.role === 'admissions_manager') {
                        const token = localStorage.getItem('facultyToken');
                        if (token) {
                            setIsAdmissionsManager(true);
                            setAdmissionsManagerData(user);
                            setIsAuthenticated(true);
                        } else localStorage.removeItem('userData');
                    } else if (user.role === 'events_manager') {
                        const token = localStorage.getItem('facultyToken');
                        if (token) {
                            setIsEventsManager(true);
                            setEventsManagerData(user);
                            setIsAuthenticated(true);
                        } else localStorage.removeItem('userData');
                    } else if (user.role === 'finance_manager') {
                        const token = localStorage.getItem('facultyToken');
                        if (token) {
                            setIsFinanceManager(true);
                            setFinanceManagerData(user);
                            setIsAuthenticated(true);
                        } else localStorage.removeItem('userData');
                    } else if (user.role === 'hostel_manager') {
                        const token = localStorage.getItem('facultyToken');
                        if (token) {
                            setIsHostelManager(true);
                            setHostelManagerData(user);
                            setIsAuthenticated(true);
                        } else localStorage.removeItem('userData');
                    } else if (user.role === 'library_manager') {
                        const token = localStorage.getItem('facultyToken');
                        if (token) {
                            setIsLibraryManager(true);
                            setLibraryManagerData(user);
                            setIsAuthenticated(true);
                        } else localStorage.removeItem('userData');
                    } else if (user.role === 'transport_manager') {
                        const token = localStorage.getItem('facultyToken');
                        if (token) {
                            setIsTransportManager(true);
                            setTransportManagerData(user);
                            setIsAuthenticated(true);
                        } else localStorage.removeItem('userData');
                    } else if (user.role === 'placement_manager') {
                        const token = localStorage.getItem('facultyToken');
                        if (token) {
                            setIsPlacementManager(true);
                            setPlacementManagerData(user);
                            setIsAuthenticated(true);
                        } else localStorage.removeItem('userData');
                    } else if (user.role === 'research_manager') {
                        const token = localStorage.getItem('facultyToken');
                        if (token) {
                            setIsResearchManager(true);
                            setResearchManagerData(user);
                            setIsAuthenticated(true);
                        } else localStorage.removeItem('userData');
                    } else if (user.role === 'faculty') {
                        const token = localStorage.getItem('facultyToken');
                        if (token) {
                            setIsFaculty(true);
                            setFacultyData(user);
                            setIsAuthenticated(true);
                        } else localStorage.removeItem('userData');
                    } else if (user.role === 'student') {
                        const token = localStorage.getItem('studentToken');
                        if (token) { setStudentData(user); setIsAuthenticated(true); }
                        else localStorage.removeItem('userData');
                    }
                } catch (e) {
                    console.error("Failed to restore session", e);
                    localStorage.removeItem('userData');
                }
            }
            setIsInitialized(true);
        };
        restoreSession();
    }, []);

    if (!isInitialized || (showSplash && !isAuthenticated)) {
        return <RocketSplash onFinish={() => setShowSplash(false)} />;
    }

    const rootElement = (() => {
        const path = window.location.pathname;

        if (!isAuthenticated) {
            return (
                <LoginRegister
                    setIsAuthenticated={setIsAuthenticated}
                    setStudentData={setStudentData}
                    setIsAdmin={setIsAdmin}
                    setIsFaculty={setIsFaculty}
                    setFacultyData={setFacultyData}
                    setIsAttendanceManager={setIsAttendanceManager}
                    setAttendanceManagerData={setAttendanceManagerData}
                    setIsScheduleManager={setIsScheduleManager}
                    setScheduleManagerData={setScheduleManagerData}
                    setIsAchievementManager={setIsAchievementManager}
                    setAchievementManagerData={setAchievementManagerData}
                    setIsAdmissionsManager={setIsAdmissionsManager}
                    setAdmissionsManagerData={setAdmissionsManagerData}
                    setIsEventsManager={setIsEventsManager}
                    setEventsManagerData={setEventsManagerData}
                    setIsFinanceManager={setIsFinanceManager}
                    setFinanceManagerData={setFinanceManagerData}
                    setIsHostelManager={setIsHostelManager}
                    setHostelManagerData={setHostelManagerData}
                    setIsLibraryManager={setIsLibraryManager}
                    setLibraryManagerData={setLibraryManagerData}
                    setIsTransportManager={setIsTransportManager}
                    setTransportManagerData={setTransportManagerData}
                    setIsPlacementManager={setIsPlacementManager}
                    setPlacementManagerData={setPlacementManagerData}
                    setIsResearchManager={setIsResearchManager}
                    setResearchManagerData={setResearchManagerData}
                />
            );
        }

        if (isAdmin) {
            if (path === '/admin') return null;
            return <Navigate to="/admin" replace />;
        }

        if (isAttendanceManager && attendanceManagerData) {
            if (path === '/attendance-manager') return null;
            return <Navigate to="/attendance-manager" replace />;
        }

        if (isScheduleManager && scheduleManagerData) {
            if (path === '/schedule-manager') return null;
            return <Navigate to="/schedule-manager" replace />;
        }

        if (isAchievementManager && achievementManagerData) {
            if (path === '/achievement-manager') return null;
            return <Navigate to="/achievement-manager" replace />;
        }

        if (isAdmissionsManager && admissionsManagerData) {
            if (path === '/admissions-manager') return null;
            return <Navigate to="/admissions-manager" replace />;
        }

        if (isEventsManager && eventsManagerData) {
            if (path === '/events-manager') return null;
            return <Navigate to="/events-manager" replace />;
        }

        if (isFinanceManager && financeManagerData) {
            if (path === '/finance-manager') return null;
            return <Navigate to="/finance-manager" replace />;
        }

        if (isHostelManager && hostelManagerData) {
            if (path === '/hostel-manager') return null;
            return <Navigate to="/hostel-manager" replace />;
        }

        if (isLibraryManager && libraryManagerData) {
            if (path === '/library-manager') return null;
            return <Navigate to="/library-manager" replace />;
        }

        if (isTransportManager && transportManagerData) {
            if (path === '/transport-manager') return null;
            return <Navigate to="/transport-manager" replace />;
        }

        if (isPlacementManager && placementManagerData) {
            if (path === '/placement-manager') return null;
            return <Navigate to="/placement-manager" replace />;
        }

        if (isResearchManager && researchManagerData) {
            if (path === '/research-manager') return null;
            return <Navigate to="/research-manager" replace />;
        }

        if (isFaculty && facultyData) {
            if (path === '/faculty') return null;
            return <Navigate to="/faculty" replace />;
        }

        if (studentData) {
            if (path === '/dashboard') return null;
            return <Navigate to="/dashboard" replace />;
        }

        return (
            <LoginRegister
                setIsAuthenticated={setIsAuthenticated}
                setStudentData={setStudentData}
                setIsAdmin={setIsAdmin}
                setIsFaculty={setIsFaculty}
                setFacultyData={setFacultyData}
                setIsAttendanceManager={setIsAttendanceManager}
                setAttendanceManagerData={setAttendanceManagerData}
                setIsScheduleManager={setIsScheduleManager}
                setScheduleManagerData={setScheduleManagerData}
                setIsAchievementManager={setIsAchievementManager}
                setAchievementManagerData={setAchievementManagerData}
                setIsAdmissionsManager={setIsAdmissionsManager}
                setAdmissionsManagerData={setAdmissionsManagerData}
                setIsEventsManager={setIsEventsManager}
                setEventsManagerData={setEventsManagerData}
                setIsFinanceManager={setIsFinanceManager}
                setFinanceManagerData={setFinanceManagerData}
                setIsHostelManager={setIsHostelManager}
                setHostelManagerData={setHostelManagerData}
                setIsLibraryManager={setIsLibraryManager}
                setLibraryManagerData={setLibraryManagerData}
                setIsTransportManager={setIsTransportManager}
                setTransportManagerData={setTransportManagerData}
                setIsPlacementManager={setIsPlacementManager}
                setPlacementManagerData={setPlacementManagerData}
                setIsResearchManager={setIsResearchManager}
                setResearchManagerData={setResearchManagerData}
            />
        );
    })();

    const handleLogout = (clearFn) => {
        setIsAuthenticated(false);
        setStudentData(null);
        setIsAdmin(false);
        setIsFaculty(false);
        setFacultyData(null);
        setIsAttendanceManager(false);
        setAttendanceManagerData(null);
        setIsScheduleManager(false);
        setScheduleManagerData(null);
        setIsAchievementManager(false);
        setAchievementManagerData(null);
        setIsAdmissionsManager(false);
        setAdmissionsManagerData(null);
        setIsEventsManager(false);
        setEventsManagerData(null);
        setIsFinanceManager(false);
        setFinanceManagerData(null);
        setIsHostelManager(false);
        setHostelManagerData(null);
        setIsLibraryManager(false);
        setLibraryManagerData(null);
        setIsTransportManager(false);
        setTransportManagerData(null);
        setIsPlacementManager(false);
        setPlacementManagerData(null);
        setIsResearchManager(false);
        setResearchManagerData(null);
        ['studentToken', 'adminToken', 'facultyToken', 'userData'].forEach(k => localStorage.removeItem(k));
        if (clearFn) clearFn();
    };

    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="App">
                {isAuthenticated && (
                    <>
                        <GlobalNotifications userRole={userRole} userData={currentUser} />
                        <CommandPalette
                            isOpen={isCmdOpen}
                            onClose={() => setIsCmdOpen(false)}
                            role={userRole}
                            userData={currentUser}
                        />
                    </>
                )}
                <Routes>
                    <Route path="/" element={rootElement} />
                    <Route
                        path="/dashboard"
                        element={
                            isAuthenticated && studentData && !isAdmin ?
                                <StudentDashboard
                                    studentData={studentData}
                                    onLogout={() => handleLogout()}
                                /> :
                                <Navigate to="/" replace />
                        }
                    />
                    <Route
                        path="/semester-notes"
                        element={
                            isAuthenticated && studentData && !isAdmin ?
                                <SemesterNotes /> :
                                <Navigate to="/" replace />
                        }
                    />
                    <Route
                        path="/advanced-learning"
                        element={
                            isAuthenticated && studentData && !isAdmin ?
                                <AdvancedLearning /> :
                                <Navigate to="/" replace />
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            isAuthenticated && isAdmin ?
                                <AdminDashboard
                                    setIsAuthenticated={setIsAuthenticated}
                                    setIsAdmin={setIsAdmin}
                                    setStudentData={setStudentData}
                                /> :
                                <Navigate to="/" replace />
                        }
                    />
                    <Route
                        path="/faculty"
                        element={
                            isAuthenticated && isFaculty ?
                                <FacultyDashboard
                                    facultyData={facultyData}
                                    setIsAuthenticated={setIsAuthenticated}
                                    setIsFaculty={setIsFaculty}
                                /> :
                                <Navigate to="/" replace />
                        }
                    />
                    <Route
                        path="/attendance-manager"
                        element={
                            isAuthenticated && isAttendanceManager ?
                                <AttendanceManagerDashboard
                                    managerData={attendanceManagerData}
                                    onLogout={() => handleLogout()}
                                /> :
                                <Navigate to="/" replace />
                        }
                    />
                    <Route
                        path="/schedule-manager"
                        element={
                            isAuthenticated && isScheduleManager ?
                                <ScheduleManagerDashboard
                                    managerData={scheduleManagerData}
                                    onLogout={() => handleLogout()}
                                /> :
                                <Navigate to="/" replace />
                        }
                    />
                    <Route
                        path="/achievement-manager"
                        element={
                            isAuthenticated && isAchievementManager ?
                                <AchievementManagerDashboard
                                    managerData={achievementManagerData}
                                    onLogout={() => handleLogout()}
                                /> :
                                <Navigate to="/" replace />
                        }
                    />
                    <Route
                        path="/admissions-manager"
                        element={
                            isAuthenticated && isAdmissionsManager ?
                                <AdmissionsManagerDashboard
                                    managerData={admissionsManagerData}
                                    onLogout={() => handleLogout()}
                                /> :
                                <Navigate to="/" replace />
                        }
                    />
                    <Route
                        path="/events-manager"
                        element={
                            isAuthenticated && isEventsManager ?
                                <EventsManagerDashboard
                                    managerData={eventsManagerData}
                                    onLogout={() => handleLogout()}
                                /> :
                                <Navigate to="/" replace />
                        }
                    />
                    <Route
                        path="/finance-manager"
                        element={
                            isAuthenticated && isFinanceManager ?
                                <FinanceManagerDashboard
                                    managerData={financeManagerData}
                                    onLogout={() => handleLogout()}
                                /> :
                                <Navigate to="/" replace />
                        }
                    />
                    <Route
                        path="/hostel-manager"
                        element={
                            isAuthenticated && isHostelManager ?
                                <HostelManagerDashboard
                                    managerData={hostelManagerData}
                                    onLogout={() => handleLogout()}
                                /> :
                                <Navigate to="/" replace />
                        }
                    />
                    <Route
                        path="/library-manager"
                        element={
                            isAuthenticated && isLibraryManager ?
                                <LibraryManagerDashboard
                                    managerData={libraryManagerData}
                                    onLogout={() => handleLogout()}
                                /> :
                                <Navigate to="/" replace />
                        }
                    />
                    <Route
                        path="/transport-manager"
                        element={
                            isAuthenticated && isTransportManager ?
                                <TransportManagerDashboard
                                    managerData={transportManagerData}
                                    onLogout={() => handleLogout()}
                                /> :
                                <Navigate to="/" replace />
                        }
                    />
                    <Route
                        path="/placement-manager"
                        element={
                            isAuthenticated && isPlacementManager ?
                                <PlacementManagerDashboard
                                    managerData={placementManagerData}
                                    onLogout={() => handleLogout()}
                                /> :
                                <Navigate to="/" replace />
                        }
                    />
                    <Route
                        path="/research-manager"
                        element={
                            isAuthenticated && isResearchManager ?
                                <ResearchManagerDashboard
                                    managerData={researchManagerData}
                                    onLogout={() => handleLogout()}
                                /> :
                                <Navigate to="/" replace />
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
