import { Module } from '@nestjs/common';
import { QueuesService } from './queues.service';
import { QueuesController } from './queues.controller';
import { OrdersModule } from '../orders/orders.module';

@Module({
  controllers: [QueuesController],
  providers: [QueuesService],
  // imports: [OrdersModule],
  exports: [QueuesService],
})
export class QueuesModule { }
