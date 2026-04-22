-- Phase 3a: DataSist schema. Curated data-center intelligence, community
-- impact notes, and admin audit trail. Normalized from the legacy
-- datasist-api schema with additions for slug-based lookup + audit log.

CREATE TABLE IF NOT EXISTS data_centers (
  id                          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug                        TEXT    NOT NULL UNIQUE,
  name                        TEXT    NOT NULL,
  company                     TEXT    NOT NULL,
  company_type                TEXT    NOT NULL CHECK (company_type IN ('hyperscale','colocation','neocloud')),
  lat                         REAL    NOT NULL,
  lng                         REAL    NOT NULL,
  city                        TEXT    NOT NULL,
  state                       TEXT    NOT NULL,
  country                     TEXT    NOT NULL DEFAULT 'USA',
  capacity_mw                 REAL,
  estimated_annual_gwh        REAL,
  water_usage_million_gallons REAL,
  status                      TEXT    NOT NULL CHECK (status IN ('operational','under_construction','planned','canceled')),
  year_opened                 INTEGER,
  year_planned                INTEGER,
  investment_billions         REAL,
  acreage                     REAL,
  primary_models              TEXT,                               -- JSON array
  community_impact            TEXT,
  community_resistance        INTEGER NOT NULL DEFAULT 0,         -- 0/1
  grid_risk                   TEXT    CHECK (grid_risk IN ('low','medium','high') OR grid_risk IS NULL),
  renewable_percent           INTEGER,
  notes                       TEXT,
  created_at                  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at                  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_dc_country   ON data_centers (country);
CREATE INDEX IF NOT EXISTS idx_dc_state     ON data_centers (state);
CREATE INDEX IF NOT EXISTS idx_dc_company   ON data_centers (company);
CREATE INDEX IF NOT EXISTS idx_dc_status    ON data_centers (status);
CREATE INDEX IF NOT EXISTS idx_dc_grid_risk ON data_centers (grid_risk);

-- Audit log: every admin mutation appends a row. Append-only by convention.
CREATE TABLE IF NOT EXISTS dc_audit_log (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  action     TEXT    NOT NULL CHECK (action IN ('create','update','delete')),
  slug       TEXT    NOT NULL,
  actor      TEXT,                  -- hashed bearer fingerprint
  payload    TEXT,                  -- JSON snapshot of change
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_slug ON dc_audit_log (slug);
CREATE INDEX IF NOT EXISTS idx_audit_time ON dc_audit_log (created_at);
