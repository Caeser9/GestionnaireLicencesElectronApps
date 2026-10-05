import { Request, Response, NextFunction } from 'express';
import { licenseService } from '../services/licenseService';
import { LicenseStatus } from '../types';
import { getParamId } from '../utils/params';
import { Client, License } from '../models';
import { AppError } from '../utils/AppError';

async function tenantClientIds(req: Request): Promise<string[] | undefined> {
  if (req.user?.role !== 'moderator') return undefined;
  if (!req.user.productId) {
    throw new AppError('Ce compte modérateur doit être associé à une application', 403);
  }
  const clientIds = await License.distinct('client', { product: req.user.productId });
  return clientIds.map((clientId) => clientId.toString());
}

async function assertLicenseAccess(req: Request, licenseId: string) {
  if (req.user?.role !== 'moderator') return;
  if (!req.user.productId) {
    throw new AppError('Ce compte modérateur doit être associé à une application', 403);
  }
  const license = await License.findById(licenseId).select('client');
  if (!license) throw new AppError('Licence non trouvée', 404);
  const belongsToProduct = await License.exists({ _id: licenseId, product: req.user.productId });
  if (!belongsToProduct) throw new AppError('Licence hors de votre application', 403);
}

export async function listLicenses(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await licenseService.listLicenses({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      search: req.query.search as string,
      status: req.query.status as LicenseStatus,
      client: req.query.client as string,
      product: req.user?.role === 'moderator' ? req.user.productId : req.query.product as string,
      clientIds: await tenantClientIds(req),
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getLicense(req: Request, res: Response, next: NextFunction) {
  try {
    const license = await licenseService.getLicense(getParamId(req.params));
    await assertLicenseAccess(req, getParamId(req.params));
    res.json({ success: true, data: license });
  } catch (error) {
    next(error);
  }
}

export async function createLicense(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.user?.role === 'moderator') {
      const existingClientIds = await tenantClientIds(req);
      const [owned, assignedProduct] = await Promise.all([
        Client.exists({ _id: req.body.client, $or: [
          { platformProduct: req.user.productId },
          { _id: { $in: existingClientIds } },
        ] }),
        Promise.resolve(String(req.body.product) === req.user.productId),
      ]);
      if (!owned || !assignedProduct) throw new AppError('Client ou application hors de votre périmètre', 403);
    }
    const license = await licenseService.createLicense(req.body, req.user!, req);
    res.status(201).json({ success: true, data: license });
  } catch (error) {
    next(error);
  }
}

export async function updateLicense(req: Request, res: Response, next: NextFunction) {
  try {
    await assertLicenseAccess(req, getParamId(req.params));
    const license = await licenseService.updateLicense(getParamId(req.params), req.body, req.user!, req);
    res.json({ success: true, data: license });
  } catch (error) {
    next(error);
  }
}

export async function suspendLicense(req: Request, res: Response, next: NextFunction) {
  try {
    await assertLicenseAccess(req, getParamId(req.params));
    const license = await licenseService.suspendLicense(getParamId(req.params), req.user!, req);
    res.json({ success: true, data: license });
  } catch (error) {
    next(error);
  }
}

export async function reactivateLicense(req: Request, res: Response, next: NextFunction) {
  try {
    await assertLicenseAccess(req, getParamId(req.params));
    const license = await licenseService.reactivateLicense(getParamId(req.params), req.user!, req);
    res.json({ success: true, data: license });
  } catch (error) {
    next(error);
  }
}

export async function transferLicense(req: Request, res: Response, next: NextFunction) {
  try {
    await assertLicenseAccess(req, getParamId(req.params));
    const { newMachineId } = req.body;
    const license = await licenseService.transferLicense(getParamId(req.params), newMachineId, req.user!, req);
    res.json({ success: true, data: license });
  } catch (error) {
    next(error);
  }
}

export async function getActivationLogs(req: Request, res: Response, next: NextFunction) {
  try {
    await assertLicenseAccess(req, getParamId(req.params));
    const result = await licenseService.getActivationLogs(
      getParamId(req.params),
      Number(req.query.page) || 1,
      Number(req.query.limit) || 20
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function listActivationRequests(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.user?.role === 'moderator') throw new AppError('Accès non autorisé', 403);
    const { ActivationRequest } = await import('../models');
    const { status } = req.query;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const requests = await ActivationRequest.find(filter)
      .populate('product', 'name slug')
      .populate('license')
      .populate('processedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
}

export async function approveActivation(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await licenseService.approveActivation(getParamId(req.params), req.body, req.user!, req);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function rejectActivation(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await licenseService.rejectActivation(
      getParamId(req.params),
      req.body.reason,
      req.user!,
      req
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
