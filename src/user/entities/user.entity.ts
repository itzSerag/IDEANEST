import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Access_Level } from '../enums';

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
export class User extends Document {
    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ required: true, index: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ default: Access_Level.USER })
    access_level: Access_Level;

    // Use bcrypt to compare hashed password
    async validatePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.validatePassword = async function (
    password: string,
): Promise<boolean> {
    return bcrypt.compare(password, this.password);
};

// HASHING the password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});
