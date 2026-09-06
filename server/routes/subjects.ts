import { Router, Response } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { createAuditLog } from '../lib/logger.js';

const router = Router();

// GET /api/subjects - Get all Subject entries
router.get('/', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { name: 'asc' },
    });
    return res.json({ subjects });
  } catch (error) {
    console.error('Fetch subjects error:', error);
    return res.status(500).json({ error: 'Failed to fetch subject options.' });
  }
});

// POST /api/subjects - Create a new Subject (ADMIN only)
router.post('/', authenticateToken, requireRole('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Please enter a value.' });
    }

    const trimmedName = name.trim();

    // Check for duplicate subject name (case-insensitive)
    const existing = await prisma.subject.findFirst({
      where: {
        name: { equals: trimmedName, mode: 'insensitive' },
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'This subject already exists.' });
    }

    const subject = await prisma.subject.create({
      data: { name: trimmedName },
    });

    await createAuditLog(req.user!.userId, 'CREATE_SUBJECT', 'Subject', subject.id, { name: trimmedName });

    return res.status(201).json({ subject });
  } catch (error: any) {
    console.error('Create subject error:', error);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

export default router;
