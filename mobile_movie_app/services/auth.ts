import { Account, Client, Databases, ID, Query } from "react-native-appwrite";

const client = new Client()
    .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT ?? "https://nyc.cloud.appwrite.io/v1")
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

export const account = new Account(client);
const databases = new Databases(client);

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const PROFILES_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID!;

// ===== REGISTER =====
export const register = async (email: string, password: string, username: string, phone: string) => {
    const user = await account.create(ID.unique(), email, password, username);
    await account.createEmailPasswordSession(email, password);
    // Tạo profile với role mặc định là 'user'
    await databases.createDocument(DATABASE_ID, PROFILES_COLLECTION_ID, ID.unique(), {
        userId: user.$id,
        username,
        phone,
        email,
        role: 'user',
    });
    return user;
};
// ===== GET EMAIL BY USERNAME =====
const getEmailByUsername = async (username: string): Promise<string | null> => {
    try {
        // Query database để tìm document có field "username" trùng với username truyền vào
        const result = await databases.listDocuments(DATABASE_ID, PROFILES_COLLECTION_ID, [
            Query.equal('username', username),
        ]);
        console.log('FOUND DOCS:', result.documents);
        if (result.documents.length === 0) return null;
        return (result.documents[0] as any).email ?? null;
    } catch {
        return null;
    }
};
// ===== LOGIN (email hoặc username) =====
export const login = async (emailOrUsername: string, password: string) => {
    // Mặc định coi input là email
    let email = emailOrUsername;

    // Nếu input KHÔNG chứa '@' → coi như username
    if (!emailOrUsername.includes('@')) {
        // Gọi hàm để tìm email tương ứng với username
        const found = await getEmailByUsername(emailOrUsername);
        if (!found) throw new Error('Username not found');
        email = found;
    }

    await account.createEmailPasswordSession(email, password);
    const user = await account.get();
    const profile = await getProfile(user.$id);
    return { user, role: profile?.role ?? 'user' };
};

// ===== LOGOUT =====
export const logout = async () => {
    await account.deleteSession('current');
};

// ===== GET CURRENT USER =====
export const getCurrentUser = async () => {
    try {
        return await account.get();
    } catch {
        return null;
    }
};

// ===== GET PROFILE =====
export const getProfile = async (userId: string) => {
    try {
        const result = await databases.listDocuments(DATABASE_ID, PROFILES_COLLECTION_ID, [
            Query.equal('userId', userId),
        ]);
        return result.documents[0] ?? null;
    } catch {
        return null;
    }
};

// ===== UPDATE PROFILE =====
export const updateProfile = async (documentId: string, data: {
    username?: string;
    avatar_url?: string;
    bio?: string;
    phone?: string;
}) => {
    return await databases.updateDocument(DATABASE_ID, PROFILES_COLLECTION_ID, documentId, data);
};

// ===== SET ROLE (admin only) =====
export const setUserRole = async (documentId: string, role: 'user' | 'admin') => {
    return await databases.updateDocument(DATABASE_ID, PROFILES_COLLECTION_ID, documentId, { role });
};

// ===== GET ALL USERS (admin only) =====
export const getAllUsers = async () => {
    const result = await databases.listDocuments(DATABASE_ID, PROFILES_COLLECTION_ID);
    return result.documents;
};