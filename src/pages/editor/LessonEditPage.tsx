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
import { YouTubeVideoSection } from '../../components/editor/YouTubeVideoSection';
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
  const [youtubeUrl, setYoutubeUrl] = useState<string | null>(null);
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
      setYoutubeUrl(data.lesson.youtubeUrl || null);
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
          youtubeUrl,
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
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }

  const backUrl = isAdmin ? `/admin/books/${lesson.courseId}/edit` : '/editor';

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-16">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to={backUrl}
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Book Editor
        </Link>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSave} className="space-y-8">
        {/* Header Metadata Card */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div>
              <span className="text-xs font-semibold text-stone-500">Book: {lesson.course?.title}</span>
              <h1 className="text-2xl font-serif font-bold text-stone-900 mt-1">Lesson Content Studio</h1>
            </div>
            <Badge variant={published ? 'success' : 'slate'}>
              {published ? 'Published' : 'Draft'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">
                Lesson Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 01. React Core Architecture"
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-stone-400 rounded-xl text-stone-900 text-sm outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">
                Short Summary / Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of what readers will learn..."
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-stone-400 rounded-xl text-stone-900 text-sm outline-none transition-colors"
              />
            </div>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="lesson-pub-check"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 text-stone-700 focus:ring-stone-400 bg-stone-50"
              />
              <label htmlFor="lesson-pub-check" className="text-sm font-medium text-stone-700 cursor-pointer">
                Publish this lesson for public viewing
              </label>
            </div>
          )}
        </div>

        {/* YouTube Video Section */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <YouTubeVideoSection
            youtubeUrl={youtubeUrl}
            onChange={(url) => setYoutubeUrl(url)}
          />
        </div>

        {/* Rich Text Content Section */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div>
            <h3 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-stone-600" />
              Lesson Article Content
            </h3>
            <p className="text-xs text-stone-500 font-medium mt-1">
              Write structured, formatted lesson text with headings, lists, code snippets, blockquotes, and tables.
            </p>
          </div>
          <RichTextEditor content={content} onChange={setContent} />
        </div>

        {/* Media Upload Section */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <MediaUploader
            lessonId={lesson.id}
            mediaList={lesson.media || []}
            onMediaChanged={fetchLesson}
          />
        </div>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-stone-200">
          <button
            type="button"
            onClick={() => navigate(backUrl)}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg border border-stone-200 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};