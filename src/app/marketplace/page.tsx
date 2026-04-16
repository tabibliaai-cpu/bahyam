'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { Search, ArrowUpDown, Eye, Menu, X, ChevronDown } from 'lucide-react';

type ApiData = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  status: 'up' | 'down' | 'slow';
  uptime: number;
  responseTime: number;
  riskScore: number;
  degradation_probability: number;
  last_checked: string;
};

type SortOption = 'uptime' | 'fastest' | 'risk' | 'watched';

const CATEGORIES = ['All', 'AI', 'Payment', 'Crypto', 'Infrastructure', 'Auth', 'Email', 'Database'];
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'uptime', label: 'Best Uptime' },
  { value: 'fastest', label: 'Fastest' },
  { value: 'risk', label: 'Highest Risk' },
  { value: 'watched', label: 'Most Watched' },
];

export default function MarketplacePage() {
  const [apis, setApis] = useState<ApiData[]>([]);
  const [connected, setConnected] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState<SortOption>('uptime');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [watching, setWatching] = useState<Set<string>>(new Set());
  const prevApis = useRef<Record<string, string>>({});

  useEffect(() => {
    let es: EventSource | null = null;
    let fallbackInterval: NodeJS.Timeout;
    const connect = () => {
      es = new EventSource('/api/live/stream');
      es.onopen = () => setConnected(true);
      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.apis) {
            setApis((prev) => {
              data.apis.forEach((api: any) => {
                const oldStatus = prevApis.current[api.id];
                if (oldStatus && oldStatus !== api.status) {
                  setTimeout(() => {
                    const el = document.getElementById(`marketplace-card-${api.id}`);
                    if (el) {
                      el.classList.add(api.status === 'up' ? 'flash-green' : 'flash-red');
                      setTimeout(() => el.classList.remove('flash-green', 'flash-red'), 1500);
                    }
                  }, 0);
                }
                prevApis.current[api.id] = api.status;
              });
              return data.apis;
            });
          }
        } catch {}
      };
      es.onerror = () => {
        setConnected(false);
        if (es) es.close();
        fallbackInterval = setInterval(async () => {
          try {
            const res = await fetch('/api/live/data');
            const data = await res.json();
            if (data.apis) setApis(data.apis);
            setConnected(true);
          } catch {}
        }, 5000);
      };
    };
    connect();
    return () => { if (es) es.close(); clearInterval(fallbackInterval); };
  }, []);

  const filteredApis = useMemo(() => {
    let result = [...apis];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((api) => api.name.toLowerCase().includes(q) || (api.description || '').toLowerCase().includes(q) || (api.category || '').toLowerCase().includes(q));
    }
    if (category !== 'All') result = result.filter((api) => api.category === category);
    switch (sort) {
      case 'uptime': result.sort((a, b) => (b.uptime || 0) - (a.uptime || 0)); break;
      case 'fastest': result.sort((a, b) => (a.responseTime || Infinity) - (b.responseTime || Infinity)); break;
      case 'risk': result.sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0)); break;
      case 'watched': result.sort((a, b) => (watching.has(b.id) ? 1 : 0) - (watching.has(a.id) ? 1 : 0)); break;
    }
    return result;
  }, [apis, search, category, sort, watching]);

  const top5Reliable = useMemo(() => [...apis].sort((a, b) => (b.uptime || 0) - (a.uptime || 0)).slice(0, 5), [apis]);

  const toggleWatch = (apiId: string) => {
    setWatching((prev) => { const next = new Set(prev); if (next.has(apiId)) next.delete(apiId); else next.add(apiId); return next; });
  };

  const generateSparkline = (apiId: string) => {
    const seed = apiId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return Array.from({ length: 20 }, (_, i) => { const hash = Math.sin(seed * (i + 1) * 0.001) * 10000; return Math.abs(Math.floor((hash % 100))); });
  };

  const navLinks = [
    { href: '/live', label: 'Live Feed' },
    { href: '/marketplace', label: 'Marketplace', active: true },
    { href: '/pricing', label: 'Pricing' },
    { href: '/advertise', label: 'Advertise' },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <header className="sticky top-0 z-50 border-b backdrop-blur-xl" style={{ background: 'rgba(10,15,30,0.92)', borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <span className="dot dot-up" style={{ width: 10, height: 10 }} />
            <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>PulseAPI</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className="px-3 py-2 rounded-lg text-sm font-medium transition-colors no-underline" style={{ color: link.active ? 'var(--accent)' : 'var(--text-secondary)', background: link.active ? 'var(--accent-glow)' : 'transparent' }}>{link.label}</Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className={`dot ${connected ? 'dot-up' : 'dot-down'}`} style={{ width: 6, height: 6 }} />
              <span className="text-xs" style={{ color: connected ? 'var(--success)' : 'var(--error)' }}>{connected ? 'Live' : 'Reconnecting'}</span>
            </div>
            <Link href="/dashboard" className="px-4 py-2 rounded-lg text-sm font-semibold transition-all no-underline" style={{ background: 'var(--accent)', color: '#fff' }}>Start Free</Link>
          </div>
          <button className="md:hidden p-2 rounded-lg" style={{ color: 'var(--text-secondary)' }} onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t px-4 pb-4 pt-2 flex flex-col gap-1" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className="px-3 py-2.5 rounded-lg text-sm font-medium no-underline" style={{ color: link.active ? 'var(--accent)' : 'var(--text-secondary)', background: link.active ? 'var(--accent-glow)' : 'transparent' }} onClick={() => setMobileMenuOpen(false)}>{link.label}</Link>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>API Marketplace</h1>
          <p className="text-base" style={{ color: 'var(--text-secondary)' }}>Discover, compare, and monitor APIs across the web. Real-time uptime &amp; performance data.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-tertiary)' }} />
            <input type="text" placeholder="Search APIs..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')} onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
          </div>
          <div className="relative">
            <button onClick={() => setSortDropdownOpen(!sortDropdownOpen)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              <ArrowUpDown size={14} /><span className="hidden sm:inline">{SORT_OPTIONS.find((s) => s.value === sort)?.label}</span><ChevronDown size={14} />
            </button>
            {sortDropdownOpen && (
              <><div className="fixed inset-0 z-40" onClick={() => setSortDropdownOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 rounded-lg border overflow-hidden py-1 min-w-[180px]" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                {SORT_OPTIONS.map((option) => (
                  <button key={option.value} onClick={() => { setSort(option.value); setSortDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm transition-colors" style={{ background: sort === option.value ? 'var(--accent-glow)' : 'transparent', color: sort === option.value ? 'var(--accent)' : 'var(--text-secondary)' }}>{option.label}</button>
                ))}
              </div></>
            )}
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)} className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all" style={{ background: category === cat ? 'var(--accent)' : 'var(--bg-card)', color: category === cat ? '#fff' : 'var(--text-secondary)', border: category === cat ? '1px solid var(--accent)' : '1px solid var(--border)' }}>{cat}</button>
          ))}
        </div>
        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            {filteredApis.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredApis.map((api) => {
                  const sparkline = generateSparkline(api.id);
                  const isWatched = watching.has(api.id);
                  return (
                    <Link key={api.id} href={`/marketplace/${api.slug}`} className="block no-underline">
                      <div id={`marketplace-card-${api.id}`} className="rounded-xl border p-4 transition-all" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 min-w-0"><span className={`dot dot-${api.status}`} style={{ width: 8, height: 8 }} /><span className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{api.name}</span></div>
                          <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 ml-2" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>{api.category}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div><div className="text-xs mb-0.5" style={{ color: 'var(--text-tertiary)' }}>Uptime</div><div className="text-sm font-bold font-mono" style={{ color: api.uptime >= 99 ? 'var(--success)' : api.uptime >= 95 ? 'var(--warning)' : 'var(--error)' }}>{api.uptime || 100}%</div></div>
                          <div><div className="text-xs mb-0.5" style={{ color: 'var(--text-tertiary)' }}>Response</div><div className="text-sm font-bold font-mono" style={{ color: api.status === 'up' ? 'var(--success)' : api.status === 'slow' ? 'var(--warning)' : 'var(--error)' }}>{api.responseTime || 0}ms</div></div>
                          <div><div className="text-xs mb-0.5" style={{ color: 'var(--text-tertiary)' }}>Risk</div><div className="text-sm font-bold font-mono" style={{ color: (api.riskScore || 0) > 50 ? 'var(--error)' : (api.riskScore || 0) > 25 ? 'var(--warning)' : 'var(--success)' }}>{api.riskScore || 0}</div></div>
                        </div>
                        <div className="flex items-end gap-[2px] h-8 mb-3">
                          {sparkline.map((h, i) => (<div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, background: api.status === 'up' ? 'var(--success)' : api.status === 'slow' ? 'var(--warning)' : 'var(--error)', opacity: 0.4 + (h / 100) * 0.6 }} />))}
                        </div>
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWatch(api.id); }} className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-xs font-medium transition-all" style={{ background: isWatched ? 'var(--accent-glow)' : 'var(--bg-secondary)', color: isWatched ? 'var(--accent)' : 'var(--text-secondary)', border: `1px solid ${isWatched ? 'var(--accent)' : 'var(--border)'}` }}>
                          <Eye size={13} />{isWatched ? 'Watching' : 'Watch'}
                        </button>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border p-12 text-center" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <p className="text-base font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{apis.length === 0 ? 'No APIs listed yet.' : 'No APIs match your filters.'}</p>
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{apis.length === 0 ? 'Be the first to list yours.' : 'Try adjusting your search or category filter.'}</p>
              </div>
            )}
          </div>
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="rounded-xl border p-5 sticky top-24" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-secondary)' }}>Top 5 Most Reliable</h3>
              <div className="flex flex-col gap-3">
                {top5Reliable.map((api, idx) => (
                  <Link key={api.id} href={`/marketplace/${api.slug}`} className="flex items-center gap-3 p-2.5 rounded-lg transition-all no-underline" style={{ background: 'var(--bg-secondary)' }}>
                    <span className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0" style={{ background: idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : 'var(--border)', color: idx < 3 ? '#0A0F1E' : 'var(--text-secondary)' }}>{idx + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5"><span className={`dot dot-${api.status}`} style={{ width: 6, height: 6 }} /><span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{api.name}</span></div>
                      <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{api.category}</span>
                    </div>
                    <span className="text-sm font-bold font-mono flex-shrink-0" style={{ color: 'var(--success)' }}>{api.uptime || 100}%</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
      <footer className="mt-auto border-t px-4 sm:px-6 py-6" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2"><span className="dot dot-up" style={{ width: 8, height: 8 }} /><span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>PulseAPI</span></div>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Real-time API monitoring &amp; marketplace.</p>
        </div>
      </footer>
    </div>
  );
}
