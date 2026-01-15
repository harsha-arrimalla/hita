import { FastifyInstance } from 'fastify';
import * as fs from 'fs';
import * as path from 'path';
import { cityBrain } from '../services/cityBrain.js';
import { fareGuard } from '../services/fareGuard.js';
import { hitaHeart } from '../services/hitaHeart.js';
import { generateReply, Message } from '../services/llm.js';
import { ChatRequest, SessionData } from '../types/chat.js';

// In-memory session store
const sessions = new Map<string, SessionData>();

// Load trusted data (simplest way: synchronous load at startup)
let goaData = "";
try {
    const dataPath = path.join(process.cwd(), 'src', 'data', 'cities', 'goa.json');
    const raw = fs.readFileSync(dataPath, 'utf-8');
    goaData = JSON.stringify(JSON.parse(raw));
} catch (e) {
    console.error("Could not load Goa data", e);
}

export async function chatRoutes(server: FastifyInstance) {
    server.post<{ Body: ChatRequest }>('/chat', async (request, reply) => {
        const { message, sessionId } = request.body;

        if (!message || !sessionId) {
            return reply.code(400).send({ error: "Missing message or sessionId" });
        }

        // 1. Load or Initialize Session
        let session = sessions.get(sessionId);
        if (!session) {
            session = {
                context: {},
                history: []
            };
            sessions.set(sessionId, session);
        }

        // 2. CityBrain Intelligence (Safety Check)
        const lowerMsg = message.toLowerCase();
        let systemContext = ""; // context from specialized engines
        let uiAction: any = null; // Structured payload for Frontend

        // A. Emotional Check (HitaHeart)
        const detectedEmotion = hitaHeart.detectEmotion(message);
        if (detectedEmotion) {
            const script = await hitaHeart.getEmotionalScript(detectedEmotion);
            if (script) {
                systemContext += `\n[EMOTIONAL INTERVENTION REQUIRED]\nUser is feeling: ${detectedEmotion}.\nIMMEDIATE ACTION: Use this de-escalation script guide: "${script.responseText}".\nType: ${script.actionType}.\n`;

                // Construct Therapy Card
                uiAction = {
                    type: "therapy_card",
                    data: {
                        mood: detectedEmotion.charAt(0).toUpperCase() + detectedEmotion.slice(1),
                        technique: script.actionType === 'breathing_exercise' ? 'Box Breathing' : 'Grounding',
                        steps: [
                            { label: "Inhale", duration: 4000 },
                            { label: "Hold", duration: 4000 },
                            { label: "Exhale", duration: 4000 },
                            { label: "Hold", duration: 4000 }
                        ],
                        script: script.responseText
                    }
                };
            }
        }

        // B. Financial Check (FareGuard)
        // Only trigger if no emotion detected to avoid clutter
        if (!uiAction && (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('fare') || lowerMsg.includes('how much') || lowerMsg.includes('taxi') || lowerMsg.includes('auto'))) {
            const benchmarks = await fareGuard.getFareBenchmarks("Goa"); // Default city for MVP
            if (benchmarks.length > 0) {
                const fareInfo = fareGuard.formatBenchmarks(benchmarks);
                systemContext += `\n[FINANCIAL GUARD]\n${fareInfo}`;

                // Construct Fare Card (using first benchmark for MVP)
                const b = benchmarks[0];
                uiAction = {
                    type: "fare_card",
                    data: {
                        transport: b.transportType,
                        location: b.cityName,
                        baseFare: Number(b.baseFare),
                        perKm: Number(b.perKmRate),
                        currency: b.currency,
                        warning: "Official Base Rate. Negotiate if higher."
                    }
                };
            }
        }

        // C. Location Safety Check (CityBrain)
        let detectedCity = "Goa"; // Default context for this MVP
        let detectedArea = "";

        if (lowerMsg.includes("north goa") || lowerMsg.includes("baga") || lowerMsg.includes("calangute")) {
            detectedArea = "North Goa";
        } else if (lowerMsg.includes("south goa") || lowerMsg.includes("palolem") || lowerMsg.includes("colva")) {
            detectedArea = "South Goa";
        }

        // If we detected an area, ask CityBrain
        if (detectedArea) {
            const safetyZone = await cityBrain.getSafetyZone(detectedCity, detectedArea);
            if (safetyZone) {
                systemContext += `\n[SAFETY ALERT]\nLocation: ${detectedArea}. Score: ${safetyZone.safetyScore}/10. Risks: ${safetyZone.riskFactors}. Safe Havens: ${safetyZone.safeHavens}.\n`;

                // Construct Safety Card (Only if no other critical card detected)
                if (!uiAction) {
                    let parsedRisks: string[] = [];
                    let parsedHavens: string[] = [];
                    try { parsedRisks = JSON.parse(safetyZone.riskFactors); } catch (e) { }
                    try { parsedHavens = JSON.parse(safetyZone.safeHavens); } catch (e) { }

                    uiAction = {
                        type: "safety_card",
                        data: {
                            location: detectedArea,
                            score: safetyZone.safetyScore,
                            risks: parsedRisks,
                            safeHavens: parsedHavens
                        }
                    };
                }
            }
        }

        // 3. Static Context (General City Info)
        const staticContext = `Trusted Data about Goa: ${goaData}`;

        // 4. Construct conversation history
        const conversation: Message[] = [
            ...session.history,
            { role: 'user', parts: message }
        ];

        try {
            // 5. Call LLM with (Messages, StaticContext, SystemContext)
            const aiReply = await generateReply(conversation, staticContext, systemContext);

            // 6. Update History
            session.history.push({ role: 'user', parts: message });
            session.history.push({ role: 'model', parts: aiReply });
            session.lastQuestion = message;

            // Keep history manageable (last 10 turns)
            if (session.history.length > 20) {
                session.history = session.history.slice(-20);
            }

            // 6. Return Response
            return {
                reply: aiReply,
                state: "active",
                uiAction: uiAction
            };

        } catch (error) {
            request.log.error(error);
            return {
                reply: "Sorry, I had a small issue connecting to my brain. Can you try saying that again?",
                state: "error"
            };
        }
    });
}
