import { Suspense, lazy } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggleButton } from '../components/ui';
import GlobalSearch from '../components/GlobalSearch';

const ChatWidget = lazy(() => import('../components/ChatWidget'));

const NAV = [
  { to: '/', label: 'Dashboard', module: 'dashboard' },
  { to: '/fleet', label: 'Fleet', module: 'fleet' },
  { to: '/drivers', label: 'Drivers', module: 'drivers' },
  { to: '/trips', label: 'Trips', module: 'trips' },
  { to: '/maintenance', label: 'Maintenance', module: 'maintenance' },
  { to: '/fuel', label: 'Fuel & Expenses', module: 'fuel' },
  { to: '/analytics', label: 'Analytics', module: 'analytics' },
  { to: '/settings', label: 'Settings', module: 'settings' },
];

export default function AppLayout() {
  const { user, roleLabel, can, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const initials = (user?.name || 'U')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="app-shell-bg flex min-h-screen text-[var(--color-text)]">
      <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-panel)]/95 backdrop-blur-sm">
        <div className="border-b border-[var(--color-border)] px-4 py-5">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#8B5E3C] text-xs font-bold text-white shadow-sm">
              TO
            </div>
            <div>
              <span className="block text-lg font-semibold leading-tight tracking-tight text-[var(--color-text-strong)]">
                TransitOps
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted)]">Operations</span>
            </div>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
          {NAV.filter((item) => can(item.module, 'view')).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm transition ${
                  isActive
                    ? 'border border-[var(--color-accent)] bg-[var(--color-accent)]/10 font-medium text-[var(--color-text-strong)] shadow-sm'
                    : 'border border-transparent text-[var(--color-muted)] hover:bg-black/5 hover:text-[var(--color-text)]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-[var(--color-border)] p-3 text-[10px] text-[var(--color-muted)]">
          RBAC · TransitOps 2026
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-panel)]/90 px-6 py-3 backdrop-blur-md">
          <GlobalSearch />
          <div className="flex shrink-0 items-center gap-3">
            <ThemeToggleButton theme={theme} onToggle={toggleTheme} />
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium text-[var(--color-text-strong)]">{user?.name}</div>
              <div className="text-xs text-sky-500">{roleLabel}</div>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-sky-700 text-sm font-semibold text-white ring-2 ring-sky-700/30">
              {initials}
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-muted)] transition hover:border-rose-400 hover:text-rose-500"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
        <Suspense fallback={null}>
          <ChatWidget />
        </Suspense>
      </div>
    </div>
  );
}
