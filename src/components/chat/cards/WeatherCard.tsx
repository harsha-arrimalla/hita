import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface WeatherData {
    temp: number;
    condition: string; // e.g., "Clouds"
    description: string; // e.g., "overcast clouds"
    icon: string; // e.g., "04d"
    humidity: number;
    windSpeed: number;
    city: string;
}

interface WeatherCardProps {
    data: WeatherData;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ data }) => {
    // Map OpenWeather icons to Ionicons (simple mapping)
    const getIcon = (condition: string) => {
        const c = condition.toLowerCase();
        if (c.includes('rain')) return 'rainy';
        if (c.includes('cloud')) return 'cloud';
        if (c.includes('clear')) return 'sunny';
        if (c.includes('snow')) return 'snow';
        if (c.includes('thunder')) return 'thunderstorm';
        return 'partly-sunny';
    };

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Ionicons name="location-sharp" size={16} color="#fff" style={{ marginRight: 4 }} />
                <Text style={styles.city}>{data.city}</Text>
            </View>

            <View style={styles.main}>
                <Ionicons name={getIcon(data.condition)} size={48} color="#fff" />
                <View style={styles.tempContainer}>
                    <Text style={styles.temp}>{data.temp}°</Text>
                    <Text style={styles.condition}>{data.description}</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.stat}>
                    <Ionicons name="water-outline" size={14} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.statText}>{data.humidity}% Humidity</Text>
                </View>
                <View style={styles.stat}>
                    <Ionicons name="navigate-outline" size={14} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.statText}>{data.windSpeed} m/s Wind</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#4A90E2', // Sky Blue Gradient fallback
        borderRadius: 20,
        padding: 16,
        marginVertical: 8,
        width: '70%', // Compact card
        alignSelf: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    city: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    main: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    tempContainer: {
        alignItems: 'flex-end',
    },
    temp: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#fff',
    },
    condition: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        textTransform: 'capitalize',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
        paddingTop: 12,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
    },
});
