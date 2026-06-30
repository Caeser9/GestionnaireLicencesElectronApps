"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientApiService = exports.ClientApiService = void 0;
const models_1 = require("../models");
const AppError_1 = require("../utils/AppError");
const types_1 = require("../types");
const crypto_1 = require("../utils/crypto");
const licenseService_1 = require("./licenseService");
const config_1 = require("../config");
class ClientApiService {
    async requestActivation(data, req) {
        const product = (0, AppError_1.assertFound)(await models_1.Product.findOne({ slug: data.productSlug, isActive: true }), 'Produit non trouvé');
        const machineIdHash = (0, crypto_1.hashMachineId)(data.machineId);
        // If license key provided, try direct activation
        if (data.licenseKey) {
            const license = await models_1.License.findOne({
                licenseKey: data.licenseKey.toUpperCase(),
                product: product._id,
            }).populate(['client', 'product', 'licenseType']);
            if (license) {
                if (license.status === types_1.LicenseStatus.ACTIVE && license.machineIdHash === machineIdHash) {
                    return {
                        status: 'already_active',
                        ...licenseService_1.licenseService.buildSignedResponse(license),
                    };
                }
                if (license.status === types_1.LicenseStatus.PENDING) {
                    license.status = types_1.LicenseStatus.ACTIVE;
                    license.activatedAt = new Date();
                    license.machineId = data.machineId;
                    license.machineIdHash = machineIdHash;
                    await licenseService_1.licenseService.regenerateSignature(license);
                    await license.save();
                    await this.logActivation(license, data.machineId, data.appVersion, 'activate', req);
                    return {
                        status: 'activated',
                        ...licenseService_1.licenseService.buildSignedResponse(license),
                    };
                }
                if (license.status === types_1.LicenseStatus.ACTIVE && !license.machineId) {
                    license.machineId = data.machineId;
                    license.machineIdHash = machineIdHash;
                    await licenseService_1.licenseService.regenerateSignature(license);
                    await license.save();
                    await this.logActivation(license, data.machineId, data.appVersion, 'activate', req);
                    return {
                        status: 'activated',
                        ...licenseService_1.licenseService.buildSignedResponse(license),
                    };
                }
                throw new AppError_1.AppError('Cette licence est déjà activée sur un autre poste', 409);
            }
        }
        // Check for existing pending request
        const existingRequest = await models_1.ActivationRequest.findOne({
            machineIdHash,
            product: product._id,
            status: types_1.ActivationRequestStatus.PENDING,
        });
        if (existingRequest) {
            return {
                status: 'pending',
                requestId: existingRequest._id,
                message: 'Une demande d\'activation est en attente de validation',
            };
        }
        // Licence déjà approuvée pour cette machine (admin a validé la demande)
        const approvedRequest = await models_1.ActivationRequest.findOne({
            machineIdHash,
            product: product._id,
            status: types_1.ActivationRequestStatus.APPROVED,
        });
        if (approvedRequest?.license) {
            const license = await models_1.License.findById(approvedRequest.license).populate([
                'client',
                'product',
                'licenseType',
            ]);
            if (license &&
                license.status === types_1.LicenseStatus.ACTIVE &&
                license.machineIdHash === machineIdHash) {
                await this.logActivation(license, data.machineId, data.appVersion, 'activate', req);
                return {
                    status: 'activated',
                    ...licenseService_1.licenseService.buildSignedResponse(license),
                };
            }
        }
        // Licence active déjà liée à cette machine (sans demande en cours)
        const activeForMachine = await models_1.License.findOne({
            product: product._id,
            machineIdHash,
            status: types_1.LicenseStatus.ACTIVE,
        }).populate(['client', 'product', 'licenseType']);
        if (activeForMachine && !(0, licenseService_1.isLicenseExpired)(activeForMachine)) {
            await this.logActivation(activeForMachine, data.machineId, data.appVersion, 'activate', req);
            return {
                status: 'already_active',
                ...licenseService_1.licenseService.buildSignedResponse(activeForMachine),
            };
        }
        const activationRequest = await models_1.ActivationRequest.create({
            product: product._id,
            companyName: data.companyName,
            contactEmail: data.contactEmail,
            contactPhone: data.contactPhone,
            machineId: data.machineId,
            machineIdHash,
            appVersion: data.appVersion,
            osInfo: data.osInfo,
            hostname: data.hostname,
            ipAddress: req?.ip,
        });
        return {
            status: 'pending',
            requestId: activationRequest._id,
            message: 'Demande d\'activation envoyée. En attente de validation administrateur.',
        };
    }
    async verifyLicense(data, req) {
        const license = (0, AppError_1.assertFound)(await models_1.License.findOne({ licenseToken: data.licenseToken })
            .populate(['client', 'product', 'licenseType']), 'Licence non trouvée');
        if (license.machineIdHash !== (0, crypto_1.hashMachineId)(data.machineId)) {
            throw new AppError_1.AppError('Machine ID non correspondant', 403);
        }
        if (license.status === types_1.LicenseStatus.SUSPENDED) {
            throw new AppError_1.AppError('Licence suspendue', 403);
        }
        if ((0, licenseService_1.isLicenseExpired)(license)) {
            license.status = types_1.LicenseStatus.EXPIRED;
            await license.save();
            throw new AppError_1.AppError('Licence expirée', 403);
        }
        if (license.status !== types_1.LicenseStatus.ACTIVE) {
            throw new AppError_1.AppError('Licence non active', 403);
        }
        license.lastVerifiedAt = new Date();
        await license.save();
        await this.logActivation(license, data.machineId, data.appVersion, 'verify', req);
        return {
            valid: true,
            ...licenseService_1.licenseService.buildSignedResponse(license),
        };
    }
    async getActivationStatus(data, req) {
        const request = (0, AppError_1.assertFound)(await models_1.ActivationRequest.findById(data.requestId).populate('license'), 'Demande non trouvée');
        const machineIdHash = (0, crypto_1.hashMachineId)(data.machineId);
        if (request.machineIdHash !== machineIdHash) {
            throw new AppError_1.AppError('Machine ID non correspondant pour cette demande', 403);
        }
        if (request.status === types_1.ActivationRequestStatus.PENDING) {
            return { status: 'pending', requestId: request._id };
        }
        if (request.status === types_1.ActivationRequestStatus.REJECTED) {
            return {
                status: 'rejected',
                requestId: request._id,
                reason: request.rejectionReason || 'Demande rejetée par administrateur',
            };
        }
        if (!request.license) {
            throw new AppError_1.AppError('Licence introuvable pour cette demande approuvée', 404);
        }
        const license = (0, AppError_1.assertFound)(await models_1.License.findById(request.license).populate(['client', 'product', 'licenseType']), 'Licence non trouvée');
        if (license.status !== types_1.LicenseStatus.ACTIVE) {
            throw new AppError_1.AppError('Licence non active', 403);
        }
        if (license.machineIdHash !== machineIdHash) {
            throw new AppError_1.AppError('Machine ID non correspondant pour cette licence', 403);
        }
        if (data.appVersion) {
            await this.logActivation(license, data.machineId, data.appVersion, 'activate', req);
        }
        return {
            status: 'activated',
            requestId: request._id,
            ...licenseService_1.licenseService.buildSignedResponse(license),
        };
    }
    async getLicenseInfo(licenseToken) {
        const license = (0, AppError_1.assertFound)(await models_1.License.findOne({ licenseToken })
            .populate(['client', 'product', 'licenseType']), 'Licence non trouvée');
        return licenseService_1.licenseService.buildSignedResponse(license);
    }
    async transferLicense(data, req) {
        const license = (0, AppError_1.assertFound)(await models_1.License.findOne({ licenseToken: data.licenseToken })
            .populate(['client', 'product', 'licenseType']), 'Licence non trouvée');
        if (license.machineIdHash !== (0, crypto_1.hashMachineId)(data.oldMachineId)) {
            throw new AppError_1.AppError('Machine ID actuel non correspondant', 403);
        }
        if (license.status !== types_1.LicenseStatus.ACTIVE) {
            throw new AppError_1.AppError('Seule une licence active peut être transférée', 400);
        }
        license.machineId = data.newMachineId;
        license.machineIdHash = (0, crypto_1.hashMachineId)(data.newMachineId);
        await licenseService_1.licenseService.regenerateSignature(license);
        await license.save();
        await this.logActivation(license, data.newMachineId, data.appVersion, 'transfer', req);
        return {
            status: 'transferred',
            ...licenseService_1.licenseService.buildSignedResponse(license),
        };
    }
    async getAuthorizedModules(licenseToken) {
        const license = (0, AppError_1.assertFound)(await models_1.License.findOne({ licenseToken }).populate('product'), 'Licence non trouvée');
        if (license.status !== types_1.LicenseStatus.ACTIVE) {
            throw new AppError_1.AppError('Licence non active', 403);
        }
        return {
            modules: license.authorizedModules,
            productSlug: license.product.slug,
        };
    }
    async checkUpdates(productSlug, currentVersion, licenseToken) {
        const product = (0, AppError_1.assertFound)(await models_1.Product.findOne({ slug: productSlug, isActive: true }), 'Produit non trouvé');
        const latestVersion = await models_1.AppVersion.findOne({
            product: product._id,
            isActive: true,
        }).sort({ publishedAt: -1 });
        if (!latestVersion) {
            return { updateAvailable: false, currentVersion, latestVersion: product.currentVersion };
        }
        const updateAvailable = this.compareVersions(currentVersion, latestVersion.version) < 0;
        if (licenseToken) {
            const license = await models_1.License.findOne({ licenseToken });
            if (license) {
                await models_1.ActivationLog.create({
                    license: license._id,
                    client: license.client,
                    product: license.product,
                    machineId: license.machineId || '',
                    appVersion: currentVersion,
                    action: 'update_check',
                    success: true,
                    metadata: { latestVersion: latestVersion.version, updateAvailable },
                });
            }
        }
        return {
            updateAvailable,
            currentVersion,
            latestVersion: latestVersion.version,
            releaseNotes: latestVersion.releaseNotes,
            downloadUrl: latestVersion.downloadUrl,
            isMandatory: latestVersion.isMandatory,
            isRecommended: latestVersion.isRecommended,
            checksum: latestVersion.checksum,
            fileSize: latestVersion.fileSize,
        };
    }
    async heartbeat(data, req) {
        const license = await models_1.License.findOne({ licenseToken: data.licenseToken });
        if (!license) {
            throw new AppError_1.AppError('Licence non trouvée', 404);
        }
        await this.logActivation(license, data.machineId, data.appVersion, 'heartbeat', req);
        return {
            status: 'ok',
            serverTime: new Date().toISOString(),
            checkIntervalDays: config_1.config.license.checkIntervalDays,
        };
    }
    async logActivation(license, machineId, appVersion, action, req) {
        await models_1.ActivationLog.create({
            license: license._id,
            client: license.client,
            product: license.product,
            machineId,
            appVersion,
            action,
            ipAddress: req?.ip,
            success: true,
        });
    }
    compareVersions(a, b) {
        const partsA = a.split('.').map(Number);
        const partsB = b.split('.').map(Number);
        const maxLen = Math.max(partsA.length, partsB.length);
        for (let i = 0; i < maxLen; i++) {
            const numA = partsA[i] || 0;
            const numB = partsB[i] || 0;
            if (numA < numB)
                return -1;
            if (numA > numB)
                return 1;
        }
        return 0;
    }
}
exports.ClientApiService = ClientApiService;
exports.clientApiService = new ClientApiService();
//# sourceMappingURL=clientApiService.js.map