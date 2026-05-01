import { icons } from "@/constants/icons";
import { Tabs } from "expo-router";
import React from 'react';
import { Image, Text, View } from "react-native";

// Reusable icon renderer for each tab item.
const TabIcon = ({ focused, icon, title }: any) => {
    if (focused) {
        return (
            // <ImageBackground source={images.highlight} className="flex flex-row w-full flex-1 min-w-[112px] min-h-16 mt-4 justify-center items-center rounded-full overflow-hidden">
            <View style={{ backgroundColor: '#E50914', borderRadius: 999, paddingHorizontal: 16, paddingVertical: 6 }}
                className="flex flex-row min-w-[112px] min-h-16 mt-4 justify-center items-center">
                <Image
                    source={icon}
                    tintColor="#FFFFFF" // [OLD] tintColor="#151312"
                    className="size-5"
                />
                {/* [OLD] className="text-secondary ..." */}
                <Text className="text-white text-base font-semibold ml-2">{title}</Text>
                {/* </ImageBackground> */}
            </View>
        )
    }
    return (
        <View className="size-full justify-center items-center mt-4 rounded-full">
            {/* [OLD] #A8B5DB */}
            <Image source={icon} tintColor="#E50914" className="size-5" />
        </View>
    )

}

// Main tabs layout: global tab bar style + tab screens.
const _layout = () => {
    return (
        <Tabs
            // Shared options for all tabs.
            screenOptions={{
                tabBarShowLabel: false,
                tabBarItemStyle: {
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                },
                tabBarStyle: {
                    backgroundColor: '#141414', // [OLD] '#0f0D23'
                    borderRadius: 50,
                    marginHorizontal: 20,
                    marginBottom: 36,
                    height: 52,
                    position: 'absolute',
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: '#2a2a2a', // [OLD] '#0f0d23'
                },
            }}
        >
            {/* Primary tab */}
            <Tabs.Screen name="index"
                options={{
                    title: "Home",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.home} title="Home" />)
                }}
            />

            {/* Discovery tab */}
            <Tabs.Screen name="search"
                options={{
                    title: "Search",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.search} title="Search" />)
                }}
            />

            {/* User library tab */}
            <Tabs.Screen name="saved"
                options={{
                    title: "Saved",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.save} title="Saved" />)
                }}
            />

            {/* Account tab */}
            <Tabs.Screen name="profile"
                options={{
                    title: "Profile",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.person} title="Profile" />)
                }}
            />
            <Tabs.Screen
                name="notifications"
                options={{
                    title: 'Notifications',
                    headerShown: false,
                    href: null, // ẩn khỏi tab bar, chỉ navigate bằng router.push
                }}
            />
        </Tabs>
    )
}

export default _layout