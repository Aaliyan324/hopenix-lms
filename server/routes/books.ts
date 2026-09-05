import { Router, Response } from 'express';
import QRCode from 'qrcode';
import prisma from '../lib/prisma.js';
import {
  authenticateToken,
  optionalAuthenticateToken,
  requireRole,
  AuthenticatedRequest,
} from '../middleware/auth.js';
import { createAuditLog } from '../lib/logger.js';

const router = Router();

// Helper to generate clean slugs
const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

// 1. PUBLIC List books with search, filters & optional student bookmark/progress tracking
router.get('/', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const search = (req.query.search as string) || '';
    const category = (req.query.category as string) || '';
    const readingLevel = (req.query.readingLevel as string) || '';
    const featured = req.query.featured === 'true';

    const user = req.user;
    const role = user?.role;
    const userId = user?.userId;

    const where: any = {};

    // Guest and Students only see published books
    if (!role || role === 'STUDENT') {
      where.published = true;
    }

    if (featured) {
      where.featured = true;
    }

    if (category) {
      where.category = { equals: category, mode: 'insensitive' };
    }

    if (readingLevel) {
      where.readingLevel = { equals: readingLevel, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    const books = await prisma.course.findMany({
      where,
      include: {
        _count: {
          select: {
            lessons: true,
            courseAccess: true,
          },
        },
      },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    });

    // If logged-in student, compute progress and bookmark state
    if (userId) {
      const [userProgress, userBookmarks] = await Promise.all([
        prisma.lessonProgress.findMany({
          where: { userId, completed: true },
          select: { lessonId: true },
        }),
        prisma.bookBookmark.findMany({
          where: { userId },
          select: { bookId: true },
        }),
      ]);

      const completedLessonIds = new Set(userProgress.map((p) => p.lessonId));
      const bookmarkedBookIds = new Set(userBookmarks.map((b) => b.bookId));

      const booksWithPersonalization = await Promise.all(
        books.map(async (book) => {
          const lessons = await prisma.lesson.findMany({
            where: { courseId: book.id, published: true },
            select: { id: true },
          });

          const totalLessons = lessons.length;
          const completedCount = lessons.filter((l) => completedLessonIds.has(l.id)).length;
          const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

          return {
            ...book,
            isBookmarked: bookmarkedBookIds.has(book.id),
            progressPercent,
            completedLessons: completedCount,
            totalLessons,
          };
        })
      );

      return res.json({ books: booksWithPersonalization });
    }

    // Unauthenticated / Guest response
    const formattedBooks = books.map((book) => ({
      ...book,
      isBookmarked: false,
      totalLessons: book._count.lessons,
    }));

    return res.json({ books: formattedBooks });
  } catch (error) {
    console.error('Fetch books error:', error);
    return res.status(500).json({ error: 'Failed to fetch digital books.' });
  }
});

// 2. PUBLIC Get book detail by ID or Slug
router.get('/:idOrSlug', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { idOrSlug } = req.params;
    const user = req.user;
    const role = user?.role;
    const userId = user?.userId;

    const book = await prisma.course.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        lessons: {
          where: (!role || role === 'STUDENT') ? { published: true } : undefined,
          orderBy: [{ lessonNumber: 'asc' }, { order: 'asc' }],
          include: {
            media: true,
            permissions: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
        },
        _count: {
          select: {
            courseAccess: true,
            bookmarks: true,
          },
        },
      },
    });

    if (!book) {
      return res.status(404).json({ error: 'Book not found.' });
    }

    // If guest or student visits an unpublished book, deny access
    if ((!role || role === 'STUDENT') && !book.published) {
      return res.status(403).json({ error: 'This digital book is currently unpublished.' });
    }

    let isBookmarked = false;
    let lessonsWithProgress = book.lessons.map((l) => ({ ...l, completed: false, isBookmarked: false }));

    if (userId) {
      const [bookmark, userProgress, lessonBookmarks] = await Promise.all([
        prisma.bookBookmark.findUnique({
          where: { userId_bookId: { userId, bookId: book.id } },
        }),
        prisma.lessonProgress.findMany({
          where: { userId },
        }),
        prisma.lessonBookmark.findMany({
          where: { userId },
          select: { lessonId: true },
        }),
      ]);

      isBookmarked = Boolean(bookmark);
      const completedSet = new Set(userProgress.filter((p) => p.completed).map((p) => p.lessonId));
      const bookmarkedLessonIds = new Set(lessonBookmarks.map((b) => b.lessonId));

      lessonsWithProgress = book.lessons.map((lesson) => ({
        ...lesson,
        completed: completedSet.has(lesson.id),
        isBookmarked: bookmarkedLessonIds.has(lesson.id),
      }));
    }

    const completedCount = lessonsWithProgress.filter((l) => l.completed).length;
    const totalLessons = lessonsWithProgress.length;
    const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    return res.json({
      book: {
        ...book,
        isBookmarked,
        lessons: lessonsWithProgress,
        completedLessons: completedCount,
        totalLessons,
        progressPercent,
      },
    });
  } catch (error) {
    console.error('Fetch book detail error:', error);
    return res.status(500).json({ error: 'Failed to fetch book details.' });
  }
});

// 3. ADMIN Create Book
router.post('/', authenticateToken, requireRole('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      title,
      description,
      shortDescription,
      author,
      category,
      publicationYear,
      isbn,
      language,
      readingLevel,
      coverImage,
      thumbnail,
      featured,
      published,
      slug: customSlug,
      qrLogo,
      readingTime,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Book title and description are required.' });
    }

    let slug = customSlug ? slugify(customSlug) : slugify(title);

    const existing = await prisma.course.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const book = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        shortDescription: shortDescription || null,
        author: author || 'Hopenix Editorial',
        category: category || 'General',
        publicationYear: publicationYear ? parseInt(publicationYear, 10) : new Date().getFullYear(),
        isbn: isbn || null,
        language: language || 'English',
        readingLevel: readingLevel || 'Beginner',
        coverImage: coverImage || thumbnail || null,
        thumbnail: thumbnail || coverImage || null,
        featured: Boolean(featured),
        published: Boolean(published),
        qrLogo: qrLogo || null,
        readingTime: readingTime || null,
      },
    });

    await createAuditLog(req.user!.userId, 'CREATE_BOOK', 'Book', book.id, { title: book.title, slug });

    return res.status(201).json({ book });
  } catch (error) {
    console.error('Create book error:', error);
    return res.status(500).json({ error: 'Failed to create book.' });
  }
});

// 4. ADMIN / EDITOR Update Book
router.patch('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.user!;

    if (role !== 'ADMIN' && role !== 'EDITOR') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const book = await prisma.course.findUnique({ where: { id } });
    if (!book) {
      return res.status(404).json({ error: 'Book not found.' });
    }

    const {
      title,
      description,
      shortDescription,
      author,
      category,
      publicationYear,
      isbn,
      language,
      readingLevel,
      coverImage,
      thumbnail,
      featured,
      published,
      slug: newSlug,
      qrLogo,
      readingTime,
    } = req.body;

    const updateData: any = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (shortDescription !== undefined) updateData.shortDescription = shortDescription;
    if (author !== undefined) updateData.author = author;
    if (category !== undefined) updateData.category = category;
    if (publicationYear !== undefined) updateData.publicationYear = publicationYear ? parseInt(publicationYear, 10) : null;
    if (isbn !== undefined) updateData.isbn = isbn;
    if (language !== undefined) updateData.language = language;
    if (readingLevel !== undefined) updateData.readingLevel = readingLevel;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (typeof featured === 'boolean') updateData.featured = featured;
    if (typeof published === 'boolean') updateData.published = published;
    if (newSlug) updateData.slug = slugify(newSlug);
    if (qrLogo !== undefined) updateData.qrLogo = qrLogo;
    if (readingTime !== undefined) updateData.readingTime = readingTime;

    const updatedBook = await prisma.course.update({
      where: { id },
      data: updateData,
    });

    await createAuditLog(req.user!.userId, 'UPDATE_BOOK', 'Book', id, updateData);

    return res.json({ book: updatedBook });
  } catch (error) {
    console.error('Update book error:', error);
    return res.status(500).json({ error: 'Failed to update book.' });
  }
});

// 5. ADMIN Delete Book
router.delete('/:id', authenticateToken, requireRole('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const book = await prisma.course.findUnique({ where: { id } });
    if (!book) {
      return res.status(404).json({ error: 'Book not found.' });
    }

    await prisma.course.delete({ where: { id } });
    await createAuditLog(req.user!.userId, 'DELETE_BOOK', 'Book', id, { title: book.title });

    return res.json({ message: 'Book deleted successfully.' });
  } catch (error) {
    console.error('Delete book error:', error);
    return res.status(500).json({ error: 'Failed to delete book.' });
  }
});

// 6. PUBLIC Generate / Fetch QR Code for Book with Logo support
router.get('/:idOrSlug/qr', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { idOrSlug } = req.params;
    const book = await prisma.course.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    });

    if (!book) {
      return res.status(404).json({ error: 'Book not found.' });
    }

    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol === 'https' || host.includes('vercel.app') ? 'https' : 'http';
    const baseUrl = process.env.VITE_APP_URL || `${protocol}://${host}`;
    const bookUrl = `${baseUrl}/books/${book.slug}`;

    const qrDataUrl = await QRCode.toDataURL(bookUrl, {
      width: 500,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });

    const svgData = await QRCode.toString(bookUrl, {
      type: 'svg',
      margin: 2,
      errorCorrectionLevel: 'H',
    });

    return res.json({
      bookId: book.id,
      bookTitle: book.title,
      bookSlug: book.slug,
      bookUrl,
      qrLogo: book.qrLogo || null,
      qrDataUrl,
      svgData,
    });
  } catch (error) {
    console.error('QR Generation error:', error);
    return res.status(500).json({ error: 'Failed to generate QR code.' });
  }
});

// 7. ADMIN Access permissions for student assignment
router.get('/:id/access', authenticateToken, requireRole('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const accessList = await prisma.courseAccess.findMany({
      where: { courseId: id },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true, avatar: true },
        },
      },
    });
    return res.json({ accessList });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch book access.' });
  }
});

router.post('/:id/access', authenticateToken, requireRole('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { userIds } = req.body;

    if (!Array.isArray(userIds)) {
      return res.status(400).json({ error: 'userIds must be an array.' });
    }

    await prisma.courseAccess.deleteMany({ where: { courseId: id } });

    if (userIds.length > 0) {
      await prisma.courseAccess.createMany({
        data: userIds.map((userId: string) => ({
          courseId: id,
          userId,
        })),
      });
    }

    await createAuditLog(req.user!.userId, 'UPDATE_BOOK_ACCESS', 'Book', id, { assignedCount: userIds.length });

    return res.json({ message: 'Book student access updated successfully.' });
  } catch (error) {
    console.error('Update book access error:', error);
    return res.status(500).json({ error: 'Failed to update book access.' });
  }
});

export default router;
