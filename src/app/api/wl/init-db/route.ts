import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const d = await db()

    await d.execute({
      sql: `CREATE TABLE IF NOT EXISTS wl_users (
        id TEXT PRIMARY KEY,
        session_id TEXT UNIQUE NOT NULL,
        alias TEXT NOT NULL,
        avatar_color TEXT NOT NULL,
        avatar_emoji TEXT NOT NULL,
        interests TEXT DEFAULT '[]',
        is_premium INTEGER DEFAULT 0,
        is_online INTEGER DEFAULT 0,
        gender TEXT DEFAULT 'unspecified',
        location TEXT,
        report_count INTEGER DEFAULT 0,
        is_banned INTEGER DEFAULT 0,
        last_seen TEXT DEFAULT (datetime('now')),
        created_at TEXT DEFAULT (datetime('now'))
      )`,
      args: [],
    })

    await d.execute({
      sql: `CREATE TABLE IF NOT EXISTS wl_queue (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        interests TEXT DEFAULT '[]',
        gender_pref TEXT DEFAULT 'any',
        room_type TEXT DEFAULT 'text',
        is_premium INTEGER DEFAULT 0,
        joined_at TEXT DEFAULT (datetime('now'))
      )`,
      args: [],
    })

    await d.execute({
      sql: `CREATE TABLE IF NOT EXISTS wl_rooms (
        id TEXT PRIMARY KEY,
        user1_id TEXT NOT NULL,
        user2_id TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        room_type TEXT DEFAULT 'text',
        started_at TEXT DEFAULT (datetime('now')),
        ended_at TEXT,
        message_count INTEGER DEFAULT 0
      )`,
      args: [],
    })

    await d.execute({
      sql: `CREATE TABLE IF NOT EXISTS wl_messages (
        id TEXT PRIMARY KEY,
        room_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT DEFAULT 'text',
        is_deleted INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      )`,
      args: [],
    })

    await d.execute({
      sql: `CREATE TABLE IF NOT EXISTS wl_reports (
        id TEXT PRIMARY KEY,
        reporter_id TEXT NOT NULL,
        reported_id TEXT NOT NULL,
        room_id TEXT NOT NULL,
        reason TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )`,
      args: [],
    })

    await d.execute({
      sql: `CREATE TABLE IF NOT EXISTS wl_subscriptions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        plan TEXT DEFAULT 'free',
        status TEXT DEFAULT 'inactive',
        bitcoin_payment_id TEXT,
        started_at TEXT,
        expires_at TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )`,
      args: [],
    })

    return Response.json({ ok: true })
  } catch (error) {
    console.error('Failed to initialize database:', error)
    return Response.json({ ok: false, error: 'Database initialization failed' }, { status: 500 })
  }
}
