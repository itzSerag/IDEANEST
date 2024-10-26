import {
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { RedisService } from '../redis/redis.service';
import { log } from 'console';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JWTPayload } from './interface/jwt-interface.interface';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private redisService: RedisService,
    ) {}

    async __validateUser(loginUserDto: LoginUserDto): Promise<any> {
        const user = await this.userService.findOneByEmail(loginUserDto.email);

        log(user);
        if (!user || !(await user.validatePassword(loginUserDto.password))) {
            return null;
        }
        return user;
    }

    async register(createUserDto: CreateUserDto): Promise<string> {
        const existUser = await this.userService.findOneByEmail(
            createUserDto.email,
        );
        if (existUser) {
            throw new ForbiddenException(
                'User already Signup with this credentials',
            );
        }

        try {
            const user = await this.userService.create({ ...createUserDto });
            user.save();
        } catch (error) {
            log(error);
            return "error: can't create the user please try again";
        }
        return 'success';
    }

    async login(loginUserDto: LoginUserDto) {
        const user = await this.__validateUser(loginUserDto);

        if (!user) {
            throw new UnauthorizedException(
                'Cant find a user with these credentials',
            );
        }

        const payload: JWTPayload = {
            email: user.email,
            userId: user._id.toString(), // Convert ObjectId to string
        };

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

            const payload: JWTPayload = {
                email: decoded.email,
                userId: decoded._id,
            };

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
