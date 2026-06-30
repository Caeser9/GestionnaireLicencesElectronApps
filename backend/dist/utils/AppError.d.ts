export declare class AppError extends Error {
    readonly statusCode: number;
    readonly isOperational: boolean;
    constructor(message: string, statusCode?: number, isOperational?: boolean);
}
export declare function assertFound(value: any, message: string): any;
//# sourceMappingURL=AppError.d.ts.map