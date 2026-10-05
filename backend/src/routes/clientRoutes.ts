import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody, validateParams } from '../utils/validate';
import { createClientSchema, updateClientSchema, mongoIdSchema } from '../validators/schemas';
import * as clientController from '../controllers/clientController';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.get('/', authorize(UserRole.SUPPORT, UserRole.MODERATOR), clientController.listClients);
router.get('/:id', authorize(UserRole.SUPPORT, UserRole.MODERATOR), validateParams(mongoIdSchema), clientController.getClient);
router.get('/:id/history', authorize(UserRole.SUPPORT, UserRole.MODERATOR), validateParams(mongoIdSchema), clientController.getClientHistory);
router.post('/', authorize(UserRole.ADMIN, UserRole.MODERATOR), validateBody(createClientSchema), clientController.createClient);
router.put('/:id', authorize(UserRole.ADMIN, UserRole.MODERATOR), validateParams(mongoIdSchema), validateBody(updateClientSchema), clientController.updateClient);
router.delete('/:id', authorize(UserRole.ADMIN, UserRole.MODERATOR), validateParams(mongoIdSchema), clientController.deleteClient);

export default router;
