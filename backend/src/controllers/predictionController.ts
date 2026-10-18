import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getPredictions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { machineId, status } = req.query;

    const where: any = {};
    if (machineId) where.machineId = machineId;
    if (status) where.status = status;

    const predictions = await prisma.prediction.findMany({
      where,
      include: {
        machine: {
          select: { id: true, name: true, type: true }
        }
      },
      orderBy: { predictionDate: 'desc' },
      take: 100,
    });

    res.json(predictions);
  } catch (error) {
    console.error('Get predictions error:', error);
    res.status(500).json({ error: 'Failed to get predictions' });
  }
};

export const getPrediction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const prediction = await prisma.prediction.findUnique({
      where: { id },
      include: {
        machine: true
      },
    });

    if (!prediction) {
      res.status(404).json({ error: 'Prediction not found' });
      return;
    }

    res.json(prediction);
  } catch (error) {
    console.error('Get prediction error:', error);
    res.status(500).json({ error: 'Failed to get prediction' });
  }
};

export const createPrediction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { machineId, failureProbability, rul, riskScore, confidence, status, modelVersion } = req.body;

    const prediction = await prisma.prediction.create({
      data: {
        machineId,
        failureProbability: failureProbability || 0,
        rul: rul || 365,
        riskScore: riskScore || 0,
        confidence: confidence || 0,
        status: status || 'NORMAL',
        modelVersion,
        nextPrediction: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
      include: {
        machine: true
      }
    });

    res.status(201).json(prediction);
  } catch (error) {
    console.error('Create prediction error:', error);
    res.status(500).json({ error: 'Failed to create prediction' });
  }
};

export const getPredictionStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const predictions = await prisma.prediction.findMany({
      orderBy: { predictionDate: 'desc' },
      take: 1000,
    });
    
    const latestPredictions = predictions.reduce((acc, p) => {
      const existing = acc.find(e => e.machineId === p.machineId);
      if (!existing) acc.push(p);
      return acc;
    }, [] as any[]);

    const stats = {
      totalMachines: latestPredictions.length,
      normal: latestPredictions.filter(p => p.status === 'NORMAL').length,
      warning: latestPredictions.filter(p => p.status === 'WARNING').length,
      critical: latestPredictions.filter(p => p.status === 'CRITICAL').length,
      avgFailureProbability: latestPredictions.length > 0 
        ? latestPredictions.reduce((sum, p) => sum + p.failureProbability, 0) / latestPredictions.length 
        : 0,
      avgRUL: latestPredictions.length > 0
        ? latestPredictions.reduce((sum, p) => sum + (p.rul || 0), 0) / latestPredictions.length
        : 365,
    };

    res.json(stats);
  } catch (error) {
    console.error('Get prediction stats error:', error);
    res.status(500).json({ error: 'Failed to get prediction stats' });
  }
};