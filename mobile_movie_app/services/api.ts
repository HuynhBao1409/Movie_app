// API config và các hàm call TMDB
export const TMDB_CONFIG = {
    BASE_URL: 'https://api.themoviedb.org/3',
    API_KEY: process.env.EXPO_PUBLIC_MOVIE_API_KEY,
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_MOVIE_API_KEY}`,
    }
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

    if (title === query || originalTitle === query) score += 1000;   // Ưu tiên cao nhất: tên khớp chính xác 100% với query
    if (title.startsWith(query) || originalTitle.startsWith(query)) score += 500; // Ưu tiên thứ hai: tên bắt đầu bằng query, vd: query "spider" → "Spider-Man" 
    if (title.includes(query) || originalTitle.includes(query)) score += 250;  // Ưu tiên thứ ba: tên chứa query ở bất kỳ vị trí nào

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
    const cleanQuery = query.trim();

    // Nếu có query → gọi API search, không có → lấy phim phổ biến nhất
    const endpoint = cleanQuery
        ? `${TMDB_CONFIG.BASE_URL}/search/movie?query=${encodeURIComponent(cleanQuery)}&include_adult=false&language=en-US&page=1`
        : `${TMDB_CONFIG.BASE_URL}/discover/movie?sort_by=popularity.desc`;
    const response = await fetch(endpoint, { method: 'GET', headers: TMDB_CONFIG.headers, });

    if (!response.ok) {
        throw new Error(`Failed to fetch movies: ${response.statusText}`);
    }

    const data = await response.json();

    const results: Movie[] = data.results ?? [];

    // Không có query thì TMDB đã sort sẵn theo popularity, trả về luôn
    if (!cleanQuery) {
        return results;
    }

    // Có query → sort lại theo thứ tự ưu tiên:
    return [...results].sort((a, b) => {
        // 1. Ưu tiên phim có điểm khớp tên cao hơn
        const scoreDiff = getSearchScore(b, cleanQuery) - getSearchScore(a, cleanQuery);
        if (scoreDiff !== 0) return scoreDiff;

        // 2. Nếu bằng điểm → ưu tiên phim có nhiều lượt vote hơn 
        const voteDiff = (b.vote_count ?? 0) - (a.vote_count ?? 0);
        if (voteDiff !== 0) return voteDiff;

        // 3. Vẫn bằng nhau → ưu tiên phim phổ biến hơn
        return (b.popularity ?? 0) - (a.popularity ?? 0);
    });
}


// ===== FUNCTION: fetchMovieDetails =====
// Lấy chi tiết đầy đủ của một bộ phim từ TMDB API
// Trả về: Promise<MovieDetails> chứa tất cả dữ liệu phim (poster, title, budget, revenue, genres, v.v.)
export const fetchMovieDetails = async (movieId: string): Promise<MovieDetails> => {
    try {
        // ===== GỬI REQUEST TỚI TMDB API =====
        const response = await fetch(`${TMDB_CONFIG.BASE_URL}/movie/${movieId}?api_key=${TMDB_CONFIG.API_KEY}`, {
            method: 'GET',
            headers: TMDB_CONFIG.headers,
        });

        if (!response.ok) throw new Error('Failed to fetch movie detail');

        const data = await response.json();

        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// Lấy danh sách diễn viên (credits)
// - Gọi endpoint `/movie/{movieId}/credits` và trả về mảng `cast`
// - Trả về: `Cast[]` (id, name, character, profile_path)
export const fetchMovieCredits = async (movieId: string) => {
    // Gọi API với `api_key` trong query string để đảm bảo TMDB cho phép request
    const response = await fetch(
        `${TMDB_CONFIG.BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_CONFIG.API_KEY}`,
        { method: 'GET', headers: TMDB_CONFIG.headers }
    );
    if (!response.ok) throw new Error('Failed to fetch credits');
    const data = await response.json();
    // API trả về object chứa { id, cast: [...], crew: [...] } 
    return data.cast as Cast[]; // top cast
}

// Lấy phim tương tự (similar movies)
// - Gọi endpoint `/movie/{movieId}/similar` và trả về danh sách phim tương tự
// - Trả về: `Movie[]` (mảng kết quả giống format của `/search` hoặc `/discover`)
export const fetchSimilarMovies = async (movieId: string) => {
    const response = await fetch(
        `${TMDB_CONFIG.BASE_URL}/movie/${movieId}/similar?api_key=${TMDB_CONFIG.API_KEY}`,
        { method: 'GET', headers: TMDB_CONFIG.headers }
    );
    if (!response.ok) throw new Error('Failed to fetch similar movies');
    const data = await response.json();
    // API trả về { page, results: [...], total_pages, total_results }
    return data.results as Movie[];
}
