import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';

export const ChatInput: React.FC<Props> = ({ onSend, disabled }) => {
    const [text, setText] = useState('');
    const insets = useSafeAreaInsets();

    const handleSend = () => {
        if (text.trim()) {
            onSend(text.trim());
            setText('');
        }
    };

    return (
        <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={text}
                    onChangeText={setText}
                    placeholder="Talk to Hita..."
                    placeholderTextColor={theme.colors.text.secondary}
                    multiline
                    maxLength={500}
                    editable={!disabled}
                />
                <TouchableOpacity
                    style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
                    onPress={handleSend}
                    disabled={!text.trim() || disabled}
                >
                    {/* Simple arrow or text. Using Text for reliability if icons missing */}
                    <Text style={styles.sendButtonText}>↑</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

interface Props {
    onSend: (text: string) => void;
    disabled?: boolean;
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: theme.spacing.m,
        backgroundColor: 'transparent',
        paddingTop: theme.spacing.s,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: theme.colors.ui.inputBackground,
        borderRadius: theme.borderRadius.xl, // Pill shape
        padding: 6, // Space between edge and content
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.02)',
    },
    input: {
        flex: 1,
        paddingHorizontal: theme.spacing.m,
        paddingVertical: 10,
        minHeight: 44,
        maxHeight: 120,
        ...theme.typography.user, // User types in Sans
        color: theme.colors.text.primary,
        fontSize: 16,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20, // Circle
        backgroundColor: theme.colors.text.primary, // Black button (Pi style)
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 0, // Aligned by flex-end container
        marginLeft: 8,
    },
    sendButtonDisabled: {
        backgroundColor: theme.colors.chat.bubbleUser,
    },
    sendButtonText: {
        color: theme.colors.text.light,
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 2, // Optical center adjustment
    },
});
