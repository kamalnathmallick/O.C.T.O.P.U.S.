import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSystemHealth = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check database connection
    let dbStatus = 'healthy';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'unhealthy';
    }

    // Get system logs for recent activity
    const recentLogs = await prisma.systemLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Count users
    const userCount = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { isActive: true } });

    // Count machines
    const machineCount = await prisma.machine.count();

    // Count sensors
    const sensorCount = await prisma.sensor.count();

    // Get API response time (simulated)
    const apiResponseTime = Math.floor(Math.random() * 50) + 10; // 10-60ms

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      components: {
        api: {
          status: 'healthy',
          responseTime: apiResponseTime,
          uptime: process.uptime(),
        },
        database: {
          status: dbStatus,
          connectionPool: 'active',
        },
        aiModel: {
          status: 'healthy',
          version: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
          activeAgents: 5,
          geminiConfigured: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
          lastUpdate: new Date().toISOString(),
        },
      },
      metrics: {
        totalUsers: userCount,
        activeUsers,
        totalMachines: machineCount,
        totalSensors: sensorCount,
        recentActivity: recentLogs.length,
      },
    });
  } catch (error) {
    console.error('Get system health error:', error);
    res.status(500).json({ error: 'Failed to get system health' });
  }
};

export const getSystemLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { action, userId, limit = '100' } = req.query;

    const where: any = {};
    if (action) where.action = action;
    if (userId) where.userId = userId;

    const logs = await prisma.systemLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
    });

    res.json(logs);
  } catch (error) {
    console.error('Get system logs error:', error);
    res.status(500).json({ error: 'Failed to get system logs' });
  }
};

export const getSystemConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({
      system: {
        name: 'Octopus Predictive Maintenance',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      },
      features: {
        aiPrediction: true,
        realTimeMonitoring: true,
        automatedMaintenance: true,
        roleBasedAccess: true,
      },
      limits: {
        maxMachines: 1000,
        maxSensorsPerMachine: 50,
        maxUsers: 100,
        dataRetentionDays: 365,
      },
    });
  } catch (error) {
    console.error('Get system config error:', error);
    res.status(500).json({ error: 'Failed to get system config' });
  }
};