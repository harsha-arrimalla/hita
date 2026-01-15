import { EmergencyContact, SafetyZone } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export class CityBrainService {
    /**
     * Retrieves safety information for a specific area in a city.
     */
    async getSafetyZone(cityName: string, areaName: string): Promise<SafetyZone | null> {
        try {
            // Simple case-insensitive search for now
            const zone = await prisma.safetyZone.findFirst({
                where: {
                    cityName: {
                        // Prisma SQLite doesn't support mode: 'insensitive' well without extensions, 
                        // so we'll rely on exact match or handling case in logic for MVP.
                        contains: cityName
                    },
                    areaName: {
                        contains: areaName
                    }
                }
            });
            return zone;
        } catch (error) {
            console.error('Error fetching safety zone:', error);
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
    async findSafeHavens(cityName: string, areaName: string): Promise<string[]> {
        const zone = await this.getSafetyZone(cityName, areaName);
        if (!zone || !zone.safeHavens) return [];

        try {
            return JSON.parse(zone.safeHavens);
        } catch (e) {
            return [];
        }
    }
}

export const cityBrain = new CityBrainService();
