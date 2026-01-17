import { useCallback, useRef, useState } from 'react';
import { Message } from '../types/message';

const INITIAL_MESSAGES: Message[] = [];

// Helper to generate IDs
const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2);

// Simulated delays (ms)
const THINKING_MIN = 600;
const THINKING_MAX = 900;

export const useChat = () => {
    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
    const [isTyping, setIsTyping] = useState(false);

    const addMessage = useCallback((text: string, sender: 'user' | 'hita', uiAction?: any) => {
        const newMessage: Message = {
            id: generateId(),
            text,
            sender,
            timestamp: Date.now(),
            uiAction
        };
        setMessages((prev) => [...prev, newMessage]);
    }, []);

    // Generate a unique session ID per app refresh to avoid context leakage during dev
    // In prod, this would be stored in AsyncStorage
    // Generate a unique session ID per app refresh to avoid context leakage during dev
    // In prod, this would be stored in AsyncStorage
    const sessionIdRef = useRef(`session-${Date.now()}`);

    const fetchHitaReply = async (userMessage: string): Promise<{ replies: string[]; uiAction?: any }> => {
        try {
            // Use the unique session ID
            const sessionId = sessionIdRef.current;

            // [DEVELOPMENT] Using Local Backend
            const response = await fetch('http://localhost:3000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    sessionId: sessionId
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            // Backend now returns { replies: string[], uiAction: ... }
            // Fallback for older backend versions: data.reply -> [data.reply]
            const replies = data.replies || (data.reply ? [data.reply] : []);
            return { replies, uiAction: data.uiAction };
        } catch (error) {
            console.error("Backend Call Failed:", error);
            return { replies: ["Sorry, I'm having trouble connecting to my brain right now."] };
        }
    };

    const sendMessage = useCallback(async (text: string, voiceReplies?: string[], voiceUiAction?: any) => {
        if (!text.trim()) return;

        // 1. Add User Message (Transcription)
        addMessage(text, 'user');

        // 2. Set Typing State
        setIsTyping(true);

        try {
            let replies: string[] = [];
            let uiAction: any = undefined;

            if (voiceReplies) {
                // Voice Mode: We already have the replies and potential UI Action!
                replies = voiceReplies;
                uiAction = voiceUiAction;
            } else {
                // Text Mode: Fetch from Backend
                const response = await fetchHitaReply(text);
                replies = response.replies;
                uiAction = response.uiAction;
            }

            // 4. Staggered Response (The "Human" Pause)
            // We want to show messages one by one with a delay
            setIsTyping(false);

            // Loop through replies
            for (let i = 0; i < replies.length; i++) {
                // Simulate "reading/typing" pause between bubbles
                if (i > 0) {
                    setIsTyping(true);
                    await new Promise(resolve => setTimeout(resolve, 600));
                }

                setIsTyping(false);

                // Attach UI Action only to the LAST message
                const isLast = i === replies.length - 1;
                const actionToAttach = isLast ? uiAction : undefined;

                addMessage(replies[i], 'hita', actionToAttach);
            }

        } catch (error) {
            console.error('Failed to send message:', error);
            setIsTyping(false);
            addMessage("Sorry, something went wrong. Can you try again?", 'hita');
        }
    }, [addMessage]);

    return {
        messages,
        isTyping,
        sendMessage,
    };
};

export type UseChatReturn = {
    messages: Message[];
    isTyping: boolean;
    sendMessage: (text: string, voiceReplies?: string[], voiceUiAction?: any) => void;
};
