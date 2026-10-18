import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getMaintenanceTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, machineId, assignedTo } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (machineId) where.machineId = machineId;
    if (assignedTo) where.assignedTo = assignedTo;

    const tasks = await prisma.maintenanceTask.findMany({
      where,
      include: {
        machine: {
          select: { id: true, name: true, type: true }
        },
        assignedToUser: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(tasks);
  } catch (error) {
    console.error('Get maintenance tasks error:', error);
    res.status(500).json({ error: 'Failed to get maintenance tasks' });
  }
};

export const getMaintenanceTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const task = await prisma.maintenanceTask.findUnique({
      where: { id },
      include: {
        machine: true,
        assignedToUser: {
          select: { id: true, name: true, email: true }
        }
      },
    });

    if (!task) {
      res.status(404).json({ error: 'Maintenance task not found' });
      return;
    }

    res.json(task);
  } catch (error) {
    console.error('Get maintenance task error:', error);
    res.status(500).json({ error: 'Failed to get maintenance task' });
  }
};

export const createMaintenanceTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { machineId, assignedTo, title, description, type, priority, scheduledDate } = req.body;
    const userId = (req as any).user?.userId;

    const task = await prisma.maintenanceTask.create({
      data: {
        machineId,
        assignedTo,
        title,
        description,
        type,
        priority: priority || 'MEDIUM',
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      },
      include: {
        machine: true,
        assignedToUser: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Log the action
    await prisma.systemLog.create({
      data: {
        userId,
        action: 'CREATE_MAINTENANCE_TASK',
        entityType: 'MaintenanceTask',
        entityId: task.id,
        details: JSON.stringify({ title: task.title, machineId: task.machineId }),
      }
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Create maintenance task error:', error);
    res.status(500).json({ error: 'Failed to create maintenance task' });
  }
};

export const updateMaintenanceTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { assignedTo, title, description, type, priority, status, scheduledDate, completedDate } = req.body;
    const userId = (req as any).user?.userId;

    const task = await prisma.maintenanceTask.update({
      where: { id },
      data: {
        assignedTo,
        title,
        description,
        type,
        priority,
        status,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
        completedDate: completedDate ? new Date(completedDate) : undefined,
      },
      include: {
        machine: true,
        assignedToUser: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Log the action
    await prisma.systemLog.create({
      data: {
        userId,
        action: 'UPDATE_MAINTENANCE_TASK',
        entityType: 'MaintenanceTask',
        entityId: task.id,
        details: JSON.stringify({ status: task.status }),
      }
    });

    res.json(task);
  } catch (error) {
    console.error('Update maintenance task error:', error);
    res.status(500).json({ error: 'Failed to update maintenance task' });
  }
};

export const deleteMaintenanceTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.maintenanceTask.delete({ where: { id } });

    res.json({ message: 'Maintenance task deleted successfully' });
  } catch (error) {
    console.error('Delete maintenance task error:', error);
    res.status(500).json({ error: 'Failed to delete maintenance task' });
  }
};

export const getMaintenanceStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const tasks = await prisma.maintenanceTask.findMany();
    
    const stats = {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'PENDING').length,
      inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      completed: tasks.filter(t => t.status === 'COMPLETED').length,
      cancelled: tasks.filter(t => t.status === 'CANCELLED').length,
    };

    res.json(stats);
  } catch (error) {
    console.error('Get maintenance stats error:', error);
    res.status(500).json({ error: 'Failed to get maintenance stats' });
  }
};