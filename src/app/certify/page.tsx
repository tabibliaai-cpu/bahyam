'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, Award, Check, ChevronDown, ChevronUp, Play, Loader2, CircleCheck, ShieldCheck, BadgeCheck, Sparkles } from 'lucide-react';

/* ========== NAVBAR ========== */
function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b" style={{ background: 'rgba(10,15,30,0.85)', borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="dot dot-up" style={{ width: 10, height: 10 }} />
          <span>PulseAPI</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <Link href="/live" className="hover:text-white transition">Live Feed</Link>
          <Link href="/marketplace" className="hover:text-white transition">Marketplace</Link>
          <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
          <Link href="/advertise" className="hover:text-white transition">Advertise</Link>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Link href="/dashboard" className="px-4 py-2 text-sm rounded-lg border transition hover:bg-white/5" style={{ borderColor: 'var(--border)' }}>Login</Link>
          <Link href="/dashboard" className="px-4 py-2 text-sm rounded-lg text-white font-medium transition" style={{ background: 'var(--accent)' }}>Start Free</Link>
        </div>
        <button onClick={() => setOpen(!open)} className="md:hidden p-2" aria-label="Menu">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>
      {open && (
        <div className="md:hidden absolute top-16 left-0 right-0 p-4 flex flex-col gap-3 border-b" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
          <Link href="/live" className="py-2 px-4 rounded-lg hover:bg-white/5" onClick={() => setOpen(false)}>Live Feed</Link>
          <Link href="/marketplace" className="py-2 px-4 rounded-lg hover:bg-white/5" onClick={() => setOpen(false)}>Marketplace</Link>
          <Link href="/pricing" className="py-2 px-4 rounded-lg hover:bg-white/5" onClick={() => setOpen(false)}>Pricing</Link>
          <Link href="/dashboard" className="py-2 px-4 rounded-lg text-center font-medium text-white" style={{ background: 'var(--accent)' }} onClick={() => setOpen(false)}>Start Free</Link>
        </div>
      )}
    </nav>
  );
}

/* ========== CERTIFICATION TIERS ========== */
const tiers = [
  {
    name: 'Bronze',
    price: 99,
    period: 'yr',
    icon: Shield,
    color: '#CD7F32',
    bgColor: 'rgba(205,127,50,0.1)',
    borderColor: 'rgba(205,127,50,0.3)',
    description: 'Basic API health certification for startups.',
    features: [
      'Automated uptime check (24h)',
      'Basic SSL & DNS verification',
      'Bronze certification badge',
      'Public listing on PulseAPI',
      'Certificate number',
    ],
  },
  {
    name: 'Silver',
    price: 199,
    period: 'yr',
    icon: ShieldCheck,
    color: '#C0C0C0',
    bgColor: 'rgba(192,192,192,0.1)',
    borderColor: 'rgba(192,192,192,0.3)',
    description: 'Advanced monitoring with detailed health reports.',
    features: [
      'Everything in Bronze, plus:',
      '7-day continuous monitoring',
      'Response time benchmarks',
      'Security headers analysis',
      'Silver certification badge',
      'Detailed health report (PDF)',
      'Priority support',
    ],
  },
  {
    name: 'Gold',
    price: 499,
    period: 'yr',
    icon: BadgeCheck,
    color: '#FFD700',
    bgColor: 'rgba(255,215,0,0.1)',
    borderColor: 'rgba(255,215,0,0.3)',
    description: 'AI-powered analysis with premium visibility.',
    features: [
      'Everything in Silver, plus:',
      '30-day continuous monitoring',
      'AI-powered root cause analysis',
      'Load test simulation',
      'Gold premium badge',
      'Custom verification page',
      'Featured in marketplace',
      'Dedicated account manager',
    ],
    popular: true,
  },
];

const benefits = [
  { icon: Award, title: 'Build Trust', desc: 'A certified badge shows your users that your API is reliable and monitored.' },
  { icon: Shield, title: 'Stand Out', desc: 'Differentiate your API in the marketplace with a recognized certification.' },
  { icon: Sparkles, title: 'AI Analysis', desc: 'Gold tier includes AI-powered diagnostics and optimization suggestions.' },
  { icon: CircleCheck, title: 'Marketing Asset', desc: 'Use your certification badge in docs, READMEs, and landing pages.' },
];

/* ========== BADGE PREVIEW ========== */
function BadgePreview({ tier }: { tier: typeof tiers[0] }) {
  const Icon = tier.icon;
  return (
    <div className="flex flex-col items-center gap-3 p-6 rounded-xl border" style={{ background: tier.bgColor, borderColor: tier.borderColor }}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: `${tier.color}25`, boxShadow: `0 0 30px ${tier.color}30` }}>
        <Icon className="w-8 h-8" style={{ color: tier.color }} />
      </div>
      <div className="text-center">
        <div className="text-xs font-bold uppercase tracking-wider" style={{ color: tier.color }}>{tier.name} Certified</div>
        <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>PulseAPI Verified</div>
      </div>
      <div className="text-xs font-mono px-2 py-1 rounded" style={{ background: 'var(--bg-primary)', color: 'var(--text-tertiary)' }}>
        #PA-{Math.random().toString(36).substring(2, 8).toUpperCase()}
      </div>
    </div>
  );
}

/* ========== FAQ ========== */
const faqItems = [
  { q: 'How long does certification take?', a: 'Bronze certification completes in minutes. Silver takes up to 24 hours for full monitoring analysis. Gold tier results are delivered within 48 hours with the complete AI report.' },
  { q: 'What does the certification check?', a: 'We verify uptime, response times, SSL/TLS configuration, security headers, error handling, and API reliability patterns. Higher tiers include deeper analysis including load simulation and AI-powered diagnostics.' },
  { q: 'Can I renew my certification?', a: 'Yes! Certifications are valid for one year. You\'ll receive a reminder 30 days before expiry. Renewal includes a fresh check to ensure your API still meets standards.' },
  { q: 'Can I display the badge anywhere?', a: 'Absolutely! Once certified, you receive a badge URL and embed code you can use on your documentation, GitHub README, website, and API marketplace listing.' },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <button className="w-full flex items-center justify-between p-5 text-left cursor-pointer" onClick={() => setOpen(!open)}>
        <span className="font-medium text-sm sm:text-base pr-4">{q}</span>
        {open ? <ChevronUp className="w-5 h-5 shrink-0" style={{ color: 'var(--text-secondary)' }} /> : <ChevronDown className="w-5 h-5 shrink-0" style={{ color: 'var(--text-secondary)' }} />}
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {a}
        </div>
      )}
    </div>
  );
}

/* ========== MOCK RESULTS ========== */
function MockResults() {
  return (
    <div className="space-y-4 mt-6 p-5 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <h3 className="font-bold flex items-center gap-2">
        <CircleCheck className="w-5 h-5" style={{ color: 'var(--success)' }} />
        Quick Check Results
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Uptime', value: '99.8%', pass: true },
          { label: 'Avg Response', value: '142ms', pass: true },
          { label: 'SSL Valid', value: 'Yes', pass: true },
          { label: 'Security Headers', value: '7/10', pass: false },
        ].map(r => (
          <div key={r.label} className="rounded-lg p-3 border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{r.label}</div>
            <div className="font-bold font-mono mt-1" style={{ color: r.pass ? 'var(--success)' : 'var(--warning)' }}>{r.value}</div>
          </div>
        ))}
      </div>
      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        Based on this quick check, your API qualifies for <strong className="text-white">Silver</strong> certification. Upgrade to get the full analysis.
      </div>
    </div>
  );
}

/* ========== MAIN ========== */
export default function CertifyPage() {
  const [apiUrl, setApiUrl] = useState('');
  const [checking, setChecking] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiUrl.trim()) return;
    setChecking(true);
    setShowResults(false);
    setTimeout(() => {
      setChecking(false);
      setShowResults(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,215,0,0.1) 0%, transparent 70%)' }} />
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-8 border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--bg-secondary)' }}>
            <Award className="w-4 h-4" style={{ color: '#FFD700' }} /> API Certification Program
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 leading-tight">
            Get Your API <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #FFD700, #CD7F32)' }}>Certified</span>
          </h1>
          <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
            Prove your API&apos;s reliability with PulseAPI certification. Earn a verified badge, build trust, and stand out in the marketplace.
          </p>
        </div>
      </section>

      {/* Certification Tiers */}
      <section className="px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {tiers.map((tier) => {
              const Icon = tier.icon;
              return (
                <div
                  key={tier.name}
                  className={`rounded-xl border p-6 relative transition hover:border-opacity-60 ${tier.popular ? 'ring-2' : ''}`}
                  style={{ background: 'var(--bg-card)', borderColor: tier.popular ? tier.color : 'var(--border)', ringColor: tier.popular ? tier.color : '' }}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold" style={{ background: tier.color, color: '#0A0F1E' }}>
                      Recommended
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: tier.bgColor }}>
                      <Icon className="w-5 h-5" style={{ color: tier.color }} />
                    </div>
                    <div>
                      <h3 className="font-bold">{tier.name}</h3>
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{tier.description}</p>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1 mb-5">
                    <span className="text-3xl font-extrabold">${tier.price}</span>
                    <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>/{tier.period}</span>
                  </div>
                  <ul className="space-y-2.5 mb-6">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--success)' }} /> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`w-full py-2.5 rounded-lg text-sm font-medium transition cursor-pointer ${tier.popular ? 'hover:opacity-90' : 'border hover:bg-white/5'}`}
                    style={tier.popular ? { background: tier.color, color: '#0A0F1E' } : { borderColor: 'var(--border)' }}
                  >
                    Get Certified
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Badge Preview */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-3">Badge Preview</h2>
          <p className="text-center mb-10" style={{ color: 'var(--text-secondary)' }}>Every certified API gets a verified badge to display</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {tiers.map((tier) => (
              <BadgePreview key={tier.name} tier={tier} />
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility Check */}
      <section className="px-4 pb-20">
        <div className="max-w-xl mx-auto">
          <div className="rounded-xl border p-6 sm:p-8" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Play className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              Check My Eligibility
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              Run a free quick check to see if your API qualifies for certification.
            </p>
            <form onSubmit={handleCheck} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>API URL</label>
                <input
                  type="url"
                  required
                  value={apiUrl}
                  onChange={e => setApiUrl(e.target.value)}
                  placeholder="https://api.example.com/health"
                  className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2"
                  style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
                />
              </div>
              <button
                type="submit"
                disabled={checking}
                className="w-full py-3 rounded-lg text-white font-medium text-sm transition hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                style={{ background: 'var(--accent)' }}
              >
                {checking ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Running Check...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Run Check
                  </>
                )}
              </button>
            </form>
            {showResults && <MockResults />}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="px-4 pb-20" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-5xl mx-auto py-16">
          <h2 className="text-2xl font-bold text-center mb-10">Why Get Certified?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {benefits.map((b) => (
              <div key={b.title} className="rounded-xl border p-5 flex gap-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--accent-glow)' }}>
                  <b.icon className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <h3 className="font-bold mb-1">{b.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 pb-20">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqItems.map((item) => (
              <FAQItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>
          <div className="flex items-center gap-2">
            <span className="dot dot-up" style={{ width: 8, height: 8 }} />
            <span className="font-bold text-white">PulseAPI</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/live" className="hover:text-white transition">Live Feed</Link>
            <Link href="/marketplace" className="hover:text-white transition">Marketplace</Link>
            <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
          </div>
          <span>Built for developers. Paid with Bitcoin.</span>
        </div>
      </footer>
    </div>
  );
}
