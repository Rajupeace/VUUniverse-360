import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserPlus, FaFileAlt, FaCheck, FaTimes, FaClock, FaEye, FaDownload, FaTrash } from 'react-icons/fa';
import { apiGet, apiPut, apiDelete } from '../../../utils/apiClient';
import DocViewer from '../../DocViewer/DocViewer';

const AdmissionSection = () => {
    const [admissions, setAdmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoc, setSelectedDoc] = useState(null); // { url, name } for DocViewer
    const [viewingDocsApp, setViewingDocsApp] = useState(null); // The admission record whose docs are being viewed

    const fetchAdmissions = async () => {
        setLoading(true);
        try {
            const data = await apiGet('/api/admissions');
            setAdmissions(data || []);
        } catch (error) {
            console.error('Failed to fetch admissions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmissions();
    }, []);

    const handleAccept = async (id, name) => {
        if (!window.confirm(`Accept application for ${name}?`)) return;
        try {
            await apiPut(`/api/admissions/${id}`, { status: 'Accepted' });
            fetchAdmissions();
        } catch (error) {
            alert('Failed to accept: ' + error.message);
        }
    };

    const handleReject = async (id, name) => {
        const reason = window.prompt(`Reason for rejecting ${name}'s application:`);
        if (reason === null) return;
        try {
            await apiPut(`/api/admissions/${id}`, { status: 'Rejected', notes: reason });
            fetchAdmissions();
        } catch (error) {
            alert('Failed to reject: ' + error.message);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Permanently delete record for ${name}?`)) return;
        try {
            await apiDelete(`/api/admissions/${id}`);
            fetchAdmissions();
        } catch (error) {
            alert('Failed to delete: ' + error.message);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Accepted': return { bg: '#dcfce7', text: '#10b981' };
            case 'Pending': return { bg: '#fef3c7', text: '#b45309' };
            case 'Rejected': return { bg: '#fee2e2', text: '#ef4444' };
            default: return { bg: '#f1f5f9', text: '#64748b' };
        }
    };

    return (
        <div className="animate-fade-in">
            <header className="admin-page-header" style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="admin-page-title">
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--admin-secondary)' }}>ADMISSION <span style={{ color: 'var(--admin-primary)' }}>PORTAL</span></h1>
                    <p style={{ color: '#64748b', fontWeight: 700 }}>TRACK PROSPECTIVE STUDENT APPLICATIONS</p>
                </div>
                <button className="admin-btn admin-btn-outline" onClick={fetchAdmissions}>
                    <FaClock /> REFRESH
                </button>
            </header>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ fontSize: '2rem', color: 'var(--admin-primary)' }}>
                        <FaClock />
                    </motion.div>
                </div>
            ) : (
                <div className="admin-grid-2" style={{ gap: '1.5rem' }}>
                    {admissions.map((app) => (
                        <motion.div
                            key={app._id}
                            layout
                            className="admin-card"
                            style={{ padding: '1.5rem', borderRadius: '24px', position: 'relative', border: '1px solid #f1f5f9' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <div style={{ fontWeight: 900, color: 'var(--admin-primary)', fontSize: '0.8rem' }}>APP #{app.applicationNumber}</div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <div style={{
                                        padding: '4px 12px',
                                        borderRadius: '8px',
                                        fontSize: '0.65rem',
                                        fontWeight: 900,
                                        background: getStatusColor(app.status).bg,
                                        color: getStatusColor(app.status).text
                                    }}>
                                        {app.status.toUpperCase()}
                                    </div>
                                    <button onClick={() => handleDelete(app._id, app.candidateName)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }} title="Delete Record">
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>

                            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900 }}>{app.candidateName}</h3>
                            <p style={{ color: '#64748b', fontWeight: 700, fontSize: '0.9rem', marginBottom: '1.5rem' }}>Applying for {app.courseApplied} • {app.academicYear}</p>

                            <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '16px', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 800 }}>Qualification</span>
                                    <span style={{ color: '#1e293b', fontSize: '0.75rem', fontWeight: 900 }}>{app.previousQualification} ({app.percentage}%)</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 800 }}>Contact Info</span>
                                    <span style={{ color: '#1e293b', fontSize: '0.75rem', fontWeight: 900 }}>{app.phone}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 800 }}>Submitted</span>
                                    <span style={{ color: '#1e293b', fontSize: '0.75rem', fontWeight: 900 }}>{new Date(app.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {app.notes && (
                                <div style={{ marginBottom: '1.5rem', padding: '0.8rem', background: '#fffbeb', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
                                    <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 800, color: '#92400e' }}>ADMIN NOTES:</p>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#b45309' }}>{app.notes}</p>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    className="admin-btn admin-btn-outline"
                                    style={{ flex: 1, fontSize: '0.75rem' }}
                                    onClick={() => setViewingDocsApp(viewingDocsApp?._id === app._id ? null : app)}
                                >
                                    <FaFileAlt /> {viewingDocsApp?._id === app._id ? 'HIDE DOCS' : 'VIEW DOCUMENTS'} ({(app.documents || []).length})
                                </button>
                                {app.status === 'Pending' && (
                                    <>
                                        <button
                                            className="admin-btn admin-btn-primary"
                                            style={{ background: '#10b981', borderColor: '#10b981', fontSize: '0.75rem', width: '40px', padding: '0' }}
                                            onClick={() => handleAccept(app._id, app.candidateName)}
                                            title="Accept Application"
                                        >
                                            <FaCheck />
                                        </button>
                                        <button
                                            className="admin-btn admin-btn-outline"
                                            style={{ color: '#ef4444', borderColor: '#ef4444', fontSize: '0.75rem', width: '40px', padding: '0' }}
                                            onClick={() => handleReject(app._id, app.candidateName)}
                                            title="Reject Application"
                                        >
                                            <FaTimes />
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Document List Transition */}
                            <AnimatePresence>
                                {viewingDocsApp?._id === app._id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        style={{ overflow: 'hidden', marginTop: '1rem' }}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '16px' }}>
                                            {(app.documents || []).length > 0 ? (
                                                app.documents.map((doc, idx) => (
                                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>{doc.name}</span>
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button
                                                                onClick={() => setSelectedDoc({ url: doc.url, name: doc.name })}
                                                                style={{ background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer' }}
                                                            >
                                                                <FaEye size={12} />
                                                            </button>
                                                            <a
                                                                href={doc.url}
                                                                download
                                                                style={{ background: '#f1f5f9', color: '#475569', borderRadius: '6px', padding: '4px 8px', display: 'flex', alignItems: 'center' }}
                                                            >
                                                                <FaDownload size={12} />
                                                            </a>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', margin: '0' }}>No documents uploaded.</p>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                    {!loading && admissions.length === 0 && (
                        <div className="admin-card" style={{ gridColumn: '1/-1', padding: '5rem', textAlign: 'center', borderRadius: '24px', border: '2px dashed #e2e8f0', background: 'transparent' }}>
                            <div style={{ fontSize: '3.5rem', color: '#cbd5e1', marginBottom: '1rem' }}><FaUserPlus /></div>
                            <h3 style={{ color: '#64748b', fontWeight: 900, fontSize: '1.5rem' }}>NO NEW APPLICATIONS</h3>
                            <p style={{ color: '#94a3b8', fontWeight: 700 }}>Incoming admission requests will appear here for verification.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Document Viewer Modal Overlay */}
            <DocViewer
                open={!!selectedDoc}
                fileUrl={selectedDoc?.url}
                fileName={selectedDoc?.name}
                onClose={() => setSelectedDoc(null)}
            />
        </div>
    );
};

export default AdmissionSection;
