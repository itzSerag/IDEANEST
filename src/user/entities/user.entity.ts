import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcryptjs';

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

    // Password for local login
    @Prop({
        required: true,
        minlength: 6,
        maxlength: 20,
    })
    password: string;

    async validatePassword(password: string): Promise<boolean> {
        if (!this.password) return false;
        return await bcrypt.compare(password, this.password);
    }
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add instance methods
UserSchema.methods.validatePassword = async function (
    password: string,
): Promise<boolean> {
    if (!this.password) return false;
    return await bcrypt.compare(password, this.password);
};

// HASHINGG
UserSchema.pre('save', async function (next) {
    try {
        if (!this.isModified('password') || !this.password) {
            return next();
        }

        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});
