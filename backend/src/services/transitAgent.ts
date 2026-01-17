
import { genAI } from './llm.js';

export interface TransitRoute {
    mode: 'Metro' | 'Bus' | 'Train' | 'Ferry' | 'Tram' | 'Walk';
    line?: string;
    from: string;
    to: string;
    duration: string;
    cost: string;
    deepLink: string;
    frequency?: string;
    operatingHours?: string;
    safetyTip?: string;
}

export interface TransitAction {
    action: 'show_transit_route';
    routes: TransitRoute[];
    summary: string;
}

export class TransitAgentService {
    private model;

    constructor() {
        this.model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: { responseMimeType: "application/json" }
        });
    }

    /**
     * Generates a Google Maps Transit Deep Link
     */
    private generateDeepLink(origin: string, destination: string): string {
        const o = encodeURIComponent(origin);
        const d = encodeURIComponent(destination);
        return `https://www.google.com/maps/dir/?api=1&origin=${o}&destination=${d}&travelmode=transit`;
    }

    /**
     * Uses GenAI to find the best public transport route.
     * PRIORITIZES GOVERNMENT TRANSPORT (Metro, Public Bus).
     */
    async getRoute(origin: string, destination: string, city: string): Promise<TransitAction | null> {
        try {
            console.log(`🚇 Transit Agent: Routing ${origin} -> ${destination} in ${city}`);

            const prompt = `
            You are a expert travel logistics agent.
            The user wants to go from "${origin}" to "${destination}" (Context: ${city}).

            **DECISION LOGIC:**
            1. **Intra-city (Within same city):** Prioritize Metro, Public Bus, Local Train. Cheap & Reliable.
            2. **Inter-city (Between cities):**
               - If distance > 400km OR travel time > 6 hours: **Prioritize FLIGHT or FAST TRAIN** to save time.
               - ONLY suggest Bus if Cost is the main constraint or no other option exists.

            **Your Goal:** Recommend the option that balances Speed and Comfort for a traveler on a short trip. 
            (e.g. Hyderabad to Goa -> Suggest Flight (~1h) or Vande Bharat Train, NOT a 14h Bus).

            Return a detailed JSON object with:
            - summary: Simple instruction (e.g. "Take a direct Flight (1h) to save time.")
            - routes: Array of 1 best option. Route object:
                - mode: "Flight", "Train", "Bus", "Metro", "Ferry"
                - line: Airline or Train Name (e.g. "IndiGo", "Vande Bharat")
                - from: Origin Airport/Station
                - to: Destination Airport/Station
                - duration: Approx time
                - cost: Approx price in local currency
                - frequency: e.g. "Daily", "Every 10 mins"
                - operatingHours: e.g. "6 AM - 11 PM"
                - safetyTip: A short tip (e.g. "Book in advance", "Crowded at peak hours")
            
            Valid JSON only.
            `;

            const result = await this.model.generateContent(prompt);
            const responseText = result.response.text();
            const data = JSON.parse(responseText);

            // Enhance with Deep Link
            const deepLink = this.generateDeepLink(`${origin}, ${city}`, `${destination}, ${city}`);

            // Form final action
            return {
                action: 'show_transit_route',
                summary: data.summary,
                routes: data.routes.map((r: any) => ({
                    ...r,
                    deepLink: deepLink // All options route to same map query for now
                }))
            };

        } catch (error) {
            console.error("Transit Agent Error:", error);
            return null;
        }
    }
}

export const transitAgent = new TransitAgentService();
