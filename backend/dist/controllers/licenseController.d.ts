import { Request, Response, NextFunction } from 'express';
export declare function listLicenses(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getLicense(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function createLicense(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateLicense(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function suspendLicense(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function reactivateLicense(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function transferLicense(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getActivationLogs(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function listActivationRequests(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function approveActivation(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function rejectActivation(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=licenseController.d.ts.map