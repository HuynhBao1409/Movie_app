import { icons } from '@/constants/icons';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';

interface Props {
    placeholder: string;
    onPress?: () => void;

}

const SearchBar = ({ placeholder, onPress }: Props) => {

    return (
        <Pressable onPress={onPress}>
            <View className='flex-row items-center bg-dark-200 rounded-full px-5 py-4'>
                <Image source={icons.search} className="size-5" resizeMode='contain' tintColor="#E50914" />
                <Text className='flex-1 ml-2 text-white'>{placeholder}</Text>
            </View>
        </Pressable>
    );


};

export default SearchBar;