import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) {}

    async create(CreateUserDto: CreateUserDto): Promise<User> {
        const user = await this.userModel.create(CreateUserDto);
        return user;
    }

    async findAll(): Promise<User[]> {
        const users = await this.userModel.find();
        return users;
    }

    async findOneById(id: string): Promise<User> {
        const user = await this.userModel.findById(id);
        return user;
    }

    async findOneByEmail(email: string): Promise<User> {
        const user = this.userModel.findOne({ email });
        return user;
    }

    remove(id: number) {
        // return deleted user
        return this.userModel.findByIdAndDelete(id);
    }
}
