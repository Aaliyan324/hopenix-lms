import { Router, Response } from 'express';
import QRCode from 'qrcode';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';
import prisma from '../lib/prisma.js';
import { StorageService } from '../lib/storage.js';
import { formatBook } from '../lib/formatters.js';
import {
  authenticateToken,
  optionalAuthenticateToken,
  requireRole,
  AuthenticatedRequest,
} from '../middleware/auth.js';
import { createAuditLog } from '../lib/logger.js';

const router = Router();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB max for cover images

// Helper to generate clean slugs
const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Stream / Proxy book cover image securely
router.get('/:id/cover', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const book = await prisma.course.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!book || !book.coverImage) {
      return res.status(404).json({ error: 'Book cover not found.' });
    }

    const isPublicAccess = book.published;
    if (!isPublicAccess) {
      const user = req.user;
      if (!user || (user.role !== 'ADMIN' && user.role !== 'EDITOR')) {
        return res.status(403).json({ error: 'This book cover belongs to an unpublished book.' });
      }
    }

    if (book.coverImage.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), book.coverImage.replace(/^\//, ''));
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Local cover file not found.' });
      }
      res.setHeader('Content-Type', 'image/jpeg');
      return res.sendFile(filePath);
    }

    const blobRes = await StorageService.fetchBlobResource(book.coverImage, req.headers.range as string | undefined);
    if (!blobRes.ok && blobRes.status !== 206) {
      return res.status(blobRes.status).json({ error: 'Failed to stream cover image.' });
    }

    res.status(blobRes.status);
    res.setHeader('Content-Type', blobRes.headers.get('content-type') || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    if (blobRes.body) {
      // @ts-ignore
      Readable.fromWeb(blobRes.body as any).pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    console.error('Book cover streaming error:', error);
    return res.status(500).json({ error: 'Internal error streaming book cover.' });
  }
});

// 0. ADMIN — Upload cover image from local file system
router.post(
  '/upload-cover',
  authenticateToken,
  requireRole('ADMIN'),
  upload.single('cover'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'No file provided.' });
      }

      if (!file.mimetype.startsWith('image/')) {
        return res.status(400).json({ error: 'Only image files are allowed for book covers.' });
      }

      if (file.size > 10 * 1024 * 1024) {
        return res.status(400).json({ error: 'Cover image must be under 10MB.' });
      }

      const result = await StorageService.uploadFile(file.buffer, file.originalname, file.mimetype);

      return res.json({ url: result.url, name: result.name });
    } catch (error: any) {
      console.error('Cover upload error:', error);
      return res.status(500).json({ error: error.message || 'Cover image upload failed.' });
    }
  }
);

// 1. PUBLIC List books
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

          return formatBook({
            ...book,
            isBookmarked: bookmarkedBookIds.has(book.id),
            progressPercent,
            completedLessons: completedCount,
            totalLessons,
          });
        })
      );

      return res.json({ books: booksWithPersonalization });
    }

    // Unauthenticated / Guest response
    const formattedBooks = books.map((book) =>
      formatBook({
        ...book,
        isBookmarked: false,
        totalLessons: book._count.lessons,
      })
    );

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

    const formattedBook = formatBook({
      ...book,
      isBookmarked,
      lessons: lessonsWithProgress,
      completedLessons: completedCount,
      totalLessons,
      progressPercent,
    });

    return res.json({
      book: formattedBook,
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
      companyName,
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
        companyName: companyName || null,
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
      companyName,
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
    if (companyName !== undefined) updateData.companyName = companyName;

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

// 0. ADMIN — Upload QR Logo to persistent storage
router.post(
  '/upload-qr-logo',
  authenticateToken,
  requireRole('ADMIN'),
  upload.single('logo'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'No logo file provided.' });
      }

      if (!file.mimetype.startsWith('image/')) {
        return res.status(400).json({ error: 'Only image files are allowed for QR logos.' });
      }

      if (file.size > 5 * 1024 * 1024) {
        return res.status(400).json({ error: 'Logo image must be under 5MB.' });
      }

      const result = await StorageService.uploadFile(file.buffer, `qr_logo_${Date.now()}_${file.originalname}`, file.mimetype);
      return res.json({ url: result.url, name: result.name });
    } catch (error: any) {
      console.error('QR logo upload error:', error);
      return res.status(500).json({ error: error.message || 'QR logo upload failed.' });
    }
  }
);

// 6. PUBLIC Fetch Persisted QR Code for Book (Does NOT auto-generate)
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

    return res.json({
      bookId: book.id,
      bookTitle: book.title,
      bookSlug: book.slug,
      bookUrl: book.qrCodeData || bookUrl,
      qrLogo: book.qrLogo || null,
      qrCodeData: book.qrCodeData || null,
      qrCodeUrl: book.qrCodeUrl || null,
      qrGeneratedAt: book.qrGeneratedAt || null,
      hasPersistedQR: Boolean(book.qrCodeUrl),
    });
  } catch (error) {
    console.error('Fetch Book QR error:', error);
    return res.status(500).json({ error: 'Failed to fetch book QR code.' });
  }
});

// ADMIN Generate or Regenerate QR Code for Book (Strict ADMIN authorization)
router.post('/:id/qr', authenticateToken, requireRole('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { logoUrl, qrDataUrl, regenerate } = req.body;

    const book = await prisma.course.findUnique({ where: { id } });
    if (!book) {
      return res.status(404).json({ error: 'Book not found.' });
    }

    // If QR already exists and admin did not explicitly request regeneration, return saved QR
    if (book.qrCodeUrl && !regenerate) {
      return res.json({
        bookId: book.id,
        bookTitle: book.title,
        bookSlug: book.slug,
        bookUrl: book.qrCodeData || `${process.env.VITE_APP_URL || 'http://localhost:3000'}/books/${book.slug}`,
        qrLogo: book.qrLogo || null,
        qrCodeData: book.qrCodeData || null,
        qrCodeUrl: book.qrCodeUrl,
        qrGeneratedAt: book.qrGeneratedAt,
        message: 'Loaded existing persistent QR code.',
      });
    }

    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol === 'https' || host.includes('vercel.app') ? 'https' : 'http';
    const baseUrl = process.env.VITE_APP_URL || `${protocol}://${host}`;
    const bookUrl = `${baseUrl}/books/${book.slug}`;

    let savedQrImageUrl = book.qrCodeUrl;

    // Convert dataUrl (PNG) to buffer & save to storage if provided
    if (qrDataUrl && qrDataUrl.startsWith('data:image/')) {
      const base64Data = qrDataUrl.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const filename = `qr_book_${book.slug}_${Date.now()}.png`;
      const uploaded = await StorageService.uploadFile(buffer, filename, 'image/png');
      savedQrImageUrl = uploaded.url;
    } else if (!savedQrImageUrl || regenerate) {
      // Fallback server-side QR generation
      const qrData = await QRCode.toDataURL(bookUrl, {
        width: 500,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: { dark: '#0f172a', light: '#ffffff' },
      });
      const base64Data = qrData.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const filename = `qr_book_${book.slug}_${Date.now()}.png`;
      const uploaded = await StorageService.uploadFile(buffer, filename, 'image/png');
      savedQrImageUrl = uploaded.url;
    }

    const now = new Date();
    const updatedBook = await prisma.course.update({
      where: { id: book.id },
      data: {
        qrCodeData: bookUrl,
        qrCodeUrl: savedQrImageUrl,
        qrLogo: logoUrl !== undefined ? logoUrl : book.qrLogo,
        qrGeneratedAt: now,
      },
    });

    await createAuditLog(req.user!.userId, regenerate ? 'REGENERATE_BOOK_QR' : 'GENERATE_BOOK_QR', 'Book', book.id, {
      bookTitle: book.title,
      bookUrl,
      qrCodeUrl: savedQrImageUrl,
    });

    return res.json({
      bookId: updatedBook.id,
      bookTitle: updatedBook.title,
      bookSlug: updatedBook.slug,
      bookUrl: updatedBook.qrCodeData,
      qrLogo: updatedBook.qrLogo,
      qrCodeData: updatedBook.qrCodeData,
      qrCodeUrl: updatedBook.qrCodeUrl,
      qrGeneratedAt: updatedBook.qrGeneratedAt,
      message: regenerate ? 'QR code regenerated successfully.' : 'QR code saved persistently.',
    });
  } catch (error) {
    console.error('Generate / Save Book QR error:', error);
    return res.status(500).json({ error: 'Failed to generate persistent QR code.' });
  }
});

// ADMIN Bulk Generate Missing QR Codes for Books
router.post('/generate-missing-qr', authenticateToken, requireRole('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const booksWithoutQR = await prisma.course.findMany({
      where: { qrCodeUrl: null },
    });

    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol === 'https' || host.includes('vercel.app') ? 'https' : 'http';
    const baseUrl = process.env.VITE_APP_URL || `${protocol}://${host}`;

    let generatedCount = 0;

    for (const book of booksWithoutQR) {
      const bookUrl = `${baseUrl}/books/${book.slug}`;
      const qrData = await QRCode.toDataURL(bookUrl, {
        width: 500,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: { dark: '#0f172a', light: '#ffffff' },
      });

      const base64Data = qrData.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const filename = `qr_book_${book.slug}_${Date.now()}.png`;
      const uploaded = await StorageService.uploadFile(buffer, filename, 'image/png');

      await prisma.course.update({
        where: { id: book.id },
        data: {
          qrCodeData: bookUrl,
          qrCodeUrl: uploaded.url,
          qrGeneratedAt: new Date(),
        },
      });

      generatedCount++;
    }

    return res.json({
      message: `Successfully generated persistent QR codes for ${generatedCount} book(s).`,
      generatedCount,
    });
  } catch (error) {
    console.error('Bulk generate missing book QR error:', error);
    return res.status(500).json({ error: 'Failed to bulk generate missing QR codes.' });
  }
});

// ADMIN Reset / Delete QR Code for Book
router.delete('/:id/qr', authenticateToken, requireRole('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const book = await prisma.course.findUnique({ where: { id } });
    if (!book) {
      return res.status(404).json({ error: 'Book not found.' });
    }

    if (book.qrCodeUrl) {
      await StorageService.deleteFile(book.qrCodeUrl);
    }

    await prisma.course.update({
      where: { id },
      data: {
        qrCodeData: null,
        qrCodeUrl: null,
        qrLogo: null,
        qrGeneratedAt: null,
      },
    });

    await createAuditLog(req.user!.userId, 'DELETE_BOOK_QR', 'Book', id, { title: book.title });
    return res.json({ message: 'Book QR code reset successfully.' });
  } catch (error) {
    console.error('Delete Book QR error:', error);
    return res.status(500).json({ error: 'Failed to delete book QR code.' });
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
