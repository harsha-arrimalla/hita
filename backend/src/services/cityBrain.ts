import { EmergencyContact, SafetyZone } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

import { genAI } from './llm.js';

export class CityBrainService {
    private model;

    constructor() {
        this.model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: { responseMimeType: "application/json" }
        });
    }

    /**
     * Retrieves safety information for a specific area in a city.
     * Fallback to AI Assessment if DB is empty.
     */
    async getSafetyZone(cityName: string, areaName: string): Promise<SafetyZone | null> {
        try {
            // Simple case-insensitive search
            const zone = await prisma.safetyZone.findFirst({
                where: {
                    cityName: { contains: cityName },
                    areaName: { contains: areaName }
                }
            });

            if (zone) return zone;

            // FALLBACK: AI Assessment
            if (cityName && areaName) {
                console.log(`⚠️ No Safety DB data for ${areaName}, ${cityName}. Requesting AI Assessment...`);
                return await this.assessSafety(cityName, areaName);
            }
            return null;

        } catch (error) {
            console.error('Error fetching safety zone:', error);
            return null;
        }
    }

    /**
     * Uses GenAI to assess safety for an unknown area.
     */
    async assessSafety(cityName: string, areaName: string): Promise<SafetyZone | null> {
        try {
            const prompt = `
            You are a security expert. Analyze the safety of "${areaName}" in "${cityName}" for a solo traveler.
            Return JSON:
            {
                "safetyScore": number (0-10, 10 is safest),
                "riskLevel": "Low" | "Moderate" | "High",
                "description": "Brief safety summary (e.g. Generally safe but avoid dark alleys)",
                "commonScams": ["scam1", "scam2"],
                "safeHavens": ["Popular Mall", "Police Station Name"]
            }
            `;

            const result = await this.model.generateContent(prompt);
            const data = JSON.parse(result.response.text());

            // Map to Prisma SafetyZone structure (mock ID)
            return {
                id: `ai-safety-${Date.now()}`,
                cityName: cityName,
                areaName: areaName,
                safetyScore: data.safetyScore,
                riskFactors: JSON.stringify(data.commonScams || ["General Caution"]), // Schema uses riskFactors string
                safeHavens: JSON.stringify(data.safeHavens || []),
                createdAt: new Date(),
                // @ts-ignore - Prisma types might complain about missing fields if fully strict but this object shape is for internal returning
            } as any;

        } catch (e) {
            console.error("AI Safety Assessment Error:", e);
            return null;
        }
    }

    /**
     * Retrieves emergency contacts for a city.
     */
    async getEmergencyContacts(cityName: string): Promise<EmergencyContact[]> {
        try {
            return await prisma.emergencyContact.findMany({
                where: {
                    cityName: {
                        contains: cityName
                    }
                }
            });
        } catch (error) {
            console.error('Error fetching contacts:', error);
            return [];
        }
    }

    /**
     * Finds designated safe havens in the area.
     */
    /**
     * Finds designated safe havens in the area.
     * Tier 1: Database (Seed)
     * Tier 2: Real-time OSM Search (Police/Hospitals)
     */
    async findSafeHavens(cityName: string, areaName: string): Promise<string[]> {
        // 1. Try DB first
        const zone = await this.getSafetyZone(cityName, areaName);
        if (zone && zone.safeHavens) {
            try {
                const havens = JSON.parse(zone.safeHavens);
                if (havens.length > 0) return havens;
            } catch (e) { /* ignore parse error */ }
        }

        // 2. Try OSM Real-time Search
        console.log(`🔍 Searching OSM for Safe Havens in ${areaName}, ${cityName}...`);
        return await this.findSafeHavensOSM(cityName, areaName);
    }

    /**
     * Queries OSM for real-time safe locations (Police, Hospitals, Busy Areas)
     */
    async findSafeHavensOSM(cityName: string, areaName: string): Promise<string[]> {
        try {
            // Needed to resolve coords first - we can use geoAgent for this if exposed, 
            // or just use our own internal Nominatim call to avoid circular dependency if geoAgent depends on CityBrain.
            // For now, let's duplicate the simple resolve logic to keep CityBrain independent.

            const query = `${areaName}, ${cityName}`;
            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
            const geoRes = await fetch(url, { headers: { 'User-Agent': 'Hita/1.0' } });

            if (!geoRes.ok) return [];
            const geoData = await geoRes.json() as any[];

            if (!geoData || geoData.length === 0) return [];
            const { lat, lon } = geoData[0];

            // Query Overpass for Police & Hospitals around 2km
            const overpassQuery = `
                [out:json][timeout:25];
                (
                  node["amenity"="police"](around:2000,${lat},${lon});
                  node["amenity"="hospital"](around:2000,${lat},${lon});
                  node["amenity"="clinic"](around:2000,${lat},${lon});
                );
                out center 5;
            `;

            const opRes = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`);
            if (!opRes.ok) return [];

            const opData = await opRes.json() as any;
            if (!opData.elements) return [];

            return opData.elements.map((el: any) => {
                const type = el.tags?.amenity ? el.tags.amenity.charAt(0).toUpperCase() + el.tags.amenity.slice(1) : 'Safe Place';
                return `${type}: ${el.tags?.name || 'Unnamed Station'}`;
            });

        } catch (error) {
            console.error("OSM Safe Haven Search Error:", error);
            return [];
        }
    }
}

export const cityBrain = new CityBrainService();
