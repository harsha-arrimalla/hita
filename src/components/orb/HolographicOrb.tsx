import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';

interface Props {
    size?: number;
    mode?: 'idle' | 'listening' | 'speaking' | 'thinking';
}

const DEFAULT_SIZE = 200;

export const HolographicOrb: React.FC<Props> = ({ size = DEFAULT_SIZE, mode = 'idle' }) => {
    // Shared Values for Animation
    const blob1X = useSharedValue(0);
    const blob1Y = useSharedValue(0);
    const blob2X = useSharedValue(0);
    const blob2Y = useSharedValue(0);
    const pulse = useSharedValue(1);

    useEffect(() => {
        // Continuous organic movement
        const duration = 4000;

        blob1X.value = withRepeat(withTiming(30, { duration, easing: Easing.inOut(Easing.ease) }), -1, true);
        blob1Y.value = withRepeat(withTiming(-20, { duration: duration * 1.2, easing: Easing.inOut(Easing.ease) }), -1, true);

        blob2X.value = withRepeat(withTiming(-40, { duration: duration * 0.8, easing: Easing.inOut(Easing.ease) }), -1, true);
        blob2Y.value = withRepeat(withTiming(30, { duration: duration * 1.1, easing: Easing.inOut(Easing.ease) }), -1, true);

        // Breathing effect based on mode
        if (mode === 'listening') {
            pulse.value = withRepeat(withTiming(1.05, { duration: 600, easing: Easing.inOut(Easing.ease) }), -1, true);
        } else {
            pulse.value = withRepeat(withTiming(1.02, { duration: 2000, easing: Easing.inOut(Easing.ease) }), -1, true);
        }
    }, [mode]);

    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }]
    }));

    const blob1Style = useAnimatedStyle(() => ({
        transform: [{ translateX: blob1X.value }, { translateY: blob1Y.value }]
    }));

    const blob2Style = useAnimatedStyle(() => ({
        transform: [{ translateX: blob2X.value }, { translateY: blob2Y.value }]
    }));

    return (
        <Animated.View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }, containerStyle]}>
            {/* Base Gradient Layer */}
            <LinearGradient
                colors={['#E0BBE4', '#957DAD', '#D291BC']} // Muted Purple/Pink base
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            {/* Moving Plasma Blob 1 (Bright Cyan/Purple) */}
            <Animated.View style={[styles.blob, { width: size * 0.8, height: size * 0.8, backgroundColor: '#FEC8D8' }, blob1Style]}>
                <LinearGradient
                    colors={['rgba(254, 200, 216, 0.8)', 'rgba(255, 223, 211, 0)']}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>

            {/* Moving Plasma Blob 2 (Deep Violet) */}
            <Animated.View style={[styles.blob, { width: size * 0.7, height: size * 0.7, top: size * 0.2, left: size * 0.2, backgroundColor: '#957DAD' }, blob2Style]}>
                <LinearGradient
                    colors={['rgba(149, 125, 173, 0.9)', 'rgba(149, 125, 173, 0)']}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>

            {/* Glass Highlight / Gloss overlay */}
            <LinearGradient
                colors={['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.0)', 'rgba(255,255,255,0.1)']}
                locations={[0, 0.4, 1]}
                style={styles.gloss}
            />

            {/* Edge Rim Light */}
            <View style={[styles.rim, { borderRadius: size / 2 }]} />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        backgroundColor: '#000',
        elevation: 20,
        shadowColor: '#D291BC',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 30,
    },
    blob: {
        position: 'absolute',
        borderRadius: 999,
        opacity: 0.8,
        // Using "blur" in styles isn't native, so we rely on alpha gradients overlaying each other to create a soft look.
        // Or we could use ImageBackground if we had blur assets.
    },
    gloss: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.6,
    },
    rim: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        opacity: 0.5,
    }
});
