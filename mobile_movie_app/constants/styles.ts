import { StyleSheet } from 'react-native';

// Màu chính của app
export const Colors = {
    primary: '#030014',
    secondary: '#151312',
    light: {
        100: '#D6C6FF',
        200: '#A8B5DB',
        300: '#9CA4AB',
    },
    dark: {
        100: '#221F3D',
        200: '#0F0D23',
    },
    accent: '#AB8BFF',
    white: '#FFFFFF',
    lightGray: '#A8B5DB',
    darkGray: '#221F3D',
};

// Style dùng chung xuyên suốt app
export const GlobalStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    text: {
        color: Colors.white,
        fontFamily: 'System',
    },
    accentText: {
        color: Colors.accent,
    },
});