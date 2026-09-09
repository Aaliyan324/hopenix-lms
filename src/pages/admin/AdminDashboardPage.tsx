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
  Zap,
  Globe,
  Layers,
  BarChart3,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] }
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
      <div className="min-h-screen bg-gradient-to-b from-orange-100 via-orange-50 to-white p-4 sm:p-6 lg:p-8">
        <div className="space-y-6 max-w-7xl mx-auto">
          <Skeleton className="h-44 w-full rounded-3xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96 lg:col-span-2 rounded-3xl" />
            <Skeleton className="h-96 rounded-3xl" />
          </div>
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
      change: 'Across modules'
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
    <div className="min-h-screen bg-gradient-to-b from-orange-100 via-orange-50 to-white text-slate-900 p-4 sm:p-6 lg:p-8 font-['Inter',sans-serif]">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-16"
      >
        {/* Header Banner */}
        <motion.div 
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-orange-700 via-orange-600 to-orange-500 text-white p-6 sm:p-8 lg:p-10 shadow-xl border border-orange-400/30"
        >
          <div className="absolute -right-16 -bottom-16 w-64 sm:w-80 h-64 sm:h-80 bg-orange-400/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute top-0 right-0 p-6 sm:p-8 opacity-10 pointer-events-none hidden md:block">
            <Sparkles className="w-32 sm:w-40 h-32 sm:h-40 text-white" />
          </div>
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
            <div className="space-y-2 sm:space-y-3">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-md font-['Poppins',sans-serif]"
              >
                <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Admin Control Center
              </motion.div>
              <h1 className="font-['Poppins',sans-serif] text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tight text-white">
                Dashboard Console
              </h1>
              <p className="text-sm sm:text-base text-orange-100 max-w-2xl leading-relaxed font-light">
                Manage digital book catalog, monitor lesson progress, coordinate editor permissions, and audit real-time system activity.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/admin/books"
                  className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3.5 bg-white text-orange-600 hover:bg-orange-50 text-sm font-semibold rounded-xl sm:rounded-2xl transition-all shadow-lg shadow-orange-700/30 active:scale-[0.99] font-['Poppins',sans-serif] whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  New Digital Book
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/admin/activity-logs"
                  className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3.5 bg-orange-800/40 hover:bg-orange-800/60 text-white border border-white/20 text-sm font-semibold rounded-xl sm:rounded-2xl transition-all backdrop-blur-md font-['Poppins',sans-serif] whitespace-nowrap"
                >
                  <Activity className="w-4 h-4 text-orange-200" />
                  Audit Logs
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Bento Grid Stats Row */}
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
                className="group bg-white/90 backdrop-blur-sm border border-orange-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-[0_8px_30px_rgba(249,115,22,0.08)] hover:shadow-[0_12px_40px_rgba(249,115,22,0.15)] hover:border-orange-300 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider font-['Poppins',sans-serif]">
                    {item.label}
                  </span>
                  <div className={`p-2 sm:p-2.5 rounded-xl border ${item.bg} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${item.iconClass}`} />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 font-['Poppins',sans-serif] tracking-tight">{item.value}</p>
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-slate-500 pt-1">
                    <TrendingUp className="w-3 h-3 text-orange-500" />
                    <span className="font-['Inter',sans-serif]">{item.change}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Main Split Layout: Quick Actions & System Health + Audit Trail */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: System Status & Quick Shortcuts */}
          <motion.div variants={itemVariants} className="space-y-6">
            
            {/* System Health Card */}
            <div className="bg-white/90 backdrop-blur-sm border border-orange-100 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-[0_8px_30px_rgba(249,115,22,0.08)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 font-['Poppins',sans-serif]">System Status</h3>
                    <p className="text-[10px] sm:text-xs text-slate-500">All services operating normally</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] sm:text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-orange-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-sky-600" /> API Gateway</span>
                  <span className="font-semibold text-emerald-600">24ms</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-amber-600" /> Database Pool</span>
                  <span className="font-semibold text-slate-700">12 / 50 Active</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5 text-indigo-600" /> Sync Status</span>
                  <span className="font-semibold text-indigo-600">Up to date</span>
                </div>
              </div>
            </div>

            {/* Quick Navigation Shortcuts */}
            <div className="bg-white/90 backdrop-blur-sm border border-orange-100 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-[0_8px_30px_rgba(249,115,22,0.08)] space-y-3">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 font-['Poppins',sans-serif]">Quick Shortcuts</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/admin/books" className="p-3 bg-orange-50/50 hover:bg-orange-50 border border-orange-100 hover:border-orange-300 rounded-xl transition-all group flex flex-col gap-1.5">
                  <BookOpen className="w-4 h-4 text-orange-600 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-slate-800">Catalog</span>
                </Link>
                <Link to="/admin/activity-logs" className="p-3 bg-orange-50/50 hover:bg-orange-50 border border-orange-100 hover:border-orange-300 rounded-xl transition-all group flex flex-col gap-1.5">
                  <Activity className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-slate-800">Audit Logs</span>
                </Link>
              </div>
            </div>

          </motion.div>

          {/* Right Column: Recent Activity Section */}
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-2 bg-white/90 backdrop-blur-sm border border-orange-100 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 shadow-[0_8px_30px_rgba(249,115,22,0.08)] flex flex-col justify-between"
          >
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-orange-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-orange-50 border border-orange-100 text-orange-600 flex-shrink-0">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-['Poppins',sans-serif] font-bold text-slate-900 tracking-tight">System Audit Trail</h3>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-['Inter',sans-serif]">Real-time tracking of editorial actions and modifications</p>
                  </div>
                </div>
                <Link
                  to="/admin/activity-logs"
                  className="text-xs font-semibold text-slate-600 hover:text-orange-600 flex items-center gap-1.5 bg-orange-50/50 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-orange-100 hover:border-orange-300 hover:bg-orange-50 transition-all font-['Inter',sans-serif] whitespace-nowrap flex-shrink-0"
                >
                  View Full Log <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </Link>
              </div>

              {recentLogs.length === 0 ? (
                <div className="text-center py-10 sm:py-12 px-4 rounded-2xl bg-orange-50/30 border border-dashed border-orange-200">
                  <Clock className="w-8 h-8 text-orange-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-500 font-['Poppins',sans-serif]">No activity recorded yet.</p>
                  <p className="text-xs text-slate-400 mt-1 font-['Inter',sans-serif]">Actions performed by editors and admins will appear here.</p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3 max-h-[380px] overflow-y-auto pr-1 sm:pr-2">
                  {recentLogs.map((log, index) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-orange-50/40 border border-orange-100/60 rounded-xl sm:rounded-2xl hover:bg-white hover:border-orange-200 hover:shadow-[0_4px_20px_rgba(249,115,22,0.08)] transition-all duration-200"
                    >
                      <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                        <img
                          src={log.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${log.user?.name || 'System'}`}
                          alt={log.user?.name || 'User'}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-orange-100 border border-orange-200 object-cover shadow-xs flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs sm:text-sm font-semibold text-slate-900 font-['Poppins',sans-serif] truncate">
                              {log.user?.name || 'System User'}
                            </p>
                            <span className="text-xs text-slate-400 hidden sm:inline">•</span>
                            <p className="text-[10px] sm:text-xs font-medium text-slate-500 font-['Inter',sans-serif] truncate">
                              {log.action}
                            </p>
                          </div>
                          <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 font-['Inter',sans-serif] truncate">
                            Target entity: <span className="text-slate-700 font-semibold">{log.entityType}</span> <span className="text-slate-400 hidden sm:inline">({log.entityId || 'N/A'})</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-orange-100 flex-shrink-0">
                        <Badge variant="slate" size="sm" className="bg-orange-100 text-orange-700 border-orange-200 font-['Inter',sans-serif] text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1">
                          {log.action}
                        </Badge>
                        <span className="text-[10px] sm:text-xs font-medium text-slate-400 bg-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-orange-100 shadow-2xs font-['Inter',sans-serif] whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
};