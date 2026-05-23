import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { fetchStreamUrl } from "@/services/api";
import { router, useLocalSearchParams } from "expo-router";
import * as ScreenOrientation from 'expo-screen-orientation';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';

export default function PlayerScreen() {
    const { title } = useLocalSearchParams();
    const [streamUrl, setStreamUrl] = useState<string | null>(null);
    const [error, setError] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        ScreenOrientation.unlockAsync(); // cho xoay màn tự do
        return () => {
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP); // ra khỏi player → lock dọc lại
        };
    }, []);

    useEffect(() => {
        fetchStreamUrl(title as string)
            .then(url => url ? setStreamUrl(url) : setError(true))
            .catch(() => setError(true));
    }, []);

    const player = useVideoPlayer(streamUrl ?? '', p => {
        p.play();
    });

    if (error) return (
        <View className="flex-1 bg-black items-center justify-center">
            <Text className="text-white text-base">Không tìm thấy phim 😢</Text>
            <Text className="text-zinc-400 text-xs mt-2">{title}</Text>
        </View>
    );

    if (!streamUrl) return (
        <View className="flex-1 bg-black items-center justify-center gap-y-3">
            <ActivityIndicator color="#fff" size="large" />
            <Text className="text-zinc-400 text-sm">Đang tìm phim...</Text>
        </View>
    );

    return (
        <View className="flex-1 bg-primary items-center justify-center">
            <Image source={images.bg} className="absolute inset-0 w-full  z-0" resizeMode="cover" tintColor="#E50914" />

            <View className="absolute top-16 items-center z-10">
                <Image source={icons.logo} className="w-14 h-12" resizeMode="contain" />
            </View>

            <View className="w-[92%] max-w-[420px] items-center z-10">
                {/* Title */}
                <Text className="text-white font-bold text-base px-5 mb-4 text-center" numberOfLines={1}>
                    {title}
                </Text>

                {/* Video - cỡ vừa 16:9, bấm fullscreen để xem to */}
                <VideoView
                    ref={ref}
                    player={player}
                    style={{ width: '100%', aspectRatio: 16 / 9 }}
                    allowsFullscreen
                    allowsPictureInPicture
                    nativeControls
                />

                <Text className="text-zinc-500 text-xs mt-4 px-5 text-center">
                    App đang trong giai đoạn phát triển.Sẽ cật nhật tính năng sau!
                </Text>
            </View>

            {/* ===== Back Button (fixed bottom) ===== */}
            <TouchableOpacity
                className='absolute bottom-5 w-[92%] max-w-[420px] bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50'
                onPress={router.back}
            >
                <Image source={icons.arrow} className='size-5 mr-1 mt-0.5 rotate-180' tintColor="#fff" />
                <Text className='text-white font-semibold text-base'>Quay lại</Text>
            </TouchableOpacity>
        </View>
    );
}