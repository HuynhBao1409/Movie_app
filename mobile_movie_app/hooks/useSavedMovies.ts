import {
    getMovieStatus,
    getSavedMovies,
    removeMovie,
    SavedMovie,
    saveMovie,
    WatchStatus,
} from '@/services/savedMovies';
import { useCallback, useEffect, useState } from 'react';

// Custom Hook: useSavedMovies
// - Bao bọc các hàm trong `services/savedMovies` để cung cấp state + helper cho UI
// - Trả về:
//   - `savedMovies`: mảng phim đã lưu
//   - `loading`: trạng thái tải dữ liệu
//   - `save(movie)`: lưu hoặc cập nhật một movie rồi reload dữ liệu
//   - `remove(movieId)`: xóa movie rồi reload dữ liệu
//   - `getStatus(movieId)`: lấy trạng thái xem của 1 movie (wishlist|watching|watched|null)
//   - `byStatus(status)`: lọc `savedMovies` theo status
//   - `reload`: hàm load lại danh sách
export const useSavedMovies = () => {
    const [savedMovies, setSavedMovies] = useState<SavedMovie[]>([]);
    const [loading, setLoading] = useState(true);

    // Load dữ liệu từ storage
    const load = useCallback(async () => {
        setLoading(true);
        const data = await getSavedMovies();
        setSavedMovies(data);
        setLoading(false);
    }, []);

    // Tự động load khi hook mount
    useEffect(() => { load(); }, []);

    // Lưu movie rồi reload danh sách
    const save = async (movie: SavedMovie) => {
        await saveMovie(movie);
        await load();
    };

    // Xoá movie rồi reload danh sách
    const remove = async (movieId: number) => {
        await removeMovie(movieId);
        await load();
    };

    // Lấy trạng thái của movie (nếu đã lưu)
    const getStatus = async (movieId: number): Promise<WatchStatus | null> => {
        return getMovieStatus(movieId);
    };

    // Helper: trả về các phim theo status (dùng để hiển thị từng tab)
    const byStatus = (status: WatchStatus) =>
        savedMovies.filter((m) => m.status === status);

    return { savedMovies, loading, save, remove, getStatus, byStatus, reload: load };
};