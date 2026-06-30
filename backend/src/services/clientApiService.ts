import {
  Product,
  License,
  ActivationRequest,
  ActivationLog,
  AppVersion,
  Client,
} from '../models';
import { AppError, assertFound } from '../utils/AppError';
import {
  LicenseStatus,
  ActivationRequestStatus,
} from '../types';
import { hashMachineId } from '../utils/crypto';
import { licenseService, isLicenseExpired } from './licenseService';
import { config } from '../config';
import { Request } from 'express';

export class ClientApiService {
  async requestActivation(
    data: {
      productSlug: string;
      licenseKey?: string;
      companyName: string;
      contactEmail: string;
      contactPhone?: string;
      machineId: string;
      appVersion: string;
      osInfo?: string;
      hostname?: string;
    },
    req?: Request
  ) {
    const product = assertFound(
      await Product.findOne({ slug: data.productSlug, isActive: true }),
      'Produit non trouvé'
    );

    const machineIdHash = hashMachineId(data.machineId);

    // If license key provided, try direct activation
    if (data.licenseKey) {
      const license = await License.findOne({
        licenseKey: data.licenseKey.toUpperCase(),
        product: product._id,
      }).populate(['client', 'product', 'licenseType']);

      if (license) {
        if (license.status === LicenseStatus.ACTIVE && license.machineIdHash === machineIdHash) {
          return {
            status: 'already_active',
            ...licenseService.buildSignedResponse(license),
          };
        }

        if (license.status === LicenseStatus.PENDING) {
          license.status = LicenseStatus.ACTIVE;
          license.activatedAt = new Date();
          license.machineId = data.machineId;
          license.machineIdHash = machineIdHash;
          await licenseService.regenerateSignature(license);
          await license.save();

          await this.logActivation(license, data.machineId, data.appVersion, 'activate', req);

          return {
            status: 'activated',
            ...licenseService.buildSignedResponse(license),
          };
        }

        if (license.status === LicenseStatus.ACTIVE && !license.machineId) {
          license.machineId = data.machineId;
          license.machineIdHash = machineIdHash;
          await licenseService.regenerateSignature(license);
          await license.save();

          await this.logActivation(license, data.machineId, data.appVersion, 'activate', req);

          return {
            status: 'activated',
            ...licenseService.buildSignedResponse(license),
          };
        }

        throw new AppError('Cette licence est déjà activée sur un autre poste', 409);
      }
    }

    // Check for existing pending request
    const existingRequest = await ActivationRequest.findOne({
      machineIdHash,
      product: product._id,
      status: ActivationRequestStatus.PENDING,
    });

    if (existingRequest) {
      return {
        status: 'pending',
        requestId: existingRequest._id,
        message: 'Une demande d\'activation est en attente de validation',
      };
    }

    // Licence déjà approuvée pour cette machine (admin a validé la demande)
    const approvedRequest = await ActivationRequest.findOne({
      machineIdHash,
      product: product._id,
      status: ActivationRequestStatus.APPROVED,
    });

    if (approvedRequest?.license) {
      const license = await License.findById(approvedRequest.license).populate([
        'client',
        'product',
        'licenseType',
      ]);
      if (
        license &&
        license.status === LicenseStatus.ACTIVE &&
        license.machineIdHash === machineIdHash
      ) {
        await this.logActivation(license, data.machineId, data.appVersion, 'activate', req);
        return {
          status: 'activated',
          ...licenseService.buildSignedResponse(license),
        };
      }
    }

    // Licence active déjà liée à cette machine (sans demande en cours)
    const activeForMachine = await License.findOne({
      product: product._id,
      machineIdHash,
      status: LicenseStatus.ACTIVE,
    }).populate(['client', 'product', 'licenseType']);

    if (activeForMachine && !isLicenseExpired(activeForMachine)) {
      await this.logActivation(
        activeForMachine,
        data.machineId,
        data.appVersion,
        'activate',
        req
      );
      return {
        status: 'already_active',
        ...licenseService.buildSignedResponse(activeForMachine),
      };
    }

    const activationRequest = await ActivationRequest.create({
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

  async verifyLicense(
    data: { licenseToken: string; machineId: string; appVersion: string },
    req?: Request
  ) {
    const license = assertFound(
      await License.findOne({ licenseToken: data.licenseToken })
        .populate(['client', 'product', 'licenseType']),
      'Licence non trouvée'
    );

    if (license.machineIdHash !== hashMachineId(data.machineId)) {
      throw new AppError('Machine ID non correspondant', 403);
    }

    if (license.status === LicenseStatus.SUSPENDED) {
      await this.logActivation(license, data.machineId, data.appVersion, 'verify', req);
      return {
        valid: false,
        status: LicenseStatus.SUSPENDED,
        message: 'Licence suspendue',
        ...licenseService.buildSignedResponse(license),
      };
    }

    if (isLicenseExpired(license)) {
      license.status = LicenseStatus.EXPIRED;
      await license.save();
      await this.logActivation(license, data.machineId, data.appVersion, 'verify', req);
      return {
        valid: false,
        status: LicenseStatus.EXPIRED,
        message: 'Licence expiree',
        ...licenseService.buildSignedResponse(license),
      };
    }

    if (license.status !== LicenseStatus.ACTIVE) {
      await this.logActivation(license, data.machineId, data.appVersion, 'verify', req);
      return {
        valid: false,
        status: license.status,
        message: 'Licence non active',
        ...licenseService.buildSignedResponse(license),
      };
    }

    license.lastVerifiedAt = new Date();
    await license.save();

    await this.logActivation(license, data.machineId, data.appVersion, 'verify', req);

    return {
      valid: true,
      ...licenseService.buildSignedResponse(license),
    };
  }

  async getActivationStatus(
    data: { requestId: string; machineId: string; appVersion?: string },
    req?: Request
  ) {
    const request = assertFound(
      await ActivationRequest.findById(data.requestId).populate('license'),
      'Demande non trouvée'
    );

    const machineIdHash = hashMachineId(data.machineId);
    if (request.machineIdHash !== machineIdHash) {
      throw new AppError('Machine ID non correspondant pour cette demande', 403);
    }

    if (request.status === ActivationRequestStatus.PENDING) {
      return { status: 'pending', requestId: request._id };
    }

    if (request.status === ActivationRequestStatus.REJECTED) {
      return {
        status: 'rejected',
        requestId: request._id,
        reason: request.rejectionReason || 'Demande rejetée par administrateur',
      };
    }

    if (!request.license) {
      throw new AppError('Licence introuvable pour cette demande approuvée', 404);
    }

    const license = assertFound(
      await License.findById(request.license).populate(['client', 'product', 'licenseType']),
      'Licence non trouvée'
    );

    if (license.status !== LicenseStatus.ACTIVE) {
      throw new AppError('Licence non active', 403);
    }

    if (license.machineIdHash !== machineIdHash) {
      throw new AppError('Machine ID non correspondant pour cette licence', 403);
    }

    if (data.appVersion) {
      await this.logActivation(license, data.machineId, data.appVersion, 'activate', req);
    }

    return {
      status: 'activated',
      requestId: request._id,
      ...licenseService.buildSignedResponse(license),
    };
  }

  async getLicenseInfo(licenseToken: string) {
    const license = assertFound(
      await License.findOne({ licenseToken })
        .populate(['client', 'product', 'licenseType']),
      'Licence non trouvée'
    );

    return licenseService.buildSignedResponse(license);
  }

  async transferLicense(
    data: {
      licenseToken: string;
      oldMachineId: string;
      newMachineId: string;
      appVersion: string;
    },
    req?: Request
  ) {
    const license = assertFound(
      await License.findOne({ licenseToken: data.licenseToken })
        .populate(['client', 'product', 'licenseType']),
      'Licence non trouvée'
    );

    if (license.machineIdHash !== hashMachineId(data.oldMachineId)) {
      throw new AppError('Machine ID actuel non correspondant', 403);
    }

    if (license.status !== LicenseStatus.ACTIVE) {
      throw new AppError('Seule une licence active peut être transférée', 400);
    }

    license.machineId = data.newMachineId;
    license.machineIdHash = hashMachineId(data.newMachineId);
    await licenseService.regenerateSignature(license);
    await license.save();

    await this.logActivation(license, data.newMachineId, data.appVersion, 'transfer', req);

    return {
      status: 'transferred',
      ...licenseService.buildSignedResponse(license),
    };
  }

  async getAuthorizedModules(licenseToken: string) {
    const license = assertFound(
      await License.findOne({ licenseToken }).populate('product'),
      'Licence non trouvée'
    );

    if (license.status !== LicenseStatus.ACTIVE) {
      throw new AppError('Licence non active', 403);
    }

    return {
      modules: license.authorizedModules,
      productSlug: (license.product as unknown as InstanceType<typeof Product>).slug,
    };
  }

  async checkUpdates(productSlug: string, currentVersion: string, licenseToken?: string) {
    const product = assertFound(
      await Product.findOne({ slug: productSlug, isActive: true }),
      'Produit non trouvé'
    );

    const latestVersion = await AppVersion.findOne({
      product: product._id,
      isActive: true,
    }).sort({ publishedAt: -1 });

    if (!latestVersion) {
      return { updateAvailable: false, currentVersion, latestVersion: product.currentVersion };
    }

    const updateAvailable = this.compareVersions(currentVersion, latestVersion.version) < 0;

    if (licenseToken) {
      const license = await License.findOne({ licenseToken });
      if (license) {
        await ActivationLog.create({
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

  async heartbeat(
    data: { licenseToken: string; machineId: string; appVersion: string },
    req?: Request
  ) {
    const license = await License.findOne({ licenseToken: data.licenseToken });
    if (!license) {
      throw new AppError('Licence non trouvée', 404);
    }

    await this.logActivation(license, data.machineId, data.appVersion, 'heartbeat', req);

    return {
      status: 'ok',
      serverTime: new Date().toISOString(),
      checkIntervalDays: config.license.checkIntervalDays,
    };
  }

  private async logActivation(
    license: InstanceType<typeof License>,
    machineId: string,
    appVersion: string,
    action: 'activate' | 'verify' | 'transfer' | 'heartbeat' | 'update_check',
    req?: Request
  ) {
    await ActivationLog.create({
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

  private compareVersions(a: string, b: string): number {
    const partsA = a.split('.').map(Number);
    const partsB = b.split('.').map(Number);
    const maxLen = Math.max(partsA.length, partsB.length);

    for (let i = 0; i < maxLen; i++) {
      const numA = partsA[i] || 0;
      const numB = partsB[i] || 0;
      if (numA < numB) return -1;
      if (numA > numB) return 1;
    }
    return 0;
  }
}

export const clientApiService = new ClientApiService();
