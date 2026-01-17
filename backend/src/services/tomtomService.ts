import * as dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.TOMTOM_API_KEY;
const BASE_URL = "https://api.tomtom.com";

interface LatLon {
    lat: number;
    lon: number;
}

export const tomtomService = {
    /**
     * 1. Geocode a Query (e.g. "Mumbai") to Coordinates
     */
    async searchPlace(query: string): Promise<LatLon | null> {
        if (!API_KEY) return null;
        try {
            const url = `${BASE_URL}/search/2/search/${encodeURIComponent(query)}.json?key=${API_KEY}&limit=1`;
            const response = await fetch(url);
            const data = await response.json() as any;

            if (data.results && data.results.length > 0) {
                return data.results[0].position; // { lat, lon }
            }
            return null;
        } catch (e) {
            console.error("TomTom Search Error:", e);
            return null;
        }
    },

    /**
     * 2. Get Routing Information
     * Docs: https://developer.tomtom.com/routing-api/documentation/routing/calculate-route
     */
    async getRoute(origin: LatLon, dest: LatLon, mode: 'transit' | 'car' | 'pedestrian' = 'transit') {
        if (!API_KEY) return null;
        try {
            const locations = `${origin.lat},${origin.lon}:${dest.lat},${dest.lon}`;

            // NOTE: TomTom Public Transport Routing is specific. 
            // Often "transit" falls back to car/pedestrian if not fully covered in the region.
            // Turning on 'computeTravelTimeFor=all' gives traffic data.
            const url = `${BASE_URL}/routing/1/calculateRoute/${locations}/json?key=${API_KEY}&routeType=fastest&travelMode=${mode}&computeTravelTimeFor=all`;

            const response = await fetch(url);
            const data = await response.json() as any;

            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                return {
                    summary: route.summary, // { lengthInMeters, travelTimeInSeconds, ... }
                    legs: route.legs // Detailed steps
                };
            }
            return null;

        } catch (e) {
            console.error("TomTom Routing Error:", e);
            return null;
        }
    }
};
