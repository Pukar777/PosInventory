import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
    user: any;
    token: string | null;
    login: (token: string, user: any) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

    const login = (newToken: string, newUser: any) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
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
