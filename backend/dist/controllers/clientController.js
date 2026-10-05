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
exports.listClients = listClients;
exports.getClient = getClient;
exports.createClient = createClient;
exports.updateClient = updateClient;
exports.deleteClient = deleteClient;
exports.getClientHistory = getClientHistory;
const models_1 = require("../models");
const AppError_1 = require("../utils/AppError");
const params_1 = require("../utils/params");
const audit_1 = require("../middleware/audit");
const types_1 = require("../types");
async function tenantFilter(req) {
    if (req.user?.role !== 'moderator')
        return {};
    if (!req.user.productId)
        throw new AppError_1.AppError('Ce compte modérateur doit être associé à une application', 403);
    const clientsWithLicenses = await models_1.License.distinct('client', { product: req.user.productId });
    return { $and: [{ $or: [
                    { platformProduct: req.user.productId },
                    { _id: { $in: clientsWithLicenses } },
                ] }] };
}
async function listClients(req, res, next) {
    try {
        const { page = '1', limit = '20', search } = req.query;
        const filter = await tenantFilter(req);
        if (search) {
            const searchFilter = { $or: [
                    { companyName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { contactName: { $regex: search, $options: 'i' } },
                ] };
            if (filter.$and)
                filter.$and.push(searchFilter);
            else
                Object.assign(filter, searchFilter);
        }
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const [items, total] = await Promise.all([
            models_1.Client.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
            models_1.Client.countDocuments(filter),
        ]);
        res.json({
            success: true,
            data: { items, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
        });
    }
    catch (error) {
        next(error);
    }
}
async function getClient(req, res, next) {
    try {
        const client = (0, AppError_1.assertFound)(await models_1.Client.findOne({ _id: (0, params_1.getParamId)(req.params), ...await tenantFilter(req) }), 'Client non trouvé');
        res.json({ success: true, data: client });
    }
    catch (error) {
        next(error);
    }
}
async function createClient(req, res, next) {
    try {
        const client = await models_1.Client.create({ ...req.body, createdBy: req.user.userId,
            ...(req.user.role === 'moderator' ? { platformProduct: req.user.productId } : {}) });
        await (0, audit_1.createAuditLog)(req.user, {
            action: types_1.AuditAction.CREATE,
            resource: types_1.AuditResource.CLIENT,
            resourceId: client._id.toString(),
            description: `Création client ${client.companyName}`,
        }, req);
        res.status(201).json({ success: true, data: client });
    }
    catch (error) {
        next(error);
    }
}
async function updateClient(req, res, next) {
    try {
        const client = (0, AppError_1.assertFound)(await models_1.Client.findOne({ _id: (0, params_1.getParamId)(req.params), ...await tenantFilter(req) }), 'Client non trouvé');
        Object.assign(client, req.body);
        await client.save();
        await (0, audit_1.createAuditLog)(req.user, {
            action: types_1.AuditAction.UPDATE,
            resource: types_1.AuditResource.CLIENT,
            resourceId: client._id.toString(),
            description: `Modification client ${client.companyName}`,
            changes: req.body,
        }, req);
        res.json({ success: true, data: client });
    }
    catch (error) {
        next(error);
    }
}
async function deleteClient(req, res, next) {
    try {
        const client = (0, AppError_1.assertFound)(await models_1.Client.findOne({ _id: (0, params_1.getParamId)(req.params), ...await tenantFilter(req) }), 'Client non trouvé');
        client.isActive = false;
        await client.save();
        await (0, audit_1.createAuditLog)(req.user, {
            action: types_1.AuditAction.DELETE,
            resource: types_1.AuditResource.CLIENT,
            resourceId: client._id.toString(),
            description: `Désactivation client ${client.companyName}`,
        }, req);
        res.json({ success: true, message: 'Client désactivé' });
    }
    catch (error) {
        next(error);
    }
}
async function getClientHistory(req, res, next) {
    try {
        const client = (0, AppError_1.assertFound)(await models_1.Client.findOne({ _id: (0, params_1.getParamId)(req.params), ...await tenantFilter(req) }), 'Client non trouvé');
        const { AuditLog } = await Promise.resolve().then(() => __importStar(require('../models')));
        const logs = await AuditLog.find({
            resource: types_1.AuditResource.CLIENT,
            resourceId: (0, params_1.getParamId)(req.params),
        })
            .populate('user', 'firstName lastName')
            .sort({ createdAt: -1 })
            .limit(50);
        res.json({ success: true, data: logs });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=clientController.js.map