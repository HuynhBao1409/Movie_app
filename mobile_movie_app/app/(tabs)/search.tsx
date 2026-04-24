import MovieCard from '@/components/MovieCard'
import SearchBar from '@/components/SearchBar'
import { icons } from '@/constants/icons'
import { images } from '@/constants/images'
import { fetchMovies } from '@/services/api'
import { updateSearchCount } from '@/services/appwrite'
import useFetch from '@/services/useFetch'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Image, Text, View } from 'react-native'
// === Search page ===
const Search = () => {
    const [searchQuery, setSearchQuery] = useState('');

    // Hook fetch dữ liệu phim theo query hiện tại
    const {
        data: movies,
        loading,
        error,
        refetch: loadMovies,
        reset }
        = useFetch(() => fetchMovies({
            query: searchQuery
        }), false)

    // Debounce 500ms: chỉ call API sau khi user ngừng gõ
    useEffect(() => {
        const timeoutId = setTimeout(async () => {

            if (searchQuery.trim()) {
                const fetchedMovies = await loadMovies();
                if (Array.isArray(fetchedMovies) && fetchedMovies.length > 0 && fetchedMovies[0]) {
                    try {
                        await updateSearchCount(searchQuery, fetchedMovies[0]);
                    } catch (trackingError) {
                        // Loi tracking khong duoc phep lam hong luong tim kiem.
                        console.log('updateSearchCount failed:', trackingError);
                    }
                }
            } else {
                reset();
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    return (
        <View className='flex-1 bg-primary'>
            {/* Background*/}
            <Image source={images.bg} className='flex-1 absolute w-full z-0' resizeMode='cover' tintColor="#E50914" />

            <FlatList
                // Danh sách kết quả phim
                data={movies ?? []}
                renderItem={({ item }) => <MovieCard {...item} />}
                keyExtractor={(item) => item.id.toString()}
                numColumns={3}
                columnWrapperStyle={{ justifyContent: 'center', gap: 20, paddingRight: 5, marginBottom: 16 }}
                className='px-5 mt-5'
                contentContainerStyle={{ paddingBottom: 120 }}

                ListHeaderComponent={
                    <>
                        {/* Logo */}
                        <View className='w-full flex-row justify-center mt-20 items-center'>
                            <Image source={icons.logo} className='w-12 h-10' />
                        </View>
                        {/* Ô search và xử lý nhập text */}
                        <View className='my-5'>
                            <SearchBar
                                placeholder='Search movies...'
                                value={searchQuery}
                                onChangeText={(text: string) => setSearchQuery(text)}
                            />
                        </View>

                        {loading && (
                            <ActivityIndicator size='small' color='#E50914' className='my-3' />
                        )}

                        {error && (
                            <Text className='text-red-500 px-5 my-3'>
                                Error: {error.message}
                            </Text>
                        )}

                        {/* Search Results */}
                        {!loading && !error && searchQuery.trim() && (movies?.length ?? 0) > 0 && (
                            <Text className='text-xl text-white font-bold'>
                                Search Results for {' '}
                                <Text className='text-accent'>{searchQuery}</Text>
                            </Text>
                        )}
                    </>
                }
                ListEmptyComponent={
                    !loading && !error ? (
                        <View className='mt-10 px-5'>
                            <Text className='text-center text-gray-500'>
                                {searchQuery.trim() ? 'No movies found' : 'Search for a movies'}
                            </Text>
                        </View>
                    ) : null
                }
            />
        </View>
    )
}

export default Search