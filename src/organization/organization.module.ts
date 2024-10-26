import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
    Organization,
    OrganizationSchema,
} from './entities/organization.entity';
import { UserModule } from 'src/user/user.module';

@Module({
    controllers: [OrganizationController],
    providers: [OrganizationService],
    imports: [
        MongooseModule.forFeature([
            { name: Organization.name, schema: OrganizationSchema },
        ]),
        UserModule,
    ],
    exports: [OrganizationService, MongooseModule],
})
export class OrganizationModule {}
