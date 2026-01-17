import { tomtomService } from './services/tomtomService';

async function testIndia() {
    console.log("🇮🇳 Testing TomTom in India...");

    // 1. Geocode "Mumbai Airport"
    console.log("Searching 'Mumbai Airport'...");
    const origin = await tomtomService.searchPlace("Chhatrapati Shivaji Maharaj International Airport");

    // 2. Geocode "Gateway of India"
    console.log("Searching 'Gateway of India'...");
    const dest = await tomtomService.searchPlace("Gateway of India, Mumbai");

    if (!origin || !dest) {
        console.error("❌ Failed to find one or more locations.");
        return;
    }

    console.log("✅ Coordinates Found:", { origin, dest });

    // 3. Try Route (Driving - most reliable for coverage check)
    console.log("🚗 Calculating Driving Route...");
    const driveRoute = await tomtomService.getRoute(origin, dest, 'car');

    if (driveRoute) {
        const km = (driveRoute.summary.lengthInMeters / 1000).toFixed(1);
        const mins = Math.round(driveRoute.summary.travelTimeInSeconds / 60);
        console.log(`✅ Driving Route Found: ${km} km, ${mins} mins.`);
    } else {
        console.error("❌ No Driving Route found.");
    }

    // 4. Try Route (Transit)
    console.log("🚇 Calculating Transit Route...");
    const transitRoute = await tomtomService.getRoute(origin, dest, 'transit');

    if (transitRoute) {
        const km = (transitRoute.summary.lengthInMeters / 1000).toFixed(1);
        const mins = Math.round(transitRoute.summary.travelTimeInSeconds / 60);
        console.log(`✅ Transit Route Found: ${km} km, ${mins} mins.`);
    } else {
        console.log("⚠️ No Public Transit Route found (Common in some API tiers/regions).");
    }
}

testIndia();
