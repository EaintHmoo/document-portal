import { useEffect, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import StatCard from '../components/StatCard';
import DocumentTable from '../components/DocumentTable';
import ActivityFeed from '../components/ActivityFeed';
import FolderGrid from '../components/FolderGrid';
import type { Role } from '../types';
import { fetchDashboard, type DashboardSummary } from '../api/dashboard';
import { ApiError } from '../api/client';

interface DashboardProps {
  role: Role;
}

export default function Dashboard({ role }: DashboardProps) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetchDashboard()
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Could not load the dashboard. Please try again.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
        <p className="text-[13px] text-slate-400 font-medium">Loading dashboard...</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <AlertCircle className="w-8 h-8 text-rose-400" />
        <p className="text-[14px] font-semibold text-slate-700">Couldn't load the dashboard</p>
        <p className="text-[13px] text-slate-400 max-w-sm">{error}</p>
      </div>
    );
  }

  const isAdmin = summary.role === 'admin';
  const accessibleFolders = isAdmin ? [] : summary.accessible_folders;

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
              ? 'Monitor documents, folders, and system activity at a glance'
              : 'Access your documents and track recent updates'}
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {isAdmin ? (
          <>
            <StatCard label="Total Users" value={summary.total_users} icon="Users" color="blue" />
            <StatCard label="Total Documents" value={summary.total_documents} icon="FileText" color="emerald" />
            <StatCard label="Total Folders" value={summary.total_folders} icon="FolderOpen" color="amber" />
          </>
        ) : (
          <>
            <StatCard label="Accessible Documents" value={summary.accessible_document_count} icon="FileText" color="emerald" />
            <StatCard label="Accessible Folders" value={summary.accessible_folders.length} icon="FolderOpen" color="amber" />
          </>
        )}
      </div>

      {/* Documents + Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <DocumentTable documents={summary.recent_documents} />
        </div>
        <div className="space-y-6">
          <ActivityFeed activities={summary.recent_activities} />
        </div>
      </div>

      {/* Folder grid — admins browse all folders via Folders in the sidebar; this shows what the user can get into */}
      {!isAdmin && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-[15px] font-bold text-slate-800">Folders</h2>
              <p className="text-[12px] text-slate-400 mt-0.5">Browse documents by category</p>
            </div>
          </div>
          <FolderGrid folders={accessibleFolders} />
        </div>
      )}
    </div>
  );
}
