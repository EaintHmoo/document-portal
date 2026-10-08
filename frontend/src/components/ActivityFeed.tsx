import { LogIn, Upload, Pencil, Download, Trash2, FolderPlus, LogOut } from 'lucide-react';
import type { Activity } from '../data/mockData';

const activityIcons: Record<Activity['type'], { icon: typeof LogIn; bg: string; text: string }> = {
  login: { icon: LogIn, bg: 'bg-blue-50', text: 'text-blue-600' },
  logout: { icon: LogOut, bg: 'bg-slate-100', text: 'text-slate-500' },
  upload: { icon: Upload, bg: 'bg-emerald-50', text: 'text-emerald-600' },
  update: { icon: Pencil, bg: 'bg-amber-50', text: 'text-amber-600' },
  download: { icon: Download, bg: 'bg-cyan-50', text: 'text-cyan-600' },
  delete: { icon: Trash2, bg: 'bg-rose-50', text: 'text-rose-600' },
  folder: { icon: FolderPlus, bg: 'bg-violet-50', text: 'text-violet-600' },
};

export default function ActivityFeed({ activities }: { activities: Activity[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-[15px] font-bold text-slate-800">Recent Activity</h2>
          <p className="text-[12px] text-slate-400 mt-0.5">Latest actions across the portal</p>
        </div>
        <button className="text-[12px] font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
          View all
        </button>
      </div>
      <div className="px-5 py-4 space-y-1">
        {activities.map((activity, index) => {
          const { icon: Icon, bg, text } = activityIcons[activity.type];
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
                  <span className="font-semibold text-slate-800">{activity.user}</span>{' '}
                  <span className="text-slate-500">{activity.action}</span>
                  {activity.target && (
                    <>
                      {' '}
                      <span className="font-medium text-slate-700">{activity.target}</span>
                    </>
                  )}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">{activity.timestamp}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
