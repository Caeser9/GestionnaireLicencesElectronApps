import { Request, Response, NextFunction } from 'express';
import { JwtPayload, UserRole } from '../types';
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}
export declare function authenticate(req: Request, _res: Response, next: NextFunction): void;
export declare function authorize(...roles: UserRole[]): (req: Request, _res: Response, next: NextFunction) => void;
export declare function optionalAuth(req: Request, _res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map