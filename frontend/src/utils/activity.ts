import type { ComponentType } from 'react';
import {
  Activity as ActivityIcon, LogIn, LogOut, UserPlus, Upload, Pencil,
  Download, Trash2, FolderPlus, Lock,
} from 'lucide-react';
import type { ApiActivityLog } from '../api/dashboard';

export const actionMeta: Record<string, { icon: ComponentType<{ className?: string; strokeWidth?: number }>; bg: string; text: string; verb: string; label: string }> = {
  'user.logged_in': { icon: LogIn, bg: 'bg-blue-50', text: 'text-blue-600', verb: 'logged in', label: 'Logged in' },
  'user.logged_out': { icon: LogOut, bg: 'bg-slate-100', text: 'text-slate-500', verb: 'logged out', label: 'Logged out' },
  'user.registered': { icon: UserPlus, bg: 'bg-blue-50', text: 'text-blue-600', verb: 'created an account', label: 'Registered' },
  'document.uploaded': { icon: Upload, bg: 'bg-emerald-50', text: 'text-emerald-600', verb: 'uploaded', label: 'Document uploaded' },
  'document.updated': { icon: Pencil, bg: 'bg-amber-50', text: 'text-amber-600', verb: 'updated', label: 'Document updated' },
  'document.downloaded': { icon: Download, bg: 'bg-cyan-50', text: 'text-cyan-600', verb: 'downloaded', label: 'Document downloaded' },
  'document.deleted': { icon: Trash2, bg: 'bg-rose-50', text: 'text-rose-600', verb: 'deleted', label: 'Document deleted' },
  'folder.created': { icon: FolderPlus, bg: 'bg-violet-50', text: 'text-violet-600', verb: 'created folder', label: 'Folder created' },
  'folder.updated': { icon: Pencil, bg: 'bg-amber-50', text: 'text-amber-600', verb: 'updated folder', label: 'Folder updated' },
  'folder.deleted': { icon: Trash2, bg: 'bg-rose-50', text: 'text-rose-600', verb: 'deleted folder', label: 'Folder deleted' },
  'folder.access_updated': { icon: Lock, bg: 'bg-indigo-50', text: 'text-indigo-600', verb: 'updated access for folder', label: 'Folder access updated' },
};

export const fallbackActionMeta = {
  icon: ActivityIcon, bg: 'bg-slate-100', text: 'text-slate-500', verb: 'did something with', label: 'Activity',
};

export function activityTargetLabel(activity: ApiActivityLog): string {
  const props = activity.properties ?? {};
  const label = (props as Record<string, unknown>).title ?? (props as Record<string, unknown>).name;
  return typeof label === 'string' ? label : '';
}
