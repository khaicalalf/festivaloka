import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { TenantsService } from '../tenants/tenants.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AiService {
    constructor(
        private readonly httpService: HttpService,
        private readonly tenantsService: TenantsService,
    ) { }

    async recommend(preferences: string[]) {
        // 1. Ambil data Tenant dari Database kita
        const allTenants = await this.tenantsService.findAll();

        // Kita perkecil datanya biar hemat token AI (Cuma butuh ID, Nama, Deskripsi)
        const tenantData = allTenants.map(t => ({
            id: t.id,
            name: t.name,
            category: t.category,
            desc: t.description,
            menus: t.menus.map(m => m.name).join(', ') // Gabung nama menu jadi string
        }));

        // 2. Siapkan Prompt untuk AI
        const userRequest = preferences.join(', '); // Contoh: "Pedas, Kuah, Murah"

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

        // 3. Tembak ke API Kolosal AI (Atau Mocking Dulu)
        try {
            // --- OPSI 1: Kalau API Key Kolosal Belum Ada/Error, pakai Mocking ini dulu ---
            // Kita filter manual sederhana biar Frontend bisa kerja
            // const mockResult = tenantData
            //     .filter(t =>
            //         t.desc.toLowerCase().includes(preferences[0].toLowerCase()) ||
            //         t.menus.toLowerCase().includes(preferences[0].toLowerCase())
            //     )
            //     .map(t => ({
            //         id: t.id,
            //         reason: `Cocok karena kamu cari ${preferences[0]} dan di sini ada ${t.name}`
            //     }));

            // return mockResult;
            // ---------------------------------------------------------------------------

            // --- OPSI 2: Kalau API Key Sudah Ada, Uncomment kode di bawah ini ---

            const response = await firstValueFrom(
                this.httpService.post('https://api.kolosal.ai/v1/chat/completions', {
                    model: 'Claude Sonnet 4.5',
                    messages: [{ role: 'user', content: prompt }]
                }, {
                    headers: { 'Authorization': 'Bearer kol_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZWYwYmJiM2MtN2I5MC00Nzc3LWIyODgtNGY5MjJjMGFmOTQ0Iiwia2V5X2lkIjoiZDYwOTE4ZmItNDZjNy00YjJlLWI5YmQtOGY2NTA4YTM5YTVhIiwia2V5X25hbWUiOiJmZXN0aXZhbG9rYS1hcHBzIiwiZW1haWwiOiJwcm9mYWRsaWJhZUBnbWFpbC5jb20iLCJyYXRlX2xpbWl0X3JwcyI6bnVsbCwibWF4X2NyZWRpdF91c2UiOm51bGwsImNyZWF0ZWRfYXQiOjE3NjQ2MDkxNDAsImV4cGlyZXNfYXQiOjE3OTYxNDUxNDAsImlhdCI6MTc2NDYwOTE0MH0.Rem8TTEIF0HuRVxormSVtHJA0hxxwAtIqR8TRWjuORM' }
                })
            );
            const rawContent = response.data.choices[0].message.content;

            console.log("Raw dari AI:", rawContent); // Debugging: Biar liat aslinya gimana

            // --- MULAI PEMBERSIHAN ---
            const cleanContent = rawContent
                .replace(/```json/g, '') // Hapus tulisan ```json
                .replace(/```/g, '')     // Hapus tanda ``` penutup
                .trim();                 // Hapus spasi/enter di awal & akhir
            // --- SELESAI PEMBERSIHAN ---

            return JSON.parse(cleanContent);

        } catch (error) {
            console.error("AI Error:", error);

            // FALLBACK (Jaga-jaga kalau AI error/down, kasih rekomendasi random/default)
            // Supaya aplikasi gak crash di user
            return [
                {
                    id: tenantData[0]?.id || 1,
                    reason: "Rekomendasi default (AI sedang sibuk)"
                }
            ];
        }
    }
}