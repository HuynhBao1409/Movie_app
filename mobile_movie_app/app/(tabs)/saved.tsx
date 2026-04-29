import { useSavedMovies } from '@/hooks/useSavedMovies';
import { WatchStatus } from '@/services/savedMovies';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const TABS: { label: string; value: WatchStatus }[] = [
    { label: 'Wishlist', value: 'wishlist' },
    { label: 'Watching', value: 'watching' },
    { label: 'Watched', value: 'watched' },
];

const Saved = () => {
    const router = useRouter();
    const isFocused = useIsFocused();
    const { loading, byStatus, remove, reload } = useSavedMovies();
    const [activeTab, setActiveTab] = useState<WatchStatus>('wishlist');

    // Reload khi quay lại tab
    useEffect(() => { if (isFocused) reload(); }, [isFocused]);

    const movies = byStatus(activeTab);

    return (
        <View className="flex-1 bg-primary pt-16 px-5">
            <Text className="text-white text-2xl font-bold text-center mb-6">
                My movie list
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
                        You are not more movies to this list
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
                            <Text
                                className="text-white text-md mt-1"
                                numberOfLines={1}
                            >
                                {item.title}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
};

export default Saved;