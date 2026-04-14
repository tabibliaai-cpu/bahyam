import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const d = await db()

    // Online users
    const onlineResult = await d.execute({
      sql: `SELECT COUNT(*) as count FROM wl_users WHERE is_online = 1`,
      args: [],
    })
    const onlineUsers = (onlineResult.rows[0] as Record<string, unknown>).count as number

    // Chats started today (last 24 hours)
    const chatsResult = await d.execute({
      sql: `SELECT COUNT(*) as count FROM wl_rooms WHERE started_at > datetime('now', '-1 day')`,
      args: [],
    })
    const chatsToday = (chatsResult.rows[0] as Record<string, unknown>).count as number

    // Messages sent today (last 24 hours)
    const messagesResult = await d.execute({
      sql: `SELECT COUNT(*) as count FROM wl_messages WHERE created_at > datetime('now', '-1 day')`,
      args: [],
    })
    const messagesToday = (messagesResult.rows[0] as Record<string, unknown>).count as number

    return Response.json({
      onlineUsers,
      chatsToday,
      messagesToday,
    })
  } catch (error) {
    console.error('Stats fetch failed:', error)
    return Response.json({
      onlineUsers: 0,
      chatsToday: 0,
      messagesToday: 0,
    })
  }
}
