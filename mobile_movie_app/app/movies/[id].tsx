import { icons } from '@/constants/icons';
import { fetchMovieDetails } from '@/services/api';
import useFetch from '@/services/useFetch';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface MovieInfoProps {
    label: string;
    value?: string | number | null;
}

// ===== COMPONENT: MovieInfo =====
const MovieInfo = ({ label, value }: MovieInfoProps) => (
    <View className='flex-col items-start justify-center mt-5'>
        <Text className='text-light-200 font-normal text-sm'>{label}</Text>
        <Text className='text-light-100 font-normal text-sm mt-2'>
            {value || 'N/A'}
        </Text>
    </View>
)


// ===== COMPONENT: MovieDetails =====
// Màn hình chi tiết phim - hiển thị tất cả thông tin của một bộ phim cụ thể
// - Lấy movie ID từ URL parameters
// - Fetch dữ liệu phim từ API TMDB
// - Hiển thị: poster, tiêu đề, năm phát hành, thời lượng, đánh giá, mô tả, thể loại, ngân sách, doanh thu, công ty sản xuất
const MovieDetails = () => {
    // ===== LẤY PARAMS VÀ DATA =====
    // id: lấy movie ID từ URL (ví dụ: /movies/550)
    const { id } = useLocalSearchParams();

    // Fetch chi tiết phim từ API, loading = trạng thái đang tải
    const { data: movie, loading } = useFetch(() => fetchMovieDetails(id as string));
    // Hiện trạng tải dữ liệu
    if (loading) {
        return (
            <View className='flex-1 items-center justify-center bg-primary'>
                <Text className='text-light-200'>Loading...</Text>
            </View>
        );
    }

    return (
        <View className='bg-primary flex-1'>
            <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
                {/* ===== Poster ===== */}
                <View>
                    <Image
                        source={{ uri: movie?.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined }}
                        className='w-full h-[550px]'
                        resizeMode='stretch'
                    />
                </View>

                {/* ===== Title ===== */}
                <View className='flex-col items-start justify-center mt-5 px-5'>
                    <Text className='text-white font-bold text-xl'>{movie?.title ?? 'Untitled'}</Text>


                    {/* ===== Metadata(Year & Runtime) ===== */}
                    <View className='flex-row items-center gap-x-1 mt-2'>
                        <Text className='text-light-200 text-sm'>{movie?.release_date ? movie.release_date.split('-')[0] : '—'}</Text>
                        <Text className='text-light-200 text-sm'>{movie?.runtime ? `${movie.runtime}m` : '—'}</Text>
                    </View>

                    {/* ===== Rating ===== */}
                    <View className='flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-2 '>
                        <Image source={icons.star} className='size-4' />
                        <Text className='text-white font-bold text-sm'>
                            {(movie?.vote_average ?? 0).toFixed(1)}/10
                        </Text>
                        <Text className='text-light-200 text-sm'>({movie?.vote_count ?? 0} votes)</Text>
                    </View>

                    {/* ===== Overview ===== */}
                    <View className='px-5'>
                        <MovieInfo label='Overview' value={movie?.overview ?? 'N/A'} />
                    </View>

                    {/* ===== ADDITIONAL INFO SECTION ===== */}
                    <View className='px-5'>
                        <MovieInfo label='Genres' value={movie?.genres?.map((g) => g.name).join(' - ') || 'N/A'} />
                        <View className='flex flex-row justify-between w-1/2 gap-x-4'>
                            <MovieInfo label='Budget' value={`$${((movie?.revenue ?? 0) / 1_000_000).toFixed(0)} million`} />
                            <MovieInfo label='Revenue' value={`$${((movie?.revenue ?? 0) / 1_000_000).toFixed(3)} million`} />
                        </View>

                        <MovieInfo label='Production Companies' value={movie?.production_companies.map((c) => c.name).join(' - ') || 'N/A'} />
                    </View>
                </View>
            </ScrollView>

            {/* ===== BACK BUTTON (Fixed Position) ===== */}
            <TouchableOpacity className='absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50'
                onPress={router.back}>
                <Image source={icons.arrow} className='size-5 mr-1 mt-0.5 rotate-180' tintColor="#fff" />
                <Text className='text-white font-semibold text-base'> Go back</Text>
            </TouchableOpacity>
        </View>
    );
}

export default MovieDetails