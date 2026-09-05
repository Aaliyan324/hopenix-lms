import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { Book } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { BookCard } from '../../components/ui/BookCard';
import { CategoryPill } from '../../components/ui/CategoryPill';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { PlayfulBanner } from '../../components/ui/PlayfulBanner';
import { useToast } from '../../components/ui/Toast';
import { AuthPromptModal } from '../../components/auth/AuthPromptModal';
import {
  BookOpen,
  Search,
  Sparkles,
  Filter,
  Compass,
  Flame,
  Star,
  Award,
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

  const handleToggleBookmark = async (bookId: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    try {
      const data = await apiFetch<{ isBookmarked: boolean; message: string }>(`/bookmarks/books/${bookId}`, {
        method: 'POST',
      });

      setBooks((prev) =>
        prev.map((b) => (b.id === bookId ? { ...b, isBookmarked: data.isBookmarked } : b))
      );

      toast(data.message, 'success');
    } catch (err: any) {
      toast('Unable to save bookmark.', 'error');
    }
  };

  const categories = Array.from(new Set(books.map((b) => b.category).filter(Boolean))) as string[];
  const featuredBooks = books.filter((b) => b.featured);

  const categoryEmojis: Record<string, string> = {
    Science: '🔬',
    Technology: '⚡',
    History: '📜',
    Fiction: '🚀',
    Mathematics: '📐',
    Literature: '✍️',
    Art: '🎨',
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-16">
      {/* Playful Hero Banner */}
      <PlayfulBanner
        badgeText="Welcome to the Magic Digital Library"
        badgeIcon={<Sparkles className="w-4 h-4 text-amber-300 animate-spin" />}
        title="Your Next Great Adventure Is Just a Page Away."
        subtitle="Explore interactive e-books, master structured chapters, and track your reading progress — no subscription needed."
        variant="purple"
      >
        {/* Search Bar integrated in Hero */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 pt-2 max-w-2xl">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-brand-300 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title, author, topic, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950/90 border-2 border-brand-500/30 focus:border-pink-400 focus:ring-4 focus:ring-pink-500/20 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-slate-400 shadow-2xl outline-none transition-all font-medium"
            />
          </div>
          <Button type="submit" variant="playful" size="lg" className="rounded-2xl shrink-0">
            Search Books
          </Button>
        </form>
      </PlayfulBanner>

      {/* Category Pills & Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-3xl bg-slate-900/60 border border-purple-500/20 backdrop-blur-md">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <CategoryPill
            label="All Books"
            emoji="📚"
            active={selectedCategory === ''}
            onClick={() => setSelectedCategory('')}
            count={books.length}
          />
          {categories.map((cat) => (
            <CategoryPill
              key={cat}
              label={cat}
              emoji={categoryEmojis[cat] || '✨'}
              active={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}
            />
          ))}
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
          <Filter className="w-4 h-4 text-brand-400" />
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-slate-950 border border-purple-500/30 text-xs font-bold text-slate-200 rounded-xl px-3.5 py-2 outline-none focus:border-brand-400 cursor-pointer shadow-inner"
          >
            <option value="">All Difficulty Levels</option>
            <option value="Beginner">Beginner 🌟</option>
            <option value="Intermediate">Intermediate 🚀</option>
            <option value="Advanced">Advanced 🏆</option>
          </select>
        </div>
      </div>

      {/* Featured Books Section */}
      {featuredBooks.length > 0 && !search && !selectedCategory && (
        <div className="space-y-5">
          <SectionHeader
            badge="Featured Collection"
            title="📚 Must-Read Featured Adventures"
            subtitle="Hand-picked interactive digital books designed for maximum engagement and discovery."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredBooks.slice(0, 2).map((book) => (
              <BookCard
                key={book.id}
                book={book}
                featured={true}
                onSaveToggle={() => handleToggleBookmark(book.id)}
                isSaved={book.isBookmarked}
                progressPercent={book.progressPercent}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Books Catalog Grid */}
      <div className="space-y-6">
        <SectionHeader
          badge={selectedCategory || 'Catalog'}
          title={selectedCategory ? `${selectedCategory} E-Books` : '✨ Explore Full Library Catalog'}
          subtitle={`Showing ${books.length} interactive digital books ready to read.`}
        />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : books.length === 0 ? (
          <EmptyState
            title="No adventure found!"
            description="No digital books match your search or filter criteria. Try clearing search filters to discover more books."
            actionText="Clear All Filters"
            onAction={() => {
              setSearch('');
              setSelectedCategory('');
              setSelectedLevel('');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onSaveToggle={() => handleToggleBookmark(book.id)}
                isSaved={book.isBookmarked}
                progressPercent={book.progressPercent}
              />
            ))}
          </div>
        )}
      </div>

      <AuthPromptModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title="Sign In to Save Books"
        message="Sign in to save books to your personal collection, track completed lessons, and synchronize reading progress across all your devices."
      />
    </div>
  );
};
