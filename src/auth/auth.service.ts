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

        // log(user);
        // log('here;' + (await user.validatePassword(loginUserDto.password)));
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
                'User already signed up with these credentials',
            );
        }

        try {
            const user = await this.userService.create({ ...createUserDto });
            await user.save(); // Ensure the save is awaited
            return 'success';
        } catch (error) {
            log(error);
            throw new ForbiddenException(
                'User could not be created, please try again.',
            );
        }
    }

    async login(loginUserDto: LoginUserDto) {
        const user = await this.__validateUser(loginUserDto);

        if (!user) {
            throw new UnauthorizedException(
                'Cannot find user with these credentials',
            );
        }

        const payload: JWTPayload = {
            email: user.email,
            userId: user._id.toString(), // Convert ObjectId to string
        };

        return this.signToken(payload);
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

            return this.signToken(payload);
        } catch (error) {
            log(error);
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async revokeToken(refreshToken: string) {
        try {
            const decoded = this.jwtService.verify(refreshToken); // Ensure token is valid
            const expiration = decoded.exp - Math.floor(Date.now() / 1000); // Calculate remaining expiration time
            await this.redisService.addTokenToBlacklist(
                refreshToken,
                expiration,
            );
        } catch (error) {
            log(error);
            throw new UnauthorizedException(
                'Invalid refresh token, cannot revoke',
            );
        }
    }

    private async signToken(payload: JWTPayload) {
        return {
            access_token: this.jwtService.sign(payload, {
                expiresIn: process.env.JWT_EXPIRATION,
            }),
            refresh_token: this.jwtService.sign(payload, {
                expiresIn: process.env.JWT_REFRESH_EXPIRATION,
            }),
        };
    }
}
