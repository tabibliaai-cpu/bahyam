'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';

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

/* ========== ANIMATED NUMBER ========== */
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) { setDisplay(value); return; }
    hasAnimated.current = true;
    const duration = 1500;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);

  return <span ref={ref}>{display.toLocaleString()}{suffix}</span>;
}

function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-4 overflow-hidden">
      <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.15) 0%, transparent 70%)' }} />
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-8 border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--bg-secondary)' }}>
          <span className="text-yellow-400">&#9889;</span> Real-time API monitoring powered by AI
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
          Your APIs Are <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}>Lying To You.</span>
        </h1>
        <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          PulseAPI monitors every API in your stack 24/7, predicts failures before they happen, and tells you exactly how to fix them — in real time.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link href="/dashboard" className="px-8 py-3 rounded-lg text-white font-semibold text-lg transition hover:opacity-90" style={{ background: 'var(--accent)' }}>
            Monitor Free
          </Link>
          <Link href="/live" className="px-8 py-3 rounded-lg font-semibold text-lg border transition hover:bg-white/5" style={{ borderColor: 'var(--border)' }}>
            See Live Feed &rarr;
          </Link>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm" style={{ color: 'var(--text-tertiary)' }}>
          <span>&#10003; No credit card required</span>
          <span>&#10003; Setup in 2 minutes</span>
          <span>&#10003; Pay with Bitcoin</span>
        </div>
        <div className="mt-12 rounded-xl border p-4 text-left hidden sm:block" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="dot dot-up" style={{ width: 8, height: 8 }} />
            <span className="text-sm font-medium">Live Preview</span>
            <span className="text-xs ml-auto" style={{ color: 'var(--text-tertiary)' }}>Updating...</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['Stripe', 'GitHub', 'OpenAI'].map(name => (
              <div key={name} className="rounded-lg p-3 border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="dot dot-up" style={{ width: 6, height: 6 }} />
                  <span className="text-xs font-medium">{name}</span>
                </div>
                <div className="text-lg font-bold" style={{ color: 'var(--success)' }}>UP</div>
                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Checking...</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function LivePreview() {
  const [apis, setApis] = useState<any[]>([]);
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchLive = async () => {
      try {
        const res = await fetch('/api/live/data');
        const data = await res.json();
        if (data.apis?.length) setApis(data.apis.slice(0, 6));
      } catch {}
    };
    fetchLive();
    interval = setInterval(fetchLive, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">Watching {apis.length || '20+'} APIs right now</h2>
        <p className="text-center mb-10" style={{ color: 'var(--text-secondary)' }}>Real data, real checks, real time</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {apis.length > 0 ? apis.map((api: any) => (
            <div key={api.id} className="rounded-xl border p-4 transition hover:border-blue-500/50" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`dot dot-${api.status}`} style={{ width: 8, height: 8 }} />
                  <span className="font-semibold">{api.name}</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>{api.category}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span style={{ color: 'var(--text-tertiary)' }}>Response</span><div className="font-mono font-bold">{api.responseTime}ms</div></div>
                <div><span style={{ color: 'var(--text-tertiary)' }}>Uptime</span><div className="font-bold" style={{ color: 'var(--success)' }}>{api.uptime}%</div></div>
              </div>
            </div>
          )) : (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border p-4 animate-pulse" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <div className="h-4 rounded w-24 mb-3" style={{ background: 'var(--bg-secondary)' }} />
                <div className="h-6 rounded w-16 mb-2" style={{ background: 'var(--bg-secondary)' }} />
                <div className="h-4 rounded w-20" style={{ background: 'var(--bg-secondary)' }} />
              </div>
            ))
          )}
        </div>
        <div className="text-center mt-8">
          <Link href="/live" className="text-sm font-medium transition hover:underline" style={{ color: 'var(--accent)' }}>View all on Live Feed &rarr;</Link>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const [stats, setStats] = useState({ totalChecks: 0, totalApis: 0, incidents: 0, avgResponse: 0 });
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/live/data');
        const data = await res.json();
        if (data.stats) setStats({
          totalChecks: data.stats.checksToday || 0,
          totalApis: data.stats.totalApis || 0,
          incidents: data.stats.activeIncidents || 0,
          avgResponse: data.stats.avgResponse || 0,
        });
      } catch {}
    };
    fetchStats();
  }, []);

  const items = [
    { label: 'API Checks', value: stats.totalChecks, suffix: '+', color: 'var(--accent)' },
    { label: 'APIs Monitored', value: stats.totalApis, suffix: '+', color: 'var(--success)' },
    { label: 'Incidents Detected', value: stats.incidents, suffix: '', color: 'var(--warning)' },
    { label: 'Avg Response', value: stats.avgResponse, suffix: 'ms', color: 'var(--text-primary)' },
  ];

  return (
    <section className="py-16 px-4 border-y" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
      <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 stats-grid">
        {items.map(item => (
          <div key={item.label} className="text-center">
            <div className="text-3xl sm:text-4xl font-extrabold count-up" style={{ color: item.color }}>
              <AnimatedNumber value={item.value} suffix={item.suffix} />
            </div>
            <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { icon: '&#128225;', title: 'Real-time Monitoring', desc: 'Ping every API every 30 seconds with instant alerts when anything goes wrong.' },
    { icon: '&#129302;', title: 'AI Diagnosis', desc: 'Get root cause analysis powered by AI in seconds — not hours.' },
    { icon: '&#128200;', title: 'Failure Prediction', desc: 'Know about outages before they happen with ML-powered risk scoring.' },
    { icon: '&#8383;', title: 'Bitcoin Payments', desc: 'Pay with BTC or Lightning Network. No credit card required.' },
    { icon: '&#127759;', title: 'Public Marketplace', desc: 'Share your API health with the world. Browse 20+ real APIs live.' },
    { icon: '&#128170;', title: 'Load Testing', desc: 'Stress test your APIs under real traffic with AI-generated reports.' },
  ];
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need to keep APIs running</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(f => (
            <div key={f.title} className="rounded-xl border p-6 transition hover:border-blue-500/30" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <div className="text-2xl mb-3" dangerouslySetInnerHTML={{ __html: f.icon }} />
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function IncidentTicker() {
  const [events, setEvents] = useState<any[]>([]);
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/live/data');
        const data = await res.json();
        if (data.events?.length) setEvents(data.events.slice(0, 10));
      } catch {}
    };
    fetchEvents();
    const interval = setInterval(fetchEvents, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 px-4" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Recent incidents detected across the network</h2>
        {events.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {events.map((e: any, i: number) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border p-3 text-sm" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <span className={`dot ${e.severity === 'high' || e.severity === 'critical' ? 'dot-down' : 'dot-slow'}`} style={{ width: 6, height: 6 }} />
                <span className="font-medium">{e.api_name}</span>
                <span style={{ color: 'var(--text-secondary)' }} className="truncate flex-1">{e.error_summary}</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-primary)', color: e.severity === 'high' || e.severity === 'critical' ? 'var(--error)' : 'var(--warning)' }}>{e.severity}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8" style={{ color: 'var(--text-tertiary)' }}>
            <span className="dot dot-up" style={{ width: 12, height: 12 }} />
            <p className="mt-3">All systems operational. No recent incidents.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function PricingPreview() {
  const plans = [
    { name: 'Free', price: '$0', features: ['1 API', '10min checks', 'Email alerts', 'Public status page'] },
    { name: 'Starter', price: '$9', features: ['5 APIs', '5min checks', 'Slack alerts', 'Status page'] },
    { name: 'Growth', price: '$19', features: ['25 APIs', '1min checks', 'Team (3)', 'AI diagnosis'], popular: true },
    { name: 'Scale', price: '$39', features: ['Unlimited APIs', '30sec checks', 'Team (10)', 'Load testing'] },
  ];
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">Simple, transparent pricing</h2>
        <p className="text-center mb-12" style={{ color: 'var(--text-secondary)' }}>Pay with Bitcoin. Start free, scale as you grow.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((p: any) => (
            <div key={p.name} className={`rounded-xl border p-6 relative ${p.popular ? 'ring-2 ring-blue-500' : ''}`} style={{ background: 'var(--bg-card)', borderColor: p.popular ? 'var(--accent)' : 'var(--border)' }}>
              {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: 'var(--accent)' }}>Popular</div>}
              <h3 className="font-bold text-lg mb-1">{p.name}</h3>
              <div className="text-3xl font-extrabold mb-4">{p.price}<span className="text-sm font-normal" style={{ color: 'var(--text-tertiary)' }}>/mo</span></div>
              <ul className="space-y-2 mb-6">
                {p.features.map((f: string) => (
                  <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--success)' }}>&#10003;</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/pricing" className="block w-full text-center py-2.5 rounded-lg border text-sm font-medium transition hover:bg-white/5" style={{ borderColor: 'var(--border)' }}>Get Started</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-24 px-4 text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-50" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.1) 0%, transparent 70%)' }} />
      <div className="relative z-10 max-w-2xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Start monitoring your APIs in 2 minutes</h2>
        <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>Join developers already using PulseAPI to monitor 20+ real APIs.</p>
        <Link href="/dashboard" className="inline-block px-8 py-3.5 rounded-lg text-white font-semibold text-lg transition hover:opacity-90" style={{ background: 'var(--accent)' }}>
          Start Free
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
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
  );
}

export default function LandingPage() {
  return (
    <div>
      <Navbar />
      <Hero />
      <LivePreview />
      <Stats />
      <Features />
      <IncidentTicker />
      <PricingPreview />
      <FinalCTA />
      <Footer />
    </div>
  );
}
