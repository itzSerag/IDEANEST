import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { UserInvitationDTO } from './dto/user-invitation.dto';
import { CreateOrganizationDTO } from './dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('organization')
export class OrganizationController {
    constructor(private readonly organizationService: OrganizationService) {}

    @Post()
    async create(@Body() createOrganizationDto: CreateOrganizationDTO) {
        const res = await this.organizationService.create(
            createOrganizationDto,
        );
        return { message: res };
    }

    @Post('/:id/invite')
    async invite(
        @Param('id') orgId,
        @Body() userInvitationDTO: UserInvitationDTO,
    ) {
        return await this.organizationService.invite(userInvitationDTO, orgId);
    }
}
