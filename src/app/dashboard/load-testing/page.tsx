'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Zap, Gauge, Flame, TrendingUp, Users, Clock, Play, Loader2, Check, X, AlertTriangle, BarChart3, Activity } from 'lucide-react';

/* ========== TEST TYPES ========== */
const testTypes = [
  {
    id: 'starter',
    name: 'Starter',
    price: 9,
    icon: Zap,
    color: 'var(--accent)',
    description: 'Quick smoke test for basic API health.',
    users: 50,
    duration: 60,
    features: ['50 concurrent users', '60 second duration', 'Basic response metrics', 'Pass/fail report'],
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 29,
    icon: Gauge,
    color: 'var(--success)',
    description: 'Standard load test for production APIs.',
    users: 200,
    duration: 120,
    features: ['200 concurrent users', '120 second duration', 'Percentile response times', 'Error rate analysis'],
  },
  {
    id: 'stress',
    name: 'Stress',
    price: 79,
    icon: Flame,
    color: 'var(--error)',
    description: 'Push your API to its breaking point.',
    users: 1000,
    duration: 300,
    features: ['1,000 concurrent users', '5 minute duration', 'Full percentile breakdown', 'AI performance report'],
  },
  {
    id: 'spike',
    name: 'Spike',
    price: 49,
    icon: TrendingUp,
    color: 'var(--warning)',
    description: 'Simulate sudden traffic spikes.',
    users: 500,
    duration: 60,
    features: ['Ramp 500 → 2,000 users', '60 second duration', 'Spike analysis', 'Recovery time tracking'],
  },
];

/* ========== MOCK HISTORY ========== */
const mockHistory = [
  {
    id: 'lt-001',
    url: 'https://api.acme.com/v2/users',
    method: 'GET',
    type: 'Standard',
    status: 'completed',
    requests: 12847,
    avgResponse: '148ms',
    p95: '312ms',
    p99: '892ms',
    passRate: '99.7%',
    date: '2024-01-15 14:32',
  },
  {
    id: 'lt-002',
    url: 'https://api.acme.com/v2/orders',
    method: 'POST',
    type: 'Stress',
    status: 'completed',
    requests: 48210,
    avgResponse: '287ms',
    p95: '1,240ms',
    p99: '3,891ms',
    passRate: '94.2%',
    date: '2024-01-14 09:15',
  },
  {
    id: 'lt-003',
    url: 'https://api.acme.com/v2/auth',
    method: 'POST',
    type: 'Spike',
    status: 'failed',
    requests: 32156,
    avgResponse: '1,450ms',
    p95: '5,200ms',
    p99: '12,400ms',
    passRate: '78.1%',
    date: '2024-01-13 16:48',
  },
];

/* ========== MOCK RESULTS ========== */
interface TestResult {
  totalRequests: number;
  avgResponse: number;
  p50: number;
  p95: number;
  p99: number;
  passRate: number;
  pass: boolean;
}

/* ========== MAIN ========== */
export default function LoadTestingPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [targetUrl, setTargetUrl] = useState('https://api.example.com/health');
  const [method, setMethod] = useState('GET');
  const [duration, setDuration] = useState(60);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<TestResult | null>(null);
  const [progress, setProgress] = useState(0);

  const selectedTest = testTypes.find(t => t.id === selectedType);

  const handleStartTest = () => {
    if (!selectedType || !targetUrl.trim()) return;
    setRunning(true);
    setResults(null);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 8 + 2;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      const users = selectedTest?.users || 50;
      setResults({
        totalRequests: Math.round(users * duration * 1.3 + Math.random() * 1000),
        avgResponse: Math.round(80 + Math.random() * 200),
        p50: Math.round(60 + Math.random() * 100),
        p95: Math.round(200 + Math.random() * 400),
        p99: Math.round(500 + Math.random() * 1500),
        passRate: Math.round(85 + Math.random() * 15),
        pass: Math.random() > 0.3,
      });
      setRunning(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="border-b px-4 py-4 flex items-center gap-4 sticky top-0 z-40 backdrop-blur-xl" style={{ background: 'rgba(10,15,30,0.9)', borderColor: 'var(--border)' }}>
        <Link href="/" className="flex items-center gap-2 text-sm hover:text-white transition" style={{ color: 'var(--text-secondary)' }}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div className="flex-1" />
        <Link href="/" className="flex items-center gap-2 font-bold text-sm">
          <Activity className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          <span>PulseAPI</span>
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold mb-2 flex items-center gap-3">
            <Zap className="w-8 h-8" style={{ color: 'var(--accent)' }} />
            API Load Testing
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Stress test your APIs with real traffic simulation. Choose a test type, configure parameters, and get instant results.
          </p>
        </div>

        {/* Test Type Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {testTypes.map((t) => {
            const Icon = t.icon;
            const isSelected = selectedType === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={`rounded-xl border p-5 text-left transition cursor-pointer ${isSelected ? 'ring-2' : 'hover:border-opacity-60'}`}
                style={{
                  background: 'var(--bg-card)',
                  borderColor: isSelected ? t.color : 'var(--border)',
                  ringColor: t.color,
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${t.color}20` }}>
                    <Icon className="w-5 h-5" style={{ color: t.color }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{t.name}</h3>
                    <span className="text-lg font-extrabold" style={{ color: t.color }}>${t.price}</span>
                  </div>
                </div>
                <p className="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>{t.description}</p>
                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {t.users === 500 ? '500→2K' : t.users.toLocaleString()}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {t.duration}s</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Configuration Panel */}
        <div className="rounded-xl border p-6 mb-8" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            Test Configuration
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Target URL</label>
              <input
                type="url"
                value={targetUrl}
                onChange={e => setTargetUrl(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border text-sm font-mono focus:outline-none focus:ring-2"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
                placeholder="https://api.example.com/health"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>HTTP Method</label>
              <select
                value={method}
                onChange={e => setMethod(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent)' } as React.CSSProperties}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Duration: <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{duration}s</span>
              </label>
              <input
                type="range"
                min={10}
                max={300}
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="w-full mt-2 accent-blue-500"
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                <span>10s</span>
                <span>300s</span>
              </div>
            </div>
          </div>

          {/* Selected type info + start */}
          {selectedType && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-lg p-4 border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
              <div>
                <div className="text-sm font-medium">{selectedTest?.name} Test</div>
                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {selectedTest?.users === 500 ? 'Ramp' : ''}{selectedTest?.users?.toLocaleString()} users &middot; {selectedTest?.duration}s &middot; ${selectedTest?.price}
                </div>
              </div>
              <button
                onClick={handleStartTest}
                disabled={running}
                className="px-6 py-2.5 rounded-lg text-white font-medium text-sm transition hover:opacity-90 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                style={{ background: 'var(--accent)' }}
              >
                {running ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Running ({Math.min(Math.round(progress), 100)}%)...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Start Test
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {running && (
          <div className="mb-8 rounded-xl border p-5" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--accent)' }} />
                Running {selectedTest?.name} Test...
              </span>
              <span className="text-sm font-mono" style={{ color: 'var(--accent)' }}>{Math.min(Math.round(progress), 100)}%</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%`, background: 'var(--accent)' }}
              />
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="mb-8 rounded-xl border p-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
              {results.pass ? (
                <Check className="w-5 h-5" style={{ color: 'var(--success)' }} />
              ) : (
                <AlertTriangle className="w-5 h-5" style={{ color: 'var(--warning)' }} />
              )}
              Test Results
              <span className={`ml-auto text-xs px-2.5 py-1 rounded-full font-medium`} style={{ background: results.pass ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: results.pass ? 'var(--success)' : 'var(--warning)' }}>
                {results.pass ? 'PASSED' : 'NEEDS ATTENTION'}
              </span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              {[
                { label: 'Total Requests', value: results.totalRequests.toLocaleString(), color: 'var(--accent)' },
                { label: 'Avg Response', value: `${results.avgResponse}ms`, color: 'var(--text-primary)' },
                { label: 'P50', value: `${results.p50}ms`, color: 'var(--success)' },
                { label: 'P95', value: `${results.p95}ms`, color: results.p95 < 500 ? 'var(--success)' : 'var(--warning)' },
                { label: 'P99', value: `${results.p99}ms`, color: results.p99 < 1000 ? 'var(--success)' : 'var(--error)' },
                { label: 'Pass Rate', value: `${results.passRate}%`, color: results.passRate >= 95 ? 'var(--success)' : 'var(--warning)' },
              ].map(metric => (
                <div key={metric.label} className="rounded-lg p-3 border text-center" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                  <div className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>{metric.label}</div>
                  <div className="text-lg font-bold font-mono" style={{ color: metric.color }}>{metric.value}</div>
                </div>
              ))}
            </div>

            {/* Response time visualization */}
            <div className="rounded-lg p-4 border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
              <div className="text-xs font-medium mb-3" style={{ color: 'var(--text-tertiary)' }}>Response Time Distribution</div>
              <div className="flex items-end gap-0.5 h-20">
                {Array.from({ length: 40 }).map((_, i) => {
                  const h = Math.random() * 70 + 15;
                  const isSlow = (i / 40) > 0.8;
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-t"
                      style={{
                        height: `${h}%`,
                        background: isSlow ? 'var(--error)' : (i / 40) > 0.6 ? 'var(--warning)' : 'var(--success)',
                        opacity: 0.6 + Math.random() * 0.4,
                      }}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
                <span>Fast</span>
                <span>P50</span>
                <span>P95</span>
                <span>P99</span>
              </div>
            </div>
          </div>
        )}

        {/* Test History */}
        <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Clock className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              Test History
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <th className="px-5 py-3 text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>URL</th>
                  <th className="px-5 py-3 text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Method</th>
                  <th className="px-5 py-3 text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Type</th>
                  <th className="px-5 py-3 text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Requests</th>
                  <th className="px-5 py-3 text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Avg</th>
                  <th className="px-5 py-3 text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>P95</th>
                  <th className="px-5 py-3 text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>P99</th>
                  <th className="px-5 py-3 text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Pass</th>
                  <th className="px-5 py-3 text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {mockHistory.map((h) => (
                  <tr key={h.id} className="border-b last:border-0 text-sm" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-5 py-3 font-mono text-xs truncate max-w-[180px]" title={h.url}>{h.url}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>{h.method}</span>
                    </td>
                    <td className="px-5 py-3 text-xs">{h.type}</td>
                    <td className="px-5 py-3 font-mono text-xs">{h.requests.toLocaleString()}</td>
                    <td className="px-5 py-3 font-mono text-xs">{h.avgResponse}</td>
                    <td className="px-5 py-3 font-mono text-xs">{h.p95}</td>
                    <td className="px-5 py-3 font-mono text-xs">{h.p99}</td>
                    <td className="px-5 py-3 font-mono text-xs font-bold" style={{ color: parseFloat(h.passRate) >= 95 ? 'var(--success)' : 'var(--warning)' }}>{h.passRate}</td>
                    <td className="px-5 py-3">
                      {h.status === 'completed' ? (
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--success)' }}><Check className="w-3 h-3" /></span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--error)' }}><X className="w-3 h-3" /></span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
