import { db } from '@/lib/db'
import { findMatch, createRoom } from '@/lib/matchmaker'

export const dynamic = 'force-dynamic'

interface QueueRequestBody {
  userId: string
  interests?: string[]
  isPremium?: boolean
  genderPref?: string
}

export async function POST(request: Request) {
  try {
    const body: QueueRequestBody = await request.json()
    const { userId, interests = [], isPremium = false, genderPref = 'any' } = body
    const d = await db()

    // Delete any existing queue entry for this user
    await d.execute({
      sql: `DELETE FROM wl_queue WHERE user_id = ?`,
      args: [userId],
    })

    // Insert new queue entry
    const queueId = crypto.randomUUID()
    await d.execute({
      sql: `INSERT INTO wl_queue (id, user_id, interests, gender_pref, is_premium) VALUES (?, ?, ?, ?, ?)`,
      args: [queueId, userId, JSON.stringify(interests), genderPref, isPremium ? 1 : 0],
    })

    // Try to find a match
    const match = await findMatch(userId, interests, isPremium, genderPref)

    if (match) {
      const matched = match as Record<string, unknown>
      const roomId = await createRoom(userId, matched.user_id as string)

      // Fetch stranger's info
      const strangerResult = await d.execute({
        sql: `SELECT id, alias, avatar_color, avatar_emoji FROM wl_users WHERE id = ?`,
        args: [matched.user_id as string],
      })

      const stranger = strangerResult.rows[0] as Record<string, unknown>

      return Response.json({
        matched: true,
        roomId,
        stranger: {
          id: stranger.id,
          alias: stranger.alias,
          avatarColor: stranger.avatar_color,
          avatarEmoji: stranger.avatar_emoji,
        },
      })
    }

    return Response.json({
      matched: false,
      position: '1',
    })
  } catch (error) {
    console.error('Queue join failed:', error)
    return Response.json({ error: 'Failed to join queue' }, { status: 500 })
  }
}
