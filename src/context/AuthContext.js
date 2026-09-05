import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        checkAuth();
    }, []);
    const checkAuth = async () => {
        try {
            const data = await apiFetch('/auth/me');
            setUser(data.user);
        }
        catch (err) {
            setUser(null);
            localStorage.removeItem('auth_token');
        }
        finally {
            setLoading(false);
        }
    };
    const login = async (email, password) => {
        const data = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        localStorage.setItem('auth_token', data.token);
        setUser(data.user);
        return data.user;
    };
    const logout = async () => {
        try {
            await apiFetch('/auth/logout', { method: 'POST' });
        }
        catch (e) {
            // Ignore logout errors
        }
        finally {
            localStorage.removeItem('auth_token');
            setUser(null);
        }
    };
    const isAdmin = user?.role === 'ADMIN';
    const isEditor = user?.role === 'EDITOR';
    const isStudent = user?.role === 'STUDENT';
    return (_jsx(AuthContext.Provider, { value: { user, loading, login, logout, isAdmin, isEditor, isStudent }, children: children }));
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
