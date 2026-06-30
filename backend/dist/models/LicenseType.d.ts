import mongoose, { Document } from 'mongoose';
export interface ILicenseType extends Document {
    slug: string;
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
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=LicenseType.d.ts.map