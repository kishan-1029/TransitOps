import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { API } from '../api/endpoints';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: 'Hi — I am TransitOps Assistant. Ask about fleet, trips, licenses, fuel, ROI, or login.',
    },
  ]);
  const endRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  async function send(text) {
    const msg = (text || input).trim();
    if (!msg || busy) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: msg }]);
    setBusy(true);
    try {
      const res = await api.post(API.chat, { message: msg });
      const data = res.data.data;
      setMessages((m) => [
        ...m,
        { role: 'bot', text: data.reply, link: data.link, suggestions: data.suggestions },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'bot', text: 'Sorry — chat is unavailable right now. Try again in a moment.' },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-[60]">
      {open ? (
        <div className="mb-3 flex h-[420px] w-[340px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] shadow-2xl">
          <div className="flex items-center justify-between bg-[var(--color-accent)] px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">TransitOps Assistant</p>
              <p className="text-[11px] opacity-90">Ops help · inspired by Elly skills</p>
            </div>
            <button type="button" className="text-lg leading-none" onClick={() => setOpen(false)}>
              ×
            </button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${
                  m.role === 'user'
                    ? 'ml-auto bg-[var(--color-accent)] text-white'
                    : 'bg-[var(--color-panel-2)] text-[var(--color-text)]'
                }`}
              >
                <p>{m.text}</p>
                {m.link ? (
                  <button
                    type="button"
                    className="mt-1 text-xs font-medium text-[var(--color-accent)] underline"
                    onClick={() => {
                      setOpen(false);
                      navigate(m.link);
                    }}
                  >
                    Go to page →
                  </button>
                ) : null}
                {m.suggestions?.length ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {m.suggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className="rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[10px] text-[var(--color-muted)] hover:border-[var(--color-accent)]"
                        onClick={() => send(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <form
            className="flex gap-2 border-t border-[var(--color-border)] p-2"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about TransitOps..."
              className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2 text-sm text-[var(--color-text)] outline-none"
            />
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-[var(--color-accent)] px-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent)] text-sm font-bold text-white shadow-lg hover:bg-[var(--color-accent-hover)]"
        title="Open assistant"
      >
        Ask
      </button>
    </div>
  );
}
