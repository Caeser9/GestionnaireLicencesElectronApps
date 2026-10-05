import {
  Client,
  License,
  Product,
  ActivationRequest,
  ActivationLog,
  AuditLog,
} from '../models';
import { LicenseStatus, ActivationRequestStatus } from '../types';

export class StatsService {
  async getProductDashboardStats(productId: string) {
    const licenseFilter = { product: productId };
    const clientIds = await License.distinct('client', licenseFilter);
    const application = await Product.findById(productId).select('name');
    const clientFilter = { $or: [{ platformProduct: productId }, { _id: { $in: clientIds } }] };
    const [
      totalClients, activeClients, totalLicenses, activeLicenses, suspendedLicenses,
      expiredLicenses, pendingLicenses, pendingActivations, recentActivations,
      productsUsage, recentConnections, installedVersions,
    ] = await Promise.all([
      Client.countDocuments(clientFilter),
      Client.countDocuments({ ...clientFilter, isActive: true }),
      License.countDocuments(licenseFilter),
      License.countDocuments({ ...licenseFilter, status: LicenseStatus.ACTIVE }),
      License.countDocuments({ ...licenseFilter, status: LicenseStatus.SUSPENDED }),
      License.countDocuments({ ...licenseFilter, status: LicenseStatus.EXPIRED }),
      License.countDocuments({ ...licenseFilter, status: LicenseStatus.PENDING }),
      ActivationRequest.countDocuments({ product: productId, status: ActivationRequestStatus.PENDING }),
      ActivationLog.find({ product: productId, action: 'activate' }).sort({ createdAt: -1 }).limit(10)
        .populate('client', 'companyName').populate('product', 'name slug'),
      License.aggregate([
        { $match: { ...licenseFilter, status: LicenseStatus.ACTIVE } },
        { $group: { _id: '$product', count: { $sum: 1 } } },
        { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
        { $unwind: '$product' },
        { $project: { productId: '$_id', productName: '$product.name', productSlug: '$product.slug', count: 1 } },
      ]),
      ActivationLog.find({ product: productId, action: { $in: ['verify', 'heartbeat'] } })
        .sort({ createdAt: -1 }).limit(15).populate('client', 'companyName').populate('product', 'name'),
      ActivationLog.aggregate([
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
    const [
      totalClients,
      activeClients,
      totalLicenses,
      activeLicenses,
      suspendedLicenses,
      expiredLicenses,
      pendingLicenses,
      pendingActivations,
      recentActivations,
      productsUsage,
      recentConnections,
      installedVersions,
    ] = await Promise.all([
      Client.countDocuments(),
      Client.countDocuments({ isActive: true }),
      License.countDocuments(),
      License.countDocuments({ status: LicenseStatus.ACTIVE }),
      License.countDocuments({ status: LicenseStatus.SUSPENDED }),
      License.countDocuments({ status: LicenseStatus.EXPIRED }),
      License.countDocuments({ status: LicenseStatus.PENDING }),
      ActivationRequest.countDocuments({ status: ActivationRequestStatus.PENDING }),
      ActivationLog.find({ action: 'activate' })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('client', 'companyName')
        .populate('product', 'name slug'),
      License.aggregate([
        { $match: { status: LicenseStatus.ACTIVE } },
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
      ActivationLog.find({ action: { $in: ['verify', 'heartbeat'] } })
        .sort({ createdAt: -1 })
        .limit(15)
        .populate('client', 'companyName')
        .populate('product', 'name'),
      ActivationLog.aggregate([
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
      AuditLog.find()
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      AuditLog.countDocuments(),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}

export const statsService = new StatsService();
