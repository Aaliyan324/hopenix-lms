import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { Lesson } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { CheckSquare, Edit, Clock, Layers, FileText } from 'lucide-react';

export const EditorDashboardPage: React.FC = () => {
  const [assignedLessons, setAssignedLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEditorLessons();
  }, []);

  const fetchEditorLessons = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<{ lessons: Lesson[] }>('/lessons/editor/assigned');
      setAssignedLessons(data.lessons);
    } catch (err) {
      console.error('Failed to load assigned lessons:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-amber-400" />
          My Assigned Lessons
        </h1>
        <p className="text-sm text-slate-400">
          Lessons explicitly assigned to your editor account. You can modify rich text content, images, videos, and PDFs for these lessons.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : assignedLessons.length === 0 ? (
        <EmptyState
          title="No lessons assigned"
          description="You currently don't have any lessons assigned to you by an administrator."
          icon={<CheckSquare className="w-8 h-8 text-amber-400" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignedLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-brand-400 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    {lesson.course?.title || 'Course'}
                  </span>
                  <Badge variant={lesson.published ? 'success' : 'slate'} size="sm">
                    {lesson.published ? 'Published' : 'Draft'}
                  </Badge>
                </div>

                <h3 className="font-bold text-lg text-white mb-1">
                  #{lesson.order} {lesson.title}
                </h3>
                {lesson.description && (
                  <p className="text-xs text-slate-400 line-clamp-2">{lesson.description}</p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(lesson.updatedAt).toLocaleDateString()}
                </span>

                <Link
                  to={`/editor/lessons/${lesson.id}/edit`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit Content
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
