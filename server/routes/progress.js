import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import { createAuditLog } from '../lib/logger.js';
const router = Router();
// Mark lesson completed / uncompleted & update reading progress
router.post('/:lessonId', authenticateToken, async (req, res) => {
    try {
        const { lessonId } = req.params;
        const { completed } = req.body;
        const userId = req.user.userId;
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { course: true },
        });
        if (!lesson) {
            return res.status(404).json({ error: 'Lesson not found.' });
        }
        const isCompleted = Boolean(completed);
        const progress = await prisma.lessonProgress.upsert({
            where: {
                userId_lessonId: {
                    userId,
                    lessonId,
                },
            },
            update: {
                completed: isCompleted,
                lastReadAt: new Date(),
            },
            create: {
                userId,
                lessonId,
                completed: isCompleted,
                lastReadAt: new Date(),
            },
        });
        if (isCompleted) {
            await createAuditLog(userId, 'COMPLETE_LESSON', 'Lesson', lessonId, { lessonTitle: lesson.title, bookTitle: lesson.course.title });
        }
        // Calculate total book progress for current student
        const allBookLessons = await prisma.lesson.findMany({
            where: { courseId: lesson.courseId, published: true },
            select: { id: true },
        });
        const completedProgressList = await prisma.lessonProgress.findMany({
            where: {
                userId,
                lessonId: { in: allBookLessons.map((l) => l.id) },
                completed: true,
            },
        });
        const totalLessons = allBookLessons.length;
        const completedCount = completedProgressList.length;
        const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
        return res.json({
            progress,
            bookStats: {
                completedLessons: completedCount,
                totalLessons,
                progressPercent,
            },
        });
    }
    catch (error) {
        console.error('Update progress error:', error);
        return res.status(500).json({ error: 'Failed to update lesson progress.' });
    }
});
// GET Student Dashboard Data (Continue Reading, Saved Books, Completed Books, Bookmarked Lessons, Recent Activity)
router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        // 1. Fetch all book bookmarks
        const bookBookmarks = await prisma.bookBookmark.findMany({
            where: { userId },
            include: {
                book: {
                    include: {
                        _count: { select: { lessons: true } },
                    },
                },
            },
        });
        // 2. Fetch all lesson bookmarks
        const lessonBookmarks = await prisma.lessonBookmark.findMany({
            where: { userId },
            include: {
                lesson: {
                    include: {
                        course: { select: { id: true, title: true, slug: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        // 3. Fetch user lesson progress
        const userProgress = await prisma.lessonProgress.findMany({
            where: { userId },
            include: {
                lesson: {
                    include: {
                        course: true,
                    },
                },
            },
            orderBy: { lastReadAt: 'desc' },
        });
        const completedLessonIds = new Set(userProgress.filter((p) => p.completed).map((p) => p.lessonId));
        // Group progress by book
        const bookMap = new Map();
        for (const prog of userProgress) {
            const book = prog.lesson.course;
            if (!book || !book.published)
                continue;
            if (!bookMap.has(book.id)) {
                bookMap.set(book.id, {
                    book,
                    lastReadLesson: prog.lesson,
                    lastReadAt: prog.lastReadAt,
                });
            }
        }
        // Process books with progress
        const booksInMap = Array.from(bookMap.values());
        const continueReadingBooks = await Promise.all(booksInMap.map(async ({ book, lastReadLesson }) => {
            const lessons = await prisma.lesson.findMany({
                where: { courseId: book.id, published: true },
                select: { id: true, title: true, slug: true, lessonNumber: true, order: true },
                orderBy: [{ lessonNumber: 'asc' }, { order: 'asc' }],
            });
            const totalLessons = lessons.length;
            const completedCount = lessons.filter((l) => completedLessonIds.has(l.id)).length;
            const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
            // Next lesson to continue from
            const nextUncompleted = lessons.find((l) => !completedLessonIds.has(l.id)) || lastReadLesson;
            return {
                ...book,
                progressPercent,
                completedLessons: completedCount,
                totalLessons,
                currentLesson: nextUncompleted,
            };
        }));
        const completedBooks = continueReadingBooks.filter((b) => b.progressPercent === 100);
        const activeReadingBooks = continueReadingBooks.filter((b) => b.progressPercent < 100);
        const savedBooks = await Promise.all(bookBookmarks.map(async (bm) => {
            const book = bm.book;
            const lessons = await prisma.lesson.findMany({
                where: { courseId: book.id, published: true },
                select: { id: true },
            });
            const totalLessons = lessons.length;
            const completedCount = lessons.filter((l) => completedLessonIds.has(l.id)).length;
            const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
            return {
                ...book,
                isBookmarked: true,
                totalLessons,
                completedLessons: completedCount,
                progressPercent,
            };
        }));
        return res.json({
            continueReading: activeReadingBooks,
            completedBooks,
            savedBooks,
            bookmarkedLessons: lessonBookmarks.map((b) => b.lesson),
            recentReading: userProgress.slice(0, 10).map((p) => ({
                lessonId: p.lessonId,
                lessonTitle: p.lesson.title,
                lessonNumber: p.lesson.lessonNumber,
                lessonSlug: p.lesson.slug,
                bookTitle: p.lesson.course.title,
                bookSlug: p.lesson.course.slug,
                lastReadAt: p.lastReadAt,
                completed: p.completed,
            })),
        });
    }
    catch (error) {
        console.error('Fetch student dashboard error:', error);
        return res.status(500).json({ error: 'Failed to fetch student progress metrics.' });
    }
});
export default router;
