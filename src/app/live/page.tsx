'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

export default function LiveFeedPage() {
  const [apis, setApis] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [events, setEvents] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);
  const prevApis = useRef<Record<string, any>>({});

  useEffect(() => {
    let es: EventSource | null = null;
    let fallbackInterval: NodeJS.Timeout;

    const connect = () => {
      es = new EventSource('/api/live/stream');
      es.onopen = () => setConnected(true);
      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          setApis((prev) => {
            if (data.apis) {
              data.apis.forEach((api: any) => {
                const old = prevApis.current[api.id];
                if (old && old.status !== api.status) {
                  setTimeout(() => {
                    const el = document.getElementById(`api-card-${api.id}`);
                    if (el) {
                      el.classList.add(api.status === 'up' ? 'flash-green' : 'flash-red');
                      setTimeout(() => el.classList.remove('flash-green', 'flash-red'), 1500);
                    }
                  }, 0);
                }
                prevApis.current[api.id] = api;
              });
            }
            return data.apis || prev;
          });
          if (data.stats) setStats(data.stats);
          if (data.events) setEvents(data.events);
        } catch {}
      };
      es.onerror = () => {
        setConnected(false);
        if (es) es.close();
        fallbackInterval = setInterval(async () => {
          try {
            const res = await fetch('/api/live/data');
            const data = await res.json();
            setApis(data.apis || []);
            setStats(data.stats || {});
            setEvents(data.events || []);
            setConnected(true);
          } catch {}
        }, 5000);
      };
    };

    connect();
    return () => {
      if (es) es.close();
      clearInterval(fallbackInterval);
    };
  }, []);

  const statusColor = (s: string) => s === 'up' ? 'var(--success)' : s === 'slow' ? 'var(--warning)' : 'var(--error)';
  const tickerApis = [...(apis || []), ...(apis || [])];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="scan-line" />
      <header className="border-b px-4 py-3 flex items-center justify-between sticky top-0 z-40 backdrop-blur-xl" style={{ background: 'rgba(10,15,30,0.9)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="dot dot-up" style={{ width: 10, height: 10 }} />
            <span>PULSEAPI</span>
          </Link>
          <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--success)' }}>LIVE</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`dot ${connected ? 'dot-up' : 'dot-down'}`} style={{ width: 6, height: 6 }} />
          <span className="text-xs" style={{ color: connected ? 'var(--success)' : 'var(--error)' }}>{connected ? 'Connected' : 'Reconnecting...'}</span>
        </div>
      </header>

      <div className="border-b ticker-wrapper py-2" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="ticker-track">
          {tickerApis.map((api, i) => (
            <span key={`${api.id}-${i}`} className="inline-flex items-center gap-2 text-xs font-mono whitespace-nowrap">
              <span className={`dot dot-${api.status}`} style={{ width: 6, height: 6 }} />
              <span>{api.name}</span>
              <span style={{ color: statusColor(api.status) }}>{api.responseTime || 0}ms</span>
              <span style={{ color: 'var(--text-tertiary)' }}>{api.uptime || 100}%</span>
            </span>
          ))}
        </div>
      </div>

      <div className="border-b px-4 py-3" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto grid grid-cols-5 gap-4 text-center stats-grid">
          {[
            { label: 'APIs Monitored', value: stats.totalApis || 0, color: 'var(--accent)' },
            { label: 'Global Uptime', value: `${stats.globalUptime || 100}%`, color: 'var(--success)' },
            { label: 'Checks (24h)', value: stats.checksToday || 0, color: 'var(--text-primary)' },
            { label: 'Incidents', value: stats.activeIncidents || 0, color: 'var(--warning)' },
            { label: 'Avg Response', value: `${stats.avgResponse || 0}ms`, color: 'var(--text-primary)' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-lg font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-4">Live API Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {apis && apis.length > 0 ? apis.map((api: any) => (
              <div
                key={api.id}
                id={`api-card-${api.id}`}
                className="rounded-xl border p-4 transition"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`dot dot-${api.status}`} style={{ width: 8, height: 8 }} />
                    <span className="font-semibold">{api.name}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>{api.category}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Response Time</div>
                    <div className="text-xl font-bold font-mono" style={{ color: statusColor(api.status) }}>{api.responseTime || 0}<span className="text-xs font-normal">ms</span></div>
                  </div>
                  <div>
                    <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Uptime (24h)</div>
                    <div className="text-xl font-bold font-mono" style={{ color: api.uptime >= 99 ? 'var(--success)' : api.uptime >= 95 ? 'var(--warning)' : 'var(--error)' }}>{api.uptime || 100}%</div>
                  </div>
                </div>
                <div className="flex items-end gap-0.5 h-6 mb-3">
                  {Array.from({ length: 20 }).map((_, i) => {
                    const h = Math.random() * 80 + 20;
                    return <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: api.status === 'up' ? 'var(--success)' : api.status === 'slow' ? 'var(--warning)' : 'var(--error)', opacity: 0.6 + Math.random() * 0.4 }} />;
                  })}
                </div>
                <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  <span className="px-2 py-0.5 rounded font-mono" style={{ background: api.riskScore > 50 ? 'var(--error-glow)' : 'var(--bg-secondary)', color: api.riskScore > 50 ? 'var(--error)' : 'var(--text-secondary)' }}>Risk: {api.riskScore || 0}</span>
                  <span>{api.last_checked ? new Date(api.last_checked).toLocaleTimeString() : 'N/A'}</span>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-20" style={{ color: 'var(--text-tertiary)' }}>
                <div className="dot dot-up mx-auto mb-4" style={{ width: 16, height: 16 }} />
                <p>Waiting for data... Visit /api/seed-benchmarks to seed APIs</p>
              </div>
            )}
          </div>
        </div>

        <aside className="hidden lg:block w-80 flex-shrink-0">
          <h3 className="text-lg font-bold mb-4">Live Events</h3>
          <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="max-h-[70vh] overflow-y-auto">
              {events && events.length > 0 ? events.map((e: any, i: number) => (
                <div key={i} className="p-3 border-b text-sm" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`dot ${e.severity === 'high' || e.severity === 'critical' ? 'dot-down' : 'dot-slow'}`} style={{ width: 6, height: 6 }} />
                    <span className="font-medium text-xs">{e.api_name}</span>
                    <span className="ml-auto text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-secondary)', color: e.severity === 'high' || e.severity === 'critical' ? 'var(--error)' : 'var(--warning)', fontSize: 10 }}>{e.severity}</span>
                  </div>
                  <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{e.error_summary}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{e.sent_at ? new Date(e.sent_at).toLocaleTimeString() : ''}</p>
                </div>
              )) : (
                <div className="p-6 text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>No events yet</div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
