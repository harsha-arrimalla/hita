import cors from '@fastify/cors';
import * as dotenv from 'dotenv';
import Fastify from 'fastify';
import { chatRoutes } from './routes/chat.js';

dotenv.config();

const server = Fastify({
    logger: true
});

server.register(cors, {
    origin: '*' // Allow all for dev
});

server.register(chatRoutes);

import { prisma } from './lib/prisma.js';

async function checkAndSeed() {
    const count = await prisma.safetyZone.count();
    if (count === 0) {
        console.log("Database empty. Seeding Goa data...");

        await prisma.safetyZone.create({
            data: {
                cityName: 'Goa',
                areaName: 'North Goa',
                safetyScore: 6,
                riskFactors: JSON.stringify(['Crowded', 'Petty Theft', 'Touts']),
                safeHavens: JSON.stringify(['Titos Lane Police Outpost', 'Crowded Beach Shacks']),
            },
        });

        await prisma.safetyZone.create({
            data: {
                cityName: 'Goa',
                areaName: 'South Goa',
                safetyScore: 8,
                riskFactors: JSON.stringify(['Isolated Roads at Night', 'Low Street Lighting']),
                safeHavens: JSON.stringify(['Resort Lobbies', 'Main Market Area']),
            },
        });
        console.log("Seeding Safety Zones complete.");
    }

    // Seed Emotional Scripts
    const scriptCount = await prisma.emotionalScript.count();
    if (scriptCount === 0) {
        console.log("Database missing scripts. Seeding Emotional Data...");

        await prisma.emotionalScript.create({
            data: {
                triggerCategory: 'anxiety',
                actionType: 'breathing_exercise',
                responseText: "I can hear that you're stressed. Let's pause for 10 seconds. Breathe in... hold... and breathe out.",
            },
        });

        await prisma.emotionalScript.create({
            data: {
                triggerCategory: 'panic',
                actionType: 'grounding_technique',
                responseText: "You are safe. Look around you. Name 5 things you can see, 4 things you can touch. I am right here with you.",
            },
        });
        console.log("Seeding Emotional Scripts complete.");
    }

    // Seed Fare Benchmarks
    const fareCount = await prisma.fareBenchmark.count();
    if (fareCount === 0) {
        console.log("Database missing pricing. Seeding Fare Data...");

        await prisma.fareBenchmark.create({
            data: {
                cityName: 'Goa',
                transportType: 'taxi',
                baseFare: 300.0,
                perKmRate: 25.0,
                currency: 'INR',
            },
        });

        await prisma.fareBenchmark.create({
            data: {
                cityName: 'Goa',
                transportType: 'scooter_rental',
                baseFare: 400.0, // Per day
                perKmRate: 0.0,
                currency: 'INR',
            },
        });
        console.log("Seeding Fare Data complete.");
    }
}

const start = async () => {
    try {
        await checkAndSeed();
        const port = parseInt(process.env.PORT || '3000');
        await server.listen({ port, host: '0.0.0.0' });
        console.log(`Hita Backend running on port ${port}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
