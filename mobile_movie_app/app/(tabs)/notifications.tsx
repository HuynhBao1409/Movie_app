import { icons } from '@/constants/icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';

type NotificationType = 'new_release' | 'donation';

interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    time: string;
    read: boolean;
}

// Placeholder data — sau thay bằng data thật từ Appwrite
const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        type: 'new_release',
        title: 'New Release 🎬',
        message: 'Avengers: Secret Wars is now available!',
        time: '2 hours ago',
        read: false,
    },
    {
        id: '2',
        type: 'donation',
        title: 'Donation received 💰',
        message: 'Thank you! Your donation of $5 was received.',
        time: '1 day ago',
        read: false,
    },
    {
        id: '3',
        type: 'new_release',
        title: 'New Release 🎬',
        message: 'Dune: Part Three has just dropped!',
        time: '3 days ago',
        read: true,
    },
];

const Notifications = () => {
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

    // Đánh dấu tất cả là đã đọc
    const markAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <View className='flex-1 bg-primary pt-16'>
            {/* ===== Header ===== */}
            <View className='flex-row items-center justify-between px-5 mb-4'>
                <TouchableOpacity onPress={router.back}>
                    <Image source={icons.arrow} className='size-5 rotate-180' tintColor='#fff' />
                </TouchableOpacity>
                <Text className='text-white text-lg font-bold'>Notifications</Text>
                {unreadCount > 0 ? (
                    <TouchableOpacity onPress={markAllRead}>
                        <Text className='text-accent text-xs font-semibold'>Mark all read</Text>
                    </TouchableOpacity>
                ) : (
                    <View className='w-16' />
                )}
            </View>

            {/* ===== List ===== */}
            {notifications.length === 0 ? (
                <View className='flex-1 items-center justify-center'>
                    <Image source={icons.bell} className='size-12 mb-4' tintColor='#9CA4AB' />
                    <Text className='text-light-300 text-base'>No notifications yet</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16 }}
                    ItemSeparatorComponent={() => <View className='h-2' />}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            className={`flex-row items-start p-4 rounded-2xl ${item.read ? 'bg-secondary' : 'bg-dark-100'
                                }`}
                            onPress={() => {
                                // Đánh dấu đã đọc khi bấm
                                setNotifications((prev) =>
                                    prev.map((n) => n.id === item.id ? { ...n, read: true } : n)
                                );
                            }}
                        >
                            {/* Icon theo type */}
                            <View className='w-10 h-10 rounded-full bg-primary items-center justify-center mr-3 mt-0.5'>
                                <Image
                                    source={item.type === 'donation' ? icons.money : icons.bell}
                                    className='size-5'
                                    tintColor={item.read ? '#9CA4AB' : '#E50914'}
                                />
                            </View>

                            {/* Content */}
                            <View className='flex-1'>
                                <Text className='text-white text-sm font-semibold'>{item.title}</Text>
                                <Text className='text-light-200 text-xs mt-1'>{item.message}</Text>
                                <Text className='text-light-300 text-xs mt-2'>{item.time}</Text>
                            </View>

                            {/* Unread dot */}
                            {!item.read && (
                                <View className='w-2 h-2 rounded-full bg-accent mt-2 ml-2' />
                            )}
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
};

export default Notifications;