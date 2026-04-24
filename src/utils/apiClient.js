const getDiscoveryUrl = () => {
    if (typeof window !== 'undefined' && window.location) {
        const { protocol, hostname } = window.location;
        // Production: Use the Render backend URL when hosted on Vercel or any non-localhost domain
        if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
            return 'https://vu-universe-backend.onrender.com';
        }
    }
    return 'http://localhost:5001';
};

const API_URL = process.env.REACT_APP_API_URL || getDiscoveryUrl();
export const API_BASE = API_URL;
console.log(`[NETWORK 🛰️] Pulse discovered API at: ${API_BASE}`);

const headersJson = { 'Content-Type': 'application/json' };

/**
 * Ensures path is prefixed with /api
 */
function fixPath(path) {
    if (!path) return '/api';
    if (path.startsWith('http')) return path; // Absolute URL
    const p = path.startsWith('/') ? path : '/' + path;
    if (p.startsWith('/api')) return p;
    return '/api' + p;
}

function getAuthHeaders() {
    const headers = {};

    if (typeof window !== 'undefined' && window.localStorage) {
        const adminToken = window.localStorage.getItem('adminToken');
        const facultyToken = window.localStorage.getItem('facultyToken');
        const studentToken = window.localStorage.getItem('studentToken');

        if (adminToken) {
            headers['Authorization'] = `Bearer ${adminToken}`;
            headers['x-admin-token'] = adminToken;
        } else if (facultyToken) {
            headers['Authorization'] = `Bearer ${facultyToken}`;
            headers['x-faculty-token'] = facultyToken;
        } else if (studentToken) {
            headers['Authorization'] = `Bearer ${studentToken}`;
            headers['x-student-token'] = studentToken;
        }
    }
    return headers;
}

async function parseResponse(res, path) {
    const contentType = res.headers.get('content-type');
    let data = {};

    if (contentType && contentType.includes('application/json')) {
        try {
            data = await res.json();
        } catch (e) {
            console.error(`[API] Failed to parse JSON from ${path}:`, e);
            data = { error: 'Invalid JSON response from server' };
        }
    } else {
        // If we got HTML or text instead of JSON
        const text = await res.text().catch(() => '');
        console.error(`[API] Expected JSON but received ${contentType || 'unknown'} from ${path}. Body start: ${text.substring(0, 100)}`);

        if (text.trim().startsWith('<')) {
            data = { error: 'The server returned an HTML page instead of data. This usually happens if the API route is missing or pointing to the wrong port.' };
        } else {
            data = { error: text || 'Non-JSON response received' };
        }
    }

    if (!res.ok) {
        const err = new Error(data.details || data.error || data.message || `${res.method || 'Request'} ${path} failed: ${res.status}`);
        err.status = res.status;
        err.details = data;
        throw err;
    }
    return data;
}

export async function apiGet(path, retries = 3, backoff = 1000) {
    const fixedPath = fixPath(path);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout
    try {
        const res = await fetch(`${API_URL.replace(/\/$/, '')}${fixedPath}`, {
            headers: { 
                ...getAuthHeaders(),
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            },
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        // Linear Backoff for transient errors (429, 503, 504)
        if ((res.status === 429 || res.status >= 500) && retries > 0) {
            console.warn(`[API] Retrying ${fixedPath} (${retries} left) in ${backoff}ms...`);
            await new Promise(r => setTimeout(r, backoff));
            return apiGet(path, retries - 1, backoff * 1.5);
        }

        return parseResponse(res, fixedPath);
    } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
            console.error(`🔴 GET ${path} aborted (Timeout reached or browser cancelled)`);
        }

        // Retry on network errors too (ERR_CONNECTION_REFUSED or timeout)
        if (retries > 0 && err.name !== 'TypeError') {
            await new Promise(r => setTimeout(r, backoff));
            return apiGet(path, retries - 1, backoff * 1.5);
        }

        throw err;
    }
}

export async function apiPost(path, body) {
    const fixedPath = fixPath(path);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s frontend timeout

    try {
        const res = await fetch(`${API_URL.replace(/\/$/, '')}${fixedPath}`, {
            method: 'POST',
            headers: { ...headersJson, ...getAuthHeaders() },
            body: JSON.stringify(body),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return parseResponse(res, fixedPath);
    } catch (err) {
        clearTimeout(timeoutId);
        throw err;
    }
}

export async function apiPut(path, body) {
    const fixedPath = fixPath(path);
    const res = await fetch(`${API_URL.replace(/\/$/, '')}${fixedPath}`, {
        method: 'PUT',
        headers: { ...headersJson, ...getAuthHeaders() },
        body: JSON.stringify(body),
    });
    return parseResponse(res, fixedPath);
}

export async function apiDelete(path) {
    const fixedPath = fixPath(path);
    const res = await fetch(`${API_URL.replace(/\/$/, '')}${fixedPath}`, {
        method: 'DELETE',
        headers: { ...getAuthHeaders() }
    });
    return parseResponse(res, fixedPath);
}

export async function apiPatch(path, body) {
    const fixedPath = fixPath(path);
    const res = await fetch(`${API_URL.replace(/\/$/, '')}${fixedPath}`, {
        method: 'PATCH',
        headers: { ...headersJson, ...getAuthHeaders() },
        body: JSON.stringify(body),
    });
    return parseResponse(res, fixedPath);
}


export async function apiUpload(path, formData, method = 'POST') {
    const fixedPath = fixPath(path);
    const headers = { ...getAuthHeaders() };
    const res = await fetch(`${API_URL.replace(/\/$/, '')}${fixedPath}`, {
        method: method,
        body: formData,
        headers: headers,
    });
    return parseResponse(res, fixedPath);
}

export async function adminLogin(adminId, password) {
    const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/admin/login`, {
        method: 'POST', headers: headersJson, body: JSON.stringify({ adminId, password })
    });
    const data = await parseResponse(res, '/api/admin/login');
    if (data.token) window.localStorage.setItem('adminToken', data.token);
    return data;
}

export async function facultyLogin(facultyId, password) {
    const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/faculty/login`, {
        method: 'POST', headers: headersJson, body: JSON.stringify({ facultyId, password })
    });
    const data = await parseResponse(res, '/api/faculty/login');
    if (data.token) {
        window.localStorage.setItem('facultyToken', data.token);
        window.localStorage.setItem('userData', JSON.stringify(data.facultyData || data.user || data));
    }
    return data;
}

export async function studentLogin(sid, password) {
    const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/students/login`, {
        method: 'POST', headers: headersJson, body: JSON.stringify({ sid, password })
    });
    const data = await parseResponse(res, '/api/students/login');
    if (data.token) {
        window.localStorage.setItem('studentToken', data.token);
        window.localStorage.setItem('userData', JSON.stringify(data.studentData));
    }
    return data;
}

// Unified Login - Single form for all user types
export async function unifiedLogin(identifier, password) {
    const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/login`, {
        method: 'POST', headers: headersJson, body: JSON.stringify({ identifier, password })
    });
    const data = await parseResponse(res, '/api/login');
    if (data.token) {
        // Store token based on user type
        const userType = data.userType || data.role;
        if (userType === 'admin') {
            window.localStorage.setItem('adminToken', data.token);
            window.localStorage.setItem('adminData', JSON.stringify(data.adminData || data));
        } else if (userType === 'faculty') {
            window.localStorage.setItem('facultyToken', data.token);
            window.localStorage.setItem('facultyData', JSON.stringify(data.facultyData || data));
        } else if (userType === 'student') {
            window.localStorage.setItem('studentToken', data.token);
            window.localStorage.setItem('studentData', JSON.stringify(data.studentData || data));
        }
        // Also store unified user data
        window.localStorage.setItem('userData', JSON.stringify({
            ...(data.adminData || data.facultyData || data.studentData || {}),
            role: userType,
            token: data.token
        }));
    }
    return data;
}

export async function studentRegister(studentData) {
    const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/students/register`, {
        method: 'POST', headers: headersJson, body: JSON.stringify(studentData)
    });
    const data = await parseResponse(res, '/api/students/register');
    if (data.token) {
        window.localStorage.setItem('studentToken', data.token);
        window.localStorage.setItem('userData', JSON.stringify(data.studentData));
    }
    return data;
}

export async function adminLogout() {
    return { success: true };
}

export async function facultyLogout() {
    return { success: true };
}

/**
 * Resolves a profile image URL, handling relative paths, absolute URLs, and fallbacks.
 */
export function resolveImageUrl(path, fallbackSeed = 'User') {
    if (!path) return `https://api.dicebear.com/7.x/avataaars/svg?seed=${fallbackSeed}`;
    
    // If it's already an absolute URL or a data URI, return it
    if (path.startsWith('http') || path.startsWith('data:') || path.includes('dicebear')) {
        return path;
    }
    
    // Ensure relative paths are prefixed with the API URL
    const baseUrl = API_BASE.replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : '/' + path;
    
    return `${baseUrl}${cleanPath}`;
}

const client = {
    apiGet, apiPost, apiPut, apiDelete, apiPatch, apiUpload,
    adminLogin, adminLogout, facultyLogin, facultyLogout,
    studentLogin, studentRegister, unifiedLogin, resolveImageUrl
};

export default client;

