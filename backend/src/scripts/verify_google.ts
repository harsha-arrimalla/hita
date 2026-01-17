
// Native fetch used
// import fetch from 'node-fetch';

const API_KEY = 'AIzaSyCA9CD79BCiHGtIOANLiM3wDS1_OwL0JO0';

// Test Query: "cafe in Panjim"
// Using Places API (New) - v1
const url = `https://places.googleapis.com/v1/places:searchText`;

async function verifyGooglePlaces() {
    console.log(`🔑 Testing API Key: ${API_KEY.slice(0, 10)}...`);
    console.log(`🌐 Calling (New API): ${url}`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': API_KEY,
                'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.photos'
            },
            body: JSON.stringify({
                textQuery: "cafe in Panjim"
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log("✅ API Key Works! (Places API New)");
            if (data.places && data.places.length > 0) {
                console.log(`📍 Found ${data.places.length} results.`);
                const first = data.places[0];
                console.log("--- First Result ---");
                console.log(`Name: ${first.displayName.text}`);
                console.log(`Address: ${first.formattedAddress}`);

                if (first.photos && first.photos.length > 0) {
                    console.log(`📸 Photos Available: YES (Name: ${first.photos[0].name})`);
                    console.log(`   Direct Photo URL: https://places.googleapis.com/v1/${first.photos[0].name}/media?key=${API_KEY}&maxWidthPx=800`);
                } else {
                    console.warn("⚠️ No photos found in result.");
                }
            } else {
                console.log("⚠️ No places found.");
            }
        } else {
            console.error(`❌ API Error: ${response.status} ${response.statusText}`);
            console.error(JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("❌ Network or Script Error:", error);
    }
}

verifyGooglePlaces();
