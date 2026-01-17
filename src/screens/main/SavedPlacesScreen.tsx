import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';

// Mock Data
const SAVED_PLACES = [
    {
        id: '1',
        name: 'Anjuna Beach',
        type: 'Beach',
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1520483601560-389dff434fdf?fit=crop&w=400&h=300',
    },
    {
        id: '2',
        name: 'Gunpowder',
        type: 'Restaurant',
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?fit=crop&w=400&h=300',
    },
    {
        id: '3',
        name: 'Fort Aguada',
        type: 'Historic Site',
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?fit=crop&w=400&h=300',
    },
];

export const SavedPlacesScreen = () => {
    const navigation = useNavigation<any>();

    const renderPlace = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.card} activeOpacity={0.9}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.cardContent}>
                <View style={styles.textContainer}>
                    <Text style={styles.placeName}>{item.name}</Text>
                    <Text style={styles.placeType}>{item.type}</Text>
                </View>
                <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.rating}>{item.rating}</Text>
                </View>
            </View>
            <TouchableOpacity style={styles.heartButton}>
                <Ionicons name="heart" size={20} color="#FF453A" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
                    <Ionicons name="menu-outline" size={28} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Saved Places</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={SAVED_PLACES}
                keyExtractor={(item) => item.id}
                renderItem={renderPlace}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    menuButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        fontFamily: theme.typography.hita.fontFamily,
    },
    listContent: {
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 150,
    },
    cardContent: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
    },
    placeName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: 4,
    },
    placeType: {
        fontSize: 14,
        color: '#888',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF9E0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    rating: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#BDB76B',
    },
    heartButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: '#fff',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
});
