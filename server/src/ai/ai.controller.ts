import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('AI Recommendation')
@Controller('kolosal-ai')
export class AiController {
  constructor(private readonly aiService: AiService) { }

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