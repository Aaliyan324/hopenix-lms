import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { AuditLog } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { History, Search, ArrowLeft, ArrowRight, Activity } from 'lucide-react';

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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
          <History className="w-6 h-6 text-stone-700" />
          System Audit Logbook
        </h1>
        <p className="text-sm text-stone-500 mt-1 font-sans">
          Track important actions including course creation, lesson modifications, file uploads, and user permission changes.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search logs by action or user name..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-lg text-stone-900 text-sm focus:outline-none focus:border-stone-800 focus:ring-1 focus:ring-stone-800 placeholder-stone-400 transition-colors"
        />
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-stone-400 italic p-12 text-center">No activity log entries found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Entity</th>
                  <th className="px-6 py-4">Metadata</th>
                  <th className="px-6 py-4">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-stone-900">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={log.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${log.user?.name || 'System'}`}
                          alt={log.user?.name || 'System'}
                          className="w-7 h-7 rounded-full bg-stone-200 object-cover border border-stone-200"
                        />
                        <span>{log.user?.name || 'System'}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant="brand" size="sm">
                        {log.action}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-stone-700 font-mono">
                      {log.entityType} ({log.entityId || 'N/A'})
                    </td>

                    <td className="px-6 py-4 text-stone-500 max-w-xs truncate font-mono text-[11px]">
                      {log.metadata || '-'}
                    </td>

                    <td className="px-6 py-4 text-stone-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-stone-500">
          Page {page} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg bg-white border border-stone-300 text-stone-600 hover:text-stone-900 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-2 rounded-lg bg-white border border-stone-300 text-stone-600 hover:text-stone-900 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

