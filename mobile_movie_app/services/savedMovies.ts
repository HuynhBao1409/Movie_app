import { fetchMovieDetails } from '@/services/api';
import { Client, Databases, ID, Query } from 'react-native-appwrite';

const client = new Client()
    .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT ?? 'https://nyc.cloud.appwrite.io/v1')
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client);

const DB_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const SAVED_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_SAVED_COLLECTION_ID!;

export type WatchStatus = 'wishlist' | 'watching' | 'watched';

export interface SavedMovie {
    id: number;
    title: string;
    original_title?: string;
    localized_title?: string;
    poster_path: string;
    vote_average: number;
    release_date: string;
    status: WatchStatus;
    savedAt: string;
}

// Lấy toàn bộ phim đã lưu theo user
export const getSavedMovies = async (userId: string): Promise<SavedMovie[]> => {
    try {
        const res = await database.listDocuments(DB_ID, SAVED_COLLECTION_ID, [
            Query.equal('user_id', userId),
            Query.orderDesc('saved_at'),
        ]);

        return await Promise.all(res.documents.map(async (doc) => {
            try {
                const [englishMovie, vietnameseMovie] = await Promise.all([
                    fetchMovieDetails(String(doc.movie_id), 'en-US'),
                    fetchMovieDetails(String(doc.movie_id), 'vi-VN'),
                ]);

                return {
                    id: doc.movie_id,
                    title: englishMovie?.title ?? doc.title,
                    original_title: englishMovie?.original_title ?? doc.original_title,
                    localized_title: vietnameseMovie?.title ?? doc.localized_title,
                    poster_path: doc.poster_path,
                    vote_average: doc.vote_average,
                    release_date: doc.release_date,
                    status: doc.status as WatchStatus,
                    savedAt: doc.saved_at,
                };
            } catch {
                return {
                    id: doc.movie_id,
                    title: doc.title,
                    original_title: doc.original_title,
                    localized_title: doc.localized_title,
                    poster_path: doc.poster_path,
                    vote_average: doc.vote_average,
                    release_date: doc.release_date,
                    status: doc.status as WatchStatus,
                    savedAt: doc.saved_at,
                };
            }
        }));
    } catch {
        return [];
    }
};

// Lưu hoặc cập nhật phim
export const saveMovie = async (userId: string, movie: SavedMovie): Promise<void> => {
    // Check xem đã lưu chưa
    const existing = await database.listDocuments(DB_ID, SAVED_COLLECTION_ID, [
        Query.equal('user_id', userId),
        Query.equal('movie_id', movie.id),
    ]);

    const payload = {
        user_id: userId,
        movie_id: movie.id,
        title: movie.title,
        original_title: movie.original_title ?? '',
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date,
        status: movie.status,
        saved_at: movie.savedAt,
    };

    if (existing.documents.length > 0) {
        // Update status nếu đã có
        await database.updateDocument(DB_ID, SAVED_COLLECTION_ID, existing.documents[0].$id, payload);
    } else {
        await database.createDocument(DB_ID, SAVED_COLLECTION_ID, ID.unique(), payload);
    }
};

// Xoá phim theo movieId
export const removeMovie = async (userId: string, movieId: number): Promise<void> => {
    const existing = await database.listDocuments(DB_ID, SAVED_COLLECTION_ID, [
        Query.equal('user_id', userId),
        Query.equal('movie_id', movieId),
    ]);
    if (existing.documents.length > 0) {
        await database.deleteDocument(DB_ID, SAVED_COLLECTION_ID, existing.documents[0].$id);
    }
};

// Lấy status của phim
export const getMovieStatus = async (userId: string, movieId: number): Promise<WatchStatus | null> => {
    const existing = await database.listDocuments(DB_ID, SAVED_COLLECTION_ID, [
        Query.equal('user_id', userId),
        Query.equal('movie_id', movieId),
    ]);
    if (existing.documents.length > 0) {
        return existing.documents[0].status as WatchStatus;
    }
    return null;
};