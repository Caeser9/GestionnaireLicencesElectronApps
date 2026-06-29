import { Request, Response, NextFunction } from 'express';
import { Client } from '../models';
import { AppError, assertFound } from '../utils/AppError';
import { getParamId } from '../utils/params';
import { createAuditLog } from '../middleware/audit';
import { AuditAction, AuditResource } from '../types';

export async function listClients(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = '1', limit = '20', search } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { contactName: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const [items, total] = await Promise.all([
      Client.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
      Client.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: { items, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
}

export async function getClient(req: Request, res: Response, next: NextFunction) {
  try {
    const client = assertFound(await Client.findById(getParamId(req.params)), 'Client non trouvé');
    res.json({ success: true, data: client });
  } catch (error) {
    next(error);
  }
}

export async function createClient(req: Request, res: Response, next: NextFunction) {
  try {
    const client = await Client.create({ ...req.body, createdBy: req.user!.userId });

    await createAuditLog(req.user, {
      action: AuditAction.CREATE,
      resource: AuditResource.CLIENT,
      resourceId: client._id.toString(),
      description: `Création client ${client.companyName}`,
    }, req);

    res.status(201).json({ success: true, data: client });
  } catch (error) {
    next(error);
  }
}

export async function updateClient(req: Request, res: Response, next: NextFunction) {
  try {
    const client = assertFound(await Client.findById(getParamId(req.params)), 'Client non trouvé');
    Object.assign(client, req.body);
    await client.save();

    await createAuditLog(req.user, {
      action: AuditAction.UPDATE,
      resource: AuditResource.CLIENT,
      resourceId: client._id.toString(),
      description: `Modification client ${client.companyName}`,
      changes: req.body,
    }, req);

    res.json({ success: true, data: client });
  } catch (error) {
    next(error);
  }
}

export async function deleteClient(req: Request, res: Response, next: NextFunction) {
  try {
    const client = assertFound(await Client.findById(getParamId(req.params)), 'Client non trouvé');
    client.isActive = false;
    await client.save();

    await createAuditLog(req.user, {
      action: AuditAction.DELETE,
      resource: AuditResource.CLIENT,
      resourceId: client._id.toString(),
      description: `Désactivation client ${client.companyName}`,
    }, req);

    res.json({ success: true, message: 'Client désactivé' });
  } catch (error) {
    next(error);
  }
}

export async function getClientHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const { AuditLog } = await import('../models');
    const logs = await AuditLog.find({
      resource: AuditResource.CLIENT,
      resourceId: getParamId(req.params),
    })
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
}
