import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOrganizationDTO {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;
}
