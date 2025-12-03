import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UpdateTenantDto } from './dto/update-tenant.dto';

const prisma = new PrismaClient();

@Injectable()
export class TenantsService {

  // Ambil SEMUA data toko
  async findAll() {
    return await prisma.tenant.findMany({
      include: { menus: true } // Sertakan menu biar lengkap
    });
  }

  async findOne(id: number) {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: { menus: true }
    });
    if (!tenant) throw new NotFoundException(`Toko dengan ID ${id} tidak ditemukan`);
    return tenant;
  }

  // --- PROTECTED (Butuh Login) ---

  // 1. CREATE: Bikin Toko + Klaim Kepemilikan
  async create(data: any, userId: number) {
    // A. Bikin Toko di Database
    const newTenant = await prisma.tenant.create({
      data: {
        name: data.name,
        category: data.category,
        description: data.description || '',
        imageUrl: data.imageUrl || '',
        address: data.address || '',
        status: 'SEPI' // Default
      }
    });

    // B. [PENTING] Update User yang login agar terhubung ke toko ini
    await prisma.userTenant.update({
      where: { id: userId },
      data: { tenantId: newTenant.id }
    });

    return newTenant;
  }

  // 2. UPDATE: Edit data toko
  async update(id: number, data: UpdateTenantDto) {
    // Cek dulu tokonya ada gak
    await this.findOne(id);

    return await prisma.tenant.update({
      where: { id },
      data: data // Aman langsung pass object
    });
  }

  // 3. DELETE: Hapus toko
  async delete(id: number) {
    await this.findOne(id);

    // Hapus Toko (UserTenant yang terhubung otomatis jadi tenantId=null jika di-set onDelete: SetNull di schema, 
    // tapi kalau default Prisma biasanya error foreign key.
    // Aman-nya: Kita putuskan dulu hubungan user-nya)

    // 1. Cari user yang punya toko ini, set tenantId jadi null
    await prisma.userTenant.updateMany({
      where: { tenantId: id },
      data: { tenantId: null }
    });

    // 2. Baru hapus tokonya
    return await prisma.tenant.delete({
      where: { id }
    });
  }

  // 4. ADD MENU (Fitur tambahan)
  async addMenu(tenantId: number, data: any) {
    return await prisma.menu.create({
      data: {
        name: data.name,
        price: Number(data.price),
        description: data.description,
        imageUrl: data.imageUrl,
        isAvailable: true,
        tenantId: tenantId
      }
    });
  }
}
