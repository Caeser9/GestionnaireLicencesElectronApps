import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { normalizeLicenseNumericFields } from '../middleware/normalizeBody';
import { validateBody, validateParams } from '../utils/validate';
import {
  createLicenseSchema,
  updateLicenseSchema,
  approveActivationSchema,
  rejectActivationSchema,
  mongoIdSchema,
} from '../validators/schemas';
import * as licenseController from '../controllers/licenseController';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.get('/', authorize(UserRole.SUPPORT, UserRole.MODERATOR), licenseController.listLicenses);
router.get('/activations', authorize(UserRole.SUPPORT, UserRole.MODERATOR), licenseController.listActivationRequests);
router.get('/:id', authorize(UserRole.SUPPORT, UserRole.MODERATOR), validateParams(mongoIdSchema), licenseController.getLicense);
router.get('/:id/logs', authorize(UserRole.SUPPORT, UserRole.MODERATOR), validateParams(mongoIdSchema), licenseController.getActivationLogs);
router.post('/', authorize(UserRole.ADMIN, UserRole.MODERATOR), normalizeLicenseNumericFields, validateBody(createLicenseSchema), licenseController.createLicense);
router.put('/:id', authorize(UserRole.ADMIN, UserRole.MODERATOR), validateParams(mongoIdSchema), normalizeLicenseNumericFields, validateBody(updateLicenseSchema), licenseController.updateLicense);
router.post('/:id/suspend', authorize(UserRole.ADMIN, UserRole.MODERATOR), validateParams(mongoIdSchema), licenseController.suspendLicense);
router.post('/:id/reactivate', authorize(UserRole.ADMIN, UserRole.MODERATOR), validateParams(mongoIdSchema), licenseController.reactivateLicense);
router.post('/:id/transfer', authorize(UserRole.ADMIN, UserRole.MODERATOR), validateParams(mongoIdSchema), licenseController.transferLicense);
router.post('/activations/:id/approve', authorize(UserRole.ADMIN, UserRole.MODERATOR), validateParams(mongoIdSchema), normalizeLicenseNumericFields, validateBody(approveActivationSchema), licenseController.approveActivation);
router.post('/activations/:id/reject', authorize(UserRole.ADMIN, UserRole.MODERATOR), validateParams(mongoIdSchema), validateBody(rejectActivationSchema), licenseController.rejectActivation);

export default router;
