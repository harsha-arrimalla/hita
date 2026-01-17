import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { LayoutAnimation, Platform, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import { theme } from '../../../theme';

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface DayPlan {
    day: number;
    title: string;
    activities: string[];
}

interface ItineraryTimelineProps {
    itinerary: DayPlan[];
}

export const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({ itinerary }) => {
    // By default, open the first day
    const [openDayIndex, setOpenDayIndex] = useState<number | null>(0);

    const toggleDay = (index: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setOpenDayIndex(prev => (prev === index ? null : index));
    };

    return (
        <View style={styles.container}>
            {itinerary.map((item, index) => {
                const isOpen = openDayIndex === index;
                const isLast = index === itinerary.length - 1;

                return (
                    <View key={index} style={styles.dayRow}>
                        {/* Left Timeline Column */}
                        <View style={styles.timelineColumn}>
                            {/* The Dot */}
                            <View style={[styles.dot, isOpen && styles.activeDot]}>
                                <Text style={[styles.dayNumber, isOpen && styles.activeDayNumber]}>
                                    {item.day}
                                </Text>
                            </View>
                            {/* The Dashed Connector Line */}
                            {!isLast && (
                                <View style={styles.lineWrapper}>
                                    <View style={[styles.line, isOpen && styles.activeLine]} />
                                </View>
                            )}
                        </View>

                        {/* Right Content Column */}
                        <View style={styles.contentColumn}>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => toggleDay(index)}
                                style={[styles.headerCard, isOpen && styles.activeHeaderCard]}
                            >
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.dayTitle}>{item.title}</Text>
                                    {!isOpen && (
                                        <Text style={styles.previewText} numberOfLines={1}>
                                            {item.activities.length} activities planned
                                        </Text>
                                    )}
                                </View>
                                <Ionicons
                                    name={isOpen ? "chevron-up" : "chevron-down"}
                                    size={20}
                                    color={isOpen ? theme.colors.primary : "#999"}
                                />
                            </TouchableOpacity>

                            {/* Expandable Details */}
                            {isOpen && (
                                <View style={styles.detailsContainer}>
                                    {item.activities.map((activity, idx) => (
                                        <View key={idx} style={styles.activityRow}>
                                            <View style={styles.activityIcon}>
                                                <Ionicons name="ellipse" size={6} color={theme.colors.primary} />
                                            </View>
                                            <Text style={styles.activityText}>{activity}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    dayRow: {
        flexDirection: 'row',
        marginBottom: 0, // spacing handled by content
    },
    timelineColumn: {
        alignItems: 'center',
        width: 40,
        marginRight: 12,
    },
    dot: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    activeDot: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    dayNumber: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#888',
    },
    activeDayNumber: {
        color: '#fff',
    },
    lineWrapper: {
        flex: 1,
        alignItems: 'center',
        width: '100%',
        marginBottom: 8,
    },
    line: {
        width: 2,
        flex: 1,
        backgroundColor: '#E0E0E0',
        borderRadius: 1,
    },
    activeLine: {
        backgroundColor: theme.colors.primary,
        opacity: 0.3,
    },
    contentColumn: {
        flex: 1,
        paddingBottom: 24,
    },
    headerCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#eee',
        // Shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    activeHeaderCard: {
        borderColor: theme.colors.primary,
        backgroundColor: '#FFFBF5', // Very subtle tint
    },
    dayTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    previewText: {
        fontSize: 12,
        color: '#888',
    },
    detailsContainer: {
        marginTop: 12,
        marginLeft: 4,
        paddingLeft: 12,
        borderLeftWidth: 2,
        borderLeftColor: '#F0F0F0',
    },
    activityRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    activityIcon: {
        marginTop: 6,
        marginRight: 8,
    },
    activityText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
        flex: 1,
    },
});
