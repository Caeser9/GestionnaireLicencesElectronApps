"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.assertFound = assertFound;
class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function assertFound(value, message) {
    if (value == null) {
        throw new AppError(message, 404);
    }
    return value;
}
//# sourceMappingURL=AppError.js.map