import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get date range from query params
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    // Machine stats
    const machines = await prisma.machine.findMany();
    const machineStats = {
      total: machines.length,
      healthy: machines.filter(m => m.status === 'HEALTHY').length,
      warning: machines.filter(m => m.status === 'WARNING').length,
      critical: machines.filter(m => m.status === 'CRITICAL').length,
      offline: machines.filter(m => m.status === 'OFFLINE').length,
      avgHealthScore: machines.length > 0 
        ? Math.round(machines.reduce((sum, m) => sum + m.healthScore, 0) / machines.length)
        : 0,
    };

    // Alert stats
    const alerts = await prisma.alert.findMany();
    const alertStats = {
      total: alerts.length,
      active: alerts.filter(a => a.status === 'ACTIVE').length,
      acknowledged: alerts.filter(a => a.status === 'ACKNOWLEDGED').length,
      resolved: alerts.filter(a => a.status === 'RESOLVED').length,
      critical: alerts.filter(a => a.severity === 'CRITICAL').length,
      warning: alerts.filter(a => a.severity === 'WARNING').length,
    };

    // Maintenance stats
    const tasks = await prisma.maintenanceTask.findMany();
    const maintenanceStats = {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'PENDING').length,
      inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      completed: tasks.filter(t => t.status === 'COMPLETED').length,
    };

    // Calculate MTBF (Mean Time Between Failures) - simplified
    const criticalMachines = machines.filter(m => m.status === 'CRITICAL');
    const mtbf = machines.length > 0 ? Math.round(24 * 60 * (365 / Math.max(criticalMachines.length, 1))) : 0;

    // Calculate MTTR (Mean Time To Repair) - simplified
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED' && t.completedDate);
    const avgRepairTime = completedTasks.length > 0 
      ? Math.round(completedTasks.reduce((sum, t) => {
          const created = new Date(t.createdAt).getTime();
          const completed = new Date(t.completedDate!).getTime();
          return sum + Math.abs(completed - created);
        }, 0) / completedTasks.length / (1000 * 60 * 60))
      : 0;

    // Downtime trend (last 7 days)
    const downtimeTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const dayAlerts = alerts.filter(a => {
        const alertDate = new Date(a.createdAt);
        return alertDate >= dayStart && alertDate <= dayEnd && a.severity === 'CRITICAL';
      });
      
      downtimeTrend.push({
        date: dayStart.toISOString().split('T')[0],
        downtime: dayAlerts.length * 30, // Simplified minutes
      });
    }

    // Failure rate by machine type
    const failureRateByType: Record<string, number> = {};
    machines.forEach(m => {
      if (!failureRateByType[m.type]) {
        failureRateByType[m.type] = 0;
      }
      if (m.status === 'CRITICAL' || m.status === 'WARNING') {
        failureRateByType[m.type]++;
      }
    });

    res.json({
      machineStats,
      alertStats,
      maintenanceStats,
      mtbf,
      mttr: avgRepairTime,
      downtimeTrend,
      failureRateByType,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
};

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Machine stats
    const machines = await prisma.machine.findMany();
    
    // Alert stats
    const activeAlerts = await prisma.alert.findMany({
      where: { status: 'ACTIVE' }
    });

    // Maintenance stats
    const pendingMaintenance = await prisma.maintenanceTask.findMany({
      where: { status: 'PENDING' }
    });

    // Prediction stats
    const latestPredictions = await prisma.prediction.findMany({
      orderBy: { predictionDate: 'desc' },
      take: 100
    });

    const uniqueMachines = new Map();
    latestPredictions.forEach(p => {
      if (!uniqueMachines.has(p.machineId)) {
        uniqueMachines.set(p.machineId, p);
      }
    });
    const predictionStats = {
      total: uniqueMachines.size,
      normal: Array.from(uniqueMachines.values()).filter(p => p.status === 'NORMAL').length,
      warning: Array.from(uniqueMachines.values()).filter(p => p.status === 'WARNING').length,
      critical: Array.from(uniqueMachines.values()).filter(p => p.status === 'CRITICAL').length,
    };

    res.json({
      totalMachines: machines.length,
      healthyMachines: machines.filter(m => m.status === 'HEALTHY').length,
      warningMachines: machines.filter(m => m.status === 'WARNING').length,
      criticalMachines: machines.filter(m => m.status === 'CRITICAL').length,
      activeAlerts: activeAlerts.length,
      pendingMaintenance: pendingMaintenance.length,
      predictionStats,
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to get dashboard stats' });
  }
};