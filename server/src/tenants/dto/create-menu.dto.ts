import { ApiProperty } from '@nestjs/swagger';

export class CreateMenuDto {
    @ApiProperty({ example: 'Sate Kulit Krispi', description: 'Nama Menu' })
    name: string;

    @ApiProperty({ example: 15000, description: 'Harga (Angka)' })
    price: number;

    @ApiProperty({
        example: 'Sate kulit digoreng garing dengan bumbu pedas',
        description: 'Deskripsi Menu',
        required: false
    })
    description?: string;

    @ApiProperty({
        example: 'https://example.com/foto-sate.jpg',
        description: 'URL Foto Makanan',
        required: false
    })
    imageUrl?: string;
}