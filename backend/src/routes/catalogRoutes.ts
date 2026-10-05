import { NextFunction, Request, Response, Router } from 'express';
import { Product, Module, LicenseType, AppVersion } from '../models';
import { createCrudRouter } from './crudFactory';
import {
  createProductSchema,
  updateProductSchema,
  createModuleSchema,
  updateModuleSchema,
  createLicenseTypeSchema,
  updateLicenseTypeSchema,
  createAppVersionSchema,
  updateAppVersionSchema,
} from '../validators/schemas';
import { AuditResource, UserRole } from '../types';
import { authenticate } from '../middleware/auth';
import { AppError } from '../utils/AppError';

const router = Router();

// Existing moderators may predate per-application license types. Ensure their
// application has usable types when opening the activation approval dialog.
router.get('/license-types', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== UserRole.MODERATOR) return next();
  try {
    const productId = req.user?.productId;
    if (!productId || !(await Product.exists({ _id: productId, isActive: true }))) {
      throw new AppError('Application du modérateur introuvable ou inactive', 403);
    }

    const existing = await LicenseType.find({ product: productId }).select('slug');
    const existingSlugs = new Set(existing.map((item) => item.slug));
    const sharedTypes = await LicenseType.find({ product: { $exists: false } });
    const templates = sharedTypes.length ? sharedTypes.map((item) => ({
      slug: item.slug,
      name: item.name,
      description: item.description,
      defaultMaxUsers: item.defaultMaxUsers,
      defaultMaxWorkstations: item.defaultMaxWorkstations,
      defaultModules: item.defaultModules,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    })) : [
      { slug: 'basic', name: 'Basic', defaultMaxUsers: 2, defaultMaxWorkstations: 1, defaultModules: ['products', 'stock'], sortOrder: 1, isActive: true },
      { slug: 'standard', name: 'Standard', defaultMaxUsers: 5, defaultMaxWorkstations: 2, defaultModules: ['products', 'stock', 'pos'], sortOrder: 2, isActive: true },
      { slug: 'pro', name: 'Pro', defaultMaxUsers: 15, defaultMaxWorkstations: 5, defaultModules: ['products', 'stock', 'pos', 'billing', 'reports'], sortOrder: 3, isActive: true },
      { slug: 'enterprise', name: 'Enterprise', defaultMaxUsers: 50, defaultMaxWorkstations: 20, defaultModules: ['products', 'stock', 'pos', 'billing', 'reports', 'accounting', 'multi-store'], sortOrder: 4, isActive: true },
    ];

    for (const template of templates) {
      const slug = `${template.slug}-${productId.slice(-6)}`;
      if (!existingSlugs.has(slug)) {
        await LicenseType.updateOne(
          { product: productId, slug },
          { $setOnInsert: { ...template, slug, product: productId } },
          { upsert: true }
        );
      }
    }

    const items = await LicenseType.find({ product: productId }).sort({ sortOrder: 1, name: 1 });
    res.json({ success: true, data: { items, total: items.length, page: 1, limit: items.length, totalPages: 1 } });
  } catch (error) {
    next(error);
  }
});

router.use('/products', createCrudRouter(Product, createProductSchema, updateProductSchema, {
  resource: AuditResource.PRODUCT,
  resourceLabel: 'produit',
  readRoles: [UserRole.SUPPORT, UserRole.MODERATOR],
  writeRoles: [UserRole.ADMIN],
  moderatorScope: 'self',
}));

router.use('/modules', createCrudRouter(Module, createModuleSchema, updateModuleSchema, {
  resource: AuditResource.MODULE,
  resourceLabel: 'module',
  readRoles: [UserRole.SUPPORT, UserRole.MODERATOR],
  writeRoles: [UserRole.ADMIN],
  moderatorScope: 'product',
  moderatorCanCreate: true,
}));

router.use('/license-types', createCrudRouter(LicenseType, createLicenseTypeSchema, updateLicenseTypeSchema, {
  resource: AuditResource.LICENSE_TYPE,
  resourceLabel: 'type de licence',
  readRoles: [UserRole.SUPPORT, UserRole.MODERATOR],
  writeRoles: [UserRole.ADMIN],
  moderatorScope: 'product',
  moderatorCanCreate: true,
}));

router.use('/app-versions', createCrudRouter(AppVersion, createAppVersionSchema, updateAppVersionSchema, {
  resource: AuditResource.APP_VERSION,
  resourceLabel: 'version application',
  readRoles: [UserRole.SUPPORT, UserRole.MODERATOR],
  writeRoles: [UserRole.ADMIN],
  moderatorScope: 'product',
  moderatorCanCreate: true,
}));

export default router;
