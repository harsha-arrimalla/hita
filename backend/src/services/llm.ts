import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("GENAI_API_KEY is not set in .env");
}

export const genAI = new GoogleGenerativeAI(apiKey || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
// const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // This line is moved inside generateReply

export interface Message {
    role: 'user' | 'model';
    parts: string;
}

import { HITA_SYSTEM_PROMPT } from '../prompts/hita.system.js';

export async function generateReply(messages: Message[], context?: string, systemContext?: string): Promise<string> {
    try {

        const chat = model.startChat({
            history: messages.map(m => ({
                role: m.role,
                parts: [{ text: m.parts }]
            })),
            generationConfig: {
                maxOutputTokens: 150, // Keep it short
            }
        });

        // We need to pop the last message to send it to .sendMessage, and use the rest as history.

        const historyForGemini = [...messages];
        const lastMessage = historyForGemini.pop();

        if (!lastMessage || lastMessage.role !== 'user') {
            throw new Error("Invalid history: Last message must be from user.");
        }

        const chatSession = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: `System Instruction: ${HITA_SYSTEM_PROMPT}\n\nReal-time Safety Data: ${systemContext || "None"}\n\nStatic Context: ${context || "None"}` }]
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I am Hita, your calm travel companion. I will follow these rules." }]
                },
                ...historyForGemini.map(m => ({
                    role: m.role,
                    parts: [{ text: m.parts }]
                }))
            ]
        });

        const result = await chatSession.sendMessage(lastMessage.parts);
        const response = result.response;
        return response.text();

    } catch (error) {
        console.error("LLM Generation Error:", error);
        throw error;
    }
}
