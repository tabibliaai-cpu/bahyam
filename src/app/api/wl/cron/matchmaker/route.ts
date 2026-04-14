import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const d = await db()
    
    // Remove stale queue entries (waiting > 2 minutes)
    await d.execute({
      sql: `DELETE FROM wl_queue WHERE joined_at < datetime('now', '-2 minutes')`,
      args: []
    })
    
    // Mark users offline if last_seen > 5 minutes ago
    await d.execute({
      sql: `UPDATE wl_users SET is_online = 0 WHERE last_seen < datetime('now', '-5 minutes')`,
      args: []
    })
    
    // End rooms where both users are offline for > 5 minutes
    await d.execute({
      sql: `UPDATE wl_rooms SET status = 'ended', ended_at = datetime('now') WHERE status = 'active' AND user1_id IN (SELECT id FROM wl_users WHERE is_online = 0) AND user2_id IN (SELECT id FROM wl_users WHERE is_online = 0)`,
      args: []
    })
    
    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: true })
  }
}
