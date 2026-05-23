// Luu va cap nhat thong ke tim kiem len Appwrite.
import i18n from '@/constants/i18n';
import { Client, Databases, ID, Query } from "react-native-appwrite";
import "react-native-url-polyfill/auto";
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;
const APPWRITE_ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT ?? "https://nyc.cloud.appwrite.io/v1";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.EXPO_PUBLIC_MOVIE_API_KEY;
const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = CURRENT_YEAR - 2;

// Khởi tạo Appwrite client và kết nối project
const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)

const database = new Databases(client);

const fetchTopRatedMoviesByLanguage = async (language: string) => {
    if (!TMDB_API_KEY) return [];

    // Chỉ lấy phim trong 3 năm gần nhất: hiện tại, 1 năm trước, và 2 năm trước.
    const response = await fetch(
        `${TMDB_BASE_URL}/discover/movie?sort_by=vote_average.desc&vote_count.gte=100&primary_release_date.gte=${MIN_YEAR}-01-01&primary_release_date.lte=${CURRENT_YEAR}-12-31&page=1&language=${language}`,
        {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${TMDB_API_KEY}`,
            },
        }
    );

    if (!response.ok) {
        return [];
    }

    const data = await response.json();
    return (data.results ?? []) as Movie[];
};

// === UPDATE SEARCH COUNT ===
/**
 * Cập nhật thống kê lượt tìm kiếm của một từ khóa lên Appwrite.
 * - Nếu từ khóa đã tồn tại => tăng count lên 1.
 * - Nếu chưa tồn tại => tạo document mới với count = 1.
 * @param query - Từ khóa người dùng tìm kiếm
 * @param movie - Bộ phim đầu tiên xuất hiện trong kết quả tìm kiếm
 */
export const updateSearchCount = async (query: string, movie: Movie) => {
    try {
        const normalizedQuery = query.trim();
        if (!normalizedQuery) return;

        // Tìm document có searchTerm trùng với từ khóa
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.equal('searchTerm', normalizedQuery)])

        // Từ khóa đã tồn tại → lấy document đầu tiên và tăng count
        if (result.documents.length > 0) {
            const existingMovie = result.documents[0];

            const updatePayload = {
                count: existingMovie.count + 1,
                title: movie.title,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                vote_average: movie.vote_average,
            };

            try {
                await database.updateDocument(
                    DATABASE_ID,
                    COLLECTION_ID,
                    existingMovie.$id,
                    updatePayload
                )
            } catch {
                // Fallback cho schema cũ: nếu chưa có vote_average thì chỉ update các field legacy
                await database.updateDocument(
                    DATABASE_ID,
                    COLLECTION_ID,
                    existingMovie.$id,
                    {
                        count: existingMovie.count + 1,
                        title: movie.title,
                        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                    }
                )
            }
        } else {
            // Từ khóa chưa tồn tại => tạo document mới
            const createPayload = {
                searchTerm: normalizedQuery,
                movie_id: movie.id,
                title: movie.title,
                count: 1,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                vote_average: movie.vote_average,
            };

            try {
                await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), createPayload)
            } catch {
                // Fallback nếu create với vote_average lỗi thì tạo document không có field
                await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                    searchTerm: normalizedQuery,
                    movie_id: movie.id,
                    title: movie.title,
                    count: 1,
                    poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                })
            }
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// === GET TRENDING MOVIES ===
/**
 * Lấy 10 phim có điểm vote cao nhất từ TMDB trong 3 năm gần nhất.
 * Title chính luôn là tiếng Anh, title phụ là tiếng Việt khi app đang ở vi.
 */
export const getTrendingMovies = async (): Promise<TrendingMovie[] | undefined> => {
    try {
        const [englishMovies, vietnameseMovies] = await Promise.all([
            fetchTopRatedMoviesByLanguage('en-US'),
            i18n.language === 'vi' ? fetchTopRatedMoviesByLanguage('vi-VN') : Promise.resolve([] as Movie[]),
        ]);

        const vietnameseTitleMap = new Map(
            vietnameseMovies.map((movie) => [movie.id, movie.title])
        );

        return englishMovies.slice(0, 10).map((movie) => ({
            movie_id: movie.id,
            title: movie.title,
            original_title: movie.original_title,
            localized_title: vietnameseTitleMap.get(movie.id) ?? '',
            poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '',
            vote_average: movie.vote_average,
            searchTerm: '',
            count: 0,
        }));
    } catch (error) {
        console.log(error);
        return undefined;
    }
}