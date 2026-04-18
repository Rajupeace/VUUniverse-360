import React from 'react';
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaRegCircle, FaClipboardList } from 'react-icons/fa';

/**
/**
 * Task Management
 * Manage and track administrative tasks.
 */
const TodoSection = ({ todos, openModal, toggleTodo, deleteTodo }) => {
    return (
        <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
            <header className="admin-page-header" style={{ marginBottom: '2rem', borderBottom: 'none' }}>
                <div className="admin-page-title">
                    <h1 style={{ fontSize: '2.8rem', fontWeight: 950, letterSpacing: '-0.04em', background: 'linear-gradient(135deg, #0f172a, #334155)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        DIRECTIVE <span style={{ color: '#ef4444', WebkitTextFillColor: '#ef4444' }}>CENTER</span>
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 10px #ef4444' }}></div>
                        <p style={{ margin: 0, fontWeight: 800, color: '#64748b', fontSize: '0.9rem' }}>{todos.filter(t => !t.completed).length} ACTIVE DIRECTIVES</p>
                    </div>
                </div>
                <div className="admin-action-bar" style={{ display: 'flex', gap: '1rem' }}>
                    <button className="admin-btn admin-btn-primary" onClick={() => openModal('todo')} style={{ height: '48px', borderRadius: '16px', fontWeight: 900, fontSize: '0.8rem', background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                        <FaPlus /> INITIALIZE TASK
                    </button>
                </div>
            </header>

            <div className="admin-card" style={{ borderRadius: '28px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' }}>
                <div className="admin-list-container">
                    {todos.map(todo => (
                        <div
                            key={todo.id}
                            style={{
                                padding: '1.5rem 2rem',
                                borderBottom: '1.5px solid #f1f5f9',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                background: todo.completed ? '#f8fafc' : 'white',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {todo.completed && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: '#10b981' }}></div>}

                            <div
                                onClick={() => toggleTodo(todo.id)}
                                style={{
                                    cursor: 'pointer',
                                    marginRight: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    transition: 'transform 0.2s'
                                }}
                            >
                                {todo.completed ? (
                                    <div style={{ background: '#dcfce7', color: '#10b981', width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FaCheckCircle size={18} />
                                    </div>
                                ) : (
                                    <div style={{ background: '#f8fafc', border: '2px solid #e2e8f0', width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                                        <FaRegCircle size={18} />
                                    </div>
                                )}
                            </div>

                            <div className="admin-todo-text" style={{ flex: 1 }}>
                                <div style={{
                                    textDecoration: todo.completed ? 'line-through' : 'none',
                                    color: todo.completed ? '#94a3b8' : '#1e293b',
                                    fontWeight: 750,
                                    fontSize: '1.1rem',
                                    marginBottom: '2px',
                                    transition: 'color 0.3s'
                                }}>
                                    {todo.text}
                                </div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: todo.completed ? '#cbd5e1' : '#64748b' }}>
                                    {todo.completed ? 'COMPLETED' : 'STATUS: PENDING ARCHIVE'}
                                </div>
                            </div>

                            <div className="todo-actions" style={{ display: 'flex', gap: '0.6rem' }}>
                                <button onClick={() => openModal('todo', todo)} style={{ cursor: 'pointer', border: 'none', background: '#f8fafc', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }} title="Modify"><FaEdit /></button>
                                <button onClick={() => deleteTodo(todo.id)} style={{ cursor: 'pointer', border: 'none', background: '#fef2f2', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }} title="Purge"><FaTrash /></button>
                            </div>
                        </div>
                    ))}

                    {todos.length === 0 && (
                        <div className="admin-empty-state" style={{ padding: '8rem 2rem' }}>
                            <div style={{ fontSize: '4rem', color: '#cbd5e1', marginBottom: '1.5rem' }}><FaClipboardList /></div>
                            <h3 style={{ margin: 0, color: '#1e293b', fontWeight: 950 }}>DIRECTIVES CLEARED</h3>
                            <p style={{ color: '#94a3b8', fontWeight: 600, marginTop: '0.5rem' }}>No pending administrative tasks are currently queued.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TodoSection;
