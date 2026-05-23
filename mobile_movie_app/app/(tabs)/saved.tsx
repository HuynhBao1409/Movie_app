import { useSavedMovies } from '@/hooks/useSavedMovies';
import { WatchStatus } from '@/services/savedMovies';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const Saved = () => {
    const router = useRouter();
    const isFocused = useIsFocused();
    const { loading, byStatus, remove, reload } = useSavedMovies();
    // === Translation ===
    const { t, i18n } = useTranslation();
    const [activeTab, setActiveTab] = useState<WatchStatus>('wishlist');
    const TABS: { label: string; value: WatchStatus }[] = [
        { label: t('saved.wishlist'), value: 'wishlist' },
        { label: t('saved.watching'), value: 'watching' },
        { label: t('saved.watched'), value: 'watched' },
    ];

    // Reload khi quay lại tab
    useEffect(() => { if (isFocused) reload(); }, [isFocused, reload]);

    const movies = byStatus(activeTab);

    return (
        <View className="flex-1 bg-primary pt-16 px-5">
            <Text className="text-white text-2xl font-bold text-center mb-6">
                {t('saved.title')}
            </Text>

            {/* Tab Bar */}
            <View className="flex-row mb-6 border-b border-gray-700">
                {TABS.map((tab) => (
                    <TouchableOpacity
                        key={tab.value}
                        onPress={() => setActiveTab(tab.value)}
                        className="flex-1 items-center pb-3"
                    >
                        <Text
                            className={`text-sm font-semibold ${activeTab === tab.value ? 'text-white' : 'text-gray-500'
                                }`}
                        >
                            {tab.label}
                        </Text>
                        {activeTab === tab.value && (
                            <View className="absolute bottom-0 h-0.5 w-full bg-accent" />
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            {/* Content */}
            {loading ? (
                <ActivityIndicator color="#E50914" className="mt-10" />
            ) : movies.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <Text className="text-gray-500 text-base text-center">
                        {t('saved.empty')}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={movies}
                    keyExtractor={(item) => String(item.id)}
                    numColumns={3}
                    columnWrapperStyle={{ gap: 12, marginBottom: 12 }}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            className="flex-1"
                            onPress={() => router.push(`/movies/${item.id}`)}
                            onLongPress={() => remove(item.id)} // giữ để xoá
                        >
                            <Image
                                source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }}
                                className="w-full h-40 rounded-lg"
                                resizeMode="cover"
                            />
                            {/* Title chính */}
                            <Text className="text-white text-xs mt-1" numberOfLines={1}>
                                {item.title}
                            </Text>
                            {i18n.language === 'vi' && item.localized_title && item.localized_title !== item.title && (
                                <Text className="text-light-300 text-xs mt-0.5" numberOfLines={1}>
                                    {item.localized_title}
                                </Text>
                            )}
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
};

export default Saved;