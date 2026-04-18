import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCreditCard, FaHistory, FaCheckCircle, FaExclamationTriangle, FaReceipt, FaUniversity, FaArrowRight, FaShieldAlt } from 'react-icons/fa';
import { apiGet, apiPost } from '../../../utils/apiClient';
import sseClient from '../../../utils/sseClient';
import './CollegeFees.css';

const CollegeFees = ({ userData }) => {
    const [feeData, setFeeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('UPI');
    const [notification, setNotification] = useState(null);
    const [selectedTxn, setSelectedTxn] = useState(null);

    const fetchFees = useCallback(async () => {
        try {
            setLoading(true);
            const data = await apiGet(`/api/fees/student/${userData.sid}`);
            if (data) {
                setFeeData(data);
            }
        } catch (error) {
            console.error('Error fetching fees:', error);
        } finally {
            setLoading(false);
        }
    }, [userData.sid]);

    useEffect(() => {
        fetchFees();
    }, [fetchFees]);

    // Real-time Update Listener
    useEffect(() => {
        const unsub = sseClient.onUpdate((ev) => {
            if (ev && ev.resource === 'fees') {
                console.log('📡 College Fees Refresh Triggered via SSE');
                fetchFees();
            }
        });
        return () => unsub();
    }, [fetchFees]);

    const [showCheckout, setShowCheckout] = useState(false);

    const startPayment = (e) => {
        e.preventDefault();
        if (!amount || isNaN(amount) || amount <= 0) {
            setNotification({ type: 'error', message: 'Please enter a valid amount' });
            return;
        }
        setShowCheckout(true);
    };

    const confirmPayment = async () => {
        try {
            setShowCheckout(false);
            setPaying(true);
            const result = await apiPost('/api/fees/pay', {
                sid: userData.sid,
                amount: parseFloat(amount),
                method
            });

            if (result) {
                setFeeData(result.fee);
                setAmount('');
                setNotification({ type: 'success', message: 'Payment successful! Receipt generated.' });
                setTimeout(() => setNotification(null), 5000);
            }
        } catch (error) {
            setNotification({ type: 'error', message: 'Payment failed. Please try again.' });
        } finally {
            setPaying(false);
        }
    };

    if (loading) {
        return (
            <div className="fees-container">
                <div className="loading-shimmer">
                    <div className="shimmer-header"></div>
                    <div className="shimmer-grid">
                        <div className="shimmer-card"></div>
                        <div className="shimmer-card"></div>
                        <div className="shimmer-card"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fees-container"
        >
            <div className="fees-mesh-bg"></div>

            <header className="fees-header">
                <div className="flex justify-between items-center z-10 relative">
                    <div>
                        <motion.h2
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            College <span>Fees</span>
                        </motion.h2>
                        <p>Manage your academic financial records securely.</p>
                    </div>
                    <motion.div
                        initial={{ rotate: -20, scale: 0.8 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                    >
                        <FaUniversity size={50} style={{ opacity: 0.2 }} />
                    </motion.div>
                </div>
            </header>

            {notification && (
                <div className={`notification ${notification.type} animate-bounce-in`}>
                    {notification.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                    <span>{notification.message}</span>
                </div>
            )}

            <div className="fees-summary-grid">
                <motion.div whileHover={{ y: -5 }} className="fee-card total">
                    <span className="label">Total Fee</span>
                    <span className="value">₹{(feeData?.totalFee || 0).toLocaleString()}</span>
                    <div className="card-bg-icon"><FaUniversity /></div>
                </motion.div>
                <motion.div whileHover={{ y: -5 }} className="fee-card paid">
                    <span className="label">Paid Amount</span>
                    <span className="value">₹{(feeData?.paidAmount || 0).toLocaleString()}</span>
                    <div className="card-bg-icon"><FaCheckCircle /></div>
                </motion.div>
                <motion.div whileHover={{ y: -5 }} className="fee-card due">
                    <span className="label">Outstanding Due</span>
                    <span className="value">₹{(feeData?.dueAmount || 0).toLocaleString()}</span>
                    <div className="card-bg-icon"><FaExclamationTriangle /></div>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="fee-progress-panel glass-panel"
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                        <FaShieldAlt style={{ display: 'inline', marginTop: '-3px', marginRight: '6px', color: 'var(--cf-primary)' }} />
                        Payment Progress
                    </h3>
                    <span className="text-sm font-black text-indigo-600">
                        {feeData?.totalFee ? Math.round(((feeData.paidAmount || 0) / feeData.totalFee) * 100) : 0}% COMPLETE
                    </span>
                </div>
                <div className="progress-track">
                    <motion.div
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${feeData?.totalFee ? ((feeData.paidAmount || 0) / feeData.totalFee) * 100 : 0}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    ></motion.div>
                </div>
                <div className="flex justify-between text-[0.65rem] font-bold text-slate-400 mt-3 tracking-widest uppercase">
                    <span>ACADEMIC YEAR {feeData?.academicYear || '2025-26'}</span>
                    <span>SEMESTER: {feeData?.semester || 'Current'}</span>
                </div>
            </motion.div>

            <div className="payment-section">
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="payment-form-card"
                >
                    <h3><FaCreditCard /> Secure Payment</h3>
                    <form onSubmit={startPayment}>
                        <div className="form-group">
                            <label>Payment Amount (INR)</label>
                            <div className="input-wrapper">
                                <span className="currency-symbol">₹</span>
                                <input
                                    type="number"
                                    placeholder="Enter amount to pay"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    max={feeData?.dueAmount}
                                    disabled={feeData?.dueAmount === 0}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Payment Gateway</label>
                            <select value={method} onChange={(e) => setMethod(e.target.value)}>
                                <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                                <option value="Card">Credit / Debit Card</option>
                                <option value="Net Banking">Net Banking</option>
                            </select>
                        </div>
                        <motion.button
                            whileHover={{ scale: (feeData?.dueAmount === 0 || !amount) ? 1 : 1.02 }}
                            whileTap={{ scale: (feeData?.dueAmount === 0 || !amount) ? 1 : 0.98 }}
                            type="submit"
                            className="pay-btn"
                            disabled={paying || feeData?.dueAmount === 0 || !amount}
                        >
                            {paying ? 'Processing...' : `Pay ₹${amount || '0'} Now`} <FaArrowRight style={{ marginLeft: '8px' }} />
                        </motion.button>
                    </form>
                </motion.div>

                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="history-card"
                >
                    <h3><FaHistory /> Payment Ledger</h3>
                    <div className="transaction-list">
                        {feeData?.transactions?.length > 0 ? (
                            [...feeData.transactions].reverse().map((txn, index) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    className="transaction-item group"
                                    key={index}
                                >
                                    <div className="txn-info">
                                        <span className="txn-date">{new Date(txn.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                                        <span className="txn-id">{txn.transactionId} <span className="method-pill">{txn.method}</span></span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="txn-amount">₹{txn.amount.toLocaleString()}</span>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="receipt-trigger-btn"
                                            title="View Digital Receipt"
                                            onClick={() => setSelectedTxn(txn)}
                                        >
                                            <FaReceipt />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="empty-ledger">
                                <FaHistory />
                                <p>No transaction history found.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            <AnimatePresence>
                {selectedTxn && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="receipt-modal-overlay blur-overlay"
                        onClick={() => setSelectedTxn(null)}
                    >
                        <motion.div
                            initial={{ y: 50, opacity: 0, scale: 0.9 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 20, opacity: 0, scale: 0.95 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="receipt-modal-content"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="receipt-paper">
                                <div className="receipt-header">
                                    <div className="clg-logo"><FaUniversity /></div>
                                    <h2>SECURE PAYMENT RECEIPT</h2>
                                    <p>VIGNAN UNIVERSITY SECURE LEDGER</p>
                                </div>

                                <div className="receipt-body">
                                    <div className="r-row">
                                        <span className="r-label">Date:</span>
                                        <span className="r-val">{new Date(selectedTxn.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="r-row">
                                        <span className="r-label">Transaction ID:</span>
                                        <span className="r-val mono-font">{selectedTxn.transactionId}</span>
                                    </div>
                                    <div className="r-row">
                                        <span className="r-label">Student ID:</span>
                                        <span className="r-val bold-font">{userData.sid.toUpperCase()}</span>
                                    </div>
                                    <div className="r-row">
                                        <span className="r-label">Student Name:</span>
                                        <span className="r-val">{userData.studentName}</span>
                                    </div>
                                    <div className="r-row">
                                        <span className="r-label">Academic Year:</span>
                                        <span className="r-val">{feeData.academicYear} / {feeData.semester}</span>
                                    </div>
                                    <hr className="r-divider" />
                                    <div className="r-row r-amount-row">
                                        <span className="r-label">Amount Cleared:</span>
                                        <span className="r-amount">₹{selectedTxn.amount.toLocaleString()}</span>
                                    </div>
                                    <div className="r-row">
                                        <span className="r-label">Payment Method:</span>
                                        <span className="r-val">{selectedTxn.method}</span>
                                    </div>
                                    <div className="r-row r-status-row">
                                        <span className="r-label">Gateway Status:</span>
                                        <span className="r-status-success"><FaCheckCircle className="inline mr-1" /> VERIFIED</span>
                                    </div>
                                </div>

                                <div className="receipt-footer">
                                    <p>This is a computer-generated digital receipt and requires no physical signature.</p>
                                    <div className="barcode">|||| ||| ||||| || |||| ||</div>
                                    <button className="print-btn" onClick={() => window.print()}>
                                        <FaReceipt /> PRINT DOCUMENT
                                    </button>
                                </div>
                            </div>
                            <button className="close-receipt hover-float" onClick={() => setSelectedTxn(null)}>×</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showCheckout && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="gateway-overlay blur-overlay"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 30, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: -20, opacity: 0 }}
                            className="gateway-modal glass-gateway"
                        >
                            <div className="gateway-header">
                                <div className="gateway-brand">
                                    <div className="clg-icon-box"><FaShieldAlt /></div>
                                    <div>
                                        <h4>Vignan Secure Pay</h4>
                                        <span>ENCRYPTED GATEWAY</span>
                                    </div>
                                </div>
                                <button className="gateway-close hover-float" onClick={() => setShowCheckout(false)}>×</button>
                            </div>

                            <div className="gateway-body">
                                <div className="gateway-amount-display">
                                    <span>AMOUNT TO AUTHORIZE</span>
                                    <h2>₹{parseFloat(amount || 0).toLocaleString()}</h2>
                                </div>

                                <div className="payment-method-strip">
                                    <div className="strip-label flex items-center gap-2">
                                        <FaCreditCard /> {method}
                                    </div>
                                    <div className="strip-badge premium-badge">SECURE 256-BIT SSL</div>
                                </div>

                                <div className="gateway-options">
                                    <div className="gateway-option active scale-up">
                                        <FaCheckCircle className="opt-check text-green-500" />
                                        <div className="opt-info">
                                            <strong>INSTANT SETTLEMENT</strong>
                                            <span>Real-time sync to University records</span>
                                        </div>
                                    </div>
                                </div>

                                <p className="gateway-notice">
                                    By clicking complete, you authorize a secure 1-click transaction to the University's primary ledger.
                                </p>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="confirm-pay-btn flex justify-center items-center gap-2"
                                    onClick={confirmPayment}
                                >
                                    {paying ? 'AUTHORIZING REQUEST...' : `COMPLETE PAYMENT - ₹${amount}`}
                                </motion.button>
                            </div>

                            <div className="gateway-footer border-t border-slate-100/10 pt-4 mt-2">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" height="15" alt="PayPal" style={{ opacity: 0.7, filter: 'grayscale(0.5)' }} />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" height="20" alt="Mastercard" style={{ opacity: 0.7, filter: 'grayscale(0.5)' }} />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" height="12" alt="Visa" style={{ opacity: 0.7, filter: 'grayscale(0.5)' }} />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default CollegeFees;
