import { useEffect, useState } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, ShieldAlert, Inbox } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';
import { fetchActivityLogs, type ActivityLogListParams } from '../api/activityLogs';
import type { ApiActivityLog } from '../api/dashboard';
import { actionMeta, fallbackActionMeta, activityTargetLabel } from '../utils/activity';
import { formatDate } from '../utils/format';

export default function ActivityLogPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const action = searchParams.get('action') ?? 'all';
  const from = searchParams.get('from') ?? '';
  const to = searchParams.get('to') ?? '';
  const page = Number(searchParams.get('page') ?? '1');

  const [logs, setLogs] = useState<ApiActivityLog[]>([]);
  const [availableActions, setAvailableActions] = useState<string[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    const params: ActivityLogListParams = {
      action: action === 'all' ? undefined : action,
      from: from || undefined,
      to: to || undefined,
      page,
    };

    fetchActivityLogs(params)
      .then((res) => {
        if (cancelled) return;
        setLogs(res.data);
        setMeta(res.meta);
        setAvailableActions(res.meta.available_actions);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Could not load the activity log. Please try again.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAdmin, action, from, to, page]);

  const updateParams = (patch: Record<string, string | undefined>, resetPage = true) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined || value === 'all' || value === '') next.delete(key);
        else next.set(key, value);
      }
      if (resetPage) next.delete('page');
      return next;
    });
  };

  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <ShieldAlert className="w-7 h-7 text-slate-400" />
        </div>
        <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200">Admins only</h2>
        <p className="text-[13px] text-slate-400 mt-1 max-w-sm">
          The system activity log is only visible to administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Activity Log</h1>
        <p className="text-[13px] text-slate-400 mt-0.5">
          {meta.total} {meta.total === 1 ? 'event' : 'events'} across the portal
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-slate-400">Action</span>
          <select
            value={action}
            onChange={(e) => updateParams({ action: e.target.value })}
            className="px-3 py-1.5 text-[13px] font-medium bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-800 cursor-pointer"
          >
            <option value="all">All Actions</option>
            {availableActions.map((a) => (
              <option key={a} value={a}>{actionMeta[a]?.label ?? a}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-slate-400">From</span>
          <input
            type="date"
            value={from}
            onChange={(e) => updateParams({ from: e.target.value })}
            className="px-3 py-1.5 text-[13px] font-medium bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-slate-400">To</span>
          <input
            type="date"
            value={to}
            onChange={(e) => updateParams({ to: e.target.value })}
            className="px-3 py-1.5 text-[13px] font-medium bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-800"
          />
        </div>

        {(action !== 'all' || from || to) && (
          <button
            onClick={() => updateParams({ action: undefined, from: undefined, to: undefined })}
            className="text-[12px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <LoadingScreen />
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
          <AlertCircle className="w-8 h-8 text-rose-400" />
          <p className="text-[14px] font-semibold text-slate-700 dark:text-slate-200">Couldn't load the activity log</p>
          <p className="text-[13px] text-slate-400 max-w-sm">{error}</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="text-[15px] font-bold text-slate-700 dark:text-slate-200">No activity found</h3>
          <p className="text-[13px] text-slate-400 mt-1 max-w-sm">
            {action !== 'all' || from || to ? 'Try adjusting your filters.' : 'Nothing has happened yet.'}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <th className="text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-2.5">Action</th>
                    <th className="text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-2.5">User</th>
                    <th className="text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-2.5 hidden md:table-cell">Target</th>
                    <th className="text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-2.5">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const { icon: Icon, bg, text, label } = actionMeta[log.action] ?? fallbackActionMeta;
                    const target = activityTargetLabel(log);
                    return (
                      <tr key={log.id} className="border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg ${bg} ${text} flex items-center justify-center shrink-0`}>
                              <Icon className="w-4 h-4" strokeWidth={2} />
                            </div>
                            <span className="text-[13px] font-medium text-slate-700 dark:text-slate-200">{label}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-[13px] text-slate-600 dark:text-slate-300">{log.user?.name ?? 'System'}</td>
                        <td className="px-3 py-3 text-[13px] text-slate-500 dark:text-slate-400 hidden md:table-cell">{target || '—'}</td>
                        <td className="px-3 py-3 text-[12px] text-slate-400 whitespace-nowrap">{formatDate(log.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {meta.last_page > 1 && (
            <div className="flex items-center justify-between">
              <button
                onClick={() => updateParams({ page: String(page - 1) }, false)}
                disabled={page <= 1}
                className="flex items-center gap-1 px-3 py-1.5 text-[13px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-[13px] text-slate-400">Page {meta.current_page} of {meta.last_page}</span>
              <button
                onClick={() => updateParams({ page: String(page + 1) }, false)}
                disabled={page >= meta.last_page}
                className="flex items-center gap-1 px-3 py-1.5 text-[13px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
