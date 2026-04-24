const getDiscoveryUrl = () => {
  if (typeof window !== 'undefined' && window.location) {
    const { hostname } = window.location;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return 'https://vu-universe-backend.onrender.com';
    }
  }
  return 'http://localhost:5001';
};

const API_URL = 'https://vu-universe-backend.onrender.com';

let es = null;
const listeners = new Set();

let reconnectTimer = null;
let reconnectDelay = 300; // Start fast: 300ms

function ensure() {
  if (es && es.readyState !== EventSource.CLOSED) return es;

  if (reconnectTimer) clearTimeout(reconnectTimer);

  try {
    const url = `${API_URL}/api/stream`;
    console.log('🔌 SSE: Connecting to', url);
    es = new EventSource(url);

    es.onopen = () => {
      console.log('✅ SSE: Connected');
      reconnectDelay = 300; // Reset backoff on successful connect
    };

    es.onmessage = (evt) => {
      if (!evt.data || evt.data === 'ping') return; // Ignore heartbeats
      try {
        const data = typeof evt.data === 'string' ? JSON.parse(evt.data) : evt.data;
        listeners.forEach(cb => {
          try { cb(data); } catch (e) { console.error('SSE listener error', e); }
        });
      } catch (e) {
        console.warn('Failed to parse SSE message', e);
      }
    };

    es.onerror = () => {
      try { es.close(); } catch (e) { /* ignore */ }
      es = null;
      // Exponential backoff: 300ms -> 600ms -> 1.2s -> 2.4s -> max 5s
      const delay = Math.min(reconnectDelay, 5000);
      reconnectDelay = Math.min(reconnectDelay * 2, 5000);
      reconnectTimer = setTimeout(ensure, delay);
    };

  } catch (e) {
    console.warn('EventSource setup failed', e);
    reconnectTimer = setTimeout(ensure, 5000);
  }
  return es;
}

const sseClient = {
  onUpdate(cb) {
    if (typeof cb !== 'function') return () => { };
    listeners.add(cb);
    ensure();
    return () => listeners.delete(cb);
  }
};

export default sseClient;
