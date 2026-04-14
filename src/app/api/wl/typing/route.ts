import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

// In-memory typing map: key = "roomId:userId", value = timestamp (ms)
const typingMap = new Map<string, number>()

const TYPING_TTL = 3000 // 3 seconds

function cleanExpired() {
  const now = Date.now()
  for (const [key, ts] of typingMap.entries()) {
    if (now - ts > TYPING_TTL) {
      typingMap.delete(key)
    }
  }
}

// GET: Check if another user is typing in the room
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')
    const userId = searchParams.get('userId')

    if (!roomId || !userId) {
      return Response.json({ error: 'roomId and userId are required' }, { status: 400 })
    }

    cleanExpired()

    // Check if anyone else in this room is typing
    const now = Date.now()
    let isTyping = false

    for (const [key, ts] of typingMap.entries()) {
      if (key.startsWith(`${roomId}:`) && !key.endsWith(`:${userId}`) && now - ts < TYPING_TTL) {
        isTyping = true
        break
      }
    }

    return Response.json({ isTyping })
  } catch (error) {
    console.error('Typing check failed:', error)
    return Response.json({ isTyping: false })
  }
}

// POST: Set typing state
interface TypingRequestBody {
  roomId: string
  userId: string
}

export async function POST(request: Request) {
  try {
    const body: TypingRequestBody = await request.json()
    const { roomId, userId } = body

    if (!roomId || !userId) {
      return Response.json({ error: 'roomId and userId are required' }, { status: 400 })
    }

    cleanExpired()

    const key = `${roomId}:${userId}`
    typingMap.set(key, Date.now())

    return Response.json({ ok: true })
  } catch (error) {
    console.error('Typing state failed:', error)
    return Response.json({ error: 'Failed to set typing state' }, { status: 500 })
  }
}
