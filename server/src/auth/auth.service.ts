import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto } from './dto/auth.dto';

const prisma = new PrismaClient();

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService) { }

    // 1. REGISTER (Buat Akun Baru)
    async register(data: RegisterDto) {
        // Cek apakah email sudah dipakai?
        const existingUser = await prisma.userTenant.findUnique({
            where: { email: data.email }
        });

        if (existingUser) {
            throw new ConflictException('Email sudah terdaftar!');
        }

        // Enkripsi Password biar aman
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Simpan ke Tabel UserTenant
        const newUser = await prisma.userTenant.create({
            data: {
                email: data.email,
                password: hashedPassword,
                role: data.role || 'TENANT_ADMIN', // Default jadi admin toko
                tenantId: data.tenantId || null     // Bisa null (Super Admin) atau ID Toko
            }
        });

        // Hilangkan password dari response biar aman
        const { password, ...result } = newUser;
        return result;
    }

    // 2. LOGIN (Dapat Token)
    async login(data: LoginDto) {
        // Cari user di database
        const user = await prisma.userTenant.findUnique({
            where: { email: data.email }
        });

        if (!user) throw new UnauthorizedException('Email atau Password salah');

        // Cek Password
        const isMatch = await bcrypt.compare(data.password, user.password);
        if (!isMatch) throw new UnauthorizedException('Email atau Password salah');

        // Buat Payload Token (Isi dompet digital user)
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                tenantId: user.tenantId
            }
        };
    }
}