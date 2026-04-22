import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type {
  AuditEntry,
  DataCenter,
  DataCenterInput,
} from "@aliasist/api-client";
import { Panel, Pill } from "@aliasist/ui";
import { AdminTokenPill } from "../components/AdminTokenPill";
import { EntryForm } from "../components/EntryForm";
import { api, getAdminToken } from "../lib/api";
import { companyTypeLabel, formatMW, STATUS_LABEL, STATUS_TONE } from "../lib/format";

type Mode =
  | { kind: "idle" }
  | { kind: "creating" }
  | { kind: "editing"; dc: DataCenter };

export const DataSistAdmin = () => {
  const [unlocked, setUnlocked] = useState<boolean>(() => !!getAdminToken());
  const [centers, setCenters] = useState<DataCenter[] | null>(null);
  const [audit, setAudit] = useState<AuditEntry[] | null>(null);
  const [mode, setMode] = useState<Mode>({ kind: "idle" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, auditRes] = await Promise.all([
        api().listDataCenters({ limit: 1000 }),
        unlocked
          ? api()
              .listAudit(50)
              .catch(() => null)
          : Promise.resolve(null),
      ]);
      setCenters(list.items);
      setAudit(auditRes?.items ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [unlocked]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const flashOk = (msg: string) => {
    setFlash(msg);
    setTimeout(() => setFlash(null), 3500);
  };

  const handleCreate = async (input: DataCenterInput) => {
    const created = await api().createDataCenter(input);
    setMode({ kind: "idle" });
    flashOk(`Created ${created.slug}`);
    await refresh();
  };

  const handleUpdate = async (slug: string, input: DataCenterInput) => {
    const updated = await api().updateDataCenter(slug, input);
    setMode({ kind: "idle" });
    flashOk(`Updated ${updated.slug}`);
    await refresh();
  };

  const handleDelete = async (dc: DataCenter) => {
    const confirmed = window.confirm(
      `Delete ${dc.name} (${dc.slug})? This cannot be undone.`,
    );
    if (!confirmed) return;
    try {
      await api().deleteDataCenter(dc.slug);
      flashOk(`Deleted ${dc.slug}`);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-ufo-400/80">
            DataSist · admin
          </div>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink-50">
            Curate data centers
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-300">
            Create, edit, and retire entries in the curated catalog. Every
            mutation is written to <code className="font-mono">dc_audit_log</code>{" "}
            with a short fingerprint of the bearer token — no raw secrets
            logged.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AdminTokenPill onChange={setUnlocked} />
          <Link
            to="/data"
            className="rounded-md border border-ink-700 px-3 py-1.5 text-xs text-ink-300 transition hover:border-ink-500 hover:text-ink-100"
          >
            ← Back to map
          </Link>
        </div>
      </header>

      {!unlocked ? (
        <Panel eyebrow="Authentication required" title="Unlock to edit">
          <p className="text-sm text-ink-300">
            Paste a valid bearer token to unlock admin. The worker must have{" "}
            <code className="font-mono">ADMIN_TOKEN</code> set — otherwise every
            privileged request returns <code className="font-mono">503</code>.
            The token is stored in{" "}
            <code className="font-mono">sessionStorage</code> for this tab only.
          </p>
        </Panel>
      ) : null}

      {flash ? (
        <div className="rounded-md border border-ufo-700/60 bg-ufo-900/20 px-3 py-2 text-xs text-ufo-200">
          {flash}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-md border border-red-900/60 bg-red-950/40 px-3 py-2 text-xs text-red-300">
          {error}
        </div>
      ) : null}

      {unlocked && mode.kind === "idle" ? (
        <div>
          <button
            onClick={() => setMode({ kind: "creating" })}
            className="rounded-md bg-ufo-500 px-3 py-1.5 text-xs font-medium text-ink-950 transition hover:bg-ufo-400"
          >
            + New data center
          </button>
        </div>
      ) : null}

      {mode.kind === "creating" ? (
        <EntryForm
          submitLabel="Create"
          onSubmit={handleCreate}
          onCancel={() => setMode({ kind: "idle" })}
        />
      ) : null}
      {mode.kind === "editing" ? (
        <EntryForm
          initial={mode.dc}
          submitLabel="Save"
          onSubmit={(input) => handleUpdate(mode.dc.slug, input)}
          onCancel={() => setMode({ kind: "idle" })}
        />
      ) : null}

      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="font-display text-sm uppercase tracking-[0.2em] text-ink-300">
            Entries {centers ? `(${centers.length})` : ""}
          </h2>
          <button
            onClick={() => void refresh()}
            disabled={loading}
            className="text-[10px] uppercase tracking-[0.14em] text-ufo-400 transition hover:text-ufo-300 disabled:opacity-60"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
        {centers === null ? (
          <div className="rounded-xl border border-ink-700 bg-ink-900/60 p-5 text-xs text-ink-400">
            Loading…
          </div>
        ) : centers.length === 0 ? (
          <Panel eyebrow="Empty" title="No entries yet">
            <p className="text-sm text-ink-300">
              Use "New data center" above to seed the first one.
            </p>
          </Panel>
        ) : (
          <div className="overflow-hidden rounded-xl border border-ink-700">
            <ul className="divide-y divide-ink-800">
              {centers.map((dc) => (
                <li
                  key={dc.slug}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-ink-800/50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-medium text-ink-50">
                        {dc.name}
                      </span>
                      <Pill tone={STATUS_TONE[dc.status]}>
                        {STATUS_LABEL[dc.status]}
                      </Pill>
                    </div>
                    <div className="mt-0.5 truncate text-xs text-ink-400">
                      {dc.company} · {companyTypeLabel[dc.companyType]} ·{" "}
                      {dc.city}, {dc.state}
                      <span className="ml-2 font-mono text-ink-500">
                        {dc.slug}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 font-mono text-sm text-ink-100">
                    {formatMW(dc.capacityMW)}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => setMode({ kind: "editing", dc })}
                      disabled={!unlocked}
                      className="rounded-md border border-ink-700 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-ink-200 transition hover:border-ufo-500 hover:text-ufo-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(dc)}
                      disabled={!unlocked}
                      className="rounded-md border border-ink-700 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-ink-200 transition hover:border-red-500 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {unlocked ? (
        <section>
          <h2 className="mb-2 font-display text-sm uppercase tracking-[0.2em] text-ink-300">
            Audit log {audit ? `(latest ${audit.length})` : ""}
          </h2>
          {audit === null ? (
            <div className="rounded-xl border border-ink-700 bg-ink-900/60 p-5 text-xs text-ink-400">
              No audit data available.
            </div>
          ) : audit.length === 0 ? (
            <div className="rounded-xl border border-ink-700 bg-ink-900/60 p-5 text-xs text-ink-400">
              No mutations yet — create or edit an entry to populate the log.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-ink-700">
              <ul className="divide-y divide-ink-800 font-mono text-xs">
                {audit.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center gap-3 px-4 py-2 text-ink-300"
                  >
                    <span
                      className={`inline-block w-16 shrink-0 uppercase tracking-[0.14em] ${AUDIT_TONE[entry.action]}`}
                    >
                      {entry.action}
                    </span>
                    <span className="flex-1 truncate">{entry.slug}</span>
                    <span className="shrink-0 text-ink-500">
                      {entry.actor ?? "anon"}
                    </span>
                    <time className="shrink-0 text-ink-500" dateTime={entry.createdAt}>
                      {formatAuditTime(entry.createdAt)}
                    </time>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
};

const AUDIT_TONE: Record<AuditEntry["action"], string> = {
  create: "text-ufo-300",
  update: "text-amber-300",
  delete: "text-red-300",
};

const formatAuditTime = (iso: string): string => {
  try {
    const d = new Date(iso.replace(" ", "T") + "Z");
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};
