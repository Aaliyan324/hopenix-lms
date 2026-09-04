import { Router, Response } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { createAuditLog } from '../lib/logger.js';

const router = Router();

router.post('/:lessonId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { lessonId } = req.params;
    const { completed } = req.body;
    const userId = req.user!.userId;

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found.' });
    }

    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {
        completed: Boolean(completed),
      },
      create: {
        userId,
        lessonId,
        completed: Boolean(completed),
      },
    });

    if (completed) {
      await createAuditLog(userId, 'COMPLETE_LESSON', 'Lesson', lessonId, { lessonTitle: lesson.title });
    }

    return res.json({ progress });
  } catch (error) {
    console.error('Update progress error:', error);
    return res.status(500).json({ error: 'Failed to update lesson progress.' });
  }
});

export default router;
