// ============================================================
// useS3Upload — React Hook for AWS S3 File Uploads
// Usage: const { upload, uploading, progress, error, url } = useS3Upload();
// ============================================================

import { useState, useCallback } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export const useS3Upload = () => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [url, setUrl] = useState(null);
    const [fileKey, setFileKey] = useState(null);

    // ── Upload a File ────────────────────────────────────────────
    const upload = useCallback(async (file, options = {}) => {
        if (!file) { setError('No file selected'); return null; }

        setUploading(true);
        setProgress(0);
        setError(null);
        setUrl(null);
        setFileKey(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            // Use XMLHttpRequest so we can track upload progress
            const result = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();

                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        setProgress(Math.round((e.loaded / e.total) * 100));
                    }
                };

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try { resolve(JSON.parse(xhr.responseText)); }
                        catch { reject(new Error('Invalid server response')); }
                    } else {
                        try {
                            const err = JSON.parse(xhr.responseText);
                            reject(new Error(err.error || `Upload failed (${xhr.status})`));
                        } catch {
                            reject(new Error(`Upload failed (${xhr.status})`));
                        }
                    }
                };

                xhr.onerror = () => reject(new Error('Network error during upload'));
                xhr.ontimeout = () => reject(new Error('Upload timed out'));

                const endpoint = options.endpoint || `${API_BASE}/api/aws/upload`;
                xhr.open('POST', endpoint);

                // Add auth token if available
                const token =
                    localStorage.getItem('adminToken') ||
                    localStorage.getItem('facultyToken') ||
                    localStorage.getItem('studentToken');
                if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

                xhr.send(formData);
            });

            setProgress(100);
            setUrl(result.url);
            setFileKey(result.key);
            return result;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setUploading(false);
        }
    }, []);

    // ── Delete a File from S3 ────────────────────────────────────
    const deleteFile = useCallback(async (key) => {
        try {
            const token =
                localStorage.getItem('adminToken') ||
                localStorage.getItem('facultyToken') ||
                localStorage.getItem('studentToken');

            const res = await fetch(`${API_BASE}/api/aws/files/${encodeURIComponent(key)}`, {
                method: 'DELETE',
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Delete failed');
            return data;
        } catch (err) {
            setError(err.message);
            return null;
        }
    }, []);

    // ── Reset state ───────────────────────────────────────────────
    const reset = useCallback(() => {
        setUploading(false);
        setProgress(0);
        setError(null);
        setUrl(null);
        setFileKey(null);
    }, []);

    return { upload, deleteFile, reset, uploading, progress, error, url, fileKey };
};

export default useS3Upload;
