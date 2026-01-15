import { useCallback, useState } from 'react';
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

    const fetchHitaReply = async (userMessage: string): Promise<{ reply: string; uiAction?: any }> => {
        try {
            // Retrieve or generate a session ID. For now, we'll use a static one or generate one per app session.
            //Ideally this would be persisted, but user asked for lightweight session memory.
            const sessionId = 'mobile-session-1';

            // Using local IP to avoid localhost binding issues on Simulator
            const response = await fetch('http://192.168.1.8:3000/chat', {
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
            return { reply: data.reply, uiAction: data.uiAction };
        } catch (error) {
            console.error("Backend Call Failed:", error);
            return { reply: "Sorry, I'm having trouble connecting to my brain right now." };
        }
    };

    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim()) return;

        // 1. Add User Message
        addMessage(text, 'user');

        // 2. Set Typing State
        setIsTyping(true);

        try {
            // 3. Fetch Response (Simulated Backend Call)
            const { reply, uiAction } = await fetchHitaReply(text);

            // 4. Add Hita's Response
            addMessage(reply, 'hita', uiAction);
        } catch (error) {
            console.error('Failed to send message:', error);
            // 5. Minimal Error Handling (Fallback Message)
            addMessage("Sorry, something went wrong. Can you try again?", 'hita');
        } finally {
            setIsTyping(false);
        }
    }, [addMessage]);

    return {
        messages,
        isTyping,
        sendMessage,
    };
};
