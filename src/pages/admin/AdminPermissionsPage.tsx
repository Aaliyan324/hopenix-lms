import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { User, Course, Lesson } from '../../types';
import { Skeleton } from '../../components/ui/Skeleton';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';
import { Key, Shield, Check, X, Search, Layers } from 'lucide-react';

export const AdminPermissionsPage: React.FC = () => {
  const { toast } = useToast();
  const [editors, setEditors] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, coursesData] = await Promise.all([
        apiFetch<{ users: User[] }>('/users?role=EDITOR&limit=100'),
        apiFetch<{ courses: Course[] }>('/courses'),
      ]);
      setEditors(usersData.users);

      // Fetch full lesson list for each course
      const coursesWithLessons = await Promise.all(
        coursesData.courses.map(async (c) => {
          const detail = await apiFetch<{ course: Course }>(`/courses/${c.id}`);
          return detail.course;
        })
      );
      setCourses(coursesWithLessons);
    } catch (err) {
      toast('Failed to load permission matrix.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = async (lessonId: string, editorId: string, currentlyAssigned: boolean) => {
    try {
      // Fetch current editor list for lesson
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
      toast(err.message || 'Failed to update permission.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Key className="w-6 h-6 text-brand-400" />
          Editor Lesson Permissions Matrix
        </h1>
        <p className="text-sm text-slate-400">
          Granularly assign specific editors edit privileges for specific course lessons. Editors can ONLY edit assigned lessons.
        </p>
      </div>

      {/* Permission Grid by Course */}
      <div className="space-y-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-400" />
                  {course.title}
                </h3>
                <p className="text-xs text-slate-400">{course.lessons?.length || 0} Lessons in this course</p>
              </div>
              <Badge variant={course.published ? 'success' : 'slate'} size="sm">
                {course.published ? 'Published' : 'Draft'}
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/60 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-3">Lesson Title</th>
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
                  {course.lessons?.map((lesson) => (
                    <tr key={lesson.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-3.5 font-medium text-slate-200">
                        <span className="font-mono text-brand-400 mr-2">#{lesson.order}</span>
                        {lesson.title}
                      </td>

                      {editors.map((editor) => {
                        const isAssigned = lesson.permissions?.some((p) => p.userId === editor.id) || false;
                        return (
                          <td key={editor.id} className="px-6 py-3.5 text-center">
                            <button
                              onClick={() => togglePermission(lesson.id, editor.id, isAssigned)}
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-lg border transition-all cursor-pointer ${
                                isAssigned
                                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/30'
                                  : 'bg-slate-950 border-slate-800 text-slate-600 hover:text-slate-400 hover:border-slate-700'
                              }`}
                              title={isAssigned ? 'Revoke Edit Permission' : 'Grant Edit Permission'}
                            >
                              {isAssigned ? <Check className="w-4 h-4" /> : <X className="w-3.5 h-3.5" />}
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
