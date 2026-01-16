export const PLACE_IMAGES: Record<string, string[]> = {
    // Categories
    'cafe': [
        'photo-1554118811-1e0d58224f24', // Cozy cafe
        'photo-1497935586351-b67a49e012bf', // Latte art
        'photo-1501339847302-ac426a4a7cbb', // Outdoor cafe
        'photo-1559925393-8be0ec4767c8', // Modern cafe
        'photo-1521017432531-fbd92d768814'  // Hipster cafe
    ],
    'coffee': ['photo-1497935586351-b67a49e012bf'],
    'restaurant': [
        'photo-1517248135467-4c7edcad34c4', // Fine dining
        'photo-1552566626-52f8b828add9', // Plated food
        'photo-1550966871-3ed3c47e2ce2', // Restaurant interior
        'photo-1414235077428-338989a2e8c0' // Gourmet dish
    ],
    'dining': ['photo-1517248135467-4c7edcad34c4'],
    'hotel': [
        'photo-1566073771259-6a8506099945', // Luxury pool
        'photo-1582719508461-905c673771fd', // Hotel bedroom
        'photo-1571003123894-1f0594d2b5d9', // Resort exterior
        'photo-1551882547-ff40c63fe5fa'  // Boutique hotel
    ],
    'resort': ['photo-1566073771259-6a8506099945'],
    'bar': [
        'photo-1514933651103-005eec06c04b', // Cocktail
        'photo-1470337458703-46ad1756a187', // Pub interior
        'photo-1572116469696-9a25771d97b3' // Bar counter
    ],
    'pub': ['photo-1514933651103-005eec06c04b'],
    'beach': [
        'photo-1507525428034-b723cf961d3e', // Tropical 1
        'photo-1519046904884-53103b34b271', // Tropical 2
        'photo-1506929562872-bb421503ef21'  // Sunset beach
    ],
    'park': ['photo-1496070242169-953f8ca34204'],
    'nature': ['photo-1441974231531-c6227db76b6e'],
    'temple': ['photo-1560179406-1c6c65e69228'],
    'church': ['photo-1548625361-bd8caf693822'],
    'museum': ['photo-1518998053901-5348d3961a04'],
    'shopping': ['photo-1483985988355-763728e1935b'],

    // Generic
    'default': ['photo-1501785888041-af3ef285b470'],
};

// Simple string hash function for consistent images per place ID
const hashString = (s: string): number => {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
    return h;
};

export const getPlaceImage = (keywordString: string, seed: string = ''): string => {
    let selectedId = PLACE_IMAGES['default'][0];

    // Determine Seed Hash
    const seedValue = seed ? Math.abs(hashString(seed)) : Math.floor(Math.random() * 1000);

    if (keywordString) {
        const keywords = keywordString.toLowerCase().replace(/,/g, ' ').split(' ');

        // Check for exact matches
        for (const word of keywords) {
            if (PLACE_IMAGES[word]) {
                const options = PLACE_IMAGES[word];
                selectedId = options[seedValue % options.length];
                return constructUrl(selectedId);
            }
        }

        // Heuristics
        if (keywordString.includes('food') || keywordString.includes('eat')) return constructUrl(pick(PLACE_IMAGES['restaurant'], seedValue));
        if (keywordString.includes('drink') || keywordString.includes('alcohol')) return constructUrl(pick(PLACE_IMAGES['bar'], seedValue));
        if (keywordString.includes('stay') || keywordString.includes('sleep')) return constructUrl(pick(PLACE_IMAGES['hotel'], seedValue));
        if (keywordString.includes('wlan') || keywordString.includes('work')) return constructUrl(pick(PLACE_IMAGES['cafe'], seedValue));
    }

    return constructUrl(selectedId);
};

const pick = (arr: string[], seed: number) => arr[seed % arr.length];

const constructUrl = (photoId: string): string => {
    return `https://images.unsplash.com/${photoId}?q=80&w=800&auto=format&fit=crop`;
};
