import React from 'react';
import { FaEye, FaDownload, FaBookOpen, FaFolderOpen, FaFileAlt } from 'react-icons/fa';

/**
/**
 * Content Sources
 * Curriculum source materials and assets.
 */
const ContentSourceSection = ({ contentSource, getFileUrl }) => {
    return (
        <div className="animate-fade-in">
            <header className="admin-page-header">
                <div className="admin-page-title">
                    <h1>SOURCE <span>MATERIALS</span></h1>
                    <p>Manage curriculum source materials.</p>
                </div>
                <div style={{ color: 'var(--admin-text-muted)', fontSize: '0.8rem', fontWeight: 850 }}>
                    Linked to student learning dashboards.
                </div>
            </header>

            <div className="admin-grid">
                {contentSource && contentSource.length > 0 ? (
                    contentSource.map(subject => (
                        <div key={subject.subject || 'unknown'} className="admin-card sentinel-animate" style={{ padding: '0', overflow: 'hidden' }}>
                            <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--admin-border)', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--admin-secondary)', fontWeight: 950 }}>{subject.subject || 'Unassigned'}</h3>
                                <span className="admin-badge primary">VERIFIED SOURCE</span>
                            </div>

                            <div style={{ padding: '1.75rem' }}>
                                {subject.types.map(type => (
                                    <div key={type.type} style={{ marginBottom: '2rem' }}>
                                        <h5 style={{
                                            fontSize: '0.7rem',
                                            color: 'var(--admin-text-muted)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1rem',
                                            fontWeight: 950,
                                            marginBottom: '1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <FaFolderOpen /> {type.type} FILES
                                        </h5>

                                        <div className="admin-list-container">
                                            {type.chapters.map(chapter => (
                                                <div key={chapter.chapter} style={{ paddingLeft: '0.75rem', borderLeft: '2px solid var(--admin-border)' }}>
                                                    <h6 style={{ fontSize: '0.8rem', fontWeight: 950, color: 'var(--admin-secondary)', marginBottom: '0.75rem' }}>CHAPTER {chapter.chapter}</h6>

                                                    <div className="admin-list-container" style={{ gap: '0.6rem' }}>
                                                        {chapter.files.map(file => (
                                                            <div key={file.name} className="admin-list-item">
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, overflow: 'hidden' }}>
                                                                    <FaFileAlt style={{ color: 'var(--admin-primary)', flexShrink: 0 }} />
                                                                    <div style={{ overflow: 'hidden' }}>
                                                                        <div style={{ fontSize: '0.8rem', fontWeight: 950, color: 'var(--admin-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</div>
                                                                        <div style={{ fontSize: '0.65rem', color: 'var(--admin-text-muted)', fontWeight: 850 }}>Size: {(file.size / 1024).toFixed(1)} KB</div>
                                                                    </div>
                                                                </div>

                                                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                                    <a href={getFileUrl(file.url)} target="_blank" rel="noopener noreferrer" className="admin-action-btn" title="View">
                                                                        <FaEye size={12} />
                                                                    </a>
                                                                    <a href={getFileUrl(file.url)} download className="admin-action-btn" style={{ background: 'var(--admin-primary)', color: 'white', borderColor: 'var(--admin-primary)' }} title="Download">
                                                                        <FaDownload size={12} />
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="admin-empty-state" style={{ gridColumn: '1/-1' }}>
                        <FaBookOpen className="admin-empty-icon" />
                        <h2 className="admin-empty-title">No Source Materials</h2>
                        <p className="admin-empty-text">No content sources found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContentSourceSection;
