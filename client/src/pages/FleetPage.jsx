import { useEffect, useState } from 'react';
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
} from '../components/ui';

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

export default function FleetPage() {
  const { can } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [type, setType] = useState('All');
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  async function load() {
    const res = await api.get(API.vehicles, { params: { type, status, search } });
    setVehicles(res.data.data || []);
  }

  useEffect(() => {
    load().catch((e) => setError(e.response?.data?.message || 'Failed to load'));
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
    <div>
      <PageHeader title="Vehicle Registry">
        {can('fleet', 'full') ? (
          <button type="button" className={btnPrimary} onClick={() => setShowForm(true)}>
            + Add Vehicle
          </button>
        ) : null}
      </PageHeader>

      <div className="mb-4 flex flex-wrap gap-3">
        <select className={`${inputClass} w-36`} value={type} onChange={(e) => setType(e.target.value)}>
          <option>All</option>
          <option>Van</option>
          <option>Truck</option>
          <option>Mini</option>
        </select>
        <select className={`${inputClass} w-36`} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>All</option>
          <option value="Available">Available</option>
          <option value="OnTrip">On Trip</option>
          <option value="InShop">In Shop</option>
          <option value="Retired">Retired</option>
        </select>
        <input
          className={`${inputClass} w-56`}
          placeholder="Search reg. no..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error ? <p className="mb-3 text-sm text-rose-400">{error}</p> : null}

      <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)]">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Reg. No.</th>
              <th>Name/Model</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Odometer</th>
              <th>Acq. Cost</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id} className="border-t border-[var(--color-border)]">
                <td className="px-4 py-3 font-medium">{v.regNo}</td>
                <td>{v.name}</td>
                <td>{v.type}</td>
                <td>{v.capacityKg >= 1000 ? `${v.capacityKg / 1000} Ton` : `${v.capacityKg} kg`}</td>
                <td>{formatNumber(v.odometer)}</td>
                <td>{formatNumber(v.acquisitionCost)}</td>
                <td>
                  <StatusBadge status={v.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-sm text-[var(--color-accent)]">
        Rule: Registration No. must be unique · Retired/In Shop vehicles are hidden from Trip Dispatcher
      </p>

      {showForm ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <form onSubmit={onSubmit} className="w-full max-w-lg rounded-xl border border-[var(--color-border)] bg-[#1a1a1a] p-5">
            <h3 className="mb-4 text-lg font-semibold">Add Vehicle</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <Field label="Reg. No.">
                <input className={inputClass} required value={form.regNo} onChange={(e) => setForm({ ...form, regNo: e.target.value })} />
              </Field>
              <Field label="Name/Model">
                <input className={inputClass} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="Type">
                <select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option>Van</option>
                  <option>Truck</option>
                  <option>Mini</option>
                </select>
              </Field>
              <Field label="Capacity (kg)">
                <input type="number" className={inputClass} value={form.capacityKg} onChange={(e) => setForm({ ...form, capacityKg: e.target.value })} />
              </Field>
              <Field label="Odometer">
                <input type="number" className={inputClass} value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} />
              </Field>
              <Field label="Acquisition Cost">
                <input type="number" className={inputClass} value={form.acquisitionCost} onChange={(e) => setForm({ ...form, acquisitionCost: e.target.value })} />
              </Field>
              <Field label="Region">
                <input className={inputClass} value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
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
