import { IsNotEmpty, IsString } from 'class-validator';

// Yeah we could use the refresh token dto but its okay
export class RevokeTokenDTO {
    @IsString()
    @IsNotEmpty()
    refresh_token: string;
}
