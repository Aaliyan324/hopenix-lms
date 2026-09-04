import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.courseAccess.deleteMany();
  await prisma.lessonEditorPermission.deleteMany();
  await prisma.media.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  // 1. Create Users
  const admin = await prisma.user.create({
    data: {
      name: 'Alex Rivera (Admin)',
      email: 'admin@example.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    },
  });

  const editor1 = await prisma.user.create({
    data: {
      name: 'Sarah Connor (React Specialist)',
      email: 'editor1@example.com',
      passwordHash,
      role: 'EDITOR',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    },
  });

  const editor2 = await prisma.user.create({
    data: {
      name: 'David Miller (Backend Architect)',
      email: 'editor2@example.com',
      passwordHash,
      role: 'EDITOR',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    },
  });

  const student1 = await prisma.user.create({
    data: {
      name: 'Emily Watson (Student)',
      email: 'student1@example.com',
      passwordHash,
      role: 'STUDENT',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: 'Michael Chen (Student)',
      email: 'student2@example.com',
      passwordHash,
      role: 'STUDENT',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    },
  });

  console.log('✅ Created initial Users.');

  // 2. Create Courses
  const course1 = await prisma.course.create({
    data: {
      title: 'React 19 & TypeScript Masterclass',
      slug: 'react-19-typescript-masterclass',
      description: 'Master component architecture, custom hooks, type safety, state management, and high-performance React application design.',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80',
      published: true,
    },
  });

  const course2 = await prisma.course.create({
    data: {
      title: 'Production Full-Stack Node.js & Prisma',
      slug: 'production-fullstack-node-prisma',
      description: 'Learn end-to-end fullstack development with Express, Prisma ORM, Neon PostgreSQL, JWT Auth, and Vercel serverless functions.',
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
      published: true,
    },
  });

  const course3 = await prisma.course.create({
    data: {
      title: 'Design Systems & Tailwind CSS',
      slug: 'design-systems-tailwind-css',
      description: 'Build modern glassmorphic web apps, accessible design tokens, dark themes, and responsive layouts.',
      thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
      published: true,
    },
  });

  console.log('✅ Created Courses.');

  // 3. Create Lessons for Course 1
  const lesson1 = await prisma.lesson.create({
    data: {
      courseId: course1.id,
      title: '01. React 19 Core Architecture',
      slug: 'react-19-core-architecture',
      description: 'Understand the underlying architecture of React 19, fiber tree, concurrent renderer, and automatic batching.',
      content: `
        <h2>Introduction to React 19 Engine</h2>
        <p>React 19 introduces significant enhancements to how components render and reconcile. In this lesson, we cover component lifecycles, memory allocation, and performance optimization best practices.</p>
        
        <h3>Key Principles</h3>
        <ul>
          <li><strong>Pure Functions:</strong> React components must remain idempotent and free of unexpected side-effects during render.</li>
          <li><strong>Declarative UI:</strong> State defines the structure of your user interface automatically.</li>
          <li><strong>Automatic Batching:</strong> State updates inside async routines are queued efficiently.</li>
        </ul>

        <blockquote>"Architecture is about the important stuff. Whatever that is." — Ralph Johnson</blockquote>

        <pre><code>function WelcomeMessage({ name }: { name: string }) {
  return &lt;h1 className="text-2xl font-bold text-slate-900"&gt;Hello, {name}!&lt;/h1&gt;;
}</code></pre>
      `,
      order: 1,
      published: true,
    },
  });

  const lesson2 = await prisma.lesson.create({
    data: {
      courseId: course1.id,
      title: '02. TypeScript Generics & Custom Hooks',
      slug: 'typescript-generics-custom-hooks',
      description: 'Build strongly-typed custom React hooks using TypeScript generics and reactive primitives.',
      content: `
        <h2>Building Reusable Custom Hooks with TypeScript</h2>
        <p>Custom hooks let you extract component logic into reusable functions. By leveraging generic types, you can build universal data fetchers, storage syncers, and form controllers.</p>
        
        <h3>Example: Generic <code>useLocalStorage</code> Hook</h3>
        <p>Below is a clean implementation of local storage synchronizer with strict type parameters:</p>

        <pre><code>import { useState, useEffect } from 'react';

export function useLocalStorage&lt;T&gt;(key: string, initialValue: T): [T, (val: T) =&gt; void] {
  const [value, setValue] = useState&lt;T&gt;(() =&gt; {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() =&gt; {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}</code></pre>
      `,
      order: 2,
      published: true,
    },
  });

  const lesson3 = await prisma.lesson.create({
    data: {
      courseId: course1.id,
      title: '03. State Management & Context API',
      slug: 'state-management-context-api',
      description: 'Master global application state using React Context API and Zustand for scalable architectures.',
      content: `
        <h2>Global State Patterns</h2>
        <p>Choosing between props drilling, context scope, and external stores is critical for maintaining performance and clean codebases.</p>
      `,
      order: 3,
      published: true,
    },
  });

  // Lessons for Course 2
  const lesson4 = await prisma.lesson.create({
    data: {
      courseId: course2.id,
      title: '01. Prisma ORM & Database Schemas',
      slug: 'prisma-orm-database-schemas',
      description: 'Design robust relational schemas with Prisma ORM, migrations, foreign keys, and Neon PostgreSQL.',
      content: `
        <h2>Designing Relational Databases with Prisma</h2>
        <p>Prisma ORM provides a type-safe client generated directly from your <code>schema.prisma</code> schema definition.</p>
      `,
      order: 1,
      published: true,
    },
  });

  console.log('✅ Created Lessons.');

  // 4. Create Sample Media
  await prisma.media.create({
    data: {
      lessonId: lesson1.id,
      type: 'IMAGE',
      url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
      name: 'react_architecture_diagram.png',
      size: 1024 * 450,
      mimeType: 'image/png',
    },
  });

  await prisma.media.create({
    data: {
      lessonId: lesson1.id,
      type: 'PDF',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      name: 'react19_cheatsheet.pdf',
      size: 1024 * 1200,
      mimeType: 'application/pdf',
    },
  });

  await prisma.media.create({
    data: {
      lessonId: lesson2.id,
      type: 'VIDEO',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      name: 'typescript_hooks_walkthrough.mp4',
      size: 1024 * 1024 * 15,
      mimeType: 'video/mp4',
    },
  });

  console.log('✅ Created Media records.');

  // 5. Grant Editor Permissions
  // Sarah (editor1) can edit Lesson 1 and Lesson 2
  await prisma.lessonEditorPermission.createMany({
    data: [
      { lessonId: lesson1.id, userId: editor1.id },
      { lessonId: lesson2.id, userId: editor1.id },
      { lessonId: lesson4.id, userId: editor2.id },
    ],
  });

  console.log('✅ Granted Editor Permissions.');

  // 6. Grant Student Course Access
  await prisma.courseAccess.createMany({
    data: [
      { courseId: course1.id, userId: student1.id },
      { courseId: course2.id, userId: student1.id },
      { courseId: course1.id, userId: student2.id },
    ],
  });

  console.log('✅ Granted Student Course Access.');

  // 7. Initial Progress
  await prisma.lessonProgress.create({
    data: {
      userId: student1.id,
      lessonId: lesson1.id,
      completed: true,
    },
  });

  // 8. Initial Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        action: 'CREATE_COURSE',
        entityType: 'Course',
        entityId: course1.id,
        metadata: JSON.stringify({ title: course1.title }),
      },
      {
        userId: admin.id,
        action: 'ASSIGN_LESSON_EDITORS',
        entityType: 'Lesson',
        entityId: lesson1.id,
        metadata: JSON.stringify({ editorEmail: editor1.email }),
      },
    ],
  });

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
