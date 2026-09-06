import { Router, Response } from 'express';
import prisma from '../lib/prisma.js';
import { hashPassword } from '../lib/auth.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { createAuditLog } from '../lib/logger.js';

const router = Router();

// Protect all user routes for ADMIN only
router.use(authenticateToken, requireRole('ADMIN'));

router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const search = (req.query.search as string) || '';
    const role = (req.query.role as string) || '';
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '20', 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role && ['ADMIN', 'EDITOR'].includes(role.toUpperCase())) {
      where.role = role.toUpperCase();
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              permissions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return res.json({
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Fetch users error:', error);
    return res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required.' });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }

    const passwordHash = await hashPassword(password);
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        role: role.toUpperCase(),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      },
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

    await createAuditLog(req.user!.userId, 'CREATE_USER', 'User', newUser.id, {
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    });

    return res.status(201).json({ user: newUser });
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({ error: 'Failed to create user.' });
  }
});

router.patch('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role, password, isActive } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase().trim();
    if (role && ['ADMIN', 'EDITOR'].includes(role.toUpperCase())) updateData.role = role.toUpperCase();
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (password) updateData.passwordHash = await hashPassword(password);

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        isActive: true,
        updatedAt: true,
      },
    });

    await createAuditLog(req.user!.userId, 'UPDATE_USER', 'User', id, updateData);

    return res.json({ user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ error: 'Failed to update user.' });
  }
});

router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (id === req.user!.userId) {
      return res.status(400).json({ error: 'You cannot delete your own account.' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    await prisma.user.delete({ where: { id } });

    await createAuditLog(req.user!.userId, 'DELETE_USER', 'User', id, { email: user.email });

    return res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ error: 'Failed to delete user.' });
  }
});

// GET editor permissions — returns all book and lesson permission IDs for one user
router.get('/:id/permissions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, avatar: true },
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const [bookPermissions, lessonPermissions] = await Promise.all([
      prisma.bookEditorPermission.findMany({
        where: { userId: id },
        select: { bookId: true },
      }),
      prisma.lessonEditorPermission.findMany({
        where: { userId: id },
        select: { lessonId: true },
      }),
    ]);

    return res.json({
      user,
      bookPermissions: bookPermissions.map((p) => p.bookId),
      lessonPermissions: lessonPermissions.map((p) => p.lessonId),
    });
  } catch (error) {
    console.error('Fetch user permissions error:', error);
    return res.status(500).json({ error: 'Failed to fetch user permissions.' });
  }
});

export default router;
