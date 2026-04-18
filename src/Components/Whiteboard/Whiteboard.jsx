import React, { useRef, useState, useEffect, useCallback } from 'react';
import { FaPencilAlt, FaEraser, FaTrash, FaSave, FaUndo, FaRedo, FaPaintBrush, FaHighlighter, FaFileUpload, FaImage, FaPlus, FaEye, FaHistory } from 'react-icons/fa';
import './Whiteboard.css';

const Whiteboard = ({ onSave, onPreview, historyCount = 0, initialData, isReadOnly = false }) => {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const fileInputRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [lineWidth, setLineWidth] = useState(4);
    const [tool, setTool] = useState('pencil');
    const [history, setHistory] = useState([]);
    const [historyStep, setHistoryStep] = useState(-1);
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [showUploadHelp, setShowUploadHelp] = useState(false);
    const [boardNumber, setBoardNumber] = useState(1);

    // Board History Tracking
    const [boardHistory, setBoardHistory] = useState([]);
    const [showBoardHistory, setShowBoardHistory] = useState(false);
    const [previewBoard, setPreviewBoard] = useState(null);
    const [previewIndex, setPreviewIndex] = useState(-1);
    const [showPreviewModalLocal, setShowPreviewModalLocal] = useState(false);

    // Expanded professional color palette
    const colorPalette = [
        { name: 'Black', value: '#000000' },
        { name: 'White', value: '#FFFFFF' },
        { name: 'Red', value: '#ef4444' },
        { name: 'Orange', value: '#f97316' },
        { name: 'Amber', value: '#f59e0b' },
        { name: 'Yellow', value: '#eab308' },
        { name: 'Lime', value: '#84cc16' },
        { name: 'Green', value: '#22c55e' },
        { name: 'Emerald', value: '#10b981' },
        { name: 'Teal', value: '#14b8a6' },
        { name: 'Cyan', value: '#06b6d4' },
        { name: 'Sky', value: '#0ea5e9' },
        { name: 'Blue', value: '#3b82f6' },
        { name: 'Indigo', value: '#6366f1' },
        { name: 'Violet', value: '#8b5cf6' },
        { name: 'Purple', value: '#a855f7' },
        { name: 'Fuchsia', value: '#d946ef' },
        { name: 'Pink', value: '#ec4899' },
        { name: 'Rose', value: '#f43f5e' },
        { name: 'Gray', value: '#6b7280' }
    ];

    const brushSizes = [
        { label: 'Thin', value: 2 },
        { label: 'Normal', value: 4 },
        { label: 'Medium', value: 8 },
        { label: 'Thick', value: 12 },
        { label: 'Bold', value: 16 }
    ];

    // Define useCallback functions before useEffect
    const redrawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const context = contextRef.current;
        if (!canvas || !context) return;
        const rect = canvas.getBoundingClientRect();

        // Fill with white background in CSS-coordinates
        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.restore();

        // Draw background image if exists
        if (backgroundImage) {
            const img = new Image();
            img.onload = () => {
                context.drawImage(img, 0, 0, rect.width, rect.height);
            };
            img.src = backgroundImage;
        }
    }, [backgroundImage]);

    const saveToHistory = useCallback(() => {
        const canvas = canvasRef.current;
        const dataUrl = canvas.toDataURL();
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push(dataUrl);
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    }, [history, historyStep]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const setupCanvas = () => {
            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            canvas.width = Math.max(1, Math.floor(rect.width * dpr));
            canvas.height = Math.max(1, Math.floor(rect.height * dpr));
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;

            const context = canvas.getContext('2d');
            context.resetTransform && context.resetTransform();
            context.scale(dpr, dpr);
            context.lineCap = 'round';
            context.lineJoin = 'round';
            contextRef.current = context;

            // Ensure clear white background then draw background image
            redrawCanvas();

            if (initialData) {
                const img = new Image();
                img.onload = () => {
                    context.drawImage(img, 0, 0, rect.width, rect.height);
                    saveToHistory();
                };
                img.src = initialData;
            } else {
                saveToHistory();
            }
        };

        setupCanvas();

        const handleResize = () => {
            // Preserve current visible image
            const canvas = canvasRef.current;
            const context = contextRef.current;
            if (!canvas || !context) return;
            const prev = canvas.toDataURL();
            setupCanvas();
            // restore previous drawing scaled to new size
            const img = new Image();
            img.onload = () => {
                context.drawImage(img, 0, 0, canvas.getBoundingClientRect().width, canvas.getBoundingClientRect().height);
            };
            img.src = prev;
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData, backgroundImage, redrawCanvas]);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

                        const fileType = file.type;

                        // Handle images directly
                        if (fileType.startsWith('image/')) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                                setBackgroundImage(event.target.result);
                                setUploadedFile(file.name);
                                setTimeout(() => {
                                    redrawCanvas();
                                    saveToHistory();
                                }, 100);
                            };
                            reader.readAsDataURL(file);
                        }
                        // Handle PDF files - render first page automatically
                        else if (fileType === 'application/pdf') {
                            const reader = new FileReader();
                            reader.onload = async (event) => {
                                try {
                                    if (typeof window.pdfjsLib === 'undefined') {
                                        alert('PDF library not loaded. Please refresh the page.');
                                        return;
                                    }

                                    const pdfData = new Uint8Array(event.target.result);
                                    const loadingTask = window.pdfjsLib.getDocument({ data: pdfData });
                                    const pdf = await loadingTask.promise;
                                    const page = await pdf.getPage(1);

                                    // Render at 2x scale for better quality
                                    const viewport = page.getViewport({ scale: 2.0 });
                                    const tempCanvas = document.createElement('canvas');
                                    const tempContext = tempCanvas.getContext('2d');
                                    tempCanvas.width = viewport.width;
                                    tempCanvas.height = viewport.height;

                                    await page.render({
                                        canvasContext: tempContext,
                                        viewport: viewport
                                    }).promise;

                                    // Convert to image
                                    const imageData = tempCanvas.toDataURL('image/png');
                                    setBackgroundImage(imageData);
                                    setUploadedFile(file.name + ' (Page 1)');

                                    setTimeout(() => {
                                        redrawCanvas();
                                        saveToHistory();
                                    }, 100);
                                } catch (error) {
                                    console.error('PDF rendering error:', error);
                                    alert('Failed to load PDF. Please try converting to an image first.');
                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                }
                            };
                            reader.readAsArrayBuffer(file);
                        }
                        // For PPT files, show help modal
                        else if (file.name.endsWith('.ppt') || file.name.endsWith('.pptx')) {
                            setShowUploadHelp(true);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                        } else {
                            setShowUploadHelp(true);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                        }
                    };

                    const undo = () => {
                        if (historyStep > 0) {
                            const newStep = historyStep - 1;
                            setHistoryStep(newStep);
                            restoreFromHistory(history[newStep]);
                        }
                    };

                    const redo = () => {
                        if (historyStep < history.length - 1) {
                            const newStep = historyStep + 1;
                            setHistoryStep(newStep);
                            restoreFromHistory(history[newStep]);
                        }
                    };

                    const restoreFromHistory = (dataUrl) => {
                        const canvas = canvasRef.current;
                        const context = contextRef.current;
                        const rect = canvas.getBoundingClientRect();
                        const img = new Image();
                        img.onload = () => {
                            context.clearRect(0, 0, canvas.width, canvas.height);
                            context.fillStyle = '#ffffff';
                            context.fillRect(0, 0, canvas.width, canvas.height);
                            context.drawImage(img, 0, 0, rect.width, rect.height);
                        };
                        img.src = dataUrl;
                    };

                    const getPointerPos = (e) => {
                        const canvas = canvasRef.current;
                        const rect = canvas.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        return { x, y };
                    };

                    const startDrawing = (e) => {
                        if (isReadOnly) return;
                        const canvas = canvasRef.current;
                        if (!canvas) return;
                        canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
                        const { x, y } = getPointerPos(e);
                        const ctx = contextRef.current;
                        ctx.beginPath();
                        ctx.moveTo(x, y);
                        setIsDrawing(true);
                    };

                    const draw = (e) => {
                        if (!isDrawing || isReadOnly) return;
                        const { x, y } = getPointerPos(e);
                        const ctx = contextRef.current;

                        if (tool === 'eraser') {
                            ctx.strokeStyle = '#ffffff';
                            ctx.lineWidth = lineWidth * 2;
                            ctx.globalAlpha = 1;
                        } else if (tool === 'highlighter') {
                            ctx.strokeStyle = color;
                            ctx.globalAlpha = 0.25;
                            ctx.lineWidth = Math.max(8, lineWidth * 3);
                        } else if (tool === 'brush') {
                            ctx.strokeStyle = color;
                            ctx.globalAlpha = 1;
                            ctx.lineWidth = Math.max(3, lineWidth * 1.5);
                        } else {
                            ctx.strokeStyle = color;
                            ctx.globalAlpha = 1;
                            ctx.lineWidth = lineWidth;
                        }

                        ctx.lineTo(x, y);
                        ctx.stroke();
                    };

                    const stopDrawing = (e) => {
                        if (!isDrawing) return;
                        const canvas = canvasRef.current;
                        canvas.releasePointerCapture && canvas.releasePointerCapture(e?.pointerId);
                        const ctx = contextRef.current;
                        ctx.closePath();
                        ctx.globalAlpha = 1;
                        setIsDrawing(false);
                        saveToHistory();
                    };

                    const clearCanvas = () => {
                        if (isReadOnly) return;
                        if (!window.confirm('Clear entire board? This cannot be undone.')) return;
                        const canvas = canvasRef.current;
                        const context = contextRef.current;
                        context.fillStyle = '#ffffff';
                        context.fillRect(0, 0, canvas.width, canvas.height);
                        context.beginPath();
                        saveToHistory();
                    };

                    const createNewBoard = () => {
                        if (isReadOnly) return;
                        const canvas = canvasRef.current;
                        const context = contextRef.current;

                        // Save current board to history before creating new one
                        const currentBoard = {
                            boardNumber: boardNumber,
                            timestamp: new Date().toLocaleString(),
                            thumbnail: canvas.toDataURL('image/png'),
                            uploadedFile: uploadedFile,
                            content: history.length > 0 ? 'Content saved' : 'Empty board',
                            createdAt: new Date().toISOString()
                        };

                        setBoardHistory(prev => [...prev, currentBoard]);

                        // Clear canvas
                        context.fillStyle = '#ffffff';
                        context.fillRect(0, 0, canvas.width, canvas.height);
                        context.beginPath();

                        // Reset background
                        setBackgroundImage(null);
                        setUploadedFile(null);

                        // Reset history for new board
                        setHistory([]);
                        setHistoryStep(-1);
                        saveToHistory();

                        // Increment board number
                        setBoardNumber(prev => prev + 1);
                    };

                    const openPreview = (board, idx) => {
                        setPreviewBoard(board);
                        setPreviewIndex(idx);
                        setShowPreviewModalLocal(true);
                    };

                    const closePreview = () => {
                        setShowPreviewModalLocal(false);
                        setPreviewBoard(null);
                        setPreviewIndex(-1);
                    };

                    const restoreBoard = (board) => {
                        if (!board) return;
                        const canvas = canvasRef.current;
                        const ctx = contextRef.current;
                        const img = new Image();
                        img.onload = () => {
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                            ctx.fillStyle = '#ffffff';
                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                            const rect = canvas.getBoundingClientRect();
                            ctx.drawImage(img, 0, 0, rect.width, rect.height);
                            saveToHistory();
                        };
                        img.src = board.thumbnail;
                        setUploadedFile(board.uploadedFile || null);
                        setShowBoardHistory(false);
                        closePreview();
                    };

                    // eslint-disable-next-line no-unused-vars
                    const deleteBoard = (idx) => {
                        setBoardHistory(prev => {
                            const copy = [...prev];
                            if (idx >= 0 && idx < copy.length) copy.splice(idx, 1);
                            return copy;
                        });
                        // close preview if deleting the open one
                        if (idx === previewIndex) closePreview();
                    };

                    const handleSave = () => {
                        if (onSave) {
                            const canvas = canvasRef.current;
                            const dataUrl = canvas.toDataURL('image/png');
                            onSave(dataUrl);
                        }
                    };

                    return (
                        <div className="whiteboard-container">
                            {!isReadOnly && (
                                <div className="whiteboard-toolbar">
                                    {/* Document Upload */}
                                    <div className="toolbar-section">
                                        <div className="section-label">DOCUMENT</div>
                                        <div className="toolbar-group upload-section">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileUpload}
                                                accept="image/*,.pdf"
                                                style={{ display: 'none' }}
                                            />
                                            <button
                                                className="tool-btn upload-btn"
                                                onClick={() => fileInputRef.current?.click()}
                                                title="Upload Slide/Image"
                                            >
                                                <FaFileUpload />
                                            </button>
                                            {uploadedFile && (
                                                <div className="background-info">
                                                    <FaImage />
                                                    <span>{uploadedFile}</span>
                                                    <button
                                                        className="clear-bg-btn"
                                                        onClick={() => {
                                                            setBackgroundImage(null);
                                                            setUploadedFile(null);
                                                            redrawCanvas();
                                                            saveToHistory();
                                                        }}
                                                        title="Clear Background"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Tool Selection */}
                                    <div className="toolbar-section">
                                        <div className="section-label">TOOLS</div>
                                        <div className="toolbar-group tools">
                                            <button
                                                className={`tool-btn ${tool === 'pencil' ? 'active' : ''}`}
                                                onClick={() => setTool('pencil')}
                                                title="Pencil"
                                            >
                                                <FaPencilAlt />
                                            </button>
                                            <button
                                                className={`tool-btn ${tool === 'brush' ? 'active' : ''}`}
                                                onClick={() => setTool('brush')}
                                                title="Brush"
                                            >
                                                <FaPaintBrush />
                                            </button>
                                            <button
                                                className={`tool-btn ${tool === 'highlighter' ? 'active' : ''}`}
                                                onClick={() => setTool('highlighter')}
                                                title="Highlighter"
                                            >
                                                <FaHighlighter />
                                            </button>
                                            <button
                                                className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`}
                                                onClick={() => setTool('eraser')}
                                                title="Eraser"
                                            >
                                                <FaEraser />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Color Palette */}
                                    <div className="toolbar-section">
                                        <div className="section-label">COLORS</div>
                                        <div className="toolbar-group colors-grid">
                                            {colorPalette.map(c => (
                                                <button
                                                    key={c.value}
                                                    className={`color-btn ${color === c.value && tool !== 'eraser' ? 'selected' : ''}`}
                                                    style={{ backgroundColor: c.value, border: c.value === '#FFFFFF' ? '2px solid #e2e8f0' : 'none' }}
                                                    onClick={() => {
                                                        setColor(c.value);
                                                        if (tool === 'eraser') setTool('pencil');
                                                    }}
                                                    title={c.name}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Brush Size */}
                                    <div className="toolbar-section">
                                        <div className="section-label">SIZE</div>
                                        <div className="toolbar-group size-buttons">
                                            {brushSizes.map(size => (
                                                <button
                                                    key={size.value}
                                                    className={`size-btn ${lineWidth === size.value ? 'active' : ''}`}
                                                    onClick={() => setLineWidth(size.value)}
                                                >
                                                    <div className="size-preview" style={{
                                                        width: `${size.value + 4}px`,
                                                        height: `${size.value + 4}px`,
                                                        backgroundColor: tool === 'eraser' ? '#cbd5e1' : color
                                                    }}></div>
                                                    <span>{size.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="toolbar-section">
                                        <div className="section-label">ACTIONS</div>
                                        <div className="toolbar-group actions">
                                            <button
                                                className="action-btn undo"
                                                onClick={undo}
                                                disabled={historyStep <= 0}
                                                title="Undo"
                                            >
                                                <FaUndo />
                                            </button>
                                            <button
                                                className="action-btn redo"
                                                onClick={redo}
                                                disabled={historyStep >= history.length - 1}
                                                title="Redo"
                                            >
                                                <FaRedo />
                                            </button>
                                            <button className="action-btn clear" onClick={clearCanvas} title="Clear All">
                                                <FaTrash />
                                            </button>
                                            <button
                                                className="action-btn board-history"
                                                onClick={() => setShowBoardHistory(!showBoardHistory)}
                                                title={`Board History (${boardHistory.length} saved)`}
                                            >
                                                <FaHistory /> HISTORY ({boardHistory.length})
                                            </button>
                                            <button className="action-btn new-board" onClick={createNewBoard} title="Start New Board">
                                                <FaPlus /> NEW
                                            </button>
                                            <button className="action-btn preview" onClick={onPreview} title="Preview Saved Boards">
                                                <FaEye /> PREVIEW ({historyCount})
                                            </button>
                                            <button className="action-btn save primary" onClick={handleSave} title="Save to Dashboard">
                                                <FaSave /> SAVE
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className={`canvas-wrapper ${isReadOnly ? 'read-only' : ''}`}>
                                <canvas
                                    onPointerDown={startDrawing}
                                    onPointerMove={draw}
                                    onPointerUp={stopDrawing}
                                    onPointerCancel={stopDrawing}
                                    onLostPointerCapture={stopDrawing}
                                    ref={canvasRef}
                                    style={{ touchAction: 'none', cursor: 'crosshair', width: '100%', height: '100%' }}
                                />
                                {!isReadOnly && (
                                    <div className="canvas-status">
                                        <span className="current-tool">
                                            {tool === 'pencil' && <FaPencilAlt />}
                                            {tool === 'brush' && <FaPaintBrush />}
                                            {tool === 'highlighter' && <FaHighlighter />}
                                            {tool === 'eraser' && <FaEraser />}
                                            {tool.charAt(0).toUpperCase() + tool.slice(1)} • {lineWidth}px
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Board History Panel */}
                            {showBoardHistory && (
                                <div className="board-history-panel" style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: 0,
                                    width: '350px',
                                    height: '100%',
                                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                                    borderLeft: '2px solid #64748b',
                                    overflowY: 'auto',
                                    zIndex: 100,
                                    padding: '1.5rem',
                                    boxShadow: '-4px 0 12px rgba(0,0,0,0.3)'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '1.5rem'
                                    }}>
                                        <h3 style={{
                                            margin: 0,
                                            color: '#fff',
                                            fontSize: '1.1rem',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <FaHistory /> Board History
                                        </h3>
                                        <button
                                            onClick={() => setShowBoardHistory(false)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#94a3b8',
                                                cursor: 'pointer',
                                                fontSize: '1.2rem'
                                            }}
                                        >✕</button>
                                    </div>

                                    <div style={{
                                        background: 'rgba(30,41,59,0.5)',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        marginBottom: '1.5rem',
                                        border: '1px solid #334155'
                                    }}>
                                        <div style={{ color: '#e2e8f0', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                            <strong>Total Boards Created:</strong> {boardHistory.length + 1}
                                        </div>
                                        <div style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
                                            Current Board: #{boardNumber}
                                        </div>
                                    </div>

                                    {boardHistory.length === 0 ? (
                                        <div style={{
                                            textAlign: 'center',
                                            color: '#94a3b8',
                                            padding: '2rem 0'
                                        }}>
                                            <p>No saved boards yet. Create boards to see history here.</p>
                                        </div>
                                    ) : (
                                        <div className="history-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {boardHistory.map((board, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => openPreview(board, index)}
                                                    role="button"
                                                    tabIndex={0}
                                                    style={{
                                                        background: 'rgba(51,65,85,0.5)',
                                                        border: '1px solid #475569',
                                                        borderRadius: '8px',
                                                        padding: '1rem',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s',
                                                        hover: { background: 'rgba(71,85,105,0.7)' }
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(71,85,105,0.7)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(51,65,85,0.5)'}
                                                >
                                                    <div style={{
                                                        fontSize: '0.85rem',
                                                        fontWeight: '600',
                                                        color: '#f1f5f9',
                                                        marginBottom: '0.5rem'
                                                    }}>
                                                        Board #{board.boardNumber}
                                                    </div>
                                                    <div style={{
                                                        width: '100%',
                                                        height: '100px',
                                                        background: '#0f172a',
                                                        borderRadius: '4px',
                                                        marginBottom: '0.5rem',
                                                        overflow: 'hidden',
                                                        border: '1px solid #334155'
                                                    }}>
                                                        <img
                                                            src={board.thumbnail}
                                                            alt={`Board ${board.boardNumber}`}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover'
                                                            }}
                                                        />
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                                                        {board.timestamp}
                                                    </div>
                                                    {board.uploadedFile && (
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                            📄 {board.uploadedFile}
                                                        </div>
                                                    )}
                                                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.3rem' }}>
                                                        Status: {board.content}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Upload Help Modal */}
                            {/* Preview / Restore Modal */}
                            {showPreviewModalLocal && previewBoard && (
                                <div
                                    className="preview-overlay"
                                    onClick={closePreview}
                                    style={{
                                        position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.8)', zIndex: 10000,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
                                    }}
                                >
                                    <div
                                        onClick={(e) => e.stopPropagation()}
                                        style={{ maxWidth: '1000px', width: '100%', background: '#0f172a', borderRadius: '12px', padding: '1rem', boxShadow: '0 20px 50px rgba(2,6,23,0.6)' }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <div style={{ color: '#e2e8f0', fontWeight: 700 }}>Preview — Board #{previewBoard.boardNumber}</div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => { restoreBoard(previewBoard); }} className="action-btn save" style={{ padding: '0.5rem 0.75rem' }}>Restore</button>
                                                <button onClick={() => deleteBoard(previewIndex)} className="action-btn clear" style={{ padding: '0.5rem 0.75rem' }}>Delete</button>
                                                <button onClick={closePreview} className="action-btn" style={{ padding: '0.5rem 0.75rem' }}>Close</button>
                                            </div>
                                        </div>

                                        <div style={{ background: '#0b1220', borderRadius: '8px', padding: '0.5rem', border: '1px solid #213241' }}>
                                            <img src={previewBoard.thumbnail} alt={`Preview ${previewBoard.boardNumber}`} style={{ width: '100%', height: '600px', objectFit: 'contain', background: '#fff' }} />
                                        </div>
                                        <div style={{ color: '#94a3b8', marginTop: '0.5rem' }}>{previewBoard.timestamp} {previewBoard.uploadedFile ? `• ${previewBoard.uploadedFile}` : ''}</div>
                                    </div>
                                </div>
                            )}
                            {showUploadHelp && (
                                <div
                                    className="upload-help-overlay"
                                    onClick={() => setShowUploadHelp(false)}
                                    style={{
                                        position: 'fixed',
                                        inset: 0,
                                        background: 'rgba(15, 23, 42, 0.95)',
                                        zIndex: 9999,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '2rem',
                                        backdropFilter: 'blur(10px)',
                                        animation: 'fadeIn 0.3s'
                                    }}
                                >
                                    <div
                                        className="upload-help-content"
                                        onClick={(e) => e.stopPropagation()}
                                        style={{
                                            background: 'white',
                                            borderRadius: '24px',
                                            padding: '2.5rem',
                                            maxWidth: '600px',
                                            width: '100%',
                                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                            animation: 'slideUp 0.3s'
                                        }}
                                    >
                                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                            <div style={{
                                                width: '80px',
                                                height: '80px',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                margin: '0 auto 1.5rem',
                                                fontSize: '2.5rem',
                                                color: 'white'
                                            }}>
                                                <FaFileUpload />
                                            </div>
                                            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                                                Document Upload Guide
                                            </h2>
                                            <p style={{ color: '#64748b', fontSize: '1rem' }}>
                                                Upload your presentation materials
                                            </p>
                                        </div>

                                        <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <FaImage style={{ color: '#10b981' }} />
                                                Supported Formats
                                            </h3>
                                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                                {['JPG', 'PNG', 'GIF', 'BMP', 'WebP', 'PDF'].map(format => (
                                                    <span key={format} style={{
                                                        background: format === 'PDF' ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                        color: 'white',
                                                        padding: '0.5rem 1rem',
                                                        borderRadius: '8px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 700
                                                    }}>
                                                        {format}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div style={{ background: '#dcfce7', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', border: '2px solid #10b981' }}>
                                            <p style={{ margin: 0, color: '#065f46', fontSize: '0.9rem', fontWeight: 600 }}>
                                                ✅ <strong>PDF Files:</strong> Automatically rendered! Just upload and annotate.
                                            </p>
                                        </div>

                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
                                                📊 PowerPoint Files (PPT/PPTX):
                                            </h3>
                                            <ol style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569', lineHeight: '1.8' }}>
                                                <li><strong>Method 1:</strong> File → Export → PNG/JPG</li>
                                                <li><strong>Method 2:</strong> Use online tools like SmallPDF.com</li>
                                                <li><strong>Quick Method:</strong> Take screenshots of each slide</li>
                                            </ol>
                                        </div>

                                        <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '1rem', marginBottom: '2rem', border: '2px solid #3b82f6' }}>
                                            <p style={{ margin: 0, color: '#1e40af', fontSize: '0.9rem', fontWeight: 600 }}>
                                                💡 <strong>Pro Tip:</strong> Use 1920x1080 resolution for best quality!
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => setShowUploadHelp(false)}
                                            style={{
                                                width: '100%',
                                                padding: '1rem',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '12px',
                                                fontSize: '1rem',
                                                fontWeight: 800,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            GOT IT!
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                };

                export default Whiteboard;
