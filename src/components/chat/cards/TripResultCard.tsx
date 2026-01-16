import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../../theme';

interface DayPlan {
    day: number;
    title: string;
    activities: string[];
}

export interface TripResultData {
    destination: string;
    duration: string;
    totalCost: string;
    itinerary: DayPlan[];
}

export const TripResultCard: React.FC<TripResultData> = ({ destination, duration, totalCost, itinerary }) => {
    return (
        <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.destination}>{destination}</Text>
                    <Text style={styles.subtext}>{duration} • Est. {totalCost}</Text>
                </View>
                <View style={styles.iconContainer}>
                    <Text style={styles.icon}>🌴</Text>
                </View>
            </View>

            {/* Timeline */}
            <View style={styles.timelineContainer}>
                {itinerary.map((day, index) => (
                    <View key={index} style={styles.dayRow}>
                        {/* Dot & Line */}
                        <View style={styles.timelineLeft}>
                            <View style={styles.dot} />
                            {index !== itinerary.length - 1 && <View style={styles.line} />}
                        </View>

                        {/* Content */}
                        <View style={styles.dayContent}>
                            <Text style={styles.dayHeader}>Day {day.day}: {day.title}</Text>
                            {day.activities.map((activity, idx) => (
                                <Text key={idx} style={styles.activity}>• {activity}</Text>
                            ))}
                        </View>
                    </View>
                ))}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Ready to book?</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 0,
        marginVertical: 8,
        width: '100%',
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    header: {
        backgroundColor: theme.colors.primary, // Terra Cotta
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    destination: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        fontFamily: theme.typography.hita.fontFamily,
    },
    subtext: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 4,
        fontWeight: '500',
    },
    iconContainer: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        padding: 8,
    },
    icon: {
        fontSize: 24,
    },
    timelineContainer: {
        padding: 16,
    },
    dayRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    timelineLeft: {
        alignItems: 'center',
        marginRight: 12,
        width: 16,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: theme.colors.primary,
        marginTop: 6,
    },
    line: {
        width: 1,
        flex: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 4,
    },
    dayContent: {
        flex: 1,
        paddingBottom: 20,
    },
    dayHeader: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginBottom: 6,
    },
    activity: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        lineHeight: 20,
        marginBottom: 2,
    },
    footer: {
        backgroundColor: '#FAFAFA',
        padding: 12,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    footerText: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        fontWeight: '600',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
});
