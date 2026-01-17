import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';
import { Message } from '../../types/message';
import { FareCard } from './cards/FareCard';
import { PlaceCarousel } from './cards/PlaceCarousel';
import { SafetyCard } from './cards/SafetyCard';
import { TherapyCard } from './cards/TherapyCard';
import { TransitCard } from './cards/TransitCard';
import { TripPlannerCard } from './cards/TripPlannerCard';
import { TripResultCard } from './cards/TripResultCard';
import { WeatherCard } from './cards/WeatherCard';

import { TypewriterText } from './TypewriterText';

interface Props {
    message: Message;
    onSend?: (text: string) => void;
    isLatest?: boolean;
    onPlaceSelect?: (place: any) => void;
}

const SmartCardRenderer = ({ uiAction, onSend, onPlaceSelect }: { uiAction: Message['uiAction'], onSend?: (text: string) => void, onPlaceSelect?: (place: any) => void }) => {
    if (!uiAction) return null;

    switch (uiAction.type) {
        case 'safety_card':
            return <SafetyCard {...uiAction.data} />;
        case 'therapy_card':
            return <TherapyCard {...uiAction.data} />;
        case 'fare_card':
            return <FareCard {...uiAction.data} />;
        case 'trip_planner_card':
            return onSend ? (
                <TripPlannerCard
                    onSubmit={onSend}
                    initialDestination={uiAction.data?.destination}
                    initialOrigin={uiAction.data?.origin}
                />
            ) : null;
        case 'trip_result_card':
            return <TripResultCard {...uiAction.data} />;
        case 'place_carousel':
            return <PlaceCarousel data={uiAction.data} onPlacePress={onPlaceSelect} />;
        case 'transit_card':
            return <TransitCard {...uiAction.data} />;
        case 'weather_card':
            return <WeatherCard data={uiAction.data} />;
        default:
            return null;
    }
};

export const MessageBubble: React.FC<Props> = ({ message, onSend, isLatest, onPlaceSelect }) => {
    const isUser = message.sender === 'user';

    // Check if we have text content
    const hasText = message.text && message.text.length > 0;

    // State to control card visibility
    // If it's a history message (not latest), show card immediately.
    // If it's user message, show card immediately (shouldn't have one usually, but safe default).
    // If it's Hita's latest message AND has text, hide initially (wait for typewriter).
    // If no text, show immediately.
    const [showCard, setShowCard] = React.useState(!isLatest || isUser || !hasText);

    // Safety: If isLatest becomes false (new message arrives), ensure card is shown
    React.useEffect(() => {
        if (!isLatest) setShowCard(true);
    }, [isLatest]);

    // Memoize completion handler to prevent TypewriterText resets
    const handleTypingComplete = React.useCallback(() => {
        setShowCard(true);
    }, []);

    return (
        <View
            style={[
                styles.container,
                isUser ? styles.containerUser : styles.containerHita,
            ]}
        >
            {/* 1. Text Bubble Section */}
            {hasText && (
                <View
                    style={[
                        styles.bubbleBase,
                        // Styles based on sender
                        isUser ? styles.bubbleUser : styles.bubbleHita,
                        // Add shadow only for user
                        isUser && styles.bubbleShadow,

                        // Add margin if card exists
                        message.uiAction && { marginBottom: 4 }
                    ]}
                >
                    {isLatest && !isUser ? (
                        <TypewriterText
                            style={[
                                styles.text,
                                styles.textHita,
                            ]}
                            text={message.text}
                            speed={15}
                            onComplete={handleTypingComplete}
                        />
                    ) : (
                        <Text
                            style={[
                                styles.text,
                                isUser ? styles.textUser : styles.textHita,
                            ]}
                        >
                            {message.text}
                        </Text>
                    )}
                </View>
            )}

            {/* 2. Action Card Section (Rendered Outside the bubble) */}
            {/* Only show if permitted by sequential logic */}
            {showCard && !isUser && message.uiAction && (
                message.uiAction.type === 'place_carousel' ? (
                    <View style={styles.fullWidthContainer}>
                        <SmartCardRenderer uiAction={message.uiAction} onSend={onSend} onPlaceSelect={onPlaceSelect} />
                    </View>
                ) : (
                    <View style={styles.cardContainer}>
                        <SmartCardRenderer uiAction={message.uiAction} onSend={onSend} onPlaceSelect={onPlaceSelect} />
                    </View>
                )
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 6,
        paddingHorizontal: theme.spacing.m,
        width: '100%',
    },
    containerUser: {
        alignItems: 'flex-end',
    },
    containerHita: {
        alignItems: 'flex-start',
    },
    bubbleBase: {
        maxWidth: '85%',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: theme.borderRadius.l,
    },
    bubbleShadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    bubbleUser: {
        backgroundColor: theme.colors.chat.bubbleUser,
    },
    bubbleHita: {
        backgroundColor: 'transparent', // Explicitly transparent
        paddingHorizontal: 0, // Remove inner padding for text-only look
        paddingVertical: 0, // Align tighter vertically too
    },
    cardContainer: {
        maxWidth: '85%',
        width: '100%',
    },
    fullWidthContainer: {
        width: Dimensions.get('window').width, // Full screen width
        marginLeft: -theme.spacing.m, // Counteract parent padding
    },
    text: {
        fontSize: 16,
    },
    textUser: {
        color: theme.colors.chat.textUser,
        ...theme.typography.user,
    },
    textHita: {
        color: theme.colors.chat.textHita,
        ...theme.typography.hita,
    },
});
