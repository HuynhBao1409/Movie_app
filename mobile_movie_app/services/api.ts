// Map ngôn ngữ app → TMDB language code
import i18n from '@/constants/i18n';
const getLang = () => i18n.language === 'vi' ? 'vi-VN' : 'en-US';

// API config và các hàm call TMDB
export const TMDB_CONFIG = {
    BASE_URL: 'https://api.themoviedb.org/3',
    API_KEY: process.env.EXPO_PUBLIC_MOVIE_API_KEY,
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_MOVIE_API_KEY}`,
    }
}

const fetchMoviesByLanguage = async ({ query, language }: { query: string; language: string }) => {
    const cleanQuery = query.trim();

    // Có query thì search theo từ khóa, không có thì lấy phim phổ biến.
    const endpoint = cleanQuery
        ? `${TMDB_CONFIG.BASE_URL}/search/movie?query=${encodeURIComponent(cleanQuery)}&include_adult=false&language=${language}&page=1`
        : `${TMDB_CONFIG.BASE_URL}/discover/movie?sort_by=popularity.desc&language=${language}`;

    const response = await fetch(endpoint, { method: 'GET', headers: TMDB_CONFIG.headers });

    // Nếu TMDB trả lỗi thì dừng luôn để tầng UI bắt và báo lỗi.
    if (!response.ok) {
        throw new Error(`Failed to fetch movies: ${response.statusText}`);
    }

    const data = await response.json(); // gửi response thành JSON
    const results: Movie[] = data.results ?? [];

    // Không search thì giữ nguyên kết quả từ TMDB.
    if (!cleanQuery) {
        return results;
    }

    // Search thì sort lại: khớp title trước, rồi vote_count, rồi popularity.
    return [...results].sort((a, b) => {
        const scoreDiff = getSearchScore(b, cleanQuery) - getSearchScore(a, cleanQuery);
        if (scoreDiff !== 0) return scoreDiff;

        const voteDiff = (b.vote_count ?? 0) - (a.vote_count ?? 0);
        if (voteDiff !== 0) return voteDiff;

        return (b.popularity ?? 0) - (a.popularity ?? 0);
    });
}

// Chuẩn hoá chuỗi để so sánh tìm kiếm
// - Chuyển về chữ thường, loại bỏ dấu (diacritics) và trim
const normalizeText = (value: string = '') =>
    value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();

// Tính điểm độ phù hợp giữa phim và từ khóa tìm kiếm        
const getSearchScore = (movie: Movie, rawQuery: string) => {
    const query = normalizeText(rawQuery); // Chuẩn hóa query (lowercase, bỏ dấu, trim...)
    if (!query) return 0;

    const title = normalizeText(movie.title);
    const originalTitle = normalizeText(movie.original_title);
    const tokens = query.split(/\s+/).filter(Boolean); // Tách query thành từng từ, vd: "spider man" → ["spider", "man"]

    let score = 0;
    // Ưu tiên cao nhất: tên khớp chính xác 100% với query
    if (title === query || originalTitle === query) score += 1000;
    // Ưu tiên thứ hai: tên bắt đầu bằng query, vd: query "spider" → "Spider-Man" 
    if (title.startsWith(query) || originalTitle.startsWith(query)) score += 500;
    // Ưu tiên thứ ba: tên chứa query ở bất kỳ vị trí nào
    if (title.includes(query) || originalTitle.includes(query)) score += 250;

    // Đếm số từ đơn lẻ trong query khớp với tên phim, mỗi từ khớp +80 điểm
    const matchedTokenCount = tokens.filter((token) =>
        title.includes(token) || originalTitle.includes(token)
    ).length;
    score += matchedTokenCount * 80; // vd: query "spider man" → "spider" khớp +80, "man" khớp +80 → tổng +160

    score += Math.min(movie.popularity ?? 0, 100); // Cộng thêm điểm độ phổ biến, giới hạn tối đa 100

    return score;
}

// Lấy danh sách phim phổ biến
export const fetchMovies = async ({ query }: { query: string }) => {
    // Luôn lấy bản tiếng Anh trước để title chính của UI ổn định.
    const englishResults = await fetchMoviesByLanguage({ query, language: 'en-US' });

    // Nếu app không ở tiếng Việt thì trả luôn danh sách tiếng Anh.
    if (i18n.language !== 'vi') {
        return englishResults;
    }

    // Nếu đang ở tiếng Việt, gọi thêm 1 lần với vi-VN để lấy title phụ tương ứng.
    const vietnameseResults = await fetchMoviesByLanguage({ query, language: 'vi-VN' });
    // Map theo movie.id để ghép title Việt vào đúng phim tiếng Anh ở trên.
    const vietnameseTitleMap = new Map(
        vietnameseResults.map((movie) => [movie.id, movie.title])
    );

    // Giữ nguyên dữ liệu tiếng Anh, chỉ gắn thêm localized_title cho UI hiển thị dòng phụ.
    return englishResults.map((movie) => ({
        ...movie,
        localized_title: vietnameseTitleMap.get(movie.id),
    }));
}


// ===== FUNCTION: fetchMovieDetails =====
// Lấy chi tiết đầy đủ của một bộ phim từ TMDB API
// Trả về: Promise<MovieDetails> chứa tất cả dữ liệu phim (poster, title, budget, revenue, genres, v.v.)
export const fetchMovieDetails = async (movieId: string, language: string = getLang()): Promise<MovieDetails> => {
    try {
        // ===== GỬI REQUEST TỚI TMDB API =====
        const response = await fetch(`${TMDB_CONFIG.BASE_URL}/movie/${movieId}?api_key=${TMDB_CONFIG.API_KEY}&language=${language}`, {
            method: 'GET',
            headers: TMDB_CONFIG.headers,
        });

        if (!response.ok) throw new Error('Failed to fetch movie detail');

        const data = await response.json(); // gửi response thành JSON

        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// Lấy danh sách diễn viên (credits)
// - Gọi endpoint `/movie/{movieId}/credits` và trả về mảng `cast`
// - Trả về: `Cast[]` 
export const fetchMovieCredits = async (movieId: string) => {
    // Gọi API với `api_key` trong query string để đảm bảo TMDB cho phép request
    const response = await fetch(
        `${TMDB_CONFIG.BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_CONFIG.API_KEY}&language=en-US`,
        { method: 'GET', headers: TMDB_CONFIG.headers }
    );
    if (!response.ok) throw new Error('Failed to fetch credits');
    const data = await response.json();
    // API trả về object 
    return data.cast as Cast[];
}

// Lấy phim tương tự (similar movies)
// - Gọi endpoint `/movie/{movieId}/similar` và trả về danh sách phim tương tự
// - Trả về: `Movie[]` (mảng kết quả giống format của `/search` hoặc `/discover`)
export const fetchSimilarMovies = async (movieId: string, language: string = 'en-US') => {
    const response = await fetch(
        `${TMDB_CONFIG.BASE_URL}/movie/${movieId}/similar?api_key=${TMDB_CONFIG.API_KEY}&language=${language}`,
        { method: 'GET', headers: TMDB_CONFIG.headers }
    );
    if (!response.ok) throw new Error('Failed to fetch similar movies');
    const data = await response.json();
    // API trả về
    return data.results as Movie[];
}
// Lấy trailer movies
export const fetchMovieVideos = async (movieId: string) => {
    const response = await fetch(
        `${TMDB_CONFIG.BASE_URL}/movie/${movieId}/videos`,
        { method: 'GET', headers: TMDB_CONFIG.headers }
    );
    const data = await response.json();
    console.log('VIDEO RAW:', JSON.stringify(data));
    //trả về nếu có chỉ lấy site ytb nếu ko cho rỗng
    return data.results?.filter(
        (v: any) => v.site === 'YouTube'
    ) ?? [];
};



// Tìm link stream từ OPhim theo tên phim
// User bấm ▶ trên [id].tsx
//     ↓
// router.push(`/movies/player?title=${movie.original_title}`)
//     ↓
// player.tsx nhận title từ params
//     ↓
// fetchStreamUrl(title) → gọi OPhim API search bằng title đó
//     ↓
// OPhim trả về slug → gọi tiếp API chi tiết lấy link m3u8
//     ↓
// expo-video stream link đó
export const fetchStreamUrl = async (movieTitle: string) => {
    // Thử original_title trước, nếu miss thì thử bỏ bớt chữ
    const keywords = [
        movieTitle,
        movieTitle.split(':')[0].trim(), // bỏ phần sau dấu : vd "Thor: Love" → "Thor"
    ];

    for (const keyword of keywords) {
        const res = await fetch(
            `https://ophim1.com/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&limit=1`
        );
        const data = await res.json();
        const slug = data?.data?.items?.[0]?.slug;
        if (!slug) continue;

        const detail = await fetch(`https://ophim1.com/v1/api/phim/${slug}`);
        const detailData = await detail.json();
        const url = detailData?.data?.item?.episodes?.[0]?.server_data?.[0]?.link_m3u8;
        if (url) return url;
    }

    return null;
};