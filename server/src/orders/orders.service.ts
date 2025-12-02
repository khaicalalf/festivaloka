import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const midtransClient = require('midtrans-client');

const prisma = new PrismaClient();

@Injectable()
export class OrdersService {
    private core;

    constructor(private configService: ConfigService) {
        const sKey = this.configService.get<string>('SERVER_KEY_MIDTRANS');
        const cKey = this.configService.get<string>('CLIENT_KEY_MIDTRANS');
        this.core = new midtransClient.Snap({
            isProduction: false, // Sandbox Mode
            serverKey: sKey,
            clientKey: cKey
        });
    }

    // 1. Fungsi Checkout (Mulai Transaksi)
    async checkout(data: any) {
        const { email, phone, totalAmount, tenantId, items } = data;

        // A. Cari Customer (Kalau belum ada, bikin baru)
        // Ini logika "Guest Checkout" yang kamu minta tadi
        let customer = await prisma.customer.findUnique({
            where: { email: email }
        });

        if (!customer) {
            customer = await prisma.customer.create({
                data: {
                    email: email,
                    phone: phone,
                    points: 0 // User baru poinnya 0
                }
            });
        }

        // B. Simpan Order ke Database (Status PENDING)
        const order = await prisma.order.create({
            data: {
                id: `ORDER-${Date.now()}`, // ID Unik: ORDER-1701234567
                totalAmount: totalAmount,
                status: 'PENDING',
                tenantId: tenantId,
                customerId: customer.id,
            }
        });

        // C. Minta Token ke Midtrans
        const parameter = {
            transaction_details: {
                order_id: order.id,
                gross_amount: totalAmount,
            },
            customer_details: {
                email: email,
                phone: phone,
            },
            // Opsional: Kirim detail item biar muncul di struk Midtrans
            item_details: items.map(item => ({
                id: `MENU-${Date.now()}`, // ID asal aja buat dummy
                price: item.price,
                quantity: item.qty,
                name: item.name
            }))
        };

        const transaction = await this.core.createTransaction(parameter);

        // Balikin Token & OrderID ke Frontend
        return {
            snapToken: transaction.token,
            orderId: order.id
        };
    }

    // 2. Fungsi Konfirmasi Bayar (Update Status & Tambah Poin)
    // Dipanggil Frontend setelah popup Midtrans sukses
    // 2. Fungsi Konfirmasi Bayar
    async confirmPayment(orderId: string) {
        // A. Cari Ordernya
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { customer: true }
        });

        // Validasi 1: Order tidak ketemu atau sudah bayar
        if (!order || order.status === 'PAID') {
            return { message: 'Order tidak ditemukan atau sudah dibayar' };
        }

        // Validasi 2: Cek Customer (INI SOLUSI ERRORNYA) 👈
        // Kita paksa cek: Kalau customernya null, lempar error atau stop.
        if (!order.customer) {
            return { message: 'Data customer tidak ditemukan pada order ini' };
        }

        // B. Hitung Poin
        const pointsEarned = Math.floor(order.totalAmount / 10000);

        // C. Update Database
        // Karena di atas sudah ada "if (!order.customer)", TypeScript sekarang percaya data customer ada.
        await prisma.$transaction([
            // 1. Ubah status order jadi PAID
            prisma.order.update({
                where: { id: orderId },
                data: { status: 'PAID' }
            }),
            // 2. Tambah poin customer
            prisma.customer.update({
                where: { id: order.customer.id }, // Sekarang aman, garis merah hilang
                data: { points: { increment: pointsEarned } }
            })
        ]);

        return {
            status: 'Success',
            message: 'Pembayaran berhasil dikonfirmasi',
            pointsAdded: pointsEarned
        };
    }

    async handleNotification(notification: any) {
        const orderId = notification.order_id;
        const transactionStatus = notification.transaction_status;
        const fraudStatus = notification.fraud_status;

        console.log(`WEBHOOK RECEIVED: ${orderId} - ${transactionStatus}`);

        // Cari Order di Database
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { customer: true }
        });

        if (!order) return { message: 'Order not found' };

        // LOGIKA STATUS MIDTRANS
        let newStatus = order.status; // Default status lama

        if (transactionStatus == 'capture') {
            // Khusus Kartu Kredit: Cek fraud status
            if (fraudStatus == 'challenge') {
                // Transaksi dicurigai, jangan update lunas dulu
            } else if (fraudStatus == 'accept') {
                newStatus = 'PAID';
            }
        } else if (transactionStatus == 'settlement') {
            // Ini status SUKSES untuk GoPay, VA, Qris, dll.
            newStatus = 'PAID';
        } else if (
            transactionStatus == 'cancel' ||
            transactionStatus == 'deny' ||
            transactionStatus == 'expire'
        ) {
            newStatus = 'CANCELLED';
        }

        // Jika status berubah jadi PAID, kita update DB & Tambah Poin
        if (newStatus === 'PAID' && order.status !== 'PAID') {
            // Hitung Poin
            const pointsEarned = Math.floor(order.totalAmount / 10000);

            if (order.customer) {
                await prisma.$transaction([
                    prisma.order.update({
                        where: { id: orderId },
                        data: { status: 'PAID' }
                    }),
                    prisma.customer.update({
                        where: { id: order.customer.id },
                        data: { points: { increment: pointsEarned } }
                    })
                ]);
            } else {
                await prisma.order.update({
                    where: { id: orderId },
                    data: { status: 'PAID' }
                });
            }
            console.log(`Order ${orderId} LUNAS. Poin ditambahkan.`);
        } else if (newStatus === 'CANCELLED') {
            await prisma.order.update({
                where: { id: orderId },
                data: { status: 'CANCELLED' }
            });
        }

        return { status: 'OK' };
    }
}