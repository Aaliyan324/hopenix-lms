import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { Book } from '../../types';
import { Skeleton } from '../../components/ui/Skeleton';
import { BookCard } from '../../components/ui/BookCard';
import { useToast } from '../../components/ui/Toast';
import { AuthPromptModal } from '../../components/auth/AuthPromptModal';
import { Search, Filter, BookOpen, Sparkles, ArrowRight } from 'lucide-react';

export const PublicBooksPage: React.FC = () => {
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
      toast('Failed to load books.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBooks(search);
  };

  const categories = Array.from(new Set(books.map((b) => b.category).filter(Boolean))) as string[];
  const featuredBooks = books.filter((b) => b.featured);

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20 px-4 sm:px-6 lg:px-8">
      {/* Hero Banner - Matches dashboard style */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-white p-8 sm:p-10 shadow-editorial border border-stone-800">
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden md:block">
          <Sparkles className="w-40 h-40 text-orange-400" />
        </div>
        
        <div className="relative z-10">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <BookOpen className="w-3.5 h-3.5" />
              Digital Library Catalog
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              Explore Digital Publications
            </h1>
            <p className="text-sm sm:text-base text-stone-300 max-w-xl leading-relaxed font-light">
              Discover curated e-books, publications, and interactive reading chapters for your institution.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 pt-4 w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by publication title, author, or topic..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-stone-400 outline-none transition-all"
                />
              </div>
              <button 
                type="submit" 
                className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-orange-500/25 active:scale-[0.99] text-sm shrink-0"
              >
                Search Library
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Category Pills & Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-stone-200/80 shadow-editorial">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-xl font-semibold text-xs transition-all whitespace-nowrap ${
              selectedCategory === ''
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                : 'bg-stone-100 text-stone-700 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 border border-stone-200'
            }`}
          >
            All Publications ({books.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}
              className={`px-4 py-2 rounded-xl font-semibold text-xs transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'bg-stone-100 text-stone-700 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 border border-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200">
          <Filter className="w-4 h-4 text-stone-500" />
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-transparent text-sm font-semibold text-stone-800 outline-none cursor-pointer"
          >
            <option value="" className="bg-white text-stone-900">All Levels</option>
            <option value="Beginner" className="bg-white text-stone-900">Beginner</option>
            <option value="Intermediate" className="bg-white text-stone-900">Intermediate</option>
            <option value="Advanced" className="bg-white text-stone-900">Advanced</option>
          </select>
        </div>
      </div>

      {/* Featured Books Section */}
      {featuredBooks.length > 0 && !search && !selectedCategory && (
        <div className="space-y-5">
          <div className="flex items-center gap-3 border-b border-stone-200 pb-3">
            <div className="p-2 rounded-2xl bg-orange-50 border border-orange-100 text-orange-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-stone-900">Featured Publications</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredBooks.slice(0, 2).map((book) => (
              <BookCard
                key={book.id}
                book={book}
                featured={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Books Catalog Grid */}
      <div className="space-y-5">
        <div className="flex items-center gap-3 border-b border-stone-200 pb-3">
          <div className="p-2 rounded-2xl bg-orange-50 border border-orange-100 text-orange-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            {selectedCategory ? `${selectedCategory} Publications` : 'All Publications'}
          </h2>
          <span className="ml-auto text-sm font-semibold text-stone-500 bg-stone-50 px-3 py-1 rounded-xl border border-stone-200">
            {books.length} books
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-2xl" />
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="bg-white border border-stone-200/80 rounded-3xl p-12 text-center space-y-4 shadow-editorial">
            <div className="w-20 h-20 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto">
              <BookOpen className="w-10 h-10 text-orange-600" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-stone-900">No Publications Found</h3>
              <p className="text-stone-500 text-sm max-w-md mx-auto mt-1">
                No digital books match your current search or filter criteria.
              </p>
            </div>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('');
                setSelectedLevel('');
              }}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-orange-500/25"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
              />
            ))}
          </div>
        )}
      </div>

      <AuthPromptModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title="Authentication Required"
        message="Sign in as an Admin or Editor to access portal management."
      />
    </div>
  );
};