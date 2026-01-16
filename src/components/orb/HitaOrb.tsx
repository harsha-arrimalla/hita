import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    ZoomIn
} from 'react-native-reanimated';

interface HitaOrbProps {
    mode: 'idle' | 'listening' | 'speaking' | 'thinking';
}

const { width } = Dimensions.get('window');
const ORB_SIZE = width * 0.5;

export const HitaOrb: React.FC<HitaOrbProps> = ({ mode }) => {
    // Animation Values
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0.8);

    // Rings
    const ring1Scale = useSharedValue(1);
    const ring2Scale = useSharedValue(1);

    // Color interpolation could be added, but for now strict colors
    const getOrbColor = () => {
        switch (mode) {
            case 'listening': return '#4FC3F7'; // Light Blue
            case 'speaking': return '#81C784'; // Soft Green
            case 'thinking': return '#FFB74D'; // Orange/Terracotta
            case 'idle': default: return '#FFFFFF'; // White
        }
    };

    const baseColor = getOrbColor();

    useEffect(() => {
        if (mode === 'idle') {
            // Gentle breathing
            scale.value = withRepeat(withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }), -1, true);
            opacity.value = withRepeat(withTiming(0.6, { duration: 2000 }), -1, true);

            ring1Scale.value = withTiming(1);
            ring2Scale.value = withTiming(1);
        } else if (mode === 'listening') {
            // Excited pulsing
            scale.value = withRepeat(withTiming(1.1, { duration: 500 }), -1, true);
            ring1Scale.value = withRepeat(withTiming(1.3, { duration: 1000 }), -1, true);
            ring2Scale.value = withRepeat(withTiming(1.5, { duration: 1200 }), -1, true);
        }
    }, [mode]);

    const centerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        backgroundColor: baseColor,
        opacity: opacity.value,
        shadowColor: baseColor,
        shadowRadius: 20,
        shadowOpacity: 0.8,
    }));

    const ring1Style = useAnimatedStyle(() => ({
        transform: [{ scale: ring1Scale.value }],
        borderColor: baseColor,
        opacity: 0.3,
    }));

    const ring2Style = useAnimatedStyle(() => ({
        transform: [{ scale: ring2Scale.value }],
        borderColor: baseColor,
        opacity: 0.1,
    }));

    return (
        <View style={styles.container}>
            {/* Outer Rings (only visible when active) */}
            <Animated.View style={[styles.ring, styles.ring2, ring2Style]} />
            <Animated.View style={[styles.ring, styles.ring1, ring1Style]} />

            {/* Core Orb */}
            <Animated.View entering={ZoomIn.duration(800)} style={[styles.core, centerStyle]} />

            {/* Inner Light (Highlight) */}
            <View style={styles.highlight} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        width: ORB_SIZE * 2,
        height: ORB_SIZE * 2,
    },
    core: {
        width: ORB_SIZE,
        height: ORB_SIZE,
        borderRadius: ORB_SIZE / 2,
        position: 'absolute',
        shadowOffset: { width: 0, height: 0 },
        elevation: 10,
    },
    highlight: {
        width: ORB_SIZE * 0.3,
        height: ORB_SIZE * 0.3,
        borderRadius: (ORB_SIZE * 0.3) / 2,
        backgroundColor: 'rgba(255,255,255,0.4)',
        position: 'absolute',
        top: ORB_SIZE * 0.7,
        left: ORB_SIZE * 0.7,
        transform: [{ skewX: '-10deg' }]
    },
    ring: {
        position: 'absolute',
        width: ORB_SIZE,
        height: ORB_SIZE,
        borderRadius: ORB_SIZE / 2,
        borderWidth: 2,
    },
    ring1: {
        width: ORB_SIZE * 1.2,
        height: ORB_SIZE * 1.2,
        borderRadius: (ORB_SIZE * 1.2) / 2,
    },
    ring2: {
        width: ORB_SIZE * 1.5,
        height: ORB_SIZE * 1.5,
        borderRadius: (ORB_SIZE * 1.5) / 2,
    },
});
