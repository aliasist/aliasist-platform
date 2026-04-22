/**
 * Minimal D1Database shim backed by better-sqlite3. Adequate for unit-testing
 * route handlers against real SQL without booting workerd. Only the subset of
 * the D1 API our routes use is implemented.
 */
import Database from "better-sqlite3";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

type SqliteValue = string | number | null;

interface D1ShimRunResult {
  success: true;
  meta: { changes: number; last_row_id: number };
  results?: unknown[];
}

interface D1ShimAllResult<T> {
  success: true;
  meta: { changes: number; last_row_id: number };
  results: T[];
}

interface D1ShimPrepared {
  bind: (...binds: SqliteValue[]) => D1ShimPrepared;
  run: () => Promise<D1ShimRunResult>;
  first: <T>() => Promise<T | null>;
  all: <T>() => Promise<D1ShimAllResult<T>>;
}

const NO_META = { changes: 0, last_row_id: 0 } as const;

const buildPrepared = (
  db: Database.Database,
  sql: string,
  binds: SqliteValue[],
): D1ShimPrepared => ({
  bind: (...moreBinds) => buildPrepared(db, sql, [...binds, ...moreBinds]),
  run: async () => {
    const stmt = db.prepare(sql);
    const result = stmt.run(...binds);
    return {
      success: true,
      meta: {
        changes: result.changes ?? 0,
        last_row_id: Number(result.lastInsertRowid ?? 0),
      },
    };
  },
  first: async <T>() => {
    const stmt = db.prepare(sql);
    const row = stmt.get(...binds) as T | undefined;
    return row ?? null;
  },
  all: async <T>() => {
    const stmt = db.prepare(sql);
    const results = stmt.all(...binds) as T[];
    return { success: true, meta: { ...NO_META }, results };
  },
});

export interface D1Shim {
  prepare: (sql: string) => D1ShimPrepared;
  exec: (sql: string) => Promise<void>;
  _raw: Database.Database;
}

/**
 * Create a fresh in-memory D1 shim. Loads init-style SQL files in
 * `migrations/` in name order so tests always run against the current
 * schema. Seed data (files with `seed` in the name) is skipped so assertions
 * can count exact row counts.
 */
export const createD1Shim = (
  migrationsDir?: string,
  options: { includeSeeds?: boolean } = {},
): D1Shim => {
  const db = new Database(":memory:");
  db.pragma("journal_mode = WAL");

  if (migrationsDir) {
    const files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .filter((f) => options.includeSeeds || !/seed/i.test(f))
      .sort();
    for (const f of files) {
      const sql = readFileSync(join(migrationsDir, f), "utf8");
      db.exec(sql);
    }
  }

  return {
    prepare: (sql: string) => buildPrepared(db, sql, []),
    exec: async (sql: string) => {
      db.exec(sql);
    },
    _raw: db,
  };
};
