import { icons } from '@/constants/icons';
import React from 'react';
import { Image, Pressable, Text, TextInput, View } from 'react-native';

interface Props {
    placeholder: string;
    onPress?: () => void;
    isHomeTrigger?: boolean; // true khi dùng ở Home để chỉ điều hướng, không focus input
}

const SearchBar = ({ placeholder, onPress, isHomeTrigger = false }: Props) => {
    if (isHomeTrigger) {
        return (
            <Pressable onPress={onPress}>
                <View className='flex-row items-center bg-dark-200 rounded-full px-5 py-4'>
                    <Image source={icons.search} className="size-5" resizeMode='contain' tintColor="#E50914" />
                    <Text className='flex-1 ml-2 text-white'>{placeholder}</Text>
                </View>
            </Pressable>
        );
    }

    return (
        <View className='flex-row items-center bg-dark-200 rounded-full px-5 py-4'>
            <Image source={icons.search} className="size-5" resizeMode='contain' tintColor="#E50914" />
            <TextInput
                placeholder={placeholder}
                placeholderTextColor="#ffffff"
                className='flex-1 ml-2 text-white'
            />
        </View>
    );
};

export default SearchBar;