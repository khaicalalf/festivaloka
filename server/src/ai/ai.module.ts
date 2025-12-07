import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { TenantsService } from '../tenants/tenants.service';

@Module({
  imports: [HttpModule],
  controllers: [AiController],
  providers: [AiService, TenantsService],
})
export class AiModule { }