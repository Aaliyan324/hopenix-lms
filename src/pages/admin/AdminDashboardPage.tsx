import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { DashboardStats, AuditLog } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
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
  Book,
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
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Books', value: stats?.totalBooks || stats?.totalCourses || 0, icon: BookOpen, color: 'text-brand-400', bg: 'bg-brand-500/10 border-brand-500/20' },
    { label: 'Published Books', value: stats?.publishedBooks || stats?.publishedCourses || 0, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Total Lessons', value: stats?.totalLessons || 0, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Published Lessons', value: stats?.publishedLessons || 0, icon: Eye, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
    { label: 'Students', value: stats?.totalStudents || 0, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { label: 'Editors', value: stats?.totalEditors || 0, icon: UserCheck, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">E-Book Portal Admin Console</h1>
          <p className="text-sm text-slate-400">Overview of books catalog, lessons, student progress, and activity logs.</p>
        </div>
        <Link
          to="/admin/books"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-brand-500/20 w-fit"
        >
          <Plus className="w-4 h-4" />
          Create New Book
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx} className="relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    {item.label}
                  </p>
                  <p className="text-3xl font-extrabold text-white">{item.value}</p>
                </div>
                <div className={`p-3 rounded-2xl border ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-400" />
            <h3 className="text-lg font-semibold text-white">Recent E-Book Activity & Audit Logs</h3>
          </div>
          <Link
            to="/admin/activity-logs"
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
          >
            View Full Activity Log <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentLogs.length === 0 ? (
          <p className="text-sm text-slate-500 italic p-6 text-center">No activity recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl text-sm"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={log.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${log.user?.name || 'System'}`}
                    alt={log.user?.name || 'User'}
                    className="w-8 h-8 rounded-full bg-slate-800 object-cover"
                  />
                  <div>
                    <p className="text-xs font-semibold text-white">
                      {log.user?.name || 'System'} <span className="font-normal text-slate-400">({log.action})</span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Target: <span className="text-slate-300">{log.entityType}</span> ({log.entityId || 'N/A'})
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="brand" size="sm">
                    {log.action}
                  </Badge>
                  <p className="text-[10px] text-slate-500 mt-1">
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
