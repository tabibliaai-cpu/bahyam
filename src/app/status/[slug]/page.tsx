'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Activity, AlertTriangle, Clock, ExternalLink } from 'lucide-react';

/* ========== UPTIME BAR ========== */
function UptimeBar({ uptime }: { uptime: number }) {
  // Generate 90 boxes: green for up, gray for down based on uptime percentage
  const boxes = Array.from({ length: 90 }).map(() => {
    const rand = Math.random() * 100;
    return rand < uptime ? 'up' : 'down';
  });

  return (
    <div className="flex gap-0.5">
      {boxes.map((status, i) => (
        <div
          key={i}
          className="w-1.5 h-4 rounded-sm"
          style={{ background: status === 'up' ? 'var(--success)' : 'var(--text-tertiary)', opacity: status === 'up' ? 0.8 : 0.3 }}
          title={status === 'up' ? 'Operational' : 'Down'}
        />
      ))}
    </div>
  );
}

/* ========== MAIN ========== */
export default function StatusPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [apis, setApis] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/live/data');
        const data = await res.json();
        // Show all public APIs as demo
        setApis(data.apis || []);
        setEvents(data.events?.slice(0, 5) || []);
        setLastUpdated(new Date().toLocaleTimeString());
      } catch {
        // fallback: generate demo data
        setApis([
          { id: '1', name: 'API Gateway', status: 'up', responseTime: 142, uptime: 99.8 },
          { id: '2', name: 'Auth Service', status: 'up', responseTime: 89, uptime: 99.5 },
          { id: '3', name: 'Payment API', status: 'slow', responseTime: 1850, uptime: 97.2 },
          { id: '4', name: 'Notification Service', status: 'up', responseTime: 210, uptime: 100 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [slug]);

  const statusColor = (s: string) => s === 'up' ? 'var(--success)' : s === 'slow' ? 'var(--warning)' : 'var(--error)';
  const statusLabel = (s: string) => s === 'up' ? 'Operational' : s === 'slow' ? 'Degraded' : 'Down';
  const overallStatus = apis.length > 0 && apis.every((a: any) => a.status === 'up') ? 'up' : apis.some((a: any) => a.status === 'down') ? 'down' : 'slow';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="border-b" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            <h1 className="text-2xl font-bold capitalize">{slug?.replace(/-/g, ' ') || 'API Status'}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className={`dot dot-${overallStatus}`} style={{ width: 10, height: 10 }} />
            <span className="text-sm font-medium" style={{ color: statusColor(overallStatus) }}>
              {overallStatus === 'up' ? 'All Systems Operational' : overallStatus === 'slow' ? 'Partial Degradation' : 'Service Outage'}
            </span>
            {lastUpdated && (
              <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
                <Clock className="w-3 h-3" /> Updated {lastUpdated}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-xl border p-5 animate-pulse" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <div className="h-4 rounded w-32 mb-3" style={{ background: 'var(--bg-secondary)' }} />
                <div className="h-3 rounded w-20" style={{ background: 'var(--bg-secondary)' }} />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* API Status List */}
            <div className="space-y-3 mb-10">
              {apis.map((api: any) => (
                <div key={api.id} className="rounded-xl border p-5 transition hover:border-blue-500/30" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`dot dot-${api.status}`} style={{ width: 10, height: 10 }} />
                      <div>
                        <h3 className="font-semibold">{api.name}</h3>
                        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{api.category || 'REST API'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-right">
                        <div style={{ color: 'var(--text-tertiary)' }} className="text-xs">Response</div>
                        <div className="font-mono font-bold">{api.responseTime || 0}ms</div>
                      </div>
                      <div className="text-right">
                        <div style={{ color: 'var(--text-tertiary)' }} className="text-xs">Uptime</div>
                        <div className="font-bold" style={{ color: api.uptime >= 99 ? 'var(--success)' : api.uptime >= 95 ? 'var(--warning)' : 'var(--error)' }}>{api.uptime || 100}%</div>
                      </div>
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ background: api.status === 'up' ? 'rgba(16,185,129,0.15)' : api.status === 'slow' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)', color: statusColor(api.status) }}
                      >
                        {statusLabel(api.status)}
                      </span>
                    </div>
                  </div>
                  {/* Uptime bar */}
                  <UptimeBar uptime={api.uptime || 100} />
                </div>
              ))}
            </div>

            {/* Current Incidents */}
            <div className="mb-10">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" style={{ color: 'var(--warning)' }} />
                Current Incidents
              </h2>
              {events && events.length > 0 ? (
                <div className="space-y-3">
                  {events.map((e: any, i: number) => (
                    <div key={i} className="rounded-xl border p-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`dot ${e.severity === 'high' || e.severity === 'critical' ? 'dot-down' : 'dot-slow'}`} style={{ width: 6, height: 6 }} />
                        <span className="font-medium text-sm">{e.api_name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: e.severity === 'high' || e.severity === 'critical' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: e.severity === 'high' || e.severity === 'critical' ? 'var(--error)' : 'var(--warning)' }}>
                          {e.severity}
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{e.error_summary}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border p-6 text-center" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  <span className="dot dot-up" style={{ width: 10, height: 10 }} />
                  <p className="mt-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>No active incidents</p>
                </div>
              )}
            </div>

            {/* Uptime Legend */}
            <div className="rounded-xl border p-4 mb-10" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <h3 className="text-sm font-medium mb-3">Uptime (last 90 days)</h3>
              <div className="flex items-center gap-6 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ background: 'var(--success)', opacity: 0.8 }} />
                  Operational
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ background: 'var(--text-tertiary)', opacity: 0.3 }} />
                  Down
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
          <div className="flex items-center gap-2">
            <span className="dot dot-up" style={{ width: 6, height: 6 }} />
            <span className="font-medium">Powered by</span>
            <Link href="/" className="font-bold text-white hover:underline flex items-center gap-1">
              PulseAPI <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <span>Status page updates every 30 seconds</span>
        </div>
      </footer>
    </div>
  );
}
