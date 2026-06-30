import mongoose, { Document, Types } from 'mongoose';
import { ActivationRequestStatus } from '../types';
export interface IActivationRequest extends Document {
    license?: Types.ObjectId;
    product: Types.ObjectId;
    companyName: string;
    contactEmail: string;
    contactPhone?: string;
    machineId: string;
    machineIdHash: string;
    appVersion: string;
    osInfo?: string;
    hostname?: string;
    status: ActivationRequestStatus;
    rejectionReason?: string;
    processedBy?: Types.ObjectId;
    processedAt?: Date;
    ipAddress?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ActivationRequest: mongoose.Model<IActivationRequest, {}, {}, {}, mongoose.Document<unknown, {}, IActivationRequest, {}, {}> & IActivationRequest & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=ActivationRequest.d.ts.map