import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { Course } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { QRCodeModal } from '../../components/qr/QRCodeModal';
import {
  Plus,
  Search,
  BookOpen,
  QrCode,
  Edit,
  Trash2,
  ExternalLink,
  Layers,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export const AdminCoursesPage: React.FC = () => {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [qrCourse, setQrCourse] = useState<Course | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [slug, setSlug] = useState('');
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, [search]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<{ courses: Course[] }>(`/courses?search=${encodeURIComponent(search)}`);
      setCourses(data.courses);
    } catch (err) {
      toast('Failed to load courses.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setTitle('');
    setDescription('');
    setThumbnail('');
    setSlug('');
    setPublished(false);
    setIsCreateOpen(true);
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setTitle(course.title);
    setDescription(course.description);
    setThumbnail(course.thumbnail || '');
    setSlug(course.slug);
    setPublished(course.published);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingCourse) {
      const generatedSlug = val
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-');
      setSlug(generatedSlug);
    }
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      toast('Title and description are required.', 'error');
      return;
    }

    try {
      setSaving(true);
      if (editingCourse) {
        await apiFetch(`/courses/${editingCourse.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ title, description, thumbnail, slug, published }),
        });
        toast('Course updated successfully!', 'success');
      } else {
        await apiFetch('/courses', {
          method: 'POST',
          body: JSON.stringify({ title, description, thumbnail, slug, published }),
        });
        toast('Course created successfully!', 'success');
      }
      setIsCreateOpen(false);
      setEditingCourse(null);
      fetchCourses();
    } catch (err: any) {
      toast(err.message || 'Operation failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!deletingCourse) return;
    try {
      setSaving(true);
      await apiFetch(`/courses/${deletingCourse.id}`, { method: 'DELETE' });
      toast('Course deleted successfully.', 'success');
      setDeletingCourse(null);
      fetchCourses();
    } catch (err: any) {
      toast(err.message || 'Failed to delete course.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Course Management</h1>
          <p className="text-sm text-slate-400">Create, organize, and manage course offerings.</p>
        </div>
        <Button onClick={openCreateModal} variant="primary" icon={<Plus className="w-4 h-4" />}>
          Create Course
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses by title or description..."
          className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
        />
      </div>

      {/* Course Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          title="No courses found"
          description="Create your first educational course to start adding rich lessons and media."
          actionText="Create Course"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all duration-200"
            >
              <div>
                {/* Thumbnail Image Header */}
                <div className="relative h-44 bg-slate-950 overflow-hidden">
                  <img
                    src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant={course.published ? 'success' : 'slate'}>
                      {course.published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                </div>

                {/* Course Metadata */}
                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-lg text-white group-hover:text-brand-400 transition-colors line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="flex items-center gap-4 pt-2 text-xs text-slate-400 font-medium border-t border-slate-800/80">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-brand-400" />
                      {course._count?.lessons || 0} Lessons
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-blue-400" />
                      {course._count?.courseAccess || 0} Enrolled
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-5 py-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between gap-2">
                <Link
                  to={`/admin/courses/${course.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300"
                >
                  Manage Lessons & Syllabus →
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setQrCourse(course)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    title="Generate QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(course)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    title="Edit Course"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingCourse(course)}
                    className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Delete Course"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Course Modal */}
      <Modal
        isOpen={isCreateOpen || !!editingCourse}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingCourse(null);
        }}
        title={editingCourse ? 'Edit Course' : 'Create New Course'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveCourse} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Course Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. React 19 & TypeScript Masterclass"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              URL Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="react-19-typescript-masterclass"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a compelling course overview..."
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Thumbnail Image URL
            </label>
            <input
              type="url"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="published-toggle"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="published-toggle" className="text-sm font-medium text-slate-200 cursor-pointer">
              Publish Course immediately for students
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingCourse(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {editingCourse ? 'Save Changes' : 'Create Course'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingCourse}
        onClose={() => setDeletingCourse(null)}
        onConfirm={handleDeleteCourse}
        title="Delete Course"
        message={`Are you sure you want to delete "${deletingCourse?.title}"? All associated lessons and media will be permanently deleted.`}
        loading={saving}
      />

      {/* QR Code Modal */}
      {qrCourse && (
        <QRCodeModal
          isOpen={!!qrCourse}
          onClose={() => setQrCourse(null)}
          courseId={qrCourse.id}
          courseTitle={qrCourse.title}
        />
      )}
    </div>
  );
};
