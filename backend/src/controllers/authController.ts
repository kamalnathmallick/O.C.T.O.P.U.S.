import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const jwtExpiresIn = (process.env.JWT_EXPIRES_IN || '24h') as jwt.SignOptions['expiresIn'];
const jwtRefreshExpiresIn = (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role, department, operatorNumber, machineGroup } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // For ADMIN role, only system can create (no self-registration)
    if (role === 'ADMIN') {
      res.status(403).json({ error: 'Admin accounts cannot be self-registered' });
      return;
    }

    // For OPERATOR, validate operator number if provided
    if (operatorNumber) {
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
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'OPERATOR',
        department,
        operatorNumber,
        machineGroup,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        machineGroup: true,
        createdAt: true,
      },
    });

    // Mark operator number as assigned
    if (operatorNumber) {
      await prisma.operatorNumber.update({
        where: { number: operatorNumber },
        data: { isAssigned: true, assignedTo: user.id }
      });
    }

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(401).json({ error: 'Account is disabled' });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Verify role if provided
    if (role && user.role !== role) {
      res.status(401).json({ error: 'Invalid role for this account' });
      return;
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: jwtExpiresIn }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
      { expiresIn: jwtRefreshExpiresIn }
    );

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Log the login
    await prisma.systemLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entityType: 'User',
        entityId: user.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      }
    });

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        machineGroup: user.machineGroup,
        lastLogin: user.lastLogin,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      res.status(400).json({ error: 'Refresh token required' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'default_refresh_secret') as { userId: string };
    
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || !user.isActive) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: jwtExpiresIn }
    );

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if email exists
      res.json({ message: 'If the email exists, a reset link will be sent' });
      return;
    }

    // In production, send reset email here
    // For demo, just return success
    res.json({ message: 'Password reset link sent to email' });
  } catch (error) {
    res.status(500).json({ error: 'Password reset failed' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    // In production, verify token from email
    // For demo, just accept any request
    const { email } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(400).json({ error: 'Invalid request' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    await prisma.systemLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_RESET',
        entityType: 'User',
        entityId: user.id,
      }
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Password reset failed' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    
    if (userId) {
      await prisma.systemLog.create({
        data: {
          userId,
          action: 'LOGOUT',
          entityType: 'User',
          entityId: userId,
        }
      });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        machineGroup: true,
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
    res.status(500).json({ error: 'Failed to get profile' });
  }
};
