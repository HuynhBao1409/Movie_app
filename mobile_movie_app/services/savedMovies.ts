import AsyncStorage from '@react-native-async-storage/async-storage';

// Module quản lý danh sách phim đã lưu (local storage)
// - Lưu trữ bằng `AsyncStorage` dưới key `STORAGE_KEY`
// - Các hàm xuất ra (getSavedMovies, saveMovie, removeMovie, getMovieStatus)
//   dùng trong hook `useSavedMovies` để quản lý UI

export type WatchStatus = 'wishlist' | 'watching' | 'watched';

export interface SavedMovie {
    id: number;
    title: string;
    poster_path: string;
    vote_average: number;
    release_date: string;
    status: WatchStatus;
    savedAt: string; // ISO timestamp khi lưu
}

const STORAGE_KEY = '@saved_movies';

// Lấy toàn bộ phim đã lưu từ AsyncStorage
// Trả về mảng `SavedMovie[]`. Nếu có lỗi sẽ trả về mảng rỗng.
export const getSavedMovies = async (): Promise<SavedMovie[]> => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

// Lưu hoặc cập nhật một phim
// - Nếu phim đã tồn tại (cùng id) sẽ cập nhật record (ví dụ thay đổi status)
// - Nếu chưa tồn tại sẽ đẩy vào cuối mảng
export const saveMovie = async (movie: SavedMovie): Promise<void> => {
    const movies = await getSavedMovies();
    const existingIdx = movies.findIndex((m) => m.id === movie.id);
    if (existingIdx >= 0) {
        movies[existingIdx] = movie; // update status nếu đã có
    } else {
        movies.push(movie);
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
};

// Xoá phim theo movieId
export const removeMovie = async (movieId: number): Promise<void> => {
    const movies = await getSavedMovies();
    const filtered = movies.filter((m) => m.id !== movieId);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

// Lấy trạng thái (WatchStatus) của một phim đã lưu, hoặc null nếu chưa lưu
export const getMovieStatus = async (movieId: number): Promise<WatchStatus | null> => {
    const movies = await getSavedMovies();
    return movies.find((m) => m.id === movieId)?.status ?? null;
};