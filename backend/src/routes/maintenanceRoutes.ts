import { Router } from 'express';
import { getMaintenanceTasks, getMaintenanceTask, createMaintenanceTask, updateMaintenanceTask, deleteMaintenanceTask, getMaintenanceStats } from '../controllers/maintenanceController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getMaintenanceTasks);
router.get('/stats', getMaintenanceStats);
router.get('/:id', getMaintenanceTask);
router.post('/', authorize(['ADMIN', 'OPERATOR']), createMaintenanceTask);
router.put('/:id', authorize(['ADMIN', 'OPERATOR']), updateMaintenanceTask);
router.delete('/:id', authorize(['ADMIN']), deleteMaintenanceTask);

export default router;