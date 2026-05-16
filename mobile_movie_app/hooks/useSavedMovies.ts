import { useAuth } from '@/context/AuthContext';
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
export const useSavedMovies = () => {
    const { user } = useAuth();
    const [savedMovies, setSavedMovies] = useState<SavedMovie[]>([]);
    const [loading, setLoading] = useState(true);

    // Load dữ liệu từ storage
    const load = useCallback(async () => {
        if (!user?.$id) return; // chưa đăng nhập thì không load
        setLoading(true);
        const data = await getSavedMovies(user.$id);
        setSavedMovies(data);
        setLoading(false);
    }, [user?.$id]);

    // Tự động load khi hook mount
    useEffect(() => { load(); }, []);

    // Lưu movie rồi reload danh sách
    const save = async (movie: SavedMovie) => {
        if (!user?.$id) return;
        await saveMovie(user.$id, movie);
        await load();
    };

    // Xoá movie rồi reload danh sách
    const remove = async (movieId: number) => {
        if (!user?.$id) return;
        await removeMovie(user.$id, movieId);
        await load();
    };

    // Lấy trạng thái của movie (nếu đã lưu)
    const getStatus = async (movieId: number): Promise<WatchStatus | null> => {
        if (!user?.$id) return null;
        return getMovieStatus(user.$id, movieId);
    };

    // Helper: trả về các phim theo status (dùng để hiển thị từng tab)
    const byStatus = (status: WatchStatus) =>
        savedMovies.filter((m) => m.status === status);

    return { savedMovies, loading, save, remove, getStatus, byStatus, reload: load };
};