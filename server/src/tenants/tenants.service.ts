import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class TenantsService {

  // Ambil SEMUA data toko
  async findAll() {
    return await prisma.tenant.findMany({
      include: {
        menus: true, // Sekalian ambil daftar menunya
      },
    });
  }

  // Ambil SATU toko berdasarkan ID
  async findOne(id: number) {
    return await prisma.tenant.findUnique({
      where: { id: id },
      include: {
        menus: true,
      },
    });
  }

  // (Opsional) Buat Toko Baru
  async create(data: any) {
    return await prisma.tenant.create({ data });
  }
}