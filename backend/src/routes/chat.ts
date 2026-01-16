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

        // NEW: Trip Planner Trigger
        // If user wants to plan a trip or asks for cost, show the Planner Card
        // FIX: Do NOT trigger if the user has already provided a budget (indicating a form submission)
        if (!uiAction &&
            (lowerMsg.includes('plan') || lowerMsg.includes('trip') || lowerMsg.includes('vacation')) &&
            !lowerMsg.includes('already have') &&
            !lowerMsg.includes('budget of') // Prevent loop on form submission
        ) {
            // Attempt Basic Extraction
            let extractedDest = "Goa"; // Default
            let extractedOrigin = "";

            // Check "to [City]"
            const toMatch = message.match(/to\s+([a-zA-Z]+)/i);
            if (toMatch && toMatch[1]) extractedDest = toMatch[1];

            // Check "from [City]"
            const fromMatch = message.match(/from\s+([a-zA-Z]+)/i);
            if (fromMatch && fromMatch[1]) extractedOrigin = fromMatch[1];

            uiAction = {
                type: "trip_planner_card",
                data: {
                    destination: extractedDest,
                    origin: extractedOrigin
                }
            };
            systemContext += `\n[UI TRIGGER] Displaying Trip Planner Form. Pre-filled -> Destination: ${extractedDest}, Origin: ${extractedOrigin}.\n`;
        }

        // C. Location Safety Check (CityBrain)
        let detectedCity = "";
        let detectedArea = "";

        if (lowerMsg.includes("goa")) {
            detectedCity = "Goa";
        }

        if (lowerMsg.includes("north goa") || lowerMsg.includes("baga") || lowerMsg.includes("calangute")) {
            detectedArea = "North Goa";
            detectedCity = "Goa"; // Infer city from area
        } else if (lowerMsg.includes("south goa") || lowerMsg.includes("palolem") || lowerMsg.includes("colva")) {
            detectedArea = "South Goa";
            detectedCity = "Goa";
        }

        // If we detected an area, ask CityBrain
        if (detectedArea) {
            const safetyZone = await cityBrain.getSafetyZone("Goa", detectedArea); // We only have Goa DB for now
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
        // Only inject if we are actually talking about Goa
        let staticContext = "";
        if (detectedCity === "Goa") {
            staticContext = `Trusted Data about Goa: ${goaData}`;
        }

        // 4. Construct conversation history
        const conversation: Message[] = [
            ...session.history,
            { role: 'user', parts: message }
        ];

        try {
            // 5. Call LLM with (Messages, StaticContext, SystemContext)
            let finalSystemContext = systemContext;

            // Force JSON for Trip Plans
            const isTripPlanRequest = lowerMsg.includes('budget of') && (lowerMsg.includes('plan') || lowerMsg.includes('trip'));
            if (isTripPlanRequest) {
                finalSystemContext += `\n[STRICT OUTPUT RULE]\nUser is asking for a concrete trip plan. You MUST output the result in RAW JSON format only. Do NOT use Markdown. Do NOT add intro text.\nStructure:\n{\n  "destination": "City Name",\n  "duration": "X Days",\n  "totalCost": "₹XX,XXX",\n  "itinerary": [\n    { "day": 1, "title": "Day Title", "activities": ["Morning: X", "Afternoon: Y", "Evening: Z"] }\n  ]\n}`;
            }

            const aiReply = await generateReply(conversation, staticContext, finalSystemContext);
            let uiActionReply = uiAction;
            let finalReply = aiReply;

            if (isTripPlanRequest) {
                try {
                    // Clean code blocks if present
                    const cleanJson = aiReply.replace(/```json/g, '').replace(/```/g, '').trim();
                    const planData = JSON.parse(cleanJson);

                    uiActionReply = {
                        type: "trip_result_card",
                        data: planData
                    };
                    finalReply = "Here is your custom itinerary! ✨"; // Override text
                } catch (e) {
                    console.error("Failed to parse Trip JSON", e);
                    // Fallback: Use the text as is, no card
                }
            }

            // 6. Update History
            session.history.push({ role: 'user', parts: message });
            session.history.push({ role: 'model', parts: finalReply });
            session.lastQuestion = message;

            // ... (keep history slicing) ...

            // 7. Parse Response into Bubbles (Simple split for text)
            const replies = finalReply.split('<PAUSE>').map(s => s.trim()).filter(s => s.length > 0);

            // 8. Return Response
            return {
                replies: replies,
                state: "active",
                uiAction: uiActionReply
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
