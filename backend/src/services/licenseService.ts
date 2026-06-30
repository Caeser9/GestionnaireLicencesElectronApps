import {
  Client,
  Product,
  License,
  LicenseType,
  ActivationRequest,
  ActivationLog,
} from '../models';
import { AppError, assertFound } from '../utils/AppError';
import {
  generateLicenseKey,
  generateLicenseToken,
  signLicensePayload,
  hashMachineId,
} from '../utils/crypto';
import {
  LicenseStatus,
  ActivationRequestStatus,
  SignedLicensePayload,
  JwtPayload,
  AuditAction,
  AuditResource,
} from '../types';
import { createAuditLog } from '../middleware/audit';
import { config } from '../config';
import { Request } from 'express';

function isLicenseExpired(license: { expiresAt?: Date; status: LicenseStatus }): boolean {
  if (license.expiresAt && new Date() > license.expiresAt) {
    return true;
  }
  return license.status === LicenseStatus.EXPIRED;
}

export class LicenseService {
  async createLicense(
    data: {
      client: string;
      product: string;
      licenseType: string;
      maxUsers?: number;
      maxWorkstations?: number;
      authorizedModules?: string[];
      minVersion?: string;
      maxVersion?: string;
      expiresAt?: string | null;
      adminNotes?: string;
    },
    creator: JwtPayload,
    req?: Request
  ) {
    const client = assertFound(await Client.findById(data.client), 'Client non trouvé');
    const product = assertFound(await Product.findById(data.product), 'Produit non trouvé');
    const licenseType = assertFound(
      await LicenseType.findById(data.licenseType),
      'Type de licence non trouvé'
    );

    const license = await License.create({
      licenseKey: generateLicenseKey(),
      licenseToken: generateLicenseToken(),
      client: client._id,
      product: product._id,
      licenseType: licenseType._id,
      status: LicenseStatus.PENDING,
      maxUsers: data.maxUsers ?? licenseType.defaultMaxUsers,
      maxWorkstations: data.maxWorkstations ?? licenseType.defaultMaxWorkstations,
      authorizedModules: data.authorizedModules ?? licenseType.defaultModules,
      minVersion: data.minVersion,
      maxVersion: data.maxVersion,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      adminNotes: data.adminNotes,
      createdBy: creator.userId,
    });

    await createAuditLog(creator, {
      action: AuditAction.CREATE,
      resource: AuditResource.LICENSE,
      resourceId: license._id.toString(),
      description: `Création licence ${license.licenseKey} pour ${client.companyName}`,
    }, req);

    return license.populate(['client', 'product', 'licenseType']);
  }

  async updateLicense(
    id: string,
    data: Record<string, unknown>,
    updater: JwtPayload,
    req?: Request
  ) {
    const license = assertFound(await License.findById(id), 'Licence non trouvée');

    if (data.expiresAt !== undefined) {
      license.expiresAt = data.expiresAt ? new Date(data.expiresAt as string) : undefined;
      delete data.expiresAt;
    }

    Object.assign(license, data);

    if (license.status === LicenseStatus.ACTIVE && license.machineId) {
      await this.regenerateSignature(license);
    }

    await license.save();

    await createAuditLog(updater, {
      action: AuditAction.UPDATE,
      resource: AuditResource.LICENSE,
      resourceId: id,
      description: `Modification licence ${license.licenseKey}`,
      changes: data,
    }, req);

    return license.populate(['client', 'product', 'licenseType']);
  }

  async suspendLicense(id: string, updater: JwtPayload, req?: Request) {
    return this.updateLicense(id, { status: LicenseStatus.SUSPENDED }, updater, req);
  }

  async reactivateLicense(id: string, updater: JwtPayload, req?: Request) {
    const license = assertFound(await License.findById(id), 'Licence non trouvée');
    if (isLicenseExpired(license)) {
      throw new AppError('La licence est expirée', 400);
    }
    return this.updateLicense(id, { status: LicenseStatus.ACTIVE }, updater, req);
  }

  async transferLicense(id: string, newMachineId: string, updater: JwtPayload, req?: Request) {
    const license = assertFound(
      await License.findById(id).populate('client product licenseType'),
      'Licence non trouvée'
    );

    if (license.status !== LicenseStatus.ACTIVE) {
      throw new AppError('Seule une licence active peut être transférée', 400);
    }

    license.machineId = newMachineId;
    license.machineIdHash = hashMachineId(newMachineId);
    await this.regenerateSignature(license);
    await license.save();

    await createAuditLog(updater, {
      action: AuditAction.TRANSFER,
      resource: AuditResource.LICENSE,
      resourceId: id,
      description: `Transfert licence ${license.licenseKey} vers nouveau poste`,
    }, req);

    return license;
  }

  async regenerateSignature(license: InstanceType<typeof License>): Promise<void> {
    const populated = await license.populate(['client', 'product', 'licenseType']);
    const client = populated.client as unknown as InstanceType<typeof Client>;
    const product = populated.product as unknown as InstanceType<typeof Product>;
    const licenseType = populated.licenseType as unknown as InstanceType<typeof LicenseType>;

    const payload: SignedLicensePayload = {
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
      issuedAt: new Date().toISOString(),
    };

    populated.signature = signLicensePayload(payload);
    license.signature = populated.signature;
  }

  buildSignedResponse(license: InstanceType<typeof License>) {
    const client = license.client as unknown as InstanceType<typeof Client>;
    const product = license.product as unknown as InstanceType<typeof Product>;
    const licenseType = license.licenseType as unknown as InstanceType<typeof LicenseType>;

    const payload: SignedLicensePayload = {
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
      issuedAt: new Date().toISOString(),
    };

    return {
      licenseToken: license.licenseToken,
      licenseKey: license.licenseKey,
      payload,
      signature: license.signature,
      checkIntervalDays: config.license.checkIntervalDays,
      publicKey: undefined, // clients should embed public key
    };
  }

  async approveActivation(
    requestId: string,
    data: {
      clientId?: string;
      licenseTypeId: string;
      maxUsers?: number;
      maxWorkstations?: number;
      authorizedModules?: string[];
      expiresAt?: string | null;
      adminNotes?: string;
    },
    approver: JwtPayload,
    req?: Request
  ) {
    const activationRequest = assertFound(
      await ActivationRequest.findById(requestId).populate('product'),
      'Demande non trouvée'
    );

    if (activationRequest.status !== ActivationRequestStatus.PENDING) {
      throw new AppError(
        `Cette demande a déjà été traitée (statut: ${activationRequest.status}).`,
        400
      );
    }

    const productId =
      typeof activationRequest.product === 'object' &&
      activationRequest.product !== null &&
      '_id' in activationRequest.product
        ? activationRequest.product._id.toString()
        : String(activationRequest.product);

    let client;
    if (data.clientId) {
      client = assertFound(await Client.findById(data.clientId), 'Client non trouvé');
    } else {
      client = await Client.create({
        companyName: activationRequest.companyName,
        contactName: activationRequest.companyName,
        email: activationRequest.contactEmail,
        phone: activationRequest.contactPhone,
        createdBy: approver.userId,
      });
    }

    const license = await this.createLicense(
      {
        client: client._id.toString(),
        product: productId,
        licenseType: data.licenseTypeId,
        maxUsers: data.maxUsers,
        maxWorkstations: data.maxWorkstations,
        authorizedModules: data.authorizedModules,
        expiresAt: data.expiresAt,
        adminNotes: data.adminNotes,
      },
      approver,
      req
    );

    const licenseDoc = assertFound(await License.findById(license._id), 'Licence non trouvée');
    licenseDoc.status = LicenseStatus.ACTIVE;
    licenseDoc.activatedAt = new Date();
    licenseDoc.machineId = activationRequest.machineId;
    licenseDoc.machineIdHash = activationRequest.machineIdHash;
    await this.regenerateSignature(licenseDoc);
    await licenseDoc.save();

    activationRequest.status = ActivationRequestStatus.APPROVED;
    activationRequest.license = licenseDoc._id;
    activationRequest.processedBy = approver.userId as unknown as typeof activationRequest.processedBy;
    activationRequest.processedAt = new Date();
    await activationRequest.save();

    await createAuditLog(approver, {
      action: AuditAction.APPROVE,
      resource: AuditResource.ACTIVATION,
      resourceId: requestId,
      description: `Activation approuvée pour ${client.companyName}`,
    }, req);

    const populated = await licenseDoc.populate(['client', 'product', 'licenseType']);
    return this.buildSignedResponse(populated);
  }

  async rejectActivation(
    requestId: string,
    reason: string,
    rejecter: JwtPayload,
    req?: Request
  ) {
    const activationRequest = assertFound(
      await ActivationRequest.findById(requestId),
      'Demande non trouvée'
    );

    if (activationRequest.status !== ActivationRequestStatus.PENDING) {
      throw new AppError('Cette demande a déjà été traitée', 400);
    }

    activationRequest.status = ActivationRequestStatus.REJECTED;
    activationRequest.rejectionReason = reason;
    activationRequest.processedBy = rejecter.userId as unknown as typeof activationRequest.processedBy;
    activationRequest.processedAt = new Date();
    await activationRequest.save();

    await createAuditLog(rejecter, {
      action: AuditAction.REJECT,
      resource: AuditResource.ACTIVATION,
      resourceId: requestId,
      description: `Activation rejetée: ${reason}`,
    }, req);

    return activationRequest;
  }

  async listLicenses(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: LicenseStatus;
    client?: string;
    product?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const filter: Record<string, unknown> = {};

    if (query.status) filter.status = query.status;
    if (query.client) filter.client = query.client;
    if (query.product) filter.product = query.product;

    if (query.search) {
      filter.licenseKey = { $regex: query.search, $options: 'i' };
    }

    const [items, total] = await Promise.all([
      License.find(filter)
        .populate('client', 'companyName email')
        .populate('product', 'name slug')
        .populate('licenseType', 'name slug')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      License.countDocuments(filter),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getLicense(id: string) {
    return assertFound(
      await License.findById(id)
        .populate('client')
        .populate('product')
        .populate('licenseType')
        .populate('createdBy', 'firstName lastName email'),
      'Licence non trouvée'
    );
  }

  async getActivationLogs(licenseId: string, page = 1, limit = 20) {
    const [items, total] = await Promise.all([
      ActivationLog.find({ license: licenseId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      ActivationLog.countDocuments({ license: licenseId }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}

export const licenseService = new LicenseService();

export { isLicenseExpired };
