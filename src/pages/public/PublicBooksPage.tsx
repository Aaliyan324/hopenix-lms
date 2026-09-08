import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { Book } from '../../types';
import { Skeleton } from '../../components/ui/Skeleton';
import { BookCard } from '../../components/ui/BookCard';
import { useToast } from '../../components/ui/Toast';
import { AuthPromptModal } from '../../components/auth/AuthPromptModal';
import { Search, Filter, BookOpen } from 'lucide-react';

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
    <div className="space-y-10 max-w-7xl mx-auto pb-20 px-4 sm:px-6">
      {/* Hero Banner */}
      <div className="bg-white border border-stone-200 rounded-xl p-8 sm:p-10 shadow-xs text-left">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-800 rounded-md border border-stone-200 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5 text-stone-600" /> Digital Library Catalog
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 leading-tight">
            Explore Digital Publications
          </h1>
          <p className="text-stone-600 font-sans text-sm sm:text-base leading-relaxed">
            Discover curated e-books, publications, and interactive reading chapters for your institution.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 pt-3 w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by publication title, author, or topic..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-stone-300 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all font-sans"
              />
            </div>
            <button type="submit" className="bg-stone-900 hover:bg-stone-800 text-stone-50 font-semibold px-6 py-2.5 rounded-lg transition-all text-sm shrink-0">
              Search Library
            </button>
          </form>
        </div>
      </div>

      {/* Category Pills & Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-stone-200 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3.5 py-1.5 rounded-md font-medium text-xs transition-all whitespace-nowrap ${
              selectedCategory === ''
                ? 'bg-stone-900 text-stone-50 shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200/70 border border-stone-200'
            }`}
          >
            All Publications ({books.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}
              className={`px-3.5 py-1.5 rounded-md font-medium text-xs transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-stone-50 shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200/70 border border-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto bg-stone-50 px-3 py-1.5 rounded-md border border-stone-200">
          <Filter className="w-3.5 h-3.5 text-stone-500" />
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-transparent text-xs font-semibold text-stone-800 outline-none cursor-pointer"
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
        <div className="space-y-4">
          <div className="border-b border-stone-200 pb-2">
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
      <div className="space-y-4">
        <div className="border-b border-stone-200 pb-2">
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            {selectedCategory ? `${selectedCategory} Publications` : 'All Publications'}
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl bg-stone-200/70" />
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-xl p-12 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-stone-400 mx-auto" />
            <h3 className="font-serif text-xl font-bold text-stone-900">No Publications Found</h3>
            <p className="text-stone-600 font-sans text-xs max-w-md mx-auto">
              No digital books match your current search or filter criteria.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('');
                setSelectedLevel('');
              }}
              className="bg-stone-900 hover:bg-stone-800 text-stone-50 font-semibold px-4 py-2 rounded-lg text-xs"
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