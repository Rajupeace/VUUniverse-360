import React, { useState, useEffect } from 'react';
import { FaMoon, FaSun, FaRocket } from 'react-icons/fa';
import './ThemeToggle.css';

const ThemeToggle = () => {
    const [theme, setTheme] = useState(localStorage.getItem('system-theme') || 'default');

    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('system-theme', theme);
    }, [theme]);

    const cycleTheme = () => {
        if (theme === 'default') setTheme('cyber');
        else if (theme === 'cyber') setTheme('pearl');
        else setTheme('default');
    };

    return (
        <button className={`theme-toggle-btn ${theme}`} onClick={cycleTheme} title="Switch System Theme">
            {theme === 'default' && <FaMoon />}
            {theme === 'cyber' && <FaRocket className="cyber-spin" />}
            {theme === 'pearl' && <FaSun />}
            <span className="theme-name">{theme.toUpperCase()}</span>
        </button>
    );
};

export default ThemeToggle;
