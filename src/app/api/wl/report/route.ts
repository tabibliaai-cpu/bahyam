import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface ReportRequestBody {
  reporterId: string
  reportedId: string
  roomId: string
  reason?: string
}

export async function POST(request: Request) {
  try {
    const body: ReportRequestBody = await request.json()
    const { reporterId, reportedId, roomId, reason } = body

    if (!reporterId || !reportedId || !roomId) {
      return Response.json({ error: 'reporterId, reportedId, and roomId are required' }, { status: 400 })
    }

    const d = await db()

    // Insert report
    const reportId = crypto.randomUUID()
    await d.execute({
      sql: `INSERT INTO wl_reports (id, reporter_id, reported_id, room_id, reason) VALUES (?, ?, ?, ?, ?)`,
      args: [reportId, reporterId, reportedId, roomId, reason || null],
    })

    // Check if reported user has 3+ reports in last 24 hours
    const reportsResult = await d.execute({
      sql: `SELECT COUNT(*) as count FROM wl_reports
            WHERE reported_id = ? AND created_at > datetime('now', '-24 hours')`,
      args: [reportedId],
    })

    const reportCount = (reportsResult.rows[0] as Record<string, unknown>).count as number

    if (reportCount >= 3) {
      // Auto-ban: set is_banned = 1 and extend last_seen to now + 24 hours
      await d.execute({
        sql: `UPDATE wl_users SET is_banned = 1, last_seen = datetime('now', '+24 hours') WHERE id = ?`,
        args: [reportedId],
      })

      // Remove banned user from queue
      await d.execute({
        sql: `DELETE FROM wl_queue WHERE user_id = ?`,
        args: [reportedId],
      })
    }

    // Disconnect the reporter from the room
    await d.execute({
      sql: `UPDATE wl_rooms SET status = 'ended', ended_at = datetime('now') WHERE id = ?`,
      args: [roomId],
    })

    // Remove reporter from queue
    await d.execute({
      sql: `DELETE FROM wl_queue WHERE user_id = ?`,
      args: [reporterId],
    })

    // Mark reporter offline
    await d.execute({
      sql: `UPDATE wl_users SET is_online = 0, last_seen = datetime('now') WHERE id = ?`,
      args: [reporterId],
    })

    return Response.json({ ok: true })
  } catch (error) {
    console.error('Report failed:', error)
    return Response.json({ error: 'Failed to submit report' }, { status: 500 })
  }
}
