import { useEffect, useState } from 'react';
import api from '../api/client';
import { API } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import {
  PageHeader,
  Panel,
  StatusBadge,
  Field,
  inputClass,
  btnPrimary,
  formatNumber,
  Pagination,
} from '../components/ui';
import { RouteFallback } from '../components/Skeleton';

export default function MaintenancePage() {
  const { can } = useAuth();
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({
    vehicleId: '',
    serviceType: 'Oil Change',
    cost: 2500,
    date: new Date().toISOString().slice(0, 10),
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadVehicles() {
    const vehRes = await api.get(API.vehicles);
    setVehicles((vehRes.data.data || []).filter((v) => v.status !== 'Retired' && v.status !== 'OnTrip'));
  }

  async function loadLogs() {
    const logRes = await api.get(API.maintenance, {
      params: {
        page,
        limit: 8,
        sortBy,
        sortOrder,
      },
    });
    if (logRes.data.data && logRes.data.data.items) {
      setLogs(logRes.data.data.items);
      setPagination(logRes.data.data.pagination);
    } else {
      setLogs(logRes.data.data || []);
      setPagination(null);
    }
  }

  async function refresh() {
    await Promise.all([loadVehicles(), loadLogs()]);
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([loadVehicles(), loadLogs()])
      .catch((e) => setError(e.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadLogs().catch((e) => setError(e.response?.data?.message || 'Failed to load'));
  }, [page, sortBy, sortOrder]);

  async function onSave(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post(API.maintenance, form);
      setForm({ ...form, serviceType: 'Oil Change', cost: 2500 });
      await refresh();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  async function closeLog(id) {
    try {
      await api.post(`${API.maintenance}/${id}/close`);
      await refresh();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return <span className="opacity-30">⇅</span>;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  if (loading) return <RouteFallback />;

  return (
    <div className="page-enter">
      <PageHeader title="Maintenance" subtitle="Shop floor · In Shop status sync with dispatch pool" />
      {error ? <p className="mb-3 text-sm text-rose-400">{error}</p> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Log Service Record">
          {can('maintenance', 'full') ? (
            <form onSubmit={onSave}>
              <Field label="Vehicle">
                <select className={inputClass} required value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}>
                  <option value="">Select</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.status})
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Service Type">
                <input className={inputClass} value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} />
              </Field>
              <Field label="Cost">
                <input type="number" className={inputClass} value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
              </Field>
              <Field label="Date">
                <input type="date" className={inputClass} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </Field>
              <button type="submit" className={btnPrimary}>
                Save
              </button>
            </form>
          ) : (
            <p className="text-sm text-zinc-400">View-only</p>
          )}
          <div className="mt-4 space-y-1 text-sm text-zinc-400">
            <p>
              <span className="text-emerald-400">Available</span> → creating active record →{' '}
              <span className="text-orange-400">In Shop</span>
            </p>
            <p>
              <span className="text-orange-400">In Shop</span> → closing record →{' '}
              <span className="text-emerald-400">Available</span>
            </p>
            <p className="text-[var(--color-accent)]">Note: In Shop vehicles are removed from the dispatch pool.</p>
          </div>
        </Panel>

        <Panel title="Service Log">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[500px]">
              <thead className="text-xs uppercase text-zinc-500">
                <tr>
                  <th className="py-2">Vehicle</th>
                  <th>Service</th>
                  <th>Cost</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-t border-[var(--color-border)]">
                    <td className="py-2">{l.vehicle?.name}</td>
                    <td>{l.serviceType}</td>
                    <td>{formatNumber(l.cost)}</td>
                    <td>
                      <StatusBadge status={l.status === 'Active' ? 'InShop' : 'Completed'} />
                    </td>
                    <td>
                      {can('maintenance', 'full') && l.status === 'Active' ? (
                        <button type="button" className="text-xs text-sky-400" onClick={() => closeLog(l.id)}>
                          Close
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}
