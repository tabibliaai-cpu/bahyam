import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

// POST: heartbeat ping — updates last_seen + is_online, optionally checks room status
export async function POST(request: Request) {
  try {
    const { userId, roomId } = await request.json()

    if (!userId) {
      return Response.json({ error: 'userId is required' }, { status: 400 })
    }

    const d = await db()

    // Keep user alive
    await d.execute({
      sql: `UPDATE wl_users SET last_seen = datetime('now'), is_online = 1 WHERE id = ?`,
      args: [userId],
    })

    // If roomId provided, return its status so client can detect forced-ended rooms
    if (roomId) {
      const roomResult = await d.execute({
        sql: `SELECT status FROM wl_rooms WHERE id = ?`,
        args: [roomId],
      })

      if (roomResult.rows.length === 0) {
        return Response.json({ ok: true, roomStatus: 'not_found' })
      }

      const room = roomResult.rows[0] as Record<string, unknown>
      return Response.json({ ok: true, roomStatus: room.status })
    }

    return Response.json({ ok: true })
  } catch (error) {
    console.error('Watchdog ping failed:', error)
    return Response.json({ error: 'Watchdog ping failed' }, { status: 500 })
  }
}

// GET: lightweight uptime ping (also accepts ?userId= for quick heartbeat)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return Response.json({ ok: true, message: 'Watchdog alive' })
  }

  try {
    const d = await db()
    await d.execute({
      sql: `UPDATE wl_users SET last_seen = datetime('now'), is_online = 1 WHERE id = ?`,
      args: [userId],
    })
    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: true })
  }
}
