import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request, ParseIntPipe, UnauthorizedException } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport'; // Guard JWT
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@ApiTags('Tenants (Management)')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) { }

  @Get()
  @ApiOperation({ summary: 'Lihat semua toko (Public)' })
  findAll() { return this.tenantsService.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Lihat detail toko (Public)' })
  findOne(@Param('id', ParseIntPipe) id: number) { return this.tenantsService.findOne(id); }


  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: '[AUTH] Buka Toko Baru (Otomatis jadi Owner)' })
  create(@Body() data: CreateTenantDto, @Request() req) {
    const userId = req.user.userId;

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
    const isOwner = req.user.tenantId === id;
    const isAdmin = req.user.role === 'SUPER_ADMIN';

    if (!isOwner && !isAdmin) {
      throw new UnauthorizedException("Anda dilarang menghapus toko orang lain!");
    }

    return this.tenantsService.delete(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post(':id/menus')
  @ApiOperation({ summary: '[AUTH] Tambah Menu ke Toko' })
  addMenu(@Param('id', ParseIntPipe) tenantId: number, @Body() data: CreateMenuDto, @Request() req) {
    const user = req.user;

    const isSuperAdmin = user.role === 'SUPER_ADMIN';
    const isOwner = user.tenantId === tenantId;

    if (!isSuperAdmin && !isOwner) {
      throw new UnauthorizedException("Anda bukan pemilik toko ini! Silakan Login ulang jika baru membuat toko.");
    }

    return this.tenantsService.addMenu(tenantId, data);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Put('menus/:menuId')
  @ApiOperation({ summary: '[AUTH] Update Menu (Harga, Foto, Stok)' })
  async updateMenu(
    @Param('menuId', ParseIntPipe) menuId: number,
    @Body() data: UpdateMenuDto,
    @Request() req
  ) {
    await this.tenantsService.validateMenuOwnership(
      menuId,
      req.user.userId,
      req.user.tenantId,
      req.user.role
    );

    return this.tenantsService.updateMenu(menuId, data);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Delete('menus/:menuId')
  @ApiOperation({ summary: '[AUTH] Hapus Menu' })
  async deleteMenu(@Param('menuId', ParseIntPipe) menuId: number, @Request() req) {
    await this.tenantsService.validateMenuOwnership(
      menuId,
      req.user.userId,
      req.user.tenantId,
      req.user.role
    );

    return this.tenantsService.deleteMenu(menuId);
  }
}