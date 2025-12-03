import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { AiService } from './ai.service';
import { ApiTags, ApiOperation, ApiBody, ApiQuery } from '@nestjs/swagger';

@ApiTags('Kolosal AI')
@Controller('kolosal-ai')
export class AiController {
  constructor(private readonly aiService: AiService) { }

  @Get('tenantsByAI')
  @ApiOperation({ summary: 'Dapatkan List Tenant + Prediksi AI + Filter Preferensi' })
  @ApiQuery({ name: 'preferences', required: false, description: 'Contoh: "Yang pedas dan berkuah", "Minuman dingin murah"' })
  async getRecommendations(@Query('preferences') preferences?: string) {
    return this.aiService.getSmartRecommendations(preferences);
  }

  @Post('rekomendasi')
  @ApiOperation({ summary: 'Minta rekomendasi tenant berdasarkan preferensi' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        preferences: {
          type: 'array',
          items: { type: 'string' },
          example: ['pedas', 'kuah']
        }
      }
    }
  })
  async recommend(@Body('preferences') preferences: string[]) {
    return this.aiService.recommend(preferences);
  }
}
