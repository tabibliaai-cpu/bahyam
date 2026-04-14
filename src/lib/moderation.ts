export async function moderateMessage(messageId: string, content: string, senderId: string) {
  const flagWords = ['personal info', 'phone', 'instagram', 'snapchat', 'address']
  const lowerContent = content.toLowerCase()
  const hasFlagWord = flagWords.some(w => lowerContent.includes(w))

  if (!hasFlagWord && content.length < 100) return

  try {
    const response = await fetch(process.env.ZAI_BASE_URL + '/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.ZAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.ZAI_MODEL || 'gpt-4o',
        max_tokens: 100,
        messages: [
          { role: 'system', content: 'You are a content moderator. Respond only with JSON: {"safe": true/false, "reason": "brief reason if unsafe"}. Flag: harassment, explicit content, personal info sharing, illegal activity.' },
          { role: 'user', content: `Message: "${content}"` }
        ]
      })
    })
    const data = await response.json()
    const result = JSON.parse(data.choices[0].message.content)
    if (!result.safe) {
      const { db } = await import('./db')
      const d = await db()
      await d.execute({ sql: `UPDATE wl_messages SET is_deleted = 1 WHERE id = ?`, args: [messageId] })
      await d.execute({ sql: `UPDATE wl_users SET report_count = report_count + 1 WHERE id = ?`, args: [senderId] })
    }
  } catch {}
}

export async function generateIceBreaker(interests1: string[], interests2: string[]) {
  const shared = interests1.filter(i => interests2.includes(i))
  const prompt = shared.length > 0
    ? `Two anonymous people both like: ${shared.join(', ')}. Generate 3 fun, creative conversation starter questions. Keep them light and interesting. Return JSON array of 3 strings.`
    : `Generate 3 fun universal conversation starter questions for two strangers. Creative, light, not cliché. Return JSON array of 3 strings.`

  try {
    const response = await fetch(process.env.ZAI_BASE_URL + '/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.ZAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.ZAI_MODEL || 'gpt-4o',
        max_tokens: 200,
        messages: [
          { role: 'system', content: 'You generate conversation starters. Return ONLY a JSON array of 3 strings, nothing else.' },
          { role: 'user', content: prompt }
        ]
      })
    })
    const data = await response.json()
    return JSON.parse(data.choices[0].message.content)
  } catch {
    return ['Hey! What brings you here today?', 'Got any cool hobbies?', "What's the most interesting thing that happened to you this week?"]
  }
}
