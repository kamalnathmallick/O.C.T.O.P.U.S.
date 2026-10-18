import { Request, Response } from 'express';
import {
  listAvailableAgents,
  runDiagnosticAgent,
  runPredictiveRulAgent,
  runMaintenanceDispatcherAgent,
  runFleetBriefingAgent,
  runCopilotChatAgent,
} from '../services/aiAgentService';

export const getAgents = async (req: Request, res: Response): Promise<void> => {
  try {
    const agents = listAvailableAgents();
    res.json({
      agents,
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
      defaultModel: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
    });
  } catch (error) {
    console.error('Get AI agents error:', error);
    res.status(500).json({ error: 'Failed to list AI agents' });
  }
};

export const diagnoseMachine = async (req: Request, res: Response): Promise<void> => {
  try {
    const { machineId } = req.params;
    const { autoCreateAlert = true } = req.body || {};
    const userId = (req as any).user?.userId;

    const report = await runDiagnosticAgent(machineId, { autoCreateAlert, userId });
    res.json(report);
  } catch (error: any) {
    console.error('Diagnose machine agent error:', error);
    const status = error?.message === 'Machine not found' ? 404 : 500;
    res.status(status).json({ error: error?.message || 'Failed to run diagnostic agent' });
  }
};

export const forecastMachineRul = async (req: Request, res: Response): Promise<void> => {
  try {
    const { machineId } = req.params;
    const { persistPrediction = true } = req.body || {};
    const userId = (req as any).user?.userId;

    const report = await runPredictiveRulAgent(machineId, { persistPrediction, userId });
    res.json(report);
  } catch (error: any) {
    console.error('Forecast machine RUL agent error:', error);
    const status = error?.message === 'Machine not found' ? 404 : 500;
    res.status(status).json({ error: error?.message || 'Failed to run predictive RUL agent' });
  }
};

export const dispatchMaintenance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { machineId } = req.body || {};
    const userId = (req as any).user?.userId;

    const report = await runMaintenanceDispatcherAgent({ machineId, userId });
    res.json(report);
  } catch (error: any) {
    console.error('Maintenance dispatcher agent error:', error);
    res.status(500).json({ error: error?.message || 'Failed to run maintenance dispatcher agent' });
  }
};

export const generateFleetBriefing = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const report = await runFleetBriefingAgent(userId);
    res.json(report);
  } catch (error: any) {
    console.error('Fleet briefing agent error:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate fleet briefing' });
  }
};

export const chatWithCopilot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, previousInteractionId } = req.body || {};
    const userId = (req as any).user?.userId;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const response = await runCopilotChatAgent({
      message,
      previousInteractionId,
      userId,
    });
    res.json(response);
  } catch (error: any) {
    console.error('Copilot chat agent error:', error);
    res.status(500).json({ error: error?.message || 'Failed to process Copilot chat message' });
  }
};
