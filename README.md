# FestivaLoka 🎪

> **Hackathon IMPHNEN x KOLOSAL AI**  
> Platform manajemen festival berbasis AI yang menghubungkan pengunjung dengan tenant (pedagang) di acara festival. Sistem ini menyediakan fitur pemesanan makanan/minuman, manajemen antrian, dan rekomendasi AI untuk meningkatkan pengalaman pengunjung festival.

🌐 **Live Demo**: [festivaloka.netlify.app](https://festivaloka.netlify.app)  
🔗 **API Documentation**: [festivaloka-dev.up.railway.app/docs](https://festivaloka-dev.up.railway.app/docs)


## 📋 Deskripsi Proyek

FestivaLoka adalah aplikasi web fullstack yang dikembangkan untuk **Hackathon IMPHNEN**, memanfaatkan teknologi **KOLOSAL AI** untuk memberikan pengalaman festival yang lebih cerdas dan efisien. Platform ini dirancang untuk mempermudah pengelolaan festival dan meningkatkan pengalaman pengunjung melalui rekomendasi berbasis AI.

Platform ini memungkinkan:

- **Pengunjung**: Memesan makanan/minuman, melihat denah festival, mendapat rekomendasi AI, dan mengumpulkan poin loyalitas
- **Tenant**: Mengelola menu, memantau pesanan, dan mengatur status toko
- **Admin**: Mengelola tenant, memonitor transaksi, dan menganalisis performa festival

## 🛠️ Tech Stack

### Backend
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT + Passport
- **Payment Gateway**: Midtrans
- **AI Integration**: KOLOSAL AI untuk rekomendasi tenant dan menu
- **API Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Router**: React Router v7
- **Language**: TypeScript

## ✨ Fitur Utama

### Untuk Pengunjung
- 🍔 Pemesanan makanan/minuman dari berbagai tenant
- 🎯 Rekomendasi tenant berdasarkan preferensi (AI-powered)
- 🗺️ Peta interaktif lokasi tenant di festival
- ⏱️ Sistem antrian real-time
- 💳 Pembayaran online via Midtrans
- ⭐ Poin loyalitas untuk setiap pembelian

### Untuk Tenant
- 📊 Dashboard untuk monitoring pesanan
- 🍕 Manajemen menu (tambah, edit, hapus)
- 📋 Manajemen antrian pelanggan
- 📈 Status toko (SEPI/SEDANG/RAMAI)
- 💰 Laporan transaksi

### Untuk Admin
- 👥 Manajemen tenant festival
- 🔐 Sistem role-based access (Tenant Admin & Tenant Karyawan)

## 🏗️ Struktur Database

### Models Utama
- **Customer**: Data pelanggan, poin loyalitas
- **Tenant**: Data toko/pedagang di festival
- **Menu**: Daftar menu per tenant
- **Order**: Transaksi pembelian
- **Queue**: Sistem antrian
- **UserTenant**: Admin dan pengelola tenant

## 🚀 Instalasi & Setup

### Prerequisites
- Node.js (v18 atau lebih tinggi)
- PostgreSQL
- npm atau yarn

### 1. Clone Repository
```bash
git clone <repository-url>
cd festivaloka
```

### 2. Setup Backend

```bash
cd server

# Install dependencies
npm install

# Setup environment variables
# Buat file .env di folder server dengan isi:
# DATABASE_URL="postgresql://user:password@localhost:5432/festivaloka"
# JWT_SECRET="your-secret-key"
# MIDTRANS_SERVER_KEY="your-midtrans-server-key"
# MIDTRANS_CLIENT_KEY="your-midtrans-client-key"
# PORT=3000

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed database
npx prisma db seed

# Start development server
npm run start:dev
```

Backend akan berjalan di `http://localhost:3000`
API Documentation (Swagger) tersedia di `http://localhost:3000/docs`

### 3. Setup Frontend

```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

## 📡 API Endpoints

Base URL: `http://localhost:3000/api`  
**Live API**: `https://festivaloka-dev.up.railway.app/api`  
**Swagger Documentation**: [https://festivaloka-dev.up.railway.app/docs](https://festivaloka-dev.up.railway.app/docs)

### Authentication (UserTenant)
```
POST   /api/auth/register    - Register user baru (tenant admin)
POST   /api/auth/login       - Login untuk tenant admin
```

### Tenants (Management)
```
GET    /api/tenants          - Get semua tenant
POST   /api/tenants          - Create tenant baru (admin only)
GET    /api/tenants/:id      - Get detail tenant
PUT  /api/tenants/:id      - Update tenant
DELETE /api/tenants/:id      - Delete tenant (admin only)
```

### Tenant Menus (Management Menu per Tenant)
```
POST   /api/tenants/:tenantId/menus        - Create menu baru untuk tenant
PUT  /api/tenants/menus/:menuId            - Update menu
DELETE /api/tenants/menus/:menuId          - Delete menu
```

### Orders (Pesanan & Pembayaran)
```
GET    /api/orders/result/:id       - Get result order
GET    /api/orders/history          - Get history order by email
POST   /api/orders/checkout         - Create order baru (dengan Midtrans payment)
POST   /api/orders/notifications    - Midtrans payment webhook
```

### Queues (Sistem Antrian)
```
GET    /api/queues/info/:tenantId    - Get dashboard antrian untuk tenant
GET    /api/queues/dashboard/:tenantId - Get detail antrian
PATCH  /api/queues/:id/status        - Update status antrian
```

### AI (KOLOSAL AI - Rekomendasi)
```
GET   /api/kolosal-ai/tenantByAI     - Get rekomendasi tenant berdasarkan preferensi pengunjung
POST   /api/kolosal-ai/rekomendasi     - Get rekomendasi tenant berdasarkan preferensi pengunjung
POST   /api/kolosal-ai/voice-order     - Create order via voice input
```

> **📖 Dokumentasi Lengkap**  
> Untuk detail request/response body, schema, dan testing langsung, kunjungi [Swagger UI](https://festivaloka-dev.up.railway.app/docs)


## 📝 Scripts

### Server
```bash
npm run start         # Production mode
npm run start:dev     # Development mode dengan watch
npm run start:debug   # Debug mode
npm run build         # Build untuk production
npm run lint          # Lint code
npm run test          # Run tests
```

### Client
```bash
npm run dev           # Development mode
npm run build         # Build untuk production
npm run preview       # Preview production build
npm run lint          # Lint code
```

## 🗂️ Struktur Project

```
festivaloka/
├── server/                 # Backend (NestJS)
│   ├── src/
│   │   ├── ai/            # AI recommendation module
│   │   ├── auth/          # Authentication & authorization
│   │   ├── orders/        # Order management
│   │   ├── queues/        # Queue management
│   │   ├── tenants/       # Tenant management
│   │   └── main.ts        # Application entry point
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── package.json
│
└── client/                # Frontend (React + Vite)
    ├── src/
    │   ├── api/           # API client functions
    │   ├── components/    # Reusable components
    │   ├── hooks/         # Custom React hooks
    │   ├── pages/         # Page components
    │   │   ├── admin/     # Admin pages
    │   │   ├── HomePage.tsx
    │   │   ├── DenahPage.tsx
    │   │   └── TransactionResultPage.tsx
    │   ├── types/         # TypeScript types
    │   └── App.tsx        # Root component
    └── package.json
```

## 🔐 Environment Variables

### Server (.env)
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/festivaloka"

# JWT
JWT_SECRET="your-jwt-secret-key"

# Midtrans Payment Gateway
MIDTRANS_SERVER_KEY="your-midtrans-server-key"
MIDTRANS_CLIENT_KEY="your-midtrans-client-key"
MIDTRANS_IS_PRODUCTION=false

# Server
PORT=3000
```

### Client (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

## 🧪 Testing

```bash
# Run unit tests
cd server
npm run test

# Run e2e tests
npm run test:e2e

# Generate coverage report
npm run test:cov
```

## � Dokumentasi

### 📸 Screenshots

> **TODO**: Tambahkan screenshot aplikasi di sini

#### Landing Page
<!-- Tambahkan screenshot landing page -->
![Landing Page](./docs/screenshots/landing-page.png)

#### Dashboard Admin
<!-- Tambahkan screenshot dashboard admin -->
![Dashboard Admin](./docs/screenshots/admin-dashboard.png)

#### Halaman Pemesanan
<!-- Tambahkan screenshot halaman pemesanan -->
![Halaman Pemesanan](./docs/screenshots/order-page.png)

#### Sistem Antrian
<!-- Tambahkan screenshot sistem antrian -->
![Sistem Antrian](./docs/screenshots/queue-system.png)

### 🎥 Video Demo

> **TODO**: Tambahkan link video demo aplikasi

- **Demo Lengkap**: [Link Video Demo](https://example.com/video-demo)
- **Tutorial Penggunaan**: [Link Tutorial](https://example.com/tutorial)
- **Presentasi Pitch**: [Link Presentasi](https://example.com/pitch)

### 📖 Panduan Penggunaan

#### Untuk Pengunjung
1. **Registrasi/Login** - [TODO: Tambahkan panduan]
2. **Melihat Daftar Tenant** - [TODO: Tambahkan panduan]
3. **Memesan Makanan/Minuman** - [TODO: Tambahkan panduan]
4. **Melakukan Pembayaran** - [TODO: Tambahkan panduan]
5. **Melihat Status Antrian** - [TODO: Tambahkan panduan]
6. **Menggunakan Rekomendasi AI** - [TODO: Tambahkan panduan]

#### Untuk Tenant Admin
1. **Login ke Dashboard** - [TODO: Tambahkan panduan]
2. **Mengelola Menu** - [TODO: Tambahkan panduan]
3. **Menerima Pesanan** - [TODO: Tambahkan panduan]
4. **Update Status Antrian** - [TODO: Tambahkan panduan]
5. **Melihat Laporan** - [TODO: Tambahkan panduan]

### 🔧 Troubleshooting

#### Database Connection Error
```
TODO: Tambahkan solusi untuk masalah koneksi database
```

#### Midtrans Payment Failed
```
TODO: Tambahkan solusi untuk masalah pembayaran
```

#### AI Recommendation Not Working
```
TODO: Tambahkan solusi untuk masalah rekomendasi AI
```

### 📊 Arsitektur Sistem

> **TODO**: Tambahkan diagram arsitektur sistem

```
TODO: Tambahkan penjelasan arsitektur
- Frontend Architecture
- Backend Architecture
- Database Schema
- AI Integration Flow
- Payment Gateway Flow
```

## 🤝 Kontribusi

Contributions, issues, dan feature requests sangat diterima!

## 🏆 Hackathon

Proyek ini dikembangkan untuk **Hackathon IMPHNEN** dengan memanfaatkan teknologi **KOLOSAL AI** yang berjudul **MENDORONG USAHA LOKAL DENGAN AI INKLUSIF**
### Implementasi KOLOSAL AI
Fitur AI digunakan untuk:
- Menganalisis preferensi pengunjung
- Memberikan rekomendasi tenant yang sesuai
- Menyarankan menu berdasarkan riwayat pemesanan
- Optimasi pengalaman pengguna dengan machine learning

## 📄 License

UNLICENSED - Private Project

## 👥 Team

### **Team Karasuno** 🏐
> 飛べ | fly .

**Kota Palembang**

#### Team Leader
- **Muhammad Ghufron Khaical Alfaris**  
  📧 mghaikal@gmail.com

#### Members
- **Acmad Fadli Aditama** (profadlibae@gmail.com) - BE Developer
- **Bayu Catur Ramadhan** (bayfore@gmail.com) - FE Developer
- **M. Edu Agritama** (meadraizhen@gmail.com) - FE Developer
- **Ahmad Ryadh** (ahmadryadh721@gmail.com)- FE Developer
- **Muhammad Ghufron Khaical Alfaris** (mghaikal@gmail.com) - Team Leader

---

**FestivaLoka** - Membuat pengalaman festival lebih mudah dan menyenangkan! 🎉  
*Powered by KOLOSAL AI | Built for Hackathon IMPHNEN*
