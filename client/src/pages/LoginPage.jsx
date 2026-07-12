import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLE_LABELS } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Field, inputClass, btnPrimary, ThemeToggleButton } from '../components/ui';

const ROLES = ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'];

const ROLE_BLURBS = {
  FLEET_MANAGER: 'Fleet, maintenance, vehicle lifecycle & efficiency',
  DRIVER: 'Create trips, assign vehicles/drivers, monitor deliveries',
  SAFETY_OFFICER: 'License validity, compliance & safety scores',
  FINANCIAL_ANALYST: 'Fuel, expenses, costs & profitability',
};

export default function LoginPage() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('raven.k@transitops.in');
  const [password, setPassword] = useState('Password@123');
  const [role, setRole] = useState('DRIVER');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password, role, remember });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggleButton theme={theme} onToggle={toggleTheme} />
      </div>

      <section
        className="relative flex flex-col justify-between overflow-hidden px-10 py-12"
        style={{ background: 'var(--color-brand-panel)', color: 'var(--color-brand-text)' }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, #e67e22 0%, transparent 45%), radial-gradient(circle at 80% 70%, #3498db 0%, transparent 40%)',
          }}
        />
        <div className="relative">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-xl bg-[#8B5E3C] text-lg font-bold text-white shadow-lg">
              TO
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">TransitOps</h1>
              <p className="text-sm opacity-80">Smart Transport Operations Platform</p>
            </div>
          </div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide opacity-70">One login · four roles</p>
          <ul className="space-y-3">
            {ROLES.map((r, i) => (
              <li
                key={r}
                className={`rounded-xl border px-4 py-3 backdrop-blur ${
                  role === r ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/15' : 'border-current/15 bg-black/5'
                }`}
              >
                <div className="font-semibold">
                  {i + 1}. {ROLE_LABELS[r]}
                </div>
                <div className="mt-0.5 text-sm opacity-75">{ROLE_BLURBS[r]}</div>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs uppercase tracking-wide opacity-60">TransitOps © 2026 — RBAC Enabled</p>
      </section>

      <section className="flex items-center justify-center bg-[var(--color-bg)] px-8 py-12">
        <form onSubmit={onSubmit} className="w-full max-w-md">
          <h2 className="text-2xl font-semibold text-[var(--color-text-strong)]">Sign in to your account</h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">Enter credentials matching your RBAC role.</p>

          <div className="mt-8">
            <Field label="Email">
              <input
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </Field>
            <Field label="Role (RBAC)">
              <select className={inputClass} value={role} onChange={(e) => setRole(e.target.value)}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="mb-5 flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-[var(--color-text)]">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Remember me
            </label>
            <span className="cursor-default text-sky-500">Forgot password?</span>
          </div>

          <button type="submit" disabled={loading} className={`${btnPrimary} w-full py-3 text-base`}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {error ? (
            <div className="mt-4 rounded-lg border border-dashed border-rose-500 bg-rose-500/10 px-3 py-2 text-sm text-rose-600">
              ✕ {error}
            </div>
          ) : null}

          <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-3 text-xs text-[var(--color-muted)]">
            <p className="mb-1 font-medium text-[var(--color-text)]">Quick demo accounts (Password@123)</p>
            <p>raven.k@transitops.in → Driver</p>
            <p>fleet@transitops.in → Fleet Manager</p>
            <p>safety@transitops.in → Safety Officer</p>
            <p>finance@transitops.in → Financial Analyst</p>
          </div>
        </form>
      </section>
    </div>
  );
}
