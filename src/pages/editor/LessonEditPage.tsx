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
import { 
  ArrowLeft, 
  Save, 
  FileText, 
  CheckCircle2,
  Sparkles,
  BookOpen,
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';

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
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }

  const backUrl = isAdmin ? `/admin/books/${lesson.courseId}/edit` : '/editor';

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* Header Banner - Matches dashboard style */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 sm:p-10 shadow-editorial border border-slate-800">
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden md:block">
          <Sparkles className="w-40 h-40 text-orange-400" />
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <FileText className="w-3.5 h-3.5" />
              Lesson Editor
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white">
              {title}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed font-light">
              Book: {lesson.course?.title || 'Untitled Book'} • Lesson #{lesson.lessonNumber || 'N/A'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={published ? 'success' : 'slate'} size="lg" className={`px-4 py-1.5 text-sm font-semibold ${published ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
              {published ? (
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Published
                </span>
              ) : (
                'Draft'
              )}
            </Badge>

            <Link
              to={`/lessons/${lesson.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-2xl border border-white/20 transition-all backdrop-blur-sm"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Link>

            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-2xl transition-all shadow-lg shadow-orange-500/25 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSave} className="space-y-8">
        {/* Header Metadata Card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-editorial hover:shadow-editorial transition-shadow">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-orange-50 border border-orange-100 text-orange-600">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Book: {lesson.course?.title || 'Untitled'}</p>
                <h2 className="text-lg font-serif font-bold text-slate-900">Lesson Content Studio</h2>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Lesson Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 01. React Core Architecture"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl text-slate-900 text-sm outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Short Summary / Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of what readers will learn..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl text-slate-900 text-sm outline-none transition-colors"
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
                className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500 bg-slate-50 cursor-pointer"
              />
              <label htmlFor="lesson-pub-check" className="text-sm font-semibold text-slate-700 cursor-pointer">
                Publish this lesson for public viewing
              </label>
            </div>
          )}
        </div>

        {/* YouTube Video Section */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-editorial">
          <YouTubeVideoSection
            youtubeUrl={youtubeUrl}
            onChange={(url) => setYoutubeUrl(url)}
          />
        </div>

        {/* Rich Text Content Section */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-4 shadow-editorial">
          <div>
            <h3 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-600" />
              Lesson Article Content
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Write structured, formatted lesson text with headings, lists, code snippets, blockquotes, and tables.
            </p>
          </div>
          <RichTextEditor content={content} onChange={setContent} />
        </div>

        {/* Media Upload Section */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-editorial">
          <MediaUploader
            lessonId={lesson.id}
            mediaList={lesson.media || []}
            onMediaChanged={fetchLesson}
          />
        </div>

        {/* Bottom Save Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
          <Link
            to={backUrl}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Book Editor
          </Link>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => navigate(backUrl)}
              className="flex-1 sm:flex-none px-6 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-all shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-orange-500/25 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};