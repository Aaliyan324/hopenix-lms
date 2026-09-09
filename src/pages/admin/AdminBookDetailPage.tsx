import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { Book, Lesson, ClassGrade, Subject } from '../../types';
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
  Sparkles,
  Shield,
  Calendar,
  User,
  Tag,
  Clock,
  ChevronRight,
  Search,
  Filter,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const AdminBookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingBook, setSavingBook] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [lessonQrTarget, setLessonQrTarget] = useState<{ id: string; title: string; lessonNumber: number } | null>(null);

  // Lesson search state
  const [lessonSearch, setLessonSearch] = useState('');
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

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

  // Filter lessons whenever search or book changes
  useEffect(() => {
    if (book?.lessons) {
      let filtered = book.lessons;
      
      // Filter by search
      if (lessonSearch.trim()) {
        const searchLower = lessonSearch.toLowerCase();
        filtered = filtered.filter(lesson => 
          lesson.title.toLowerCase().includes(searchLower) ||
          lesson.description?.toLowerCase().includes(searchLower) ||
          lesson.slug?.toLowerCase().includes(searchLower)
        );
      }
      
      // Filter by status
      if (filterStatus === 'published') {
        filtered = filtered.filter(lesson => lesson.published);
      } else if (filterStatus === 'draft') {
        filtered = filtered.filter(lesson => !lesson.published);
      }
      
      setFilteredLessons(filtered);
    }
  }, [book, lessonSearch, filterStatus]);

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

  const clearLessonSearch = () => {
    setLessonSearch('');
    setFilterStatus('all');
  };

  if (loading || !book) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30 p-4 sm:p-6 lg:p-8 font-['Inter',sans-serif]">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-8 sm:pb-16">
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 via-orange-500 to-orange-400 text-white p-6 sm:p-8 lg:p-10 shadow-2xl">
          <div className="absolute -right-20 -bottom-20 w-72 sm:w-96 h-72 sm:h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none hidden md:block">
            <BookOpen className="w-48 h-48 text-white" />
          </div>
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold uppercase tracking-wider font-['Poppins',sans-serif]">
                  <BookOpen className="w-3.5 h-3.5" />
                  Book Editor
                </div>
                <h1 className="font-['Poppins',sans-serif] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                  {book.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-orange-100">
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    {book.author || 'Hopenix'}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-4 h-4" />
                    {book.category || 'General'}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {book.publicationYear || '2026'}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setQrModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl transition-all border border-white/20 backdrop-blur-sm font-['Poppins',sans-serif]"
                >
                  <QrCode className="w-4 h-4" />
                  QR Studio
                </button>

                <a href={`/books/${book.slug}`} target="_blank" rel="noreferrer">
                  <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-orange-600 hover:bg-orange-50 text-sm font-semibold rounded-xl transition-all shadow-lg shadow-orange-700/30 font-['Poppins',sans-serif]">
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Book Metadata Settings Form */}
        <form onSubmit={handleUpdateBook} className="bg-white/90 backdrop-blur-sm border border-orange-100 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(249,115,22,0.08)] hover:shadow-[0_12px_40px_rgba(249,115,22,0.12)] transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-orange-100 pb-4">
            <h2 className="text-lg font-['Poppins',sans-serif] font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-orange-600" />
              Book Information & Settings
            </h2>
            <button
              type="submit"
              disabled={savingBook}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-orange-500/25 disabled:opacity-50 font-['Poppins',sans-serif]"
            >
              <Save className="w-4 h-4" />
              {savingBook ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-['Poppins',sans-serif]">Book Title</label>
              <input
                type="text"
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                className="w-full bg-orange-50/30 border border-slate-200/80 focus:border-orange-500 rounded-xl px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors font-['Inter',sans-serif]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-['Poppins',sans-serif]">Author</label>
              <input
                type="text"
                value={author}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuthor(e.target.value)}
                className="w-full bg-orange-50/30 border border-slate-200/80 focus:border-orange-500 rounded-xl px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors font-['Inter',sans-serif]"
              />
            </div>
          </div>

          <div className="relative pt-2">
            <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-9 pointer-events-none" />
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-['Poppins',sans-serif]">Company / Publisher Name</label>
              <input
                type="text"
                placeholder="e.g. Hopenix Inc., Acme Corp"
                value={companyName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompanyName(e.target.value)}
                className="w-full bg-orange-50/30 border border-slate-200/80 focus:border-orange-500 rounded-xl px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors pl-9 font-['Inter',sans-serif]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 font-['Poppins',sans-serif]">Book Overview / Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              className="w-full bg-orange-50/30 border border-slate-200/80 focus:border-orange-500 rounded-xl p-3 text-sm text-slate-900 outline-none transition-colors font-['Inter',sans-serif]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-600 font-['Poppins',sans-serif] text-xs">CLASS / GRADE</label>
                <button
                  type="button"
                  onClick={() => setIsAddClassModalOpen(true)}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors flex items-center gap-1 font-['Inter',sans-serif]"
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
                className="w-full bg-orange-50/30 border border-slate-200/80 focus:border-orange-500 rounded-xl px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors font-['Inter',sans-serif]"
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
                <label className="font-semibold text-slate-600 font-['Poppins',sans-serif] text-xs">SUBJECT</label>
                <button
                  type="button"
                  onClick={() => setIsAddSubjectModalOpen(true)}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors flex items-center gap-1 font-['Inter',sans-serif]"
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
                className="w-full bg-orange-50/30 border border-slate-200/80 focus:border-orange-500 rounded-xl px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors font-['Inter',sans-serif]"
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
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-['Poppins',sans-serif]">Language</label>
              <input
                type="text"
                value={language}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLanguage(e.target.value)}
                className="w-full bg-orange-50/30 border border-slate-200/80 focus:border-orange-500 rounded-xl px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors font-['Inter',sans-serif]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-['Poppins',sans-serif]">Published Year</label>
              <input
                type="text"
                value={publicationYear}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPublicationYear(e.target.value)}
                className="w-full bg-orange-50/30 border border-slate-200/80 focus:border-orange-500 rounded-xl px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors font-['Inter',sans-serif]"
              />
            </div>
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 font-['Poppins',sans-serif]">Cover Image</label>
            <div className="flex gap-3 items-start">
              <div className="relative shrink-0">
                <img
                  src={coverPreview || coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=200&q=80'}
                  alt="Cover preview"
                  className="w-20 h-24 object-cover rounded-xl border border-orange-200 bg-slate-100 shadow-xs"
                />
                {(coverPreview || coverImage) && (
                  <button
                    type="button"
                    onClick={() => { setCoverImage(''); setCoverPreview(null); }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center transition-colors shadow-xs"
                    title="Remove cover"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                )}
                {uploadingCover && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-xl">
                    <div className="w-5 h-5 border-2 border-slate-50 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl cursor-pointer transition-colors w-full justify-center shadow-sm font-['Poppins',sans-serif]">
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
                  className="w-full bg-orange-50/30 border border-slate-200/80 focus:border-orange-500 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors font-['Inter',sans-serif]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-['Poppins',sans-serif]">ISBN</label>
            <input
              type="text"
              value={isbn}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsbn(e.target.value)}
              className="w-full bg-orange-50/30 border border-slate-200/80 focus:border-orange-500 rounded-xl px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors font-['Inter',sans-serif]"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="pub-check"
              checked={published}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPublished(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500 bg-orange-50/30 cursor-pointer"
            />
            <label htmlFor="pub-check" className="text-sm font-semibold text-slate-700 cursor-pointer font-['Inter',sans-serif]">
              Published (Visible to public guests in digital library)
            </label>
          </div>
        </form>

        {/* Book Lessons Management with Search */}
        <div className="bg-white/90 backdrop-blur-sm border border-orange-100 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(249,115,22,0.08)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-orange-100 pb-4">
            <div>
              <h2 className="text-lg font-['Poppins',sans-serif] font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-orange-600" />
                Book Lessons
              </h2>
              <p className="text-xs text-slate-500 font-['Inter',sans-serif]">
                {book.lessons?.length || 0} lessons in this book
                {filteredLessons.length !== book.lessons?.length && (
                  <span className="text-orange-600 ml-1">
                    ({filteredLessons.length} shown)
                  </span>
                )}
              </p>
            </div>

            <button
              onClick={() => {
                resetLessonForm();
                setIsLessonModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-orange-500/25 font-['Poppins',sans-serif]"
            >
              <Plus className="w-4 h-4" />
              Add New Lesson
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 pb-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search lessons by title, description, or slug..."
                value={lessonSearch}
                onChange={(e) => setLessonSearch(e.target.value)}
                className="w-full bg-orange-50/30 border border-slate-200/80 focus:border-orange-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors font-['Inter',sans-serif]"
              />
              {lessonSearch && (
                <button
                  onClick={() => setLessonSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1 bg-orange-50/30 border border-slate-200/80 rounded-xl p-1">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    filterStatus === 'all'
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-orange-100'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus('published')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    filterStatus === 'published'
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-orange-100'
                  }`}
                >
                  Published
                </button>
                <button
                  onClick={() => setFilterStatus('draft')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    filterStatus === 'draft'
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-orange-100'
                  }`}
                >
                  Draft
                </button>
              </div>
              
              {(lessonSearch || filterStatus !== 'all') && (
                <button
                  onClick={clearLessonSearch}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-orange-50 rounded-lg transition-colors"
                  title="Clear filters"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {book.lessons?.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl bg-orange-50/30 border border-dashed border-orange-200">
                <BookOpen className="w-8 h-8 text-orange-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-500 font-['Poppins',sans-serif]">No lessons yet</p>
                <p className="text-xs text-slate-400 mt-1 font-['Inter',sans-serif]">Start building your book content by adding lessons.</p>
                <button
                  onClick={() => {
                    resetLessonForm();
                    setIsLessonModalOpen(true);
                  }}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Create First Lesson
                </button>
              </div>
            ) : filteredLessons.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl bg-orange-50/30 border border-dashed border-orange-200">
                <Search className="w-8 h-8 text-orange-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-500 font-['Poppins',sans-serif]">No lessons found</p>
                <p className="text-xs text-slate-400 mt-1 font-['Inter',sans-serif]">
                  Try adjusting your search or filter criteria
                </p>
                <button
                  onClick={clearLessonSearch}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-all"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              </div>
            ) : (
              filteredLessons.map((lesson, idx) => {
                const num = lesson.lessonNumber || idx + 1;
                return (
                  <div
                    key={lesson.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-orange-50/30 border border-orange-100/60 rounded-2xl hover:bg-white hover:border-orange-200 hover:shadow-[0_4px_20px_rgba(249,115,22,0.08)] transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="w-9 h-9 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center font-bold text-sm text-orange-700 font-['Poppins',sans-serif] flex-shrink-0">
                        {num}
                      </span>

                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900 font-['Poppins',sans-serif] truncate">
                          {lesson.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-['Inter',sans-serif]">
                          <span>Slug: /{lesson.slug}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="hidden sm:inline">Media: {lesson.media?.length || 0} attachments</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={lesson.published ? 'success' : 'warning'} size="sm" className={`font-['Inter',sans-serif'] text-[10px] ${
                        lesson.published 
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                          : 'bg-amber-100 text-amber-700 border-amber-200'
                      }`}>
                        {lesson.published ? 'Published' : 'Draft'}
                      </Badge>

                      <button
                        className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all border border-slate-200 hover:border-orange-300"
                        onClick={() => {
                          setLessonQrTarget({ id: lesson.id, title: lesson.title, lessonNumber: lesson.lessonNumber || idx + 1 });
                          setQrModalOpen(true);
                        }}
                        title="Generate lesson QR code"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>

                      <Link to={`/admin/lessons/${lesson.id}/edit`}>
                        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-700 text-xs font-semibold rounded-xl border border-slate-200 hover:border-orange-300 transition-all font-['Inter',sans-serif]">
                          <Edit className="w-3.5 h-3.5" />
                          Edit
                        </button>
                      </Link>

                      <button
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all border border-rose-200 hover:border-rose-300"
                        onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                        title="Delete lesson"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Add Lesson Modal */}
        <Modal
          isOpen={isLessonModalOpen}
          onClose={() => setIsLessonModalOpen(false)}
          title="Add Lesson to Book"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateLesson} className="space-y-5 text-sm font-['Inter',sans-serif]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-['Poppins',sans-serif]">Lesson Number</label>
                <input
                  type="number"
                  value={lessonNumber}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLessonNumber(e.target.value)}
                  className="w-full bg-orange-50/30 border border-slate-200/80 focus:border-orange-500 rounded-xl px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors font-['Inter',sans-serif]"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-['Poppins',sans-serif]">Lesson Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Introduction to HTML Structure"
                  value={lessonTitle}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLessonTitle(e.target.value)}
                  className="w-full bg-orange-50/30 border border-slate-200/80 focus:border-orange-500 rounded-xl px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors font-['Inter',sans-serif]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-['Poppins',sans-serif]">Lesson Summary</label>
              <input
                type="text"
                placeholder="Brief overview..."
                value={lessonDesc}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLessonDesc(e.target.value)}
                className="w-full bg-orange-50/30 border border-slate-200/80 focus:border-orange-500 rounded-xl px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors font-['Inter',sans-serif]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-['Poppins',sans-serif]">Rich Text Content</label>
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
                className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500 bg-orange-50/30 cursor-pointer"
              />
              <label htmlFor="l-pub-check" className="text-sm font-semibold text-slate-700 cursor-pointer font-['Inter',sans-serif]">
                Publish lesson immediately
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-orange-100">
              <button
                type="button"
                onClick={() => setIsLessonModalOpen(false)}
                className="px-4 py-2.5 border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-all shadow-xs font-['Inter',sans-serif]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creatingLesson}
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-orange-500/25 disabled:opacity-50 font-['Poppins',sans-serif]"
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
    </div>
  );
};

export const AdminCourseDetailPage = AdminBookDetailPage;