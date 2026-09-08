-- Visit log. One row per visitor session.
CREATE TABLE IF NOT EXISTS visits (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  ts       INTEGER NOT NULL,          -- unix ms
  sid      TEXT,                      -- per-session id, for de-duplicating refreshes
  iphash   TEXT,                      -- salted hash, never the raw IP
  city     TEXT,
  region   TEXT,
  country  TEXT,
  cc       TEXT,                      -- 2-letter code, for the flag
  org      TEXT,                      -- network / ISP
  source   TEXT,                      -- friendly referrer, e.g. "LinkedIn"
  ref      TEXT,                      -- raw referrer
  device   TEXT,
  os       TEXT,
  browser  TEXT,
  path     TEXT
);
CREATE INDEX IF NOT EXISTS idx_visits_ts  ON visits(ts DESC);
CREATE INDEX IF NOT EXISTS idx_visits_sid ON visits(sid);

-- The things that actually matter: resume downloads, demo launches, contact reveals.
CREATE TABLE IF NOT EXISTS events (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  ts     INTEGER NOT NULL,
  sid    TEXT,
  kind   TEXT,                        -- resume | demo | phone | email | contact
  detail TEXT
);
CREATE INDEX IF NOT EXISTS idx_events_ts ON events(ts DESC);

-- Messages left through the form at the bottom of the page.
CREATE TABLE IF NOT EXISTS messages (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  ts      INTEGER NOT NULL,
  sid     TEXT,
  iphash  TEXT,                      -- salted; used only to rate limit
  name    TEXT,
  email   TEXT,
  body    TEXT NOT NULL,
  city    TEXT,
  region  TEXT,
  country TEXT,
  cc      TEXT,
  org     TEXT,
  source  TEXT                       -- where they came from, e.g. "LinkedIn"
);
CREATE INDEX IF NOT EXISTS idx_messages_ts ON messages(ts DESC);
