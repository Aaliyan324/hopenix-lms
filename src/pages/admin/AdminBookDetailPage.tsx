import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { Book, Lesson, User } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { QRCodeModal } from '../../components/qr/QRCodeModal';
import { RichTextEditor } from '../../components/editor/RichTextEditor';
import { MediaUploader } from '../../components/uploads/MediaUploader';
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
  // Lesson-level QR target: null = book-level QR, otherwise a specific lesson
  const [lessonQrTarget, setLessonQrTarget] = useState<{ id: string; title: string; lessonNumber: number } | null>(null);

  // Book Edit Form state
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [category, setCategory] = useState('');
  const [readingLevel, setReadingLevel] = useState('');
  const [language, setLanguage] = useState('');
  const [publicationYear, setPublicationYear] = useState('');
  const [isbn, setIsbn] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [published, setPublished] = useState(false);

  // Lesson Create Modal
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [creatingLesson, setCreatingLesson] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonNumber, setLessonNumber] = useState('1');
  const [lessonDesc, setLessonDesc] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonReadingTime, setLessonReadingTime] = useState('');
  const [lessonPublished, setLessonPublished] = useState(true);

  useEffect(() => {
    if (id) fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<{ book: Book }>(`/books/${id}`);
      const b = data.book;
      setBook(b);

      // Populate form
      setTitle(b.title || '');
      setAuthor(b.author || '');
      setDescription(b.description || '');
      setShortDescription(b.shortDescription || '');
      setCategory(b.category || 'General');
      setReadingLevel(b.readingLevel || 'Beginner');
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
      await apiFetch(`/books/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title,
          author,
          description,
          shortDescription,
          category,
          readingLevel,
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
          readingTime: lessonReadingTime,
          published: lessonPublished,
        }),
      });

      toast('New lesson created successfully!', 'success');
      setIsLessonModalOpen(false);
      resetLessonForm();
      fetchBook();
    } catch (err: any) {
      toast('Failed to create lesson.', 'error');
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
    setCoverPreview(URL.createObjectURL(file));
    try {
      setUploadingCover(true);
      const formData = new FormData();
      formData.append('cover', file);
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/books/upload-cover', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setCoverImage(data.url);
      toast('Cover image uploaded!', 'success');
    } catch (err: any) {
      toast(err.message || 'Cover upload failed.', 'error');
      setCoverPreview(null);
    } finally {
      setUploadingCover(false);
    }
  };

  const resetLessonForm = () => {
    setLessonTitle('');
    setLessonNumber(String((book?.lessons?.length || 0) + 1));
    setLessonDesc('');
    setLessonContent('');
    setLessonReadingTime('');
    setLessonPublished(true);
  };


  if (loading || !book) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/books"
            className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white leading-tight">{book.title}</h1>
            <p className="text-xs text-slate-400">Book ID: {book.id} • Slug: /{book.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setQrModalOpen(true)}
            icon={<QrCode className="w-4 h-4 text-brand-400" />}
          >
            QR Studio
          </Button>

          <a href={`/books/${book.slug}`} target="_blank" rel="noreferrer">
            <Button variant="secondary" icon={<Eye className="w-4 h-4" />}>
              Preview Public Page
            </Button>
          </a>
        </div>
      </div>

      {/* Book Metadata Settings Form */}
      <form onSubmit={handleUpdateBook} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-400" />
            Book Information & Settings
          </h2>
          <Button variant="primary" type="submit" loading={savingBook} icon={<Save className="w-4 h-4" />}>
            Save Book Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <Input label="Book Title" value={title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} required />
          <Input label="Author" value={author} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuthor(e.target.value)} />
        </div>

        {/* Company Name */}
        <div className="relative">
          <Building2 className="w-3.5 h-3.5 text-brand-400 absolute left-3 top-8 pointer-events-none" />
          <Input
            label="Company / Publisher Name"
            placeholder="e.g. Hopenix Inc., Acme Corp"
            value={companyName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompanyName(e.target.value)}
          />
        </div>

        <div className="space-y-1 text-xs">
          <label className="font-semibold text-slate-300">Book Overview / Description</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl p-3 text-xs text-white outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Category</label>
            <select
              value={category}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
            >
              <option value="Computer Science">Computer Science</option>
              <option value="Programming">Programming</option>
              <option value="Design">Design</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
              <option value="General">General</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Reading Level</label>
            <select
              value={readingLevel}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setReadingLevel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <Input label="Language" value={language} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLanguage(e.target.value)} />
          <Input label="Published Year" value={publicationYear} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPublicationYear(e.target.value)} />
        </div>

        {/* Cover Image: file upload + URL fallback */}
        <div className="space-y-2 text-xs">
          <label className="font-semibold text-slate-300">Cover Image</label>
          <div className="flex gap-3 items-start">
            <div className="relative shrink-0">
              <img
                src={coverPreview || coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=200&q=80'}
                alt="Cover preview"
                className="w-20 h-24 object-cover rounded-xl border border-slate-700 bg-slate-800"
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
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70 rounded-xl">
                  <div className="w-5 h-5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <label className="inline-flex items-center gap-2 px-3 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors w-full justify-center">
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
                className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
              />
            </div>
          </div>
        </div>

        <Input label="ISBN" value={isbn} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsbn(e.target.value)} />

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="pub-check"
            checked={published}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPublished(e.target.checked)}
            className="w-4 h-4 rounded border-slate-800 text-brand-600 focus:ring-brand-500 bg-slate-950"
          />
          <label htmlFor="pub-check" className="text-xs font-semibold text-slate-300 cursor-pointer">
            Published (Visible to public guests in digital library)
          </label>
        </div>
      </form>

      {/* Book Lessons Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-400" />
            Book Lessons ({book.lessons?.length || 0})
          </h2>

          <Button
            variant="primary"
            onClick={() => {
              resetLessonForm();
              setIsLessonModalOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            Add New Lesson
          </Button>
        </div>

        <div className="space-y-3">
          {book.lessons?.map((lesson, idx) => {
            const num = lesson.lessonNumber || idx + 1;
            return (
              <div
                key={lesson.id}
                className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-4">
                  <span className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-sm text-brand-400">
                    L{num}
                  </span>

                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Lesson {num}: {lesson.title}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Slug: /{lesson.slug} • Media: {lesson.media?.length || 0} attachments
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={lesson.published ? 'success' : 'warning'} size="sm">
                    {lesson.published ? 'Published' : 'Draft'}
                  </Badge>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-brand-400 hover:bg-brand-500/10 border border-brand-500/20"
                    onClick={() => {
                      setLessonQrTarget({ id: lesson.id, title: lesson.title, lessonNumber: lesson.lessonNumber || idx + 1 });
                      setQrModalOpen(true);
                    }}
                    icon={<QrCode className="w-3.5 h-3.5" />}
                    title="Generate lesson QR code"
                  />

                  <Link to={`/admin/lessons/${lesson.id}/edit`}>
                    <Button variant="outline" size="sm" icon={<Edit className="w-3.5 h-3.5" />}>
                      Edit Content
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-400 hover:bg-rose-500/10"
                    onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                    icon={<Trash2 className="w-3.5 h-3.5" />}
                  />
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
            <Input
              label="Lesson Number"
              type="number"
              value={lessonNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLessonNumber(e.target.value)}
              required
            />
            <div className="sm:col-span-2">
              <Input
                label="Lesson Title *"
                placeholder="e.g. Introduction to HTML Structure"
                value={lessonTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLessonTitle(e.target.value)}
                required
              />
            </div>
          </div>

          <Input
            label="Lesson Summary"
            placeholder="Brief overview..."
            value={lessonDesc}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLessonDesc(e.target.value)}
          />

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Rich Text Content</label>
            <RichTextEditor content={lessonContent} onChange={setLessonContent} placeholder="Write lesson article content..." />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="l-pub-check"
              checked={lessonPublished}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLessonPublished(e.target.checked)}
              className="w-4 h-4 rounded border-slate-800 text-brand-600 focus:ring-brand-500 bg-slate-950"
            />
            <label htmlFor="l-pub-check" className="text-xs font-semibold text-slate-300 cursor-pointer">
              Publish lesson immediately
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsLessonModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={creatingLesson}>
              Create Lesson
            </Button>
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
    </div>
  );
};

export const AdminCourseDetailPage = AdminBookDetailPage;
