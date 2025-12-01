import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TenantsModule } from './tenants/tenants.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [TenantsModule, AiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
