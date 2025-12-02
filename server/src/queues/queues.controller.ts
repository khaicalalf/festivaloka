import { Controller, Get, Post, Body, Param, Patch, ParseIntPipe } from '@nestjs/common';
import { QueuesService } from './queues.service';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('Queues (Sistem Antrian)')
@Controller('queues')
export class QueuesController {
  constructor(private readonly queuesService: QueuesService) { }

  // @Post('join')
  // @ApiOperation({ summary: 'User ambil nomor antrian baru' })
  // @ApiBody({ schema: { example: { tenantId: 1 } } }) // Contoh body buat Swagger
  // join(@Body('tenantId') tenantId: number) {
  //   return this.queuesService.joinQueue(tenantId);
  // }

  @Get('info/:tenantId')
  @ApiOperation({ summary: 'Cek info keramaian (Jumlah antrian & Estimasi waktu)' })
  getInfo(@Param('tenantId', ParseIntPipe) tenantId: number) {
    return this.queuesService.getQueueInfo(tenantId);
  }

  @Get('dashboard/:tenantId')
  @ApiOperation({ summary: 'Dashboard Tenant: Lihat daftar antrian' })
  getDashboard(@Param('tenantId', ParseIntPipe) tenantId: number) {
    return this.queuesService.getTenantDashboard(tenantId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Tenant update status (Panggil/Selesai)' })
  @ApiBody({ schema: { example: { status: 'CALLED' } } })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: 'CALLED' | 'DONE' | 'CANCELLED'
  ) {
    return this.queuesService.updateStatus(id, status);
  }
}