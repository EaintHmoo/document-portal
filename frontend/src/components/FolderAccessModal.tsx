import { useEffect, useMemo, useState } from 'react';
import {
  ShieldCheck, Eye, EyeOff, Search, Check, Loader2,
  Lock, UserCog, Users as UsersIcon, AlertCircle,
} from 'lucide-react';
import Modal from '@/components/Modal';
import type { ApiFolder } from '@/api/folders';
import { fetchFolderAccess, syncFolderAccess, type ApiFolderAccessEntry, type FolderPermission } from '@/api/folders';

interface FolderAccessModalProps {
  open: boolean;
  onClose: () => void;
  folder: ApiFolder | null;
}

/** The UI speaks in three tiers; the API only models view/edit/absent. */
type PermissionLevel = 'full' | 'view' | 'none';

function toLevel(permission: FolderPermission): PermissionLevel {
  if (permission === 'edit') return 'full';
  if (permission === 'view') return 'view';
  return 'none';
}

function toPermission(level: PermissionLevel): FolderPermission {
  if (level === 'full') return 'edit';
  if (level === 'view') return 'view';
  return null;
}

const permissionConfig: Record<PermissionLevel, { label: string; icon: typeof ShieldCheck; bg: string; activeBg: string }> = {
  full: {
    label: 'Full Access',
    icon: ShieldCheck,
    bg: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
    activeBg: 'bg-emerald-500 text-white',
  },
  view: {
    label: 'View Only',
    icon: Eye,
    bg: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    activeBg: 'bg-blue-500 text-white',
  },
  none: {
    label: 'No Access',
    icon: EyeOff,
    bg: 'bg-slate-50 text-slate-400 hover:bg-slate-100',
    activeBg: 'bg-slate-300 text-slate-600',
  },
};

function initials(name: string): string {
  return name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'U';
}

export default function FolderAccessModal({ open, onClose, folder }: FolderAccessModalProps) {
  const [entries, setEntries] = useState<ApiFolderAccessEntry[]>([]);
  const [levels, setLevels] = useState<Record<number, PermissionLevel>>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !folder) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchFolderAccess(folder.id)
      .then((data) => {
        if (cancelled) return;
        setEntries(data);
        setLevels(Object.fromEntries(data.map((u) => [u.id, toLevel(u.permission)])));
      })
      .catch(() => {
        if (!cancelled) setError('Could not load access settings. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, folder]);

  const filtered = useMemo(
    () =>
      entries.filter(
        (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()),
      ),
    [entries, search],
  );

  const stats = useMemo(() => {
    const values = Object.values(levels);
    return {
      full: values.filter((l) => l === 'full').length,
      view: values.filter((l) => l === 'view').length,
      none: values.filter((l) => l === 'none').length,
    };
  }, [levels]);

  const setPermission = (userId: number, level: PermissionLevel) => {
    setLevels((prev) => ({ ...prev, [userId]: level }));
  };

  const setBulkPermission = (level: PermissionLevel) => {
    setLevels((prev) => Object.fromEntries(Object.keys(prev).map((id) => [id, level])));
  };

  const handleSave = async () => {
    if (!folder) return;
    setSaving(true);
    setError(null);
    try {
      await syncFolderAccess(
        folder.id,
        Object.entries(levels).map(([userId, level]) => ({
          user_id: Number(userId),
          permission: toPermission(level),
        })),
      );
      onClose();
    } catch {
      setError('Could not save permissions. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!folder) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Folder Access Permissions"
      subtitle={`Manage who can access "${folder.name}"`}
      icon={<Lock className="w-5 h-5" />}
      maxWidth="max-w-xl"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-[14px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 px-4 py-2.5 text-[14px] font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-all shadow-sm active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save Permissions
              </>
            )}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="flex items-start gap-2.5 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl">
            <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
            <p className="text-[13px] text-rose-700 font-medium">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
          </div>
        ) : (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2.5 p-3 bg-emerald-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-emerald-700 leading-none">{stats.full}</p>
                  <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Full Access</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-3 bg-blue-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <Eye className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-blue-700 leading-none">{stats.view}</p>
                  <p className="text-[10px] text-blue-600 font-medium mt-0.5">View Only</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <EyeOff className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-500 leading-none">{stats.none}</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">No Access</p>
                </div>
              </div>
            </div>

            {/* Search + bulk actions */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-9 pr-4 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-lg placeholder:text-slate-400 focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-slate-100 outline-none transition-all"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-medium text-slate-400 hidden sm:flex items-center gap-1">
                  <UserCog className="w-3.5 h-3.5" /> Set all:
                </span>
                {(Object.keys(permissionConfig) as PermissionLevel[]).map((level) => {
                  const cfg = permissionConfig[level];
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={level}
                      onClick={() => setBulkPermission(level)}
                      className={`flex items-center gap-1.5 px-2.5 py-2 text-[11px] font-semibold rounded-lg transition-colors ${cfg.bg}`}
                      title={`Set all to ${cfg.label}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* User list */}
            <div className="border border-slate-100 rounded-xl overflow-hidden max-h-72 overflow-y-auto scrollbar-thin">
              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <UsersIcon className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-[13px] text-slate-400">No users found matching "{search}"</p>
                </div>
              )}
              {filtered.map((user, index) => {
                const level = levels[user.id] ?? 'none';
                return (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${
                      index !== filtered.length - 1 ? 'border-b border-slate-50' : ''
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                      user.role === 'admin' ? 'bg-gradient-to-br from-violet-500 to-violet-700' : 'bg-gradient-to-br from-slate-400 to-slate-600'
                    }`}>
                      {initials(user.name)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-semibold text-slate-700 truncate">{user.name}</p>
                        {user.role === 'admin' && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 shrink-0">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {(Object.keys(permissionConfig) as PermissionLevel[]).map((lvl) => {
                        const levelCfg = permissionConfig[lvl];
                        const Icon = levelCfg.icon;
                        const active = level === lvl;
                        return (
                          <button
                            key={lvl}
                            onClick={() => setPermission(user.id, lvl)}
                            disabled={user.role === 'admin'}
                            className={`flex items-center gap-1 px-2 py-1.5 text-[10px] font-semibold rounded-md transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                              active ? levelCfg.activeBg : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                            }`}
                            title={user.role === 'admin' ? 'Admins always have full access' : levelCfg.label}
                          >
                            <Icon className="w-3 h-3" />
                            <span className="hidden md:inline">{levelCfg.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Can view, upload, edit, delete
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-blue-500" /> Can view and download only
              </span>
              <span className="flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5 text-slate-400" /> Cannot see this folder
              </span>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
