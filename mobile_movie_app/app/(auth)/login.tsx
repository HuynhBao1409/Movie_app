import { icons } from '@/constants/icons';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator, Image, Text,
    TextInput, TouchableOpacity, View
} from 'react-native';

export default function Login() {
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }
        try {
            setLoading(true);
            setError('');
            await signIn(email.trim(), password);
        } catch (e: any) {
            setError(e?.message ?? 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className='flex-1 bg-primary px-6 justify-center'>
            {/* Logo */}
            <Image source={icons.logo} className='w-16 h-14 mx-auto mb-8' />

            <Text className='text-white text-2xl font-bold text-center mb-1'>Welcome back to MotChill</Text>
            <Text className='text-light-300 text-sm text-center mb-8'>Sign in to your account</Text>

            {/* Error */}
            {error ? (
                <Text className='text-accent text-sm text-center mb-4'>{error}</Text>
            ) : null}

            {/* Email */}
            <TextInput
                className='bg-secondary text-white rounded-xl px-4 py-3.5 mb-3'
                placeholder='Email or Username'
                placeholderTextColor='#9CA4AB'
                // keyboardType='email-address'
                keyboardType='default'
                autoCapitalize='none'
                value={email}
                onChangeText={setEmail}
            />

            {/* Password */}
            <TextInput
                className='bg-secondary text-white rounded-xl px-4 py-3.5 mb-6'
                placeholder='Password'
                placeholderTextColor='#9CA4AB'
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            {/* Login Button */}
            <TouchableOpacity
                className='bg-accent rounded-xl py-4 items-center mb-4'
                onPress={handleLogin}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color='#fff' />
                ) : (
                    <Text className='text-white font-bold text-base'>Sign In</Text>
                )}
            </TouchableOpacity>

            {/* Register link */}
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text className='text-light-300 text-sm text-center'>
                    Don't have an account?{' '}
                    <Text className='text-accent font-semibold'>Sign Up</Text>
                </Text>
            </TouchableOpacity>
        </View>
    );
}