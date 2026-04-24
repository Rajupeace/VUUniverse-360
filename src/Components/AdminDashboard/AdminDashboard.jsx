import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaRobot, FaBars, FaPlus, FaBullhorn, FaFileUpload, FaSave, FaTimes,
  FaUserGraduate, FaChalkboardTeacher, FaBook, FaCheckCircle, FaTrash,
  FaEdit, FaSearch, FaFilter, FaSync, FaEye, FaArrowLeft, FaDownload,
  FaEnvelope, FaClipboardList, FaSignOutAlt, FaChartLine, FaLayerGroup,
  FaCog, FaCalendarAlt, FaFileAlt, FaShieldAlt, FaGem, FaTerminal, FaChartBar, FaCreditCard
} from 'react-icons/fa';
import AdminHeader from './Sections/AdminHeader';
import AdminHome from './Sections/AdminHome';
import './AdminDashboard.css';
import { readFaculty, readStudents, writeStudents, writeFaculty } from '../../utils/localdb';
import { apiGet, apiPost, apiPut, apiDelete, apiUpload, API_BASE } from '../../utils/apiClient';
import { getYearData } from '../StudentDashboard/branchData';
// import AcademicPulse from '../StudentDashboard/AcademicPulse'; // Removed unused import
import VuAiAgent from '../VuAiAgent/VuAiAgent';
import AdminAttendancePanel from './AdminAttendancePanel';
import sseClient from '../../utils/sseClient';

// Newly extracted sections
import StudentSection from './Sections/StudentSection';
import FacultySection from './Sections/FacultySection';
import MaterialSection from './Sections/MaterialSection';
import MessageSection from './Sections/MessageSection';
import TodoSection from './Sections/TodoSection';
import AcademicHub from './Sections/AcademicHub';
import AdminMarks from './AdminMarks';
import AchievementManager from './Sections/AchievementManager';
import AdminStaffRoles from './Sections/AdminStaffRoles';
import DocViewer from '../DocViewer/DocViewer';
import StudentProfileModal from '../Shared/StudentProfileModal';
import FacultyProfileModal from '../Shared/FacultyProfileModal';
import AdminExams from './AdminExams';
import AdminAnalyticsDashboard from './AdminAnalyticsDashboard';
import AdminScheduleManager from './AdminScheduleManager';


import AdmissionsManagerDashboard from '../AdmissionsManager/AdmissionsManagerDashboard';
import EventsManagerDashboard from '../EventsManager/EventsManagerDashboard';
import FinanceManagerDashboard from '../FinanceManager/FinanceManagerDashboard';
import HostelManagerDashboard from '../HostelManager/HostelManagerDashboard';
import LibraryManagerDashboard from '../LibraryManager/LibraryManagerDashboard';
import TransportManagerDashboard from '../TransportManager/TransportManagerDashboard';
import PlacementManagerDashboard from '../PlacementManager/PlacementManagerDashboard';
import ResearchManagerDashboard from '../ResearchManager/ResearchManagerDashboard';
import AttendanceManagerDashboard from '../AttendanceManager/AttendanceManagerDashboard';
import ScheduleManagerDashboard from '../ScheduleManager/ScheduleManagerDashboard';

// Helper for mocked API or local storage check
const USE_API = true; // Always use API in unified app mode (defaults to localhost:5000)

const ADVANCED_TOPICS = [
  'Artificial Intelligence',
  'Machine Learning',
  'Data Science',
  'Cloud Computing',
  'Cyber Security',
  'DevOps',
  'Blockchain',
  'Internet of Things',
  'Robotics',
  'Quantum Computing'
];
// Common Section Options
const SECTION_OPTIONS = [...Array.from({ length: 16 }, (_, i) => String.fromCharCode(65 + i)), ...Array.from({ length: 20 }, (_, i) => String(i + 1))];

export default function AdminDashboard({ setIsAuthenticated, setIsAdmin, setStudentData, onLogout }) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [adminData, setAdminData] = useState({ name: 'System Admin', role: 'Main Administrator' });

  useEffect(() => {
    const handleNavigate = (e) => {
      if (e.detail) setActiveSection(e.detail);
    };
    window.addEventListener('admin-navigate', handleNavigate);
    return () => window.removeEventListener('admin-navigate', handleNavigate);
  }, []);

  const [showPassword, setShowPassword] = useState(false); // Toggle for password field

  // Data States
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [courses, setCourses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [todos, setTodos] = useState([]);
  const [messages, setMessages] = useState([]);
  const [fees, setFees] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [systemStats, setSystemStats] = useState({
    students: 0,
    faculty: 0,
    courses: 0,
    materials: 0,
    revenue: 0,
    enrollments: 0
  });
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState('');
  const [viewedStudentAchievements, setViewedStudentAchievements] = useState([]);

  const openAiWithPrompt = (prompt) => {
    setAiInitialPrompt(prompt);
    setShowAiModal(true);
  };

  const toggleAiModal = () => {
    setShowAiModal(prev => {
      if (prev) setAiInitialPrompt('');
      return !prev;
    });
  };

  // Form States
  const [showModal, setShowModal] = useState(false);

  const [modalType, setModalType] = useState(null); // 'student', 'faculty', 'course', 'material', 'todo', 'message'
  const [editItem, setEditItem] = useState(null);
  const [facultyAssignments, setFacultyAssignments] = useState([]); // For managing multiple teaching assignments
  const [msgTarget, setMsgTarget] = useState('all'); // Targeted messages state
  const [globalSectionFilter, setGlobalSectionFilter] = useState('A');
  const [viewerDoc, setViewerDoc] = useState(null);
  const isFetchingRef = useRef(false);
  const loadData = useCallback(async (force = false) => {
    if (isFetchingRef.current && !force) {
      console.debug('📊 loadData: Already fetching, skipping...');
      return;
    }

    try {
      setIsSyncing(true);
      isFetchingRef.current = true;
      console.log('📊 loadData: Starting data fetch from database...');
      if (USE_API) {
        // 1. Fetch System Status FIRST for fast home page render
        try {
          const statusResult = await apiGet('/api/admin/dashboard-status');
          if (statusResult && statusResult.counts) {
            setSystemStats(statusResult.counts);
            // Optimistically set samples to reduce layout shift
            if (statusResult.samples) {
              if (statusResult.samples.students) setStudents(prev => prev.length === 0 ? statusResult.samples.students : prev);
              if (statusResult.samples.todos) setTodos(prev => prev.length === 0 ? statusResult.samples.todos : prev);
              if (statusResult.samples.messages) setMessages(prev => prev.length === 0 ? statusResult.samples.messages : prev);
            }
          }
        } catch (e) { console.warn('Status fetch failed:', e); }

        const fetchSafely = async (path, defaultVal = []) => {
          try {
            console.log(`   → Fetching ${path}...`);
            const res = await apiGet(path);
            console.log(`   ✅ ${path} fetched:`, Array.isArray(res) ? `${res.length} items` : 'object');
            return Array.isArray(res) ? res : (res?.data || defaultVal);
          } catch (e) {
            console.error(`   ❌ ${path} failed:`, e.message);
            return defaultVal;
          }
        };

        // 2. High-Performance Parallel Fetching (Batching to optimize connection usage)
        const [s, f, c, m, msg, t, feesRes] = await Promise.all([
          fetchSafely('/api/students'),
          fetchSafely('/api/faculty'),
          fetchSafely('/api/courses'),
          fetchSafely('/api/materials'),
          fetchSafely('/api/messages'),
          fetchSafely('/api/todos'),
          fetchSafely('/api/fees')
        ]);

        // Ensure faculty data includes assignments properly
        const facultyWithAssignments = (f || []).map(faculty => ({
          ...faculty,
          assignments: Array.isArray(faculty.assignments) ? faculty.assignments : []
        }));

        console.log('📊 loadData: Data loaded successfully');
        console.log('   • Students:', s.length, s.length > 0 ? `First student: ${s[0].studentName || s[0].name}` : 'No students');
        console.log('   • Faculty:', facultyWithAssignments.length);
        console.log('   • Courses:', c.length);
        console.log('   • Materials:', m.length);
        console.log('   • Messages:', msg.length);
        console.log('   • Todos:', t.length);

        setStudents(s.length > 0 ? s : [
          { sid: 'VU-S-101', studentName: 'Demo Student Alpha', branch: 'CSE', year: '3', section: 'A' },
          { sid: 'VU-S-102', studentName: 'Demo Student Beta', branch: 'ECE', year: '2', section: 'B' }
        ]);
        setFaculty(facultyWithAssignments.length > 0 ? facultyWithAssignments : [
          { facultyId: 'VU-F-001', name: 'Dr. John Doe (Demo)', department: 'CSE' },
          { facultyId: 'VU-F-002', name: 'Prof. Jane Smith (Demo)', department: 'ECE' }
        ]);
        setCourses(c);
        setMaterials(m);
        setMessages(msg.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)));
        setTodos(t);
        setFees(feesRes || []);
      } else {
        console.log('📊 loadData: Using local storage (API disabled)');
        const s = await readStudents();
        const f = await readFaculty();
        // Load materials from localStorage - getting ALL materials in a flat list for admin view
        const matRaw = JSON.parse(localStorage.getItem('courseMaterials') || '[]');
        let flatMaterials = Array.isArray(matRaw) ? matRaw : [];

        setStudents(s || []);
        setFaculty(f || []);
        setCourses(JSON.parse(localStorage.getItem('courses') || '[]'));
        setMaterials(flatMaterials);
        setMessages(JSON.parse(localStorage.getItem('adminMessages') || '[]'));
      }
    } finally {
      isFetchingRef.current = false;
      setIsSyncing(false);
    }
  }, []);

  const handleDatabaseSync = async () => {
    if (!window.confirm('RELATIONSHIP MESH SYNC: This will rebuild the student-faculty enrollment graph based on current assignments. Continue?')) return;
    try {
      setIsSyncing(true);
      const res = await apiPost('/api/admin/sync-relationships');
      alert(`SYNC SUCCESS: ${res.message || 'Mesh updated.'} (${res.created || 0} mapping operations performed).`);
      loadData(true); // Canonical refresh
    } catch (err) {
      console.error('Database Sync Failed:', err);
      alert('SYNC FAILED: ' + (err.message || 'System error reported.'));
    } finally {
      setIsSyncing(false);
    }
  };
  // Centralized subject registry (merges database + static curriculum)
  const allAvailableSubjects = useMemo(() => {
    // 1. Map database subjects
    const dbSubjects = courses.map(c => ({
      _id: c._id || c.id,
      id: c.id || c._id,
      name: c.name || c.courseName || '',
      code: c.code || c.courseCode || '',
      branch: c.branch || c.department || '',
      year: c.year,
      semester: c.semester,
      section: c.section
    }));

    // 2. Map static subjects from curriculum, but only if they DON'T exist in DB for that context
    const staticBranches = ['CSE', 'ECE', 'EEE', 'Mechanical', 'Civil', 'IT', 'AIML'];
    let staticSubjects = [];

    staticBranches.forEach(b => {
      [1, 2, 3, 4].forEach(y => {
        const data = getYearData(b, String(y));
        data?.semesters?.forEach(s => {
          s.subjects.forEach(sub => {
            // Context-aware check: Does this exact subject + sem exist in DB already?
            const existsInDb = dbSubjects.some(ms =>
              (ms.code === sub.code || ms.name === sub.name) &&
              String(ms.year) === String(y) &&
              String(ms.semester) === String(s.sem)
            );

            // Prevention of internal static duplication
            const alreadyAddedStatic = staticSubjects.some(ex =>
              ex.code === sub.code && ex.name === sub.name && String(ex.year) === String(y) && String(ex.semester) === String(s.sem)
            );

            if (!existsInDb && !alreadyAddedStatic) {
              staticSubjects.push({
                name: sub.name,
                code: sub.code,
                branch: b,
                year: String(y),
                semester: String(s.sem),
                isStatic: true,
                id: `static-${b}-${sub.code}-${y}-${s.sem}`
              });
            }
          });
        });
      });
    });

    // Merge and filter
    const merged = [...dbSubjects, ...staticSubjects];
    return merged
      .filter(x => x && x.name && x.code && x.code !== 'EMPTY__OVERRIDE' && x.courseCode !== 'EMPTY__OVERRIDE')
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [courses]);

  // Load Initial Data
  // Load Initial Data
  useEffect(() => {
    console.log('🚀 AdminDashboard: Initial data load started');
    loadData();
  }, [loadData]);

  // SSE: subscribe to server push updates and refresh relevant data immediately
  useEffect(() => {
    const triggers = ['messages', 'tasks', 'announcements', 'marks', 'attendance', 'students', 'faculty', 'courses', 'fees'];
    let refreshTimeout;
    const unsub = sseClient.onUpdate((ev) => {
      try {
        if (!ev || !ev.resource) return;
        const r = ev.resource;

        if (triggers.includes(r)) {
          if (refreshTimeout) clearTimeout(refreshTimeout);

          refreshTimeout = setTimeout(() => {
            console.log(`🔄 Admin SSE Sync [${r}]: Performing full data synchronization...`);
            loadData(true);
          }, 500); // 500ms debounce to batch multiple updates
        }
      } catch (e) {
        console.error('SSE event error', e);
      }
    });
    return () => {
      if (refreshTimeout) clearTimeout(refreshTimeout);
      unsub();
    };
  }, []);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      setIsAuthenticated(false);
      setIsAdmin(false);
      setStudentData(null);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('userData'); // Clear AI Agent Identity
      navigate('/');
    }
  };


  // --- CRUD Operations ---

  // Students
  const handleSaveStudent = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    if (!data.sid || !data.studentName) return alert('ID and Name required');

    // Prevent password overwrite if left blank during edit
    if (editItem && !data.password) {
      delete data.password;
    } else if (!editItem && !data.password) {
      data.password = data.sid; // Provide a sensible default
    }

    // Explicitly handle boolean flags for checkboxes
    data.isTransportUser = e.target.isTransportUser?.checked || false;
    data.isHosteller = e.target.isHosteller?.checked || false;

    console.log('📝 FRONTEND: Preparing to save student');
    console.log('  Mode:', editItem ? 'EDIT' : 'CREATE');

    try {
      let newStudents = [...students];

      if (editItem) {
        // EDIT - Update existing student in database
        if (USE_API) {
          const idToUpdate = editItem.sid || editItem._id; // Backend expects sid for /api/students/:id
          console.log('🔄 Updating student with ID:', idToUpdate);

          const response = await apiPut(`/api/students/${idToUpdate}`, data);
          const updatedStudent = response.data || response;
          console.log('✅ Student updated from server:', updatedStudent);

          newStudents = newStudents.map(s => {
            const isMatch = (s._id && updatedStudent._id && s._id.toString() === updatedStudent._id.toString()) ||
              (s.sid && updatedStudent.sid && String(s.sid) === String(updatedStudent.sid)) ||
              (String(s.sid) === String(idToUpdate));

            if (isMatch) {
              return { ...s, ...updatedStudent };
            }
            return s;
          });
        } else {
          newStudents = newStudents.map(s => String(s.sid) === String(editItem.sid) ? { ...s, ...data } : s);
          await writeStudents(newStudents);
        }
        setStudents(newStudents);
        closeModal();
      } else {
        // CREATE (Keep synchronous to catch duplicate IDs)
        if (USE_API) {
          console.log('➕ Creating new student');
          const response = await apiPost('/api/students', data);
          const newStudent = response.data || response;
          newStudents.push(newStudent);
        } else {
          const newS = { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() };
          newStudents.push(newS);
          await writeStudents(newStudents);
        }
        setStudents(newStudents);
        closeModal();
      }

      // Success feedback (Removed blocking alert for zero-lag experience)
      console.log('✅ Student operation successful');
    } catch (error) {
      console.error("Save Student Error:", error);
      const msg = error.response?.data?.error || error.message || "Failed to save student";
      alert('Error: ' + msg);
    }
  };

  const handleDeleteStudent = async (sid) => {
    // Fast Response: Optimistic update
    setStudents(prev => prev.filter(s => s.sid !== sid));

    try {
      if (USE_API) {
        console.log('[Student] Deleting student:', sid);
        await apiDelete(`/api/students/${sid}`);
        console.log('[Student] Student deleted from server');
        // Quiet refresh to ensure sync
        loadData(true);
      } else {
        const newStudents = students.filter(s => s.sid !== sid);
        await writeStudents(newStudents);
      }
    } catch (err) {
      console.error('Delete student failed:', err);
      // Rollback on failure if needed, but for "Fast" we usually keep it
      // unless it's a critical failure.
      alert('Failed to delete student: ' + (err.message || 'Unknown error'));
      loadData(true); // Re-sync to restore if failed
    }
  };

  // Bulk Student Upload
  const handleBulkUploadStudents = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const res = await apiUpload('/api/students/bulk', formData);
      alert(res.message || 'Bulk upload completed');
      // loadData(true); // Optimization: Relied on SSE
      closeModal();
    } catch (err) {
      console.error(err);
      alert('Bulk upload failed: ' + (err.message || 'Unknown error'));
    }
  };

  // Bulk Faculty Upload
  const handleBulkUploadFaculty = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const res = await apiUpload('/api/faculty/bulk', formData);
      alert(res.message || 'Bulk faculty upload completed');
      // loadData(true); // Optimization: Relied on SSE
      closeModal();
    } catch (err) {
      console.error(err);
      alert('Bulk faculty upload failed: ' + (err.message || 'Unknown error'));
    }
  };

  // Faculty
  const handleSaveFaculty = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Explicitly handle boolean flags for checkboxes
    data.isTransportUser = e.target.isTransportUser?.checked || false;
    data.isHosteller = e.target.isHosteller?.checked || false;

    // Remove empty password for updates (don't change if not provided)
    if (editItem && !data.password) {
      delete data.password;
    } else if (!editItem && !data.password) {
      // Password required for new faculty
      alert('Password is required for new faculty');
      return;
    }

    // Merge assignments - ensure they're formatted correctly
    data.assignments = facultyAssignments.map(a => ({
      year: String(a.year || ''),
      section: String(a.section || '').toUpperCase().trim(),
      subject: String(a.subject || '').trim(),
      branch: a.branch || 'CSE',
      semester: a.semester || ''
    }));

    // Normalize Roles and Achievement Manager flags
    if (data.role === 'Achievement Manager') {
      data.isAchievementManager = true;
    } else {
      data.isAchievementManager = false;
    }

    console.log('📝 FRONTEND: Preparing to save faculty');
    console.log('  Mode:', editItem ? 'EDIT' : 'CREATE');
    console.log('  Data:', data);

    try {
      let newFaculty = [...faculty];

      if (editItem) {
        // EDIT - Update existing faculty in database
        if (USE_API) {
          const idToUpdate = editItem._id || editItem.facultyId;
          console.log('🔄 Updating faculty with ID:', idToUpdate);

          // Perform API Update
          const response = await apiPut(`/api/faculty/${idToUpdate}`, data);

          // API Client might return the data directly or a response object
          const updatedData = response.data || response;
          console.log('✅ Faculty updated from server:', updatedData);

          // Update State Logic - Robust ID Matching
          newFaculty = newFaculty.map(f => {
            // Match by _id if available, otherwise by facultyId
            const isMatch = (f._id && updatedData._id && f._id.toString() === updatedData._id.toString()) ||
              (f.facultyId && updatedData.facultyId && f.facultyId === updatedData.facultyId) ||
              (String(f._id) === String(idToUpdate)) ||
              (f.facultyId === editItem.facultyId);

            if (isMatch) {
              console.log('  -> Updating matching state item:', f.facultyId);
              return {
                ...f,
                ...updatedData,
                assignments: updatedData.assignments || data.assignments // Prefer server response
              };
            }
            return f;
          });

        } else {
          // Local Storage Mode
          newFaculty = newFaculty.map(f => f.facultyId === editItem.facultyId ? { ...f, ...data } : f);
          await writeFaculty(newFaculty);
        }
      } else {
        // CREATE - Add new faculty to database
        if (USE_API) {
          console.log('➕ Creating new faculty');
          const response = await apiPost('/api/faculty', data);
          const newF = response.data || response;
          console.log('✅ New Faculty created from server:', newF);

          newFaculty.push({
            ...newF,
            assignments: newF.assignments || data.assignments
          });
        } else {
          // Local Storage Mode
          const newF = { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() };
          newFaculty.push(newF);
          await writeFaculty(newFaculty);
        }
      }

      // 1. Immediate State Update (Optimistic/Confirmed)
      setFaculty(newFaculty);
      console.log('✅ Faculty state updated. New count:', newFaculty.length);

      if (!editItem) {
        alert(`✅ Faculty member added successfully!`);
      } else {
        alert(`✅ Faculty "${data.name || editItem.name}" updated successfully!`);
      }

      // 2. Refresh explicitly (Fallback Sync)
      // loadData(true); // Optimization: SSE handles this or trust the immediate state update

      // 3. Close the modal
      closeModal();

      // 2. Background Refresh (Consistency Check)
      if (USE_API) {
        // setTimeout(async () => {
        //   console.log('🔄 Background refreshing faculty data...');
        //   await loadData(true); 
        // }, 500);
      }

      alert('✅ Faculty saved successfully!');

    } catch (err) {
      console.error('Faculty Save Error:', err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Unknown error';
      alert('Failed to save faculty. ' + errorMsg);
    }
  };

  const handleAddAssignment = () => {
    const year = document.getElementById('assign-year').value;
    const section = document.getElementById('assign-section').value;
    const subject = document.getElementById('assign-subject').value;
    const branch = document.getElementById('assign-branch').value;

    if (year && section && subject && branch) {
      setFacultyAssignments([...facultyAssignments, { year, section, subject, branch }]);
      // clear inputs
      document.getElementById('assign-section').value = '';
      document.getElementById('assign-subject').value = '';
    } else {
      alert('Please fill Year, Branch, Section and Subject');
    }
  };
  const handleRemoveAssignment = (idx) => {
    const newAssigns = [...facultyAssignments];
    newAssigns.splice(idx, 1);
    setFacultyAssignments(newAssigns);
  };


  const handleDeleteFaculty = async (fid) => {
    // Fast Response: Optimistic update
    const newFac = faculty.filter(f => f.facultyId !== fid);
    setFaculty(newFac);

    try {
      if (USE_API) {
        // Find full object to get DB _id if needed
        const facToDelete = faculty.find(f => f.facultyId === fid);
        const idToDelete = facToDelete?._id || fid;
        await apiDelete(`/api/faculty/${idToDelete}`);
        loadData(true);
      } else {
        await writeFaculty(newFac);
      }
    } catch (err) {
      console.error('Delete faculty failed:', err);
      alert('Failed to delete faculty: ' + (err.message || 'Unknown error'));
      loadData(true);
    }
  };

  // Courses (Subjects)
  const handleSaveCourse = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      let newCourses = [...courses];
      if (editItem) {
        // Edit existing
        if (USE_API) {
          const isReallyStatic = editItem.isStatic || (String(editItem.id).startsWith('static-'));
          const idToUpdate = editItem._id || editItem.id;

          if (isReallyStatic) {
            try {
              // Attempt to Create dynamic version of static item
              await apiPost('/api/courses', data);
              // If successful, local state will be refreshed via loadData below
            } catch (err) {
              if (err.message && err.message.includes('409')) {
                // Conflict: The DB already has a version of this course! 
                // We should find it and UPDATE it instead of failing.
                console.log('[Course Migration] Subject already exists in DB, attempting UPDATE instead...');
                try {
                  // Find the existing dynamic item in our local state to get its real DB ID
                  const dbVersion = courses.find(c => (c.code === data.code || c.courseCode === data.code) && String(c.year) === String(data.year));
                  if (dbVersion) {
                    await apiPut(`/api/courses/${dbVersion._id || dbVersion.id}`, data);
                  } else {
                    // fallback attempt by code if not found in state
                    await apiPut(`/api/courses/${data.code}`, data);
                  }
                } catch (putErr) {
                  console.error('Migration update failed:', putErr);
                  throw new Error('This subject exists in database but could not be updated: ' + putErr.message);
                }
              } else {
                throw err;
              }
            }
          } else {
            // Normal DB Update
            let targetId = idToUpdate;

            // Fix: Detect undefined ID and attempt recovery
            if (!targetId || targetId === 'undefined') {
              console.warn('[handleSaveCourse] ID is undefined, attempting to find course by code...');
              const existing = courses.find(c => c.code === data.code && String(c.year) === String(data.year));
              if (existing && (existing._id || existing.id)) {
                targetId = existing._id || existing.id;
              } else {
                targetId = data.code; // Fallback to code for backend lookup
              }
            }

            if (!targetId || targetId === 'undefined') {
              throw new Error('Cannot save: Missing Course ID and Code.');
            }

            const res = await apiPut(`/api/courses/${targetId}`, data);
            const updatedCourse = res.data || res;

            // OPTIMISTIC UPDATE: Update local state immediately
            newCourses = newCourses.map(c => {
              const cId = c._id || c.id;
              const tId = updatedCourse._id || updatedCourse.id || targetId;
              // Match by ID or Code
              if (String(cId) === String(tId) || (c.code === updatedCourse.code && String(c.year) === String(updatedCourse.year))) {
                return { ...c, ...updatedCourse };
              }
              return c;
            });
          }
        } else {
          // Local storage fallback logic...
          newCourses = newCourses.map(c => c.id === editItem.id ? { ...c, ...data } : c);
          localStorage.setItem('courses', JSON.stringify(newCourses));
        }
      } else {
        // Add new
        if (USE_API) {
          try {
            const res = await apiPost('/api/courses', data);
            const savedItem = res.data || res;
            newCourses.push(savedItem);
          } catch (err) {
            if (err.message && err.message.includes('409')) {
              alert('A course with this code already exists. Please use a different course code.');
              return; // Don't close modal, let user fix the code
            } else {
              throw err;
            }
          }
        } else {
          const newC = { ...data, id: Date.now().toString() };
          newCourses.push(newC);
          localStorage.setItem('courses', JSON.stringify(newCourses));
        }
      }
      setCourses(newCourses);
      closeModal();
      // Ensure other dashboards reload fresh from server to reflect canonical DB state
      if (USE_API) loadData(true);
    } catch (err) {
      console.error('Course Save Error:', err);
      const errorMsg = err.message || 'Unknown error';
      if (errorMsg.includes('401') || errorMsg.includes('Authentication required') || errorMsg.toLowerCase().includes('session expired')) {
        alert('Authentication failed: Your session may have expired. Please log out and log in again.');
        // Force logout to clear stale tokens
        try { handleLogout(); } catch (e) { console.warn('Logout failed', e); }
      } else if (errorMsg.includes('409')) {
        alert('Course code already exists. Please use a unique course code.');
      } else {
        alert('Failed to save subject: ' + errorMsg);
      }
    }
  };

  const handleDeleteCourse = async (courseOrId) => {
    let courseToDelete;
    if (typeof courseOrId === 'object' && courseOrId !== null) {
      courseToDelete = courseOrId;
    } else {
      courseToDelete = courses.find(c => String(c.id) === String(courseOrId) || String(c._id) === String(courseOrId));
    }
    if (!courseToDelete) return;

    const { id, _id, name, isStatic, year, semester, branch, code } = courseToDelete;
    const realId = _id || id;

    // Optimistic Update
    setCourses(prev => prev.filter(c => (c._id || c.id) !== realId));

    try {
      if (USE_API) {
        if (isStatic || String(realId).startsWith('static-')) {
          await apiPost('/api/courses', {
            name: name,
            code: 'EMPTY__OVERRIDE',
            year, semester, branch: branch || 'CSE',
            section: 'All',
            credits: 0
          });
        } else {
          try {
            await apiDelete(`/api/courses/${realId}`);
          } catch (e) {
            await apiDelete(`/api/curriculum/${realId}`);
          }
        }
        loadData(true);
      } else {
        const newCourses = courses.filter(c => (c._id || c.id) !== realId);
        localStorage.setItem('courses', JSON.stringify(newCourses));
      }
    } catch (err) {
      console.error('Delete course failed:', err);
      loadData(true);
    }
  };

  // Materials (The core logic to link with Student Dashboard)
  const handleSaveMaterial = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const file = e.target.file?.files[0];

    console.log('[Material Upload] Starting upload...', {
      hasFile: !!file,
      isAdvanced: editItem?.isAdvanced,
      subject: data.subject,
      year: data.year,
      type: data.type,
      title: data.title
    });

    // Validation
    if (!data.title || !data.subject || !data.type) {
      alert('Please fill in all required fields: Title, Subject, and Type');
      return;
    }

    if (!file && !data.url && !data.link) {
      alert('Please either upload a file or provide a URL/Link');
      return;
    }

    try {
      let allMaterials = [...materials];

      if (USE_API) {
        const apiFormData = new FormData();

        // Add all form data
        for (const key in data) {
          if (data[key]) {
            apiFormData.append(key, data[key]);
            console.log(`[Material Upload] Adding field: ${key} = ${data[key]}`);
          }
        }

        // Handle isAdvanced checkbox separately if needed or ensure it's in data
        const isAdvanced = e.target.isAdvanced?.checked;
        apiFormData.append('isAdvanced', isAdvanced ? 'true' : 'false');
        console.log(`[Material Upload] Adding field: isAdvanced = ${isAdvanced}`);

        // Add file if present
        if (file) {
          apiFormData.append('file', file);
          console.log(`[Material Upload] Adding file: ${file.name} (${file.size} bytes)`);
        }

        apiFormData.append('uploadedBy', 'admin');

        // Check authentication
        // Check authentication
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
          alert('Session expired or invalid. Logging out...');
          handleLogout();
          return;
        }

        console.log('[Material Upload] Sending to API...', {
          endpoint: editItem?.id && !editItem.isAdvanced ? 'PUT' : 'POST',
          hasAdminToken: !!adminToken,
          hasFile: !!file,
          fileSize: file ? file.size : 0
        });

        // Check if we are EDITING an existing item or CREATING a new one
        if (editItem && editItem.id && !editItem.isAdvanced) {
          // EDIT: Only if we have a valid ID and it's not a "new advanced template"
          const idToUpdate = editItem._id || editItem.id;
          if (!idToUpdate) throw new Error("Missing ID for update");

          console.log('[Material Upload] Updating existing material:', idToUpdate);

          // Use apiUpload which handles FormData correctly (including files)
          // We pass 'PUT' as the third argument which we enabled in apiClient
          const res = await apiUpload(`/api/materials/${idToUpdate}`, apiFormData, 'PUT');

          const updatedMat = { ...editItem, ...res.data || res };
          allMaterials = allMaterials.map(m => (m.id === editItem.id || m._id === editItem._id) ? updatedMat : m);
        } else {
          console.log('[Material Upload] Creating new material...');

          try {
            console.log('[Material Upload] FormData size:', apiFormData.get('file')?.size || 'no file');
            console.log('[Material Upload] Sending to /api/materials with POST...');

            const res = await apiUpload('/api/materials', apiFormData);
            console.log('[Material Upload] SUCCESS! Response:', res);

            if (res && (res._id || res.id)) {
              console.log('[Material Upload] Adding successful response to materials array');
              allMaterials.push(res);
            } else {
              console.warn('[Material Upload] Response missing ID, creating local fallback');
              const fallbackItem = { ...data, id: Date.now().toString(), uploadedAt: new Date().toISOString() };
              allMaterials.push(fallbackItem);
            }
          } catch (uploadError) {
            console.error('[Material Upload] ERROR during upload:', uploadError.message);
            console.error('[Material Upload] Stack:', uploadError.stack);

            // Provide specific error messages
            if (uploadError.message.includes('Failed to fetch')) {
              throw new Error('Cannot connect to server. Please ensure:\n1. Backend server is running\n2. MongoDB is connected\n3. Check browser console for details');
            } else if (uploadError.message.includes('401')) {
              throw new Error('Authentication failed. Please log out and log in again.');
            } else if (uploadError.message.includes('400')) {
              throw new Error('Invalid data. Please check all fields and try again.');
            } else {
              throw uploadError;
            }
          }
        }

        // Refresh materials from server to ensure sync
        try {
          console.log('[Material Upload] Refreshing materials from server...');
          const refreshedMaterials = await apiGet('/api/materials');
          setMaterials(refreshedMaterials || []);
          console.log('[Material Upload] Materials refreshed successfully. Total:', refreshedMaterials?.length || 0);
        } catch (refreshErr) {
          console.warn('[Material Upload] Failed to refresh materials:', refreshErr);
          setMaterials(allMaterials);
        }
      } else {
        // Local fallback
        const newMaterial = {
          id: editItem ? editItem.id : Date.now().toString(),
          title: data.title,
          type: data.type,
          url: data.url || (file ? URL.createObjectURL(file) : '#'),
          year: data.year,
          section: data.section || 'All',
          subject: data.subject,
          module: data.module,
          unit: data.unit,
          topic: data.topic || 'General',
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'admin'
        };
        if (editItem) {
          allMaterials = allMaterials.map(m => m.id === editItem.id ? newMaterial : m);
        } else {
          allMaterials.push(newMaterial);
        }
        localStorage.setItem('courseMaterials', JSON.stringify(allMaterials));
        setMaterials(allMaterials);
      }

      closeModal();
      alert('✅ Material uploaded successfully! Students can now access it in their dashboard.');
      console.log('[Material Upload] Operation completed successfully');

    } catch (err) {
      console.error('[Material Upload] Error:', err);
      console.error('[Material Upload] Error stack:', err.stack);

      const errorMessage = err.message || 'Unknown error';

      let userMessage = 'Material Operation Failed:\n\n';

      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Cannot connect')) {
        userMessage += '❌ Cannot connect to server\n\n';
        userMessage += 'Please check:\n';
        userMessage += '1. Backend server is running (run_unified_app.bat)\n';
        userMessage += '2. MongoDB is connected\n';
        userMessage += '3. No firewall blocking localhost:5000\n\n';
        userMessage += 'Check browser console (F12) for details.';
      } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized') || errorMessage.includes('Authentication')) {
        userMessage += '❌ Authentication Error\n\n';
        userMessage += 'Your session may have expired.\n';
        userMessage += 'Please log out and log in again.';
      } else if (errorMessage.includes('400')) {
        userMessage += '❌ Invalid Data\n\n';
        userMessage += 'Please check:\n';
        userMessage += '1. All required fields are filled\n';
        userMessage += '2. File type is supported\n';
        userMessage += '3. File size is under 100MB';
      } else {
        userMessage += errorMessage;
      }

      alert(userMessage);
    }
  };

  const handleDeleteMaterial = async (id) => {
    // Fast Response: Optimistic update
    const prevMats = [...materials];
    setMaterials(prev => prev.filter(m => m.id !== id && m._id !== id));

    try {
      console.log('[Admin] Deleting material with ID:', id);

      if (USE_API) {
        // Find the material to get the correct ID
        const matToDelete = prevMats.find(m => m.id === id || m._id === id);
        if (!matToDelete) {
          console.warn('Material not found for deletion');
          return;
        }

        const dbId = matToDelete._id || matToDelete.id || id;
        console.log('[Admin] Sending DELETE request for ID:', dbId);

        // Send delete request to backend
        await apiDelete(`/api/materials/${dbId}`);
        console.log('[Admin] Material deleted successfully from backend');
      }

      // Update localStorage if not using API
      if (!USE_API) {
        const newMats = prevMats.filter(m => m.id !== id && m._id !== id);
        localStorage.setItem('courseMaterials', JSON.stringify(newMats));
      }

      // Quiet refresh to ensure sync
      if (USE_API) {
        loadData(true);
      }

    } catch (err) {
      console.error('[Admin] Delete material error:', err);
      // Rollback on failure
      setMaterials(prevMats);
      
      const errorMsg = err.message || 'Unknown error';
      if (errorMsg.includes('401')) {
        alert('❌ Session expired. Please log in again.');
      } else {
        alert(`❌ Failed to delete material!`);
      }
    }
  };

  // Fees
  const handleSaveFee = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      if (USE_API) {
        const sid = data.studentId || editItem?.studentId;
        await apiPut(`/api/fees/${sid}`, {
          totalFee: parseFloat(data.totalFee),
          paidAmount: parseFloat(data.paidAmount),
          academicYear: data.academicYear,
          semester: data.semester
        });
        await loadData(true);
      }
      closeModal();
      alert('Fee record updated successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to save fee record');
    }
  };

  // ToDos
  const handleSaveTodo = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const text = formData.get('text');
    const target = formData.get('target');
    const dueDate = formData.get('dueDate');

    try {
      if (editItem) {
        // Update existing
        if (USE_API) {
          await apiPut(`/api/todos/${editItem.id}`, { text, target, dueDate });
        }
        // Optimistic update
        const newTodos = todos.map(t => t.id === editItem.id ? { ...t, text, target, dueDate } : t);
        setTodos(newTodos);
      } else {
        // Create new
        if (USE_API) {
          const res = await apiPost('/api/todos', { text, target, dueDate });
          setTodos([...todos, res.data || res]);
        } else {
          const newItem = { id: Date.now(), text, target, dueDate, completed: false };
          setTodos([...todos, newItem]);
        }
      }
      if (!USE_API) localStorage.setItem('adminTodos', JSON.stringify(todos)); // fallback
      closeModal();
    } catch (e) {
      console.error("Failed to save todo", e);
      alert("Failed to save task");
    }
  };

  const toggleTodo = async (id) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    // Optimistic
    const newStatus = !todo.completed;
    const newTodos = todos.map(t => t.id === id ? { ...t, completed: newStatus } : t);
    setTodos(newTodos);

    if (USE_API) {
      try {
        await apiPut(`/api/todos/${id}`, { completed: newStatus });
      } catch (e) { console.error(e); }
    } else {
      localStorage.setItem('adminTodos', JSON.stringify(newTodos));
    }
  };

  const deleteTodo = async (id) => {
    const idToDelete = id;
    try {
      if (USE_API) {
        await apiDelete(`/api/todos/${idToDelete}`);
      } else {
        const newTodos = todos.filter(t => t.id !== idToDelete);
        setTodos(newTodos);
        localStorage.setItem('adminTodos', JSON.stringify(newTodos));
      }
      setTodos(prev => prev.filter(t => t.id !== idToDelete));
    } catch (e) {
      console.error(e);
      alert("Failed to delete task");
    }
  };

  // Messages
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const target = formData.get('target');
    const message = formData.get('message');
    const targetYear = formData.get('targetYear');
    const targetSections = formData.getAll('targetSections');

    const payload = {
      message,
      target,
      type: 'announcement',
      date: new Date().toISOString()
    };

    if (target === 'students-specific') {
      payload.targetYear = targetYear;
      payload.targetSections = targetSections;
    }

    try {
      if (USE_API) {
        await apiPost('/api/messages', payload);
        loadData(true); // Refresh list from server
      } else {
        const newMsgs = [...messages, { ...payload, id: Date.now() }];
        setMessages(newMsgs);
        localStorage.setItem('adminMessages', JSON.stringify(newMsgs));
      }
      alert('✅ Announcement Successfully Sent');
      closeModal();
    } catch (err) {
      console.error('Announcement Sending Failed:', err);
      alert('Error: ' + (err.message || 'Unknown error'));
    }
  };

  // Helpers
  const openModal = async (type, item = null) => {
    setModalType(type);
    setEditItem(item);

    // Fetch comprehensive student data if viewing profile
    if (type === 'student-view' && item) {
      try {
        const sid = item.sid || item.studentId?.sid || item.id;
        const mongoId = item._id;

        // Fetch achievements and student overview in parallel for performance
        const [achRes, overviewRes] = await Promise.all([
          apiGet(`/api/achievements/student/${mongoId || sid}`),
          apiGet(`/api/students/${sid}/overview`)
        ]);

        if (achRes.success) {
          setViewedStudentAchievements(achRes.achievements || []);
        }

        if (overviewRes && overviewRes.student) {
          // Update editItem with full student data including marks and stats
          setEditItem(overviewRes.student);
        }
      } catch (err) {
        console.error('Failed to fetch full student intelligence profile:', err);
        setViewedStudentAchievements([]);
      }
    }

    if ((type === 'faculty' || type === 'faculty-view') && item && item.assignments) {
      // Normalize: If legacy format (sections array), flatten it
      let flatAssigns = [];
      item.assignments.forEach(a => {
        if (a.sections && Array.isArray(a.sections)) {
          // Legacy format with sections array
          a.sections.forEach(sec => {
            flatAssigns.push({
              year: a.year,
              subject: a.subject,
              section: sec,
              branch: a.branch || 'CSE', // Preserve branch
              semester: a.semester || '' // Preserve semester
            });
          });
        } else {
          // Modern format or already flattened
          flatAssigns.push({
            year: a.year,
            subject: a.subject,
            section: a.section,
            branch: a.branch || 'CSE',
            semester: a.semester || ''
          });
        }
      });
      setFacultyAssignments(flatAssigns);
    } else {
      setFacultyAssignments([]);
    }

    if (type !== 'student-view' && type !== 'faculty-view') {
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditItem(null);
    setModalType(null);
    setMsgTarget('all');
    setShowPassword(false);
  };

  // Autofill email in faculty modal from facultyId when creating new entries.
  useEffect(() => {
    if (!(showModal && modalType === 'faculty')) return;

    // Attach after modal rendered
    const attach = () => {
      const fid = document.querySelector('input[name="facultyId"]');
      const email = document.querySelector('input[name="email"]');
      if (!fid || !email) return;

      const onInput = (e) => {
        const v = String(e.target.value || '').trim();
        if (!v) return;
        const prevAuto = email.dataset.autogenerated === 'true';
        if (!email.value || prevAuto) {
          email.value = `${v}@example.com`;
          email.dataset.autogenerated = 'true';
        }
      };

      const onBlur = () => {
        const v = String(fid.value || '').trim();
        if (v && !email.value) {
          email.value = `${v}@example.com`;
          email.dataset.autogenerated = 'true';
        }
      };

      fid.addEventListener('input', onInput);
      fid.addEventListener('blur', onBlur);
      // store handlers for cleanup
      window.__facEmailAutofill = { onInput, onBlur };
    };

    const t = setTimeout(attach, 50);
    return () => {
      clearTimeout(t);
      const fid = document.querySelector('input[name="facultyId"]');
      if (fid && window.__facEmailAutofill) {
        fid.removeEventListener('input', window.__facEmailAutofill.onInput);
        fid.removeEventListener('blur', window.__facEmailAutofill.onBlur);
      }
      delete window.__facEmailAutofill;
    };
  }, [showModal, modalType]);

  // Helper to fix broken links by prepending API URL if relative
  const getFileUrl = (url) => {
    if (!url) return '#';
    if (url.startsWith('http') || url.startsWith('https') || url.startsWith('blob:')) return url;
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className={`admin-dashboard-v2 ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
      {mobileSidebarOpen && (
        <div className="mobile-overlay" onClick={() => setMobileSidebarOpen(false)}></div>
      )}
      <AdminHeader
        adminData={adminData}
        view={activeSection}
        setView={(section) => { setActiveSection(section); setMobileSidebarOpen(false); }}
        openModal={openModal}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        isSyncing={isSyncing}
      />

      {/* Mobile Menu Toggle */}
      <button
        className="admin-mobile-toggle"
        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        title="Toggle Sidebar"
      >
        <FaBars />
      </button>

      <main className="admin-viewport">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.02, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="admin-content-scroll"
          >

            {activeSection === 'overview' && (
              <AdminHome
                students={students}
                faculty={faculty}
                courses={courses}
                materials={materials}
                fees={fees}
                todos={todos}
                systemStats={systemStats}
                setActiveSection={setActiveSection}
                openAiWithPrompt={openAiWithPrompt}
                handleDatabaseSync={handleDatabaseSync}
              />
            )}

            {/* Dynamic Sections based on Header Navigation */}
            {activeSection === 'students' && (
              <div className="nexus-hub-viewport" style={{ padding: '0 2rem' }}>
                <div className="f-node-head" style={{ marginBottom: '2.5rem', background: 'transparent' }}>
                  <h2 style={{ fontSize: '2.4rem', fontWeight: 950, color: 'var(--admin-secondary)', letterSpacing: '-1px' }}>STUDENT REGISTRY</h2>
                  <div className="admin-badge primary">MANAGE STUDENTS</div>
                </div>
                <StudentSection
                  students={students}
                  openModal={openModal}
                  handleDeleteStudent={handleDeleteStudent}
                  onRefresh={() => loadData(true)}
                />
              </div>
            )}

            {activeSection === 'faculty' && (
              <div className="nexus-hub-viewport" style={{ padding: '0 2rem' }}>
                <div className="f-node-head" style={{ marginBottom: '2.5rem', background: 'transparent' }}>
                  <h2 style={{ fontSize: '2.4rem', fontWeight: 950, color: 'var(--admin-secondary)', letterSpacing: '-1px' }}>FACULTY DIRECTORY</h2>
                  <div className="admin-badge accent">MANAGE STAFF</div>
                </div>
                <FacultySection
                  faculty={faculty}
                  students={students}
                  openModal={openModal}
                  handleDeleteFaculty={handleDeleteFaculty}
                  allSubjects={allAvailableSubjects}
                />
              </div>
            )}

            {activeSection === 'courses' && (
              <div className="nexus-hub-viewport" style={{ padding: '0 2rem' }}>
                <AcademicHub
                  courses={courses}
                  students={students}
                  materials={materials}
                  openModal={openModal}
                  handleDeleteCourse={handleDeleteCourse}
                  initialSection={globalSectionFilter}
                  onSectionChange={(val) => setGlobalSectionFilter(val)}
                  openAiWithPrompt={openAiWithPrompt}
                  isSyncing={isSyncing}
                />
              </div>
            )}

            {activeSection === 'materials' && (
              <div className="nexus-hub-viewport" style={{ padding: '0 3rem' }}>
                <div className="f-node-head" style={{ marginBottom: '3rem', background: 'transparent' }}>
                  <h2 style={{ fontSize: '2.4rem', fontWeight: 950, color: 'var(--admin-secondary)', letterSpacing: '-1px' }}>MATERIAL MANAGER</h2>
                  <div className="admin-badge warning">FILES & NOTES</div>
                </div>

                <MaterialSection
                  materials={materials}
                  openModal={openModal}
                  handleDeleteMaterial={handleDeleteMaterial}
                  getFileUrl={getFileUrl}
                  allSubjects={allAvailableSubjects}
                />


              </div>
            )}

            {activeSection === 'attendance' && (
              <AttendanceManagerDashboard isEmbedded={true} managerData={{ name: 'Admin', role: 'Administrator' }} onLogout={() => { }} />
            )}

            {activeSection === 'schedule' && (
              <ScheduleManagerDashboard isEmbedded={true} managerData={{ name: 'Admin', role: 'Administrator' }} onLogout={() => { }} />
            )}

            {activeSection === 'todos' && (
              <div className="nexus-hub-viewport" style={{ padding: '0 2rem' }}>
                <div className="f-node-head" style={{ marginBottom: '2.5rem', background: 'transparent' }}>
                  <h2 style={{ fontSize: '2.4rem', fontWeight: 950, color: 'var(--admin-secondary)', letterSpacing: '-1px' }}>ADMIN TASKS</h2>
                  <div className="admin-badge danger">PRIORITY</div>
                </div>
                <TodoSection
                  todos={todos}
                  openModal={openModal}
                  toggleTodo={toggleTodo}
                  deleteTodo={deleteTodo}
                />
              </div>
            )}

            {activeSection === 'messages' && (
              <div className="nexus-hub-viewport" style={{ padding: '0 2rem' }}>
                <div className="f-node-head" style={{ marginBottom: '2.5rem', background: 'transparent' }}>
                  <h2 style={{ fontSize: '2.4rem', fontWeight: 950, color: 'var(--admin-secondary)', letterSpacing: '-1px' }}>ANNOUNCEMENTS</h2>
                  <div className="admin-badge primary"> BROADCAST</div>
                </div>
                <MessageSection
                  messages={messages}
                  openModal={openModal}
                />
              </div>
            )}

            {activeSection === 'broadcast' && (
              <div className="nexus-hub-viewport" style={{ padding: '0 2rem' }}>
                <div style={{ textAlign: 'center', margin: '4rem 0' }}>
                  <h2 style={{ fontSize: '3rem', fontWeight: 950, color: 'var(--admin-secondary)', letterSpacing: '-2px', marginBottom: '1rem' }}>BROADCAST SYSTEM</h2>
                  <p style={{ color: 'var(--admin-text-muted)', fontWeight: 850 }}>Send announcements to all students and faculty.</p>
                </div>
                <div style={{ maxWidth: '700px', margin: '0 auto', background: 'white', padding: '4rem', borderRadius: '32px', border: '1px solid var(--admin-border)', boxShadow: 'var(--admin-shadow-lg)', textAlign: 'center' }}>
                  <div style={{ fontSize: '4rem', color: '#f43f5e', marginBottom: '2rem' }}><FaBullhorn /></div>
                  <button onClick={() => openModal('message')} className="admin-btn admin-btn-primary" style={{ width: '100%', height: '70px', fontSize: '1.2rem' }}>
                    CREATE ANNOUNCEMENT
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'marks' && (
              <div className="nexus-hub-viewport" style={{ padding: '0 2rem' }}>
                <AdminMarks />
              </div>
            )}

            {activeSection === 'exams' && (
              <div className="nexus-hub-viewport" style={{ padding: '0 2rem' }}>
                <div className="f-node-head" style={{ marginBottom: '2.5rem', background: 'transparent' }}>
                  <h2 style={{ fontSize: '2.4rem', fontWeight: 950, color: 'var(--admin-secondary)', letterSpacing: '-1px' }}>EXAM MANAGEMENT</h2>
                  <div className="admin-badge accent">CONTROLS</div>
                </div>
                <AdminExams />
              </div>
            )}

            {activeSection === 'ai-agent' && (
              <div style={{ height: 'calc(100vh - 120px)', padding: '0 2rem' }}>
                <div className="f-node-head" style={{ marginBottom: '2.5rem', background: 'transparent' }}>
                  <h2 style={{ fontSize: '2.4rem', fontWeight: 950, color: 'var(--admin-secondary)', letterSpacing: '-1px' }}>AI ASSISTANT</h2>
                  <div className="admin-badge primary">VU AI</div>
                </div>
                <VuAiAgent onNavigate={setActiveSection} />
              </div>
            )}

            {activeSection === 'analytics' && (
              <AdminAnalyticsDashboard adminData={{ name: 'System Administrator', role: 'Main Administrator' }} />
            )}

            {activeSection === 'achievements' && (
              <div className="nexus-hub-viewport" style={{ padding: '0 2rem' }}>
                <div className="f-node-head" style={{ marginBottom: '2.5rem', background: 'transparent' }}>
                  <h2 style={{ fontSize: '2.4rem', fontWeight: 950, color: 'var(--admin-secondary)', letterSpacing: '-1px' }}>ACHIEVEMENT MANAGER</h2>
                  <div className="admin-badge warning">STUDENT EXCELLENCE</div>
                </div>
                <AchievementManager />
              </div>
            )}

            {activeSection === 'staff-roles' && (
              <div className="nexus-hub-viewport" style={{ padding: '0 2rem' }}>
                <div className="f-node-head" style={{ marginBottom: '2.5rem', background: 'transparent' }}>
                  <h2 style={{ fontSize: '2.4rem', fontWeight: 950, color: 'var(--admin-secondary)', letterSpacing: '-1px' }}>ACCESS CONTROL</h2>
                  <div className="admin-badge danger">STAFF ROLES</div>
                </div>
                <AdminStaffRoles faculty={faculty} openModal={openModal} />
              </div>
            )}

            {activeSection === 'fees' && <FinanceManagerDashboard isEmbedded={true} managerData={{ name: 'Admin', role: 'Administrator' }} onLogout={() => { }} />}
            {activeSection === 'admissions' && <AdmissionsManagerDashboard isEmbedded={true} managerData={{ name: 'Admin', role: 'Administrator' }} onLogout={() => { }} />}
            {activeSection === 'finance' && <FinanceManagerDashboard isEmbedded={true} managerData={{ name: 'Admin', role: 'Administrator' }} onLogout={() => { }} />}
            {activeSection === 'events' && <EventsManagerDashboard isEmbedded={true} managerData={{ name: 'Admin', role: 'Administrator' }} onLogout={() => { }} />}
            {activeSection === 'hostel' && <HostelManagerDashboard isEmbedded={true} managerData={{ name: 'Admin', role: 'Administrator' }} onLogout={() => { }} />}
            {activeSection === 'library' && <LibraryManagerDashboard isEmbedded={true} managerData={{ name: 'Admin', role: 'Administrator' }} onLogout={() => { }} />}
            {activeSection === 'transport' && <TransportManagerDashboard isEmbedded={true} managerData={{ name: 'Admin', role: 'Administrator' }} onLogout={() => { }} />}
            {activeSection === 'placement' && <PlacementManagerDashboard isEmbedded={true} managerData={{ name: 'Admin', role: 'Administrator' }} onLogout={() => { }} />}
            {activeSection === 'research' && <ResearchManagerDashboard isEmbedded={true} managerData={{ name: 'Admin', role: 'Administrator' }} onLogout={() => { }} />}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* --- MASTER ADMIN MODAL ENGINE --- */}
      <AnimatePresence>
        {showModal && !['student-view', 'faculty-view'].includes(modalType) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="admin-modal-overlay"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className={`admin-modal-content ${modalType === 'message' ? 'narrow' : ''}`}
              onClick={e => e.stopPropagation()}
            >
              <button className="nexus-modal-close" onClick={closeModal}><FaTimes /></button>

              <div className="modal-header-v2">
                <div className="modal-icon-box">
                  {modalType === 'student' && <FaUserGraduate />}
                  {modalType === 'faculty' && <FaChalkboardTeacher />}
                  {modalType === 'course' && <FaBook />}
                  {modalType === 'material' && <FaFileUpload />}
                  {modalType === 'todo' && <FaCheckCircle />}
                  {modalType === 'message' && <FaBullhorn />}
                </div>
                <div>
                  <h2>{editItem ? 'UPDATE' : 'INITIALIZE'} {modalType?.toUpperCase()}</h2>
                  <p>{editItem ? `Modifying record: ${editItem.sid || editItem.facultyId || editItem.id}` : `Creating new system node for ${modalType}`}</p>
                </div>
              </div>

              <div className="modal-scroll-area">
                {/* 1. STUDENT FORM */}
                {modalType === 'student' && (
                  <form onSubmit={handleSaveStudent} className="admin-form-v2">
                    <div className="form-grid-v2">
                      <div className="input-group-v2">
                        <label>Student ID (SID)</label>
                        <input name="sid" defaultValue={editItem?.sid} readOnly={!!editItem} placeholder="e.g. 2100030001" required />
                      </div>
                      <div className="input-group-v2">
                        <label>Full Name</label>
                        <input name="studentName" defaultValue={editItem?.studentName} placeholder="Enter full name" required />
                      </div>
                      <div className="input-group-v2">
                        <label>Email Address</label>
                        <input type="email" name="email" defaultValue={editItem?.email} placeholder="university@email.com" />
                      </div>
                      <div className="input-group-v2">
                        <label>Password</label>
                        <div style={{ position: 'relative' }}>
                          <input type={showPassword ? "text" : "password"} name="password" placeholder={editItem ? "Leave blank to keep current" : "Set initial password"} required={!editItem} />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}>
                            {showPassword ? <FaEye /> : <FaBars />}
                          </button>
                        </div>
                      </div>
                      <div className="input-group-v2">
                        <label>Branch / Program</label>
                        <select name="branch" defaultValue={editItem?.branch || 'CSE'}>
                          <option>CSE</option><option>ECE</option><option>EEE</option><option>Mechanical</option><option>Civil</option><option>IT</option><option>AIML</option>
                        </select>
                      </div>
                      <div className="input-group-v2">
                        <label>Academic Year</label>
                        <select name="year" defaultValue={editItem?.year || '1'}>
                          <option value="1">Year 1</option><option value="2">Year 2</option><option value="3">Year 3</option><option value="4">Year 4</option>
                        </select>
                      </div>
                      <div className="input-group-v2">
                        <label>Section</label>
                        <select name="section" defaultValue={editItem?.section || 'A'}>
                          {SECTION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div className="input-group-v2">
                        <label>Gender</label>
                        <select name="gender" defaultValue={editItem?.gender || 'Male'}>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="input-group-v2">
                        <label>Phone Number</label>
                        <input name="phone" defaultValue={editItem?.phone} placeholder="+91 XXXXX XXXXX" />
                      </div>
                      <div className="input-group-v2" style={{ gridColumn: 'span 2' }}>
                        <label>Address</label>
                        <textarea name="address" defaultValue={editItem?.address} placeholder="Enter complete address..." rows="2" style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--admin-border)' }} />
                      </div>
                      <div className="input-group-v2" style={{ display: 'flex', gap: '2rem', alignItems: 'center', gridColumn: 'span 2' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input type="checkbox" name="isTransportUser" defaultChecked={!!editItem?.isTransportUser} value="true" /> Transport User
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input type="checkbox" name="isHosteller" defaultChecked={!!editItem?.isHosteller} value="true" /> Hosteller
                        </label>
                      </div>
                    </div>
                    <div className="modal-actions-v2">
                      <button type="button" className="admin-btn admin-btn-outline" onClick={closeModal}>CANCEL</button>
                      <button type="submit" className="admin-btn admin-btn-primary"><FaSave /> {editItem ? 'SYNC UPDATES' : 'COMMENCE INSERTION'}</button>
                    </div>
                  </form>
                )}

                {/* 2. FACULTY FORM */}
                {modalType === 'faculty' && (
                  <form onSubmit={handleSaveFaculty} className="admin-form-v2">
                    <div className="form-grid-v2">
                      <div className="input-group-v2">
                        <label>Faculty ID</label>
                        <input name="facultyId" defaultValue={editItem?.facultyId} readOnly={!!editItem} placeholder="e.g. FAC001" required />
                      </div>
                      <div className="input-group-v2">
                        <label>Full Name</label>
                        <input name="name" defaultValue={editItem?.name} placeholder="Enter full name" required />
                      </div>
                      <div className="input-group-v2">
                        <label>Email Address</label>
                        <input name="email" defaultValue={editItem?.email} placeholder="faculty@university.com" required />
                      </div>
                      <div className="input-group-v2">
                        <label>Credentials (Password)</label>
                        <input type="password" name="password" placeholder={editItem ? "Unchanged if empty" : "Required for new staff"} required={!editItem} />
                      </div>
                      <div className="input-group-v2">
                        <label>Department</label>
                        <select name="department" defaultValue={editItem?.department || 'CSE'}>
                          <option>CSE</option><option>ECE</option><option>EEE</option><option>Mechanical</option><option>Civil</option><option>IT</option><option>AIML</option>
                        </select>
                      </div>
                      <div className="input-group-v2">
                        <label>Access Role / Privileges</label>
                        <select name="role" defaultValue={editItem?.isAchievementManager ? 'Achievement Manager' : (editItem?.role || 'Faculty')}>
                          <option value="Faculty">Faculty Member (Standard)</option>
                          <option value="System Administrator">System Administrator</option>
                          <option value="Placement Manager">Placement Manager</option>
                          <option value="Attendance Manager">Attendance Manager</option>
                          <option value="Schedule Manager">Schedule Manager</option>
                          <option value="Achievement Manager">Achievement Manager</option>
                          <option value="Admissions Manager">Admissions Manager</option>
                          <option value="Events Manager">Events Manager</option>
                          <option value="Finance Manager">Finance Manager</option>
                          <option value="Hostel Manager">Hostel Manager</option>
                          <option value="Library Manager">Library Manager</option>
                          <option value="Research Manager">Research Manager</option>
                          <option value="Transport Manager">Transport Manager</option>
                        </select>
                      </div>
                      <div className="input-group-v2">
                        <label>Gender</label>
                        <select name="gender" defaultValue={editItem?.gender || 'Male'}>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="input-group-v2">
                        <label>Phone Number</label>
                        <input name="phone" defaultValue={editItem?.phone} placeholder="+91 XXXXX XXXXX" />
                      </div>
                      <div className="input-group-v2" style={{ gridColumn: 'span 2' }}>
                        <label>Home Address</label>
                        <textarea name="address" defaultValue={editItem?.address} placeholder="Enter complete address..." rows="2" style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--admin-border)' }} />
                      </div>
                      <div className="input-group-v2" style={{ display: 'flex', gap: '2rem', alignItems: 'center', gridColumn: 'span 2' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input type="checkbox" name="isTransportUser" defaultChecked={!!editItem?.isTransportUser} value="true" /> Transport User
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input type="checkbox" name="isHosteller" defaultChecked={!!editItem?.isHosteller} value="true" /> Hosteller
                        </label>
                      </div>
                    </div>

                    <div className="assignment-engine-v2">
                      <h3>TEACHING ASSIGNMENT MESH</h3>
                      <div className="assignment-controls">
                        <select id="assign-branch"><option>CSE</option><option>ECE</option><option>EEE</option><option>Mechanical</option></select>
                        <select id="assign-year"><option value="1">Y-1</option><option value="2">Y-2</option><option value="3">Y-3</option><option value="4">Y-4</option></select>
                        <select id="assign-section">
                          {SECTION_OPTIONS.map(opt => <option key={opt} value={opt}>Sec {opt}</option>)}
                        </select>
                        <input id="assign-subject" list="subject-list" placeholder="Subject Name" />
                        <datalist id="subject-list">
                          {allAvailableSubjects.map(s => <option key={s.id} value={s.name}>{s.code}</option>)}
                        </datalist>
                        <button type="button" onClick={handleAddAssignment} className="icon-btn-v2"><FaPlus /></button>
                      </div>

                      <div className="assignment-chips">
                        {facultyAssignments.map((a, i) => (
                          <div key={i} className="a-chip">
                            <span>{a.branch} Y{a.year}-S{a.section}: <b>{a.subject}</b></span>
                            <button type="button" onClick={() => handleRemoveAssignment(i)}>&times;</button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="modal-actions-v2">
                      <button type="button" className="admin-btn admin-btn-outline" onClick={closeModal}>ABORT</button>
                      <button type="submit" className="admin-btn admin-btn-primary"><FaSave /> COMMIT NODE</button>
                    </div>
                  </form>
                )}

                {/* 3. COURSE FORM */}
                {modalType === 'course' && (
                  <form onSubmit={handleSaveCourse} className="admin-form-v2">
                    <div className="form-grid-v2">
                      <div className="input-group-v2" style={{ gridColumn: 'span 2' }}>
                        <label>Course Name</label>
                        <input name="name" defaultValue={editItem?.name} placeholder="e.g. Data Structures & Algorithms" required />
                      </div>
                      <div className="input-group-v2">
                        <label>Course Code</label>
                        <input name="code" defaultValue={editItem?.code} placeholder="e.g. CS201" required />
                      </div>
                      <div className="input-group-v2">
                        <label>Branch</label>
                        <select name="branch" defaultValue={editItem?.branch || 'CSE'}>
                          <option>CSE</option><option>ECE</option><option>EEE</option><option>Mechanical</option><option>Civil</option><option>IT</option><option>AIML</option>
                        </select>
                      </div>
                      <div className="input-group-v2">
                        <label>Year</label>
                        <select name="year" defaultValue={editItem?.year || '1'}>
                          <option value="1">Year 1</option><option value="2">Year 2</option><option value="3">Year 3</option><option value="4">Year 4</option>
                        </select>
                      </div>
                      <div className="input-group-v2">
                        <label>Semester</label>
                        <select name="semester" defaultValue={editItem?.semester || '1'}>
                          {[...Array(8)].map((_, i) => <option key={i + 1} value={i + 1}>Sem {i + 1}</option>)}
                        </select>
                      </div>
                      <div className="input-group-v2">
                        <label>Credits</label>
                        <input type="number" name="credits" defaultValue={editItem?.credits || 3} min="0" max="10" />
                      </div>
                      <div className="input-group-v2">
                        <label>Category</label>
                        <select name="type" defaultValue={editItem?.type || 'Core'}>
                          <option>Core</option><option>Elective</option><option>Lab</option><option>Seminar</option>
                        </select>
                      </div>
                    </div>
                    <div className="modal-actions-v2">
                      <button type="button" className="admin-btn admin-btn-outline" onClick={closeModal}>CANCEL</button>
                      <button type="submit" className="admin-btn admin-btn-primary"><FaSave /> SAVE SUBJECT</button>
                    </div>
                  </form>
                )}

                {/* 4. MATERIAL FORM */}
                {modalType === 'material' && (
                  <form onSubmit={handleSaveMaterial} className="admin-form-v2">
                    <div className="form-grid-v2">
                      <div className="input-group-v2" style={{ gridColumn: 'span 2' }}>
                        <label>Resource Title</label>
                        <input name="title" defaultValue={editItem?.title} placeholder="e.g. Unit 1 - Introduction to AI" required />
                      </div>
                      <div className="input-group-v2">
                        <label>Target Subject</label>
                        <input list="mat-sub-list" name="subject" defaultValue={editItem?.subject} placeholder="Select subject" required />
                        <datalist id="mat-sub-list">
                          {allAvailableSubjects.map(s => <option key={s.id} value={s.name}>{s.code}</option>)}
                        </datalist>
                      </div>
                      <div className="input-group-v2">
                        <label>Resource Type</label>
                        <select name="type" defaultValue={editItem?.type || 'PDF'}>
                          <option>PDF</option><option>Video</option><option>Link</option><option>Quiz</option><option>Notes</option>
                        </select>
                      </div>
                      <div className="input-group-v2">
                        <label>Target Year</label>
                        <select name="year" defaultValue={editItem?.year || '1'}>
                          <option value="1">Year 1</option><option value="2">Year 2</option><option value="3">Year 3</option><option value="4">Year 4</option>
                        </select>
                      </div>
                      <div className="input-group-v2" style={{ gridColumn: 'span 2' }}>
                        <label>Source File / Link</label>
                        <div className="file-link-switcher">
                          <input type="file" name="file" />
                          <div className="or-divider">OR</div>
                          <input type="url" name="url" defaultValue={editItem?.url} placeholder="External URL (https://...)" />
                        </div>
                      </div>
                    </div>
                    <div className="modal-actions-v2">
                      <button type="button" className="admin-btn admin-btn-outline" onClick={closeModal}>DISCARD</button>
                      <button type="submit" className="admin-btn admin-btn-primary"><FaFileUpload /> PUBLISH ASSETS</button>
                    </div>
                  </form>
                )}

                {/* 5. TODO FORM */}
                {modalType === 'todo' && (
                  <form onSubmit={handleSaveTodo} className="admin-form-v2">
                    <div className="input-group-v2">
                      <label>Task Description</label>
                      <textarea name="text" defaultValue={editItem?.text} placeholder="What needs to be done?" required rows="3" />
                    </div>
                    <div className="form-grid-v2" style={{ marginTop: '1rem' }}>
                      <div className="input-group-v2">
                        <label>Priority</label>
                        <select name="target" defaultValue={editItem?.target || 'High'}>
                          <option>High</option><option>Medium</option><option>Low</option>
                        </select>
                      </div>
                      <div className="input-group-v2">
                        <label>Deadline</label>
                        <input type="date" name="dueDate" defaultValue={editItem?.dueDate} />
                      </div>
                    </div>
                    <div className="modal-actions-v2">
                      <button type="button" className="admin-btn admin-btn-outline" onClick={closeModal}>CANCEL</button>
                      <button type="submit" className="admin-btn admin-btn-primary"><FaSave /> ASSIGN DIRECTIVE</button>
                    </div>
                  </form>
                )}

                {/* 6. MESSAGE / BROADCAST FORM */}
                {modalType === 'message' && (
                  <form onSubmit={handleSendMessage} className="admin-form-v2">
                    <div className="input-group-v2">
                      <label>Broadcast Target</label>
                      <select name="target" value={msgTarget} onChange={(e) => setMsgTarget(e.target.value)}>
                        <option value="all">Global (Everyone)</option>
                        <option value="students">All Students</option>
                        <option value="faculty">All Faculty</option>
                        <option value="students-specific">Specific Student Cohorts</option>
                      </select>
                    </div>

                    {msgTarget === 'students-specific' && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="cohort-selector">
                        <div className="input-group-v2">
                          <label>Batch Year</label>
                          <select name="targetYear"><option value="1">Year 1</option><option value="2">Year 2</option><option value="3">Year 3</option><option value="4">Year 4</option></select>
                        </div>
                        <div className="input-group-v2">
                          <label>Sections</label>
                          <div className="section-grid-tiny">
                            {['A', 'B', 'C', 'D'].map(s => (
                              <label key={s} className="chk-label"><input type="checkbox" name="targetSections" value={s} defaultChecked /> {s}</label>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div className="input-group-v2" style={{ marginTop: '1.5rem' }}>
                      <label>Transmission Content</label>
                      <textarea name="message" placeholder="Type your announcement here..." required rows="5" />
                    </div>

                    <div className="modal-actions-v2">
                      <button type="button" className="admin-btn admin-btn-outline" onClick={closeModal}>ABORT</button>
                      <button type="submit" className="admin-btn admin-btn-primary"><FaBullhorn /> INITIATE BROADCAST</button>
                    </div>
                  </form>
                )}

                {/* 7. BULK UPLOAD FORMS */}
                {(modalType === 'bulk-student' || modalType === 'bulk-faculty') && (
                  <div className="bulk-upload-v2">
                    <div className="bulk-info">
                      <FaFileUpload style={{ fontSize: '3rem', color: '#6366f1', marginBottom: '1rem' }} />
                      <h3>CSV INFRASTRUCTURE INGESTION</h3>
                      <p>Upload a CSV file containing the master list of operations units. Ensure headers match the synchronization schema.</p>
                      <a href="#" className="template-link"><FaDownload /> Download Integration Template</a>
                    </div>
                    <form onSubmit={modalType === 'bulk-student' ? handleBulkUploadStudents : handleBulkUploadFaculty}>
                      <div className="dropzone-v2">
                        <input type="file" name="file" accept=".csv" required />
                        <span>Drag & Drop CSV or <b>Browse</b></span>
                      </div>
                      <div className="modal-actions-v2">
                        <button type="button" className="admin-btn admin-btn-outline" onClick={closeModal}>CANCEL</button>
                        <button type="submit" className="admin-btn admin-btn-primary">START INGESTION</button>
                      </div>
                    </form>
                  </div>
                )}

                {/* 8. FEE UPDATE FORM */}
                {modalType === 'fee' && (
                  <form onSubmit={handleSaveFee} className="admin-form-v2">
                    <div className="form-grid-v2">
                      <div className="input-group-v2">
                        <label>Student ID</label>
                        <input name="studentId" defaultValue={editItem?.studentId} readOnly required />
                      </div>
                      <div className="input-group-v2">
                        <label>Total Fee (₹)</label>
                        <input type="number" name="totalFee" defaultValue={editItem?.totalFee} required />
                      </div>
                      <div className="input-group-v2">
                        <label>Paid Amount (₹)</label>
                        <input type="number" name="paidAmount" defaultValue={editItem?.paidAmount} required />
                      </div>
                      <div className="input-group-v2">
                        <label>Academic Year</label>
                        <input name="academicYear" defaultValue={editItem?.academicYear || '2023-24'} required />
                      </div>
                    </div>
                    <div className="modal-actions-v2">
                      <button type="button" className="admin-btn admin-btn-outline" onClick={closeModal}>CANCEL</button>
                      <button type="submit" className="admin-btn admin-btn-primary"><FaSave /> UPDATE LEDGER</button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <StudentProfileModal
        isOpen={modalType === 'student-view'}
        student={editItem}
        onClose={closeModal}
        viewedAchievements={viewedStudentAchievements}
        isAdmin={true}
        getFileUrl={(file) => {
          if (!file) return '#';
          if (file.startsWith('http') || file.startsWith('data:')) return file;
          return `${API_BASE}${file.startsWith('/') ? '' : '/'}${file}`;
        }}
      />

      <FacultyProfileModal
        isOpen={modalType === 'faculty-view'}
        faculty={editItem}
        onClose={closeModal}
        getFileUrl={(file) => {
          if (!file) return '#';
          if (file.startsWith('http') || file.startsWith('data:')) return file;
          return `${API_BASE}${file.startsWith('/') ? '' : '/'}${file}`;
        }}
      />

      <button className="ai-fab" onClick={toggleAiModal} title="AI Assistant">
        <FaRobot />
        <span className="fab-label">System AI</span>
      </button>

      {showAiModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAiModal(false)}>
          <div className="admin-modal-content" style={{ height: '80vh', width: '90%', maxWidth: '1200px', display: 'flex', flexDirection: 'column', padding: 0, position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button className="nexus-modal-close" onClick={toggleAiModal}>
              &times;
            </button>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>AI Assistant</h3>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <VuAiAgent onNavigate={(path) => {
                setShowAiModal(false);
                setAiInitialPrompt('');
                if (path.includes('student')) setActiveSection('students');
                if (path.includes('faculty')) setActiveSection('faculty');
                if (path.includes('exam')) setActiveSection('exams');
                if (path.includes('schedule')) setActiveSection('schedule');
              }} initialMessage={aiInitialPrompt} />
            </div>
          </div>
        </div>
      )}

      <DocViewer
        open={!!viewerDoc}
        fileUrl={viewerDoc?.fileUrl}
        fileName={viewerDoc?.fileName}
        onClose={() => setViewerDoc(null)}
      />
    </div>
  );
}
