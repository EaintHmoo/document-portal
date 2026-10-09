import { useState } from 'react';
import { Search, Bell, Menu, ChevronDown, Upload, Check, X, FileText, Download } from 'lucide-react';
import type { User } from '../data/mockData';

interface TopbarProps {
  user: User;
  onMobileMenuClick: () => void;
  onSignOut: () => void;
}

const notifications = [
  { id: 1, title: 'New document uploaded', desc: 'Sarah Chen uploaded Q4 Financial Report', time: '2m ago', unread: true, icon: FileText },
  { id: 2, title: 'Document shared with you', desc: 'James Miller shared Employee Handbook v4', time: '15m ago', unread: true, icon: Download },
  { id: 3, title: 'Upload completed', desc: 'API Architecture Spec is now available', time: '1h ago', unread: false, icon: Check },
];

export default function Topbar({ user, onMobileMenuClick, onSignOut }: TopbarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3">
        {/* Left: Mobile menu + Search */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <button
            onClick={onMobileMenuClick}
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="relative flex-1 hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents, folders..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 border border-transparent rounded-lg placeholder:text-slate-400 focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-slate-200 outline-none transition-all"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Upload button */}
          <button className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors shadow-sm active:scale-[0.98]">
            <Upload className="w-4 h-4" />
            <span className="hidden md:inline">Upload</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
              className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-40 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
                    <span className="text-[11px] font-medium text-slate-400">{unreadCount} unread</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto scrollbar-thin">
                    {notifications.map((n) => {
                      const Icon = n.icon;
                      return (
                        <div
                          key={n.id}
                          className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors ${n.unread ? 'bg-blue-50/40' : ''}`}
                        >
                          <div className="mt-0.5 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4 text-slate-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-slate-700">{n.title}</p>
                            <p className="text-[12px] text-slate-500 truncate">{n.desc}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{n.time}</p>
                          </div>
                          {n.unread && <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                  <button className="w-full px-4 py-2.5 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 border-t border-slate-100 transition-colors">
                    View all notifications
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
              className="flex items-center gap-2 p-1 pr-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${user.role === 'admin' ? 'bg-gradient-to-br from-violet-500 to-violet-700' : 'bg-gradient-to-br from-blue-500 to-blue-700'}`}>
                {user.initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[13px] font-semibold text-slate-800 leading-tight">{user.name}</p>
                <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
              </div>
              <ChevronDown className="hidden sm:block w-4 h-4 text-slate-400" />
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                    <p className="text-[12px] text-slate-400 truncate">{user.email}</p>
                  </div>
                  <div className="py-1.5">
                    <button className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-slate-600 hover:bg-slate-50 transition-colors">
                      <FileText className="w-4 h-4 text-slate-400" /> My Documents
                    </button>
                    <button className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-slate-600 hover:bg-slate-50 transition-colors">
                      <Check className="w-4 h-4 text-slate-400" /> Account Settings
                    </button>
                  </div>
                  <div className="border-t border-slate-100 py-1.5">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        onSignOut();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <X className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
