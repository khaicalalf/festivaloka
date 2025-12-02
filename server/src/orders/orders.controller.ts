import { Controller, Post, Body, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('Orders (Transaksi & Pembayaran)')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post('checkout')
  @ApiOperation({ summary: 'Buat Order baru & Dapatkan Midtrans Token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'budi@gmail.com' },
        phone: { type: 'string', example: '08123456789' },
        tenantId: { type: 'number', example: 1 },
        totalAmount: { type: 'number', example: 25000 },
        items: {
          type: 'array',
          example: [
            { name: 'Seblak', price: 15000, qty: 1 },
            { name: 'Es Teh', price: 10000, qty: 1 }
          ]
        }
      }
    }
  })
  checkout(@Body() data: any) {
    return this.ordersService.checkout(data);
  }

  @Post('confirm/:orderId')
  @ApiOperation({ summary: 'Konfirmasi pembayaran sukses (Update Poin)' })
  confirm(@Param('orderId') orderId: string) {
    return this.ordersService.confirmPayment(orderId);
  }
}