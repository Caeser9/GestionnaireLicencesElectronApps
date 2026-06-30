import { Request, Response, NextFunction } from 'express';
export declare function activate(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function verify(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getLicenseInfo(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function transfer(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getModules(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function checkUpdates(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function heartbeat(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getPublicKeyEndpoint(_req: Request, res: Response): Promise<void>;
//# sourceMappingURL=clientApiController.d.ts.map