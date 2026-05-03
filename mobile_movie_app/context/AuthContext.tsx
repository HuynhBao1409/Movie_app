import { getCurrentUser, getProfile, login, logout, register } from '@/services/auth';
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';


// Thông tin tài khoản Appwrite 
interface AuthUser {
    $id: string;    // ID tài khoản do Appwrite tự sinh
    email: string;
    name: string;
}

// Thông tin profile mở rộng lưu trong Appwrite Database
interface AuthProfile {
    $id: string;
    userId: string;
    username: string;
    phone?: string;
    avatar_url?: string;
    bio?: string;
    role: 'user' | 'admin'; // Phân quyền
}

// Những gì Context cung cấp cho toàn bộ app
interface AuthContextType {
    user: AuthUser | null;
    profile: AuthProfile | null;
    loading: boolean;            // true khi đang kiểm tra session lúc mở app
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, username: string, phone: string) => Promise<void>;
    signOut: () => Promise<void>;
    setProfile: (profile: AuthProfile) => void; // Dùng khi user tự update profile
}

// CONTEXT SETUP
// Tạo Context với giá trị mặc định null
const AuthContext = createContext<AuthContextType | null>(null);

// PROVIDER COMPONENT

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [profile, setProfile] = useState<AuthProfile | null>(null);
    const [loading, setLoading] = useState(true); // Bắt đầu là true, tắt sau khi check session xong

    useEffect(() => {
        checkSession();
    }, []);

    // Kiểm tra xem đã có session hợp lệ chưa
    // → Nếu có: load user + profile rồi redirect vào app
    // → Nếu không: đẩy ra màn hình login
    const checkSession = async () => {
        try {
            const currentUser = await getCurrentUser(); // Gọi Appwrite SDK
            if (currentUser) {
                setUser(currentUser as any);
                const prof = await getProfile(currentUser.$id);
                setProfile(prof as any);
                redirectByRole(prof?.role ?? 'user'); // Fallback về 'user' nếu role undefined
            } else {
                router.replace('/(auth)/login');
            }
        } finally {
            // Dù thành công hay lỗi cũng phải tắt loading
            setLoading(false);
        }
    };

    // Điều hướng dựa theo role sau khi đăng nhập / check session
    const redirectByRole = (role: string) => {
        if (role === 'admin') {
            router.replace('/admin/dashboard');
        } else {
            router.replace('/(tabs)');
        }
    };

    // Đăng nhập: login → lấy profile → redirect
    const signIn = async (email: string, password: string) => {
        const { user, role } = await login(email, password); // login trả về cả role để redirect ngay
        console.log('LOGIN ROLE:', role);
        setUser(user as any);

        // Lấy thêm profile đầy đủ (avatar, bio...) vì login chỉ trả về account
        const prof = await getProfile(user.$id);
        console.log('PROFILE:', prof);
        setProfile(prof as any);

        redirectByRole(role);
    };

    // Đăng ký: tạo tài khoản → tự động đăng nhập → vào app
    // Không cần redirect theo role vì user mới luôn là 'user'
    const signUp = async (email: string, password: string, username: string, phone: string) => {
        await register(email, password, username, phone);

        // register() thường tự login luôn (Appwrite behaviour)
        // nên getCurrentUser() sau đó sẽ trả về user vừa tạo
        const currentUser = await getCurrentUser();
        if (currentUser) {
            setUser(currentUser as any);
            const prof = await getProfile(currentUser.$id);
            setProfile(prof as any);
        }

        router.replace('/(tabs)');
    };

    // Đăng xuất: xóa session Appwrite → reset state → về login
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

// CUSTOM HOOK

// Dùng hook này thay vì gọi useContext(AuthContext) trực tiếp
// Lợi ích: tự động throw error nếu quên bọc Provider
// Ví dụ dùng: const { user, signIn } = useAuth();
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};