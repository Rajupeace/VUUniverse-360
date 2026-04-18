import React from 'react';
import './SubjectAttendanceCard.css';

/**
 * SubjectAttendanceCard Component
 * Displays attendance and marks information for a specific subject
 */
const SubjectAttendanceCard = ({
    subjectName,
    attendancePercentage,
    attendedClasses,
    totalClasses,
    marksObtained,
    marksTotal,
    credits,
    status,
    onClick
}) => {
    // Calculate percentage
    const marksPercentage = marksTotal ? ((marksObtained / marksTotal) * 100).toFixed(1) : 0;

    // Determine status class
    const getStatusClass = (type = 'border') => {
        let statusClass = 'good';
        if (attendancePercentage < 65) statusClass = 'critical';
        else if (attendancePercentage < 75) statusClass = 'warning';

        return type === 'border' ? `status-${statusClass}` : `bg-${statusClass}`;
    };

    return (
        <div
            className={`subject-attendance-card ${getStatusClass('border')}`}
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            <div className="card-header">
                <h4 className="subject-name">{subjectName}</h4>
                <span className={`status-badge ${getStatusClass('bg')}`}>
                    {status || 'Active'}
                </span>
            </div>

            <div className="card-body">
                <div className="stat-item">
                    <label>Attendance Records</label>
                    <div className="stat-value">
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '4px' }}>
                            <span className="percentage">{attendancePercentage}</span>
                            {(totalClasses > 0 || attendedClasses > 0) && (
                                <span className="classes-count" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>
                                    {attendedClasses} / {totalClasses} Classes
                                </span>
                            )}
                        </div>
                        <div className="progress-bar">
                            <div
                                className={`progress-fill ${getStatusClass('bg')}`}
                                style={{
                                    width: `${attendancePercentage}%`
                                }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="stat-item">
                    <label>Performance Intel</label>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="percentage" style={{ fontSize: '1.5rem' }}>{marksPercentage}</span>
                        <span className="marks-text">
                            {marksObtained} / {marksTotal} PTS
                        </span>
                    </div>
                </div>

                {credits && (
                    <div className="stat-item">
                        <label>Academic Weight</label>
                        <span className="credits-value" style={{ fontWeight: 900, fontSize: '1.1rem', color: '#1e293b' }}>{credits} CREDITS</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubjectAttendanceCard;
