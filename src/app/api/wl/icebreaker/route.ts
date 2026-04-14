import { generateIceBreaker } from '@/lib/moderation'

export const dynamic = 'force-dynamic'

interface IceBreakerRequestBody {
  interests1: string[]
  interests2: string[]
}

export async function POST(request: Request) {
  try {
    const body: IceBreakerRequestBody = await request.json()
    const { interests1 = [], interests2 = [] } = body

    const suggestions = await generateIceBreaker(interests1, interests2)

    return Response.json({ suggestions })
  } catch (error) {
    console.error('Icebreaker generation failed:', error)
    return Response.json({
      suggestions: [
        'Hey! What brings you here today?',
        'Got any cool hobbies?',
        "What's the most interesting thing that happened to you this week?",
      ],
    })
  }
}
