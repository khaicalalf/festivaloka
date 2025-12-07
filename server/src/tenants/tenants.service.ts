import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { CreateMenuDto } from './dto/create-menu.dto';

const prisma = new PrismaClient();

@Injectable()
export class TenantsService {

  async findAll() {
    return await prisma.tenant.findMany({
      include: { menus: true }
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

  async create(data: any, userId: number) {
    const newTenant = await prisma.tenant.create({
      data: {
        name: data.name,
        category: data.category,
        description: data.description || '',
        imageUrl: data.imageUrl || '',
        address: data.address || '',
        status: 'SEPI'
      }
    });

    await prisma.userTenant.update({
      where: { id: userId },
      data: { tenantId: newTenant.id }
    });

    return newTenant;
  }

  async update(id: number, data: UpdateTenantDto) {
    await this.findOne(id);

    return await prisma.tenant.update({
      where: { id },
      data: data
    });
  }

  async delete(id: number) {
    await this.findOne(id);

    await prisma.userTenant.updateMany({
      where: { tenantId: id },
      data: { tenantId: null }
    });
    return await prisma.tenant.delete({
      where: { id }
    });
  }

  async addMenu(tenantId: number, data: CreateMenuDto) {
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

  async validateMenuOwnership(menuId: number, userId: number, userTenantId: number, role: string) {
    if (role === 'SUPER_ADMIN') return true;
    const menu = await prisma.menu.findUnique({ where: { id: menuId } });
    if (!menu) throw new NotFoundException(`Menu dengan ID ${menuId} tidak ditemukan`);
    if (menu.tenantId !== userTenantId) {
      throw new UnauthorizedException("Anda tidak berhak mengedit menu toko lain!");
    }
  }

  async updateMenu(menuId: number, data: any) {
    return await prisma.menu.update({
      where: { id: menuId },
      data: {
        name: data.name,
        price: data.price ? Number(data.price) : undefined,
        description: data.description,
        imageUrl: data.imageUrl,
        isAvailable: data.isAvailable
      }
    });
  }
  async deleteMenu(menuId: number) {
    return await prisma.menu.delete({
      where: { id: menuId }
    });
  }
}
