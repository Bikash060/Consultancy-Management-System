'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { authApi } from '@/lib/api';

interface User {
    id: number;
    email: string;
    phone: string | null;
    role: 'client' | 'counselor' | 'admin';
    is_active: boolean;
    profile: {
        first_name: string;
        last_name: string;
        date_of_birth?: string;
        address?: string;
        education_background?: string;
        preferred_country?: string;
        preferred_course?: string;
        budget?: string;
        passport_number?: string;
    } | null;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<User>;
    logout: () => void;
    register: (data: { email: string; password: string; first_name: string; last_name: string }) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const res = await authApi.me();
                    setUser(res.data.user);
                    setIsAuthenticated(true);
                } catch {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    setIsAuthenticated(false);
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = useCallback(async (email: string, password: string): Promise<User> => {
        const { data } = await authApi.login(email, password);
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        setUser(data.user);
        setIsAuthenticated(true);
        return data.user;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        setIsAuthenticated(false);
        window.location.href = '/login';
    }, []);

    const register = useCallback(async (formData: { email: string; password: string; first_name: string; last_name: string }): Promise<User> => {
        const { data } = await authApi.register(formData);
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        setUser(data.user);
        setIsAuthenticated(true);
        return data.user;
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
