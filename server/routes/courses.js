import { Router } from 'express';
import QRCode from 'qrcode';
import prisma from '../lib/prisma.js';
import { authenticateToken, requireRole, requireCourseReadAccess } from '../middleware/auth.js';
import { createAuditLog } from '../lib/logger.js';
const router = Router();
// Slugify helper
const slugify = (text) => text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
// List courses
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { role, userId } = req.user;
        const search = req.query.search || '';
        const where = {};
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        // Students only see published courses or courses assigned to them
        if (role === 'STUDENT') {
            where.published = true;
        }
        const courses = await prisma.course.findMany({
            where,
            include: {
                _count: {
                    select: {
                        lessons: true,
                        courseAccess: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        // Compute progress for students
        if (role === 'STUDENT') {
            const studentProgress = await prisma.lessonProgress.findMany({
                where: { userId, completed: true },
                select: { lessonId: true },
            });
            const completedLessonIds = new Set(studentProgress.map((p) => p.lessonId));
            const coursesWithProgress = await Promise.all(courses.map(async (course) => {
                const lessons = await prisma.lesson.findMany({
                    where: { courseId: course.id, published: true },
                    select: { id: true },
                });
                const totalLessons = lessons.length;
                const completedCount = lessons.filter((l) => completedLessonIds.has(l.id)).length;
                const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
                return {
                    ...course,
                    progressPercent,
                    completedLessons: completedCount,
                    totalLessons,
                };
            }));
            return res.json({ courses: coursesWithProgress });
        }
        return res.json({ courses });
    }
    catch (error) {
        console.error('Fetch courses error:', error);
        return res.status(500).json({ error: 'Failed to fetch courses.' });
    }
});
// Get course by ID or Slug
router.get('/:id', authenticateToken, requireCourseReadAccess, async (req, res) => {
    try {
        const { id } = req.params;
        const { role, userId } = req.user;
        const course = await prisma.course.findFirst({
            where: {
                OR: [{ id }, { slug: id }],
            },
            include: {
                lessons: {
                    where: role === 'STUDENT' ? { published: true } : undefined,
                    orderBy: { order: 'asc' },
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
                    },
                },
            },
        });
        if (!course) {
            return res.status(404).json({ error: 'Course not found.' });
        }
        // Attach student progress if STUDENT
        if (role === 'STUDENT') {
            const progress = await prisma.lessonProgress.findMany({
                where: { userId },
            });
            const completedSet = new Set(progress.filter((p) => p.completed).map((p) => p.lessonId));
            const lessonsWithProgress = course.lessons.map((lesson) => ({
                ...lesson,
                completed: completedSet.has(lesson.id),
            }));
            return res.json({
                course: {
                    ...course,
                    lessons: lessonsWithProgress,
                },
            });
        }
        return res.json({ course });
    }
    catch (error) {
        console.error('Fetch course detail error:', error);
        return res.status(500).json({ error: 'Failed to fetch course details.' });
    }
});
// Create Course (ADMIN)
router.post('/', authenticateToken, requireRole('ADMIN'), async (req, res) => {
    try {
        const { title, description, thumbnail, published, slug: customSlug } = req.body;
        if (!title || !description) {
            return res.status(400).json({ error: 'Course title and description are required.' });
        }
        let slug = customSlug ? slugify(customSlug) : slugify(title);
        // Ensure unique slug
        const existing = await prisma.course.findUnique({ where: { slug } });
        if (existing) {
            slug = `${slug}-${Date.now().toString().slice(-4)}`;
        }
        const course = await prisma.course.create({
            data: {
                title,
                description,
                thumbnail: thumbnail || null,
                slug,
                published: Boolean(published),
            },
        });
        await createAuditLog(req.user.userId, 'CREATE_COURSE', 'Course', course.id, { title: course.title, slug });
        return res.status(201).json({ course });
    }
    catch (error) {
        console.error('Create course error:', error);
        return res.status(500).json({ error: 'Failed to create course.' });
    }
});
// Update Course (ADMIN)
router.patch('/:id', authenticateToken, requireRole('ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, thumbnail, published, slug: newSlug } = req.body;
        const course = await prisma.course.findUnique({ where: { id } });
        if (!course) {
            return res.status(404).json({ error: 'Course not found.' });
        }
        const updateData = {};
        if (title)
            updateData.title = title;
        if (description !== undefined)
            updateData.description = description;
        if (thumbnail !== undefined)
            updateData.thumbnail = thumbnail;
        if (typeof published === 'boolean')
            updateData.published = published;
        if (newSlug)
            updateData.slug = slugify(newSlug);
        const updatedCourse = await prisma.course.update({
            where: { id },
            data: updateData,
        });
        await createAuditLog(req.user.userId, 'UPDATE_COURSE', 'Course', id, updateData);
        return res.json({ course: updatedCourse });
    }
    catch (error) {
        console.error('Update course error:', error);
        return res.status(500).json({ error: 'Failed to update course.' });
    }
});
// Delete Course (ADMIN)
router.delete('/:id', authenticateToken, requireRole('ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;
        const course = await prisma.course.findUnique({ where: { id } });
        if (!course) {
            return res.status(404).json({ error: 'Course not found.' });
        }
        await prisma.course.delete({ where: { id } });
        await createAuditLog(req.user.userId, 'DELETE_COURSE', 'Course', id, { title: course.title });
        return res.json({ message: 'Course deleted successfully.' });
    }
    catch (error) {
        console.error('Delete course error:', error);
        return res.status(500).json({ error: 'Failed to delete course.' });
    }
});
// Generate QR Code for Course
router.get('/:id/qr', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const course = await prisma.course.findFirst({
            where: { OR: [{ id }, { slug: id }] },
        });
        if (!course) {
            return res.status(404).json({ error: 'Course not found.' });
        }
        const baseUrl = process.env.VITE_APP_URL || `${req.protocol}://${req.get('host')}`;
        const courseUrl = `${baseUrl}/courses/${course.slug}`;
        const qrDataUrl = await QRCode.toDataURL(courseUrl, {
            width: 400,
            margin: 2,
            color: {
                dark: '#0f172a',
                light: '#ffffff',
            },
        });
        const svgData = await QRCode.toString(courseUrl, {
            type: 'svg',
            margin: 2,
        });
        return res.json({
            courseId: course.id,
            courseTitle: course.title,
            courseSlug: course.slug,
            courseUrl,
            qrDataUrl,
            svgData,
        });
    }
    catch (error) {
        console.error('QR Generation error:', error);
        return res.status(500).json({ error: 'Failed to generate QR code.' });
    }
});
// Course Student Access Management (ADMIN)
router.get('/:id/access', authenticateToken, requireRole('ADMIN'), async (req, res) => {
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
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch course access permissions.' });
    }
});
router.post('/:id/access', authenticateToken, requireRole('ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;
        const { userIds } = req.body; // Array of user IDs
        if (!Array.isArray(userIds)) {
            return res.status(400).json({ error: 'userIds must be an array.' });
        }
        // Replace access entries
        await prisma.courseAccess.deleteMany({ where: { courseId: id } });
        if (userIds.length > 0) {
            await prisma.courseAccess.createMany({
                data: userIds.map((userId) => ({
                    courseId: id,
                    userId,
                })),
            });
        }
        await createAuditLog(req.user.userId, 'UPDATE_COURSE_ACCESS', 'Course', id, { assignedUserCount: userIds.length });
        return res.json({ message: 'Course student access updated successfully.' });
    }
    catch (error) {
        console.error('Update course access error:', error);
        return res.status(500).json({ error: 'Failed to update course access.' });
    }
});
export default router;
