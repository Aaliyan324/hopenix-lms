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
      toast('Oopsie! Failed to blast off the book rocket.', 'error');
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
    <div className="space-y-12 max-w-7xl mx-auto pb-20 px-4 sm:px-6 relative overflow-hidden">
      {/* Floating Star Stickers for Kiddish Vibe */}
      <div className="absolute top-10 left-6 text-yellow-400 animate-bounce duration-1000 opacity-60 text-2xl select-none pointer-events-none">⭐</div>
      <div className="absolute top-40 right-10 text-pink-400 animate-pulse opacity-50 text-3xl select-none pointer-events-none">💖</div>
      <div className="absolute top-96 left-12 text-cyan-400 animate-spin duration-3000 opacity-40 text-2xl select-none pointer-events-none">✨</div>
      <div className="absolute bottom-60 right-16 text-purple-400 animate-bounce duration-700 opacity-60 text-3xl select-none pointer-events-none">🚀</div>

      {/* Super Fun Playful Hero Banner */}
      <div className="relative rounded-[2.5rem] bg-gradient-to-r from-purple-900 via-indigo-950 to-pink-950 p-8 sm:p-12 border-4 border-dashed border-pink-500/40 shadow-[0_0_50px_rgba(236,72,153,0.25)] text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 backdrop-blur-xl">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-yellow-400 text-slate-950 font-black px-4 py-1.5 rounded-full text-xs uppercase tracking-wider shadow-lg transform -rotate-1 animate-pulse">
            <Sparkles className="w-4 h-4 text-purple-900" /> Welcome to the Secret Reading Clubhouse! 🏰
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-300 tracking-wide drop-shadow-md">
            Pick Your Next Epic Storybook Adventure!
          </h1>
          <p className="text-slate-300 font-bold text-sm sm:text-base leading-relaxed">
            Warp into magical e-books, collect shiny reading badges, and power up your brain with fun interactive chapters! 🚀✨
          </p>

          {/* Search Bar integrated in Hero */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 pt-4 w-full">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-pink-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search magic title, hero, or spaceship topic..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900/90 border-3 border-pink-500/40 focus:border-yellow-300 focus:ring-4 focus:ring-yellow-300/30 rounded-2xl pl-12 pr-4 py-4 text-sm text-white placeholder-slate-400 shadow-inner outline-none transition-all font-bold"
              />
            </div>
            <button type="submit" className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-black px-8 py-4 rounded-2xl shadow-[0_8px_0_rgb(157,23,77)] hover:shadow-[0_4px_0_rgb(157,23,77)] active:shadow-none active:translate-y-2 transition-all shrink-0 tracking-wider text-sm uppercase flex items-center justify-center gap-2 border-2 border-pink-300/30">
              <span>🔍</span> Search Books
            </button>
          </form>
        </div>

        {/* Fun Mascot/Badge illustration placeholder box */}
        <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-b from-purple-800/60 to-pink-900/60 p-6 rounded-3xl border-2 border-yellow-400/40 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-300">
          <div className="text-6xl animate-bounce">🦖📚</div>
          <span className="text-yellow-300 font-black text-xs uppercase tracking-widest mt-3">Reading Buddy!</span>
          <span className="text-slate-300 font-bold text-xs mt-1">100% Fun Guaranteed</span>
        </div>
      </div>

      {/* Category Pills & Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-[2rem] bg-slate-900/80 border-2 border-purple-500/30 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all transform active:scale-95 whitespace-nowrap shadow-md ${
              selectedCategory === ''
                ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 shadow-yellow-500/30 scale-105 border-2 border-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <span>📚</span> All Books ({books.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all transform active:scale-95 whitespace-nowrap shadow-md ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-pink-500/30 scale-105 border-2 border-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <span>{categoryEmojis[cat] || '✨'}</span> {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end md:self-auto bg-slate-950/80 px-4 py-2.5 rounded-2xl border-2 border-purple-500/30">
          <Filter className="w-4 h-4 text-pink-400 animate-spin duration-1000" />
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-transparent text-xs font-black text-yellow-300 outline-none cursor-pointer tracking-wide"
          >
            <option value="" className="bg-slate-900 text-white">🌟 All Difficulty Levels</option>
            <option value="Beginner" className="bg-slate-900 text-white">Beginner Level 🐣</option>
            <option value="Intermediate" className="bg-slate-900 text-white">Intermediate Level 🚀</option>
            <option value="Advanced" className="bg-slate-900 text-white">Advanced Wizard Level 🧙‍♂️</option>
          </select>
        </div>
      </div>

      {/* Featured Books Section */}
      {featuredBooks.length > 0 && !search && !selectedCategory && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⭐</span>
            <div>
              <span className="text-pink-400 text-xs font-black uppercase tracking-widest bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">Featured Collection</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide mt-1">Super Duper Featured Adventures!</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredBooks.slice(0, 2).map((book) => (
              <div key={book.id} className="transform hover:-translate-y-1 transition-transform">
                <BookCard
                  book={book}
                  featured={true}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Books Catalog Grid */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🚀</span>
          <div>
            <span className="text-cyan-400 text-xs font-black uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
              {selectedCategory || 'Library Galaxy'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide mt-1">
              {selectedCategory ? `${selectedCategory} Magic Books` : '✨ Explore All Story Rockets'}
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-[2rem] bg-slate-800/50 border border-purple-500/20" />
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="bg-slate-900/60 border-2 border-dashed border-pink-500/30 rounded-[2.5rem] p-12 text-center space-y-4">
            <div className="text-6xl animate-bounce">🛸</div>
            <h3 className="text-2xl font-black text-white">Oopsie Daisy! No books found here!</h3>
            <p className="text-slate-400 font-bold text-sm max-w-md mx-auto">
              No digital books match your magical search or filter. Try clearing filters to find your next great story!
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('');
                setSelectedLevel('');
              }}
              className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black px-6 py-3 rounded-2xl shadow-[0_6px_0_rgb(202,138,4)] active:shadow-none active:translate-y-1.5 transition-all uppercase tracking-wider text-xs"
            >
              🔄 Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <div key={book.id} className="transform hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300">
                <BookCard
                  book={book}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <AuthPromptModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title="✨ Log In to Save Your Treasure!"
        message="Sign in to save epic books to your magic treasure chest, track your reading badges, and carry your story progress anywhere you go!"
      />
    </div>
  );
};