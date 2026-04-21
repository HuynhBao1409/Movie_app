// ===== api.ts =====
import { TMDB_BASE_URL, TMDB_HEADERS } from './tmdb';

// Lấy danh sách phim trending trong tuần
export const fetchTrending = async () => {
    const res = await fetch(`${TMDB_BASE_URL}/trending/movie/week`, {
        headers: TMDB_HEADERS, // gửi kèm token xác thực
    });
    return res.json(); // trả về data dạng JSON (danh sách phim)
};

// Lấy danh sách phim phổ biến nhất hiện tại
export const fetchPopular = async () => {
    const res = await fetch(`${TMDB_BASE_URL}/movie/popular`, {
        headers: TMDB_HEADERS,
    });
    return res.json();
};