import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import TrendingCard from "@/components/TrendingCard";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { fetchMovies } from "@/services/api";
import { getTrendingMovies } from "@/services/appwrite";
import useFetch from "@/services/useFetch";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, ScrollView, Text, View } from "react-native";

// === Home page ===
export default function Index() {
  // --- Navigation & Focus State ---
  const router = useRouter();
  const isFocused = useIsFocused();

  // --- Fetch Trending Movies ---
  const {
    data: trendingMovies,
    loading: trendingLoading,
    error: trendingError,
    refetch: refetchTrending
  } = useFetch(getTrendingMovies);

  // --- Fetch Latest Movies ---
  const {
    data: movies,
    loading: moviesLoading,
    error: moviesError,
    refetch }
    = useFetch(() => fetchMovies({
      query: ''
    }))

  // --- Refresh Control State ---
  const [refreshing, setRefreshing] = useState(false);

  // --- Handle Pull-to-Refresh ---
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchTrending()]);
    setRefreshing(false);
  }, [refetch, refetchTrending]);

  // --- Refetch Trending on Tab Focus ---
  useEffect(() => {
    if (isFocused) {
      refetchTrending();
    }
  }, [isFocused]);

  // --- Home Screen UI ---
  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full z-0" tintColor="#E50914" />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ minHeight: "50%", paddingBottom: 10 }}
      >
        <Image source={icons.logo} className="w-12 h-10 m-20 mb-5 mx-auto" />
        {/* Loading */}
        {moviesLoading || trendingLoading ? (
          <ActivityIndicator
            size="small"
            color="#E50914"
            className="mt-10 self-center"
          />
        ) : moviesError || trendingError ? (
          <Text>Error: {moviesError?.message || trendingError?.message}</Text>
        ) : (
          // SearchBar
          < View className="flex-1 mt-5">
            <SearchBar
              onPress={() => router.push("/(tabs)/search")} placeholder="Search for a movie"
            />
            {/* Trending Movies */}
            {trendingMovies && (
              <View className="mt-10">
                <Text className="text-lg text-white font-bold mb-3">Trending Movies</Text>
              </View>
            )}

            {/* Trending Cards List */}
            <>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                ItemSeparatorComponent={() => <View className="w-4" />}
                className="mb-4 mt-3"
                data={trendingMovies}
                renderItem={({ item, index }) => (
                  <TrendingCard movie={item} index={index} />
                )}
                keyExtractor={(item, index) => `${item.movie_id}-${index}`}
              />

              {/* Latest Movies Section */}
              <Text className="text-lg text-white font-bold mt-5 mb-3">Latest Movies</Text>

              <FlatList
                data={movies}
                renderItem={({ item }) => (
                  <MovieCard
                    {...item}
                  />
                )}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                numColumns={3}
                columnWrapperStyle={{ justifyContent: 'flex-start', gap: 20, paddingRight: 5, marginBottom: 10 }}
                className="mt-2 pb-32"
                scrollEnabled={false}
              />
            </>
          </View>
        )
        }
      </ScrollView >
    </View >
  );
}

