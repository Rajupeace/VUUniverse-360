import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaBus, FaMapMarkerAlt, FaUsers, FaTools, FaPlus, FaRoute, 
    FaClock, FaShieldAlt, FaGasPump, FaWrench, FaChartLine, 
    FaSearch, FaFilter, FaEllipsisV, FaEdit, FaTrash, FaMapMarked
} from 'react-icons/fa';
import { apiGet, apiPost, apiPut, apiDelete } from '../../../utils/apiClient';
import sseClient from '../../../utils/sseClient';

const TransportSection = () => {
    const [routes, setRoutes] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [stats, setStats] = useState({
        totalVehicles: 0,
        activeRoutes: 0,
        totalPassengers: 0,
        onTimePerformance: 0
    });
    const [activeTab, setActiveTab] = useState('routes');
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    // SSE real-time updates
    useEffect(() => {
        const unsub = sseClient.onUpdate((ev) => {
            if (ev && ev.resource === 'transport') {
                console.log('🔄 Transport SSE Update:', ev.action);
                fetchData();
            }
        });
        return unsub;
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [routesData, vehiclesData, driversData] = await Promise.all([
                apiGet('/api/transport/routes'),
                apiGet('/api/transport/vehicles'),
                apiGet('/api/transport/drivers')
            ]);
            const routesList = routesData || [];
            const vehiclesList = vehiclesData || [];
            const driversList = driversData || [];
            
            setRoutes(routesList);
            setVehicles(vehiclesList);
            setDrivers(driversList);
            
            // Calculate stats
            const totalPassengers = routesList.reduce((sum, r) => sum + (r.passengers?.length || 0), 0);
            
            setStats({
                totalVehicles: vehiclesList.length,
                activeRoutes: routesList.filter(r => r.status === 'Active').length,
                totalPassengers,
                onTimePerformance: 94 // Mock value - would come from analytics
            });
        } catch (error) {
            console.error('Failed to fetch transport data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter routes based on search and status
    const filteredRoutes = routes.filter(route => {
        const matchesSearch = route.routeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            route.routeNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            route.driverName?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || route.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const statsCards = [
        { icon: FaBus, label: 'Total Vehicles', value: stats.totalVehicles, color: '#f97316', bg: '#fff7ed' },
        { icon: FaRoute, label: 'Active Routes', value: stats.activeRoutes, color: '#10b981', bg: '#dcfce7' },
        { icon: FaUsers, label: 'Total Passengers', value: stats.totalPassengers.toLocaleString(), color: '#0ea5e9', bg: '#f0f9ff' },
        { icon: FaClock, label: 'On-Time %', value: `${stats.onTimePerformance}%`, color: '#8b5cf6', bg: '#ede9fe' }
    ];

    const handleDeleteRoute = async (routeId) => {
        if (!window.confirm('Are you sure you want to delete this route?')) return;
        try {
            await apiDelete(`/api/transport/routes/${routeId}`);
            fetchData();
        } catch (error) {
            alert('Failed to delete route: ' + error.message);
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <header className="admin-page-header" style={{ marginBottom: '2rem' }}>
                <div className="admin-page-title">
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--admin-secondary)' }}>
                        FLEET <span style={{ color: 'var(--admin-primary)' }}>OPERATIONS</span>
                    </h1>
                    <p style={{ color: '#64748b', fontWeight: 700 }}>MANAGE TRANSPORT LOGISTICS</p>
                </div>
                <button className="admin-btn admin-btn-primary" style={{ height: '48px', borderRadius: '16px' }} onClick={() => setShowAddModal(true)}>
                    <FaPlus /> REGISTER VEHICLE
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
                    {['routes', 'vehicles', 'drivers'].map(tab => (
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
                            placeholder={`Search ${activeTab}...`}
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
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Maintenance">Maintenance</option>
                    </select>
                </div>
            </div>

            {/* Routes Grid */}
            <AnimatePresence mode="wait">
                {activeTab === 'routes' && (
                    <motion.div 
                        className="admin-grid-3" 
                        style={{ gap: '1.5rem' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {filteredRoutes.map((route, index) => (
                            <motion.div
                                key={route._id}
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
                                    background: route.status === 'Active' ? '#dcfce7' : '#fee2e2',
                                    color: route.status === 'Active' ? '#10b981' : '#ef4444',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    {route.status}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                    <div style={{ 
                                        width: '48px', height: '48px', 
                                        background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)', 
                                        color: '#f97316', 
                                        borderRadius: '12px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        fontSize: '1.2rem' 
                                    }}>
                                        <FaBus />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#1e293b' }}>
                                            Route {route.routeNumber}
                                        </h3>
                                        <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
                                            {route.routeName}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                    {route.stops?.slice(0, 3).map((stop, i) => (
                                        <span key={i} style={{ 
                                            padding: '4px 10px', 
                                            background: '#f1f5f9', 
                                            color: '#475569', 
                                            borderRadius: '6px', 
                                            fontSize: '0.7rem', 
                                            fontWeight: 700 
                                        }}>
                                            {stop}
                                        </span>
                                    ))}
                                    {route.stops?.length > 3 && (
                                        <span style={{ 
                                            padding: '4px 10px', 
                                            background: '#e2e8f0', 
                                            color: '#64748b', 
                                            borderRadius: '6px', 
                                            fontSize: '0.7rem', 
                                            fontWeight: 700 
                                        }}>
                                            +{route.stops.length - 3}
                                        </span>
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
                                        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Driver</div>
                                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b' }}>{route.driverName || 'Unassigned'}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Capacity</div>
                                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b' }}>
                                            {route.passengers?.length || 0} / {route.capacity}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="admin-btn admin-btn-outline" style={{ flex: 1, fontSize: '0.75rem', height: '36px' }}>
                                        <FaTools /> MAINTENANCE
                                    </button>
                                    <button className="admin-btn admin-btn-primary" style={{ flex: 1, fontSize: '0.75rem', height: '36px' }}>
                                        <FaUsers /> PASSENGERS
                                    </button>
                                    <button 
                                        className="admin-btn admin-btn-danger" 
                                        style={{ width: '36px', height: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        onClick={() => handleDeleteRoute(route._id)}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                        {filteredRoutes.length === 0 && !isLoading && (
                            <motion.div 
                                className="admin-card" 
                                style={{ gridColumn: '1/-1', padding: '4rem', textAlign: 'center', borderRadius: '20px', border: '2px dashed #e2e8f0', background: 'transparent' }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem' }}><FaBus /></div>
                                <h3 style={{ color: '#64748b', fontWeight: 900 }}>NO ROUTES FOUND</h3>
                                <p style={{ color: '#94a3b8', fontWeight: 700 }}>Add new routes or adjust your search filters.</p>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'vehicles' && (
                    <motion.div 
                        className="admin-grid-3" 
                        style={{ gap: '1.5rem' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {vehicles.map((vehicle, index) => (
                            <motion.div
                                key={vehicle._id}
                                className="admin-card"
                                whileHover={{ y: -5 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid #f1f5f9' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                    <div style={{ 
                                        width: '48px', height: '48px', 
                                        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
                                        color: '#d97706', 
                                        borderRadius: '12px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        fontSize: '1.2rem' 
                                    }}>
                                        <FaBus />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>{vehicle.vehicleNumber}</h3>
                                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>{vehicle.model}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8' }}>TYPE</div>
                                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{vehicle.type}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8' }}>CAPACITY</div>
                                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{vehicle.capacity} seats</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8' }}>STATUS</div>
                                        <div style={{ 
                                            fontWeight: 700, fontSize: '0.85rem',
                                            color: vehicle.status === 'Active' ? '#10b981' : '#ef4444'
                                        }}>
                                            {vehicle.status}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8' }}>ROUTE</div>
                                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{vehicle.routeNumber || 'None'}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {vehicles.length === 0 && (
                            <div className="admin-card" style={{ gridColumn: '1/-1', padding: '4rem', textAlign: 'center' }}>
                                <FaBus style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem' }} />
                                <h3 style={{ color: '#64748b' }}>NO VEHICLES REGISTERED</h3>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'drivers' && (
                    <motion.div 
                        className="admin-grid-3" 
                        style={{ gap: '1.5rem' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {drivers.map((driver, index) => (
                            <motion.div
                                key={driver._id}
                                className="admin-card"
                                whileHover={{ y: -5 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid #f1f5f9' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                    <div style={{ 
                                        width: '48px', height: '48px', 
                                        background: 'linear-gradient(135deg, #f0f9ff 0%, #bae6fd 100%)', 
                                        color: '#0284c7', 
                                        borderRadius: '50%', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        fontSize: '1.2rem' 
                                    }}>
                                        <FaUsers />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>{driver.name}</h3>
                                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>{driver.licenseNumber}</p>
                                    </div>
                                </div>
                                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Phone</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{driver.phone}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Experience</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{driver.experience} years</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Assigned Route</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{driver.routeNumber || 'None'}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {drivers.length === 0 && (
                            <div className="admin-card" style={{ gridColumn: '1/-1', padding: '4rem', textAlign: 'center' }}>
                                <FaUsers style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem' }} />
                                <h3 style={{ color: '#64748b' }}>NO DRIVERS REGISTERED</h3>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TransportSection;
