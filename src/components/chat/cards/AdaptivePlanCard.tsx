
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../../../theme';
// import { Compass, Sun, Moon, CloudRain, BatteryCharging, Coffee } from 'lucide-react-native'; 
// Note: Lucide icons need to be imported assuming they are available or use text/emoji for MVP if icons not confirmed.
// Using Emojis for now to ensure no icon errors, can upgrade later.

interface PlanItem {
    time: string;
    title: string;
    type: 'indoor' | 'outdoor' | 'food' | 'rest';
    reason?: string; // "Too hot outside"
}

interface AdaptivePlanProps {
    currentCondition: {
        temp: string;
        condition: string;
        icon: string; // Emoji
        advice: string;
    };
    timeline: PlanItem[];
    onAction?: (action: string) => void;
}

export const AdaptivePlanCard: React.FC<AdaptivePlanProps> = ({ currentCondition, timeline, onAction }) => {
    const navigation = useNavigation<any>();

    // Only show first 2 items as preview
    const previewItems = timeline.slice(0, 2);

    return (
        <View style={styles.container}>
            {/* Header: Current Context */}
            <View style={styles.header}>
                <View style={styles.weatherRow}>
                    <Text style={styles.weatherIcon}>{currentCondition.icon}</Text>
                    <View>
                        <Text style={styles.tempText}>{currentCondition.temp} • {currentCondition.condition}</Text>
                        <Text style={styles.adviceText}>{currentCondition.advice}</Text>
                    </View>
                </View>
            </View>

            {/* Timeline Preview */}
            <View style={styles.timelineContainer}>
                {previewItems.map((item, index) => (
                    <View key={index} style={styles.timelineItem}>
                        {/* Time Column */}
                        <View style={styles.timeCol}>
                            <Text style={styles.timeText}>{item.time}</Text>
                            <View style={styles.line} />
                        </View>

                        {/* Content Column */}
                        <View style={styles.contentCol}>
                            {item.reason && (
                                <View style={styles.decisionBubble}>
                                    <Text style={styles.decisionText}>✨ {item.reason}</Text>
                                </View>
                            )}
                            <View style={[styles.card, item.type === 'rest' ? styles.cardRest : styles.cardActive]}>
                                <Text style={styles.cardTitle}>{item.title}</Text>
                                <Text style={styles.cardType}>{item.type.toUpperCase()}</Text>
                            </View>
                        </View>
                    </View>
                ))}
            </View>

            {/* Footer / Actions */}
            <TouchableOpacity
                style={styles.footerBtn}
                onPress={() => navigation.navigate('TripDetails', { planData: { currentCondition, timeline } })}
            >
                <Text style={styles.footerText}>View Full Itinerary →</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        backgroundColor: '#FFF',
        overflow: 'hidden',
        width: 300,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    header: {
        backgroundColor: '#FAFAFA',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    weatherRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    weatherIcon: {
        fontSize: 32,
        marginRight: 12,
    },
    tempText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    adviceText: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    timelineContainer: {
        padding: 16,
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    timeCol: {
        width: 50,
        alignItems: 'flex-start',
        paddingTop: 0,
    },
    timeText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#999',
        marginBottom: 4,
    },
    line: {
        width: 2,
        flex: 1,
        backgroundColor: '#F0F0F0',
        marginLeft: 4,
        marginTop: 4,
    },
    contentCol: {
        flex: 1,
    },
    decisionBubble: {
        backgroundColor: '#FEF3C7', // Warm yellow/beige
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    decisionText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#92400E',
    },
    card: {
        padding: 12,
        borderRadius: 16,
        backgroundColor: '#F8FAFC',
    },
    cardRest: {
        backgroundColor: '#FDF2F8', // Pinkish (Relax)
    },
    cardActive: {
        backgroundColor: '#F0F9FF', // Blueish
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    cardType: {
        fontSize: 11,
        color: '#666',
        marginTop: 4,
        fontWeight: '500',
    },
    footerBtn: {
        padding: 14,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    footerText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.primary,
    }
});
