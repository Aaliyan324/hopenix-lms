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
  requireEditorBookPermission,
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

// Stream / Proxy any storage asset (private Vercel Blob or local uploads) with CORS support
router.get('/proxy-asset', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rawUrl = req.query.url as string;
    if (!rawUrl) {
      return res.status(400).json({ error: 'URL parameter is required.' });
    }

    const fileUrl = decodeURIComponent(rawUrl);

    if (fileUrl.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), fileUrl.replace(/^\//, ''));
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Local file not found.' });
      }
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return res.sendFile(filePath);
    }

    const blobRes = await StorageService.fetchBlobResource(fileUrl, req.headers.range as string | undefined);
    if (!blobRes.ok && blobRes.status !== 206) {
      return res.status(blobRes.status).json({ error: 'Failed to fetch asset from storage.' });
    }

    res.status(blobRes.status);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', blobRes.headers.get('content-type') || 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    if (blobRes.body) {
      // @ts-ignore
      Readable.fromWeb(blobRes.body as any).pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    console.error('Proxy asset streaming error:', error);
    return res.status(500).json({ error: 'Failed to proxy storage asset.' });
  }
});

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

// 1. AUTHENTICATED List books (Scoped strictly by role)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const search = (req.query.search as string) || '';
    const category = (req.query.category as string) || '';
    const readingLevel = (req.query.readingLevel as string) || '';
    const featured = req.query.featured === 'true';

    const user = req.user!;
    const role = user.role;
    const userId = user.userId;

    const where: any = {};

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

    // Role-specific scoping
    if (role === 'EDITOR') {
      // Editor ONLY sees books assigned to them via BookEditorPermission or LessonEditorPermission
      const [bookPermissions, lessonPermissions] = await Promise.all([
        prisma.bookEditorPermission.findMany({
          where: { userId },
          select: { bookId: true },
        }),
        prisma.lessonEditorPermission.findMany({
          where: { userId },
          select: { lesson: { select: { courseId: true } } },
        }),
      ]);

      const assignedBookIds = new Set<string>();
      bookPermissions.forEach((bp) => assignedBookIds.add(bp.bookId));
      lessonPermissions.forEach((lp) => assignedBookIds.add(lp.lesson.courseId));

      where.id = { in: Array.from(assignedBookIds) };
    }

    const books = await prisma.course.findMany({
      where,
      include: {
        classGrade: true,
        subject: true,
        qrCode: true,
        _count: {
          select: {
            lessons: true,
          },
        },
      },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    });

    // Admin / Editor formatted response
    const formattedBooks = books.map((book) =>
      formatBook({
        ...book,
        qrCodeUrl: book.qrCode?.imageUrl || book.qrCodeUrl,
        qrCodeData: book.qrCode?.destinationUrl || book.qrCodeData,
        qrLogo: book.qrCode?.logoUrl || book.qrLogo,
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

// 2. PUBLIC / AUTH Get book detail by ID or Slug (Direct QR access)
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
        classGrade: true,
        subject: true,
        qrCode: true,
        lessons: {
          // Public and editors see only published lessons; admins see all
          where: role === 'ADMIN' ? undefined : { published: true },
          orderBy: [{ lessonNumber: 'asc' }, { order: 'asc' }],
          include: {
            qrCode: true,
            media: true,
          },
        },
        _count: {
          select: {
            lessons: true,
          },
        },
      },
    });

    if (!book) {
      return res.status(404).json({ error: 'Book not found.' });
    }

    // Check Editor access: must be assigned to book
    if (role === 'EDITOR') {
      const [bookPermission, lessonPermission] = await Promise.all([
        prisma.bookEditorPermission.findUnique({
          where: { bookId_userId: { bookId: book.id, userId: userId! } },
        }),
        prisma.lessonEditorPermission.findFirst({
          where: { userId: userId!, lesson: { courseId: book.id } },
        }),
      ]);

      if (!bookPermission && !lessonPermission) {
        return res.status(403).json({ error: 'Access Denied: You are not assigned to view or edit this book.' });
      }
    }

    // Check public / guest access: must be published
    if (!role && !book.published) {
      return res.status(403).json({ error: 'This digital book is currently unpublished.' });
    }

    const lessonsWithQr = book.lessons.map((l) => ({
      ...l,
      qrCodeUrl: l.qrCode?.imageUrl || l.qrCodeUrl,
      qrCodeData: l.qrCode?.destinationUrl || l.qrCodeData,
      qrLogo: l.qrCode?.logoUrl || l.qrLogo,
    }));

    const totalLessons = lessonsWithQr.length;

    const formattedBook = formatBook({
      ...book,
      qrCodeUrl: book.qrCode?.imageUrl || book.qrCodeUrl,
      qrCodeData: book.qrCode?.destinationUrl || book.qrCodeData,
      qrLogo: book.qrCode?.logoUrl || book.qrLogo,
      lessons: lessonsWithQr,
      totalLessons,
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
      classGradeId,
      subjectId,
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

    let finalReadingLevel = readingLevel || 'Beginner';
    if (classGradeId) {
      const cg = await prisma.classGrade.findUnique({ where: { id: classGradeId } });
      if (cg) finalReadingLevel = cg.name;
    }

    let finalCategory = category || 'General';
    if (subjectId) {
      const sb = await prisma.subject.findUnique({ where: { id: subjectId } });
      if (sb) finalCategory = sb.name;
    }

    const book = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        shortDescription: shortDescription || null,
        author: author || 'Hopenix Editorial',
        category: finalCategory,
        publicationYear: publicationYear ? parseInt(publicationYear, 10) : new Date().getFullYear(),
        isbn: isbn || null,
        language: language || 'English',
        readingLevel: finalReadingLevel,
        classGradeId: classGradeId || null,
        subjectId: subjectId || null,
        coverImage: coverImage || thumbnail || null,
        thumbnail: thumbnail || coverImage || null,
        featured: Boolean(featured),
        published: Boolean(published),
        qrLogo: qrLogo || null,
        readingTime: readingTime || null,
        companyName: companyName || null,
      },
      include: {
        classGrade: true,
        subject: true,
      },
    });

    await createAuditLog(req.user!.userId, 'CREATE_BOOK', 'Book', book.id, { title: book.title, slug });

    return res.status(201).json({ book });
  } catch (error) {
    console.error('Create book error:', error);
    return res.status(500).json({ error: 'Failed to create book.' });
  }
});

// 4. ADMIN / ASSIGNED EDITOR Update Book
router.patch('/:id', authenticateToken, requireEditorBookPermission, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.user!;

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
      classGradeId,
      subjectId,
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
    if (classGradeId !== undefined) {
      updateData.classGradeId = classGradeId || null;
      if (classGradeId) {
        const cg = await prisma.classGrade.findUnique({ where: { id: classGradeId } });
        if (cg) updateData.readingLevel = cg.name;
      }
    }
    if (subjectId !== undefined) {
      updateData.subjectId = subjectId || null;
      if (subjectId) {
        const sb = await prisma.subject.findUnique({ where: { id: subjectId } });
        if (sb) updateData.category = sb.name;
      }
    }
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    
    // Editors cannot change publication or featured status unless Admin
    if (role === 'ADMIN') {
      if (typeof featured === 'boolean') updateData.featured = featured;
      if (typeof published === 'boolean') updateData.published = published;
    }
    
    if (newSlug) updateData.slug = slugify(newSlug);
    if (qrLogo !== undefined && role === 'ADMIN') updateData.qrLogo = qrLogo;
    if (readingTime !== undefined) updateData.readingTime = readingTime;
    if (companyName !== undefined) updateData.companyName = companyName;

    const updatedBook = await prisma.course.update({
      where: { id },
      data: updateData,
      include: {
        classGrade: true,
        subject: true,
      },
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
      include: { qrCode: true },
    });

    if (!book) {
      return res.status(404).json({ error: 'Book not found.' });
    }

    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol === 'https' || host.includes('vercel.app') ? 'https' : 'http';
    const baseUrl = process.env.VITE_APP_URL || `${protocol}://${host}`;
    const companySlug = slugify(book.companyName || 'hopenix');
    const bookUrl = `${baseUrl}/${companySlug}/books/${book.slug}`;

    const persistentQr = book.qrCode;

    return res.json({
      bookId: book.id,
      bookTitle: book.title,
      bookSlug: book.slug,
      bookUrl: persistentQr?.destinationUrl || book.qrCodeData || bookUrl,
      qrLogo: persistentQr?.logoUrl || book.qrLogo || null,
      qrCodeData: persistentQr?.destinationUrl || book.qrCodeData || null,
      qrCodeUrl: persistentQr?.imageUrl || book.qrCodeUrl || null,
      logoConfig: persistentQr?.logoConfig || null,
      qrGeneratedAt: persistentQr?.updatedAt || book.qrGeneratedAt || null,
      hasPersistedQR: Boolean(persistentQr?.imageUrl || book.qrCodeUrl),
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
    const { logoUrl, logoConfig, qrDataUrl, regenerate } = req.body;

    const book = await prisma.course.findUnique({
      where: { id },
      include: { qrCode: true },
    });

    if (!book) {
      return res.status(404).json({ error: 'Book not found.' });
    }

    // If QR already exists in QRCode model and admin did not explicitly request regeneration, return saved QR
    if (book.qrCode?.imageUrl && !regenerate) {
      return res.json({
        bookId: book.id,
        bookTitle: book.title,
        bookSlug: book.slug,
        bookUrl: book.qrCode.destinationUrl,
        qrLogo: book.qrCode.logoUrl || null,
        qrCodeData: book.qrCode.destinationUrl,
        qrCodeUrl: book.qrCode.imageUrl,
        logoConfig: book.qrCode.logoConfig || null,
        qrGeneratedAt: book.qrCode.updatedAt,
        message: 'Loaded existing persistent QR code.',
      });
    }

    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol === 'https' || host.includes('vercel.app') ? 'https' : 'http';
    const baseUrl = process.env.VITE_APP_URL || `${protocol}://${host}`;
    const companySlug = slugify(book.companyName || 'hopenix');
    const bookUrl = `${baseUrl}/${companySlug}/books/${book.slug}`;

    let savedQrImageUrl = book.qrCode?.imageUrl || book.qrCodeUrl;

    // Convert dataUrl (PNG) to buffer & save to persistent storage if provided
    if (qrDataUrl && qrDataUrl.startsWith('data:image/')) {
      const base64Data = qrDataUrl.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const filename = `qr_book_${book.slug}_${Date.now()}.png`;
      const uploaded = await StorageService.uploadFile(buffer, filename, 'image/png');
      savedQrImageUrl = uploaded.url;
    } else if (!savedQrImageUrl || regenerate) {
      // Server-side fallback QR generation
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
    const effectiveLogo = logoUrl !== undefined ? logoUrl : (book.qrCode?.logoUrl || book.qrLogo);
    const configString = typeof logoConfig === 'object' ? JSON.stringify(logoConfig) : logoConfig;

    // Upsert QRCode DB relation
    const qrRecord = await prisma.qRCode.upsert({
      where: { bookId: book.id },
      create: {
        bookId: book.id,
        destinationUrl: bookUrl,
        imageUrl: savedQrImageUrl,
        logoUrl: effectiveLogo,
        logoConfig: configString || null,
      },
      update: {
        destinationUrl: bookUrl,
        imageUrl: savedQrImageUrl,
        logoUrl: effectiveLogo,
        logoConfig: configString || null,
      },
    });

    // Sync Course scalar fields for backward compatibility
    await prisma.course.update({
      where: { id: book.id },
      data: {
        qrCodeData: bookUrl,
        qrCodeUrl: savedQrImageUrl,
        qrLogo: effectiveLogo,
        qrGeneratedAt: now,
      },
    });

    await createAuditLog(req.user!.userId, regenerate ? 'REGENERATE_BOOK_QR' : 'GENERATE_BOOK_QR', 'Book', book.id, {
      bookTitle: book.title,
      bookUrl,
      qrCodeUrl: savedQrImageUrl,
    });

    return res.json({
      bookId: book.id,
      bookTitle: book.title,
      bookSlug: book.slug,
      bookUrl: qrRecord.destinationUrl,
      qrLogo: qrRecord.logoUrl,
      qrCodeData: qrRecord.destinationUrl,
      qrCodeUrl: qrRecord.imageUrl,
      logoConfig: qrRecord.logoConfig,
      qrGeneratedAt: qrRecord.updatedAt,
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
      where: {
        qrCode: null,
        qrCodeUrl: null,
      },
    });

    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol === 'https' || host.includes('vercel.app') ? 'https' : 'http';
    const baseUrl = process.env.VITE_APP_URL || `${protocol}://${host}`;

    let generatedCount = 0;

    for (const book of booksWithoutQR) {
      const companySlug = slugify(book.companyName || 'hopenix');
      const bookUrl = `${baseUrl}/${companySlug}/books/${book.slug}`;
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

      await prisma.qRCode.upsert({
        where: { bookId: book.id },
        create: {
          bookId: book.id,
          destinationUrl: bookUrl,
          imageUrl: uploaded.url,
        },
        update: {
          destinationUrl: bookUrl,
          imageUrl: uploaded.url,
        },
      });

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
    const book = await prisma.course.findUnique({
      where: { id },
      include: { qrCode: true },
    });

    if (!book) {
      return res.status(404).json({ error: 'Book not found.' });
    }

    const qrUrl = book.qrCode?.imageUrl || book.qrCodeUrl;
    if (qrUrl) {
      await StorageService.deleteFile(qrUrl);
    }

    if (book.qrCode) {
      await prisma.qRCode.delete({ where: { id: book.qrCode.id } });
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

// ADMIN Editor Book Assignment Management
router.get('/:id/editors', authenticateToken, requireRole('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const permissions = await prisma.bookEditorPermission.findMany({
      where: { bookId: id },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });
    return res.json({ editors: permissions.map((p) => p.user) });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch book editors.' });
  }
});

router.post('/:id/editors', authenticateToken, requireRole('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { editorIds } = req.body;

    if (!Array.isArray(editorIds)) {
      return res.status(400).json({ error: 'editorIds must be an array.' });
    }

    await prisma.bookEditorPermission.deleteMany({ where: { bookId: id } });

    if (editorIds.length > 0) {
      await prisma.bookEditorPermission.createMany({
        data: editorIds.map((userId: string) => ({
          bookId: id,
          userId,
        })),
      });
    }

    await createAuditLog(req.user!.userId, 'ASSIGN_BOOK_EDITORS', 'Book', id, { editorCount: editorIds.length });

    return res.json({ message: 'Book editor permissions updated successfully.' });
  } catch (error) {
    console.error('Assign book editors error:', error);
    return res.status(500).json({ error: 'Failed to update book editor permissions.' });
  }
});

export default router;
