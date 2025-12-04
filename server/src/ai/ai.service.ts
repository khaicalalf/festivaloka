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
        console.log(`🤖 AI Processing... Preferences: "${preferences || 'None'}"`);

        // 1. AMBIL DATA DARI DATABASE (Tenant + Menu + Queue History)
        const tenants = await this.prisma.tenant.findMany({
            include: {
                menus: { select: { name: true, price: true } },
                queues: {
                    take: 50, // Ambil sampel 50 antrian terakhir
                    orderBy: { updatedAt: 'desc' },
                    select: { status: true, createdAt: true, updatedAt: true }
                }
            }
        });

        // 2. PRE-PROCESS DATA (Hitung Statistik Manual Dulu) 🛠️
        const tenantsContext = tenants.map(t => {
            // Hitung jumlah antrian yang statusnya 'WAITING'
            const waitingCount = t.queues.filter(q => q.status === 'WAITING').length;

            // Hitung rata-rata kecepatan masak dari data 'DONE'
            const completedOrders = t.queues.filter(q => q.status === 'DONE');
            let avgPrepTimeMinutes = 10; // Default standar 10 menit

            if (completedOrders.length > 0) {
                const totalDuration = completedOrders.reduce((acc, q) => {
                    // Selisih waktu Selesai - Dibuat (dalam menit)
                    const duration = (q.updatedAt.getTime() - q.createdAt.getTime()) / 60000;
                    return acc + duration;
                }, 0);
                avgPrepTimeMinutes = Math.round(totalDuration / completedOrders.length);
            }

            // Siapkan objek ringkas untuk dikirim ke Prompt AI
            return {
                id: t.id,
                name: t.name,
                category: t.category,
                // Potong menu biar hemat token, ambil namanya saja
                menus: t.menus.map(m => m.name).join(', ').substring(0, 200),
                stats: {
                    currentQueue: waitingCount,
                    avgSpeedPerOrder: avgPrepTimeMinutes
                }
            };
        });

        // 3. RAKIT PROMPT 🧠
        const prompt = `
        Data Tenant & Statistik Realtime:
        ${JSON.stringify(tenantsContext)}

        Request User: "${preferences ? preferences : ''}"

        Instruksi:
        1. FILTER: 
           - Jika User Request KOSONG: Analisa semua tenant.
           - Jika User Request TERISI (misal: "Pedas", "Minuman"): HANYA pilih tenant yang relevan. Buang sisanya.
        
        2. PREDIKSI WAKTU (Wajib Logis):
           - Rumus: (stats.currentQueue * stats.avgSpeedPerOrder).
           - Jika currentQueue 0, estimasi adalah avgSpeedPerOrder (langsung masak).
           - Berikan kalimat prediksi yang manusiawi (misal: "Sekitar 15 menit").

        3. BERIKAN SKOR (0-100):
           - Berdasarkan relevansi menu dan tingkat keramaian (makin sepi makin tinggi skornya, kecuali user cari yang viral).

        OUTPUT WAJIB JSON ARRAY MURNI:
        [
          {
            "id": 1,
            "relevanceScore": 95,
            "prediction": "Sekitar 10 Menit",
            "reason": "Sangat cocok dengan request pedas, antrian sepi."
          }
        ]
        `;

        // 4. KIRIM KE API AI 🚀
        try {
            const url = 'https://api.kolosal.ai/v1/chat/completions';
            const apiKey = this.configService.get('API_KEY_KOLOSAL_AI');

            // Gunakan lastValueFrom untuk mengubah Observable jadi Promise
            const response = await lastValueFrom(
                this.httpService.post(url, {
                    model: 'Claude Sonnet 4.5',
                    messages: [{ role: 'user', content: prompt }]
                }, {
                    headers: {
                        'Authorization': 'Bearer ' + apiKey,
                        'Content-Type': 'application/json'
                    }
                })
            );

            // 5. PARSING JSON YANG ROBUST (ANTI ERROR) 🛡️
            // AI sering menambahkan teks basa-basi. Kita harus ambil murni JSON-nya saja.
            let textResult = response.data.choices?.[0]?.message?.content || "[]";

            // Cari posisi kurung siku pertama '[' dan terakhir ']'
            const firstBracket = textResult.indexOf('[');
            const lastBracket = textResult.lastIndexOf(']');

            let aiRecommendations = [];

            if (firstBracket !== -1 && lastBracket !== -1) {
                // Ambil text HANYA yang ada di dalam kurung siku
                const jsonString = textResult.substring(firstBracket, lastBracket + 1);

                try {
                    aiRecommendations = JSON.parse(jsonString);
                } catch (e) {
                    // Jika JSON rusak, lempar error biar ditangkap Catch di bawah (Fallback)
                    throw new Error(`JSON Parse Error: ${e.message}`);
                }
            } else {
                // Jika AI ngelantur gak kasih array
                throw new Error("AI Response format invalid (No JSON Array found)");
            }

            // 6. GABUNGKAN DATA (HYDRATION)
            const finalResult = aiRecommendations.map((rec: any) => {
                const originalTenant = tenants.find(t => t.id === rec.id);
                if (!originalTenant) return null; // Skip jika ID ngaco

                // Hitung ulang antrian waiting buat ditampilkan di UI
                const waitingCount = originalTenant.queues.filter(q => q.status === 'WAITING').length;

                return {
                    ...originalTenant,
                    queues: undefined, // Hapus data raw queue biar ringan
                    queueCount: waitingCount, // Ganti dengan angka saja
                    ai_insight: {
                        score: rec.relevanceScore,
                        wait_prediction: rec.prediction,
                        reason: rec.reason
                    }
                };
            }).filter(item => item !== null);

            // Sortir dari score tertinggi
            return finalResult.sort((a, b) => b.ai_insight.score - a.ai_insight.score);

        } catch (error) {
            console.error("⚠️ AI Service Error (Switching to Fallback):", error.message);

            // --- FALLBACK MANUAL (JIKA AI MATI/ERROR) ---
            // Kita kembalikan data tenant biasa dengan hitungan manual
            return tenants.map(t => {
                const waitingCount = t.queues.filter(q => q.status === 'WAITING').length;

                // Hitung manual kasar
                const completedOrders = t.queues.filter(q => q.status === 'DONE');
                let avgSpeed = 10;
                if (completedOrders.length > 0) {
                    avgSpeed = Math.round(completedOrders.reduce((acc, c) => acc + (c.updatedAt.getTime() - c.createdAt.getTime()) / 60000, 0) / completedOrders.length);
                }
                const estTime = waitingCount * avgSpeed;

                return {
                    ...t,
                    queues: undefined,
                    queueCount: waitingCount,
                    ai_insight: {
                        score: 50, // Skor rata-rata
                        wait_prediction: estTime === 0 ? `${avgSpeed} Menit` : `± ${estTime} Menit`,
                        reason: "Mode Hemat Daya (AI Offline), estimasi berdasarkan antrian."
                    }
                };
            }).sort((a, b) => a.queueCount - b.queueCount); // Sort dari yang paling sepi
        }
    }

    async predictOrderFromVoice(speechText: string) {
        console.log(`🎤 Voice Input: "${speechText}"`);

        // 1. SIAPKAN DATA (Menu + Tenant + Estimasi Waktu)
        const tenants = await this.prisma.tenant.findMany({
            include: {
                menus: true,
                queues: {
                    where: { status: 'WAITING' }, // Cuma butuh antrian aktif
                    select: { id: true } // Hemat memori
                }
            }
        });

        // 2. FLATTEN DATA (Jadikan List Menu Datar untuk AI)
        // Kita butuh format text yang gampang dibaca AI
        let menuContext: any[] = [];

        tenants.forEach(t => {
            // Hitung kasar keramaian (Antrian * 10 menit)
            const estTime = t.queues.length * 10;
            const crowdStatus = t.queues.length > 5 ? "Ramai/Lama" : "Sepi/Cepat";

            t.menus.forEach(m => {
                if (m.isAvailable) {
                    menuContext.push({
                        tenantId: t.id,
                        tenantName: t.name,
                        menuId: m.id,
                        menuName: m.name,
                        price: m.price,
                        description: m.description,
                        // Data Kontekstual untuk AI:
                        waitInfo: `${t.queues.length} antrian (${crowdStatus}, ±${estTime} menit)`,
                        tags: t.category // Tambahan info kategori
                    });
                }
            });
        });

        // 3. PROMPT ENGINEERING 🧠
        const prompt = `
        Daftar Menu Tersedia:
        ${JSON.stringify(menuContext)}

        User Berkata: "${speechText}"

        Tugasmu:
        1. Analisa keinginan user (Rasa, Kecepatan/Waktu, Harga, Kuantitas).
        2. PILIH SATU MENU yang paling cocok dari daftar di atas.
           - Jika user bilang "cepet", pilih yang antriannya sedikit.
           - Jika user bilang jumlah (misal: "dua porsi"), isi field quantity. Default quantity = 1.
        3. Jawab HANYA JSON Object (Tanpa markdown):
        
        {
          "tenantId": 1,
          "menuId": 5,
          "quantity": 1,
          "reason": "Alasan singkat (untuk debug)"
        }
        `;

        // 4. TEMBAK KE AI
        try {
            const url = 'https://api.kolosal.ai/v1/chat/completions';
            const apiKey = this.configService.get('API_KEY_KOLOSAL_AI');

            const response = await lastValueFrom(
                this.httpService.post(url, {
                    model: 'Claude Sonnet 4.5',
                    messages: [{ role: 'user', content: prompt }]
                }, {
                    headers: { 'Authorization': 'Bearer ' + apiKey }
                })
            );

            // 5. PARSING JSON (Pake teknik substring yg aman tadi)
            let textResult = response.data.choices?.[0]?.message?.content || "{}";
            const firstBrace = textResult.indexOf('{');
            const lastBrace = textResult.lastIndexOf('}');

            if (firstBrace !== -1 && lastBrace !== -1) {
                const jsonString = textResult.substring(firstBrace, lastBrace + 1);
                const result = JSON.parse(jsonString);

                // Kembalikan format final yang diminta
                return {
                    tenantId: result.tenantId,
                    menuId: result.menuId,
                    quantity: result.quantity || 1,
                    // Opsional: Saya sertakan alasan AI biar seru dilihat di console FE
                    _debug_reason: result.reason
                };
            } else {
                throw new Error("Format AI tidak valid");
            }

        } catch (error) {
            console.error("Voice AI Error:", error.message);
            // Fallback: Kembalikan null atau error biar FE tau AI gagal mengerti
            return {
                tenantId: null,
                menuId: null,
                quantity: 1,
                error: "Maaf, saya tidak mengerti pesanan Anda."
            };
        }
    }
}