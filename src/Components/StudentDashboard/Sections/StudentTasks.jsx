import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTrash, FaCheckCircle, FaRegCircle, FaClipboardList, FaBullhorn, FaCalendarDay } from 'react-icons/fa';
import { apiPost, apiPut, apiDelete } from '../../../utils/apiClient';
import sseClient from '../../../utils/sseClient';
import './StudentTasks.css';

/**
 * STUDENT TASKS (Premium)
 * A clean, prioritized task management system.
 */
const StudentTasks = ({ tasks, userData, onRefresh }) => {
    const [newTask, setNewTask] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [filter, setFilter] = useState('active'); // active, completed, all

    // Real-time Update Listener
    useEffect(() => {
        const unsub = sseClient.onUpdate((ev) => {
            if (ev && ev.resource === 'todos') {
                console.log('📡 Student Tasks Refresh Triggered via SSE');
                if (typeof onRefresh === 'function') onRefresh();
            }
        });
        return () => unsub();
    }, [onRefresh]);

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        try {
            await apiPost('/api/todos', {
                text: newTask,
                target: 'student',
                userId: userData.sid,
                dueDate: new Date(Date.now() + 86400000) // Tomorrow default
            });
            setNewTask('');
            setIsAdding(false);
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error('Failed to add task:', error);
        }
    };

    const toggleTask = async (task) => {
        try {
            await apiPut(`/api/todos/${task._id}`, { completed: !task.completed });
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error('Failed to toggle task:', error);
        }
    };

    const deleteTask = async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await apiDelete(`/api/todos/${taskId}`);
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };

    const filteredTasks = tasks.filter(t => {
        if (filter === 'active') return !t.completed;
        if (filter === 'completed') return t.completed;
        return true;
    });

    return (
        <div className="nexus-page-container fade-in">
            <header className="page-section-header">
                <div>
                    <h2 className="title-with-icon">
                        <FaClipboardList className="header-icon" />
                        MY <span>PRIORITY</span> TASKS
                    </h2>
                    <p className="subtitle">Manage your daily goals and academic action items.</p>
                </div>
                <div className="task-filters">
                    {['active', 'completed', 'all'].map(f => (
                        <button
                            key={f}
                            className={`filter-btn ${filter === f ? 'active' : ''}`}
                            onClick={() => setFilter(f)}
                        >
                            {f.toUpperCase()}
                        </button>
                    ))}
                </div>
            </header>

            <div className="tasks-grid">
                {/* Left Column: Quick Add */}
                <div className="add-task-card">
                    <h3><FaPlus style={{ color: 'var(--v-primary)' }} /> QUICK ADD</h3>
                    <form onSubmit={handleAddTask}>
                        <input
                            type="text"
                            placeholder="What needs to be done?"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            onFocus={() => setIsAdding(true)}
                        />
                        <AnimatePresence>
                            {isAdding && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="add-task-expanded"
                                >
                                    <div className="date-hint">
                                        <FaCalendarDay /> Due tomorrow by default
                                    </div>
                                    <div className="form-actions">
                                        <button type="button" className="cancel-btn" onClick={() => { setIsAdding(false); setNewTask(''); }}>Cancel</button>
                                        <button type="submit" className="save-btn">CREATE TASK</button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>
                </div>

                {/* Right Column: Task List */}
                <div className="task-list-wrapper">
                    <AnimatePresence mode='popLayout'>
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map((task, idx) => (
                                <motion.div
                                    key={task._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`nexus-task-item ${task.completed ? 'completed' : ''}`}
                                >
                                    <div className="task-main" onClick={() => toggleTask(task)}>
                                        <div className="check-box">
                                            {task.completed ? <FaCheckCircle className="checked" /> : <FaRegCircle />}
                                        </div>
                                        <div className="task-content">
                                            <span className="task-text">{task.text}</span>
                                            <div className="task-meta">
                                                {task.userId === null ? (
                                                    <span className="global-badge"><FaBullhorn /> Global Reminder</span>
                                                ) : (
                                                    <span className="personal-badge">Personal Task</span>
                                                )}
                                                {task.dueDate && (
                                                    <span className="due-date">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {task.userId === userData?.sid && (
                                        <button className="task-delete-btn" onClick={() => deleteTask(task._id)} title="Delete Task">
                                            <FaTrash size={14} />
                                        </button>
                                    )}
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="empty-tasks"
                            >
                                <FaClipboardList className="empty-icon" />
                                <h4>No {filter} tasks found.</h4>
                                <p>You're all caught up! Add a new task to stay organized.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default StudentTasks;
