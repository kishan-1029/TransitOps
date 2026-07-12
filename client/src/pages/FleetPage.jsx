import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { API } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import {
  PageHeader,
  StatusBadge,
  Field,
  inputClass,
  btnPrimary,
  btnGhost,
  formatNumber,
  Panel,
} from '../components/ui';
import { TableSkeleton } from '../components/Skeleton';

const emptyForm = {
  regNo: '',
  name: '',
  type: 'Van',
  capacityKg: 500,
  odometer: 0,
  acquisitionCost: 0,
  status: 'Available',
  region: 'Gandhinagar',
};

const STATUS_FILTERS = new Set(['Available', 'OnTrip', 'InShop', 'Retired']);

export default function FleetPage() {
  const { can } = useAuth();
  const [searchParams] = useSearchParams();
  const initialStatus = STATUS_FILTERS.has(searchParams.get('status'))
    ? searchParams.get('status')
    : 'All';
  const [vehicles, setVehicles] = useState([]);
  const [type, setType] = useState('All');
  const [status, setStatus] = useState(initialStatus);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const next = searchParams.get('status');
    if (STATUS_FILTERS.has(next)) setStatus(next);
  }, [searchParams]);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get(API.vehicles, { params: { type, status, search } });
      setVehicles(res.data.data || []);
      setError('');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [type, status, search]);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post(API.vehicles, form);
      if (!res.data.isOk) throw new Error(res.data.message);
      setShowForm(false);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  return (
    <div className="page-enter">
      <PageHeader
        title="Vehicle Registry"
        subtitle="Master list of fleet assets — filter by type, status, or registration"
      >
        {can('fleet', 'full') ? (
          <button type="button" className={btnPrimary} onClick={() => setShowForm(true)}>
            + Add Vehicle
          </button>
        ) : null}
      </PageHeader>

      <Panel className="mb-5">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">Filters</p>
            <p className="mt-0.5 text-xs text-[var(--color-muted)]">
              Narrow the registry before dispatch or maintenance decisions
            </p>
          </div>
          <p className="text-xs text-[var(--color-muted)]">
            {loading ? 'Loading…' : `${vehicles.length} vehicle${vehicles.length === 1 ? '' : 's'}`}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <label className="block text-xs text-[var(--color-muted)]">
            <span className="mb-1 block font-medium text-[var(--color-text)]">Vehicle Type</span>
            <span className="mb-1.5 block text-[11px] opacity-80">Van · Truck · Mini body class</span>
            <select className={inputClass} value={type} onChange={(e) => setType(e.target.value)}>
              <option>All</option>
              <option>Van</option>
              <option>Truck</option>
              <option>Mini</option>
            </select>
          </label>

          <label className="block text-xs text-[var(--color-muted)]">
            <span className="mb-1 block font-medium text-[var(--color-text)]">Status</span>
            <span className="mb-1.5 block text-[11px] opacity-80">Available · On Trip · In Shop · Retired</span>
            <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>All</option>
              <option value="Available">Available</option>
              <option value="OnTrip">On Trip</option>
              <option value="InShop">In Shop</option>
              <option value="Retired">Retired</option>
            </select>
          </label>

          <label className="block text-xs text-[var(--color-muted)]">
            <span className="mb-1 block font-medium text-[var(--color-text)]">Search registration</span>
            <span className="mb-1.5 block text-[11px] opacity-80">Match reg. no. or vehicle name/model</span>
            <input
              className={inputClass}
              placeholder="e.g. GJ01AB452 or VAN-05"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>
      </Panel>

      {error ? (
        <p className="mb-3 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-600">
          {error}
        </p>
      ) : null}

      {loading ? (
        <TableSkeleton rows={8} cols={7} />
      ) : (
      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-panel-2)] text-xs uppercase tracking-wide text-[var(--color-muted)]">
                <th className="px-4 py-3 font-semibold">Reg. No.</th>
                <th className="py-3 font-semibold">Name / Model</th>
                <th className="py-3 font-semibold">Type</th>
                <th className="py-3 font-semibold">Capacity</th>
                <th className="py-3 font-semibold">Odometer</th>
                <th className="py-3 font-semibold">Acq. Cost</th>
                <th className="py-3 pr-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-[var(--color-muted)]">
                    No vehicles match these filters.
                  </td>
                </tr>
              ) : null}
              {vehicles.map((v) => (
                <tr
                  key={v.id}
                  className="border-t border-[var(--color-border)] text-[var(--color-text)] transition-colors hover:bg-black/[0.03]"
                >
                  <td className="px-4 py-3 font-semibold text-[var(--color-text-strong)]">{v.regNo}</td>
                  <td className="py-3">{v.name}</td>
                  <td className="py-3">{v.type}</td>
                  <td className="py-3">
                    {v.capacityKg >= 1000 ? `${v.capacityKg / 1000} Ton` : `${v.capacityKg} kg`}
                  </td>
                  <td className="py-3 tabular-nums">{formatNumber(v.odometer)}</td>
                  <td className="py-3 tabular-nums">{formatNumber(v.acquisitionCost)}</td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={v.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      <p className="mt-3 rounded-lg border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 px-3 py-2 text-sm text-[var(--color-accent)]">
        Rule: Registration No. must be unique · Retired / In Shop vehicles are hidden from Trip Dispatcher
      </p>

      {showForm ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-[2px]">
          <form
            onSubmit={onSubmit}
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5 shadow-2xl"
          >
            <h3 className="mb-1 text-lg font-semibold text-[var(--color-text-strong)]">Add Vehicle</h3>
            <p className="mb-4 text-xs text-[var(--color-muted)]">
              Registration number must be unique across the fleet.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Field label="Reg. No.">
                <input
                  className={inputClass}
                  required
                  value={form.regNo}
                  onChange={(e) => setForm({ ...form, regNo: e.target.value })}
                />
              </Field>
              <Field label="Name / Model">
                <input
                  className={inputClass}
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Field>
              <Field label="Type">
                <select
                  className={inputClass}
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option>Van</option>
                  <option>Truck</option>
                  <option>Mini</option>
                </select>
              </Field>
              <Field label="Capacity (kg)">
                <input
                  type="number"
                  className={inputClass}
                  value={form.capacityKg}
                  onChange={(e) => setForm({ ...form, capacityKg: e.target.value })}
                />
              </Field>
              <Field label="Odometer">
                <input
                  type="number"
                  className={inputClass}
                  value={form.odometer}
                  onChange={(e) => setForm({ ...form, odometer: e.target.value })}
                />
              </Field>
              <Field label="Acquisition Cost">
                <input
                  type="number"
                  className={inputClass}
                  value={form.acquisitionCost}
                  onChange={(e) => setForm({ ...form, acquisitionCost: e.target.value })}
                />
              </Field>
              <Field label="Region">
                <input
                  className={inputClass}
                  value={form.region}
                  onChange={(e) => setForm({ ...form, region: e.target.value })}
                />
              </Field>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className={btnGhost} onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit" className={btnPrimary}>
                Save
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
