"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.licenseService = exports.LicenseService = void 0;
exports.isLicenseExpired = isLicenseExpired;
const models_1 = require("../models");
const AppError_1 = require("../utils/AppError");
const crypto_1 = require("../utils/crypto");
const types_1 = require("../types");
const audit_1 = require("../middleware/audit");
const config_1 = require("../config");
function isLicenseExpired(license) {
    if (license.expiresAt && new Date() > license.expiresAt) {
        return true;
    }
    return license.status === types_1.LicenseStatus.EXPIRED;
}
class LicenseService {
    async createLicense(data, creator, req) {
        const client = (0, AppError_1.assertFound)(await models_1.Client.findById(data.client), 'Client non trouvé');
        const product = (0, AppError_1.assertFound)(await models_1.Product.findById(data.product), 'Produit non trouvé');
        const licenseType = (0, AppError_1.assertFound)(await models_1.LicenseType.findById(data.licenseType), 'Type de licence non trouvé');
        const license = await models_1.License.create({
            licenseKey: (0, crypto_1.generateLicenseKey)(),
            licenseToken: (0, crypto_1.generateLicenseToken)(),
            client: client._id,
            product: product._id,
            licenseType: licenseType._id,
            status: types_1.LicenseStatus.PENDING,
            maxUsers: data.maxUsers ?? licenseType.defaultMaxUsers,
            maxWorkstations: data.maxWorkstations ?? licenseType.defaultMaxWorkstations,
            authorizedModules: data.authorizedModules ?? licenseType.defaultModules,
            minVersion: data.minVersion,
            maxVersion: data.maxVersion,
            expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
            adminNotes: data.adminNotes,
            createdBy: creator.userId,
        });
        await (0, audit_1.createAuditLog)(creator, {
            action: types_1.AuditAction.CREATE,
            resource: types_1.AuditResource.LICENSE,
            resourceId: license._id.toString(),
            description: `Création licence ${license.licenseKey} pour ${client.companyName}`,
        }, req);
        return license.populate(['client', 'product', 'licenseType']);
    }
    async updateLicense(id, data, updater, req) {
        const license = (0, AppError_1.assertFound)(await models_1.License.findById(id), 'Licence non trouvée');
        if (data.licenseType) {
            const licenseType = (0, AppError_1.assertFound)(await models_1.LicenseType.findById(data.licenseType), 'Type de licence non trouvé');
            data.licenseType = licenseType._id;
            if (data.maxUsers === undefined)
                data.maxUsers = licenseType.defaultMaxUsers;
            if (data.maxWorkstations === undefined) {
                data.maxWorkstations = licenseType.defaultMaxWorkstations;
            }
            if (data.authorizedModules === undefined) {
                data.authorizedModules = licenseType.defaultModules;
            }
        }
        if (data.expiresAt !== undefined) {
            license.expiresAt = data.expiresAt ? new Date(data.expiresAt) : undefined;
            delete data.expiresAt;
        }
        Object.assign(license, data);
        if (license.status === types_1.LicenseStatus.ACTIVE && license.expiresAt && license.expiresAt < new Date()) {
            license.expiresAt = undefined;
        }
        if (license.status === types_1.LicenseStatus.ACTIVE && license.machineId) {
            await this.regenerateSignature(license);
        }
        await license.save();
        await (0, audit_1.createAuditLog)(updater, {
            action: types_1.AuditAction.UPDATE,
            resource: types_1.AuditResource.LICENSE,
            resourceId: id,
            description: `Modification licence ${license.licenseKey}`,
            changes: data,
        }, req);
        return license.populate(['client', 'product', 'licenseType']);
    }
    async suspendLicense(id, updater, req) {
        return this.updateLicense(id, { status: types_1.LicenseStatus.SUSPENDED }, updater, req);
    }
    async reactivateLicense(id, updater, req) {
        const license = (0, AppError_1.assertFound)(await models_1.License.findById(id), 'Licence non trouvée');
        if (isLicenseExpired(license)) {
            throw new AppError_1.AppError('La licence est expirée', 400);
        }
        return this.updateLicense(id, { status: types_1.LicenseStatus.ACTIVE }, updater, req);
    }
    async transferLicense(id, newMachineId, updater, req) {
        const license = (0, AppError_1.assertFound)(await models_1.License.findById(id).populate('client product licenseType'), 'Licence non trouvée');
        if (license.status !== types_1.LicenseStatus.ACTIVE) {
            throw new AppError_1.AppError('Seule une licence active peut être transférée', 400);
        }
        license.machineId = newMachineId;
        license.machineIdHash = (0, crypto_1.hashMachineId)(newMachineId);
        await this.regenerateSignature(license);
        await license.save();
        await (0, audit_1.createAuditLog)(updater, {
            action: types_1.AuditAction.TRANSFER,
            resource: types_1.AuditResource.LICENSE,
            resourceId: id,
            description: `Transfert licence ${license.licenseKey} vers nouveau poste`,
        }, req);
        return license;
    }
    async regenerateSignature(license) {
        const populated = await license.populate(['client', 'product', 'licenseType']);
        const client = populated.client;
        const product = populated.product;
        const licenseType = populated.licenseType;
        const payload = {
            licenseId: populated._id.toString(),
            licenseKey: populated.licenseKey,
            clientId: client._id.toString(),
            clientName: client.companyName,
            productId: product._id.toString(),
            productSlug: product.slug,
            licenseType: licenseType.slug,
            status: populated.status,
            maxUsers: populated.maxUsers,
            maxWorkstations: populated.maxWorkstations,
            authorizedModules: populated.authorizedModules,
            minVersion: populated.minVersion,
            maxVersion: populated.maxVersion,
            machineId: populated.machineId || '',
            activatedAt: populated.activatedAt?.toISOString() || '',
            expiresAt: populated.expiresAt?.toISOString(),
            adminNotes: populated.adminNotes,
            issuedAt: new Date().toISOString(),
        };
        populated.signature = (0, crypto_1.signLicensePayload)(payload);
        license.signature = populated.signature;
    }
    buildSignedResponse(license) {
        const client = license.client;
        const product = license.product;
        const licenseType = license.licenseType;
        const payload = {
            licenseId: license._id.toString(),
            licenseKey: license.licenseKey,
            clientId: client._id.toString(),
            clientName: client.companyName,
            productId: product._id.toString(),
            productSlug: product.slug,
            licenseType: licenseType.slug,
            status: license.status,
            maxUsers: license.maxUsers,
            maxWorkstations: license.maxWorkstations,
            authorizedModules: license.authorizedModules,
            minVersion: license.minVersion,
            maxVersion: license.maxVersion,
            machineId: license.machineId || '',
            activatedAt: license.activatedAt?.toISOString() || '',
            expiresAt: license.expiresAt?.toISOString(),
            adminNotes: license.adminNotes,
            issuedAt: new Date().toISOString(),
        };
        return {
            licenseToken: license.licenseToken,
            licenseKey: license.licenseKey,
            payload,
            signature: (0, crypto_1.signLicensePayload)(payload),
            checkIntervalDays: config_1.config.license.checkIntervalDays,
            publicKey: undefined, // clients should embed public key
        };
    }
    async approveActivation(requestId, data, approver, req) {
        const activationRequest = (0, AppError_1.assertFound)(await models_1.ActivationRequest.findById(requestId).populate('product'), 'Demande non trouvée');
        if (activationRequest.status !== types_1.ActivationRequestStatus.PENDING) {
            throw new AppError_1.AppError(`Cette demande a déjà été traitée (statut: ${activationRequest.status}).`, 400);
        }
        const productId = typeof activationRequest.product === 'object' &&
            activationRequest.product !== null &&
            '_id' in activationRequest.product
            ? activationRequest.product._id.toString()
            : String(activationRequest.product);
        let client;
        if (data.clientId) {
            client = (0, AppError_1.assertFound)(await models_1.Client.findById(data.clientId), 'Client non trouvé');
        }
        else {
            client = await models_1.Client.create({
                companyName: activationRequest.companyName,
                contactName: activationRequest.companyName,
                email: activationRequest.contactEmail,
                phone: activationRequest.contactPhone,
                createdBy: approver.userId,
            });
        }
        const license = await this.createLicense({
            client: client._id.toString(),
            product: productId,
            licenseType: data.licenseTypeId,
            maxUsers: data.maxUsers,
            maxWorkstations: data.maxWorkstations,
            authorizedModules: data.authorizedModules,
            expiresAt: data.expiresAt,
            adminNotes: data.adminNotes,
        }, approver, req);
        const licenseDoc = (0, AppError_1.assertFound)(await models_1.License.findById(license._id), 'Licence non trouvée');
        licenseDoc.status = types_1.LicenseStatus.ACTIVE;
        licenseDoc.activatedAt = new Date();
        licenseDoc.machineId = activationRequest.machineId;
        licenseDoc.machineIdHash = activationRequest.machineIdHash;
        await this.regenerateSignature(licenseDoc);
        await licenseDoc.save();
        activationRequest.status = types_1.ActivationRequestStatus.APPROVED;
        activationRequest.license = licenseDoc._id;
        activationRequest.processedBy = approver.userId;
        activationRequest.processedAt = new Date();
        await activationRequest.save();
        await (0, audit_1.createAuditLog)(approver, {
            action: types_1.AuditAction.APPROVE,
            resource: types_1.AuditResource.ACTIVATION,
            resourceId: requestId,
            description: `Activation approuvée pour ${client.companyName}`,
        }, req);
        const populated = await licenseDoc.populate(['client', 'product', 'licenseType']);
        return this.buildSignedResponse(populated);
    }
    async rejectActivation(requestId, reason, rejecter, req) {
        const activationRequest = (0, AppError_1.assertFound)(await models_1.ActivationRequest.findById(requestId), 'Demande non trouvée');
        if (activationRequest.status !== types_1.ActivationRequestStatus.PENDING) {
            throw new AppError_1.AppError('Cette demande a déjà été traitée', 400);
        }
        activationRequest.status = types_1.ActivationRequestStatus.REJECTED;
        activationRequest.rejectionReason = reason;
        activationRequest.processedBy = rejecter.userId;
        activationRequest.processedAt = new Date();
        await activationRequest.save();
        await (0, audit_1.createAuditLog)(rejecter, {
            action: types_1.AuditAction.REJECT,
            resource: types_1.AuditResource.ACTIVATION,
            resourceId: requestId,
            description: `Activation rejetée: ${reason}`,
        }, req);
        return activationRequest;
    }
    async listLicenses(query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const filter = {};
        if (query.status)
            filter.status = query.status;
        if (query.client)
            filter.client = query.client;
        if (query.product)
            filter.product = query.product;
        if (query.search) {
            filter.licenseKey = { $regex: query.search, $options: 'i' };
        }
        const [items, total] = await Promise.all([
            models_1.License.find(filter)
                .populate('client', 'companyName email')
                .populate('product', 'name slug')
                .populate('licenseType', 'name slug')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            models_1.License.countDocuments(filter),
        ]);
        return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async getLicense(id) {
        return (0, AppError_1.assertFound)(await models_1.License.findById(id)
            .populate('client')
            .populate('product')
            .populate('licenseType')
            .populate('createdBy', 'firstName lastName email'), 'Licence non trouvée');
    }
    async getActivationLogs(licenseId, page = 1, limit = 20) {
        const [items, total] = await Promise.all([
            models_1.ActivationLog.find({ license: licenseId })
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            models_1.ActivationLog.countDocuments({ license: licenseId }),
        ]);
        return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
}
exports.LicenseService = LicenseService;
exports.licenseService = new LicenseService();
//# sourceMappingURL=licenseService.js.map