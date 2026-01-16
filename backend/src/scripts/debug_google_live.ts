
import 'dotenv/config';
import { googlePlaces } from '../services/googlePlaces.js';

async function test() {
    console.log("🧪 Testing Google Places Live via googlePlaces service...");

    // Explicitly load key if needed, though dotenv should handle it
    console.log("KEY present:", Boolean(process.env.GOOGLE_MAPS_API_KEY));

    const results = await googlePlaces.searchPlaces("restaurants", "Hyderabad");

    console.log(`✅ Returned ${results.length} results.`);
    if (results.length > 0) {
        console.log("Sample Result:", JSON.stringify(results[0], null, 2));
    } else {
        console.error("❌ No results returned. Check API Key or Quota.");
    }
}

test();
