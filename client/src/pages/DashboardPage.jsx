import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { API } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { KpiCard, StatusBadge, inputClass, formatNumber, Panel, PageHeader } from '../components/ui';
import { DashboardSkeleton } from '../components/Skeleton';

export default function DashboardPage() {
  const { user, roleLabel, can } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [type, setType] = useState('All');
  const [status, setStatus] = useState('All');
  const [region, setRegion] = useState('All');
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  function go(path) {
    if (!path) return;
    navigate(path);
  }

  function goIf(module, path) {
    if (can(module, 'view')) go(path);
  }

  async function load() {
    setRefreshing((prev) => (data ? true : prev));
    try {
      const res = await api.get(API.dashboard, { params: { type, status, region } });
      setData(res.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload on filter change
  }, [type, status, region]);

  if (error && !data) {
    return (
      <div className="page-enter rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-6 text-center">
        <p className="text-sm font-medium text-rose-600">{error}</p>
        <button
          type="button"
          className="mt-3 text-sm text-[var(--color-accent)] underline"
          onClick={() => {
            setError('');
            load();
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return <DashboardSkeleton />;

  const { kpis, statusCounts, recentTrips, regions, licenseAlerts, lowSafetyDrivers, activeMaintenance, driverStatusBreakdown } = data;
  const role = user?.role;
  const totalStatus = Object.values(statusCounts).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className={`page-enter relative ${refreshing ? 'pointer-events-none opacity-70' : ''}`}>
      {refreshing ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center">
          <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-1 text-[11px] text-[var(--color-muted)] shadow-sm">
            Updating filters…
          </span>
        </div>
      ) : null}

      <PageHeader
        title={`${roleLabel} Dashboard`}
        subtitle="Live fleet metadata · click any KPI or row to open the module"
      />

      <div className="mb-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">Filters</p>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <label className="block text-xs text-[var(--color-muted)]">
            <span className="mb-1 block">Vehicle Type</span>
            <select className={inputClass} value={type} onChange={(e) => setType(e.target.value)}>
              <option>All</option>
              <option>Van</option>
              <option>Truck</option>
              <option>Mini</option>
            </select>
          </label>
          <label className="block text-xs text-[var(--color-muted)]">
            <span className="mb-1 block">Status</span>
            <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>All</option>
              <option value="Available">Available</option>
              <option value="OnTrip">On Trip</option>
              <option value="InShop">In Shop</option>
              <option value="Retired">Retired</option>
            </select>
          </label>
          <label className="block text-xs text-[var(--color-muted)]">
            <span className="mb-1 block">Region</span>
            <select className={inputClass} value={region} onChange={(e) => setRegion(e.target.value)}>
              <option>All</option>
              {regions?.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Core metadata KPIs — clickable when role has access */}
      <div className="mb-6 grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        <KpiCard label="Active Vehicles" value={kpis.activeVehicles} accent="info" hint="Fleet registry" onClick={() => goIf('fleet', '/fleet')} />
        <KpiCard label="Available Vehicles" value={kpis.availableVehicles} accent="success" hint="Ready to dispatch" onClick={() => goIf('fleet', '/fleet')} />
        <KpiCard label="In Maintenance" value={String(kpis.vehiclesInMaintenance).padStart(2, '0')} accent="warn" hint="Shop floor" onClick={() => goIf('maintenance', '/maintenance')} />
        <KpiCard label="Active Trips" value={kpis.activeTrips} accent="info" hint="Live board" onClick={() => goIf('trips', '/trips')} />
        <KpiCard label="Pending Trips" value={String(kpis.pendingTrips).padStart(2, '0')} accent="soft" hint="Draft queue" onClick={() => goIf('trips', '/trips')} />
        <KpiCard label="Drivers on Duty" value={kpis.driversOnDuty} accent="info" hint="Driver roster" onClick={() => goIf('drivers', '/drivers')} />
        <KpiCard label="Fleet Utilization" value={`${kpis.fleetUtilization}%`} accent="success" hint="Analytics" onClick={() => goIf('analytics', '/analytics')} />
      </div>

      {/* Role-specific KPI strip */}
      {(role === 'FLEET_MANAGER') && (
        <div className="mb-6 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Open Shop Jobs" value={activeMaintenance?.length || 0} accent="warn" hint="Active maintenance records" onClick={() => go('/maintenance')} />
          <KpiCard label="Avg Safety Score" value={kpis.avgSafetyScore} accent="info" hint="Drivers & compliance" onClick={() => go('/drivers')} />
          <KpiCard label="Ops Cost (Fuel+Maint)" value={formatNumber(kpis.operationalCost)} accent="warn" hint="Cost analytics" onClick={() => go('/analytics')} />
          <KpiCard label="Fleet Revenue" value={formatNumber(kpis.totalRevenue)} accent="success" hint="Profitability" onClick={() => go('/analytics')} />
        </div>
      )}

      {(role === 'SAFETY_OFFICER') && (
        <div className="mb-6 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Expired Licenses" value={kpis.expiredLicenses} accent="danger" onClick={() => go('/drivers')} />
          <KpiCard label="Expiring ≤30 days" value={kpis.expiringLicenses} accent="warn" onClick={() => go('/drivers')} />
          <KpiCard label="Low Safety (<75)" value={kpis.lowSafetyCount} accent="warn" onClick={() => go('/drivers')} />
          <KpiCard label="Avg Safety Score" value={kpis.avgSafetyScore} accent="success" onClick={() => go('/drivers')} />
        </div>
      )}

      {(role === 'FINANCIAL_ANALYST') && (
        <div className="mb-6 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Fuel Cost" value={formatNumber(kpis.fuelCost)} accent="info" onClick={() => go('/fuel')} />
          <KpiCard label="Maintenance Cost" value={formatNumber(kpis.maintenanceCost)} accent="warn" onClick={() => go('/fuel')} />
          <KpiCard label="Other Expenses" value={formatNumber(kpis.otherExpenses)} accent="soft" onClick={() => go('/fuel')} />
          <KpiCard label="Profit (Rev − Costs)" value={formatNumber(kpis.profit)} accent="success" onClick={() => go('/analytics')} />
        </div>
      )}

      {(role === 'DRIVER' || role === 'DISPATCHER') && (
        <div className="mb-6 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Live Dispatches" value={kpis.activeTrips} accent="info" hint="On the road now" onClick={() => go('/trips')} />
          <KpiCard label="Draft Queue" value={kpis.pendingTrips} accent="soft" onClick={() => go('/trips')} />
          <KpiCard label="Dispatch Pool" value={kpis.availableVehicles} accent="success" hint="Available vehicles" onClick={() => go('/fleet')} />
          <KpiCard label="Assignable Drivers" value={driverStatusBreakdown?.Available || 0} accent="info" onClick={() => go('/drivers')} />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Recent Trips">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[500px]">
              <thead className="text-xs uppercase text-[var(--color-muted)]">
                <tr>
                  <th className="py-2">Trip</th>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Status</th>
                  <th>ETA</th>
                </tr>
              </thead>
              <tbody>
                {recentTrips.map((t) => (
                  <tr
                    key={t.id}
                    className="cursor-pointer border-t border-[var(--color-border)] transition hover:bg-[var(--color-accent)]/5"
                    onClick={() => goIf('trips', '/trips')}
                  >
                    <td className="py-2 font-medium text-[var(--color-accent)]">{t.tripCode}</td>
                    <td>{t.vehicle?.name}</td>
                    <td>{t.driver?.name}</td>
                    <td><StatusBadge status={t.status} /></td>
                    <td className="text-[var(--color-muted)]">
                      {t.status === 'Draft' ? 'Awaiting' : t.etaMinutes != null ? `${t.etaMinutes} min` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link to="/trips" className="mt-3 inline-block text-sm text-[var(--color-accent)] hover:underline">
            Open Trip Dispatcher →
          </Link>
        </Panel>

        <Panel title="Vehicle Status">
          {[
            { key: 'Available', color: 'bg-emerald-500', label: 'Available' },
            { key: 'OnTrip', color: 'bg-sky-500', label: 'On Trip' },
            { key: 'InShop', color: 'bg-orange-500', label: 'In Shop' },
            { key: 'Retired', color: 'bg-rose-500', label: 'Retired' },
          ].map((row) => {
            const count = statusCounts[row.key] || 0;
            const pct = Math.round((count / totalStatus) * 100);
            return (
              <button
                key={row.key}
                type="button"
                className="mb-3 w-full rounded-lg p-1 text-left transition hover:bg-[var(--color-accent)]/5"
                onClick={() => goIf('fleet', `/fleet?status=${row.key}`)}
              >
                <div className="mb-1 flex justify-between text-sm">
                  <span>{row.label}</span>
                  <span className="text-[var(--color-muted)]">
                    {count} · Open →
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[var(--color-border)]">
                  <div className={`h-2 rounded-full ${row.color}`} style={{ width: `${pct}%` }} />
                </div>
              </button>
            );
          })}
        </Panel>

        {(role === 'SAFETY_OFFICER' || role === 'FLEET_MANAGER') && (
          <Panel title="License & Compliance Alerts">
            {licenseAlerts?.length ? (
              <ul className="space-y-2 text-sm">
                {licenseAlerts.slice(0, 8).map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      className="flex w-full flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] pb-2 text-left transition hover:text-[var(--color-accent)]"
                      onClick={() => go('/drivers')}
                    >
                      <span>
                        <strong>{a.name}</strong> · {a.licenseNo}
                      </span>
                      <span className="flex items-center gap-2">
                        <StatusBadge status={a.severity === 'expired' ? 'expired' : a.severity === 'expiring' ? 'expiring' : a.status} />
                        <span className="text-xs text-[var(--color-muted)]">
                          {a.daysLeft < 0 ? `${Math.abs(a.daysLeft)}d overdue` : `${a.daysLeft}d left`} · score {a.safetyScore}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--color-muted)]">No license alerts.</p>
            )}
            <Link to="/drivers" className="mt-3 inline-block text-sm text-[var(--color-accent)] hover:underline">
              Manage drivers & safety scores →
            </Link>
          </Panel>
        )}

        {role === 'SAFETY_OFFICER' && (
          <Panel title="Low Safety Scores">
            {lowSafetyDrivers?.length ? (
              <ul className="space-y-2 text-sm">
                {lowSafetyDrivers.map((d) => (
                  <li key={d.id}>
                    <button
                      type="button"
                      className="flex w-full justify-between border-b border-[var(--color-border)] pb-2 text-left transition hover:text-[var(--color-accent)]"
                      onClick={() => go('/drivers')}
                    >
                      <span>{d.name}</span>
                      <span className="font-semibold text-orange-600">{d.safetyScore} · {d.safetyBand}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--color-muted)]">All drivers above threshold.</p>
            )}
          </Panel>
        )}

        {role === 'FLEET_MANAGER' && (
          <Panel title="Active Maintenance">
            {activeMaintenance?.length ? (
              <ul className="space-y-2 text-sm">
                {activeMaintenance.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      className="flex w-full justify-between border-b border-[var(--color-border)] pb-2 text-left transition hover:text-[var(--color-accent)]"
                      onClick={() => go('/maintenance')}
                    >
                      <span>{m.vehicle?.name} · {m.serviceType}</span>
                      <span className="text-[var(--color-muted)]">{formatNumber(m.cost)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--color-muted)]">No open shop jobs.</p>
            )}
            <Link to="/maintenance" className="mt-3 inline-block text-sm text-[var(--color-accent)] hover:underline">
              Open Maintenance →
            </Link>
          </Panel>
        )}

        {role === 'FINANCIAL_ANALYST' && (
          <Panel title="Profitability Snapshot" className="lg:col-span-2">
            <button
              type="button"
              className="mb-2 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] p-3 text-left text-sm transition hover:border-[var(--color-accent)]"
              onClick={() => go('/analytics')}
            >
              Revenue {formatNumber(kpis.totalRevenue)} − Ops {formatNumber(kpis.operationalCost)} − Other {formatNumber(kpis.otherExpenses)} ={' '}
              <strong className="text-[var(--color-text-strong)]">{formatNumber(kpis.profit)}</strong>
              <span className="mt-1 block text-xs text-[var(--color-accent)]">Open Analytics · ROI · CSV export →</span>
            </button>
          </Panel>
        )}
      </div>
    </div>
  );
}
