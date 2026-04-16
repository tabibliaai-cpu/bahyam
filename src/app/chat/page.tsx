'use client'

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react'
import { useRouter } from 'next/navigation'
import {
  Send,
  Smile,
  Flag,
  Forward,
  X,
  Home,
  Search,
  MessageCircle,
  ChevronDown,
} from 'lucide-react'

/* ════════════════════════════════════════════════════════════
   TYPES
   ════════════════════════════════════════════════════════════ */

type ChatState = 'idle' | 'finding' | 'matched' | 'chatting' | 'disconnected' | 'banned'

interface User {
  id: string
  sessionId: string
  alias: string
  avatarColor: string
  avatarEmoji: string
  isPremium: boolean
  interests: string[]
}

interface Stranger {
  id: string
  alias: string
  avatarColor: string
  avatarEmoji: string
}

interface Message {
  id: string
  senderId: string
  content: string
  type?: string
  createdAt: string
  _optimistic?: boolean
}

interface SystemMessage {
  id: string
  type: 'system'
  content: string
}

type AnyMessage = (Message | SystemMessage) & { _hovered?: boolean }

/* ════════════════════════════════════════════════════════════
   CONSTANTS
   ════════════════════════════════════════════════════════════ */

const INTERESTS_MAP: Record<string, { label: string; emoji: string }> = {
  gaming: { label: 'Gaming', emoji: '🎮' },
  music: { label: 'Music', emoji: '🎵' },
  movies: { label: 'Movies', emoji: '🎬' },
  sports: { label: 'Sports', emoji: '⚽' },
  tech: { label: 'Tech', emoji: '💻' },
  art: { label: 'Art', emoji: '🎨' },
  travel: { label: 'Travel', emoji: '✈️' },
  food: { label: 'Food', emoji: '🍕' },
  books: { label: 'Books', emoji: '📚' },
  crypto: { label: 'Crypto', emoji: '₿' },
  fitness: { label: 'Fitness', emoji: '💪' },
  science: { label: 'Science', emoji: '🔬' },
  anime: { label: 'Anime', emoji: '⛩️' },
  fashion: { label: 'Fashion', emoji: '👗' },
  photography: { label: 'Photography', emoji: '📸' },
}

const COMMON_EMOJIS = [
  '😀','😂','🥹','😍','🤩','😎','🥺','😤','🫡','🤔',
  '💀','👻','🔥','❤️','💜','💯','✨','🎉','🙌','👋',
  '🤝','👍','👎','👀','🫣','🤫','😏','🫶','💔','🥂',
  '☕','🎮','🎵','📚','✈️','🍕','💻','⚡','🌙','🌟',
]

const REPORT_REASONS = [
  'Inappropriate content',
  'Harassment',
  'Spam',
  'Underage',
  'Other',
]

const MSG_GROUP_WINDOW = 60_000 // 60 seconds

/* ════════════════════════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════════════════════════ */

let _idCounter = 0
function uid(): string {
  return `local-${Date.now()}-${++_idCounter}`
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function timeDiffMs(a: string, b: string): number {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime())
}

/* ════════════════════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════════════════════ */

export default function ChatPage() {
  const router = useRouter()

  /* ── Core state ── */
  const [chatState, setChatState] = useState<ChatState>('idle')
  const [user, setUser] = useState<User | null>(null)
  const [stranger, setStranger] = useState<Stranger | null>(null)
  const [roomId, setRoomId] = useState<string | null>(null)
  const [messages, setMessages] = useState<AnyMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [strangerTyping, setStrangerTyping] = useState(false)
  const [showNewMsgBtn, setShowNewMsgBtn] = useState(false)
  const [skipCooldown, setSkipCooldown] = useState(false)

  /* ── UI toggles ── */
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showSkipConfirm, setShowSkipConfirm] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDetails, setReportDetails] = useState('')

  /* ── Ice breakers ── */
  const [iceBreakers, setIceBreakers] = useState<string[]>([])

  /* ── Selected interests (from localStorage) ── */
  const selectedInterests = useRef<string[]>([])

  /* ── Refs ── */
  const messageEndRef = useRef<HTMLDivElement>(null)
  const messageContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const typingSendTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipCooldownTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const matchedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const iceBreakerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFindingRef = useRef(false)
  const currentRoomIdRef = useRef<string | null>(null)
  const currentUserIdRef = useRef<string | null>(null)
  const strangerTypingSince = useRef<number>(0)

  /* ════════════════════════════════════════════════════════
     SESSION INIT
     ════════════════════════════════════════════════════════ */
  useEffect(() => {
    const initSession = async () => {
      try {
        const sessionId = localStorage.getItem('wl_session')
        const res = await fetch('/api/wl/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: sessionId || undefined }),
        })
        const data = await res.json()
        if (data.user) {
          localStorage.setItem('wl_session', data.user.sessionId)
          setUser(data.user)
          currentUserIdRef.current = data.user.id
        }
        if (data.banned || data.user?.isBanned) {
          setChatState('banned')
          return
        }

        // Load interests from localStorage
        try {
          const saved = localStorage.getItem('wl_interests')
          if (saved) selectedInterests.current = JSON.parse(saved)
        } catch {}

        // Auto-start finding
        setChatState('finding')
      } catch {
        setChatState('idle')
      }
    }
    initSession()
  }, [])

  /* ════════════════════════════════════════════════════════
     FINDING LOGIC
     ════════════════════════════════════════════════════════ */
  const startFinding = useCallback(async () => {
    if (!user || isFindingRef.current) return
    isFindingRef.current = true
    setChatState('finding')
    setMessages([])
    setStranger(null)
    setRoomId(null)
    setIceBreakers([])
    setShowNewMsgBtn(false)
    currentRoomIdRef.current = null

    try {
      // 1. Join queue
      const queueRes = await fetch('/api/wl/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          interests: selectedInterests.current,
          isPremium: user.isPremium,
        }),
      })
      const queueData = await queueRes.json()

      if (queueData.banned) {
        setChatState('banned')
        isFindingRef.current = false
        return
      }

      // Check if matched immediately
      if (queueData.matched && queueData.roomId && queueData.stranger) {
        setStranger(queueData.stranger)
        setRoomId(queueData.roomId)
        currentRoomIdRef.current = queueData.roomId
        isFindingRef.current = false
        transitionToMatched(queueData.stranger, queueData.roomId)
        return
      }

      // 2. Start polling
      const poll = async () => {
        if (!isFindingRef.current || !user) return
        try {
          const statusRes = await fetch(`/api/wl/queue/status?userId=${user.id}`)
          const statusData = await statusRes.json()

          if (statusData.banned) {
            setChatState('banned')
            isFindingRef.current = false
            return
          }

          if (statusData.matched && statusData.roomId && statusData.stranger) {
            setStranger(statusData.stranger)
            setRoomId(statusData.roomId)
            currentRoomIdRef.current = statusData.roomId
            isFindingRef.current = false
            transitionToMatched(statusData.stranger, statusData.roomId)
            return
          }

          // Keep polling
          if (isFindingRef.current) {
            setTimeout(poll, 1500)
          }
        } catch {
          // Retry on error
          if (isFindingRef.current) {
            setTimeout(poll, 2000)
          }
        }
      }

      setTimeout(poll, 1500)
    } catch {
      isFindingRef.current = false
      setChatState('idle')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  /* FIX: removed startFinding from deps to prevent infinite re-trigger loop */
  useEffect(() => {
    if (user && chatState === 'idle') {
      const timer = setTimeout(() => startFinding(), 300)
      return () => clearTimeout(timer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, chatState])

  /* ════════════════════════════════════════════════════════
     MATCHED → CHATTING TRANSITION
     ════════════════════════════════════════════════════════ */
  const transitionToMatched = useCallback(
    (matchedStranger: Stranger, matchedRoomId: string) => {
      setChatState('matched')

      // After 2s, transition to chatting
      matchedTimerRef.current = setTimeout(async () => {
        setChatState('chatting')

        // Add system message
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            type: 'system',
            content: `You are now chatting with ${matchedStranger.alias} ${matchedStranger.avatarEmoji}`,
          },
        ])

        // Fetch ice breakers if premium
        if (user?.isPremium) {
          try {
            const iceRes = await fetch('/api/wl/icebreaker', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                interests1: user.interests || [],
                interests2: [],
              }),
            })
            const iceData = await iceRes.json()
            if (iceData.suggestions?.length > 0) {
              setIceBreakers(iceData.suggestions.slice(0, 3))
              // Auto-dismiss after 60s
              iceBreakerTimerRef.current = setTimeout(() => setIceBreakers([]), 60_000)
            }
          } catch {}
        }
      }, 2000)
    },
    [user],
  )

  /* ════════════════════════════════════════════════════════
     WATCHDOG HEARTBEAT (every 30s while finding or chatting)
     Keeps last_seen alive so cron/matchmaker won't kill the room
     ════════════════════════════════════════════════════════ */
  useEffect(() => {
    if ((chatState !== 'chatting' && chatState !== 'finding') || !user) return

    const ping = async () => {
      try {
        const body: Record<string, string> = { userId: user.id }
        if (currentRoomIdRef.current) body.roomId = currentRoomIdRef.current
        const res = await fetch('/api/wl/watchdog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const data = await res.json()
        // If watchdog says room ended (not by us), trigger disconnect
        if (data.roomStatus && data.roomStatus !== 'active' && currentRoomIdRef.current) {
          setChatState('disconnected')
        }
      } catch {}
    }

    ping() // immediate on state entry
    const interval = setInterval(ping, 30_000)
    return () => clearInterval(interval)
  }, [chatState, user])

  /* ════════════════════════════════════════════════════════
     MESSAGE POLLING (every 800ms while chatting)
     ════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (chatState !== 'chatting' || !roomId) return

    let lastTimestamp = new Date(Date.now() - 60_000).toISOString()
    let pollInterval: ReturnType<typeof setInterval>
    const activeRoomId = roomId

    const poll = async () => {
      if (!activeRoomId) return
      try {
        const res = await fetch(
          `/api/wl/messages?roomId=${activeRoomId}&after=${encodeURIComponent(lastTimestamp)}`,
        )
        const data = await res.json()

        if (data.disconnected) {
          setChatState('disconnected')
          clearInterval(pollInterval)
          return
        }

        if (data.messages?.length > 0) {
          setMessages((prev) => {
            // Deduplicate by id
            const existingIds = new Set(prev.map((m) => m.id))
            const newMsgs = data.messages.filter(
              (m: Message) => !existingIds.has(m.id),
            ) as Message[]
            return [...prev, ...newMsgs]
          })
          lastTimestamp =
            data.messages[data.messages.length - 1].createdAt
        }
      } catch {}
    }

    pollInterval = setInterval(poll, 800)
    return () => clearInterval(pollInterval)
  }, [chatState, roomId])

  /* ════════════════════════════════════════════════════════
     TYPING POLLING (every 2s while chatting)
     ════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (chatState !== 'chatting' || !roomId || !user) return

    let typingInterval: ReturnType<typeof setInterval>
    const activeRoomId = roomId

    const checkTyping = async () => {
      if (!activeRoomId || !user) return
      try {
        const res = await fetch(
          `/api/wl/typing?roomId=${activeRoomId}&userId=${user.id}`,
        )
        const data = await res.json()
        if (data.isTyping) {
          strangerTypingSince.current = Date.now()
          setStrangerTyping(true)
        } else if (Date.now() - strangerTypingSince.current > 5000) {
          setStrangerTyping(false)
        }
      } catch {}
    }

    typingInterval = setInterval(checkTyping, 2000)

    // Also check the 5-second max show time
    const maxShowInterval = setInterval(() => {
      if (Date.now() - strangerTypingSince.current > 5000) {
        setStrangerTyping(false)
      }
    }, 1000)

    return () => {
      clearInterval(typingInterval)
      clearInterval(maxShowInterval)
    }
  }, [chatState, roomId, user])

  /* ════════════════════════════════════════════════════════
     AUTO-SCROLL
     ════════════════════════════════════════════════════════ */
  const scrollToBottom = useCallback((force = false) => {
    if (force) {
      messageEndRef.current?.scrollIntoView({ behavior: 'instant' })
      setShowNewMsgBtn(false)
      return
    }
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    setShowNewMsgBtn(false)
  }, [])

  // Auto-scroll on new messages (if already near bottom)
  useEffect(() => {
    const container = messageContainerRef.current
    if (!container) return

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 120

    if (isNearBottom) {
      requestAnimationFrame(() => scrollToBottom())
    } else if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1]
      if (lastMsg && 'senderId' in lastMsg && lastMsg.senderId !== user?.id) {
        setShowNewMsgBtn(true)
      }
    }
  }, [messages, scrollToBottom, user])

  /* ════════════════════════════════════════════════════════
     SEND MESSAGE
     ════════════════════════════════════════════════════════ */
  const sendMessage = useCallback(async () => {
    const text = inputText.trim()
    if (!text || !user || !roomId) return

    setInputText('')
    setShowEmojiPicker(false)
    setIceBreakers([]) // Dismiss ice breakers after first message
    if (iceBreakerTimerRef.current) {
      clearTimeout(iceBreakerTimerRef.current)
      iceBreakerTimerRef.current = null
    }

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    // Optimistic message
    const optimistic: Message = {
      id: uid(),
      senderId: user.id,
      content: text,
      createdAt: new Date().toISOString(),
      _optimistic: true,
    }
    setMessages((prev) => [...prev, optimistic])

    try {
      const res = await fetch('/api/wl/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, senderId: user.id, content: text }),
      })
      const data = await res.json()

      if (data.message) {
        // Replace optimistic with real message
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimistic.id
              ? { ...data.message, _optimistic: false }
              : m,
          ),
        )
      }
    } catch {
      // Mark as failed — could add error indicator
    }
  }, [inputText, user, roomId])

  /* ════════════════════════════════════════════════════════
     TYPING STATE (send to server)
     ════════════════════════════════════════════════════════ */
  const sendTypingState = useCallback(
    (typing: boolean) => {
      if (!roomId || !user) return
      fetch('/api/wl/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, userId: user.id, typing }),
      }).catch(() => {})
    },
    [roomId, user],
  )

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value
      if (val.length > 1000) return
      setInputText(val)

      // Auto-resize
      const ta = e.target
      ta.style.height = 'auto'
      ta.style.height = Math.min(ta.scrollHeight, 128) + 'px'

      // Send typing state
      if (val.trim() && chatState === 'chatting') {
        sendTypingState(true)

        // Debounce stop typing
        if (typingSendTimeoutRef.current) clearTimeout(typingSendTimeoutRef.current)
        typingSendTimeoutRef.current = setTimeout(() => {
          sendTypingState(false)
        }, 2000)
      }
    },
    [chatState, sendTypingState],
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        sendMessage()
      }
    },
    [sendMessage],
  )

  /* ════════════════════════════════════════════════════════
     SKIP
     ════════════════════════════════════════════════════════ */
  const handleSkip = useCallback(async () => {
    setShowSkipConfirm(false)
    if (!user || !roomId) return

    // Cooldown
    setSkipCooldown(true)
    if (skipCooldownTimer.current) clearTimeout(skipCooldownTimer.current)
    skipCooldownTimer.current = setTimeout(() => setSkipCooldown(false), 3000)

    try {
      await fetch('/api/wl/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, roomId }),
      })
    } catch {}

    setMessages((prev) => [
      ...prev,
      { id: uid(), type: 'system' as const, content: 'You skipped this chat' },
    ])

    // Reset and start finding
    setStranger(null)
    setRoomId(null)
    currentRoomIdRef.current = null
    isFindingRef.current = false

    // Small delay then start finding
    setTimeout(() => {
      setChatState('idle')
    }, 100)
  }, [user, roomId])

  /* ════════════════════════════════════════════════════════
     REPORT
     FIX: removed duplicate setChatState('finding') before startFinding()
     ════════════════════════════════════════════════════════ */
  const handleSubmitReport = useCallback(async () => {
    if (!user || !stranger || !roomId || !reportReason) return

    try {
      await fetch('/api/wl/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterId: user.id,
          reportedId: stranger.id,
          roomId,
          reason: reportReason + (reportDetails ? `: ${reportDetails}` : ''),
        }),
      })
    } catch {}

    setShowReportModal(false)
    setReportReason('')
    setReportDetails('')

    // Reset state
    setStranger(null)
    setRoomId(null)
    currentRoomIdRef.current = null
    isFindingRef.current = false
    setMessages([])

    // FIX: only call startFinding — it sets chatState internally; avoid race condition
    setTimeout(() => {
      startFinding()
    }, 100)
  }, [user, stranger, roomId, reportReason, reportDetails, startFinding])

  /* ════════════════════════════════════════════════════════
     CANCEL FINDING
     ════════════════════════════════════════════════════════ */
  const cancelFinding = useCallback(() => {
    isFindingRef.current = false
    setChatState('idle')
  }, [])

  /* ════════════════════════════════════════════════════════
     CLEANUP
     ════════════════════════════════════════════════════════ */
  useEffect(() => {
    return () => {
      isFindingRef.current = false
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      if (typingSendTimeoutRef.current) clearTimeout(typingSendTimeoutRef.current)
      if (skipCooldownTimer.current) clearTimeout(skipCooldownTimer.current)
      if (matchedTimerRef.current) clearTimeout(matchedTimerRef.current)
      if (iceBreakerTimerRef.current) clearTimeout(iceBreakerTimerRef.current)
    }
  }, [])

  /* ════════════════════════════════════════════════════════
     ICE BREAKER CLICK
     ════════════════════════════════════════════════════════ */
  const handleIceBreakerClick = useCallback((text: string) => {
    setInputText(text)
    if (textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 128) + 'px'
    }
  }, [])

  /* ════════════════════════════════════════════════════════
     COMPUTED VALUES
     ════════════════════════════════════════════════════════ */
  const chatDuration = messages.length > 0
    ? (() => {
        const nonSystem = messages.filter((m): m is Message => 'createdAt' in m && typeof m.createdAt === 'string')
        if (nonSystem.length < 2) return 0
        const times = nonSystem.map((m) => new Date(m.createdAt).getTime()).filter(Boolean)
        if (times.length < 2) return 0
        return Math.round((Math.max(...times) - Math.min(...times)) / 60000)
      })()
    : 0

  const msgCount = messages.filter((m) => 'senderId' in m).length

  /* ════════════════════════════════════════════════════════
     EMOJI PICKER
     ════════════════════════════════════════════════════════ */
  const handleEmojiClick = useCallback((emoji: string) => {
    setInputText((prev) => {
      const newVal = prev + emoji
      return newVal.length > 1000 ? prev : newVal
    })
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  /* ══════════════════════════════════════════════════════════
     STATUS CONFIG
     ════════════════════════════════════════════════════════ */
  const statusConfig = {
    idle: { dot: 'bg-gray-500', label: 'Ready to chat', pulse: false },
    finding: { dot: 'bg-purple-500', label: 'Finding a match...', pulse: true },
    matched: { dot: 'bg-green-500', label: 'Connected!', pulse: false, flash: true },
    chatting: {
      dot: 'bg-green-500',
      label: stranger ? `${stranger.avatarEmoji} ${stranger.alias}` : 'Connected',
      pulse: false,
    },
    disconnected: { dot: 'bg-red-500', label: 'Stranger disconnected', pulse: false },
    banned: { dot: 'bg-red-500', label: 'Account suspended', pulse: false },
  }

  const status = statusConfig[chatState]

  /* ════════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════════ */
  return (
    <div
      className="flex flex-col overflow-hidden relative"
      style={{ height: '100dvh', background: 'var(--color-bg)' }}
    >
      {/* ── INLINE KEYFRAMES ── */}
      <style>{`
        @keyframes radar-ring {
          0% { transform: scale(0.5); opacity: 0.6; }
          100% { transform: scale(3); opacity: 0; }
        }
        @keyframes flash-overlay {
          0% { opacity: 0.6; }
          100% { opacity: 0; }
        }
        @keyframes matched-scale {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes float-icon {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes dot-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes slide-up-fade {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes pop-in {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* ════════════════════════════════════════════════
          HEADER
          ════════════════════════════════════════════════ */}
      <header
        className="flex items-center justify-between px-3 md:px-5 flex-shrink-0 relative z-20"
        style={{
          height: 52,
          minHeight: 52,
          background: 'rgba(8,9,14,0.9)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        {/* Left — Logo */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 cursor-pointer"
          aria-label="Go home"
        >
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg font-black text-white text-sm"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #6366F1)' }}
          >
            W
          </div>
          <span
            className="hidden sm:block text-sm font-bold tracking-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            WhisperLink
          </span>
        </button>

        {/* Center — Status */}
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${status.dot}`}
            style={
              status.pulse
                ? {
                    animation:
                      'pulse-glow 2s ease-in-out infinite, radar-pulse 1.5s ease-out infinite',
                  }
                : ('flash' in status && status.flash)
                  ? { animation: 'pulse-glow 0.5s ease-out 3' }
                  : {}
            }
          />
          <span
            className="text-xs sm:text-sm font-medium truncate max-w-[200px]"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {status.label}
          </span>
        </div>

        {/* Right — Actions */}
        {(chatState === 'chatting' || chatState === 'matched') && (
          <div className="flex items-center gap-2">
            {/* Skip button */}
            <div className="relative">
              <button
                onClick={() => setShowSkipConfirm(true)}
                disabled={skipCooldown}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  border: '1px solid var(--color-border)',
                  background: 'transparent',
                  color: skipCooldown
                    ? 'var(--color-text-muted)'
                    : 'var(--color-text-secondary)',
                }}
              >
                <Forward className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Skip</span>
              </button>

              {/* Skip confirmation */}
              {showSkipConfirm && (
                <div
                  className="absolute right-0 top-full mt-2 p-3 rounded-xl z-50"
                  style={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    animation: 'pop-in 0.15s ease-out',
                    minWidth: 160,
                  }}
                >
                  <p
                    className="text-xs font-medium mb-2"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Skip this chat?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowSkipConfirm(false)}
                      className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      No
                    </button>
                    <button
                      onClick={handleSkip}
                      className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white cursor-pointer"
                      style={{
                        background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                      }}
                    >
                      Yes
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Report button */}
            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer"
              style={{
                border: '1px solid rgba(239,68,68,0.3)',
                background: 'transparent',
                color: '#EF4444',
              }}
            >
              <Flag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Report</span>
            </button>
          </div>
        )}

        {/* Placeholder to keep header balanced when no actions */}
        {(chatState !== 'chatting' && chatState !== 'matched') && (
          <div className="w-20" />
        )}
      </header>

      {/* ════════════════════════════════════════════════
          MESSAGE AREA
          ════════════════════════════════════════════════ */}
      <div
        className="flex-1 overflow-y-auto relative"
        style={{ background: '#08090E' }}
      >
        {/* ── IDLE STATE ── */}
        {chatState === 'idle' && (
          <div className="flex flex-col items-center justify-center h-full px-4">
            <div
              className="text-5xl mb-4"
              style={{ animation: 'float-icon 3s ease-in-out infinite' }}
            >
              💬
            </div>
            <p
              className="text-lg font-medium mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Ready to connect
            </p>
            <p
              className="text-sm mb-6 text-center max-w-xs"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Click the button below to find a stranger to chat with
            </p>
            <button
              onClick={startFinding}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:scale-[1.03] cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                boxShadow: '0 0 20px rgba(139,92,246,0.3)',
              }}
            >
              <Search className="w-4 h-4" />
              Find a Stranger
            </button>
          </div>
        )}

        {/* ── FINDING STATE ── */}
        {chatState === 'finding' && (
          <div className="flex flex-col items-center justify-center h-full px-4 relative">
            {/* Radar circles */}
            <div className="relative w-48 h-48 flex items-center justify-center mb-8">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: 60 + i * 36,
                    height: 60 + i * 36,
                    border: `2px solid rgba(139,92,246,${0.4 - i * 0.1})`,
                    background: `rgba(139,92,246,${0.06 - i * 0.015})`,
                    animation: `radar-ring 3s ease-out ${i * 0.8}s infinite`,
                  }}
                />
              ))}
              {/* Center icon */}
              <div
                className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                  boxShadow: '0 0 30px rgba(139,92,246,0.4)',
                }}
              >
                🔮
              </div>
            </div>

            <p
              className="text-xl font-medium mb-3"
              style={{ color: '#CBD5E1', animation: 'slide-up-fade 0.5s ease-out' }}
            >
              Searching the universe for a stranger...
            </p>

            {/* Interest tags */}
            {selectedInterests.current.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6 justify-center">
                {selectedInterests.current.map((id) => {
                  const interest = INTERESTS_MAP[id]
                  if (!interest) return null
                  return (
                    <span
                      key={id}
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        background: 'rgba(139,92,246,0.12)',
                        border: '1px solid rgba(139,92,246,0.25)',
                        color: '#C4B5FD',
                      }}
                    >
                      {interest.emoji} {interest.label}
                    </span>
                  )
                })}
              </div>
            )}

            <p
              className="text-xs mb-6"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Usually under 5 seconds
            </p>

            <button
              onClick={cancelFinding}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
              style={{
                border: '1px solid var(--color-border)',
                background: 'transparent',
                color: 'var(--color-text-secondary)',
              }}
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        )}

        {/* ── MATCHED STATE ── */}
        {chatState === 'matched' && user && stranger && (
          <div className="flex flex-col items-center justify-center h-full px-4 relative">
            {/* Flash overlay */}
            <div
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                background: 'rgba(139,92,246,0.15)',
                animation: 'flash-overlay 0.6s ease-out forwards',
              }}
            />

            <div
              className="relative z-20 flex flex-col items-center"
              style={{ animation: 'matched-scale 0.5s ease-out forwards' }}
            >
              {/* Avatars row */}
              <div className="flex items-center gap-4 sm:gap-8 mb-6">
                {/* You */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-3xl sm:text-4xl"
                    style={{ background: `${user.avatarColor}22`, border: `2px solid ${user.avatarColor}44` }}
                  >
                    {user.avatarEmoji}
                  </div>
                  <span
                    className="text-xs sm:text-sm font-medium"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    You
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: user.avatarColor }}
                  >
                    {user.alias}
                  </span>
                </div>

                {/* Connection icon */}
                <div className="flex flex-col items-center">
                  <span className="text-2xl sm:text-3xl" style={{ animation: 'float-icon 2s ease-in-out infinite' }}>
                    💬
                  </span>
                  <span
                    className="text-[10px] mt-1 font-semibold uppercase tracking-wider"
                    style={{ color: '#10B981' }}
                  >
                    Connected
                  </span>
                </div>

                {/* Stranger */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-3xl sm:text-4xl"
                    style={{ background: `${stranger.avatarColor}22`, border: `2px solid ${stranger.avatarColor}44` }}
                  >
                    {stranger.avatarEmoji}
                  </div>
                  <span
                    className="text-xs sm:text-sm font-medium"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Stranger
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: stranger.avatarColor }}
                  >
                    {stranger.alias}
                  </span>
                </div>
              </div>

              <p
                className="text-sm"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Starting your conversation...
              </p>
            </div>
          </div>
        )}

        {/* ── CHATTING STATE — MESSAGES ── */}
        {(chatState === 'chatting' || chatState === 'disconnected') && (
          <div className="flex flex-col h-full">
            {/* FIX: single ref on the correct scroll container only */}
            <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4" ref={messageContainerRef}>
              <div className="max-w-3xl mx-auto space-y-1">
                {messages.map((msg, idx) => {
                  /* System message */
                  if ('type' in msg && msg.type === 'system') {
                    return (
                      <div
                        key={msg.id}
                        className="flex justify-center py-2"
                        style={{ animation: 'fadeIn 0.3s ease-out' }}
                      >
                        <span
                          className="text-xs px-3 py-1 rounded-full"
                          style={{
                            color: 'var(--color-text-muted)',
                            background: 'rgba(31,33,48,0.5)',
                          }}
                        >
                          {msg.content}
                        </span>
                      </div>
                    )
                  }

                  /* Chat message — narrowed to Message type */
                  const chatMsg = msg as Message
                  const isMine = chatMsg.senderId === user?.id
                  const prevMsg = idx > 0 ? messages[idx - 1] : null
                  const prevIsSameSender =
                    prevMsg &&
                    'senderId' in prevMsg &&
                    prevMsg.senderId === chatMsg.senderId &&
                    !(('type' in prevMsg) && prevMsg.type === 'system')
                  const showHeader =
                    !prevIsSameSender ||
                    (prevMsg &&
                      'createdAt' in prevMsg &&
                      timeDiffMs(chatMsg.createdAt, prevMsg.createdAt as string) >
                        MSG_GROUP_WINDOW)

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} ${
                        isMine ? 'msg-sent' : 'msg-received'
                      }`}
                    >
                      {/* Alias header */}
                      {showHeader && !isMine && stranger && (
                        <div
                          className="flex items-center gap-1.5 mb-1 ml-1"
                          style={{ animation: 'fadeIn 0.2s ease-out' }}
                        >
                          <span className="text-sm">{stranger.avatarEmoji}</span>
                          <span
                            className="text-xs font-semibold"
                            style={{ color: stranger.avatarColor }}
                          >
                            {stranger.alias}
                          </span>
                        </div>
                      )}

                      {/* Message bubble */}
                      <div
                        className="group relative max-w-[75%] md:max-w-[60%] px-4 py-2.5"
                        style={{
                          borderRadius: isMine
                            ? '16px 16px 4px 16px'
                            : '16px 16px 16px 4px',
                          background: isMine
                            ? 'linear-gradient(135deg, #8B5CF6, #6366F1)'
                            : '#1F2130',
                          color: isMine ? '#FFFFFF' : 'var(--color-text-primary)',
                          wordBreak: 'break-word',
                          lineHeight: '1.5',
                          fontSize: '0.9rem',
                        }}
                      >
                        <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>

                        {/* Timestamp on hover */}
                        <span
                          className="absolute -bottom-5 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap"
                          style={{
                            left: isMine ? 'auto' : 12,
                            right: isMine ? 12 : 'auto',
                            color: 'var(--color-text-muted)',
                          }}
                        >
                          {formatTime(chatMsg.createdAt)}
                          {chatMsg._optimistic && ' • sending...'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div ref={messageEndRef} className="h-1" />
            </div>

            {/* New message button */}
            {showNewMsgBtn && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                <button
                  onClick={() => scrollToBottom(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium shadow-lg transition-all duration-200 cursor-pointer hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                    color: '#FFFFFF',
                    animation: 'pop-in 0.2s ease-out',
                  }}
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                  New message
                </button>
              </div>
            )}

            {/* ── DISCONNECTED OVERLAY ── */}
            {chatState === 'disconnected' && (
              <div
                className="absolute inset-0 z-30 flex items-center justify-center px-4"
                style={{
                  background: 'rgba(8,9,14,0.85)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }}
              >
                <div
                  className="flex flex-col items-center text-center max-w-sm w-full"
                  style={{ animation: 'slide-up-fade 0.4s ease-out' }}
                >
                  <span
                    className="text-6xl mb-4"
                    style={{ animation: 'float-icon 3s ease-in-out infinite' }}
                  >
                    👻
                  </span>
                  <h2
                    className="text-xl font-bold mb-2"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Stranger has left the chat
                  </h2>
                  {msgCount > 0 && (
                    <p
                      className="text-sm mb-6"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      You exchanged {msgCount} message{msgCount !== 1 ? 's' : ''}
                      {chatDuration > 0
                        ? ` over ${chatDuration} minute${chatDuration !== 1 ? 's' : ''}`
                        : ''}
                    </p>
                  )}
                  {msgCount === 0 && (
                    <p
                      className="text-sm mb-6"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      The stranger disconnected before any messages were exchanged.
                    </p>
                  )}
                  <div className="flex gap-3 w-full">
                    <button
                      onClick={() => {
                        setChatState('idle')
                        setMessages([])
                        setStranger(null)
                        setRoomId(null)
                        currentRoomIdRef.current = null
                        isFindingRef.current = false
                      }}
                      className="flex-1 py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                      style={{
                        background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                      }}
                    >
                      <Search className="w-4 h-4" />
                      Find New Chat
                    </button>
                    <button
                      onClick={() => router.push('/')}
                      className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
                      style={{
                        border: '1px solid var(--color-border)',
                        background: 'transparent',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      <Home className="w-4 h-4" />
                      Go Home
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── BANNED STATE ── */}
        {chatState === 'banned' && (
          <div
            className="absolute inset-0 z-30 flex items-center justify-center px-4"
            style={{ background: '#08090E' }}
          >
            <div
              className="flex flex-col items-center text-center max-w-sm"
              style={{ animation: 'slide-up-fade 0.4s ease-out' }}
            >
              <span className="text-6xl mb-4">🚫</span>
              <h2
                className="text-xl font-bold mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Your account has been suspended
              </h2>
              <p
                className="text-sm mb-8"
                style={{ color: 'var(--color-text-muted)' }}
              >
                This may be due to community guideline violations.
              </p>
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer"
                style={{
                  border: '1px solid var(--color-border)',
                  background: 'transparent',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════
          ICE BREAKER CHIPS (premium, after match)
          ════════════════════════════════════════════════ */}
      {chatState === 'chatting' && iceBreakers.length > 0 && (
        <div
          className="flex-shrink-0 flex gap-2 px-3 md:px-6 py-2 overflow-x-auto"
          style={{
            background: 'var(--color-bg)',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          {iceBreakers.map((text, i) => (
            <button
              key={i}
              onClick={() => handleIceBreakerClick(text)}
              className="whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer hover:scale-105 flex-shrink-0"
              style={{
                border: '1px solid rgba(139,92,246,0.35)',
                background: 'rgba(139,92,246,0.08)',
                color: '#C4B5FD',
                animation: `slide-up-fade 0.3s ease-out ${i * 0.1}s both`,
              }}
            >
              ✨ {text}
            </button>
          ))}
        </div>
      )}

      {/* ════════════════════════════════════════════════
          TYPING INDICATOR
          ════════════════════════════════════════════════ */}
      {chatState === 'chatting' && strangerTyping && stranger && (
        <div
          className="flex-shrink-0 flex items-center gap-2 px-4"
          style={{
            height: 24,
            minHeight: 24,
            background: 'var(--color-bg)',
          }}
        >
          <span className="text-sm">{stranger.avatarEmoji}</span>
          <span
            className="text-xs font-medium"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {stranger.alias} is typing
          </span>
          <span className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1 h-1 rounded-full"
                style={{
                  background: '#8B5CF6',
                  animation: `dot-bounce 1.4s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </span>
        </div>
      )}

      {/* ════════════════════════════════════════════════
          INPUT BAR
          ════════════════════════════════════════════════ */}
      {(chatState === 'chatting' || chatState === 'matched') && (
        <div
          className="flex-shrink-0 px-3 md:px-5 py-2 relative"
          style={{
            background: 'var(--color-bg)',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          {/* Emoji picker */}
          {showEmojiPicker && (
            <div
              className="absolute bottom-full left-3 right-3 md:left-5 md:right-5 mb-2 p-3 rounded-xl z-40 max-h-48 overflow-y-auto"
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                animation: 'pop-in 0.15s ease-out',
              }}
            >
              <div className="grid grid-cols-8 gap-1">
                {COMMON_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiClick(emoji)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-lg hover:bg-white/5 transition-colors duration-100 cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div
            className="flex items-end gap-2 rounded-xl px-3 py-2 transition-all duration-200"
            style={{
              background: 'var(--color-bg-input)',
              border: '1px solid',
              borderColor: showEmojiPicker
                ? 'rgba(139,92,246,0.4)'
                : 'var(--color-border)',
            }}
          >
            {/* Emoji button */}
            <button
              onClick={() => setShowEmojiPicker((v) => !v)}
              className="flex-shrink-0 p-1.5 rounded-lg transition-colors duration-200 cursor-pointer hover:bg-white/5"
              style={{ color: showEmojiPicker ? '#8B5CF6' : '#64748B' }}
              aria-label="Emoji picker"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              disabled={chatState === 'matched'}
              className="flex-1 bg-transparent outline-none resize-none text-sm leading-relaxed placeholder-gray-500"
              style={{
                color: 'var(--color-text-primary)',
                maxHeight: 128,
                minHeight: 36,
                paddingTop: 4,
                paddingBottom: 4,
              }}
            />

            {/* Character counter */}
            {inputText.length >= 900 && (
              <span
                className="text-[10px] flex-shrink-0 mb-1"
                style={{
                  color: inputText.length >= 1000 ? '#EF4444' : 'var(--color-text-muted)',
                }}
              >
                {inputText.length}/1000
              </span>
            )}

            {/* Send button */}
            <button
              onClick={sendMessage}
              disabled={!inputText.trim() || chatState === 'matched'}
              className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
              style={{
                background: inputText.trim()
                  ? 'linear-gradient(135deg, #8B5CF6, #6366F1)'
                  : '#1F2130',
                color: inputText.trim() ? '#FFFFFF' : '#475569',
                boxShadow: inputText.trim()
                  ? '0 0 12px rgba(139,92,246,0.3)'
                  : 'none',
              }}
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════
          REPORT MODAL
          ════════════════════════════════════════════════ */}
      {showReportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              animation: 'pop-in 0.2s ease-out',
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3
                className="text-lg font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Report User
              </h3>
              <button
                onClick={() => {
                  setShowReportModal(false)
                  setReportReason('')
                  setReportDetails('')
                }}
                className="p-1.5 rounded-lg transition-colors duration-200 cursor-pointer hover:bg-white/5"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Radio options */}
            <div className="space-y-2 mb-4">
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200"
                  style={{
                    background:
                      reportReason === reason
                        ? 'rgba(239,68,68,0.08)'
                        : 'transparent',
                    border: `1px solid ${
                      reportReason === reason
                        ? 'rgba(239,68,68,0.3)'
                        : 'var(--color-border)'
                    }`,
                  }}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason}
                    checked={reportReason === reason}
                    onChange={() => setReportReason(reason)}
                    className="sr-only"
                  />
                  <div
                    className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{
                      borderColor:
                        reportReason === reason ? '#EF4444' : 'var(--color-border)',
                    }}
                  >
                    {reportReason === reason && (
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: '#EF4444' }}
                      />
                    )}
                  </div>
                  <span
                    className="text-sm"
                    style={{
                      color:
                        reportReason === reason
                          ? '#FCA5A5'
                          : 'var(--color-text-secondary)',
                    }}
                  >
                    {reason}
                  </span>
                </label>
              ))}
            </div>

            {/* Details */}
            <textarea
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              placeholder="Additional details (optional)"
              rows={3}
              className="w-full bg-transparent rounded-xl px-4 py-3 text-sm outline-none resize-none mb-5"
              style={{
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
              }}
            />

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReportModal(false)
                  setReportReason('')
                  setReportDetails('')
                }}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
                style={{
                  border: '1px solid var(--color-border)',
                  background: 'transparent',
                  color: 'var(--color-text-secondary)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReport}
                disabled={!reportReason}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                style={{
                  background: reportReason
                    ? '#EF4444'
                    : '#1F2130',
                }}
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
