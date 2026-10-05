import mongoose, { Document, Types } from 'mongoose';
import { LicenseStatus } from '../types';
export interface ILicense extends Document {
    licenseKey: string;
    licenseToken: string;
    client: Types.ObjectId;
    product: Types.ObjectId;
    licenseType: Types.ObjectId;
    status: LicenseStatus;
    activatedAt?: Date;
    expiresAt?: Date;
    maxUsers: number;
    maxWorkstations: number;
    authorizedModules: string[];
    dashboardMode?: 'pro' | 'simple';
    minVersion?: string;
    maxVersion?: string;
    machineId?: string;
    machineIdHash?: string;
    signature?: string;
    adminNotes?: string;
    createdBy: Types.ObjectId;
    lastVerifiedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const License: mongoose.Model<ILicense, {}, {}, {}, mongoose.Document<unknown, {}, ILicense, {}, {}> & ILicense & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=License.d.ts.map