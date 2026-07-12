import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggleButton } from '../components/ui';
import GlobalSearch from '../components/GlobalSearch';

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
    <div className="flex min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <aside className="flex w-56 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-panel)]">
        <div className="border-b border-[var(--color-border)] px-4 py-5">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded bg-[#8B5E3C] text-xs font-bold text-white">
              TO
            </div>
            <span className="text-lg font-semibold tracking-tight text-[var(--color-text-strong)]">TransitOps</span>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV.filter((item) => can(item.module, 'view')).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm transition ${
                  isActive
                    ? 'border border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-text-strong)]'
                    : 'text-[var(--color-muted)] hover:bg-black/5 hover:text-[var(--color-text)]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-panel)] px-6 py-3">
          <GlobalSearch />
          <div className="flex shrink-0 items-center gap-3">
            <ThemeToggleButton theme={theme} onToggle={toggleTheme} />
            <div className="text-right">
              <div className="text-sm font-medium text-[var(--color-text-strong)]">{user?.name}</div>
              <div className="text-xs text-sky-500">{roleLabel}</div>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-sky-700 text-sm font-semibold text-white">
              {initials}
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-muted)] hover:bg-black/5"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
