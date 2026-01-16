import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Extrapolation,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { theme } from '../../theme';
import { HitaOrb } from './HitaOrb';

const { height } = Dimensions.get('window');

interface Props {
    isVisible: boolean;
    onClose: () => void;
}

export const OrbOverlay: React.FC<Props> = ({ isVisible, onClose }) => {
    // Animation Value: 0 = Hidden (Bottom), 1 = Visible (Top)
    const active = useSharedValue(0);

    useEffect(() => {
        active.value = withSpring(isVisible ? 1 : 0, { damping: 15, stiffness: 100 });
    }, [isVisible]);

    // Gesture: Swipe Down to Close
    const pan = Gesture.Pan()
        .onUpdate((event) => {
            // Only allow dragging down
            if (active.value === 1 && event.translationY > 0) {
                // Map translation to 1 -> 0 range roughly
                // active.value = 1 - (event.translationY / height);
            }
        })
        .onEnd((event) => {
            if (event.translationY > 100) {
                runOnJS(onClose)();
            }
        });

    const overlayStyle = useAnimatedStyle(() => {
        const translateY = interpolate(
            active.value,
            [0, 1],
            [height, 0],
            Extrapolation.CLAMP
        );

        return {
            transform: [{ translateY }],
            opacity: active.value,
        };
    });

    const backdropStyle = useAnimatedStyle(() => ({
        opacity: interpolate(active.value, [0, 1], [0, 0.9]), // Dark backdrop
    }));

    if (!isVisible && active.value === 0) return null;

    return (
        <View style={[StyleSheet.absoluteFill, { pointerEvents: isVisible ? 'auto' : 'none' }]}>
            {/* Animated Backdrop */}
            <Animated.View style={[styles.backdrop, backdropStyle]} />

            {/* Main Overlay */}
            <GestureDetector gesture={pan}>
                <Animated.View style={[styles.container, overlayStyle]}>
                    <View style={styles.content}>
                        <Text style={styles.hint}>Swipe down to chat</Text>

                        <View style={styles.orbContainer}>
                            <HitaOrb mode="listening" />
                        </View>

                        <Text style={styles.status}>Listening...</Text>
                    </View>
                </Animated.View>
            </GestureDetector>
        </View>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    orbContainer: {
        marginVertical: 40,
    },
    hint: {
        position: 'absolute',
        top: 60,
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    status: {
        color: '#FFF',
        fontSize: 24,
        fontFamily: theme.fonts.serif,
        marginTop: 20,
        opacity: 0.9,
    }
});
