import { Router } from 'express';
import {
  getAgents,
  diagnoseMachine,
  forecastMachineRul,
  dispatchMaintenance,
  generateFleetBriefing,
  chatWithCopilot,
} from '../controllers/agentController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

// List all AI agents and status
router.get('/', getAgents);

// 1. Anomaly & Root-Cause Diagnostic Agent
router.post('/diagnose/:machineId', diagnoseMachine);

// 2. Predictive RUL & Risk Forecasting Agent
router.post('/predict-rul/:machineId', forecastMachineRul);

// 3. Autonomous Maintenance Dispatcher Agent
router.post('/dispatch-maintenance', dispatchMaintenance);

// 4. Fleet Optimization & Shift Briefing Agent
router.get('/fleet-briefing', generateFleetBriefing);

// 5. Octopus Operations Copilot Agent (Multi-turn tool-calling assistant)
router.post('/copilot/chat', chatWithCopilot);

export default router;
