import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@ApiTags('Authentication (UserTenant)')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    @ApiOperation({ summary: 'Daftar Akun Baru' })
    register(@Body() data: RegisterDto) {
        return this.authService.register(data);
    }

    @Post('login')
    @ApiOperation({ summary: 'Login user' })
    login(@Body() data: LoginDto) {
        return this.authService.login(data);
    }
}