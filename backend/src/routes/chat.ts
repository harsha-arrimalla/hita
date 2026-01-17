import { FastifyInstance } from 'fastify';
import * as fs from 'fs';
import * as path from 'path';
import { cityBrain } from '../services/cityBrain.js';
import { fareGuard } from '../services/fareGuard.js';
import { geoAgent } from '../services/geoAgent.js';
import { hitaHeart } from '../services/hitaHeart.js';
import { generateReply, Message } from '../services/llm.js';
import { transitAgent } from '../services/transitAgent.js';
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

export async function chatRoutes(server: FastifyInstance) {
    server.post<{ Body: ChatRequest }>('/chat', async (request, reply) => {
        const { message, sessionId, userLocation, tripContext } = request.body;

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
            // Simple heuristic to assume trip context or explicitly mentioned city
            // For now, default to "Goa" or tripContext
            const city = tripContext?.city || "Goa";
            const weather = await weatherAgent.getWeather(city);
            if (weather) {
                uiAction = {
                    type: 'weather_card',
                    data: { ...weather, city }
                };
                systemContext += `\n[WEATHER AGENT] Current weather in ${city}: ${weather.temp}C, ${weather.condition}. Displayed WeatherCard.`;
            }
        }

        // A. Geo Agent Check (New Map Layer)
        // Heuristic: Check for location-seeking keywords or if explicit location data is sent
        // Valid intents: "show", "find", "near", "map", "where is", "cafes in"
        // Valid intents: "show", "find", "near", "map", "where is", "cafes in"
        // Expanded to capture typos and "best" queries
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
                lowerMsg.includes('rest') // Catch-all for restaurant, restuarant, restaraunt (matches "rest" but low risk if valid place)
            ))
        );

        // Debug Log
        console.log(`Msg: "${lowerMsg}" -> isGeoIntent? ${isGeoIntent}`);

        if (!uiAction && isGeoIntent) {
            const geoAction = await geoAgent.process(message, userLocation, tripContext);
            if (geoAction) {
                // Check if we have real places from Overpass
                if ((geoAction as any).real_places) {
                    uiAction = {
                        type: "place_carousel",
                        data: (geoAction as any).real_places
                    };
                    systemContext += `\n[GEO INTELLIGENCE]\nI found ${((geoAction as any).real_places).length} real places near ${geoAction.center.label} matching the criteria. I have displayed them in the Places Carousel.\n`;
                } else {
                    // Fallback to map view if no specific list found (or if radius search failed)
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

            // [PROACTIVE AGENTS]
            // Fetch Safety & Transit Context for the destination provided (or default "Goa")
            const targetCity = extractedDest || "Goa";

            // 1. Safety Check (General City Safety)
            // We use a heuristic area "City Center" or just the city name query
            const safetyInfo = await cityBrain.getSafetyZone(targetCity, "City Center");
            if (safetyInfo) {
                systemContext += `\n[PROACTIVE SAFETY] For ${targetCity}: Score ${safetyInfo.safetyScore}/10. Risks: ${safetyInfo.riskFactors}. Safe Havens: ${safetyInfo.safeHavens}. Include this safety advice in your plan.`;
            }

            // 2. Transit Advice (Airport -> City Center Default)
            const transitAdvice = await transitAgent.getRoute("Airport", "City Center", targetCity);
            if (transitAdvice) {
                const transitMsg = `\n[PROACTIVE TRANSIT] Best mode in ${targetCity}: ${transitAdvice.summary}. Frequency: ${transitAdvice.routes[0]?.frequency || 'N/A'}. Cost: ${transitAdvice.routes[0]?.cost || 'N/A'}. Include this transport advice in your plan.`;
                systemContext += transitMsg;
            }

            // 3. Weather Forecast (Current)
            const weather = await weatherAgent.getWeather(targetCity);
            if (weather) {
                systemContext += `\n[PROACTIVE WEATHER] Monitoring ${targetCity}: ${weatherAgent.getBriefSummary(weather)}. Alert user if it's raining or too hot for outdoor activities.`;
            }

            // [PERSISTENCE] Save this context for future turns (e.g. after user answers "how many days?")
            session.context.proactiveInfo = systemContext;
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
                    // [FIX] Handle XML Tool Code if standard JSON fails
                    if (aiReply.includes('tool_code')) {
                        // 1. Extract XML block
                        const xmlMatch = aiReply.match(/<travel_itinerary([\s\S]*?)>/);
                        if (xmlMatch) {
                            const attrString = xmlMatch[1];
                            const planData: any = {};

                            // 2. Parse Attributes (key="value")
                            const attrRegex = /(\w+)="([^"]*)"/g;
                            let match;
                            while ((match = attrRegex.exec(attrString)) !== null) {
                                planData[match[1]] = match[2];
                            }

                            // 3. Construct Itinerary Object from Attributes (Simple fallback)
                            // If the LLM didn't give full JSON array, we can't show the full timeline yet.
                            // But we can show the "Result Card" with summary.

                            uiActionReply = {
                                type: "trip_result_card", // or trip_planner_card if just filling form
                                data: {
                                    destination: planData.destination,
                                    duration: planData.duration + " Days",
                                    totalCost: "₹" + planData.budget,
                                    itinerary: [] // Empty itinerary for now if not provided in body
                                }
                            };
                            finalReply = aiReply.replace(/'''tool_code[\s\S]*?'''/g, '').replace(/```[\s\S]*?```/g, '').trim();
                        }
                    } else {
                        // Standard JSON Parsing
                        const cleanJson = aiReply.replace(/```json/g, '').replace(/```/g, '').trim();
                        const planData = JSON.parse(cleanJson);

                        uiActionReply = {
                            type: "trip_result_card",
                            data: planData
                        };
                        finalReply = "Here is your custom itinerary! ✨";
                    }
                } catch (e) {
                    console.error("Failed to parse Trip Data", e);
                    // Fallback: Strip code anyway if present
                    finalReply = aiReply.replace(/'''tool_code[\s\S]*?'''/g, '').replace(/```[\s\S]*?```/g, '').trim();
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
