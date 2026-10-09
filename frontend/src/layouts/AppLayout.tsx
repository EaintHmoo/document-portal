import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/SideBar';
import Topbar from '../components/TopBar';
import { useAuth } from '../context/AuthContext';

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // RequireAuth guarantees user is set before this layout renders.
  if (!user) return null;

  const sidebarUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: '',
    initials: user.initials,
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        role={user.role}
        user={sidebarUser}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        onSignOut={signOut}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          user={sidebarUser}
          onMobileMenuClick={() => setMobileMenuOpen(true)}
          onSignOut={signOut}
        />

        <main className="flex-1 px-4 sm:px-6 py-6 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>

        <footer className="px-6 py-4 border-t border-slate-200 bg-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
            <p className="text-[11px] text-slate-400">Internal Document Portal — Secure Access Only</p>
            <p className="text-[11px] text-slate-400">v1.0.0 · © 2025 Company Inc.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
