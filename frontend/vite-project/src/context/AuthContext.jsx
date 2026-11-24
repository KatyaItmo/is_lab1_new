import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { request, setUnauthorizedHandler } from '../api/httpClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [username, setUsername] = useState(() => localStorage.getItem('username'));

    const clearAuth = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setToken(null);
        setUsername(null);
    }, []);

    useEffect(() => {
        setUnauthorizedHandler(clearAuth);
    }, [clearAuth]);

    const login = async (loginUsername, password) => {
        const { data } = await request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({username: loginUsername, password: password}),
        });

        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        setToken(data.token);
        setUsername(data.username);
    };

    const register = async (regUsername, password) => {
        const { data } = await request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username: regUsername, password: password }),
        });

        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        setToken(data.token);
        setUsername(data.username);
    };

    const logout = async () => {
        try {
            await request('/auth/logout', { method: 'POST' });
        } catch {
        } finally {
            clearAuth();
        }
    };

    const isAuthenticated = Boolean(token);

    return (
        <AuthContext.Provider value={{ token, username, isAuthenticated, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth должен использоваться внутри AuthProvider');
    }
    return context;
}