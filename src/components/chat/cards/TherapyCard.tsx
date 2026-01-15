import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';

interface TherapyCardProps {
    mood: string;
    technique: string;
    steps: { label: string; duration: number }[]; // Not fully utilizing steps yet for simple MVP
    script: string;
}

const { width } = Dimensions.get('window');

export const TherapyCard: React.FC<TherapyCardProps> = ({ mood, technique, script }) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        // Breathing Animation: Expand/Contract cycle (4s in, 4s out approx)
        scale.value = withRepeat(
            withTiming(1.5, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true // Reverse for exhale
        );
        opacity.value = withRepeat(
            withTiming(0.6, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, []);

    const animatedCircleStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
        };
    });

    return (
        <View style={styles.cardContainer}>
            <View style={styles.header}>
                <Text style={styles.label}>HITA HEART</Text>
                <Text style={styles.mood}>Feeling {mood}</Text>
            </View>

            <View style={styles.animationContainer}>
                {/* Pulsing Circle */}
                <Animated.View style={[styles.circle, animatedCircleStyle]} />

                {/* Center Prompt */}
                <View style={styles.centerContent}>
                    <Text style={styles.technique}>{technique}</Text>
                    <Text style={styles.instruction}>Breathe with the circle</Text>
                </View>
            </View>

            <Text style={styles.script}>"{script}"</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        marginTop: 12,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    label: {
        fontSize: 10,
        letterSpacing: 2,
        fontWeight: '700',
        color: '#BCAAA4', // Soft warm brown
        marginBottom: 4,
    },
    mood: {
        fontSize: 16,
        fontWeight: '600',
        color: '#5D4037', // Darker warm brown
    },
    animationContainer: {
        width: 150,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    circle: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#A5D6A7', // Soft Sage/Mint
    },
    centerContent: {
        alignItems: 'center',
    },
    technique: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#388E3C', // Deep Green
    },
    instruction: {
        fontSize: 10,
        color: '#666',
        marginTop: 2,
    },
    script: {
        fontStyle: 'italic',
        color: '#666',
        textAlign: 'center',
        fontSize: 13,
        lineHeight: 20,
    }
});
