import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';
import prisma from '../lib/prisma.js';
import { StorageService } from '../lib/storage.js';
import {
  authenticateToken,
  optionalAuthenticateToken,
  AuthenticatedRequest,
} from '../middleware/auth.js';
import { createAuditLog } from '../lib/logger.js';

const router = Router();
const upload = multer({ limits: { fileSize: 100 * 1024 * 1024 } }); // 100MB max buffer

/**
 * Stream/Proxy lesson media file securely
 * Endpoint: GET /api/media/:id/stream and GET /api/media/:id
 */
const streamMediaHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const media = await prisma.media.findUnique({
      where: { id },
      include: {
        lesson: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!media) {
      return res.status(404).json({ error: 'Media file not found.' });
    }

    // Access control check:
    // If lesson and course are published, allow public (unauthenticated) access.
    const isPublicAccess = media.lesson.published && media.lesson.course.published;
    if (!isPublicAccess) {
      const user = req.user;
      if (!user) {
        return res.status(403).json({ error: 'This media belongs to an unpublished lesson.' });
      }

      if (user.role !== 'ADMIN') {
        if (user.role !== 'EDITOR') {
          return res.status(403).json({ error: 'Unauthorized to view this media.' });
        }
        const permission = await prisma.lessonEditorPermission.findUnique({
          where: { lessonId_userId: { lessonId: media.lessonId, userId: user.userId } },
        });
        if (!permission) {
          return res.status(403).json({ error: 'You do not have permission to view media for this lesson.' });
        }
      }
    }

    // Check if local file system storage
    if (media.url.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), media.url.replace(/^\//, ''));
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Local media file not found.' });
      }
      res.setHeader('Content-Type', media.mimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(media.name)}"`);
      return res.sendFile(filePath);
    }

    // Remote Vercel Blob storage streaming
    const blobRes = await StorageService.fetchBlobResource(media.url, req.headers.range as string | undefined);

    if (!blobRes.ok && blobRes.status !== 206) {
      return res.status(blobRes.status).json({ error: 'Failed to stream media file from storage.' });
    }

    res.status(blobRes.status);
    res.setHeader('Content-Type', media.mimeType || blobRes.headers.get('content-type') || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(media.name)}"`);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    const contentLength = blobRes.headers.get('content-length');
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    const contentRange = blobRes.headers.get('content-range');
    if (contentRange) {
      res.setHeader('Content-Range', contentRange);
    }

    if (blobRes.body) {
      // @ts-ignore Node 18+ web stream pipe to Express response
      Readable.fromWeb(blobRes.body as any).pipe(res);
    } else {
      res.end();
    }
  } catch (error: any) {
    console.error('Media streaming error:', error);
    return res.status(500).json({ error: 'Internal server error while streaming media.' });
  }
};

router.get('/:id/stream', optionalAuthenticateToken, streamMediaHandler);
router.get('/:id', optionalAuthenticateToken, streamMediaHandler);

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
      const uploadResult = await StorageService.uploadFile(file.buffer, file.originalname, file.mimetype);

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

      return res.status(201).json({
        media: {
          ...media,
          url: `/api/media/${media.id}/stream`,
        },
      });
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
    await StorageService.deleteFile(media.url);

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

