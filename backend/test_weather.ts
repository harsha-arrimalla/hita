
import * as dotenv from 'dotenv';
import { weatherAgent } from './src/services/weatherAgent.js';
dotenv.config();

async function test() {
    console.log("Testing Weather Agent for Hyderabad...");
    const weather = await weatherAgent.getWeather("Hyderabad");
    console.log("Result:", weather);
}

test();
