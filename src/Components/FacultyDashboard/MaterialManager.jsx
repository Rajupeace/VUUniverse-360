import React, { useState, useEffect } from 'react';
import { FaCloudUploadAlt, FaTrash, FaLayerGroup, FaLink, FaBullhorn, FaClipboardList, FaEdit, FaEye } from 'react-icons/fa';
import { apiUpload, apiPost, apiGet, apiDelete } from '../../utils/apiClient';
import './MaterialManager.css';

/**
 * ACADEMIC RESOURCE HUB
 * Central interface for orchestrating course materials and real-time student notifications.
 */
const MaterialManager = ({ selectedSubject, selectedSections, onUploadSuccess, preload, onPreloadHandled }) => {
    // Proactive hardening
    selectedSubject = selectedSubject || 'General - Year 1';
    selectedSections = selectedSections || [];
    const [uploadType, setUploadType] = useState('notes');
    const [materials, setMaterials] = useState({
        notes: null, videos: null, modelPapers: null, syllabus: null, assignments: null, interviewQnA: null
    });
    const [formData, setFormData] = useState({ module: '1', unit: '1', topic: '', title: '', semester: preload?.semester || '1' });

    // Handle Preload from other sections (like Curriculum Architect)
    useEffect(() => {
        if (preload) {
            setFormData(prev => ({
                ...prev,
                unit: preload.unit || prev.unit,
                topic: preload.topic || '',
                title: preload.topic || ''
            }));
            // Clear the preload so it doesn't re-apply if user switches tabs
            if (onPreloadHandled) onPreloadHandled();
        }
    }, [preload, onPreloadHandled]);

    const [assignmentDetails] = useState({ dueDate: '', message: '' });
    const [activeTab, setActiveTab] = useState('upload');
    const [globalResources, setGlobalResources] = useState([]);
    const [broadcastMsg, setBroadcastMsg] = useState('');
    const [broadcastType] = useState('announcement');
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        if (selectedSubject && selectedSections.length > 0) {
            fetchGlobalResources();
        }
    }, [selectedSubject, selectedSections]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchGlobalResources = async () => {
        if (!selectedSubject) return;
        const parts = selectedSubject.split(' - Year ');
        const subject = parts[parts.length - 2] || 'General';
        const year = parts[parts.length - 1] || '1';

        try {
            const data = await apiGet(`/api/materials?year=${year}&subject=${encodeURIComponent(subject)}`);
            if (data) setGlobalResources(data.filter(m => String(m.year) === String(year)));
        } catch (err) { console.error("Error fetching materials registry:", err); }
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files.length > 0) setMaterials(prev => ({ ...prev, [name]: files[0] }));
    };

    const getContext = () => {
        const parts = selectedSubject.split(' - Year ');
        const year = parts[parts.length - 1] || '1';
        const subject = parts.slice(0, parts.length - 1).join(' - Year ') || 'General';
        return { subject, year };
    };

    const handleUpload = async () => {
        if (selectedSections.length === 0) return alert('Selection Error: Please select at least one target section.');
        const { subject, year } = getContext();
        const file = materials[uploadType];
        if (!editId && !file) return alert('File Error: Please select a material file to publish.');

        try {
            const apiFormData = new FormData();
            if (file) apiFormData.append('file', file);
            apiFormData.append('year', year);
            apiFormData.append('semester', formData.semester || '1');
            apiFormData.append('section', selectedSections.join(','));
            apiFormData.append('subject', subject);
            apiFormData.append('type', uploadType);
            apiFormData.append('title', file ? file.name : formData.title);
            apiFormData.append('module', formData.module);
            apiFormData.append('unit', formData.unit);
            if (formData.topic) apiFormData.append('topic', formData.topic);
            if (formData.duration) apiFormData.append('duration', formData.duration);
            if (formData.videoAnalysis) apiFormData.append('videoAnalysis', formData.videoAnalysis);
            if (formData.examYear) apiFormData.append('examYear', formData.examYear);

            if (uploadType === 'assignments') {
                apiFormData.append('dueDate', assignmentDetails.dueDate);
                apiFormData.append('message', assignmentDetails.message);
            }

            if (editId) await apiUpload(`/api/materials/${editId}`, apiFormData, 'PUT');
            else await apiUpload('/api/materials', apiFormData);

            alert('Asset Successfully Published to Class Feed.');
            setMaterials(prev => ({ ...prev, [uploadType]: null }));
            setFormData({ module: '1', unit: '1', topic: '', title: '', semester: '1' });
            setEditId(null);
            if (onUploadSuccess) onUploadSuccess();
            fetchGlobalResources();
        } catch (error) { alert(`Publishing Failed: ${error.message}`); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Perform permanent deletion of this resource?")) return;
        try {
            await apiDelete(`/api/materials/${id}`);
            fetchGlobalResources();
        } catch (e) { alert("Delete Failed: " + e.message); }
    };

    const handleEdit = (res) => {
        setUploadType(res.type);
        setFormData({
            module: res.module || '1',
            unit: res.unit || '1',
            topic: res.topic || '',
            title: res.title || '',
            semester: res.semester || '1',
            duration: res.duration || '',
            videoAnalysis: res.videoAnalysis || ''
        });
        setEditId(res._id || res.id);
        setActiveTab('upload');
    };

    const handleLinkAdd = async () => {
        const title = document.getElementById('link-title').value;
        const url = document.getElementById('link-url').value;
        const type = document.getElementById('link-type').value;
        if (!title || !url) return alert('Error: Title and Access URL are required.');
        const { subject, year } = getContext();
        try {
            const analysis = document.getElementById('link-analysis')?.value;
            const linkSemester = document.getElementById('link-semester')?.value || '1';
            const linkForm = new FormData();
            linkForm.append('title', title);
            linkForm.append('year', year);
            linkForm.append('semester', linkSemester);
            linkForm.append('section', selectedSections.join(','));
            linkForm.append('subject', subject);
            linkForm.append('type', type);
            linkForm.append('link', url);
            if (analysis) linkForm.append('videoAnalysis', analysis);
            await apiUpload('/api/materials', linkForm);
            alert('Digital Asset Linked Successfully.');
            if (onUploadSuccess) onUploadSuccess();
            fetchGlobalResources();
        } catch (error) { alert('Error: Failed to link digital asset.'); }
    };

    return (
        <div className="deployment-hub">
            <header className="f-view-header">
                <div>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <FaLayerGroup style={{ color: 'var(--mat-primary)' }} />
                        RESOURCE <span>HUB</span>
                    </h2>
                    <p className="nexus-subtitle">Orchestrate and publish academic assets for: <strong>{selectedSubject}</strong></p>
                </div>
                <div className="nexus-glass-pills">
                    <button className={`nexus-pill ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => setActiveTab('upload')}>
                        <FaCloudUploadAlt /> FILES
                    </button>
                    <button className={`nexus-pill ${activeTab === 'links' ? 'active' : ''}`} onClick={() => setActiveTab('links')}>
                        <FaLink /> LINKS
                    </button>
                    <button className={`nexus-pill ${activeTab === 'broadcast' ? 'active' : ''}`} onClick={() => setActiveTab('broadcast')}>
                        <FaBullhorn /> ALERTS
                    </button>
                    <button className={`nexus-pill ${activeTab === 'resources' ? 'active' : ''}`} onClick={() => setActiveTab('resources')}>
                        <FaClipboardList /> INVENTORY
                    </button>
                </div>
            </header>

            <div className="f-node-card hub-main">
                {activeTab === 'upload' && (
                    <div className="animate-fade-in">
                        <div className="f-type-selector-grid">
                            {['notes', 'videos', 'assignments', 'modelPapers', 'interviewQnA'].map(t => (
                                <button
                                    key={t}
                                    className={`type-pill ${uploadType === t ? 'active' : ''}`}
                                    onClick={() => setUploadType(t)}
                                >
                                    {t === 'notes' && <FaClipboardList />}
                                    {t === 'videos' && <FaCloudUploadAlt />}
                                    {t === 'assignments' && <FaEdit />}
                                    {t === 'modelPapers' && <FaLayerGroup />}
                                    {t === 'interviewQnA' && <FaBullhorn />}
                                    <span>{t === 'interviewQnA' ? 'Q&A' : t.replace(/([A-Z])/g, ' $1').toUpperCase()}</span>
                                </button>
                            ))}
                        </div>

                        <div className="nexus-dropzone" onClick={() => document.getElementById(uploadType).click()}>
                            <input type="file" id={uploadType} name={uploadType} style={{ display: 'none' }} onChange={handleFileChange} />
                            <FaCloudUploadAlt />
                            <h3 style={{ textTransform: 'uppercase' }}>{materials[uploadType] ? materials[uploadType].name : 'SELECT RESOURCE TO PUBLISH'}</h3>
                            <p>Target Subject: {selectedSubject}</p>
                        </div>

                        <div className="nexus-form-grid">
                            <div className="nexus-group">
                                <label className="f-form-label">RESOURCE TITLE / TOPIC</label>
                                <input placeholder="e.g. Advanced Calculus Unit 1" value={formData.topic} onChange={e => setFormData({ ...formData, topic: e.target.value })} className="f-form-select" />
                            </div>
                            <div className="nexus-group">
                                <label className="f-form-label">MODULE</label>
                                <select className="f-form-select" value={formData.module} onChange={e => setFormData({ ...formData, module: e.target.value })}>
                                    {[1, 2, 3, 4, 5].map(m => <option key={m} value={m}>Module {m}</option>)}
                                </select>
                            </div>
                            <div className="nexus-group">
                                <label className="f-form-label">UNIT</label>
                                <select className="f-form-select" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })}>
                                    {[1, 2, 3, 4, 5].map(u => <option key={u} value={u}>Unit {u}</option>)}
                                </select>
                            </div>
                            <div className="nexus-group">
                                <label className="f-form-label">SEMESTER</label>
                                <select className="f-form-select" value={formData.semester} onChange={e => setFormData({ ...formData, semester: e.target.value })}>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                </select>
                            </div>
                            {uploadType === 'videos' && (
                                <>
                                    <div className="nexus-group">
                                        <label className="f-form-label">DURATION (MM:SS)</label>
                                        <input placeholder="e.g. 12:45" value={formData.duration || ''} onChange={e => setFormData({ ...formData, duration: e.target.value })} className="f-form-select" />
                                    </div>
                                    <div className="nexus-group" style={{ gridColumn: 'span 2' }}>
                                        <label className="f-form-label">AI ASSISTANT CONTEXT (FOR VUAI)</label>
                                        <textarea
                                            placeholder="Provide key takeaways or timestamps for the AI to answer student questions better..."
                                            value={formData.videoAnalysis || ''}
                                            onChange={e => setFormData({ ...formData, videoAnalysis: e.target.value })}
                                            className="f-form-textarea"
                                            style={{ height: '80px' }}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <button className="nexus-btn-primary" onClick={handleUpload}>
                            {editId ? <><FaEdit /> UPDATE ASSET</> : <><FaCloudUploadAlt /> PUBLISH TO CLASS FEED</>}
                        </button>
                    </div>
                )}

                {activeTab === 'resources' && (
                    <div className="registry-nexus">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {globalResources.length > 0 ? globalResources.map((res, i) => (
                                <div key={i} className="f-modal-list-item animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
                                        <div className="res-type-box">
                                            {res.type?.substring(0, 3).toUpperCase()}
                                        </div>
                                        <div className="res-info">
                                            <h4>{res.title || res.topic}</h4>
                                            <p>UNIT {res.unit} • MOD {res.module} • {res.type}</p>
                                        </div>
                                    </div>
                                    <div className="res-actions">
                                        <button className="res-action-btn" onClick={() => window.open(res.url, '_blank')} title="View Asset"><FaEye /></button>
                                        <button className="res-action-btn" onClick={() => handleEdit(res)} title="Edit Details"><FaEdit /></button>
                                        <button className="res-action-btn delete" onClick={() => handleDelete(res._id || res.id)} title="Remove Asset"><FaTrash /></button>
                                    </div>
                                </div>
                            )) : (
                                <div className="empty-resource-state">
                                    <FaClipboardList style={{ fontSize: '3rem', opacity: 0.1, marginBottom: '1rem' }} />
                                    <p style={{ fontWeight: 850, color: '#94a3b8' }}>NO ASSETS IN INVENTORY</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'broadcast' && (
                    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <div className="nexus-group" style={{ marginBottom: '2rem' }}>
                            <label className="f-form-label">ANNOUNCEMENT MESSAGE</label>
                            <textarea
                                className="f-form-textarea"
                                value={broadcastMsg}
                                onChange={(e) => setBroadcastMsg(e.target.value)}
                                placeholder="Type your announcement or urgent alert to the class..."
                                style={{ height: '240px' }}
                            />
                        </div>
                        <button
                            className="nexus-btn-primary"
                            style={{ width: '100%' }}
                            onClick={async () => {
                                if (!broadcastMsg) return alert('Message content required.');
                                const { subject, year } = getContext();
                                try {
                                    await apiPost('/api/faculty/messages', { message: broadcastMsg, type: broadcastType, year, sections: selectedSections, subject });
                                    alert('Announcement Broadcast to All Students.'); setBroadcastMsg('');
                                } catch (e) { alert("Broadcast failed: " + e.message); }
                            }}
                        >
                            <FaBullhorn /> DISPATCH BROADCAST
                        </button>
                    </div>
                )}

                {activeTab === 'links' && (
                    <div className="animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto' }}>
                        <div className="nexus-form-grid" style={{ gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                            <div className="nexus-group">
                                <label className="f-form-label">REFERENCE TITLE</label>
                                <input id="link-title" placeholder="e.g. Wikipedia: Quantum Mechanics" className="f-form-select" />
                            </div>
                            <div className="nexus-group">
                                <label className="f-form-label">ACCESS URL</label>
                                <input id="link-url" placeholder="https://..." className="f-form-select" />
                            </div>
                            <div className="nexus-group">
                                <label className="f-form-label">CLASSIFICATION</label>
                                <select id="link-type" className="f-form-select">
                                    <option value="notes">Digital Documentation</option>
                                    <option value="videos">External Video Stream</option>
                                </select>
                            </div>
                            <div className="nexus-group">
                                <label className="f-form-label">SEMESTER</label>
                                <select id="link-semester" className="f-form-select">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                </select>
                            </div>
                            <div className="nexus-group">
                                <label className="f-form-label">AI CONTEXT (REMARKS)</label>
                                <textarea id="link-analysis" placeholder="Synthesize the link content for the AI assistant..." className="f-form-textarea" style={{ height: '80px' }} />
                            </div>
                        </div>
                        <button className="nexus-btn-primary" onClick={handleLinkAdd} style={{ width: '100%', marginTop: '2rem' }}>
                            <FaLink /> ATTACH DIGITAL ASSET
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MaterialManager;
