import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { API } from '../api/endpoints';
import { StatusBadge } from './ui';

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 300;
const EMPTY_RESULTS = { vehicles: [], drivers: [], trips: [] };

export default function GlobalSearch() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(EMPTY_RESULTS);
  const boxRef = useRef(null);
  const navigate = useNavigate();

  const trimmedQ = q.trim();
  const canSearch = trimmedQ.length >= MIN_QUERY_LENGTH;

  useEffect(() => {
    function onDocClick(e) {
      if (!boxRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    if (!trimmedQ) {
      setResults(EMPTY_RESULTS);
      setLoading(false);
      return undefined;
    }

    if (!canSearch) {
      setResults(EMPTY_RESULTS);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await api.get(API.search, { params: { q: trimmedQ } });
        setResults(res.data.data || EMPTY_RESULTS);
        setOpen(true);
      } catch {
        setResults(EMPTY_RESULTS);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(t);
  }, [trimmedQ, canSearch]);

  const total =
    (results.vehicles?.length || 0) + (results.drivers?.length || 0) + (results.trips?.length || 0);

  function clearSearch() {
    setQ('');
    setOpen(false);
    setLoading(false);
    setResults(EMPTY_RESULTS);
  }

  function go(path) {
    clearSearch();
    navigate(path);
  }

  function handleFocus() {
    if (trimmedQ) setOpen(true);
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      clearSearch();
      return;
    }
    if (e.key !== 'Enter' || !canSearch || loading) return;
    if (results.vehicles?.[0]) go('/fleet');
    else if (results.drivers?.[0]) go('/drivers');
    else if (results.trips?.[0]) go('/trips');
  }

  const showDropdown = open && trimmedQ.length > 0;

  return (
    <div ref={boxRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]"
          strokeWidth={2}
          aria-hidden="true"
        />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            if (e.target.value.trim()) setOpen(true);
          }}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder="Search vehicles, drivers, trips..."
          aria-label="Search vehicles, drivers, and trips"
          className="w-full rounded-full border border-[var(--color-border)] bg-[var(--color-input-bg)] py-2 pl-10 pr-10 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
        />
        {q.length > 0 && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-[var(--color-muted)] transition hover:bg-black/5 hover:text-[var(--color-text)]"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
          </button>
        )}
      </div>

      {showDropdown ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] shadow-xl">
          {!canSearch ? (
            <p className="px-4 py-3 text-sm text-[var(--color-muted)]">
              Type at least {MIN_QUERY_LENGTH} characters to search
            </p>
          ) : loading ? (
            <p className="px-4 py-3 text-sm text-[var(--color-muted)]">Searching...</p>
          ) : total === 0 ? (
            <p className="px-4 py-3 text-sm text-[var(--color-muted)]">No results for “{trimmedQ}”</p>
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
