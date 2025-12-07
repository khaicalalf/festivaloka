# FestivaLoka 🎪

> **Hackathon IMPHNEN x KOLOSAL AI**  
> Platform manajemen festival berbasis AI yang menghubungkan pengunjung dengan tenant (pedagang) di acara festival. Sistem ini menyediakan fitur pemesanan makanan/minuman, manajemen antrian, dan rekomendasi AI untuk meningkatkan pengalaman pengunjung festival.

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
- 📈 Status toko (OPEN/CLOSED/BUSY)
- 💰 Laporan transaksi

### Untuk Admin
- 👥 Manajemen tenant festival
- 🔐 Sistem role-based access (Super Admin & Tenant Admin)
- 📊 Monitoring transaksi keseluruhan
- 📈 Analytics dan reporting

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

### Authentication
```
POST   /api/auth/register    - Register user baru
POST   /api/auth/login       - Login
GET    /api/auth/profile     - Get user profile (protected)
```

### Tenants
```
GET    /api/tenants          - Get semua tenant
GET    /api/tenants/:id      - Get detail tenant
POST   /api/tenants          - Create tenant (admin only)
PATCH  /api/tenants/:id      - Update tenant
DELETE /api/tenants/:id      - Delete tenant (admin only)
```

### Orders
```
GET    /api/orders           - Get semua orders
GET    /api/orders/:id       - Get detail order
POST   /api/orders           - Create order baru
PATCH  /api/orders/:id       - Update status order
```

### Queues
```
GET    /api/queues           - Get semua antrian
GET    /api/queues/tenant/:tenantId  - Get antrian per tenant
POST   /api/queues           - Create antrian baru
PATCH  /api/queues/:id       - Update status antrian
```

### AI
```
POST   /api/ai/recommend     - Get rekomendasi tenant berdasarkan preferensi
```

Dokumentasi lengkap API tersedia di Swagger UI: `http://localhost:3000/docs`

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

## 🚢 Deployment

### Backend
1. Build aplikasi: `npm run build`
2. Jalankan migrations: `npx prisma migrate deploy`
3. Start server: `npm run start:prod`

### Frontend
1. Build aplikasi: `npm run build`
2. Deploy folder `dist` ke hosting (Vercel, Netlify, dll)

## 🤝 Kontribusi

Contributions, issues, dan feature requests sangat diterima!

## 🏆 Hackathon

Proyek ini dikembangkan untuk **Hackathon IMPHNEN** dengan memanfaatkan teknologi **KOLOSAL AI** untuk memberikan rekomendasi cerdas kepada pengunjung festival berdasarkan preferensi mereka.

### Implementasi KOLOSAL AI
Fitur AI digunakan untuk:
- Menganalisis preferensi pengunjung
- Memberikan rekomendasi tenant yang sesuai
- Menyarankan menu berdasarkan riwayat pemesanan
- Optimasi pengalaman pengguna dengan machine learning

## 📄 License

UNLICENSED - Private Project

## 👥 Author

**Fadli Aditama**

---

**FestivaLoka** - Membuat pengalaman festival lebih mudah dan menyenangkan! 🎉  
*Powered by KOLOSAL AI | Built for Hackathon IMPHNEN*
