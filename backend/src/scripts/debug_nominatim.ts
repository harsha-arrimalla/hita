async function testNominatim() {
    const queries = ["Baga Beach", "Baga Beach, Goa", "Panjim", "New York"];

    for (const q of queries) {
        console.log(`\n🔍 Searching for: "${q}"`);
        try {
            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`;
            console.log(`   URL: ${url}`);

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'HitaTravelCompanion/1.0',
                    'Referer': 'https://github.com/harsha/hita',
                    'Accept': 'application/json'
                }
            });

            console.log(`   Status: ${response.status}`);
            if (response.ok) {
                const data = await response.json() as any[];
                if (data.length > 0) {
                    console.log(`   ✅ Success! Lat: ${data[0].lat}, Lon: ${data[0].lon}`);
                    console.log(`   Display Name: ${data[0].display_name}`);
                } else {
                    console.log(`   ❌ No results found.`);
                }
            } else {
                console.log(`   ❌ API Error: ${response.statusText}`);
                const text = await response.text();
                console.log(`   Body: ${text}`);
            }
        } catch (e) {
            console.error("   💥 Exception:", e);
        }
    }
}

testNominatim();
