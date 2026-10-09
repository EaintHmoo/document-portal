import type { ComponentType } from 'react';
import { Activity as ActivityIcon, LogIn, LogOut, UserPlus, Upload, Pencil, Download, Trash2, FolderPlus } from 'lucide-react';
import type { ApiActivityLog } from '../api/dashboard';
import { formatRelativeTime } from '../utils/format';

const actionMeta: Record<string, { icon: ComponentType<{ className?: string; strokeWidth?: number }>; bg: string; text: string; verb: string }> = {
  'user.logged_in': { icon: LogIn, bg: 'bg-blue-50', text: 'text-blue-600', verb: 'logged in' },
  'user.logged_out': { icon: LogOut, bg: 'bg-slate-100', text: 'text-slate-500', verb: 'logged out' },
  'user.registered': { icon: UserPlus, bg: 'bg-blue-50', text: 'text-blue-600', verb: 'created an account' },
  'document.uploaded': { icon: Upload, bg: 'bg-emerald-50', text: 'text-emerald-600', verb: 'uploaded' },
  'document.updated': { icon: Pencil, bg: 'bg-amber-50', text: 'text-amber-600', verb: 'updated' },
  'document.downloaded': { icon: Download, bg: 'bg-cyan-50', text: 'text-cyan-600', verb: 'downloaded' },
  'document.deleted': { icon: Trash2, bg: 'bg-rose-50', text: 'text-rose-600', verb: 'deleted' },
  'folder.created': { icon: FolderPlus, bg: 'bg-violet-50', text: 'text-violet-600', verb: 'created folder' },
  'folder.updated': { icon: Pencil, bg: 'bg-amber-50', text: 'text-amber-600', verb: 'updated folder' },
  'folder.deleted': { icon: Trash2, bg: 'bg-rose-50', text: 'text-rose-600', verb: 'deleted folder' },
};

const fallbackMeta = { icon: ActivityIcon, bg: 'bg-slate-100', text: 'text-slate-500', verb: 'did something with' };

function targetLabel(activity: ApiActivityLog): string {
  const props = activity.properties ?? {};
  const label = props.title ?? props.name;
  return typeof label === 'string' ? label : '';
}

interface ActivityFeedProps {
  activities: ApiActivityLog[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-[15px] font-bold text-slate-800">Recent Activity</h2>
          <p className="text-[12px] text-slate-400 mt-0.5">Latest actions across the portal</p>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <ActivityIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-[13px] text-slate-400">No activity yet.</p>
        </div>
      ) : (
        <div className="px-5 py-4 space-y-1">
          {activities.map((activity, index) => {
            const { icon: Icon, bg, text, verb } = actionMeta[activity.action] ?? fallbackMeta;
            const target = targetLabel(activity);
            return (
              <div key={activity.id} className="relative flex items-start gap-3 py-2.5">
                {index < activities.length - 1 && (
                  <div className="absolute left-[15px] top-11 bottom-0 w-px bg-slate-100" />
                )}
                <div className={`relative z-10 w-8 h-8 rounded-full ${bg} ${text} flex items-center justify-center shrink-0 ring-4 ring-white`}>
                  <Icon className="w-4 h-4" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-[13px] text-slate-600">
                    <span className="font-semibold text-slate-800">{activity.user?.name ?? 'Someone'}</span>{' '}
                    <span className="text-slate-500">{verb}</span>
                    {target && (
                      <>
                        {' '}
                        <span className="font-medium text-slate-700">{target}</span>
                      </>
                    )}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{formatRelativeTime(activity.created_at)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
