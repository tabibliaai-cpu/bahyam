'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, X, ChevronDown, ChevronUp, Zap, Bitcoin } from 'lucide-react';

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

const plans = [
  { name: 'Free', monthly: 0, annual: 0, features: ['1 API', '10-minute checks', 'Email alerts', 'Public status page'], missing: ['Slack alerts', 'Bitcoin badge', 'Team members', 'AI diagnosis', 'Load testing', 'Certifications'], badge: null },
  { name: 'Starter', monthly: 9, annual: 7, features: ['5 APIs', '5-minute checks', 'Slack alerts', 'Status page', 'Bitcoin badge'], missing: ['Team members', 'AI diagnosis', 'Load testing', 'Certifications'], badge: null },
  { name: 'Growth', monthly: 19, annual: 15, features: ['25 APIs', '1-minute checks', 'Team (3 members)', 'AI diagnosis', 'Status page', 'Bitcoin badge'], missing: ['Load testing', 'Certifications'], badge: 'Popular' },
  { name: 'Scale', monthly: 39, annual: 31, features: ['Unlimited APIs', '30-second checks', 'Team (10 members)', 'Load testing', 'Certifications', 'Status page', 'Bitcoin badge'], missing: [], badge: null },
];

const comparisonFeatures = [
  { name: 'APIs', free: '1', starter: '5', growth: '25', scale: 'Unlimited' },
  { name: 'Check interval', free: '10 min', starter: '5 min', growth: '1 min', scale: '30 sec' },
  { name: 'Email alerts', free: true, starter: true, growth: true, scale: true },
  { name: 'Slack alerts', free: false, starter: true, growth: true, scale: true },
  { name: 'Public status page', free: true, starter: true, growth: true, scale: true },
  { name: 'Bitcoin badge', free: false, starter: true, growth: true, scale: true },
  { name: 'Team members', free: false, starter: false, growth: '3', scale: '10' },
  { name: 'AI diagnosis', free: false, starter: false, growth: true, scale: true },
  { name: 'Load testing', free: false, starter: false, growth: false, scale: true },
  { name: 'Certifications', free: false, starter: false, growth: false, scale: true },
  { name: 'Bitcoin payments', free: true, starter: true, growth: true, scale: true },
];

const faqItems = [
  { q: 'Can I switch plans at any time?', a: "Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll be prorated for the remainder of your billing cycle." },
  { q: 'How does Bitcoin payment work?', a: 'We use OpenNode to process Bitcoin and Lightning Network payments. Simply select Bitcoin at checkout, scan the QR code, and your account is activated instantly.' },
  { q: 'What happens when my API check limit is reached?', a: "Your APIs continue to be monitored — we never cut off monitoring. If you exceed your plan limits, you'll receive a notification to upgrade." },
  { q: 'Do you offer a free trial for paid plans?', a: "Every paid plan comes with a 7-day free trial. No credit card or Bitcoin required to start." },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <button className="w-full flex items-center justify-between p-5 text-left cursor-pointer" onClick={() => setOpen(!open)}>
        <span className="font-medium text-sm sm:text-base pr-4">{q}</span>
        {open ? <ChevronUp className="w-5 h-5 shrink-0" style={{ color: 'var(--text-secondary)' }} /> : <ChevronDown className="w-5 h-5 shrink-0" style={{ color: 'var(--text-secondary)' }} />}
      </button>
      {open && <div className="px-5 pb-5 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{a}</div>}
    </div>
  );
}

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? <Check className="w-5 h-5 mx-auto" style={{ color: 'var(--success)' }} /> : <X className="w-5 h-5 mx-auto" style={{ color: 'var(--text-tertiary)' }} />;
  }
  return <span className="text-sm">{value}</span>;
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <section className="pt-28 pb-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">Simple, Transparent <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}>Pricing</span></h1>
          <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>Start free. Scale with Bitcoin. No hidden fees.</p>
          <div className="inline-flex items-center gap-3 rounded-full px-5 py-2.5 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <span className="text-sm font-medium" style={{ color: !annual ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>Monthly</span>
            <button onClick={() => setAnnual(!annual)} className="relative w-12 h-6 rounded-full transition-colors cursor-pointer" style={{ background: annual ? 'var(--accent)' : 'var(--border)' }} aria-label="Toggle annual pricing">
              <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform" style={{ transform: annual ? 'translateX(24px)' : 'translateX(0)' }} />
            </button>
            <span className="text-sm font-medium" style={{ color: annual ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>Annual</span>
            {annual && <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--success)' }}>Save 20%</span>}
          </div>
        </div>
      </section>
      <section className="px-4 pb-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan) => {
            const price = annual ? plan.annual : plan.monthly;
            const isPopular = plan.badge === 'Popular';
            return (
              <div key={plan.name} className={`rounded-xl border p-6 relative transition hover:border-blue-500/40 ${isPopular ? 'ring-2 ring-blue-500' : ''}`} style={{ background: 'var(--bg-card)', borderColor: isPopular ? 'var(--accent)' : 'var(--border)' }}>
                {plan.badge && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold text-white flex items-center gap-1" style={{ background: 'var(--accent)' }}><Zap className="w-3 h-3" /> {plan.badge}</div>}
                <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-4xl font-extrabold">${price}</span>
                  {price > 0 && <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>/mo</span>}
                  {annual && price > 0 && <span className="text-xs line-through ml-1" style={{ color: 'var(--text-tertiary)' }}>${plan.monthly}</span>}
                </div>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((f) => <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}><Check className="w-4 h-4 shrink-0" style={{ color: 'var(--success)' }} /> {f}</li>)}
                  {plan.missing.map((f) => <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-tertiary)' }}><X className="w-4 h-4 shrink-0" /> {f}</li>)}
                </ul>
                <Link href="/dashboard" className={`block w-full text-center py-2.5 rounded-lg text-sm font-medium transition ${isPopular ? 'text-white hover:opacity-90' : 'border hover:bg-white/5'}`} style={isPopular ? { background: 'var(--accent)' } : { borderColor: 'var(--border)' }}>Get Started</Link>
              </div>
            );
          })}
        </div>
      </section>
      <section className="px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Feature Comparison</h2>
          <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead><tr className="border-b" style={{ borderColor: 'var(--border)' }}><th className="p-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Feature</th>{plans.map(p => <th key={p.name} className="p-4 text-sm font-bold text-center">{p.name}</th>)}</tr></thead>
                <tbody>{comparisonFeatures.map((row, i) => <tr key={row.name} style={{ background: i % 2 === 0 ? 'var(--bg-secondary)' : 'transparent' }}><td className="p-4 text-sm border-b" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>{row.name}</td><td className="p-4 text-center border-b" style={{ borderColor: 'var(--border)' }}><CellValue value={row.free} /></td><td className="p-4 text-center border-b" style={{ borderColor: 'var(--border)' }}><CellValue value={row.starter} /></td><td className="p-4 text-center border-b" style={{ borderColor: 'var(--border)' }}><CellValue value={row.growth} /></td><td className="p-4 text-center border-b" style={{ borderColor: 'var(--border)' }}><CellValue value={row.scale} /></td></tr>)}</tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
      <section className="px-4 pb-20">
        <div className="max-w-3xl mx-auto text-center rounded-xl border p-8" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <Bitcoin className="w-10 h-10 mx-auto mb-4" style={{ color: '#F7931A' }} />
          <h3 className="text-xl font-bold mb-2">Pay with Bitcoin</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>All paid plans support Bitcoin and Lightning Network via OpenNode. Instant activation, zero fees.</p>
          <Link href="/dashboard" className="inline-block px-6 py-2.5 rounded-lg text-sm font-medium text-white transition hover:opacity-90" style={{ background: '#F7931A' }}>Get Started with Bitcoin</Link>
        </div>
      </section>
      <section className="px-4 pb-20">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3">{faqItems.map((item) => <FAQItem key={item.q} q={item.q} a={item.a} />)}</div>
        </div>
      </section>
      <footer className="py-10 px-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>
          <div className="flex items-center gap-2"><span className="dot dot-up" style={{ width: 8, height: 8 }} /><span className="font-bold text-white">PulseAPI</span></div>
          <div className="flex items-center gap-6"><Link href="/live" className="hover:text-white transition">Live Feed</Link><Link href="/marketplace" className="hover:text-white transition">Marketplace</Link><Link href="/pricing" className="hover:text-white transition">Pricing</Link></div>
          <span>Built for developers. Paid with Bitcoin.</span>
        </div>
      </footer>
    </div>
  );
}
