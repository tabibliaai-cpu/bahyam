'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Github, Shield, AlertTriangle, Flag, SkipForward, Phone, Heart } from 'lucide-react'

/* ─── Component ─── */
export default function SafetyPage() {
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
        .fade-in-up-d1 { animation: fadeIn 0.5s ease-out 0.1s forwards; opacity: 0; }
        .fade-in-up-d2 { animation: fadeIn 0.5s ease-out 0.2s forwards; opacity: 0; }
        .fade-in-up-d3 { animation: fadeIn 0.5s ease-out 0.3s forwards; opacity: 0; }
        .fade-in-up-d4 { animation: fadeIn 0.5s ease-out 0.4s forwards; opacity: 0; }
        .fade-in-up-d5 { animation: fadeIn 0.5s ease-out 0.5s forwards; opacity: 0; }
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
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
              Safety &amp; Community Guidelines
            </h1>
            <p className="text-lg leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Keeping WhisperLink safe, respectful, and welcoming for everyone
            </p>
          </div>
        </section>

        {/* ─── Sections ─── */}
        <section className="pb-20 px-4">
          <div className="max-w-3xl mx-auto space-y-6">

            {/* 1. Our Commitment to Safety */}
            <div
              className="rounded-xl p-6 md:p-8 fade-in-up-d1"
              style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-5 h-5" style={{ color: '#8B5CF6' }} />
                <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  Our Commitment to Safety
                </h2>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                At WhisperLink, your safety is our top priority. We believe that anonymity should never come at the cost
                of feeling secure. That&apos;s why we&apos;ve built a multi-layered safety system that combines AI-powered
                moderation, community-driven reporting, and transparent guidelines to create a space where everyone can
                express themselves freely without fear of harassment, abuse, or exploitation. We continuously invest in
                improving our safety infrastructure and respond swiftly to any emerging threats.
              </p>
            </div>

            {/* 2. Community Rules */}
            <div
              className="rounded-xl p-6 md:p-8 fade-in-up-d2"
              style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-5 h-5" style={{ color: '#F59E0B' }} />
                <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  Community Rules
                </h2>
              </div>
              <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                By using WhisperLink, you agree to follow these rules. Violations may result in warnings, temporary
                bans, or permanent removal from the platform.
              </p>
              <ol className="space-y-3">
                {[
                  {
                    rule: 'Be respectful to everyone',
                    detail: 'Treat every person you chat with the way you would want to be treated. Kindness goes a long way, even anonymously.',
                  },
                  {
                    rule: 'No harassment, bullying, or threats',
                    detail: 'Any form of intimidation, hate speech, sexual harassment, or threatening behavior is strictly prohibited and will result in an immediate ban.',
                  },
                  {
                    rule: 'No sharing of personal information (yours or others)',
                    detail: 'Never share your real name, address, phone number, social media handles, or any other identifying information. Do not attempt to deanonymize other users.',
                  },
                  {
                    rule: 'No illegal content or activities',
                    detail: 'Content involving illegal activities, child exploitation, terrorism, or any violation of law is absolutely prohibited and will be reported to authorities.',
                  },
                  {
                    rule: 'No spam or unsolicited advertising',
                    detail: 'Do not use WhisperLink to promote products, services, cryptocurrency schemes, or any commercial content without the other person\'s consent.',
                  },
                  {
                    rule: 'You must be 18 or older to use WhisperLink',
                    detail: 'WhisperLink is exclusively for adults aged 18 and above. Anyone under 18 found using the platform will be permanently banned.',
                  },
                ].map((item, index) => (
                  <li key={index} className="flex gap-3">
                    <span
                      className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', marginTop: '2px' }}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                        {item.rule}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {item.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* 3. How Moderation Works */}
            <div
              className="rounded-xl p-6 md:p-8 fade-in-up-d3"
              style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5" style={{ color: '#10B981' }} />
                <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  How Moderation Works
                </h2>
              </div>
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                WhisperLink uses a three-tier moderation system to keep the platform safe:
              </p>
              <div className="space-y-4">
                {[
                  {
                    title: 'AI-Powered Content Scanning',
                    desc: 'Every message sent through WhisperLink is scanned in real-time by our AI moderation system. It detects hate speech, harassment, sexual content, threats, and other policy violations. Flagged messages can trigger automatic warnings or bans.',
                    color: '#8B5CF6',
                  },
                  {
                    title: 'User Reporting',
                    desc: 'Every user can report a conversation partner at any time by clicking the report button. Reports are reviewed by our moderation system. Users who receive multiple reports are automatically flagged for review.',
                    color: '#F59E0B',
                  },
                  {
                    title: 'Automatic Ban System',
                    desc: 'Users who violate our guidelines face progressive consequences: a warning for first offenses, a temporary 24-hour ban for repeated violations, and a permanent ban for severe or persistent violations. These actions are applied automatically.',
                    color: '#EF4444',
                  },
                ].map((tier) => (
                  <div
                    key={tier.title}
                    className="rounded-lg p-4"
                    style={{ background: 'rgba(139,92,246,0.05)', borderLeft: `3px solid ${tier.color}` }}
                  >
                    <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                      {tier.title}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {tier.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. How to Report */}
            <div
              className="rounded-xl p-6 md:p-8 fade-in-up-d4"
              style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Flag className="w-5 h-5" style={{ color: '#EF4444' }} />
                <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  How to Report
                </h2>
              </div>
              <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                If you encounter a user who is violating our guidelines, follow these steps:
              </p>
              <ol className="space-y-3">
                {[
                  'Click the "Report" button (flag icon) in the chat interface during your conversation.',
                  'Select the reason for your report from the available options (harassment, inappropriate content, spam, etc.).',
                  'Optionally, add a brief description of what happened to help our moderation team.',
                  'Submit the report. You will immediately be disconnected from the reported user and matched with someone new.',
                  'Our system will review the report and take appropriate action. You do not need to take any further steps.',
                ].map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <span
                      className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', marginTop: '2px' }}
                    >
                      {index + 1}
                    </span>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            {/* 5. Block & Skip */}
            <div
              className="rounded-xl p-6 md:p-8 fade-in-up-d4"
              style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <SkipForward className="w-5 h-5" style={{ color: '#8B5CF6' }} />
                <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  Block &amp; Skip
                </h2>
              </div>
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                Not every conversation will be a great match, and that&apos;s completely okay. WhisperLink gives you full
                control over your chat experience:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg p-4" style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid var(--color-border)' }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Skip (Next)</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Click "Next" to immediately end the current conversation and be matched with a new partner. No explanation needed — skip as many times as you want.
                  </p>
                </div>
                <div className="rounded-lg p-4" style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid var(--color-border)' }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Disconnect</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Click "Disconnect" to end the conversation and return to the home screen. All chat messages are immediately deleted from our servers.
                  </p>
                </div>
              </div>
            </div>

            {/* 6. Crisis Resources */}
            <div
              className="rounded-xl p-6 md:p-8 fade-in-up-d5"
              style={{ background: 'var(--color-bg-card)', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Phone className="w-5 h-5" style={{ color: '#EF4444' }} />
                <h2 className="text-xl font-bold" style={{ color: '#EF4444' }}>
                  Crisis Resources
                </h2>
              </div>
              <p className="text-sm mb-5" style={{ color: 'var(--color-text-secondary)' }}>
                If you or someone you know is in crisis or needs immediate help, please reach out to one of these
                resources. You are not alone, and help is available 24/7.
              </p>
              <div className="space-y-3">
                {[
                  {
                    name: 'National Suicide Prevention Lifeline',
                    contact: '988',
                    detail: 'Call or text 988 — free, confidential, 24/7 support for people in distress.',
                  },
                  {
                    name: 'Crisis Text Line',
                    contact: 'Text HOME to 741741',
                    detail: 'Text-based crisis support available 24/7. Trained crisis counselors will respond within minutes.',
                  },
                  {
                    name: 'National Domestic Violence Hotline',
                    contact: '1-800-799-7233',
                    detail: 'Confidential support for those experiencing domestic violence. Available 24/7 in over 200 languages.',
                  },
                  {
                    name: 'Trevor Project (LGBTQ+)',
                    contact: '1-866-488-7386',
                    detail: 'Crisis intervention and suicide prevention for LGBTQ+ young people under 25. Available 24/7.',
                  },
                ].map((resource) => (
                  <div
                    key={resource.name}
                    className="rounded-lg p-4"
                    style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {resource.name}
                      </p>
                      <p className="text-sm font-bold" style={{ color: '#EF4444' }}>
                        {resource.contact}
                      </p>
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                      {resource.detail}
                    </p>
                  </div>
                ))}
              </div>
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
