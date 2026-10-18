import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAlerts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, severity, machineId, limit = '50' } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (severity) where.severity = severity;
    if (machineId) where.machineId = machineId;

    const alerts = await prisma.alert.findMany({
      where,
      include: {
        machine: {
          select: { id: true, name: true, type: true }
        },
        acknowledgedByUser: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
    });

    res.json(alerts);
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Failed to get alerts' });
  }
};

export const getAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const alert = await prisma.alert.findUnique({
      where: { id },
      include: {
        machine: true,
        acknowledgedByUser: {
          select: { name: true, email: true }
        }
      },
    });

    if (!alert) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }

    res.json(alert);
  } catch (error) {
    console.error('Get alert error:', error);
    res.status(500).json({ error: 'Failed to get alert' });
  }
};

export const createAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const { machineId, severity, title, message, sensorType, value, threshold } = req.body;

    const alert = await prisma.alert.create({
      data: {
        machineId,
        severity: severity || 'INFO',
        title,
        message,
        sensorType,
        value,
        threshold,
      },
      include: {
        machine: true
      }
    });

    res.status(201).json(alert);
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
};

export const acknowledgeAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    const alert = await prisma.alert.update({
      where: { id },
      data: {
        status: 'ACKNOWLEDGED',
        acknowledgedBy: userId,
        acknowledgedAt: new Date(),
      },
      include: {
        machine: true,
        acknowledgedByUser: {
          select: { name: true, email: true }
        }
      }
    });

    res.json(alert);
  } catch (error) {
    console.error('Acknowledge alert error:', error);
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
};

export const resolveAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const alert = await prisma.alert.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
      },
      include: {
        machine: true
      }
    });

    res.json(alert);
  } catch (error) {
    console.error('Resolve alert error:', error);
    res.status(500).json({ error: 'Failed to resolve alert' });
  }
};

export const getAlertStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const alerts = await prisma.alert.findMany();
    
    const stats = {
      total: alerts.length,
      active: alerts.filter(a => a.status === 'ACTIVE').length,
      acknowledged: alerts.filter(a => a.status === 'ACKNOWLEDGED').length,
      resolved: alerts.filter(a => a.status === 'RESOLVED').length,
      critical: alerts.filter(a => a.severity === 'CRITICAL' && a.status === 'ACTIVE').length,
      warning: alerts.filter(a => a.severity === 'WARNING' && a.status === 'ACTIVE').length,
      info: alerts.filter(a => a.severity === 'INFO' && a.status === 'ACTIVE').length,
    };

    res.json(stats);
  } catch (error) {
    console.error('Get alert stats error:', error);
    res.status(500).json({ error: 'Failed to get alert stats' });
  }
};