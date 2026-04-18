import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaPaperPlane, FaRobot, FaRegCopy, FaCheck, FaRegFileAlt } from 'react-icons/fa';
import { apiPost, apiGet } from '../../utils/apiClient';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import './VuAiAgent.css';
import { FaSyncAlt } from 'react-icons/fa';

const VuAiAgent = ({ onNavigate, initialMessage, documentContext }) => {
    const defaultBotMessage = {
        id: 'vuai-greeting',
        sender: 'bot',
        text: 'Hi! I am your VU Agent. Ask me anything about your subjects or studies!',
        timestamp: new Date().toISOString()
    };

    const [messages, setMessages] = useState([defaultBotMessage]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const [lastFailedText, setLastFailedText] = useState(null);
    const messagesEndRef = useRef(null);
    const historyLoadedRef = useRef(false);
    const initialMessageProcessed = useRef(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const resolveUserProfile = () => {
        if (typeof window === 'undefined' || !window.localStorage) {
            return { role: 'student', userId: 'guest', context: {} };
        }

        const userDataStr = window.localStorage.getItem('userData');
        const studentDataStr = window.localStorage.getItem('studentData');
        const facultyDataStr = window.localStorage.getItem('facultyData');

        let userData = {};
        let userRole = 'student';

        const safeParse = (value) => {
            try { return JSON.parse(value); }
            catch (err) { return {}; }
        };

        if (userDataStr) {
            const parsed = safeParse(userDataStr);
            if (parsed) { userData = parsed; userRole = parsed.role || 'student'; }
        }

        if (!userData.role) {
            if (facultyDataStr) {
                const parsed = safeParse(facultyDataStr);
                if (parsed) { userData = parsed; userRole = 'faculty'; }
            } else if (studentDataStr) {
                const parsed = safeParse(studentDataStr);
                if (parsed) { userData = parsed; userRole = 'student'; }
            }
        }

        const adminToken = window.localStorage.getItem('adminToken');
        if (adminToken && userRole !== 'faculty') {
            userRole = 'admin';
        }

        return {
            role: userRole,
            userId: userData.sid || userData.facultyId || userData.adminId || 'guest',
            context: {
                year: userData.year,
                branch: userData.branch || 'CSE',
                section: userData.section || 'A',
                name: userData.studentName || userData.name || 'User'
            }
        };
    };

    useEffect(() => {
        setUserProfile(resolveUserProfile());
    }, []);

    // Personalize greeting once user profile is resolved
    useEffect(() => {
        if (!userProfile) return;
        setMessages(prev => {
            try {
                const name = (userProfile.context && userProfile.context.name) || (userProfile.userId || 'Student');
                const personalized = `Hi ${name}! I'm your Study Companion — ask a question and I'll help you quickly with short, actionable steps.`;
                if (Array.isArray(prev) && prev.length === 1 && prev[0].id === 'vuai-greeting') {
                    return [{ ...prev[0], text: personalized }];
                }
            } catch (e) {
                // ignore personalization errors
            }
            return prev;
        });
    }, [userProfile]);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!userProfile || historyLoadedRef.current) return;
            historyLoadedRef.current = true;
            setIsHistoryLoading(true);
            try {
                const params = new URLSearchParams({
                    userId: userProfile.userId || 'guest',
                    role: userProfile.role || 'student'
                });
                const history = await apiGet(`/api/chat/history?${params.toString()}`);
                if (Array.isArray(history) && history.length > 0) {
                    const reconstructed = [];
                    history.forEach(entry => {
                        if (entry.message) {
                            reconstructed.push({
                                id: `${entry.id || entry.timestamp}-user`,
                                sender: 'user',
                                text: entry.message,
                                timestamp: entry.timestamp
                            });
                        }
                        if (entry.response) {
                            reconstructed.push({
                                id: `${entry.id || entry.timestamp}-bot`,
                                sender: 'bot',
                                text: entry.response,
                                timestamp: entry.timestamp
                            });
                        }
                    });
                    setMessages(reconstructed);
                }
            } catch (error) {
                console.error('[VuAiAgent] Failed to load chat history:', error);
            } finally {
                setIsHistoryLoading(false);
            }
        };

        fetchHistory();
    }, [userProfile]);



    const handleActionTags = useCallback((text) => {
        // Detect {{NAVIGATE: section}} case-insensitive
        const navMatch = text.match(/{{NAVIGATE:\s*([^}]+)}}/i);
        if (navMatch && navMatch[1] && onNavigate) {
            const section = navMatch[1].trim();
            console.log('[VUAgent] Executing navigation directive:', section);
            // faster navigation - 200ms so UI feels more responsive
            setTimeout(() => onNavigate(section), 200);
        }
        return text.replace(/{{NAVIGATE:\s*[^}]+}}/gi, '');
    }, [onNavigate]);

    const isMountedRef = useRef(true);
    useEffect(() => { return () => { isMountedRef.current = false; }; }, []);

    const handleSend = useCallback(async (e, forcedText = null) => {
        if (e) e.preventDefault();
        const userText = forcedText || input;
        if (!userText || !userText.trim() || !userProfile || isLoading) return;

        setInput('');

        const userMsg = {
            id: Date.now(),
            sender: 'user',
            text: userText,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        const payload = {
            user_id: userProfile.userId || 'guest',
            message: userText,
            role: userProfile.role || 'student',
            user_name: (userProfile.context && userProfile.context.name) || 'User',
            context: {
                ...(userProfile.context || {}),
                document: documentContext
            }
        };

        const MAX_RETRIES = 3;

        const sendPayload = async (attempt = 1) => {
            try {
                console.log('[VuAiAgent] Sending payload:', payload);
                console.log('[VuAiAgent] Attempt:', attempt);

                const data = await apiPost('/api/chat', payload);

                console.log('[VuAiAgent] Received data:', data);

                let botResponse = '';
                if (typeof data === 'string') {
                    botResponse = data;
                } else if (data && (data.response || data.text || data.message)) {
                    botResponse = data.response || data.text || data.message;
                } else {
                    botResponse = 'Received empty response from server.';
                }

                botResponse = handleActionTags(String(botResponse));

                if (!isMountedRef.current) return;
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    sender: 'bot',
                    text: botResponse,
                    timestamp: new Date().toISOString()
                }]);

                if (isMountedRef.current) setLastFailedText(null);
                return;
            } catch (error) {
                console.error('[VuAiAgent] chat send failed (attempt', attempt, '):', error);
                console.error('[VuAiAgent] Error details:', error.message, error.status);

                if (attempt < MAX_RETRIES) {
                    const nextAttempt = attempt + 1;
                    const delay = Math.pow(2, attempt - 1) * 1000; // 1s,2s,4s
                    if (isMountedRef.current) {
                        setMessages(prev => [...prev, {
                            id: `retry-${Date.now()}-${attempt}`,
                            sender: 'bot',
                            text: `Retrying... (attempt ${nextAttempt}/${MAX_RETRIES})`,
                            timestamp: new Date().toISOString()
                        }]);
                    }
                    await new Promise(res => setTimeout(res, delay));
                    if (!isMountedRef.current) return;
                    return sendPayload(nextAttempt);
                }

                if (isMountedRef.current) {
                    setLastFailedText(userText);
                    setMessages(prev => [...prev, {
                        id: Date.now() + 1,
                        sender: 'bot',
                        text: `Connection lost. Please try again. (${error?.message || 'Network error'})`,
                        isError: true,
                        timestamp: new Date().toISOString()
                    }]);
                }
            } finally {
                console.log('[VuAiAgent] Setting isLoading to false');
                if (isMountedRef.current) setIsLoading(false);
            }
        };

        await sendPayload(1);
    }, [input, userProfile, isLoading, documentContext, handleActionTags]);

    useEffect(() => {
        if (initialMessage && !initialMessageProcessed.current && userProfile && !isHistoryLoading) {
            initialMessageProcessed.current = true;
            setTimeout(() => {
                handleSend(null, initialMessage);
            }, 1000);
        }
    }, [initialMessage, userProfile, isHistoryLoading, handleSend]);

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const suggestions = [
        "What is my current attendance?",
        "Show my upcoming exams",
        "Explain DBMS join types",
        "Navigate to Academic Browser"
    ];

    return (
        <div className="vu-ai-container">
            {/* Header */}
            <header className="vu-header">
                <div className="vu-bot-avatar">
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <FaRobot size={24} className="ai-icon-spin" />
                    </motion.div>
                </div>
                <div className="vu-title-group">
                    <motion.h3
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        VU Agent <span className="vu-version-tag">Study Companion</span>
                    </motion.h3>
                    <div className="vu-status">
                        <div className="vu-status-dot"></div>
                        <span>Online & VU</span>
                        <button
                            title="Refresh AI Knowledge"
                            className="vu-refresh-btn"
                            onClick={async () => {
                                try {
                                    // Call backend proxy to reload knowledge modules
                                    await apiPost('/api/agent/reload', {});
                                    setMessages(prev => [...prev, { id: Date.now() + 99, sender: 'bot', text: 'Knowledge refreshed ✅', timestamp: new Date().toISOString() }]);
                                } catch (e) {
                                    setMessages(prev => [...prev, { id: Date.now() + 100, sender: 'bot', text: 'Failed to refresh knowledge', timestamp: new Date().toISOString(), isError: true }]);
                                }
                            }}
                            style={{ marginLeft: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: '#2d8cff' }}
                        >
                            <FaSyncAlt />
                        </button>
                    </div>
                </div>
            </header>

            {/* Document Context Banner */}
            {documentContext && (
                <div style={{
                    background: '#eff6ff', borderBottom: '1px solid #dbeafe', padding: '0.5rem 1rem',
                    fontSize: '0.8rem', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}>
                    <FaRegFileAlt />
                    <span>Analyzing: <strong>{documentContext.title || 'Document'}</strong></span>
                </div>
            )}

            {/* Holographic Video Analysis Overlay */}
            {documentContext?.videoAnalysis && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="vu-analysis-overlay"
                    style={{ margin: '1rem' }}
                >
                    <div className="analysis-header">
                        <div className="analysis-tag">AI ANALYSIS</div>
                        <span>VIDEO INSIGHTS ENGINE</span>
                    </div>
                    <div className="analysis-content">
                        {documentContext.videoAnalysis}
                    </div>
                    <a href={documentContext.url} target="_blank" rel="noopener noreferrer" className="analysis-link">
                        View Source Resource →
                    </a>
                </motion.div>
            )}

            {/* Messages Area */}
            <div className="vu-messages">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`vu-msg-wrapper ${msg.sender}`}
                        >
                            <div className={`vu-bubble ${msg.sender} ${msg.isError ? 'error' : ''}`}>
                                <div className="markdown-content">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {msg.text}
                                    </ReactMarkdown>
                                </div>
                                {msg.sender === 'bot' && !msg.isError && (
                                    <button
                                        className={`copy-btn ${copiedId === msg.id ? 'copied' : ''}`}
                                        onClick={() => copyToClipboard(msg.text, msg.id)}
                                        title="Copy response"
                                        style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.5 }}
                                    >
                                        {copiedId === msg.id ? <FaCheck size={12} /> : <FaRegCopy size={12} />}
                                    </button>
                                )}
                            </div>
                            <div className="vu-timestamp">
                                {msg.sender === 'user' ? 'You' : 'VU Agent'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="vu-typing"
                    >
                        <div className="neural-pulse-loader"></div>
                        <span>Processing...</span>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggestions Chips - Only for Students */}
            {userProfile?.role === 'student' && (
                <div className="vu-suggestions">
                    {suggestions.map((s, i) => (
                        <div
                            key={i}
                            className="suggestion-chip"
                            onClick={() => {
                                handleSend(null, s);
                            }}
                        >
                            {s}
                        </div>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <form onSubmit={handleSend} className="vu-input-area">
                <div className="vu-input-wrapper">
                    <input
                        type="text"
                        className="vu-input-field"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your question..."
                        disabled={isLoading || isHistoryLoading}
                    />
                    <button
                        type="submit"
                        className={`vu-send-btn`}
                        disabled={isLoading || !input.trim() || isHistoryLoading}
                    >
                        <FaPaperPlane size={16} />
                    </button>
                    {lastFailedText && !isLoading && (
                        <button
                            type="button"
                            title="Retry last message"
                            className="vu-retry-btn"
                            onClick={() => handleSend(null, lastFailedText)}
                            style={{ marginLeft: '8px', background: 'transparent', border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 8px', cursor: 'pointer' }}
                        >
                            Retry
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default VuAiAgent;
