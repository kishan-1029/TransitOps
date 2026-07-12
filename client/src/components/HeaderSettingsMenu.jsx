import { useEffect, useRef, useState } from 'react';
import { LogOut, Moon, Settings, Sun } from 'lucide-react';

export default function HeaderSettingsMenu({ theme, onToggleTheme, onLogout }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    function onDocClick(e) {
      if (!boxRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  function handleThemeToggle() {
    onToggleTheme();
    setOpen(false);
  }

  function handleLogout() {
    setOpen(false);
    onLogout();
  }

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Open settings menu"
        aria-expanded={open}
        aria-haspopup="menu"
        className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] transition hover:bg-black/5 hover:text-[var(--color-text)]"
      >
        <Settings className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 min-w-44 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] py-1 shadow-xl"
        >
          <button
            type="button"
            role="menuitem"
            onClick={handleThemeToggle}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-[var(--color-text)] transition hover:bg-black/5"
          >
            {isDark ? (
              <Sun className="h-4 w-4 shrink-0 text-[var(--color-muted)]" strokeWidth={2} aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4 shrink-0 text-[var(--color-muted)]" strokeWidth={2} aria-hidden="true" />
            )}
            {isDark ? 'Light mode' : 'Dark mode'}
          </button>
          <div className="mx-2 border-t border-[var(--color-border)]" />
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-rose-600 transition hover:bg-rose-500/10"
          >
            <LogOut className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}
