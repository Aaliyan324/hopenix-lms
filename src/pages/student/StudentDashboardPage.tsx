import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { Course } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { GraduationCap, BookOpen, Layers, CheckCircle, ArrowRight, Play } from 'lucide-react';

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentCourses();
  }, []);

  const fetchStudentCourses = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<{ courses: Course[] }>('/courses');
      setCourses(data.courses);
    } catch (err) {
      console.error('Failed to fetch student courses:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner Card */}
      <div className="relative bg-gradient-to-r from-brand-900/80 via-slate-900 to-slate-900 border border-brand-500/20 rounded-3xl p-8 shadow-2xl overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-500/20 text-brand-300 rounded-full border border-brand-500/30 text-xs font-semibold">
            <GraduationCap className="w-4 h-4" /> Student Workspace
          </div>
          <h1 className="text-3xl font-extrabold text-white">Welcome back, {user?.name}!</h1>
          <p className="text-sm text-slate-300 max-w-xl">
            Track your course progress, watch videos, read lesson materials, and access your certificates.
          </p>
        </div>
      </div>

      {/* My Courses Section */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-400" />
          My Enrolled Courses ({courses.length})
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <EmptyState
            title="No courses available"
            description="Your administrator hasn't assigned any active courses to your student account yet."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all duration-200"
              >
                <div>
                  <div className="relative h-44 bg-slate-950 overflow-hidden">
                    <img
                      src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="font-bold text-lg text-white group-hover:text-brand-400 transition-colors line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {course.description}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300">Progress</span>
                        <span className="font-bold text-brand-400">{course.progressPercent || 0}%</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className="bg-gradient-to-r from-brand-500 to-blue-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${course.progressPercent || 0}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {course.completedLessons || 0} of {course.totalLessons || 0} lessons completed
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Link
                    to={`/courses/${course.slug}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-brand-500/20"
                  >
                    <span>{course.progressPercent && course.progressPercent > 0 ? 'Continue Course' : 'Start Course'}</span>
                    <Play className="w-4 h-4 fill-white" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
