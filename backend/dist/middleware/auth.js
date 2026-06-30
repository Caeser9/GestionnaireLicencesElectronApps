"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.authorize = authorize;
exports.optionalAuth = optionalAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const AppError_1 = require("../utils/AppError");
const roles_1 = require("../utils/roles");
function authenticate(req, _res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        next(new AppError_1.AppError('Authentification requise', 401));
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
        req.user = decoded;
        next();
    }
    catch {
        next(new AppError_1.AppError('Token invalide ou expiré', 401));
    }
}
function authorize(...roles) {
    return (req, _res, next) => {
        if (!req.user) {
            next(new AppError_1.AppError('Authentification requise', 401));
            return;
        }
        const allowed = roles.some((role) => (0, roles_1.hasMinimumRole)(req.user.role, role));
        if (!allowed) {
            next(new AppError_1.AppError('Accès non autorisé', 403));
            return;
        }
        next();
    };
}
function optionalAuth(req, _res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        next();
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        req.user = jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
    }
    catch {
        // ignore invalid token for optional auth
    }
    next();
}
//# sourceMappingURL=auth.js.map