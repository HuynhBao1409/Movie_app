import { icons } from '@/constants/icons';
import { useSavedMovies } from '@/hooks/useSavedMovies';
import { fetchMovieCredits, fetchMovieDetails, fetchSimilarMovies } from '@/services/api';
import { WatchStatus } from '@/services/savedMovies';
import useFetch from '@/services/useFetch';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface MovieInfoProps {
    label: string;
    value?: string | number | null;
}

// ===== COMPONENT: MovieInfo =====
// Hiển thị một cặp label - value info
const MovieInfo = ({ label, value }: MovieInfoProps) => (
    <View className='flex-col items-start justify-center mt-5'>
        <Text className='text-light-200 font-normal text-sm'>{label}</Text>
        <Text className='text-light-100 font-normal text-sm mt-2'>
            {value || 'N/A'}
        </Text>
    </View>
)

// ===== COMPONENT: MovieDetails =====
const MovieDetails = () => {

    // ===== PARAMS & DATA FETCH =====
    const { id } = useLocalSearchParams();
    const { data: movie, loading } = useFetch(() => fetchMovieDetails(id as string));
    const { data: credits } = useFetch(() => fetchMovieCredits(id as string));
    const { data: similarMovies } = useFetch(() => fetchSimilarMovies(id as string));

    // ===== SAVED STATE =====
    const { save, remove, getStatus } = useSavedMovies();
    const [savedStatus, setSavedStatus] = useState<WatchStatus | null>(null);

    // Load trạng thái saved khi có movie id
    useEffect(() => {
        if (movie?.id) {
            getStatus(movie.id).then(setSavedStatus);
        }
    }, [movie?.id]);

    // Xử lý save/unsave movie theo status
    const handleSave = async (status: WatchStatus) => {
        if (!movie) return;
        if (savedStatus === status) {
            // Bấm lại status đang active → bỏ lưu
            await remove(movie.id);
            setSavedStatus(null);
        } else {
            // Lưu mới hoặc đổi status
            await save({
                id: movie.id,
                title: movie.title,
                poster_path: movie.poster_path ?? '',
                vote_average: movie.vote_average ?? 0,
                release_date: movie.release_date ?? '',
                status,
                savedAt: new Date().toISOString(),
            });
            setSavedStatus(status);
        }
    };

    // 3 nút save
    const SAVE_BUTTONS: { label: string; value: WatchStatus }[] = [
        { label: 'Wishlist', value: 'wishlist' },
        { label: 'Watching', value: 'watching' },
        { label: 'Watched', value: 'watched' },
    ];

    // ===== LOADING STATE =====
    if (loading) {
        return (
            <View className='flex-1 items-center justify-center bg-primary'>
                <Text className='text-light-200'>Loading...</Text>
            </View>
        );
    }

    return (
        <View className='bg-primary flex-1'>
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>

                {/* ===== Poster ===== */}
                <View>
                    <Image
                        source={{
                            uri: movie?.poster_path
                                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                                : undefined
                        }}
                        className='w-full h-[550px]'
                        resizeMode='stretch'
                    />
                </View>

                <View className='flex-col items-start justify-center mt-5 px-5'>

                    {/* ===== Title + Play Button ===== */}
                    <View className='flex-row items-center justify-between w-full mt-5'>
                        <Text
                            className='text-white font-bold text-xl flex-1 mr-3'
                            numberOfLines={1}
                            ellipsizeMode='tail'
                        >
                            {movie?.title ?? 'Untitled'}
                        </Text>
                        <TouchableOpacity
                            className='bg-accent rounded-full w-12 h-12 items-center justify-center'
                            onPress={() => { }}
                        >
                            <Image source={icons.play} className='size-5' tintColor="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* ===== Metadata (Year & Runtime) ===== */}
                    <View className='flex-row items-center gap-x-1 mt-2'>
                        <Text className='text-light-200 text-sm'>
                            {movie?.release_date ? movie.release_date.split('-')[0] : '—'}
                        </Text>
                        <Text className='text-light-200 text-sm'>
                            {movie?.runtime
                                ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
                                : '—'}
                        </Text>
                    </View>

                    {/* ===== Rating ===== */}
                    <View className='flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-2'>
                        <Image source={icons.star} className='size-4' />
                        <Text className='text-white font-bold text-sm'>
                            {(movie?.vote_average ?? 0).toFixed(1)}/10
                        </Text>
                        <Text className='text-light-200 text-sm'>
                            ({movie?.vote_count ?? 0} votes)
                        </Text>
                    </View>

                    {/* ===== Save Buttons (Wishlist / Watching / Watched) ===== */}
                    <View className='flex-row gap-x-2 mt-4 w-full'>
                        {SAVE_BUTTONS.map((btn) => (
                            <TouchableOpacity
                                key={btn.value}
                                onPress={() => handleSave(btn.value)}
                                className={`flex-1 py-2 rounded-lg items-center border ${savedStatus === btn.value
                                        ? 'bg-accent border-accent'
                                        : 'border-dark-100'
                                    }`}
                            >
                                <Text className='text-white text-xs font-semibold'>
                                    {btn.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* ===== Overview ===== */}
                    <MovieInfo label='Overview' value={movie?.overview ?? 'N/A'} />

                    {/* ===== Genres ===== */}
                    <MovieInfo
                        label='Genres'
                        value={movie?.genres?.map((g) => g.name).join(' - ') || 'N/A'}
                    />

                    {/* ===== Budget & Revenue ===== */}
                    <View className='flex flex-row justify-between w-1/2 gap-x-4'>
                        <MovieInfo
                            label='Budget'
                            value={`$${((movie?.budget ?? 0) / 1_000_000).toFixed(0)} million`}
                        />
                        <MovieInfo
                            label='Revenue'
                            value={`$${((movie?.revenue ?? 0) / 1_000_000).toFixed(3)} million`}
                        />
                    </View>

                    {/* ===== Production Companies ===== */}
                    <MovieInfo
                        label='Production Companies'
                        value={movie?.production_companies?.map((c) => c.name).join(' - ') || 'N/A'}
                    />

                    {/* ===== Cast (horizontal scroll, top 10) ===== */}
                    {credits && credits.length > 0 && (
                        <View className='mt-5 w-full'>
                            <Text className='text-white font-bold text-sm mb-3'>Cast</Text>
                            <FlatList
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                data={credits.slice(0, 10)}
                                keyExtractor={(item) => String(item.id)}
                                ItemSeparatorComponent={() => <View className='w-4' />}
                                renderItem={({ item }) => (
                                    <View className='items-center w-20'>
                                        <Image
                                            source={{
                                                uri: item.profile_path
                                                    ? `https://image.tmdb.org/t/p/w185${item.profile_path}`
                                                    : 'https://via.placeholder.com/185x185?text=N/A',
                                            }}
                                            className='w-16 h-16 rounded-full'
                                            resizeMode='cover'
                                        />
                                        <Text className='text-white text-xs text-center mt-2 font-semibold' numberOfLines={2}>
                                            {item.name}
                                        </Text>
                                        <Text className='text-light-300 text-xs text-center mt-0.5' numberOfLines={1}>
                                            {item.character}
                                        </Text>
                                    </View>
                                )}
                            />
                        </View>
                    )}

                    {/* ===== Similar Movies (horizontal scroll, top 10) ===== */}
                    {similarMovies && similarMovies.length > 0 && (
                        <View className='mt-6 w-full'>
                            <Text className='text-white font-bold text-sm mb-3'>Similar Movies</Text>
                            <FlatList
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                data={similarMovies.slice(0, 10)}
                                keyExtractor={(item) => String(item.id)}
                                ItemSeparatorComponent={() => <View className='w-3' />}
                                renderItem={({ item }) => (
                                    // replace thay vì push để không stack màn hình
                                    <TouchableOpacity onPress={() => router.replace(`/movies/${item.id}`)}>
                                        <Image
                                            source={{
                                                uri: item.poster_path
                                                    ? `https://image.tmdb.org/t/p/w185${item.poster_path}`
                                                    : 'https://via.placeholder.com/185x280?text=N/A',
                                            }}
                                            className='w-28 h-40 rounded-lg'
                                            resizeMode='cover'
                                        />
                                        <Text className='text-white text-xs mt-1 w-28' numberOfLines={1}>
                                            {item.title}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    )}

                </View>
            </ScrollView>

            {/* ===== Back Button (fixed bottom) ===== */}
            <TouchableOpacity
                className='absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50'
                onPress={router.back}
            >
                <Image source={icons.arrow} className='size-5 mr-1 mt-0.5 rotate-180' tintColor="#fff" />
                <Text className='text-white font-semibold text-base'>Go back</Text>
            </TouchableOpacity>
        </View>
    );
}

export default MovieDetails;