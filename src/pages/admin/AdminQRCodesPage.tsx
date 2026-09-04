import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { Course } from '../../types';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { QRCodeModal } from '../../components/qr/QRCodeModal';
import { QrCode, ExternalLink, Download, Layers } from 'lucide-react';

export const AdminQRCodesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<{ courses: Course[] }>('/courses');
      setCourses(data.courses);
    } catch (err) {
      console.error('Failed to load courses for QR studio:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <QrCode className="w-6 h-6 text-brand-400" />
          Course QR Code Studio
        </h1>
        <p className="text-sm text-slate-400">
          Generate, preview, and download high-resolution PNG & SVG vector QR codes for offline and online course marketing.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
            >
              <div className="flex items-start gap-4">
                <img
                  src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80'}
                  alt={course.title}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-800 shrink-0"
                />
                <div>
                  <h3 className="font-bold text-base text-white line-clamp-1">{course.title}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-1">/courses/{course.slug}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  {course._count?.lessons || 0} Lessons
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedCourse(course)}
                  icon={<QrCode className="w-4 h-4" />}
                >
                  Generate QR
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCourse && (
        <QRCodeModal
          isOpen={!!selectedCourse}
          onClose={() => setSelectedCourse(null)}
          courseId={selectedCourse.id}
          courseTitle={selectedCourse.title}
        />
      )}
    </div>
  );
};
