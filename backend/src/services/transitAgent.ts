
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
            You are a local public transport expert for ${city}.
            The user wants to go from "${origin}" to "${destination}".
            
            Identify the BEST **GOVERNMENT PUBLIC TRANSPORT** option (Metro, Public Bus, Gov Ferry).
            Only suggest private options if no public transport exists.

            Return a detailed JSON object with:
            - summary: Simple instruction (e.g. "Take the Red Line Metro towards City Center.")
            - routes: Array of 1 best option. Route object:
                - mode: "Metro", "Bus", "Train", "Ferry"
                - line: Route number or name (e.g. "Red Line", "Bus 400")
                - from: Start station/stop
                - to: End station/stop
                - duration: Approx time
                - cost: Approx price in local currency
                - frequency: e.g. "Every 10 mins", "Hourly"
                - operatingHours: e.g. "6 AM - 11 PM"
                - safetyTip: A short safety note (e.g. "Crowded at peak hours", "Safe for solo travelers", "Avoid late night")
            
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
