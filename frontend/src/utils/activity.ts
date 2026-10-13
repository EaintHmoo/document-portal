import type { ComponentType } from 'react';
import {
  Activity as ActivityIcon, LogIn, LogOut, UserPlus, Upload, Pencil,
  Download, Trash2, FolderPlus, Lock, UserCheck, UserX, ShieldCheck, History, KeyRound,
} from 'lucide-react';
import type { ApiActivityLog } from '../api/dashboard';

export const actionMeta: Record<string, { icon: ComponentType<{ className?: string; strokeWidth?: number }>; bg: string; text: string; verb: string; label: string }> = {
  'user.logged_in': { icon: LogIn, bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', verb: 'logged in', label: 'Logged in' },
  'user.logged_out': { icon: LogOut, bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-500 dark:text-slate-400', verb: 'logged out', label: 'Logged out' },
  'user.registered': { icon: UserPlus, bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', verb: 'created an account', label: 'Registered' },
  'document.uploaded': { icon: Upload, bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', verb: 'uploaded', label: 'Document uploaded' },
  'document.updated': { icon: Pencil, bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', verb: 'updated', label: 'Document updated' },
  'document.downloaded': { icon: Download, bg: 'bg-cyan-50 dark:bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400', verb: 'downloaded', label: 'Document downloaded' },
  'document.deleted': { icon: Trash2, bg: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', verb: 'deleted', label: 'Document deleted' },
  'document.purged': { icon: Trash2, bg: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', verb: 'permanently removed', label: 'Document purged' },
  'document.version_deleted': { icon: History, bg: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', verb: 'deleted a version of', label: 'Version deleted' },
  'folder.created': { icon: FolderPlus, bg: 'bg-violet-50 dark:bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400', verb: 'created folder', label: 'Folder created' },
  'folder.updated': { icon: Pencil, bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', verb: 'updated folder', label: 'Folder updated' },
  'folder.deleted': { icon: Trash2, bg: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', verb: 'deleted folder', label: 'Folder deleted' },
  'folder.access_updated': { icon: Lock, bg: 'bg-indigo-50 dark:bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', verb: 'updated access for folder', label: 'Folder access updated' },
  'user.activated': { icon: UserCheck, bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', verb: 'unblocked', label: 'User unblocked' },
  'user.deactivated': { icon: UserX, bg: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', verb: 'blocked', label: 'User blocked' },
  'user.password_reset': { icon: KeyRound, bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', verb: 'reset the password for', label: 'Password reset' },
  'user.password_changed': { icon: KeyRound, bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', verb: 'changed the password for', label: 'Password changed' },
  'user.role_changed': { icon: ShieldCheck, bg: 'bg-violet-50 dark:bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400', verb: 'changed the role of', label: 'Role changed' },
};

export const fallbackActionMeta = {
  icon: ActivityIcon, bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-500 dark:text-slate-400', verb: 'did something with', label: 'Activity',
};

export function activityTargetLabel(activity: ApiActivityLog): string {
  const props = activity.properties ?? {};
  const label = (props as Record<string, unknown>).title ?? (props as Record<string, unknown>).name;
  return typeof label === 'string' ? label : '';
}
