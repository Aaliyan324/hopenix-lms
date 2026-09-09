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
  Eye,
  Edit3,
  Clock,
  Calendar,
  User,
  Tag,
  Layers,
  Upload,
  X,
  ChevronLeft,
  RefreshCw,
} from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
  },
};

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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-56 w-full rounded-3xl" />
          <Skeleton className="h-96 w-full rounded-3xl" />
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  const backUrl = isAdmin ? `/admin/books/${lesson.courseId}/edit` : '/editor';

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30 p-4 sm:p-6 lg:p-8 font-['Inter',sans-serif]">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-8 sm:pb-16"
      >
        {/* Header Banner */}
        <motion.div 
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 via-orange-500 to-orange-400 text-white p-6 sm:p-8 lg:p-10 shadow-2xl"
        >
          <div className="absolute -right-20 -bottom-20 w-72 sm:w-96 h-72 sm:h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none hidden md:block">
            <FileText className="w-48 h-48 text-white" />
          </div>
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold uppercase tracking-wider font-['Poppins',sans-serif]">
                  <FileText className="w-3.5 h-3.5" />
                  Lesson Editor
                </div>
                <h1 className="font-['Poppins',sans-serif] text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight line-clamp-2">
                  {title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-orange-100">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    {lesson.course?.title || 'Untitled Book'}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    Lesson #{lesson.lessonNumber || 'N/A'}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    Last updated: {new Date(lesson.updatedAt || lesson.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                <Badge variant={published ? 'success' : 'slate'} size="lg" className={`font-['Poppins',sans-serif] px-3 py-1.5 text-xs font-semibold ${
                  published 
                    ? 'bg-emerald-500/20 text-emerald-100 border-emerald-500/30' 
                    : 'bg-slate-500/20 text-slate-200 border-slate-500/30'
                }`}>
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
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl transition-all border border-white/20 backdrop-blur-sm font-['Poppins',sans-serif]"
                >
                  <Eye className="w-4 h-4" />
                  <span className="hidden sm:inline">Preview</span>
                  <span className="sm:hidden">View</span>
                </Link>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 bg-white text-orange-600 hover:bg-orange-50 text-sm font-semibold rounded-xl transition-all shadow-lg shadow-orange-700/30 disabled:opacity-50 font-['Poppins',sans-serif]"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Form */}
        <form onSubmit={handleSave} className="space-y-6 sm:space-y-8">
          {/* Header Metadata Card */}
          <motion.div 
            variants={itemVariants}
            className="bg-white/90 backdrop-blur-sm border border-orange-100 rounded-3xl p-5 sm:p-8 shadow-[0_8px_30px_rgba(249,115,22,0.08)] hover:shadow-[0_12px_40px_rgba(249,115,22,0.12)] transition-all duration-300"
          >
            <div className="flex items-center justify-between border-b border-orange-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-orange-50 border border-orange-100 text-orange-600">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 font-['Inter',sans-serif]">Book: {lesson.course?.title || 'Untitled'}</p>
                  <h2 className="text-lg font-['Poppins',sans-serif] font-bold text-slate-900">Lesson Content Studio</h2>
                </div>
              </div>
              <Link
                to={backUrl}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-orange-600 transition-colors font-['Inter',sans-serif]"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Book
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 font-['Poppins',sans-serif]">
                  Lesson Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 01. React Core Architecture"
                  className="w-full px-4 py-2.5 bg-orange-50/30 border border-slate-200/80 focus:border-orange-500 rounded-xl text-slate-900 text-sm outline-none transition-colors font-['Inter',sans-serif]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 font-['Poppins',sans-serif]">
                  Short Summary / Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary of what readers will learn..."
                  className="w-full px-4 py-2.5 bg-orange-50/30 border border-slate-200/80 focus:border-orange-500 rounded-xl text-slate-900 text-sm outline-none transition-colors font-['Inter',sans-serif]"
                />
              </div>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-3 pt-3 border-t border-orange-100 mt-4">
                <input
                  type="checkbox"
                  id="lesson-pub-check"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500 bg-orange-50/30 cursor-pointer"
                />
                <label htmlFor="lesson-pub-check" className="text-sm font-semibold text-slate-700 cursor-pointer font-['Inter',sans-serif]">
                  Publish this lesson for public viewing
                </label>
              </div>
            )}
          </motion.div>

          {/* YouTube Video Section */}
          <motion.div 
            variants={itemVariants}
            className="bg-white/90 backdrop-blur-sm border border-orange-100 rounded-3xl p-5 sm:p-8 shadow-[0_8px_30px_rgba(249,115,22,0.08)]"
          >
            <YouTubeVideoSection
              youtubeUrl={youtubeUrl}
              onChange={(url) => setYoutubeUrl(url)}
            />
          </motion.div>

          {/* Rich Text Content Section */}
          <motion.div 
            variants={itemVariants}
            className="bg-white/90 backdrop-blur-sm border border-orange-100 rounded-3xl p-5 sm:p-8 shadow-[0_8px_30px_rgba(249,115,22,0.08)]"
          >
            <div className="mb-4">
              <h3 className="text-lg font-['Poppins',sans-serif] font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-600" />
                Lesson Article Content
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1 font-['Inter',sans-serif]">
                Write structured, formatted lesson text with headings, lists, code snippets, blockquotes, and tables.
              </p>
            </div>
            <RichTextEditor content={content} onChange={setContent} />
          </motion.div>

          {/* Media Upload Section */}
          <motion.div 
            variants={itemVariants}
            className="bg-white/90 backdrop-blur-sm border border-orange-100 rounded-3xl p-5 sm:p-8 shadow-[0_8px_30px_rgba(249,115,22,0.08)]"
          >
            <MediaUploader
              lessonId={lesson.id}
              mediaList={lesson.media || []}
              onMediaChanged={fetchLesson}
            />
          </motion.div>

          {/* Bottom Save Bar */}
          <motion.div 
            variants={itemVariants}
            className="bg-white/90 backdrop-blur-sm border border-orange-100 rounded-2xl p-4 shadow-[0_8px_30px_rgba(249,115,22,0.08)] flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2 text-xs text-slate-500 font-['Inter',sans-serif]">
              <Clock className="w-3.5 h-3.5" />
              Last saved: {new Date(lesson.updatedAt || lesson.createdAt).toLocaleString()}
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => navigate(backUrl)}
                className="flex-1 sm:flex-none px-6 py-2.5 border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-all shadow-xs font-['Inter',sans-serif]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-orange-500/25 disabled:opacity-50 font-['Poppins',sans-serif]"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save All Changes
                  </span>
                )}
              </button>
            </div>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};