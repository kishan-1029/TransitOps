import { useEffect, useMemo, useState } from 'react';
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
  btnGhost,
} from '../components/ui';
import { RouteFallback } from '../components/Skeleton';

const emptyForm = {
  source: 'Gandhinagar Depot',
  destination: 'Ahmedabad Hub',
  vehicleId: '',
  driverId: '',
  cargoWeight: 450,
  plannedDistance: 38,
};

export default function TripsPage() {
  const { can } = useAuth();
  const [trips, setTrips] = useState([]);
  const [options, setOptions] = useState({ vehicles: [], drivers: [] });
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [completeModal, setCompleteModal] = useState(null);
  const [completeForm, setCompleteForm] = useState({ finalOdometer: '', fuelConsumed: '', fuelCost: '' });

  const selectedVehicle = useMemo(
    () => options.vehicles.find((v) => v.id === form.vehicleId),
    [options.vehicles, form.vehicleId]
  );

  const capacityError = useMemo(() => {
    if (!selectedVehicle) return null;
    const cargo = Number(form.cargoWeight);
    if (cargo > selectedVehicle.capacityKg) {
      const over = cargo - selectedVehicle.capacityKg;
      return `Capacity exceeded by ${over} kg — dispatch blocked. Vehicle Capacity: ${selectedVehicle.capacityKg} kg vs Cargo Weight: ${cargo} kg.`;
    }
    return null;
  }, [selectedVehicle, form.cargoWeight]);

  async function load() {
    const [tripsRes, optRes] = await Promise.all([
      api.get(API.trips),
      can('trips', 'full') ? api.get(API.dispatchOptions) : Promise.resolve({ data: { data: { vehicles: [], drivers: [] } } }),
    ]);
    setTrips(tripsRes.data.data || []);
    setOptions(optRes.data.data || { vehicles: [], drivers: [] });
  }

  useEffect(() => {
    setLoading(true);
    load()
      .catch((e) => setError(e.response?.data?.message || 'Failed to load trips'))
      .finally(() => setLoading(false));
  }, []);

  async function createTrip(e) {
    e.preventDefault();
    if (capacityError) {
      setError(capacityError);
      return;
    }
    setError('');
    try {
      await api.post(API.trips, form);
      setForm({ ...emptyForm, vehicleId: '', driverId: '' });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  async function dispatch(id) {
    setError('');
    try {
      await api.post(`${API.trips}/${id}/dispatch`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  async function cancel(id) {
    setError('');
    try {
      await api.post(`${API.trips}/${id}/cancel`, { reason: 'Cancelled by dispatcher' });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  async function complete(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post(`${API.trips}/${completeModal.id}/complete`, completeForm);
      setCompleteModal(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  const lifecycle = ['Draft', 'Dispatched', 'Completed', 'Cancelled'];

  if (loading) return <RouteFallback />;

  return (
    <div className="page-enter">
      <PageHeader title="Trip Dispatcher" subtitle="Create · dispatch · complete · cancel with capacity rules" />
      {error ? (
        <div className="mb-4 rounded-lg border border-dashed border-rose-500 bg-rose-950/30 px-3 py-2 text-sm text-rose-300">
          ✕ {error}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {can('trips', 'full') ? (
          <Panel title="Create Trip">
            <div className="mb-4 flex flex-wrap gap-2">
              {lifecycle.map((step) => (
                <span
                  key={step}
                  className={`rounded-full border px-2.5 py-0.5 text-xs ${
                    step === 'Draft'
                      ? 'border-emerald-500 text-emerald-400'
                      : step === 'Dispatched'
                        ? 'border-sky-500 text-sky-400'
                        : 'border-zinc-600 text-zinc-400'
                  }`}
                >
                  {step}
                </span>
              ))}
            </div>

            <form onSubmit={createTrip}>
              <Field label="Source">
                <input className={inputClass} required value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
              </Field>
              <Field label="Destination">
                <input className={inputClass} required value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} />
              </Field>
              <Field label="Vehicle (Available Only)">
                <select className={inputClass} required value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}>
                  <option value="">Select vehicle</option>
                  {options.vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} — {v.capacityKg} kg capacity
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Driver (Available Only)">
                <select className={inputClass} required value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })}>
                  <option value="">Select driver</option>
                  {options.drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Cargo Weight (kg)">
                  <input type="number" className={inputClass} value={form.cargoWeight} onChange={(e) => setForm({ ...form, cargoWeight: e.target.value })} />
                </Field>
                <Field label="Planned Distance (km)">
                  <input type="number" className={inputClass} value={form.plannedDistance} onChange={(e) => setForm({ ...form, plannedDistance: e.target.value })} />
                </Field>
              </div>

              {capacityError ? (
                <div className="mb-3 rounded-lg border border-rose-500 bg-rose-950/40 px-3 py-2 text-sm text-rose-300">
                  ✕ {capacityError}
                </div>
              ) : null}

              <div className="flex gap-2">
                <button type="submit" className={btnPrimary} disabled={!!capacityError}>
                  Create Draft
                </button>
                <button type="button" className="text-sm text-rose-400" onClick={() => setForm(emptyForm)}>
                  Cancel
                </button>
              </div>
            </form>
          </Panel>
        ) : (
          <Panel title="Create Trip">
            <p className="text-sm text-zinc-400">View-only access for your role.</p>
          </Panel>
        )}

        <Panel title="Live Board">
          <div className="space-y-3">
            {trips.map((t) => (
              <div key={t.id} className="rounded-lg border border-[var(--color-border)] bg-[#121212] p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="font-semibold">{t.tripCode}</span>
                  <StatusBadge status={t.status} />
                </div>
                <p className="text-sm text-zinc-300">
                  {t.source} → {t.destination}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {t.vehicle?.name} / {t.driver?.name}
                  {t.etaMinutes != null && t.status === 'Dispatched' ? ` · ${t.etaMinutes} min` : ''}
                  {t.cancelReason ? ` · ${t.cancelReason}` : ''}
                </p>
                {can('trips', 'full') ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {t.status === 'Draft' ? (
                      <button type="button" className={btnPrimary} onClick={() => dispatch(t.id)} disabled={t.cargoWeight > (t.vehicle?.capacityKg || 0)}>
                        Dispatch
                      </button>
                    ) : null}
                    {t.status === 'Dispatched' ? (
                      <button
                        type="button"
                        className={btnPrimary}
                        onClick={() => {
                          setCompleteModal(t);
                          setCompleteForm({
                            finalOdometer: (t.vehicle?.odometer || 0) + Math.round(t.plannedDistance),
                            fuelConsumed: Math.max(1, (t.plannedDistance / 8).toFixed(1)),
                            fuelCost: '',
                          });
                        }}
                      >
                        Complete
                      </button>
                    ) : null}
                    {t.status === 'Draft' || t.status === 'Dispatched' ? (
                      <button type="button" className="text-sm text-rose-400" onClick={() => cancel(t.id)}>
                        Cancel
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            On Complete: odometer → fuel log → expenses → Vehicle & Driver Available
          </p>
        </Panel>
      </div>

      {completeModal ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <form onSubmit={complete} className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[#1a1a1a] p-5 shadow-2xl">
            <h3 className="mb-3 text-lg font-semibold">Complete {completeModal.tripCode}</h3>
            <Field label="Final Odometer">
              <input type="number" className={inputClass} required value={completeForm.finalOdometer} onChange={(e) => setCompleteForm({ ...completeForm, finalOdometer: e.target.value })} />
            </Field>
            <Field label="Fuel Consumed (L)">
              <input type="number" step="0.1" className={inputClass} required value={completeForm.fuelConsumed} onChange={(e) => setCompleteForm({ ...completeForm, fuelConsumed: e.target.value })} />
            </Field>
            <Field label="Fuel Cost (optional)">
              <input type="number" className={inputClass} value={completeForm.fuelCost} onChange={(e) => setCompleteForm({ ...completeForm, fuelCost: e.target.value })} />
            </Field>
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" className={btnGhost} onClick={() => setCompleteModal(null)}>
                Close
              </button>
              <button type="submit" className={btnPrimary}>
                Complete Trip
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
