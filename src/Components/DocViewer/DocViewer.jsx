import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaTimes, FaDownload, FaFilePdf, FaFileImage,
    FaFileWord, FaFileAlt, FaSearchPlus, FaExpand
} from 'react-icons/fa';
import './DocViewer.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';

/**
 * Resolve a relative fileUrl to an absolute URL using the backend base
 */
export function resolveFileUrl(fileUrl) {
    if (!fileUrl) return '#';
    if (fileUrl.startsWith('http') || fileUrl.startsWith('blob:') || fileUrl.startsWith('data:')) return fileUrl;
    return `${API_BASE}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
}

/**
 * Detect file type from URL extension
 */
export function getFileType(url) {
    if (!url) return 'unknown';
    const clean = url.split('?')[0].toLowerCase();
    const ext = clean.split('.').pop();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'word';
    if (['xls', 'xlsx'].includes(ext)) return 'excel';
    if (['ppt', 'pptx'].includes(ext)) return 'ppt';
    if (['txt', 'csv'].includes(ext)) return 'text';
    return 'other';
}

function getFileIcon(type) {
    switch (type) {
        case 'image': return <FaFileImage style={{ color: '#10b981' }} />;
        case 'pdf': return <FaFilePdf style={{ color: '#ef4444' }} />;
        case 'word': return <FaFileWord style={{ color: '#3b82f6' }} />;
        default: return <FaFileAlt style={{ color: '#6366f1' }} />;
    }
}

function getTypeLabel(type) {
    const map = { image: 'Image', pdf: 'PDF Document', word: 'Word Document', excel: 'Spreadsheet', ppt: 'Presentation', text: 'Text File', other: 'Document' };
    return map[type] || 'Document';
}

/**
 * DocViewer — Universal document viewer modal
 * @param {string}   fileUrl   - Relative or absolute URL to the file
 * @param {string}   fileName  - Original file name (optional)
 * @param {function} onClose   - Callback when modal is closed
 * @param {boolean}  open      - Whether modal is visible
 */
const DocViewer = ({ fileUrl, fileName, onClose, open }) => {
    const absUrl = resolveFileUrl(fileUrl);
    const type = getFileType(absUrl);
    const displayName = fileName || fileUrl?.split('/').pop() || 'Document';

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        if (open) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [open, handleKeyDown]);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = absUrl;
        link.download = displayName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleOpenTab = () => {
        window.open(absUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="dv-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
                >
                    <motion.div
                        className="dv-modal"
                        initial={{ opacity: 0, scale: 0.92, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                    >
                        {/* Header */}
                        <div className="dv-header">
                            <div className="dv-file-info">
                                <div className="dv-file-icon">{getFileIcon(type)}</div>
                                <div>
                                    <div className="dv-file-name" title={displayName}>{displayName}</div>
                                    <span className={`dv-type-badge dv-type-${type}`}>{getTypeLabel(type)}</span>
                                </div>
                            </div>
                            <div className="dv-header-actions">
                                <button className="dv-btn dv-btn-ghost" onClick={handleOpenTab} title="Open in new tab">
                                    <FaExpand />
                                </button>
                                <button className="dv-btn dv-btn-primary" onClick={handleDownload} title="Download file">
                                    <FaDownload /> Download
                                </button>
                                <button className="dv-btn dv-btn-close" onClick={onClose} title="Close (Esc)">
                                    <FaTimes />
                                </button>
                            </div>
                        </div>

                        {/* Preview Area */}
                        <div className="dv-preview">
                            {type === 'image' && (
                                <div className="dv-img-container">
                                    <img
                                        src={absUrl}
                                        alt={displayName}
                                        className="dv-image"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                    <div className="dv-error-fallback" style={{ display: 'none' }}>
                                        <FaFileImage style={{ fontSize: '3rem', color: '#94a3b8' }} />
                                        <p>Image could not be loaded.</p>
                                        <button className="dv-btn dv-btn-primary" onClick={handleOpenTab}>Open in Browser</button>
                                    </div>
                                </div>
                            )}

                            {type === 'pdf' && (
                                <div className="dv-pdf-container">
                                    <object
                                        data={`${absUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                                        type="application/pdf"
                                        className="dv-pdf-object"
                                    >
                                        {/* Fallback for browsers that can't display PDF inline */}
                                        <div className="dv-no-preview">
                                            <FaFilePdf style={{ fontSize: '4rem', color: '#ef4444' }} />
                                            <h3>PDF Preview Unavailable</h3>
                                            <p>Your browser doesn't support inline PDF preview.</p>
                                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                                <button className="dv-btn dv-btn-primary" onClick={handleOpenTab}>
                                                    <FaExpand /> Open in Browser
                                                </button>
                                                <button className="dv-btn dv-btn-secondary" onClick={handleDownload}>
                                                    <FaDownload /> Download PDF
                                                </button>
                                            </div>
                                        </div>
                                    </object>
                                </div>
                            )}

                            {(type === 'word' || type === 'excel' || type === 'ppt') && (
                                <div className="dv-no-preview">
                                    {getFileIcon(type)}
                                    <h3>{getTypeLabel(type)}</h3>
                                    <p>This file type can't be previewed in the browser.</p>
                                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                                        Download the file to view it in the appropriate application.
                                    </p>
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                        <button className="dv-btn dv-btn-primary large" onClick={handleDownload}>
                                            <FaDownload /> Download File
                                        </button>
                                        <button className="dv-btn dv-btn-secondary" onClick={handleOpenTab}>
                                            <FaExpand /> Open Link
                                        </button>
                                    </div>
                                </div>
                            )}

                            {(type === 'text' || type === 'other' || type === 'unknown') && (
                                <div className="dv-no-preview">
                                    <FaFileAlt style={{ fontSize: '4rem', color: '#6366f1' }} />
                                    <h3>File Preview</h3>
                                    <p>Preview not available for this file type.</p>
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                        <button className="dv-btn dv-btn-primary large" onClick={handleDownload}>
                                            <FaDownload /> Download
                                        </button>
                                        <button className="dv-btn dv-btn-secondary" onClick={handleOpenTab}>
                                            <FaExpand /> Open in Tab
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="dv-footer">
                            <span className="dv-url-hint">{absUrl}</span>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button className="dv-btn dv-btn-secondary" onClick={handleOpenTab}>
                                    <FaSearchPlus /> Open Full Screen
                                </button>
                                <button className="dv-btn dv-btn-primary" onClick={handleDownload}>
                                    <FaDownload /> Download
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DocViewer;
