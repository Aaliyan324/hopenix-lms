import { Router, Response } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

router.get('/dashboard', authenticateToken, requireRole('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [
      totalBooks,
      totalLessons,
      totalEditors,
      publishedBooks,
      publishedLessons,
      recentLogs,
    ] = await Promise.all([
      prisma.course.count(),
      prisma.lesson.count(),
      prisma.user.count({ where: { role: 'EDITOR' } }),
      prisma.course.count({ where: { published: true } }),
      prisma.lesson.count({ where: { published: true } }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, role: true, avatar: true } },
        },
      }),
    ]);

    return res.json({
      stats: {
        totalBooks,
        totalLessons,
        totalEditors,
        publishedBooks,
        publishedLessons,
        totalCourses: totalBooks, // backward compatible fallback
        publishedCourses: publishedBooks,
      },
      recentLogs,
    });
  } catch (error) {
    console.error('Fetch dashboard stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard metrics.' });
  }
});

router.get('/logs', authenticateToken, requireRole('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '20', 10);
    const search = (req.query.search as string) || '';
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { entityType: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, role: true, avatar: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return res.json({
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Fetch activity logs error:', error);
    return res.status(500).json({ error: 'Failed to fetch activity logs.' });
  }
});

export default router;
