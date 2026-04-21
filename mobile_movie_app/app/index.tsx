import { fetchTrending } from '@/constants/api';
import { TMDB_IMAGE_BASE } from '@/constants/tmdb';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList, Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
}

export default function HomeScreen() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrending()
      .then(data => setMovies(data.results))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>🎬 Trending!</Text>
      {/* FlatList này lặp từng movie trong mảng movies để render ra item */}
      <FlatList
        data={movies}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            {/* Đây là chỗ hiện ảnh poster của phim */}
            <Image
              source={{ uri: `${TMDB_IMAGE_BASE}${item.poster_path}` }}
              style={styles.poster}
            />
            {/* Tên phim */}
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            {/* Điểm vote */}
            <Text style={styles.rating}>⭐ {item.vote_average.toFixed(1)}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f0f' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#fff', padding: 16 },
  row: { justifyContent: 'space-between', paddingHorizontal: 12 },
  card: { width: '48%', marginBottom: 16 },
  poster: { width: '100%', height: 220, borderRadius: 10 },
  title: { color: '#fff', fontSize: 13, marginTop: 6, fontWeight: '600' },
  rating: { color: '#f5c518', fontSize: 12, marginTop: 2 },
});