import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaMoneyBillWave, FaHome, FaBus, FaClock, FaCheckCircle, FaExclamationTriangle, 
  FaChartLine, FaUsers, FaFileInvoiceDollar, FaCreditCard, FaCalendarAlt, 
  FaFilter, FaSearch, FaDownload, FaPlus, FaEdit, FaTrash, FaEye, 
  FaBars, FaSignOutAlt, FaTimes, FaRobot, FaSync, FaWallet
} from 'react-icons/fa';
import { apiGet, apiPost, apiPut, apiDelete, resolveImageUrl } from '../../utils/apiClient';
import VuAiAgent from '../VuAiAgent/VuAiAgent';
import StudentSection from '../AdminDashboard/Sections/StudentSection';
import './FinanceManagerDashboard.css';

const FinanceManagerDashboard = ({ managerData, onLogout, isEmbedded }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [feeForm, setFeeForm] = useState({
    studentId: '',
    type: 'hostel',
    amount: '',
    dueDate: '',
    description: '',
    status: 'pending'
  });

  const fetchData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setIsRefreshing(true);
      const [feesRes, studentsRes] = await Promise.all([
        apiGet('/api/fees'),
        apiGet('/api/students')
      ]);

      setFees(Array.isArray(feesRes) ? feesRes : []);
      setStudents(Array.isArray(studentsRes) ? studentsRes : []);
    } catch (error) {
      console.error('Error fetching finance data:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const totalCollected = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + Number(f.amount || 0), 0);
    const totalPending = fees.filter(f => f.status === 'pending').reduce((sum, f) => sum + Number(f.amount || 0), 0);
    const totalOverdue = fees.filter(f => f.status === 'overdue').reduce((sum, f) => sum + Number(f.amount || 0), 0);
    const totalExpected = fees.reduce((sum, f) => sum + Number(f.amount || 0), 0);

    return {
      totalCollected,
      totalPending,
      totalOverdue,
      totalExpected,
      collectionRate: totalExpected > 0 ? ((totalCollected / totalExpected) * 100).toFixed(1) : 0
    };
  }, [fees]);

  const handleFeeSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiPost('/api/fees', feeForm);
      setShowFeeModal(false);
      setFeeForm({ studentId: '', type: 'hostel', amount: '', dueDate: '', description: '', status: 'pending' });
      fetchData(false);
    } catch (error) {
      alert('Failed to save fee record');
    }
  };

  const updateFeeStatus = async (id, status) => {
    try {
      await apiPut(`/api/fees/${id}`, { status });
      fetchData(false);
    } catch (error) {
      console.error('Update failed');
    }
  };

  const renderOverview = () => (
    <div className="finance-overview">
      <div className="finance-stats-grid">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="finance-stat-card total-fees"
        >
          <div className="stat-icon"><FaWallet /></div>
          <div className="stat-content">
            <h3>Total Expected</h3>
            <div className="stat-value">₹{stats.totalExpected.toLocaleString()}</div>
            <div className="stat-change positive">{stats.collectionRate}% Pulse</div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
          className="finance-stat-card paid-fees"
        >
          <div className="stat-icon"><FaCheckCircle /></div>
          <div className="stat-content">
            <h3>Collected</h3>
            <div className="stat-value">₹{stats.totalCollected.toLocaleString()}</div>
            <div className="stat-change positive">Verified</div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="finance-stat-card pending-fees"
        >
          <div className="stat-icon"><FaClock /></div>
          <div className="stat-content">
            <h3>Pending</h3>
            <div className="stat-value">₹{stats.totalPending.toLocaleString()}</div>
            <div className="stat-change warning">In Process</div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }}
          className="finance-stat-card overdue-fees"
        >
          <div className="stat-icon"><FaExclamationTriangle /></div>
          <div className="stat-content">
            <h3>Overdue</h3>
            <div className="stat-value">₹{stats.totalOverdue.toLocaleString()}</div>
            <div className="stat-change danger">Action Required</div>
          </div>
        </motion.div>
      </div>

      <div className="finance-charts-section glass-panel">
        <div className="section-header">
          <h3>Collection Distribution</h3>
          <div className="premium-badge">REAL-TIME DATA</div>
        </div>
        <div className="fee-breakdown">
          <div className="fee-type hostel">
            <FaHome /> 
            <div className="type-info">
              <span>Hostel Records</span>
              <strong>{fees.filter(f => f.type === 'hostel').length} Entries</strong>
            </div>
          </div>
          <div className="fee-type transport">
            <FaBus /> 
            <div className="type-info">
              <span>Transport Records</span>
              <strong>{fees.filter(f => f.type === 'transport').length} Entries</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFeeManagement = () => (
    <div className="fee-management-section">
      <div className="fee-table-container glass-card">
        <table className="fee-table">
          <thead>
            <tr>
              <th>Entity</th>
              <th>Category</th>
              <th>Valuation</th>
              <th>Maturity</th>
              <th>Status</th>
              <th>Directiva</th>
            </tr>
          </thead>
          <tbody>
            {fees.map(fee => (
              <tr key={fee.id || fee._id}>
                <td>
                  <div className="student-info-cell">
                    <div className="mini-id">{fee.studentId}</div>
                    <div className="entity-name">{fee.studentName || 'Student'}</div>
                  </div>
                </td>
                <td>
                  <span className={`fee-type-badge ${fee.type}`}>
                    {fee.type === 'hostel' ? <FaHome /> : <FaBus />} {fee.type}
                  </span>
                </td>
                <td><strong style={{ color: '#1e293b' }}>₹{Number(fee.amount).toLocaleString()}</strong></td>
                <td>{new Date(fee.dueDate).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${fee.status}`}>
                    {fee.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    {fee.status !== 'paid' && (
                      <button className="btn-icon success" type="button" onClick={() => updateFeeStatus(fee.id || fee._id, 'paid')}><FaCheckCircle /></button>
                    )}
                    <button className="btn-icon" type="button"><FaEdit /></button>
                    <button className="btn-icon delete" type="button"><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview': return renderOverview();
      case 'fees': return renderFeeManagement();
      case 'students': return <StudentSection students={students} onRefresh={() => fetchData(false)} />;
      case 'ai-agent': 
        return (
          <div style={{ height: 'calc(100vh - 160px)', background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <VuAiAgent 
              onNavigate={setActiveSection} 
              documentContext={{ 
                title: "Finance & Accounts Analytics", 
                content: `As Finance Agent, I monitor ${fees.length} fee records. Total liquidity: ₹${stats.totalCollected}. Risk exposure (Overdue): ₹${stats.totalOverdue}.`,
                data: { fees, stats } 
              }} 
            />
          </div>
        );
      default: return renderOverview();
    }
  };

  if (loading && fees.length === 0) {
    return (
      <div className="finance-loading-screen">
        <div className="loader-pulse"></div>
        <span>ARCHIVING FINANCIAL CLOUD...</span>
      </div>
    );
  }

  return (
    <div className={`finance-dashboard-container ${sidebarCollapsed ? 'collapsed' : ''} ${isEmbedded ? 'embedded' : ''}`}>
      {!isEmbedded && (
        <aside className="finance-sidebar">
          <div className="sidebar-brand">
            <FaMoneyBillWave className="brand-icon" />
            {!sidebarCollapsed && <span>Vu Finance <small>X-360</small></span>}
          </div>

          <nav className="sidebar-nav">
            <button className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`} onClick={() => setActiveSection('overview')}>
              <FaChartLine /> {!sidebarCollapsed && <span>Overview</span>}
            </button>
            <button className={`nav-item ${activeSection === 'fees' ? 'active' : ''}`} onClick={() => setActiveSection('fees')}>
              <FaFileInvoiceDollar /> {!sidebarCollapsed && <span>Accounts</span>}
            </button>
            <button className={`nav-item ${activeSection === 'students' ? 'active' : ''}`} onClick={() => setActiveSection('students')}>
              <FaUsers /> {!sidebarCollapsed && <span>Registry</span>}
            </button>
            <button className={`nav-item ${activeSection === 'ai-agent' ? 'active' : ''}`} onClick={() => setActiveSection('ai-agent')}>
              <FaRobot /> {!sidebarCollapsed && <span>Finance AI</span>}
            </button>
          </nav>

          <div className="sidebar-footer">
            <div className="m-badge">
              <div className="m-avatar">{managerData?.name?.charAt(0) || 'F'}</div>
              {!sidebarCollapsed && (
                <div className="m-info">
                  <div className="m-name">{managerData?.name || 'Finance Manager'}</div>
                  <div className="m-role">Account Controller</div>
                </div>
              )}
            </div>
            <button className="logout-btn" onClick={onLogout}>
              <FaSignOutAlt /> {!sidebarCollapsed && <span>Exit Dashboard</span>}
            </button>
          </div>
        </aside>
      )}

      <main className="finance-main-content">
        <header className="finance-header">
          <div className="header-left">
            <div className="sync-status">
              <div className="sync-dot pulse"></div>
              <span>FINANCE CLOUD: ONLINE</span>
            </div>
            {isEmbedded ? (
              <div className="embedded-tabs">
                <button className={`tab-btn ${activeSection === 'overview' ? 'active' : ''}`} onClick={() => setActiveSection('overview')}>Analytical</button>
                <button className={`tab-btn ${activeSection === 'fees' ? 'active' : ''}`} onClick={() => setActiveSection('fees')}>Transaction</button>
                <button className={`tab-btn ${activeSection === 'students' ? 'active' : ''}`} onClick={() => setActiveSection('students')}>Students</button>
                <button className={`tab-btn ${activeSection === 'ai-agent' ? 'active' : ''}`} onClick={() => setActiveSection('ai-agent')}>AI Agent</button>
              </div>
            ) : (
              <div className="navigation-group">
                <button className="menu-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                  <FaBars />
                </button>
                <h1>{activeSection.toUpperCase()} HUB</h1>
              </div>
            )}
          </div>
          <div className="header-actions">
            <button className="refresh-btn" type="button" onClick={() => fetchData(false)}>
              <FaSync className={isRefreshing ? 'spin' : ''} />
            </button>
            <button className="btn-primary" type="button" onClick={() => setShowFeeModal(true)}>
              <FaPlus /> RECORD ENTRY
            </button>
          </div>
        </header>

        <div className="dashboard-main-viewport">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {showFeeModal && (
          <div className="modal-overlay" onClick={() => setShowFeeModal(false)}>
            <motion.div
              className="modal-content premium-modal"
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Authorize New Fee Entry</h3>
                <button className="close-btn" type="button" onClick={() => setShowFeeModal(false)}><FaTimes /></button>
              </div>
              <form onSubmit={handleFeeSubmit} className="premium-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Select Operative (Student)</label>
                    <div className="input-with-icon">
                      <FaUsers className="input-icon" />
                      <select
                        value={feeForm.studentId}
                        onChange={(e) => setFeeForm({ ...feeForm, studentId: e.target.value })}
                        required
                      >
                        <option value="">Search Student ID...</option>
                        {students.map(student => (
                          <option key={student.sid} value={student.sid}>
                            {student.sid} - {student.studentName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Transaction Category</label>
                    <div className="input-with-icon">
                      <FaFileInvoiceDollar className="input-icon" />
                      <select
                        value={feeForm.type}
                        onChange={(e) => setFeeForm({ ...feeForm, type: e.target.value })}
                      >
                        <option value="hostel">Hostel Accommodation</option>
                        <option value="transport">Transit Logistics</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Valuation (₹)</label>
                    <div className="input-with-icon">
                      <FaWallet className="input-icon" />
                      <input
                        type="number"
                        placeholder="0.00"
                        value={feeForm.amount}
                        onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Settlement Date</label>
                    <div className="input-with-icon">
                      <FaCalendarAlt className="input-icon" />
                      <input
                        type="date"
                        value={feeForm.dueDate}
                        onChange={(e) => setFeeForm({ ...feeForm, dueDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>Transaction Memo</label>
                  <textarea
                    value={feeForm.description}
                    onChange={(e) => setFeeForm({ ...feeForm, description: e.target.value })}
                    placeholder="Enter additional transaction details..."
                  />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-ghost" onClick={() => setShowFeeModal(false)}>Discard</button>
                  <button type="submit" className="btn-primary">Commit Record</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FinanceManagerDashboard;
