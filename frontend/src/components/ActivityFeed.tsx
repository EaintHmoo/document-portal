import { Activity as ActivityIcon } from 'lucide-react';
import type { ApiActivityLog } from '../api/dashboard';
import { formatRelativeTime } from '../utils/format';
import { actionMeta, fallbackActionMeta, activityTargetLabel } from '../utils/activity';

interface ActivityFeedProps {
  activities: ApiActivityLog[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Recent Activity</h2>
          <p className="text-[12px] text-slate-400 mt-0.5">Latest actions across the portal</p>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <ActivityIcon className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-[13px] text-slate-400">No activity yet.</p>
        </div>
      ) : (
        <div className="px-5 py-4 space-y-1">
          {activities.map((activity, index) => {
            const { icon: Icon, bg, text, verb } = actionMeta[activity.action] ?? fallbackActionMeta;
            const target = activityTargetLabel(activity);
            return (
              <div key={activity.id} className="relative flex items-start gap-3 py-2.5">
                {index < activities.length - 1 && (
                  <div className="absolute left-[15px] top-11 bottom-0 w-px bg-slate-100 dark:bg-slate-800" />
                )}
                <div className={`relative z-10 w-8 h-8 rounded-full ${bg} ${text} flex items-center justify-center shrink-0 ring-4 ring-white`}>
                  <Icon className="w-4 h-4" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-[13px] text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-800 dark:text-slate-100">{activity.user?.name ?? 'Someone'}</span>{' '}
                    <span className="text-slate-500 dark:text-slate-400">{verb}</span>
                    {target && (
                      <>
                        {' '}
                        <span className="font-medium text-slate-700 dark:text-slate-200">{target}</span>
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
