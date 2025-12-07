import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Start seeding...');

    // Reset database dulu biar bersih (Opsional, tapi disarankan biar gak duplikat)
    // await prisma.queue.deleteMany();
    // await prisma.order.deleteMany();
    // await prisma.menu.deleteMany();
    // await prisma.userTenant.deleteMany();
    // await prisma.tenant.deleteMany();

    // Password default: "123456"
    const hashedPassword = await bcrypt.hash('123456', 10);

    // --- TENANT 1: SATE TAICHAN ---
    const tenant1 = await prisma.tenant.create({
        data: {
            name: 'Sate Taichan Senayan',
            category: 'Sate',
            description: 'Sate ayam daging putih dibakar tanpa kecap dengan sambal super pedas.',
            imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
            address: 'Stand A-01',
            status: 'SEPI', // 👈 UBAH JADI SEPI
            menus: {
                create: [
                    { name: 'Sate Kulit Goreng', price: 25000, description: 'Kulit ayam digoreng garing', imageUrl: 'https://dummyimage.com/300' },
                    { name: 'Sate Daging Original', price: 30000, description: 'Daging ayam full tanpa lemak', imageUrl: 'https://dummyimage.com/300' },
                    { name: 'Lontong', price: 5000, description: 'Pelengkap makan sate', imageUrl: 'https://dummyimage.com/300' },
                ],
            },
            users: {
                create: {
                    email: 'taichan@fest.com',
                    password: hashedPassword,
                    role: 'TENANT_ADMIN',
                },
            },
        },
    });
    console.log(`Created: ${tenant1.name}`);

    // --- TENANT 2: ES TEH SAUDAGAR ---
    const tenant2 = await prisma.tenant.create({
        data: {
            name: 'Es Teh Saudagar',
            category: 'Minuman',
            description: 'Pelepas dahaga terbaik! Teh manis jumbo segar.',
            imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc',
            address: 'Stand B-05',
            status: 'SEPI', // 👈 UBAH JADI SEPI
            menus: {
                create: [
                    { name: 'Es Teh Manis Jumbo', price: 10000, description: 'Teh manis ukuran besar', imageUrl: 'https://dummyimage.com/300' },
                    { name: 'Lemon Tea Fresh', price: 15000, description: 'Teh dengan perasan lemon asli', imageUrl: 'https://dummyimage.com/300' },
                ],
            },
            users: {
                create: {
                    email: 'teh@fest.com',
                    password: hashedPassword,
                    role: 'TENANT_ADMIN',
                },
            },
        },
    });
    console.log(`Created: ${tenant2.name}`);

    // --- TENANT 3: NASI GILA ---
    const tenant3 = await prisma.tenant.create({
        data: {
            name: 'Nasi Gila Gondangdia',
            category: 'Makanan Berat',
            description: 'Nasi goreng dengan topping sosis, bakso, dan telur melimpah.',
            imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f10842619',
            address: 'Stand C-10',
            status: 'SEPI', // 👈 UBAH JADI SEPI
            menus: {
                create: [
                    { name: 'Nasi Gila Spesial', price: 35000, description: 'Topping komplit porsi besar', imageUrl: 'https://dummyimage.com/300' },
                ],
            },
            users: {
                create: {
                    email: 'nasigila@fest.com',
                    password: hashedPassword,
                    role: 'TENANT_ADMIN',
                },
            },
        },
    });
    console.log(`Created: ${tenant3.name}`);

    console.log('✅ Seeding finished. Semua toko status: SEPI');

    const tenant4 = await prisma.tenant.create({
        data: {
            name: 'Pisang Nugget Lumer',
            category: 'Dessert',
            description: 'Pisang goreng kekinian dengan topping coklat lumer, keju melimpah, dan matcha. Manisnya pas buat pencuci mulut!',
            imageUrl: 'https://images.unsplash.com/photo-1595272767078-29ba04c004d8', // Foto Pisang/Dessert
            address: 'Stand D-02 (Area Santai)',
            status: 'SEPI',
            menus: {
                create: [
                    { name: 'Choco Cheese Lava', price: 20000, description: 'Pisang nugget siram coklat dan parutan keju', imageUrl: 'https://dummyimage.com/300' },
                    { name: 'Tiramisu Oreo', price: 22000, description: 'Topping tiramisu dengan remah oreo', imageUrl: 'https://dummyimage.com/300' },
                    { name: 'Mix 3 Rasa', price: 25000, description: 'Bebas pilih 3 rasa favoritmu', imageUrl: 'https://dummyimage.com/300' },
                ],
            },
            users: {
                create: {
                    email: 'pisang@fest.com',
                    password: hashedPassword,
                    role: 'TENANT_ADMIN',
                },
            },
        },
    });
    console.log(`Created: ${tenant4.name} (Owner: pisang@fest.com)`);

    // --- TENANT 5: TAKOYAKI (Kategori Jajanan - Jepang) ---
    const tenant5 = await prisma.tenant.create({
        data: {
            name: 'Takoyaki Oishii',
            category: 'Jajanan',
            description: 'Bola-bola gurita asli Jepang! Disajikan dengan saus spesial, mayones, dan katsuobushi yang menari-nari.',
            imageUrl: 'https://images.unsplash.com/photo-1615887023516-9b6c5072a4a7', // Foto Takoyaki
            address: 'Stand D-03 (Sebelah Pisang Nugget)',
            status: 'SEPI',
            menus: {
                create: [
                    { name: 'Takoyaki Octopus (Isi 6)', price: 25000, description: 'Isian potongan gurita asli', imageUrl: 'https://dummyimage.com/300' },
                    { name: 'Takoyaki Cheese (Isi 6)', price: 23000, description: 'Isian keju mozarella meleleh', imageUrl: 'https://dummyimage.com/300' },
                    { name: 'Okonomiyaki', price: 30000, description: 'Martabak jepang dengan sayur dan seafood', imageUrl: 'https://dummyimage.com/300' },
                ],
            },
            users: {
                create: {
                    email: 'tako@fest.com',
                    password: hashedPassword,
                    role: 'TENANT_ADMIN',
                },
            },
        },
    });
    console.log(`Created: ${tenant5.name} (Owner: tako@fest.com)`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });