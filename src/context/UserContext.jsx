import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

    const fetchUser = useCallback(async (explicitToken) => {
        const activeToken = explicitToken || localStorage.getItem('token');
        if (!activeToken) {
            setUser(null);
            setLoading(false);
            return;
        }
        try {
            const res = await fetch(`${API_URL}/me/`, {
                headers: { 'Authorization': `Token ${activeToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                // 401, 403, 500, etc. → clear session
                localStorage.removeItem('token');
                setUser(null);
            }
        } catch {
            // Network error (backend down / restarted) → force login
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    const login = useCallback(async (newToken) => {
        setLoading(true);
        localStorage.setItem('token', newToken);
        await fetchUser(newToken);
    }, [fetchUser]);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setUser(null);
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    return (
        <UserContext.Provider value={{ user, setUser, loading, refreshUser: () => fetchUser(), login, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
