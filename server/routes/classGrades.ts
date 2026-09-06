import { Router, Response } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { createAuditLog } from '../lib/logger.js';

const router = Router();

// GET /api/class-grades - Get all Class / Grade entries
router.get('/', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const classGrades = await prisma.classGrade.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return res.json({ classGrades });
  } catch (error) {
    console.error('Fetch class grades error:', error);
    return res.status(500).json({ error: 'Failed to fetch class/grade options.' });
  }
});

// POST /api/class-grades - Create a new Class / Grade (ADMIN only)
router.post('/', authenticateToken, requireRole('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Please enter a value.' });
    }

    const trimmedName = name.trim();

    // Check for duplicate class/grade name (case-insensitive)
    const existing = await prisma.classGrade.findFirst({
      where: {
        name: { equals: trimmedName, mode: 'insensitive' },
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'This class/grade already exists.' });
    }

    const classGrade = await prisma.classGrade.create({
      data: { name: trimmedName },
    });

    await createAuditLog(req.user!.userId, 'CREATE_CLASS_GRADE', 'ClassGrade', classGrade.id, { name: trimmedName });

    return res.status(201).json({ classGrade });
  } catch (error: any) {
    console.error('Create class grade error:', error);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

export default router;
