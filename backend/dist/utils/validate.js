"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
exports.validateQuery = validateQuery;
exports.validateParams = validateParams;
const AppError_1 = require("./AppError");
function validateBody(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const message = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
            next(new AppError_1.AppError(message, 400));
            return;
        }
        req.body = result.data;
        next();
    };
}
function validateQuery(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse(req.query);
        if (!result.success) {
            const message = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
            next(new AppError_1.AppError(message, 400));
            return;
        }
        req.query = result.data;
        next();
    };
}
function validateParams(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse(req.params);
        if (!result.success) {
            const message = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
            next(new AppError_1.AppError(message, 400));
            return;
        }
        req.params = result.data;
        next();
    };
}
//# sourceMappingURL=validate.js.map