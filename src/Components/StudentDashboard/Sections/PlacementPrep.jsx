import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaBriefcase, FaUserTie, FaChevronRight, FaSpinner, FaArrowLeft, FaLaptopCode, FaServer, FaCodeBranch, FaCloud, FaChartBar, FaCheckCircle, FaUniversity, FaLock, FaTimesCircle, FaSync, FaSearch
} from 'react-icons/fa';
import { apiGet, apiPost } from '../../../utils/apiClient';
import './PlacementPrep.css';

const PlacementPrep = ({ userData }) => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [appliedIds, setAppliedIds] = useState({});
    const [applyingId, setApplyingId] = useState(null);
    const [applyToast, setApplyToast] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [selectedDomain, setSelectedDomain] = useState(null);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const studentYear = String(userData?.year || '');
    const isEligibleYear = ['3', '4', '3rd', '4th', 'Third', 'Fourth'].includes(studentYear);

    const fetchCompanies = useCallback(async () => {
        try {
            setLoading(true);
            const res = await apiGet('/api/placements');
            let data = Array.isArray(res) ? res : (res?.data || []);

            if (data.length === 0) {
                data = [
                    {
                        _id: '1', name: 'Google', slug: 'google', color: '#ea4335',
                        package: '25.0 LPA', minCgpa: 8.5, hiringRole: 'Software Engineer (SDE I)',
                        description: 'Engineering excellence meets global scale.',
                        driveStatus: 'Live', driveType: 'On-Campus', eligibleBranches: ['CSE', 'IT', 'ECE'], domains: ['Algorithms', 'System Design'],
                        questions: [
                            { question: 'Reverse a Linked List', answer: 'Use three pointers.', category: 'Technical', difficulty: 'Medium', domain: 'Algorithms' }
                        ]
                    }
                ];
            }
            setCompanies(data);
        } catch (err) {
            console.error('Failed to fetch placement data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchMyApplications = useCallback(async () => {
        if (!userData?.sid) return;
        try {
            const res = await apiGet(`/api/placements/applications/${userData.sid}`);
            const data = Array.isArray(res) ? res : (res?.data || []);
            const map = {};
            data.forEach(a => { map[a.companyId] = a.status; });
            setAppliedIds(map);
        } catch (e) {
            console.warn('Failed to fetch applications');
        }
    }, [userData?.sid]);

    useEffect(() => {
        fetchCompanies();
        fetchMyApplications();
    }, [fetchCompanies, fetchMyApplications]);

    const handleApply = async (company) => {
        if (!userData?.sid) return;
        setApplyingId(company._id);
        try {
            await apiPost('/api/placements/apply', {
                companyId: company._id,
                companyName: company.name,
                studentId: userData.sid,
                studentName: userData.studentName,
                sid: userData.sid,
                branch: userData.branch,
                year: studentYear,
                cgpa: userData.cgpa,
                resume: userData.resume
            });
            setAppliedIds(prev => ({ ...prev, [company._id]: 'Applied' }));
            setApplyToast({ msg: `Successfully applied to ${company.name}! ✅`, type: 'success' });
        } catch (e) {
            setApplyToast({ msg: e.message || 'Application failed', type: 'error' });
        } finally {
            setApplyingId(null);
            setTimeout(() => setApplyToast(null), 3500);
        }
    };

    const getDomainIcon = (domain) => {
        const d = (domain || '').toLowerCase();
        if (d.includes('frontend')) return <FaCodeBranch />;
        if (d.includes('backend')) return <FaServer />;
        return <FaLaptopCode />;
    };

    if (loading) {
        return (
            <div className="nexus-loading-center">
                <FaSpinner className="spinner-icon fa-spin" />
                <p>Establishing Pipeline...</p>
            </div>
        );
    }

    if (!selectedCompany) {
        if (!isEligibleYear) {
            return (
                <div className="placement-container">
                    <div className="restricted-access">
                        <FaLock size={50} />
                        <h2>Placement Drives — Restricted Access</h2>
                        <p>Placement drives are exclusively available to 3rd and 4th Year students.</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="placement-container">
                <div className="placement-hero">
                    <h1>Campus Recruitment Drives</h1>
                    <p>Welcome, {userData?.studentName}. Secure your premium offers.</p>
                </div>
                <div className="company-grid">
                    {companies.map(company => (
                        <motion.div key={company._id} className="premium-company-card" onClick={() => setSelectedCompany(company)}>
                            <h3>{company.name}</h3>
                            <p>{company.package}</p>
                            {company.driveStatus === 'Live' && !appliedIds[company._id] && (
                                <button onClick={(e) => { e.stopPropagation(); handleApply(company); }}>Apply Now</button>
                            )}
                            {appliedIds[company._id] && <span>✅ Applied</span>}
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="placement-details">
            <button onClick={() => setSelectedCompany(null)}><FaArrowLeft /> Back</button>
            <h2>{selectedCompany.name}</h2>
            <div className="domains-list">
                {selectedCompany.domains?.map(d => (
                    <button key={d} onClick={() => setSelectedDomain(d)}>
                        {getDomainIcon(d)} {d}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PlacementPrep;
