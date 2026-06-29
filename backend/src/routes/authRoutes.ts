import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody } from '../utils/validate';
import { loginSchema, createUserSchema, updateUserSchema } from '../validators/schemas';
import * as authController from '../controllers/authController';
import { UserRole } from '../types';

const router = Router();

router.post('/login', validateBody(loginSchema), authController.login);
router.get('/me', authenticate, authController.getMe);
router.get('/users', authenticate, authorize(UserRole.SUPER_ADMIN), authController.listUsers);
router.post('/users', authenticate, authorize(UserRole.SUPER_ADMIN), validateBody(createUserSchema), authController.createUser);
router.put('/users/:id', authenticate, authorize(UserRole.SUPER_ADMIN), validateBody(updateUserSchema), authController.updateUser);

export default router;
