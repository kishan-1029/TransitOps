import { useEffect, useState } from 'react';
import api from '../api/client';
import { API } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import {
  PageHeader,
  Panel,
  Field,
  inputClass,
  btnPrimary,
  btnGhost,
  formatNumber,
  StatusBadge,
  Pagination,
} from '../components/ui';
import { RouteFallback } from '../components/Skeleton';

export default function FuelPage() {
  const { can } = useAuth();
  const [fuelLogs, setFuelLogs] = useState([]);
  const [fuelPagination, setFuelPagination] = useState(null);
  const [fuelPage, setFuelPage] = useState(1);
  const [fuelSortBy, setFuelSortBy] = useState('date');
  const [fuelSortOrder, setFuelSortOrder] = useState('desc');

  const [expenses, setExpenses] = useState([]);
  const [expPagination, setExpPagination] = useState(null);
  const [expPage, setExpPage] = useState(1);
  const [expSortBy, setExpSortBy] = useState('createdAt');
  const [expSortOrder, setExpSortOrder] = useState('desc');

  const [cost, setCost] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [showFuel, setShowFuel] = useState(false);
  const [showExpense, setShowExpense] = useState(false);
  const [fuelForm, setFuelForm] = useState({ vehicleId: '', liters: 40, cost: 3000, date: new Date().toISOString().slice(0, 10) });
  const [expenseForm, setExpenseForm] = useState({ vehicleId: '', tripId: '', toll: 0, other: 0, maintenanceLinked: 0 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadStatic() {
    const [c, v] = await Promise.all([
      api.get(API.operationalCost),
      api.get(API.vehicles),
    ]);
    setCost(c.data.data);
    setVehicles(v.data.data || []);
    if (can('trips', 'view')) {
      try {
        const t = await api.get(API.trips);
        setTrips(t.data.data || []);
      } catch {
        setTrips([]);
      }
    }
  }

  async function loadFuel() {
    const res = await api.get(API.fuelLogs, {
      params: {
        page: fuelPage,
        limit: 5,
        sortBy: fuelSortBy,
        sortOrder: fuelSortOrder,
      },
    });
    if (res.data.data && res.data.data.items) {
      setFuelLogs(res.data.data.items);
      setFuelPagination(res.data.data.pagination);
    } else {
      setFuelLogs(res.data.data || []);
      setFuelPagination(null);
    }
  }

  async function loadExpenses() {
    const res = await api.get(API.expenses, {
      params: {
        page: expPage,
        limit: 5,
        sortBy: expSortBy,
        sortOrder: expSortOrder,
      },
    });
    if (res.data.data && res.data.data.items) {
      setExpenses(res.data.data.items);
      setExpPagination(res.data.data.pagination);
    } else {
      setExpenses(res.data.data || []);
      setExpPagination(null);
    }
  }

  async function refresh() {
    await Promise.all([loadStatic(), loadFuel(), loadExpenses()]);
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([loadStatic(), loadFuel(), loadExpenses()])
      .catch((err) => setError(err.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadFuel().catch((err) => setError(err.response?.data?.message || 'Failed to load fuel'));
  }, [fuelPage, fuelSortBy, fuelSortOrder]);

  useEffect(() => {
    loadExpenses().catch((err) => setError(err.response?.data?.message || 'Failed to load expenses'));
  }, [expPage, expSortBy, expSortOrder]);

  async function saveFuel(ev) {
    ev.preventDefault();
    try {
      await api.post(API.fuelLogs, fuelForm);
      setShowFuel(false);
      await refresh();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  async function saveExpense(ev) {
    ev.preventDefault();
    try {
      await api.post(API.expenses, {
        ...expenseForm,
        tripId: expenseForm.tripId || null,
      });
      setShowExpense(false);
      await refresh();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  const toggleFuelSort = (field) => {
    if (fuelSortBy === field) {
      setFuelSortOrder(fuelSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setFuelSortBy(field);
      setFuelSortOrder('asc');
    }
    setFuelPage(1);
  };

  const getFuelSortIcon = (field) => {
    if (fuelSortBy !== field) return <span className="opacity-30">⇅</span>;
    return fuelSortOrder === 'asc' ? '↑' : '↓';
  };

  const toggleExpSort = (field) => {
    if (expSortBy === field) {
      setExpSortOrder(expSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setExpSortBy(field);
      setExpSortOrder('asc');
    }
    setExpPage(1);
  };

  const getExpSortIcon = (field) => {
    if (expSortBy !== field) return <span className="opacity-30">⇅</span>;
    return expSortOrder === 'asc' ? '↑' : '↓';
  };

  if (loading) return <RouteFallback />;

  return (
    <div className="page-enter">
      <PageHeader title="Fuel & Expense Management" subtitle="Liters · tolls · ops cost snapshot">
        {can('fuel', 'full') ? (
          <>
            <button type="button" className={btnPrimary} onClick={() => setShowFuel(true)}>
              + Log Fuel
            </button>
            <button type="button" className={btnPrimary} onClick={() => setShowExpense(true)}>
              + Add Expense
            </button>
          </>
        ) : null}
      </PageHeader>

      {error ? <p className="mb-3 text-sm text-rose-400">{error}</p> : null}

      <Panel title="Fuel Logs" className="mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[500px]">
          <thead className="text-xs uppercase text-zinc-500">
            <tr>
              <th className="py-2 font-semibold cursor-pointer select-none hover:text-[var(--color-text)] transition-colors" onClick={() => toggleFuelSort('vehicle.name')}>
                <span className="flex items-center gap-1">Vehicle {getFuelSortIcon('vehicle.name')}</span>
              </th>
              <th className="font-semibold cursor-pointer select-none hover:text-[var(--color-text)] transition-colors" onClick={() => toggleFuelSort('date')}>
                <span className="flex items-center gap-1">Date {getFuelSortIcon('date')}</span>
              </th>
              <th className="font-semibold cursor-pointer select-none hover:text-[var(--color-text)] transition-colors" onClick={() => toggleFuelSort('liters')}>
                <span className="flex items-center gap-1">Liters {getFuelSortIcon('liters')}</span>
              </th>
              <th className="font-semibold cursor-pointer select-none hover:text-[var(--color-text)] transition-colors" onClick={() => toggleFuelSort('cost')}>
                <span className="flex items-center gap-1">Fuel Cost {getFuelSortIcon('cost')}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {fuelLogs.map((l) => (
              <tr key={l.id} className="border-t border-[var(--color-border)]">
                <td className="py-2">{l.vehicle?.name}</td>
                <td>{new Date(l.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                <td>{l.liters} L</td>
                <td>{formatNumber(l.cost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Panel>

      <Panel title="Other Expenses (Toll / Misc)" className="mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[600px]">
          <thead className="text-xs uppercase text-zinc-500">
            <tr>
              <th className="py-2 font-semibold cursor-pointer select-none hover:text-[var(--color-text)] transition-colors" onClick={() => toggleExpSort('trip.tripCode')}>
                <span className="flex items-center gap-1">Trip {getExpSortIcon('trip.tripCode')}</span>
              </th>
              <th className="font-semibold cursor-pointer select-none hover:text-[var(--color-text)] transition-colors" onClick={() => toggleExpSort('vehicle.name')}>
                <span className="flex items-center gap-1">Vehicle {getExpSortIcon('vehicle.name')}</span>
              </th>
              <th className="font-semibold cursor-pointer select-none hover:text-[var(--color-text)] transition-colors" onClick={() => toggleExpSort('toll')}>
                <span className="flex items-center gap-1">Toll {getExpSortIcon('toll')}</span>
              </th>
              <th className="font-semibold cursor-pointer select-none hover:text-[var(--color-text)] transition-colors" onClick={() => toggleExpSort('other')}>
                <span className="flex items-center gap-1">Other {getExpSortIcon('other')}</span>
              </th>
              <th className="font-semibold cursor-pointer select-none hover:text-[var(--color-text)] transition-colors" onClick={() => toggleExpSort('maintenanceLinked')}>
                <span className="flex items-center gap-1">Maint. (Linked) {getExpSortIcon('maintenanceLinked')}</span>
              </th>
              <th className="font-semibold cursor-pointer select-none hover:text-[var(--color-text)] transition-colors" onClick={() => toggleExpSort('toll')}>
                <span className="flex items-center gap-1">Total {getExpSortIcon('toll')}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id} className="border-t border-[var(--color-border)]">
                <td className="py-2">{e.trip?.tripCode || '—'}</td>
                <td>{e.vehicle?.name}</td>
                <td>{formatNumber(e.toll)}</td>
                <td>{formatNumber(e.other)}</td>
                <td>{formatNumber(e.maintenanceLinked)}</td>
                <td>
                  <StatusBadge status="Completed" /> {formatNumber(e.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Panel>

      <div className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3">
        <span className="text-sm uppercase tracking-wide text-zinc-400">
          Total Operational Cost (Auto) = Fuel + Maint
        </span>
        <span className="text-2xl font-semibold text-[var(--color-accent)]">
          {formatNumber(cost?.totalOperationalCost || 0)}
        </span>
      </div>

      {showFuel ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <form onSubmit={saveFuel} className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[#1a1a1a] p-5 shadow-2xl">
            <h3 className="mb-3 text-lg font-semibold">Log Fuel</h3>
            <Field label="Vehicle">
              <select className={inputClass} required value={fuelForm.vehicleId} onChange={(e) => setFuelForm({ ...fuelForm, vehicleId: e.target.value })}>
                <option value="">Select</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Liters">
              <input type="number" className={inputClass} value={fuelForm.liters} onChange={(e) => setFuelForm({ ...fuelForm, liters: e.target.value })} />
            </Field>
            <Field label="Cost">
              <input type="number" className={inputClass} value={fuelForm.cost} onChange={(e) => setFuelForm({ ...fuelForm, cost: e.target.value })} />
            </Field>
            <Field label="Date">
              <input type="date" className={inputClass} value={fuelForm.date} onChange={(e) => setFuelForm({ ...fuelForm, date: e.target.value })} />
            </Field>
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" className={btnGhost} onClick={() => setShowFuel(false)}>Cancel</button>
              <button type="submit" className={btnPrimary}>Save</button>
            </div>
          </form>
        </div>
      ) : null}

      {showExpense ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <form onSubmit={saveExpense} className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[#1a1a1a] p-5 shadow-2xl">
            <h3 className="mb-3 text-lg font-semibold">Add Expense</h3>
            <Field label="Vehicle">
              <select className={inputClass} required value={expenseForm.vehicleId} onChange={(e) => setExpenseForm({ ...expenseForm, vehicleId: e.target.value })}>
                <option value="">Select</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Trip (optional)">
              <select className={inputClass} value={expenseForm.tripId} onChange={(e) => setExpenseForm({ ...expenseForm, tripId: e.target.value })}>
                <option value="">None</option>
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>{t.tripCode}</option>
                ))}
              </select>
            </Field>
            <Field label="Toll">
              <input type="number" className={inputClass} value={expenseForm.toll} onChange={(e) => setExpenseForm({ ...expenseForm, toll: e.target.value })} />
            </Field>
            <Field label="Other">
              <input type="number" className={inputClass} value={expenseForm.other} onChange={(e) => setExpenseForm({ ...expenseForm, other: e.target.value })} />
            </Field>
            <Field label="Maint. Linked">
              <input type="number" className={inputClass} value={expenseForm.maintenanceLinked} onChange={(e) => setExpenseForm({ ...expenseForm, maintenanceLinked: e.target.value })} />
            </Field>
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" className={btnGhost} onClick={() => setShowExpense(false)}>Cancel</button>
              <button type="submit" className={btnPrimary}>Save</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
