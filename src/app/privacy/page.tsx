'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Github, Lock, FileText, ShieldCheck, Trash2, Cookie, Users, Mail } from 'lucide-react'

/* ─── Sections data ─── */
const SECTIONS = [
  {
    id: 'info-we-collect',
    icon: <FileText className="w-5 h-5" />,
    iconColor: '#8B5CF6',
    title: '1. Information We Collect',
    paragraphs: [
      'WhisperLink is built on the principle of absolute anonymity. We do not collect, store, or process any personal identifying information. You are not required to provide your name, email address, phone number, or any other personal details to use our service.',
      'The only data we generate and temporarily store during your session includes:',
    ],
    bullets: [
      'Random alias — A randomly generated username (e.g., "Cosmic Fox") is assigned to you for each session. This alias is not linked to any real identity.',
      'Session ID — A unique, temporary identifier used to manage your active chat session. Session IDs are not stored persistently and expire when you disconnect.',
      'Chat messages — Messages are stored in memory only for the duration of an active conversation. They are never written to permanent storage (for free users) or are retained for up to 24 hours (for premium subscribers with chat history enabled).',
    ],
  },
  {
    id: 'how-we-use',
    icon: <Users className="w-5 h-5" />,
    iconColor: '#10B981',
    title: '2. How We Use Information',
    paragraphs: [
      'The limited session data described above is used exclusively for the following purposes:',
    ],
    bullets: [
      'Session management — To maintain your connection, route messages between you and your chat partner, and manage the state of your conversation.',
      'Matching — To pair you with other users based on random selection or, for premium users, interest-based and location-based matching preferences.',
      'Moderation — Messages are scanned in real-time by our AI moderation system to detect policy violations. No human being reads your conversations unless a report is filed and requires manual review.',
      'Platform analytics — We collect aggregate, anonymized statistics such as the total number of active users and messages sent. This data cannot be traced back to any individual user.',
    ],
  },
  {
    id: 'data-retention',
    icon: <Trash2 className="w-5 h-5" />,
    iconColor: '#F59E0B',
    title: '3. Data Retention',
    paragraphs: [
      'WhisperLink is designed with data minimization at its core. We keep data only as long as necessary:',
    ],
    bullets: [
      'Free users — All chat messages are deleted from our servers the moment you disconnect from a conversation. No message history is retained.',
      'Premium users — If you have chat history enabled, messages are retained for up to 24 hours after the conversation ends, allowing you to review recent chats. After 24 hours, all messages are permanently and irreversibly deleted.',
      'Session data — Session IDs and temporary aliases expire immediately upon disconnection and are purged from our systems.',
      'Inactive accounts — If you have not used WhisperLink for 90 consecutive days, any associated session data or preferences stored in your browser\'s localStorage will be automatically cleared.',
    ],
  },
  {
    id: 'ai-moderation',
    icon: <ShieldCheck className="w-5 h-5" />,
    iconColor: '#6366F1',
    title: '4. AI Moderation',
    paragraphs: [
      'To maintain a safe and respectful environment, all messages sent through WhisperLink are processed by our AI-powered moderation system in real-time. Here\'s what you need to know:',
    ],
    bullets: [
      'All moderation is performed by automated AI models — no human moderator reads your conversations under normal circumstances.',
      'The AI scans messages for policy violations including hate speech, harassment, threats, illegal content, and explicit material.',
      'When a violation is detected, the system may issue a warning, remove the offending content, or ban the user depending on severity.',
      'In rare cases where a user report requires manual review, only the specifically reported messages are examined by our safety team. No unrelated conversation content is accessed.',
      'AI moderation models are regularly audited and improved to minimize false positives while maintaining robust safety coverage.',
    ],
  },
  {
    id: 'cookies',
    icon: <Cookie className="w-5 h-5" />,
    iconColor: '#EC4899',
    title: '5. Cookies & Local Storage',
    paragraphs: [
      'WhisperLink does not use traditional cookies or tracking technologies. We use your browser\'s localStorage for a limited set of session-related data:',
    ],
    bullets: [
      'Session persistence — A session token is stored in localStorage to keep you connected when you refresh the page or briefly navigate away.',
      'User preferences — Your interest selections, theme preference (if applicable), and other non-identifying settings are saved locally for your convenience.',
      'Premium status — If you are a premium subscriber, your premium status token is stored locally to unlock premium features without requiring re-authentication each visit.',
      'No third-party cookies — We do not use any third-party cookies, tracking pixels, analytics scripts, or advertising identifiers. Your browsing activity on other websites is not tracked by WhisperLink.',
    ],
  },
  {
    id: 'third-parties',
    icon: <Lock className="w-5 h-5" />,
    iconColor: '#14B8A6',
    title: '6. Third Parties',
    paragraphs: [
      'WhisperLink does not sell, rent, share, or otherwise disclose any user data to third parties. Specifically:',
    ],
    bullets: [
      'We do not share data with advertisers, data brokers, analytics companies, or any commercial third parties.',
      'We do not participate in any data-sharing programs or partnerships that would compromise user anonymity.',
      'Payment processing for premium subscriptions is handled by OpenNode, a Bitcoin payment processor. OpenNode receives only the payment amount and a transaction reference — no personal or identifying information is transmitted.',
      'In the event of a legal request (e.g., subpoena or court order), we can only provide aggregate, anonymized data. Since we do not collect personal information, there is no identifiable user data to disclose.',
    ],
  },
  {
    id: 'your-rights',
    icon: <Trash2 className="w-5 h-5" />,
    iconColor: '#8B5CF6',
    title: '7. Your Rights',
    paragraphs: [
      'As a WhisperLink user, you have the following rights regarding your data:',
    ],
    bullets: [
      'Right to deletion — You can request the immediate deletion of all data associated with your session at any time. Clearing your browser\'s localStorage and disconnecting from all active conversations will effectively remove all traces of your presence on our platform.',
      'Right to know — You have the right to understand what data is collected and how it is used. This privacy policy provides full transparency.',
      'Right to opt out — You can opt out of any data collection by simply not using the service. No data is collected until you actively start a chat session.',
      'Right to report — If you believe your privacy has been compromised, contact us immediately at privacy@whisperlink.com and we will investigate and take corrective action.',
    ],
  },
  {
    id: 'contact',
    icon: <Mail className="w-5 h-5" />,
    iconColor: '#6366F1',
    title: '8. Contact',
    paragraphs: [
      'If you have any questions, concerns, or requests regarding this privacy policy or our data practices, please contact us:',
    ],
    bullets: [
      'Email: privacy@whisperlink.com',
      'We aim to respond to all inquiries within 48 hours.',
      'For urgent privacy or security concerns, please include "URGENT" in your email subject line.',
    ],
  },
]

/* ─── Component ─── */
export default function PrivacyPage() {
  const router = useRouter()

  /* Enable scrolling (override globals.css body overflow) */
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

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up { animation: fadeIn 0.5s ease-out forwards; }
        .fade-in-section { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>

      {/* ═══════ NAVBAR ═══════ */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 h-16"
        style={{
          background: 'rgba(8,9,14,0.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-9 h-9 rounded-lg font-black text-white text-lg cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #6366F1)' }}
            onClick={() => router.push('/')}
          >
            W
          </div>
          <span className="hidden sm:block font-bold text-lg tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            WhisperLink
          </span>
        </div>
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

      {/* ═══════ MAIN ═══════ */}
      <main className="flex-1 pt-16">
        {/* ─── Hero ─── */}
        <section className="py-20 md:py-28 px-4 text-center fade-in-up">
          <div className="max-w-3xl mx-auto">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6' }}
            >
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
              Privacy Policy
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Last updated: April 2025
            </p>
          </div>
        </section>

        {/* ─── Policy Sections ─── */}
        <section className="pb-20 px-4">
          <div className="max-w-3xl mx-auto space-y-6">
            {SECTIONS.map((section) => (
              <div
                key={section.id}
                id={section.id}
                className="rounded-xl p-6 md:p-8 fade-in-section"
                style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span style={{ color: section.iconColor }}>{section.icon}</span>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {section.title}
                  </h2>
                </div>
                {section.paragraphs.map((paragraph, pIdx) => (
                  <p key={pIdx} className="text-sm leading-relaxed mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                    {paragraph}
                  </p>
                ))}
                <ul className="space-y-2 mt-2">
                  {section.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="flex gap-2.5">
                      <span
                        className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
                        style={{ background: section.iconColor }}
                      />
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                        {bullet}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Table of Contents (quick nav) ─── */}
        <section className="pb-20 px-4">
          <div
            className="max-w-3xl mx-auto rounded-xl p-6 md:p-8"
            style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
          >
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Quick Navigation
            </h2>
            <div className="flex flex-wrap gap-3">
              {SECTIONS.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                  style={{
                    background: 'rgba(139,92,246,0.08)',
                    color: '#c4b5fd',
                    border: '1px solid rgba(139,92,246,0.15)',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.target as HTMLElement
                    el.style.background = 'rgba(139,92,246,0.15)'
                  }}
                  onMouseLeave={(e) => {
                    const el = e.target as HTMLElement
                    el.style.background = 'rgba(139,92,246,0.08)'
                  }}
                >
                  {section.title.replace(/^\d+\.\s/, '')}
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ═══════ FOOTER ═══════ */}
      <footer
        className="py-10 px-4"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-wrap justify-center gap-6 mb-4">
            {[
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Safety', href: '/safety' },
              { label: 'Premium', href: '/premium' },
              { label: 'Home', href: '/' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs transition-colors duration-200"
                style={{ color: 'var(--color-text-muted)' }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.color = 'var(--color-text-secondary)' }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.color = 'var(--color-text-muted)' }}
              >
                {link.label}
              </a>
            ))}
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)', opacity: 0.6 }}>
            &copy; 2025 WhisperLink. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
