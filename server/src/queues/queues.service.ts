import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class QueuesService {

    // 1. USER: Ambil Nomor Antrian (Scan QR atau Auto dari Order)
    // PERBAIKAN: Tambahkan parameter opsional 'orderId'
    async joinQueue(tenantId: number, orderId?: string) {
        // Cek tokonya ada gak?
        const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant) throw new NotFoundException('Toko tidak ditemukan');

        // Hitung antrian HARI INI saja
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const countToday = await prisma.queue.count({
            where: {
                tenantId: tenantId,
                createdAt: { gte: today }
            }
        });

        const queueNumber = `A-${countToday + 1}`; // A-1, A-2...

        // Simpan ke Database
        const newQueue = await prisma.queue.create({
            data: {
                number: queueNumber,
                tenantId: tenantId,
                status: 'WAITING',
                orderId: orderId // 👈 Sekarang aman, karena ada di parameter
            }
        });

        // Update status keramaian toko
        await this.updateTenantCrowdStatus(tenantId);

        return newQueue;
    }

    // 2. PUBLIC: Cek Info Keramaian
    async getQueueInfo(tenantId: number) {
        const waitingCount = await prisma.queue.count({
            where: { tenantId, status: 'WAITING' }
        });

        const currentServing = await prisma.queue.findFirst({
            where: { tenantId, status: 'CALLED' },
            orderBy: { updatedAt: 'desc' }
        });

        return {
            tenantId,
            waitingCount,
            currentNumber: currentServing?.number || '-',
            estimatedWaitTime: waitingCount * 3,
            isCrowded: waitingCount > 5
        };
    }

    // 3. TENANT: Panggil atau Selesaikan Antrian
    async updateStatus(queueId: number, status: 'CALLED' | 'DONE' | 'CANCELLED') {
        const queue = await prisma.queue.update({
            where: { id: queueId },
            data: { status }
        });

        await this.updateTenantCrowdStatus(queue.tenantId);
        return queue;
    }

    // 4. TENANT: Dashboard (Lihat antrian + detail pesanan)
    async getTenantDashboard(tenantId: number) {
        return await prisma.queue.findMany({
            where: {
                tenantId,
                status: { in: ['WAITING', 'CALLED'] }
            },
            include: {
                order: {
                    select: {
                        id: true,
                        items: true,
                        totalAmount: true,
                        customer: {
                            select: { email: true, phone: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });
    }

    // --- HELPER ---
    private async updateTenantCrowdStatus(tenantId: number) {
        const waitingCount = await prisma.queue.count({
            where: { tenantId, status: 'WAITING' }
        });

        let newStatus = 'SEPI';
        let isViral = false;

        if (waitingCount > 5) {
            newStatus = 'RAMAI';
            isViral = true;
        } else if (waitingCount > 2) {
            newStatus = 'SEDANG';
        }

        await prisma.tenant.update({
            where: { id: tenantId },
            data: { status: newStatus, isViral: isViral }
        });
    }
}