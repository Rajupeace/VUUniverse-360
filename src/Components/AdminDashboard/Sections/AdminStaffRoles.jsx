import React, { useMemo } from 'react';
import { FaShieldAlt, FaBriefcase, FaClock, FaCalendarAlt, FaChalkboardTeacher, FaEdit, FaUserTie, FaUniversity, FaCalendarCheck, FaMoneyBillWave, FaBed, FaBook, FaMicroscope, FaBus, FaUserShield, FaThLarge } from 'react-icons/fa';
import { motion } from 'framer-motion';

/**
 * AdminStaffRoles
 * Section for managing and overviewing specialized staff roles.
 */
const AdminStaffRoles = ({ faculty = [], openModal }) => {
    const [facSearch, setFacSearch] = React.useState('');

    const ALL_MANAGERS = [
        'Placement Manager', 'Attendance Manager', 'Schedule Manager', 'Achievement Manager',
        'Admissions Manager', 'Events Manager', 'Finance Manager', 'Hostel Manager',
        'Library Manager', 'Research Manager', 'Transport Manager', 'System Administrator'
    ];

    const getNormalizedRole = (roleStr) => {
        if (!roleStr) return 'Faculty';
        const lower = roleStr.toLowerCase().replace('_', ' ');
        // Check if the lowercase version matches any of our predefined managers
        const match = ALL_MANAGERS.find(m => m.toLowerCase().replace('_', ' ') === lower);
        return match || 'Faculty';
    };

    const roleStats = useMemo(() => {
        const stats = { 'Faculty': 0 };
        ALL_MANAGERS.forEach(m => stats[m] = 0);

        faculty.forEach(f => {
            const r = getNormalizedRole(f.role);
            const isActiveAchieve = f.isAchievementManager || r === 'Achievement Manager';
            let matched = false;

            if (isActiveAchieve) { stats['Achievement Manager']++; matched = true; }
            if (ALL_MANAGERS.includes(r) && r !== 'Achievement Manager') {
                stats[r]++;
                matched = true;
            }

            if (!matched) stats['Faculty']++;
        });
        return stats;
    }, [faculty]);

    const managers = useMemo(() => {
        return faculty.filter(f => {
            const r = getNormalizedRole(f.role);
            return ALL_MANAGERS.includes(r) || f.isAchievementManager;
        });
    }, [faculty]);

    // Animation variants
    const containerVar = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
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
            className="nexus-hub-viewport"
            style={{ padding: '0 2rem' }}
        >
            <motion.div variants={itemVar} className="f-node-head" style={{ marginBottom: '2.5rem', background: 'transparent' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '12px', background: 'var(--admin-primary)', borderRadius: '16px', color: 'white', display: 'flex' }}>
                        <FaUserTie size={24} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '2.4rem', fontWeight: 950, color: 'var(--admin-secondary)', letterSpacing: '-1px', margin: 0, lineHeight: 1 }}>STAFF ROLES</h2>
                        <div className="admin-badge primary" style={{ marginTop: '0.5rem' }}>ROLE ASSIGNMENT & HIERARCHY</div>
                    </div>
                </div>
            </motion.div>

            <motion.div variants={itemVar} className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {[
                    { label: 'Placements', count: roleStats['Placement Manager'], icon: <FaBriefcase />, color: '#9333ea', bg: '#f3e8ff' },
                    { label: 'Attendance', count: roleStats['Attendance Manager'], icon: <FaClock />, color: '#0ea5e9', bg: '#e0f2fe' },
                    { label: 'Schedules', count: roleStats['Schedule Manager'], icon: <FaCalendarAlt />, color: '#d97706', bg: '#fef3c7' },
                    { label: 'Achievements', count: roleStats['Achievement Manager'], icon: <FaShieldAlt />, color: '#4f46e5', bg: '#e0e7ff' },
                    { label: 'Sys Admin', count: roleStats['System Administrator'], icon: <FaUserShield />, color: '#e11d48', bg: '#ffe4e6' },
                    { label: 'Admissions', count: roleStats['Admissions Manager'], icon: <FaUniversity />, color: '#059669', bg: '#d1fae5' },
                    { label: 'Events', count: roleStats['Events Manager'], icon: <FaCalendarCheck />, color: '#db2777', bg: '#fce7f3' },
                    { label: 'Finance', count: roleStats['Finance Manager'], icon: <FaMoneyBillWave />, color: '#65a30d', bg: '#ecfccb' },
                    { label: 'Hostel', count: roleStats['Hostel Manager'], icon: <FaBed />, color: '#0284c7', bg: '#e0f2fe' },
                    { label: 'Library', count: roleStats['Library Manager'], icon: <FaBook />, color: '#475569', bg: '#f1f5f9' },
                    { label: 'Research', count: roleStats['Research Manager'], icon: <FaMicroscope />, color: '#7c3aed', bg: '#ede9fe' },
                    { label: 'Transport', count: roleStats['Transport Manager'], icon: <FaBus />, color: '#ea580c', bg: '#ffedd5' },
                    { label: 'Teaching Staff', count: roleStats['Faculty'], icon: <FaChalkboardTeacher />, color: '#15803d', bg: '#f0fdf4' },
                ].map((stat, i) => (
                    <motion.div
                        whileHover={{ y: -5, scale: 1.02 }}
                        key={i}
                        className="admin-summary-card"
                        style={{
                            padding: '2rem 1.5rem',
                            textAlign: 'center',
                            border: '1px solid var(--admin-border)',
                            background: 'white',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            top: -10,
                            right: -10,
                            width: '60px',
                            height: '60px',
                            background: stat.bg,
                            borderRadius: '50%',
                            zIndex: 0,
                            opacity: 0.5
                        }} />
                        <div style={{ fontSize: '2.5rem', color: stat.color, marginBottom: '1rem', position: 'relative', zIndex: 1 }}>{stat.icon}</div>
                        <div className="value" style={{ fontSize: '2.4rem', fontWeight: 950, position: 'relative', zIndex: 1 }}>{stat.count}</div>
                        <div className="label" style={{ fontWeight: 800, color: 'var(--admin-text-muted)', fontSize: '0.8rem', letterSpacing: '1px', position: 'relative', zIndex: 1 }}>{stat.label.toUpperCase()}</div>
                    </motion.div>
                ))}
            </motion.div>

            <motion.div variants={itemVar} className="f-node-card" style={{ border: '1px solid var(--admin-border)', borderRadius: '24px', overflow: 'hidden' }}>
                <div className="f-node-head" style={{ borderBottom: '1px solid var(--admin-border)', padding: '1.5rem 2rem', background: '#f8fafc' }}>
                    <h3 className="f-node-title" style={{ fontSize: '1.1rem', fontWeight: 950, letterSpacing: '0.5px' }}>MANAGEMENT STAFF REGISTRY</h3>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--admin-text-muted)', fontWeight: 700 }}>Overview of faculty with specialized system privileges</p>
                </div>
                <div className="f-node-body" style={{ padding: '0' }}>
                    {managers.length > 0 ? (
                        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--admin-border)' }}>
                                    <th style={{ padding: '1.25rem 2rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 950, color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>Staff Name</th>
                                    <th style={{ padding: '1.25rem 2rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 950, color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>Faculty ID</th>
                                    <th style={{ padding: '1.25rem 2rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 950, color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>Current Role</th>
                                    <th style={{ padding: '1.25rem 2rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 950, color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '1.25rem 2rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 950, color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {managers.map((m, idx) => (
                                    <motion.tr
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={m._id}
                                        style={{ borderBottom: '1px solid var(--admin-border)', transition: 'background 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '1.25rem 2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    background: 'var(--admin-primary-light)',
                                                    borderRadius: '12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 950,
                                                    fontSize: '1.2rem',
                                                    overflow: 'hidden',
                                                    color: 'var(--admin-primary)'
                                                }}>
                                                    {(() => {
                                                        const pic = m.image || m.profileImage || m.profilePic || m.avatar;
                                                        if (pic) {
                                                            return (
                                                                <img
                                                                    src={(pic.includes('dicebear') || pic.startsWith('data:') || pic.startsWith('http'))
                                                                        ? pic
                                                                        : `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${pic.startsWith('/') ? '' : '/'}${pic}`}
                                                                    alt={m.name}
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                        e.target.nextSibling.style.display = 'block';
                                                                    }}
                                                                />
                                                            );
                                                        }
                                                        return null;
                                                    })()}
                                                    <div style={{ display: (m.image || m.profileImage || m.profilePic || m.avatar) ? 'none' : 'block' }}>
                                                        {m.name?.charAt(0)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 950, color: 'var(--admin-secondary)', fontSize: '1rem' }}>{m.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', fontWeight: 700 }}>{m.department}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem 2rem' }}><code style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700 }}>{m.facultyId}</code></td>
                                        <td style={{ padding: '1.25rem 2rem' }}>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                padding: '6px 16px',
                                                borderRadius: 100,
                                                fontSize: '0.75rem',
                                                fontWeight: 900,
                                                letterSpacing: '0.5px',
                                                background: (() => {
                                                    const r = m.role || '';
                                                    if (r.includes('Placement')) return '#f3e8ff';
                                                    if (r.includes('Attendance')) return '#e0f2fe';
                                                    if (r.includes('Schedule')) return '#fef3c7';
                                                    if (r.includes('Achievement') || m.isAchievementManager) return '#e0e7ff';
                                                    if (r.includes('Admissions')) return '#d1fae5';
                                                    if (r.includes('Events')) return '#fce7f3';
                                                    if (r.includes('Finance')) return '#ecfccb';
                                                    if (r.includes('Hostel')) return '#e0f2fe';
                                                    if (r.includes('Library')) return '#f1f5f9';
                                                    if (r.includes('Research')) return '#ede9fe';
                                                    if (r.includes('Transport')) return '#ffedd5';
                                                    if (r.includes('Administrator')) return '#ffe4e6';
                                                    return '#f1f5f9';
                                                })(),
                                                color: (() => {
                                                    const r = m.role || '';
                                                    if (r.includes('Placement')) return '#9333ea';
                                                    if (r.includes('Attendance')) return '#0ea5e9';
                                                    if (r.includes('Schedule')) return '#d97706';
                                                    if (r.includes('Achievement') || m.isAchievementManager) return '#4f46e5';
                                                    if (r.includes('Admissions')) return '#059669';
                                                    if (r.includes('Events')) return '#db2777';
                                                    if (r.includes('Finance')) return '#65a30d';
                                                    if (r.includes('Hostel')) return '#0284c7';
                                                    if (r.includes('Library')) return '#475569';
                                                    if (r.includes('Research')) return '#7c3aed';
                                                    if (r.includes('Transport')) return '#ea580c';
                                                    if (r.includes('Administrator')) return '#e11d48';
                                                    return '#64748b';
                                                })()
                                            }}>
                                                {(m.role === 'Achievement Manager' || m.isAchievementManager) ? 'ACHIEVEMENT MANAGER' : (m.role || 'STAFF').toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.25rem 2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                                                <span style={{ fontSize: '0.75rem', fontWeight: 950, color: '#10b981' }}>PROTECTED</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button
                                                    className="icon-btn-v2"
                                                    onClick={() => {
                                                        const r = m.role || '';
                                                        let section = 'overview';
                                                        if (r.includes('Placement')) section = 'placement';
                                                        else if (r.includes('Attendance')) section = 'attendance';
                                                        else if (r.includes('Schedule')) section = 'schedule';
                                                        else if (r.includes('Achievement') || m.isAchievementManager) section = 'achievements';
                                                        else if (r.includes('Admissions')) section = 'admissions';
                                                        else if (r.includes('Events')) section = 'events';
                                                        else if (r.includes('Finance')) section = 'finance';
                                                        else if (r.includes('Hostel')) section = 'hostel';
                                                        else if (r.includes('Library')) section = 'library';
                                                        else if (r.includes('Research')) section = 'research';
                                                        else if (r.includes('Transport')) section = 'transport';
                                                        window.dispatchEvent(new CustomEvent('admin-navigate', { detail: section }));
                                                    }}
                                                    title="View Dashboard"
                                                    style={{
                                                        background: 'var(--admin-primary-light)',
                                                        border: 'none',
                                                        padding: '10px',
                                                        borderRadius: '12px',
                                                        color: 'var(--admin-primary)',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <FaThLarge size={16} />
                                                </button>
                                                <button
                                                    className="icon-btn-v2"
                                                    onClick={() => openModal('faculty', m)}
                                                    title="Change Role"
                                                    style={{
                                                        background: '#f1f5f9',
                                                        border: 'none',
                                                        padding: '10px',
                                                        borderRadius: '12px',
                                                        color: 'var(--admin-secondary)',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <FaEdit size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="admin-empty-state" style={{ padding: '5rem 3rem', textAlign: 'center' }}>
                            <div style={{
                                background: '#f8fafc',
                                width: '100px',
                                height: '100px',
                                borderRadius: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 2rem',
                                color: '#cbd5e1'
                            }}>
                                <FaShieldAlt size={48} />
                            </div>
                            <h4 style={{ fontWeight: 950, color: 'var(--admin-secondary)', margin: '0 0 0.5rem' }}>NO SPECIALIZED ROLES</h4>
                            <p style={{ fontWeight: 700, color: 'var(--admin-text-muted)', fontSize: '0.9rem', maxWidth: '300px', margin: '0 auto' }}>Promote faculty members to management roles to see them here.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AdminStaffRoles;
