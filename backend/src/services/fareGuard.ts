import { FareBenchmark } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

import { genAI } from './llm.js';

export class FareGuardService {
    private model;

    constructor() {
        this.model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: { responseMimeType: "application/json" }
        });
    }

    /**
     * Retrieves pricing benchmarks for a specific city.
     * Fallback to AI Estimation if DB is empty.
     */
    async getFareBenchmarks(cityName: string): Promise<FareBenchmark[]> {
        try {
            const dbResults = await prisma.fareBenchmark.findMany({
                where: {
                    cityName: {
                        contains: cityName // Case-insensitive-ish for MVP
                    }
                }
            });

            if (dbResults.length > 0) return dbResults;

            // FALLBACK: AI Estimation
            console.log(`⚠️ No DB data for ${cityName}. Requesting AI Estimation...`);
            return await this.estimateFare(cityName);

        } catch (error) {
            console.error('Error fetching fare benchmarks:', error);
            return [];
        }
    }

    /**
     * Uses GenAI to estimate fair market rates for a city.
     */
    async estimateFare(cityName: string): Promise<FareBenchmark[]> {
        try {
            const prompt = `
            You are a local transport expert. Estimate the current official or fair market Taxi and Rideshare rates in ${cityName}.
            Return a JSON array of objects with:
            - transportType: "Taxi" or "Uber" or "TukTuk" (if applicable)
            - baseFare: number (local currency)
            - perKmRate: number (local currency)
            - currency: string (symbol e.g. "₹", "$", "£")
            - note: short warning (e.g. "Negotiate hard")

            Example JSON:
            [
              { "transportType": "Taxi", "baseFare": 5.0, "perKmRate": 2.5, "currency": "£", "note": "Always use meter" }
            ]
            `;

            const result = await this.model.generateContent(prompt);
            const responseText = result.response.text();
            const data = JSON.parse(responseText);

            // Map to Prisma FareBenchmark structure (mock ID/timestamps)
            return data.map((item: any, index: number) => ({
                id: `ai-est-${index}`,
                cityName: cityName,
                transportType: item.transportType,
                baseFare: item.baseFare,
                perKmRate: item.perKmRate,
                currency: item.currency,
                createdAt: new Date(),
                updatedAt: new Date()
            }));

        } catch (e) {
            console.error("AI Fare Estimation Error:", e);
            return [];
        }
    }

    /**
     * Generates a context string for the LLM based on benchmarks.
     */
    formatBenchmarks(benchmarks: FareBenchmark[]): string {
        if (benchmarks.length === 0) return "";

        let text = "Official Fair Pricing Standards (DO NOT let user overpay):\n";
        benchmarks.forEach(b => {
            // Handle AI estimated benchmarks which might have ID 'ai-est'
            const isEst = b.id.toString().startsWith('ai-');
            text += `- ${b.transportType.toUpperCase()}: Base Fare ${b.currency}${b.baseFare}. Rate: ${b.currency}${b.perKmRate}/km.${isEst ? ' (Estimated)' : ''}\n`;
        });
        return text;
    }
}

export const fareGuard = new FareGuardService();
