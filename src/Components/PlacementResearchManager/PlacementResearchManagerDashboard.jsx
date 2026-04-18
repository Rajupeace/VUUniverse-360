import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaBriefcase, FaBuilding, FaPlus, FaEdit, FaTrash, FaUsers,
    FaCheckCircle, FaClock, FaTimesCircle, FaChartBar, FaSignOutAlt,
    FaSearch, FaTrophy, FaGraduationCap, FaSave, FaTimes, FaSpinner,
    FaBars, FaChevronLeft, FaChevronRight, FaDownload, FaSync, FaEye,
    FaStickyNote, FaFileArchive, FaArrowUp, FaArrowDown, FaFlask,
    FaMicroscope, FaBook, FaLightbulb, FaAward, FaProjectDiagram,
    FaUserGraduate, FaChalkboardTeacher, FaFilter, FaRobot
} from 'react-icons/fa';
import VuAiAgent from '../VuAiAgent/VuAiAgent';
import api from '../../utils/apiClient';
import StudentProfileModal from '../Shared/StudentProfileModal';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import './PlacementResearchManagerDashboard.css';

const STATUS_COLORS = {
    'Live': { bg: '#ecfdf5', text: '#059669', dot: '#10b981' },
    'Upcoming': { bg: '#fffbeb', text: '#d97706', dot: '#f59e0b' },
    'Closed': { bg: '#f8fafc', text: '#64748b', dot: '#94a3b8' }
};

const APP_STATUS_COLORS = {
    'Applied': '#6366f1',
    'Shortlisted': '#f59e0b',
    'Rejected': '#ef4444',
    'Selected': '#10b981',
    'On Hold': '#94a3b8'
};

const BRANCHES = ['All Branches', 'CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AIML'];
const YEARS = ['3', '4'];
const CATEGORIES = ['Top MNCs', 'Product Based', 'Service Based', 'Research', 'Internships'];

const RESEARCH_AREAS = [
    'Artificial Intelligence',
    'Machine Learning',
    'Data Science',
    'Cyber Security',
    'Blockchain',
    'IoT',
    'Cloud Computing',
    'Robotics',
    'Quantum Computing',
    'Biotechnology'
];

export default function PlacementResearchManagerDashboard({ managerData, onLogout }) {
    const [activeTab, setActiveTab] = useState('placements');
    const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
    const [companies, setCompanies] = useState([]);
    const [researchProjects, setResearchProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showResearchModal, setShowResearchModal] = useState(false);
    const [editingCompany, setEditingCompany] = useState(null);
    const [editingProject, setEditingProject] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [driveFilter, setDriveFilter] = useState('All');
    const [appFilter, setAppFilter] = useState('All');
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [bulkStatus, setBulkStatus] = useState('');
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [currentAppNote, setCurrentAppNote] = useState({ studentId: '', name: '', text: '' });

    // Mock data for demonstration
    const mockCompanies = [
        {
            id: 1,
            companyName: 'Google',
            driveType: 'Product Based',
            status: 'Live',
            applyDeadline: '2026-03-15',
            package: '28 LPA',
            requirements: 'CSE, IT, ECE',
            description: 'Leading tech company hiring for SDE roles',
            applications: [
                { studentId: '23VF001', name: 'John Doe', status: 'Applied', appliedDate: '2026-02-20' },
                { studentId: '23VF002', name: 'Jane Smith', status: 'Shortlisted', appliedDate: '2026-02-18' }
            ]
        },
        {
            id: 2,
            companyName: 'Microsoft',
            driveType: 'Product Based',
            status: 'Upcoming',
            applyDeadline: '2026-03-20',
            package: '25 LPA',
            requirements: 'CSE, IT',
            description: 'Software engineering positions',
            applications: []
        }
    ];

    const mockResearchProjects = [
        {
            id: 1,
            title: 'AI-Powered Healthcare Diagnostics',
            facultyLead: 'Dr. Sarah Johnson',
            students: ['John Doe', 'Alice Brown'],
            area: 'Artificial Intelligence',
            status: 'Ongoing',
            funding: '₹5,00,000',
            deadline: '2026-12-31',
            description: 'Developing AI models for medical diagnosis'
        },
        {
            id: 2,
            title: 'Blockchain for Supply Chain',
            facultyLead: 'Prof. Michael Chen',
            students: ['Bob Wilson'],
            area: 'Blockchain',
            status: 'Completed',
            funding: '₹3,00,000',
            deadline: '2026-06-30',
            description: 'Implementing blockchain solutions for supply chain management'
        }
    ];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            // In a real implementation, these would be API calls
            setCompanies(mockCompanies);
            setResearchProjects(mockResearchProjects);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleCompanySubmit = async (formData) => {
        try {
            setSaving(true);
            if (editingCompany) {
                // Update existing company
                setCompanies(companies.map(c =>
                    c.id === editingCompany.id ? { ...c, ...formData } : c
                ));
                showToast('Company updated successfully');
            } else {
                // Add new company
                const newCompany = {
                    ...formData,
                    id: Date.now(),
                    applications: []
                };
                setCompanies([...companies, newCompany]);
                showToast('Company added successfully');
            }
            setShowAddModal(false);
            setEditingCompany(null);
        } catch (error) {
            showToast('Error saving company', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleProjectSubmit = async (formData) => {
        try {
            setSaving(true);
            if (editingProject) {
                // Update existing project
                setResearchProjects(researchProjects.map(p =>
                    p.id === editingProject.id ? { ...p, ...formData } : p
                ));
                showToast('Research project updated successfully');
            } else {
                // Add new project
                const newProject = {
                    ...formData,
                    id: Date.now()
                };
                setResearchProjects([...researchProjects, newProject]);
                showToast('Research project added successfully');
            }
            setShowResearchModal(false);
            setEditingProject(null);
        } catch (error) {
            showToast('Error saving project', 'error');
        } finally {
            setSaving(false);
        }
    };

    const deleteCompany = async (companyId) => {
        if (window.confirm('Are you sure you want to delete this company?')) {
            setCompanies(companies.filter(c => c.id !== companyId));
            showToast('Company deleted successfully');
        }
    };

    const deleteProject = async (projectId) => {
        if (window.confirm('Are you sure you want to delete this research project?')) {
            setResearchProjects(researchProjects.filter(p => p.id !== projectId));
            showToast('Research project deleted successfully');
        }
    };

    const filteredCompanies = companies.filter(company => {
        const matchesSearch = company.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            company.driveType.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDrive = driveFilter === 'All' || company.driveType === driveFilter;
        return matchesSearch && matchesDrive;
    });

    const filteredProjects = researchProjects.filter(project => {
        const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.area.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const renderPlacementsTab = () => (
        <div className="placements-content">
            <div className="content-header">
                <div className="header-left">
                    <h2>Placement Drives</h2>
                    <div className="stats">
                        <div className="stat-item">
                            <span className="stat-number">{companies.filter(c => c.status === 'Live').length}</span>
                            <span className="stat-label">Live Drives</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">{companies.filter(c => c.status === 'Upcoming').length}</span>
                            <span className="stat-label">Upcoming</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">{companies.reduce((total, c) => total + c.applications.length, 0)}</span>
                            <span className="stat-label">Total Applications</span>
                        </div>
                    </div>
                </div>
                <div className="header-right">
                    <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                        <FaPlus /> Add Company
                    </button>
                </div>
            </div>

            <div className="filters-section">
                <div className="search-box">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Search companies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select value={driveFilter} onChange={(e) => setDriveFilter(e.target.value)}>
                    {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            <div className="companies-grid">
                {filteredCompanies.map(company => (
                    <motion.div
                        key={company.id}
                        className="company-card"
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedCompany(company)}
                    >
                        <div className="company-header">
                            <div className="company-info">
                                <h3>{company.companyName}</h3>
                                <span className="drive-type">{company.driveType}</span>
                            </div>
                            <div className={`status-badge ${company.status.toLowerCase()}`}>
                                <div className="status-dot" style={{ backgroundColor: STATUS_COLORS[company.status]?.dot }}></div>
                                {company.status}
                            </div>
                        </div>

                        <div className="company-details">
                            <div className="detail-item">
                                <FaTrophy />
                                <span>{company.package}</span>
                            </div>
                            <div className="detail-item">
                                <FaUsers />
                                <span>{company.applications.length} applicants</span>
                            </div>
                            <div className="detail-item">
                                <FaClock />
                                <span>{company.applyDeadline}</span>
                            </div>
                        </div>

                        <div className="company-actions">
                            <button className="btn-icon" onClick={(e) => { e.stopPropagation(); setEditingCompany(company); setShowAddModal(true); }}>
                                <FaEdit />
                            </button>
                            <button className="btn-icon danger" onClick={(e) => { e.stopPropagation(); deleteCompany(company.id); }}>
                                <FaTrash />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );

    const renderResearchTab = () => (
        <div className="research-content">
            <div className="content-header">
                <div className="header-left">
                    <h2>Research Projects</h2>
                    <div className="stats">
                        <div className="stat-item">
                            <span className="stat-number">{researchProjects.filter(p => p.status === 'Ongoing').length}</span>
                            <span className="stat-label">Ongoing</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">{researchProjects.filter(p => p.status === 'Completed').length}</span>
                            <span className="stat-label">Completed</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">₹{researchProjects.reduce((total, p) => total + parseInt(p.funding.replace(/[^\d]/g, '')), 0).toLocaleString()}</span>
                            <span className="stat-label">Total Funding</span>
                        </div>
                    </div>
                </div>
                <div className="header-right">
                    <button className="btn-primary" onClick={() => setShowResearchModal(true)}>
                        <FaPlus /> Add Project
                    </button>
                </div>
            </div>

            <div className="filters-section">
                <div className="search-box">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select value={driveFilter} onChange={(e) => setDriveFilter(e.target.value)}>
                    <option value="All">All Areas</option>
                    {RESEARCH_AREAS.map(area => (
                        <option key={area} value={area}>{area}</option>
                    ))}
                </select>
            </div>

            <div className="projects-grid">
                {filteredProjects.map(project => (
                    <motion.div
                        key={project.id}
                        className="project-card"
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedProject(project)}
                    >
                        <div className="project-header">
                            <div className="project-info">
                                <h3>{project.title}</h3>
                                <span className="research-area">{project.area}</span>
                            </div>
                            <div className={`status-badge ${project.status.toLowerCase()}`}>
                                {project.status}
                            </div>
                        </div>

                        <div className="project-details">
                            <div className="detail-item">
                                <FaChalkboardTeacher />
                                <span>{project.facultyLead}</span>
                            </div>
                            <div className="detail-item">
                                <FaUsers />
                                <span>{project.students.length} students</span>
                            </div>
                            <div className="detail-item">
                                <FaTrophy />
                                <span>{project.funding}</span>
                            </div>
                        </div>

                        <div className="project-actions">
                            <button className="btn-icon" onClick={(e) => { e.stopPropagation(); setEditingProject(project); setShowResearchModal(true); }}>
                                <FaEdit />
                            </button>
                            <button className="btn-icon danger" onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}>
                                <FaTrash />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );

    const renderAnalyticsTab = () => (
        <div className="analytics-content">
            <h2>Placement & Research Analytics</h2>
            <div className="analytics-grid">
                <div className="analytics-card">
                    <h3>Placement Statistics</h3>
                    <div className="stats-grid">
                        <div className="stat">
                            <span className="value">{companies.length}</span>
                            <span className="label">Total Companies</span>
                        </div>
                        <div className="stat">
                            <span className="value">{companies.reduce((total, c) => total + c.applications.length, 0)}</span>
                            <span className="label">Applications</span>
                        </div>
                        <div className="stat">
                            <span className="value">{companies.filter(c => c.applications.some(a => a.status === 'Selected')).length}</span>
                            <span className="label">Selections</span>
                        </div>
                    </div>
                </div>

                <div className="analytics-card">
                    <h3>Research Statistics</h3>
                    <div className="stats-grid">
                        <div className="stat">
                            <span className="value">{researchProjects.length}</span>
                            <span className="label">Total Projects</span>
                        </div>
                        <div className="stat">
                            <span className="value">{researchProjects.filter(p => p.status === 'Ongoing').length}</span>
                            <span className="label">Ongoing</span>
                        </div>
                        <div className="stat">
                            <span className="value">₹{researchProjects.reduce((total, p) => total + parseInt(p.funding.replace(/[^\d]/g, '')), 0).toLocaleString()}</span>
                            <span className="label">Funding</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="loading-container">
                <FaSpinner className="spinning" />
                <p>Loading Placement & Research Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="placement-research-dashboard">
            <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h2>Placement & Research</h2>
                    <button
                        className="sidebar-toggle"
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                    >
                        <FaBars />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <button
                        className={`nav-item ${activeTab === 'placements' ? 'active' : ''}`}
                        onClick={() => setActiveTab('placements')}
                    >
                        <FaBriefcase />
                        <span>Placements</span>
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'research' ? 'active' : ''}`}
                        onClick={() => setActiveTab('research')}
                    >
                        <FaFlask />
                        <span>Research</span>
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
                        onClick={() => setActiveTab('analytics')}
                    >
                        <FaChartBar />
                        <span>Analytics</span>
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'ai-agent' ? 'active' : ''}`}
                        onClick={() => setActiveTab('ai-agent')}
                    >
                        <FaRobot />
                        <span>AI Agent</span>
                    </button>
                    <button
                        className="nav-item"
                        onClick={() => window.location.href = '/schedule-manager'}
                        style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}
                    >
                        <FaClock />
                        <span>Schedule Hub</span>
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <div className="manager-info">
                        <p style={{ margin: 0, fontWeight: 800 }}>{managerData?.name || 'Manager'}</p>
                        <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Placement & Research</span>
                        <div style={{
                            marginTop: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.65rem',
                            color: '#10b981',
                            fontWeight: 900,
                            background: 'rgba(16, 185, 129, 0.1)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            width: 'fit-content'
                        }}>
                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#10b981' }}></div>
                            ADMIN ASSIGNED
                        </div>
                    </div>
                    <button className="logout-btn" onClick={onLogout}>
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </div>

            <div className="main-content">
                <div className="content-wrapper">
                    {activeTab === 'placements' && renderPlacementsTab()}
                    {activeTab === 'research' && renderResearchTab()}
                    {activeTab === 'analytics' && renderAnalyticsTab()}
                    {activeTab === 'ai-agent' && (
                        <div style={{ padding: 0, height: 'calc(100vh - 80px)' }}>
                            <VuAiAgent onNavigate={setActiveTab} documentContext={{ title: "Placement & Research Hub", content: "Agent is assisting the manager with both placement drives and research projects.", data: { companies, researchProjects } }} />
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="modal-content" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
                            <div className="modal-header">
                                <h3>{editingCompany ? 'Edit Company' : 'Add New Company'}</h3>
                                <button onClick={() => { setShowAddModal(false); setEditingCompany(null); }}>×</button>
                            </div>
                            <CompanyForm
                                company={editingCompany}
                                onSubmit={handleCompanySubmit}
                                onCancel={() => { setShowAddModal(false); setEditingCompany(null); }}
                                saving={saving}
                            />
                        </motion.div>
                    </motion.div>
                )}

                {showResearchModal && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="modal-content" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
                            <div className="modal-header">
                                <h3>{editingProject ? 'Edit Research Project' : 'Add New Research Project'}</h3>
                                <button onClick={() => { setShowResearchModal(false); setEditingProject(null); }}>×</button>
                            </div>
                            <ResearchProjectForm
                                project={editingProject}
                                onSubmit={handleProjectSubmit}
                                onCancel={() => { setShowResearchModal(false); setEditingProject(null); }}
                                saving={saving}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toast Notifications */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        className={`toast toast-${toast.type}`}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                    >
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Company Form Component
const CompanyForm = ({ company, onSubmit, onCancel, saving }) => {
    const [formData, setFormData] = useState({
        companyName: company?.companyName || '',
        driveType: company?.driveType || 'Product Based',
        status: company?.status || 'Upcoming',
        applyDeadline: company?.applyDeadline || '',
        package: company?.package || '',
        requirements: company?.requirements || '',
        description: company?.description || ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="company-form">
            <div className="form-grid">
                <div className="form-group">
                    <label>Company Name *</label>
                    <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Drive Type</label>
                    <select
                        value={formData.driveType}
                        onChange={(e) => setFormData({ ...formData, driveType: e.target.value })}
                    >
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Status</label>
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                        <option value="Upcoming">Upcoming</option>
                        <option value="Live">Live</option>
                        <option value="Closed">Closed</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Application Deadline</label>
                    <input
                        type="date"
                        value={formData.applyDeadline}
                        onChange={(e) => setFormData({ ...formData, applyDeadline: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>Package</label>
                    <input
                        type="text"
                        value={formData.package}
                        onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                        placeholder="e.g. 12 LPA"
                    />
                </div>
                <div className="form-group">
                    <label>Requirements</label>
                    <input
                        type="text"
                        value={formData.requirements}
                        onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                        placeholder="e.g. CSE, ECE, GPA > 7.0"
                    />
                </div>
            </div>
            <div className="form-group">
                <label>Description</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Company description and job details..."
                />
            </div>
            <div className="form-actions">
                <button type="button" onClick={onCancel} disabled={saving}>Cancel</button>
                <button type="submit" disabled={saving}>
                    {saving ? <FaSpinner className="spinning" /> : <FaSave />}
                    {saving ? 'Saving...' : 'Save Company'}
                </button>
            </div>
        </form>
    );
};

// Research Project Form Component
const ResearchProjectForm = ({ project, onSubmit, onCancel, saving }) => {
    const [formData, setFormData] = useState({
        title: project?.title || '',
        facultyLead: project?.facultyLead || '',
        students: project?.students || [],
        area: project?.area || 'Artificial Intelligence',
        status: project?.status || 'Ongoing',
        funding: project?.funding || '',
        deadline: project?.deadline || '',
        description: project?.description || ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleStudentsChange = (e) => {
        const students = e.target.value.split(',').map(s => s.trim()).filter(s => s);
        setFormData({ ...formData, students });
    };

    return (
        <form onSubmit={handleSubmit} className="research-form">
            <div className="form-grid">
                <div className="form-group">
                    <label>Project Title *</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Faculty Lead *</label>
                    <input
                        type="text"
                        value={formData.facultyLead}
                        onChange={(e) => setFormData({ ...formData, facultyLead: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Research Area</label>
                    <select
                        value={formData.area}
                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    >
                        {RESEARCH_AREAS.map(area => (
                            <option key={area} value={area}>{area}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Status</label>
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                        <option value="Planning">Planning</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Completed">Completed</option>
                        <option value="On Hold">On Hold</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Funding</label>
                    <input
                        type="text"
                        value={formData.funding}
                        onChange={(e) => setFormData({ ...formData, funding: e.target.value })}
                        placeholder="e.g. ₹5,00,000"
                    />
                </div>
                <div className="form-group">
                    <label>Deadline</label>
                    <input
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    />
                </div>
            </div>
            <div className="form-group">
                <label>Student Researchers</label>
                <input
                    type="text"
                    value={formData.students.join(', ')}
                    onChange={handleStudentsChange}
                    placeholder="Enter student names separated by commas"
                />
            </div>
            <div className="form-group">
                <label>Description</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Project description and objectives..."
                />
            </div>
            <div className="form-actions">
                <button type="button" onClick={onCancel} disabled={saving}>Cancel</button>
                <button type="submit" disabled={saving}>
                    {saving ? <FaSpinner className="spinning" /> : <FaSave />}
                    {saving ? 'Saving...' : 'Save Project'}
                </button>
            </div>
        </form>
    );
};
