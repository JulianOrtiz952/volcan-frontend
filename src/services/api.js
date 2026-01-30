const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Simple Basic Auth for development (User: admin, Pass: admin)
// In a real app, you'd use JWT or Session cookies
const getHeaders = () => {
    const headers = {
        'Content-Type': 'application/json',
    };
    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Token ${token}`;
    } else {
        // No default auth
    }
    return headers;
};

export const api = {
    get: async (endpoint) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            headers: getHeaders(),
        });
        if (res.status === 401) {
            localStorage.removeItem('token');
            window.location.reload();
        }
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return res.json();
    },
    post: async (endpoint, data) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (res.status === 401) {
            localStorage.removeItem('token');
            window.location.reload();
        }
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.non_field_errors || errData.detail || `API Error: ${res.statusText}`);
        }
        return res.json();
    },
    patch: async (endpoint, data) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (res.status === 401) {
            localStorage.removeItem('token');
            window.location.reload();
        }
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return res.json();
    },
    delete: async (endpoint) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        if (res.status === 401) {
            localStorage.removeItem('token');
            window.location.reload();
        }
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return true;
    },
    // Auth helpers
    login: async (username, password) => {
        const res = await fetch(`${API_URL}/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        if (!res.ok) throw new Error('Invalid credentials');
        const data = await res.json();
        localStorage.setItem('token', data.token);
        return data;
    },
    register: async (username, password) => {
        const res = await fetch(`${API_URL}/register/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.username?.[0] || 'Registration failed');
        }
        const data = await res.json();
        localStorage.setItem('token', data.token);
        return data;
    },
    logout: () => {
        localStorage.removeItem('token');
        window.location.reload();
    }
};
