import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { Course, Lesson, User } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { QRCodeModal } from '../../components/qr/QRCodeModal';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  MoveUp,
  MoveDown,
  UserPlus,
  Users,
  QrCode,
  FileText,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  Check,
} from 'lucide-react';

export const AdminCourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'lessons' | 'students' | 'qr'>('lessons');

  // Lessons Modal state
  const [isCreateLessonOpen, setIsCreateLessonOpen] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [lessonPublished, setLessonPublished] = useState(true);
  const [savingLesson, setSavingLesson] = useState(false);
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null);

  // Editor Assignment Modal state
  const [assigningLesson, setAssigningLesson] = useState<Lesson | null>(null);
  const [editorsList, setEditorsList] = useState<User[]>([]);
  const [selectedEditorIds, setSelectedEditorIds] = useState<string[]>([]);
  const [savingPermissions, setSavingPermissions] = useState(false);

  // Student Access Control state
  const [studentsList, setStudentsList] = useState<User[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [savingStudentAccess, setSavingStudentAccess] = useState(false);

  // QR Modal
  const [isQrOpen, setIsQrOpen] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
    fetchUsers();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<{ course: Course }>(`/courses/${id}`);
      setCourse(data.course);
    } catch (err) {
      toast('Failed to load course details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await apiFetch<{ users: User[] }>('/users?limit=100');
      const editors = data.users.filter((u) => u.role === 'EDITOR');
      const students = data.users.filter((u) => u.role === 'STUDENT');
      setEditorsList(editors);
      setStudentsList(students);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  // Load assigned students for Course Access tab
  useEffect(() => {
    if (activeTab === 'students' && id) {
      fetchCourseStudentAccess();
    }
  }, [activeTab, id]);

  const fetchCourseStudentAccess = async () => {
    try {
      const data = await apiFetch<{ accessList: { userId: string }[] }>(`/courses/${id}/access`);
      setSelectedStudentIds(data.accessList.map((a) => a.userId));
    } catch (err) {
      console.error('Fetch access error:', err);
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle) return;

    try {
      setSavingLesson(true);
      await apiFetch('/lessons', {
        method: 'POST',
        body: JSON.stringify({
          courseId: course?.id,
          title: lessonTitle,
          description: lessonDescription,
          published: lessonPublished,
        }),
      });
      toast('Lesson created successfully!', 'success');
      setIsCreateLessonOpen(false);
      setLessonTitle('');
      setLessonDescription('');
      fetchCourseDetails();
    } catch (err: any) {
      toast(err.message || 'Failed to create lesson.', 'error');
    } finally {
      setSavingLesson(false);
    }
  };

  const handleDeleteLesson = async () => {
    if (!deletingLesson) return;
    try {
      setSavingLesson(true);
      await apiFetch(`/lessons/${deletingLesson.id}`, { method: 'DELETE' });
      toast('Lesson deleted successfully.', 'success');
      setDeletingLesson(null);
      fetchCourseDetails();
    } catch (err: any) {
      toast(err.message || 'Failed to delete lesson.', 'error');
    } finally {
      setSavingLesson(false);
    }
  };

  const handleReorderLesson = async (index: number, direction: 'up' | 'down') => {
    if (!course?.lessons) return;
    const lessons = [...course.lessons];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= lessons.length) return;

    // Swap order property
    const temp = lessons[index];
    lessons[index] = lessons[targetIndex];
    lessons[targetIndex] = temp;

    const reorderPayload = lessons.map((l, idx) => ({ id: l.id, order: idx + 1 }));

    try {
      await apiFetch('/lessons/reorder', {
        method: 'POST',
        body: JSON.stringify({ items: reorderPayload }),
      });
      toast('Lesson order updated.', 'success');
      fetchCourseDetails();
    } catch (err) {
      toast('Failed to reorder lessons.', 'error');
    }
  };

  // Editor Permissions Modal
  const openEditorPermissionModal = (lesson: Lesson) => {
    setAssigningLesson(lesson);
    const assignedIds = lesson.permissions?.map((p) => p.userId) || [];
    setSelectedEditorIds(assignedIds);
  };

  const handleSaveEditorPermissions = async () => {
    if (!assigningLesson) return;
    try {
      setSavingPermissions(true);
      await apiFetch(`/lessons/${assigningLesson.id}/editors`, {
        method: 'POST',
        body: JSON.stringify({ editorIds: selectedEditorIds }),
      });
      toast('Editor permissions updated successfully!', 'success');
      setAssigningLesson(null);
      fetchCourseDetails();
    } catch (err: any) {
      toast(err.message || 'Failed to save editor permissions.', 'error');
    } finally {
      setSavingPermissions(false);
    }
  };

  const toggleEditorSelection = (userId: string) => {
    setSelectedEditorIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  // Course Student Access Save
  const handleSaveStudentAccess = async () => {
    if (!course) return;
    try {
      setSavingStudentAccess(true);
      await apiFetch(`/courses/${course.id}/access`, {
        method: 'POST',
        body: JSON.stringify({ userIds: selectedStudentIds }),
      });
      toast('Course student permissions updated!', 'success');
      fetchCourseDetails();
    } catch (err: any) {
      toast(err.message || 'Failed to update student access.', 'error');
    } finally {
      setSavingStudentAccess(false);
    }
  };

  const toggleStudentSelection = (userId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  if (loading || !course) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  const filteredStudents = studentsList.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Top Back Navigation */}
      <Link
        to="/admin/courses"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to All Courses
      </Link>

      {/* Course Banner Header Card */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-5">
          <img
            src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'}
            alt={course.title}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-slate-800 shrink-0"
          />
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Badge variant={course.published ? 'success' : 'slate'}>
                {course.published ? 'Published' : 'Draft'}
              </Badge>
              <span className="text-xs text-slate-400 font-mono">slug: /{course.slug}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{course.title}</h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1 line-clamp-2">{course.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button variant="outline" size="sm" onClick={() => setIsQrOpen(true)} icon={<QrCode className="w-4 h-4" />}>
            QR Code
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsCreateLessonOpen(true)} icon={<Plus className="w-4 h-4" />}>
            Add Lesson
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('lessons')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
            activeTab === 'lessons'
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          Course Lessons ({course.lessons?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
            activeTab === 'students'
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          Student Access Control
        </button>
      </div>

      {/* TAB 1: LESSONS MANAGEMENT */}
      {activeTab === 'lessons' && (
        <div className="space-y-4">
          {course.lessons?.length === 0 ? (
            <EmptyState
              title="No lessons created yet"
              description="Add the first lesson to this course to begin building the syllabus."
              actionText="Add Lesson"
              onAction={() => setIsCreateLessonOpen(true)}
            />
          ) : (
            <div className="space-y-3">
              {course.lessons?.map((lesson, idx) => (
                <div
                  key={lesson.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl shadow-lg transition-all"
                >
                  <div className="flex items-center gap-4">
                    {/* Reorder Buttons */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleReorderLesson(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-slate-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move Up"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleReorderLesson(idx, 'down')}
                        disabled={idx === (course.lessons?.length || 0) - 1}
                        className="p-1 text-slate-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move Down"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-semibold text-brand-400">#{lesson.order}</span>
                        <Badge variant={lesson.published ? 'success' : 'slate'} size="sm">
                          {lesson.published ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      <h4 className="text-base font-bold text-white">{lesson.title}</h4>
                      {lesson.description && (
                        <p className="text-xs text-slate-400 line-clamp-1">{lesson.description}</p>
                      )}

                      {/* Assigned Editors Preview */}
                      {lesson.permissions && lesson.permissions.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="text-[11px] text-slate-500 font-semibold">Editors with edit access:</span>
                          <div className="flex items-center gap-1">
                            {lesson.permissions.map((p) => (
                              <span key={p.id} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                                {p.user?.name || 'Editor'}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lesson Controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditorPermissionModal(lesson)}
                      icon={<UserPlus className="w-3.5 h-3.5" />}
                    >
                      Assign Editors
                    </Button>

                    <Link to={`/admin/lessons/${lesson.id}/edit`}>
                      <Button variant="secondary" size="sm" icon={<Edit className="w-3.5 h-3.5" />}>
                        Edit Content
                      </Button>
                    </Link>

                    <button
                      onClick={() => setDeletingLesson(lesson)}
                      className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Delete Lesson"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STUDENT ACCESS CONTROL */}
      {activeTab === 'students' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Student Course Access Authorization</h3>
              <p className="text-xs text-slate-400">
                Grant specific enrolled students access to this course. (If no students are selected, all registered students can access published lessons).
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={handleSaveStudentAccess} loading={savingStudentAccess}>
              Save Access Rules
            </Button>
          </div>

          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Search students by name or email..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredStudents.map((student) => {
              const isSelected = selectedStudentIds.includes(student.id);
              return (
                <div
                  key={student.id}
                  onClick={() => toggleStudentSelection(student.id)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-brand-600/15 border-brand-500 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`}
                      alt={student.name}
                      className="w-8 h-8 rounded-full bg-slate-800 object-cover"
                    />
                    <div>
                      <p className="text-xs font-semibold text-white">{student.name}</p>
                      <p className="text-[11px] text-slate-400">{student.email}</p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                      isSelected ? 'bg-brand-600 border-brand-500 text-white' : 'border-slate-700'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Create Lesson */}
      <Modal isOpen={isCreateLessonOpen} onClose={() => setIsCreateLessonOpen(false)} title="Add Lesson to Course">
        <form onSubmit={handleCreateLesson} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Lesson Title
            </label>
            <input
              type="text"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              placeholder="e.g. 01. Introduction to Hooks"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={lessonDescription}
              onChange={(e) => setLessonDescription(e.target.value)}
              placeholder="Brief summary of what this lesson covers..."
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="lesson-pub-toggle"
              checked={lessonPublished}
              onChange={(e) => setLessonPublished(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="lesson-pub-toggle" className="text-sm text-slate-300 cursor-pointer">
              Publish Lesson for students
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsCreateLessonOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={savingLesson}>
              Create Lesson
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Assign Lesson Editors */}
      <Modal
        isOpen={!!assigningLesson}
        onClose={() => setAssigningLesson(null)}
        title={`Assign Editors for "${assigningLesson?.title}"`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Select editors permitted to modify this lesson's rich content, videos, images, and PDFs.
          </p>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {editorsList.map((editor) => {
              const isChecked = selectedEditorIds.includes(editor.id);
              return (
                <div
                  key={editor.id}
                  onClick={() => toggleEditorSelection(editor.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-brand-600/15 border-brand-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={editor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${editor.name}`}
                      alt={editor.name}
                      className="w-8 h-8 rounded-full bg-slate-800 object-cover"
                    />
                    <div>
                      <p className="text-xs font-semibold text-white">{editor.name}</p>
                      <p className="text-[11px] text-slate-400">{editor.email}</p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                      isChecked ? 'bg-brand-600 border-brand-500 text-white' : 'border-slate-700'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="outline" onClick={() => setAssigningLesson(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveEditorPermissions} loading={savingPermissions}>
              Save Permissions
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Lesson Dialog */}
      <ConfirmDialog
        isOpen={!!deletingLesson}
        onClose={() => setDeletingLesson(null)}
        onConfirm={handleDeleteLesson}
        title="Delete Lesson"
        message={`Are you sure you want to delete "${deletingLesson?.title}"?`}
        loading={savingLesson}
      />

      {/* QR Code Modal */}
      {isQrOpen && (
        <QRCodeModal
          isOpen={isQrOpen}
          onClose={() => setIsQrOpen(false)}
          courseId={course.id}
          courseTitle={course.title}
        />
      )}
    </div>
  );
};
