import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { Lesson } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { RichTextEditor } from '../../components/editor/RichTextEditor';
import { MediaUploader } from '../../components/uploads/MediaUploader';
import { ArrowLeft, Save, FileText, CheckCircle2 } from 'lucide-react';

export const LessonEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(false);

  useEffect(() => {
    if (id) fetchLesson();
  }, [id]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<{ lesson: Lesson }>(`/lessons/${id}`);
      setLesson(data.lesson);
      setTitle(data.lesson.title);
      setDescription(data.lesson.description || '');
      setContent(data.lesson.content || '');
      setPublished(data.lesson.published);
    } catch (err: any) {
      toast(err.message || 'Failed to load lesson. You might not have edit permission.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !title) return;

    try {
      setSaving(true);
      const data = await apiFetch<{ lesson: Lesson }>(`/lessons/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title,
          description,
          content,
          published,
        }),
      });
      setLesson(data.lesson);
      toast('Lesson content saved successfully!', 'success');
    } catch (err: any) {
      toast(err.message || 'Failed to save lesson updates.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !lesson) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  const backUrl = isAdmin ? `/admin/books/${lesson.courseId}/edit` : '/editor';

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to={backUrl}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Book Editor
        </Link>

        <Button onClick={handleSave} variant="primary" loading={saving} icon={<Save className="w-4 h-4" />}>
          Save Changes
        </Button>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSave} className="space-y-8">
        {/* Header Metadata Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-semibold text-brand-400">Book: {lesson.course?.title}</span>
              <h1 className="text-2xl font-extrabold text-white mt-1">Lesson Content Studio</h1>
            </div>
            <Badge variant={published ? 'success' : 'slate'}>
              {published ? 'Published' : 'Draft'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Lesson Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 01. React Core Architecture"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Short Summary / Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of what students will learn..."
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="lesson-pub-check"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="lesson-pub-check" className="text-sm font-medium text-slate-200 cursor-pointer">
              Publish this lesson for student viewing
            </label>
          </div>
        </div>

        {/* Rich Text Content Section */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-400" />
            Lesson Article Content
          </h3>
          <p className="text-xs text-slate-400">
            Write structured, formatted lesson text with headings, lists, code snippets, blockquotes, and tables.
          </p>
          <RichTextEditor content={content} onChange={setContent} />
        </div>

        {/* Media Upload Section */}
        <div className="pt-4 border-t border-slate-800">
          <MediaUploader
            lessonId={lesson.id}
            mediaList={lesson.media || []}
            onMediaChanged={fetchLesson}
          />
        </div>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-800">
          <Button type="button" variant="outline" onClick={() => navigate(backUrl)}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={saving} icon={<Save className="w-4 h-4" />}>
            Save All Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
