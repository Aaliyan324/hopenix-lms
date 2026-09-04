# Hopenix LMS — Production Lesson & Course Management Portal

A full-stack, enterprise-grade **Lesson & Course Management Platform** engineered with React 19, TypeScript, Vite, Tailwind CSS, Prisma ORM, Neon PostgreSQL, and Vercel-native serverless architecture.

---

## 🌟 Key Features & Capabilities

### 👑 System Administrator Role (`ADMIN`)
- **Course Management**: Create, edit, publish/unpublish, and delete courses with auto-generated SEO URL slugs.
- **Lesson Management**: Drag/reorder lessons inside courses, manage lesson syllabus, published/draft status.
- **Editor Permissions**: Granularly assign specific editors access to specific lessons (`LessonEditorPermission`).
- **Student Course Access**: Control student enrolment & access rules per course (`CourseAccess`).
- **QR Code Studio**: Instant QR Code generation pointing to course pages with vector SVG & PNG downloads and clipboard copy.
- **User Account Management**: Create, edit roles, toggle status, and delete user accounts.
- **Activity Logbook**: Full audit trail of actions (course creations, media uploads, user permissions, logins).
- **Admin Dashboard**: System metrics (Total Courses, Lessons, Students, Editors, Published counts, Recent activity).

### ✏️ Lesson Editor Role (`EDITOR`)
- **Assigned Lessons Workspace**: View only lessons explicitly granted permission by an administrator.
- **Rich Text Studio**: Polished TipTap WYSIWYG editor supporting Headings (H1/H2/H3), Bold, Italic, Bulleted & Numbered Lists, Code Blocks, Quotes, Links, and Tables.
- **Media Uploads**: Production-ready upload system for Images (PNG/JPG/WEBP), Videos (MP4/WEBM), and PDFs with size limits and MIME validation.
- **Strict Server Enforcement**: Backend rejects any attempt to modify unassigned lessons (HTTP 403 Forbidden).

### 🎓 Student Role (`STUDENT`)
- **Student Dashboard**: Enrolled courses overview with dynamic visual progress bar (% completed) and lesson counters.
- **Course Landing Page**: Complete syllabus outline with progress tracking.
- **Responsive Lesson Reader**: Interactive lesson viewer with course navigation sidebar, video player, image gallery, PDF viewer with download, "Mark as Completed" toggle, and Next/Prev lesson controls.

---

## 🔐 Demo Persona Credentials

| Role | Email | Password | Privileges |
|---|---|---|---|
| **ADMIN** | `admin@example.com` | `admin123` | Full administrative access |
| **EDITOR 1** | `editor1@example.com` | `password123` | Assigned to React 19 Lessons 01 & 02 |
| **EDITOR 2** | `editor2@example.com` | `password123` | Assigned to Prisma ORM Lesson |
| **STUDENT 1** | `student1@example.com` | `password123` | Enrolled in React & Node Courses |
| **STUDENT 2** | `student2@example.com` | `password123` | Enrolled Student |

---

## 🚀 Quick Start Guide (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
DATABASE_URL="file:./dev.db"
JWT_SECRET="hopenix_lms_super_secret_jwt_key_2026"
VITE_APP_URL="http://localhost:3000"
```

### 3. Initialize & Seed Database
```bash
npm run db:push
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```
- Client Frontend: `http://localhost:3000`
- Express API Server: `http://localhost:3001`

---

## 🛠️ Verification & Build Commands

```bash
# Type Check
npm run lint

# Production Build
npm run build
```

---

## 📦 Architecture Stack
- **Frontend**: React 18, TypeScript, Vite, React Router DOM, Tailwind CSS, Lucide React, TipTap Editor, QRCode.
- **Backend API**: Express.js in TypeScript, `@vercel/node` Serverless compatible.
- **Database**: Prisma ORM, Neon PostgreSQL / SQLite.
- **Authentication**: JWT session tokens with HTTP-only cookies and bcryptjs password hashing.
