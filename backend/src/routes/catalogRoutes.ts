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
}));

router.use('/modules', createCrudRouter(Module, createModuleSchema, updateModuleSchema, {
  resource: AuditResource.MODULE,
  resourceLabel: 'module',
}));

router.use('/license-types', createCrudRouter(LicenseType, createLicenseTypeSchema, updateLicenseTypeSchema, {
  resource: AuditResource.LICENSE_TYPE,
  resourceLabel: 'type de licence',
}));

router.use('/app-versions', createCrudRouter(AppVersion, createAppVersionSchema, updateAppVersionSchema, {
  resource: AuditResource.APP_VERSION,
  resourceLabel: 'version application',
  writeRoles: [UserRole.ADMIN],
}));

export default router;
