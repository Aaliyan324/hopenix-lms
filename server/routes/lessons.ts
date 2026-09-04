import { Router, Response } from 'express';
import prisma from '../lib/prisma.js';
import {
  authenticateToken,
  requireRole,
  requireLessonEditPermission,
  AuthenticatedRequest,
} from '../middleware/auth.js';
import { createAuditLog } from '../lib/logger.js';

const router = Router();

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Get assigned lessons for logged in Editor
router.get('/editor/assigned', authenticateToken, requireRole('EDITOR'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const permissions = await prisma.lessonEditorPermission.findMany({
      where: { userId },
      include: {
        lesson: {
          include: {
            course: {
              select: { id: true, title: true, slug: true },
            },
            media: true,
          },
        },
      },
    });

    const lessons = permissions.map((p) => p.lesson);
    return res.json({ lessons });
  } catch (error) {
    console.error('Fetch editor lessons error:', error);
    return res.status(500).json({ error: 'Failed to fetch assigned lessons.' });
  }
});

// Get lesson by ID
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role, userId } = req.user!;

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        course: {
          select: { id: true, title: true, slug: true, published: true },
        },
        media: true,
        permissions: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true, avatar: true } },
          },
        },
      },
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found.' });
    }

    // Check Editor access if EDITOR role
    if (role === 'EDITOR') {
      const isAssigned = lesson.permissions.some((p) => p.userId === userId);
      if (!isAssigned) {
        return res.status(403).json({ error: 'You do not have access to edit or view this lesson.' });
      }
    }

    // Check Student access
    if (role === 'STUDENT') {
      if (!lesson.published || !lesson.course.published) {
        return res.status(403).json({ error: 'This lesson is currently unpublished.' });
      }
    }

    // Check sibling lessons for Previous / Next navigation
    const siblingLessons = await prisma.lesson.findMany({
      where: {
        courseId: lesson.courseId,
        published: role === 'STUDENT' ? true : undefined,
      },
      select: { id: true, title: true, slug: true, order: true },
      orderBy: { order: 'asc' },
    });

    const currentIndex = siblingLessons.findIndex((l) => l.id === lesson.id);
    const prevLesson = currentIndex > 0 ? siblingLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < siblingLessons.length - 1 ? siblingLessons[currentIndex + 1] : null;

    return res.json({
      lesson,
      navigation: {
        prevLesson,
        nextLesson,
        siblingLessons,
      },
    });
  } catch (error) {
    console.error('Fetch lesson error:', error);
    return res.status(500).json({ error: 'Failed to fetch lesson details.' });
  }
});

// Create Lesson (ADMIN)
router.post('/', authenticateToken, requireRole('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId, title, description, content, published } = req.body;

    if (!courseId || !title) {
      return res.status(400).json({ error: 'Course ID and lesson title are required.' });
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ error: 'Parent course not found.' });
    }

    // Calculate next order
    const maxOrderLesson = await prisma.lesson.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const newOrder = maxOrderLesson ? maxOrderLesson.order + 1 : 1;
    let slug = slugify(title);

    // Check duplicate slug in same course
    const existing = await prisma.lesson.findUnique({
      where: { courseId_slug: { courseId, slug } },
    });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const lesson = await prisma.lesson.create({
      data: {
        courseId,
        title,
        slug,
        description: description || null,
        content: content || null,
        order: newOrder,
        published: Boolean(published),
      },
      include: {
        media: true,
      },
    });

    await createAuditLog(req.user!.userId, 'CREATE_LESSON', 'Lesson', lesson.id, { title, courseId });

    return res.status(201).json({ lesson });
  } catch (error) {
    console.error('Create lesson error:', error);
    return res.status(500).json({ error: 'Failed to create lesson.' });
  }
});

// Update Lesson (ADMIN or EDITOR assigned to lesson)
router.patch('/:id', authenticateToken, requireLessonEditPermission, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, content, published, order } = req.body;

    const existingLesson = await prisma.lesson.findUnique({ where: { id } });
    if (!existingLesson) {
      return res.status(404).json({ error: 'Lesson not found.' });
    }

    const updateData: any = {};
    if (title) {
      updateData.title = title;
      updateData.slug = slugify(title);
    }
    if (description !== undefined) updateData.description = description;
    if (content !== undefined) updateData.content = content;
    if (typeof published === 'boolean') updateData.published = published;
    if (typeof order === 'number') updateData.order = order;

    const updatedLesson = await prisma.lesson.update({
      where: { id },
      data: updateData,
      include: {
        media: true,
        permissions: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    await createAuditLog(req.user!.userId, 'UPDATE_LESSON', 'Lesson', id, { title: updatedLesson.title });

    return res.json({ lesson: updatedLesson });
  } catch (error) {
    console.error('Update lesson error:', error);
    return res.status(500).json({ error: 'Failed to update lesson.' });
  }
});

// Reorder Lessons (ADMIN)
router.post('/reorder', authenticateToken, requireRole('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { items } = req.body; // Array of { id: string, order: number }

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items must be an array of { id, order }.' });
    }

    await Promise.all(
      items.map((item) =>
        prisma.lesson.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    return res.json({ message: 'Lessons reordered successfully.' });
  } catch (error) {
    console.error('Reorder lessons error:', error);
    return res.status(500).json({ error: 'Failed to reorder lessons.' });
  }
});

// Delete Lesson (ADMIN)
router.delete('/:id', authenticateToken, requireRole('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const lesson = await prisma.lesson.findUnique({ where: { id } });
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found.' });
    }

    await prisma.lesson.delete({ where: { id } });

    await createAuditLog(req.user!.userId, 'DELETE_LESSON', 'Lesson', id, { title: lesson.title });

    return res.json({ message: 'Lesson deleted successfully.' });
  } catch (error) {
    console.error('Delete lesson error:', error);
    return res.status(500).json({ error: 'Failed to delete lesson.' });
  }
});

// Get Assigned Editors for Lesson (ADMIN)
router.get('/:id/editors', authenticateToken, requireRole('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const permissions = await prisma.lessonEditorPermission.findMany({
      where: { lessonId: id },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });
    return res.json({ editors: permissions.map((p) => p.user) });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch lesson editors.' });
  }
});

// Assign Editors to Lesson (ADMIN)
router.post('/:id/editors', authenticateToken, requireRole('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { editorIds } = req.body; // Array of user IDs

    if (!Array.isArray(editorIds)) {
      return res.status(400).json({ error: 'editorIds must be an array.' });
    }

    await prisma.lessonEditorPermission.deleteMany({ where: { lessonId: id } });

    if (editorIds.length > 0) {
      await prisma.lessonEditorPermission.createMany({
        data: editorIds.map((userId: string) => ({
          lessonId: id,
          userId,
        })),
      });
    }

    await createAuditLog(req.user!.userId, 'ASSIGN_LESSON_EDITORS', 'Lesson', id, { editorCount: editorIds.length });

    return res.json({ message: 'Lesson editor permissions updated successfully.' });
  } catch (error) {
    console.error('Assign editors error:', error);
    return res.status(500).json({ error: 'Failed to update editor permissions.' });
  }
});

export default router;
