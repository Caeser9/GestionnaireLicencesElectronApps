"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const models_1 = require("../models");
const crudFactory_1 = require("./crudFactory");
const schemas_1 = require("../validators/schemas");
const types_1 = require("../types");
const router = (0, express_1.Router)();
router.use('/products', (0, crudFactory_1.createCrudRouter)(models_1.Product, schemas_1.createProductSchema, schemas_1.updateProductSchema, {
    resource: types_1.AuditResource.PRODUCT,
    resourceLabel: 'produit',
    readRoles: [types_1.UserRole.SUPPORT, types_1.UserRole.MODERATOR],
    writeRoles: [types_1.UserRole.ADMIN, types_1.UserRole.MODERATOR],
    moderatorScope: 'self',
}));
router.use('/modules', (0, crudFactory_1.createCrudRouter)(models_1.Module, schemas_1.createModuleSchema, schemas_1.updateModuleSchema, {
    resource: types_1.AuditResource.MODULE,
    resourceLabel: 'module',
    readRoles: [types_1.UserRole.SUPPORT, types_1.UserRole.MODERATOR],
    writeRoles: [types_1.UserRole.ADMIN, types_1.UserRole.MODERATOR],
    moderatorScope: 'product',
    moderatorCanCreate: true,
}));
router.use('/license-types', (0, crudFactory_1.createCrudRouter)(models_1.LicenseType, schemas_1.createLicenseTypeSchema, schemas_1.updateLicenseTypeSchema, {
    resource: types_1.AuditResource.LICENSE_TYPE,
    resourceLabel: 'type de licence',
    readRoles: [types_1.UserRole.SUPPORT, types_1.UserRole.MODERATOR],
    writeRoles: [types_1.UserRole.ADMIN, types_1.UserRole.MODERATOR],
    moderatorScope: 'product',
    moderatorCanCreate: true,
}));
router.use('/app-versions', (0, crudFactory_1.createCrudRouter)(models_1.AppVersion, schemas_1.createAppVersionSchema, schemas_1.updateAppVersionSchema, {
    resource: types_1.AuditResource.APP_VERSION,
    resourceLabel: 'version application',
    readRoles: [types_1.UserRole.SUPPORT, types_1.UserRole.MODERATOR],
    writeRoles: [types_1.UserRole.ADMIN, types_1.UserRole.MODERATOR],
    moderatorScope: 'product',
    moderatorCanCreate: true,
}));
exports.default = router;
//# sourceMappingURL=catalogRoutes.js.map