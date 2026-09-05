import fs from 'fs';
import path from 'path';
import { put, del } from '@vercel/blob';

export interface UploadedFileResult {
  url: string;
  name: string;
  size: number;
  mimeType: string;
}

export class StorageService {
  private static uploadDir = path.join(process.cwd(), 'uploads');

  static ensureUploadDirExists() {
    try {
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, { recursive: true });
      }
    } catch (err) {
      // Ignore directory creation errors in read-only serverless environments like Vercel
    }
  }

  /**
   * Universal upload handler:
   * Uses Vercel Blob when BLOB_READ_WRITE_TOKEN is set in environment (Production / Vercel),
   * otherwise falls back to local disk storage (Development).
   */
  static async uploadFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string
  ): Promise<UploadedFileResult> {
    const isVercelBlobEnabled = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

    if (isVercelBlobEnabled) {
      const ext = path.extname(originalName);
      const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9]/g, '_');
      const pathname = `lms-media/${Date.now()}_${baseName}${ext}`;

      let blob: Awaited<ReturnType<typeof put>>;

      try {
        // Try public access first (works with public Vercel Blob stores)
        blob = await put(pathname, fileBuffer, {
          access: 'public',
          contentType: mimeType,
        });
      } catch (err: any) {
        // If the store is configured as private, fall back to private access.
        // Private blob URLs from Vercel CDN are directly accessible via their
        // embedded token and work fine for media serving.
        if (err?.message?.toLowerCase().includes('private')) {
          blob = await put(pathname, fileBuffer, {
            access: 'private',
            contentType: mimeType,
          });
        } else {
          throw err;
        }
      }

      return {
        url: blob.url,
        name: originalName,
        size: fileBuffer.length,
        mimeType,
      };
    }

    // Local Disk Fallback
    return this.saveLocalFile(fileBuffer, originalName, mimeType);
  }


  static async saveLocalFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string
  ): Promise<UploadedFileResult> {
    this.ensureUploadDirExists();

    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${Date.now()}_${baseName}${ext}`;
    const filePath = path.join(this.uploadDir, fileName);

    await fs.promises.writeFile(filePath, fileBuffer);

    return {
      url: `/uploads/${fileName}`,
      name: originalName,
      size: fileBuffer.length,
      mimeType,
    };
  }

  static async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      // Vercel Blob URL check
      if (fileUrl.includes('vercel-storage.com') || process.env.BLOB_READ_WRITE_TOKEN) {
        await del(fileUrl);
        return true;
      }

      // Local Disk Delete
      if (fileUrl.startsWith('/uploads/')) {
        const fileName = path.basename(fileUrl);
        const filePath = path.join(this.uploadDir, fileName);
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath);
          return true;
        }
      }
    } catch (err) {
      console.error('Error deleting file from storage:', err);
    }
    return false;
  }

  static validateFile(fileSize: number, mimeType: string, expectedType: 'IMAGE' | 'VIDEO' | 'PDF') {
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
    const MAX_PDF_SIZE = 25 * 1024 * 1024;   // 25MB
    const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

    if (expectedType === 'IMAGE') {
      if (!mimeType.startsWith('image/')) {
        throw new Error('Invalid image file type. Supported: PNG, JPG, JPEG, WEBP');
      }
      if (fileSize > MAX_IMAGE_SIZE) {
        throw new Error('Image file size exceeds 10MB limit.');
      }
    } else if (expectedType === 'VIDEO') {
      if (!mimeType.startsWith('video/')) {
        throw new Error('Invalid video file type. Supported: MP4, WEBM, MOV');
      }
      if (fileSize > MAX_VIDEO_SIZE) {
        throw new Error('Video file size exceeds 100MB limit.');
      }
    } else if (expectedType === 'PDF') {
      if (mimeType !== 'application/pdf') {
        throw new Error('Invalid file type. Must be a PDF document.');
      }
      if (fileSize > MAX_PDF_SIZE) {
        throw new Error('PDF file size exceeds 25MB limit.');
      }
    }
  }
}
