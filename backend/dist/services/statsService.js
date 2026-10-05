"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statsService = exports.StatsService = void 0;
const models_1 = require("../models");
const types_1 = require("../types");
class StatsService {
    async getProductDashboardStats(productId) {
        const licenseFilter = { product: productId };
        const clientIds = await models_1.License.distinct('client', licenseFilter);
        const application = await models_1.Product.findById(productId).select('name');
        const clientFilter = { $or: [{ platformProduct: productId }, { _id: { $in: clientIds } }] };
        const [totalClients, activeClients, totalLicenses, activeLicenses, suspendedLicenses, expiredLicenses, pendingLicenses, pendingActivations, recentActivations, productsUsage, recentConnections, installedVersions,] = await Promise.all([
            models_1.Client.countDocuments(clientFilter),
            models_1.Client.countDocuments({ ...clientFilter, isActive: true }),
            models_1.License.countDocuments(licenseFilter),
            models_1.License.countDocuments({ ...licenseFilter, status: types_1.LicenseStatus.ACTIVE }),
            models_1.License.countDocuments({ ...licenseFilter, status: types_1.LicenseStatus.SUSPENDED }),
            models_1.License.countDocuments({ ...licenseFilter, status: types_1.LicenseStatus.EXPIRED }),
            models_1.License.countDocuments({ ...licenseFilter, status: types_1.LicenseStatus.PENDING }),
            models_1.ActivationRequest.countDocuments({ product: productId, status: types_1.ActivationRequestStatus.PENDING }),
            models_1.ActivationLog.find({ product: productId, action: 'activate' }).sort({ createdAt: -1 }).limit(10)
                .populate('client', 'companyName').populate('product', 'name slug'),
            models_1.License.aggregate([
                { $match: { ...licenseFilter, status: types_1.LicenseStatus.ACTIVE } },
                { $group: { _id: '$product', count: { $sum: 1 } } },
                { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
                { $unwind: '$product' },
                { $project: { productId: '$_id', productName: '$product.name', productSlug: '$product.slug', count: 1 } },
            ]),
            models_1.ActivationLog.find({ product: productId, action: { $in: ['verify', 'heartbeat'] } })
                .sort({ createdAt: -1 }).limit(15).populate('client', 'companyName').populate('product', 'name'),
            models_1.ActivationLog.aggregate([
                { $match: { product: productId } },
                { $group: { _id: '$appVersion', count: { $sum: 1 }, lastSeen: { $max: '$createdAt' } } },
                { $sort: { count: -1 } }, { $limit: 20 },
                { $project: { productName: { $literal: application?.name || '' }, version: '$_id', installations: '$count', lastSeen: 1 } },
            ]),
        ]);
        return {
            overview: { totalClients, activeClients, totalLicenses, activeLicenses, suspendedLicenses,
                expiredLicenses, pendingLicenses, pendingActivations },
            recentActivations, productsUsage, recentConnections, installedVersions,
        };
    }
    async getDashboardStats() {
        const [totalClients, activeClients, totalLicenses, activeLicenses, suspendedLicenses, expiredLicenses, pendingLicenses, pendingActivations, recentActivations, productsUsage, recentConnections, installedVersions,] = await Promise.all([
            models_1.Client.countDocuments(),
            models_1.Client.countDocuments({ isActive: true }),
            models_1.License.countDocuments(),
            models_1.License.countDocuments({ status: types_1.LicenseStatus.ACTIVE }),
            models_1.License.countDocuments({ status: types_1.LicenseStatus.SUSPENDED }),
            models_1.License.countDocuments({ status: types_1.LicenseStatus.EXPIRED }),
            models_1.License.countDocuments({ status: types_1.LicenseStatus.PENDING }),
            models_1.ActivationRequest.countDocuments({ status: types_1.ActivationRequestStatus.PENDING }),
            models_1.ActivationLog.find({ action: 'activate' })
                .sort({ createdAt: -1 })
                .limit(10)
                .populate('client', 'companyName')
                .populate('product', 'name slug'),
            models_1.License.aggregate([
                { $match: { status: types_1.LicenseStatus.ACTIVE } },
                { $group: { _id: '$product', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 },
                {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'product',
                    },
                },
                { $unwind: '$product' },
                {
                    $project: {
                        productId: '$_id',
                        productName: '$product.name',
                        productSlug: '$product.slug',
                        count: 1,
                    },
                },
            ]),
            models_1.ActivationLog.find({ action: { $in: ['verify', 'heartbeat'] } })
                .sort({ createdAt: -1 })
                .limit(15)
                .populate('client', 'companyName')
                .populate('product', 'name'),
            models_1.ActivationLog.aggregate([
                {
                    $group: {
                        _id: { product: '$product', version: '$appVersion' },
                        count: { $sum: 1 },
                        lastSeen: { $max: '$createdAt' },
                    },
                },
                { $sort: { count: -1 } },
                { $limit: 20 },
                {
                    $lookup: {
                        from: 'products',
                        localField: '_id.product',
                        foreignField: '_id',
                        as: 'product',
                    },
                },
                { $unwind: '$product' },
                {
                    $project: {
                        productName: '$product.name',
                        version: '$_id.version',
                        installations: '$count',
                        lastSeen: 1,
                    },
                },
            ]),
        ]);
        return {
            overview: {
                totalClients,
                activeClients,
                totalLicenses,
                activeLicenses,
                suspendedLicenses,
                expiredLicenses,
                pendingLicenses,
                pendingActivations,
            },
            recentActivations,
            productsUsage,
            recentConnections,
            installedVersions,
        };
    }
    async getAuditLogs(page = 1, limit = 30) {
        const [items, total] = await Promise.all([
            models_1.AuditLog.find()
                .populate('user', 'firstName lastName email')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            models_1.AuditLog.countDocuments(),
        ]);
        return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
}
exports.StatsService = StatsService;
exports.statsService = new StatsService();
//# sourceMappingURL=statsService.js.map