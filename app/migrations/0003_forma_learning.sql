-- Private, user/workspace-scoped design memory. Additive migration only.
CREATE TABLE IF NOT EXISTS forma_learning_items (
  id TEXT PRIMARY KEY, owner_key TEXT NOT NULL, kind TEXT NOT NULL,
  title TEXT NOT NULL, url TEXT, notes TEXT NOT NULL DEFAULT '',
  analysis TEXT NOT NULL DEFAULT '', asset_key TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS forma_learning_items_owner_idx ON forma_learning_items(owner_key, created_at DESC);
CREATE TABLE IF NOT EXISTS forma_learning_preferences (
  owner_key TEXT PRIMARY KEY, preferences TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS forma_learning_feedback (
  id TEXT PRIMARY KEY, owner_key TEXT NOT NULL, rating INTEGER NOT NULL,
  prompt TEXT NOT NULL, correction TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS forma_learning_feedback_owner_idx ON forma_learning_feedback(owner_key, created_at DESC);
CREATE TABLE IF NOT EXISTS forma_learning_runs (
  id TEXT PRIMARY KEY, owner_key TEXT NOT NULL, prompt TEXT NOT NULL,
  score INTEGER NOT NULL, critique TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS forma_learning_runs_owner_idx ON forma_learning_runs(owner_key,created_at DESC);
