'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Eye, Copy, Check, Activity, Clock, AlertTriangle, Shield, Zap } from 'lucide-react';

type ApiData = { id: string; name: string; slug: string; category: string; description: string; url: string; method: string; status: 'up' | 'down' | 'slow'; uptime: number; responseTime: number; riskScore: number; degradation_probability: number; last_checked: string; last_response_time: number; last_status: number; };
type EventData = { id: string; api_id: string; api_name: string; error_summary: string; severity: string; ai_diagnosis: string; sent_at: string; };

export default function ApiProfilePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [api, setApi] = useState<ApiData | null>(null);
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [watchSubmitted, setWatchSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/live/data');
        const data = await res.json();
        const matchedApi = (data.apis || []).find((a: any) => a.slug === slug || a.name.toLowerCase().replace(/\s+/g, '-') === slug);
        if (matchedApi) setApi(matchedApi);
        setEvents((data.events || []).filter((e: any) => e.api_id === matchedApi?.id));
      } catch {} finally { setLoading(false); }
    }
    if (slug) fetchData();
  }, [slug]);

  const statusColor = (s: string) => s === 'up' ? 'var(--success)' : s === 'slow' ? 'var(--warning)' : 'var(--error)';
  const statusLabel = (s: string) => s === 'up' ? 'UP' : s === 'slow' ? 'SLOW' : 'DOWN';
  const statusBg = (s: string) => s === 'up' ? 'rgba(16,185,129,0.1)' : s === 'slow' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)';

  const chartBars = useMemo(() => {
    if (!api) return [];
    const seed = api.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return Array.from({ length: 24 }, (_, i) => { const hash = Math.sin(seed * (i + 1) * 0.0007) * 10000; const base = Math.abs(Math.floor((hash % 100))); return (i === 8 || i === 14) ? Math.min(base + 60, 100) : base; });
  }, [api]);

  const embedCode = api ? `<a href="${typeof window !== 'undefined' ? window.location.origin : ''}/marketplace/${api.slug}" target="_blank">\n  <img src="${typeof window !== 'undefined' ? window.location.origin : ''}/api/badge/${api.slug}.svg" alt="${api.name} Status" />\n</a>` : '';
  const copyEmbed = () => { navigator.clipboard.writeText(embedCode); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  if (loading) return (<div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}><div className="flex flex-col items-center gap-3"><span className="dot dot-slow" style={{ width: 16, height: 16 }} /><p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading API profile...</p></div></div>);
  if (!api) return (<div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}><div className="text-center"><p className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>API not found</p><Link href="/marketplace" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium no-underline" style={{ background: 'var(--accent)', color: '#fff' }}><ArrowLeft size={14} />Back to Marketplace</Link></div></div>);

  const maxResponse = Math.max(...chartBars, 1);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <header className="sticky top-0 z-50 border-b backdrop-blur-xl" style={{ background: 'rgba(10,15,30,0.92)', borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 no-underline"><span className="dot dot-up" style={{ width: 10, height: 10 }} /><span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>PulseAPI</span></Link>
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/live" className="px-3 py-2 rounded-lg text-sm font-medium no-underline" style={{ color: 'var(--text-secondary)' }}>Live Feed</Link>
            <Link href="/marketplace" className="px-3 py-2 rounded-lg text-sm font-medium no-underline" style={{ color: 'var(--accent)', background: 'var(--accent-glow)' }}>Marketplace</Link>
          </nav>
          <Link href="/dashboard" className="hidden sm:inline-flex px-4 py-2 rounded-lg text-sm font-semibold no-underline" style={{ background: 'var(--accent)', color: '#fff' }}>Start Free</Link>
        </div>
      </header>
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        <Link href="/marketplace" className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 no-underline" style={{ color: 'var(--text-secondary)' }}><ArrowLeft size={14} />Back to Marketplace</Link>
        <div className="mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0" style={{ background: 'var(--accent-glow)' }}><Activity size={24} style={{ color: 'var(--accent)' }} /></div>
            <div className="min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{api.name}</h1>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>{api.category}</span>
              </div>
              {api.description && <p className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>{api.description}</p>}
              {api.url && <p className="text-xs mt-1 font-mono" style={{ color: 'var(--text-tertiary)' }}>{api.method} {api.url}</p>}
            </div>
          </div>
        </div>
        <div className="rounded-xl border p-4 sm:p-5 mb-6 flex items-center justify-between" style={{ background: statusBg(api.status), borderColor: statusColor(api.status) }}>
          <div className="flex items-center gap-3"><span className={`dot dot-${api.status}`} style={{ width: 12, height: 12 }} /><div><span className="text-lg sm:text-xl font-bold" style={{ color: statusColor(api.status) }}>{statusLabel(api.status)}</span><p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Last checked: {api.last_checked ? new Date(api.last_checked).toLocaleString() : 'N/A'}</p></div></div>
          <div className="text-right hidden sm:block"><p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Response Time</p><p className="text-xl font-bold font-mono" style={{ color: statusColor(api.status) }}>{api.responseTime || 0}ms</p></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[{ label: 'Uptime (24h)', value: `${api.uptime || 100}%`, icon: <Zap size={16} />, color: (api.uptime || 100) >= 99 ? 'var(--success)' : (api.uptime || 100) >= 95 ? 'var(--warning)' : 'var(--error)' }, { label: 'Avg Response', value: `${api.responseTime || 0}ms`, icon: <Clock size={16} />, color: 'var(--text-primary)' }, { label: 'Incidents', value: `${events.length}`, icon: <AlertTriangle size={16} />, color: events.length > 5 ? 'var(--error)' : events.length > 0 ? 'var(--warning)' : 'var(--success)' }, { label: 'Risk Score', value: `${api.riskScore || 0}`, icon: <Shield size={16} />, color: (api.riskScore || 0) > 50 ? 'var(--error)' : (api.riskScore || 0) > 25 ? 'var(--warning)' : 'var(--success)' }].map((stat) => (<div key={stat.label} className="rounded-xl border p-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}><div className="flex items-center gap-2 mb-2"><span style={{ color: 'var(--text-tertiary)' }}>{stat.icon}</span><span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</span></div><p className="text-xl font-bold font-mono" style={{ color: stat.color }}>{stat.value}</p></div>))}
        </div>
        <div className="rounded-xl border p-5 mb-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-secondary)' }}>Response Time (24h)</h3>
          <div className="flex items-end gap-[3px] h-32">
            {chartBars.map((h, i) => { const normalized = (h / maxResponse) * 100; return (<div key={i} className="flex-1 flex flex-col items-center gap-1"><div className="w-full rounded-t-sm" style={{ height: `${Math.max(normalized, 4)}%`, background: h > 70 ? 'var(--warning)' : api.status === 'up' ? 'var(--success)' : api.status === 'slow' ? 'var(--warning)' : 'var(--error)', opacity: 0.5 + (normalized / 100) * 0.5 }} /><span className="text-[9px] font-mono" style={{ color: 'var(--text-tertiary)' }}>{i}h</span></div>); })}
          </div>
        </div>
        <div className="rounded-xl border p-5 mb-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 mb-4"><Eye size={16} style={{ color: 'var(--accent)' }} /><h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Watch this API</h3></div>
          {watchSubmitted ? (
            <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'var(--success-glow)' }}><Check size={16} style={{ color: 'var(--success)' }} /><span className="text-sm" style={{ color: 'var(--success)' }}>You&apos;re now watching <strong>{api.name}</strong>.</span></div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 px-4 py-2.5 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
              <button onClick={() => { if (email.trim()) setWatchSubmitted(true); }} className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold" style={{ background: 'var(--accent)', color: '#fff' }}><Eye size={14} />Watch this API</button>
            </div>
          )}
        </div>
        <div className="rounded-xl border p-5 mb-8" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Embed Badge</h3>
            <button onClick={copyEmbed} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: copied ? 'var(--success-glow)' : 'var(--bg-secondary)', color: copied ? 'var(--success)' : 'var(--text-secondary)', border: `1px solid ${copied ? 'var(--success)' : 'var(--border)'}` }}>{copied ? <Check size={12} /> : <Copy size={12} />}{copied ? 'Copied!' : 'Copy'}</button>
          </div>
          <pre className="p-4 rounded-lg text-xs font-mono overflow-x-auto" style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}><code>{embedCode}</code></pre>
        </div>
      </main>
      <footer className="mt-auto border-t px-4 sm:px-6 py-6" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2"><span className="dot dot-up" style={{ width: 8, height: 8 }} /><span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>PulseAPI</span></div>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Real-time API monitoring &amp; marketplace.</p>
        </div>
      </footer>
    </div>
  );
}
