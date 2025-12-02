import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // 1. Bikin Toko Seblak (Viral & Pedas)
    const seblak = await prisma.tenant.create({
        data: {
            name: 'Seblak Jeletot Mpok Nini',
            category: 'FOOD',
            isViral: true,
            status: 'RAMAI',
            description: 'Seblak super pedas dengan topping ceker dan kerupuk warna-warni.',
            menus: {
                create: [
                    { name: 'Seblak Komplit Level 5', price: 25000, description: 'Pedes mampus' },
                    { name: 'Seblak Ceker', price: 18000, description: 'Ceker lunak' },
                ],
            },
        },
    });

    // 2. Bikin Toko Es Cendol (Hidden Gem & Manis)
    const cendol = await prisma.tenant.create({
        data: {
            name: 'Es Cendol Elizabeth Asli',
            category: 'DRINK',
            isViral: false, // Ini toko sepi yang mau kita rekomendasikan
            status: 'SEPI',
            description: 'Es cendol segar pakai santan asli dan gula aren organik.',
            menus: {
                create: [
                    { name: 'Es Cendol Original', price: 12000, description: 'Manis gurih' },
                    { name: 'Es Cendol Nangka', price: 15000, description: 'Ada nangkanya' },
                ],
            },
        },
    });

    // 3. Bikin Toko Sate (Sedang)
    await prisma.tenant.create({
        data: {
            name: 'Sate Taichan Senayan',
            category: 'FOOD',
            isViral: false,
            status: 'OPEN',
            description: 'Sate ayam putih dibakar dengan perasan jeruk nipis.',
            menus: {
                create: [
                    { name: 'Sate Taichan (10 tusuk)', price: 25000, description: 'Asem pedas' },
                ],
            },
        },
    });

    console.log('Seeding selesai! Data dummy sudah masuk.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });