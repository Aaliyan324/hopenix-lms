import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { Book } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/Toast';
import { AuthPromptModal } from '../../components/auth/AuthPromptModal';
import {
  BookOpen,
  Search,
  Bookmark,
  Sparkles,
  Filter,
  Layers,
  Clock,
  UserCheck,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

export const PublicBooksPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, [selectedCategory, selectedLevel]);

  const fetchBooks = async (querySearch = search) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (querySearch) params.set('search', querySearch);
      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedLevel) params.set('readingLevel', selectedLevel);

      const data = await apiFetch<{ books: Book[] }>(`/books?${params.toString()}`);
      setBooks(data.books || []);
    } catch (err: any) {
      toast('Failed to load books catalog.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBooks(search);
  };

  const handleToggleBookmark = async (e: React.MouseEvent, book: Book) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    try {
      const data = await apiFetch<{ isBookmarked: boolean; message: string }>(`/bookmarks/books/${book.id}`, {
        method: 'POST',
      });

      setBooks((prev) =>
        prev.map((b) => (b.id === book.id ? { ...b, isBookmarked: data.isBookmarked } : b))
      );

      toast(data.message, 'success');
    } catch (err: any) {
      toast('Unable to save bookmark.', 'error');
    }
  };

  const categories = Array.from(new Set(books.map((b) => b.category).filter(Boolean))) as string[];
  const featuredBooks = books.filter((b) => b.featured);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-500/20 text-brand-300 rounded-full border border-brand-500/30 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-brand-400" />
            Hopenix Open Digital Library
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Explore Free E-Books & Digital Lessons
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Read comprehensive digital books, study structured lessons, view educational diagrams, videos, and PDFs. No subscription or sign-in required to read.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 pt-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, author, category or topic..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 shadow-inner outline-none transition-all"
              />
            </div>
            <Button type="submit" variant="primary" size="lg" className="rounded-2xl shrink-0">
              Search
            </Button>
          </form>
        </div>
      </div>

      {/* Categories & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              selectedCategory === ''
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Books
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 rounded-xl px-3 py-2 outline-none focus:border-brand-500"
          >
            <option value="">All Difficulty Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Featured Books Section */}
      {featuredBooks.length > 0 && !search && !selectedCategory && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Featured E-Books
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredBooks.slice(0, 2).map((book) => (
              <Link
                key={book.id}
                to={`/books/${book.slug}`}
                className="group bg-gradient-to-br from-slate-900 to-slate-950 border border-brand-500/30 hover:border-brand-500 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row gap-6 transition-all duration-300 relative overflow-hidden"
              >
                <div className="w-full sm:w-44 h-56 bg-slate-950 rounded-2xl overflow-hidden shrink-0 relative">
                  <img
                    src={book.coverImage || book.thumbnail || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 bg-amber-500 text-black font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-md shadow">
                    Featured
                  </span>
                </div>

                <div className="flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs text-brand-400 font-semibold mb-1">
                      <span>{book.category || 'General'}</span>
                      <button
                        onClick={(e) => handleToggleBookmark(e, book)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          book.isBookmarked
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                        title={book.isBookmarked ? 'Saved' : 'Save Book'}
                      >
                        <Bookmark className={`w-4 h-4 ${book.isBookmarked ? 'fill-rose-400' : ''}`} />
                      </button>
                    </div>

                    <h3 className="font-extrabold text-xl text-white group-hover:text-brand-400 transition-colors line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">By {book.author || 'Hopenix'}</p>

                    <p className="text-xs text-slate-300 line-clamp-3 mt-2 leading-relaxed">
                      {book.shortDescription || book.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-medium">
                        <Layers className="w-3.5 h-3.5 text-slate-500" />
                        {book.totalLessons || 0} Lessons
                      </span>
                      {book.readingLevel && (
                        <span className="bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 font-medium">
                          {book.readingLevel}
                        </span>
                      )}
                    </div>
                    <span className="text-brand-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Read <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Books Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-400" />
          {selectedCategory ? `${selectedCategory} Books` : 'All E-Books'} ({books.length})
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : books.length === 0 ? (
          <EmptyState
            title="No books found"
            description="No digital books match your search or filter criteria. Try clearing search filters."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <Link
                key={book.id}
                to={`/books/${book.slug}`}
                className="group bg-slate-900 border border-slate-800 hover:border-brand-500/50 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all duration-200"
              >
                <div>
                  <div className="relative h-48 bg-slate-950 overflow-hidden">
                    <img
                      src={book.coverImage || book.thumbnail || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />

                    <button
                      onClick={(e) => handleToggleBookmark(e, book)}
                      className={`absolute top-3 right-3 p-2 rounded-xl border backdrop-blur-md transition-all ${
                        book.isBookmarked
                          ? 'bg-rose-500 text-white border-rose-400 shadow-lg'
                          : 'bg-slate-950/70 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-900'
                      }`}
                      title={book.isBookmarked ? 'Saved' : 'Save Book'}
                    >
                      <Bookmark className={`w-4 h-4 ${book.isBookmarked ? 'fill-white' : ''}`} />
                    </button>

                    {book.category && (
                      <span className="absolute bottom-3 left-3 text-[11px] font-semibold text-white bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700">
                        {book.category}
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-base text-white group-hover:text-brand-400 transition-colors line-clamp-1">
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-400">By {book.author || 'Hopenix Editorial'}</p>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {book.shortDescription || book.description}
                    </p>

                    {user && typeof book.progressPercent === 'number' && book.progressPercent > 0 && (
                      <div className="pt-2 space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">Your Progress</span>
                          <span className="font-semibold text-brand-400">{book.progressPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-brand-500 h-full rounded-full" style={{ width: `${book.progressPercent}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-slate-800/60 mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-brand-400" />
                    {book.totalLessons || 0} Lessons
                  </span>
                  <span className="text-brand-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                    Read Book →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <AuthPromptModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title="Sign In to Save Books"
        message="Sign in to save books to your personal collection, track completed lessons, and synchronize reading across all your devices."
      />
    </div>
  );
};
