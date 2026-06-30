import { JwtPayload, UserRole } from '../types';
import { Request } from 'express';
export declare class AuthService {
    login(email: string, password: string, req?: Request): Promise<{
        token: string;
        user: {
            id: import("mongoose").Types.ObjectId;
            email: string;
            firstName: string;
            lastName: string;
            role: UserRole;
            fullName: string;
        };
    }>;
    getMe(userId: string): Promise<{
        id: any;
        email: any;
        firstName: any;
        lastName: any;
        role: any;
        fullName: any;
        lastLoginAt: any;
    }>;
    createUser(data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role: UserRole;
    }, creator: JwtPayload, req?: Request): Promise<import("mongoose").Document<unknown, {}, import("../models").IUser, {}, {}> & import("../models").IUser & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    listUsers(): Promise<(import("mongoose").Document<unknown, {}, import("../models").IUser, {}, {}> & import("../models").IUser & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    updateUser(id: string, data: Partial<{
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role: UserRole;
        isActive: boolean;
    }>, updater: JwtPayload, req?: Request): Promise<any>;
}
export declare const authService: AuthService;
//# sourceMappingURL=authService.d.ts.map