import { Model, Document } from 'mongoose';
import { validateBody } from '../utils/validate';
import { UserRole, AuditResource } from '../types';
interface CrudOptions {
    resource: AuditResource;
    resourceLabel: string;
    readRoles?: UserRole[];
    writeRoles?: UserRole[];
    moderatorScope?: 'self' | 'product';
    moderatorCanCreate?: boolean;
}
export declare function createCrudRouter<T extends Document>(model: Model<T>, createSchema: Parameters<typeof validateBody>[0], updateSchema: Parameters<typeof validateBody>[0], options: CrudOptions): import("express-serve-static-core").Router;
export {};
//# sourceMappingURL=crudFactory.d.ts.map