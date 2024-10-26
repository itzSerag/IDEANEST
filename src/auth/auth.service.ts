import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { RedisService } from '../redis/redis.service';
import { log } from 'console';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private redisService: RedisService,
    ) {}

    async validateUser(loginUserDto: LoginUserDto): Promise<any> {
        const user = await this.userService.findOneByEmail(loginUserDto.email);
        if (user && (await user.validatePassword(loginUserDto.password))) {
            return user;
        }
        throw new UnauthorizedException('Invalid credentials');
    }

    async register(createUserDto: CreateUserDto) {
        const user = await this.userService.create({ ...createUserDto });
        return user;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user._id };

        // Issue new access and refresh tokens -- INLINE -- i know thats not the best for prod but its only 2 days
        return {
            access_token: this.jwtService.sign(payload, {
                expiresIn: process.env.JWT_EXPIRATION,
            }),
            refresh_token: this.jwtService.sign(payload, {
                expiresIn: process.env.JWT_REFRESH_EXPIRATION,
            }),
        };
    }

    async refresh(refreshToken: string) {
        const isBlacklisted =
            await this.redisService.isTokenBlacklisted(refreshToken);
        if (isBlacklisted) {
            throw new UnauthorizedException('Refresh token has been revoked');
        }

        try {
            const decoded = this.jwtService.verify(refreshToken);
            const payload = { email: decoded.email, sub: decoded.sub };

            // Issue new access and refresh tokens
            return {
                access_token: this.jwtService.sign(payload, {
                    expiresIn: process.env.JWT_EXPIRATION,
                }),
                refresh_token: this.jwtService.sign(payload, {
                    expiresIn: process.env.JWT_REFRESH_EXPIRATION,
                }),
            };
        } catch (error) {
            log(error);
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async revokeToken(refreshToken: string) {
        const decoded = this.jwtService.decode(refreshToken) as any;
        const expiration = decoded.exp - Math.floor(Date.now() / 1000); // Calculate remaining expiration time
        await this.redisService.addTokenToBlacklist(refreshToken, expiration);
    }
}
