import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @Length(3, 15)
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @Length(6, 20)
    @IsNotEmpty()
    password: string;
}
