import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLE_LABELS } from '../context/AuthContext';
import { Field, inputClass, btnPrimary } from '../components/ui';

const DEMO_PASSWORD = 'Password@123';

/** All seeded accounts — reviewers can click any row to sign in */
const DEMO_ACCOUNTS = [
  {
    role: 'FLEET_MANAGER',
    email: 'fleet@transitops.in',
    blurb: 'Fleet, maintenance, vehicle lifecycle & efficiency',
  },
  {
    role: 'DRIVER',
    email: 'raven.k@transitops.in',
    blurb: 'Create trips, assign vehicles/drivers, monitor deliveries',
  },
  {
    role: 'DISPATCHER',
    email: 'dispatch@transitops.in',
    blurb: 'Same trip permissions as Driver — dispatch desk alias',
  },
  {
    role: 'SAFETY_OFFICER',
    email: 'safety@transitops.in',
    blurb: 'License validity, compliance & safety scores',
  },
  {
    role: 'FINANCIAL_ANALYST',
    email: 'finance@transitops.in',
    blurb: 'Fuel, expenses, costs & profitability',
  },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(DEMO_ACCOUNTS[0].email);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [role, setRole] = useState(DEMO_ACCOUNTS[0].role);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(true);

  function pickAccount(account) {
    setRole(account.role);
    setEmail(account.email);
    setPassword(DEMO_PASSWORD);
    setError('');
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email: email.trim(), password, role, remember });
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      const friendly =
        err.response?.status === 503
          ? 'Database is waking up or busy — wait 5 seconds and try again.'
          : err.code === 'ERR_NETWORK'
            ? 'Cannot reach API (is the server running on port 5000?)'
            : msg;
      setError(friendly);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section
        className="relative flex flex-col justify-between overflow-hidden px-8 py-10 sm:px-10 sm:py-12"
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
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">TransitOps</h1>
              <p className="text-sm opacity-80">Smart Transport Operations Platform</p>
            </div>
          </div>

          <p className="mb-2 text-sm font-semibold uppercase tracking-wide opacity-70">
            Reviewer quick login — click any account
          </p>
          <p className="mb-4 text-xs opacity-65">
            Password for every account:{' '}
            <span className="rounded bg-black/10 px-1.5 py-0.5 font-mono font-semibold">{DEMO_PASSWORD}</span>
          </p>

          <ul className="space-y-2.5">
            {DEMO_ACCOUNTS.map((account, i) => {
              const active = role === account.role && email === account.email;
              return (
                <li key={account.email}>
                  <button
                    type="button"
                    onClick={() => pickAccount(account)}
                    className={`w-full rounded-xl border px-4 py-3 text-left backdrop-blur transition ${
                      active
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/20 shadow-sm'
                        : 'border-current/15 bg-black/5 hover:border-[var(--color-accent)]/50'
                    }`}
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-semibold">
                        {i + 1}. {ROLE_LABELS[account.role] || account.role}
                      </span>
                      <span className="rounded-md bg-black/10 px-2 py-0.5 font-mono text-[11px] font-medium tracking-tight">
                        {account.email}
                      </span>
                    </div>
                    <div className="mt-1 text-sm opacity-75">{account.blurb}</div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <p className="relative mt-8 text-xs uppercase tracking-wide opacity-60">
          TransitOps © 2026 — RBAC Enabled · 5 demo users
        </p>
      </section>

      <section className="flex items-center justify-center bg-[var(--color-bg)] px-6 py-10 sm:px-8 sm:py-12">
        <form onSubmit={onSubmit} className="w-full max-w-md">
          <h2 className="text-2xl font-semibold text-[var(--color-text-strong)]">Sign in to your account</h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Use a demo email below, or click a role on the left to auto-fill.
          </p>

          {/* Always-visible credential cheat sheet for reviewers */}
          <div className="mt-5 rounded-xl border border-[var(--color-accent)]/35 bg-[var(--color-accent)]/8 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)]">
              Demo accounts (hackathon reviewers)
            </p>
            <p className="mt-2 text-sm text-[var(--color-text)]">
              Password (all users):{' '}
              <code className="rounded bg-[var(--color-panel)] px-2 py-0.5 font-mono text-[13px] font-semibold text-[var(--color-text-strong)]">
                {DEMO_PASSWORD}
              </code>
            </p>
            <ul className="mt-3 space-y-1.5">
              {DEMO_ACCOUNTS.map((account) => (
                <li key={account.email}>
                  <button
                    type="button"
                    onClick={() => pickAccount(account)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg border border-transparent px-2 py-1.5 text-left text-xs transition hover:border-[var(--color-border)] hover:bg-[var(--color-panel)]"
                  >
                    <span className="font-medium text-[var(--color-text)]">
                      {ROLE_LABELS[account.role] || account.role}
                    </span>
                    <span className="font-mono text-[var(--color-muted)]">{account.email}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <Field label="Email">
              <input
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                placeholder="fleet@transitops.in"
              />
            </Field>
            <Field label="Password">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`${inputClass} pr-16`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-[11px] text-sky-500 hover:underline"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-[var(--color-muted)]">
                Reference password: <span className="font-mono text-[var(--color-text)]">{DEMO_PASSWORD}</span>
              </p>
            </Field>
            <Field label="Role (RBAC)">
              <select
                className={inputClass}
                value={role}
                onChange={(e) => {
                  const next = DEMO_ACCOUNTS.find((a) => a.role === e.target.value);
                  if (next) pickAccount(next);
                  else setRole(e.target.value);
                }}
              >
                {DEMO_ACCOUNTS.map((account) => (
                  <option key={account.role} value={account.role}>
                    {ROLE_LABELS[account.role] || account.role}
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
          </div>

          <button type="submit" disabled={loading} className={`${btnPrimary} w-full py-3 text-base`}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {error ? (
            <div className="mt-4 rounded-lg border border-dashed border-rose-500 bg-rose-500/10 px-3 py-2 text-sm text-rose-600">
              ✕ {error}
            </div>
          ) : null}
        </form>
      </section>
    </div>
  );
}
