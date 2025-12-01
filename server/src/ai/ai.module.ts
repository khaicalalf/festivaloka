import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { TenantsService } from '../tenants/tenants.service'; // Import Tenant Service

@Module({
  imports: [HttpModule], // 👈 Masukkan ini
  controllers: [AiController],
  providers: [AiService, TenantsService], // 👈 Masukkan TenantsService biar bisa baca data toko
})
export class AiModule { }