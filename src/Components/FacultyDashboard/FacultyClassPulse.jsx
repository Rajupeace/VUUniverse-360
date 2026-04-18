import React from 'react';
import { FaGraduationCap, FaUserCheck, FaBookReader } from 'react-icons/fa';
import './FacultyClassPulse.css';

const FacultyClassPulse = ({ studentsCount = 0, materialsCount = 0 }) => {
    return (
        <div className="f-stats-grid">
            <div className="f-stats-card">
                <div className="f-stats-header">
                    <div>
                        <div className="f-stats-label">ASSIGNED STUDENTS</div>
                        <div className="f-stats-value">{studentsCount}</div>
                    </div>
                    <div className="f-stats-icon-box" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                        <FaGraduationCap />
                    </div>
                </div>
            </div>

            <div className="f-stats-card">
                <div className="f-stats-header">
                    <div>
                        <div className="f-stats-label">ACTIVE DEPLOYMENTS</div>
                        <div className="f-stats-value">{materialsCount}</div>
                    </div>
                    <div className="f-stats-icon-box" style={{ background: '#fdfce7', color: '#a16207' }}>
                        <FaBookReader />
                    </div>
                </div>
            </div>

            <div className="f-stats-card">
                <div className="f-stats-header">
                    <div>
                        <div className="f-stats-label">POSITIVE FEEDBACK</div>
                        <div className="f-stats-value">94%</div>
                    </div>
                    <div className="f-stats-icon-box" style={{ background: '#f0fdf4', color: '#15803d' }}>
                        <FaUserCheck />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacultyClassPulse;
