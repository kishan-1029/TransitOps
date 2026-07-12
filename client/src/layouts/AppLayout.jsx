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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import GlobalSearch from '../components/GlobalSearch';
import HeaderSettingsMenu from '../components/HeaderSettingsMenu';

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
          {NAV.filter((item) => can(item.module, 'view')).map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                    isActive
                      ? 'border border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-text-strong)]'
                      : 'text-[var(--color-muted)] hover:bg-black/5 hover:text-[var(--color-text)]'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-panel)] px-6 py-3">
          <GlobalSearch />
          <div className="flex shrink-0 items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-[var(--color-text-strong)]">{user?.name}</div>
              <div className="text-xs text-sky-500">{roleLabel}</div>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-sky-700 text-sm font-semibold text-white">
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
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
