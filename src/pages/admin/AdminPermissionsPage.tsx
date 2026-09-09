import React, { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '../../lib/api';
import { User, Book } from '../../types';
import { Skeleton } from '../../components/ui/Skeleton';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import {
  Key,
  Check,
  X,
  BookOpen,
  UserCheck,
  ChevronDown,
  ChevronRight,
  Search,
  UserPlus,
  Loader2,
  Shield,
  Users,
  Sparkles,
  ChevronLeft,
  Filter,
  RefreshCw,
  Award,
  Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';

// ─── BookAccordion ─────────────────────────────────────────────────────────────
interface BookAccordionProps {
  book: Book;
  bookGranted: boolean;
  lessonGranted: Set<string>;
  bookSearch: string;
  onToggleBook: (bookId: string, granted: boolean) => void;
  onToggleLesson: (lessonId: string, granted: boolean) => void;
}

const BookAccordion: React.FC<BookAccordionProps> = ({
  book,
  bookGranted,
  lessonGranted,
  bookSearch,
  onToggleBook,
  onToggleLesson,
}) => {
  const [open, setOpen] = useState(false);

  const hasAnyLessonAccess = (book.lessons || []).some((l) => lessonGranted.has(l.id));
  const shouldAutoOpen = bookSearch.trim().length > 0 || bookGranted || hasAnyLessonAccess;

  useEffect(() => {
    if (shouldAutoOpen) setOpen(true);
  }, [shouldAutoOpen]);

  const filteredLessons = useMemo(() => {
    const lessons = book.lessons || [];
    if (!bookSearch.trim()) return lessons;
    const q = bookSearch.toLowerCase();
    return lessons.filter(
      (l) => l.title.toLowerCase().includes(q) || `lesson ${l.lessonNumber}`.includes(q)
    );
  }, [book.lessons, bookSearch]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border border-orange-100 rounded-2xl overflow-hidden bg-white/90 backdrop-blur-sm shadow-[0_4px_20px_rgba(249,115,22,0.06)] hover:shadow-[0_8px_30px_rgba(249,115,22,0.1)] transition-all duration-300"
    >
      {/* Accordion trigger */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 hover:bg-orange-50/50 transition-colors text-left group"
      >
        <span className="shrink-0 w-5 h-5 flex items-center justify-center text-stone-400 group-hover:text-orange-500 transition-colors">
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </span>
        <div className="p-1.5 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 shrink-0">
          <BookOpen className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-['Poppins',sans-serif] font-semibold text-stone-900 truncate">{book.title}</p>
          <p className="text-[10px] sm:text-xs text-stone-500 flex items-center gap-1 font-['Inter',sans-serif]">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-400" />
            {book.lessons?.length || 0} lessons
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={book.published ? 'success' : 'slate'} size="sm" className={`font-['Inter',sans-serif] text-[10px] ${
            book.published 
              ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
              : 'bg-orange-50 text-orange-700 border-orange-200'
          }`}>
            {book.published ? 'Published' : 'Draft'}
          </Badge>
          {bookGranted && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-500 text-white border border-emerald-600 shadow-sm font-['Inter',sans-serif]">
              <Check className="w-3 h-3" /> Full Access
            </span>
          )}
        </div>
      </button>

      {/* Accordion body */}
      {open && (
        <div className="border-t border-orange-100 divide-y divide-orange-50">
          {/* Entire Book Access row */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 bg-orange-50/30">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-xl bg-orange-50 border border-orange-100 text-orange-600">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900 font-['Poppins',sans-serif]">Entire Book Access</p>
                <p className="text-[10px] text-stone-500 leading-tight font-['Inter',sans-serif]">
                  Grants access to all current and future lessons in this book
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onToggleBook(book.id, bookGranted)}
              title={bookGranted ? 'Revoke entire book access' : 'Grant entire book access'}
              className={`inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl border-2 transition-all shrink-0 ${
                bookGranted
                  ? 'bg-orange-500 border-orange-500 text-white hover:bg-orange-600 shadow-md shadow-orange-500/25'
                  : 'bg-white border-stone-200 text-stone-400 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50'
              }`}
            >
              {bookGranted ? <Check className="w-3.5 h-3.5" /> : <X className="w-3 h-3" />}
            </button>
          </div>

          {/* Individual lessons (only when book access is OFF) */}
          {!bookGranted && (book.lessons?.length || 0) > 0 && (
            <div className="px-4 sm:px-5 py-2 space-y-0.5">
              <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider pt-2 pb-1 flex items-center gap-2 font-['Poppins',sans-serif]">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                Individual Lesson Access
              </p>
              {filteredLessons.map((lesson, idx) => {
                const granted = lessonGranted.has(lesson.id);
                const isLast = idx === filteredLessons.length - 1;
                return (
                  <div
                    key={lesson.id}
                    className={`flex items-center justify-between py-2 sm:py-2.5 ${!isLast ? 'border-b border-orange-50' : ''} hover:bg-orange-50/30 rounded-lg px-2 transition-colors`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-mono font-bold text-orange-600 shrink-0 w-8 bg-orange-50 px-1.5 py-0.5 rounded-md border border-orange-100 text-center font-['Inter',sans-serif]">
                        L{lesson.lessonNumber}
                      </span>
                      <span className="text-xs sm:text-sm text-stone-800 truncate font-medium font-['Inter',sans-serif]">{lesson.title}</span>
                      {!lesson.published && (
                        <span className="text-[9px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200 shrink-0 font-['Inter',sans-serif]">
                          Draft
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleLesson(lesson.id, granted)}
                      title={granted ? 'Revoke lesson access' : 'Grant lesson access'}
                      className={`inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl border-2 transition-all shrink-0 ml-2 sm:ml-3 ${
                        granted
                          ? 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-500/25'
                          : 'bg-white border-stone-200 text-stone-400 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50'
                      }`}
                    >
                      {granted ? <Check className="w-3 h-3" /> : <X className="w-2.5 h-2.5" />}
                    </button>
                  </div>
                );
              })}
              {filteredLessons.length === 0 && bookSearch.trim() && (
                <p className="text-sm text-stone-500 text-center py-4 font-medium font-['Inter',sans-serif]">No lessons match your search.</p>
              )}
            </div>
          )}

          {/* When full book access is ON, show informational note */}
          {bookGranted && (book.lessons?.length || 0) > 0 && (
            <div className="px-4 sm:px-5 py-3 bg-emerald-50/50">
              <p className="text-xs text-emerald-700 font-medium flex items-center gap-2 font-['Inter',sans-serif]">
                <Check className="w-3.5 h-3.5" />
                All {book.lessons!.length} lessons are accessible via Entire Book Access.
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export const AdminPermissionsPage: React.FC = () => {
  const { toast } = useToast();

  const [editors, setEditors] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const [selectedEditorId, setSelectedEditorId] = useState('');
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [saving, setSaving] = useState(false);

  const [bookPerms, setBookPerms] = useState<Set<string>>(new Set());
  const [lessonPerms, setLessonPerms] = useState<Set<string>>(new Set());
  const [permsDirty, setPermsDirty] = useState(false);

  const [addEditorOpen, setAddEditorOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');

  // ── Initial load ────────────────────────────────────────────────────────
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoadingInitial(true);
      const [editorsData, usersData, booksData] = await Promise.all([
        apiFetch<{ users: User[] }>('/users?role=EDITOR&limit=200'),
        apiFetch<{ users: User[] }>('/users?limit=200'),
        apiFetch<{ books: Book[] }>('/books'),
      ]);
      setEditors(editorsData.users);
      setAllUsers(usersData.users);
      const fullBooks = await Promise.all(
        booksData.books.map(async (b) => {
          try {
            const det = await apiFetch<{ book: Book }>(`/books/${b.id}`);
            return det.book;
          } catch {
            return b;
          }
        })
      );
      setBooks(fullBooks);
    } catch {
      toast('Failed to load permission data.', 'error');
    } finally {
      setLoadingInitial(false);
    }
  };

  // ── Load permissions when editor changes ────────────────────────────────
  useEffect(() => {
    if (!selectedEditorId) {
      setBookPerms(new Set());
      setLessonPerms(new Set());
      setPermsDirty(false);
      return;
    }
    loadEditorPermissions(selectedEditorId);
  }, [selectedEditorId]);

  const loadEditorPermissions = async (editorId: string) => {
    try {
      setLoadingPerms(true);
      setBookPerms(new Set());
      setLessonPerms(new Set());
      setPermsDirty(false);
      const data = await apiFetch<{ bookPermissions: string[]; lessonPermissions: string[] }>(
        `/users/${editorId}/permissions`
      );
      setBookPerms(new Set(data.bookPermissions));
      setLessonPerms(new Set(data.lessonPermissions));
    } catch {
      toast('Failed to load editor permissions.', 'error');
    } finally {
      setLoadingPerms(false);
    }
  };

  // ── Toggles ─────────────────────────────────────────────────────────────
  const handleToggleBook = (bookId: string, currentlyGranted: boolean) => {
    setBookPerms((prev) => {
      const next = new Set(prev);
      if (currentlyGranted) next.delete(bookId);
      else next.add(bookId);
      return next;
    });
    setPermsDirty(true);
  };

  const handleToggleLesson = (lessonId: string, currentlyGranted: boolean) => {
    setLessonPerms((prev) => {
      const next = new Set(prev);
      if (currentlyGranted) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });
    setPermsDirty(true);
  };

  // ── Save ────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!selectedEditorId) return;
    try {
      setSaving(true);

      const bookRequests = books.map((book) => {
        const shouldGrant = bookPerms.has(book.id);
        return apiFetch<{ editors: User[] }>(`/books/${book.id}/editors`).then((curr) => {
          const currentIds = curr.editors.map((e) => e.id);
          const updated = shouldGrant
            ? currentIds.includes(selectedEditorId)
              ? currentIds
              : [...currentIds, selectedEditorId]
            : currentIds.filter((id) => id !== selectedEditorId);
          return apiFetch(`/books/${book.id}/editors`, {
            method: 'POST',
            body: JSON.stringify({ editorIds: updated }),
          });
        });
      });

      const lessonRequests: Promise<any>[] = [];
      for (const book of books) {
        for (const lesson of book.lessons || []) {
          const shouldGrant = lessonPerms.has(lesson.id);
          lessonRequests.push(
            apiFetch<{ editors: User[] }>(`/lessons/${lesson.id}/editors`).then((curr) => {
              const currentIds = curr.editors.map((e) => e.id);
              const updated = shouldGrant
                ? currentIds.includes(selectedEditorId)
                  ? currentIds
                  : [...currentIds, selectedEditorId]
                : currentIds.filter((id) => id !== selectedEditorId);
              return apiFetch(`/lessons/${lesson.id}/editors`, {
                method: 'POST',
                body: JSON.stringify({ editorIds: updated }),
              });
            })
          );
        }
      }

      await Promise.all([...bookRequests, ...lessonRequests]);
      const editorName = editors.find((e) => e.id === selectedEditorId)?.name || 'Editor';
      toast(`${editorName}'s permissions saved successfully!`, 'success');
      setPermsDirty(false);
    } catch {
      toast('Failed to save permissions. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Add editor ──────────────────────────────────────────────────────────
  const handleAddEditor = async (user: User) => {
    try {
      if (user.role !== 'EDITOR') {
        await apiFetch(`/users/${user.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ role: 'EDITOR' }),
        });
      }
      const data = await apiFetch<{ users: User[] }>('/users?role=EDITOR&limit=200');
      setEditors(data.users);
      setSelectedEditorId(user.id);
      setAddEditorOpen(false);
      toast(`${user.name} added as editor.`, 'success');
    } catch {
      toast('Failed to add editor.', 'error');
    }
  };

  // ── Derived ─────────────────────────────────────────────────────────────
  const selectedEditor = editors.find((e) => e.id === selectedEditorId) || null;

  const filteredBooks = useMemo(() => {
    if (!bookSearch.trim()) return books;
    const q = bookSearch.toLowerCase();
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.author || '').toLowerCase().includes(q) ||
        (b.lessons || []).some((l) => l.title.toLowerCase().includes(q))
    );
  }, [books, bookSearch]);

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return allUsers;
    const q = userSearch.toLowerCase();
    return allUsers.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [allUsers, userSearch]);

  // ── Skeleton ────────────────────────────────────────────────────────────
  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-56 w-full rounded-3xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30 p-4 sm:p-6 lg:p-8 font-['Inter',sans-serif]">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-8 sm:pb-16">
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 via-orange-500 to-orange-400 text-white p-6 sm:p-8 lg:p-10 shadow-2xl">
          <div className="absolute -right-20 -bottom-20 w-72 sm:w-96 h-72 sm:h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none hidden md:block">
            <Shield className="w-48 h-48 text-white" />
          </div>
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold uppercase tracking-wider font-['Poppins',sans-serif]">
                  <Shield className="w-3.5 h-3.5" />
                  Permission Management
                </div>
                <h1 className="font-['Poppins',sans-serif] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                  Editor Permissions
                </h1>
                <p className="text-sm sm:text-base text-orange-100 max-w-2xl leading-relaxed">
                  Select an editor, then assign the books and lessons they can access.
                </p>
                
                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="flex items-center gap-2 text-sm text-orange-100 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <Users className="w-4 h-4" />
                    <span className="font-semibold text-white">{editors.length}</span>
                    <span>Editors</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-orange-100 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <BookOpen className="w-4 h-4" />
                    <span className="font-semibold text-white">{books.length}</span>
                    <span>Books</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Editor Selector Card */}
        <div className="bg-white/90 backdrop-blur-sm border border-orange-100 rounded-3xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(249,115,22,0.08)]">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3 flex items-center gap-2 font-['Poppins',sans-serif]">
            <div className="p-1 rounded-lg bg-orange-50 border border-orange-100 text-orange-600">
              <Shield className="w-3.5 h-3.5" />
            </div>
            Select Editor
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1">
              {selectedEditor && (
                <img
                  src={
                    selectedEditor.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(selectedEditor.name)}`
                  }
                  alt={selectedEditor.name}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-xl object-cover pointer-events-none border border-orange-200"
                />
              )}
              <select
                value={selectedEditorId}
                onChange={(e) => setSelectedEditorId(e.target.value)}
                className={`w-full bg-orange-50/30 border border-stone-200/80 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl py-2.5 pr-10 text-sm text-stone-900 outline-none appearance-none transition-all font-['Inter',sans-serif] ${
                  selectedEditor ? 'pl-11' : 'pl-4'
                }`}
              >
                <option value="">— Select an Editor —</option>
                {editors.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            </div>

            <button
              type="button"
              onClick={() => { setAddEditorOpen(true); setUserSearch(''); }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-stone-200/80 bg-white hover:bg-orange-50 hover:border-orange-300 text-sm font-semibold text-stone-700 hover:text-orange-700 rounded-xl transition-all shadow-sm sm:w-auto w-full font-['Poppins',sans-serif]"
            >
              <UserPlus className="w-4 h-4" />
              Add Editor
            </button>
          </div>

          {selectedEditor && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-stone-500 pt-3 border-t border-orange-100">
              <div className="p-1 rounded-lg bg-orange-50 border border-orange-100">
                <Users className="w-3.5 h-3.5 text-orange-500" />
              </div>
              <span className="font-semibold text-stone-900 font-['Poppins',sans-serif]">{selectedEditor.name}</span>
              <span className="text-stone-300">·</span>
              <span className="truncate font-['Inter',sans-serif]">{selectedEditor.email}</span>
              <Badge variant="slate" size="sm" className="bg-orange-100 text-orange-700 border-orange-200 font-['Inter',sans-serif]">
                {selectedEditor.role}
              </Badge>
            </div>
          )}
        </div>

        {/* Permission Tree */}
        {selectedEditorId && (
          <div className="space-y-5">
            {loadingPerms ? (
              <div className="flex items-center justify-center py-20 gap-3 text-stone-500 bg-white/90 backdrop-blur-sm border border-orange-100 rounded-3xl shadow-[0_8px_30px_rgba(249,115,22,0.08)]">
                <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                <span className="text-sm font-medium font-['Inter',sans-serif]">Loading permissions for {selectedEditor?.name}…</span>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search books or lessons…"
                    value={bookSearch}
                    onChange={(e) => setBookSearch(e.target.value)}
                    className="w-full bg-white/90 backdrop-blur-sm border border-orange-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl pl-9 pr-10 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all shadow-[0_8px_30px_rgba(249,115,22,0.08)] font-['Inter',sans-serif]"
                  />
                  {bookSearch && (
                    <button
                      type="button"
                      onClick={() => setBookSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded text-stone-400 hover:text-stone-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {filteredBooks.length === 0 ? (
                    <div className="text-center py-12 text-stone-500 text-sm font-medium bg-white/90 backdrop-blur-sm border border-orange-100 rounded-3xl shadow-[0_8px_30px_rgba(249,115,22,0.08)] font-['Inter',sans-serif]">
                      No books match your search.
                    </div>
                  ) : (
                    filteredBooks.map((book) => (
                      <BookAccordion
                        key={book.id}
                        book={book}
                        bookGranted={bookPerms.has(book.id)}
                        lessonGranted={lessonPerms}
                        bookSearch={bookSearch}
                        onToggleBook={handleToggleBook}
                        onToggleLesson={handleToggleLesson}
                      />
                    ))
                  )}
                </div>

                {/* Save Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-orange-100 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-[0_8px_30px_rgba(249,115,22,0.08)]">
                  <p className="text-sm text-stone-500 font-medium font-['Inter',sans-serif]">
                    {permsDirty ? (
                      <span className="text-amber-600 font-semibold flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        You have unsaved changes.
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-emerald-600">
                        <Check className="w-4 h-4" />
                        All changes saved.
                      </span>
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!permsDirty || saving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-orange-500/25 font-['Poppins',sans-serif]"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Save Permissions
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Empty state */}
        {!selectedEditorId && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center bg-white/90 backdrop-blur-sm border border-orange-100 rounded-3xl shadow-[0_8px_30px_rgba(249,115,22,0.08)]">
            <div className="w-20 h-20 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center">
              <Key className="w-10 h-10 text-orange-600" />
            </div>
            <div>
              <p className="text-stone-900 font-['Poppins',sans-serif] font-bold text-xl">No editor selected</p>
              <p className="text-stone-500 text-sm mt-1 font-medium font-['Inter',sans-serif]">
                Choose an editor from the dropdown above to manage their permissions.
              </p>
            </div>
          </div>
        )}

        {/* Add Editor Modal */}
        <Modal
          isOpen={addEditorOpen}
          onClose={() => setAddEditorOpen(false)}
          title="Add / Assign Editor"
          maxWidth="md"
        >
          <div className="space-y-4 text-sm font-['Inter',sans-serif]">
            <p className="text-stone-500 font-medium">
              Select a user to assign as an editor. Non-editor users will be promoted to the Editor role automatically.
            </p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name or email…"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-orange-50/30 border border-stone-200/80 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl pl-9 pr-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all font-['Inter',sans-serif]"
                autoFocus
              />
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {filteredUsers.length === 0 && (
                <p className="text-center text-stone-500 text-sm py-6 font-['Inter',sans-serif]">No users found.</p>
              )}
              {filteredUsers.map((user) => {
                const isAlreadyEditor = editors.some((e) => e.id === user.id);
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleAddEditor(user)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white hover:bg-orange-50 border border-stone-200 hover:border-orange-300 transition-colors text-left group shadow-sm"
                  >
                    <img
                      src={
                        user.avatar ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`
                      }
                      alt={user.name}
                      className="w-10 h-10 rounded-xl object-cover bg-stone-100 shrink-0 border border-stone-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-stone-950 truncate font-['Poppins',sans-serif]">{user.name}</p>
                      <p className="text-xs text-stone-500 truncate font-['Inter',sans-serif]">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={user.role === 'ADMIN' ? 'brand' : 'slate'} size="sm" className={user.role === 'ADMIN' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-stone-50 text-stone-700 border-stone-200'}>
                        {user.role}
                      </Badge>
                      {isAlreadyEditor && (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 font-['Inter',sans-serif]">
                          <Check className="w-3 h-3" /> Editor
                        </span>
                      )}
                      <UserPlus className="w-4 h-4 text-stone-400 group-hover:text-orange-600 transition-colors" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};