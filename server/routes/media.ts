import { Router, Response } from 'express';
import multer from 'multer';
import prisma from '../lib/prisma.js';
import { StorageService } from '../lib/storage.js';
import { authenticateToken, requireLessonEditPermission, AuthenticatedRequest } from '../middleware/auth.js';
import { createAuditLog } from '../lib/logger.js';

const router = Router();
const upload = multer({ limits: { fileSize: 100 * 1024 * 1024 } }); // 100MB max buffer

// Upload media file for a lesson
router.post(
  '/upload',
  authenticateToken,
  upload.single('file'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { lessonId, type } = req.body;
      const file = req.file;

      if (!lessonId || !type || !file) {
        return res.status(400).json({ error: 'lessonId, type (IMAGE, VIDEO, PDF), and file are required.' });
      }

      const mediaType = type.toUpperCase() as 'IMAGE' | 'VIDEO' | 'PDF';
      if (!['IMAGE', 'VIDEO', 'PDF'].includes(mediaType)) {
        return res.status(400).json({ error: 'Invalid media type. Must be IMAGE, VIDEO, or PDF.' });
      }

      // Check permission
      const { role, userId } = req.user!;
      if (role !== 'ADMIN') {
        if (role !== 'EDITOR') {
          return res.status(403).json({ error: 'Unauthorized file upload.' });
        }
        const permission = await prisma.lessonEditorPermission.findUnique({
          where: { lessonId_userId: { lessonId, userId } },
        });
        if (!permission) {
          return res.status(403).json({ error: 'You do not have permission to upload files for this lesson.' });
        }
      }

      // Validate file format and size limits
      StorageService.validateFile(file.size, file.mimetype, mediaType);

      // Save via StorageService abstraction
      const uploadResult = await StorageService.saveLocalFile(file.buffer, file.originalname, file.mimetype);

      // Save Media record in DB
      const media = await prisma.media.create({
        data: {
          lessonId,
          type: mediaType,
          url: uploadResult.url,
          name: uploadResult.name,
          size: uploadResult.size,
          mimeType: uploadResult.mimeType,
        },
      });

      await createAuditLog(userId, 'UPLOAD_MEDIA', 'Media', media.id, {
        lessonId,
        type: mediaType,
        fileName: uploadResult.name,
      });

      return res.status(201).json({ media });
    } catch (error: any) {
      console.error('Media upload error:', error);
      return res.status(400).json({ error: error.message || 'File upload failed.' });
    }
  }
);

// Delete media
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const media = await prisma.media.findUnique({ where: { id } });

    if (!media) {
      return res.status(404).json({ error: 'Media file not found.' });
    }

    // Permission check
    const { role, userId } = req.user!;
    if (role !== 'ADMIN') {
      if (role !== 'EDITOR') {
        return res.status(403).json({ error: 'Unauthorized.' });
      }
      const permission = await prisma.lessonEditorPermission.findUnique({
        where: { lessonId_userId: { lessonId: media.lessonId, userId } },
      });
      if (!permission) {
        return res.status(403).json({ error: 'You do not have permission to delete media for this lesson.' });
      }
    }

    // Delete file from storage
    await StorageService.deleteLocalFile(media.url);

    // Delete record from DB
    await prisma.media.delete({ where: { id } });

    await createAuditLog(userId, 'DELETE_MEDIA', 'Media', id, { fileName: media.name, type: media.type });

    return res.json({ message: 'Media file deleted successfully.' });
  } catch (error) {
    console.error('Delete media error:', error);
    return res.status(500).json({ error: 'Failed to delete media.' });
  }
});

export default router;
