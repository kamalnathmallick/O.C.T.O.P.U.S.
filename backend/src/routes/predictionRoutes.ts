import { Router } from 'express';
import { getPredictions, getPrediction, createPrediction, getPredictionStats } from '../controllers/predictionController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getPredictions);
router.get('/stats', getPredictionStats);
router.get('/:id', getPrediction);
router.post('/', authorize(['ADMIN']), createPrediction);

export default router;