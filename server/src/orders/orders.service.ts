import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { QueuesService } from '../queues/queues.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const midtransClient = require('midtrans-client');

const prisma = new PrismaClient();

@Injectable()
export class OrdersService {
    private core;

    constructor(
        private configService: ConfigService,
        @Inject(forwardRef(() => QueuesService))
        private queuesService: QueuesService,
    ) {
        const sKey = this.configService.get<string>('SERVER_KEY_MIDTRANS');
        const cKey = this.configService.get<string>('CLIENT_KEY_MIDTRANS');

        this.core = new midtransClient.Snap({
            isProduction: false,
            serverKey: sKey,
            clientKey: cKey
        });
    }

    // 1. Fungsi Checkout
    async checkout(data: any) {
        const { email, phone, totalAmount, tenantId, items } = data;

        // A. Cari/Buat Customer
        let customer = await prisma.customer.findUnique({
            where: { email: email }
        });

        if (!customer) {
            customer = await prisma.customer.create({
                data: {
                    email: email,
                    phone: phone,
                    points: 0
                }
            });
        }

        // B. Simpan Order (PENTING: Simpan items ke DB)
        const order = await prisma.order.create({
            data: {
                id: `ORDER-${Date.now()}`,
                totalAmount: totalAmount,
                status: 'PENDING',
                tenantId: tenantId,
                customerId: customer.id,
                items: items // 👈 Simpan JSON item belanjaan
            }
        });

        // C. Minta Token Midtrans
        const parameter = {
            transaction_details: {
                order_id: order.id,
                gross_amount: totalAmount,
            },
            customer_details: {
                email: email,
                phone: phone,
            },
            item_details: items.map(item => ({
                id: `MENU-${Math.floor(Math.random() * 1000)}`,
                price: item.price,
                quantity: item.qty,
                name: item.name.substring(0, 50) // Midtrans max name length 50
            })),
            callbacks: {
                finish: `https://festivaloka.netlify.app/transaction/${order.id}`
            }
        };

        const transaction = await this.core.createTransaction(parameter);

        return {
            snapToken: transaction.token,
            orderId: order.id
        };
    }

    // 2. Webhook Handler
    // 2. Webhook Handler (LOGIC UTAMA DI SINI)
    async handleNotification(notification: any) {
        const orderId = notification.order_id;
        const transactionStatus = notification.transaction_status;
        const fraudStatus = notification.fraud_status;

        console.log(`WEBHOOK: Order ${orderId} status ${transactionStatus}`);

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { customer: true }
        });

        if (!order) return { message: 'Order not found' };

        let newStatus = order.status;

        // Logika Status Midtrans
        if (transactionStatus == 'capture') {
            if (fraudStatus == 'challenge') {
                // Do nothing
            } else if (fraudStatus == 'accept') {
                newStatus = 'PAID';
            }
        } else if (transactionStatus == 'settlement') {
            newStatus = 'PAID';
        } else if (
            transactionStatus == 'cancel' ||
            transactionStatus == 'deny' ||
            transactionStatus == 'expire'
        ) {
            newStatus = 'CANCELLED';
        }

        // --- UPDATE JIKA PAID ---
        if (newStatus === 'PAID' && order.status !== 'PAID') {
            console.log(`Order ${orderId} LUNAS. Generating Queue...`);

            // 🛠️ 1. LOGIC DOUBLE POIN (Di sini kita pasang)
            // Kita cek antrian terakhir SEBELUM order ini masuk
            const lastQueue = await prisma.queue.findFirst({
                where: { tenantId: order.tenantId },
                orderBy: { createdAt: 'desc' }
            });

            // B. Cek Jumlah Antrian Aktif (WAITING) saat ini
            const currentWaiting = await prisma.queue.count({
                where: {
                    tenantId: order.tenantId,
                    status: 'WAITING'
                }
            });

            let pointMultiplier = 1;

            if (lastQueue) {
                const now = new Date();
                const diffMinutes = (now.getTime() - lastQueue.createdAt.getTime()) / 60000;

                // Syarat: Sepi > 45 menit DAN Antrian Kosong (0)
                if (diffMinutes >= 45 && currentWaiting === 0) {
                    console.log(`💎 DOUBLE POINT APPLIED! (Sepi ${Math.round(diffMinutes)} menit & Antrian 0)`);
                    pointMultiplier = 2;
                }
            } else {
                // Toko baru buka/belum pernah laku -> Double Poin
                pointMultiplier = 2;
            }

            // 🛠️ 2. GENERATE ANTRIAN (Kirim ID Order)
            const queue = await this.queuesService.joinQueue(order.tenantId, order.id);
            console.log(`Queue Created: ${queue.number}`);

            // 🛠️ 3. HITUNG POIN FINAL
            // Rumus: (Total / 10.000) * Multiplier
            const pointsEarned = Math.floor(order.totalAmount / 10000) * pointMultiplier;

            // 4. Update DB (Simpan Poin & Status)
            if (order.customer) {
                await prisma.$transaction([
                    prisma.order.update({
                        where: { id: orderId },
                        data: {
                            status: 'PAID',
                            queueNumber: queue.number,
                            pointsEarned: pointsEarned // Pastikan kolom ini ada di schema.prisma order
                        }
                    }),
                    prisma.customer.update({
                        where: { id: order.customer.id },
                        data: { points: { increment: pointsEarned } }
                    })
                ]);
            } else {
                // Case user tamu (jarang terjadi kalau flow harus login dulu)
                await prisma.order.update({
                    where: { id: orderId },
                    data: {
                        status: 'PAID',
                        queueNumber: queue.number
                    }
                });
            }
        } else if (newStatus === 'CANCELLED') {
            await prisma.order.update({
                where: { id: orderId },
                data: { status: 'CANCELLED' }
            });
        }

        return { status: 'OK' };
    }

    // 3. Cek Status Order
    async findOne(id: string) {
        const order = await prisma.order.findUnique({
            where: { id: id },
            include: {
                tenant: true,
                customer: true,
                queue: true
            }
        });

        if (!order) throw new NotFoundException(`Order ${id} tidak ditemukan`);

        return {
            ...order,
            queueStatus: order.queue?.status || 'NOT_IN_QUEUE'
        };
    }
}