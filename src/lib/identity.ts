const adjectives = [
  'Cosmic', 'Silent', 'Mystic', 'Shadow', 'Golden', 'Crystal',
  'Ancient', 'Neon', 'Stellar', 'Phantom', 'Electric', 'Frozen',
  'Blazing', 'Hidden', 'Velvet', 'Crimson', 'Azure', 'Emerald',
  'Thunder', 'Midnight', 'Solar', 'Lunar', 'Spectral', 'Infinite'
]

const nouns = [
  'Fox', 'Wolf', 'Eagle', 'Tiger', 'Falcon', 'Raven', 'Phoenix',
  'Dragon', 'Panther', 'Hawk', 'Lynx', 'Cobra', 'Bear', 'Shark',
  'Viper', 'Owl', 'Jaguar', 'Puma', 'Manta', 'Sphinx', 'Hydra',
  'Cipher', 'Ghost', 'Storm', 'Pulse', 'Nova', 'Comet', 'Nebula'
]

const emojis = ['🦊', '🐺', '🦅', '🐯', '🦁', '🐉', '🦋', '⚡', '🌙', '🔥', '💫', '🌊', '🎭', '🎪', '🌈']

const colors = [
  '#8B5CF6', '#6366F1', '#EC4899', '#14B8A6',
  '#F59E0B', '#EF4444', '#10B981', '#3B82F6'
]

export function generateIdentity() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const emoji = emojis[Math.floor(Math.random() * emojis.length)]
  const color = colors[Math.floor(Math.random() * colors.length)]
  return {
    alias: `${adj} ${noun}`,
    emoji,
    color,
    sessionId: crypto.randomUUID()
  }
}
