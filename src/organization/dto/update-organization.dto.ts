import { PartialType } from '@nestjs/mapped-types';
import { CreateOrganizationDTO } from './create-organization.dto';

export class UpdateOrganizationDto extends PartialType(CreateOrganizationDTO) {}
