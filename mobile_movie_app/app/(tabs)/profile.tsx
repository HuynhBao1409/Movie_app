import { icons } from '@/constants/icons';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';

const SectionHeader = ({ title }: { title: string }) => (
    <Text className='text-light-300 text-xs font-semibold uppercase tracking-widest mb-2 mt-6 px-5'>
        {title}
    </Text>
);

const MenuItem = ({ icon, label, value, onPress, rightElement }: {
    icon: any; label: string; value?: string;
    onPress?: () => void; rightElement?: React.ReactNode;
}) => (
    <TouchableOpacity
        onPress={onPress}
        className='flex-row items-center px-5 py-4 border-b border-dark-100'
        activeOpacity={onPress ? 0.7 : 1}
    >
        <View className='w-8 h-8 rounded-full bg-dark-100 items-center justify-center mr-3'>
            <Image source={icon} className='size-4' tintColor='#A8B5DB' />
        </View>
        <Text className='text-white text-sm flex-1'>{label}</Text>
        {value && <Text className='text-light-300 text-sm mr-2'>{value}</Text>}
        {rightElement ?? (onPress && (
            <Image source={icons.arrow} className='size-4' tintColor='#9CA4AB' />
        ))}
    </TouchableOpacity>
);

const Profile = () => {
    const { user, profile, signOut } = useAuth();
    const [isDarkMode, setIsDarkMode] = useState(true);

    return (
        <View className='flex-1 bg-primary'>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* ===== Header ===== */}
                <View className='items-center pt-16 pb-6 border-b border-dark-100'>
                    {/* Avatar */}
                    <TouchableOpacity
                        className='w-24 h-24 rounded-full bg-dark-100 items-center justify-center mb-3'
                        onPress={() => router.push('/(tabs)/edit-profile')}
                    >
                        {profile?.avatar_url ? (
                            <Image
                                source={{ uri: profile.avatar_url }}
                                className='w-24 h-24 rounded-full'
                                resizeMode='cover'
                            />
                        ) : (
                            // Hiện chữ cái đầu username nếu chưa có avatar
                            <Text className='text-white text-3xl font-bold'>
                                {profile?.username?.charAt(0).toUpperCase() ?? '?'}
                            </Text>
                        )}
                        {/* Badge edit */}
                        <View className='absolute bottom-0 right-0 bg-accent rounded-full w-7 h-7 items-center justify-center'>
                            <Text className='text-white text-xs'>✎</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Name & Email */}
                    <Text className='text-white text-xl font-bold'>
                        {profile?.username ?? user?.name ?? 'User'}
                    </Text>
                    <Text className='text-light-300 text-sm mt-1'>
                        {user?.email ?? ''}
                    </Text>

                    {/* Role badge — chỉ hiện nếu là admin */}
                    {profile?.role === 'admin' && (
                        <View className='bg-accent px-3 py-0.5 rounded-full mt-2'>
                            <Text className='text-white text-xs font-semibold'>Admin</Text>
                        </View>
                    )}
                </View>

                {/* ===== SECTION: Profile ===== */}
                <SectionHeader title='Profile' />
                <View className='bg-secondary rounded-2xl mx-4 overflow-hidden'>
                    <MenuItem
                        icon={icons.person}
                        label='Edit Profile'
                        onPress={() => router.push('/(tabs)/edit-profile')}
                    />
                    <MenuItem
                        icon={icons.save}
                        label='Saved Movies'
                        onPress={() => router.push('/(tabs)/saved')}
                    />
                </View>

                {/* ===== SECTION: Preferences ===== */}
                <SectionHeader title='Preferences' />
                <View className='bg-secondary rounded-2xl mx-4 overflow-hidden'>
                    <MenuItem
                        icon={icons.language}
                        label='Language'
                        value='English'
                        onPress={() => { }}
                    />
                    <MenuItem
                        icon={icons.theme}
                        label='Dark Mode'
                        rightElement={
                            <Switch
                                value={isDarkMode}
                                onValueChange={setIsDarkMode}
                                trackColor={{ false: '#2a2a2a', true: '#E50914' }}
                                thumbColor='#fff'
                            />
                        }
                    />
                </View>

                {/* ===== SECTION: Notifications ===== */}
                <SectionHeader title='Notifications' />
                <View className='bg-secondary rounded-2xl mx-4 overflow-hidden'>
                    <MenuItem
                        icon={icons.bell}
                        label='Notifications'
                        onPress={() => router.push('/(tabs)/notifications')}
                    />
                    <MenuItem
                        icon={icons.money}
                        label='Donations'
                        onPress={() => { }}
                    />
                </View>

                {/* ===== SECTION: Account ===== */}
                <SectionHeader title='Account' />
                <View className='bg-secondary rounded-2xl mx-4 overflow-hidden'>
                    <MenuItem
                        icon={icons.lock}
                        label='Change Password'
                        onPress={() => { }}
                    />
                    <MenuItem
                        icon={icons.info}
                        label='About'
                        onPress={() => { }}
                    />
                </View>

                {/* ===== Logout ===== */}
                <TouchableOpacity
                    className='mx-4 mt-6 py-4 rounded-2xl border border-accent items-center'
                    onPress={signOut}
                >
                    <Text className='text-accent font-semibold text-base'>Log out</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

export default Profile;