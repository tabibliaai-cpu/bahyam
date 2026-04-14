import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return Response.json({ error: 'userId is required' }, { status: 400 })
    }

    const d = await db()

    // Check if user is banned
    const bannedResult = await d.execute({
      sql: `SELECT is_banned FROM wl_users WHERE id = ?`,
      args: [userId],
    })

    if (bannedResult.rows.length > 0) {
      const user = bannedResult.rows[0] as Record<string, unknown>
      if (user.is_banned) {
        return Response.json({ banned: true })
      }
    }

    // Check if user has an active room
    const roomResult = await d.execute({
      sql: `SELECT id, user1_id, user2_id, status FROM wl_rooms
            WHERE (user1_id = ? OR user2_id = ?) AND status = 'active'
            ORDER BY started_at DESC LIMIT 1`,
      args: [userId, userId],
    })

    if (roomResult.rows.length > 0) {
      const room = roomResult.rows[0] as Record<string, unknown>
      const strangerId = room.user1_id === userId ? room.user2_id : room.user1_id

      // Fetch stranger's info
      const strangerResult = await d.execute({
        sql: `SELECT id, alias, avatar_color, avatar_emoji FROM wl_users WHERE id = ?`,
        args: [strangerId as string],
      })

      const stranger = strangerResult.rows[0] as Record<string, unknown>

      return Response.json({
        matched: true,
        roomId: room.id,
        stranger: {
          id: stranger.id,
          alias: stranger.alias,
          avatarColor: stranger.avatar_color,
          avatarEmoji: stranger.avatar_emoji,
        },
      })
    }

    // No active room — check if user is in queue
    const queueResult = await d.execute({
      sql: `SELECT id FROM wl_queue WHERE user_id = ?`,
      args: [userId],
    })

    if (queueResult.rows.length > 0) {
      return Response.json({ matched: false, waiting: true })
    }

    return Response.json({ matched: false, waiting: false })
  } catch (error) {
    console.error('Queue status check failed:', error)
    return Response.json({ error: 'Failed to check queue status' }, { status: 500 })
  }
}
