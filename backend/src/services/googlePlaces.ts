import fetch from 'node-fetch';

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const BASE_URL = 'https://places.googleapis.com/v1/places:searchText';

export interface GooglePlaceResult {
    id: string;
    displayName: { text: string };
    formattedAddress: string;
    rating?: number;
    userRatingCount?: number;
    priceLevel?: string;
    photos?: { name: string }[];
    types?: string[];
    location?: { latitude: number, longitude: number };
}

export const googlePlaces = {
    async searchPlaces(query: string, cityContext?: string): Promise<GooglePlaceResult[]> {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            console.warn("⚠️ Google Places API Key missing. Skipping.");
            return [];
        }

        const textQuery = cityContext ? `${query} in ${cityContext}` : query;
        console.log(`🌐 Google Places Search: "${textQuery}"`);

        try {
            const response = await fetch(BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': apiKey,
                    'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.photos,places.types,places.location'
                },
                body: JSON.stringify({
                    textQuery: textQuery,
                    maxResultCount: 10
                })
            });

            if (!response.ok) {
                console.error(`❌ Google Places API Error: ${response.status}`);
                return [];
            }

            const data: any = await response.json();
            return data.places || [];

        } catch (error) {
            console.error("❌ Google Places Network Error:", error);
            return [];
        }
    },

    getPhotoUrl(photoName: string, maxWidth = 800): string {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!apiKey) return '';
        // The resource name looks like "places/PLACE_ID/photos/PHOTO_ID"
        // Ensure we construct the media URL correctly for v1
        return `https://places.googleapis.com/v1/${photoName}/media?key=${apiKey}&maxWidthPx=${maxWidth}`;
    }
};
