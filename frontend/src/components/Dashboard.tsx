import StatCard from '../components/StatCard';
import DocumentTable from '../components/DocumentTable';
import ActivityFeed from '../components/ActivityFeed';
import FolderGrid from '../components/FolderGrid';
import type { Role } from '../data/mockData';
import { stats, recentDocuments, activities, folders } from '../data/mockData';

interface DashboardProps {
  role: Role;
}

export default function Dashboard({ role }: DashboardProps) {
  const roleStats = stats[role];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            {role === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}
          </h1>
          <p className="text-[13px] text-slate-400 mt-0.5">
            {role === 'admin'
              ? 'Monitor documents, users, and system activity at a glance'
              : 'Access your documents and track recent updates'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-[13px] font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            Last 30 days
          </button>
          <button className="px-3 py-1.5 text-[13px] font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors">
            This Month
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {roleStats.map((stat) => (
          <StatCard
            key={stat.id}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            trend={stat.trend as 'up' | 'down' | 'flat'}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Storage bar for admin */}
      {role === 'admin' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-[14px] font-bold text-slate-800">Storage Overview</h3>
              <p className="text-[12px] text-slate-400 mt-0.5">47.2 GB of 100 GB used</p>
            </div>
            <span className="text-[13px] font-bold text-slate-700">47%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
            <div className="h-full bg-blue-500 rounded-l-full" style={{ width: '22%' }} />
            <div className="h-full bg-emerald-500" style={{ width: '15%' }} />
            <div className="h-full bg-amber-500" style={{ width: '8%' }} />
            <div className="h-full bg-rose-500 rounded-r-full" style={{ width: '2%' }} />
          </div>
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            {[
              { label: 'Documents', color: 'bg-blue-500', size: '22 GB' },
              { label: 'Media', color: 'bg-emerald-500', size: '15 GB' },
              { label: 'Archives', color: 'bg-amber-500', size: '8 GB' },
              { label: 'Other', color: 'bg-rose-500', size: '2 GB' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-sm ${item.color}`} />
                <span className="text-[11px] text-slate-500 font-medium">{item.label}</span>
                <span className="text-[11px] text-slate-400">{item.size}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents + Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <DocumentTable documents={recentDocuments} />
        </div>
        <div className="space-y-6">
          <ActivityFeed activities={activities} />
        </div>
      </div>

      {/* Folder grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-[15px] font-bold text-slate-800">Folders</h2>
            <p className="text-[12px] text-slate-400 mt-0.5">Browse documents by category</p>
          </div>
          {role === 'admin' && (
            <button className="text-[12px] font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200">
              + New Folder
            </button>
          )}
        </div>
        <FolderGrid folders={folders} />
      </div>
    </div>
  );
}
