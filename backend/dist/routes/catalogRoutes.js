"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const models_1 = require("../models");
const crudFactory_1 = require("./crudFactory");
const schemas_1 = require("../validators/schemas");
const types_1 = require("../types");
const auth_1 = require("../middleware/auth");
const AppError_1 = require("../utils/AppError");
const router = (0, express_1.Router)();
// Existing moderators may predate per-application license types. Ensure their
// application has usable types when opening the activation approval dialog.
router.get('/license-types', auth_1.authenticate, async (req, res, next) => {
    if (req.user?.role !== types_1.UserRole.MODERATOR)
        return next();
    try {
        const productId = req.user?.productId;
        if (!productId || !(await models_1.Product.exists({ _id: productId, isActive: true }))) {
            throw new AppError_1.AppError('Application du modérateur introuvable ou inactive', 403);
        }
        const existing = await models_1.LicenseType.find({ product: productId }).select('slug');
        const existingSlugs = new Set(existing.map((item) => item.slug));
        const sharedTypes = await models_1.LicenseType.find({ product: { $exists: false } });
        const templates = sharedTypes.length ? sharedTypes.map((item) => ({
            slug: item.slug,
            name: item.name,
            description: item.description,
            defaultMaxUsers: item.defaultMaxUsers,
            defaultMaxWorkstations: item.defaultMaxWorkstations,
            defaultModules: item.defaultModules,
            sortOrder: item.sortOrder,
            isActive: item.isActive,
        })) : [
            { slug: 'basic', name: 'Basic', defaultMaxUsers: 2, defaultMaxWorkstations: 1, defaultModules: ['products', 'stock'], sortOrder: 1, isActive: true },
            { slug: 'standard', name: 'Standard', defaultMaxUsers: 5, defaultMaxWorkstations: 2, defaultModules: ['products', 'stock', 'pos'], sortOrder: 2, isActive: true },
            { slug: 'pro', name: 'Pro', defaultMaxUsers: 15, defaultMaxWorkstations: 5, defaultModules: ['products', 'stock', 'pos', 'billing', 'reports'], sortOrder: 3, isActive: true },
            { slug: 'enterprise', name: 'Enterprise', defaultMaxUsers: 50, defaultMaxWorkstations: 20, defaultModules: ['products', 'stock', 'pos', 'billing', 'reports', 'accounting', 'multi-store'], sortOrder: 4, isActive: true },
        ];
        for (const template of templates) {
            const slug = `${template.slug}-${productId.slice(-6)}`;
            if (!existingSlugs.has(slug)) {
                await models_1.LicenseType.updateOne({ product: productId, slug }, { $setOnInsert: { ...template, slug, product: productId } }, { upsert: true });
            }
        }
        const items = await models_1.LicenseType.find({ product: productId }).sort({ sortOrder: 1, name: 1 });
        res.json({ success: true, data: { items, total: items.length, page: 1, limit: items.length, totalPages: 1 } });
    }
    catch (error) {
        next(error);
    }
});
router.use('/products', (0, crudFactory_1.createCrudRouter)(models_1.Product, schemas_1.createProductSchema, schemas_1.updateProductSchema, {
    resource: types_1.AuditResource.PRODUCT,
    resourceLabel: 'produit',
    readRoles: [types_1.UserRole.SUPPORT, types_1.UserRole.MODERATOR],
    writeRoles: [types_1.UserRole.ADMIN],
    moderatorScope: 'self',
}));
router.use('/modules', (0, crudFactory_1.createCrudRouter)(models_1.Module, schemas_1.createModuleSchema, schemas_1.updateModuleSchema, {
    resource: types_1.AuditResource.MODULE,
    resourceLabel: 'module',
    readRoles: [types_1.UserRole.SUPPORT, types_1.UserRole.MODERATOR],
    writeRoles: [types_1.UserRole.ADMIN],
    moderatorScope: 'product',
    moderatorCanCreate: true,
}));
router.use('/license-types', (0, crudFactory_1.createCrudRouter)(models_1.LicenseType, schemas_1.createLicenseTypeSchema, schemas_1.updateLicenseTypeSchema, {
    resource: types_1.AuditResource.LICENSE_TYPE,
    resourceLabel: 'type de licence',
    readRoles: [types_1.UserRole.SUPPORT, types_1.UserRole.MODERATOR],
    writeRoles: [types_1.UserRole.ADMIN],
    moderatorScope: 'product',
    moderatorCanCreate: true,
}));
router.use('/app-versions', (0, crudFactory_1.createCrudRouter)(models_1.AppVersion, schemas_1.createAppVersionSchema, schemas_1.updateAppVersionSchema, {
    resource: types_1.AuditResource.APP_VERSION,
    resourceLabel: 'version application',
    readRoles: [types_1.UserRole.SUPPORT, types_1.UserRole.MODERATOR],
    writeRoles: [types_1.UserRole.ADMIN],
    moderatorScope: 'product',
    moderatorCanCreate: true,
}));
exports.default = router;
//# sourceMappingURL=catalogRoutes.js.map