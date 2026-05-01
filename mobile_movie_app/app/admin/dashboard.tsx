import { useAuth } from '@/context/AuthContext';
import { getAllUsers, setUserRole } from '@/services/auth';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator, Alert, FlatList,
    RefreshControl, Text, TouchableOpacity, View
} from 'react-native';

interface UserProfile {
    $id: string;
    userId: string;
    username: string;
    role: 'user' | 'admin';
    $createdAt: string;
}

// ===== COMPONENT: StatCard =====
const StatCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <View className='flex-1 bg-secondary rounded-2xl p-4 items-center mx-1'>
        <Text style={{ color }} className='text-2xl font-bold'>{value}</Text>
        <Text className='text-light-300 text-xs mt-1'>{label}</Text>
    </View>
);

// ===== COMPONENT: UserRow =====
const UserRow = ({
    item,
    onToggleRole,
    loadingId,
}: {
    item: UserProfile;
    onToggleRole: (item: UserProfile) => void;
    loadingId: string | null;
}) => (
    <View className='flex-row items-center bg-secondary rounded-2xl px-4 py-3 mb-2 mx-4'>
        {/* Avatar placeholder */}
        <View className='w-10 h-10 rounded-full bg-dark-100 items-center justify-center mr-3'>
            <Text className='text-white font-bold text-base'>
                {item.username?.charAt(0).toUpperCase()}
            </Text>
        </View>

        {/* Info */}
        <View className='flex-1'>
            <Text className='text-white text-sm font-semibold'>{item.username}</Text>
            <Text className='text-light-300 text-xs mt-0.5'>
                Joined {new Date(item.$createdAt).toLocaleDateString()}
            </Text>
        </View>

        {/* Role Badge + Toggle */}
        <TouchableOpacity
            onPress={() => onToggleRole(item)}
            disabled={loadingId === item.$id}
            className={`px-3 py-1.5 rounded-full ${item.role === 'admin' ? 'bg-accent' : 'bg-dark-100'
                }`}
        >
            {loadingId === item.$id ? (
                <ActivityIndicator size='small' color='#fff' />
            ) : (
                <Text className='text-white text-xs font-semibold'>
                    {item.role === 'admin' ? 'Admin' : 'User'}
                </Text>
            )}
        </TouchableOpacity>
    </View>
);

// ===== SCREEN: AdminDashboard =====
export default function AdminDashboard() {
    const { profile, signOut } = useAuth();

    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'admin' | 'user'>('all');

    // Fetch all users
    const fetchUsers = async () => {
        try {
            const data = await getAllUsers();
            setUsers(data as unknown as UserProfile[]);
        } catch (e) {
            Alert.alert('Error', 'Failed to load users');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchUsers();
    };

    // Toggle role user ↔ admin
    const handleToggleRole = (item: UserProfile) => {
        const newRole = item.role === 'admin' ? 'user' : 'admin';
        Alert.alert(
            'Change Role',
            `Set ${item.username} as ${newRole}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    style: newRole === 'admin' ? 'default' : 'destructive',
                    onPress: async () => {
                        try {
                            setLoadingId(item.$id);
                            await setUserRole(item.$id, newRole);
                            // Update local state
                            setUsers((prev) =>
                                prev.map((u) =>
                                    u.$id === item.$id ? { ...u, role: newRole } : u
                                )
                            );
                        } catch {
                            Alert.alert('Error', 'Failed to update role');
                        } finally {
                            setLoadingId(null);
                        }
                    },
                },
            ]
        );
    };

    // Stats
    const totalUsers = users.length;
    const totalAdmins = users.filter((u) => u.role === 'admin').length;
    const totalRegular = users.filter((u) => u.role === 'user').length;

    // Filter
    const filteredUsers = filter === 'all'
        ? users
        : users.filter((u) => u.role === filter);

    const FILTER_TABS: { label: string; value: 'all' | 'admin' | 'user' }[] = [
        { label: `All (${totalUsers})`, value: 'all' },
        { label: `Admin (${totalAdmins})`, value: 'admin' },
        { label: `User (${totalRegular})`, value: 'user' },
    ];

    return (
        <View className='flex-1 bg-primary'>
            {/* ===== Header ===== */}
            <View className='flex-row items-center justify-between px-5 pt-16 pb-4 border-b border-dark-100'>
                <View>
                    <Text className='text-white text-xl font-bold'>Admin Dashboard</Text>
                    <Text className='text-light-300 text-xs mt-0.5'>
                        Welcome, {profile?.username}
                    </Text>
                </View>
                <TouchableOpacity
                    className='border border-accent px-4 py-2 rounded-xl'
                    onPress={signOut}
                >
                    <Text className='text-accent text-sm font-semibold'>Logout</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator color='#E50914' className='mt-20' />
            ) : (
                <FlatList
                    data={filteredUsers}
                    keyExtractor={(item) => item.$id}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor='#E50914'
                        />
                    }
                    ListHeaderComponent={() => (
                        <View>
                            {/* ===== Stats ===== */}
                            <View className='flex-row px-4 mt-5 mb-5'>
                                <StatCard label='Total Users' value={totalUsers} color='#fff' />
                                <StatCard label='Admins' value={totalAdmins} color='#E50914' />
                                <StatCard label='Regular' value={totalRegular} color='#A8B5DB' />
                            </View>

                            {/* ===== Filter Tabs ===== */}
                            <View className='flex-row px-4 mb-4 gap-x-2'>
                                {FILTER_TABS.map((tab) => (
                                    <TouchableOpacity
                                        key={tab.value}
                                        onPress={() => setFilter(tab.value)}
                                        className={`px-3 py-1.5 rounded-full border ${filter === tab.value
                                                ? 'bg-accent border-accent'
                                                : 'border-dark-100'
                                            }`}
                                    >
                                        <Text className='text-white text-xs font-semibold'>
                                            {tab.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text className='text-light-300 text-xs px-5 mb-3 uppercase tracking-widest'>
                                Users — tap badge to toggle role
                            </Text>
                        </View>
                    )}
                    renderItem={({ item }) => (
                        <UserRow
                            item={item}
                            onToggleRole={handleToggleRole}
                            loadingId={loadingId}
                        />
                    )}
                    ListEmptyComponent={() => (
                        <View className='items-center mt-20'>
                            <Text className='text-light-300'>No users found</Text>
                        </View>
                    )}
                    contentContainerStyle={{ paddingBottom: 40 }}
                />
            )}
        </View>
    );
}