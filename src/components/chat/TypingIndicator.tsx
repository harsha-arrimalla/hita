import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { theme } from '../../theme';

export const TypingIndicator: React.FC = () => {
    const opacity1 = useRef(new Animated.Value(0.4)).current;
    const opacity2 = useRef(new Animated.Value(0.4)).current;
    const opacity3 = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        const animate = (anim: Animated.Value, delay: number) => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(anim, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                        delay,
                    }),
                    Animated.timing(anim, {
                        toValue: 0.4,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };

        animate(opacity1, 0);
        animate(opacity2, 200);
        animate(opacity3, 400);
    }, [opacity1, opacity2, opacity3]);

    return (
        <View style={styles.container}>
            <View style={styles.bubble}>
                <Animated.View style={[styles.dot, { opacity: opacity1 }]} />
                <Animated.View style={[styles.dot, { opacity: opacity2 }]} />
                <Animated.View style={[styles.dot, { opacity: opacity3 }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 4,
        paddingHorizontal: theme.spacing.m,
        alignItems: 'flex-start',
    },
    bubble: {
        padding: theme.spacing.m,
        // Hita bubble style
        backgroundColor: theme.colors.chat.bubbleHita,
        borderRadius: theme.borderRadius.l, // Organic roundness
        // No tail
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        height: 48, // Slightly taller for elegance
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: theme.colors.ui.typingDot, // Terracotta
        marginHorizontal: 3,
    },
});
