import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { Book, Lesson, User, ClassGrade, Subject } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { QRCodeModal } from '../../components/qr/QRCodeModal';
import { RichTextEditor } from '../../components/editor/RichTextEditor';
import { MediaUploader } from '../../components/uploads/MediaUploader';
import { AddOptionModal } from '../../components/ui/AddOptionModal';
import { YouTubeVideoSection } from '../../components/editor/YouTubeVideoSection';
import {
  ArrowLeft,
  BookOpen,
  Plus,
  Edit,
  Trash2,
  QrCode,
  Layers,
  Save,
  Eye,
  Upload,
  Building2,
  X,
} from 'lucide-react';

export const AdminBookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingBook, setSavingBook] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [lessonQrTarget, setLessonQrTarget] = useState<{ id: string; title: string; lessonNumber: number } | null>(null);

  // Book Edit Form state
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [readingLevel, setReadingLevel] = useState('Class 9');
  const [language, setLanguage] = useState('English');
  const [publicationYear, setPublicationYear] = useState('2026');
  const [isbn, setIsbn] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [published, setPublished] = useState(true);

  // Class & Subject options
  const [classGrades, setClassGrades] = useState<ClassGrade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classGradeId, setClassGradeId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);

  // Lesson Create Modal
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [creatingLesson, setCreatingLesson] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonNumber, setLessonNumber] = useState('1');
  const [lessonDesc, setLessonDesc] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonReadingTime, setLessonReadingTime] = useState('');
  const [lessonYoutubeUrl, setLessonYoutubeUrl] = useState<string | null>(null);
  const [lessonPublished, setLessonPublished] = useState(true);

  useEffect(() => {
    if (id) {
      fetchBook();
      fetchOptions();
    }
  }, [id]);

  const fetchOptions = async () => {
    try {
      const [cgData, sbData] = await Promise.all([
        apiFetch<{ classGrades: ClassGrade[] }>('/class-grades'),
        apiFetch<{ subjects: Subject[] }>('/subjects'),
      ]);
      setClassGrades(cgData.classGrades || []);
      setSubjects(sbData.subjects || []);
    } catch (err) {
      console.error('Failed to load options:', err);
    }
  };

  const fetchBook = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<{ book: Book }>(`/books/${id}`);
      const b = data.book;
      setBook(b);

      setTitle(b.title || '');
      setAuthor(b.author || '');
      setDescription(b.description || '');
      setShortDescription(b.shortDescription || '');
      setCategory(b.category || 'General');
      setReadingLevel(b.readingLevel || 'Class 9');
      setClassGradeId(b.classGradeId || '');
      setSubjectId(b.subjectId || '');
      setLanguage(b.language || 'English');
      setPublicationYear(b.publicationYear ? String(b.publicationYear) : '2026');
      setIsbn(b.isbn || '');
      setCoverImage(b.coverImage || b.thumbnail || '');
      setCoverPreview(null);
      setCompanyName(b.companyName || '');
      setPublished(b.published || false);
    } catch (err: any) {
      toast('Failed to load book details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setSavingBook(true);
      const selCg = classGrades.find((c) => c.id === classGradeId);
      const selSb = subjects.find((s) => s.id === subjectId);

      await apiFetch(`/books/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title,
          author,
          description,
          shortDescription,
          classGradeId,
          subjectId,
          category: selSb?.name || category || 'General',
          readingLevel: selCg?.name || readingLevel || 'Class 9',
          language,
          publicationYear,
          isbn,
          coverImage,
          companyName,
          published,
        }),
      });

      toast('Book details updated successfully!', 'success');
      fetchBook();
    } catch (err: any) {
      toast('Failed to update book.', 'error');
    } finally {
      setSavingBook(false);
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !lessonTitle) {
      toast('Lesson title is required.', 'error');
      return;
    }

    try {
      setCreatingLesson(true);
      await apiFetch('/lessons', {
        method: 'POST',
        body: JSON.stringify({
          bookId: id,
          courseId: id,
          title: lessonTitle,
          lessonNumber: parseInt(lessonNumber, 10),
          description: lessonDesc,
          content: lessonContent,
          youtubeUrl: lessonYoutubeUrl,
          readingTime: lessonReadingTime,
          published: lessonPublished,
        }),
      });

      toast('New lesson created successfully!', 'success');
      setIsLessonModalOpen(false);
      resetLessonForm();
      fetchBook();
    } catch (err: any) {
      toast(err.message || 'Failed to create lesson.', 'error');
    } finally {
      setCreatingLesson(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string, lTitle: string) => {
    if (!window.confirm(`Delete lesson "${lTitle}"?`)) return;

    try {
      await apiFetch(`/lessons/${lessonId}`, { method: 'DELETE' });
      toast('Lesson deleted.', 'success');
      fetchBook();
    } catch (err: any) {
      toast('Failed to delete lesson.', 'error');
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast('Please select an image file.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast('Cover image must be under 5MB.', 'error');
      return;
    }

    setUploadingCover(true);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCoverImage(dataUrl);
      setCoverPreview(dataUrl);
      setUploadingCover(false);
      toast('Cover image ready! Click "Save Changes" to save.', 'success');
    };
    reader.onerror = () => {
      toast('Failed to read image file.', 'error');
      setUploadingCover(false);
    };
    reader.readAsDataURL(file);
  };

  const resetLessonForm = () => {
    setLessonTitle('');
    setLessonNumber(String((book?.lessons?.length || 0) + 1));
    setLessonDesc('');
    setLessonContent('');
    setLessonReadingTime('');
    setLessonYoutubeUrl(null);
    setLessonPublished(true);
  };

  if (loading || !book) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/books"
            className="p-2 bg-stone-100 border border-stone-200 hover:bg-stone-200 rounded-xl text-stone-600 hover:text-stone-900 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-stone-900 leading-tight font-serif">{book.title}</h1>
            <p className="text-xs text-stone-500 font-medium">Book ID: {book.id} • Slug: /{book.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setQrModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg border border-stone-200 transition-all"
          >
            <QrCode className="w-4 h-4 text-stone-600" />
            QR Studio
          </button>

          <a href={`/books/${book.slug}`} target="_blank" rel="noreferrer">
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-lg border border-stone-200 transition-all">
              <Eye className="w-4 h-4 text-stone-500" />
              Preview Public Page
            </button>
          </a>
        </div>
      </div>

      {/* Book Metadata Settings Form */}
      <form onSubmit={handleUpdateBook} className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <h2 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-stone-600" />
            Book Information & Settings
          </h2>
          <button
            type="submit"
            disabled={savingBook}
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {savingBook ? 'Saving...' : 'Save Book Changes'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">Book Title</label>
            <input
              type="text"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 focus:border-stone-400 rounded-xl px-3 py-2 text-sm text-stone-900 outline-none transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">Author</label>
            <input
              type="text"
              value={author}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuthor(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 focus:border-stone-400 rounded-xl px-3 py-2 text-sm text-stone-900 outline-none transition-colors"
            />
          </div>
        </div>

        {/* Company Name */}
        <div className="relative">
          <Building2 className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-8 pointer-events-none" />
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">Company / Publisher Name</label>
            <input
              type="text"
              placeholder="e.g. Hopenix Inc., Acme Corp"
              value={companyName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompanyName(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 focus:border-stone-400 rounded-xl px-3 py-2 text-sm text-stone-900 outline-none transition-colors pl-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-600">Book Overview / Description</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 focus:border-stone-400 rounded-xl p-3 text-sm text-stone-900 outline-none transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-stone-600">CLASS / GRADE</label>
              <button
                type="button"
                onClick={() => setIsAddClassModalOpen(true)}
                className="text-[11px] font-bold text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            <select
              value={classGradeId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setClassGradeId(e.target.value);
                const cg = classGrades.find((c) => c.id === e.target.value);
                if (cg) setReadingLevel(cg.name);
              }}
              className="w-full bg-stone-50 border border-stone-200 focus:border-stone-400 rounded-xl px-3 py-2 text-sm text-stone-900 outline-none transition-colors"
            >
              <option value="">Select Class...</option>
              {classGrades.map((cg) => (
                <option key={cg.id} value={cg.id}>
                  {cg.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-stone-600">SUBJECT</label>
              <button
                type="button"
                onClick={() => setIsAddSubjectModalOpen(true)}
                className="text-[11px] font-bold text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            <select
              value={subjectId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setSubjectId(e.target.value);
                const sb = subjects.find((s) => s.id === e.target.value);
                if (sb) setCategory(sb.name);
              }}
              className="w-full bg-stone-50 border border-stone-200 focus:border-stone-400 rounded-xl px-3 py-2 text-sm text-stone-900 outline-none transition-colors"
            >
              <option value="">Select Subject...</option>
              {subjects.map((sb) => (
                <option key={sb.id} value={sb.id}>
                  {sb.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">Language</label>
            <input
              type="text"
              value={language}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLanguage(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 focus:border-stone-400 rounded-xl px-3 py-2 text-sm text-stone-900 outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">Published Year</label>
            <input
              type="text"
              value={publicationYear}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPublicationYear(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 focus:border-stone-400 rounded-xl px-3 py-2 text-sm text-stone-900 outline-none transition-colors"
            />
          </div>
        </div>

        {/* Cover Image */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-stone-600">Cover Image</label>
          <div className="flex gap-3 items-start">
            <div className="relative shrink-0">
              <img
                src={coverPreview || coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=200&q=80'}
                alt="Cover preview"
                className="w-20 h-24 object-cover rounded-xl border border-stone-200 bg-stone-100"
              />
              {(coverPreview || coverImage) && (
                <button
                  type="button"
                  onClick={() => { setCoverImage(''); setCoverPreview(null); }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 hover:bg-rose-400 flex items-center justify-center transition-colors"
                  title="Remove cover"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              )}
              {uploadingCover && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-xl">
                  <div className="w-5 h-5 border-2 border-stone-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <label className="inline-flex items-center gap-2 px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors w-full justify-center">
                <Upload className="w-4 h-4" />
                {uploadingCover ? 'Uploading…' : 'Upload from Device'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                  disabled={uploadingCover}
                />
              </label>
              <input
                type="url"
                placeholder="Or paste image URL…"
                value={coverImage}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setCoverImage(e.target.value);
                  setCoverPreview(null);
                }}
                className="w-full bg-stone-50 border border-stone-200 focus:border-stone-400 rounded-xl px-3 py-2 text-sm text-stone-900 placeholder-stone-400 outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1.5">ISBN</label>
          <input
            type="text"
            value={isbn}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsbn(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 focus:border-stone-400 rounded-xl px-3 py-2 text-sm text-stone-900 outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="pub-check"
            checked={published}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPublished(e.target.checked)}
            className="w-4 h-4 rounded border-stone-300 text-stone-700 focus:ring-stone-400 bg-stone-50"
          />
          <label htmlFor="pub-check" className="text-sm font-semibold text-stone-700 cursor-pointer">
            Published (Visible to public guests in digital library)
          </label>
        </div>
      </form>

      {/* Book Lessons Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <h2 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-stone-600" />
            Book Lessons ({book.lessons?.length || 0})
          </h2>

          <button
            onClick={() => {
              resetLessonForm();
              setIsLessonModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-semibold rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Add New Lesson
          </button>
        </div>

        <div className="space-y-3">
          {book.lessons?.map((lesson, idx) => {
            const num = lesson.lessonNumber || idx + 1;
            return (
              <div
                key={lesson.id}
                className="flex items-center justify-between p-4 bg-white border border-stone-200 rounded-xl hover:border-stone-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-4">
                  <span className="w-9 h-9 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center font-bold text-sm text-stone-700">
                    L{num}
                  </span>

                  <div>
                    <h3 className="text-sm font-semibold text-stone-900">
                      Lesson {num}: {lesson.title}
                    </h3>
                    <p className="text-xs text-stone-500 font-medium">
                      Slug: /{lesson.slug} • Media: {lesson.media?.length || 0} attachments
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={lesson.published ? 'success' : 'warning'} size="sm">
                    {lesson.published ? 'Published' : 'Draft'}
                  </Badge>

                  <button
                    className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-all border border-stone-200"
                    onClick={() => {
                      setLessonQrTarget({ id: lesson.id, title: lesson.title, lessonNumber: lesson.lessonNumber || idx + 1 });
                      setQrModalOpen(true);
                    }}
                    title="Generate lesson QR code"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </button>

                  <Link to={`/admin/lessons/${lesson.id}/edit`}>
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg border border-stone-200 transition-all">
                      <Edit className="w-3.5 h-3.5" />
                      Edit Content
                    </button>
                  </Link>

                  <button
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all border border-rose-200"
                    onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                    title="Delete lesson"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Lesson Modal */}
      <Modal
        isOpen={isLessonModalOpen}
        onClose={() => setIsLessonModalOpen(false)}
        title="Add Lesson to Book"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateLesson} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">Lesson Number</label>
              <input
                type="number"
                value={lessonNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLessonNumber(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 focus:border-stone-400 rounded-xl px-3 py-2 text-sm text-stone-900 outline-none transition-colors"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">Lesson Title *</label>
              <input
                type="text"
                placeholder="e.g. Introduction to HTML Structure"
                value={lessonTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLessonTitle(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 focus:border-stone-400 rounded-xl px-3 py-2 text-sm text-stone-900 outline-none transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">Lesson Summary</label>
            <input
              type="text"
              placeholder="Brief overview..."
              value={lessonDesc}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLessonDesc(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 focus:border-stone-400 rounded-xl px-3 py-2 text-sm text-stone-900 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">Rich Text Content</label>
            <RichTextEditor content={lessonContent} onChange={setLessonContent} placeholder="Write lesson article content..." />
          </div>

          {/* YouTube Video Section */}
          <YouTubeVideoSection
            youtubeUrl={lessonYoutubeUrl}
            onChange={(url) => setLessonYoutubeUrl(url)}
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="l-pub-check"
              checked={lessonPublished}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLessonPublished(e.target.checked)}
              className="w-4 h-4 rounded border-stone-300 text-stone-700 focus:ring-stone-400 bg-stone-50"
            />
            <label htmlFor="l-pub-check" className="text-sm font-semibold text-stone-700 cursor-pointer">
              Publish lesson immediately
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={() => setIsLessonModalOpen(false)}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg border border-stone-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creatingLesson}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
            >
              {creatingLesson ? 'Creating...' : 'Create Lesson'}
            </button>
          </div>
        </form>
      </Modal>

      {qrModalOpen && (
        <QRCodeModal
          isOpen={qrModalOpen}
          onClose={() => {
            setQrModalOpen(false);
            setLessonQrTarget(null);
          }}
          courseId={book.id}
          courseTitle={book.title}
          lessonId={lessonQrTarget?.id}
          lessonTitle={lessonQrTarget?.title}
          lessonNumber={lessonQrTarget?.lessonNumber}
        />
      )}

      {/* Add Class / Grade Modal */}
      <AddOptionModal
        isOpen={isAddClassModalOpen}
        onClose={() => setIsAddClassModalOpen(false)}
        type="class"
        onCreated={(newOption) => {
          setClassGrades((prev) => [...prev, newOption as ClassGrade]);
          setClassGradeId(newOption.id);
          setReadingLevel(newOption.name);
        }}
      />

      {/* Add Subject Modal */}
      <AddOptionModal
        isOpen={isAddSubjectModalOpen}
        onClose={() => setIsAddSubjectModalOpen(false)}
        type="subject"
        onCreated={(newOption) => {
          setSubjects((prev) => [...prev, newOption as Subject]);
          setSubjectId(newOption.id);
          setCategory(newOption.name);
        }}
      />
    </div>
  );
};

export const AdminCourseDetailPage = AdminBookDetailPage;