'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Github, Zap, Sparkles, Ghost, Check, MessageCircle, ChevronRight } from 'lucide-react'

/* ─── Constants ─── */

const INTERESTS = [
  { id: 'gaming', label: 'Gaming', emoji: '🎮' },
  { id: 'music', label: 'Music', emoji: '🎵' },
  { id: 'movies', label: 'Movies', emoji: '🎬' },
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'tech', label: 'Tech', emoji: '💻' },
  { id: 'art', label: 'Art', emoji: '🎨' },
  { id: 'travel', label: 'Travel', emoji: '✈️' },
  { id: 'food', label: 'Food', emoji: '🍕' },
  { id: 'books', label: 'Books', emoji: '📚' },
  { id: 'crypto', label: 'Crypto', emoji: '₿' },
  { id: 'fitness', label: 'Fitness', emoji: '💪' },
  { id: 'science', label: 'Science', emoji: '🔬' },
]

const ACTIVITY_MESSAGES = [
  { text: 'Cosmic Fox and Shadow Wolf just connected', type: 'match' },
  { text: 'Electric Dragon found a match', type: 'match' },
  { text: '1,247 messages sent in the last minute', type: 'stats' },
  { text: 'Phantom Raven is chatting about Music', type: 'topic' },
  { text: 'Neon Tiger and Crystal Owl started talking', type: 'match' },
  { text: 'Silver Hawk is discussing Tech', type: 'topic' },
  { text: 'Midnight Wolf just started their 5th chat', type: 'match' },
  { text: 'Azure Phoenix is exploring Gaming topics', type: 'topic' },
  { text: '3,891 active conversations happening now', type: 'stats' },
  { text: 'Storm Falcon and Lunar Bear just connected', type: 'match' },
  { text: 'Golden Eagle found someone who loves Books', type: 'topic' },
  { text: 'Dark Viper is chatting about Crypto', type: 'topic' },
]

const FEATURES = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Instant Match',
    description:
      'Connect with a stranger in under 3 seconds. Our smart matching algorithm finds the best partner based on your interests.',
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: 'AI Ice Breakers',
    description:
      'Never run out of things to say. Our AI generates personalized conversation starters based on shared interests. (Premium)',
  },
  {
    icon: <Ghost className="w-6 h-6" />,
    title: 'Zero Trace',
    description:
      'No logs, no profiles, no history kept. Your conversations vanish the moment you disconnect. Complete anonymity.',
  },
]

/* ─── Component ─── */

export default function LandingPage() {
  const router = useRouter()
  
  const [onlineUsers, setOnlineUsers] = useState(0)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [activityMessage, setActivityMessage] = useState(ACTIVITY_MESSAGES[0])
  const [activityFade, setActivityFade] = useState(true)
  const [statsLoaded, setStatsLoaded] = useState(false)

  /* Enable scrolling for this page (override globals.css body overflow) */
  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    html.style.overflow = 'auto'
    html.style.height = 'auto'
    body.style.overflow = 'auto'
    body.style.height = 'auto'
    return () => {
      html.style.overflow = 'hidden'
      html.style.height = '100dvh'
      body.style.overflow = 'hidden'
      body.style.height = '100dvh'
    }
  }, [])

  /* Fetch live stats */
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/wl/stats')
      const data = await res.json()
      setOnlineUsers(data.onlineUsers ?? 0)
      setStatsLoaded(true)
    } catch {
      setOnlineUsers(0)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 10_000)
    return () => clearInterval(interval)
  }, [fetchStats])

  /* Activity feed cycling */
  useEffect(() => {
    let idx = 0
    const cycle = () => {
      setActivityFade(false)
      setTimeout(() => {
        idx = (idx + 1) % ACTIVITY_MESSAGES.length
        setActivityMessage(ACTIVITY_MESSAGES[idx])
        setActivityFade(true)
      }, 400)
    }
    const interval = setInterval(cycle, 4000)
    return () => clearInterval(interval)
  }, [])

  /* Interest selection (max 3) */
  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id)
      if (prev.length >= 3) return prev
      return [...prev, id]
    })
  }

  /* Start chat */
  const handleStartChat = () => {
    if (selectedInterests.length > 0) {
      localStorage.setItem('wl_interests', JSON.stringify(selectedInterests))
    } else {
      localStorage.removeItem('wl_interests')
    }
    router.push('/chat')
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}>
      {/* ─── Inline keyframes for orb float animations ─── */}
      <style>{`
        @keyframes float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -40px) scale(1.05); }
          50% { transform: translate(-20px, -60px) scale(0.95); }
          75% { transform: translate(40px, -30px) scale(1.02); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-40px, 20px) scale(0.98); }
          50% { transform: translate(30px, 40px) scale(1.04); }
          75% { transform: translate(-20px, 10px) scale(1); }
        }
        @keyframes float-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(50px, -30px) scale(1.06); }
          66% { transform: translate(-30px, 20px) scale(0.96); }
        }
        @keyframes activity-fade {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes btn-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(139,92,246,0.5), 0 4px 15px rgba(139,92,246,0.3); }
          50% { box-shadow: 0 0 25px 5px rgba(139,92,246,0.25), 0 4px 20px rgba(139,92,246,0.4); }
        }
        @keyframes counter-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>

      {/* ════════════════════════════════════════════════
          NAVBAR
      ════════════════════════════════════════════════ */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 h-16"
        style={{
          background: 'rgba(8,9,14,0.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-9 h-9 rounded-lg font-black text-white text-lg"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
            }}
          >
            W
          </div>
          <span className="hidden sm:block font-bold text-lg tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            WhisperLink
          </span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/premium')}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:scale-105 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #6366F1)' }}
          >
            Go Premium
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg transition-colors duration-200"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label="GitHub"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 pt-16">
        {/* Background orbs */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 300,
            height: 300,
            top: '10%',
            left: '15%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.3), rgba(99,102,241,0.15), transparent 70%)',
            filter: 'blur(80px)',
            opacity: 0.2,
            animation: 'float-1 20s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 250,
            height: 250,
            top: '60%',
            right: '10%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.35), rgba(139,92,246,0.1), transparent 70%)',
            filter: 'blur(70px)',
            opacity: 0.18,
            animation: 'float-2 25s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 200,
            height: 200,
            bottom: '15%',
            left: '40%',
            background: 'radial-gradient(circle, rgba(168,85,247,0.25), rgba(79,70,229,0.1), transparent 70%)',
            filter: 'blur(60px)',
            opacity: 0.15,
            animation: 'float-3 22s ease-in-out infinite',
          }}
        />

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
          {/* Live counter */}
          <div
            className="flex items-center gap-2 mb-8 px-4 py-2 rounded-full text-sm font-medium"
            style={{
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.2)',
              color: '#10B981',
              animation: statsLoaded ? 'fadeIn 0.5s ease-out' : undefined,
            }}
          >
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{
                background: '#10B981',
                animation: 'counter-pulse 2s ease-in-out infinite',
              }}
            />
            <span>{onlineUsers.toLocaleString()} people chatting right now</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight mb-4">
            <span style={{ color: 'var(--color-text-primary)' }}>Talk to anyone.</span>
            <br />
            <span
              className="inline-block"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6, #6366F1, #818CF8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Be nobody.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl mb-10 max-w-lg leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Instant anonymous chat with real strangers. No account. No history. No trace.
          </p>

          {/* Start button */}
          <button
            onClick={handleStartChat}
            className="w-full sm:w-[280px] h-14 rounded-xl text-white font-semibold text-lg flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.03] cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
              animation: 'btn-glow 3s ease-in-out infinite',
            }}
          >
            <MessageCircle className="w-5 h-5" />
            Start Chatting
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-4 mt-6 mb-10">
            {[
              { icon: '🔒', text: 'End-to-End Encrypted' },
              { icon: '👤', text: 'Zero Identity' },
              { icon: '⚡', text: 'Instant Match' },
            ].map((badge) => (
              <span
                key={badge.text}
                className="flex items-center gap-1.5 text-xs sm:text-sm"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <span>{badge.icon}</span>
                <span>{badge.text}</span>
              </span>
            ))}
          </div>

          {/* Interest selector */}
          <div className="w-full max-w-lg">
            <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
              Find people who like:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {INTERESTS.map((interest) => {
                const isSelected = selectedInterests.includes(interest.id)
                return (
                  <button
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    className="px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer border"
                    style={{
                      borderColor: isSelected ? '#8B5CF6' : 'var(--color-border)',
                      background: isSelected ? 'rgba(139,92,246,0.15)' : 'transparent',
                      color: isSelected ? '#c4b5fd' : 'var(--color-text-secondary)',
                    }}
                  >
                    {interest.emoji} {interest.label}
                  </button>
                )
              })}
            </div>
            {selectedInterests.length > 0 && (
              <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
                {selectedInterests.length}/3 selected
              </p>
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Scroll to explore</span>
          <div className="w-5 h-8 rounded-full border-2 flex items-start justify-center p-1" style={{ borderColor: 'var(--color-border)' }}>
            <div
              className="w-1 h-2 rounded-full"
              style={{
                background: 'var(--color-text-muted)',
                animation: 'float-2 2s ease-in-out infinite',
              }}
            />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          LIVE ACTIVITY FEED
      ════════════════════════════════════════════════ */}
      <section className="py-16 px-4">
        <div className="max-w-md mx-auto text-center">
          <div
            className="h-6 flex items-center justify-center"
            style={{
              animation: activityFade ? 'activity-fade 0.4s ease-out forwards' : 'none',
              opacity: activityFade ? undefined : 0,
            }}
          >
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {activityMessage.text}
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          FEATURES SECTION
      ════════════════════════════════════════════════ */}
      <section className="py-20 px-4">
        <h2
          className="text-3xl md:text-4xl font-bold text-center mb-12 tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Why WhisperLink?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl p-6 transition-all duration-300 hover:translate-y-[-2px]"
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                style={{
                  background: 'rgba(139,92,246,0.1)',
                  color: '#8B5CF6',
                }}
              >
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          PREMIUM SECTION
      ════════════════════════════════════════════════ */}
      <section className="py-20 px-4">
        <h2
          className="text-3xl md:text-4xl font-bold text-center mb-12 tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Upgrade the experience
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free plan */}
          <div
            className="rounded-xl p-8 flex flex-col"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
            }}
          >
            <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
              Free
            </h3>
            <div className="mb-6">
              <span className="text-4xl font-black" style={{ color: 'var(--color-text-primary)' }}>$0</span>
              <span className="text-sm ml-1" style={{ color: 'var(--color-text-muted)' }}>forever</span>
            </div>
            <ul className="flex-1 space-y-3 mb-8">
              {['Unlimited chats', 'Random matching', 'Text chat'].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <Check className="w-4 h-4 shrink-0" style={{ color: '#10B981' }} />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={handleStartChat}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer"
              style={{
                border: '1px solid var(--color-border)',
                background: 'transparent',
                color: 'var(--color-text-primary)',
              }}
            >
              Get Started
            </button>
          </div>

          {/* Premium plan */}
          <div
            className="rounded-xl p-8 flex flex-col relative"
            style={{
              background: 'var(--color-bg-card)',
              border: '2px solid #8B5CF6',
            }}
          >
            {/* Popular badge */}
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #6366F1)' }}
            >
              Popular
            </div>
            <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
              Premium
            </h3>
            <div className="mb-6">
              <span className="text-4xl font-black" style={{ color: 'var(--color-text-primary)' }}>$4.99</span>
              <span className="text-sm ml-1" style={{ color: 'var(--color-text-muted)' }}>/month</span>
            </div>
            <ul className="flex-1 space-y-3 mb-8">
              {[
                'Everything in Free',
                'Gender filter',
                'Interest matching priority',
                'AI ice breakers',
                'VIP rooms',
                'No ads',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <Check className="w-4 h-4 shrink-0" style={{ color: '#8B5CF6' }} />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => router.push('/premium')}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-[1.02] cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #6366F1)' }}
            >
              Go Premium
            </button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════ */}
      <footer
        className="py-12 px-4"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <div className="max-w-4xl mx-auto text-center">
          {/* Tagline */}
          <p className="text-sm font-medium mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            WhisperLink — Talk freely. Stay anonymous.
          </p>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 mb-6">
            {[
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Terms', href: '/terms' },
              { label: 'Safety', href: '/safety' },
              { label: 'Contact', href: '/contact' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs transition-colors duration-200"
                style={{ color: 'var(--color-text-muted)' }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.color = 'var(--color-text-secondary)'
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.color = 'var(--color-text-muted)'
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Age notice */}
          <p className="text-xs" style={{ color: 'var(--color-text-muted)', opacity: 0.6 }}>
            18+ only. Please chat responsibly.
          </p>
        </div>
      </footer>
    </div>
  )
}
