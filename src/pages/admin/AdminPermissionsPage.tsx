import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { User, Book } from '../../types';
import { Skeleton } from '../../components/ui/Skeleton';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';
import { Key, Check, X, BookOpen, UserCheck } from 'lucide-react';

interface BookWithAssignedEditors extends Book {
  bookEditors?: string[];
}

export const AdminPermissionsPage: React.FC = () => {
  const { toast } = useToast();
  const [editors, setEditors] = useState<User[]>([]);
  const [books, setBooks] = useState<BookWithAssignedEditors[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, booksData] = await Promise.all([
        apiFetch<{ users: User[] }>('/users?role=EDITOR&limit=100'),
        apiFetch<{ books: Book[] }>('/books'),
      ]);
      setEditors(usersData.users);

      // Fetch full lesson list & book editor assignments for each book
      const booksWithDetails = await Promise.all(
        booksData.books.map(async (b) => {
          try {
            const [detail, assignedEditorsRes] = await Promise.all([
              apiFetch<{ book: Book }>(`/books/${b.id}`),
              apiFetch<{ editors: User[] }>(`/books/${b.id}/editors`),
            ]);
            return {
              ...detail.book,
              bookEditors: assignedEditorsRes.editors.map((e) => e.id),
            };
          } catch {
            return b;
          }
        })
      );
      setBooks(booksWithDetails);
    } catch (err) {
      toast('Failed to load permission matrix.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleBookPermission = async (bookId: string, editorId: string, currentlyAssigned: boolean) => {
    try {
      const res = await apiFetch<{ editors: User[] }>(`/books/${bookId}/editors`);
      let currentIds = res.editors.map((e) => e.id);

      if (currentlyAssigned) {
        currentIds = currentIds.filter((id) => id !== editorId);
      } else {
        currentIds.push(editorId);
      }

      await apiFetch(`/books/${bookId}/editors`, {
        method: 'POST',
        body: JSON.stringify({ editorIds: currentIds }),
      });

      toast('Book editor permission updated.', 'success');
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to update book permission.', 'error');
    }
  };

  const toggleLessonPermission = async (lessonId: string, editorId: string, currentlyAssigned: boolean) => {
    try {
      const res = await apiFetch<{ editors: User[] }>(`/lessons/${lessonId}/editors`);
      let currentIds = res.editors.map((e) => e.id);

      if (currentlyAssigned) {
        currentIds = currentIds.filter((id) => id !== editorId);
      } else {
        currentIds.push(editorId);
      }

      await apiFetch(`/lessons/${lessonId}/editors`, {
        method: 'POST',
        body: JSON.stringify({ editorIds: currentIds }),
      });

      toast('Editor lesson permission updated.', 'success');
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to update lesson permission.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Key className="w-6 h-6 text-brand-400" />
          Editor Permissions Matrix
        </h1>
        <p className="text-sm text-slate-400">
          Assign specific editors access to entire books or specific lessons. Editors can ONLY access books and content assigned to them.
        </p>
      </div>

      {/* Permission Grid by Book */}
      <div className="space-y-6">
        {books.map((book) => (
          <div key={book.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-brand-400" />
                  {book.title}
                </h3>
                <p className="text-xs text-slate-400">{book.lessons?.length || 0} Lessons in this book</p>
              </div>
              <Badge variant={book.published ? 'success' : 'slate'} size="sm">
                {book.published ? 'Published' : 'Draft'}
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/60 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-3">Content Unit</th>
                    {editors.map((editor) => (
                      <th key={editor.id} className="px-6 py-3 text-center">
                        <div className="flex flex-col items-center">
                          <img
                            src={editor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${editor.name}`}
                            alt={editor.name}
                            className="w-6 h-6 rounded-full bg-slate-800 object-cover mb-1"
                          />
                          <span className="text-white text-xs">{editor.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {/* Entire Book Assignment Row */}
                  <tr className="bg-purple-950/20 font-bold">
                    <td className="px-6 py-3.5 text-brand-300 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-brand-400" />
                      Entire Book Access ({book.title})
                    </td>
                    {editors.map((editor) => {
                      const isBookAssigned = book.bookEditors?.includes(editor.id) || false;
                      return (
                        <td key={editor.id} className="px-6 py-3.5 text-center">
                          <button
                            onClick={() => toggleBookPermission(book.id, editor.id, isBookAssigned)}
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-lg border transition-all cursor-pointer ${
                              isBookAssigned
                                ? 'bg-brand-500/20 border-brand-500/50 text-brand-300 hover:bg-brand-500/30'
                                : 'bg-slate-950 border-slate-800 text-slate-600 hover:text-slate-400 hover:border-slate-700'
                            }`}
                            title={isBookAssigned ? 'Revoke Book Assignment' : 'Assign Entire Book to Editor'}
                          >
                            {isBookAssigned ? <Check className="w-4 h-4" /> : <X className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Lesson Rows */}
                  {book.lessons?.map((lesson) => (
                    <tr key={lesson.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-3.5 font-medium text-slate-200">
                        <span className="font-mono text-brand-400 mr-2">L{lesson.lessonNumber || lesson.order}</span>
                        {lesson.title}
                      </td>

                      {editors.map((editor) => {
                        const isLessonAssigned = lesson.permissions?.some((p) => p.userId === editor.id) || false;
                        const isBookAssigned = book.bookEditors?.includes(editor.id) || false;
                        const hasAccess = isLessonAssigned || isBookAssigned;

                        return (
                          <td key={editor.id} className="px-6 py-3.5 text-center">
                            <button
                              onClick={() => toggleLessonPermission(lesson.id, editor.id, isLessonAssigned)}
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-lg border transition-all cursor-pointer ${
                                hasAccess
                                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/30'
                                  : 'bg-slate-950 border-slate-800 text-slate-600 hover:text-slate-400 hover:border-slate-700'
                              }`}
                              title={
                                isBookAssigned
                                  ? 'Granted via Book Assignment'
                                  : isLessonAssigned
                                  ? 'Revoke Lesson Permission'
                                  : 'Grant Lesson Permission'
                              }
                            >
                              {hasAccess ? <Check className="w-4 h-4" /> : <X className="w-3.5 h-3.5" />}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
