import { icons } from '@/constants/icons';
import React from 'react';
import { Image, Pressable, Text, TextInput, View } from 'react-native';

interface Props {
    // Text hiển thị gợi ý 
    placeholder: string;
    onPress?: () => void;
    // Giá trị hiện tại của ô search
    value?: string;
    // Callback cập nhật giá trị khi user nhập
    onChangeText?: (text: string) => void;
}

const SearchBar = ({ placeholder, value, onPress, onChangeText }: Props) => {
    // true khi có text và có thể clear bằng callback
    const canClear = Boolean(onChangeText && value?.length);
    const isEditable = Boolean(onChangeText);

    // Layout chính của search bar: icon, input và nút clear
    const content = (
        <View className='flex-row items-center bg-dark-200 rounded-full px-5 py-4'>
            <Image source={icons.search} className="size-5" resizeMode='contain' tintColor="#E50914" />
            <TextInput
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                editable={isEditable}
                placeholderTextColor="#a8b8db"
                className='flex-1 ml-2 text-white'
            />

            {canClear && (
                <Pressable
                    onPress={() => onChangeText?.('')}
                    hitSlop={8}
                    className='ml-2 w-6 h-6 rounded-full bg-dark-100 items-center justify-center'
                >
                    <Text className='text-white text-sm'>x</Text>
                </Pressable>
            )}
        </View>
    );

    // Nếu chỉ truyền onPress (không truyền onChangeText) 
    if (onPress && !onChangeText) {
        return <Pressable onPress={onPress}>{content}</Pressable>;
    }

    return content;


};

export default SearchBar;