# Hita: Your AI Local Companion 🇮🇳

Hita is an AI-powered safety and travel companion designed for India. It uses a "Calm Local Friend" persona to provide real-time safety scores, emotional support, and fair price benchmarks.

## 🧠 Intelligence Engines (Backend)
The backend (`/backend`) is a Fastify server powered by **Google Gemini 2.0 Flash** and a local **SQLite** database.

1.  **🛡️ CityBrain**: Detects location (e.g., "North Goa") and provides Safety Scores (1-10), Risk Factors, and Safe Havens.
2.  **❤️ HitaHeart**: Detects emotional distress (Anxiety, Panic) and guides users through breathing exercises or grounding techniques.
3.  **💰 FareGuard**: Detects pricing questions ("Taxi to Baga?") and protects users from scams by showing official government rates.

## 📱 Mobile App (Frontend)
The frontend (`/src`) is a **React Native (Expo)** app with a premium "Calm" aesthetic.

- **Theme**: Warm Beige, Soft Serif fonts, Sage Green/Terracotta accents.
- **Components**: Custom "Smart Cards" that render dynamically closer to the chat:
    - `SafetyCard`: Visual shield and risk tags.
    - `TherapyCard`: Pulsing breathing animation (Reanimated).
    - `FareCard`: Ticket-stub style pricing card.

## 🚀 Getting Started

### 1. Start the Backend
```bash
cd backend
npm install
npm run dev
# Server runs on http://localhost:3000
```

### 2. Start the Frontend
```bash
# In the root project directory
npm install
npm run ios # or npm run android
```

---
## Development Notes (Expo)

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

### Learn more
- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.
