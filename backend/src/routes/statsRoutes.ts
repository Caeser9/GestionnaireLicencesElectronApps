import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as statsController from '../controllers/statsController';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.get('/dashboard', authorize(UserRole.SUPPORT), statsController.getDashboardStats);
router.get('/audit-logs', authorize(UserRole.ADMIN), statsController.getAuditLogs);

export default router;
