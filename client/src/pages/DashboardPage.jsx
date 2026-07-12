import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { API } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { KpiCard, StatusBadge, inputClass, formatNumber, Panel, PageHeader } from '../components/ui';

export default function DashboardPage() {
  const { user, roleLabel } = useAuth();
  const [data, setData] = useState(null);
  const [type, setType] = useState('All');
  const [status, setStatus] = useState('All');
  const [region, setRegion] = useState('All');
  const [error, setError] = useState('');

  async function load() {
    try {
      const res = await api.get(API.dashboard, { params: { type, status, region } });
      setData(res.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    }
  }

  useEffect(() => {
    load();
  }, [type, status, region]);

  if (error) return <p className="text-rose-500">{error}</p>;
  if (!data) return <p className="text-[var(--color-muted)]">Loading dashboard...</p>;

  const { kpis, statusCounts, recentTrips, regions, licenseAlerts, lowSafetyDrivers, activeMaintenance, driverStatusBreakdown } = data;
  const role = user?.role;
  const totalStatus = Object.values(statusCounts).reduce((a, b) => a + b, 0) || 1;

  return (
    <div>
      <PageHeader
        title={`${roleLabel} Dashboard`}
        subtitle="Live fleet metadata · filters apply to vehicle KPIs"
      />

      <div className="mb-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">Filters</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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

      {/* Core metadata KPIs — required by problem statement */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <KpiCard label="Active Vehicles" value={kpis.activeVehicles} accent="info" />
        <KpiCard label="Available Vehicles" value={kpis.availableVehicles} accent="success" />
        <KpiCard label="In Maintenance" value={String(kpis.vehiclesInMaintenance).padStart(2, '0')} accent="warn" />
        <KpiCard label="Active Trips" value={kpis.activeTrips} accent="info" />
        <KpiCard label="Pending Trips" value={String(kpis.pendingTrips).padStart(2, '0')} accent="soft" />
        <KpiCard label="Drivers on Duty" value={kpis.driversOnDuty} accent="info" />
        <KpiCard label="Fleet Utilization" value={`${kpis.fleetUtilization}%`} accent="success" />
      </div>

      {/* Role-specific KPI strip */}
      {(role === 'FLEET_MANAGER') && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Open Shop Jobs" value={activeMaintenance?.length || 0} accent="warn" hint="Active maintenance records" />
          <KpiCard label="Avg Safety Score" value={kpis.avgSafetyScore} accent="info" />
          <KpiCard label="Ops Cost (Fuel+Maint)" value={formatNumber(kpis.operationalCost)} accent="warn" />
          <KpiCard label="Fleet Revenue" value={formatNumber(kpis.totalRevenue)} accent="success" />
        </div>
      )}

      {(role === 'SAFETY_OFFICER') && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Expired Licenses" value={kpis.expiredLicenses} accent="danger" />
          <KpiCard label="Expiring ≤30 days" value={kpis.expiringLicenses} accent="warn" />
          <KpiCard label="Low Safety (<75)" value={kpis.lowSafetyCount} accent="warn" />
          <KpiCard label="Avg Safety Score" value={kpis.avgSafetyScore} accent="success" />
        </div>
      )}

      {(role === 'FINANCIAL_ANALYST') && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Fuel Cost" value={formatNumber(kpis.fuelCost)} accent="info" />
          <KpiCard label="Maintenance Cost" value={formatNumber(kpis.maintenanceCost)} accent="warn" />
          <KpiCard label="Other Expenses" value={formatNumber(kpis.otherExpenses)} accent="soft" />
          <KpiCard label="Profit (Rev − Costs)" value={formatNumber(kpis.profit)} accent="success" />
        </div>
      )}

      {(role === 'DRIVER' || role === 'DISPATCHER') && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Live Dispatches" value={kpis.activeTrips} accent="info" hint="On the road now" />
          <KpiCard label="Draft Queue" value={kpis.pendingTrips} accent="soft" />
          <KpiCard label="Dispatch Pool" value={kpis.availableVehicles} accent="success" hint="Available vehicles" />
          <KpiCard label="Assignable Drivers" value={driverStatusBreakdown?.Available || 0} accent="info" />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Recent Trips">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
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
                  <tr key={t.id} className="border-t border-[var(--color-border)]">
                    <td className="py-2 font-medium">{t.tripCode}</td>
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
          {(role === 'DRIVER' || role === 'DISPATCHER') && (
            <Link to="/trips" className="mt-3 inline-block text-sm text-[var(--color-accent)] hover:underline">
              Open Trip Dispatcher →
            </Link>
          )}
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
              <div key={row.key} className="mb-3">
                <div className="mb-1 flex justify-between text-sm">
                  <span>{row.label}</span>
                  <span className="text-[var(--color-muted)]">{count}</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--color-border)]">
                  <div className={`h-2 rounded-full ${row.color}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </Panel>

        {(role === 'SAFETY_OFFICER' || role === 'FLEET_MANAGER') && (
          <Panel title="License & Compliance Alerts">
            {licenseAlerts?.length ? (
              <ul className="space-y-2 text-sm">
                {licenseAlerts.slice(0, 8).map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] pb-2">
                    <span>
                      <strong>{a.name}</strong> · {a.licenseNo}
                    </span>
                    <span className="flex items-center gap-2">
                      <StatusBadge status={a.severity === 'expired' ? 'expired' : a.severity === 'expiring' ? 'expiring' : a.status} />
                      <span className="text-xs text-[var(--color-muted)]">
                        {a.daysLeft < 0 ? `${Math.abs(a.daysLeft)}d overdue` : `${a.daysLeft}d left`} · score {a.safetyScore}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--color-muted)]">No license alerts.</p>
            )}
            {role === 'SAFETY_OFFICER' && (
              <Link to="/drivers" className="mt-3 inline-block text-sm text-[var(--color-accent)] hover:underline">
                Manage drivers & safety scores →
              </Link>
            )}
          </Panel>
        )}

        {role === 'SAFETY_OFFICER' && (
          <Panel title="Low Safety Scores">
            {lowSafetyDrivers?.length ? (
              <ul className="space-y-2 text-sm">
                {lowSafetyDrivers.map((d) => (
                  <li key={d.id} className="flex justify-between border-b border-[var(--color-border)] pb-2">
                    <span>{d.name}</span>
                    <span className="font-semibold text-orange-600">{d.safetyScore} · {d.safetyBand}</span>
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
                  <li key={m.id} className="flex justify-between border-b border-[var(--color-border)] pb-2">
                    <span>{m.vehicle?.name} · {m.serviceType}</span>
                    <span className="text-[var(--color-muted)]">{formatNumber(m.cost)}</span>
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
            <p className="mb-2 text-sm text-[var(--color-muted)]">
              Revenue {formatNumber(kpis.totalRevenue)} − Ops {formatNumber(kpis.operationalCost)} − Other {formatNumber(kpis.otherExpenses)} ={' '}
              <strong className="text-[var(--color-text-strong)]">{formatNumber(kpis.profit)}</strong>
            </p>
            <Link to="/analytics" className="text-sm text-[var(--color-accent)] hover:underline">
              Open Analytics · ROI · CSV export →
            </Link>
          </Panel>
        )}
      </div>
    </div>
  );
}
