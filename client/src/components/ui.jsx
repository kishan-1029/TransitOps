export function StatusBadge({ status }) {
  const map = {
    Available: 'bg-emerald-600/15 text-emerald-600 border-emerald-600/40',
    OnTrip: 'bg-sky-600/15 text-sky-600 border-sky-600/40',
    'On Trip': 'bg-sky-600/15 text-sky-600 border-sky-600/40',
    InShop: 'bg-orange-600/15 text-orange-600 border-orange-600/40',
    'In Shop': 'bg-orange-600/15 text-orange-600 border-orange-600/40',
    Retired: 'bg-rose-600/15 text-rose-600 border-rose-600/40',
    OffDuty: 'bg-zinc-500/15 text-[var(--color-muted)] border-zinc-500/40',
    'Off Duty': 'bg-zinc-500/15 text-[var(--color-muted)] border-zinc-500/40',
    Suspended: 'bg-orange-700/20 text-orange-700 border-orange-500/40',
    Draft: 'bg-zinc-500/15 text-[var(--color-muted)] border-zinc-500/40',
    Dispatched: 'bg-sky-500/15 text-sky-600 border-sky-400/40',
    Completed: 'bg-emerald-600/15 text-emerald-600 border-emerald-600/40',
    Cancelled: 'bg-rose-600/15 text-rose-600 border-rose-600/40',
    Active: 'bg-orange-600/15 text-orange-600 border-orange-600/40',
    expired: 'bg-rose-600/15 text-rose-600 border-rose-600/40',
    expiring: 'bg-amber-500/15 text-amber-600 border-amber-500/40',
  };

  const label = String(status || '')
    .replace('OnTrip', 'On Trip')
    .replace('InShop', 'In Shop')
    .replace('OffDuty', 'Off Duty');

  const cls = map[status] || map[label] || 'bg-zinc-500/10 text-[var(--color-text)] border-[var(--color-border)]';

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

export function KpiCard({ label, value, accent = 'info', hint, onClick }) {
  const accents = {
    info: 'bg-sky-500',
    success: 'bg-emerald-500',
    warn: 'bg-orange-500',
    soft: 'bg-sky-300',
    danger: 'bg-rose-500',
  };
  const clickable = typeof onClick === 'function';

  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={onClick}
      className={`relative w-full overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3 text-left shadow-sm transition duration-200 ${
        clickable
          ? 'cursor-pointer hover:-translate-y-0.5 hover:border-[var(--color-accent)] hover:shadow-md active:translate-y-0'
          : 'cursor-default'
      }`}
    >
      <div className={`absolute left-0 top-0 h-full w-1 ${accents[accent] || accents.info}`} />
      <div className="text-xs uppercase tracking-wide text-[var(--color-muted)]">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-[var(--color-text-strong)]">{value}</div>
      {hint ? <div className="mt-1 text-[11px] text-[var(--color-muted)]">{hint}</div> : null}
      {clickable ? (
        <div className="mt-2 text-[11px] font-medium text-[var(--color-accent)]">Open →</div>
      ) : null}
    </button>
  );
}

export function PageHeader({ title, children, subtitle }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-text-strong)]">{title}</h1>
        {subtitle ? <p className="mt-0.5 text-sm text-[var(--color-muted)]">{subtitle}</p> : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export function Panel({ title, children, className = '' }) {
  return (
    <section className={`rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4 shadow-sm ${className}`}>
      {title ? <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">{title}</h2> : null}
      {children}
    </section>
  );
}

export function Field({ label, children }) {
  return (
    <label className="mb-3 block text-xs uppercase tracking-wide text-[var(--color-muted)]">
      <span className="mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  'w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]';

export const btnPrimary =
  'rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-40';

export const btnGhost =
  'rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text)] hover:bg-black/5 dark:hover:bg-white/5';

export function formatNumber(n) {
  if (n == null) return '—';
  return Number(n).toLocaleString('en-IN');
}

export function maskPhone(phone) {
  if (!phone) return '—';
  if (phone.length < 5) return phone;
  return `${phone.slice(0, 5)}xxxxx`;
}

export function formatDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function ThemeToggleButton({ theme, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-text)] hover:bg-black/5"
      title="Toggle light/dark mode"
    >
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  );
}
