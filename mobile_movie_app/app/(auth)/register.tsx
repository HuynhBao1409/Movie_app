import { icons } from '@/constants/icons';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator, Image, Text,
    TextInput, TouchableOpacity, View
} from 'react-native';

export default function Register() {
    const { signUp } = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async () => {
        if (!username || !email || !phone || !password) {
            setError('Please fill in all fields');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }
        try {
            setLoading(true);
            setError('');
            await signUp(email.trim(), password, username.trim(), phone.trim());
        } catch (e: any) {
            setError(e?.message ?? 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className='flex-1 bg-primary px-6 justify-center'>
            {/* Logo */}
            <Image source={icons.logo} className='w-16 h-14 mx-auto mb-8' />

            <Text className='text-white text-2xl font-bold text-center mb-1'>Create account</Text>
            <Text className='text-light-300 text-sm text-center mb-8'>Join us today</Text>

            {/* Error */}
            {error ? (
                <Text className='text-accent text-sm text-center mb-4'>{error}</Text>
            ) : null}

            {/* Username */}
            <TextInput
                className='bg-secondary text-white rounded-xl px-4 py-3.5 mb-3'
                placeholder='Username'
                placeholderTextColor='#9CA4AB'
                autoCapitalize='none'
                value={username}
                onChangeText={setUsername}
            />

            {/* Email */}
            <TextInput
                className='bg-secondary text-white rounded-xl px-4 py-3.5 mb-3'
                placeholder='Email'
                placeholderTextColor='#9CA4AB'
                keyboardType='email-address'
                autoCapitalize='none'
                value={email}
                onChangeText={setEmail}
            />

            {/* Phone */}
            <TextInput
                className='bg-secondary text-white rounded-xl px-4 py-3.5 mb-3'
                placeholder='Phone number'
                placeholderTextColor='#9CA4AB'
                keyboardType='phone-pad'
                value={phone}
                onChangeText={setPhone}
            />

            {/* Password */}
            <TextInput
                className='bg-secondary text-white rounded-xl px-4 py-3.5 mb-6'
                placeholder='Password (min. 8 characters)'
                placeholderTextColor='#9CA4AB'
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            {/* Register Button */}
            <TouchableOpacity
                className='bg-accent rounded-xl py-4 items-center mb-4'
                onPress={handleRegister}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color='#fff' />
                ) : (
                    <Text className='text-white font-bold text-base'>Sign Up</Text>
                )}
            </TouchableOpacity>

            {/* Login link */}
            <TouchableOpacity onPress={() => router.back()}>
                <Text className='text-light-300 text-sm text-center'>
                    Already have an account?{' '}
                    <Text className='text-accent font-semibold'>Sign In</Text>
                </Text>
            </TouchableOpacity>
        </View>
    );
}