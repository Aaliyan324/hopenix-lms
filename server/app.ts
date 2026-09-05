import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import bookRoutes from './routes/books.js';
import bookmarkRoutes from './routes/bookmarks.js';
import lessonRoutes from './routes/lessons.js';
import mediaRoutes from './routes/media.js';
import statsRoutes from './routes/stats.js';
import progressRoutes from './routes/progress.js';
import { StorageService } from './lib/storage.js';

const app = express();

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads directory for local dev (with CORS support)
StorageService.ensureUploadDirExists();
app.use('/uploads', cors(), express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/courses', bookRoutes); // alias for backward compatibility
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/progress', progressRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
