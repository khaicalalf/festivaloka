import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request, ParseIntPipe, UnauthorizedException } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport'; // Guard JWT
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { CreateMenuDto } from './dto/create-menu-tenant.dto';

@ApiTags('Tenants (Management)')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) { }

  // --- PUBLIC ---
  @Get()
  @ApiOperation({ summary: 'Lihat semua toko (Public)' })
  findAll() { return this.tenantsService.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Lihat detail toko (Public)' })
  findOne(@Param('id', ParseIntPipe) id: number) { return this.tenantsService.findOne(id); }


  // --- PROTECTED (Hanya Owner/Admin) ---

  @UseGuards(AuthGuard('jwt')) // 🔒 Wajib Login
  @ApiBearerAuth()             // 🔑 Tombol gembok di Swagger
  @Post()
  @ApiOperation({ summary: '[AUTH] Buka Toko Baru (Otomatis jadi Owner)' })
  create(@Body() data: CreateTenantDto, @Request() req) {
    const userId = req.user.userId; // Dapat dari Token JWT

    // Opsional: Validasi kalau dia sudah punya toko, gak boleh bikin lagi
    if (req.user.tenantId && req.user.role !== 'SUPER_ADMIN') {
      throw new UnauthorizedException("Satu akun hanya boleh memiliki satu toko!");
    }

    return this.tenantsService.create(data, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Put(':id')
  @ApiOperation({ summary: '[AUTH] Update Info Toko (Hanya Owner)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateTenantDto, @Request() req) {
    // CEK KEPEMILIKAN:
    // Boleh edit JIKA: Role Super Admin ATAU TenantId di token sama dengan ID yg mau diedit
    const isOwner = req.user.tenantId === id;
    const isAdmin = req.user.role === 'SUPER_ADMIN';

    if (!isOwner && !isAdmin) {
      throw new UnauthorizedException("Anda bukan pemilik toko ini!");
    }

    return this.tenantsService.update(id, data);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: '[AUTH] Hapus Toko (Hanya Owner)' })
  delete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    // CEK KEPEMILIKAN
    const isOwner = req.user.tenantId === id;
    const isAdmin = req.user.role === 'SUPER_ADMIN';

    if (!isOwner && !isAdmin) {
      throw new UnauthorizedException("Anda dilarang menghapus toko orang lain!");
    }

    return this.tenantsService.delete(id);
  }

  // --- MENU MANAGEMENT ---
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post(':id/menus')
  @ApiOperation({ summary: '[AUTH] Tambah Menu ke Toko' })
  addMenu(@Param('id', ParseIntPipe) tenantId: number, @Body() data: CreateMenuDto, @Request() req) {
    // VALIDASI KEPEMILIKAN:
    const user = req.user;

    // 1. Cek apakah dia Super Admin?
    const isSuperAdmin = user.role === 'SUPER_ADMIN';

    // 2. Cek apakah dia Owner toko INI? (tenantId di token === tenantId di URL)
    const isOwner = user.tenantId === tenantId;

    if (!isSuperAdmin && !isOwner) {
      throw new UnauthorizedException("Anda bukan pemilik toko ini! Silakan Login ulang jika baru membuat toko.");
    }

    return this.tenantsService.addMenu(tenantId, data);
  }
}