import React from 'react';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';
import { PlaceCard, PlaceData } from './PlaceCard';

export interface PlaceCarouselProps {
    data: PlaceData[];
    onPlacePress?: (place: PlaceData) => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;
const SNAP_INTERVAL = CARD_WIDTH + 16; // Card width + margin

export const PlaceCarousel: React.FC<PlaceCarouselProps> = ({ data, onPlacePress }) => {
    return (
        <View style={styles.container}>
            <FlatList
                data={data}
                renderItem={({ item }) => <PlaceCard data={item} onPress={() => onPlacePress?.(item)} />}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}
                snapToInterval={SNAP_INTERVAL}
                decelerationRate="fast"
                snapToAlignment="start" // Changed from center for better initial alignment
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 12,
        marginBottom: 12,
        height: (width * 0.75 * 1.4) + 20, // Card height + generic padding
    },
    contentContainer: {
        paddingHorizontal: 16, // Standard side padding so first card aligns with UI
        paddingRight: 32, // Extra padding at end
    },
});
