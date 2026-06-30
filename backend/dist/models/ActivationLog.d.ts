import mongoose, { Document, Types } from 'mongoose';
export interface IActivationLog extends Document {
    license: Types.ObjectId;
    client: Types.ObjectId;
    product: Types.ObjectId;
    machineId: string;
    appVersion: string;
    action: 'activate' | 'verify' | 'transfer' | 'heartbeat' | 'update_check';
    ipAddress?: string;
    success: boolean;
    message?: string;
    metadata?: Record<string, unknown>;
    createdAt: Date;
}
export declare const ActivationLog: mongoose.Model<IActivationLog, {}, {}, {}, mongoose.Document<unknown, {}, IActivationLog, {}, {}> & IActivationLog & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=ActivationLog.d.ts.map