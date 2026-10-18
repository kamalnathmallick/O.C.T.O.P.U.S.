import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { runDiagnosticAgent } from '../services/aiAgentService';

const prisma = new PrismaClient();

export const getSensors = async (req: Request, res: Response): Promise<void> => {
  try {
    const { machineId } = req.query;

    const where = machineId ? { machineId: machineId as string } : {};
    
    const sensors = await prisma.sensor.findMany({
      where,
      include: {
        machine: {
          select: { id: true, name: true }
        },
        readings: {
          orderBy: { timestamp: 'desc' },
          take: 10,
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(sensors);
  } catch (error) {
    console.error('Get sensors error:', error);
    res.status(500).json({ error: 'Failed to get sensors' });
  }
};

export const getSensor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const sensor = await prisma.sensor.findUnique({
      where: { id },
      include: {
        machine: true,
        readings: {
          orderBy: { timestamp: 'desc' },
          take: 100,
        }
      },
    });

    if (!sensor) {
      res.status(404).json({ error: 'Sensor not found' });
      return;
    }

    res.json(sensor);
  } catch (error) {
    console.error('Get sensor error:', error);
    res.status(500).json({ error: 'Failed to get sensor' });
  }
};

export const createSensor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { machineId, name, type, unit, minValue, maxValue, thresholdMin, thresholdMax } = req.body;

    const sensor = await prisma.sensor.create({
      data: {
        machineId,
        name,
        type,
        unit,
        minValue,
        maxValue,
        thresholdMin,
        thresholdMax,
      },
    });

    res.status(201).json(sensor);
  } catch (error) {
    console.error('Create sensor error:', error);
    res.status(500).json({ error: 'Failed to create sensor' });
  }
};

export const updateSensor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, type, unit, minValue, maxValue, thresholdMin, thresholdMax, isActive, batteryLevel } = req.body;

    const sensor = await prisma.sensor.update({
      where: { id },
      data: {
        name,
        type,
        unit,
        minValue,
        maxValue,
        thresholdMin,
        thresholdMax,
        isActive,
        batteryLevel,
      },
    });

    res.json(sensor);
  } catch (error) {
    console.error('Update sensor error:', error);
    res.status(500).json({ error: 'Failed to update sensor' });
  }
};

export const deleteSensor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.sensor.delete({ where: { id } });

    res.json({ message: 'Sensor deleted successfully' });
  } catch (error) {
    console.error('Delete sensor error:', error);
    res.status(500).json({ error: 'Failed to delete sensor' });
  }
};

export const addSensorReading = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sensorId, value } = req.body;
    const userId = (req as any).user?.userId;

    const reading = await prisma.sensorReading.create({
      data: {
        sensorId,
        value,
      },
    });

    // Update sensor last reading
    const updatedSensor = await prisma.sensor.update({
      where: { id: sensorId },
      data: { lastReading: new Date() }
    });

    // Auto-trigger Anomaly & Root-Cause Diagnostic Agent on threshold breach
    let aiDiagnostic = null;
    const breachedMax = updatedSensor.thresholdMax !== null && updatedSensor.thresholdMax !== undefined && value > updatedSensor.thresholdMax;
    const breachedMin = updatedSensor.thresholdMin !== null && updatedSensor.thresholdMin !== undefined && value < updatedSensor.thresholdMin;

    if (breachedMax || breachedMin) {
      try {
        aiDiagnostic = await runDiagnosticAgent(updatedSensor.machineId, {
          autoCreateAlert: true,
          userId,
        });
      } catch (diagErr) {
        console.warn('Auto diagnostic agent trigger failed:', diagErr);
      }
    }

    res.status(201).json({ ...reading, aiDiagnostic });
  } catch (error) {
    console.error('Add sensor reading error:', error);
    res.status(500).json({ error: 'Failed to add sensor reading' });
  }
};

export const getSensorReadings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sensorId } = req.params;
    const { limit = '100' } = req.query;

    const readings = await prisma.sensorReading.findMany({
      where: { sensorId },
      orderBy: { timestamp: 'desc' },
      take: parseInt(limit as string),
    });

    res.json(readings);
  } catch (error) {
    console.error('Get sensor readings error:', error);
    res.status(500).json({ error: 'Failed to get sensor readings' });
  }
};