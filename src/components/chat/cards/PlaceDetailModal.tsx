
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Image, Linking, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../../../theme';
import { PlaceData } from './PlaceCard';

// Using standard View/Blur approach or just semi-transparent background.
// For premium feel, use a darker backdrop with a bottom sheet animation or fade.

interface PlaceDetailModalProps {
    visible: boolean;
    place: PlaceData | null;
    onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({ visible, place, onClose }) => {
    if (!place) return null;

    const handleGetDirections = () => {
        // Open Google Maps
        // Query: Name + Address
        const query = encodeURIComponent(`${place.title}, ${place.description}`);
        const url = Platform.select({
            ios: `maps:0,0?q=${query}`,
            android: `geo:0,0?q=${query}`,
            default: `https://www.google.com/maps/search/?api=1&query=${query}`
        });
        Linking.openURL(url as string).catch(err => console.error("Could not open maps", err));
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={styles.container}>
                {/* Backdrop / Dismiss Area */}
                <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

                {/* Main Card Content */}
                <View style={styles.modalContent}>
                    {/* Header Image */}
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: place.photoUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop' }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Ionicons name="close" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollContent} contentContainerStyle={{ paddingBottom: 40 }}>
                        {/* Title & Type */}
                        <Text style={styles.title}>{place.title}</Text>
                        <Text style={styles.subtitle}>{place.tags.join(' • ')}</Text>

                        {/* Rating Row */}
                        <View style={styles.row}>
                            <Text style={styles.rating}>⭐ {place.rating ? place.rating.toFixed(1) : 'New'}</Text>
                            <Text style={styles.reviewCount}>({place.reviewCount} reviews)</Text>
                            <View style={styles.spacer} />
                            <Text style={styles.price}>{place.price}</Text>
                        </View>

                        <View style={styles.divider} />

                        {/* Description / Address */}
                        <Text style={styles.sectionHeader}>Location</Text>
                        <Text style={styles.description}>{place.description}</Text>

                        {/* About / Vibe (Mocked for now as we don't have full data) */}
                        <Text style={styles.sectionHeader}>About</Text>
                        <Text style={styles.description}>
                            A popular spot in the area known for its ambiance and quality. Perfect for {place.tags.includes('Cafe') ? "a relaxed coffee break" : "a delightful meal"}.
                            {place.tags.includes('Wifi') && "\n• Free Wifi available"}
                            {place.tags.includes('Veg') && "\n• Vegetarian Friendly"}
                            {place.tags.includes('Outdoor') && "\n• Outdoor Seating"}
                        </Text>

                        <View style={{ height: 20 }} />

                        {/* Action Buttons */}
                        <TouchableOpacity style={styles.directionsButton} onPress={handleGetDirections}>
                            <Ionicons name="navigate-circle" size={24} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.directionsText}>Get Directions</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        height: height * 0.85, // Takes up 85% of screen
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 20,
    },
    imageContainer: {
        width: '100%',
        height: 250,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        flex: 1,
        padding: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    rating: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginRight: 4,
    },
    reviewCount: {
        fontSize: 14,
        color: '#888',
    },
    spacer: {
        flex: 1,
    },
    price: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.text.primary,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginBottom: 24,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        color: '#444',
        lineHeight: 24,
        marginBottom: 24,
    },
    directionsButton: {
        backgroundColor: '#000',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    directionsText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
