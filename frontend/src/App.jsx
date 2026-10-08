import { useState } from 'react';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './components/Dashboard';
import { Eye, Shield, Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
// type AuthView = 'login' | 'register';

function AuthScreen() {
  const [view, setView] = useState('login');

  if (view === 'login') {
    return <LoginPage onSwitchToRegister={() => setView('register')} />;
  }
  return <RegisterPage onSwitchToLogin={() => setView('login')} />;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
      <Loader2 className="w-7 h-7 text-slate-400 animate-spin" />
      <p className="text-[14px] text-slate-500 font-medium">Loading...</p>
    </div>
  );
}

function DashboardLayout() {
  const { user, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleOverride, setRoleOverride] = useState(null);

  if (!user) return null;

  const role = roleOverride ?? user.role;

  const sidebarUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role,
    avatar: '',
    initials: user.initials,
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        role={role}
        user={sidebarUser}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        activeItem={activeItem}
        onNavigate={setActiveItem}
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
          {/* Role switcher — demo toggle */}
          <div className="mb-5 flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1.5 w-fit">
            <button
              onClick={() => { setRoleOverride('admin'); setActiveItem('dashboard'); }}
              className={`flex items-center gap-2 px-3 py-1.5 text-[13px] font-semibold rounded-lg transition-all ${
                role === 'admin' ? 'bg-violet-50 text-violet-700' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Shield className="w-4 h-4" />
              Admin View
            </button>
            <button
              onClick={() => { setRoleOverride('user'); setActiveItem('dashboard'); }}
              className={`flex items-center gap-2 px-3 py-1.5 text-[13px] font-semibold rounded-lg transition-all ${
                role === 'user' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Eye className="w-4 h-4" />
              User View
            </button>
          </div>

          {activeItem === 'dashboard' && <Dashboard role={role} />}

          {activeItem !== 'dashboard' && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <Eye className="w-7 h-7 text-slate-400" />
              </div>
              <h2 className="text-lg font-bold text-slate-700 capitalize">{activeItem}</h2>
              <p className="text-[13px] text-slate-400 mt-1 max-w-sm">
                This page is part of the dashboard layout demo. Switch back to Dashboard to see the full interface.
              </p>
              <button
                onClick={() => setActiveItem('dashboard')}
                className="mt-5 px-4 py-2 text-[13px] font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-900 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          )}
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

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <AuthScreen />;
  return <DashboardLayout />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
