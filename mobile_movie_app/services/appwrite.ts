// Luu va cap nhat thong ke tim kiem len Appwrite.
import { Client, Databases, ID, Query } from "react-native-appwrite";
import "react-native-url-polyfill/auto";
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;
const APPWRITE_ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT ?? "https://nyc.cloud.appwrite.io/v1";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.EXPO_PUBLIC_MOVIE_API_KEY;

// Khởi tạo Appwrite client và kết nối project
const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)

const database = new Databases(client);

const fetchVoteAverageByMovieId = async (movieId: number): Promise<number | undefined> => {
    if (!TMDB_API_KEY) return undefined;

    try {
        const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?language=en-US`, {
            method: "GET",
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${TMDB_API_KEY}`,
            },
        });

        if (!response.ok) return undefined;

        const data = await response.json();
        const voteAverage = Number(data?.vote_average);

        return Number.isFinite(voteAverage) ? voteAverage : undefined;
    } catch {
        return undefined;
    }
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
                // Backward compatibility: collection may not have vote_average yet.
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
                // Backward compatibility: collection may not have vote_average yet.
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
 * Lấy 5 phim trending từ Appwrite.
 * Sắp xếp theo:
 *   1. Thời gian cập nhật mới nhất ($updatedAt giảm dần)
 *   2. Số lượt search (count giảm dần)
 */
export const getTrendingMovies = async (): Promise<TrendingMovie[] | undefined> => {
    try {
        // --- Fetch with sorting: newest first, then highest count ---
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.orderDesc('$updatedAt'),
            Query.orderDesc('count'),
            Query.limit(5),
        ])

        const hydratedMovies = await Promise.all(
            result.documents.map(async (doc) => {
                const currentVoteAverage = Number((doc as { vote_average?: unknown }).vote_average);

                if (Number.isFinite(currentVoteAverage)) {
                    return doc;
                }

                const movieId = Number((doc as Record<string, unknown>).movie_id);
                const fallbackVoteAverage = await fetchVoteAverageByMovieId(movieId);

                if (!Number.isFinite(fallbackVoteAverage)) {
                    return {
                        ...doc,
                        vote_average: 0,
                    };
                }

                // Best-effort sync so old records stop returning empty vote_average.
                try {
                    await database.updateDocument(
                        DATABASE_ID,
                        COLLECTION_ID,
                        doc.$id,
                        { vote_average: fallbackVoteAverage }
                    );
                } catch {
                    // Ignore sync failure and still return hydrated value for UI.
                }

                return {
                    ...doc,
                    vote_average: fallbackVoteAverage,
                };
            })
        );

        return hydratedMovies as unknown as TrendingMovie[];
    } catch (error) {
        console.log(error);
        return undefined;
    }
}