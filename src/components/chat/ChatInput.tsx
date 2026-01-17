import React, { useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VoiceManager } from '../../services/VoiceManager';
import { theme } from '../../theme';

export const ChatInput: React.FC<Props> = ({ onSend, disabled }) => {
    const [text, setText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const insets = useSafeAreaInsets();

    const handleSend = () => {
        if (text.trim()) {
            onSend(text.trim());
            setText('');
        }
    };

    // [VOICE] Hold to Record
    const startRecording = async () => {
        console.log("ChatInput: Mic Button Pressed (Start)");
        setIsRecording(true);
        const success = await VoiceManager.startRecording();
        if (!success) {
            console.log("ChatInput: Recording Failed to Start");
            setIsRecording(false); // Revert if failed
        }
    };

    const stopRecording = async () => {
        console.log("ChatInput: Mic Button Pressed (Stop)");
        setIsRecording(false);
        setIsProcessing(true); // Show spinner
        const uri = await VoiceManager.stopRecording();
        if (uri) {
            console.log("Audio Recorded at:", uri);
            const result = await VoiceManager.uploadAudio(uri);
            setIsProcessing(false); // Hide spinner
            if (result && result.transcription) {
                // Pass transcription, AI's reply, AND any UI Action (Card) to the parent
                onSend(result.transcription, result.replies, result.uiAction);
            } else {
                onSend("[Audio Failed] ❌");
            }
        } else {
            console.log("ChatInput: Stop Recording returned null URI");
        }
    };

    return (
        <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.inputContainer}>

                {/* Text Input */}
                <TextInput
                    style={styles.input}
                    value={text}
                    onChangeText={setText}
                    placeholder={isRecording ? "Listening..." : "Talk to Hita..."}
                    placeholderTextColor={isRecording ? theme.colors.primary : theme.colors.text.secondary}
                    multiline
                    maxLength={500}
                    editable={!disabled && !isRecording}
                />

                {/* Dynamic Button: Mic (when empty) OR Send (when text) OR Spinner (when processing) */}
                {isProcessing ? (
                    <View style={[styles.micButton, styles.micButtonProcessing]}>
                        <ActivityIndicator size="small" color={theme.colors.text.primary} />
                    </View>
                ) : text.trim() ? (
                    <TouchableOpacity
                        style={styles.sendButton}
                        onPress={handleSend}
                        disabled={disabled}
                    >
                        <Text style={styles.sendButtonText}>↑</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.micButton, isRecording && styles.micButtonActive]}
                        onPress={isRecording ? stopRecording : startRecording}
                        disabled={disabled}
                    >
                        <Text style={styles.micButtonText}>{isRecording ? '🔴' : '🎤'}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

interface Props {
    onSend: (text: string, voiceReplies?: string[], voiceUiAction?: any) => void;
    disabled?: boolean;
}

const styles = StyleSheet.create({
    // ... existing styles ...
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
        ...theme.typography.user,
        color: theme.colors.text.primary,
        fontSize: 16,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.text.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 0,
        marginLeft: 8,
    },
    sendButtonText: {
        color: theme.colors.text.light,
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    // [NEW] Mic Styles
    micButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.ui.border, // Subtle beige/grey
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 0,
        marginLeft: 8,
    },
    micButtonActive: {
        backgroundColor: '#FFE5E5', // Light red for active
        transform: [{ scale: 1.1 }]
    },
    micButtonProcessing: {
        backgroundColor: theme.colors.background, // Match bg or slight contrast
        borderWidth: 1,
        borderColor: theme.colors.ui.border
    },
    micButtonText: {
        fontSize: 20,
    }
});
