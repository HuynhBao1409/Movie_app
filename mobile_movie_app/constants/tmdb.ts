// ===== tmdb.ts =====
// URL gốc của TMDB API - mọi request đều bắt đầu bằng địa chỉ này
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// URL gốc để load ảnh phim (poster, backdrop...), w500 = độ rộng 500px
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

// Header đính kèm vào mỗi request để TMDB xác thực xem có quyền gọi API không
// Token lấy từ file .env (EXPO_PUBLIC_ prefix để Expo đọc được)
export const TMDB_HEADERS = {
    Authorization: `Bearer ${process.env.EXPO_PUBLIC_TMDB_TOKEN}`,
    'Content-Type': 'application/json',
};