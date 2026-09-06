import { Router, Response } from 'express';
import QRCode from 'qrcode';
import prisma from '../lib/prisma.js';
import { StorageService } from '../lib/storage.js';
import { formatLesson } from '../lib/formatters.js';
import {
  authenticateToken,
  optionalAuthenticateToken,
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

export function extractYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`);
    const host = parsed.hostname.toLowerCase();

    if (!['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'].includes(host)) {
      return null;
    }

    let videoId: string | null = null;
    if (host === 'youtu.be') {
      videoId = parsed.pathname.slice(1).split('/')[0];
    } else if (parsed.pathname.startsWith('/watch')) {
      videoId = parsed.searchParams.get('v');
    } else if (parsed.pathname.startsWith('/shorts/')) {
      videoId = parsed.pathname.split('/shorts/')[1]?.split('/')[0] || null;
    } else if (parsed.pathname.startsWith('/embed/')) {
      videoId = parsed.pathname.split('/embed/')[1]?.split('/')[0] || null;
    }

    if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return videoId;
    }
  } catch (err) {
    return null;
  }
  return null;
}

// Get assigned lessons for logged in Editor
router.get('/editor/assigned', authenticateToken, requireRole('EDITOR'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    
    // Lessons assigned directly OR via parent book assignment
    const [lessonPermissions, bookPermissions] = await Promise.all([
      prisma.lessonEditorPermission.findMany({
        where: { userId },
        include: {
          lesson: {
            include: {
              qrCode: true,
              course: {
                select: { id: true, title: true, slug: true },
              },
              media: true,
            },
          },
        },
      }),
      prisma.bookEditorPermission.findMany({
        where: { userId },
        select: { bookId: true },
      }),
    ]);

    const assignedBookIds = bookPermissions.map((bp) => bp.bookId);
    
    let bookAssignedLessons: any[] = [];
    if (assignedBookIds.length > 0) {
      bookAssignedLessons = await prisma.lesson.findMany({
        where: { courseId: { in: assignedBookIds } },
        include: {
          qrCode: true,
          course: { select: { id: true, title: true, slug: true } },
          media: true,
        },
      });
    }

    const map = new Map<string, any>();
    lessonPermissions.forEach((p) => map.set(p.lesson.id, p.lesson));
    bookAssignedLessons.forEach((l) => map.set(l.id, l));

    const lessons = Array.from(map.values()).map((lesson) => formatLesson({
      ...lesson,
      qrCodeUrl: lesson.qrCode?.imageUrl || lesson.qrCodeUrl,
      qrCodeData: lesson.qrCode?.destinationUrl || lesson.qrCodeData,
      qrLogo: lesson.qrCode?.logoUrl || lesson.qrLogo,
    }));

    return res.json({ lessons });
  } catch (error) {
    console.error('Fetch editor lessons error:', error);
    return res.status(500).json({ error: 'Failed to fetch assigned lessons.' });
  }
});

// PUBLIC / AUTH Get lesson by ID or by Book slug + Lesson number
router.get('/:idOrSlug', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { idOrSlug } = req.params;
    const user = req.user;
    const role = user?.role;
    const userId = user?.userId;

    const lesson = await prisma.lesson.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        qrCode: true,
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
      const [lessonPermission, bookPermission] = await Promise.all([
        prisma.lessonEditorPermission.findUnique({
          where: { lessonId_userId: { lessonId: lesson.id, userId: userId! } },
        }),
        prisma.bookEditorPermission.findUnique({
          where: { bookId_userId: { bookId: lesson.courseId, userId: userId! } },
        }),
      ]);

      if (!lessonPermission && !bookPermission) {
        return res.status(403).json({ error: 'You do not have access to edit or view this lesson.' });
      }
    }

    // Public access: must be published
    if (!role && (!lesson.published || !lesson.course.published)) {
      return res.status(403).json({ error: 'This lesson is currently unpublished.' });
    }

    // Check sibling lessons for Previous / Next navigation
    const siblingLessons = await prisma.lesson.findMany({
      where: {
        courseId: lesson.courseId,
        // Public viewers only see published lessons; admins see all
        published: role === 'ADMIN' ? undefined : true,
      },
      select: { id: true, title: true, slug: true, lessonNumber: true, order: true },
      orderBy: [{ lessonNumber: 'asc' }, { order: 'asc' }],
    });

    const currentIndex = siblingLessons.findIndex((l) => l.id === lesson.id);
    const prevLesson = currentIndex > 0 ? siblingLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < siblingLessons.length - 1 ? siblingLessons[currentIndex + 1] : null;

    const formattedLesson = formatLesson({
      ...lesson,
      qrCodeUrl: lesson.qrCode?.imageUrl || lesson.qrCodeUrl,
      qrCodeData: lesson.qrCode?.destinationUrl || lesson.qrCodeData,
      qrLogo: lesson.qrCode?.logoUrl || lesson.qrLogo,
    });

    return res.json({
      lesson: formattedLesson,
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
    const { courseId, bookId, title, description, content, published, lessonNumber, readingTime, youtubeUrl } = req.body;
    const targetBookId = bookId || courseId;

    if (!targetBookId || !title) {
      return res.status(400).json({ error: 'Book ID and lesson title are required.' });
    }

    const book = await prisma.course.findUnique({ where: { id: targetBookId } });
    if (!book) {
      return res.status(404).json({ error: 'Parent book not found.' });
    }

    let youtubeVideoId: string | null = null;
    let finalYoutubeUrl: string | null = null;
    if (youtubeUrl && typeof youtubeUrl === 'string' && youtubeUrl.trim()) {
      youtubeVideoId = extractYouTubeVideoId(youtubeUrl);
      if (!youtubeVideoId) {
        return res.status(400).json({ error: 'Please enter a valid YouTube video URL.' });
      }
      finalYoutubeUrl = youtubeUrl.trim();
    }

    // Calculate next order and lessonNumber
    const maxOrderLesson = await prisma.lesson.findFirst({
      where: { courseId: targetBookId },
      orderBy: { order: 'desc' },
      select: { order: true, lessonNumber: true },
    });

    const newOrder = maxOrderLesson ? maxOrderLesson.order + 1 : 1;
    const newLessonNumber = lessonNumber ? parseInt(lessonNumber, 10) : maxOrderLesson ? maxOrderLesson.lessonNumber + 1 : 1;
    let slug = slugify(title);

    const existing = await prisma.lesson.findUnique({
      where: { courseId_slug: { courseId: targetBookId, slug } },
    });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const lesson = await prisma.lesson.create({
      data: {
        courseId: targetBookId,
        title,
        slug,
        description: description || null,
        content: content || null,
        youtubeUrl: finalYoutubeUrl,
        youtubeVideoId: youtubeVideoId,
        lessonNumber: newLessonNumber,
        readingTime: readingTime || null,
        order: newOrder,
        published: Boolean(published),
      },
      include: {
        media: true,
      },
    });

    await createAuditLog(req.user!.userId, 'CREATE_LESSON', 'Lesson', lesson.id, { title, bookId: targetBookId });

    return res.status(201).json({ lesson });
  } catch (error) {
    console.error('Create lesson error:', error);
    return res.status(500).json({ error: 'Failed to create lesson.' });
  }
});

// Update Lesson (ADMIN or EDITOR assigned to lesson/book)
router.patch('/:id', authenticateToken, requireLessonEditPermission, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, content, published, order, lessonNumber, readingTime, youtubeUrl } = req.body;
    const { role } = req.user!;

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

    if (youtubeUrl !== undefined) {
      if (youtubeUrl === null || youtubeUrl === '') {
        updateData.youtubeUrl = null;
        updateData.youtubeVideoId = null;
      } else {
        const vid = extractYouTubeVideoId(youtubeUrl);
        if (!vid) {
          return res.status(400).json({ error: 'Please enter a valid YouTube video URL.' });
        }
        updateData.youtubeUrl = youtubeUrl.trim();
        updateData.youtubeVideoId = vid;
      }
    }
    
    // Editors cannot toggle published status unless Admin
    if (role === 'ADMIN' && typeof published === 'boolean') {
      updateData.published = published;
    }
    
    if (typeof order === 'number') updateData.order = order;
    if (lessonNumber !== undefined) updateData.lessonNumber = parseInt(lessonNumber, 10);
    if (readingTime !== undefined) updateData.readingTime = readingTime;

    const updatedLesson = await prisma.lesson.update({
      where: { id },
      data: updateData,
      include: {
        qrCode: true,
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
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items must be an array of { id, order, lessonNumber }.' });
    }

    await Promise.all(
      items.map((item, index) =>
        prisma.lesson.update({
          where: { id: item.id },
          data: {
            order: item.order ?? index + 1,
            lessonNumber: item.lessonNumber ?? index + 1,
          },
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
    const { editorIds } = req.body;

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

// PUBLIC Fetch Persisted QR Code for Lesson (Does NOT auto-generate)
router.get('/:id/qr', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const lesson = await prisma.lesson.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        qrCode: true,
        course: {
          select: { id: true, title: true, slug: true, qrLogo: true, companyName: true },
        },
      },
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found.' });
    }

    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol === 'https' || host.includes('vercel.app') ? 'https' : 'http';
    const baseUrl = process.env.VITE_APP_URL || `${protocol}://${host}`;
    const companySlug = slugify(lesson.course.companyName || 'hopenix');
    const lessonUrl = `${baseUrl}/${companySlug}/books/${lesson.course.slug}/lessons/${lesson.lessonNumber}`;

    const persistentQr = lesson.qrCode;

    return res.json({
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      lessonSlug: lesson.slug,
      lessonNumber: lesson.lessonNumber,
      lessonUrl: persistentQr?.destinationUrl || lesson.qrCodeData || lessonUrl,
      bookId: lesson.course.id,
      bookTitle: lesson.course.title,
      bookSlug: lesson.course.slug,
      qrLogo: persistentQr?.logoUrl || lesson.qrLogo || lesson.course.qrLogo || null,
      qrCodeData: persistentQr?.destinationUrl || lesson.qrCodeData || null,
      qrCodeUrl: persistentQr?.imageUrl || lesson.qrCodeUrl || null,
      logoConfig: persistentQr?.logoConfig || null,
      qrGeneratedAt: persistentQr?.updatedAt || lesson.qrGeneratedAt || null,
      hasPersistedQR: Boolean(persistentQr?.imageUrl || lesson.qrCodeUrl),
    });
  } catch (error) {
    console.error('Fetch Lesson QR error:', error);
    return res.status(500).json({ error: 'Failed to fetch lesson QR code.' });
  }
});

// ADMIN Generate or Regenerate QR Code for Lesson (Strict ADMIN authorization)
router.post('/:id/qr', authenticateToken, requireRole('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { logoUrl, logoConfig, qrDataUrl, regenerate } = req.body;

    const lesson = await prisma.lesson.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        qrCode: true,
        course: {
          select: { id: true, title: true, slug: true, qrLogo: true, companyName: true },
        },
      },
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found.' });
    }

    // If QR already exists in QRCode model and admin did not explicitly request regeneration, return saved QR
    if (lesson.qrCode?.imageUrl && !regenerate) {
      return res.json({
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        lessonSlug: lesson.slug,
        lessonNumber: lesson.lessonNumber,
        lessonUrl: lesson.qrCode.destinationUrl,
        bookId: lesson.course.id,
        bookTitle: lesson.course.title,
        bookSlug: lesson.course.slug,
        qrLogo: lesson.qrCode.logoUrl || lesson.course.qrLogo || null,
        qrCodeData: lesson.qrCode.destinationUrl,
        qrCodeUrl: lesson.qrCode.imageUrl,
        logoConfig: lesson.qrCode.logoConfig || null,
        qrGeneratedAt: lesson.qrCode.updatedAt,
        message: 'Loaded existing persistent lesson QR code.',
      });
    }

    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol === 'https' || host.includes('vercel.app') ? 'https' : 'http';
    const baseUrl = process.env.VITE_APP_URL || `${protocol}://${host}`;
    const companySlug = slugify(lesson.course.companyName || 'hopenix');
    const lessonUrl = `${baseUrl}/${companySlug}/books/${lesson.course.slug}/lessons/${lesson.lessonNumber}`;

    let savedQrImageUrl = lesson.qrCode?.imageUrl || lesson.qrCodeUrl;

    if (qrDataUrl && qrDataUrl.startsWith('data:image/')) {
      const base64Data = qrDataUrl.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const filename = `qr_lesson_${lesson.course.slug}_L${lesson.lessonNumber}_${Date.now()}.png`;
      const uploaded = await StorageService.uploadFile(buffer, filename, 'image/png');
      savedQrImageUrl = uploaded.url;
    } else if (!savedQrImageUrl || regenerate) {
      const qrData = await QRCode.toDataURL(lessonUrl, {
        width: 500,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: { dark: '#0f172a', light: '#ffffff' },
      });
      const base64Data = qrData.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const filename = `qr_lesson_${lesson.course.slug}_L${lesson.lessonNumber}_${Date.now()}.png`;
      const uploaded = await StorageService.uploadFile(buffer, filename, 'image/png');
      savedQrImageUrl = uploaded.url;
    }

    const now = new Date();
    const effectiveLogo = logoUrl !== undefined ? logoUrl : (lesson.qrCode?.logoUrl || lesson.qrLogo || lesson.course.qrLogo);
    const configString = typeof logoConfig === 'object' ? JSON.stringify(logoConfig) : logoConfig;

    // Upsert QRCode DB relation
    const qrRecord = await prisma.qRCode.upsert({
      where: { lessonId: lesson.id },
      create: {
        lessonId: lesson.id,
        destinationUrl: lessonUrl,
        imageUrl: savedQrImageUrl,
        logoUrl: effectiveLogo,
        logoConfig: configString || null,
      },
      update: {
        destinationUrl: lessonUrl,
        imageUrl: savedQrImageUrl,
        logoUrl: effectiveLogo,
        logoConfig: configString || null,
      },
    });

    // Sync Lesson scalar fields for backward compatibility
    await prisma.lesson.update({
      where: { id: lesson.id },
      data: {
        qrCodeData: lessonUrl,
        qrCodeUrl: savedQrImageUrl,
        qrLogo: effectiveLogo,
        qrGeneratedAt: now,
      },
    });

    await createAuditLog(req.user!.userId, regenerate ? 'REGENERATE_LESSON_QR' : 'GENERATE_LESSON_QR', 'Lesson', lesson.id, {
      lessonTitle: lesson.title,
      lessonUrl,
      qrCodeUrl: savedQrImageUrl,
    });

    return res.json({
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      lessonSlug: lesson.slug,
      lessonNumber: lesson.lessonNumber,
      lessonUrl: qrRecord.destinationUrl,
      bookId: lesson.course.id,
      bookTitle: lesson.course.title,
      bookSlug: lesson.course.slug,
      qrLogo: qrRecord.logoUrl,
      qrCodeData: qrRecord.destinationUrl,
      qrCodeUrl: qrRecord.imageUrl,
      logoConfig: qrRecord.logoConfig,
      qrGeneratedAt: qrRecord.updatedAt,
      message: regenerate ? 'Lesson QR code regenerated successfully.' : 'Lesson QR code saved persistently.',
    });
  } catch (error) {
    console.error('Generate / Save Lesson QR error:', error);
    return res.status(500).json({ error: 'Failed to generate persistent lesson QR code.' });
  }
});

// ADMIN Bulk Generate Missing QR Codes for Lessons
router.post('/generate-missing-qr', authenticateToken, requireRole('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const lessonsWithoutQR = await prisma.lesson.findMany({
      where: {
        qrCode: null,
        qrCodeUrl: null,
      },
      include: {
        course: { select: { slug: true, companyName: true } },
      },
    });

    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol === 'https' || host.includes('vercel.app') ? 'https' : 'http';
    const baseUrl = process.env.VITE_APP_URL || `${protocol}://${host}`;

    let generatedCount = 0;

    for (const lesson of lessonsWithoutQR) {
      const companySlug = slugify(lesson.course.companyName || 'hopenix');
      const lessonUrl = `${baseUrl}/${companySlug}/books/${lesson.course.slug}/lessons/${lesson.lessonNumber}`;
      const qrData = await QRCode.toDataURL(lessonUrl, {
        width: 500,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: { dark: '#0f172a', light: '#ffffff' },
      });

      const base64Data = qrData.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const filename = `qr_lesson_${lesson.course.slug}_L${lesson.lessonNumber}_${Date.now()}.png`;
      const uploaded = await StorageService.uploadFile(buffer, filename, 'image/png');

      await prisma.qRCode.upsert({
        where: { lessonId: lesson.id },
        create: {
          lessonId: lesson.id,
          destinationUrl: lessonUrl,
          imageUrl: uploaded.url,
        },
        update: {
          destinationUrl: lessonUrl,
          imageUrl: uploaded.url,
        },
      });

      await prisma.lesson.update({
        where: { id: lesson.id },
        data: {
          qrCodeData: lessonUrl,
          qrCodeUrl: uploaded.url,
          qrGeneratedAt: new Date(),
        },
      });

      generatedCount++;
    }

    return res.json({
      message: `Successfully generated persistent QR codes for ${generatedCount} lesson(s).`,
      generatedCount,
    });
  } catch (error) {
    console.error('Bulk generate missing lesson QR error:', error);
    return res.status(500).json({ error: 'Failed to bulk generate missing lesson QR codes.' });
  }
});

// ADMIN Reset / Delete QR Code for Lesson
router.delete('/:id/qr', authenticateToken, requireRole('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: { qrCode: true },
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found.' });
    }

    const qrUrl = lesson.qrCode?.imageUrl || lesson.qrCodeUrl;
    if (qrUrl) {
      await StorageService.deleteFile(qrUrl);
    }

    if (lesson.qrCode) {
      await prisma.qRCode.delete({ where: { id: lesson.qrCode.id } });
    }

    await prisma.lesson.update({
      where: { id },
      data: {
        qrCodeData: null,
        qrCodeUrl: null,
        qrLogo: null,
        qrGeneratedAt: null,
      },
    });

    await createAuditLog(req.user!.userId, 'DELETE_LESSON_QR', 'Lesson', id, { title: lesson.title });
    return res.json({ message: 'Lesson QR code reset successfully.' });
  } catch (error) {
    console.error('Delete Lesson QR error:', error);
    return res.status(500).json({ error: 'Failed to delete lesson QR code.' });
  }
});

export default router;
