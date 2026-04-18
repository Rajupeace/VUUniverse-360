import React, { useState, useEffect, useCallback } from 'react';
import { FaChalkboard, FaCalendarAlt, FaUserTie, FaSearch, FaExternalLinkAlt, FaTimes, FaFilter, FaClock, FaBookOpen } from 'react-icons/fa';
import { apiGet } from '../../../utils/apiClient';
import sseClient from '../../../utils/sseClient';
import Whiteboard from '../../Whiteboard/Whiteboard';
import './ClassBoards.css';

const ClassBoards = ({ studentId, year, branch, section, openAiWithPrompt }) => {
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBoard, setSelectedBoard] = useState(null);
    const [filterSubject, setFilterSubject] = useState('all');
    const [sortBy, setSortBy] = useState('recent');

    const fetchBoards = useCallback(async () => {
        try {
            setLoading(true);
            const res = await apiGet(`/api/whiteboard/student/${year}/${branch}/${section}`);
            setBoards(res || []);
        } catch (err) {
            console.error('Failed to fetch boards:', err);
        } finally {
            setLoading(false);
        }
    }, [year, branch, section]);

    useEffect(() => {
        fetchBoards();
    }, [year, branch, section, fetchBoards]);

    // Real-time updates via SSE
    useEffect(() => {
        try {
            const unsub = sseClient.onUpdate((ev) => {
                if (ev && ev.resource === 'whiteboard' && ev.action === 'create') {
                    // Check if the board is for this student's section
                    if (ev.data && ev.data.year === year && ev.data.branch === branch &&
                        (ev.data.section === section || ev.data.section === 'All')) {
                        console.log('New whiteboard detected, refreshing...');
                        fetchBoards();
                    }
                }
            });
            return unsub;
        } catch (e) {
            console.debug('SSE client error in ClassBoards', e);
        }
    }, [year, branch, section, fetchBoards]);

    // Get unique subjects
    const subjects = ['all', ...new Set(boards.map(b => b.subject))];

    // Filter and sort boards
    const filteredBoards = boards
        .filter(b => {
            const matchesSearch =
                b.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                b.facultyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                b.title?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSubject = filterSubject === 'all' || b.subject === filterSubject;
            return matchesSearch && matchesSubject;
        })
        .sort((a, b) => {
            if (sortBy === 'recent') {
                return new Date(b.createdAt) - new Date(a.createdAt);
            } else if (sortBy === 'oldest') {
                return new Date(a.createdAt) - new Date(b.createdAt);
            } else if (sortBy === 'subject') {
                return a.subject.localeCompare(b.subject);
            }
            return 0;
        });

    // Group boards by subject
    const boardsBySubject = filteredBoards.reduce((acc, board) => {
        if (!acc[board.subject]) {
            acc[board.subject] = [];
        }
        acc[board.subject].push(board);
        return acc;
    }, {});

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="class-boards-container">
            {/* Header */}
            <div className="boards-header">
                <div className="header-content">
                    <div className="title-section">
                        <div className="icon-wrapper">
                            <FaChalkboard />
                        </div>
                        <div>
                            <h1>Smart Paint Boards</h1>
                            <p>Real-time class notes and drawings from your professors</p>
                        </div>
                    </div>

                    <div className="header-stats">
                        <div className="stat-card">
                            <FaBookOpen />
                            <div>
                                <div className="stat-value">{subjects.length - 1}</div>
                                <div className="stat-label">Subjects</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <FaChalkboard />
                            <div>
                                <div className="stat-value">{boards.length}</div>
                                <div className="stat-label">Total Boards</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="boards-filters">
                <div className="search-box">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Search by subject, faculty, or title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <FaFilter />
                    <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
                        {subjects.map(sub => (
                            <option key={sub} value={sub}>
                                {sub === 'all' ? 'All Subjects' : sub}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <FaClock />
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="recent">Most Recent</option>
                        <option value="oldest">Oldest First</option>
                        <option value="subject">By Subject</option>
                    </select>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading class boards...</p>
                </div>
            ) : filteredBoards.length === 0 ? (
                <div className="empty-state">
                    <FaChalkboard size={64} />
                    <h3>No boards found</h3>
                    <p>
                        {searchTerm || filterSubject !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Saved class sessions from your faculty will appear here'}
                    </p>
                </div>
            ) : (
                <div className="boards-content">
                    {Object.entries(boardsBySubject).map(([subject, subjectBoards]) => (
                        <div key={subject} className="subject-section">
                            <div className="subject-header">
                                <h2>{subject}</h2>
                                <span className="board-count">{subjectBoards.length} session{subjectBoards.length !== 1 ? 's' : ''}</span>
                            </div>

                            <div className="boards-grid">
                                {subjectBoards.map(board => (
                                    <div key={board._id} className="board-card" onClick={() => setSelectedBoard(board)}>
                                        <div className="board-preview">
                                            <img src={board.imageData} alt="Board preview" loading="lazy" />
                                            <div className="preview-overlay">
                                                <FaExternalLinkAlt />
                                                <span>VIEW FULL BOARD</span>
                                            </div>
                                        </div>
                                        <div className="board-details">
                                            <h3>{board.title || 'Class Session'}</h3>
                                            <div className="board-meta">
                                                <span className="meta-item">
                                                    <FaUserTie /> {board.facultyName}
                                                </span>
                                                <span className="meta-item">
                                                    <FaCalendarAlt /> {formatDate(board.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Full View Modal */}
            {selectedBoard && (
                <div className="board-modal" onClick={() => setSelectedBoard(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setSelectedBoard(null)}>
                            <FaTimes />
                        </button>

                        <div className="modal-header">
                            <div className="header-info">
                                <span className="subject-badge">{selectedBoard.subject}</span>
                                <h2>{selectedBoard.title}</h2>
                                <div className="header-meta">
                                    <span><FaUserTie /> Prof. {selectedBoard.facultyName}</span>
                                    <span><FaCalendarAlt /> {formatDate(selectedBoard.createdAt)}</span>
                                </div>
                            </div>
                            <button
                                className="ai-btn"
                                onClick={() => openAiWithPrompt(`Explain the concepts shown in this ${selectedBoard.subject} class board. Help me understand the key points and provide additional context where needed.`)}
                            >
                                <FaChalkboard /> Analyze with AI
                            </button>
                        </div>

                        <div className="modal-body">
                            <Whiteboard initialData={selectedBoard.imageData} isReadOnly={true} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClassBoards;
