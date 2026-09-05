import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import { createAuditLog } from '../lib/logger.js';
const router = Router();
// Toggle Book Bookmark for authenticated student
router.post('/books/:bookId', authenticateToken, async (req, res) => {
    try {
        const { bookId } = req.params;
        const userId = req.user.userId;
        const book = await prisma.course.findUnique({ where: { id: bookId } });
        if (!book) {
            return res.status(404).json({ error: 'Book not found.' });
        }
        const existing = await prisma.bookBookmark.findUnique({
            where: {
                userId_bookId: {
                    userId,
                    bookId,
                },
            },
        });
        if (existing) {
            await prisma.bookBookmark.delete({
                where: { id: existing.id },
            });
            return res.json({ isBookmarked: false, message: 'Book removed from bookmarks.' });
        }
        else {
            await prisma.bookBookmark.create({
                data: {
                    userId,
                    bookId,
                },
            });
            await createAuditLog(userId, 'BOOKMARK_BOOK', 'Book', bookId, { bookTitle: book.title });
            return res.json({ isBookmarked: true, message: 'Book saved to bookmarks!' });
        }
    }
    catch (error) {
        console.error('Toggle book bookmark error:', error);
        return res.status(500).json({ error: 'Failed to update book bookmark.' });
    }
});
// Toggle Lesson Bookmark for authenticated student
router.post('/lessons/:lessonId', authenticateToken, async (req, res) => {
    try {
        const { lessonId } = req.params;
        const userId = req.user.userId;
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { course: { select: { title: true, slug: true } } },
        });
        if (!lesson) {
            return res.status(404).json({ error: 'Lesson not found.' });
        }
        const existing = await prisma.lessonBookmark.findUnique({
            where: {
                userId_lessonId: {
                    userId,
                    lessonId,
                },
            },
        });
        if (existing) {
            await prisma.lessonBookmark.delete({
                where: { id: existing.id },
            });
            return res.json({ isBookmarked: false, message: 'Lesson removed from bookmarks.' });
        }
        else {
            await prisma.lessonBookmark.create({
                data: {
                    userId,
                    lessonId,
                },
            });
            await createAuditLog(userId, 'BOOKMARK_LESSON', 'Lesson', lessonId, { lessonTitle: lesson.title });
            return res.json({ isBookmarked: true, message: 'Lesson saved to bookmarks!' });
        }
    }
    catch (error) {
        console.error('Toggle lesson bookmark error:', error);
        return res.status(500).json({ error: 'Failed to update lesson bookmark.' });
    }
});
// Get user bookmarks (saved books & saved lessons)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const [bookBookmarks, lessonBookmarks] = await Promise.all([
            prisma.bookBookmark.findMany({
                where: { userId },
                include: {
                    book: {
                        include: {
                            _count: { select: { lessons: true } },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.lessonBookmark.findMany({
                where: { userId },
                include: {
                    lesson: {
                        include: {
                            course: { select: { id: true, title: true, slug: true } },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
        ]);
        return res.json({
            savedBooks: bookBookmarks.map((b) => ({
                ...b.book,
                isBookmarked: true,
                totalLessons: b.book._count.lessons,
            })),
            bookmarkedLessons: lessonBookmarks.map((b) => b.lesson),
        });
    }
    catch (error) {
        console.error('Fetch user bookmarks error:', error);
        return res.status(500).json({ error: 'Failed to fetch bookmarks.' });
    }
});
export default router;
