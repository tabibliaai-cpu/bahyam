import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const d = await db()
    
    // Clean up old ended rooms (older than 1 hour)
    await d.execute({
      sql: `DELETE FROM wl_messages WHERE room_id IN (SELECT id FROM wl_rooms WHERE status = 'ended' AND ended_at < datetime('now', '-1 hour'))`,
      args: []
    })
    
    // Clean up old rooms (older than 24 hours)
    await d.execute({
      sql: `DELETE FROM wl_rooms WHERE status = 'ended' AND ended_at < datetime('now', '-24 hours')`,
      args: []
    })
    
    // Clean up old reports (older than 30 days)
    await d.execute({
      sql: `DELETE FROM wl_reports WHERE created_at < datetime('now', '-30 days')`,
      args: []
    })
    
    return Response.json({ ok: true, message: 'Cleanup completed' })
  } catch (error) {
    return Response.json({ ok: true, message: 'Cleanup skipped' })
  }
}
