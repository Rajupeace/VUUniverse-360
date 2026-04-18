import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaCalendarAlt, FaPlus, FaEdit, FaTrash, FaMapMarkerAlt,
    FaClock, FaSearch, FaFilter, FaSignOutAlt, FaBars, FaTimes, FaCheck,
    FaList, FaThLarge, FaChevronLeft, FaChevronRight, FaBell, FaFileDownload,
    FaBolt, FaUsers, FaChartPie, FaEye, FaSync, FaRobot
} from 'react-icons/fa';
import VuAiAgent from '../VuAiAgent/VuAiAgent';
import { apiGet, apiPost, apiPut, apiDelete } from '../../utils/apiClient';
import './EventsManagerDashboard.css';

const EventsManagerDashboard = ({ managerData, onLogout, isEmbedded }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [viewMode, setViewMode] = useState('list');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
    const [draggedEvent, setDraggedEvent] = useState(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [stats, setStats] = useState({ total: 0, upcoming: 0, academic: 0, cultural: 0 });
    const [refreshing, setRefreshing] = useState(false);

    const [formData, setFormData] = useState({
        id: null,
        title: '',
        date: '',
        time: '',
        location: '',
        type: 'academic',
        description: '',
        branch: '',
        year: '',
        section: ''
    });

    // Fetch events from database
    const fetchEvents = useCallback(async () => {
        try {
            setLoading(true);
            const data = await apiGet('/api/events');
            const eventsArray = Array.isArray(data) ? data : [];
            setEvents(eventsArray);

            // Calculate stats
            const now = new Date();
            const upcoming = eventsArray.filter(e => new Date(e.date) >= now);
            const academic = eventsArray.filter(e => e.type === 'academic');
            const cultural = eventsArray.filter(e => e.type === 'cultural');

            setStats({
                total: eventsArray.length,
                upcoming: upcoming.length,
                academic: academic.length,
                cultural: cultural.length
            });

            // Set upcoming events for notifications
            const nextWeek = new Date();
            nextWeek.setDate(now.getDate() + 7);
            const nextWeekEvents = eventsArray.filter(e => {
                const d = new Date(e.date);
                return d >= now && d <= nextWeek;
            });
            setUpcomingEvents(nextWeekEvents);
        } catch (error) {
            console.error('Failed to fetch events:', error);
            // Set empty state on error
            setEvents([]);
            setStats({ total: 0, upcoming: 0, academic: 0, cultural: 0 });
            setUpcomingEvents([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // Refresh data
    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchEvents();
        setRefreshing(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) {
                await apiPut(`/api/events/${formData.id}`, formData);
            } else {
                await apiPost('/api/events', formData);
            }
            setShowModal(false);
            fetchEvents();
        } catch (error) {
            console.error('Save failed', error);
            alert('Failed to save event');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;
        try {
            await apiDelete(`/api/events/${id}`);
            fetchEvents();
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    const openModal = (eventOrDate = null) => {
        if (eventOrDate && (eventOrDate._id || eventOrDate.id)) {
            const event = eventOrDate;
            setFormData({
                id: event._id || event.id,
                title: event.title,
                date: event.date ? event.date.split('T')[0] : '',
                location: event.location || '',
                type: event.type || 'Academic',
                description: event.description || ''
            });
        } else if (eventOrDate && eventOrDate.date) {
            setFormData({
                id: null,
                title: '',
                date: eventOrDate.date,
                location: '',
                type: 'Academic',
                description: ''
            });
        } else {
            setFormData({
                id: null,
                title: '',
                date: new Date().toISOString().split('T')[0],
                location: '',
                type: 'Academic',
                description: ''
            });
        }
        setShowModal(true);
    };

    const filteredEvents = events.filter(ev => {
        const matchesSearch = ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (ev.description && ev.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesFilter = filterType === 'All' || ev.type === filterType;

        let matchesDate = true;
        if (dateFilter.start) {
            matchesDate = matchesDate && new Date(ev.date) >= new Date(dateFilter.start);
        }
        if (dateFilter.end) {
            matchesDate = matchesDate && new Date(ev.date) <= new Date(dateFilter.end);
        }
        return matchesSearch && matchesFilter && matchesDate;
    });

    const handleDragStart = (e, event) => {
        setDraggedEvent(event);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", event._id || event.id);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = async (e, targetDateStr) => {
        e.preventDefault();
        if (!draggedEvent) return;

        const originalDate = draggedEvent.date.split('T')[0];
        if (originalDate === targetDateStr) {
            setDraggedEvent(null);
            return;
        }

        if (window.confirm(`Move "${draggedEvent.title}" to ${targetDateStr}?`)) {
            try {
                const updatedEvent = { ...draggedEvent, date: targetDateStr };
                // Optimistic update
                setEvents(prev => prev.map(ev =>
                    (ev._id === draggedEvent._id || ev.id === draggedEvent.id) ? updatedEvent : ev
                ));
                await apiPut(`/api/events/${draggedEvent._id || draggedEvent.id}`, updatedEvent);
            } catch (error) {
                console.error("Failed to move event", error);
                alert("Failed to move event");
                fetchEvents(); // Revert on error
            }
        }
        setDraggedEvent(null);
    };

    const exportToCSV = () => {
        const headers = ["Title", "Date", "Location", "Type", "Description"];
        const csvContent = [
            headers.join(","),
            ...events.map(e => [
                `"${e.title}"`,
                `"${e.date ? e.date.split('T')[0] : ''}"`,
                `"${e.location || ''}"`,
                `"${e.type || ''}"`,
                `"${(e.description || '').replace(/"/g, '""')}"`
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `events_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const renderCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        const monthName = currentMonth.toLocaleString('default', { month: 'long' });

        const blanks = Array(firstDay).fill(null);
        const daysArray = Array.from({ length: days }, (_, i) => i + 1);
        const allDays = [...blanks, ...daysArray];

        return (
            <div className="ed-calendar-view">
                <div className="ed-calendar-controls">
                    <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}><FaChevronLeft /></button>
                    <h2>{monthName} {year}</h2>
                    <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}><FaChevronRight /></button>
                </div>
                <div className="ed-calendar-grid-header">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="ed-calendar-grid">
                    {allDays.map((day, index) => {
                        if (!day) return <div key={index} className="ed-calendar-cell empty"></div>;
                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const dayEvents = events.filter(e => e.date && e.date.startsWith(dateStr));
                        return (
                            <div
                                key={index}
                                className={`ed-calendar-cell ${draggedEvent ? 'drag-target' : ''}`}
                                onClick={() => openModal({ date: dateStr })}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, dateStr)}
                            >
                                <span className="ed-day-number">{day}</span>
                                <div className="ed-day-events">
                                    {dayEvents.map(ev => (
                                        <div
                                            key={ev._id || ev.id}
                                            className={`ed-event-dot ${ev.type?.toLowerCase()}`}
                                            onClick={(e) => { e.stopPropagation(); openModal(ev); }}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, ev)}
                                        >
                                            {ev.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Safe access to manager data
    const managerName = managerData?.name || 'Events Manager';
    const managerInitial = managerName.charAt(0).toUpperCase();
    const managerRole = managerData?.role || 'Coordinator';

    return (
        <div className={`events-dashboard-shell ${sidebarCollapsed ? 'collapsed' : ''} ${isEmbedded ? 'embedded' : ''}`}>
            {!isEmbedded && (
                <aside className="events-sidebar">
                    <div className="sidebar-logo">
                        <div className="logo-icon"><FaCalendarAlt /></div>
                        {!sidebarCollapsed && <span>Vu UniVerse360 Events</span>}
                    </div>

                    <nav className="sidebar-nav">
                        <button className={`nav-item ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
                            <FaList /> {!sidebarCollapsed && <span>Event Registry</span>}
                        </button>
                        <button className={`nav-item ${viewMode === 'ai-agent' ? 'active' : ''}`} onClick={() => setViewMode('ai-agent')}>
                            <FaRobot /> {!sidebarCollapsed && <span>Events Agent</span>}
                        </button>
                    </nav>

                    <div className="sidebar-footer">
                        <div className="manager-badge">
                            <div className="m-avatar">{managerInitial}</div>
                            {!sidebarCollapsed && (
                                <div className="m-info">
                                    <div className="m-name">{managerName}</div>
                                    <div className="m-role">{managerRole}</div>
                                </div>
                            )}
                        </div>
                        <button className="logout-btn" onClick={onLogout}>
                            <FaSignOutAlt /> {!sidebarCollapsed && <span>Logout</span>}
                        </button>
                    </div>
                </aside>
            )}

            <main className="events-main">
                <header className="events-header">
                    <div className="header-left">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '1rem' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></div>
                            <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#10b981', letterSpacing: '1px' }}>CLOUD SYNC LIVE</span>
                        </div>
                        {isEmbedded ? (
                            <div className="embedded-tabs">
                                <button className={`tab-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>Registry</button>
                                <button className={`tab-btn ${viewMode === 'calendar' ? 'active' : ''}`} onClick={() => setViewMode('calendar')}>Calendar</button>
                                <button className={`tab-btn ${viewMode === 'ai-agent' ? 'active' : ''}`} onClick={() => setViewMode('ai-agent')}>Agent</button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <button className="menu-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                                    <FaBars />
                                </button>
                                <div className="header-title">
                                    <h1>Operations Console</h1>
                                    <p><FaBolt /> Live Event Node Active</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="ed-header-actions">
                        <div className="ed-notification-wrapper">
                            <button className="ed-icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
                                <FaBell />
                                {upcomingEvents.length > 0 && <span className="ed-badge">{upcomingEvents.length}</span>}
                            </button>
                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div
                                        className="ed-notifications-dropdown"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                    >
                                        <h3>Upcoming Events (7 Days)</h3>
                                        {upcomingEvents.length > 0 ? (
                                            <ul>
                                                {upcomingEvents.map(ev => (
                                                    <li key={ev._id || ev.id} onClick={() => { openModal(ev); setShowNotifications(false); }}>
                                                        <strong>{ev.title}</strong>
                                                        <span>{new Date(ev.date).toLocaleDateString()}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="no-notifs">No upcoming events this week.</p>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <button className="ed-icon-btn" onClick={exportToCSV} title="Export CSV">
                            <FaFileDownload />
                        </button>
                        <button className="ed-add-btn" onClick={() => openModal()}>
                            <FaPlus /> Create Event
                        </button>
                    </div>
                </header >

                {/* Stats Ribbon */}
                < div className="ed-stats-ribbon" >
                    <div className="ed-stat-card">
                        <div className="stat-icon primary"><FaBolt /></div>
                        <div className="stat-info"><h3>{events.length}</h3><p>Total Events</p></div>
                    </div>
                    <div className="ed-stat-card">
                        <div className="stat-icon accent"><FaUsers /></div>
                        <div className="stat-info"><h3>{upcomingEvents.length}</h3><p>Upcoming</p></div>
                    </div>
                    <div className="ed-stat-card">
                        <div className="stat-icon warning"><FaChartPie /></div>
                        <div className="stat-info"><h3>{events.filter(e => e.type === 'Academic').length}</h3><p>Academic</p></div>
                    </div>
                </div >

                <div className="ed-controls">
                    <div className="ed-search">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="ed-filter">
                        <FaFilter />
                        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                            <option value="All">All Types</option>
                            <option value="Academic">Academic</option>
                            <option value="Cultural">Cultural</option>
                            <option value="Sports">Sports</option>
                            <option value="Workshop">Workshop</option>
                        </select>
                    </div>
                    <div className="ed-date-filter">
                        <input
                            type="date"
                            value={dateFilter.start}
                            onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
                            title="Start Date"
                        />
                        <span style={{ color: '#94a3b8' }}>-</span>
                        <input
                            type="date"
                            value={dateFilter.end}
                            onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
                            title="End Date"
                        />
                    </div>
                    <div className="ed-view-toggle">
                        <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}><FaList /></button>
                        <button className={viewMode === 'calendar' ? 'active' : ''} onClick={() => setViewMode('calendar')}><FaThLarge /></button>
                    </div>
                </div>

                {
                    viewMode === 'ai-agent' ? (
                        <div style={{ padding: 0, height: 'calc(100vh - 150px)' }}>
                            <VuAiAgent onNavigate={setViewMode} documentContext={{ title: "Events Manager", content: "Agent is assisting the events manager with scheduling, tracking, and organizing academic and cultural events.", data: { events } }} />
                        </div>
                    ) : viewMode === 'calendar' ? renderCalendar() : (
                        <div className="ed-grid">
                            {loading ? (
                                <p>Loading events...</p>
                            ) : filteredEvents.length > 0 ? (
                                filteredEvents.map(event => (
                                    <motion.div
                                        key={event._id || event.id}
                                        className="ed-card"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <div className={`ed-card-type ${event.type?.toLowerCase()}`}>{event.type}</div>
                                        <h3>{event.title}</h3>
                                        <div className="ed-card-meta">
                                            <span><FaClock /> {new Date(event.date).toLocaleDateString()}</span>
                                            <span><FaMapMarkerAlt /> {event.location || 'TBD'}</span>
                                        </div>
                                        <p className="ed-card-desc">{event.description}</p>
                                        <div className="ed-card-actions">
                                            <button onClick={() => openModal(event)}><FaEdit /></button>
                                            <button onClick={() => handleDelete(event._id || event.id)} className="delete"><FaTrash /></button>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="ed-empty">
                                    <FaCalendarAlt />
                                    <p>No events found</p>
                                </div>
                            )}
                        </div>
                    )
                }

                <AnimatePresence>
                    {showModal && (
                        <div className="ed-modal-overlay">
                            <motion.div
                                className="ed-modal"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                            >
                                <div className="ed-modal-header">
                                    <h2>{formData.id ? 'Edit Event' : 'New Event'}</h2>
                                    <button onClick={() => setShowModal(false)}><FaTimes /></button>
                                </div>
                                <form onSubmit={handleSave}>
                                    <div className="ed-form-group">
                                        <label>Event Title</label>
                                        <input
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="ed-form-group">
                                        <label>Date</label>
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="ed-form-group">
                                        <label>Location</label>
                                        <input
                                            value={formData.location}
                                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        />
                                    </div>
                                    <div className="ed-form-group">
                                        <label>Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            <option>Academic</option>
                                            <option>Cultural</option>
                                            <option>Sports</option>
                                            <option>Workshop</option>
                                            <option>Seminar</option>
                                        </select>
                                    </div>
                                    <div className="ed-form-group">
                                        <label>Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="ed-modal-footer">
                                        <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                                        <button type="submit" className="save-btn"><FaCheck /> Save</button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default EventsManagerDashboard;
