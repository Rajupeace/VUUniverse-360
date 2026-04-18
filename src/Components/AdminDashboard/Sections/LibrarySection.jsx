import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaSearch, FaBook, FaHistory, FaMapMarkerAlt } from 'react-icons/fa';
import { apiGet } from '../../../utils/apiClient';
import sseClient from '../../../utils/sseClient';

const LibrarySection = () => {
    const [books, setBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const data = await apiGet('/api/library');
                setBooks(data || []);
            } catch (error) {
                console.error('Failed to fetch books:', error);
            }
        };
        fetchBooks();
    }, []);

    // SSE real-time updates
    useEffect(() => {
        const unsub = sseClient.onUpdate((ev) => {
            if (ev && ev.resource === 'library') {
                console.log('🔄 Library SSE Update:', ev.action);
                const fetchBooks = async () => {
                    try {
                        const data = await apiGet('/api/library');
                        setBooks(data || []);
                    } catch (error) {
                        console.error('Failed to fetch books:', error);
                    }
                };
                fetchBooks();
            }
        });
        return unsub;
    }, []);

    return (
        <div className="animate-fade-in">
            <header className="admin-page-header" style={{ marginBottom: '2.5rem' }}>
                <div className="admin-page-title">
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--admin-secondary)' }}>LIBRARY <span style={{ color: 'var(--admin-primary)' }}>NEXUS</span></h1>
                    <p style={{ color: '#64748b', fontWeight: 700 }}>MANAGE CATALOG & CIRCULATION</p>
                </div>
                <button className="admin-btn admin-btn-primary" style={{ height: '48px', borderRadius: '16px' }}>
                    <FaPlus /> CATALOG NEW BOOK
                </button>
            </header>

            <div className="admin-filter-bar" style={{ marginBottom: '2rem', background: 'white', padding: '1rem', borderRadius: '20px', display: 'flex', gap: '1rem', border: '1px solid #f1f5f9' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <FaSearch style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        className="admin-form-input"
                        placeholder="Search catalog by title, author or ISBN..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', paddingLeft: '3.2rem', height: '48px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc' }}
                    />
                </div>
            </div>

            <div className="admin-card" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                <div className="admin-table-wrap">
                    <table className="admin-grid-table" style={{ width: '100%' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                <th style={{ padding: '1.2rem', fontSize: '0.75rem', fontWeight: 950, color: '#64748b', textAlign: 'left' }}>BOOK DETAILS</th>
                                <th style={{ padding: '1.2rem', fontSize: '0.75rem', fontWeight: 950, color: '#64748b', textAlign: 'left' }}>CATEGORY</th>
                                <th style={{ padding: '1.2rem', fontSize: '0.75rem', fontWeight: 950, color: '#64748b', textAlign: 'left' }}>LOCATION</th>
                                <th style={{ padding: '1.2rem', fontSize: '0.75rem', fontWeight: 950, color: '#64748b', textAlign: 'left' }}>AVAILABILITY</th>
                                <th style={{ padding: '1.2rem', fontSize: '0.75rem', fontWeight: 950, color: '#64748b', textAlign: 'right' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {books.map((book) => (
                                <tr key={book._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '1.2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '40px', height: '52px', background: '#f5f3ff', color: '#7c3aed', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', overflow: 'hidden' }}>
                                                {book.coverImage ? (
                                                    <img src={book.coverImage} alt={book.bookTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <FaBook />
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 800, color: '#1e293b' }}>{book.bookTitle}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>by {book.author}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.2rem', fontWeight: 700, color: '#444' }}>{book.category}</td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 800, color: '#64748b' }}>
                                            <FaMapMarkerAlt style={{ color: '#94a3b8' }} /> {book.rackLocation || 'Shelf B-4'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <div style={{ fontWeight: 900, color: book.availableQuantity > 0 ? '#10b981' : '#ef4444' }}>
                                            {book.availableQuantity} / {book.quantity} REAMAINING
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.2rem', textAlign: 'right' }}>
                                        <button className="admin-btn admin-btn-outline" style={{ height: '32px', padding: '0 12px', fontSize: '0.7rem' }}>HISTORY</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LibrarySection;
