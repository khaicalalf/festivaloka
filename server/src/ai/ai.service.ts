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
        console.log("AI Processing for preferences:", preferences || "No Preference");

        // 1. AMBIL DATA MENTAH DARI DB (Tenants + Jumlah Antrian Saat Ini)
        const tenants = await this.prisma.tenant.findMany({
            include: {
                menus: { select: { name: true, price: true } }, // Ambil menu buat bahan analisis AI
                queues: {
                    where: { status: 'WAITING' }, // Cuma butuh yang nunggu
                    select: { id: true }
                }
            }
        });

        // 2. RAKIT DATA AGAR HEMAT TOKEN (Jangan kirim semua field DB)
        const tenantsLite = tenants.map(t => ({
            id: t.id,
            name: t.name,
            category: t.category,
            currentQueue: t.queues.length, // Jumlah antrian real-time
            menus: t.menus.map(m => `${m.name} (${m.price})`).join(', ').substring(0, 200) // Batasi panjang teks
        }));

        // 3. RAKIT PROMPT RAKSASA 🧠
        // Kita minta AI jadi konsultan yang menilai semua toko sekaligus
        const prompt = `
        Data Restoran & Antrian Real-time:
        ${JSON.stringify(tenantsLite)}

        Permintaan User: "${preferences ? preferences : 'Tampilkan semua yang menarik'}"

        Tugasmu sebagai AI Festivaloka:
        1. FILTER: Jika ada preferensi user, pilih HANYA yang relevan. Jika kosong, nilai semua.
        2. PREDIKSI: Berdasarkan 'currentQueue' dan jenis makanannya, tebak berapa menit lagi order selesai.
           (Rumus kasar AI: Minuman ~2mnt/org, Makanan ~5-8mnt/org).
        3. URUTKAN: Dari yang paling direkomendasikan.

        Jawab HANYA JSON Array murni (tanpa markdown) dengan format:
        [
            {
                "id": 1, 
                "relevanceScore": 90, 
                "prediction": "15 Menit (Ramai Lancar)", 
                "reason": "Cocok dengan request pedasmu, antrian ada 3 orang."
            }
        ]
        `;

        // 4. TEMBAK KOLOSAL AI (Claude Sonnet 4.5) 🚀
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

            // 5. PARSING JSON DARI AI
            let textResult = response.data.choices?.[0]?.message?.content || "[]";
            textResult = textResult.replace(/```json|```/g, '').trim();
            const aiRecommendations = JSON.parse(textResult);

            // 6. GABUNGKAN HASIL AI DENGAN DATA ASLI (Hydration)
            // Biar Frontend dapat data lengkap (Gambar, Alamat, dll)
            const finalResult = aiRecommendations.map((rec: any) => {
                const originalTenant = tenants.find(t => t.id === rec.id);
                if (!originalTenant) return null;

                return {
                    ...originalTenant, // Data lengkap tenant (DB)
                    ai_insight: {      // Data tambahan dari AI
                        score: rec.relevanceScore,
                        wait_prediction: rec.prediction,
                        reason: rec.reason
                    }
                };
            }).filter(item => item !== null); // Hapus yang null

            // Sort by Score Tertinggi
            return finalResult.sort((a, b) => b.ai_insight.score - a.ai_insight.score);

        } catch (error) {
            console.error("AI Batch Error:", error.response?.data || error.message);

            // FALLBACK JIKA AI ERROR / LIMIT
            // Kembalikan list tenant biasa disortir berdasarkan antrian terpendek
            return tenants.map(t => ({
                ...t,
                ai_insight: {
                    score: 50,
                    wait_prediction: `${t.queues.length * 5} Menit (Estimasi Kasar)`,
                    reason: "AI Sedang sibuk, menampilkan data antrian manual."
                }
            })).sort((a, b) => a.queues.length - b.queues.length);
        }
    }
}