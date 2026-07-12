import { Suspense, lazy, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Fuel,
  LayoutDashboard,
  Route,
  Settings,
  Truck,
  Users,
  Wrench,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import GlobalSearch from '../components/GlobalSearch';
import HeaderSettingsMenu from '../components/HeaderSettingsMenu';

const ChatWidget = lazy(() => import('../components/ChatWidget'));

const NAV = [
  { to: '/', label: 'Dashboard', module: 'dashboard', icon: LayoutDashboard },
  { to: '/fleet', label: 'Fleet', module: 'fleet', icon: Truck },
  { to: '/drivers', label: 'Drivers', module: 'drivers', icon: Users },
  { to: '/trips', label: 'Trips', module: 'trips', icon: Route },
  { to: '/maintenance', label: 'Maintenance', module: 'maintenance', icon: Wrench },
  { to: '/fuel', label: 'Fuel & Expenses', module: 'fuel', icon: Fuel },
  { to: '/analytics', label: 'Analytics', module: 'analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', module: 'settings', icon: Settings },
];

export default function AppLayout() {
  const { user, roleLabel, can, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const initials = (user?.name || 'U')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="app-shell-bg flex min-h-screen text-[var(--color-text)]">
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen flex-col border-r border-[var(--color-border)] bg-[var(--color-panel)]/95 backdrop-blur-sm transition-transform duration-300 md:sticky md:translate-x-0 md:z-10
          ${isMobileOpen ? 'translate-x-0 w-56' : '-translate-x-full w-56'}
          md:w-16 lg:w-56`}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#8B5E3C] text-xs font-bold text-white shadow-sm shrink-0">
              TO
            </div>
            <div className="md:hidden lg:block">
              <span className="block text-lg font-semibold leading-tight tracking-tight text-[var(--color-text-strong)]">
                TransitOps
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted)]">Operations</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-[var(--color-muted)] hover:bg-black/5"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3 overflow-y-auto">
          {NAV.filter((item) => can(item.module, 'view')).map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                    isActive
                      ? 'border border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-text-strong)]'
                      : 'text-[var(--color-muted)] hover:bg-black/5 hover:text-[var(--color-text)]'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                <span className="md:hidden lg:inline">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="border-t border-[var(--color-border)] p-3 text-[10px] text-[var(--color-muted)] md:text-center lg:text-left shrink-0">
          <span className="md:hidden lg:inline">RBAC · </span>TransitOps 2026
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-panel)]/90 px-4 py-3 md:px-6 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3 w-full max-w-md">
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:bg-black/5 shrink-0"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <GlobalSearch />
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-[var(--color-text-strong)]">{user?.name}</div>
              <div className="text-xs text-sky-500">{roleLabel}</div>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-sky-700 text-sm font-semibold text-white ring-2 ring-sky-700/30">
              {initials}
            </div>
            <HeaderSettingsMenu
              theme={theme}
              onToggleTheme={toggleTheme}
              onLogout={() => {
                logout();
                navigate('/login');
              }}
            />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
        <Suspense fallback={null}>
          <ChatWidget />
        </Suspense>
      </div>
    </div>
  );
}
