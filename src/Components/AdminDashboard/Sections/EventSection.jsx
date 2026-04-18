import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarPlus, FaMapMarkerAlt, FaUsers, FaClock, FaPlus } from 'react-icons/fa';
import { apiGet } from '../../../utils/apiClient';

const EventSection = () => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await apiGet('/api/events');
                setEvents(data || []);
            } catch (error) {
                console.error('Failed to fetch events:', error);
            }
        };
        fetchEvents();
    }, []);

    return (
        <div className="animate-fade-in">
            <header className="admin-page-header" style={{ marginBottom: '2.5rem' }}>
                <div className="admin-page-title">
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--admin-secondary)' }}>CAMPUS <span style={{ color: 'var(--admin-primary)' }}>EVENTS</span></h1>
                    <p style={{ color: '#64748b', fontWeight: 700 }}>SCHEDULE & BROADCAST ACTIVITIES</p>
                </div>
                <button className="admin-btn admin-btn-primary" style={{ height: '48px', borderRadius: '16px' }}>
                    <FaPlus /> CREATE EVENT
                </button>
            </header>

            <div className="admin-grid-2" style={{ gap: '1.5rem' }}>
                {events.map((event) => (
                    <motion.div
                        key={event._id}
                        className="admin-card"
                        style={{ padding: '0', borderRadius: '24px', overflow: 'hidden' }}
                    >
                        <div style={{ height: '140px', background: event.banner ? `url(${event.banner}) center/cover no-repeat` : 'linear-gradient(135deg, #6366f1, #a855f7)', position: 'relative' }}>
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)' }}></div>
                            <div style={{ position: 'absolute', bottom: '1rem', left: '1.5rem' }}>
                                <span style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(12px)', color: 'white', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 950, letterSpacing: '1px', textTransform: 'uppercase' }}>
                                    {event.type || 'General'}
                                </span>
                            </div>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900 }}>{event.title}</h3>
                            <div style={{ display: 'flex', gap: '1.5rem', margin: '1rem 0 1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>
                                    <FaCalendarPlus /> {new Date(event.date).toLocaleDateString()}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>
                                    <FaClock /> {event.time || '10:00 AM'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>
                                    <FaMapMarkerAlt /> {event.location || 'Main Auditorium'}
                                </div>
                            </div>
                            <p style={{ color: '#444', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>{event.description}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FaUsers style={{ color: '#94a3b8' }} />
                                    <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>{event.participantsCount || 0} Registered</span>
                                </div>
                                <button className="admin-btn admin-btn-outline" style={{ height: '32px', fontSize: '0.7rem' }}>MANAGE GUESTLIST</button>
                            </div>
                        </div>
                    </motion.div>
                ))}
                {events.length === 0 && (
                    <div className="admin-card" style={{ gridColumn: '1/-1', padding: '5rem', textAlign: 'center', borderRadius: '24px', border: '2px dashed #e2e8f0', background: 'transparent' }}>
                        <div style={{ fontSize: '3.5rem', color: '#cbd5e1', marginBottom: '1rem' }}><FaCalendarPlus /></div>
                        <h3 style={{ color: '#64748b', fontWeight: 900, fontSize: '1.5rem' }}>STILL WATERS...</h3>
                        <p style={{ color: '#94a3b8', fontWeight: 700 }}>No upcoming events scheduled. Time to plan something big?</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventSection;
