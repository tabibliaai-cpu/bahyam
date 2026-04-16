'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Megaphone, Eye, Target, Zap, Star, Check, ChevronDown, ChevronUp, Send, BarChart3, Activity } from 'lucide-react';

function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b" style={{ background: 'rgba(10,15,30,0.85)', borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg"><span className="dot dot-up" style={{ width: 10, height: 10 }} /><span>PulseAPI</span></Link>
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
        <button onClick={() => setOpen(!open)} className="md:hidden p-2" aria-label="Menu"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg></button>
      </div>
      {open && (<div className="md:hidden absolute top-16 left-0 right-0 p-4 flex flex-col gap-3 border-b" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
        <Link href="/live" className="py-2 px-4 rounded-lg hover:bg-white/5" onClick={() => setOpen(false)}>Live Feed</Link>
        <Link href="/marketplace" className="py-2 px-4 rounded-lg hover:bg-white/5" onClick={() => setOpen(false)}>Marketplace</Link>
        <Link href="/dashboard" className="py-2 px-4 rounded-lg text-center font-medium text-white" style={{ background: 'var(--accent)' }} onClick={() => setOpen(false)}>Start Free</Link>
      </div>)}
    </nav>
  );
}

const sponsorTiers = [
  { name: 'Featured', price: 299, icon: Star, color: '#F59E0B', description: 'Get your API in front of thousands of developers.', features: ['Logo on Live Feed page for 1 month', 'Up to 10,000 impressions/month', 'Click-through tracking dashboard', 'Brand mention in weekly newsletter', 'Basic analytics report'] },
  { name: 'Premium', price: 599, icon: Zap, color: '#3B82F6', description: 'Maximum visibility with dedicated placement.', features: ['Everything in Featured, plus:', 'Top banner placement on marketplace', 'Up to 50,000 impressions/month', 'Dedicated spotlight section', 'Priority support', 'Advanced analytics + demographics'], popular: true },
  { name: 'Enterprise', price: 1499, icon: Target, color: '#8B5CF6', description: 'Full platform integration for maximum impact.', features: ['Everything in Premium, plus:', 'Exclusive homepage banner', 'Unlimited impressions', 'Custom landing page for your API', 'Direct integration in monitoring alerts', 'Dedicated account manager'] },
];

const faqItems = [
  { q: 'Who sees my sponsored listing?', a: 'Your API will be shown to the 10,000+ developers who use PulseAPI daily to monitor their APIs.' },
  { q: 'Can I pay with Bitcoin?', a: 'Absolutely! We support Bitcoin and Lightning Network payments via OpenNode for all sponsorship tiers.' },
  { q: 'How do I track performance?', a: 'Every sponsor gets a real-time dashboard showing impressions, click-throughs, and engagement metrics.' },
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

export default function AdvertisePage() {
  const [stats, setStats] = useState({ totalChecks: 0, totalApis: 0 });
  const [formData, setFormData] = useState({ company: '', name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try { const res = await fetch('/api/live/data'); const data = await res.json(); if (data.stats) setStats({ totalChecks: data.stats.checksToday || 0, totalApis: data.stats.totalApis || 0 }); } catch {}
    };
    fetchStats();
  }, []);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setSubmitted(true); setTimeout(() => { setFormData({ company: '', name: '', email: '', message: '' }); setSubmitted(false); }, 3000); };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <section className="pt-28 pb-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-8 border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--bg-secondary)' }}><Megaphone className="w-4 h-4" style={{ color: 'var(--warning)' }} /> Developer-first sponsorship</div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">Reach <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #F59E0B, #EF4444)' }}>10,000+</span> developers watching APIs live</h1>
          <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>PulseAPI is the #1 real-time API monitoring platform. Put your product in front of the developers who matter most.</p>
        </div>
      </section>
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[{ icon: Activity, label: 'APIs Monitored', value: `${stats.totalApis || 20}+`, color: 'var(--accent)' }, { icon: BarChart3, label: 'Daily Checks', value: `${(stats.totalChecks || 15000).toLocaleString()}+`, color: 'var(--success)' }, { icon: Eye, label: 'Monthly Visitors', value: '10,000+', color: 'var(--warning)' }, { icon: Target, label: 'Avg CTR', value: '3.2%', color: '#8B5CF6' }].map((stat) => (<div key={stat.label} className="rounded-xl border p-4 text-center" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}><stat.icon className="w-5 h-5 mx-auto mb-2" style={{ color: stat.color }} /><div className="text-xl font-bold font-mono" style={{ color: stat.color }}>{stat.value}</div><div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</div></div>))}
        </div>
      </section>
      <section className="px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-3">Choose Your Sponsorship Tier</h2>
          <p className="text-center mb-10" style={{ color: 'var(--text-secondary)' }}>All tiers include Bitcoin payment support and real-time analytics</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {sponsorTiers.map((tier) => { const Icon = tier.icon; return (
              <div key={tier.name} className={`rounded-xl border p-6 relative transition ${tier.popular ? 'ring-2 ring-blue-500' : ''}`} style={{ background: 'var(--bg-card)', borderColor: tier.popular ? tier.color : 'var(--border)' }}>
                {tier.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: tier.color }}>Most Popular</div>}
                <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${tier.color}20` }}><Icon className="w-5 h-5" style={{ color: tier.color }} /></div><div><h3 className="font-bold">{tier.name}</h3><p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{tier.description}</p></div></div>
                <div className="flex items-baseline gap-1 mb-5"><span className="text-3xl font-extrabold">${tier.price.toLocaleString()}</span><span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>/mo</span></div>
                <ul className="space-y-2.5 mb-6">{tier.features.map((f) => <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}><Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--success)' }} /> {f}</li>)}</ul>
                <button className={`w-full py-2.5 rounded-lg text-sm font-medium transition cursor-pointer ${tier.popular ? 'text-white hover:opacity-90' : 'border hover:bg-white/5'}`} style={tier.popular ? { background: tier.color } : { borderColor: 'var(--border)' }}>Apply Now</button>
              </div>
            ); })}
          </div>
        </div>
      </section>
      <section className="px-4 pb-20"><div className="max-w-2xl mx-auto"><h2 className="text-2xl font-bold text-center mb-8">FAQ</h2><div className="space-y-3">{faqItems.map((item) => <FAQItem key={item.q} q={item.q} a={item.a} />)}</div></div></section>
      <section className="px-4 pb-20">
        <div className="max-w-xl mx-auto">
          <div className="rounded-xl border p-6 sm:p-8" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2"><Send className="w-5 h-5" style={{ color: 'var(--accent)' }} />Get in Touch</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Tell us about your company and goals. We&apos;ll get back to you within 24 hours.</p>
            {submitted ? (<div className="text-center py-8"><Check className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--success)' }} /><h3 className="font-bold mb-1">Application Sent!</h3></div>) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Company</label><input type="text" required value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} placeholder="Acme Inc." /></div>
                  <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Name</label><input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} placeholder="John Doe" /></div>
                </div>
                <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label><input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} placeholder="john@acme.com" /></div>
                <div><label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Message</label><textarea required rows={4} value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none resize-none" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} placeholder="Tell us about your sponsorship goals..." /></div>
                <button type="submit" className="w-full py-3 rounded-lg text-white font-medium text-sm transition hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer" style={{ background: 'var(--accent)' }}><Send className="w-4 h-4" /> Submit Application</button>
              </form>
            )}
          </div>
        </div>
      </section>
      <footer className="py-10 px-4 border-t" style={{ borderColor: 'var(--border)' }}><div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm" style={{ color: 'var(--text-tertiary)' }}><div className="flex items-center gap-2"><span className="dot dot-up" style={{ width: 8, height: 8 }} /><span className="font-bold text-white">PulseAPI</span></div><span>Built for developers. Paid with Bitcoin.</span></div></footer>
    </div>
  );
}
