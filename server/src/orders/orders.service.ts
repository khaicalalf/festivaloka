import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { QueuesService } from '../queues/queues.service';
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

    async checkout(data: any) {
        const { email, phone, totalAmount, tenantId, items } = data;

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

        const order = await prisma.order.create({
            data: {
                id: `ORDER-${Date.now()}`,
                totalAmount: totalAmount,
                status: 'PENDING',
                tenantId: tenantId,
                customerId: customer.id,
                items: items
            }
        });

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
                name: item.name.substring(0, 50)
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

        if (transactionStatus == 'capture') {
            if (fraudStatus == 'challenge') { /* ... */ }
            else if (fraudStatus == 'accept') { newStatus = 'PAID'; }
        } else if (transactionStatus == 'settlement') {
            newStatus = 'PAID';
        } else if (['cancel', 'deny', 'expire'].includes(transactionStatus)) {
            newStatus = 'CANCELLED';
        }

        if (newStatus === 'PAID' && order.status !== 'PAID') {
            console.log(`Order ${orderId} LUNAS. Generating Queue...`);

            const lastQueue = await prisma.queue.findFirst({
                where: { tenantId: order.tenantId },
                orderBy: { createdAt: 'desc' }
            });

            const currentWaiting = await prisma.queue.count({
                where: { tenantId: order.tenantId, status: 'WAITING' }
            });

            let pointMultiplier = 1;

            if (lastQueue) {
                const now = new Date();
                const diffMinutes = (now.getTime() - lastQueue.createdAt.getTime()) / 60000;

                if (diffMinutes >= 45 && currentWaiting === 0) {
                    console.log(`💎 DOUBLE POINT! (Sepi ${Math.round(diffMinutes)} menit)`);
                    pointMultiplier = 2;
                }
            } else {
                pointMultiplier = 2;
            }

            const queue = await this.queuesService.joinQueue(order.tenantId, order.id);

            const items = order.items as any[];

            let totalQty = 0;
            if (Array.isArray(items)) {
                totalQty = items.reduce((acc, item) => acc + (item.qty || 1), 0);
            }

            const pointsEarned = totalQty * pointMultiplier;

            console.log(`POIN: Beli ${totalQty} items x ${pointMultiplier} = ${pointsEarned} Poin`);
            if (order.customer) {
                await prisma.$transaction([
                    prisma.order.update({
                        where: { id: orderId },
                        data: {
                            status: 'PAID',
                            queueNumber: queue.number,
                            pointsEarned: pointsEarned
                        }
                    }),
                    prisma.customer.update({
                        where: { id: order.customer.id },
                        data: { points: { increment: pointsEarned } }
                    })
                ]);
            } else {
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

    async getHistoryByEmail(email: string) {
        const customer = await prisma.customer.findUnique({
            where: { email: email }
        });

        if (!customer) {
            return [];
        }

        const orders = await prisma.order.findMany({
            where: { customerId: customer.id },
            orderBy: { createdAt: 'desc' },
            include: {
                tenant: {
                    select: {
                        name: true,
                        imageUrl: true,
                        address: true
                    }
                },
                queue: {
                    select: {
                        number: true,
                        status: true
                    }
                }
            }
        });

        return orders;
    }
}