import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaChevronRight, FaUserGraduate, FaUsers, FaLayerGroup, FaCodeBranch, FaTimes, FaSearch, FaDownload, FaTrash, FaChevronLeft, FaEdit, FaSave } from 'react-icons/fa';
import sseClient from '../../utils/sseClient';
import './StudentDistribution.css';

const StudentDistribution = () => {
    const [distribution, setDistribution] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedYear, setExpandedYear] = useState(null);
    const [expandedSection, setExpandedSection] = useState(null);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState([]);
    const [attendanceFilter, setAttendanceFilter] = useState('all');
    const [editingStudent, setEditingStudent] = useState(null);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchDistribution();

        // Subscribe to real-time updates for students
        const unsub = sseClient.onUpdate((data) => {
            if (data && (data.resource === 'students' || data.resource === 'studentData')) {
                fetchDistribution();
            }
        });
        return () => unsub();
    }, []);

    const fetchDistribution = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5001/api/admin/student-distribution', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Robust sorting for years (handles "1", "Year 1", etc.)
            const sortedData = (response.data.distribution || []).sort((a, b) => {
                const yearA = parseInt(a._id) || 0;
                const yearB = parseInt(b._id) || 0;
                return yearA - yearB || String(a._id).localeCompare(String(b._id));
            });
            setDistribution(sortedData);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching distribution:', err);
            setError('Failed to load student distribution data.');
            setLoading(false);
        }
    };

    const toggleYear = (year) => {
        setExpandedYear(expandedYear === year ? null : year);
        setExpandedSection(null); // Reset section when changing year
    };

    const toggleSection = (e, sectionKey) => {
        e.stopPropagation();
        setExpandedSection(expandedSection === sectionKey ? null : sectionKey);
    };

    const handleBranchClick = (branchData, year, section) => {
        console.log('Opening branch:', branchData);
        setSelectedBranch({ ...branchData, year, section });
        setSearchTerm('');
        setCurrentPage(1);
        setSelectedIds([]);
        setAttendanceFilter('all');
    };

    const handleExportCSV = () => {
        if (!selectedBranch || !selectedBranch.students) return;

        const filtered = selectedBranch.students.filter(s =>
            (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.sid || '').toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filtered.length === 0) {
            alert('No students to export');
            return;
        }

        const headers = ['Student ID', 'Name', 'Email', 'Phone'];
        const csvContent = [
            headers.join(','),
            ...filtered.map(s => [
                s.sid,
                `"${(s.name || '').replace(/"/g, '""')}"`,
                s.email || '',
                s.phone || ''
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${selectedBranch.year}_${selectedBranch.branch}_${selectedBranch.section}_Students.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- Pagination & Selection Logic ---
    const getFilteredStudents = () => {
        if (!selectedBranch || !selectedBranch.students) return [];

        let filtered = selectedBranch.students.filter(s =>
            (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.sid || '').toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (attendanceFilter !== 'all') {
            filtered = filtered.filter(s => {
                const att = s.attendance || 0;
                if (attendanceFilter === 'low') return att < 60;
                if (attendanceFilter === 'mid') return att >= 60 && att < 75;
                if (attendanceFilter === 'high') return att >= 75;
                return true;
            });
        }
        return filtered;
    };

    const filteredStudents = getFilteredStudents();
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const paginatedStudents = filteredStudents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            // Select all currently filtered students
            setSelectedIds(filteredStudents.map(s => s.sid));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectStudent = (sid) => {
        if (selectedIds.includes(sid)) {
            setSelectedIds(selectedIds.filter(id => id !== sid));
        } else {
            setSelectedIds([...selectedIds, sid]);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} students? This action cannot be undone.`)) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5001/api/admin/bulk-delete-students',
                { studentIds: selectedIds },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update local state to remove deleted students
            const updatedStudents = selectedBranch.students.filter(s => !selectedIds.includes(s.sid));
            setSelectedBranch({ ...selectedBranch, students: updatedStudents });
            setSelectedIds([]);

            // Refresh main list in background
            fetchDistribution();
        } catch (err) {
            console.error('Delete failed:', err);
            alert('Failed to delete students');
        }
    };

    const handleUpdateStudent = async (e) => {
        e.preventDefault();
        if (!editingStudent) return;

        try {
            const token = localStorage.getItem('token');
            // Assuming standard update endpoint exists
            await axios.put(`http://localhost:5001/api/students/${editingStudent.sid}`,
                editingStudent,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update local state
            const updatedStudents = selectedBranch.students.map(s =>
                s.sid === editingStudent.sid ? { ...s, ...editingStudent } : s
            );
            setSelectedBranch({ ...selectedBranch, students: updatedStudents });
            setEditingStudent(null);
            alert('Student updated successfully');
        } catch (err) {
            console.error('Update failed:', err);
            alert('Failed to update student details');
        }
    };

    const handleEditChange = (e) => {
        setEditingStudent({
            ...editingStudent,
            [e.target.name]: e.target.value
        });
    };

    if (loading) return <div className="dist-loading">Loading student data...</div>;
    if (error) return <div className="dist-error">{error}</div>;

    return (
        <div className="student-distribution-container">
            <div className="dist-header">
                <h3><FaLayerGroup /> Student Distribution</h3>
                <button onClick={fetchDistribution} className="refresh-btn">Refresh</button>
            </div>

            <div className="dist-list">
                {distribution.map((yearGroup) => (
                    <div key={yearGroup._id} className={`dist-year-card ${expandedYear === yearGroup._id ? 'active' : ''}`}>
                        <div className="dist-year-header" onClick={() => toggleYear(yearGroup._id)}>
                            <div className="year-info">
                                {expandedYear === yearGroup._id ? <FaChevronDown /> : <FaChevronRight />}
                                <span className="year-label">Year {yearGroup._id}</span>
                            </div>
                            <div className="year-stats">
                                <FaUsers /> {yearGroup.totalYearStudents} Students
                            </div>
                        </div>

                        <AnimatePresence>
                            {expandedYear === yearGroup._id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="dist-year-content"
                                >
                                    {yearGroup.sections.sort((a, b) => String(a.section).localeCompare(String(b.section), undefined, { numeric: true })).map((section) => (
                                        <div key={section.section} className="dist-section-item">
                                            <div
                                                className="dist-section-header"
                                                onClick={(e) => toggleSection(e, `${yearGroup._id}-${section.section}`)}
                                            >
                                                <div className="section-info">
                                                    {expandedSection === `${yearGroup._id}-${section.section}` ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
                                                    <span>Section {section.section}</span>
                                                </div>
                                                <span className="section-count">{section.totalStudents} Students</span>
                                            </div>

                                            <AnimatePresence>
                                                {expandedSection === `${yearGroup._id}-${section.section}` && (
                                                    <motion.div
                                                        initial={{ height: 0 }}
                                                        animate={{ height: 'auto' }}
                                                        exit={{ height: 0 }}
                                                        className="dist-branch-list"
                                                        style={{ overflow: 'hidden' }}
                                                    >
                                                        {section.branches.map((branch) => (
                                                            <div
                                                                key={branch.branch}
                                                                className="dist-branch-item"
                                                                onClick={() => handleBranchClick(branch, yearGroup._id, section.section)}
                                                            >
                                                                <div className="branch-name">
                                                                    <FaCodeBranch size={12} /> {branch.branch}
                                                                </div>
                                                                <div className="branch-count">
                                                                    {branch.count}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}

                {distribution.length === 0 && (
                    <div className="no-data">No student data available.</div>
                )}
            </div>

            {/* Student List Modal */}
            <AnimatePresence>
                {selectedBranch && (
                    <div className="sd-modal-overlay" onClick={() => setSelectedBranch(null)}>
                        <motion.div
                            className="sd-modal"
                            onClick={e => e.stopPropagation()}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                        >
                            <div className="sd-modal-header">
                                <h3>{selectedBranch.year} - Section {selectedBranch.section} - {selectedBranch.branch}</h3>
                                <button className="sd-close-btn" onClick={() => setSelectedBranch(null)}><FaTimes /></button>
                            </div>

                            <div className="sd-modal-actions-row">
                                <div className="sd-search-wrapper">
                                    <FaSearch className="sd-search-icon" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or ID..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <select
                                    className="sd-filter-select"
                                    value={attendanceFilter}
                                    onChange={(e) => { setAttendanceFilter(e.target.value); setCurrentPage(1); }}
                                >
                                    <option value="all">All Attendance</option>
                                    <option value="high">High (&gt; 75%)</option>
                                    <option value="mid">Average (60-75%)</option>
                                    <option value="low">Low (&lt; 60%)</option>
                                </select>

                                {selectedIds.length > 0 && (
                                    <button className="sd-delete-btn" onClick={handleBulkDelete}>
                                        <FaTrash /> Delete ({selectedIds.length})
                                    </button>
                                )}
                                <button className="sd-export-btn" onClick={handleExportCSV}>
                                    <FaDownload /> Export CSV
                                </button>
                            </div>

                            {/* Select All Checkbox Row */}
                            {filteredStudents.length > 0 && (
                                <div className="sd-select-all-row">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length > 0 && selectedIds.length === filteredStudents.length}
                                        onChange={handleSelectAll}
                                    />
                                    <span>Select All {filteredStudents.length} Students</span>
                                </div>
                            )}

                            <div className="sd-modal-body">
                                {paginatedStudents.map((student, idx) => (
                                    <div key={student.sid || idx} className={`sd-student-item ${selectedIds.includes(student.sid) ? 'selected' : ''}`}>
                                        <div className="sd-checkbox-wrapper">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(student.sid)}
                                                onChange={() => handleSelectStudent(student.sid)}
                                            />
                                        </div>
                                        <div className="sd-student-avatar">
                                            {student.name ? student.name.charAt(0) : 'S'}
                                        </div>
                                        <div className="sd-student-info">
                                            <h4>{student.name}</h4>
                                            <p>{student.sid} • {student.email}</p>
                                            {student.attendance !== undefined && (
                                                <span className={`sd-att-badge ${student.attendance < 60 ? 'low' : student.attendance >= 75 ? 'high' : 'mid'}`}>
                                                    {student.attendance}% Att.
                                                </span>
                                            )}
                                        </div>
                                        <button className="sd-edit-icon-btn" onClick={() => setEditingStudent(student)}><FaEdit /></button>
                                    </div>
                                ))}
                                {paginatedStudents.length === 0 && (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                                        No students found in this branch.
                                    </div>
                                )}
                            </div>

                            {/* Pagination Footer */}
                            {totalPages > 1 && (
                                <div className="sd-pagination">
                                    <button
                                        className="sd-page-btn"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => prev - 1)}
                                    >
                                        <FaChevronLeft />
                                    </button>
                                    <span className="sd-page-info">Page {currentPage} of {totalPages}</span>
                                    <button
                                        className="sd-page-btn"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                    >
                                        <FaChevronRight />
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Student Modal */}
            <AnimatePresence>
                {editingStudent && (
                    <div className="sd-modal-overlay" style={{ zIndex: 1100 }}>
                        <motion.div
                            className="sd-edit-modal"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <div className="sd-modal-header">
                                <h3>Edit Student: {editingStudent.sid}</h3>
                                <button className="sd-close-btn" onClick={() => setEditingStudent(null)}><FaTimes /></button>
                            </div>
                            <form onSubmit={handleUpdateStudent} className="sd-edit-form">
                                <div className="sd-form-group">
                                    <label>Full Name</label>
                                    <input type="text" name="name" value={editingStudent.name || ''} onChange={handleEditChange} required />
                                </div>
                                <div className="sd-form-group">
                                    <label>Email Address</label>
                                    <input type="email" name="email" value={editingStudent.email || ''} onChange={handleEditChange} required />
                                </div>
                                <div className="sd-form-group">
                                    <label>Phone Number</label>
                                    <input type="text" name="phone" value={editingStudent.phone || ''} onChange={handleEditChange} />
                                </div>
                                <div className="sd-form-actions">
                                    <button type="button" className="sd-cancel-btn" onClick={() => setEditingStudent(null)}>Cancel</button>
                                    <button type="submit" className="sd-save-btn"><FaSave /> Save Changes</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StudentDistribution;
