import { Router, Response } from 'express';
import prisma from '../lib/prisma.js';
import { comparePassword, generateToken } from '../lib/auth.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { createAuditLog } from '../lib/logger.js';

const router = Router();

router.post('/login', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials or inactive account.' });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'ADMIN' | 'EDITOR',
    });

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    await createAuditLog(user.id, 'USER_LOGIN', 'User', user.id, { email: user.email, role: user.role });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Failed to process login request.' });
  }
});

router.post('/logout', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (req.user) {
    await createAuditLog(req.user.userId, 'USER_LOGOUT', 'User', req.user.userId);
  }
  res.clearCookie('auth_token');
  return res.json({ message: 'Logged out successfully.' });
});

router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated.' });

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User account not found or deactivated.' });
    }

    return res.json({ user });
  } catch (error) {
    console.error('Auth /me error:', error);
    return res.status(500).json({ error: 'Failed to fetch user session.' });
  }
});

export default router;
