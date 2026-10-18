import { Router } from 'express';
import { getAlerts, getAlert, createAlert, acknowledgeAlert, resolveAlert, getAlertStats } from '../controllers/alertController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getAlerts);
router.get('/stats', getAlertStats);
router.get('/:id', getAlert);
router.post('/', authorize(['ADMIN']), createAlert);
router.put('/:id/acknowledge', authorize(['ADMIN', 'OPERATOR']), acknowledgeAlert);
router.put('/:id/resolve', authorize(['ADMIN', 'OPERATOR']), resolveAlert);

export default router;