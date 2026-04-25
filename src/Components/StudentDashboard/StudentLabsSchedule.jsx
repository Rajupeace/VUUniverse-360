import React, { useState, useEffect, useCallback } from 'react';
import { FaFlask, FaClock, FaMapMarkerAlt, FaChalkboardTeacher, FaWrench } from 'react-icons/fa';
import { apiGet } from '../../utils/apiClient';
import sseClient from '../../utils/sseClient';
import './StudentLabsSchedule.css';
import { motion } from 'framer-motion';

/**
 * Student Labs Schedule V4
 * Professional Glassmorphism Lab Schedule
 */
const StudentLabsSchedule = ({ studentData, enrolledSubjects = [] }) => {
    const [labSchedule, setLabSchedule] = useState([]);
    const [loading, setLoading] = useState(true);

    const sYear = studentData?.year || 3;
    const sSection = studentData?.section || '13';
    const sBranch = studentData?.branch || 'CSE';

    const fetchLabSchedule = useCallback(async () => {
        setLoading(true);
        try {
            // Use the real schedule API filtered by type=Lab — /api/labs/schedule does not exist
            const response = await apiGet(
                `/api/schedule?year=${Number(sYear)}&section=${encodeURIComponent(sSection)}&branch=${encodeURIComponent(sBranch)}`
            );
            const labs = Array.isArray(response)
                ? response.filter(s => s.type === 'Lab' || s.type === 'Tutorial' || (s.subject && (s.subject.endsWith('-L') || s.subject.endsWith('-T'))))
                : [];
            setLabSchedule(labs);
        } catch (error) {
            console.error('Lab Sync Failed:', error);
            setLabSchedule([]);
        } finally {
            setLoading(false);
        }
    }, [sYear, sSection, sBranch]);

    useEffect(() => {
        fetchLabSchedule();
    }, [fetchLabSchedule]);

    // Real-time Update Listener
    useEffect(() => {
        const unsub = sseClient.onUpdate((ev) => {
            if (ev && (ev.resource === 'schedules' || ev.resource === 'labs')) {
                fetchLabSchedule();
            }
        });
        return () => unsub();
    }, [fetchLabSchedule]);

    const filteredLabs = labSchedule; // Already filtered by type from API

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    if (loading) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                <div className="nexus-loading-ring" style={{ margin: '0 auto 1rem' }}></div>
                Retrieving Lab data...
            </div>
        );
    }
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ width: '100%', padding: '0 0.5rem' }}
        >
            {/* Header Info */}
            <div style={{
                background: 'rgba(15, 23, 42, 0.03)', border: '1px solid rgba(15, 23, 42, 0.05)', borderRadius: '16px', padding: '1.2rem',
                marginBottom: '2rem', display: 'flex', gap: '1.2rem', alignItems: 'center', color: '#475569'
            }}>
                <div style={{ width: '44px', height: '44px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                    <FaWrench />
                </div>
                <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Laboratory Guidelines</h4>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', opacity: 0.8 }}>
                        Safety protocols are mandatory. Arrive with manual and ID card.
                    </p>
                </div>
            </div>

            {/* Labs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {filteredLabs.length > 0 ? filteredLabs.map((lab, index) => {
                    const isLab = lab.type === 'Lab';
                    const accentColor = isLab ? '#6366f1' : '#f59e0b';
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08 }}
                            style={{
                                background: 'rgba(255, 255, 255, 0.5)', borderRadius: '22px', padding: '1.8rem',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                backdropFilter: 'blur(15px)',
                                WebkitBackdropFilter: 'blur(15px)',
                                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.02)',
                                display: 'flex', flexDirection: 'column', gap: '1rem',
                                position: 'relative', overflow: 'hidden', transition: 'all 0.25s'
                            }}
                        >
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ width: 48, height: 48, borderRadius: 14, background: 'white', color: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                                        <FaFlask />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.3 }}>
                                            {lab.subject || lab.labName || 'Lab Session'}
                                        </h3>
                                        <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: accentColor, background: 'rgba(255,255,255,0.8)', padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase' }}>
                                                {lab.type}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 950, color: '#0f172a', opacity: 0.7 }}>{lab.day?.substring(0, 3)?.toUpperCase()}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2, fontWeight: 700 }}>
                                        {lab.time.split(' - ')[0]}
                                    </div>
                                </div>
                            </div>

                            {/* Meta grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                                <div style={{ background: 'rgba(15, 23, 42, 0.03)', padding: '0.8rem', borderRadius: 14 }}>
                                    <span style={{ fontSize: '0.6rem', fontWeight: 900, color: '#94a3b8', letterSpacing: '0.1em', display: 'block', marginBottom: 4 }}>INSTRUCTOR</span>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>
                                        {lab.faculty || 'TBA'}
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(15, 23, 42, 0.03)', padding: '0.8rem', borderRadius: 14 }}>
                                    <span style={{ fontSize: '0.6rem', fontWeight: 900, color: '#94a3b8', letterSpacing: '0.1em', display: 'block', marginBottom: 4 }}>ROOM</span>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>
                                        {lab.room || 'Lab Complex'}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                }) : (
                    <div style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', background: 'rgba(15, 23, 42, 0.02)', borderRadius: '24px', border: '1px dashed #e2e8f0', color: '#94a3b8' }}>
                        <FaFlask style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.2 }} />
                        <h3 style={{ fontWeight: 900, color: '#0f172a' }}>No Labs Scheduled</h3>
                        <p style={{ fontWeight: 700 }}>Check the Theory tab for class schedule.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default StudentLabsSchedule;
