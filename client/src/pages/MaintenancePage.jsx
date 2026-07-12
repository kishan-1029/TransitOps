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
} from '../components/ui';

export default function MaintenancePage() {
  const { can } = useAuth();
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({
    vehicleId: '',
    serviceType: 'Oil Change',
    cost: 2500,
    date: new Date().toISOString().slice(0, 10),
  });
  const [error, setError] = useState('');

  async function load() {
    const [logRes, vehRes] = await Promise.all([
      api.get(API.maintenance),
      api.get(API.vehicles),
    ]);
    setLogs(logRes.data.data || []);
    setVehicles((vehRes.data.data || []).filter((v) => v.status !== 'Retired' && v.status !== 'OnTrip'));
  }

  useEffect(() => {
    load().catch((e) => setError(e.response?.data?.message || 'Failed to load'));
  }, []);

  async function onSave(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post(API.maintenance, form);
      setForm({ ...form, serviceType: 'Oil Change', cost: 2500 });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  async function closeLog(id) {
    try {
      await api.post(`${API.maintenance}/${id}/close`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  return (
    <div>
      <PageHeader title="Maintenance" />
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
          <table className="w-full text-left text-sm">
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
        </Panel>
      </div>
    </div>
  );
}
