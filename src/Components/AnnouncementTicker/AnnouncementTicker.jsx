import React, { useState, useEffect } from 'react';
import { FaBullhorn, FaTimes } from 'react-icons/fa';
import './AnnouncementTicker.css';

const AnnouncementTicker = ({ messages = [] }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    const activeMessages = messages.length > 0 ? messages : [
        { text: "🚀 Welcome to the Advanced University Portal! Experience the new Cyber and Pearl themes." },
        { text: "📚 New materials uploaded for all Year 2 CSE Subjects. Check them out in Semester Notes." },
        { text: "🤖 Vu AI Agent v2.5 is now live with enhanced academic knowledge." }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % activeMessages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [activeMessages.length]);

    if (!isVisible) return null;

    return (
        <div className="announcement-ticker-container">
            <div className="ticker-icon"><FaBullhorn /></div>
            <div className="ticker-content">
                <div className="ticker-text animate-slide-up" key={currentIndex}>
                    {activeMessages[currentIndex].text || activeMessages[currentIndex].message}
                </div>
            </div>
            <button className="ticker-close" onClick={() => setIsVisible(false)} title="Dismiss Announcements">
                <FaTimes />
            </button>
        </div>
    );
};

export default AnnouncementTicker;
