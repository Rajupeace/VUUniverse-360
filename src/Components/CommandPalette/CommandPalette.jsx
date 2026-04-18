import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaBook, FaRobot, FaCog, FaSignOutAlt, FaTerminal } from 'react-icons/fa';
import './CommandPalette.css';
import { apiGet } from '../../utils/apiClient';

const CommandPalette = ({ isOpen, onClose, role, userData }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    // Commands/Actions based on role
    const actions = React.useMemo(() => [
        { id: 'ai', name: 'Ask AI Assistant', iconType: 'robot', category: 'AI', action: () => { onClose(); window.dispatchEvent(new CustomEvent('open-ai-modal')); } },
        { id: 'settings', name: 'Account Settings', iconType: 'cog', category: 'General', action: () => { onClose(); navigate(role === 'student' ? '/dashboard?view=settings' : role === 'admin' ? '/admin' : '/faculty'); } },
        { id: 'logout', name: 'Logout', iconType: 'sign-out-alt', category: 'Danger', action: () => { if (window.confirm('Logout?')) { onClose(); document.querySelector('.btn-logout')?.click() || document.querySelector('.btn-terminate')?.click(); } } }
    ], [onClose, navigate, role]);

    const getCommandIcon = (iconType) => {
        switch (iconType) {
            case 'robot': return <FaRobot />;
            case 'cog': return <FaCog />;
            case 'sign-out-alt': return <FaSignOutAlt />;
            case 'book': return <FaBook />;
            default: return <FaSearch />;
        }
    };

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    useEffect(() => {
        const fetchRemoteData = async () => {
            if (query.length < 2) {
                setResults(actions);
                return;
            }

            try {
                // Search courses/subjects
                const courses = await apiGet('/api/courses');
                const filteredActions = actions.filter(a => a.name.toLowerCase().includes(query.toLowerCase()));
                const filteredCourses = (courses || []).filter(c =>
                    c.name.toLowerCase().includes(query.toLowerCase()) ||
                    c.code?.toLowerCase().includes(query.toLowerCase())
                ).map(c => ({
                    id: c.id,
                    name: `${c.name} (${c.code || 'Course'})`,
                    iconType: 'book',
                    category: 'Subjects',
                    action: () => {
                        onClose();
                        if (role === 'student') navigate(`/dashboard?subject=${c.id}`);
                        else if (role === 'admin') navigate('/admin');
                    }
                }));

                setResults([...filteredActions, ...filteredCourses]);
            } catch (e) {
                setResults(actions.filter(a => a.name.toLowerCase().includes(query.toLowerCase())));
            }
        };

        const timer = setTimeout(fetchRemoteData, 200);
        return () => clearTimeout(timer);
    }, [query, role, actions, navigate, onClose]);

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            setSelectedIndex(prev => (prev + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
            setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        } else if (e.key === 'Enter') {
            results[selectedIndex]?.action();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="cmd-palette-overlay" onClick={onClose}>
            <div className="cmd-palette-container" onClick={e => e.stopPropagation()}>
                <div className="cmd-palette-search">
                    <FaTerminal className="cmd-icon-terminal" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search subjects or actions..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <div className="cmd-k-badge">ESC</div>
                </div>

                <div className="cmd-results">
                    {results.length > 0 ? (
                        results.map((res, i) => (
                            <div
                                key={`${res.category}-${res.id}-${i}`}
                                className={`cmd-item ${i === selectedIndex ? 'selected' : ''}`}
                                onMouseEnter={() => setSelectedIndex(i)}
                                onClick={res.action}
                            >
                                <div className="cmd-item-icon">{getCommandIcon(res.iconType)}</div>
                                <div className="cmd-item-info">
                                    <span className="cmd-item-name">{res.name}</span>
                                    <span className="cmd-item-category">{res.category}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="cmd-no-results">No matches found for your search.</div>
                    )}
                </div>

                <div className="cmd-footer">
                    <span><kbd>↑↓</kbd> to navigate</span>
                    <span><kbd>Enter</kbd> to select</span>
                    <span><kbd>ESC</kbd> to dismiss</span>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
