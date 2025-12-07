import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'admin@toko.com', description: 'Email pengguna' })
    email: string;

    @ApiProperty({ example: 'rahasia123', description: 'Password minimal 6 karakter' })
    password: string;
}

export class RegisterDto extends LoginDto {
    @ApiProperty({
        example: 'TENANT_ADMIN',
        description: 'Role user: SUPER_ADMIN atau TENANT_ADMIN',
        required: false
    })
    role?: string;

    @ApiProperty({
        example: 1,
        description: 'ID Toko (Isi jika owner toko, kosongkan jika Super Admin)',
        required: false
    })
    tenantId?: number;
}