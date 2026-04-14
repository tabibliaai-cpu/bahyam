import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface DisconnectRequestBody {
  userId: string
  roomId: string
}

export async function POST(request: Request) {
  try {
    const body: DisconnectRequestBody = await request.json()
    const { userId, roomId } = body

    if (!userId || !roomId) {
      return Response.json({ error: 'userId and roomId are required' }, { status: 400 })
    }

    const d = await db()

    // Update room status to ended
    await d.execute({
      sql: `UPDATE wl_rooms SET status = 'ended', ended_at = datetime('now') WHERE id = ?`,
      args: [roomId],
    })

    // Remove user from queue (cleanup in case they were queued)
    await d.execute({
      sql: `DELETE FROM wl_queue WHERE user_id = ?`,
      args: [userId],
    })

    // Mark user offline
    await d.execute({
      sql: `UPDATE wl_users SET is_online = 0, last_seen = datetime('now') WHERE id = ?`,
      args: [userId],
    })

    return Response.json({ ok: true })
  } catch (error) {
    console.error('Disconnect failed:', error)
    return Response.json({ error: 'Failed to disconnect' }, { status: 500 })
  }
}
