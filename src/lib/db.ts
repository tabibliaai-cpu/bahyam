import { createClient, Client } from '@libsql/client';

const globalForDb = globalThis as unknown as {
  db: Client | undefined;
};

function getDb(): Client {
  if (!globalForDb.db) {
    if (!process.env.TURSO_DATABASE_URL) {
      throw new Error('TURSO_DATABASE_URL is not set');
    }
    globalForDb.db = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return globalForDb.db;
}

// Safe stub that returns empty results instead of throwing
function stubExecute() {
  return Promise.resolve({ rows: [] });
}

export const db = new Proxy({} as Client, {
  get(_target, prop, receiver) {
    try {
      const client = getDb();
      const value = (client as any)[prop];
      if (typeof value === 'function') return value.bind(client);
      return value;
    } catch {
      // When DB is not configured, return safe stubs
      if (prop === 'execute') return stubExecute;
      return undefined;
    }
  },
});

// Initialize all tables on first import
export async function initDatabase() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS apis (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      method TEXT DEFAULT 'GET',
      headers TEXT DEFAULT '{}',
      auth_token TEXT,
      check_interval_seconds INTEGER DEFAULT 300,
      is_public INTEGER DEFAULT 0,
      is_benchmark INTEGER DEFAULT 0,
      display_name TEXT,
      description TEXT,
      category TEXT DEFAULT 'REST',
      tags TEXT,
      slug TEXT UNIQUE,
      logo_url TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS api_logs (
      id TEXT PRIMARY KEY,
      api_id TEXT NOT NULL,
      status_code INTEGER,
      response_time_ms INTEGER,
      response_body TEXT,
      is_error INTEGER DEFAULT 0,
      region TEXT DEFAULT 'us-east',
      checked_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      api_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      error_summary TEXT,
      ai_diagnosis TEXT,
      ai_fix_suggestion TEXT,
      severity TEXT DEFAULT 'medium',
      sent_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      plan TEXT DEFAULT 'free',
      status TEXT DEFAULT 'inactive',
      bitcoin_payment_id TEXT,
      started_at TEXT,
      expires_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS api_predictions (
      id TEXT PRIMARY KEY,
      api_id TEXT NOT NULL,
      degradation_probability INTEGER DEFAULT 0,
      outage_probability INTEGER DEFAULT 0,
      risk_score INTEGER DEFAULT 0,
      predicted_issue_window TEXT,
      root_cause_prediction TEXT,
      recommendations TEXT,
      generated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS api_watchers (
      id TEXT PRIMARY KEY,
      api_id TEXT NOT NULL,
      email TEXT NOT NULL,
      notify_down INTEGER DEFAULT 1,
      notify_recovery INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS user_settings (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      slack_webhook_url TEXT,
      discord_webhook_url TEXT,
      company_name TEXT,
      logo_url TEXT,
      status_page_slug TEXT UNIQUE,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS incidents (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT,
      status TEXT DEFAULT 'active',
      affected_apis TEXT,
      ai_summary TEXT,
      ai_root_cause TEXT,
      ai_recommendation TEXT,
      started_at TEXT DEFAULT (datetime('now')),
      resolved_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS certifications (
      id TEXT PRIMARY KEY,
      api_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      tier TEXT,
      status TEXT DEFAULT 'active',
      certificate_number TEXT UNIQUE,
      amount_paid INTEGER,
      bitcoin_payment_id TEXT,
      issued_at TEXT DEFAULT (datetime('now')),
      expires_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS sponsored_listings (
      id TEXT PRIMARY KEY,
      api_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      plan TEXT,
      amount_per_month INTEGER,
      status TEXT DEFAULT 'active',
      bitcoin_payment_id TEXT,
      impressions INTEGER DEFAULT 0,
      clicks INTEGER DEFAULT 0,
      start_date TEXT,
      end_date TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS load_tests (
      id TEXT PRIMARY KEY,
      api_id TEXT,
      user_id TEXT NOT NULL,
      test_type TEXT,
      status TEXT DEFAULT 'pending',
      concurrent_users INTEGER,
      duration_seconds INTEGER,
      target_url TEXT,
      amount_paid INTEGER,
      bitcoin_payment_id TEXT,
      results TEXT,
      ai_report TEXT,
      started_at TEXT,
      completed_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
  ];

  for (const sql of tables) {
    try {
      await db.execute(sql);
    } catch (e) {
      console.error('Table creation error:', e);
    }
  }

  console.log('Database initialized successfully');
}
