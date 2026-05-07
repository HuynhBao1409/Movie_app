import { icons } from '@/constants/icons';
import { useAuth } from '@/context/AuthContext';
import { updateProfile } from '@/services/auth';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator, Alert, Image,
    ScrollView,
    Text,
    TextInput, TouchableOpacity, View
} from 'react-native';

export default function EditProfile() {
    const { profile, user, setProfile } = useAuth();
    // === Translation ===
    const { t } = useTranslation();

    const [username, setUsername] = useState(profile?.username ?? '');
    const [bio, setBio] = useState(profile?.bio ?? '');
    const [phone, setPhone] = useState(profile?.phone ?? '');
    const [hidePhoneTail, setHidePhoneTail] = useState(true);
    const [avatarUri, setAvatarUri] = useState<string | null>(profile?.avatar_url ?? null);
    const [loading, setLoading] = useState(false);

    const maskPhoneTail = (value: string) => {
        if (!value) return '';
        if (value.length <= 3) return '*'.repeat(value.length);
        return `${value.slice(0, -3)}***`;
    };

    const displayedPhone = hidePhoneTail ? maskPhoneTail(phone) : phone;

    // ===== Chọn ảnh từ thư viện =====
    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert(t('editProfile.permissionRequired'), t('editProfile.photoLibraryAccess'));
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
            Alert.alert(t('common.error'), t('editProfile.usernameRequired'));
            return;
        }
        try {
            setLoading(true);
            const updated = await updateProfile(profile.$id, {
                username: username.trim(),
                bio: bio.trim(),
                phone: phone.trim(),
                avatar_url: avatarUri ?? undefined,
            });
            // Update AuthContext
            setProfile({
                ...profile,
                username: username.trim(),
                bio: bio.trim(),
                phone: phone.trim(),
                avatar_url: avatarUri ?? profile.avatar_url,
            });
            Alert.alert('Success', t('editProfile.updateSuccess'), [
                { text: t('common.ok'), onPress: () => router.replace('/(tabs)/profile') }
            ]);
        } catch (e: any) {
            Alert.alert(t('common.error'), e?.message ?? t('editProfile.updateFailed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className='flex-1 bg-primary'>
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {/* ===== Header ===== */}
                <View className='flex-row items-center px-5 pt-16 pb-4 border-b border-dark-100'>
                    <TouchableOpacity onPress={() => router.replace('/(tabs)/profile')} className='mr-4'>
                        <Image source={icons.arrow} className='size-5 rotate-180' tintColor='#fff' />
                    </TouchableOpacity>
                    <Text className='text-white text-lg font-bold flex-1'>{t('editProfile.title')}</Text>
                    {/* Nút Save  */}
                    <TouchableOpacity onPress={handleSave} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color='#E50914' />
                        ) : (
                            <Text className='text-accent font-semibold text-base'>{t('common.save')}</Text>
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
                    <Text className='text-light-300 text-xs mt-2'>{t('editProfile.tapToChange')}</Text>
                    <Text className='text-light-300 text-xs mt-1'>
                        {t('editProfile.avatarSoon')}
                    </Text>
                </View>

                {/* ===== Form ===== */}
                <View className='px-5'>
                    {/* Email — readonly */}
                    <Text className='text-light-300 text-xs uppercase tracking-widest mb-2'>{t('editProfile.email')}</Text>
                    <View className='bg-dark-100 rounded-xl px-4 py-3.5 mb-5'>
                        <Text className='text-light-300'>{user?.email}</Text>
                    </View>

                    {/* Username */}
                    <Text className='text-light-300 text-xs uppercase tracking-widest mb-2'>{t('editProfile.username')}</Text>
                    <TextInput
                        className='bg-secondary text-white rounded-xl px-4 py-3.5 mb-5'
                        placeholder={t('editProfile.usernamePlaceholder')}
                        placeholderTextColor='#9CA4AB'
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize='none'
                    />

                    {/* Bio */}
                    <Text className='text-light-300 text-xs uppercase tracking-widest mb-2'>{t('editProfile.bio')}</Text>
                    <TextInput
                        className='bg-secondary text-white rounded-xl px-4 py-3.5 mb-5'
                        placeholder={t('editProfile.bioPlaceholder')}
                        placeholderTextColor='#9CA4AB'
                        value={bio}
                        onChangeText={setBio}
                        multiline
                        numberOfLines={4}
                        style={{ height: 100, textAlignVertical: 'top' }}
                    />

                    {/* Phone */}
                    <View className='flex-row items-center justify-between mb-2'>
                        <Text className='text-light-300 text-xs uppercase tracking-widest'>{t('editProfile.phone')}</Text>
                        <TouchableOpacity onPress={() => setHidePhoneTail((prev) => !prev)}>
                            <Text className='text-accent text-xs font-semibold'>
                                {hidePhoneTail ? t('editProfile.showFull') : t('editProfile.hideTail')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        className='bg-secondary text-white rounded-xl px-4 py-3.5'
                        placeholder={t('editProfile.phonePlaceholder')}
                        placeholderTextColor='#9CA4AB'
                        value={displayedPhone}
                        onChangeText={setPhone}
                        keyboardType='phone-pad'
                        editable={!hidePhoneTail}
                    />
                </View>
            </ScrollView>
        </View>
    );
}