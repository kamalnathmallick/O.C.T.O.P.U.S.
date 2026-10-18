import { Router } from 'express';
import { getSystemHealth, getSystemLogs, getSystemConfig } from '../controllers/systemController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';

const router = Router();

router.use(authenticate);

router.get('/health', getSystemHealth);
router.get('/logs', authorize(['ADMIN']), getSystemLogs);
router.get('/config', authorize(['ADMIN']), getSystemConfig);

export default router;