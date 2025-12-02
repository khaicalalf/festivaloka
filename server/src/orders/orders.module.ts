import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { QueuesModule } from '../queues/queues.module';
import { forwardRef } from '@nestjs/common';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [forwardRef(() => QueuesModule)]
})
export class OrdersModule { }
