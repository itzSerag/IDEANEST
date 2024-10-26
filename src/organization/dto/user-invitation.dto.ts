import { IsNotEmpty, IsString } from 'class-validator';

export class UserInvitationDTO {
    @IsString()
    @IsNotEmpty()
    email: string;
}
