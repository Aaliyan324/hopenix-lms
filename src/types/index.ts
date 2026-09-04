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
  title: string;
  slug: string;
  description?: string | null;
  content?: string | null;
  order: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  media?: Media[];
  permissions?: LessonEditorPermission[];
  completed?: boolean;
  course?: {
    id: string;
    title: string;
    slug: string;
    published?: boolean;
  };
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  lessons?: Lesson[];
  progressPercent?: number;
  completedLessons?: number;
  totalLessons?: number;
  _count?: {
    lessons?: number;
    courseAccess?: number;
  };
}

export interface CourseAccess {
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
  totalCourses: number;
  totalLessons: number;
  totalStudents: number;
  totalEditors: number;
  publishedCourses: number;
  publishedLessons: number;
}
