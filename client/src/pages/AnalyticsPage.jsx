import { useEffect, useRef, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import api from '../api/client';
import { API } from '../api/endpoints';
import { PageHeader, KpiCard, btnPrimary, btnGhost, formatNumber, Panel } from '../components/ui';
import { AnalyticsSkeleton } from '../components/Skeleton';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const printRef = useRef(null);

  useEffect(() => {
    api
      .get(API.analytics)
      .then((res) => setData(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load analytics'));
  }, []);

  async function exportCsv() {
    const token = localStorage.getItem('transitops_token');
    const base = import.meta.env.VITE_API_URL || '';
    const res = await fetch(`${base}${API.exportCsv}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transitops-analytics.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPdf() {
    window.print();
  }

  if (error) {
    return (
      <div className="page-enter rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-6 text-center text-sm text-rose-600">
        {error}
      </div>
    );
  }
  if (!data) return <AnalyticsSkeleton />;

  const costColors = ['#f5a3a3', '#e67e22', '#3498db', '#27ae60', '#9b59b6'];

  return (
    <div ref={printRef} className="page-enter print-area">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Fuel efficiency · utilization · cost · ROI · profitability"
      >
        <button type="button" className={btnGhost} onClick={exportPdf}>
          Print / PDF
        </button>
        <button type="button" className={btnPrimary} onClick={exportCsv}>
          Export CSV
        </button>
      </PageHeader>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Fuel Efficiency"
          value={`${data.fuelEfficiency} km/l`}
          accent="info"
          hint={`Distance ${formatNumber(data.totalDistance)} km / ${data.totalFuelLiters} L`}
        />
        <KpiCard label="Fleet Utilization" value={`${data.fleetUtilization}%`} accent="success" />
        <KpiCard
          label="Operational Cost"
          value={formatNumber(data.operationalCost)}
          accent="warn"
          hint={`Fuel ${formatNumber(data.fuelCost)} + Maint ${formatNumber(data.maintenanceCost)}`}
        />
        <KpiCard label="Vehicle ROI (avg)" value={`${data.vehicleRoi}%`} accent="success" />
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <KpiCard label="Total Revenue" value={formatNumber(data.totalRevenue)} accent="success" />
        <KpiCard label="Other Expenses" value={formatNumber(data.otherExpenses)} accent="soft" />
        <KpiCard label="Net Profit" value={formatNumber(data.profit)} accent="info" />
      </div>

      <p className="mb-6 text-xs text-[var(--color-muted)]">{data.roiFormula}</p>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Panel title="Monthly Revenue (from completed trips)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyRevenue}>
                <XAxis dataKey="month" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ background: 'var(--color-panel)', border: '1px solid var(--color-border)' }} />
                <Bar dataKey="revenue" fill="#3498db" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Top Costliest Vehicles">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.costliestVehicles} layout="vertical" margin={{ left: 40 }}>
                <XAxis type="number" stroke="#888" />
                <YAxis type="category" dataKey="name" stroke="#888" width={80} />
                <Tooltip contentStyle={{ background: 'var(--color-panel)', border: '1px solid var(--color-border)' }} />
                <Bar dataKey="totalCost" radius={[0, 4, 4, 0]}>
                  {data.costliestVehicles.map((_, i) => (
                    <Cell key={i} fill={costColors[i % costColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel title="Per-Vehicle Profitability">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-[var(--color-muted)]">
              <tr>
                <th className="py-2">Vehicle</th>
                <th>Revenue</th>
                <th>Fuel</th>
                <th>Maint</th>
                <th>Other</th>
                <th>Profit</th>
                <th>ROI %</th>
              </tr>
            </thead>
            <tbody>
              {data.vehicleStats.map((v) => (
                <tr key={v.id} className="border-t border-[var(--color-border)]">
                  <td className="py-2 font-medium">{v.name}</td>
                  <td>{formatNumber(v.revenue)}</td>
                  <td>{formatNumber(v.fuelCost)}</td>
                  <td>{formatNumber(v.maintCost)}</td>
                  <td>{formatNumber(v.otherCost)}</td>
                  <td className={v.profit >= 0 ? 'text-emerald-600' : 'text-rose-500'}>
                    {formatNumber(v.profit)}
                  </td>
                  <td>{v.roi}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
