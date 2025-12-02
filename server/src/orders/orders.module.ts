import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { QueuesModule } from '../queues/queues.module';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [QueuesModule]
})
export class OrdersModule { }
