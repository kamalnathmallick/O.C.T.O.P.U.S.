import { Router } from 'express';
import { getMachines, getMachine, createMachine, updateMachine, deleteMachine, getMachineStats } from '../controllers/machineController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getMachines);
router.get('/stats', getMachineStats);
router.get('/:id', getMachine);
router.post('/', authorize(['ADMIN']), createMachine);
router.put('/:id', authorize(['ADMIN']), updateMachine);
router.delete('/:id', authorize(['ADMIN']), deleteMachine);

export default router;