import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validateBody } from '../utils/validate';
import {
  clientActivateSchema,
  clientVerifySchema,
  clientTransferSchema,
  clientHeartbeatSchema,
} from '../validators/schemas';
import * as clientApiController from '../controllers/clientApiController';
import { config } from '../config';

const router = Router();

const clientRateLimit = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: { success: false, error: 'Trop de requêtes, réessayez plus tard' },
});

router.use(clientRateLimit);

router.post('/activate', validateBody(clientActivateSchema), clientApiController.activate);
router.post('/verify', validateBody(clientVerifySchema), clientApiController.verify);
router.get('/license/:token', clientApiController.getLicenseInfo);
router.post('/transfer', validateBody(clientTransferSchema), clientApiController.transfer);
router.get('/modules/:token', clientApiController.getModules);
router.get('/updates/check', clientApiController.checkUpdates);
router.post('/heartbeat', validateBody(clientHeartbeatSchema), clientApiController.heartbeat);
router.get('/public-key', clientApiController.getPublicKeyEndpoint);

export default router;
