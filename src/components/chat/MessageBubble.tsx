import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';
import { Message } from '../../types/message';
import { FareCard } from './cards/FareCard';
import { SafetyCard } from './cards/SafetyCard';
import { TherapyCard } from './cards/TherapyCard';

interface Props {
    message: Message;
}

const SmartCardRenderer = ({ uiAction }: { uiAction: Message['uiAction'] }) => {
    if (!uiAction) return null;

    switch (uiAction.type) {
        case 'safety_card':
            return <SafetyCard {...uiAction.data} />;
        case 'therapy_card':
            return <TherapyCard {...uiAction.data} />;
        case 'fare_card':
            return <FareCard {...uiAction.data} />;
        default:
            return null;
    }
};

export const MessageBubble: React.FC<Props> = ({ message }) => {
    const isUser = message.sender === 'user';

    return (
        <View
            style={[
                styles.container,
                isUser ? styles.containerUser : styles.containerHita,
            ]}
        >
            <View
                style={[
                    styles.bubble,
                    isUser ? styles.bubbleUser : styles.bubbleHita,
                ]}
            >
                <Text
                    style={[
                        styles.text,
                        isUser ? styles.textUser : styles.textHita,
                    ]}
                >
                    {message.text}
                </Text>

                {/* Render Intelligence Card if present */}
                {!isUser && message.uiAction && (
                    <SmartCardRenderer uiAction={message.uiAction} />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 6, // Increased spacing for breathability
        paddingHorizontal: theme.spacing.m,
        width: '100%',
    },
    containerUser: {
        alignItems: 'flex-end',
    },
    containerHita: {
        alignItems: 'flex-start',
    },
    bubble: {
        maxWidth: '85%',
        paddingVertical: 12, // More vertical padding
        paddingHorizontal: 16,
        borderRadius: theme.borderRadius.l, // Full organic rounding, no tails
        // Soft shadow for depth (Pi style)
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
        backgroundColor: theme.colors.chat.bubbleHita,
    },
    text: {
        fontSize: 16,
    },
    textUser: {
        color: theme.colors.chat.textUser,
        ...theme.typography.user, // Sans-serif
    },
    textHita: {
        color: theme.colors.chat.textHita,
        ...theme.typography.hita, // Serif
    },
});
