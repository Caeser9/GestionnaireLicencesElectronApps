import { Request, Response, NextFunction } from 'express';
import { getParam, getParamId } from '../utils/params';
import { clientApiService } from '../services/clientApiService';
import { getPublicKey } from '../utils/crypto';

export async function activate(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await clientApiService.requestActivation(req.body, req);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function verify(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await clientApiService.verifyLicense(req.body, req);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function activationStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await clientApiService.getActivationStatus(req.body, req);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getLicenseInfo(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await clientApiService.getLicenseInfo(getParam(req.params, 'token'));
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function transfer(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await clientApiService.transferLicense(req.body, req);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getModules(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await clientApiService.getAuthorizedModules(getParam(req.params, 'token'));
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function checkUpdates(req: Request, res: Response, next: NextFunction) {
  try {
    const { productSlug, currentVersion } = req.query as Record<string, string>;
    const licenseToken = req.headers['x-license-token'] as string | undefined;
    const result = await clientApiService.checkUpdates(productSlug, currentVersion, licenseToken);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function heartbeat(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await clientApiService.heartbeat(req.body, req);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getPublicKeyEndpoint(_req: Request, res: Response) {
  const publicKey = getPublicKey();
  res.json({ success: true, data: { publicKey } });
}
