CREATE TABLE IF NOT EXISTS interviews (
  id                     INTEGER  PRIMARY KEY AUTOINCREMENT,
  company                TEXT     NOT NULL,
  stage                  TEXT     NOT NULL CHECK(stage IN ('casual','first','second','final','offer','rejected','closed')),
  scheduled_at           DATETIME NOT NULL,
  notes                  TEXT,
  reminder_minutes_before INTEGER NOT NULL DEFAULT 60,
  reminder_fired         INTEGER  NOT NULL DEFAULT 0,  -- boolean: 0 = false, 1 = true
  created_at             DATETIME NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at             DATETIME NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
