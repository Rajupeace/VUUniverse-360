import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaBus, FaMapMarkerAlt, FaUsers, FaTools, FaPlus } from 'react-icons/fa';
import { apiGet } from '../../../utils/apiClient';

const TransportSection = () => {
    const [routes, setRoutes] = useState([]);

    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                const data = await apiGet('/api/transport');
                setRoutes(data || []);
            } catch (error) {
                console.error('Failed to fetch routes:', error);
            }
        };
        fetchRoutes();
    }, []);

    return (
        <div className="animate-fade-in">
            <header className="admin-page-header" style={{ marginBottom: '2.5rem' }}>
                <div className="admin-page-title">
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--admin-secondary)' }}>FLEET <span style={{ color: 'var(--admin-primary)' }}>OPERATIONS</span></h1>
                    <p style={{ color: '#64748b', fontWeight: 700 }}>MANAGE TRANSPORT LOGISTICS</p>
                </div>
                <button className="admin-btn admin-btn-primary" style={{ height: '48px', borderRadius: '16px' }}>
                    <FaPlus /> REGISTER VEHICLE
                </button>
            </header>

            <div className="admin-grid-3" style={{ gap: '1.5rem' }}>
                {routes.map((route) => (
                    <motion.div
                        key={route._id}
                        className="admin-card"
                        style={{ padding: '1.5rem', borderRadius: '24px' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <div style={{ width: '44px', height: '44px', background: '#fff7ed', color: '#f97316', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                                <FaBus />
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 950, color: '#1e293b', fontSize: '1rem' }}>ROUTE {route.routeNumber}</div>
                                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#10b981' }}>{route.status.toUpperCase()}</div>
                            </div>
                        </div>

                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>{route.routeName}</h3>
                        <p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 700, margin: '4px 0 1.5rem' }}>Driver: {route.driverName}</p>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: 950, color: '#94a3b8', letterSpacing: '1px', marginBottom: '8px' }}>KEY STOPS</div>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {route.stops?.map((stop, i) => (
                                    <span key={i} style={{ padding: '3px 8px', background: '#f1f5f9', color: '#475569', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 }}>{stop}</span>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', borderTop: '1px solid #f1f5f9', paddingTop: '1rem', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8' }}>CAPACITY</div>
                                <div style={{ fontWeight: 900, fontSize: '0.9rem' }}>{route.passengers?.length} / {route.capacity}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <button className="admin-btn admin-btn-outline" style={{ width: '32px', height: '32px', padding: 0 }}><FaTools /></button>
                                <button className="admin-btn admin-btn-primary" style={{ width: '32px', height: '32px', padding: 0 }}><FaUsers /></button>
                            </div>
                        </div>
                    </motion.div>
                ))}
                {routes.length === 0 && (
                    <div className="admin-card" style={{ gridColumn: '1/-1', padding: '4rem', textAlign: 'center', borderRadius: '24px', border: '2px dashed #e2e8f0', background: 'transparent' }}>
                        <div style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem' }}><FaBus /></div>
                        <h3 style={{ color: '#64748b', fontWeight: 900 }}>TRANSPORT SYSTEM OFFLINE</h3>
                        <p style={{ color: '#94a3b8', fontWeight: 700 }}>Register vehicles and pilot routes to begin tracking.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransportSection;
