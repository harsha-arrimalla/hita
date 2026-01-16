import React from 'react';
import { Dimensions, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// Assuming lucide-react-native is available as it's used elsewhere, otherwise we'd use expo-vector-icons
// Using standard View for overlay since expo-blur might not be installed.

import { getPlaceImage } from '../../../utils/imageUtils';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

export interface PlaceData {
    id: string;
    title: string;
    description: string;
    rating: number;
    reviewCount: number;
    price: string;
    imageKeyword: string; // Used to fetch from Unsplash
    photoUrl?: string; // Real Google Photo URL
    tags: string[];
}

interface PlaceCardProps {
    data: PlaceData;
    onPress?: () => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({ data, onPress }) => {
    // Priority: Real Photo URL > Curated Unsplash Image > Fallback
    const dynamicImage = data.photoUrl ? data.photoUrl : getPlaceImage(data.imageKeyword, data.id);

    return (
        <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.container}>
            <ImageBackground
                source={{ uri: dynamicImage }}
                style={styles.imageBackground}
                imageStyle={{ borderRadius: 24 }}
            >
                {/* Gradient/Overlay Effect */}
                <View style={styles.overlay}>
                    {/* Top Right Heart Icon Placeholder */}
                    <View style={styles.heartContainer}>
                        <Text style={{ fontSize: 16 }}>🤍</Text>
                    </View>

                    {/* Bottom Details Section */}
                    <View style={styles.detailsContainer}>
                        <View style={styles.headerRow}>
                            <Text style={styles.title} numberOfLines={2}>{data.title}</Text>
                            <View style={styles.ratingContainer}>
                                <Text style={styles.star}>⭐</Text>
                                <Text style={styles.ratingText}>{typeof data.rating === 'number' ? data.rating.toFixed(1) : data.rating}</Text>
                                <Text style={styles.reviewCount}>({data.reviewCount})</Text>
                            </View>
                        </View>

                        <Text style={styles.location} numberOfLines={1}>{data.description}</Text>

                        {/* Tags */}
                        <View style={styles.tagsRow}>
                            {data.tags.slice(0, 3).map((tag, index) => (
                                <View key={index} style={styles.tag}>
                                    <Text style={styles.tagText}>{tag}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Price & Action */}
                        <View style={styles.footerRow}>
                            <Text style={styles.price}>{data.price}
                                {data.price && !data.price.includes('₹') && <Text style={styles.perNight}> / night</Text>}
                            </Text>
                            <View style={styles.button}>
                                <Text style={styles.buttonText}>View details &gt;</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ImageBackground>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        marginRight: 16,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
        backgroundColor: '#fff', // fallback
    },
    imageBackground: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    overlay: {
        flex: 1,
        borderRadius: 24,
        backgroundColor: 'rgba(0,0,0,0.1)', // Slight overall tint
        justifyContent: 'flex-end',
    },
    heartContainer: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        backdropFilter: 'blur(10px)', // Web only support
    },
    detailsContainer: {
        margin: 12,
        padding: 16,
        borderRadius: 20,
        backgroundColor: 'rgba(20, 20, 20, 0.85)', // Dark glass effect
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        flex: 1,
        marginRight: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    star: {
        fontSize: 12,
        marginRight: 4,
    },
    ratingText: {
        color: '#FFD700',
        fontWeight: 'bold',
        fontSize: 14,
    },
    reviewCount: {
        color: '#aaa',
        fontSize: 12,
        marginLeft: 2,
    },
    location: {
        color: '#ccc',
        fontSize: 12,
        marginBottom: 12,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        marginRight: 6,
        marginBottom: 4,
    },
    tagText: {
        color: '#eee',
        fontSize: 10,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    price: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    perNight: {
        fontSize: 12,
        color: '#aaa',
        fontWeight: '400',
    },
    button: {
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    buttonText: {
        color: '#000',
        fontSize: 12,
        fontWeight: '600',
    },
});
