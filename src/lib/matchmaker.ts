export async function findMatch(userId: string, userInterests: string[], isPremium: boolean, genderPref: string) {
  const { db } = await import('./db')
  const d = await db()

  // Try interest-based match first
  if (userInterests.length > 0) {
    const queue = await d.execute({
      sql: `SELECT * FROM wl_queue WHERE user_id != ? AND joined_at > datetime('now', '-30 seconds') ORDER BY is_premium DESC, joined_at ASC LIMIT 20`,
      args: [userId]
    })

    let bestMatch: any = null
    let bestScore = 0

    for (const candidate of queue.rows) {
      const candidateInterests = JSON.parse((candidate.interests as string) || '[]')
      const overlap = userInterests.filter((i: string) => candidateInterests.includes(i)).length
      if (overlap > bestScore) {
        bestScore = overlap
        bestMatch = candidate
      }
    }

    if (bestMatch && bestScore > 0) return bestMatch
  }

  // Random match from queue
  const result = await d.execute({
    sql: `SELECT * FROM wl_queue WHERE user_id != ? AND joined_at > datetime('now', '-60 seconds') ORDER BY is_premium DESC, RANDOM() LIMIT 1`,
    args: [userId]
  })

  return result.rows[0] || null
}

export async function createRoom(user1Id: string, user2Id: string) {
  const { db } = await import('./db')
  const d = await db()
  const roomId = crypto.randomUUID()
  await d.execute({
    sql: `INSERT INTO wl_rooms (id, user1_id, user2_id, status, started_at) VALUES (?, ?, ?, 'active', datetime('now'))`,
    args: [roomId, user1Id, user2Id]
  })
  await d.execute({ sql: `DELETE FROM wl_queue WHERE user_id IN (?, ?)`, args: [user1Id, user2Id] })
  return roomId
}
