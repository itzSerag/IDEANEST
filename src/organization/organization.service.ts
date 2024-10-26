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
        // add this user to the organization

        try {
            const organization =
                await this.organizationModel.findById(organizationId);
            if (!organization) {
                throw new NotFoundException('Organization not found');
            }

            const user = await this.userService.findOneByEmail(
                userInvitationDTO.email,
            );

            if (!user) {
                throw new NotFoundException('User with this email not found');
            }

            organization.organization_members.map((user) => {
                if (user.email === userInvitationDTO.email) {
                    throw new NotFoundException(
                        'User already in the organization',
                    );
                }
            });

            organization.organization_members.push(user);

            organization.save();

            return 'success : User invited Successfully';
        } catch (error) {
            log(error);
            throw new InternalServerErrorException(
                'Something wrong happend, please try again',
            );
        }
    }
}
