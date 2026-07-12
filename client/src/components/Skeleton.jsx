/** Reusable shimmer skeletons for TransitOps loading states */

export function Skeleton({ className = '' }) {
  return <div className={`skeleton-bone ${className}`} aria-hidden="true" />;
}

export function KpiSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3 shadow-sm">
      <div className="absolute left-0 top-0 h-full w-1 bg-[var(--color-border)]" />
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-7 w-16" />
      <Skeleton className="mt-2 h-2.5 w-20" />
    </div>
  );
}

export function PanelSkeleton({ lines = 4, className = '' }) {
  return (
    <section
      className={`rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4 shadow-sm ${className}`}
    >
      <Skeleton className="mb-4 h-3 w-32" />
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-3" style={{ width: `${88 - (i % 3) * 12}%` }} />
        ))}
      </div>
    </section>
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] shadow-sm">
      <div className="border-b border-[var(--color-border)] bg-[var(--color-panel-2)] px-4 py-3">
        <div className="flex gap-6">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-16" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-[var(--color-border)]">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-6 px-4 py-3.5">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton
                key={c}
                className="h-3.5"
                style={{ width: c === 0 ? '18%' : `${12 + ((r + c) % 3) * 4}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Full dashboard layout placeholder */
export function DashboardSkeleton() {
  return (
    <div className="page-enter" aria-busy="true" aria-label="Loading dashboard">
      <div className="mb-5">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="mt-2 h-3.5 w-72" />
      </div>

      <div className="mb-5">
        <Skeleton className="mb-2 h-3 w-16" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <Skeleton className="mb-1.5 h-3 w-20" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {Array.from({ length: 7 }).map((_, i) => (
          <KpiSkeleton key={i} />
        ))}
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiSkeleton key={i} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PanelSkeleton lines={6} />
        <PanelSkeleton lines={5} />
        <PanelSkeleton lines={4} />
        <PanelSkeleton lines={4} />
      </div>
    </div>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="page-enter" aria-busy="true" aria-label="Loading analytics">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Skeleton className="h-7 w-52" />
          <Skeleton className="mt-2 h-3.5 w-80" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiSkeleton key={i} />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
          <Skeleton className="mb-4 h-3 w-40" />
          <Skeleton className="h-56 w-full rounded-lg" />
        </section>
        <PanelSkeleton lines={8} />
      </div>
    </div>
  );
}

/** Generic page shell used by Suspense while lazy chunks load */
export function RouteFallback() {
  return (
    <div className="page-enter space-y-5" aria-busy="true" aria-label="Loading page">
      <div>
        <Skeleton className="h-7 w-48" />
        <Skeleton className="mt-2 h-3.5 w-64" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <KpiSkeleton />
        <KpiSkeleton />
        <KpiSkeleton />
      </div>
      <TableSkeleton rows={7} cols={6} />
    </div>
  );
}

export function AuthFallback() {
  return (
    <div className="grid min-h-screen place-items-center bg-[var(--color-bg)]">
      <div className="w-full max-w-sm space-y-4 px-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-11 w-full rounded-lg" />
      </div>
    </div>
  );
}
