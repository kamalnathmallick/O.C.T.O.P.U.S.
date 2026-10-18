import { Router } from 'express';
import { getUsers, getUser, createOperator, updateUser, deleteUser, resetPassword, getOperatorNumbers, createOperatorNumber } from '../controllers/userController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', authorize(['ADMIN', 'MANAGER']), getUsers);
router.get('/operators/numbers', authorize(['ADMIN', 'MANAGER']), getOperatorNumbers);
router.post('/operators/numbers', authorize(['ADMIN']), createOperatorNumber);
router.get('/:id', getUser);
router.post('/operator', authorize(['ADMIN']), createOperator);
router.put('/:id', authorize(['ADMIN', 'MANAGER']), updateUser);
router.delete('/:id', authorize(['ADMIN']), deleteUser);
router.post('/:id/reset-password', authorize(['ADMIN']), resetPassword);

export default router;