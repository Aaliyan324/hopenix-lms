# Vercel & Neon PostgreSQL Deployment Guide

This guide details step-by-step instructions for deploying **Hopenix LMS** to **Vercel** with **Neon PostgreSQL** and **Vercel Blob Object Storage**.

---

## Step 1: Create Neon PostgreSQL Database

1. Go to [Neon Console](https://console.neon.tech/) and log in or create an account.
2. Click **Create Project** and name it `hopenix-lms`.
3. In the project dashboard, locate your **Connection Details**.
4. Select **Prisma** or **PostgreSQL** string.
5. Copy the pooled connection string:
   ```text
   postgresql://[user]:[password]@[ep-sample-123456].us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

---

## Step 2: Set Up Vercel Blob Storage

1. Open your project dashboard on [Vercel](https://vercel.com/dashboard).
2. Go to the **Storage** tab and click **Create Database**.
3. Select **Blob** (Serverless Object Storage).
4. Name your store `hopenix-lms-blob` and click **Create**.
5. Connect the Blob store to your Vercel project environment.
6. Vercel will automatically generate the required environment variable:
   ```env
   BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
   ```

> **Note**: In local development, if `BLOB_READ_WRITE_TOKEN` is present in your local `.env`, uploads automatically go to Vercel Blob! If omitted, `StorageService` falls back to the local `uploads/` directory.

---

## Step 3: Configure Environment Variables

Create your production environment variables in Vercel:

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | Neon PostgreSQL pooled URL | `postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require` |
| `JWT_SECRET` | Strong secret string for JWT tokens | `a_super_strong_random_secret_32_chars` |
| `VITE_APP_URL` | Production Vercel domain | `https://hopenix-lms.vercel.app` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob access token (auto-provisioned by Vercel) | `vercel_blob_rw_...` |

---

## Step 4: Configure `schema.prisma` for Neon PostgreSQL

In `prisma/schema.prisma`, update the datasource provider to `postgresql`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then generate Prisma Client:
```bash
npx prisma generate
```

---

## Step 5: Run Production Database Migrations & Seed

Push the schema to your live Neon database and seed initial admin credentials:

```bash
# Push database schema to Neon
npx prisma db push

# Seed production database
npx tsx prisma/seed.ts
```

---

## Step 6: Deploy to Vercel

### Option A: Via Vercel CLI
```bash
npx vercel
```

### Option B: Via GitHub / GitLab Import
1. Push repository to GitHub.
2. Import project in [Vercel Dashboard](https://vercel.com/new).
3. Framework Preset: **Vite**
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add Environment Variables (`DATABASE_URL`, `JWT_SECRET`, `VITE_APP_URL`, `BLOB_READ_WRITE_TOKEN`).
7. Click **Deploy**.

---

## Step 7: Verify Production Deployment

1. Open your deployed Vercel URL (`https://your-app.vercel.app/login`).
2. Log in with Admin credentials:
   - Email: `admin@example.com`
   - Password: `admin123`
3. Upload an image, video, or PDF to a lesson and verify the media URL points to `https://...public.blob.vercel-storage.com/...`.
