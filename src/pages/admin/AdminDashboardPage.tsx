import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { DashboardStats, AuditLog } from '../../types';
import { Card } from '../../components/ui/Card';
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
  Sparkles,
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
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Books', value: stats?.totalBooks || stats?.totalCourses || 0, icon: BookOpen, color: 'text-purple-300', bg: 'bg-purple-500/15 border-purple-500/30' },
    { label: 'Published Books', value: stats?.publishedBooks || stats?.publishedCourses || 0, icon: CheckCircle, color: 'text-emerald-300', bg: 'bg-emerald-500/15 border-emerald-500/30' },
    { label: 'Total Lessons', value: stats?.totalLessons || 0, icon: FileText, color: 'text-sky-300', bg: 'bg-sky-500/15 border-sky-500/30' },
    { label: 'Published Lessons', value: stats?.publishedLessons || 0, icon: Eye, color: 'text-teal-300', bg: 'bg-teal-500/15 border-teal-500/30' },
    { label: 'Editors', value: stats?.totalEditors || 0, icon: UserCheck, color: 'text-amber-300', bg: 'bg-amber-500/15 border-amber-500/30' },
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <PlayfulBanner
        badgeText="Admin Control Center"
        badgeIcon={<Shield className="w-4 h-4 text-purple-300" />}
        title="📚 Library Control Center"
        subtitle="Manage digital book catalog, monitor lesson progress, manage editor permissions, and review real-time audit logs."
        variant="purple"
      >
        <Link
          to="/admin/books"
          className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white text-xs font-extrabold rounded-2xl transition-all shadow-lg shadow-brand-500/25 border border-pink-400/30 hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          Create New Digital Book
        </Link>
      </PlayfulBanner>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx} className="relative overflow-hidden group hoverable">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                    {item.label}
                  </p>
                  <p className="text-3xl font-black text-white">{item.value}</p>
                </div>
                <div className={`p-3.5 rounded-2xl border ${item.bg} ${item.color} group-hover:scale-110 transition-transform shadow-inner`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity Section */}
      <div className="bg-slate-900/90 border border-purple-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-6 border-b border-purple-500/15 pb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-300" />
            <h3 className="text-lg font-extrabold text-white">Recent E-Book Activity & Audit Logs</h3>
          </div>
          <Link
            to="/admin/activity-logs"
            className="text-xs font-extrabold text-brand-300 hover:text-white flex items-center gap-1 bg-brand-500/10 px-3 py-1.5 rounded-xl border border-brand-500/20 transition-all"
          >
            View Full Activity Log <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentLogs.length === 0 ? (
          <p className="text-sm text-slate-400 italic p-8 text-center font-medium">No activity recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-4 bg-slate-950/80 border border-slate-800/80 rounded-2xl text-sm"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={log.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${log.user?.name || 'System'}`}
                    alt={log.user?.name || 'User'}
                    className="w-9 h-9 rounded-full bg-slate-900 border border-purple-500/30 object-cover"
                  />
                  <div>
                    <p className="text-xs font-extrabold text-white">
                      {log.user?.name || 'System'} <span className="font-normal text-slate-400">({log.action})</span>
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Target: <span className="text-slate-200 font-semibold">{log.entityType}</span> ({log.entityId || 'N/A'})
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="purple" size="sm">
                    {log.action}
                  </Badge>
                  <p className="text-[10px] font-bold text-slate-500 mt-1">
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
