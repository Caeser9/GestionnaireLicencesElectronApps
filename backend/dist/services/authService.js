"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = require("../models");
const config_1 = require("../config");
const AppError_1 = require("../utils/AppError");
const audit_1 = require("../middleware/audit");
const types_1 = require("../types");
class AuthService {
    async login(email, password, req) {
        const user = await models_1.User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user || !user.isActive) {
            throw new AppError_1.AppError('Identifiants invalides', 401);
        }
        const valid = await user.comparePassword(password);
        if (!valid) {
            throw new AppError_1.AppError('Identifiants invalides', 401);
        }
        user.lastLoginAt = new Date();
        await user.save();
        const payload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        };
        const token = jsonwebtoken_1.default.sign(payload, config_1.config.jwt.secret, {
            expiresIn: config_1.config.jwt.expiresIn,
        });
        await (0, audit_1.createAuditLog)(payload, {
            action: types_1.AuditAction.LOGIN,
            resource: types_1.AuditResource.AUTH,
            description: `Connexion de ${user.email}`,
        }, req);
        return {
            token,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                fullName: user.fullName,
            },
        };
    }
    async getMe(userId) {
        const user = (0, AppError_1.assertFound)(await models_1.User.findById(userId), 'Utilisateur non trouvé');
        return {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            fullName: user.fullName,
            lastLoginAt: user.lastLoginAt,
        };
    }
    async createUser(data, creator, req) {
        const existing = await models_1.User.findOne({ email: data.email.toLowerCase() });
        if (existing) {
            throw new AppError_1.AppError('Cet email est déjà utilisé', 409);
        }
        const user = await models_1.User.create(data);
        await (0, audit_1.createAuditLog)(creator, {
            action: types_1.AuditAction.CREATE,
            resource: types_1.AuditResource.USER,
            resourceId: user._id.toString(),
            description: `Création de l'utilisateur ${user.email}`,
        }, req);
        return user;
    }
    async listUsers() {
        return models_1.User.find().sort({ createdAt: -1 });
    }
    async updateUser(id, data, updater, req) {
        const user = (0, AppError_1.assertFound)(await models_1.User.findById(id), 'Utilisateur non trouvé');
        if (data.email && data.email !== user.email) {
            const existing = await models_1.User.findOne({ email: data.email.toLowerCase() });
            if (existing)
                throw new AppError_1.AppError('Cet email est déjà utilisé', 409);
        }
        Object.assign(user, data);
        await user.save();
        await (0, audit_1.createAuditLog)(updater, {
            action: types_1.AuditAction.UPDATE,
            resource: types_1.AuditResource.USER,
            resourceId: id,
            description: `Modification de l'utilisateur ${user.email}`,
            changes: data,
        }, req);
        return user;
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=authService.js.map