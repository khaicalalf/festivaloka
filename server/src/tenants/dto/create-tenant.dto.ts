import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantDto {
    @ApiProperty({ example: 'Sate Taichan Senayan', description: 'Nama Toko' })
    name: string;

    @ApiProperty({ example: 'Sate', description: 'Kategori Makanan' })
    category: string;

    @ApiProperty({
        example: 'Sate pedas nampol!',
        description: 'Deskripsi Singkat',
        required: false
    })
    description?: string;

    @ApiProperty({
        example: 'https://example.com/foto-toko.jpg',
        description: 'URL Foto Toko',
        required: false
    })
    imageUrl?: string;

    @ApiProperty({
        example: 'Stand A-12',
        description: 'Lokasi/Alamat',
        required: false
    })
    address?: string;
}