import React, { useState, useEffect, useCallback, useRef } from 'react';
import useS3Upload from '../../../hooks/useS3Upload';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// ── tiny helpers ──────────────────────────────────────────────
const fmt = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};
const timeAgo = (date) => {
    const s = Math.floor((Date.now() - new Date(date)) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    return `${Math.floor(s / 3600)}h ago`;
};

// ─────────────────────────────────────────────────────────────
export default function AWSCloudPanel() {
    const [status, setStatus] = useState(null);      // AWS status from API
    const [loading, setLoading] = useState(true);
    const [files, setFiles] = useState([]);
    const [filesLoading, setFilesLoading] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [toast, setToast] = useState(null);
    const fileRef = useRef();

    const { upload, uploading, progress, error: uploadError, url: uploadedUrl, reset } = useS3Upload();

    // ── fetch AWS status ────────────────────────────────────────
    const fetchStatus = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/aws/status`);
            const data = await res.json();
            setStatus(data);
        } catch {
            setStatus({ connected: false, configured: false, message: '❌ Backend unreachable' });
        } finally { setLoading(false); }
    }, []);

    // ── fetch file list ─────────────────────────────────────────
    const fetchFiles = useCallback(async () => {
        setFilesLoading(true);
        try {
            const res = await fetch(`${API}/api/aws/files?maxKeys=50`);
            if (res.ok) {
                const data = await res.json();
                setFiles(data.files || []);
            }
        } catch { /* ignore */ }
        finally { setFilesLoading(false); }
    }, []);

    useEffect(() => { fetchStatus(); }, [fetchStatus]);
    useEffect(() => {
        if (status?.connected) fetchFiles();
    }, [status, fetchFiles]);

    // ── show toast ──────────────────────────────────────────────
    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    // ── handle upload ────────────────────────────────────────────
    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const result = await upload(file);
        if (result) {
            showToast(`✅ Uploaded: ${file.name}`);
            fetchFiles();
        } else {
            showToast(`❌ Upload failed`, 'error');
        }
        reset();
        if (fileRef.current) fileRef.current.value = '';
    };

    // ── handle delete ────────────────────────────────────────────
    const handleDelete = async (key) => {
        if (!window.confirm(`Delete file: ${key}?`)) return;
        setDeleting(key);
        try {
            const res = await fetch(`${API}/api/aws/files/${encodeURIComponent(key)}`, { method: 'DELETE' });
            if (res.ok) { showToast('🗑️ File deleted'); fetchFiles(); }
            else showToast('❌ Delete failed', 'error');
        } catch { showToast('❌ Network error', 'error'); }
        finally { setDeleting(null); }
    };

    // ─────────────────────────────────────────────────────────────
    return (
        <div style={styles.container}>

            {/* Toast */}
            {toast && (
                <div style={{ ...styles.toast, background: toast.type === 'error' ? '#ef4444' : '#10b981' }}>
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <span style={styles.headerIcon}>☁️</span>
                    <div>
                        <h2 style={styles.title}>AWS Cloud</h2>
                        <p style={styles.subtitle}>Amazon S3 Storage &amp; Cloud Integration</p>
                    </div>
                </div>
                <button style={styles.refreshBtn} onClick={() => { fetchStatus(); fetchFiles(); }}>
                    ↻ Refresh
                </button>
            </div>

            {/* Status Card */}
            <div style={styles.statusCard}>
                {loading ? (
                    <div style={styles.loading}><span style={styles.spinner} />Checking AWS connection…</div>
                ) : (
                    <div style={styles.statusRow}>
                        {/* Dot */}
                        <div style={{ ...styles.statusDot, background: status?.connected ? '#10b981' : status?.configured ? '#f59e0b' : '#6b7280' }} />

                        <div style={styles.statusInfo}>
                            <span style={styles.statusMsg}>{status?.message || 'Unknown'}</span>
                            <div style={styles.statusMeta}>
                                <Tag label="Region" value={status?.region || 'us-east-1'} />
                                <Tag label="Bucket" value={status?.bucket || '—'} />
                                <Tag label="Config" value={status?.configured ? '✅ Set' : '⚠️ Not set'} color={status?.configured ? '#10b981' : '#f59e0b'} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Not Configured Banner */}
            {!loading && !status?.configured && (
                <div style={styles.banner}>
                    <strong>🔑 AWS credentials not configured.</strong>
                    <p style={{ margin: '6px 0 0', fontSize: 13, opacity: 0.85 }}>
                        Open <code style={styles.code}>.env</code> and set{' '}
                        <code style={styles.code}>AWS_ACCESS_KEY_ID</code> +{' '}
                        <code style={styles.code}>AWS_SECRET_ACCESS_KEY</code>, then restart the backend.
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: 12, opacity: 0.7 }}>
                        Get keys from:{' '}
                        <a href="https://console.aws.amazon.com/iam/home#/security_credentials" target="_blank" rel="noreferrer" style={{ color: '#fbbf24' }}>
                            AWS IAM → Security Credentials
                        </a>
                    </p>
                </div>
            )}

            {/* Upload Section */}
            {status?.configured && (
                <div style={styles.uploadCard}>
                    <h3 style={styles.sectionTitle}>📤 Upload File to S3</h3>
                    <div style={styles.uploadRow}>
                        <input
                            ref={fileRef}
                            type="file"
                            onChange={handleFile}
                            disabled={uploading}
                            style={styles.fileInput}
                            id="s3-file-input"
                        />
                        <label htmlFor="s3-file-input" style={{ ...styles.uploadBtn, opacity: uploading ? 0.6 : 1, cursor: uploading ? 'not-allowed' : 'pointer' }}>
                            {uploading ? `Uploading… ${progress}%` : '+ Choose File'}
                        </label>
                    </div>

                    {/* Progress bar */}
                    {uploading && (
                        <div style={styles.progressWrap}>
                            <div style={{ ...styles.progressBar, width: `${progress}%` }} />
                        </div>
                    )}
                    {uploadError && <p style={styles.errorText}>❌ {uploadError}</p>}
                    {uploadedUrl && (
                        <p style={styles.successText}>
                            ✅ Uploaded:{' '}
                            <a href={uploadedUrl} target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>
                                View File
                            </a>
                        </p>
                    )}
                </div>
            )}

            {/* Files List */}
            {status?.connected && (
                <div style={styles.filesCard}>
                    <div style={styles.filesHeader}>
                        <h3 style={styles.sectionTitle}>📁 S3 Files ({files.length})</h3>
                        {filesLoading && <span style={{ fontSize: 12, opacity: 0.6 }}>Loading…</span>}
                    </div>

                    {files.length === 0 && !filesLoading ? (
                        <p style={styles.emptyText}>No files in bucket yet. Upload one above.</p>
                    ) : (
                        <div style={styles.filesList}>
                            {files.map((f) => (
                                <div key={f.key} style={styles.fileRow}>
                                    <span style={styles.fileIcon}>{f.mimetype?.startsWith('image') ? '🖼️' : '📄'}</span>
                                    <div style={styles.fileMeta}>
                                        <a href={f.url} target="_blank" rel="noreferrer" style={styles.fileLink}>
                                            {f.key.split('/').pop()}
                                        </a>
                                        <span style={styles.fileInfo}>{fmt(f.size)} · {timeAgo(f.lastModified)}</span>
                                    </div>
                                    <button
                                        style={styles.deleteBtn}
                                        onClick={() => handleDelete(f.key)}
                                        disabled={deleting === f.key}
                                    >
                                        {deleting === f.key ? '…' : '🗑️'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Quick Setup Steps */}
            <div style={styles.stepsCard}>
                <h3 style={styles.sectionTitle}>🚀 Quick Setup Steps</h3>
                <ol style={styles.stepsList}>
                    {[
                        ['Get Access Keys', 'AWS Console → IAM → Security Credentials → Create access key'],
                        ['Update .env', 'Set AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY'],
                        ['Test Connection', 'Run: node backend/test-aws.js'],
                        ['Create S3 Bucket', 'Auto-created on first test, or manually in AWS S3 Console'],
                        ['Deploy', 'Run: node deploy-aws.js  (Frontend → S3, Backend → Elastic Beanstalk)'],
                    ].map(([title, desc], i) => (
                        <li key={i} style={styles.step}>
                            <span style={styles.stepNum}>{i + 1}</span>
                            <div>
                                <strong style={{ color: '#e2e8f0' }}>{title}</strong>
                                <p style={styles.stepDesc}>{desc}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
}

// ── Sub-component ────────────────────────────────────────────
function Tag({ label, value, color = '#94a3b8' }) {
    return (
        <span style={styles.tag}>
            <span style={{ opacity: 0.6 }}>{label}: </span>
            <span style={{ color }}>{value}</span>
        </span>
    );
}

// ── Styles ────────────────────────────────────────────────────
const styles = {
    container: {
        padding: '28px 24px',
        maxWidth: 860,
        margin: '0 auto',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        color: '#e2e8f0',
        position: 'relative',
    },
    toast: {
        position: 'fixed', top: 20, right: 20, zIndex: 9999,
        padding: '12px 22px', borderRadius: 10, color: '#fff',
        fontWeight: 600, fontSize: 14, boxShadow: '0 4px 20px rgba(0,0,0,.4)',
        animation: 'fadeIn .2s ease',
    },
    header: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24,
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: 14 },
    headerIcon: { fontSize: 38 },
    title: { margin: 0, fontSize: 24, fontWeight: 700, color: '#f1f5f9' },
    subtitle: { margin: '2px 0 0', fontSize: 13, color: '#94a3b8' },
    refreshBtn: {
        background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)',
        color: '#cbd5e1', padding: '8px 18px', borderRadius: 8, cursor: 'pointer',
        fontSize: 13, fontWeight: 600, transition: 'all .2s',
    },
    statusCard: {
        background: 'rgba(15,23,42,.7)', border: '1px solid rgba(255,255,255,.08)',
        borderRadius: 14, padding: '20px 24px', marginBottom: 16,
        backdropFilter: 'blur(12px)',
    },
    loading: { display: 'flex', alignItems: 'center', gap: 10, color: '#94a3b8', fontSize: 14 },
    spinner: {
        display: 'inline-block', width: 16, height: 16,
        border: '2px solid rgba(255,255,255,.2)', borderTopColor: '#60a5fa',
        borderRadius: '50%', animation: 'spin 1s linear infinite',
    },
    statusRow: { display: 'flex', alignItems: 'flex-start', gap: 14 },
    statusDot: {
        width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
        marginTop: 4, boxShadow: '0 0 10px currentColor',
    },
    statusInfo: { flex: 1 },
    statusMsg: { fontSize: 15, fontWeight: 600, color: '#f1f5f9' },
    statusMeta: { display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 },
    tag: {
        background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.09)',
        borderRadius: 6, padding: '3px 10px', fontSize: 12,
    },
    banner: {
        background: 'linear-gradient(135deg,rgba(245,158,11,.15),rgba(234,179,8,.08))',
        border: '1px solid rgba(245,158,11,.35)', borderRadius: 12,
        padding: '16px 20px', marginBottom: 16,
    },
    uploadCard: {
        background: 'rgba(15,23,42,.7)', border: '1px solid rgba(255,255,255,.08)',
        borderRadius: 14, padding: '20px 24px', marginBottom: 16,
    },
    sectionTitle: { margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#cbd5e1' },
    uploadRow: { display: 'flex', alignItems: 'center', gap: 12 },
    fileInput: { display: 'none' },
    uploadBtn: {
        display: 'inline-block',
        background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
        color: '#fff', padding: '10px 22px', borderRadius: 9,
        fontWeight: 600, fontSize: 14, border: 'none',
        boxShadow: '0 4px 15px rgba(99,102,241,.4)',
        transition: 'opacity .2s',
    },
    progressWrap: {
        marginTop: 10, height: 6, background: 'rgba(255,255,255,.1)',
        borderRadius: 99, overflow: 'hidden',
    },
    progressBar: {
        height: '100%', background: 'linear-gradient(90deg,#3b82f6,#6366f1)',
        borderRadius: 99, transition: 'width .3s ease',
    },
    errorText: { margin: '8px 0 0', fontSize: 13, color: '#f87171' },
    successText: { margin: '8px 0 0', fontSize: 13, color: '#34d399' },
    filesCard: {
        background: 'rgba(15,23,42,.7)', border: '1px solid rgba(255,255,255,.08)',
        borderRadius: 14, padding: '20px 24px', marginBottom: 16,
    },
    filesHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    emptyText: { color: '#64748b', fontSize: 14, textAlign: 'center', padding: '20px 0' },
    filesList: { display: 'flex', flexDirection: 'column', gap: 8 },
    fileRow: {
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'rgba(255,255,255,.04)', borderRadius: 9,
        padding: '10px 14px', border: '1px solid rgba(255,255,255,.06)',
    },
    fileIcon: { fontSize: 20, flexShrink: 0 },
    fileMeta: { flex: 1, minWidth: 0 },
    fileLink: {
        color: '#60a5fa', fontWeight: 600, fontSize: 14,
        textDecoration: 'none', display: 'block',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
    },
    fileInfo: { fontSize: 12, color: '#64748b', marginTop: 2, display: 'block' },
    deleteBtn: {
        background: 'transparent', border: 'none', cursor: 'pointer',
        fontSize: 18, padding: '4px 8px', borderRadius: 6, flexShrink: 0,
        transition: 'background .2s',
    },
    stepsCard: {
        background: 'rgba(15,23,42,.7)', border: '1px solid rgba(255,255,255,.08)',
        borderRadius: 14, padding: '20px 24px',
    },
    stepsList: { margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 },
    step: { display: 'flex', alignItems: 'flex-start', gap: 14 },
    stepNum: {
        background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
        color: '#fff', width: 26, height: 26, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700, flexShrink: 0,
    },
    stepDesc: { margin: '3px 0 0', fontSize: 13, color: '#64748b' },
    code: {
        background: 'rgba(255,255,255,.1)', padding: '1px 6px',
        borderRadius: 4, fontFamily: 'monospace', fontSize: 12,
    },
};
