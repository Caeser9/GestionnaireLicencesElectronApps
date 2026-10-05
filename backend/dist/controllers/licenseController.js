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
exports.listLicenses = listLicenses;
exports.getLicense = getLicense;
exports.createLicense = createLicense;
exports.updateLicense = updateLicense;
exports.suspendLicense = suspendLicense;
exports.reactivateLicense = reactivateLicense;
exports.transferLicense = transferLicense;
exports.getActivationLogs = getActivationLogs;
exports.listActivationRequests = listActivationRequests;
exports.approveActivation = approveActivation;
exports.rejectActivation = rejectActivation;
const licenseService_1 = require("../services/licenseService");
const params_1 = require("../utils/params");
const models_1 = require("../models");
const AppError_1 = require("../utils/AppError");
async function tenantClientIds(req) {
    if (req.user?.role !== 'moderator')
        return undefined;
    if (!req.user.productId) {
        throw new AppError_1.AppError('Ce compte modérateur doit être associé à une application', 403);
    }
    const clientIds = await models_1.License.distinct('client', { product: req.user.productId });
    return clientIds.map((clientId) => clientId.toString());
}
async function assertLicenseAccess(req, licenseId) {
    if (req.user?.role !== 'moderator')
        return;
    if (!req.user.productId) {
        throw new AppError_1.AppError('Ce compte modérateur doit être associé à une application', 403);
    }
    const license = await models_1.License.findById(licenseId).select('client');
    if (!license)
        throw new AppError_1.AppError('Licence non trouvée', 404);
    const belongsToProduct = await models_1.License.exists({ _id: licenseId, product: req.user.productId });
    if (!belongsToProduct)
        throw new AppError_1.AppError('Licence hors de votre application', 403);
}
async function listLicenses(req, res, next) {
    try {
        const result = await licenseService_1.licenseService.listLicenses({
            page: Number(req.query.page) || 1,
            limit: Number(req.query.limit) || 20,
            search: req.query.search,
            status: req.query.status,
            client: req.query.client,
            product: req.user?.role === 'moderator' ? req.user.productId : req.query.product,
            clientIds: await tenantClientIds(req),
        });
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
}
async function getLicense(req, res, next) {
    try {
        const license = await licenseService_1.licenseService.getLicense((0, params_1.getParamId)(req.params));
        await assertLicenseAccess(req, (0, params_1.getParamId)(req.params));
        res.json({ success: true, data: license });
    }
    catch (error) {
        next(error);
    }
}
async function createLicense(req, res, next) {
    try {
        if (req.user?.role === 'moderator') {
            const existingClientIds = await tenantClientIds(req);
            const [owned, assignedProduct] = await Promise.all([
                models_1.Client.exists({ _id: req.body.client, $or: [
                        { platformProduct: req.user.productId },
                        { _id: { $in: existingClientIds } },
                    ] }),
                Promise.resolve(String(req.body.product) === req.user.productId),
            ]);
            if (!owned || !assignedProduct)
                throw new AppError_1.AppError('Client ou application hors de votre périmètre', 403);
        }
        const license = await licenseService_1.licenseService.createLicense(req.body, req.user, req);
        res.status(201).json({ success: true, data: license });
    }
    catch (error) {
        next(error);
    }
}
async function updateLicense(req, res, next) {
    try {
        await assertLicenseAccess(req, (0, params_1.getParamId)(req.params));
        const license = await licenseService_1.licenseService.updateLicense((0, params_1.getParamId)(req.params), req.body, req.user, req);
        res.json({ success: true, data: license });
    }
    catch (error) {
        next(error);
    }
}
async function suspendLicense(req, res, next) {
    try {
        await assertLicenseAccess(req, (0, params_1.getParamId)(req.params));
        const license = await licenseService_1.licenseService.suspendLicense((0, params_1.getParamId)(req.params), req.user, req);
        res.json({ success: true, data: license });
    }
    catch (error) {
        next(error);
    }
}
async function reactivateLicense(req, res, next) {
    try {
        await assertLicenseAccess(req, (0, params_1.getParamId)(req.params));
        const license = await licenseService_1.licenseService.reactivateLicense((0, params_1.getParamId)(req.params), req.user, req);
        res.json({ success: true, data: license });
    }
    catch (error) {
        next(error);
    }
}
async function transferLicense(req, res, next) {
    try {
        await assertLicenseAccess(req, (0, params_1.getParamId)(req.params));
        const { newMachineId } = req.body;
        const license = await licenseService_1.licenseService.transferLicense((0, params_1.getParamId)(req.params), newMachineId, req.user, req);
        res.json({ success: true, data: license });
    }
    catch (error) {
        next(error);
    }
}
async function getActivationLogs(req, res, next) {
    try {
        await assertLicenseAccess(req, (0, params_1.getParamId)(req.params));
        const result = await licenseService_1.licenseService.getActivationLogs((0, params_1.getParamId)(req.params), Number(req.query.page) || 1, Number(req.query.limit) || 20);
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
}
async function listActivationRequests(req, res, next) {
    try {
        if (req.user?.role === 'moderator')
            throw new AppError_1.AppError('Accès non autorisé', 403);
        const { ActivationRequest } = await Promise.resolve().then(() => __importStar(require('../models')));
        const { status } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        const requests = await ActivationRequest.find(filter)
            .populate('product', 'name slug')
            .populate('license')
            .populate('processedBy', 'firstName lastName')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: requests });
    }
    catch (error) {
        next(error);
    }
}
async function approveActivation(req, res, next) {
    try {
        const result = await licenseService_1.licenseService.approveActivation((0, params_1.getParamId)(req.params), req.body, req.user, req);
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
}
async function rejectActivation(req, res, next) {
    try {
        const result = await licenseService_1.licenseService.rejectActivation((0, params_1.getParamId)(req.params), req.body.reason, req.user, req);
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=licenseController.js.map