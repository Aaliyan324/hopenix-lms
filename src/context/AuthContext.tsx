import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { apiFetch } from '../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isEditor: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const data = await apiFetch<{ user: User }>('/auth/me');
      setUser(data.user);
    } catch (err) {
      setUser(null);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    const data = await apiFetch<{ token: string; user: User }>('/auth/login', {
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
    } catch (e) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const isEditor = user?.role === 'EDITOR';
  const isStudent = user?.role === 'STUDENT';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isEditor, isStudent }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
