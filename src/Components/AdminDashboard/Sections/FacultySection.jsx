import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaPlus, FaFileUpload, FaBriefcase, FaChalkboardTeacher, FaUsers, FaEye, FaEdit, FaTrash, FaShieldAlt, FaBus, FaHome, FaFilter } from 'react-icons/fa';

const FacultySection = ({ faculty = [], students = [], openModal, handleDeleteFaculty }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    const filteredFaculty = useMemo(() => {
        return faculty.filter(f => {
            const term = searchTerm.toLowerCase();
            const matchesSearch = (f.name || '').toLowerCase().includes(term) ||
                (f.facultyId || '').toLowerCase().includes(term) ||
                (f.department || '').toLowerCase().includes(term);

            if (!matchesSearch) return false;

            if (filterType === 'transport' && !f.isTransportUser) return false;
            if (filterType === 'hostel' && !f.isHosteller) return false;

            return true;
        });
    }, [faculty, searchTerm, filterType]);

    const facultyDistribution = useMemo(() => {
        const dist = {};
        faculty.forEach(f => {
            const asmts = Array.isArray(f.assignments) ? f.assignments : [];
            const seen = new Set();
            asmts.forEach(a => {
                if (!a.year || !a.section) return;
                const key = `Y${a.year}-S${a.section}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    if (!dist[key]) dist[key] = { year: a.year, section: a.section, count: 0 };
                    dist[key].count += 1;
                }
            });
        });
        return Object.values(dist).sort((a, b) => {
            if (a.year !== b.year) return String(a.year).localeCompare(String(b.year), undefined, { numeric: true });
            return String(a.section).localeCompare(String(b.section));
        });
    }, [faculty]);

    return (
        <div className="animate-fade-in" style={{ padding: '0 0 3rem' }}>
            <header className="admin-page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="admin-page-title">
                    <h1 style={{ fontSize: '2.8rem', fontWeight: 950, letterSpacing: '-0.04em', background: 'linear-gradient(135deg, #0f172a, #334155)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                        FACULTY <span style={{ color: '#818cf8', WebkitTextFillColor: '#818cf8' }}>DIRECTORY</span>
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4f46e5', boxShadow: '0 0 10px #4f46e5' }}></div>
                        <p style={{ margin: 0, fontWeight: 800, color: '#64748b', fontSize: '0.9rem' }}>{filteredFaculty.length} ACTIVE INSTRUCTORS</p>
                    </div>
                </div>
                <div className="admin-action-bar" style={{ display: 'flex', gap: '1rem' }}>
                    <button className="admin-btn admin-btn-outline" onClick={() => openModal('bulk-faculty')} style={{ height: '48px', borderRadius: '16px', fontWeight: 900, fontSize: '0.8rem', padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaFileUpload /> BATCH DEPLOY
                    </button>
                    <button className="admin-btn admin-btn-primary" onClick={() => openModal('faculty')} style={{ height: '48px', borderRadius: '16px', fontWeight: 900, fontSize: '0.8rem', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white', border: 'none', padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <FaPlus /> INITIALIZE STAFF
                    </button>
                </div>
            </header>

            <div className="admin-filter-bar" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', background: 'white', padding: '1rem', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <FaSearch style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        placeholder="Search by name, ID or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', paddingLeft: '3.2rem', height: '48px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600 }}
                    />
                </div>
                <div style={{ position: 'relative' }}>
                    <FaFilter style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        style={{ height: '48px', paddingLeft: '3rem', paddingRight: '2rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600, appearance: 'none', cursor: 'pointer', minWidth: '160px' }}
                    >
                        <option value="all">All Personnel</option>
                        <option value="transport">Transit Users</option>
                        <option value="hostel">Hostel Staff</option>
                    </select>
                </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaBriefcase style={{ color: '#4f46e5' }} /> Deployment Matrix
                </h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {facultyDistribution.map(d => (
                        <div key={`dist-${d.year}-${d.section}`} style={{ padding: '8px 14px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 800, color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.01)' }}>
                            <span style={{ color: '#4f46e5' }}>Year {d.year}</span>
                            <span style={{ color: '#cbd5e1' }}>|</span>
                            <span style={{ color: '#64748b' }}>Sec {d.section}</span>
                            <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', marginLeft: '4px', color: '#1e293b' }}>{d.count} Staff</span>
                        </div>
                    ))}
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    borderRadius: '28px',
                    border: '1px solid #f1f5f9',
                    overflow: 'hidden',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.03)',
                    background: 'white'
                }}
            >
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>
                                <th style={{ padding: '1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 950, color: '#64748b', letterSpacing: '1px' }}>NAME / IDENTITY</th>
                                <th style={{ padding: '1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 950, color: '#64748b', letterSpacing: '1px' }}>DEPARTMENT</th>
                                <th style={{ padding: '1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 950, color: '#64748b', letterSpacing: '1px' }}>PRIVILEGES</th>
                                <th style={{ padding: '1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 950, color: '#64748b', letterSpacing: '1px' }}>SUBJECTS</th>
                                <th style={{ padding: '1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 950, color: '#64748b', letterSpacing: '1px' }}>NODES</th>
                                <th style={{ padding: '1.5rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 950, color: '#64748b', letterSpacing: '1px' }}>COMMANDS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFaculty.length > 0 ? (
                                filteredFaculty.map((f, idx) => {
                                    const assignments = Array.isArray(f.assignments) ? f.assignments : [];
                                    const teachingCount = students.filter(s =>
                                        assignments.some(a =>
                                            String(a.year) === String(s.year) &&
                                            (String(a.section) === String(s.section) || a.section === 'All')
                                        )
                                    ).length;
                                    const uniqueSubjects = [...new Set(assignments.map(a => a.subject).filter(Boolean))];

                                    return (
                                        <motion.tr
                                            key={f.facultyId}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.04 }}
                                            style={{ borderBottom: '1px solid #f1f5f9' }}
                                        >
                                            <td style={{ padding: '1.2rem 1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                                                    <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: '#f0fdf4', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 950, overflow: 'hidden' }}>
                                                        {(() => {
                                                            const pic = f.image || f.profileImage || f.profilePic || f.avatar;
                                                            if (!pic) return <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${f.name || 'Faculty'}`} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
                                                            if (pic.includes('dicebear') || pic.startsWith('http') || pic.startsWith('data:')) {
                                                                return <img src={pic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
                                                            }
                                                            return <img src={`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${pic.startsWith('/') ? '' : '/'}${pic}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
                                                        })()}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 800, color: '#1e293b' }}>{f.name}</div>
                                                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginTop: '4px' }}>
                                                            <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#10b981', background: '#dcfce7', padding: '2px 8px', borderRadius: '6px' }}>FID: {f.facultyId}</div>
                                                            {f.isTransportUser && <div title="Transport User" style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}><FaBus /></div>}
                                                            {f.isHosteller && <div title="Hosteller" style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#f59e0b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}><FaHome /></div>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.5rem', fontWeight: 700, color: '#475569' }}>{f.department || 'CENTRAL'}</td>
                                            <td style={{ padding: '1.5rem' }}>
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                    {f.role && f.role !== 'Faculty' ? (
                                                        <span style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: 6,
                                                            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                                            color: 'white',
                                                            padding: '6px 14px',
                                                            borderRadius: 100,
                                                            fontSize: '0.7rem',
                                                            fontWeight: 950,
                                                            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px'
                                                        }}>
                                                            <FaShieldAlt style={{ fontSize: '0.8rem' }} /> {f.role.replace(' Manager', '').toUpperCase()} MANAGER
                                                        </span>
                                                    ) : (
                                                        <span style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: 6,
                                                            background: '#f8fafc',
                                                            color: '#64748b',
                                                            padding: '6px 14px',
                                                            borderRadius: 100,
                                                            fontSize: '0.7rem',
                                                            fontWeight: 900,
                                                            border: '1px solid #e2e8f0',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            <FaChalkboardTeacher style={{ fontSize: '0.8rem' }} /> INSTRUCTOR
                                                        </span>
                                                    )}
                                                    {f.isAchievementManager && f.role !== 'Achievement Manager' && (
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fffbeb', color: '#f59e0b', padding: '5px 12px', borderRadius: 100, fontSize: '0.7rem', fontWeight: 900, border: '1px solid #fef3c7' }}>
                                                            ACHIEVEMENT
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.5rem' }}>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', maxWidth: '240px' }}>
                                                    {uniqueSubjects.length > 0 ? (
                                                        uniqueSubjects.map((subject, sIdx) => (
                                                            <span key={sIdx} style={{ fontSize: '0.65rem', fontWeight: 800, padding: '3px 8px', background: '#f1f5f9', color: '#475569', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                                                {subject}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontStyle: 'italic', fontWeight: 500 }}>STANDBY</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.5rem' }}>
                                                <div onClick={() => openModal('faculty-nodes', f)} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '4px 8px', borderRadius: '12px' }} title="Click to view assigned students">
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontWeight: 950, fontSize: '1.1rem', color: '#1e293b' }}>{teachingCount}</span>
                                                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Nodes</span>
                                                    </div>
                                                    <FaUsers style={{ color: teachingCount > 0 ? '#4f46e5' : '#cbd5e1', fontSize: '1rem' }} />
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                    <button onClick={() => openModal('faculty-view', f)} style={{ cursor: 'pointer', border: 'none', background: '#f8fafc', width: '36px', height: '36px', borderRadius: '10px', color: '#64748b' }} title="View Profile"><FaEye /></button>
                                                    <button onClick={() => openModal('faculty', f)} style={{ cursor: 'pointer', border: 'none', background: '#fffbeb', width: '36px', height: '36px', borderRadius: '10px', color: '#f59e0b' }} title="Edit"><FaEdit /></button>
                                                    <button onClick={() => handleDeleteFaculty(f.facultyId)} style={{ cursor: 'pointer', border: 'none', background: '#fef2f2', width: '36px', height: '36px', borderRadius: '10px', color: '#ef4444' }} title="Delete"><FaTrash /></button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6">
                                        <div style={{ padding: '8rem 2rem', textAlign: 'center' }}>
                                            <div style={{ fontSize: '4rem', color: '#cbd5e1', marginBottom: '1.5rem' }}><FaChalkboardTeacher /></div>
                                            <h3 style={{ margin: 0, color: '#1e293b', fontWeight: 950 }}>NO STAFF MATCHED</h3>
                                            <p style={{ color: '#94a3b8', fontWeight: 600, marginTop: '0.5rem' }}>The faculty directory has no records matching your current filter parameters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

export default FacultySection;
