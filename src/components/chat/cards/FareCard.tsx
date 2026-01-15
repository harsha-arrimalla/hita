import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface FareCardProps {
    transport: string;
    location: string;
    baseFare: number;
    perKm: number;
    currency: string;
    warning: string;
}

export const FareCard: React.FC<FareCardProps> = ({ transport, location, baseFare, perKm, currency, warning }) => {
    return (
        <View style={styles.cardContainer}>
            {/* Top Half: Ticket Header */}
            <View style={styles.topSection}>
                <View style={styles.row}>
                    <View>
                        <Text style={styles.label}>ESTIMATED FAIR PRICE</Text>
                        <Text style={styles.transport}>{transport}</Text>
                    </View>
                    <View style={styles.locationTag}>
                        <Text style={styles.locationText}>{location}</Text>
                    </View>
                </View>

                <View style={styles.priceRow}>
                    <Text style={styles.currency}>{currency}</Text>
                    <Text style={styles.bigPrice}>{baseFare}</Text>
                    <Text style={styles.unit}> base fare</Text>
                </View>

                <Text style={styles.rateDetail}>+ {currency}{perKm}/km</Text>
            </View>

            {/* Dashed Line Divider */}
            <View style={styles.dividerContainer}>
                <View style={[styles.punchHole, styles.punchLeft]} />
                <View style={styles.dashedLine} />
                <View style={[styles.punchHole, styles.punchRight]} />
            </View>

            {/* Bottom Half: Warning */}
            <View style={styles.bottomSection}>
                <Text style={styles.warningLabel}>SCAM ALERT</Text>
                <Text style={styles.warningText}>{warning}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#263238', // Dark Slate for premium feel
        borderRadius: 12,
        marginTop: 12,
        overflow: 'hidden',
    },
    topSection: {
        padding: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    label: {
        fontSize: 9,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: 1,
    },
    transport: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFF',
        textTransform: 'capitalize',
    },
    locationTag: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        justifyContent: 'center',
    },
    locationText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    currency: {
        fontSize: 20,
        color: '#FFB74D', // Amber accent
        fontWeight: '300',
    },
    bigPrice: {
        fontSize: 42,
        fontWeight: '200',
        color: '#FFF',
        marginLeft: 4,
    },
    unit: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
    },
    rateDetail: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        marginTop: -4,
    },
    dividerContainer: {
        height: 20,
        justifyContent: 'center',
        position: 'relative',
        backgroundColor: '#263238',
    },
    dashedLine: {
        height: 1,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        borderStyle: 'dashed',
        marginHorizontal: 16,
    },
    punchHole: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#F2F2F2', // Match user background color (approx)
        top: 0,
    },
    punchLeft: {
        left: -10,
    },
    punchRight: {
        right: -10,
    },
    bottomSection: {
        padding: 16,
        paddingTop: 8,
        backgroundColor: 'rgba(0,0,0,0.2)', // Slightly darker
    },
    warningLabel: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#FF7043', // Warning Orange
        marginBottom: 4,
    },
    warningText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
    }
});
