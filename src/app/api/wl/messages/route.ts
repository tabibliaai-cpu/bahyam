import { db } from '@/lib/db'
import { moderateMessage } from '@/lib/moderation'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

// GET: Fetch messages for a room
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')
    const after = searchParams.get('after')

    if (!roomId) {
      return Response.json({ error: 'roomId is required' }, { status: 400 })
    }

    const d = await db()

    // Check if room is still active
    const roomResult = await d.execute({
      sql: `SELECT status FROM wl_rooms WHERE id = ?`,
      args: [roomId],
    })

    let disconnected = false
    if (roomResult.rows.length > 0) {
      const room = roomResult.rows[0] as Record<string, unknown>
      if (room.status !== 'active') {
        disconnected = true
      }
    }

    // Fetch messages (exclude deleted ones)
    const messagesResult = await d.execute({
      sql: `SELECT id, sender_id, content, type, created_at FROM wl_messages
            WHERE room_id = ? AND is_deleted = 0 AND created_at > ?
            ORDER BY created_at ASC`,
      args: [roomId, after || '1970-01-01T00:00:00'],
    })

    const messages = messagesResult.rows.map((row) => {
      const msg = row as Record<string, unknown>
      return {
        id: msg.id,
        senderId: msg.sender_id,
        content: msg.content,
        type: msg.type || 'text',
        createdAt: msg.created_at,
      }
    })

    return Response.json({ messages, disconnected })
  } catch (error) {
    console.error('Fetch messages failed:', error)
    return Response.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// POST: Send a message
interface SendMessageBody {
  roomId: string
  senderId: string
  content: string
}

export async function POST(request: Request) {
  try {
    const body: SendMessageBody = await request.json()
    const { roomId, senderId, content } = body

    if (!roomId || !senderId || !content) {
      return Response.json({ error: 'roomId, senderId, and content are required' }, { status: 400 })
    }

    if (content.length > 2000) {
      return Response.json({ error: 'Message too long (max 2000 characters)' }, { status: 400 })
    }

    const d = await db()

    // Validate user is in the room
    const roomResult = await d.execute({
      sql: `SELECT id, user1_id, user2_id, status FROM wl_rooms WHERE id = ?`,
      args: [roomId],
    })

    if (roomResult.rows.length === 0) {
      return Response.json({ error: 'Room not found' }, { status: 404 })
    }

    const room = roomResult.rows[0] as Record<string, unknown>
    if (room.user1_id !== senderId && room.user2_id !== senderId) {
      return Response.json({ error: 'Not a participant in this room' }, { status: 403 })
    }

    if (room.status !== 'active') {
      return Response.json({ error: 'Room is no longer active' }, { status: 410 })
    }

    // Rate limit: max 30 messages per minute
    const rateResult = await d.execute({
      sql: `SELECT COUNT(*) as count FROM wl_messages
            WHERE sender_id = ? AND created_at > datetime('now', '-60 seconds')`,
      args: [senderId],
    })

    const rateCount = (rateResult.rows[0] as Record<string, unknown>).count as number
    if (rateCount >= 30) {
      return Response.json({ error: 'Rate limit exceeded. Slow down!' }, { status: 429 })
    }

    // Insert the message
    const messageId = crypto.randomUUID()
    await d.execute({
      sql: `INSERT INTO wl_messages (id, room_id, sender_id, content) VALUES (?, ?, ?, ?)`,
      args: [messageId, roomId, senderId, content],
    })

    // Increment room message_count
    await d.execute({
      sql: `UPDATE wl_rooms SET message_count = message_count + 1 WHERE id = ?`,
      args: [roomId],
    })

    // Run moderation asynchronously (don't await)
    moderateMessage(messageId, content, senderId).catch(() => {})

    return Response.json({
      message: {
        id: messageId,
        content,
        senderId,
        createdAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Send message failed:', error)
    return Response.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
