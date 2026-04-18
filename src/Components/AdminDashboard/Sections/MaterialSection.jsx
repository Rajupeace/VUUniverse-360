import React from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaEye, FaDownload, FaDatabase, FaBoxOpen, FaSearch } from 'react-icons/fa';

/**
/**
 * Material Repository
 * Repository for academic files and notes.
 */
const MaterialSection = ({ materials, openModal, handleDeleteMaterial, getFileUrl, allSubjects = [] }) => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [subjectFilter, setSubjectFilter] = React.useState('All');
    const [sortKey, setSortKey] = React.useState('date');

    const filteredMaterials = React.useMemo(() => {
        let filtered = materials.filter(m => {
            const matchesSearch = (m.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (m.topic || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSubject = subjectFilter === 'All' || m.subject === subjectFilter;
            return matchesSearch && matchesSubject;
        });

        if (sortKey === 'title') {
            return filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        }
        return filtered.sort((a, b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0));
    }, [materials, searchTerm, subjectFilter, sortKey]);

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
            <header className="admin-page-header" style={{ marginBottom: '2rem', borderBottom: 'none' }}>
                <div className="admin-page-title">
                    <h1 style={{ fontSize: '2.8rem', fontWeight: 950, letterSpacing: '-0.04em', background: 'linear-gradient(135deg, #0f172a, #334155)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        CONTENT <span style={{ color: '#f59e0b', WebkitTextFillColor: '#f59e0b' }}>VAULT</span>
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 10px #f59e0b' }}></div>
                        <p style={{ margin: 0, fontWeight: 800, color: '#64748b', fontSize: '0.9rem' }}>{filteredMaterials.length} INDEXED ASSETS</p>
                    </div>
                </div>
                <div className="admin-action-bar" style={{ display: 'flex', gap: '1rem' }}>
                    <button className="admin-btn admin-btn-primary" onClick={() => openModal('material')} style={{ height: '48px', borderRadius: '16px', fontWeight: 900, fontSize: '0.8rem', background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                        <FaPlus /> UPLOAD RESOURCE
                    </button>
                </div>
            </header>

            <div className="admin-filter-bar" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', background: 'white', padding: '1rem', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <FaSearch style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        className="admin-form-input"
                        placeholder="Search assets by title or topic..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', paddingLeft: '3.2rem', height: '48px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc' }}
                    />
                </div>
                <select
                    className="admin-select"
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                    style={{ height: '48px', padding: '0 1.5rem', borderRadius: '14px', border: '1px solid #e2e8f0', fontWeight: 700, outline: 'none', color: '#1e293b', width: '220px' }}
                >
                    <option value="All">All Categories</option>
                    {allSubjects.map(s => <option key={s.id || s._id || s.code} value={s.name}>{s.name}</option>)}
                </select>
                <select
                    className="admin-select"
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value)}
                    style={{ height: '48px', padding: '0 1.5rem', borderRadius: '14px', border: '1px solid #e2e8f0', fontWeight: 700, outline: 'none', color: '#1e293b', width: '180px' }}
                >
                    <option value="date">Latest First</option>
                    <option value="title">Alphabetical</option>
                </select>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="admin-card"
                style={{
                    borderRadius: '28px',
                    border: '1px solid #f1f5f9',
                    overflow: 'hidden',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.03)'
                }}
            >
                <div className="admin-table-wrap">
                    <table className="admin-grid-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>
                                <th style={{ padding: '1.5rem', fontSize: '0.75rem', fontWeight: 950, color: '#64748b', letterSpacing: '1px' }}>ASSET IDENTITY</th>
                                <th style={{ padding: '1.5rem', fontSize: '0.75rem', fontWeight: 950, color: '#64748b', letterSpacing: '1px' }}>CLASSIFICATION</th>
                                <th style={{ padding: '1.5rem', fontSize: '0.75rem', fontWeight: 950, color: '#64748b', letterSpacing: '1px' }}>TARGET COHORT</th>
                                <th style={{ padding: '1.5rem', fontSize: '0.75rem', fontWeight: 950, color: '#64748b', letterSpacing: '1px' }}>SUBJECT MODULE</th>
                                <th style={{ padding: '1.5rem', fontSize: '0.75rem', fontWeight: 950, color: '#64748b', letterSpacing: '1px', textAlign: 'right' }}>COMMANDS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMaterials.map((m, idx) => (
                                <motion.tr
                                    key={m.id || m._id || idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    style={{ borderBottom: '1px solid #f1f5f9' }}
                                >
                                    <td style={{ padding: '1.2rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                                            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: m.type === 'videos' ? '#fff7ed' : '#f0f9ff', color: m.type === 'videos' ? '#f59e0b' : '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                                {m.type === 'videos' ? <FaEye /> : <FaDatabase />}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 800, color: '#1e293b' }}>{m.title}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>ORIGIN: {m.uploadedBy?.name || m.uploadedBy || 'SYSTEM'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.5rem' }}>
                                        <span style={{
                                            fontSize: '0.7rem',
                                            fontWeight: 950,
                                            color: '#6366f1',
                                            background: '#eef2ff',
                                            padding: '4px 12px',
                                            borderRadius: '100px',
                                            border: '1px solid #e0e7ff'
                                        }}>
                                            {m.subject?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.5rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 950, color: '#0ea5e9', background: '#f0f9ff', padding: '3px 8px', borderRadius: '6px' }}>LVL 0{m.year}</span>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 950, color: '#10b981', background: '#f0fdf4', padding: '3px 8px', borderRadius: '6px' }}>SEC {m.section}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.5rem' }}>
                                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#334155' }}>{m.topic || 'General'}</div>
                                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, marginTop: '4px' }}>M{m.module} • U{m.unit}</div>
                                    </td>
                                    <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button onClick={() => openModal('material-view', m)} style={{ cursor: 'pointer', border: 'none', background: '#f8fafc', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }} title="Inspect"><FaEye /></button>
                                            <button onClick={() => openModal('material', m)} style={{ cursor: 'pointer', border: 'none', background: '#fffbeb', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }} title="Modify"><FaEdit /></button>
                                            <button onClick={() => handleDeleteMaterial(m._id || m.id)} style={{ cursor: 'pointer', border: 'none', background: '#fef2f2', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }} title="Purge"><FaTrash /></button>
                                            {m.url && m.url !== '#' && (
                                                <a
                                                    href={getFileUrl(m.url)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white', textDecoration: 'none' }}
                                                    title="Download"
                                                >
                                                    <FaDownload />
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                            {filteredMaterials.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '8rem 2rem' }}>
                                        <div style={{ fontSize: '4rem', color: '#cbd5e1', marginBottom: '1.5rem' }}><FaBoxOpen /></div>
                                        <h3 style={{ margin: 0, color: '#1e293b', fontWeight: 950 }}>VAULT IS EMPTY</h3>
                                        <p style={{ color: '#94a3b8', fontWeight: 600, marginTop: '0.5rem' }}>No academic resources found matching your current parameters.</p>
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

export default MaterialSection;
