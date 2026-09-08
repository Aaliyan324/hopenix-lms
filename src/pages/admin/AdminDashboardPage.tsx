import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { DashboardStats, AuditLog } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { motion } from 'framer-motion';
import {
  BookOpen,
  FileText,
  UserCheck,
  CheckCircle,
  Eye,
  Activity,
  Plus,
  ArrowUpRight,
  Shield,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
  },
};

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
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { 
      label: 'Total Books', 
      value: stats?.totalBooks || stats?.totalCourses || 0, 
      icon: BookOpen, 
      iconClass: 'text-orange-600', 
      bg: 'bg-orange-50 border-orange-200/60',
      change: '+12% this month'
    },
    { 
      label: 'Published Books', 
      value: stats?.publishedBooks || stats?.publishedCourses || 0, 
      icon: CheckCircle, 
      iconClass: 'text-emerald-600', 
      bg: 'bg-emerald-50 border-emerald-200/60',
      change: 'Active catalog'
    },
    { 
      label: 'Total Lessons', 
      value: stats?.totalLessons || 0, 
      icon: FileText, 
      iconClass: 'text-sky-600', 
      bg: 'bg-sky-50 border-sky-200/60',
      change: 'Across all modules'
    },
    { 
      label: 'Published Lessons', 
      value: stats?.publishedLessons || 0, 
      icon: Eye, 
      iconClass: 'text-teal-600', 
      bg: 'bg-teal-50 border-teal-200/60',
      change: 'Live for readers'
    },
    { 
      label: 'Active Editors', 
      value: stats?.totalEditors || 0, 
      icon: UserCheck, 
      iconClass: 'text-amber-600', 
      bg: 'bg-amber-50 border-amber-200/60',
      change: 'Collaborating'
    },
  ];

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16"
    >
      {/* Header Banner with subtle float/fade */}
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 sm:p-10 shadow-editorial border border-slate-800"
      >
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden md:block">
          <Sparkles className="w-40 h-40 text-orange-400" />
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-3">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md"
            >
              <Shield className="w-3.5 h-3.5" />
              Admin Control Center
            </motion.div>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Library Overview
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed font-light">
              Manage digital book catalog, monitor lesson progress, coordinate editor permissions, and audit real-time system activity.
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/admin/books"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-2xl transition-all shadow-lg shadow-orange-500/25 active:scale-[0.99]"
            >
              <Plus className="w-4 h-4" />
              New Digital Book
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Metric Cards Grid */}
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5"
      >
        {statCards.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div 
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-editorial hover:border-orange-500/40 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500/0 group-hover:via-orange-500 transition-all duration-500" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {item.label}
                </span>
                <div className={`p-2.5 rounded-xl border ${item.bg} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  <Icon className={`w-5 h-5 ${item.iconClass}`} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-slate-900 font-serif tracking-tight">{item.value}</p>
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 pt-1">
                  <TrendingUp className="w-3 h-3 text-orange-500" />
                  <span>{item.change}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Recent Activity Section */}
      <motion.div 
        variants={itemVariants}
        className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-editorial"
      >
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-orange-50 border border-orange-100 text-orange-600">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-slate-900 tracking-tight">System Audit Trail</h3>
              <p className="text-xs text-slate-500">Real-time tracking of editorial actions and modifications</p>
            </div>
          </div>
          <Link
            to="/admin/activity-logs"
            className="text-xs font-semibold text-slate-600 hover:text-orange-600 flex items-center gap-1.5 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-orange-200 hover:bg-orange-50/50 transition-all"
          >
            View Full Log <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentLogs.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-slate-50/50 border border-dashed border-slate-200">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-500">No activity recorded yet.</p>
            <p className="text-xs text-slate-400 mt-1">Actions performed by editors and admins will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentLogs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50/60 border border-slate-100 rounded-2xl hover:bg-white hover:border-orange-200/80 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={log.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${log.user?.name || 'System'}`}
                    alt={log.user?.name || 'User'}
                    className="w-10 h-10 rounded-xl bg-slate-200 border border-slate-200 object-cover shadow-xs flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {log.user?.name || 'System User'}
                      </p>
                      <span className="text-xs text-slate-400">•</span>
                      <p className="text-xs font-medium text-slate-500">
                        {log.action}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Target entity: <span className="text-slate-700 font-semibold">{log.entityType}</span> <span className="text-slate-400">({log.entityId || 'N/A'})</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <Badge variant="slate" size="sm" className="bg-orange-50 text-orange-700 border-orange-200">
                    {log.action}
                  </Badge>
                  <span className="text-xs font-medium text-slate-400 bg-white px-2.5 py-1 rounded-md border border-slate-100 shadow-2xs">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};