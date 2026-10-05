import { Router, Request, Response, NextFunction } from 'express';
import { Model, Document } from 'mongoose';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody, validateParams } from '../utils/validate';
import { mongoIdSchema } from '../validators/schemas';
import { UserRole, AuditAction, AuditResource } from '../types';
import { createAuditLog } from '../middleware/audit';
import { getParamId } from '../utils/params';
import { AppError, assertFound } from '../utils/AppError';

interface CrudOptions {
  resource: AuditResource;
  resourceLabel: string;
  readRoles?: UserRole[];
  writeRoles?: UserRole[];
  moderatorScope?: 'self' | 'product';
  moderatorCanCreate?: boolean;
}

export function createCrudRouter<T extends Document>(
  model: Model<T>,
  createSchema: Parameters<typeof validateBody>[0],
  updateSchema: Parameters<typeof validateBody>[0],
  options: CrudOptions
) {
  const router = Router();
  const readRoles = options.readRoles || [UserRole.SUPPORT];
  const writeRoles = options.writeRoles || [UserRole.ADMIN];
  const scopeFilter = (req: Request): Record<string, unknown> => {
    if (req.user?.role !== UserRole.MODERATOR || !options.moderatorScope) return {};
    if (!req.user.productId) return { _id: '__no_assigned_product__' };
    return options.moderatorScope === 'self'
      ? { _id: req.user.productId }
      : { product: req.user.productId };
  };

  router.get('/', authenticate, authorize(...readRoles), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = '1', limit = '50' } = req.query as Record<string, string>;
      const filter: Record<string, unknown> = scopeFilter(req);
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);

      const items = await model.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum);
      const total = await model.countDocuments(filter);

      res.json({
        success: true,
        data: { items, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id', authenticate, authorize(...readRoles), validateParams(mongoIdSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = assertFound(await model.findOne({ _id: req.params.id, ...scopeFilter(req) }), `${options.resourceLabel} non trouvé`);
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  });

  router.post('/', authenticate, authorize(...writeRoles), validateBody(createSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.user?.role === UserRole.MODERATOR && !options.moderatorCanCreate) {
        throw new AppError('Création non autorisée pour ce rôle', 403);
      }
      const createData = { ...req.body } as Record<string, unknown>;
      if (req.user?.role === UserRole.MODERATOR && options.moderatorScope === 'product') {
        if (createData.product && createData.product !== req.user.productId) {
          throw new AppError('Produit hors de votre périmètre', 403);
        }
        createData.product = req.user.productId;
      }
      const item = await model.create(createData);

      await createAuditLog(req.user, {
        action: AuditAction.CREATE,
        resource: options.resource,
        resourceId: (item as { _id: { toString(): string } })._id.toString(),
        description: `Création ${options.resourceLabel}`,
      }, req);

      res.status(201).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  });

  router.put('/:id', authenticate, authorize(...writeRoles), validateParams(mongoIdSchema), validateBody(updateSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = assertFound(await model.findOne({ _id: req.params.id, ...scopeFilter(req) }), `${options.resourceLabel} non trouvé`);
      Object.assign(item, req.body);
      await (item as { save(): Promise<unknown> }).save();

      await createAuditLog(req.user, {
        action: AuditAction.UPDATE,
        resource: options.resource,
        resourceId: getParamId(req.params),
        description: `Modification ${options.resourceLabel}`,
        changes: req.body,
      }, req);

      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id', authenticate, authorize(UserRole.SUPER_ADMIN), validateParams(mongoIdSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = assertFound(await model.findById(req.params.id), `${options.resourceLabel} non trouvé`);
      await model.findByIdAndDelete(req.params.id);

      await createAuditLog(req.user, {
        action: AuditAction.DELETE,
        resource: options.resource,
        resourceId: getParamId(req.params),
        description: `Suppression ${options.resourceLabel}`,
      }, req);

      res.json({ success: true, message: `${options.resourceLabel} supprimé` });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
