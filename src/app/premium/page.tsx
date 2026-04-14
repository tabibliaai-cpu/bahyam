'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Github, ChevronDown, ArrowLeft, ShieldCheck } from 'lucide-react'

/* ─── FAQ Data ─── */
const FAQ_ITEMS = [
  {
    question: 'How does Bitcoin payment work?',
    answer:
      'When you click "Pay with Bitcoin", you\'ll be redirected to a secure checkout page powered by OpenNode. Simply scan the QR code or send the exact BTC amount to the provided address. Your premium access activates within seconds after the payment confirms — usually 1–2 blocks on the network.',
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      'Absolutely. There are no contracts or commitments. You can cancel your subscription at any time from your account settings. If you cancel, you\'ll continue to have premium access until the end of your current billing period. We do not offer partial refunds.',
  },
  {
    question: 'Is there a free trial?',
    answer:
      'Yes! We offer a 3-day free trial for new premium subscribers. You\'ll get full access to all premium features during the trial period. If you choose not to continue, simply cancel before the trial ends and you won\'t be charged anything.',
  },
  {
    question: 'What happens if I don\'t renew?',
    answer:
      'If your subscription expires, your account automatically reverts to the free plan. You\'ll lose access to premium features like priority matching, gender filters, VIP rooms, and chat history. However, your anonymous alias and any saved preferences remain intact. You can re-subscribe at any time.',
  },
]

/* ─── Feature comparison data ─── */
const FEATURES = [
  { name: 'Unlimited chats', free: true, premium: true },
  { name: 'Random matching', free: true, premium: true },
  { name: 'Text chat', free: true, premium: true },
  { name: 'Priority matching', free: false, premium: true },
  { name: 'Interest-based matching', free: false, premium: true },
  { name: 'Gender preference filter', free: false, premium: true },
  { name: 'AI conversation starters', free: false, premium: true },
  { name: 'VIP rooms', free: false, premium: true },
  { name: 'No ads', free: false, premium: true },
  { name: 'Chat history (24hr)', free: false, premium: true },
  { name: 'Location-based matching', free: false, premium: true },
]

/* ─── Component ─── */
export default function PremiumPage() {
  const router = useRouter()
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

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

  const toggleFaq = (index: number) => {
    setExpandedFaq((prev) => (prev === index ? null : index))
  }

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
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
              Chat without limits
            </h1>
            <p className="text-lg md:text-xl leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Unlock premium features for a better chat experience
            </p>
          </div>
        </section>

        {/* ─── Feature Comparison Table ─── */}
        <section className="pb-20 px-4 fade-in-up-d1">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8" style={{ color: 'var(--color-text-primary)' }}>
              Compare Plans
            </h2>
            <div
              className="rounded-xl overflow-hidden"
              style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
            >
              {/* Table header */}
              <div
                className="grid grid-cols-3 text-sm font-semibold"
                style={{ borderBottom: '1px solid var(--color-border)' }}
              >
                <div className="p-4" style={{ color: 'var(--color-text-muted)' }}>Feature</div>
                <div className="p-4 text-center" style={{ color: 'var(--color-text-secondary)' }}>Free</div>
                <div className="p-4 text-center" style={{ color: '#c4b5fd' }}>Premium</div>
              </div>
              {/* Table rows */}
              {FEATURES.map((feature, i) => (
                <div
                  key={feature.name}
                  className="grid grid-cols-3 text-sm"
                  style={{
                    borderBottom: i < FEATURES.length - 1 ? '1px solid var(--color-border)' : undefined,
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  <div className="p-4">{feature.name}</div>
                  <div className="p-4 text-center text-base">{feature.free ? '✅' : '❌'}</div>
                  <div className="p-4 text-center text-base">{feature.premium ? '✅' : '❌'}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Pricing Cards ─── */}
        <section className="pb-20 px-4 fade-in-up-d2">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8" style={{ color: 'var(--color-text-primary)' }}>
            Choose Your Plan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Monthly */}
            <div
              className="rounded-xl p-8 flex flex-col"
              style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
            >
              <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>Monthly</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>Billed monthly</p>
              <div className="mb-6">
                <span className="text-5xl font-black" style={{ color: 'var(--color-text-primary)' }}>$4.99</span>
                <span className="text-sm ml-1" style={{ color: 'var(--color-text-muted)' }}>/month</span>
              </div>
              <ul className="flex-1 space-y-3 mb-8">
                {['All premium features', 'Cancel anytime', '3-day free trial'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: '#10B981' }}>✓</span> {item}
                  </li>
                ))}
              </ul>
              <button
                className="w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #6366F1)' }}
              >
                Pay with Bitcoin
              </button>
            </div>

            {/* Annual */}
            <div
              className="rounded-xl p-8 flex flex-col relative"
              style={{ background: 'var(--color-bg-card)', border: '2px solid #8B5CF6' }}
            >
              {/* Best Value badge */}
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #6366F1)' }}
              >
                Best Value
              </div>
              <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>Annual</h3>
              <p className="text-sm mb-1" style={{ color: 'var(--color-text-muted)' }}>Save 33%</p>
              <p className="text-sm mb-4" style={{ color: '#c4b5fd' }}>Just $3.33/month</p>
              <div className="mb-6">
                <span className="text-5xl font-black" style={{ color: 'var(--color-text-primary)' }}>$39.99</span>
                <span className="text-sm ml-1" style={{ color: 'var(--color-text-muted)' }}>/year</span>
              </div>
              <ul className="flex-1 space-y-3 mb-8">
                {['All premium features', '33% savings', '3-day free trial', 'Priority support'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: '#8B5CF6' }}>✓</span> {item}
                  </li>
                ))}
              </ul>
              <button
                className="w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #6366F1)' }}
              >
                Pay with Bitcoin
              </button>
            </div>
          </div>

          {/* Payment note */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <ShieldCheck className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Powered by OpenNode — pay securely with Bitcoin
            </p>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section className="pb-20 px-4 fade-in-up-d3">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8" style={{ color: 'var(--color-text-primary)' }}>
            Frequently Asked Questions
          </h2>
          <div className="max-w-2xl mx-auto space-y-3">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = expandedFaq === index
              return (
                <div
                  key={index}
                  className="rounded-xl overflow-hidden transition-all duration-200"
                  style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    <span className="font-semibold text-sm md:text-base pr-4">{item.question}</span>
                    <ChevronDown
                      className="w-5 h-5 shrink-0 transition-transform duration-300"
                      style={{
                        color: 'var(--color-text-muted)',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    />
                  </button>
                  <div
                    className="transition-all duration-300 overflow-hidden"
                    style={{
                      maxHeight: isOpen ? '300px' : '0px',
                    }}
                  >
                    <p className="px-5 pb-5 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                      {item.answer}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ─── Back to Home ─── */}
        <section className="pb-16 px-4 text-center">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors duration-200 cursor-pointer"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.color = 'var(--color-text-secondary)' }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.color = 'var(--color-text-muted)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
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
