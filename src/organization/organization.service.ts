import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { CreateOrganizationDTO } from './dto/create-organization.dto';
import { UserInvitationDTO } from './dto/user-invitation.dto';
import { UserService } from 'src/user/user.service';
import { Organization } from './entities/organization.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { log } from 'console';

@Injectable()
export class OrganizationService {
    constructor(
        private userService: UserService,
        @InjectModel(Organization.name)
        private organizationModel: Model<Organization>,
    ) {}

    async create(createOrganizationDto: CreateOrganizationDTO) {
        try {
            const organization = await this.organizationModel.create(
                createOrganizationDto,
            );
            organization.save();

            return organization._id;
        } catch (error) {
            log(error);
            throw new InternalServerErrorException(
                'Cant create new organization right now, please try again later',
            );
        }
    }

    async invite(userInvitationDTO: UserInvitationDTO, organizationId: string) {
        // Add this user to the organization
        try {
            const organization =
                await this.organizationModel.findById(organizationId);

            // Check if the organization exists
            if (!organization) {
                throw new NotFoundException('Organization not found');
            }

            // Find the user by email
            const user = await this.userService.findOneByEmail(
                userInvitationDTO.email,
            );
            if (!user) {
                throw new NotFoundException('User with this email not found');
            }

            // Check if the user is already a member
            const isMember = organization.organization_members.some(
                (member) => member.email === userInvitationDTO.email,
            );
            if (isMember) {
                throw new NotFoundException('User already in the organization');
            }

            // Add the user to the organization members
            organization.organization_members.push(user);

            // Save the organization and handle any potential errors
            await organization.save();

            return 'Success: User invited successfully';
        } catch (error) {
            log(error);
            throw new InternalServerErrorException(
                'Something went wrong, please try again',
            );
        }
    }
}
