import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('signup')
    async register(@Body() createUserDTo: CreateUserDto) {
        return await this.authService.register(createUserDTo);
    }

    @Post('signin')
    async login(@Body() loginUserDto: LoginUserDto) {
        const user = await this.authService.validateUser(loginUserDto);
        return this.authService.login(user);
    }

    @Post('refresh-token')
    async refreshToken(@Body() body: { refreshToken: string }) {
        return this.authService.refresh(body.refreshToken);
    }

    @Post('revoke')
    async revokeToken(@Body() body: { refreshToken: string }) {
        await this.authService.revokeToken(body.refreshToken);
        return { message: 'Token revoked successfully' };
    }
}
