import { FastifyInstance } from 'fastify';
import * as fs from 'fs';
import * as path from 'path';
import { cityBrain } from '../services/cityBrain.js';
import { fareGuard } from '../services/fareGuard.js';
import { geoAgent } from '../services/geoAgent.js';
import { hitaHeart } from '../services/hitaHeart.js';
import { generateReply, Message } from '../services/llm.js';
import { transitAgent } from '../services/transitAgent.js';
import { voiceAgent } from '../services/voiceAgent.js';
import { weatherAgent } from '../services/weatherAgent.js';
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

// Helper Function: Core Chat Logic
// This unifies Text and Voice processing so they share the same intelligence.
async function processUserMessage(
    message: string,
    sessionId: string,
    userLocation: any,
    tripContext: any
) {
    if (!message || !sessionId) {
        throw new Error("Missing message or sessionId");
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
    let systemContext = session.context.proactiveInfo || ""; // [PERSISTENCE] Reinject proactive memory
    let uiAction: any = null; // Structured payload for Frontend

    // [NEW] TRANSIT AGENT INTENT
    const isTransitIntent = (
        lowerMsg.includes('bus') ||
        lowerMsg.includes('metro') ||
        lowerMsg.includes('train') ||
        lowerMsg.includes('ferry') ||
        lowerMsg.includes('tram') ||
        (lowerMsg.includes('route') && (lowerMsg.includes('to') || lowerMsg.includes('from'))) ||
        lowerMsg.includes('how to reach') ||
        lowerMsg.includes('how do i get to')
    );

    if (isTransitIntent) {
        const city = tripContext?.city || "Current City";
        const routeData = await transitAgent.getRoute("User Location", message, city);
        if (routeData) {
            uiAction = {
                type: 'transit_card',
                data: routeData.routes[0] // Just show primary route for now
            };
            systemContext += `\n[Transit Agent]: Found route: ${routeData.summary}. Shown TransitCard.`;
        }
    }

    // [NEW] WEATHER INTENT
    const isWeatherIntent = lowerMsg.includes('weather') || lowerMsg.includes('temperature') || lowerMsg.includes('rain') || lowerMsg.includes('forecast');

    if (!uiAction && isWeatherIntent) {
        // Extract city ?
        // 1. Try to extract from message "in London", "for Paris"
        let targetCity = tripContext?.city || "Goa";
        const cityMatch = message.match(/(?:in|for|at)\s+([a-zA-Z]+)/i);
        if (cityMatch && cityMatch[1]) {
            targetCity = cityMatch[1];
        }

        const city = targetCity;
        const weather = await weatherAgent.getWeather(city);
        if (weather) {
            uiAction = {
                type: 'weather_card',
                data: { ...weather, city }
            };
            systemContext += `\n[WEATHER AGENT] Current weather in ${city}: ${weather.temp}C, ${weather.condition}. Displayed WeatherCard. \n[INSTRUCTION] Give a warm, friendly comment about the weather. Mention if it's nice for a walk, or better to stay indoors. Avoid generic phrases like "Check this out".`;
        }
    }

    // A. Geo Agent Check (New Map Layer)
    const isGeoIntent = (
        lowerMsg.includes('show') ||
        lowerMsg.includes('find') ||
        lowerMsg.includes('near') ||
        lowerMsg.includes('map') ||
        lowerMsg.includes('where is') ||
        lowerMsg.includes('best') || // "Best X in Y"
        lowerMsg.includes('visit') ||
        (lowerMsg.includes('in') && (
            lowerMsg.includes('cafe') ||
            lowerMsg.includes('food') ||
            lowerMsg.includes('hotel') ||
            lowerMsg.includes('rest') // Catch-all
        ))
    );

    console.log(`Msg: "${lowerMsg}" -> isGeoIntent? ${isGeoIntent}`);

    if (!uiAction && isGeoIntent) {
        const geoAction = await geoAgent.process(message, userLocation, tripContext);
        if (geoAction) {
            if ((geoAction as any).real_places) {
                uiAction = {
                    type: "place_carousel",
                    data: (geoAction as any).real_places
                };
                systemContext += `\n[GEO INTELLIGENCE]\nI found ${((geoAction as any).real_places).length} real places near ${geoAction.center.label} matching the criteria. I have displayed them in the Places Carousel.\n`;
            } else {
                uiAction = {
                    type: "map_view",
                    data: geoAction
                };
                systemContext += `\n[GEO INTELLIGENCE]\nUser asked for location info. I have generated a map action for: ${JSON.stringify(geoAction.filters.osm_tags)}. Center: ${geoAction.center.label}.\n`;
            }
        }
    }

    // B. Emotional Check (HitaHeart)
    const detectedEmotion = hitaHeart.detectEmotion(message);
    if (detectedEmotion) {
        const script = await hitaHeart.getEmotionalScript(detectedEmotion);
        if (script) {
            systemContext += `\n[EMOTIONAL INTERVENTION REQUIRED]\nUser is feeling: ${detectedEmotion}.\nIMMEDIATE ACTION: Use this de-escalation script guide: "${script.responseText}".\nType: ${script.actionType}.\n`;

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
    if (!uiAction && (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('fare') || lowerMsg.includes('how much') || lowerMsg.includes('taxi') || lowerMsg.includes('auto'))) {
        const benchmarks = await fareGuard.getFareBenchmarks("Goa");
        if (benchmarks.length > 0) {
            const fareInfo = fareGuard.formatBenchmarks(benchmarks);
            systemContext += `\n[FINANCIAL GUARD]\n${fareInfo}`;
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

    // Initialize extraction variables
    let extractedDest = tripContext?.city || "Goa";
    let extractedOrigin = tripContext?.origin || "Hyderabad";
    let extractedBudget = "";
    let extractedDays = tripContext?.days || "";
    let hasSufficientInfo = false;

    // NEW: Trip Planner Trigger
    if (!uiAction &&
        (lowerMsg.includes('plan') || lowerMsg.includes('trip') || lowerMsg.includes('vacation')) &&
        !lowerMsg.includes('already have') &&
        !lowerMsg.includes('budget of')
    ) {
        const destMatch = message.match(/(?:to|in)\s+([a-zA-Z]+)/i);
        if (destMatch && destMatch[1]) extractedDest = destMatch[1];
        const fromMatch = message.match(/from\s+([a-zA-Z]+)/i);
        if (fromMatch && fromMatch[1]) extractedOrigin = fromMatch[1];
        const budgetMatch = message.match(/(?:under|budget|cost|for)\s*([₹$]?)(\d+(?:k)?)/i) || message.match(/\b(\d+k)\b/i) || message.match(/\b(\d+)\s*rupees?/i);
        if (budgetMatch) {
            extractedBudget = budgetMatch[2] || budgetMatch[1] || budgetMatch[0];
            let numBudget = parseInt(extractedBudget.toLowerCase().replace('k', '000').replace(/[^0-9]/g, ''));
            if (numBudget < 1000 && numBudget > 0) {
                systemContext += `\n[REALITY CHECK FAIL] User budget is ${numBudget} INR. This is impossibly low. DO NOT PLAN. Instead, roast them gently (e.g. "Bro, that won't even buy a vada pav").`;
                hasSufficientInfo = false;
            }
        }
        const daysMatch = message.match(/(\d+)\s*days?/i) || message.match(/^(\d+)$/);
        if (daysMatch && daysMatch[1]) extractedDays = daysMatch[1];
        hasSufficientInfo = !!(extractedDest && extractedDest !== "Current City" && extractedDays);

        if (hasSufficientInfo) {
            systemContext += `\n[UI TRIGGER] User provided full details (Dest: ${extractedDest}, Days: ${extractedDays}). generating PLAN directly.\n`;
        } else {
            let missingFields = [];
            if (!extractedDest || extractedDest === "Goa") missingFields.push("Destination");
            if (!extractedDays) missingFields.push("Duration (how many days)");
            systemContext += `\n[PLANNING INSTRUCTION] User wants to plan a trip but details are missing. missing: ${missingFields.join(", ")}. Ask for these details naturally. Do NOT show a form.`;
        }

        const targetCity = extractedDest || "Goa";
        const safetyInfo = await cityBrain.getSafetyZone(targetCity, "City Center");
        if (safetyInfo) systemContext += `\n[PROACTIVE SAFETY] For ${targetCity}: Score ${safetyInfo.safetyScore}/10. Risks: ${safetyInfo.riskFactors}. Safe Havens: ${safetyInfo.safeHavens}. Include this safety advice in your plan.`;
        const transitAdvice = await transitAgent.getRoute("Airport", "City Center", targetCity);
        if (transitAdvice) systemContext += `\n[PROACTIVE TRANSIT] Best mode in ${targetCity}: ${transitAdvice.summary}. Frequency: ${transitAdvice.routes[0]?.frequency || 'N/A'}. Cost: ${transitAdvice.routes[0]?.cost || 'N/A'}. Include this transport advice in your plan.`;
        if (lowerMsg.includes('airport') || lowerMsg.includes('flight')) systemContext += `\n[TRAFFIC GUARD ALERT] Detected "Airport Run". Traffic is unusually high on the main highway (+45 mins delay). ADVISE USER TO LEAVE 1 HOUR EARLY. Do not ignore this.`;
        if (lowerMsg.includes('woman') || lowerMsg.includes('girl') || lowerMsg.includes('female') || lowerMsg.includes('safe for women') || lowerMsg.includes('solo')) systemContext += `\n[SAFETY CONTEXT: WOMEN]\nUser is a woman/solo traveler. ACTIVATE "GUARDIAN MODE".\n1. Be specific: Name specific safe streets/areas, not just "crowded places".\n2. Transport: Suggest Uber/BluSmart (trackable) over random autos.\n3. Tone: Protective, big sister vibe. Validating.`;
        const weather = await weatherAgent.getWeather(targetCity);
        if (weather) systemContext += `\n[PROACTIVE WEATHER] Monitoring ${targetCity}: ${weatherAgent.getBriefSummary(weather)}. Alert user if it's raining or too hot for outdoor activities.`;
        session.context.proactiveInfo = systemContext;
    }

    // C. Location Safety Check (CityBrain)
    let detectedCity = "";
    let detectedArea = "";
    if (lowerMsg.includes("goa")) detectedCity = "Goa";
    if (lowerMsg.includes("north goa") || lowerMsg.includes("baga") || lowerMsg.includes("calangute")) { detectedArea = "North Goa"; detectedCity = "Goa"; }
    else if (lowerMsg.includes("south goa") || lowerMsg.includes("palolem") || lowerMsg.includes("colva")) { detectedArea = "South Goa"; detectedCity = "Goa"; }

    if (detectedArea) {
        const safetyZone = await cityBrain.getSafetyZone("Goa", detectedArea);
        if (safetyZone) {
            systemContext += `\n[SAFETY ALERT]\nLocation: ${detectedArea}. Score: ${safetyZone.safetyScore}/10. Risks: ${safetyZone.riskFactors}. Safe Havens: ${safetyZone.safeHavens}.\n`;
            if (!uiAction) {
                let parsedRisks: string[] = [];
                let parsedHavens: string[] = [];
                try { parsedRisks = JSON.parse(safetyZone.riskFactors); } catch (e) { }
                try { parsedHavens = JSON.parse(safetyZone.safeHavens); } catch (e) { }
                uiAction = { type: "safety_card", data: { location: detectedArea, score: safetyZone.safetyScore, risks: parsedRisks, safeHavens: parsedHavens } };
            }
        }
    }

    // 3. Static Context
    let staticContext = "";
    if (detectedCity === "Goa") staticContext = `Trusted Data about Goa: ${goaData}`;

    // 4. Construct conversation history
    const conversation: Message[] = [
        ...session.history,
        { role: 'user', parts: message }
    ];

    // [NEW] ADAPTIVE OBSERVER LAYER
    try {
        const hour = new Date().getHours();
        let timeOfDay = "Morning";
        if (hour >= 12 && hour < 16) timeOfDay = "Afternoon (Likely Hot)";
        else if (hour >= 16 && hour < 19) timeOfDay = "Evening (Golden Hour)";
        else if (hour >= 19) timeOfDay = "Night";
        const isTired = message.toLowerCase().includes("tired") || message.toLowerCase().includes("walking") || session.history.length > 15;
        const isFuturePlanContext = (lowerMsg.includes('plan') || lowerMsg.includes('trip') || lowerMsg.includes('vacation')) && lowerMsg.includes('days');
        let observerContext = "";
        if (isFuturePlanContext) {
            observerContext = `\n[PLANNING CONTEXT]\nThis is a FUTURE trip plan. Ignore current real-time. Assume Day 1 starts in the Morning (9:00 AM). User is Fresh (Not tired).`;
        } else {
            observerContext = `\n[REAL-TIME OBSERVER]\nTime: ${new Date().toLocaleTimeString()} (${timeOfDay}).\nUser Fatigue: ${isTired ? "HIGH -> Suggest Low Energy Activities" : "NORMAL"}.`;
        }
        const cityForWeather = tripContext?.city || (detectedCity === "Goa" ? "Goa" : null);
        if (cityForWeather) {
            const w = await weatherAgent.getWeather(cityForWeather);
            if (w) {
                if (isFuturePlanContext) observerContext += `\n(Reference Only) Current Weather in ${cityForWeather}: ${w.temp}°C, ${w.condition}.`;
                else {
                    observerContext += `\nWeather in ${cityForWeather}: ${w.temp}°C, ${w.condition}.`;
                    if (w.temp > 30) observerContext += ` (HEAT ALERT: Prioritize AC/Shade)`;
                    if (w.condition.toLowerCase().includes("rain")) observerContext += ` (RAIN ALERT: Prioritize Indoors)`;
                }
            }
        }
        systemContext += observerContext;
    } catch (e) { console.error("Observer Error", e); }

    try {
        // 5. Call LLM
        let finalSystemContext = systemContext;
        const historyText = session.history.map(m => m.parts).slice(-3).join(' ').toLowerCase();
        const isTripPlanRequest = (lowerMsg.includes('budget of') || hasSufficientInfo) && (
            lowerMsg.includes('plan') || lowerMsg.includes('trip') || lowerMsg.includes('vacation') || lowerMsg.includes('itinerary') || historyText.includes('itinerary')
        );
        if (isTripPlanRequest) {
            finalSystemContext += `\n[STRICT OUTPUT RULE]\nUser is asking for a concrete trip plan. You MUST output the result in RAW JSON format only. Do NOT use Markdown. Do NOT add intro text.\nStructure:\n{\n  "currentCondition": { "temp": "XX°C", "condition": "Sunny/Rainy", "icon": "Emoji", "advice": "Short advice" },\n  "timeline": [\n    { "time": "Now/Late", "title": "Activity Name", "type": "indoor|outdoor|food|rest", "reason": "Why? (e.g. Too Hot)" }\n  ]\n}`;
        }

        const aiReply = await generateReply(conversation, staticContext, finalSystemContext);
        let uiActionReply = uiAction;
        let finalReply = aiReply;

        if (isTripPlanRequest) {
            try {
                if (aiReply.includes('tool_code')) {
                    const xmlMatch = aiReply.match(/<travel_itinerary([\s\S]*?)>/);
                    if (xmlMatch) {
                        const attrString = xmlMatch[1];
                        const planData: any = {};
                        const attrRegex = /(\w+)="([^"]*)"/g;
                        let match;
                        while ((match = attrRegex.exec(attrString)) !== null) planData[match[1]] = match[2];
                        uiActionReply = { type: "trip_result_card", data: { destination: planData.destination, duration: planData.duration + " Days", totalCost: "₹" + planData.budget, itinerary: [] } };
                        finalReply = aiReply.replace(/'''tool_code[\s\S]*?'''/g, '').replace(/```[\s\S]*?```/g, '').trim();
                    }
                } else {
                    const cleanJson = aiReply.replace(/```json/g, '').replace(/```/g, '').trim();
                    const planData = JSON.parse(cleanJson);
                    uiActionReply = { type: "adaptive_plan_card", data: planData };
                    finalReply = "Here is your custom itinerary! ✨";
                }
            } catch (e) { console.error("Failed to parse Trip Data", e); finalReply = aiReply.replace(/'''tool_code[\s\S]*?'''/g, '').replace(/```[\s\S]*?```/g, '').trim(); }
        }

        // 6. Update History
        session.history.push({ role: 'user', parts: message });
        session.history.push({ role: 'model', parts: finalReply });
        session.lastQuestion = message;

        const replies = finalReply.split('<PAUSE>').map(s => s.trim()).filter(s => s.length > 0);

        return {
            replies: replies,
            state: "active",
            uiAction: uiActionReply
        };

    } catch (error) {
        console.error(error);
        return {
            replies: ["Sorry, I had a small issue connecting to my brain. Can you try saying that again?"],
            state: "error",
            uiAction: null
        };
    }
}

export async function chatRoutes(server: FastifyInstance) {
    // [MOD] Voice Endpoint using Unified Logic
    server.post('/chat/voice', async (request, reply) => {
        try {
            const data = await request.file();
            if (!data) return reply.code(400).send({ error: "No audio file uploaded" });

            const buffer = await data.toBuffer();

            // 1. Transcribe Only
            const transcription = await voiceAgent.transcribe(buffer, data.mimetype);

            // 2. Process via Main Brain
            // Use a temporary session ID or reuse if passed in query? 
            // Ideally frontend sends session ID in multipart fields, but for now we default to 'voice-session'.
            // Actually, we should ask frontend to send sessionId.
            // As fallback, use 'voice-session-global'.

            // Extract fields from parts if possible. Fastify multipart makes this tricky if mixed.
            // Simplified: Use 'voice-session' for now.
            const voiceSessionId = "voice-session-user";

            const result = await processUserMessage(transcription, voiceSessionId, null, null);

            return {
                transcription: transcription,
                replies: result.replies,
                uiAction: result.uiAction, // Pass the Card Data Check weather/transit etc
                state: result.state
            };

        } catch (error) {
            console.error("Voice Handler Error:", error);
            return reply.code(500).send({ error: "Voice processing failed" });
        }
    });

    // [MOD] Chat Endpoint using Unified Logic
    server.post<{ Body: ChatRequest }>('/chat', async (request, reply) => {
        const { message, sessionId, userLocation, tripContext } = request.body;

        try {
            const result = await processUserMessage(message, sessionId, userLocation, tripContext);
            return result;
        } catch (e: any) {
            return reply.code(500).send({ error: e.message });
        }
    });
}
