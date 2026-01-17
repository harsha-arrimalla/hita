import * as dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

interface WeatherData {
    temp: number;
    condition: string;
    description: string;
    icon: string;
    humidity: number;
    windSpeed: number;
}

export const weatherAgent = {
    async getWeather(city: string): Promise<WeatherData | null> {
        if (!API_KEY) {
            console.warn("OPENWEATHER_API_KEY is missing");
            // Return mock data for dev happiness if key is missing? 
            // Better to return null so we know it failed, but for MVP resilience...
            return null;
        }

        try {
            const url = `${BASE_URL}?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
            const response = await fetch(url);

            if (!response.ok) {
                console.error(`Weather API Error: ${response.status} ${response.statusText}`);
                return null;
            }

            const data = await response.json() as any;

            return {
                temp: Math.round(data.main.temp),
                condition: data.weather[0].main,
                description: data.weather[0].description,
                icon: data.weather[0].icon,
                humidity: data.main.humidity,
                windSpeed: data.wind.speed
            };

        } catch (error) {
            console.error("Failed to fetch weather:", error);
            return null;
        }
    },

    getBriefSummary(data: WeatherData): string {
        return `${data.temp}°C, ${data.condition} (${data.description}). Wind: ${data.windSpeed}m/s.`;
    }
};
