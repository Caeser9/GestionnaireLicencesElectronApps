"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const normalizeBody_1 = require("../middleware/normalizeBody");
const validate_1 = require("../utils/validate");
const schemas_1 = require("../validators/schemas");
const licenseController = __importStar(require("../controllers/licenseController"));
const types_1 = require("../types");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', (0, auth_1.authorize)(types_1.UserRole.SUPPORT), licenseController.listLicenses);
router.get('/activations', (0, auth_1.authorize)(types_1.UserRole.SUPPORT), licenseController.listActivationRequests);
router.get('/:id', (0, auth_1.authorize)(types_1.UserRole.SUPPORT), (0, validate_1.validateParams)(schemas_1.mongoIdSchema), licenseController.getLicense);
router.get('/:id/logs', (0, auth_1.authorize)(types_1.UserRole.SUPPORT), (0, validate_1.validateParams)(schemas_1.mongoIdSchema), licenseController.getActivationLogs);
router.post('/', (0, auth_1.authorize)(types_1.UserRole.ADMIN), normalizeBody_1.normalizeLicenseNumericFields, (0, validate_1.validateBody)(schemas_1.createLicenseSchema), licenseController.createLicense);
router.put('/:id', (0, auth_1.authorize)(types_1.UserRole.ADMIN), (0, validate_1.validateParams)(schemas_1.mongoIdSchema), normalizeBody_1.normalizeLicenseNumericFields, (0, validate_1.validateBody)(schemas_1.updateLicenseSchema), licenseController.updateLicense);
router.post('/:id/suspend', (0, auth_1.authorize)(types_1.UserRole.ADMIN), (0, validate_1.validateParams)(schemas_1.mongoIdSchema), licenseController.suspendLicense);
router.post('/:id/reactivate', (0, auth_1.authorize)(types_1.UserRole.ADMIN), (0, validate_1.validateParams)(schemas_1.mongoIdSchema), licenseController.reactivateLicense);
router.post('/:id/transfer', (0, auth_1.authorize)(types_1.UserRole.ADMIN), (0, validate_1.validateParams)(schemas_1.mongoIdSchema), licenseController.transferLicense);
router.post('/activations/:id/approve', (0, auth_1.authorize)(types_1.UserRole.ADMIN), (0, validate_1.validateParams)(schemas_1.mongoIdSchema), normalizeBody_1.normalizeLicenseNumericFields, (0, validate_1.validateBody)(schemas_1.approveActivationSchema), licenseController.approveActivation);
router.post('/activations/:id/reject', (0, auth_1.authorize)(types_1.UserRole.ADMIN), (0, validate_1.validateParams)(schemas_1.mongoIdSchema), (0, validate_1.validateBody)(schemas_1.rejectActivationSchema), licenseController.rejectActivation);
exports.default = router;
//# sourceMappingURL=licenseRoutes.js.map