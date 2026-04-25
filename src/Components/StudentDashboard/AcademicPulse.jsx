import React from 'react';
import { FaChartLine, FaClock, FaFire, FaRobot, FaGraduationCap, FaShieldAlt, FaWaveSquare } from 'react-icons/fa';
import './AcademicPulse.css';

/**
 * DASHBOARD SUMMARY
 * A premium real-time visualization of student academic progress.
 */
const AcademicPulse = ({ data, enrolledSubjects = [] }) => {
    // Data Extraction & Sanitization
    const enrolledNames = new Set(enrolledSubjects.map(s => String(s.name).toLowerCase()));
    const enrolledCodes = new Set(enrolledSubjects.map(s => String(s.code).toLowerCase()));

    // 1. Recalculate Attendance targeting only enrolled subjects (Safe Match)
    const attDetails = Object.entries(data?.attendance?.details || {}).filter(([subj]) => {
        const sLower = subj.toLowerCase();
        return enrolledNames.has(sLower) || enrolledCodes.has(sLower) || enrolledNames.size === 0;
    });

    // Default to existing overall if no specific data found
    let attendance = data?.attendance?.overall ?? data?.overallAttendance ?? 0;

    // Only recalculate if we have meaningful classes tracked
    if (attDetails.length > 0) {
        let totalPresent = 0;
        let totalClasses = 0;
        attDetails.forEach(([, stats]) => {
            totalPresent += stats.present || stats.totalPresent || 0;
            totalClasses += stats.total || stats.totalClasses || 0;
        });
        if (totalClasses > 0) {
            attendance = Math.round((totalPresent / totalClasses) * 100);
        }
    }

    // 2. Recalculate Academic Performance (Safe Match)
    const acadDetails = Object.entries(data?.academics?.details || {}).filter(([subj]) => {
        const sLower = subj.toLowerCase();
        return enrolledNames.has(sLower) || enrolledCodes.has(sLower) || enrolledNames.size === 0;
    });

    // Fix: Prioritize overallPercentage, then performance (fallback), then CGPA conversion
    let marks = data?.academics?.overallPercentage || data?.performance || (data?.academics?.cgpa ? Math.round(data.academics.cgpa * 9.5) : 0);

    if (acadDetails.length > 0) {
        let totalPct = 0;
        let validSubjects = 0;
        acadDetails.forEach(([, stats]) => {
            // Only average subjects that actually have marks data
            if (stats.percentage !== undefined || stats.marks !== undefined) {
                totalPct += stats.percentage || 0;
                validSubjects++;
            }
        });
        if (validSubjects > 0) {
            marks = Math.round(totalPct / validSubjects);
        }
    }

    // Fallback if data is totally missing (Fresh profile)
    if (!attendance && !data?.attendance) attendance = 0;
    if (!marks && !data?.academics) marks = 0;

    const streak = data?.activity?.streak ?? data?.streak ?? data?.progress?.streak ?? 0;
    const aiUsage = data?.activity?.aiUsage ?? data?.aiUsageCount ?? data?.aiUsage ?? data?.progress?.aiUsageCount ?? 0;
    const examsTaken = data?.academics?.totalExamsTaken ?? data?.exams?.completedExams ?? 0;
    const growth = data?.activity?.advancedLearning ?? data?.progress?.advancedProgress ?? 0;

    // Filtered academics for the matrix strip
    const filteredAcademics = acadDetails;

    return (
        <div className="nexus-pulse-v2">
            <div className="pulse-main-content">
                <div className="pulse-rings-container">
                    <div className="nexus-ring-box">
                        <svg className="nexus-ring-svg" viewBox="0 0 100 100">
                            <circle className="ring-bg" cx="50" cy="50" r="45" />
                            <circle className="ring-progress att" cx="50" cy="50" r="45"
                                style={{ strokeDashoffset: 283 - (283 * attendance) / 100 }}
                            />
                        </svg>
                        <div className="ring-content">
                            <span className="ring-val">{attendance}%</span>
                            <span className="ring-label">ATTENDANCE</span>
                        </div>
                    </div>

                    <div className="nexus-ring-box">
                        <svg className="nexus-ring-svg" viewBox="0 0 100 100">
                            <circle className="ring-bg" cx="50" cy="50" r="45" />
                            <circle className="ring-progress perf" cx="50" cy="50" r="45"
                                style={{ strokeDashoffset: 283 - (283 * marks) / 100 }}
                            />
                        </svg>
                        <div className="ring-content">
                            <span className="ring-val">{marks}%</span>
                            <span className="ring-label">PERFORMANCE</span>
                        </div>
                    </div>
                </div>

                <div className="pulse-nodes-grid">
                    <div className="pulse-node-card streak">
                        <div className="node-icon-box"><FaFire /></div>
                        <div className="node-content">
                            <div className="node-value-box">
                                <span className="node-number">{streak}</span>
                                <span className="node-unit">Days</span>
                            </div>
                            <span className="node-desc">STREAK</span>
                        </div>
                    </div>

                    <div className="pulse-node-card ai">
                        <div className="node-icon-box"><FaRobot /></div>
                        <div className="node-content">
                            <div className="node-value-box">
                                <span className="node-number">{aiUsage}</span>
                                <span className="node-unit">%</span>
                            </div>
                            <span className="node-desc">AI USAGE</span>
                        </div>
                    </div>

                    <div className="pulse-node-card exams">
                        <div className="node-icon-box"><FaGraduationCap /></div>
                        <div className="node-content">
                            <div className="node-value-box">
                                <span className="node-number">{examsTaken}</span>
                            </div>
                            <span className="node-desc">EXAMS DONE</span>
                        </div>
                    </div>

                    <div className="pulse-node-card growth">
                        <div className="node-icon-box"><FaChartLine /></div>
                        <div className="node-content">
                            <div className="node-value-box">
                                <span className="node-number">{growth}</span>
                                <span className="node-unit">%</span>
                            </div>
                            <span className="node-desc">GROWTH</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Matrix Strip */}
            {filteredAcademics.length > 0 && (
                <div className="pulse-matrix-strip">
                    <div className="strip-grid">
                        {filteredAcademics.slice(0, 4).map(([subject, stats]) => (
                            <div key={subject} className="strip-item">
                                <div className="strip-item-header">
                                    <span className="s-name">{subject}</span>
                                    <span className="s-val">{stats.percentage}%</span>
                                </div>
                                <div className="s-bar-container">
                                    <div className="s-bar-glow" style={{ width: `${stats.percentage}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AcademicPulse;
