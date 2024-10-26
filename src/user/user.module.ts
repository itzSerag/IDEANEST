import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserSchema } from './entities/user.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    controllers: [UserController],
    imports: [
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    ],
    providers: [UserService],
    exports: [UserService, MongooseModule],
})
export class UserModule {}
