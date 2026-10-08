import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Users,
  History,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Lock,
} from 'lucide-react';
import type { Role, User } from '../data/mockData';

interface SidebarProps {
  role: Role;
  user: User;
  collapsed: boolean;
  onToggleCollapse: () => void;
  activeItem: string;
  onNavigate: (item: string) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
  badge?: number;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'user'] },
  { id: 'documents', label: 'Documents', icon: FileText, roles: ['admin', 'user'], badge: 1284 },
  { id: 'folders', label: 'Folders', icon: FolderOpen, roles: ['admin', 'user'], badge: 6 },
  { id: 'users', label: 'User Management', icon: Users, roles: ['admin'], badge: 247 },
  { id: 'activity', label: 'Activity Log', icon: History, roles: ['admin'] },
  { id: 'settings', label: 'Settings', icon: Settings, roles: ['admin', 'user'] },
];

const colorMap: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  violet: 'bg-violet-50 text-violet-600',
};

export default function Sidebar({ role, user, collapsed, onToggleCollapse, activeItem, onNavigate, mobileOpen, onMobileClose }: SidebarProps) {
  const visibleItems = navItems.filter((item) => item.roles.includes(role));
  const roleColor = role === 'admin' ? 'violet' : 'blue';

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out
          ${collapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo / Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 shrink-0 shadow-sm">
            <Shield className="w-5 h-5 text-white" strokeWidth={2.2} />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-[15px] font-bold text-slate-800 tracking-tight leading-tight">DocPortal</h1>
              <p className="text-[11px] text-slate-400 font-medium">Internal Document Portal</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
          {!collapsed && (
            <p className="px-3 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Main Menu
            </p>
          )}
          <ul className="space-y-1">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const active = activeItem === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onNavigate(item.id);
                      onMobileClose();
                    }}
                    className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative
                      ${active
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon
                      className={`w-[18px] h-[18px] shrink-0 transition-transform duration-150 group-hover:scale-110 ${active ? '' : 'text-slate-400 group-hover:text-slate-600'}`}
                      strokeWidth={active ? 2.3 : 2}
                    />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left truncate">{item.label}</span>
                        {item.badge !== undefined && (
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md min-w-[20px] text-center
                              ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}
                          >
                            {item.badge > 999 ? `${(item.badge / 1000).toFixed(1)}k` : item.badge}
                          </span>
                        )}
                      </>
                    )}
                    {collapsed && item.badge !== undefined && (
                      <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Role badge */}
        {!collapsed && (
          <div className="px-4 pb-3">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${colorMap[roleColor]}`}>
              <Lock className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold capitalize">{role} Access</span>
            </div>
          </div>
        )}

        {/* User profile */}
        <div className="px-3 py-3 border-t border-slate-100 shrink-0">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="relative shrink-0">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${role === 'admin' ? 'bg-gradient-to-br from-violet-500 to-violet-700' : 'bg-gradient-to-br from-blue-500 to-blue-700'}`}>
                {user.initials}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
            </div>
            {!collapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="text-[13px] font-semibold text-slate-800 truncate">{user.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
              </div>
            )}
            {!collapsed && (
              <button className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors" title="Logout">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className="absolute -right-3 top-20 hidden lg:flex items-center justify-center w-6 h-6 bg-white border border-slate-200 rounded-full shadow-sm text-slate-400 hover:text-slate-700 hover:shadow-md transition-all z-10"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </aside>
    </>
  );
}


