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
const types_1 = require("../types");
const audit_1 = require("../middleware/audit");
const types_2 = require("../types");
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
            ...(user.productId ? { productId: user.productId.toString() } : {}),
        };
        const token = jsonwebtoken_1.default.sign(payload, config_1.config.jwt.secret, {
            expiresIn: config_1.config.jwt.expiresIn,
        });
        await (0, audit_1.createAuditLog)(payload, {
            action: types_2.AuditAction.LOGIN,
            resource: types_2.AuditResource.AUTH,
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
                productId: user.productId?.toString(),
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
            productId: user.productId?.toString(),
            fullName: user.fullName,
            lastLoginAt: user.lastLoginAt,
        };
    }
    async createUser(data, creator, req) {
        const existing = await models_1.User.findOne({ email: data.email.toLowerCase() });
        if (existing) {
            throw new AppError_1.AppError('Cet email est déjà utilisé', 409);
        }
        if (data.role === types_1.UserRole.MODERATOR && !data.productId) {
            throw new AppError_1.AppError('Une application doit être associée au modérateur', 400);
        }
        if (data.role === types_1.UserRole.MODERATOR && !(await models_1.Product.exists({ _id: data.productId, isActive: true }))) {
            throw new AppError_1.AppError('Application introuvable ou inactive', 404);
        }
        if (data.role !== types_1.UserRole.MODERATOR && data.productId) {
            throw new AppError_1.AppError('Seul un modérateur peut être associé à une application', 400);
        }
        const user = await models_1.User.create(data);
        if (user.role === types_1.UserRole.MODERATOR && user.productId) {
            const sharedTypes = await models_1.LicenseType.find({ product: { $exists: false } });
            for (const sharedType of sharedTypes) {
                const scopedSlug = `${sharedType.slug}-${user.productId.toString().slice(-6)}`;
                await models_1.LicenseType.updateOne({ product: user.productId, slug: scopedSlug }, { $setOnInsert: {
                        product: user.productId,
                        slug: scopedSlug,
                        name: sharedType.name,
                        description: sharedType.description,
                        defaultMaxUsers: sharedType.defaultMaxUsers,
                        defaultMaxWorkstations: sharedType.defaultMaxWorkstations,
                        defaultModules: sharedType.defaultModules,
                        sortOrder: sharedType.sortOrder,
                        isActive: sharedType.isActive,
                    } }, { upsert: true });
            }
        }
        await (0, audit_1.createAuditLog)(creator, {
            action: types_2.AuditAction.CREATE,
            resource: types_2.AuditResource.USER,
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
            action: types_2.AuditAction.UPDATE,
            resource: types_2.AuditResource.USER,
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