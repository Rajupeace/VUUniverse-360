import React, { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaRedo, FaCheck, FaPlus, FaTrash, FaBrain, FaExpand, FaCompress } from 'react-icons/fa';
import './StudentDashboard.css';
import './StudentStudyTools.css';

const StudyTools = ({ focusMode, setFocusMode }) => {
    // Pomodoro State
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState('focus'); // focus or break

    // Todo State
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            // Timer finished
            setIsActive(false);
            if (mode === 'focus') {
                alert("Focus session complete! Take a break.");
                setMode('break');
                setTimeLeft(5 * 60);
            } else {
                alert("Break over! Back to work.");
                setMode('focus');
                setTimeLeft(25 * 60);
            }
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, mode]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const addTask = (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
        setNewTask('');
    };

    const toggleTask = (id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTask = (id) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    if (!isOpen) {
        return (
            <button className="study-tool-toggle" onClick={() => setIsOpen(true)}>
                <FaBrain /> <span>STUDY TOOLS</span>
            </button>
        );
    }

    return (
        <div className="study-tools-panel animate-slide-up">
            <div className="tool-header">
                <h3><FaBrain /> Deep Focus</h3>
                <button className="close-tool" onClick={() => setIsOpen(false)}>×</button>
            </div>

            {/* Pomodoro Section */}
            <div className="pomodoro-section">
                <div className={`timer-display ${isActive ? 'active' : ''}`}>
                    {formatTime(timeLeft)}
                </div>
                <div className="timer-status">
                    {mode === 'focus' ? 'FOCUS SESSION' : 'SHORT BREAK'}
                </div>
                <div className="timer-controls">
                    <button onClick={toggleTimer} className={`ctrl-btn ${isActive ? 'pause' : 'play'}`}>
                        {isActive ? <FaPause /> : <FaPlay />}
                    </button>
                    <button onClick={resetTimer} className="ctrl-btn reset">
                        <FaRedo />
                    </button>
                    {setFocusMode && (
                        <button onClick={() => setFocusMode(!focusMode)} className="ctrl-btn reset" title={focusMode ? "Exit Immersion" : "Enter Immersion"}>
                            {focusMode ? <FaCompress /> : <FaExpand />}
                        </button>
                    )}
                </div>
            </div>

            {/* Micro-Tasks Section */}
            <div className="micro-tasks">
                <h4>Session Goals</h4>
                <form onSubmit={addTask} className="task-form">
                    <input
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        placeholder="Add a goal..."
                    />
                    <button type="submit"><FaPlus /></button>
                </form>
                <div className="task-list">
                    {tasks.map(task => (
                        <div key={task.id} className={`mini-task ${task.completed ? 'done' : ''}`}>
                            <div className="check-circle" onClick={() => toggleTask(task.id)}>
                                {task.completed && <FaCheck />}
                            </div>
                            <span>{task.text}</span>
                            <button onClick={() => deleteTask(task.id)} className="del-btn"><FaTrash /></button>
                        </div>
                    ))}
                    {tasks.length === 0 && <div className="no-tasks">No goals set yet.</div>}
                </div>
            </div>
        </div>
    );
};

export default StudyTools;
