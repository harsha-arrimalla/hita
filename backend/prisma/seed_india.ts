
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding India Data (Kashmir to Kanyakumari)...');

    // --- KASHMIR (SRINAGAR) ---
    await prisma.fareBenchmark.create({
        data: {
            cityName: 'Srinagar',
            transportType: 'Shikara',
            baseFare: 500.0, // Per hour standard
            perKmRate: 0.0,
            currency: 'INR'
        }
    });
    await prisma.fareBenchmark.create({
        data: {
            cityName: 'Srinagar',
            transportType: 'Taxi',
            baseFare: 800.0, // Airport to Dal Gate fixed
            perKmRate: 0.0,
            currency: 'INR'
        }
    });

    // --- DELHI ---
    await prisma.fareBenchmark.create({
        data: {
            cityName: 'Delhi',
            transportType: 'Auto',
            baseFare: 25.0,
            perKmRate: 9.5,
            currency: 'INR'
        }
    });
    await prisma.safetyZone.create({
        data: {
            cityName: 'Delhi',
            areaName: 'Paharganj',
            safetyScore: 5,
            riskFactors: JSON.stringify(['Touts', 'Scams', 'Pickpocketing']),
            safeHavens: JSON.stringify(['Metropolis Hotel Lobby', 'RK Ashram Metro Station'])
        }
    });

    // --- MUMBAI ---
    await prisma.fareBenchmark.create({
        data: {
            cityName: 'Mumbai',
            transportType: 'Taxi (Kali Peeli)',
            baseFare: 28.0,
            perKmRate: 18.0,
            currency: 'INR'
        }
    });
    await prisma.fareBenchmark.create({
        data: {
            cityName: 'Mumbai',
            transportType: 'Auto',
            baseFare: 23.0,
            perKmRate: 15.0,
            currency: 'INR'
        }
    });

    // --- BANGALORE ---
    await prisma.fareBenchmark.create({
        data: {
            cityName: 'Bangalore',
            transportType: 'Auto (Meter)',
            baseFare: 30.0,
            perKmRate: 15.0,
            currency: 'INR'
        }
    });

    // --- KERALA (Alleppey) ---
    await prisma.fareBenchmark.create({
        data: {
            cityName: 'Alleppey',
            transportType: 'Houseboat',
            baseFare: 8000.0, // Day cruise starts
            perKmRate: 0.0,
            currency: 'INR'
        }
    });
    await prisma.fareBenchmark.create({
        data: {
            cityName: 'Alleppey',
            transportType: 'Auto',
            baseFare: 40.0,
            perKmRate: 20.0, // Tourist rates often higher
            currency: 'INR'
        }
    });

    // --- KANYAKUMARI ---
    await prisma.fareBenchmark.create({
        data: {
            cityName: 'Kanyakumari',
            transportType: 'Auto',
            baseFare: 50.0,
            perKmRate: 15.0,
            currency: 'INR'
        }
    });
    await prisma.safetyZone.create({
        data: {
            cityName: 'Kanyakumari',
            areaName: 'Sunset Point',
            safetyScore: 8,
            riskFactors: JSON.stringify(['Crowded', 'Rocky Terrain']),
            safeHavens: JSON.stringify(['Vivekananda Rock Ferry Ticket Counter'])
        }
    });

    console.log('India Data Seeded Successfully.');
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
