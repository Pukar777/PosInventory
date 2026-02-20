import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

import { useApi } from '@/hooks/useApi';

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'waiter';
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (credentials: any) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

    const { request } = useApi();

    useEffect(() => {
        const initAuth = async () => {
            if (token && !user) {
                try {
                    const response = await request({ method: 'GET', url: '/me' });
                    setUser(response.data);
                } catch (error) {
                    console.error('Failed to fetch user', error);
                }
            }
        };
        initAuth();
    }, [token, request, user]);

    const login = async (credentials: any) => {
        const response = await request({
            method: 'POST',
            url: '/login',
            data: credentials,
        });

        const newToken = response.data.token;
        const newUser = response.data.user;

        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
    };

    const logout = async () => {
        try {
            await request({
                method: 'POST',
                url: '/logout',
            });
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            setToken(null);
            setUser(null);
            localStorage.removeItem('token');
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
