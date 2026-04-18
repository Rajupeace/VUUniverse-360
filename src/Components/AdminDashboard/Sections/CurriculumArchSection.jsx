import React, { useState } from 'react';
import { FaEdit, FaSave, FaDraftingCompass, FaPlus, FaTrashAlt, FaLayerGroup, FaRedo } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import '../AdminDashboard.css';

/**
 * Curriculum Designer (Blueprints)
 * Design curriculum structure and topics.
 */
const CurriculumArchSection = () => {
  const [curriculumData, setCurriculumData] = useState(() => {
    const stored = localStorage.getItem('curriculumArch');
    if (stored) return JSON.parse(stored);

    const initial = {};
    const alphaSections = Array.from({ length: 16 }, (_, i) => String.fromCharCode(65 + i)); // A-P
    const numSections = Array.from({ length: 20 }, (_, i) => String(i + 1)); // 1-20
    const allSections = [...alphaSections, ...numSections];

    allSections.forEach(section => {
      initial[section] = {
        name: `Section ${section}`,
        description: '',
        subsections: Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          title: `Topic ${i + 1}`,
          content: '',
          credits: 0,
          duration: '4 weeks'
        }))
      };
    });
    return initial;
  });

  const [activeSection, setActiveSection] = useState('A');

  const saveCurriculum = () => {
    localStorage.setItem('curriculumArch', JSON.stringify(curriculumData));
  };

  const updateSection = (section, field, value) => {
    setCurriculumData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateSubsection = (section, subsectionId, field, value) => {
    setCurriculumData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        subsections: prev[section].subsections.map(sub =>
          sub.id === subsectionId ? { ...sub, [field]: value } : sub
        )
      }
    }));
  };

  const handleSave = () => {
    saveCurriculum();
    alert('✅ BLUEPRINTS FINALIZED: Curriculum saved successfully!');
  };

  const sections = Object.keys(curriculumData).sort();

  const containerVar = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVar = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } }
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVar}
      className="nexus-hub-viewport"
      style={{ padding: '0 2rem' }}
    >
      <motion.header variants={itemVar} className="admin-page-header" style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'var(--admin-secondary)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
          }}>
            <FaDraftingCompass size={32} />
          </div>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--admin-secondary)', letterSpacing: '-1.5px', marginBottom: '4px' }}>
              CURRICULUM <span style={{ color: 'var(--admin-primary)' }}>BLUEPRINTS</span>
            </h1>
            <p style={{ margin: 0, color: 'var(--admin-text-muted)', fontWeight: 850 }}>Academic Structure & Syllabus Architecture</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="admin-btn admin-btn-outline"
            onClick={() => {
              if (window.confirm('Reset blueprints to defaults?')) {
                localStorage.removeItem('curriculumArch');
                window.location.reload();
              }
            }}
          >
            <FaRedo /> RESET
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="admin-btn admin-btn-primary"
            onClick={handleSave}
          >
            <FaSave /> SAVE BLUEPRINTS
          </motion.button>
        </div>
      </motion.header>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', marginBottom: '3rem' }}>
        {/* 🧭 Blueprint Nav */}
        <motion.div variants={itemVar} className="f-node-card" style={{ padding: '1.5rem', height: 'fit-content', border: '1px solid var(--admin-border)', borderRadius: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--admin-border)' }}>
            <FaLayerGroup style={{ color: 'var(--admin-primary)' }} />
            <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 950, color: 'var(--admin-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>System Nodes</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem' }}>
            {sections.map(section => (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                key={section}
                onClick={() => setActiveSection(section)}
                style={{
                  padding: '8px 4px',
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: activeSection === section ? 'var(--admin-primary)' : 'var(--admin-border)',
                  background: activeSection === section ? 'var(--admin-primary)' : 'white',
                  color: activeSection === section ? 'white' : 'var(--admin-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: 950,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {section}
              </motion.button>
            ))}
          </div>
          <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
            <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748b', fontWeight: 700, lineHeight: 1.5 }}>
              Select a node prefix to customize the associated curriculum subjects and topics.
            </p>
          </div>
        </motion.div>

        {/* 📝 Design Workspace */}
        <motion.div variants={itemVar} className="f-node-card" style={{ border: '1px solid var(--admin-border)', borderRadius: '24px', overflow: 'hidden' }}>
          <div style={{ padding: '2rem', background: '#f8fafc', borderBottom: '1px solid var(--admin-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ padding: '2px 8px', background: 'var(--admin-primary)', color: 'white', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 950 }}>NODE: {activeSection}</span>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 950, color: 'var(--admin-secondary)' }}>{curriculumData[activeSection]?.name || `Section ${activeSection}`}</h2>
                </div>
                <input
                  type="text"
                  className="admin-form-input"
                  style={{ background: 'transparent', border: 'none', borderBottom: '2px solid transparent', padding: '4px 0', fontSize: '0.9rem', color: '#64748b', fontWeight: 700, width: '100%', outline: 'none' }}
                  value={curriculumData[activeSection]?.description || ''}
                  placeholder="Add structural description for this curriculum node..."
                  onFocus={(e) => e.target.style.borderColor = 'var(--admin-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'transparent'}
                  onChange={(e) => updateSection(activeSection, 'description', e.target.value)}
                />
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 950, color: 'var(--admin-text-muted)', marginBottom: '4px' }}>LAST MODIFIED</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--admin-secondary)' }}>{new Date().toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          <div style={{ padding: '0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--admin-border)' }}>
                  <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 950, color: '#64748b', textTransform: 'uppercase' }}>Seq</th>
                  <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 950, color: '#64748b', textTransform: 'uppercase' }}>Core Subject / Topic</th>
                  <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 950, color: '#64748b', textTransform: 'uppercase' }}>Focus Content</th>
                  <th style={{ padding: '1.25rem 1.5rem', textAlign: 'center', fontSize: '0.7rem', fontWeight: 950, color: '#64748b', textTransform: 'uppercase' }}>Credits</th>
                  <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 950, color: '#64748b', textTransform: 'uppercase' }}>Duration</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="wait">
                  {curriculumData[activeSection]?.subsections.map((sub, idx) => (
                    <motion.tr
                      key={`${activeSection}-${sub.id}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      style={{ borderBottom: '1px solid var(--admin-border)' }}
                    >
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{ width: '28px', height: '28px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 950, color: 'var(--admin-primary)' }}>
                          {sub.id}
                        </div>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <input
                          type="text"
                          value={sub.title}
                          onChange={(e) => updateSubsection(activeSection, sub.id, 'title', e.target.value)}
                          className="admin-form-input"
                          style={{ border: 'none', background: 'transparent', padding: 0, fontWeight: 800, fontSize: '0.9rem', color: 'var(--admin-secondary)' }}
                        />
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <input
                          type="text"
                          value={sub.content}
                          onChange={(e) => updateSubsection(activeSection, sub.id, 'content', e.target.value)}
                          placeholder="Specify topics..."
                          className="admin-form-input"
                          style={{ border: 'none', background: 'transparent', padding: 0, fontWeight: 700, fontSize: '0.85rem', color: '#64748b' }}
                        />
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                        <input
                          type="number"
                          value={sub.credits}
                          onChange={(e) => updateSubsection(activeSection, sub.id, 'credits', parseFloat(e.target.value))}
                          style={{ width: '40px', border: 'none', background: '#f1f5f9', padding: '4px', borderRadius: '6px', textAlign: 'center', fontWeight: 950, fontSize: '0.85rem', color: 'var(--admin-primary)' }}
                        />
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="text"
                            value={sub.duration}
                            onChange={(e) => updateSubsection(activeSection, sub.id, 'duration', e.target.value)}
                            className="admin-form-input"
                            style={{ border: 'none', background: 'transparent', padding: 0, fontWeight: 800, fontSize: '0.85rem', color: 'var(--admin-secondary)', width: '60px' }}
                          />
                          <button style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }} title="Remove Line">
                            <FaTrashAlt size={12} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                <tr>
                  <td colSpan="5" style={{ padding: '1rem' }}>
                    <motion.button
                      whileHover={{ background: '#f1f5f9' }}
                      style={{ width: '100%', padding: '1rem', border: '2px dashed #e2e8f0', borderRadius: '16px', background: 'transparent', color: '#64748b', fontWeight: 950, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      onClick={() => {
                        setCurriculumData(prev => ({
                          ...prev,
                          [activeSection]: {
                            ...prev[activeSection],
                            subsections: [...prev[activeSection].subsections, {
                              id: prev[activeSection].subsections.length + 1,
                              title: 'New Topic',
                              content: '',
                              credits: 0,
                              duration: '4 weeks'
                            }]
                          }
                        }));
                      }}
                    >
                      <FaPlus /> APPEND NEW CURRICULUM NODE
                    </motion.button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CurriculumArchSection;
