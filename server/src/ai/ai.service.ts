import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { TenantsService } from '../tenants/tenants.service';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
    private readonly prisma = new PrismaClient();

    constructor(
        private readonly httpService: HttpService,
        private readonly tenantsService: TenantsService,
        private configService: ConfigService,
    ) { }

    async recommend(preferences: string[]) {
        // 1. Ambil data Tenant dari db
        const allTenants = await this.tenantsService.findAll();

        const tenantData = allTenants.map(t => ({
            id: t.id,
            name: t.name,
            category: t.category,
            desc: t.description,
            menus: t.menus.map(m => m.name).join(', ')
        }));

        // 2. Siapkan Prompt untuk AI
        const userRequest = preferences.join(', ');

        const prompt = `
      Saya punya daftar restoran berikut:
      ${JSON.stringify(tenantData)}

      User mencari makanan dengan kriteria: "${userRequest}".

      Tugasmu:
      1. Pilih restoran yang paling relevan.
      2. Berikan alasan kenapa cocok.
      
      Jawab HANYA dengan format JSON Array seperti ini (tanpa markdown):
      [
        { "id": 1, "reason": "Karena menyediakan menu pedas level 5" }
      ]
    `;

        // 3. Tembak ke API Kolosal AI
        try {
            const response = await firstValueFrom(
                this.httpService.post('https://api.kolosal.ai/v1/chat/completions', {
                    model: 'Claude Sonnet 4.5',
                    messages: [{ role: 'user', content: prompt }]
                }, {
                    headers: { 'Authorization': 'Bearer ' + process.env.API_KEY_KOLOSAL_AI }
                })
            );
            const rawContent = response.data.choices[0].message.content;

            const cleanContent = rawContent
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();

            return JSON.parse(cleanContent);

        } catch (error) {
            console.error("AI Error:", error);

            return [
                {
                    id: tenantData[0]?.id || 1,
                    reason: "Rekomendasi default (AI sedang sibuk)"
                }
            ];
        }
    }

    async getSmartRecommendations(preferences: string = "") {
        console.log("AI Processing with Historical Data...");

        // 1. AMBIL DATA LEBIH LENGKAP (Tenant + Menu + Queue History)
        const tenants = await this.prisma.tenant.findMany({
            include: {
                menus: { select: { name: true, price: true } },
                queues: {
                    // Ambil 50 data antrian terakhir (Campur WAITING dan DONE)
                    take: 50,
                    orderBy: { updatedAt: 'desc' },
                    select: { status: true, createdAt: true, updatedAt: true }
                }
            }
        });

        // 2. OLAH DATA (Feature Engineering) SEBELUM DIKIRIM KE AI 🛠️
        const tenantsContext = tenants.map(t => {
            // A. Hitung Antrian Saat Ini
            const waitingCount = t.queues.filter(q => q.status === 'WAITING').length;

            // B. Hitung Rata-rata Kecepatan Masak (Hanya dari yang DONE)
            const completedOrders = t.queues.filter(q => q.status === 'DONE');

            let avgPrepTimeMinutes = 10; // Default kalau data kosong (toko baru)

            if (completedOrders.length > 0) {
                const totalDuration = completedOrders.reduce((acc, q) => {
                    // Selisih waktu Selesai - Dibuat (Milliseconds -> Minutes)
                    const duration = (q.updatedAt.getTime() - q.createdAt.getTime()) / 60000;
                    return acc + duration;
                }, 0);
                avgPrepTimeMinutes = Math.round(totalDuration / completedOrders.length);
            }

            // C. Siapkan Data Ringkas untuk AI
            return {
                id: t.id,
                name: t.name,
                category: t.category,
                menus: t.menus.map(m => m.name).join(', ').substring(0, 150), // Hemat token
                stats: {
                    currentQueue: waitingCount,       // Faktor Keramaian Realtime
                    avgSpeedPerOrder: `${avgPrepTimeMinutes} menit` // Faktor Kecepatan Historis
                }
            };
        });

        // 3. RAKIT PROMPT YANG LEBIH PINTAR 🧠
        const prompt = `
        Data Tenant (Termasuk Statistik Kecepatan & Antrian):
        ${JSON.stringify(tenantsContext)}

        Request User: "${preferences ? preferences : ''}"

        Tugasmu (Strict Filtering & Calculation):
        1. FILTER: 
           - Jika user minta spesifik (misal: "Pedas"), HANYA ambil yang menunya relevan. 
           - Jika kosong, ambil semua.
        
        2. HITUNG PREDIKSI (Wajib Pakai Data Stats):
           - Gunakan rumus: (stats.currentQueue * stats.avgSpeedPerOrder).
           - Contoh: Jika antri 5 orang & speed 10 menit = Estimasi 50 menit.
           - Jika 'currentQueue' 0, estimasinya adalah 'avgSpeedPerOrder' (langsung dimasak).

        3. OUTPUT JSON Array:
           [
             {
               "id": 1,
               "relevanceScore": 90,
               "prediction": "Ekspektasi tunggu sekitar 30 Menit",
               "reason": "Antrian ada 3 orang, dan toko ini rata-rata butuh 10 menit per pesanan."
             }
           ]
        `;

        // 4. REQUEST KE KOLOSAL AI (Claude Sonnet 4.5) 🚀
        try {
            const url = 'https://api.kolosal.ai/v1/chat/completions';
            const apiKey = this.configService.get('API_KEY_KOLOSAL_AI');

            const response$ = this.httpService.post(url, {
                model: 'Claude Sonnet 4.5',
                messages: [{ role: 'user', content: prompt }]
            }, {
                headers: {
                    'Authorization': 'Bearer ' + apiKey,
                    'Content-Type': 'application/json'
                }
            });

            const response = await lastValueFrom(response$);

            // 5. PARSING JSON
            let textResult = response.data.choices?.[0]?.message?.content || "[]";
            textResult = textResult.replace(/```json|```/g, '').trim();

            let aiRecommendations = [];
            try {
                aiRecommendations = JSON.parse(textResult);
            } catch (e) {
                console.error("Failed to parse AI JSON");
                aiRecommendations = [];
            }

            // 6. GABUNGKAN DATA (Hydration)
            const finalResult = aiRecommendations.map((rec: any) => {
                const originalTenant = tenants.find(t => t.id === rec.id);
                if (!originalTenant) return null;

                // Ambil data antrian WAITING untuk ditampilkan di UI
                const waitingCount = originalTenant.queues.filter(q => q.status === 'WAITING').length;

                return {
                    ...originalTenant,
                    // Kita timpa data queues biar frontend gak berat load 50 history
                    // Cuma kirim jumlahnya aja
                    queues: undefined,
                    queueCount: waitingCount,

                    ai_insight: {
                        score: rec.relevanceScore,
                        wait_prediction: rec.prediction,
                        reason: rec.reason
                    }
                };
            }).filter(item => item !== null);

            // Sort by Score AI
            return finalResult.sort((a, b) => b.ai_insight.score - a.ai_insight.score);

        } catch (error) {
            console.error("AI Error:", error.message);
            // Fallback: Return raw tenants tanpa AI
            return tenants.slice(0, 5).map(t => ({
                ...t,
                queues: undefined,
                ai_insight: {
                    score: 50,
                    wait_prediction: "Kalkulasi Manual",
                    reason: "AI Sedang Overload"
                }
            }));
        }
    }
}