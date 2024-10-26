import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisModule } from './redis/redis.module';
import { MongooseModule } from '@nestjs/mongoose';
import { OrganizationModule } from './organization/organization.module';

@Module({
    imports: [
        UserModule,
        AuthModule,
        CacheModule.register({ isGlobal: true }),
        RedisModule,
        MongooseModule.forRoot(process.env.MONGO_URI),
        OrganizationModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
