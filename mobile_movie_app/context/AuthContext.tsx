import { getCurrentUser, getProfile, login, logout, register } from '@/services/auth';
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthUser {
    $id: string;
    email: string;
    name: string;
}

interface AuthProfile {
    $id: string;        // document ID dùng để update
    userId: string;
    username: string;
    phone?: string;
    avatar_url?: string;
    bio?: string;
    role: 'user' | 'admin';
}

interface AuthContextType {
    user: AuthUser | null;
    profile: AuthProfile | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, username: string, phone: string) => Promise<void>;
    signOut: () => Promise<void>;
    setProfile: (profile: AuthProfile) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [profile, setProfile] = useState<AuthProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Kiểm tra session khi mở app
    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        try {
            const currentUser = await getCurrentUser();
            if (currentUser) {
                setUser(currentUser as any);
                const prof = await getProfile(currentUser.$id);
                setProfile(prof as any);
                // Redirect theo role
                redirectByRole(prof?.role ?? 'user');
            } else {
                router.replace('/(auth)/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const redirectByRole = (role: string) => {
        if (role === 'admin') {
            router.replace('/admin/dashboard');
        } else {
            router.replace('/(tabs)');
        }
    };

    const signIn = async (email: string, password: string) => {
        const { user, role } = await login(email, password);
        console.log('LOGIN ROLE:', role);
        setUser(user as any);
        const prof = await getProfile(user.$id);
        console.log('PROFILE:', prof);
        setProfile(prof as any);
        redirectByRole(role);
    };


    const signUp = async (email: string, password: string, username: string, phone: string) => {
        await register(email, password, username, phone);
        const currentUser = await getCurrentUser();
        if (currentUser) {
            setUser(currentUser as any);
            const prof = await getProfile(currentUser.$id);
            setProfile(prof as any);
        }
        router.replace('/(tabs)');
    };

    const signOut = async () => {
        await logout();
        setUser(null);
        setProfile(null);
        router.replace('/(auth)/login');
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, setProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook dùng trong các screen
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};