import { Router } from 'express';
import { getAnalytics, getDashboardStats } from '../controllers/analyticsController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/dashboard', getDashboardStats);
router.get('/', getAnalytics);

export default router;