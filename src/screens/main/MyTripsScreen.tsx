import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';

// Mock Data
const PAST_TRIPS = [
    {
        id: '1',
        destination: 'Goa',
        date: 'Dec 24 - Dec 28, 2025',
        status: 'Completed',
        imageBg: '#FF8C42', // Terra Cotta
    },
    {
        id: '2',
        destination: 'Jaipur',
        date: 'Jan 10 - Jan 15, 2026',
        status: 'Upcoming',
        imageBg: '#E84545',
    },
    {
        id: '3',
        destination: 'Kerala',
        date: 'Feb 14 - Feb 20, 2026',
        status: 'Draft',
        imageBg: '#2B9348',
    },
];

export const MyTripsScreen = () => {
    const navigation = useNavigation<any>();

    const renderTripItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.card} activeOpacity={0.9}>
            <View style={[styles.cardHeader, { backgroundColor: item.imageBg }]}>
                <Text style={styles.destination}>{item.destination}</Text>
                <Text style={styles.status}>{item.status}</Text>
            </View>
            <View style={styles.cardBody}>
                <View style={styles.row}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.date}>{item.date}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
                    <Ionicons name="menu-outline" size={28} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.title}>My Trips</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* List */}
            <FlatList
                data={PAST_TRIPS}
                keyExtractor={(item) => item.id}
                renderItem={renderTripItem}
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
    title: {
        fontSize: 20,
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
    cardHeader: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    destination: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    status: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.9)',
        backgroundColor: 'rgba(0,0,0,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: 'hidden',
        textTransform: 'uppercase',
    },
    cardBody: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    date: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
});
