import { icons } from "@/constants/icons";
import { Tabs } from "expo-router";
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Text, View } from "react-native";

const TabIcon = ({ focused, icon, title }: any) => {
    if (focused) {
        return (
            <View style={{ backgroundColor: '#E50914', borderRadius: 999, paddingHorizontal: 16, paddingVertical: 6 }}
                className="flex flex-row min-w-[112px] min-h-16 mt-4 justify-center items-center">
                <Image source={icon} tintColor="#FFFFFF" className="size-5" />
                <Text className="text-white text-base font-semibold ml-3">{title}</Text>
            </View>
        )
    }
    return (
        <View className="size-full justify-center items-center mt-4 rounded-full">
            <Image source={icon} tintColor="#E50914" className="size-5" />
        </View>
    )
}

const _layout = () => {
    const { t } = useTranslation();

    return (
        <Tabs screenOptions={{
            tabBarShowLabel: false,
            tabBarItemStyle: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
            tabBarStyle: {
                backgroundColor: '#141414', borderRadius: 50, marginHorizontal: 15,
                marginBottom: 36, height: 55, position: 'absolute', overflow: 'hidden',
                borderWidth: 1, borderColor: '#2a2a2a',
            },
        }}>
            <Tabs.Screen name="index" options={{
                title: t('tabs.home'), headerShown: false,
                tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={icons.home} title={t('tabs.home')} />
            }} />
            <Tabs.Screen name="search" options={{
                title: t('tabs.search'), headerShown: false,
                tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={icons.search} title={t('tabs.search')} />
            }} />
            <Tabs.Screen name="saved" options={{
                title: t('tabs.saved'), headerShown: false,
                tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={icons.save} title={t('tabs.saved')} />
            }} />
            <Tabs.Screen name="profile" options={{
                title: t('tabs.profile'), headerShown: false,
                tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={icons.person} title={t('tabs.profile')} />
            }} />
            <Tabs.Screen name="notifications" options={{ title: t('tabs.notifications'), headerShown: false, href: null }} />
            <Tabs.Screen name="edit-profile" options={{ headerShown: false, href: null }} />
        </Tabs>
    )
}

export default _layout