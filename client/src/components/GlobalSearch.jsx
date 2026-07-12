import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { API } from '../api/endpoints';
import { StatusBadge } from './ui';

export default function GlobalSearch() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ vehicles: [], drivers: [], trips: [] });
  const boxRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onDocClick(e) {
      if (!boxRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    if (!q.trim()) {
      setResults({ vehicles: [], drivers: [], trips: [] });
      return undefined;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(API.search, { params: { q: q.trim() } });
        setResults(res.data.data || { vehicles: [], drivers: [], trips: [] });
        setOpen(true);
      } catch {
        setResults({ vehicles: [], drivers: [], trips: [] });
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const total =
    (results.vehicles?.length || 0) + (results.drivers?.length || 0) + (results.trips?.length || 0);

  function go(path) {
    setOpen(false);
    setQ('');
    navigate(path);
  }

  return (
    <div ref={boxRef} className="relative w-full max-w-md">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => q.trim() && setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && results.vehicles?.[0]) go('/fleet');
          else if (e.key === 'Enter' && results.drivers?.[0]) go('/drivers');
          else if (e.key === 'Enter' && results.trips?.[0]) go('/trips');
        }}
        placeholder="Search vehicles, drivers, trips..."
        className="w-full rounded-full border border-[var(--color-border)] bg-[var(--color-input-bg)] px-4 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
      />

      {open && q.trim() ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] shadow-xl">
          {loading ? (
            <p className="px-4 py-3 text-sm text-[var(--color-muted)]">Searching...</p>
          ) : total === 0 ? (
            <p className="px-4 py-3 text-sm text-[var(--color-muted)]">No results for “{q}”</p>
          ) : (
            <>
              {results.vehicles?.length > 0 && (
                <section className="border-b border-[var(--color-border)] p-2">
                  <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                    Vehicles
                  </p>
                  {results.vehicles.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => go('/fleet')}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm hover:bg-black/5"
                    >
                      <span>
                        <strong>{v.name}</strong> · {v.regNo} · {v.region}
                      </span>
                      <StatusBadge status={v.status} />
                    </button>
                  ))}
                </section>
              )}
              {results.drivers?.length > 0 && (
                <section className="border-b border-[var(--color-border)] p-2">
                  <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                    Drivers
                  </p>
                  {results.drivers.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => go('/drivers')}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm hover:bg-black/5"
                    >
                      <span>
                        <strong>{d.name}</strong> · {d.licenseNo}
                      </span>
                      <StatusBadge status={d.status} />
                    </button>
                  ))}
                </section>
              )}
              {results.trips?.length > 0 && (
                <section className="p-2">
                  <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                    Trips
                  </p>
                  {results.trips.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => go('/trips')}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm hover:bg-black/5"
                    >
                      <span>
                        <strong>{t.tripCode}</strong> · {t.vehicle?.name} / {t.driver?.name}
                      </span>
                      <StatusBadge status={t.status} />
                    </button>
                  ))}
                </section>
              )}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
