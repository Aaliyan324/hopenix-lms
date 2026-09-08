import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { AuditLog } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { History, Search, ArrowLeft, ArrowRight, Activity, Sparkles, Shield } from 'lucide-react';

export const AdminActivityLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [page, search]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search,
      });
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

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* Header Banner - Matches dashboard style */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 sm:p-10 shadow-editorial border border-slate-800">
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden md:block">
          <Sparkles className="w-40 h-40 text-orange-400" />
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Activity className="w-3.5 h-3.5" />
              Audit Trail
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white">
              System Audit Logbook
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed font-light">
              Track important actions including course creation, lesson modifications, file uploads, and user permission changes.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <History className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-semibold text-white">
                {logs.length} Entries
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-editorial">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search logs by action or user name..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl text-slate-900 text-sm outline-none transition-all placeholder-slate-400"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-editorial">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
              <Activity className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <p className="text-slate-900 font-semibold text-sm">No activity log entries found</p>
              <p className="text-slate-500 text-xs mt-1 font-medium">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Entity</th>
                  <th className="px-6 py-4 hidden md:table-cell">Metadata</th>
                  <th className="px-6 py-4">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={log.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${log.user?.name || 'System'}`}
                          alt={log.user?.name || 'System'}
                          className="w-8 h-8 rounded-xl bg-slate-200 object-cover border border-slate-200 shadow-xs"
                        />
                        <span className="text-sm">{log.user?.name || 'System'}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant="brand" size="sm" className="bg-orange-50 text-orange-700 border-orange-200 font-semibold">
                        {log.action}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-slate-700 font-mono text-xs">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="font-medium text-slate-900">{log.entityType}</span>
                        <span className="text-slate-400">({log.entityId || 'N/A'})</span>
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate font-mono text-xs hidden md:table-cell">
                      {log.metadata ? (
                        <span className="bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 text-slate-600">
                          {log.metadata}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap text-xs font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-400" />
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-editorial">
        <p className="text-sm text-slate-500 font-medium">
          Page <span className="font-bold text-slate-900">{page}</span> of <span className="font-bold text-slate-900">{totalPages}</span>
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-orange-600 hover:bg-orange-50 hover:border-orange-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-400 font-medium px-2">
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
      </div>
    </div>
  );
};