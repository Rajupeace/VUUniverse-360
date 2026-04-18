import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const AdmissionDetailsForm = ({ studentData }) => {
    const [formData, setFormData] = useState({
        admissionType: '',
        rank: '',
        admissionNumber: '',
        category: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (studentData?.admissionDetails) {
            setFormData({
                admissionType: studentData.admissionDetails.type || '',
                rank: studentData.admissionDetails.rank || '',
                admissionNumber: studentData.admissionDetails.number || '',
                category: studentData.admissionDetails.category || ''
            });
        }
    }, [studentData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const token = localStorage.getItem('studentToken');
            const sid = studentData?.sid;
            
            await axios.put(
                `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/students/admission-details/${sid}`,
                formData,
                { headers: { 'x-student-token': token } }
            );

            setMessage({ type: 'success', text: 'Admission details updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to update details' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mt-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                🎓 Admission Details
            </h3>
            
            {message && (
                <div className={`p-3 mb-4 rounded-lg text-sm font-medium ${
                    message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                }`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Admission Mode</label>
                    <select
                        name="admissionType"
                        value={formData.admissionType}
                        onChange={handleChange}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700"
                    >
                        <option value="">Select Mode</option>
                        <option value="EAMCET">EAMCET</option>
                        <option value="V-SET">V-SET</option>
                        <option value="ECET">ECET</option>
                        <option value="JEE_MAINS">JEE Mains</option>
                        <option value="MANAGEMENT">Management Quota</option>
                        <option value="SPOT">Spot Admission</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rank / Score</label>
                    <input
                        type="text"
                        name="rank"
                        value={formData.rank}
                        onChange={handleChange}
                        placeholder="e.g. 12500"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Admission / Hall Ticket No</label>
                    <input
                        type="text"
                        name="admissionNumber"
                        value={formData.admissionNumber}
                        onChange={handleChange}
                        placeholder="Enter Hall Ticket Number"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700"
                    >
                        <option value="">Select Category</option>
                        <option value="OC">OC</option>
                        <option value="BC-A">BC-A</option>
                        <option value="BC-B">BC-B</option>
                        <option value="BC-C">BC-C</option>
                        <option value="BC-D">BC-D</option>
                        <option value="BC-E">BC-E</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                        <option value="EWS">EWS</option>
                    </select>
                </div>

                <div className="md:col-span-2 flex justify-end mt-2">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg shadow-indigo-200 transition-all ${
                            loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700'
                        }`}
                    >
                        {loading ? 'Saving...' : 'Save Admission Details'}
                    </motion.button>
                </div>
            </form>
        </div>
    );
};

export default AdmissionDetailsForm;
