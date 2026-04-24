// Luu va cap nhat thong ke tim kiem len Appwrite.
import { Client, Databases, ID, Query } from "react-native-appwrite";
import "react-native-url-polyfill/auto";
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;
const APPWRITE_ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT ?? "https://nyc.cloud.appwrite.io/v1";

// Khởi tạo Appwrite client và kết nối project
const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)

const database = new Databases(client);

/**
 * Cập nhật thống kê lượt tìm kiếm của một từ khóa lên Appwrite.
 * - Nếu từ khóa đã tồn tại → tăng count lên 1.
 * - Nếu chưa tồn tại → tạo document mới với count = 1.
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

            await database.updateDocument(
                DATABASE_ID,
                COLLECTION_ID,
                existingMovie.$id,
                {
                    count: existingMovie.count + 1
                }

            )
        } else {
            // Từ khóa chưa tồn tại → tạo document mới
            await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                searchTerm: normalizedQuery,
                movie_id: movie.id,
                title: movie.title,
                count: 1,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            })
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
}