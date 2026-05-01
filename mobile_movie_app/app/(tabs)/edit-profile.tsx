import { icons } from '@/constants/icons';
import { useAuth } from '@/context/AuthContext';
import { updateProfile } from '@/services/auth';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator, Alert, Image,
    ScrollView,
    Text,
    TextInput, TouchableOpacity, View
} from 'react-native';

export default function EditProfile() {
    const { profile, user, setProfile } = useAuth();

    const [username, setUsername] = useState(profile?.username ?? '');
    const [bio, setBio] = useState(profile?.bio ?? '');
    const [avatarUri, setAvatarUri] = useState<string | null>(profile?.avatar_url ?? null);
    const [loading, setLoading] = useState(false);

    // ===== Chọn ảnh từ thư viện =====
    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permission required', 'Please allow access to your photo library');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],  // crop vuông
            quality: 0.7,
        });
        if (!result.canceled) {
            setAvatarUri(result.assets[0].uri);
        }
    };

    // ===== Lưu profile =====
    const handleSave = async () => {
        if (!profile?.$id) return;
        if (!username.trim()) {
            Alert.alert('Error', 'Username cannot be empty');
            return;
        }
        try {
            setLoading(true);
            const updated = await updateProfile(profile.$id, {
                username: username.trim(),
                bio: bio.trim(),
                avatar_url: avatarUri ?? undefined,
            });
            // Update AuthContext
            setProfile({
                ...profile,
                username: username.trim(),
                bio: bio.trim(),
                avatar_url: avatarUri ?? profile.avatar_url,
            });
            Alert.alert('Success', 'Profile updated!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (e: any) {
            Alert.alert('Error', e?.message ?? 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className='flex-1 bg-primary'>
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {/* ===== Header ===== */}
                <View className='flex-row items-center px-5 pt-16 pb-4 border-b border-dark-100'>
                    <TouchableOpacity onPress={router.back} className='mr-4'>
                        <Image source={icons.arrow} className='size-5 rotate-180' tintColor='#fff' />
                    </TouchableOpacity>
                    <Text className='text-white text-lg font-bold flex-1'>Edit Profile</Text>
                    {/* Nút Save góc phải */}
                    <TouchableOpacity onPress={handleSave} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color='#E50914' />
                        ) : (
                            <Text className='text-accent font-semibold text-base'>Save</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* ===== Avatar ===== */}
                <View className='items-center mt-8 mb-6'>
                    <TouchableOpacity
                        onPress={pickImage}
                        className='w-28 h-28 rounded-full bg-dark-100 items-center justify-center'
                    >
                        {avatarUri ? (
                            <Image
                                source={{ uri: avatarUri }}
                                className='w-28 h-28 rounded-full'
                                resizeMode='cover'
                            />
                        ) : (
                            <Text className='text-white text-4xl font-bold'>
                                {username?.charAt(0).toUpperCase() ?? '?'}
                            </Text>
                        )}
                        {/* Overlay camera icon */}
                        <View className='absolute inset-0 rounded-full bg-black/40 items-center justify-center'>
                            <Text className='text-white text-2xl'>📷</Text>
                        </View>
                    </TouchableOpacity>
                    <Text className='text-light-300 text-xs mt-2'>Tap to change photo</Text>
                    <Text className='text-light-300 text-xs mt-1'>
                        (Avatar upload coming soon)
                    </Text>
                </View>

                {/* ===== Form ===== */}
                <View className='px-5'>
                    {/* Email — readonly */}
                    <Text className='text-light-300 text-xs uppercase tracking-widest mb-2'>Email</Text>
                    <View className='bg-dark-100 rounded-xl px-4 py-3.5 mb-5'>
                        <Text className='text-light-300'>{user?.email}</Text>
                    </View>

                    {/* Username */}
                    <Text className='text-light-300 text-xs uppercase tracking-widest mb-2'>Username</Text>
                    <TextInput
                        className='bg-secondary text-white rounded-xl px-4 py-3.5 mb-5'
                        placeholder='Enter username'
                        placeholderTextColor='#9CA4AB'
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize='none'
                    />

                    {/* Bio */}
                    <Text className='text-light-300 text-xs uppercase tracking-widest mb-2'>Bio</Text>
                    <TextInput
                        className='bg-secondary text-white rounded-xl px-4 py-3.5 mb-5'
                        placeholder='Tell us about yourself...'
                        placeholderTextColor='#9CA4AB'
                        value={bio}
                        onChangeText={setBio}
                        multiline
                        numberOfLines={4}
                        style={{ height: 100, textAlignVertical: 'top' }}
                    />
                </View>
            </ScrollView>
        </View>
    );
}