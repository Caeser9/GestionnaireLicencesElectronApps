import mongoose, { Document, Types } from 'mongoose';
export interface IModule extends Document {
    slug: string;
    name: string;
    description?: string;
    product: Types.ObjectId;
    isActive: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Module: mongoose.Model<IModule, {}, {}, {}, mongoose.Document<unknown, {}, IModule, {}, {}> & IModule & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Module.d.ts.map