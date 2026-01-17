
import { useNavigation, useRoute } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from 'react';
import { Animated, Dimensions, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Mock Types - Replace with shared types
interface TripPlan {
    currentCondition: { temp: string, condition: string, icon: string, advice: string };
    timeline: { time: string, title: string, type: string, reason?: string }[];
}

const { width, height } = Dimensions.get('window');

export const TripDetailsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const planData: TripPlan = route.params?.planData;

    const scrollY = useRef(new Animated.Value(0)).current;

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [0, 1],
        extrapolate: 'clamp'
    });

    if (!planData) return <View style={styles.container}><Text>No data</Text></View>;

    return (
        <View style={styles.container}>
            {/* Header Image / Gradient Background */}
            <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=2832&auto=format&fit=crop' }}
                style={styles.backgroundImage}
            >
                <LinearGradient colors={['rgba(0,0,0,0.3)', '#FFF']} style={styles.gradient} />
            </ImageBackground>

            {/* Custom Header (Fixed) */}
            <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
                <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="light" />
                <Text style={styles.headerTitle}>Trip Itinerary</Text>
            </Animated.View>

            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>

            <Animated.ScrollView
                contentContainerStyle={styles.scrollContent}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
                scrollEventThrottle={16}
            >
                {/* Title Section */}
                <View style={styles.titleSection}>
                    <Text style={styles.bigTitle}>Your Adaptive Plan</Text>
                    <Text style={styles.subtitle}>Curated for right now ✨</Text>

                    {/* Context Chip */}
                    <View style={styles.contextChip}>
                        <Text style={styles.contextIcon}>{planData.currentCondition?.icon || '🌤️'}</Text>
                        <Text style={styles.contextText}>
                            {planData.currentCondition?.temp} • {planData.currentCondition?.condition}
                        </Text>
                    </View>
                    <Text style={styles.adviceText}>"{planData.currentCondition?.advice}"</Text>
                </View>

                {/* Timeline */}
                <View style={styles.timelineContainer}>
                    {planData.timeline?.map((item, index) => (
                        <View key={index} style={styles.timelineItem}>
                            <View style={styles.timeColumn}>
                                <Text style={styles.timeText}>{item.time}</Text>
                                <View style={styles.line} />
                            </View>

                            <View style={styles.cardContainer}>
                                {item.reason && (
                                    <View style={styles.reasonBubble}>
                                        <Text style={styles.reasonText}>💡 {item.reason}</Text>
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

                <View style={{ height: 100 }} />
            </Animated.ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    backgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: width,
        height: 400,
    },
    gradient: {
        flex: 1,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 100,
        justifyContent: 'flex-end',
        paddingBottom: 15,
        alignItems: 'center',
        zIndex: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#000',
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        zIndex: 20,
        backgroundColor: 'rgba(255,255,255,0.8)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    backButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    scrollContent: {
        paddingTop: 280,
    },
    titleSection: {
        paddingHorizontal: 24,
        marginBottom: 30,
    },
    bigTitle: {
        fontSize: 34,
        fontWeight: '800',
        color: '#333',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
        fontWeight: '500',
        marginBottom: 16,
    },
    contextChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F9FF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    contextIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    contextText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#0369A1',
    },
    adviceText: {
        fontSize: 15,
        fontStyle: 'italic',
        color: '#666',
        lineHeight: 22,
    },
    timelineContainer: {
        paddingHorizontal: 24,
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    timeColumn: {
        width: 60,
        alignItems: 'flex-start',
    },
    timeText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#999',
        marginBottom: 8,
    },
    line: {
        width: 2,
        flex: 1,
        backgroundColor: '#F0F0F0',
        marginLeft: 4,
    },
    cardContainer: {
        flex: 1,
    },
    reasonBubble: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    reasonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#92400E',
    },
    card: {
        padding: 16,
        borderRadius: 20,
        backgroundColor: '#F8FAFC',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    cardActive: {
        backgroundColor: '#FFF',
    },
    cardRest: {
        backgroundColor: '#FDF2F8',
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    cardType: {
        fontSize: 12,
        fontWeight: '600',
        color: '#94A3B8',
        letterSpacing: 0.5,
    }
});
