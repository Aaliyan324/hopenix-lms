import dotenv from 'dotenv';
dotenv.config();
// Validate critical environment variables on startup
if (!process.env.DATABASE_URL) {
    console.error('FATAL: DATABASE_URL environment variable is not set.');
    // Don't crash — Vercel will show the 500, but we log it clearly
}
import app from '../server/app.js';
export default app;
