/** Shown while a lazy-loaded sist chunk downloads (route-level code splitting). */
export const SistRouteFallback = () => (
  <div
    className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4"
    role="status"
    aria-live="polite"
    aria-busy="true"
    aria-label="Loading application"
  >
    <div
      aria-hidden
      className="h-9 w-9 animate-spin rounded-full border-2 border-[color:var(--aliasist-border)] border-t-[color:var(--aliasist-accent)]"
    />
    <p className="text-sm text-[color:var(--aliasist-text-muted)]">Loading lab…</p>
  </div>
);
