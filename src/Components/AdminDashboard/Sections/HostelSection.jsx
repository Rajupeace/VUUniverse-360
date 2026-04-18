import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash, FaBuilding, FaBed, FaUserFriends, FaTools } from 'react-icons/fa';
import { apiGet, apiPost, apiPut, apiDelete } from '../../../utils/apiClient';
import sseClient from '../../../utils/sseClient';

const HostelSection = () => {
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchRooms();
    }, []);

    // SSE real-time updates
    useEffect(() => {
        const unsub = sseClient.onUpdate((ev) => {
            if (ev && ev.resource === 'hostel') {
                console.log('🔄 Hostel SSE Update:', ev.action);
                fetchRooms();
            }
        });
        return unsub;
    }, []);

    const fetchRooms = async () => {
        try {
            const data = await apiGet('/api/hostel');
            setRooms(data || []);
        } catch (error) {
            console.error('Failed to fetch rooms:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <header className="admin-page-header" style={{ marginBottom: '2.5rem' }}>
                <div className="admin-page-title">
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--admin-secondary)' }}>HOSTEL <span style={{ color: 'var(--admin-primary)' }}>MANAGEMENT</span></h1>
                    <p style={{ color: '#64748b', fontWeight: 700 }}>{rooms.length} TOTAL ROOMS TRACKED</p>
                </div>
                <button className="admin-btn admin-btn-primary" style={{ height: '48px', borderRadius: '16px' }}>
                    <FaPlus /> ADD NEW ROOM
                </button>
            </header>

            <div className="admin-grid-3" style={{ gap: '1.5rem' }}>
                {rooms.map((room) => (
                    <motion.div
                        key={room._id}
                        className="admin-card"
                        whileHover={{ y: -5 }}
                        style={{ padding: '1.5rem', borderRadius: '24px', border: '1px solid #f1f5f9' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div style={{ width: '48px', height: '48px', background: '#f0f9ff', color: '#0ea5e9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                <FaBuilding />
                            </div>
                            <span style={{
                                padding: '4px 12px',
                                borderRadius: '8px',
                                fontSize: '0.7rem',
                                fontWeight: 900,
                                background: room.status === 'Available' ? '#dcfce7' : '#fee2e2',
                                color: room.status === 'Available' ? '#10b981' : '#ef4444'
                            }}>
                                {room.status.toUpperCase()}
                            </span>
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>Room {room.roomNumber}</h3>
                        <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700, margin: '4px 0 1.5rem' }}>{room.blockName} Block • {room.type}</p>

                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ flex: 1, background: '#f8fafc', padding: '10px', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Occupancy</div>
                                <div style={{ fontWeight: 900, fontSize: '1rem' }}>{room.occupants?.length} / {room.capacity}</div>
                            </div>
                            <div style={{ flex: 1, background: '#f8fafc', padding: '10px', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Monthly Fee</div>
                                <div style={{ fontWeight: 900, fontSize: '1rem' }}>₹{room.monthlyFee}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="admin-btn admin-btn-outline" style={{ flex: 1, fontSize: '0.75rem', height: '36px' }}>VIEW DETAILS</button>
                            <button className="admin-btn admin-btn-danger" style={{ width: '36px', height: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FaTrash />
                            </button>
                        </div>
                    </motion.div>
                ))}
                {rooms.length === 0 && !isLoading && (
                    <div className="admin-card" style={{ gridColumn: '1/-1', padding: '4rem', textAlign: 'center', borderRadius: '24px', border: '2px dashed #e2e8f0', background: 'transparent' }}>
                        <div style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem' }}><FaBed /></div>
                        <h3 style={{ color: '#64748b', fontWeight: 900 }}>NO ROOMS REGISTERED</h3>
                        <p style={{ color: '#94a3b8', fontWeight: 700 }}>Start by adding hostel blocks and rooms to the system.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HostelSection;
