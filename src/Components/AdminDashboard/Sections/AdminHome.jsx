import React from 'react';
import {
    FaUserGraduate, FaChalkboardTeacher, FaBook, FaLayerGroup,
    FaCreditCard, FaRobot, FaCheckCircle, FaSyncAlt, FaFileAlt, FaCalendarCheck, FaUserTie, FaShieldAlt, FaChartLine
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import SystemTelemetry from '../SystemTelemetry';
import SystemIntelligence from '../SystemIntelligence';
import SystemNodeMap from '../SystemNodeMap';
import './AdminHome.css';

/**
 * ADMIN COMMAND CENTER (OVERVIEW)
 */
const AdminHome = ({
    students = [],
    faculty = [],
    courses = [],
    materials = [],
    fees = [],
    todos = [],
    systemStats = {},
    setActiveSection,
    openAiWithPrompt,
    handleDatabaseSync
}) => {
    const [currentTime, setCurrentTime] = React.useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Priority: systemStats > calculated from props
    const revenue = systemStats.revenue !== undefined ? systemStats.revenue : fees.reduce((acc, f) => acc + (f.paidAmount || 0), 0);
    const pendingTasks = todos.filter(t => !t.completed).length;

    const studentCount = systemStats.students !== undefined ? systemStats.students : students.length;
    const facultyCount = systemStats.faculty !== undefined ? systemStats.faculty : faculty.length;
    const subjectCount = systemStats.courses !== undefined ? systemStats.courses : courses.filter(c => c.code !== 'EMPTY__OVERRIDE').length;

    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'MORNING';
        if (hour < 18) return 'AFTERNOON';
        return 'EVENING';
    };

    const containerVar = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVar = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } }
    };

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={containerVar}
            className="admin-home-viewport"
            style={{ paddingBottom: '4rem' }}
        >
            <motion.header variants={itemVar} style={{
                marginBottom: '3.5rem',
                background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                padding: '3.5rem',
                borderRadius: '40px',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '100%', background: 'linear-gradient(to left, rgba(79, 70, 229, 0.1), transparent)', pointerEvents: 'none' }}></div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}
                    >
                        <div style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 950, letterSpacing: '1px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <FaShieldAlt style={{ marginRight: '6px', color: '#8b5cf6' }} /> VU SYSTEM OPERATIONAL
                        </div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.5)' }}>ALLY V5.0.2</div>
                    </motion.div>

                    <motion.h1
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        style={{ fontSize: '3.5rem', fontWeight: 950, margin: 0, letterSpacing: '-2px', lineHeight: 1 }}
                    >
                        VU <span style={{ color: '#818cf8' }}>UNIVERSE</span>
                    </motion.h1>

                    <motion.p
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '1.5rem', opacity: 0.9, maxWidth: '700px', lineHeight: 1.6 }}
                    >
                        Good {getTimeGreeting()}, Administrator. Neural density is <span style={{ color: '#10b981', fontWeight: 900 }}>OPTIMAL</span>.
                        The infrastructure is operational with <span style={{ color: '#f59e0b', fontWeight: 900 }}>{pendingTasks} ACTIVE DIRECTIVES</span> awaiting execution.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ position: 'absolute', right: '3.5rem', bottom: '3.5rem', textAlign: 'right', opacity: 0.4 }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginBottom: '1rem', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '100px', backdropFilter: 'blur(5px)' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: (systemStats.source === 'lifeboat' ? '#ef4444' : '#10b981'), boxShadow: `0 0 10px ${systemStats.source === 'lifeboat' ? '#ef4444' : '#10b981'}` }}></div>
                        <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px' }}>DATABASE: {systemStats.source === 'lifeboat' ? 'VIRTUALIZED (DEMO)' : 'SYNC FLOW ACTIVE'}</span>
                    </div>
                    <div style={{ fontSize: '4.5rem', fontWeight: 950, letterSpacing: '-4px', lineHeight: 0.8, marginBottom: '0.5rem' }}>
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 850, letterSpacing: '2px', color: '#818cf8', textTransform: 'uppercase' }}>
                        {currentTime.toLocaleDateString([], { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                    </div>
                </motion.div>
            </motion.header>

            {/* 🛡️ Metrics Overlay */}
            <motion.div
                variants={containerVar}
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '1.5rem',
                    marginTop: '-2rem',
                    padding: '0 2rem',
                    position: 'relative',
                    zIndex: 2
                }}
            >
                {[
                    { label: 'STUDENTS', val: studentCount, icon: <FaUserGraduate />, color: '#6366f1', section: 'students' },
                    { label: 'FACULTY', val: facultyCount, icon: <FaChalkboardTeacher />, color: '#8b5cf6', section: 'faculty' },
                    { label: 'COURSES', val: subjectCount, icon: <FaBook />, color: '#f59e0b', section: 'courses' },
                    { label: 'REVENUE', val: `₹${(revenue / 1000).toFixed(1)}K`, icon: <FaCreditCard />, color: '#10b981', section: 'fees' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        variants={itemVar}
                        whileHover={{ y: -10, boxShadow: '0 30px 60px -12px rgba(0,0,0,0.1)' }}
                        onClick={() => setActiveSection(stat.section)}
                        style={{
                            background: 'white',
                            padding: '2rem',
                            borderRadius: '32px',
                            border: '1px solid #f1f5f9',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem'
                        }}
                    >
                        <div style={{ color: stat.color, fontSize: '1.5rem', background: `${stat.color}10`, width: '50px', height: '50px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {stat.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '2.2rem', fontWeight: 950, color: '#1e293b', letterSpacing: '-1px' }}>{stat.val}</div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 950, color: '#94a3b8', letterSpacing: '1px' }}>GLOBAL {stat.label}</div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* 🛡️ OPERATION COMMAND CENTER */}
            <motion.section variants={itemVar} style={{ marginTop: '4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 950, color: '#1e293b', letterSpacing: '-1px' }}>MANAGEMENT CONSOLE</h2>
                        <p style={{ margin: '8px 0 0', fontWeight: 700, color: '#64748b', fontSize: '1.1rem' }}>Sovereign control over all institutional infrastructure nodes.</p>
                    </div>
                </div>

                <div className="admin-grid-expanded" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {[
                        { id: 'students', label: 'Student Nexus', sub: 'Registry & Identity', icon: <FaUserGraduate />, color: '#6366f1' },
                        { id: 'faculty', label: 'Faculty Core', sub: 'Staff & Assignments', icon: <FaChalkboardTeacher />, color: '#8b5cf6' },
                        { id: 'courses', label: 'Academic Hub', sub: 'Curriculum & Subjects', icon: <FaBook />, color: '#f59e0b' },
                        { id: 'attendance', label: 'Attendance Flow', sub: 'Lifecycle Analytics', icon: <FaCalendarCheck />, color: '#10b981' },
                        { id: 'schedule', label: 'Timeline Engine', sub: 'Dynamic Scheduling', icon: <FaSyncAlt />, color: '#ec4899' },
                        { id: 'finance', label: 'Finance Matrix', sub: 'Ledgers & Fees', icon: <FaCreditCard />, color: '#06b6d4' },
                        { id: 'exams', label: 'Exams Portal', sub: 'Assessments & Results', icon: <FaShieldAlt />, color: '#f43f5e' },
                        { id: 'marks', label: 'Marks Terminal', sub: 'Grading & Details', icon: <FaFileAlt />, color: '#f43f5e' },
                        { id: 'admissions', label: 'Admissions Desk', sub: 'Onboarding Systems', icon: <FaUserTie />, color: '#14b8a6' },
                        { id: 'events', label: 'Events Stream', sub: 'Operations & Logistics', icon: <FaLayerGroup />, color: '#f97316' },
                        { id: 'materials', label: 'Asset Library', sub: 'Resource Management', icon: <FaFileAlt />, color: '#84cc16' },
                        { id: 'achievements', label: 'Excellence Hub', sub: 'Certification & Talent', icon: <FaCheckCircle />, color: '#a855f7' },
                        { id: 'hostel', label: 'Hostel Manager', sub: 'Accommodation & Rooms', icon: <FaLayerGroup />, color: '#8b5cf6' },
                        { id: 'library', label: 'Library Node', sub: 'Books & Resources', icon: <FaBook />, color: '#06b6d4' },
                        { id: 'transport', label: 'Fleet Control', sub: 'Buses & Routes', icon: <FaSyncAlt />, color: '#f59e0b' },
                        { id: 'placement', label: 'Placement Cell', sub: 'Recruitment & Jobs', icon: <FaUserTie />, color: '#10b981' },
                        { id: 'research', label: 'Research Lab', sub: 'Publications & Grants', icon: <FaRobot />, color: '#3b82f6' },
                        { id: 'todos', label: 'Task Director', sub: 'Directives & Todos', icon: <FaCheckCircle />, color: '#6366f1' },
                        { id: 'analytics', label: 'Analytics Engine', sub: 'System Intelligence', icon: <FaChartLine />, color: '#8b5cf6' },
                        { id: 'ai-agent', label: 'Neural Core', sub: 'Autonomous AI Insights', icon: <FaRobot />, color: '#6366f1' }
                    ].map(hub => (
                        <motion.div
                            key={hub.id}
                            variants={itemVar}
                            whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.08)', borderColor: hub.color }}
                            onClick={() => setActiveSection(hub.id)}
                            style={{
                                background: 'white',
                                padding: '2rem',
                                borderRadius: '32px',
                                border: '1px solid #f1f5f9',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1.5rem'
                            }}
                        >
                            <div style={{
                                color: hub.color,
                                fontSize: '1.8rem',
                                padding: '1.2rem',
                                background: `${hub.color}15`,
                                borderRadius: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {hub.icon}
                            </div>
                            <div>
                                <div style={{ fontWeight: 950, color: '#1e293b', fontSize: '1.1rem', letterSpacing: '-0.5px' }}>{hub.label}</div>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 800, marginTop: '2px' }}>{hub.sub}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* 🧠 INTELLIGENCE LAYER */}
            <motion.section variants={itemVar} style={{ marginTop: '5rem' }}>
                <div style={{ marginBottom: '2.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 950, color: '#1e293b' }}>SYSTEM INTELLIGENCE</h3>
                    <p style={{ margin: '4px 0 0', fontWeight: 700, color: '#64748b' }}>Automated analytical reports and neural insights.</p>
                </div>
                <SystemIntelligence />
                <SystemNodeMap
                    studentsCount={studentCount}
                    facultyCount={facultyCount}
                    materialsCount={systemStats.materials || materials.length}
                />
            </motion.section>
        </motion.div>
    );
};

export default AdminHome;
