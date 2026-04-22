import { useEffect, useRef, useState } from "react";
import { getAdminToken, setAdminToken } from "../lib/api";

/**
 * Small LOCKED/UNLOCKED pill that doubles as the admin-token entry point.
 * Clicking it opens a modal to paste the bearer token (saved to
 * sessionStorage, cleared when the tab closes). Click again while
 * unlocked to sign out.
 */
export const AdminTokenPill = ({
  onChange,
}: {
  onChange?: (unlocked: boolean) => void;
}) => {
  const [token, setToken] = useState<string | null>(() => getAdminToken());
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sync = () => setToken(getAdminToken());
    window.addEventListener("datasist:admin-token-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("datasist:admin-token-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    onChange?.(!!token);
  }, [token, onChange]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const unlocked = !!token;

  const save = () => {
    const v = draft.trim();
    if (!v) return;
    setAdminToken(v);
    setDraft("");
    setOpen(false);
  };

  const signOut = () => {
    setAdminToken(null);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => (unlocked ? signOut() : setOpen(true))}
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] transition ${
          unlocked
            ? "border-ufo-500/60 bg-ufo-900/30 text-ufo-200 hover:border-ufo-400"
            : "border-ink-700 bg-ink-950/60 text-ink-300 hover:border-ink-500"
        }`}
        aria-label={unlocked ? "Sign out of admin" : "Unlock admin"}
        title={unlocked ? "Click to sign out" : "Click to enter admin token"}
      >
        <span
          className={`inline-block h-1.5 w-1.5 rounded-full ${
            unlocked ? "bg-ufo-400" : "bg-ink-600"
          }`}
          aria-hidden
        />
        {unlocked ? "Unlocked" : "Locked"}
      </button>

      {open && !unlocked ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/80 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Unlock admin"
        >
          <div
            className="w-full max-w-md rounded-xl border border-ink-700 bg-ink-900 p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-[10px] uppercase tracking-[0.2em] text-ufo-400">
              DataSist admin
            </div>
            <h3 className="mt-1 font-display text-xl text-ink-50">
              Enter bearer token
            </h3>
            <p className="mt-2 text-xs text-ink-300">
              Stored in <code className="font-mono">sessionStorage</code> for
              this tab only. Closes cleanly when the tab is closed. Worker
              must have <code className="font-mono">ADMIN_TOKEN</code> set.
            </p>
            <input
              ref={inputRef}
              type="password"
              autoComplete="off"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
                if (e.key === "Escape") setOpen(false);
              }}
              placeholder="Bearer token"
              className="mt-4 w-full rounded-md border border-ink-700 bg-ink-950 px-3 py-2 font-mono text-sm text-ink-100 placeholder:text-ink-500 focus:border-ufo-500 focus:outline-none focus:ring-1 focus:ring-ufo-500/40"
            />
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded-md border border-ink-700 px-3 py-1.5 text-xs text-ink-300 transition hover:border-ink-500 hover:text-ink-100"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={!draft.trim()}
                className="rounded-md bg-ufo-500 px-3 py-1.5 text-xs font-medium text-ink-950 transition hover:bg-ufo-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
