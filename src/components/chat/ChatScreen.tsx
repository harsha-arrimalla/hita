import React, { useEffect, useRef } from 'react';
import {
    FlatList,
    Image,
    KeyboardAvoidingView,
    StatusBar as NativeStatusBar,
    Platform,
    StyleSheet,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChat } from '../../hooks/useChat';
import { theme } from '../../theme';
import { ChatInput } from './ChatInput';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';

export const ChatScreen: React.FC = () => {
    const { messages, isTyping, sendMessage } = useChat();
    const flatListRef = useRef<FlatList>(null);
    const navigation = useNavigation();

    useEffect(() => {
        if (messages.length > 0 || isTyping) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages, isTyping]);

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            {/* Light status bar for the warm background */}
            <NativeStatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
                    style={styles.menuButton}
                >
                    <Ionicons name="menu-outline" size={28} color={theme.colors.text.primary} />
                </TouchableOpacity>
                {/* Replaced text with Logo Image */}
                <Image
                    source={require('../../../assets/images/hita-splash.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <View style={styles.placeholderButton} />
            </View>

            <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <MessageBubble message={item} />}
                    contentContainerStyle={styles.listContent}
                    style={styles.list}
                    ListFooterComponent={
                        isTyping ? (
                            <View style={styles.typingContainer}>
                                <TypingIndicator />
                            </View>
                        ) : null
                    }
                    showsVerticalScrollIndicator={false}
                />

                <ChatInput onSend={sendMessage} disabled={isTyping} />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background, // Warm beige
    },
    header: {
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.s,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
        minHeight: 50,
    },
    menuButton: {
        padding: 8,
        marginLeft: -8,
    },
    placeholderButton: {
        width: 44,
    },
    logo: {
        width: 120, // Adjust for visible logo size (splash is usually large, so contain will help)
        height: 40,
    },
    keyboardContainer: {
        flex: 1,
    },
    list: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: theme.spacing.s, // Less side padding for bubbles to float nicely
        paddingTop: theme.spacing.m,
        paddingBottom: 100, // Space for floating input
        flexGrow: 1,
    },
    typingContainer: {
        marginTop: theme.spacing.s,
        marginBottom: theme.spacing.m,
    },
});
