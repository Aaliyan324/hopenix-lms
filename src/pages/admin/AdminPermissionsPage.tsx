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
    <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xs">
      {/* Accordion trigger */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-stone-50 transition-colors text-left"
      >
        <span className="shrink-0 w-5 h-5 flex items-center justify-center text-stone-400">
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </span>
        <BookOpen className="w-4 h-4 text-stone-900 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-stone-900 truncate">{book.title}</p>
          <p className="text-[11px] text-stone-500">{book.lessons?.length || 0} lessons</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={book.published ? 'success' : 'slate'} size="sm">
            {book.published ? 'Published' : 'Draft'}
          </Badge>
          {bookGranted && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-900 text-stone-50 border border-stone-900">
              <Check className="w-3 h-3" /> Full Access
            </span>
          )}
        </div>
      </button>

      {/* Accordion body */}
      {open && (
        <div className="border-t border-stone-200 divide-y divide-stone-100">
          {/* Entire Book Access row */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-stone-50/80">
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-4 h-4 text-stone-900 shrink-0" />
              <div>
                <p className="text-xs font-bold text-stone-900">Entire Book Access</p>
                <p className="text-[10px] text-stone-500 leading-tight">
                  Grants access to all current and future lessons in this book
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onToggleBook(book.id, bookGranted)}
              title={bookGranted ? 'Revoke entire book access' : 'Grant entire book access'}
              className={`inline-flex items-center justify-center w-8 h-8 rounded-xl border-2 transition-all shrink-0 ${
                bookGranted
                  ? 'bg-stone-900 border-stone-900 text-stone-50 hover:bg-stone-800'
                  : 'bg-white border-stone-200 text-stone-400 hover:border-stone-400 hover:text-stone-700'
              }`}
            >
              {bookGranted ? <Check className="w-4 h-4" /> : <X className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Individual lessons (only when book access is OFF) */}
          {!bookGranted && (book.lessons?.length || 0) > 0 && (
            <div className="px-5 py-2 space-y-0.5">
              <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider pt-2 pb-1">
                Individual Lesson Access
              </p>
              {filteredLessons.map((lesson, idx) => {
                const granted = lessonGranted.has(lesson.id);
                const isLast = idx === filteredLessons.length - 1;
                return (
                  <div
                    key={lesson.id}
                    className={`flex items-center justify-between py-2.5 ${!isLast ? 'border-b border-stone-100' : ''}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-[10px] font-mono font-bold text-stone-700 shrink-0 w-8">
                        L{lesson.lessonNumber}
                      </span>
                      <span className="text-xs text-stone-800 truncate">{lesson.title}</span>
                      {!lesson.published && (
                        <span className="text-[9px] font-bold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded shrink-0">
                          Draft
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleLesson(lesson.id, granted)}
                      title={granted ? 'Revoke lesson access' : 'Grant lesson access'}
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-lg border transition-all shrink-0 ml-3 ${
                        granted
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-white border-stone-200 text-stone-400 hover:text-stone-700 hover:border-stone-400'
                      }`}
                    >
                      {granted ? <Check className="w-3.5 h-3.5" /> : <X className="w-3 h-3" />}
                    </button>
                  </div>
                );
              })}
              {filteredLessons.length === 0 && bookSearch.trim() && (
                <p className="text-xs text-stone-500 text-center py-4">No lessons match your search.</p>
              )}
            </div>
          )}

          {/* When full book access is ON, show informational note */}
          {bookGranted && (book.lessons?.length || 0) > 0 && (
            <div className="px-5 py-3">
              <p className="text-[10px] text-stone-500 italic">
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
      <div className="space-y-6 max-w-4xl mx-auto pb-16">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight flex items-center gap-2">
          <Key className="w-6 h-6 text-stone-900" />
          Permission Management
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1 font-medium">
          Select an editor, then assign the books and lessons they can access.
        </p>
      </div>

      {/* Editor Selector Card */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
        <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" /> Editor
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
                className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full object-cover pointer-events-none"
              />
            )}
            <select
              value={selectedEditorId}
              onChange={(e) => setSelectedEditorId(e.target.value)}
              className={`w-full bg-stone-50 border border-stone-200 focus:border-stone-900 rounded-xl py-2.5 pr-10 text-xs text-stone-900 outline-none appearance-none transition-colors ${
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
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 rounded-xl transition-all shadow-xs sm:w-auto w-full whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4 text-stone-600" />
            Add Editor
          </button>
        </div>

        {selectedEditor && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-stone-500 pt-3 border-t border-stone-100">
            <Users className="w-3.5 h-3.5 shrink-0 text-stone-400" />
            <span className="font-semibold text-stone-900">{selectedEditor.name}</span>
            <span>·</span>
            <span className="truncate">{selectedEditor.email}</span>
            <Badge variant="slate" size="sm">{selectedEditor.role}</Badge>
          </div>
        )}
      </div>

      {/* Permission Tree */}
      {selectedEditorId && (
        <div className="space-y-5">
          {loadingPerms ? (
            <div className="flex items-center justify-center py-20 gap-3 text-stone-500">
              <Loader2 className="w-5 h-5 animate-spin text-stone-900" />
              <span className="text-xs font-medium">Loading permissions for {selectedEditor?.name}…</span>
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
                  className="w-full bg-white border border-stone-200 focus:border-stone-900 rounded-xl pl-9 pr-10 py-2.5 text-xs text-stone-900 placeholder-stone-400 outline-none transition-colors shadow-xs"
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
                  <div className="text-center py-12 text-stone-500 text-xs font-medium bg-white border border-stone-200 rounded-2xl">
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

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-stone-200">
                <p className="text-xs text-stone-500">
                  {permsDirty ? (
                    <span className="text-amber-600 font-semibold">⚠ You have unsaved changes.</span>
                  ) : (
                    'All changes saved.'
                  )}
                </p>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!permsDirty || saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-stone-50 text-xs font-semibold rounded-xl transition-all shadow-xs"
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
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center bg-white border border-stone-200 rounded-2xl shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center">
            <Key className="w-8 h-8 text-stone-700" />
          </div>
          <div>
            <p className="text-stone-900 font-semibold text-sm">No editor selected</p>
            <p className="text-stone-500 text-xs mt-1 font-medium">
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
        <div className="space-y-4 text-xs">
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
              className="w-full bg-stone-50 border border-stone-200 focus:border-stone-900 rounded-xl pl-9 pr-4 py-2.5 text-xs text-stone-900 placeholder-stone-400 outline-none"
              autoFocus
            />
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {filteredUsers.length === 0 && (
              <p className="text-center text-stone-500 text-xs py-6">No users found.</p>
            )}
            {filteredUsers.map((user) => {
              const isAlreadyEditor = editors.some((e) => e.id === user.id);
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleAddEditor(user)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 transition-colors text-left group shadow-xs"
                >
                  <img
                    src={
                      user.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`
                    }
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover bg-stone-100 shrink-0 border border-stone-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-stone-950 truncate">{user.name}</p>
                    <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={user.role === 'ADMIN' ? 'brand' : 'slate'} size="sm">
                      {user.role}
                    </Badge>
                    {isAlreadyEditor && (
                      <span className="text-[10px] text-emerald-600 font-bold">✓ Editor</span>
                    )}
                    <UserPlus className="w-4 h-4 text-stone-400 group-hover:text-stone-900 transition-colors" />
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