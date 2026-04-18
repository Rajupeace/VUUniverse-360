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
                background: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: '16px', padding: '1rem',
                marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', color: '#0f766e'
            }}>
                <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <FaWrench />
                </div>
                <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Laboratory Guidelines</h4>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', opacity: 0.9 }}>
                        Arrive 10 minutes early with your manual and ID card. Safety protocols are mandatory.
                    </p>
                </div>
            </div>

            {/* Labs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {filteredLabs.length > 0 ? filteredLabs.map((lab, index) => {
                    const isLab = lab.type === 'Lab';
                    const accentColor = isLab ? '#06b6d4' : '#f59e0b';
                    const bgColor = isLab ? '#ecfeff' : '#fef9c3';
                    const textColor = isLab ? '#0891b2' : '#92400e';
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08 }}
                            style={{
                                background: 'white', borderRadius: '20px', padding: '1.5rem',
                                border: `1px solid ${accentColor}30`,
                                borderLeft: `4px solid ${accentColor}`,
                                boxShadow: `0 6px 20px -6px ${accentColor}20`,
                                display: 'flex', flexDirection: 'column', gap: '0.75rem',
                                position: 'relative', overflow: 'hidden', transition: 'all 0.25s'
                            }}
                        >
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                                    <div style={{ width: 46, height: 46, borderRadius: 12, background: bgColor, color: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                                        <FaFlask />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1e293b', lineHeight: 1.3 }}>
                                            {lab.subject || lab.labName || 'Lab Session'}
                                        </h3>
                                        <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: textColor, background: bgColor, padding: '2px 8px', borderRadius: 6 }}>
                                                {lab.type}
                                            </span>
                                            {lab.courseCode && (
                                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: 6 }}>
                                                    {lab.courseCode}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 900, color: accentColor, fontFamily: "'Outfit', sans-serif" }}>{lab.day?.substring(0, 3)?.toUpperCase()}</div>
                                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end' }}>
                                        <FaClock size={9} /> {lab.time}
                                    </div>
                                </div>
                            </div>

                            {/* Meta grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 12 }}>
                                    <span style={{ fontSize: '0.6rem', fontWeight: 900, color: '#94a3b8', letterSpacing: '0.8px', display: 'block', marginBottom: 3 }}>INSTRUCTOR</span>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <FaChalkboardTeacher size={10} style={{ color: accentColor }} />
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lab.faculty || 'TBA'}</span>
                                    </div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 12 }}>
                                    <span style={{ fontSize: '0.6rem', fontWeight: 900, color: '#94a3b8', letterSpacing: '0.8px', display: 'block', marginBottom: 3 }}>ROOM</span>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <FaMapMarkerAlt size={10} style={{ color: accentColor }} />
                                        {lab.room || 'Lab Complex'}
                                    </div>
                                </div>
                            </div>

                            {/* Footer hint */}
                            <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5 }}>
                                {lab.type === 'Lab'
                                    ? 'Bring your lab manual and ID. Arrive at least 10 min early.'
                                    : 'Tutorial session — prepare your notes and previous assignments.'}
                            </p>
                        </motion.div>
                    );
                }) : (
                    <div style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', background: '#f8fafc', borderRadius: '24px', border: '2px dashed #e2e8f0', color: '#94a3b8' }}>
                        <FaFlask style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }} />
                        <h3>No Labs Scheduled</h3>
                        <p>No lab or tutorial sessions found for your section.<br />Check the Theory tab for class schedule.</p>
                    </div>
                )}

            </div>
        </motion.div>
    );
};

export default StudentLabsSchedule;
