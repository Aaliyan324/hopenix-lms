import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { Book } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/Toast';
import { QRCodeModal } from '../../components/qr/QRCodeModal';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  QrCode,
  Search,
  Layers,
  Upload,
  Building2,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { ClassGrade, Subject } from '../../types';
import { AddOptionModal } from '../../components/ui/AddOptionModal';

export const AdminBooksPage: React.FC = () => {
  const { toast } = useToast();

  const [books, setBooks] = useState<Book[]>([]);
  const [classGrades, setClassGrades] = useState<ClassGrade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Selected QR Code Modal
  const [qrModalBook, setQrModalBook] = useState<{ id: string; title: string } | null>(null);

  // Form inputs
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [classGradeId, setClassGradeId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [category, setCategory] = useState('');
  const [readingLevel, setReadingLevel] = useState('');
  const [language, setLanguage] = useState('English');
  const [publicationYear, setPublicationYear] = useState('2026');
  const [isbn, setIsbn] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [published, setPublished] = useState(true);

  useEffect(() => {
    fetchBooks();
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const [cgData, sbData] = await Promise.all([
        apiFetch<{ classGrades: ClassGrade[] }>('/class-grades'),
        apiFetch<{ subjects: Subject[] }>('/subjects'),
      ]);
      const cgs = cgData.classGrades || [];
      const sbs = sbData.subjects || [];
      setClassGrades(cgs);
      setSubjects(sbs);
      if (cgs.length > 0 && !classGradeId) {
        const c9 = cgs.find((c) => c.name.toLowerCase().includes('class 9') || c.name.toLowerCase().includes('grade 9')) || cgs[0];
        setClassGradeId(c9.id);
        setReadingLevel(c9.name);
      }
      if (sbs.length > 0 && !subjectId) {
        const math = sbs.find((s) => s.name.toLowerCase().includes('mathematic') || s.name.toLowerCase().includes('computer')) || sbs[0];
        setSubjectId(math.id);
        setCategory(math.name);
      }
    } catch (err) {
      console.error('Failed to load options:', err);
    }
  };

  const fetchBooks = async (searchQuery = search) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      const data = await apiFetch<{ books: Book[] }>(`/books?${params.toString()}`);
      setBooks(data.books || []);
    } catch (err: any) {
      toast('Failed to fetch books list.', 'error');
    } finally {
      setLoading(false);
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
      toast('Cover image ready!', 'success');
    };
    reader.onerror = () => {
      toast('Failed to read image file.', 'error');
      setUploadingCover(false);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      toast('Title and description are required.', 'error');
      return;
    }

    try {
      setSaving(true);
      const selCg = classGrades.find((c) => c.id === classGradeId);
      const selSb = subjects.find((s) => s.id === subjectId);

      await apiFetch('/books', {
        method: 'POST',
        body: JSON.stringify({
          title,
          author,
          companyName,
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
          published,
        }),
      });

      toast('New digital book created successfully!', 'success');
      setIsCreateModalOpen(false);
      resetForm();
      fetchBooks();
    } catch (err: any) {
      toast(err.message || 'Failed to create book.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBook = async (bookId: string, bookTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${bookTitle}"? This will remove all associated lessons and bookmarks.`)) {
      return;
    }

    try {
      await apiFetch(`/books/${bookId}`, { method: 'DELETE' });
      toast('Book deleted successfully.', 'success');
      setBooks((prev) => prev.filter((b) => b.id !== bookId));
    } catch (err: any) {
      toast('Failed to delete book.', 'error');
    }
  };

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setCompanyName('');
    setDescription('');
    setShortDescription('');
    setLanguage('English');
    setPublicationYear('2026');
    setIsbn('');
    setCoverImage('');
    setCoverPreview(null);
    setPublished(true);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-brand-400" />
            Digital Books Catalog Management
          </h1>
          <p className="text-sm text-slate-400">Publish, manage lessons, and generate QR codes for e-books.</p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
          className="shadow-lg shadow-brand-500/20"
        >
          Create New Book
        </Button>
      </div>

      {/* Search & Actions Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <form
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            fetchBooks(search);
          }}
          className="relative w-full sm:w-80"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search books..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none"
          />
        </form>

        <span className="text-xs text-slate-400">Total Books: <strong className="text-white">{books.length}</strong></span>
      </div>

      {/* Books Table / Grid */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : books.length === 0 ? (
        <EmptyState
          title="No books found"
          description="Click 'Create New Book' to add your first digital book to the e-book portal."
          actionText="Create Book"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Book Details</th>
                  <th className="px-4 py-4">Category / Level</th>
                  <th className="px-4 py-4">Lessons</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-slate-950/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={book.coverImage || book.thumbnail || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80'}
                          alt={book.title}
                          className="w-10 h-12 object-cover rounded-lg border border-slate-800 shrink-0"
                        />
                        <div>
                          <Link
                            to={`/admin/books/${book.id}/edit`}
                            className="font-semibold text-white text-sm hover:text-brand-400 transition-colors line-clamp-1"
                          >
                            {book.title}
                          </Link>
                          <p className="text-[11px] text-slate-400">By {book.author || 'Hopenix'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <Badge variant="brand" size="sm">
                          {book.category || 'General'}
                        </Badge>
                        <p className="text-[11px] text-slate-400">{book.readingLevel || 'Beginner'}</p>
                      </div>
                    </td>

                    <td className="px-4 py-4 font-semibold text-white">
                      <span className="inline-flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-brand-400" />
                        {book._count?.lessons ?? book.totalLessons ?? 0} Lessons
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <Badge variant={book.published ? 'success' : 'warning'} size="sm">
                        {book.published ? 'Published' : 'Draft'}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setQrModalBook({ id: book.id, title: book.title })}
                        icon={<QrCode className="w-3.5 h-3.5 text-brand-400" />}
                        title="Generate QR Code"
                      />
                      <Link to={`/admin/books/${book.id}/edit`}>
                        <Button variant="outline" size="sm" icon={<Edit className="w-3.5 h-3.5" />}>
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-400 hover:bg-rose-500/10"
                        onClick={() => handleDeleteBook(book.id, book.title)}
                        icon={<Trash2 className="w-3.5 h-3.5" />}
                        title="Delete Book"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Book Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Digital Book"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateBook} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Book Title *"
              placeholder="e.g. Introduction to Web Development"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              required
            />
            <Input
              label="Author Name"
              placeholder="e.g. Hopenix Editorial"
              value={author}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuthor(e.target.value)}
            />
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

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Book Description / Overview *</label>
            <textarea
              rows={3}
              placeholder="Detailed description of the e-book..."
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none"
              required
            />
          </div>

          <div>
            <Input
              label="Short Summary"
              placeholder="1-2 sentences for book card preview..."
              value={shortDescription}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShortDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-300">CLASS / GRADE</label>
                <button
                  type="button"
                  onClick={() => setIsAddClassModalOpen(true)}
                  className="text-[11px] font-bold text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Another
                </button>
              </div>
              <select
                value={classGradeId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setClassGradeId(e.target.value);
                  const cg = classGrades.find((c) => c.id === e.target.value);
                  if (cg) setReadingLevel(cg.name);
                }}
                className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="">Select Class / Grade...</option>
                {classGrades.map((cg) => (
                  <option key={cg.id} value={cg.id}>
                    {cg.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-300">SUBJECT</label>
                <button
                  type="button"
                  onClick={() => setIsAddSubjectModalOpen(true)}
                  className="text-[11px] font-bold text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Another
                </button>
              </div>
              <select
                value={subjectId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setSubjectId(e.target.value);
                  const sb = subjects.find((s) => s.id === e.target.value);
                  if (sb) setCategory(sb.name);
                }}
                className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="">Select Subject...</option>
                {subjects.map((sb) => (
                  <option key={sb.id} value={sb.id}>
                    {sb.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Language"
              value={language}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLanguage(e.target.value)}
            />
          </div>

          {/* Cover Image: file upload + URL fallback */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-300">Cover Image</label>
            <div className="flex gap-3 items-start">
              {/* Preview */}
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
                {/* File upload button */}
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
                {/* URL fallback */}
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

          <Input
            label="ISBN (Optional)"
            placeholder="978-3-16-148410-0"
            value={isbn}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsbn(e.target.value)}
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="published-toggle"
              checked={published}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPublished(e.target.checked)}
              className="w-4 h-4 rounded border-slate-800 text-brand-600 focus:ring-brand-500 bg-slate-950"
            />
            <label htmlFor="published-toggle" className="text-xs text-slate-300 font-semibold cursor-pointer">
              Publish immediately (visible in public library)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={saving}>
              Create E-Book
            </Button>
          </div>
        </form>
      </Modal>

      {/* QR Code Modal */}
      {qrModalBook && (
        <QRCodeModal
          isOpen={Boolean(qrModalBook)}
          onClose={() => setQrModalBook(null)}
          courseId={qrModalBook.id}
          courseTitle={qrModalBook.title}
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
