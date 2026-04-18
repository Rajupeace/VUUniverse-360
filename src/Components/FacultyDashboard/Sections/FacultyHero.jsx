import React from 'react';
import { FaShieldAlt, FaSyncAlt, FaLayerGroup, FaChartLine, FaUserCheck, FaBolt, FaPlus, FaUserCircle } from 'react-icons/fa';

const FacultyHero = ({
    activeContext,
    syncing,
    studentsList,
    materialsList,
    myClasses,
    refreshAll,
    setShowQuickMenu,
    showQuickMenu,
    displayName,
    setActiveContext,
    setShowProfile
}) => {
    return (
        <>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', padding: '1.5rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)', borderRadius: '20px', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                    <div className="icon-box" style={{ background: 'linear-gradient(135deg, #0ea5e9, #22d3ee)', color: 'white', width: '56px', height: '56px', fontSize: '1.5rem' }}><FaShieldAlt /></div>
                    <div>
                        <div style={{ fontSize: '0.7rem', color: '#0ea5e9', fontWeight: 900, letterSpacing: '1.5px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', animation: 'pulse 2s infinite' }}></div>
                            SECURE FACULTY NODE {syncing && '• SYNCING...'}
                        </div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px', marginTop: '0.3rem' }}>
                            {activeContext ? activeContext.subject : 'Main Systems Aggregate'}
                        </div>

                        {/* Quick Stats Badges */}
                        <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.8rem', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700, color: '#059669' }}>
                                <FaUserCheck /> {studentsList.length} Students
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                                <FaLayerGroup /> {materialsList.length} Materials
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700, color: '#a855f7' }}>
                                <FaChartLine /> {myClasses.length} Classes
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                    <button className="cyber-btn primary" onClick={refreshAll} style={{ padding: '0.9rem 1.8rem', fontSize: '0.85rem', fontWeight: 700 }}>
                        {syncing ? <FaSyncAlt className="spin-fast" /> : <FaSyncAlt />}
                        {syncing ? 'SYNCING...' : 'REFRESH'}
                    </button>

                    {/* Quick Actions Toggle */}
                    <button
                        className="cyber-btn"
                        onClick={() => setShowQuickMenu(!showQuickMenu)}
                        style={{ padding: '0.9rem 1.8rem', fontSize: '0.85rem', fontWeight: 700, background: showQuickMenu ? 'var(--accent-primary)' : 'white', color: showQuickMenu ? 'white' : 'var(--text-main)', border: '1px solid var(--pearl-border)' }}
                    >
                        <FaBolt /> QUICK ACTIONS
                    </button>
                </div>
            </header>

            {!activeContext && (
                <section className="hero-banner">
                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                padding: '0.5rem 1rem',
                                background: 'rgba(16, 185, 129, 0.08)',
                                borderRadius: '50px',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                color: '#059669',
                                fontSize: '0.7rem',
                                fontWeight: 900,
                                letterSpacing: '1px'
                            }}>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: '#10b981',
                                    boxShadow: '0 0 10px #10b981',
                                    animation: 'pulse 2s infinite'
                                }}></div>
                                SYSTEM SECURE
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                padding: '0.5rem 1rem',
                                background: 'rgba(99, 102, 241, 0.08)',
                                borderRadius: '50px',
                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                color: 'var(--accent-primary)',
                                fontSize: '0.7rem',
                                fontWeight: 900,
                                letterSpacing: '1px'
                            }}>
                                <FaSyncAlt className={syncing ? 'spin-fast' : ''} style={{ fontSize: '0.8rem' }} />
                                {syncing ? 'DATA SYNC ACTIVE' : 'MESH SYNCHRONIZED'}
                            </div>
                        </div>
                        <h1>Welcome back,<br />Prof. {displayName}</h1>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-dim)', maxWidth: '600px', marginTop: '1.5rem' }}>
                            Global dashboard active. Overviewing material deployment, student affinity, and system transmissions.
                        </p>

                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '3.5rem' }}>
                            <div className="cyber-btn primary" onClick={() => myClasses.length > 0 && setActiveContext(myClasses[0])} style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', padding: '1.2rem 2.8rem' }}>
                                <FaPlus /> Deploy Node Material
                            </div>
                            <div className="cyber-btn" style={{ background: 'white', color: 'var(--text-main)', border: '1px solid var(--pearl-border)', padding: '1.2rem 2.8rem' }} onClick={() => setShowProfile(true)}>
                                <FaUserCircle style={{ color: 'var(--accent-vibrant)' }} /> My Identity Mesh
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </>
    );
};

export default FacultyHero;
