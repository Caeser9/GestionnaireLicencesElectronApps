import mongoose, { Document } from 'mongoose';
import { UserRole } from '../types';
export interface IUser extends Document {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    productId?: mongoose.Types.ObjectId;
    isActive: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidate: string): Promise<boolean>;
    fullName: string;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map