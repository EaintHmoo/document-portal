import { useEffect, useMemo, useState } from 'react';
import {
  Eye, FilePlus, Pencil, Trash2, Search, Check, Loader2,
  Lock, Users as UsersIcon, AlertCircle,
} from 'lucide-react';
import Modal from '@/components/Modal';
import type { ApiFolder } from '@/api/folders';
import { fetchFolderAccess, syncFolderAccess, type ApiFolderAccessEntry, type FolderAccessGrant } from '@/api/folders';

interface FolderAccessModalProps {
  open: boolean;
  onClose: () => void;
  folder: ApiFolder | null;
}

type GrantFlags = { can_view: boolean; can_create: boolean; can_edit: boolean; can_delete: boolean };
type AccessKey = keyof GrantFlags;

const emptyFlags: GrantFlags = { can_view: false, can_create: false, can_edit: false, can_delete: false };

const accessConfig: Record<AccessKey, { label: string; icon: typeof Eye; activeBg: string; description: string }> = {
  can_view: { label: 'View', icon: Eye, activeBg: 'bg-blue-500 text-white', description: 'Can view and download' },
  can_create: { label: 'Create', icon: FilePlus, activeBg: 'bg-amber-500 text-white', description: 'Can upload brand-new documents' },
  can_edit: { label: 'Edit', icon: Pencil, activeBg: 'bg-emerald-500 text-white', description: 'Can re-upload new versions and edit details of existing documents' },
  can_delete: { label: 'Delete', icon: Trash2, activeBg: 'bg-rose-500 text-white', description: 'Can delete documents and versions' },
};

const accessKeys: AccessKey[] = ['can_view', 'can_create', 'can_edit', 'can_delete'];

function initials(name: string): string {
  return name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'U';
}

export default function FolderAccessModal({ open, onClose, folder }: FolderAccessModalProps) {
  const [entries, setEntries] = useState<ApiFolderAccessEntry[]>([]);
  const [grants, setGrants] = useState<Record<number, GrantFlags>>({});
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
        setGrants(
          Object.fromEntries(
            data.map((u) => [
              u.id,
              { can_view: u.can_view, can_create: u.can_create, can_edit: u.can_edit, can_delete: u.can_delete },
            ]),
          ),
        );
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
    const values = Object.values(grants);
    return {
      can_view: values.filter((g) => g.can_view).length,
      can_create: values.filter((g) => g.can_create).length,
      can_edit: values.filter((g) => g.can_edit).length,
      can_delete: values.filter((g) => g.can_delete).length,
    };
  }, [grants]);

  const toggle = (userId: number, key: AccessKey) => {
    setGrants((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], [key]: !prev[userId]?.[key] },
    }));
  };

  const handleSave = async () => {
    if (!folder) return;
    setSaving(true);
    setError(null);
    try {
      const payload: FolderAccessGrant[] = Object.entries(grants).map(([userId, flags]) => ({
        user_id: Number(userId),
        ...flags,
      }));
      await syncFolderAccess(folder.id, payload);
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
            className="px-4 py-2.5 text-[14px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 px-4 py-2.5 text-[14px] font-semibold text-white bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 rounded-lg transition-all shadow-sm active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
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
          <div className="flex items-start gap-2.5 px-4 py-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl">
            <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
            <p className="text-[13px] text-rose-700 dark:text-rose-400 font-medium">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
          </div>
        ) : (
          <>
            {/* Summary stats — independent, so these can overlap */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {accessKeys.map((key) => {
                const cfg = accessConfig[key];
                const Icon = cfg.icon;
                return (
                  <div key={key} className="flex items-center gap-2.5 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                      <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-700 dark:text-slate-200 leading-none">{stats[key]}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{cfg.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-9 pr-4 py-2.5 text-[13px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-300 dark:focus:border-slate-600 focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-800 outline-none transition-all"
              />
            </div>

            {/* User list */}
            <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden max-h-72 overflow-y-auto scrollbar-thin">
              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <UsersIcon className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-[13px] text-slate-400">No users found matching "{search}"</p>
                </div>
              )}
              {filtered.map((user, index) => {
                const flags = grants[user.id] ?? emptyFlags;
                return (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                      index !== filtered.length - 1 ? 'border-b border-slate-50 dark:border-slate-800' : ''
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                      user.role === 'admin' ? 'bg-gradient-to-br from-violet-500 to-violet-700' : 'bg-gradient-to-br from-slate-400 to-slate-600'
                    }`}>
                      {initials(user.name)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate">{user.name}</p>
                        {user.role === 'admin' && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400 shrink-0">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {accessKeys.map((key) => {
                        const cfg = accessConfig[key];
                        const Icon = cfg.icon;
                        const active = flags[key];
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => toggle(user.id, key)}
                            disabled={user.role === 'admin'}
                            className={`flex items-center gap-1 px-2 py-1.5 text-[10px] font-semibold rounded-md transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                              active ? cfg.activeBg : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                            title={user.role === 'admin' ? 'Admins always have full access' : `${active ? 'Revoke' : 'Grant'} ${cfg.label.toLowerCase()} access`}
                          >
                            <Icon className="w-3 h-3" />
                            <span className="hidden md:inline">{cfg.label}</span>
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
              {accessKeys.map((key) => {
                const cfg = accessConfig[key];
                const Icon = cfg.icon;
                return (
                  <span key={key} className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" /> {cfg.description}
                  </span>
                );
              })}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
