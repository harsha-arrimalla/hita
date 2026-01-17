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
            console.warn("OPENWEATHER_API_KEY is missing. Using Mock Data.");
            return getMockWeather(city);
        }

        try {
            const url = `${BASE_URL}?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
            const response = await fetch(url);

            if (!response.ok) {
                console.error(`Weather API Error: ${response.status} ${response.statusText}. Using Mock.`);
                return getMockWeather(city);
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
            return getMockWeather(city);
        }
    },

    getBriefSummary(data: WeatherData): string {
        return `${data.temp}°C, ${data.condition} (${data.description}). Wind: ${data.windSpeed}m/s.`;
    }
};

function getMockWeather(city: string): WeatherData {
    // Deterministic mock based on city name length
    const isHot = city.length % 2 === 0;

    // Check time for Day/Night icon
    const hour = new Date().getHours();
    const isNight = hour >= 18 || hour < 6;
    const suffix = isNight ? 'n' : 'd';

    // Adjust temp for night
    const dayTemp = isHot ? 32 : 24;
    const temp = isNight ? dayTemp - 3 : dayTemp; // Cooler at night

    return {
        temp: temp,
        condition: isHot ? "Clear" : "Cloudy",
        description: isHot ? "clear sky" : "scattered clouds",
        icon: isHot ? `01${suffix}` : `03${suffix}`,
        humidity: 60,
        windSpeed: 4.5
    };
}
