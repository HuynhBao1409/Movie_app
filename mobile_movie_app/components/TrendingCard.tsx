import { icons } from '@/constants/icons'
import { images } from '@/constants/images'
import MaskedView from '@react-native-masked-view/masked-view'
import { Link } from "expo-router"
import React from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'

// === Trending Movie Card ===
const TrendingCard = ({ movie: { movie_id, title, poster_url, vote_average }, index }: TrendingCardProps) => {
    return (
        <Link href={`/movies/${movie_id}`} asChild>
            <TouchableOpacity className='w-32 relative pl-5'>
                {/* Movie Poster */}
                <View className='relative'>
                    <Image
                        source={{ uri: poster_url }}
                        className="w-32 h-48 rounded-lg"
                        resizeMode="cover"
                    />

                    {/* Star Rating - Top Right Corner */}
                    <View className='absolute -top-1 -right-5 flex-row items-center gap-1 bg-black/60 px-2 py-1 rounded-l'>
                        <Image source={icons.star} className='size-3' />
                        <Text className='text-xs text-yellow-400 font-bold'>{Number.isFinite(Number(vote_average)) ? (Number(vote_average) / 2).toFixed(1) : '0.0'}</Text>
                    </View>
                </View>

                {/* Ranking Badge with Gradient */}
                <View className='absolute bottom-9 -left-3.5 px-2 py-1 rounded-full'>
                    <MaskedView maskElement={
                        <Text className='font-bold text-white text-6xl'>{index + 1}</Text>
                    }>
                        <Image
                            source={images.rankingGradient}
                            className='size-14'
                            resizeMode='cover'
                        />
                    </MaskedView>
                </View>

                {/* Movie Title */}
                <Text className='text-sm font-bold mt-2 text-light-200' numberOfLines={2}>
                    {title}
                </Text>
            </TouchableOpacity>
        </Link>
    )
}

export default TrendingCard