import { Router } from 'express';
import { getSensors, getSensor, createSensor, updateSensor, deleteSensor, addSensorReading, getSensorReadings } from '../controllers/sensorController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getSensors);
router.get('/:id', getSensor);
router.post('/', authorize(['ADMIN']), createSensor);
router.put('/:id', authorize(['ADMIN', 'OPERATOR']), updateSensor);
router.delete('/:id', authorize(['ADMIN']), deleteSensor);
router.post('/reading', addSensorReading);
router.get('/:sensorId/readings', getSensorReadings);

export default router;