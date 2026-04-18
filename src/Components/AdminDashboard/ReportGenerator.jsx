import React, { useState, useEffect, useCallback } from 'react';
import './ReportGenerator.css';
import { FaFilePdf, FaFileExcel, FaCalendarAlt, FaDownload, FaSpinner } from 'react-icons/fa';

const ReportGenerator = ({ onClose }) => {
    const [startDate, setStartDate] = useState(getDefaultStartDate());
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [format, setFormat] = useState('pdf');
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    function getDefaultStartDate() {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return date.toISOString().split('T')[0];
    }

    const fetchSummary = useCallback(async () => {
        try {
            setLoading(true);
            try {
                const data = await (await import('../../utils/apiClient')).apiGet(`/api/reports/summary?startDate=${startDate}&endDate=${endDate}`);
                setSummary(data);
                setError(null);
            } catch (e) {
                console.error('Summary error (apiGet):', e);
                setError('Failed to load report summary');
            }
        } catch (err) {
            console.error('Summary error:', err);
            setError('Failed to load report summary');
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        fetchSummary();
    }, [startDate, endDate, fetchSummary]);

    const generateReport = async () => {
        try {
            setGenerating(true);
            setError(null);
            setSuccessMessage('');

            const endpoint = format === 'pdf' ? 'pdf' : 'excel';
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/reports/${endpoint}?startDate=${startDate}&endDate=${endDate}`, {
                method: 'GET',
                headers: {
                    ...(window.localStorage && window.localStorage.getItem('adminToken') ? { 'Authorization': `Bearer ${window.localStorage.getItem('adminToken')}` } : {})
                }
            });

            if (!response.ok) {
                const text = await response.text().catch(() => '');
                throw new Error(`Failed to generate ${format} report: ${response.status} ${text.substring(0, 200)}`);
            }

            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json') || contentType.includes('text/html')) {
                // Server returned HTML or JSON error instead of file
                const text = await response.text().catch(() => '');
                throw new Error(`Unexpected response when generating report: ${text.substring(0, 400)}`);
            }

            // Get the filename from response headers or create default
            const contentDisposition = response.headers.get('content-disposition');
            const filename = contentDisposition
                ? contentDisposition.split('filename=')[1].replace(/"/g, '')
                : `Attendance-Report-${Date.now()}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;

            // Download file
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            setSuccessMessage(`✅ ${format.toUpperCase()} report generated successfully!`);
            setTimeout(() => setSuccessMessage(''), 3000);

        } catch (err) {
            console.error('Generate error:', err);
            setError(`Failed to generate report: ${err.message}`);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="report-generator-modal-overlay">
            <div className="report-generator-modal">
                <div className="report-header">
                    <h2>📊 Generate Attendance Report</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="report-content">
                    {/* Date Range Selection */}
                    <div className="report-section">
                        <h3>📅 Select Date Range</h3>
                        <div className="date-range-picker">
                            <div className="date-input-group">
                                <label>Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    max={endDate}
                                />
                                <FaCalendarAlt className="date-icon" />
                            </div>
                            <div className="date-separator">→</div>
                            <div className="date-input-group">
                                <label>End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    min={startDate}
                                    max={new Date().toISOString().split('T')[0]}
                                />
                                <FaCalendarAlt className="date-icon" />
                            </div>
                        </div>
                    </div>

                    {/* Summary Statistics */}
                    {summary && (
                        <div className="report-section">
                            <h3>📈 Report Summary</h3>
                            <div className="summary-grid">
                                <div className="summary-card">
                                    <span className="summary-label">Period</span>
                                    <span className="summary-value">{summary.dateRange.days} days</span>
                                </div>
                                <div className="summary-card">
                                    <span className="summary-label">Total Records</span>
                                    <span className="summary-value">{summary.statistics.totalRecords}</span>
                                </div>
                                <div className="summary-card">
                                    <span className="summary-label">Overall Attendance</span>
                                    <span className="summary-value" style={{ color: summary.statistics.attendancePercent >= 75 ? '#10b981' : '#f59e0b' }}>
                                        {summary.statistics.attendancePercent}%
                                    </span>
                                </div>
                                <div className="summary-card">
                                    <span className="summary-label">Students</span>
                                    <span className="summary-value">{summary.statistics.studentCount}</span>
                                </div>
                                <div className="summary-card">
                                    <span className="summary-label">Faculty</span>
                                    <span className="summary-value">{summary.statistics.facultyCount}</span>
                                </div>
                                <div className="summary-card">
                                    <span className="summary-label">Classes</span>
                                    <span className="summary-value">{summary.statistics.classCount}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Format Selection */}
                    <div className="report-section">
                        <h3>📄 Choose Format</h3>
                        <div className="format-selector">
                            <button
                                className={`format-btn ${format === 'pdf' ? 'active' : ''}`}
                                onClick={() => setFormat('pdf')}
                            >
                                <FaFilePdf className="format-icon" />
                                <span>PDF Report</span>
                                <span className="format-desc">Best for sharing & printing</span>
                            </button>
                            <button
                                className={`format-btn ${format === 'excel' ? 'active' : ''}`}
                                onClick={() => setFormat('excel')}
                            >
                                <FaFileExcel className="format-icon" />
                                <span>Excel Spreadsheet</span>
                                <span className="format-desc">Best for analysis & filtering</span>
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    {error && <div className="error-message">⚠️ {error}</div>}
                    {successMessage && <div className="success-message">✅ {successMessage}</div>}

                    {/* Loading State */}
                    {(loading || generating) && (
                        <div className="report-loading">
                            <FaSpinner className="spinner" />
                            <p>{generating ? 'Generating report...' : 'Loading summary...'}</p>
                        </div>
                    )}
                </div>

                <div className="report-actions">
                    <button className="btn-cancel" onClick={onClose}>Cancel</button>
                    <button
                        className="btn-generate"
                        onClick={generateReport}
                        disabled={generating || loading}
                    >
                        {generating ? (
                            <>
                                <FaSpinner className="spinner-inline" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <FaDownload />
                                Generate {format.toUpperCase()}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportGenerator;
