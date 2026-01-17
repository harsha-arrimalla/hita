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
            {/* 1. Deep Space/Plasma Base Background */}
            <LinearGradient
                colors={['#2E1C4E', '#5D3F8C', '#E0BBE4']} // Deep Violet -> Soft Lavender
                locations={[0, 0.6, 1]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0.2, y: 0.1 }}
                end={{ x: 0.8, y: 0.9 }}
            />

            {/* 2. Plasma Blob 1 (Cyan/White - Energy) */}
            <Animated.View style={[styles.blob, { width: size * 0.9, height: size * 0.9, top: -size * 0.1, left: -size * 0.1 }, blob1Style]}>
                <LinearGradient
                    colors={['rgba(100, 255, 218, 0.4)', 'rgba(255, 255, 255, 0)']} // Teal/Cyan Energy
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0.5, y: 0.5 }}
                    end={{ x: 1, y: 1 }}
                />
            </Animated.View>

            {/* 3. Plasma Blob 2 (Warm Pink/Magenta - Heart) */}
            <Animated.View style={[styles.blob, { width: size * 0.8, height: size * 0.8, top: size * 0.2, left: size * 0.2 }, blob2Style]}>
                <LinearGradient
                    colors={['rgba(255, 64, 129, 0.3)', 'rgba(255, 183, 77, 0)']} // Pink -> Orange Fade
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0.8, y: 0.8 }}
                />
            </Animated.View>

            {/* 4. Frosted Glass Surface (The "Blur" Simulation) */}
            {/* Since we can't use real BlurView easily on Android/Expo Go without native build sometimes, we fake it with white overlay */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />

            {/* 5. Sharp Specular Highlight (The "Gloss") */}
            <LinearGradient
                colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.1)', 'transparent']}
                locations={[0, 0.1, 0.5]}
                style={styles.gloss}
                start={{ x: 0.3, y: 0 }}
                end={{ x: 0.8, y: 1 }}
            />

            {/* 6. Edge Rim Light (Fresnel Effect) */}
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
