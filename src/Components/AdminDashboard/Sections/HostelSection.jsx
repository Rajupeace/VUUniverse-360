import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaPlus, FaTrash, FaBuilding, FaBed, FaUserFriends, FaTools, FaWrench, 
    FaMoneyBillWave, FaChartLine, FaSearch, FaFilter, FaEllipsisV, FaWifi,
    FaUtensils, FaTint, FaBolt, FaShieldAlt
} from 'react-icons/fa';
import { apiGet, apiPost, apiPut, apiDelete } from '../../../utils/apiClient';
import sseClient from '../../../utils/sseClient';

const HostelSection = () => {
    const [rooms, setRooms] = useState([]);
    const [maintenanceRequests, setMaintenanceRequests] = useState([]);
    const [stats, setStats] = useState({
        totalRooms: 0,
        occupied: 0,
        available: 0,
        occupancyRate: 0,
        monthlyRevenue: 0,
        pendingMaintenance: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [showAddRoomModal, setShowAddRoomModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchData();
    }, []);

    // SSE real-time updates
    useEffect(() => {
        const unsub = sseClient.onUpdate((ev) => {
            if (ev && ev.resource === 'hostel') {
                console.log('🔄 Hostel SSE Update:', ev.action);
                fetchData();
            }
        });
        return unsub;
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [roomsData, maintenanceData] = await Promise.all([
                apiGet('/api/hostel'),
                apiGet('/api/hostel/maintenance')
            ]);
            const roomsList = roomsData || [];
            const maintenanceList = maintenanceData || [];
            
            setRooms(roomsList);
            setMaintenanceRequests(maintenanceList);
            
            // Calculate stats
            const occupied = roomsList.filter(r => r.status === 'Occupied').length;
            const available = roomsList.filter(r => r.status === 'Available').length;
            const totalRevenue = roomsList.reduce((sum, r) => sum + (r.monthlyFee * (r.occupants?.length || 0)), 0);
            
            setStats({
                totalRooms: roomsList.length,
                occupied,
                available,
                occupancyRate: roomsList.length ? Math.round((occupied / roomsList.length) * 100) : 0,
                monthlyRevenue: totalRevenue,
                pendingMaintenance: maintenanceList.filter(m => m.status === 'Pending').length
            });
        } catch (error) {
            console.error('Failed to fetch hostel data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter rooms based on search and status
    const filteredRooms = rooms.filter(room => {
        const matchesSearch = room.roomNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            room.blockName?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || room.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const statsCards = [
        { icon: FaBuilding, label: 'Total Rooms', value: stats.totalRooms, color: '#0ea5e9', bg: '#f0f9ff' },
        { icon: FaBed, label: 'Occupied', value: stats.occupied, color: '#10b981', bg: '#dcfce7' },
        { icon: FaUserFriends, label: 'Available', value: stats.available, color: '#f59e0b', bg: '#fef3c7' },
        { icon: FaChartLine, label: 'Occupancy Rate', value: `${stats.occupancyRate}%`, color: '#8b5cf6', bg: '#ede9fe' },
        { icon: FaMoneyBillWave, label: 'Monthly Revenue', value: `₹${stats.monthlyRevenue.toLocaleString()}`, color: '#059669', bg: '#d1fae5' },
        { icon: FaWrench, label: 'Pending Maintenance', value: stats.pendingMaintenance, color: '#ef4444', bg: '#fee2e2' }
    ];

    const handleDeleteRoom = async (roomId) => {
        if (!window.confirm('Are you sure you want to delete this room?')) return;
        try {
            await apiDelete(`/api/hostel/${roomId}`);
            fetchData();
        } catch (error) {
            alert('Failed to delete room: ' + error.message);
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <header className="admin-page-header" style={{ marginBottom: '2rem' }}>
                <div className="admin-page-title">
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--admin-secondary)' }}>
                        HOSTEL <span style={{ color: 'var(--admin-primary)' }}>MANAGEMENT</span>
                    </h1>
                    <p style={{ color: '#64748b', fontWeight: 700 }}>{stats.totalRooms} TOTAL ROOMS TRACKED</p>
                </div>
                <button className="admin-btn admin-btn-primary" style={{ height: '48px', borderRadius: '16px' }} onClick={() => setShowAddRoomModal(true)}>
                    <FaPlus /> ADD NEW ROOM
                </button>
            </header>

            {/* Stats Cards */}
            <div className="admin-grid-4" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
                {statsCards.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        className="admin-card"
                        whileHover={{ y: -5 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid #f1f5f9' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ 
                                width: '52px', height: '52px', 
                                background: stat.bg, 
                                color: stat.color, 
                                borderRadius: '14px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                fontSize: '1.3rem' 
                            }}>
                                <stat.icon />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {stat.label}
                                </div>
                                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1e293b' }}>
                                    {stat.value}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Tabs & Search */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['overview', 'maintenance', 'amenities'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className="admin-btn"
                            style={{ 
                                textTransform: 'capitalize',
                                background: activeTab === tab ? 'var(--admin-primary)' : '#f1f5f9',
                                color: activeTab === tab ? 'white' : '#64748b'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <FaSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.9rem' }} />
                        <input
                            type="text"
                            placeholder="Search rooms..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                padding: '12px 16px 12px 42px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                fontSize: '0.9rem',
                                outline: 'none',
                                width: '250px'
                            }}
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{
                            padding: '12px 16px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            fontSize: '0.9rem',
                            outline: 'none',
                            background: 'white'
                        }}
                    >
                        <option value="all">All Status</option>
                        <option value="Available">Available</option>
                        <option value="Occupied">Occupied</option>
                        <option value="Maintenance">Maintenance</option>
                    </select>
                </div>
            </div>

            {/* Rooms Grid */}
            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div 
                        className="admin-grid-3" 
                        style={{ gap: '1.5rem' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {filteredRooms.map((room, index) => (
                            <motion.div
                                key={room._id}
                                className="admin-card"
                                whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                style={{ 
                                    padding: '1.5rem', 
                                    borderRadius: '20px', 
                                    border: '1px solid #f1f5f9',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Status Badge */}
                                <div style={{ 
                                    position: 'absolute', 
                                    top: '1rem', 
                                    right: '1rem',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '0.65rem',
                                    fontWeight: 900,
                                    background: room.status === 'Available' ? '#dcfce7' : '#fee2e2',
                                    color: room.status === 'Available' ? '#10b981' : '#ef4444',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    {room.status}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                    <div style={{ 
                                        width: '48px', height: '48px', 
                                        background: 'linear-gradient(135deg, #f0f9ff 0%, #bae6fd 100%)', 
                                        color: '#0ea5e9', 
                                        borderRadius: '12px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        fontSize: '1.2rem' 
                                    }}>
                                        <FaBuilding />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#1e293b' }}>
                                            Room {room.roomNumber}
                                        </h3>
                                        <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
                                            {room.blockName} Block • {room.type}
                                        </p>
                                    </div>
                                </div>

                                {/* Amenities */}
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                    {room.amenities?.includes('wifi') && (
                                        <span style={{ padding: '4px 8px', background: '#f0f9ff', color: '#0ea5e9', borderRadius: '6px', fontSize: '0.7rem' }}><FaWifi /></span>
                                    )}
                                    {room.amenities?.includes('ac') && (
                                        <span style={{ padding: '4px 8px', background: '#fef3c7', color: '#d97706', borderRadius: '6px', fontSize: '0.7rem' }}><FaBolt /></span>
                                    )}
                                    {room.amenities?.includes('mess') && (
                                        <span style={{ padding: '4px 8px', background: '#f0fdf4', color: '#10b981', borderRadius: '6px', fontSize: '0.7rem' }}><FaUtensils /></span>
                                    )}
                                </div>

                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: '1fr 1fr', 
                                    gap: '0.75rem',
                                    padding: '1rem',
                                    background: '#f8fafc',
                                    borderRadius: '12px',
                                    marginBottom: '1rem'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Occupancy</div>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>{room.occupants?.length || 0} / {room.capacity}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Monthly Fee</div>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>₹{room.monthlyFee}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="admin-btn admin-btn-outline" style={{ flex: 1, fontSize: '0.75rem', height: '36px' }}>VIEW DETAILS</button>
                                    <button className="admin-btn admin-btn-primary" style={{ flex: 1, fontSize: '0.75rem', height: '36px' }}>
                                        <FaUserFriends /> OCCUPANTS
                                    </button>
                                    <button 
                                        className="admin-btn admin-btn-danger" 
                                        style={{ width: '36px', height: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        onClick={() => handleDeleteRoom(room._id)}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                        {filteredRooms.length === 0 && !isLoading && (
                            <motion.div 
                                className="admin-card" 
                                style={{ gridColumn: '1/-1', padding: '4rem', textAlign: 'center', borderRadius: '20px', border: '2px dashed #e2e8f0', background: 'transparent' }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem' }}><FaBed /></div>
                                <h3 style={{ color: '#64748b', fontWeight: 900 }}>NO ROOMS FOUND</h3>
                                <p style={{ color: '#94a3b8', fontWeight: 700 }}>Add new rooms or adjust your search filters.</p>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'maintenance' && (
                    <motion.div 
                        className="admin-grid-2" 
                        style={{ gap: '1.5rem' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {maintenanceRequests.map((request, index) => (
                            <motion.div
                                key={request._id}
                                className="admin-card"
                                whileHover={{ y: -5 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid #f1f5f9' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ 
                                            width: '48px', height: '48px', 
                                            background: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)', 
                                            color: '#dc2626', 
                                            borderRadius: '12px', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            fontSize: '1.2rem' 
                                        }}>
                                            <FaTools />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900 }}>{request.issue}</h3>
                                            <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '0.75rem' }}>Room {request.roomNumber}</p>
                                        </div>
                                    </div>
                                    <span style={{ 
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.65rem',
                                        fontWeight: 900,
                                        background: request.status === 'Pending' ? '#fef3c7' : '#dcfce7',
                                        color: request.status === 'Pending' ? '#d97706' : '#10b981'
                                    }}>
                                        {request.status}
                                    </span>
                                </div>
                                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Reported By</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{request.reportedBy}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Date</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{new Date(request.date).toLocaleDateString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Priority</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: request.priority === 'High' ? '#dc2626' : '#64748b' }}>{request.priority}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {maintenanceRequests.length === 0 && (
                            <div className="admin-card" style={{ gridColumn: '1/-1', padding: '4rem', textAlign: 'center' }}>
                                <FaTools style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem' }} />
                                <h3 style={{ color: '#64748b' }}>NO MAINTENANCE REQUESTS</h3>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'amenities' && (
                    <motion.div 
                        className="admin-grid-4" 
                        style={{ gap: '1.5rem' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {[
                            { icon: FaWifi, name: 'Wi-Fi', count: rooms.filter(r => r.amenities?.includes('wifi')).length, color: '#0ea5e9', bg: '#f0f9ff' },
                            { icon: FaBolt, name: 'AC Rooms', count: rooms.filter(r => r.amenities?.includes('ac')).length, color: '#f59e0b', bg: '#fef3c7' },
                            { icon: FaUtensils, name: 'Mess', count: rooms.filter(r => r.amenities?.includes('mess')).length, color: '#10b981', bg: '#f0fdf4' },
                            { icon: FaShieldAlt, name: 'Security', count: rooms.filter(r => r.amenities?.includes('security')).length, color: '#8b5cf6', bg: '#ede9fe' },
                            { icon: FaTint, name: 'Hot Water', count: rooms.filter(r => r.amenities?.includes('hotwater')).length, color: '#ec4899', bg: '#fce7f3' },
                        ].map((amenity, index) => (
                            <motion.div
                                key={amenity.name}
                                className="admin-card"
                                whileHover={{ y: -5, scale: 1.02 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid #f1f5f9', textAlign: 'center' }}
                            >
                                <div style={{ 
                                    width: '60px', height: '60px', 
                                    background: amenity.bg, 
                                    color: amenity.color, 
                                    borderRadius: '16px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    fontSize: '1.5rem',
                                    margin: '0 auto 1rem'
                                }}>
                                    <amenity.icon />
                                </div>
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900 }}>{amenity.name}</h3>
                                <p style={{ margin: '0.5rem 0 0', color: amenity.color, fontSize: '1.5rem', fontWeight: 900 }}>
                                    {amenity.count} <span style={{ fontSize: '0.75rem', color: '#64748b' }}>rooms</span>
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HostelSection;
