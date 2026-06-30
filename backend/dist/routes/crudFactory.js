"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCrudRouter = createCrudRouter;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../utils/validate");
const schemas_1 = require("../validators/schemas");
const types_1 = require("../types");
const audit_1 = require("../middleware/audit");
const params_1 = require("../utils/params");
const AppError_1 = require("../utils/AppError");
function createCrudRouter(model, createSchema, updateSchema, options) {
    const router = (0, express_1.Router)();
    const readRoles = options.readRoles || [types_1.UserRole.SUPPORT];
    const writeRoles = options.writeRoles || [types_1.UserRole.ADMIN];
    router.get('/', auth_1.authenticate, (0, auth_1.authorize)(...readRoles), async (req, res, next) => {
        try {
            const { page = '1', limit = '50' } = req.query;
            const filter = {};
            const pageNum = parseInt(page, 10);
            const limitNum = parseInt(limit, 10);
            const items = await model.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum);
            const total = await model.countDocuments(filter);
            res.json({
                success: true,
                data: { items, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
            });
        }
        catch (error) {
            next(error);
        }
    });
    router.get('/:id', auth_1.authenticate, (0, auth_1.authorize)(...readRoles), (0, validate_1.validateParams)(schemas_1.mongoIdSchema), async (req, res, next) => {
        try {
            const item = (0, AppError_1.assertFound)(await model.findById(req.params.id), `${options.resourceLabel} non trouvé`);
            res.json({ success: true, data: item });
        }
        catch (error) {
            next(error);
        }
    });
    router.post('/', auth_1.authenticate, (0, auth_1.authorize)(...writeRoles), (0, validate_1.validateBody)(createSchema), async (req, res, next) => {
        try {
            const item = await model.create(req.body);
            await (0, audit_1.createAuditLog)(req.user, {
                action: types_1.AuditAction.CREATE,
                resource: options.resource,
                resourceId: item._id.toString(),
                description: `Création ${options.resourceLabel}`,
            }, req);
            res.status(201).json({ success: true, data: item });
        }
        catch (error) {
            next(error);
        }
    });
    router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)(...writeRoles), (0, validate_1.validateParams)(schemas_1.mongoIdSchema), (0, validate_1.validateBody)(updateSchema), async (req, res, next) => {
        try {
            const item = (0, AppError_1.assertFound)(await model.findById(req.params.id), `${options.resourceLabel} non trouvé`);
            Object.assign(item, req.body);
            await item.save();
            await (0, audit_1.createAuditLog)(req.user, {
                action: types_1.AuditAction.UPDATE,
                resource: options.resource,
                resourceId: (0, params_1.getParamId)(req.params),
                description: `Modification ${options.resourceLabel}`,
                changes: req.body,
            }, req);
            res.json({ success: true, data: item });
        }
        catch (error) {
            next(error);
        }
    });
    router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)(types_1.UserRole.SUPER_ADMIN), (0, validate_1.validateParams)(schemas_1.mongoIdSchema), async (req, res, next) => {
        try {
            const item = (0, AppError_1.assertFound)(await model.findById(req.params.id), `${options.resourceLabel} non trouvé`);
            await model.findByIdAndDelete(req.params.id);
            await (0, audit_1.createAuditLog)(req.user, {
                action: types_1.AuditAction.DELETE,
                resource: options.resource,
                resourceId: (0, params_1.getParamId)(req.params),
                description: `Suppression ${options.resourceLabel}`,
            }, req);
            res.json({ success: true, message: `${options.resourceLabel} supprimé` });
        }
        catch (error) {
            next(error);
        }
    });
    return router;
}
//# sourceMappingURL=crudFactory.js.map