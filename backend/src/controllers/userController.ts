import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all users (Admin only)
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, isActive } = req.query;

    const where: any = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        machineGroup: true,
        operatorNumber: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
};

// Get single user
export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        machineGroup: true,
        operatorNumber: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

// Create operator (Admin only)
export const createOperator = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, department, operatorNumber, machineGroup } = req.body;
    const adminId = (req as any).user?.userId;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    // Validate operator number
    if (!operatorNumber) {
      res.status(400).json({ error: 'Operator number is required' });
      return;
    }

    const opNumber = await prisma.operatorNumber.findUnique({
      where: { number: operatorNumber }
    });
    
    if (!opNumber) {
      res.status(400).json({ error: 'Invalid operator number' });
      return;
    }
    
    if (opNumber.isAssigned) {
      res.status(400).json({ error: 'Operator number already assigned' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'OPERATOR',
        department,
        operatorNumber,
        machineGroup,
        createdById: adminId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        machineGroup: true,
        operatorNumber: true,
        createdAt: true,
      },
    });

    // Mark operator number as assigned
    await prisma.operatorNumber.update({
      where: { number: operatorNumber },
      data: { isAssigned: true, assignedTo: user.id }
    });

    // Log the action
    await prisma.systemLog.create({
      data: {
        userId: adminId,
        action: 'CREATE_OPERATOR',
        entityType: 'User',
        entityId: user.id,
        details: JSON.stringify({ email: user.email, name: user.name }),
      }
    });

    res.status(201).json({ message: 'Operator created successfully', user });
  } catch (error) {
    console.error('Create operator error:', error);
    res.status(500).json({ error: 'Failed to create operator' });
  }
};

// Update user
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, department, machineGroup, isActive } = req.body;
    const adminId = (req as any).user?.userId;

    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        department,
        machineGroup,
        isActive,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        machineGroup: true,
        isActive: true,
      }
    });

    // Log the action
    await prisma.systemLog.create({
      data: {
        userId: adminId,
        action: 'UPDATE_USER',
        entityType: 'User',
        entityId: user.id,
        details: JSON.stringify({ name: user.name }),
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// Delete user (soft delete - just disable)
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const adminId = (req as any).user?.userId;

    // Don't allow self-delete
    if (id === adminId) {
      res.status(400).json({ error: 'Cannot disable your own account' });
      return;
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
      }
    });

    // Log the action
    await prisma.systemLog.create({
      data: {
        userId: adminId,
        action: 'DISABLE_USER',
        entityType: 'User',
        entityId: user.id,
        details: JSON.stringify({ email: user.email, name: user.name }),
      }
    });

    res.json({ message: 'User disabled successfully', user });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Reset user password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    const adminId = (req as any).user?.userId;

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });

    // Log the action
    await prisma.systemLog.create({
      data: {
        userId: adminId,
        action: 'RESET_PASSWORD',
        entityType: 'User',
        entityId: id,
      }
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

// Get operator numbers
export const getOperatorNumbers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { assigned } = req.query;

    const where: any = {};
    if (assigned !== undefined) {
      where.isAssigned = assigned === 'true';
    }

    const numbers = await prisma.operatorNumber.findMany({
      where,
      orderBy: { number: 'asc' },
    });

    res.json(numbers);
  } catch (error) {
    console.error('Get operator numbers error:', error);
    res.status(500).json({ error: 'Failed to get operator numbers' });
  }
};

// Create operator number (Admin only)
export const createOperatorNumber = async (req: Request, res: Response): Promise<void> => {
  try {
    const { number } = req.body;

    const existing = await prisma.operatorNumber.findUnique({
      where: { number }
    });

    if (existing) {
      res.status(400).json({ error: 'Operator number already exists' });
      return;
    }

    const opNumber = await prisma.operatorNumber.create({
      data: { number }
    });

    res.status(201).json(opNumber);
  } catch (error) {
    console.error('Create operator number error:', error);
    res.status(500).json({ error: 'Failed to create operator number' });
  }
};