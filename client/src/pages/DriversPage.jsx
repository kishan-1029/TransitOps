import { useEffect, useMemo, useState } from 'react';
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
  maskPhone,
  formatDate,
} from '../components/ui';

const emptyForm = {
  name: '',
  licenseNo: '',
  licenseCategory: 'LMV',
  licenseExpiry: '2027-12-31',
  contact: '',
  safetyScore: 85,
  tripCompletion: 90,
  status: 'Available',
};

function daysLeft(expiry) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(expiry);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d - today) / 86400000);
}

function band(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Watch';
  return 'Critical';
}

export default function DriversPage() {
  const { can } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [filter, setFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  async function load() {
    const res = await api.get(API.drivers);
    setDrivers(res.data.data || []);
  }

  useEffect(() => {
    load().catch((e) => setError(e.response?.data?.message || 'Failed to load'));
  }, []);

  const filtered = useMemo(() => {
    return drivers.filter((d) => {
      const days = daysLeft(d.licenseExpiry);
      if (filter === 'Expired') return days < 0;
      if (filter === 'Expiring') return days >= 0 && days <= 30;
      if (filter === 'LowSafety') return d.safetyScore < 75;
      if (filter === 'Suspended') return d.status === 'Suspended';
      return true;
    });
  }, [drivers, filter]);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post(API.drivers, form);
      setShowForm(false);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  async function saveEdit(e) {
    e.preventDefault();
    setError('');
    try {
      await api.patch(`${API.drivers}/${editRow.id}`, {
        safetyScore: Number(editRow.safetyScore),
        status: editRow.status,
        licenseExpiry: editRow.licenseExpiry?.slice?.(0, 10) || editRow.licenseExpiry,
      });
      setEditRow(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  return (
    <div>
      <PageHeader
        title="Drivers & Safety Profiles"
        subtitle="License tracking · safety scores · compliance filters"
      >
        {can('drivers', 'full') ? (
          <button type="button" className={btnPrimary} onClick={() => setShowForm(true)}>
            + Add Driver
          </button>
        ) : null}
      </PageHeader>

      <div className="mb-4 flex flex-wrap gap-2">
        {[
          ['All', 'All'],
          ['Expired', 'Expired licenses'],
          ['Expiring', 'Expiring ≤30d'],
          ['LowSafety', 'Safety < 75'],
          ['Suspended', 'Suspended'],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-full border px-3 py-1 text-xs ${
              filter === key
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-text-strong)]'
                : 'border-[var(--color-border)] text-[var(--color-muted)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? <p className="mb-3 text-sm text-rose-500">{error}</p> : null}

      <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)]">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-[var(--color-muted)]">
            <tr>
              <th className="px-4 py-3">Driver</th>
              <th>License No</th>
              <th>Category</th>
              <th>Expiry / Track</th>
              <th>Contact</th>
              <th>Trip Compl.</th>
              <th>Safety Score</th>
              <th>Status</th>
              {can('drivers', 'full') ? <th /> : null}
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => {
              const days = daysLeft(d.licenseExpiry);
              const expired = days < 0;
              const expiring = days >= 0 && days <= 30;
              return (
                <tr key={d.id} className="border-t border-[var(--color-border)]">
                  <td className="px-4 py-3 font-medium">{d.name}</td>
                  <td>{d.licenseNo}</td>
                  <td>{d.licenseCategory}</td>
                  <td>
                    <div className={expired ? 'font-semibold text-rose-500' : expiring ? 'text-amber-600' : ''}>
                      {formatDate(d.licenseExpiry)}
                      {expired ? ' EXPIRED' : expiring ? ` · ${days}d left` : ` · ${days}d`}
                    </div>
                  </td>
                  <td>{maskPhone(d.contact)}</td>
                  <td>{d.tripCompletion}%</td>
                  <td>
                    <span className={d.safetyScore < 75 ? 'font-semibold text-orange-600' : ''}>
                      {d.safetyScore}
                    </span>
                    <span className="ml-1 text-xs text-[var(--color-muted)]">{band(d.safetyScore)}</span>
                  </td>
                  <td>
                    <StatusBadge status={d.status} />
                  </td>
                  {can('drivers', 'full') ? (
                    <td>
                      <button
                        type="button"
                        className="text-xs text-sky-500"
                        onClick={() =>
                          setEditRow({
                            ...d,
                            licenseExpiry: new Date(d.licenseExpiry).toISOString().slice(0, 10),
                          })
                        }
                      >
                        Edit score
                      </button>
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <span className="text-[var(--color-muted)]">STATUS LEGEND:</span>
        <StatusBadge status="Available" />
        <StatusBadge status="OnTrip" />
        <StatusBadge status="OffDuty" />
        <StatusBadge status="Suspended" />
      </div>
      <p className="mt-2 text-sm text-[var(--color-accent)]">
        Rule: Expired license or Suspended status → blocked from trip assignment.
      </p>

      {showForm ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <form onSubmit={onSubmit} className="w-full max-w-lg rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
            <h3 className="mb-4 text-lg font-semibold text-[var(--color-text-strong)]">Add Driver</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <Field label="Name">
                <input className={inputClass} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="License No">
                <input className={inputClass} required value={form.licenseNo} onChange={(e) => setForm({ ...form, licenseNo: e.target.value })} />
              </Field>
              <Field label="Category">
                <select className={inputClass} value={form.licenseCategory} onChange={(e) => setForm({ ...form, licenseCategory: e.target.value })}>
                  <option>LMV</option>
                  <option>HMV</option>
                </select>
              </Field>
              <Field label="Expiry">
                <input type="date" className={inputClass} value={form.licenseExpiry} onChange={(e) => setForm({ ...form, licenseExpiry: e.target.value })} />
              </Field>
              <Field label="Contact">
                <input className={inputClass} required value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
              </Field>
              <Field label="Safety Score">
                <input type="number" min="0" max="100" className={inputClass} value={form.safetyScore} onChange={(e) => setForm({ ...form, safetyScore: e.target.value })} />
              </Field>
              <Field label="Status">
                <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option>Available</option>
                  <option>OffDuty</option>
                  <option>Suspended</option>
                </select>
              </Field>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className={btnGhost} onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className={btnPrimary}>Save</button>
            </div>
          </form>
        </div>
      ) : null}

      {editRow ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <form onSubmit={saveEdit} className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
            <h3 className="mb-3 text-lg font-semibold">Update {editRow.name}</h3>
            <Field label="Safety Score (0–100)">
              <input
                type="number"
                min="0"
                max="100"
                className={inputClass}
                value={editRow.safetyScore}
                onChange={(e) => setEditRow({ ...editRow, safetyScore: e.target.value })}
              />
            </Field>
            <Field label="License Expiry">
              <input
                type="date"
                className={inputClass}
                value={editRow.licenseExpiry}
                onChange={(e) => setEditRow({ ...editRow, licenseExpiry: e.target.value })}
              />
            </Field>
            <Field label="Status">
              <select className={inputClass} value={editRow.status} onChange={(e) => setEditRow({ ...editRow, status: e.target.value })}>
                <option>Available</option>
                <option>OnTrip</option>
                <option>OffDuty</option>
                <option>Suspended</option>
              </select>
            </Field>
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" className={btnGhost} onClick={() => setEditRow(null)}>Close</button>
              <button type="submit" className={btnPrimary}>Save</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
