import mongoose, { Document, Types } from 'mongoose';
export interface ILicenseType extends Document {
    slug: string;
    product?: Types.ObjectId;
    name: string;
    description?: string;
    defaultMaxUsers: number;
    defaultMaxWorkstations: number;
    defaultModules: string[];
    isActive: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const LicenseType: mongoose.Model<ILicenseType, {}, {}, {}, mongoose.Document<unknown, {}, ILicenseType, {}, {}> & ILicenseType & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=LicenseType.d.ts.map