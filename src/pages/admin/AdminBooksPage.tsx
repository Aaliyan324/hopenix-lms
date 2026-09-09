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
  Sparkles,
  Grid,
  List,
  Filter,
  ArrowUpDown,
  Clock,
  Eye,
  TrendingUp,
  Star,
  Calendar,
  Users,
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'lessons'>('newest');

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

  const getSortedBooks = () => {
    const sorted = [...books];
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime());
      case 'title':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'lessons':
        return sorted.sort((a, b) => (b._count?.lessons || 0) - (a._count?.lessons || 0));
      default:
        return sorted;
    }
  };

  if (loading && books.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-56 w-full rounded-3xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const sortedBooks = getSortedBooks();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30 p-4 sm:p-6 lg:p-8 font-['Inter',sans-serif]">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-8 sm:pb-16">
        {/* Header Banner - Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 via-orange-500 to-orange-400 text-white p-6 sm:p-8 lg:p-10 shadow-2xl">
          <div className="absolute -right-20 -bottom-20 w-72 sm:w-96 h-72 sm:h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none hidden md:block">
            <BookOpen className="w-48 h-48 text-white" />
          </div>
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Digital Library Management
              </div>
              <h1 className="font-['Poppins',sans-serif] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                Book Collection
              </h1>
              <p className="text-sm sm:text-base text-orange-100 max-w-2xl leading-relaxed">
                Manage your digital books, track lessons, and organize your educational content in one place.
              </p>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2 text-sm text-orange-100">
                  <BookOpen className="w-4 h-4" />
                  <span className="font-semibold text-white">{books.length}</span>
                  <span>Total Books</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-orange-100">
                  <Eye className="w-4 h-4" />
                  <span className="font-semibold text-white">
                    {books.filter(b => b.published).length}
                  </span>
                  <span>Published</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-orange-100">
                  <Users className="w-4 h-4" />
                  <span className="font-semibold text-white">
                    {books.reduce((acc, b) => acc + (b._count?.lessons || 0), 0)}
                  </span>
                  <span>Total Lessons</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-orange-600 hover:bg-orange-50 text-sm font-semibold rounded-2xl transition-all shadow-lg shadow-orange-700/30 active:scale-[0.98] font-['Poppins',sans-serif]"
              >
                <Plus className="w-4 h-4" />
                New Book
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white/90 backdrop-blur-sm border border-orange-100 rounded-2xl p-4 shadow-[0_8px_30px_rgba(249,115,22,0.08)]">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <form
              onSubmit={(e: React.FormEvent) => {
                e.preventDefault();
                fetchBooks(search);
              }}
              className="relative flex-1 w-full"
            >
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, author, or category..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                className="w-full bg-orange-50/30 border border-slate-200/80 focus:border-orange-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors font-['Inter',sans-serif]"
              />
            </form>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1 bg-orange-50/30 border border-slate-200/80 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-orange-100'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list' 
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-orange-100'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-orange-50/30 border border-slate-200/80 rounded-xl px-3 py-2 pr-8 text-sm text-slate-700 outline-none focus:border-orange-500 appearance-none cursor-pointer font-['Inter',sans-serif]"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="title">Title</option>
                  <option value="lessons">Most Lessons</option>
                </select>
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Books Grid/List View */}
        {sortedBooks.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-sm border border-orange-100 rounded-3xl p-8 sm:p-12 shadow-[0_8px_30px_rgba(249,115,22,0.08)]">
            <EmptyState
              title="No books found"
              description="Start building your digital library by creating your first book."
              actionText="Create Book"
              onAction={() => setIsCreateModalOpen(true)}
            />
          </div>
        ) : (
          <div>
            {viewMode === 'grid' ? (
              // Grid View
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {sortedBooks.map((book) => (
                  <div
                    key={book.id}
                    className="group bg-white/90 backdrop-blur-sm border border-orange-100 rounded-2xl overflow-hidden hover:shadow-xl hover:border-orange-300 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-orange-100 to-orange-50">
                      <img
                        src={book.coverImage || book.thumbnail || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2 right-2 flex gap-1.5">
                        <Badge variant={book.published ? 'success' : 'warning'} size="sm" className="shadow-md font-['Inter',sans-serif] text-[10px]">
                          {book.published ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      {book._count?.lessons > 0 && (
                        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                          <Layers className="w-3 h-3" />
                          {book._count?.lessons} Lessons
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 space-y-3">
                      <div>
                        <Link
                          to={`/admin/books/${book.id}/edit`}
                          className="font-['Poppins',sans-serif] font-semibold text-slate-900 hover:text-orange-600 transition-colors line-clamp-1 text-sm"
                        >
                          {book.title}
                        </Link>
                        <p className="text-xs text-slate-500 font-['Inter',sans-serif]">By {book.author || 'Hopenix'}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="slate" size="sm" className="bg-orange-100 text-orange-700 border-orange-200 text-[10px]">
                          {book.category || 'General'}
                        </Badge>
                        <Badge variant="slate" size="sm" className="bg-slate-100 text-slate-600 border-slate-200 text-[10px]">
                          {book.readingLevel || 'Beginner'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-orange-50">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setQrModalBook({ id: book.id, title: book.title })}
                            className="p-1.5 rounded-lg hover:bg-orange-50 text-slate-500 hover:text-orange-600 transition-colors"
                            title="Generate QR Code"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                          <Link to={`/admin/books/${book.id}/edit`}>
                            <button className="p-1.5 rounded-lg hover:bg-orange-50 text-slate-500 hover:text-orange-600 transition-colors">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDeleteBook(book.id, book.title)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-400 font-['Inter',sans-serif] flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(book.createdAt || '').toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List View
              <div className="bg-white/90 backdrop-blur-sm border border-orange-100 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(249,115,22,0.08)]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-orange-50/50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-orange-100 font-semibold font-['Poppins',sans-serif]">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 sm:py-4">Book</th>
                        <th className="px-3 sm:px-4 py-3 sm:py-4 hidden sm:table-cell">Category</th>
                        <th className="px-3 sm:px-4 py-3 sm:py-4 hidden md:table-cell">Lessons</th>
                        <th className="px-3 sm:px-4 py-3 sm:py-4">Status</th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-orange-50">
                      {sortedBooks.map((book) => (
                        <tr key={book.id} className="hover:bg-orange-50/40 transition-colors group">
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            <div className="flex items-center gap-3 sm:gap-3.5">
                              <img
                                src={book.coverImage || book.thumbnail || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80'}
                                alt={book.title}
                                className="w-10 h-12 object-cover rounded-lg border border-orange-200 shrink-0 shadow-xs"
                              />
                              <div className="min-w-0">
                                <Link
                                  to={`/admin/books/${book.id}/edit`}
                                  className="font-semibold text-slate-900 hover:text-orange-600 transition-colors line-clamp-1 font-['Poppins',sans-serif] text-sm"
                                >
                                  {book.title}
                                </Link>
                                <p className="text-xs text-slate-500 font-['Inter',sans-serif]">By {book.author || 'Hopenix'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-4 py-3 sm:py-4 hidden sm:table-cell">
                            <Badge variant="slate" size="sm" className="bg-orange-100 text-orange-700 border-orange-200 font-['Inter',sans-serif] text-[10px]">
                              {book.category || 'General'}
                            </Badge>
                          </td>
                          <td className="px-3 sm:px-4 py-3 sm:py-4 hidden md:table-cell">
                            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 font-['Poppins',sans-serif]">
                              <Layers className="w-3.5 h-3.5 text-slate-600" />
                              {book._count?.lessons ?? 0}
                            </span>
                          </td>
                          <td className="px-3 sm:px-4 py-3 sm:py-4">
                            <Badge variant={book.published ? 'success' : 'warning'} size="sm" className="font-['Inter',sans-serif] text-[10px]">
                              {book.published ? 'Published' : 'Draft'}
                            </Badge>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-right space-x-1.5 sm:space-x-2">
                            <button
                              onClick={() => setQrModalBook({ id: book.id, title: book.title })}
                              className="inline-flex items-center justify-center p-1.5 rounded-lg border border-orange-200 bg-white hover:bg-orange-50 hover:border-orange-300 text-slate-700 transition-all shadow-xs"
                              title="Generate QR Code"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </button>
                            <Link to={`/admin/books/${book.id}/edit`} className="inline-block">
                              <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg border border-orange-200 bg-white hover:bg-orange-50 hover:border-orange-300 text-[10px] sm:text-xs font-semibold text-slate-700 transition-all shadow-xs font-['Inter',sans-serif]">
                                <Edit className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Edit
                              </span>
                            </Link>
                            <button
                              onClick={() => handleDeleteBook(book.id, book.title)}
                              className="inline-flex items-center justify-center p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition-all shadow-xs"
                              title="Delete Book"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create Book Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Digital Book"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateBook} className="space-y-5 text-sm font-['Inter',sans-serif]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Book Title *"
                placeholder="e.g. Introduction to Web Development"
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                required
                className="bg-orange-50/30 border-slate-200/80 focus:border-orange-500 rounded-xl font-['Inter',sans-serif]"
              />
              <Input
                label="Author Name"
                placeholder="e.g. Hopenix Editorial"
                value={author}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuthor(e.target.value)}
                className="bg-orange-50/30 border-slate-200/80 focus:border-orange-500 rounded-xl font-['Inter',sans-serif]"
              />
            </div>

            <div className="relative">
              <Building2 className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-8 pointer-events-none" />
              <Input
                label="Company / Publisher Name"
                placeholder="e.g. Hopenix Inc., Acme Corp"
                value={companyName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompanyName(e.target.value)}
                className="bg-orange-50/30 border-slate-200/80 focus:border-orange-500 rounded-xl pl-9 font-['Inter',sans-serif]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 font-['Poppins',sans-serif] text-sm">Book Description / Overview *</label>
              <textarea
                rows={3}
                placeholder="Detailed description of the e-book..."
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                className="w-full bg-orange-50/30 border border-slate-200/80 focus:border-orange-500 rounded-xl p-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors font-['Inter',sans-serif]"
                required
              />
            </div>

            <div>
              <Input
                label="Short Summary"
                placeholder="1-2 sentences for book card preview..."
                value={shortDescription}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShortDescription(e.target.value)}
                className="bg-orange-50/30 border-slate-200/80 focus:border-orange-500 rounded-xl font-['Inter',sans-serif]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700 font-['Poppins',sans-serif] text-sm">CLASS / GRADE</label>
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
                  className="w-full bg-orange-50/30 border border-slate-200/80 focus:border-orange-500 rounded-xl px-3 py-2.5 text-sm text-slate-900 outline-none font-['Inter',sans-serif]"
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
                  <label className="font-semibold text-slate-700 font-['Poppins',sans-serif] text-sm">SUBJECT</label>
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
                  className="w-full bg-orange-50/30 border border-slate-200/80 focus:border-orange-500 rounded-xl px-3 py-2.5 text-sm text-slate-900 outline-none font-['Inter',sans-serif]"
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
                className="bg-orange-50/30 border-slate-200/80 focus:border-orange-500 rounded-xl font-['Inter',sans-serif]"
              />
            </div>

            {/* Cover Image */}
            <div className="space-y-2">
              <label className="block font-semibold text-slate-700 font-['Poppins',sans-serif] text-sm">Cover Image</label>
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

            <Input
              label="ISBN (Optional)"
              placeholder="978-3-16-148410-0"
              value={isbn}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsbn(e.target.value)}
              className="bg-orange-50/30 border-slate-200/80 focus:border-orange-500 rounded-xl font-['Inter',sans-serif]"
            />

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="published-toggle"
                checked={published}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPublished(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500 bg-orange-50/30 cursor-pointer"
              />
              <label htmlFor="published-toggle" className="text-sm text-slate-700 font-semibold cursor-pointer font-['Inter',sans-serif]">
                Publish immediately (visible in public library)
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-orange-100">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2.5 border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-all shadow-xs font-['Inter',sans-serif]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-orange-500/25 disabled:opacity-50 font-['Poppins',sans-serif]"
              >
                {saving ? 'Creating...' : 'Create E-Book'}
              </button>
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
    </div>
  );
};