import { ApiProperty } from '@nestjs/swagger';

export class VoiceOrderDto {
    @ApiProperty({
        example: 'aku mau beli makanan manis yang banyak dicari orang dan cepet',
        description: 'Hasil transkrip suara dari Frontend'
    })
    speechText: string;
}