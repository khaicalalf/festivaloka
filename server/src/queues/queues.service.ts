import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class QueuesService {

    // 1. USER: Ambil Nomor Antrian (Scan QR)
    async joinQueue(tenantId: number) {
        // Cek tokonya ada gak?
        const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant) throw new NotFoundException('Toko tidak ditemukan');

        // Hitung antrian HARI INI saja (Biar besok reset jadi A-1 lagi)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const countToday = await prisma.queue.count({
            where: {
                tenantId: tenantId,
                createdAt: { gte: today } // Ambil yang dibuat setelah jam 00:00 hari ini
            }
        });

        const queueNumber = `A-${countToday + 1}`; // A-1, A-2, dst.

        // Simpan ke Database
        const newQueue = await prisma.queue.create({
            data: {
                number: queueNumber,
                tenantId: tenantId,
                status: 'WAITING'
            }
        });

        // Update status keramaian toko (Biar peta jadi merah/hijau)
        await this.updateTenantCrowdStatus(tenantId);

        return newQueue;
    }

    // 2. PUBLIC: Cek Info Keramaian (Buat Peta & Waiting Room)
    async getQueueInfo(tenantId: number) {
        // Hitung berapa orang yang statusnya masih WAITING
        const waitingCount = await prisma.queue.count({
            where: { tenantId, status: 'WAITING' }
        });

        // Cek siapa yang lagi dipanggil (CALLED)
        const currentServing = await prisma.queue.findFirst({
            where: { tenantId, status: 'CALLED' },
            orderBy: { updatedAt: 'desc' }
        });

        return {
            tenantId,
            waitingCount,
            currentNumber: currentServing?.number || '-', // Kalau gak ada yg dipanggil, strip
            estimatedWaitTime: waitingCount * 3, // Asumsi 1 orang = 3 menit
            isCrowded: waitingCount > 5 // Kalau lebih dari 5 antrian, anggap RAMAI (Merah)
        };
    }

    // 3. TENANT: Panggil atau Selesaikan Antrian
    async updateStatus(queueId: number, status: 'CALLED' | 'DONE' | 'CANCELLED') {
        const queue = await prisma.queue.update({
            where: { id: queueId },
            data: { status }
        });

        // Update lagi status toko (Siapa tau antrian habis jadi SEPI lagi)
        await this.updateTenantCrowdStatus(queue.tenantId);

        return queue;
    }

    // 4. TENANT: Dashboard (Lihat siapa aja yang ngantri)
    async getTenantDashboard(tenantId: number) {
        return await prisma.queue.findMany({
            where: {
                tenantId,
                status: { in: ['WAITING', 'CALLED'] } // Tampilkan yg nunggu & dipanggil aja
            },
            orderBy: { createdAt: 'asc' } // Yang datang duluan di atas
        });
    }

    // --- HELPER: Update Warna Toko Otomatis ---
    private async updateTenantCrowdStatus(tenantId: number) {
        const waitingCount = await prisma.queue.count({
            where: { tenantId, status: 'WAITING' }
        });

        let newStatus = 'SEPI';
        let isViral = false;

        if (waitingCount > 5) {
            newStatus = 'RAMAI'; // Merah
            isViral = true;
        } else if (waitingCount > 2) {
            newStatus = 'SEDANG'; // Kuning
        }

        // Update tabel Tenant
        await prisma.tenant.update({
            where: { id: tenantId },
            data: { status: newStatus, isViral: isViral }
        });
    }
}