import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getMachines = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = (req as any).user?.role;
    const userId = (req as any).user?.userId;
    const userMachineGroup = (req as any).user?.machineGroup;

    const machines = await prisma.machine.findMany({
      include: {
        sensors: true,
        _count: {
          select: {
            alerts: { where: { status: 'ACTIVE' } },
            predictions: true,
            maintenanceTasks: { where: { status: 'PENDING' } },
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    // If operator, filter by machine group
    let filteredMachines = machines;
    if (userRole === 'OPERATOR' && userMachineGroup) {
      filteredMachines = machines.filter(m => m.machineGroup === userMachineGroup);
    }

    res.json(filteredMachines);
  } catch (error) {
    console.error('Get machines error:', error);
    res.status(500).json({ error: 'Failed to get machines' });
  }
};

export const getMachine = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const machine = await prisma.machine.findUnique({
      where: { id },
      include: {
        sensors: {
          include: {
            readings: {
              orderBy: { timestamp: 'desc' },
              take: 100,
            }
          }
        },
        alerts: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        predictions: {
          orderBy: { predictionDate: 'desc' },
          take: 10,
        },
        maintenanceTasks: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!machine) {
      res.status(404).json({ error: 'Machine not found' });
      return;
    }

    res.json(machine);
  } catch (error) {
    console.error('Get machine error:', error);
    res.status(500).json({ error: 'Failed to get machine' });
  }
};

export const createMachine = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, type, model, serialNumber, location, department, machineGroup, installDate } = req.body;

    const machine = await prisma.machine.create({
      data: {
        name,
        type,
        model,
        serialNumber,
        location,
        department,
        machineGroup,
        installDate: installDate ? new Date(installDate) : null,
      },
    });

    res.status(201).json(machine);
  } catch (error) {
    console.error('Create machine error:', error);
    res.status(500).json({ error: 'Failed to create machine' });
  }
};

export const updateMachine = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, type, model, serialNumber, location, department, machineGroup, status, healthScore, lastMaintenance, nextMaintenance } = req.body;

    const machine = await prisma.machine.update({
      where: { id },
      data: {
        name,
        type,
        model,
        serialNumber,
        location,
        department,
        machineGroup,
        status,
        healthScore,
        lastMaintenance: lastMaintenance ? new Date(lastMaintenance) : undefined,
        nextMaintenance: nextMaintenance ? new Date(nextMaintenance) : undefined,
      },
    });

    res.json(machine);
  } catch (error) {
    console.error('Update machine error:', error);
    res.status(500).json({ error: 'Failed to update machine' });
  }
};

export const deleteMachine = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.machine.delete({ where: { id } });

    res.json({ message: 'Machine deleted successfully' });
  } catch (error) {
    console.error('Delete machine error:', error);
    res.status(500).json({ error: 'Failed to delete machine' });
  }
};

export const getMachineStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const machines = await prisma.machine.findMany();
    
    const stats = {
      total: machines.length,
      healthy: machines.filter(m => m.status === 'HEALTHY').length,
      warning: machines.filter(m => m.status === 'WARNING').length,
      critical: machines.filter(m => m.status === 'CRITICAL').length,
      offline: machines.filter(m => m.status === 'OFFLINE').length,
    };

    res.json(stats);
  } catch (error) {
    console.error('Get machine stats error:', error);
    res.status(500).json({ error: 'Failed to get machine stats' });
  }
};
