
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../../../theme';

export interface TransitRoute {
    mode: 'Metro' | 'Bus' | 'Train' | 'Ferry' | 'Tram' | 'Walk';
    line?: string;
    from: string;
    to: string;
    duration: string;
    cost: string;
    deepLink: string;
    frequency?: string;      // e.g. "Every 10 mins"
    operatingHours?: string; // e.g. "5 AM - 11 PM"
    safetyTip?: string;      // e.g. "Safe, usually crowded"
}

export const TransitCard: React.FC<TransitRoute> = ({ mode, line, from, to, duration, cost, deepLink, frequency, operatingHours, safetyTip }) => {

    const handlePress = () => {
        Linking.openURL(deepLink).catch(err => console.error("Couldn't open Maps", err));
    };

    const getIcon = () => {
        switch (mode) {
            case 'Metro': return 'train-outline';
            case 'Bus': return 'bus-outline';
            case 'Train': return 'train-outline';
            case 'Ferry': return 'boat-outline';
            case 'Walk': return 'walk-outline';
            default: return 'navigate-outline';
        }
    };

    return (
        <View style={styles.container}>
            {/* Header / Mode */}
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Ionicons name={getIcon()} size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.modeTitle}>{mode} {line ? `• ${line}` : ''}</Text>
                    <Text style={styles.subTitle}>{duration} • {cost}</Text>
                </View>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>Govt. Transport</Text>
                </View>
            </View>

            {/* Route Viz */}
            <View style={styles.routeContainer}>
                <View style={styles.stopRow}>
                    <View style={styles.dotStart} />
                    <Text style={styles.stopName}>{from}</Text>
                </View>
                <View style={styles.line} />
                <View style={styles.stopRow}>
                    <View style={styles.dotEnd} />
                    <Text style={styles.stopName}>{to}</Text>
                </View>
            </View>

            {/* Timings & Safety Info */}
            <View style={styles.infoContainer}>
                {frequency && (
                    <View style={styles.infoRow}>
                        <Ionicons name="time-outline" size={14} color="#666" />
                        <Text style={styles.infoText}>{frequency} {operatingHours && `• ${operatingHours}`}</Text>
                    </View>
                )}
                {safetyTip && (
                    <View style={styles.infoRow}>
                        <Ionicons name="shield-checkmark-outline" size={14} color="#2E7D32" />
                        <Text style={[styles.infoText, { color: '#2E7D32' }]}>{safetyTip}</Text>
                    </View>
                )}
            </View>

            {/* CTA */}
            <TouchableOpacity style={styles.button} onPress={handlePress}>
                <Ionicons name="map-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>See Live Schedule</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        width: '100%',
        maxWidth: 320,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: `${theme.colors.primary}15`, // 15 = low opacity hex
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerText: {
        flex: 1,
    },
    modeTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    subTitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    badge: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        color: '#2E7D32',
        fontSize: 10,
        fontWeight: '700',
    },
    routeContainer: {
        marginLeft: 20, // Align roughly with icon center
        marginBottom: 16,
    },
    stopRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stopName: {
        fontSize: 14,
        color: '#333',
        marginLeft: 12,
        flex: 1,
    },
    dotStart: {
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: theme.colors.primary,
        backgroundColor: '#fff',
    },
    dotEnd: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: theme.colors.primary,
    },
    line: {
        width: 2,
        height: 16,
        backgroundColor: '#ddd',
        marginLeft: 4, // Center under dot
        marginVertical: 2,
    },
    infoContainer: {
        marginBottom: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 6,
        fontWeight: '500',
    },
    button: {
        backgroundColor: theme.colors.text.primary, // Black
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});
