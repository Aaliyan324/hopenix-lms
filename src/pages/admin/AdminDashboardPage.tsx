import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { DashboardStats, AuditLog } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { PlayfulBanner } from '../../components/ui/PlayfulBanner';
import {
  BookOpen,
  FileText,
  Users,
  UserCheck,
  CheckCircle,
  Eye,
  Activity,
  Plus,
  ArrowUpRight,
  Shield,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<{ stats: DashboardStats; recentLogs: AuditLog[] }>('/stats/dashboard');
      setStats(data.stats);
      setRecentLogs(data.recentLogs);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Books', value: stats?.totalBooks || stats?.totalCourses || 0, icon: BookOpen, iconClass: 'text-stone-700', bg: 'bg-stone-100 border-stone-200' },
    { label: 'Published Books', value: stats?.publishedBooks || stats?.publishedCourses || 0, icon: CheckCircle, iconClass: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Total Lessons', value: stats?.totalLessons || 0, icon: FileText, iconClass: 'text-sky-700', bg: 'bg-sky-50 border-sky-200' },
    { label: 'Published Lessons', value: stats?.publishedLessons || 0, icon: Eye, iconClass: 'text-teal-700', bg: 'bg-teal-50 border-teal-200' },
    { label: 'Editors', value: stats?.totalEditors || 0, icon: UserCheck, iconClass: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <PlayfulBanner
        badgeText="Admin Control Center"
        badgeIcon={<Shield className="w-4 h-4 text-stone-600" />}
        title="Library Control Center"
        subtitle="Manage digital book catalog, monitor lesson progress, manage editor permissions, and review real-time audit logs."
      >
        <Link
          to="/admin/books"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-semibold rounded-lg transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Create New Digital Book
        </Link>
      </PlayfulBanner>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                    {item.label}
                  </p>
                  <p className="text-3xl font-bold text-stone-900 font-serif">{item.value}</p>
                </div>
                <div className={`p-3 rounded-xl border ${item.bg}`}>
                  <Icon className={`w-6 h-6 ${item.iconClass}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-6 border-b border-stone-100 pb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-stone-600" />
            <h3 className="text-lg font-serif font-bold text-stone-900">Recent Activity & Audit Logs</h3>
          </div>
          <Link
            to="/admin/activity-logs"
            className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 transition-all"
          >
            View Full Log <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentLogs.length === 0 ? (
          <p className="text-sm text-stone-400 italic p-8 text-center font-medium">No activity recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-4 bg-stone-50 border border-stone-100 rounded-lg text-sm hover:border-stone-200 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={log.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${log.user?.name || 'System'}`}
                    alt={log.user?.name || 'User'}
                    className="w-8 h-8 rounded-full bg-stone-200 border border-stone-300 object-cover"
                  />
                  <div>
                    <p className="text-xs font-semibold text-stone-900">
                      {log.user?.name || 'System'} <span className="font-normal text-stone-500">({log.action})</span>
                    </p>
                    <p className="text-[11px] text-stone-500 font-medium">
                      Target: <span className="text-stone-700 font-semibold">{log.entityType}</span> ({log.entityId || 'N/A'})
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="slate" size="sm">
                    {log.action}
                  </Badge>
                  <p className="text-[10px] font-medium text-stone-400 mt-1">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


