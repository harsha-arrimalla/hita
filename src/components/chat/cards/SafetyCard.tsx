import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../../theme';

interface SafetyCardProps {
    location: string;
    score: number;
    risks: string[];
    safeHavens: string[];
}

export const SafetyCard: React.FC<SafetyCardProps> = ({ location, score, risks, safeHavens }) => {
    // Determine color based on score (1-10)
    // Low (1-4): Red/Warning
    // Medium (5-7): Yellow/Caution
    // High (8-10): Green/Safe

    let badgeColor: string = theme.colors.state.error; // Default red
    let badgeText = "Caution";

    if (score >= 8) {
        badgeColor = theme.colors.state.success; // Green (Use success/safe color if available, fallback to pure green for now)
        badgeText = "Safe";
    } else if (score >= 5) {
        badgeColor = '#D4A373'; // Muted Ochre/Earth tone for "Moderate"
        badgeText = "Moderate";
    }

    return (
        <View style={styles.cardContainer}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.label}>SAFETY CHECK</Text>
                    <Text style={styles.location}>{location}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: badgeColor }]}>
                    <Text style={styles.score}>{score}/10</Text>
                </View>
            </View>

            {/* Risks */}
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>POTENTIAL RISKS</Text>
                <View style={styles.tagContainer}>
                    {risks.map((risk, index) => (
                        <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>{risk}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Safe Havens */}
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>SAFE HAVENS</Text>
                {safeHavens.map((haven, index) => (
                    <View key={index} style={styles.havenRow}>
                        <View style={styles.dot} />
                        <Text style={styles.havenText}>{haven}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#F5F5F1', // Warm off-white
        borderRadius: 16,
        padding: 16,
        marginTop: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    label: {
        fontSize: 10,
        letterSpacing: 1.5,
        fontWeight: '700',
        color: '#8A8A8A',
        marginBottom: 4,
    },
    location: {
        fontSize: 18,
        fontFamily: theme.fonts.serif, // Ensure this exists in theme
        fontWeight: '600',
        color: '#1A1A1A',
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    score: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    section: {
        marginTop: 12,
    },
    sectionLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#AAA',
        marginBottom: 8,
        letterSpacing: 1,
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        backgroundColor: '#EAEAE5',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    tagText: {
        fontSize: 12,
        color: '#444',
    },
    havenRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#8BC34A', // Soft green
        marginRight: 8,
    },
    havenText: {
        fontSize: 13,
        color: '#333',
    }
});
