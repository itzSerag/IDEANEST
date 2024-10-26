import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/user/entities/user.entity';

@Schema({
    timestamps: true,
    toJSON: {
        transform: (_, ret) => {
            // Remove the password from the response
            delete ret.password;
            return ret;
        },
    },
})
export class Organization extends Document {
    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ required: true, trim: true })
    description: string;

    @Prop({ type: [Types.ObjectId], ref: 'USER' })
    organization_members: User[]; // Array of User references
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
