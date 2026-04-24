// API config và các hàm call TMDB
export const TMDB_CONFIG = {
    BASE_URL: 'https://api.themoviedb.org/3',
    API_KEY: process.env.EXPO_PUBLIC_MOVIE_API_KEY,
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_MOVIE_API_KEY}`,
    }
}

const normalizeText = (value: string = '') =>
    value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();

const getSearchScore = (movie: Movie, rawQuery: string) => {
    const query = normalizeText(rawQuery);
    if (!query) return 0;

    const title = normalizeText(movie.title);
    const originalTitle = normalizeText(movie.original_title);
    const tokens = query.split(/\s+/).filter(Boolean);

    let score = 0;

    if (title === query || originalTitle === query) score += 1000;
    if (title.startsWith(query) || originalTitle.startsWith(query)) score += 500;
    if (title.includes(query) || originalTitle.includes(query)) score += 250;

    const matchedTokenCount = tokens.filter((token) =>
        title.includes(token) || originalTitle.includes(token)
    ).length;

    score += matchedTokenCount * 80;
    score += Math.min(movie.popularity ?? 0, 100);

    return score;
}

// Lấy danh sách phim phổ biến
export const fetchMovies = async ({ query }: { query: string }) => {
    const cleanQuery = query.trim();

    const endpoint = cleanQuery
        ? `${TMDB_CONFIG.BASE_URL}/search/movie?query=${encodeURIComponent(cleanQuery)}&include_adult=false&language=en-US&page=1`
        : `${TMDB_CONFIG.BASE_URL}/discover/movie?sort_by=popularity.desc`;
    const response = await fetch(endpoint, { method: 'GET', headers: TMDB_CONFIG.headers, });

    if (!response.ok) {
        throw new Error(`Failed to fetch movies: ${response.statusText}`);
    }

    const data = await response.json();

    const results: Movie[] = data.results ?? [];

    if (!cleanQuery) {
        return results;
    }

    return [...results].sort((a, b) => {
        const scoreDiff = getSearchScore(b, cleanQuery) - getSearchScore(a, cleanQuery);
        if (scoreDiff !== 0) return scoreDiff;

        const voteDiff = (b.vote_count ?? 0) - (a.vote_count ?? 0);
        if (voteDiff !== 0) return voteDiff;

        return (b.popularity ?? 0) - (a.popularity ?? 0);
    });
}
