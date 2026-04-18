import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FaEdit, FaCheckCircle, FaBookOpen, FaTimes, FaFilter, FaEye,
  FaLayerGroup, FaFileAlt, FaVideo, FaClipboardList,
  FaCloudUploadAlt, FaChartPie, FaCheckDouble, FaExclamationCircle,
  FaRobot, FaPlus
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { apiPut } from '../../../utils/apiClient';
import './FacultyCurriculumArch.css';

/**
 * FACULTY CURRICULUM MANAGEMENT SECTION
 * Professional V5 Upgrade: Planning, Gap Analysis & Resource Tracking
 */
const FacultyCurriculumArch = ({
  myClasses = [],
  materialsList = [],
  allCourses = [],
  loadingCourses = false,
  currentFaculty = {},
  getFileUrl = (url) => url,
  openAiWithPrompt = () => { },
  navigateToMaterials = () => { },
  onRefresh = () => { }
}) => {
  // Use first assigned subject or fallback
  const initialSubject = myClasses.length > 0 ? myClasses[0].subject : 'General';
  const [activeSubject, setActiveSubject] = useState(initialSubject);
  const [activeSection, setActiveSection] = useState('UNIT 1');
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Initialize data structure
  const [curriculumData, setCurriculumData] = useState({});

  // Sync activeSubject with Backend Data
  useEffect(() => {
    if (!activeSubject || allCourses.length === 0) return;

    // Find the course object for this subject
    const courseObj = allCourses.find(c =>
      (c.name?.toLowerCase() === activeSubject.toLowerCase()) ||
      (c.subject?.toLowerCase() === activeSubject.toLowerCase()) ||
      (c.code?.toLowerCase().includes(activeSubject.toLowerCase()))
    );

    if (courseObj && courseObj.modules && courseObj.modules.length > 0) {
      const mappedData = {};
      courseObj.modules.forEach(mod => {
        // Handle three-level hierarchy (modules -> units -> topics) if mod.units exists
        // Here we treat modules as "activeSection" and units as "subsections"
        mappedData[mod.name] = {
          name: mod.name,
          description: mod.description || `Learning path for ${activeSubject} - ${mod.name}`,
          subsections: (mod.units || []).map(u => ({
            id: u.id || u._id || Math.random().toString(36).substr(2, 9),
            title: u.name || u.title || 'Untitled Topic',
            content: u.content || u.description || '',
            topics: u.topics || [] // Preserve deeper levels if present
          }))
        };
        // Ensure at least some default topics if units are empty
        if (mappedData[mod.name].subsections.length === 0) {
          mappedData[mod.name].subsections = Array.from({ length: 5 }, (_, i) => ({
            id: i + 1,
            title: `Topic ${i + 1}`,
            content: ''
          }));
        }
      });
      setCurriculumData(prev => ({ ...prev, [activeSubject]: mappedData }));
    } else if (!curriculumData[activeSubject]) {
      // Fallback Default
      const initial = {};
      const units = ['UNIT 1', 'UNIT 2', 'UNIT 3', 'UNIT 4', 'UNIT 5'];
      units.forEach(unit => {
        initial[unit] = {
          name: unit,
          description: `Educational modules for ${activeSubject} - ${unit}`,
          subsections: Array.from({ length: 5 }, (_, i) => ({
            id: i + 1,
            title: `Topic ${i + 1}`,
            content: '',
            credits: 2,
            duration: '1 week'
          }))
        };
      });
      setCurriculumData(prev => ({ ...prev, [activeSubject]: initial }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubject, allCourses]);

  const updateSubsection = (subj, unit, subsectionId, field, value) => {
    setCurriculumData(prev => ({
      ...prev,
      [subj]: {
        ...prev[subj],
        [unit]: {
          ...prev[subj][unit],
          subsections: prev[subj][unit].subsections.map(sub =>
            sub.id === subsectionId ? { ...sub, [field]: value } : sub
          )
        }
      }
    }));
  };

  const handleSave = async () => {
    const courseObj = allCourses.find(c =>
      (c.name?.toLowerCase() === activeSubject.toLowerCase()) ||
      (c.subject?.toLowerCase() === activeSubject.toLowerCase())
    );

    if (!courseObj) {
      alert("Error: Subject core configuration not found. Cannot persist changes.");
      return;
    }

    const currentSubjectData = curriculumData[activeSubject];
    if (!currentSubjectData) return;

    setSaving(true);
    const modulesPayload = Object.keys(currentSubjectData).map(unitKey => ({
      name: unitKey,
      description: currentSubjectData[unitKey].description,
      units: currentSubjectData[unitKey].subsections.map(sub => ({
        id: sub.id,
        name: sub.title,
        content: sub.content,
        topics: sub.topics || []
      }))
    }));

    try {
      await apiPut(`/api/courses/${courseObj.id || courseObj._id}`, { modules: modulesPayload });
      setEditMode(false);
      onRefresh();
    } catch (e) {
      console.error("Save failed:", e);
      alert("Failed to sync curriculum plan: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const currentSubjectData = useMemo(() => curriculumData[activeSubject] || {}, [curriculumData, activeSubject]);
  const sortedUnits = Object.keys(currentSubjectData).sort();

  // --- GAP ANALYSIS LOGIC ---
  const currentUnitNum = activeSection.replace(/\D/g, '');
  const unitMaterials = useMemo(() => {
    return materialsList.filter(m => {
      const subMatch = (m.subject || '').toLowerCase().includes(activeSubject.toLowerCase());
      const unitMatch = String(m.unit) === String(currentUnitNum);
      return subMatch && unitMatch;
    });
  }, [materialsList, activeSubject, currentUnitNum]);

  const getMaterialsForTopic = useCallback((topicTitle) => {
    if (!topicTitle || topicTitle.includes('Topic')) return [];
    return unitMaterials.filter(m => {
      const mTitle = (m.title || '').toLowerCase();
      const mTopic = (m.topic || '').toLowerCase();
      const tTitle = topicTitle.toLowerCase();
      return mTitle.includes(tTitle) || tTitle.includes(mTitle) || mTopic.includes(tTitle) || tTitle.includes(mTopic);
    });
  }, [unitMaterials]);

  const getTopicCoverage = useCallback((topicTitle) => {
    const matches = getMaterialsForTopic(topicTitle);
    return {
      notes: matches.some(m => m.type === 'notes'),
      video: matches.some(m => m.type === 'videos'),
      paper: matches.some(m => ['modelPapers', 'previousQuestions'].includes(m.type))
    };
  }, [getMaterialsForTopic]);

  // Stats Calculation
  const stats = useMemo(() => {
    const currentUnits = Object.values(currentSubjectData);
    let totalTopics = 0;
    let coveredTopics = 0;

    currentUnits.forEach(u => {
      u.subsections.forEach(t => {
        if (!t.title.includes('Topic')) {
          totalTopics++;
          const cov = getTopicCoverage(t.title);
          if (cov.notes || cov.video || cov.paper) coveredTopics++;
        }
      });
    });

    return {
      total: totalTopics,
      covered: coveredTopics,
      percent: totalTopics > 0 ? Math.round((coveredTopics / totalTopics) * 100) : 0
    };
  }, [currentSubjectData, getTopicCoverage]);

  const handleAiDraft = (topic) => {
    const prompt = `Act as a Curriculum Architect. For the subject "${activeSubject}" and the topic "${topic.title}", provide a concise, professional learning objective (max 20 words).`;
    openAiWithPrompt(prompt);
  };

  const currentActiveSubsections = currentSubjectData[activeSection]?.subsections || [];
  const selectedTopic = currentActiveSubsections.find(s => s.id === selectedTopicId);
  const matchedAssets = selectedTopic ? getMaterialsForTopic(selectedTopic.title) : [];

  return (
    <div className="curriculum-arch-container">
      {/* HEADER SECTION */}
      <header className="f-view-header">
        <div className="view-title-box">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FaLayerGroup style={{ color: 'var(--nexus-primary)' }} />
            CURRICULUM ARCHITECT
          </h2>
          <p className="nexus-subtitle">Syllabus Orchestration & Asset Alignment for: <strong>{activeSubject}</strong></p>
        </div>

        <div className="view-control-cluster">
          <div className="f-pill-control dropdown">
            <FaFilter className="icon-primary" />
            <select
              value={activeSubject}
              onChange={(e) => {
                setActiveSubject(e.target.value);
                setActiveSection('UNIT 1');
                setEditMode(false);
                setSelectedTopicId(null);
              }}
            >
              {myClasses.length > 0 ? (
                myClasses.map(c => (
                  <option key={`${c.subject}-${c.year}`} value={c.subject}>
                    {c.subject} (YEAR {c.year})
                  </option>
                ))
              ) : (
                <option value="General">General Node</option>
              )}
            </select>
          </div>

          <div className="f-node-actions">
            {editMode ? (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="f-quick-btn secondary" onClick={() => setEditMode(false)} style={{ borderRadius: '12px' }}>
                  <FaTimes /> DISCARD
                </button>
                <button className="f-quick-btn success" onClick={handleSave} disabled={saving} style={{ borderRadius: '12px' }}>
                  <FaCheckCircle /> {saving ? 'SYNCING...' : 'SAVE PLAN'}
                </button>
              </div>
            ) : (
              <button className="f-quick-btn primary" onClick={() => setEditMode(true)} style={{ borderRadius: '12px' }}>
                <FaEdit /> MODIFY STRUCTURE
              </button>
            )}
          </div>
        </div>
      </header>

      {/* STATS RIBBON */}
      <div className="curriculum-stats-ribbon">
        <div className="stat-pill">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--cur-primary)' }}>
            <FaLayerGroup />
          </div>
          <div className="stat-info">
            <span className="stat-label">Defined Scope</span>
            <span className="stat-value">{sortedUnits.length} Chapters</span>
          </div>
        </div>

        <div className="stat-pill">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--cur-success)' }}>
            <FaCheckDouble />
          </div>
          <div className="stat-info">
            <span className="stat-label">Alignment Map</span>
            <span className="stat-value">{stats.covered} / {stats.total} Linked</span>
          </div>
        </div>

        <div className="stat-pill">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--cur-warning)' }}>
            <FaChartPie />
          </div>
          <div className="stat-info">
            <span className="stat-label">Readiness Index</span>
            <span className="stat-value">{stats.percent}% Ready</span>
          </div>
        </div>
      </div>

      <div className="curriculum-main-layout">
        {/* SIDEBAR: CHAPTERS */}
        <aside className="unit-sidebar">
          <div className="sidebar-header">
            <FaLayerGroup />
            <h4>CHAPTER INDEX</h4>
          </div>
          <div className="unit-list">
            {sortedUnits.map(unit => (
              <button
                key={unit}
                onClick={() => {
                  setActiveSection(unit);
                  setSelectedTopicId(null);
                }}
                className={`unit-btn ${activeSection === unit ? 'active' : ''}`}
              >
                <span className="unit-name">{unit}</span>
                <span className="unit-meta">
                  {currentSubjectData[unit].subsections.filter(t => !t.title.includes('Topic')).length} Nodes
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* MAIN PLANNER PANEL */}
        <AnimatePresence mode="wait">
          <motion.main
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="content-architect-panel"
          >
            <div className="panel-title-area">
              <h3>{activeSection} <span style={{ fontWeight: 300, color: '#94a3b8' }}>Blueprint</span></h3>
              <p>{currentSubjectData[activeSection]?.description}</p>
            </div>

            <div className="topics-table-container">
              <table className="topics-table">
                <thead>
                  <tr>
                    <th>Topic Description</th>
                    <th>Structural Objective</th>
                    <th style={{ textAlign: 'center' }}>Resource Alignment</th>
                    {editMode && <th style={{ textAlign: 'center' }}>Ops</th>}
                  </tr>
                </thead>
                <tbody>
                  {currentActiveSubsections.map((topic, index) => {
                    const coverage = getTopicCoverage(topic.title);
                    const isMissing = !coverage.notes && !coverage.video && !coverage.paper;
                    const isDefault = topic.title.includes('Topic');
                    const isActive = selectedTopicId === topic.id;

                    return (
                      <motion.tr
                        key={topic.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={`${isDefault && !editMode ? 'muted-row' : ''} ${isActive ? 'active-row' : ''}`}
                        onClick={() => !editMode && setSelectedTopicId(topic.id)}
                        style={{ cursor: editMode ? 'default' : 'pointer' }}
                      >
                        <td className="topic-title-cell">
                          {editMode ? (
                            <input
                              className="search-input"
                              style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
                              value={topic.title}
                              onChange={(e) => updateSubsection(activeSubject, activeSection, topic.id, 'title', e.target.value)}
                              placeholder="Entity name..."
                            />
                          ) : (topic.title)}
                        </td>
                        <td className="objective-cell">
                          {editMode ? (
                            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                              <input
                                className="search-input"
                                style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
                                value={topic.content}
                                onChange={(e) => updateSubsection(activeSubject, activeSection, topic.id, 'content', e.target.value)}
                                placeholder="Core concept..."
                              />
                              <button
                                className="ai-draft-btn"
                                onClick={() => handleAiDraft(topic)}
                                title="Draft with Nexus AI"
                              >
                                <FaRobot />
                              </button>
                            </div>
                          ) : (topic.content || <span style={{ opacity: 0.3, fontStyle: 'italic', fontSize: '0.8rem' }}>Undefined Objective</span>)}
                        </td>
                        <td>
                          <div className="coverage-cell">
                            <FaFileAlt
                              title={coverage.notes ? "Digital Notes Linked" : "Missing Notes"}
                              className={`resource-icon ${coverage.notes ? 'active notes' : 'missing'}`}
                            />
                            <FaVideo
                              title={coverage.video ? "Visual Session Linked" : "Missing Video"}
                              className={`resource-icon ${coverage.video ? 'active video' : 'missing'}`}
                            />
                            <FaClipboardList
                              title={coverage.paper ? "Assessment Map Linked" : "Missing Assessment"}
                              className={`resource-icon ${coverage.paper ? 'active paper' : 'missing'}`}
                            />

                            {!editMode && !isDefault && isMissing && (
                              <div className="gap-alert-tag">
                                <FaExclamationCircle /> GAP
                              </div>
                            )}
                          </div>
                        </td>
                        {editMode && (
                          <td style={{ textAlign: 'center' }}>
                            <button
                              className="f-node-btn delete"
                              onClick={() => {
                                const updated = currentActiveSubsections.filter(s => s.id !== topic.id);
                                setCurriculumData(prev => ({
                                  ...prev,
                                  [activeSubject]: {
                                    ...prev[activeSubject],
                                    [activeSection]: { ...prev[activeSubject][activeSection], subsections: updated }
                                  }
                                }));
                              }}
                              style={{ padding: '0.4rem' }}
                            >
                              <FaTimes />
                            </button>
                          </td>
                        )}
                      </motion.tr>
                    );
                  })}
                  {editMode && (
                    <tr>
                      <td colSpan={4} style={{ padding: 0 }}>
                        <button
                          className="add-topic-row-btn"
                          onClick={() => {
                            const newTopic = { id: Date.now(), title: `Topic ${currentActiveSubsections.length + 1}`, content: '' };
                            setCurriculumData(prev => ({
                              ...prev,
                              [activeSubject]: {
                                ...prev[activeSubject],
                                [activeSection]: {
                                  ...prev[activeSubject][activeSection],
                                  subsections: [...currentActiveSubsections, newTopic]
                                }
                              }
                            }));
                          }}
                        >
                          <FaPlus /> APPEND SYLLABUS NODE
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* INTERACTIVE RESOURCE FEEDBACK AREA */}
            <div className="system-resources-area">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 900, color: '#64748b', letterSpacing: '0.05em' }}>
                  {selectedTopicId ? `LINKED ASSETS FOR: ${selectedTopic?.title}` : `UNIT ASSETS (${unitMaterials.length})`}
                </h4>
                {selectedTopicId && (
                  <button className="clear-selection-btn" onClick={() => setSelectedTopicId(null)}>
                    VIEW ALL UNIT ASSETS
                  </button>
                )}
              </div>

              {(selectedTopicId ? matchedAssets : unitMaterials).length > 0 ? (
                <div className="resources-grid">
                  {(selectedTopicId ? matchedAssets : unitMaterials).map((m, i) => (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={i}
                      className="resource-card-mini"
                    >
                      <div className={`mini-icon ${m.type === 'videos' ? 'video' : 'notes'}`}>
                        {m.type === 'videos' ? <FaVideo /> : <FaBookOpen />}
                      </div>
                      <div className="mini-info">
                        <div className="mini-title" title={m.title}>{m.title}</div>
                      </div>
                      <div className="mini-actions">
                        <button onClick={() => window.open(getFileUrl(m.url), '_blank')} className="mini-view-btn" title="View Source">
                          <FaEye />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="empty-resource-state">
                  <FaCloudUploadAlt style={{ fontSize: '2.5rem', color: '#cbd5e1', marginBottom: '1rem' }} />
                  <p style={{ margin: 0, color: '#94a3b8', fontWeight: 700, fontSize: '0.9rem' }}>
                    {selectedTopicId ? `No specific assets matched "${selectedTopic?.title}"` : 'No materials linked to this unit'}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                    {selectedTopicId ? 'The gap analysis uses title matching. Ensure material titles contain the topic name.' : 'Upload content in the Materials tab to link them here.'}
                  </p>
                  {selectedTopicId && (
                    <button
                      className="f-quick-btn primary"
                      onClick={() => navigateToMaterials(activeSubject, currentUnitNum, selectedTopic.title)}
                      style={{ margin: '0 auto' }}
                    >
                      <FaCloudUploadAlt /> LINK MATERIALS NOW
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FacultyCurriculumArch;
