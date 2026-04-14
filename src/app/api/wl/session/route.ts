import { db } from '@/lib/db'
import { generateIdentity } from '@/lib/identity'

export const dynamic = 'force-dynamic'

interface SessionRequestBody {
  sessionId?: string
}

export async function POST(request: Request) {
  try {
    const body: SessionRequestBody = await request.json()
    const { sessionId } = body
    const d = await db()

    // Try to restore existing session
    if (sessionId) {
      const result = await d.execute({
        sql: `SELECT * FROM wl_users WHERE session_id = ? AND is_banned = 0`,
        args: [sessionId],
      })

      if (result.rows.length > 0) {
        const user = result.rows[0] as Record<string, unknown>
        // Update online status and last seen
        await d.execute({
          sql: `UPDATE wl_users SET is_online = 1, last_seen = datetime('now') WHERE id = ?`,
          args: [user.id as string],
        })
        return Response.json({
          user: {
            id: user.id,
            sessionId: user.session_id,
            alias: user.alias,
            avatarColor: user.avatar_color,
            avatarEmoji: user.avatar_emoji,
            isPremium: Boolean(user.is_premium),
            interests: JSON.parse((user.interests as string) || '[]'),
          },
        })
      }
    }

    // Create new identity
    const identity = generateIdentity()
    const userId = crypto.randomUUID()

    await d.execute({
      sql: `INSERT INTO wl_users (id, session_id, alias, avatar_color, avatar_emoji, is_online, interests)
            VALUES (?, ?, ?, ?, ?, 1, '[]')`,
      args: [userId, identity.sessionId, identity.alias, identity.color, identity.emoji],
    })

    return Response.json({
      user: {
        id: userId,
        sessionId: identity.sessionId,
        alias: identity.alias,
        avatarColor: identity.color,
        avatarEmoji: identity.emoji,
        isPremium: false,
      },
    })
  } catch (error) {
    console.error('Session creation failed:', error)
    return Response.json({ error: 'Failed to create session' }, { status: 500 })
  }
}
