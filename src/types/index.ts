export type Role = 'ADMIN' | 'EDITOR' | 'STUDENT';
export type MediaType = 'IMAGE' | 'VIDEO' | 'PDF';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  _count?: {
    permissions?: number;
    courseAccess?: number;
  };
}

export interface Media {
  id: string;
  lessonId: string;
  type: MediaType;
  url: string;
  name: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

export interface LessonEditorPermission {
  id: string;
  lessonId: string;
  userId: string;
  createdAt: string;
  user?: User;
}

export interface Lesson {
  id: string;
  courseId: string;
  bookId?: string;
  title: string;
  slug: string;
  description?: string | null;
  content?: string | null;
  lessonNumber: number;
  readingTime?: string | null;
  order: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  media?: Media[];
  permissions?: LessonEditorPermission[];
  completed?: boolean;
  isBookmarked?: boolean;
  course?: {
    id: string;
    title: string;
    slug: string;
    published?: boolean;
  };
  book?: {
    id: string;
    title: string;
    slug: string;
    published?: boolean;
  };
}

export interface Book {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string | null;
  author?: string | null;
  coverImage?: string | null;
  thumbnail?: string | null;
  category?: string | null;
  publicationYear?: number | null;
  isbn?: string | null;
  language?: string | null;
  readingLevel?: string | null;
  featured?: boolean;
  published: boolean;
  qrLogo?: string | null;
  readingTime?: string | null;
  companyName?: string | null;
  createdAt: string;
  updatedAt: string;
  lessons?: Lesson[];
  progressPercent?: number;
  completedLessons?: number;
  totalLessons?: number;
  isBookmarked?: boolean;
  _count?: {
    lessons?: number;
    courseAccess?: number;
    bookmarks?: number;
  };
}

// Alias for backward compatibility
export type Course = Book;

export interface BookAccess {
  id: string;
  courseId: string;
  userId: string;
  createdAt: string;
  user?: User;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  user?: User | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: string | null;
  createdAt: string;
}

export interface DashboardStats {
  totalBooks: number;
  totalLessons: number;
  totalStudents: number;
  totalEditors: number;
  publishedBooks: number;
  publishedLessons: number;
  totalCourses?: number;
  publishedCourses?: number;
}
