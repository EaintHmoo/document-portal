import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, Inbox, Search, ShieldAlert, Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';
import { fetchUsers, updateUser, type ApiUserListItem } from '../api/users';
import { formatDate } from '../utils/format';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const keyword = searchParams.get('keyword') ?? '';
  const roleFilter = searchParams.get('role') ?? 'all';
  const statusFilter = searchParams.get('status') ?? 'all';
  const page = Number(searchParams.get('page') ?? '1');

  const [searchInput, setSearchInput] = useState(keyword);
  const [users, setUsers] = useState<ApiUserListItem[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ id: number; message: string } | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

  const isAdmin = currentUser?.role === 'admin';

  const load = useCallback(() => {
    if (!isAdmin) return Promise.resolve();

    setLoading(true);
    setError(null);

    return fetchUsers({
      keyword: keyword || undefined,
      role: roleFilter === 'all' ? undefined : (roleFilter as 'admin' | 'user'),
      is_active: statusFilter === 'all' ? undefined : statusFilter === 'active',
      page,
    })
      .then((res) => {
        setUsers(res.data);
        setMeta(res.meta);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Could not load users. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [isAdmin, keyword, roleFilter, statusFilter, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setSearchInput(keyword);
  }, [keyword]);

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ keyword: searchInput });
  };

  const handleToggleActive = async (target: ApiUserListItem) => {
    setSavingId(target.id);
    setRowError(null);
    try {
      await updateUser(target.id, { is_active: !target.is_active });
      await load();
    } catch (err) {
      setRowError({
        id: target.id,
        message: err instanceof ApiError ? err.message : 'Could not update this user. Please try again.',
      });
    } finally {
      setSavingId(null);
    }
  };

  const handleRoleChange = async (target: ApiUserListItem, role: 'admin' | 'user') => {
    if (role === target.role) return;
    setSavingId(target.id);
    setRowError(null);
    try {
      await updateUser(target.id, { role });
      await load();
    } catch (err) {
      setRowError({
        id: target.id,
        message: err instanceof ApiError ? err.message : 'Could not update this user. Please try again.',
      });
    } finally {
      setSavingId(null);
    }
  };

  if (!currentUser) return null;

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <ShieldAlert className="w-7 h-7 text-slate-400" />
        </div>
        <h2 className="text-lg font-bold text-slate-700">Admins only</h2>
        <p className="text-[13px] text-slate-400 mt-1 max-w-sm">User management is only available to administrators.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">User Management</h1>
        <p className="text-[13px] text-slate-400 mt-0.5">{meta.total} {meta.total === 1 ? 'user' : 'users'}</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name or email..."
            className="w-full pl-9 pr-4 py-2 text-[13px] bg-slate-50 border border-slate-200 rounded-lg placeholder:text-slate-400 focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-slate-100 outline-none transition-all"
          />
        </form>

        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-slate-400">Role</span>
          <select
            value={roleFilter}
            onChange={(e) => updateParams({ role: e.target.value })}
            className="px-3 py-1.5 text-[13px] font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-100 cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-slate-400">Status</span>
          <select
            value={statusFilter}
            onChange={(e) => updateParams({ status: e.target.value })}
            className="px-3 py-1.5 text-[13px] font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-100 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingScreen />
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
          <AlertCircle className="w-8 h-8 text-rose-400" />
          <p className="text-[14px] font-semibold text-slate-700">Couldn't load users</p>
          <p className="text-[13px] text-slate-400 max-w-sm">{error}</p>
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-slate-200 rounded-xl">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-[15px] font-bold text-slate-700">No users found</h3>
        </div>
      ) : (
        <>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-2.5">Name</th>
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-2.5 hidden sm:table-cell">Email</th>
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-2.5">Role</th>
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-2.5">Status</th>
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-2.5 hidden md:table-cell">Last Login</th>
                    <th className="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-2.5">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isSelf = u.id === currentUser.id;
                    const saving = savingId === u.id;
                    return (
                      <tr key={u.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors align-top">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${u.role === 'admin' ? 'bg-gradient-to-br from-violet-500 to-violet-700' : 'bg-gradient-to-br from-blue-500 to-blue-700'}`}>
                              {u.name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-semibold text-slate-700 truncate">{u.name}{isSelf && <span className="text-[11px] text-slate-400 font-normal"> (you)</span>}</p>
                              <p className="text-[11px] text-slate-400 sm:hidden truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-[13px] text-slate-500 hidden sm:table-cell">{u.email}</td>
                        <td className="px-3 py-3">
                          <select
                            value={u.role}
                            disabled={isSelf || saving}
                            onChange={(e) => handleRoleChange(u, e.target.value as 'admin' | 'user')}
                            className="px-2.5 py-1.5 text-[12px] font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                          </select>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${u.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                            {u.is_active ? 'Active' : 'Blocked'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-[12px] text-slate-400 whitespace-nowrap hidden md:table-cell">
                          {u.last_login_at ? formatDate(u.last_login_at) : 'Never'}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-col items-end gap-1">
                            <button
                              onClick={() => handleToggleActive(u)}
                              disabled={isSelf || saving}
                              title={isSelf ? "You can't block your own account" : undefined}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-semibold rounded-md transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                                u.is_active
                                  ? 'text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100'
                                  : 'text-emerald-600 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100'
                              }`}
                            >
                              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                              {u.is_active ? 'Block' : 'Unblock'}
                            </button>
                            {rowError?.id === u.id && (
                              <p className="text-[11px] text-rose-500 max-w-[180px] text-right">{rowError.message}</p>
                            )}
                          </div>
                        </td>
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
                className="flex items-center gap-1 px-3 py-1.5 text-[13px] font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-[13px] text-slate-400">Page {meta.current_page} of {meta.last_page}</span>
              <button
                onClick={() => updateParams({ page: String(page + 1) }, false)}
                disabled={page >= meta.last_page}
                className="flex items-center gap-1 px-3 py-1.5 text-[13px] font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
