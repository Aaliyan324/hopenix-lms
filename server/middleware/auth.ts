import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../lib/auth.js';
import prisma from '../lib/prisma.js';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token = req.cookies?.auth_token;

  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Session expired or invalid token. Please log in again.' });
  }

  req.user = payload;
  next();
};

export const optionalAuthenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token = req.cookies?.auth_token;

  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      req.user = payload;
    }
  }

  next();
};

export const requireRole = (...allowedRoles: Array<'ADMIN' | 'EDITOR' | 'STUDENT'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient privileges.' });
    }

    next();
  };
};

export const requireLessonEditPermission = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    // Admins have global permission
    if (req.user.role === 'ADMIN') {
      return next();
    }

    if (req.user.role !== 'EDITOR') {
      return res.status(403).json({ error: 'Forbidden: Only Editors and Admins can edit lessons.' });
    }

    const lessonId = req.params.id || req.params.lessonId || req.body.lessonId;
    if (!lessonId) {
      return res.status(400).json({ error: 'Lesson ID is required for authorization check.' });
    }

    const lesson = await prisma.lesson.findFirst({
      where: { OR: [{ id: lessonId }, { slug: lessonId }] },
      select: { id: true, courseId: true },
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found.' });
    }

    // Check specific lesson permission OR parent book editor permission
    const [lessonPermission, bookPermission] = await Promise.all([
      prisma.lessonEditorPermission.findUnique({
        where: {
          lessonId_userId: {
            lessonId: lesson.id,
            userId: req.user.userId,
          },
        },
      }),
      prisma.bookEditorPermission.findUnique({
        where: {
          bookId_userId: {
            bookId: lesson.courseId,
            userId: req.user.userId,
          },
        },
      }),
    ]);

    if (!lessonPermission && !bookPermission) {
      return res.status(403).json({
        error: 'Access Denied: You do not have permission to edit this specific lesson.',
      });
    }

    next();
  } catch (error) {
    console.error('Lesson edit permission check error:', error);
    res.status(500).json({ error: 'Internal server error during authorization check.' });
  }
};

export const requireEditorBookPermission = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (req.user.role === 'ADMIN') {
      return next();
    }

    if (req.user.role !== 'EDITOR') {
      return res.status(403).json({ error: 'Forbidden: Only Editors and Admins can perform this action.' });
    }

    const bookId = req.params.id || req.params.bookId || req.body.bookId;
    if (!bookId) {
      return res.status(400).json({ error: 'Book ID is required for authorization check.' });
    }

    const book = await prisma.course.findFirst({
      where: { OR: [{ id: bookId }, { slug: bookId }] },
      select: { id: true },
    });

    if (!book) {
      return res.status(404).json({ error: 'Book not found.' });
    }

    // Check direct book permission or lesson permission within the book
    const [bookPermission, lessonPermission] = await Promise.all([
      prisma.bookEditorPermission.findUnique({
        where: {
          bookId_userId: {
            bookId: book.id,
            userId: req.user.userId,
          },
        },
      }),
      prisma.lessonEditorPermission.findFirst({
        where: {
          userId: req.user.userId,
          lesson: { courseId: book.id },
        },
      }),
    ]);

    if (!bookPermission && !lessonPermission) {
      return res.status(403).json({
        error: 'Access Denied: You are not assigned to edit this book.',
      });
    }

    next();
  } catch (error) {
    console.error('Book editor permission check error:', error);
    res.status(500).json({ error: 'Internal server error during authorization check.' });
  }
};

export const requireCourseReadAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    // Admins and Editors can view courses if authorized
    if (req.user.role === 'ADMIN') {
      return next();
    }

    const courseId = req.params.courseId || req.params.id;
    if (!courseId) {
      return next();
    }

    const course = await prisma.course.findFirst({
      where: {
        OR: [{ id: courseId }, { slug: courseId }],
      },
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    if (req.user.role === 'EDITOR') {
      const [bookPermission, lessonPermission] = await Promise.all([
        prisma.bookEditorPermission.findUnique({
          where: {
            bookId_userId: {
              bookId: course.id,
              userId: req.user.userId,
            },
          },
        }),
        prisma.lessonEditorPermission.findFirst({
          where: {
            userId: req.user.userId,
            lesson: { courseId: course.id },
          },
        }),
      ]);

      if (!bookPermission && !lessonPermission) {
        return res.status(403).json({ error: 'Access Denied: You are not assigned to this book.' });
      }

      return next();
    }

    // Check if course is published for Students
    if (!course.published) {
      return res.status(403).json({ error: 'This course is currently unpublished.' });
    }

    // Check course access requirement for Students
    const accessCount = await prisma.courseAccess.count({
      where: { courseId: course.id },
    });

    if (accessCount > 0) {
      const hasAccess = await prisma.courseAccess.findUnique({
        where: {
          courseId_userId: {
            courseId: course.id,
            userId: req.user.userId,
          },
        },
      });

      if (!hasAccess) {
        return res.status(403).json({ error: 'You do not have access to this course.' });
      }
    }

    next();
  } catch (error) {
    console.error('Course access check error:', error);
    res.status(500).json({ error: 'Authorization error.' });
  }
};
