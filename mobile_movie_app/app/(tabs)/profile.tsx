import { icons } from '@/constants/icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Image, ScrollView, Switch, Text, TouchableOpacity, View
} from 'react-native';

// ===== COMPONENT: SectionHeader =====
const SectionHeader = ({ title }: { title: string }) => (
    <Text className='text-light-300 text-xs font-semibold uppercase tracking-widest mb-2 mt-6 px-5'>
        {title}
    </Text>
);

// ===== COMPONENT: MenuItem =====
// Row item dùng chung cho các mục setting
const MenuItem = ({
    icon, label, value, onPress, rightElement
}: {
    icon: any;
    label: string;
    value?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
}) => (
    <TouchableOpacity
        onPress={onPress}
        className='flex-row items-center px-5 py-4 border-b border-dark-100'
        activeOpacity={onPress ? 0.7 : 1}
    >
        {/* Icon bên trái */}
        <View className='w-8 h-8 rounded-full bg-dark-100 items-center justify-center mr-3'>
            <Image source={icon} className='size-4' tintColor='#A8B5DB' />
        </View>

        {/* Label */}
        <Text className='text-white text-sm flex-1'>{label}</Text>

        {/* Value text hoặc custom element bên phải */}
        {value && (
            <Text className='text-light-300 text-sm mr-2'>{value}</Text>
        )}
        {rightElement ?? (
            onPress && (
                <Image source={icons.arrow} className='size-4' tintColor='#9CA4AB' />
            )
        )}
    </TouchableOpacity>
);

// ===== SCREEN: Profile =====
const Profile = () => {
    // --- Toggle States ---
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [notifyNewRelease, setNotifyNewRelease] = useState(true);
    const [notifyDonate, setNotifyDonate] = useState(false);

    // Placeholder user (sau này thay bằng data từ Appwrite Auth)
    const user = {
        name: 'Hao Nguyen',
        email: 'hao@example.com',
        avatar: null, // null = hiện icon mặc định
    };

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
                        onPress={() => {/* chọn ảnh sau */ }}
                    >
                        {user.avatar ? (
                            <Image
                                source={{ uri: user.avatar }}
                                className='w-24 h-24 rounded-full'
                            />
                        ) : (
                            <Image source={icons.person} className='size-10' tintColor='#A8B5DB' />
                        )}
                        {/* Badge chỉnh sửa avatar */}
                        <View className='absolute bottom-0 right-0 bg-accent rounded-full w-7 h-7 items-center justify-center'>
                            <Text className='text-white text-xs'>✎</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Name & Email */}
                    <Text className='text-white text-xl font-bold'>{user.name}</Text>
                    <Text className='text-light-300 text-sm mt-1'>{user.email}</Text>
                </View>

                {/* ===== SECTION: Profile ===== */}
                <SectionHeader title='Profile' />
                <View className='bg-secondary rounded-2xl mx-4 overflow-hidden'>
                    <MenuItem
                        icon={icons.person}
                        label='Edit Profile'
                        onPress={() => router.push('/(tabs)/profile')}
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
                    {/* Language */}
                    <MenuItem
                        icon={icons.language}
                        label='Language'
                        value='English'
                        onPress={() => {/* mở modal chọn ngôn ngữ */ }}
                    />

                    {/* Dark / Light mode */}
                    <MenuItem
                        icon={icons.theme} // thay bằng icon theme sau
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
                    {/* Thông báo phim mới */}
                    <MenuItem
                        icon={icons.bell}
                        label='Notifications'
                        onPress={() => router.push('/(tabs)/notifications')}
                    />

                    {/* Thông báo donate (placeholder cho sau) */}
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
                        icon={icons.lock} // thay bằng icon lock sau
                        label='Change Password'
                        onPress={() => {/* navigate sau */ }}
                    />
                    <MenuItem
                        icon={icons.info} // thay bằng icon info sau
                        label='About'
                        onPress={() => {/* navigate sau */ }}
                    />
                </View>

                {/* ===== Logout Button ===== */}
                <TouchableOpacity
                    className='mx-4 mt-6 py-4 rounded-2xl border border-accent items-center'
                    onPress={() => {/* gọi logout() sau */ }}
                >
                    <Text className='text-accent font-semibold text-base'>Log out</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
};

export default Profile;