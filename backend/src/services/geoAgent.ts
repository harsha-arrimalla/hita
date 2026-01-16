import { GEO_AGENT_SYSTEM_PROMPT } from '../prompts/geo.system.js';
import { googlePlaces } from './googlePlaces.js';
import { genAI } from './llm.js';
console.log("DEBUG: geoAgent loaded. Key present?", Boolean(process.env.GOOGLE_MAPS_API_KEY));

export interface GeoAction {
    action: string;
    center: {
        lat: number | string;
        lon: number | string;
        label: string;
    };
    radius_meters: number;
    filters: {
        osm_tags: Record<string, string>;
    };
    ui_hint: {
        default_view: string;
        map_toggle: boolean;
        highlight_on_select?: boolean;
    };
}

export class GeoAgentService {
    private model;

    constructor() {
        // Use a model suitable for JSON generation
        this.model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: {
                responseMimeType: "application/json"
            }
        });
    }

    /**
     * Resolves a location name to coordinates using OpenStreetMap Nominatim API.
     */
    async resolveLocation(query: string): Promise<{ lat: number, lon: number, display_name: string } | null> {
        try {
            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'HitaTravelCompanion/1.0',
                    'Referer': 'https://github.com/harsha/hita',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) return null;

            const data = await response.json() as any[];
            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lon: parseFloat(data[0].lon),
                    display_name: data[0].display_name
                };
            }
            return null;
        } catch (error) {
            console.error("Nominatim API Error:", error);
            return null;
        }
    }

    /**
     * Reverse geocodes coordinates to a human-readable address.
     */
    async reverseGeocode(lat: number | string, lon: number | string): Promise<string | null> {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'HitaTravelCompanion/1.0',
                    'Referer': 'https://github.com/harsha/hita',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) return null;
            const data = await response.json() as any;
            return data.display_name || null;
        } catch (error) {
            console.error("Reverse Geocode Error:", error);
            return null;
        }
    }

    /**
     * Searches for places using the Overpass API based on OSM tags.
     */
    /**
     * Searches for places using Google Places (Priority) or Overpass API (Fallback).
     */
    async searchPlaces(lat: number, lon: number, radiusMeters: number, filters: Record<string, string>): Promise<any[]> {

        // 1. Priority: Google Places API
        if (process.env.GOOGLE_MAPS_API_KEY) {
            try {
                // Construct a query based on filters, e.g. "Restaurant near [Lat,Lon]" or just use the location bias
                // Since Google Text Search prefers a query string, let's derive one.
                const amenity = filters.amenity || filters.tourism || filters.leisure || "place";
                const cuisine = filters.cuisine ? `${filters.cuisine} ` : "";

                const queryTerm = `${cuisine}${amenity}`;
                console.log(`🌐 Google Search Priority: ${queryTerm} near ${lat},${lon}`);

                // We'll trust googlePlaces service to handle the "raw" query or we attach "near me" context
                // But first, let's try to get a city/area name context if cheap.
                // Or just pass the lat/lon to Google Places if we updated it to support LocationBias (we haven't yet).
                // FOR NOW: We will use the 'googlePlaces.searchPlaces' which does a Text Search.
                // To make it relevant to the user's focus, we really need the location name.
                // Let's just assume best effort: Query + " near destination" is tricky without context.

                // BETTER: Just return empty here and let the Logic in `process` handle it? 
                // No, `process` calls `searchPlaces`.

                // Let's try to map the OSM filters to a Google text query.
                // And since we don't have the location name in this method signature, we rely on the implementation 
                // of googlePlaces service to optionally accept coordinates? 
                // Looking at `googlePlaces.ts`, it takes (query, cityContext).
                // Currently `searchPlaces` signature is (lat, lon, radius, filters).

                // QUICK FIX: Pass "near location" is risky. 
                // Let's just fall back to Overpass if we can't formulate a good Google Query?
                // NO, user wants "Best".

                // Updating `googlePlaces.ts` to accept lat/lon bias would be best, but complex now.
                // Alternative: The `GeoAction` had a `label`. `process` knows the `label`.
                // But `searchPlaces` does not.

                // I will update `searchPlaces` signature in the next step or just fetch Google Places 
                // inside `process` block where we HAVE the label.

                // actually, let's look at `googlePlaces.ts` content again... it does `query + in + city`.
                // `geoAgent.process` calls `searchPlaces` with lat/lon.
                // Maybe it's better to move the Google Logic *up* into `process`?
                // YES. That way we have the "New York" label.

                // So I will return empty here if I plan to move it, OR I will call Overpass here as fallback.
                // BUT I will modify `process` to call Google directly if Key exists.

            } catch (e) {
                console.error("Google Place Search Error:", e);
            }
        }

        // 2. Fallback: Overpass API
        try {
            // Construct Overpass QL query
            let tagsQL = "";
            for (const [key, value] of Object.entries(filters)) {
                tagsQL += `["${key}"="${value}"]`;
            }
            // Basic query for nodes around the center
            const query = `
                [out:json][timeout:25];
                (
                  node${tagsQL}(around:${radiusMeters},${lat},${lon});
                  way${tagsQL}(around:${radiusMeters},${lat},${lon});
                  relation${tagsQL}(around:${radiusMeters},${lat},${lon});
                );
                out center 5;
            `; // Limiting to 5 results for speed/relevance

            const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
            // Overpass supports simple GET
            console.log(`🔍 Overpass Query: ${query.trim().replace(/\s+/g, ' ')}`);

            const response = await fetch(url);
            if (!response.ok) {
                console.error(`❌ Overpass API Error: ${response.status} ${response.statusText}`);
                return [];
            }

            const data = await response.json() as any;
            if (!data.elements) {
                console.log("⚠️ Overpass returned no elements.");
                return [];
            }

            console.log(`✅ Overpass returned ${data.elements.length} raw elements.`);

            // Map and formatting
            return data.elements.map((el: any) => {
                const centerLat = el.lat || el.center?.lat;
                const centerLon = el.lon || el.center?.lon;
                const name = el.tags?.name || "Unknown Place";
                const cuisine = el.tags?.cuisine || "";

                // Heuristics for "Vibe"
                const tags: string[] = [];
                if (cuisine) tags.push(cuisine.charAt(0).toUpperCase() + cuisine.slice(1));
                if (el.tags?.internet_access === 'wlan') tags.push("Wifi");
                if (el.tags?.outdoor_seating === 'yes') tags.push("Outdoor");
                if (el.tags?.['diet:vegetarian'] === 'yes') tags.push("Veg");

                // Price heuristic
                let price = "₹₹";
                if (el.tags?.amenity === 'fast_food') price = "₹";
                if (el.tags?.amenity === 'restaurant') price = "₹₹₹";

                // Unsplash keyword
                const imageKeyword = `${el.tags?.amenity || 'place'},${cuisine || 'interior'},aesthetic`;

                return {
                    id: String(el.id),
                    title: name,
                    description: `${(Math.random() * 4 + 1).toFixed(1)} km away`, // Mock distance for now or calc real
                    rating: 4.0 + Math.random(), // Mock rating as OSM doesn't have it
                    reviewCount: Math.floor(Math.random() * 500) + 10,
                    price: price,
                    imageKeyword: imageKeyword,
                    tags: tags.length > 0 ? tags : ["Local"]
                };
            });

        } catch (error) {
            console.error("Overpass Search Error:", error);
            return [];
        }
    }

    /**
     * Processes a user query to determine if it requires geographic action.
     * Returns a structured GeoAction if recognized, or null.
     */
    async process(userQuery: string, userLocation?: any, tripContext?: any): Promise<GeoAction | null> {
        try {
            // 1. Construct the User Input Payload
            const inputPayload = {
                user_query: userQuery,
                user_location: userLocation || null,
                trip_context: tripContext || {}
            };

            const prompt = `
${GEO_AGENT_SYSTEM_PROMPT}

INPUT:
${JSON.stringify(inputPayload, null, 2)}
`;

            // 2. Generate Content
            const result = await this.model.generateContent(prompt);
            const responseText = result.response.text();

            // 3. Parse JSON
            // Clean up any markdown code blocks if the model adds them despite instructions
            const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

            try {
                const actionData = JSON.parse(cleanJson);

                // key validation to ensure it's a valid Geo Action
                if (actionData.action === "show_places_on_map" && actionData.filters?.osm_tags) {

                    // 4. [NEW] Enhance with Real Geocoding
                    let centerLat = actionData.center?.lat;
                    let centerLon = actionData.center?.lon;
                    const label = actionData.center?.label;

                    // If the action has a specific location label (and isn't "Current Location"), verify it.
                    if (label && label !== "Current Location" && label !== "User Location") {
                        console.log(`🌍 Refining location for: "${label}"...`);
                        const realCoords = await this.resolveLocation(label);
                        if (realCoords) {
                            console.log(`✅ Fixed coordinates: ${label} -> ${realCoords.lat}, ${realCoords.lon}`);
                            centerLat = realCoords.lat;
                            centerLon = realCoords.lon;
                            actionData.center.lat = centerLat;
                            actionData.center.lon = centerLon;
                        } else {
                            console.log(`⚠️ Could not resolve "${label}", using LLM hallucinated coordinates.`);
                        }
                    }

                    // 5. [NEW] Real Place Search (Vibe Search)
                    // Priority: Google Places (if key exists)
                    if (process.env.GOOGLE_MAPS_API_KEY) {
                        try {
                            // Derive a text query from filters+label
                            // e.g. "Restaurant" + " in " + "Hyderabad"
                            const amenity = actionData.filters.osm_tags?.amenity || "places";
                            const cuisine = actionData.filters.osm_tags?.cuisine || "";
                            const searchQuery = `${cuisine} ${amenity}`.trim();

                            console.log(`🌐 Calling Google Places: "${searchQuery}" in "${label}"`);

                            const gResults = await googlePlaces.searchPlaces(searchQuery, label);

                            if (gResults.length > 0) {
                                console.log(`✅ Google returned ${gResults.length} places.`);
                                const realPlaces = gResults.map(p => {
                                    // Construct Photo URL if reference exists
                                    let photoUrl = "";
                                    if (p.photos && p.photos.length > 0) {
                                        photoUrl = googlePlaces.getPhotoUrl(p.photos[0].name);
                                    }

                                    // Fix: Map Google Enum to 1-4 scale
                                    let priceCount = 2;
                                    const pl = p.priceLevel;
                                    if (pl === 'PRICE_LEVEL_INEXPENSIVE') priceCount = 1;
                                    else if (pl === 'PRICE_LEVEL_MODERATE') priceCount = 2;
                                    else if (pl === 'PRICE_LEVEL_EXPENSIVE') priceCount = 3;
                                    else if (pl === 'PRICE_LEVEL_VERY_EXPENSIVE') priceCount = 4;

                                    return {
                                        id: p.id,
                                        title: p.displayName?.text || "Unknown",
                                        description: p.formattedAddress || label,
                                        rating: p.rating || 4.5,
                                        reviewCount: p.userRatingCount || 100,
                                        price: "₹".repeat(priceCount),
                                        tags: p.types ? p.types.slice(0, 3) : ["Popular"],
                                        photoUrl: photoUrl, // Pass real photo
                                        imageKeyword: "restaurant,interior" // Fallback
                                    };
                                });
                                // Inject
                                (actionData as any).real_places = realPlaces;
                            } else {
                                console.log("⚠️ Google returned 0 places. Falling back to Overpass.");
                            }
                        } catch (e) { console.error("Google Process Error", e); }
                    }

                    // Fallback to Overpass if Google didn't return places
                    if (!(actionData as any).real_places && centerLat && centerLon) {
                        const realPlaces = await this.searchPlaces(
                            Number(centerLat),
                            Number(centerLon),
                            actionData.radius_meters || 1000,
                            actionData.filters.osm_tags
                        );

                        if (realPlaces.length > 0) {
                            console.log(`✅ Found ${realPlaces.length} real places via Overpass.`);
                            // Inject the real data structure into the action so chat.ts can use it
                            (actionData as any).real_places = realPlaces;
                        }
                    }

                    return actionData as GeoAction;
                }

                return null; // Not a valid geo action response

            } catch (e) {
                console.error("GeoAgent JSON Parse Error:", e);
                console.log("Raw Response:", responseText);
                return null;
            }

        } catch (error) {
            console.error("GeoAgent Process Error:", error);
            return null;
        }
    }
}

export const geoAgent = new GeoAgentService();
