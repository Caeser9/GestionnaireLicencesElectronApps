import mongoose, { Document, Types } from 'mongoose';
export interface IAppVersion extends Document {
    product: Types.ObjectId;
    version: string;
    releaseNotes?: string;
    downloadUrl?: string;
    fileSize?: number;
    checksum?: string;
    isMandatory: boolean;
    isRecommended: boolean;
    isActive: boolean;
    minCompatibleVersion?: string;
    publishedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const AppVersion: mongoose.Model<IAppVersion, {}, {}, {}, mongoose.Document<unknown, {}, IAppVersion, {}, {}> & IAppVersion & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=AppVersion.d.ts.map