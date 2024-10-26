import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto, RefreshTokenDTO } from './dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('signup')
    async register(@Body() createUserDTo: CreateUserDto) {
        const res = await this.authService.register(createUserDTo);
        return { message: res };
    }

    @Post('signin')
    async login(@Body() loginUserDto: LoginUserDto) {
        const user = await this.authService.__validateUser(loginUserDto);
        return this.authService.login(user);
    }

    @Post('refresh-token')
    async refreshToken(@Body() refreshTokenDTO: RefreshTokenDTO) {
        return this.authService.refresh(refreshTokenDTO.refresh_token);
    }

    @Post('revoke')
    async revokeToken(@Body() body: { refreshToken: string }) {
        await this.authService.revokeToken(body.refreshToken);
        return { message: 'Token revoked successfully' };
    }
}
