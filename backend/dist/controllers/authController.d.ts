import { Request, Response, NextFunction } from 'express';
export declare function login(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getMe(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function listUsers(_req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function createUser(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateUser(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=authController.d.ts.map