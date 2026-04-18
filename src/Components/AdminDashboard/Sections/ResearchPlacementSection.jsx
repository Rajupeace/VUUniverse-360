import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaMicroscope, FaBriefcase, FaChartBar, FaPlus } from 'react-icons/fa';
import { apiGet } from '../../../utils/apiClient';

const ResearchPlacementSection = () => {
    const [stats, setStats] = useState({ researchWork: [], placements: [] });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [placementData, researchData] = await Promise.all([
                    apiGet('/api/placements'),
                    apiGet('/api/achievements/all/list?category=Research')
                ]);
                setStats({
                    placements: placementData || [],
                    researchWork: researchData?.achievements || []
                });
            } catch (error) {
                console.error('Failed to fetch research/placement data:', error);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="animate-fade-in">
            <header className="admin-page-header" style={{ marginBottom: '2.5rem' }}>
                <div className="admin-page-title">
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--admin-secondary)' }}>MISSION <span style={{ color: 'var(--admin-primary)' }}>SUCCESS</span></h1>
                    <p style={{ color: '#64748b', fontWeight: 700 }}>TRACK RESEARCH & CAREER MILESTONES</p>
                </div>
            </header>

            <div className="admin-grid-2" style={{ gap: '2rem', marginBottom: '3rem' }}>
                <div className="admin-card" style={{ padding: '2rem', borderRadius: '28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ margin: 0, fontWeight: 950, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaMicroscope style={{ color: '#4f46e5' }} /> RESEARCH INNOVATIONS
                        </h3>
                        <button className="admin-btn admin-btn-outline" style={{ height: '32px', padding: '0 12px', fontSize: '0.7rem' }}>NEW PUBLICATION</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {stats.researchWork.slice(0, 3).map((r, i) => (
                            <div key={i} style={{ borderLeft: '4px solid #4f46e5', padding: '0.5rem 1.2rem', background: '#f8fafc', borderRadius: '0 12px 12px 0' }}>
                                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{r.title}</div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginTop: '4px' }}>By {r.studentName} ({r.rollNumber}) • {r.eventName}</div>
                            </div>
                        ))}
                        {stats.researchWork.length === 0 && (
                            <div style={{ color: '#94a3b8', textAlign: 'center', padding: '1rem', fontSize: '0.8rem', fontWeight: 700 }}>No research papers logged yet.</div>
                        )}
                    </div>
                </div>

                <div className="admin-card" style={{ padding: '2rem', borderRadius: '28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ margin: 0, fontWeight: 950, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaBriefcase style={{ color: '#10b981' }} /> PLACEMENT TRACKER
                        </h3>
                        <button className="admin-btn admin-btn-outline" style={{ height: '32px', padding: '0 12px', fontSize: '0.7rem' }}>MANAGE DRIVES</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {stats.placements.slice(0, 3).map((p, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', background: '#f0fdf4', borderRadius: '14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{p.companyName}</div>
                                    <span style={{ fontSize: '0.7rem', background: 'white', padding: '2px 8px', borderRadius: '6px', fontWeight: 900, color: '#10b981' }}>₹{p.package} LPA</span>
                                </div>
                                <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#10b981' }}>{p.studentsSelected?.length || 0} SELECTED</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="admin-card" style={{ padding: '2.5rem', borderRadius: '32px', background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: 'white' }}>
                <div style={{ display: 'flex', gap: '3rem', justifyContent: 'space-around' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 950, color: '#818cf8' }}>241</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>PLACEMENTS '25</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 950, color: '#34d399' }}>₹12.4L</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>AVG PACKAGE</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 950, color: '#fbbf24' }}>{stats.researchWork.length}</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>RESEARCH PAPERS</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResearchPlacementSection;
