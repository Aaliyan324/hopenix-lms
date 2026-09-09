import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { AuditLog } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { 
  History, 
  Search, 
  ArrowLeft, 
  ArrowRight, 
  Activity, 
  Sparkles, 
  Shield,
  Filter,
  RefreshCw,
  Clock,
  User,
  FileText,
  BookOpen,
  Users,
  Settings,
  Calendar,
  ChevronDown,
  ChevronUp,
  Download,
} from 'lucide-react';
import { motion } from 'framer-motion';

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
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
  },
};

export const AdminActivityLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState<string>('');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [page, search, actionFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search,
      });
      if (actionFilter) query.append('action', actionFilter);
      
      const data = await apiFetch<{ logs: AuditLog[]; pagination: { totalPages: number } }>(
        `/stats/logs?${query.toString()}`
      );
      setLogs(data.logs);
      setTotalPages(data.pagination.totalPages || 1);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (logId: string) => {
    setExpandedLog(expandedLog === logId ? null : logId);
  };

  const getActionColor = (action: string) => {
    const actionMap: Record<string, string> = {
      'CREATE': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'UPDATE': 'bg-blue-100 text-blue-700 border-blue-200',
      'DELETE': 'bg-rose-100 text-rose-700 border-rose-200',
      'PUBLISH': 'bg-purple-100 text-purple-700 border-purple-200',
      'UNPUBLISH': 'bg-amber-100 text-amber-700 border-amber-200',
      'LOGIN': 'bg-orange-100 text-orange-700 border-orange-200',
      'LOGOUT': 'bg-slate-100 text-slate-700 border-slate-200',
      'UPLOAD': 'bg-cyan-100 text-cyan-700 border-cyan-200',
      'PERMISSION': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    };
    return actionMap[action] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getEntityIcon = (entityType: string) => {
    const iconMap: Record<string, any> = {
      'BOOK': BookOpen,
      'LESSON': FileText,
      'USER': Users,
      'COURSE': BookOpen,
      'PERMISSION': Shield,
      'SETTINGS': Settings,
    };
    const Icon = iconMap[entityType] || Activity;
    return <Icon className="w-3.5 h-3.5" />;
  };

  // Get unique actions for filter
  const uniqueActions = [...new Set(logs.map(log => log.action))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-56 w-full rounded-3xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30 p-4 sm:p-6 lg:p-8 font-['Inter',sans-serif]">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-8 sm:pb-16"
      >
        {/* Header Banner */}
        <motion.div 
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 via-orange-500 to-orange-400 text-white p-6 sm:p-8 lg:p-10 shadow-2xl"
        >
          <div className="absolute -right-20 -bottom-20 w-72 sm:w-96 h-72 sm:h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none hidden md:block">
            <History className="w-48 h-48 text-white" />
          </div>
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold uppercase tracking-wider font-['Poppins',sans-serif]">
                  <Activity className="w-3.5 h-3.5" />
                  Audit Trail
                </div>
                <h1 className="font-['Poppins',sans-serif] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                  Activity Logbook
                </h1>
                <p className="text-sm sm:text-base text-orange-100 max-w-2xl leading-relaxed">
                  Track important actions including course creation, lesson modifications, file uploads, and user permission changes.
                </p>
                
                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="flex items-center gap-2 text-sm text-orange-100 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <History className="w-4 h-4" />
                    <span className="font-semibold text-white">{logs.length}</span>
                    <span>Entries</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-orange-100 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <Clock className="w-4 h-4" />
                    <span className="font-semibold text-white">
                      {new Date().toLocaleDateString()}
                    </span>
                    <span>Today</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => fetchLogs()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-orange-600 hover:bg-orange-50 text-sm font-semibold rounded-2xl transition-all shadow-lg shadow-orange-700/30 active:scale-[0.98] font-['Poppins',sans-serif]"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div 
          variants={itemVariants}
          className="bg-white/90 backdrop-blur-sm border border-orange-100 rounded-2xl p-4 shadow-[0_8px_30px_rgba(249,115,22,0.08)]"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search logs by action or user name..."
                className="w-full bg-orange-50/30 border border-slate-200/80 focus:border-orange-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors font-['Inter',sans-serif]"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {uniqueActions.length > 0 && (
                <select
                  value={actionFilter}
                  onChange={(e) => {
                    setActionFilter(e.target.value);
                    setPage(1);
                  }}
                  className="bg-orange-50/30 border border-slate-200/80 focus:border-orange-500 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors font-['Inter',sans-serif]"
                >
                  <option value="">All Actions</option>
                  {uniqueActions.map(action => (
                    <option key={action} value={action}>{action}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </motion.div>

        {/* Logs Cards */}
        <motion.div 
          variants={containerVariants}
          className="space-y-3"
        >
          {logs.length === 0 ? (
            <motion.div 
              variants={itemVariants}
              className="bg-white/90 backdrop-blur-sm border border-orange-100 rounded-3xl p-8 sm:p-12 shadow-[0_8px_30px_rgba(249,115,22,0.08)] text-center"
            >
              <Activity className="w-12 h-12 text-orange-300 mx-auto mb-4" />
              <p className="text-lg font-['Poppins',sans-serif] font-semibold text-slate-900">No activity log entries found</p>
              <p className="text-sm text-slate-500 mt-1 font-['Inter',sans-serif]">
                {search || actionFilter ? 'Try adjusting your search or filter criteria.' : 'Activity will appear here as users interact with the platform.'}
              </p>
            </motion.div>
          ) : (
            logs.map((log) => {
              const isExpanded = expandedLog === log.id;
              return (
                <motion.div
                  key={log.id}
                  variants={itemVariants}
                  className="bg-white/90 backdrop-blur-sm border border-orange-100 rounded-2xl shadow-[0_8px_30px_rgba(249,115,22,0.08)] hover:shadow-[0_12px_40px_rgba(249,115,22,0.12)] transition-all duration-300 overflow-hidden"
                >
                  <div 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-3 sm:gap-4 cursor-pointer hover:bg-orange-50/30 transition-colors"
                    onClick={() => toggleExpand(log.id)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={log.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${log.user?.name || 'System'}`}
                        alt={log.user?.name || 'System'}
                        className="w-10 h-10 rounded-xl bg-orange-100 object-cover border border-orange-200 shadow-xs flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-900 font-['Poppins',sans-serif] text-sm truncate">
                            {log.user?.name || 'System'}
                          </span>
                          <Badge variant="brand" size="sm" className={`font-['Inter',sans-serif] text-[10px] ${getActionColor(log.action)}`}>
                            {log.action}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-['Inter',sans-serif]">
                          <span className="flex items-center gap-1">
                            {getEntityIcon(log.entityType)}
                            {log.entityType}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {log.metadata && (
                        <span className="text-[10px] text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 font-['Inter',sans-serif] truncate max-w-[150px] hidden sm:block">
                          {log.metadata}
                        </span>
                      )}
                      <span className="text-slate-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-orange-100 px-4 sm:px-5 py-4 bg-orange-50/20"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-['Poppins',sans-serif]">Log ID</p>
                          <p className="text-xs font-mono text-slate-700 font-['Inter',sans-serif]">{log.id}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-['Poppins',sans-serif]">Entity ID</p>
                          <p className="text-xs font-mono text-slate-700 font-['Inter',sans-serif]">{log.entityId || 'N/A'}</p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-['Poppins',sans-serif]">Metadata</p>
                          <p className="text-xs text-slate-700 font-['Inter',sans-serif] bg-white/50 p-2 rounded-lg border border-slate-200 font-mono">
                            {log.metadata || 'No additional metadata'}
                          </p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-['Poppins',sans-serif]">Timestamp</p>
                          <p className="text-xs text-slate-700 font-['Inter',sans-serif] flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(log.createdAt).toLocaleString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                              timeZoneName: 'short'
                            })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })
          )}
        </motion.div>

        {/* Pagination Footer */}
        <motion.div 
          variants={itemVariants}
          className="bg-white/90 backdrop-blur-sm border border-orange-100 rounded-2xl p-4 shadow-[0_8px_30px_rgba(249,115,22,0.08)] flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-sm text-slate-500 font-medium font-['Inter',sans-serif]">
            Page <span className="font-bold text-slate-900 font-['Poppins',sans-serif]">{page}</span> of <span className="font-bold text-slate-900 font-['Poppins',sans-serif]">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-orange-600 hover:bg-orange-50 hover:border-orange-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-400 font-medium px-2 font-['Inter',sans-serif]">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-orange-600 hover:bg-orange-50 hover:border-orange-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};