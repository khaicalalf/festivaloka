import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Tenants (Daftar Toko)')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) { }

  @Get()
  @ApiOperation({ summary: 'Ambil semua daftar toko & menu' })
  findAll() {
    return this.tenantsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail satu toko' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tenantsService.findOne(id);
  }
}