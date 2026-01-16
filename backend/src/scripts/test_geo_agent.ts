import dotenv from 'dotenv';
import path from 'path';
import { geoAgent } from '../services/geoAgent.js';
dotenv.config({ path: path.join(__dirname, '../../.env') });

console.log("DEBUG: Google Key Loaded?", process.env.GOOGLE_MAPS_API_KEY ? "YES" : "NO");

async function testGeoAgent() {
    console.log("🧪 Testing Geo & Map Intelligence Agent...\n");

    const testCases = [
        {
            query: "Restuarents in Hyderabad", // TYPO TEST
            context: { city: "Hyderabad" }
        },
        {
            query: "Best food in Mumbai", // BROAD INTENT
            context: { city: "Mumbai" }
        },
        {
            query: "Where is the nearest pharmacy?",
            userLocation: { lat: 15.2993, lon: 74.1240 }, // Example coords
            context: { city: "Goa" }
        },
        {
            query: "Plan a trip to go to Mars", // Should act as negative test (null)
            context: {}
        }
    ];

    for (const test of testCases) {
        console.log(`🔹 Input: "${test.query}"`);
        if (test.userLocation) console.log(`   User Location: ${JSON.stringify(test.userLocation)}`);

        const start = Date.now();
        const action = await geoAgent.process(test.query, test.userLocation, test.context);
        const duration = Date.now() - start;

        if (action) {
            console.log(`✅ Action: ${action.action}`);
            console.log(`   Center: ${action.center.label} (${action.center.lat}, ${action.center.lon})`);
            console.log(`   Filters: ${JSON.stringify(action.filters.osm_tags)}`);

            if ((action as any).real_places) {
                console.log(`   🏙️ Found ${(action as any).real_places.length} Real Places:`);
                (action as any).real_places.slice(0, 3).forEach((p: any) => {
                    console.log(`      - ${p.title} (${p.tags.join(', ')}) [Price: ${p.price}] [Img: ${p.imageKeyword}]`);
                });
            } else {
                console.log(`   ⚠️ No real places found (Overpass query empty or failed).`);
            }

            console.log(`   UI Hint: ${JSON.stringify(action.ui_hint)}`);
        } else {
            console.log(`❌ No Geographic Action Detected`);
        }
        console.log(`   ⏱️ Time: ${duration}ms\n`);
    }
}

testGeoAgent();
