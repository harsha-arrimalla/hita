import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding ...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL);

    // 1. Safety Zones (Goa)
    const northGoa = await prisma.safetyZone.create({
        data: {
            cityName: 'Goa',
            areaName: 'North Goa (Baga/Calangute)',
            safetyScore: 6,
            riskFactors: JSON.stringify(['Crowded', 'Petty Theft', 'Touts']),
            safeHavens: JSON.stringify(['Titos Lane Police Outpost', 'Crowded Beach Shacks']),
        },
    });

    const southGoa = await prisma.safetyZone.create({
        data: {
            cityName: 'Goa',
            areaName: 'South Goa (Palolem/Agonda)',
            safetyScore: 8,
            riskFactors: JSON.stringify(['Isolated Roads at Night', 'Low Street Lighting']),
            safeHavens: JSON.stringify(['Resort Lobbies', 'Main Market Area']),
        },
    });

    // 2. Emotional Scripts
    const anxietyScript = await prisma.emotionalScript.create({
        data: {
            triggerCategory: 'anxiety',
            actionType: 'breathing_exercise',
            responseText: "I can hear that you're stressed. Let's pause for 10 seconds. Breathe in... and breathe out.",
        },
    });

    const lonelyScript = await prisma.emotionalScript.create({
        data: {
            triggerCategory: 'loneliness',
            actionType: 'validation',
            responseText: "It's completely normal to feel lonely in a new city. You are navigating a lot of change. I'm here with you.",
        },
    });

    // 3. Fare Benchmarks (Goa)
    const taxiFare = await prisma.fareBenchmark.create({
        data: {
            cityName: 'Goa',
            transportType: 'taxi',
            baseFare: 300.0, // Minimum usually high in Goa
            perKmRate: 25.0,
            currency: 'INR',
        },
    });

    const scooterRent = await prisma.fareBenchmark.create({
        data: {
            cityName: 'Goa',
            transportType: 'scooter_rental',
            baseFare: 400.0, // Per day
            perKmRate: 0.0,
            currency: 'INR',
        },
    });

    console.log('Seeding finished.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
