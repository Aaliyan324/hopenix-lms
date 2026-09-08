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
} from 'lucide-react';

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
    <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-editorial hover:shadow-editorial transition-all">
      {/* Accordion trigger */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50/80 transition-colors text-left group"
      >
        <span className="shrink-0 w-5 h-5 flex items-center justify-center text-slate-400 group-hover:text-orange-500 transition-colors">
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </span>
        <div className="p-1.5 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 shrink-0">
          <BookOpen className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-serif font-bold text-slate-900 truncate">{book.title}</p>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-400" />
            {book.lessons?.length || 0} lessons
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={book.published ? 'success' : 'slate'} size="sm" className={book.published ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-orange-50 text-orange-700 border-orange-200'}>
            {book.published ? 'Published' : 'Draft'}
          </Badge>
          {bookGranted && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500 text-white border border-emerald-600 shadow-sm">
              <Check className="w-3 h-3" /> Full Access
            </span>
          )}
        </div>
      </button>

      {/* Accordion body */}
      {open && (
        <div className="border-t border-slate-200 divide-y divide-slate-100">
          {/* Entire Book Access row */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50/80">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-xl bg-orange-50 border border-orange-100 text-orange-600">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Entire Book Access</p>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Grants access to all current and future lessons in this book
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onToggleBook(book.id, bookGranted)}
              title={bookGranted ? 'Revoke entire book access' : 'Grant entire book access'}
              className={`inline-flex items-center justify-center w-9 h-9 rounded-xl border-2 transition-all shrink-0 ${
                bookGranted
                  ? 'bg-orange-500 border-orange-500 text-white hover:bg-orange-600 shadow-md shadow-orange-500/25'
                  : 'bg-white border-slate-200 text-slate-400 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50'
              }`}
            >
              {bookGranted ? <Check className="w-4 h-4" /> : <X className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Individual lessons (only when book access is OFF) */}
          {!bookGranted && (book.lessons?.length || 0) > 0 && (
            <div className="px-5 py-2 space-y-0.5">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pt-2 pb-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                Individual Lesson Access
              </p>
              {filteredLessons.map((lesson, idx) => {
                const granted = lessonGranted.has(lesson.id);
                const isLast = idx === filteredLessons.length - 1;
                return (
                  <div
                    key={lesson.id}
                    className={`flex items-center justify-between py-2.5 ${!isLast ? 'border-b border-slate-100' : ''} hover:bg-slate-50/50 rounded-lg px-2 transition-colors`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-[10px] font-mono font-bold text-orange-600 shrink-0 w-8 bg-orange-50 px-1.5 py-0.5 rounded-md border border-orange-100 text-center">
                        L{lesson.lessonNumber}
                      </span>
                      <span className="text-sm text-slate-800 truncate font-medium">{lesson.title}</span>
                      {!lesson.published && (
                        <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
                          Draft
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleLesson(lesson.id, granted)}
                      title={granted ? 'Revoke lesson access' : 'Grant lesson access'}
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-xl border-2 transition-all shrink-0 ml-3 ${
                        granted
                          ? 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-500/25'
                          : 'bg-white border-slate-200 text-slate-400 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50'
                      }`}
                    >
                      {granted ? <Check className="w-3.5 h-3.5" /> : <X className="w-3 h-3" />}
                    </button>
                  </div>
                );
              })}
              {filteredLessons.length === 0 && bookSearch.trim() && (
                <p className="text-sm text-slate-500 text-center py-4 font-medium">No lessons match your search.</p>
              )}
            </div>
          )}

          {/* When full book access is ON, show informational note */}
          {bookGranted && (book.lessons?.length || 0) > 0 && (
            <div className="px-5 py-3 bg-emerald-50/50">
              <p className="text-xs text-emerald-700 font-medium flex items-center gap-2">
                <Check className="w-3.5 h-3.5" />
                All {book.lessons!.length} lessons are accessible via Entire Book Access.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
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
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* Header Banner - Matches dashboard style */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 sm:p-10 shadow-editorial border border-slate-800">
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden md:block">
          <Sparkles className="w-40 h-40 text-orange-400" />
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Shield className="w-3.5 h-3.5" />
              Permission Management
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Permission Management
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed font-light">
              Select an editor, then assign the books and lessons they can access.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <Users className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-semibold text-white">
                {editors.length} Editors
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Selector Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-editorial">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
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
                className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-xl object-cover pointer-events-none border border-slate-200"
              />
            )}
            <select
              value={selectedEditorId}
              onChange={(e) => setSelectedEditorId(e.target.value)}
              className={`w-full bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl py-2.5 pr-10 text-sm text-slate-900 outline-none appearance-none transition-all ${
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
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={() => { setAddEditorOpen(true); setUserSearch(''); }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-200 bg-white hover:bg-orange-50 hover:border-orange-300 text-sm font-semibold text-slate-700 hover:text-orange-700 rounded-xl transition-all shadow-xs sm:w-auto w-full whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            Add Editor
          </button>
        </div>

        {selectedEditor && (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-500 pt-3 border-t border-slate-100">
            <div className="p-1 rounded-lg bg-slate-100 border border-slate-200">
              <Users className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <span className="font-semibold text-slate-900">{selectedEditor.name}</span>
            <span className="text-slate-300">·</span>
            <span className="truncate">{selectedEditor.email}</span>
            <Badge variant="slate" size="sm" className="bg-orange-50 text-orange-700 border-orange-200">
              {selectedEditor.role}
            </Badge>
          </div>
        )}
      </div>

      {/* Permission Tree */}
      {selectedEditorId && (
        <div className="space-y-5">
          {loadingPerms ? (
            <div className="flex items-center justify-center py-20 gap-3 text-slate-500 bg-white border border-slate-200/80 rounded-3xl shadow-editorial">
              <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
              <span className="text-sm font-medium">Loading permissions for {selectedEditor?.name}…</span>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search books or lessons…"
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl pl-9 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all shadow-editorial"
                />
                {bookSearch && (
                  <button
                    type="button"
                    onClick={() => setBookSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {filteredBooks.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-sm font-medium bg-white border border-slate-200/80 rounded-3xl shadow-editorial">
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

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-slate-200 bg-white p-4 rounded-2xl shadow-editorial">
                <p className="text-sm text-slate-500 font-medium">
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
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-orange-500/25"
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
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center bg-white border border-slate-200/80 rounded-3xl shadow-editorial">
          <div className="w-20 h-20 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center">
            <Key className="w-10 h-10 text-orange-600" />
          </div>
          <div>
            <p className="text-slate-900 font-serif font-bold text-xl">No editor selected</p>
            <p className="text-slate-500 text-sm mt-1 font-medium">
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
        <div className="space-y-4 text-sm">
          <p className="text-slate-500 font-medium">
            Select a user to assign as an editor. Non-editor users will be promoted to the Editor role automatically.
          </p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
              autoFocus
            />
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {filteredUsers.length === 0 && (
              <p className="text-center text-slate-500 text-sm py-6">No users found.</p>
            )}
            {filteredUsers.map((user) => {
              const isAlreadyEditor = editors.some((e) => e.id === user.id);
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleAddEditor(user)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 transition-colors text-left group shadow-xs"
                >
                  <img
                    src={
                      user.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`
                    }
                    alt={user.name}
                    className="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-950 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={user.role === 'ADMIN' ? 'brand' : 'slate'} size="sm" className={user.role === 'ADMIN' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-slate-50 text-slate-700 border-slate-200'}>
                      {user.role}
                    </Badge>
                    {isAlreadyEditor && (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Editor
                      </span>
                    )}
                    <UserPlus className="w-4 h-4 text-slate-400 group-hover:text-orange-600 transition-colors" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </Modal>
    </div>
  );
};