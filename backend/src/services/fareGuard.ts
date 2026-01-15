import { FareBenchmark } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export class FareGuardService {
    /**
     * Retrieves pricing benchmarks for a specific city.
     */
    async getFareBenchmarks(cityName: string): Promise<FareBenchmark[]> {
        try {
            return await prisma.fareBenchmark.findMany({
                where: {
                    cityName: {
                        contains: cityName // Case-insensitive-ish for MVP
                    }
                }
            });
        } catch (error) {
            console.error('Error fetching fare benchmarks:', error);
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
            text += `- ${b.transportType.toUpperCase()}: Base Fare ₹${b.baseFare}. Rate: ₹${b.perKmRate}/km.\n`;
        });
        return text;
    }
}

export const fareGuard = new FareGuardService();
