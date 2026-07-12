import { useEffect, useState } from 'react';
import api from '../api/client';
import { API } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { PageHeader, Panel, Field, inputClass, btnPrimary } from '../components/ui';

const MODULES = ['fleet', 'drivers', 'trips', 'maintenance', 'fuel', 'analytics'];
const MODULE_LABELS = {
  fleet: 'FLEET',
  drivers: 'DRIVERS',
  trips: 'TRIPS',
  maintenance: 'MAINT',
  fuel: 'FUEL/EXP.',
  analytics: 'ANALYTICS',
};

function cell(level) {
  if (level === 'full') return '✓';
  if (level === 'view') return 'view';
  return '—';
}

export default function SettingsPage() {
  const { can } = useAuth();
  const [form, setForm] = useState({
    depotName: '',
    currency: '',
    distanceUnit: '',
  });
  const [matrix, setMatrix] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(API.settings)
      .then((res) => {
        const d = res.data.data;
        setForm({
          depotName: d.depotName,
          currency: d.currency,
          distanceUnit: d.distanceUnit,
        });
        setMatrix(d.rbacMatrix || {});
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load settings'));
  }, []);

  async function save(e) {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await api.patch(API.settings, form);
      setMessage('Settings saved');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  return (
    <div className="page-enter">
      <PageHeader title="Settings & RBAC" subtitle="Depot defaults · permission matrix" />
      {error ? <p className="mb-3 text-sm text-rose-400">{error}</p> : null}
      {message ? <p className="mb-3 text-sm text-emerald-400">{message}</p> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="General">
          <form onSubmit={save}>
            <Field label="Depot Name">
              <input
                className={inputClass}
                value={form.depotName}
                disabled={!can('settings', 'full')}
                onChange={(e) => setForm({ ...form, depotName: e.target.value })}
              />
            </Field>
            <Field label="Currency">
              <input
                className={inputClass}
                value={form.currency}
                disabled={!can('settings', 'full')}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
              />
            </Field>
            <Field label="Distance Unit">
              <input
                className={inputClass}
                value={form.distanceUnit}
                disabled={!can('settings', 'full')}
                onChange={(e) => setForm({ ...form, distanceUnit: e.target.value })}
              />
            </Field>
            {can('settings', 'full') ? (
              <button type="submit" className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500">
                Save changes
              </button>
            ) : null}
          </form>
        </Panel>

        <Panel title="Role-Based Access (RBAC)">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-zinc-500">
                <tr>
                  <th className="py-2">Role</th>
                  {MODULES.map((m) => (
                    <th key={m}>{MODULE_LABELS[m]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(matrix).map(([role, perms]) => (
                  <tr key={role} className="border-t border-[var(--color-border)]">
                    <td className="py-2 font-medium">{role.replaceAll('_', ' ')}</td>
                    {MODULES.map((m) => (
                      <td key={m} className="text-zinc-300">
                        {cell(perms[m])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-zinc-500">✓ = full · view = read-only · — = no access</p>
        </Panel>
      </div>
    </div>
  );
}
