
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export class VoiceAgentService {
    private model;

    constructor() {
        // Use Gemini 2.0 Flash for best multimodal performance
        this.model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    }

    async processAudio(audioBuffer: Buffer, mimeType: string = 'audio/m4a'): Promise<string> {
        try {
            console.log("VoiceAgent: Sending audio to Gemini...");

            // Convert buffer to base64
            const audioBase64 = audioBuffer.toString('base64');

            const result = await this.model.generateContent([
                {
                    inlineData: {
                        mimeType: mimeType,
                        data: audioBase64
                    }
                },
                { text: "Listen to this audio. Transcribe it accurately and then respond to it as Hita (friendly, calm travel companion). Output strictly valid JSON. Format: { \"transcription\": \"(user's words)\", \"reply\": \"(your plain text response)\" }. IMPORTANT: The 'reply' must be a plain string, NOT a JSON object." }
            ]);

            const responseText = result.response.text();
            console.log("VoiceAgent: Gemini Response:", responseText);

            return responseText;
        } catch (error) {
            console.error("VoiceAgent Error:", error);
            throw new Error("Failed to process audio.");
        }
    }

    // [NEW] Text-Only Transcription Mode
    async transcribe(audioBuffer: Buffer, mimeType: string = 'audio/m4a'): Promise<string> {
        try {
            // Convert buffer to base64
            const audioBase64 = audioBuffer.toString('base64');

            const result = await this.model.generateContent([
                {
                    inlineData: {
                        mimeType: mimeType,
                        data: audioBase64
                    }
                },
                { text: "Transcribe this audio verbatim. Output ONLY the transcription text. Do not add any preamble, json or quotes." }
            ]);

            const text = result.response.text().trim();
            console.log("VoiceAgent: Transcription:", text);
            return text;
        } catch (error) {
            console.error("Transcribe Error:", error);
            throw new Error("Transcription Failed");
        }
    }
}

export const voiceAgent = new VoiceAgentService();
