import React, { useState, useEffect } from 'react';
import { FaUserPlus, FaBook, FaBullhorn, FaTimes, FaBell } from 'react-icons/fa';
import sseClient from '../../utils/sseClient';
import './GlobalNotifications.css';

const GlobalNotifications = ({ userRole, userData }) => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const unsubscribe = sseClient.onUpdate((data) => {
            handleNotification(data);
        });
        return () => unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userRole, userData]);

    const handleNotification = (data) => {
        let newNotif = null;
        const timestamp = new Date().toLocaleTimeString();

        // -----------------------------
        // 1. STUDENT CREATED EVENTS
        // -----------------------------
        if (data.resource === 'students' && data.action === 'create') {
            const student = data.data;

            // Admin: Always sees this
            if (userRole === 'admin') {
                newNotif = {
                    id: Date.now(),
                    type: 'info',
                    iconType: 'user-plus',
                    title: 'New Student Enrolled',
                    message: `${student.studentName} joined Year ${student.year} (${student.branch} - Sec ${student.section})`,
                    time: timestamp
                };
            }
            // Faculty: Sees if student is in their class sections
            else if (userRole === 'faculty' && userData?.assignments) {
                // Check if faculty teaches this year/section
                // assignments example: [{ year: '2', section: 'A' }, ...]
                const isRelevant = userData.assignments.some(a =>
                    String(a.year) === String(student.year) &&
                    (a.section === 'All' || a.section === student.section)
                );

                if (isRelevant) {
                    newNotif = {
                        id: Date.now(),
                        type: 'success',
                        iconType: 'user-plus',
                        title: 'New Student in Your Class',
                        message: `${student.studentName} has been added to Year ${student.year} Section ${student.section}.`,
                        time: timestamp
                    };
                }
            }
        }

        // -----------------------------
        // 2. MATERIAL UPLOAD EVENTS
        // -----------------------------
        if (data.resource === 'materials' && data.action === 'create') {
            const material = data.data;

            // Admin: Sees upload log
            if (userRole === 'admin') {
                newNotif = {
                    id: Date.now(),
                    type: 'info',
                    iconType: 'book',
                    title: 'Material Uploaded',
                    message: `Faculty uploaded "${material.title}" for Year ${material.year} ${material.subject}.`,
                    time: timestamp
                };
            }
            // Student: Sees if it matches their year/section
            else if (userRole === 'student' && userData) {
                if (String(userData.year) === String(material.year)) {
                    newNotif = {
                        id: Date.now(),
                        type: 'accent',
                        iconType: 'book',
                        title: 'New Study Material',
                        message: `New Notes: "${material.title}" available in ${material.subject}.`,
                        time: timestamp
                    };
                }
            }
        }

        // -----------------------------
        // 3. BROADCAST MESSAGES
        // -----------------------------
        if (data.resource === 'messages' && (data.action === 'create' || data.action === 'broadcast')) {
            const msg = data.data;
            // Filter based on target
            let show = false;

            if (userRole === 'admin') show = true;
            else if (msg.target === 'all') show = true;
            else if (msg.target === 'students' && userRole === 'student') show = true;
            else if (msg.target === 'faculty' && userRole === 'faculty') show = true;
            else if (msg.target === 'students-specific' && userRole === 'student') {
                const yearMatch = String(userData?.year) === String(msg.targetYear);
                const sectionMatch = !msg.targetSections || msg.targetSections.length === 0 ||
                    msg.targetSections.includes(String(userData?.section)) ||
                    msg.targetSections.includes('All');
                if (yearMatch && sectionMatch) show = true;
            }

            if (show) {
                newNotif = {
                    id: Date.now(),
                    type: msg.senderRole === 'faculty' ? 'success' : 'warning',
                    iconType: 'bullhorn',
                    title: msg.senderRole === 'faculty' ? 'Faculty Announcement' : 'System Announcement',
                    message: msg.message || msg.text,
                    time: timestamp
                };
            }
        }

        if (newNotif) {
            addNotification(newNotif);
        }
    };

    const addNotification = (notif) => {
        setNotifications(prev => {
            // Remove duplicates by message content if recent
            const isDuplicate = prev.some(n => n.message === notif.message && (Date.now() - n.id < 5000));
            if (isDuplicate) return prev;
            return [notif, ...prev].slice(0, 5); // Keep max 5
        });

        // Auto remove after 7 seconds
        setTimeout(() => {
            removeNotification(notif.id);
        }, 7000);
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    if (notifications.length === 0) return null;

    return (
        <div className="global-notification-container">
            {notifications.map(n => {
                const getIcon = () => {
                    switch (n.iconType) {
                        case 'user-plus': return <FaUserPlus />;
                        case 'book': return <FaBook />;
                        case 'bullhorn': return <FaBullhorn />;
                        default: return <FaBell />;
                    }
                };

                return (
                    <div key={n.id} className={`glass-toast toast-${n.type} animate-toast-in`}>
                        <div className="toast-icon-box">
                            {getIcon()}
                        </div>
                        <div className="toast-content">
                            <div className="toast-header">
                                <span className="toast-title">{n.title}</span>
                                <span className="toast-time">{n.time}</span>
                            </div>
                            <div className="toast-message">{n.message}</div>
                        </div>
                        <button className="toast-close" onClick={() => removeNotification(n.id)}>
                            <FaTimes />
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default GlobalNotifications;
