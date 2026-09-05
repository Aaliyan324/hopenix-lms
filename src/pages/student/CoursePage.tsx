import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { Course } from '../../types';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { ArrowLeft, CheckCircle2, Play, Sparkles, Star, Trophy, Rocket, Compass, Gift } from 'lucide-react';

export const CoursePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) fetchCourse();
  }, [slug]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<{ course: Course }>(`/courses/${slug}`);
      setCourse(data.course);
    } catch (err: any) {
      toast(err.message || 'Failed to load course details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !course) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto p-4">
        <Skeleton className="h-10 w-48 rounded-full bg-indigo-100" />
        <Skeleton className="h-72 w-full rounded-3xl bg-indigo-100" />
        <Skeleton className="h-96 w-full rounded-3xl bg-indigo-100" />
      </div>
    );
  }

  const completedCount = course.lessons?.filter((l) => l.completed).length || 0;
  const totalCount = course.lessons?.length || 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Find next lesson to study
  const firstUncompleted = course.lessons?.find((l) => !l.completed) || course.lessons?.[0];

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16 px-4 bg-gradient-to-b from-sky-50 via-purple-50 to-pink-50 min-h-screen font-sans">
      
      {/* Back Button */}
      <Link
        to="/student"
        className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-yellow-100 text-purple-700 font-extrabold text-sm rounded-full shadow-md border-2 border-purple-200 transition-transform active:scale-95"
      >
        <ArrowLeft className="w-5 h-5 text-purple-600" /> 🏠 Back to My Treehouse
      </Link>

      {/* Course Header Banner */}
      <div className="bg-white border-4 border-purple-300 rounded-[35px] overflow-hidden shadow-[0_12px_0_0_#e9d5ff] transition-all">
        <div className="relative h-64 sm:h-80 bg-indigo-100 overflow-hidden">
          <img
            src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80'}
            alt={course.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-purple-900/20 to-transparent flex items-end p-6 sm:p-8">
            <div className="space-y-2 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-yellow-300 bg-yellow-400/20 backdrop-blur-md px-3.5 py-1.5 rounded-full border-2 border-yellow-300 shadow-sm animate-bounce">
                <Sparkles className="w-4 h-4 text-yellow-300" /> {totalCount} Fun Adventures!
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-white drop-shadow-[0_3px_3px_rgba(0,0,0,0.4)]">
                {course.title}
              </h1>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6 bg-gradient-to-b from-white to-purple-50/50">
          <p className="text-base sm:text-lg text-purple-900 font-medium leading-relaxed bg-purple-50/80 p-4 rounded-2xl border-2 border-dashed border-purple-200">
            📖 {course.description}
          </p>

          {/* Kids Progress Bar */}
          <div className="bg-white border-3 border-pink-200 rounded-3xl p-5 space-y-3 shadow-inner">
            <div className="flex items-center justify-between text-sm sm:text-base">
              <span className="font-extrabold text-purple-800 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500 animate-pulse" /> Your Awesome Progress:
              </span>
              <span className="font-black text-pink-600 bg-pink-100 px-3 py-1 rounded-full border border-pink-300 text-sm">
                {progressPercent}% Complete! 🌟
              </span>
            </div>
            <div className="w-full bg-pink-100 rounded-full h-5 p-1 border-2 border-pink-200 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 h-full rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Call to Action Button */}
          {firstUncompleted && (
            <Link
              to={`/courses/${course.slug}/lessons/${firstUncompleted.slug}`}
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-purple-950 text-lg font-black rounded-2xl transition-all shadow-[0_6px_0_0_#d97706] active:translate-y-1.5 active:shadow-[0_0px_0_0_#d97706] w-full sm:w-auto border-3 border-orange-500"
            >
              <Rocket className="w-6 h-6 text-purple-900 group-hover:rotate-12 transition-transform" />
              <span>{completedCount > 0 ? '🚀 Keep Exploring!' : '🚀 Start First Adventure!'}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Lesson Quest Map */}
      <div className="space-y-4">
        <h3 className="text-2xl font-black text-purple-900 flex items-center gap-3 px-2">
          <Compass className="w-7 h-7 text-pink-500 animate-spin-slow" />
          <span>Adventure Map ({totalCount} Stops)</span>
        </h3>

        <div className="space-y-4">
          {course.lessons?.map((lesson, idx) => (
            <Link
              key={lesson.id}
              to={`/courses/${course.slug}/lessons/${lesson.slug}`}
              className={`flex items-center justify-between p-5 rounded-3xl border-3 transition-all duration-300 group shadow-md hover:shadow-xl hover:-translate-y-1 ${
                lesson.completed
                  ? 'bg-emerald-50/90 border-emerald-300 hover:border-emerald-400'
                  : 'bg-white border-purple-200 hover:border-purple-400'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Number Badge or Checkmark */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow-sm border-2 transition-transform group-hover:scale-110 ${
                    lesson.completed
                      ? 'bg-emerald-400 text-white border-emerald-500 shadow-emerald-200'
                      : 'bg-yellow-300 text-yellow-900 border-yellow-400 shadow-yellow-100'
                  }`}
                >
                  {lesson.completed ? <CheckCircle2 className="w-7 h-7" /> : `0${idx + 1}`}
                </div>

                <div>
                  <h4 className="text-lg font-black text-purple-900 group-hover:text-pink-600 transition-colors">
                    {lesson.title}
                  </h4>
                  {lesson.description && (
                    <p className="text-xs sm:text-sm text-purple-700/80 line-clamp-1 font-medium">
                      {lesson.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {lesson.media && lesson.media.length > 0 && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-xs font-extrabold text-purple-700 bg-purple-100 px-3 py-1.5 rounded-full border border-purple-200 shadow-sm">
                    <Gift className="w-3.5 h-3.5 text-purple-500" /> {lesson.media.length} Treats
                  </span>
                )}
                <div className="w-10 h-10 rounded-full bg-purple-100 group-hover:bg-pink-500 group-hover:text-white text-purple-600 flex items-center justify-center transition-all border-2 border-purple-200 group-hover:border-pink-600 shadow-sm">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};