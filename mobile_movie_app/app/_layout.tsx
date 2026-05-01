import { AuthProvider } from '@/context/AuthContext';
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Image, StatusBar, Text, View } from "react-native";
import "../global.css";


SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Giả lập quá trình load ban đầu để người dùng thấy thanh tiến trình trước khi vào app.
    const interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 4, 100));
    }, 80);

    const timer = setTimeout(async () => {
      setProgress(100);
      setReady(true);
      await SplashScreen.hideAsync();
    }, 2200);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  if (!ready) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-10">
        {/* Logo và tên app trong màn loading lúc khởi động. */}
        <Image
          source={require("@/assets/images/logo.png")}
          className="w-28 h-28"
          resizeMode="contain"
        />
        <Text className="text-white text-xl font-bold mt-5">MotChill</Text>

        {/* Thanh load ngang tăng dần theo progress state. */}
        <View className="w-full h-1 bg-zinc-800 rounded-full mt-8 overflow-hidden">
          <View
            className="h-full bg-red-600 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </View>
        {/* ống hiện phần trăm load */}
        {/* <Text className="text-zinc-300 text-sm mt-3">Loading {progress}%</Text> */}
      </View>
    );
  }

  return (
    <AuthProvider>
      <StatusBar hidden={true} />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="admin" options={{ headerShown: false }} />
        <Stack.Screen name="movies/[id]" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
