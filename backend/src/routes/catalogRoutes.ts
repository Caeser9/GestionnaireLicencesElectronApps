import { Router } from 'express';
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

const router = Router();

router.use('/products', createCrudRouter(Product, createProductSchema, updateProductSchema, {
  resource: AuditResource.PRODUCT,
  resourceLabel: 'produit',
  readRoles: [UserRole.SUPPORT, UserRole.MODERATOR],
  writeRoles: [UserRole.ADMIN, UserRole.MODERATOR],
  moderatorScope: 'self',
}));

router.use('/modules', createCrudRouter(Module, createModuleSchema, updateModuleSchema, {
  resource: AuditResource.MODULE,
  resourceLabel: 'module',
  readRoles: [UserRole.SUPPORT, UserRole.MODERATOR],
  writeRoles: [UserRole.ADMIN, UserRole.MODERATOR],
  moderatorScope: 'product',
  moderatorCanCreate: true,
}));

router.use('/license-types', createCrudRouter(LicenseType, createLicenseTypeSchema, updateLicenseTypeSchema, {
  resource: AuditResource.LICENSE_TYPE,
  resourceLabel: 'type de licence',
  readRoles: [UserRole.SUPPORT, UserRole.MODERATOR],
  writeRoles: [UserRole.ADMIN, UserRole.MODERATOR],
  moderatorScope: 'product',
  moderatorCanCreate: true,
}));

router.use('/app-versions', createCrudRouter(AppVersion, createAppVersionSchema, updateAppVersionSchema, {
  resource: AuditResource.APP_VERSION,
  resourceLabel: 'version application',
  readRoles: [UserRole.SUPPORT, UserRole.MODERATOR],
  writeRoles: [UserRole.ADMIN, UserRole.MODERATOR],
  moderatorScope: 'product',
  moderatorCanCreate: true,
}));

export default router;
