'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Server,
  Activity,
  AlertTriangle,
  CheckCircle,
  Plus,
  ArrowRight,
  Clock,
  TrendingUp,
  Shield,
  CreditCard,
} from 'lucide-react';

interface DashboardStats {
  myApis: number;
  avgUptime: number;
  activeAlerts: number;
  checksToday: number;
}

interface RecentEvent {
  id: string;
  api_name: string;
  error_summary: string | null;
  severity: string;
  sent_at: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    myApis: 0,
    avgUptime: 100,
    activeAlerts: 0,
    checksToday: 0,
  });
  const [events, setEvents] = useState<RecentEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/live/data');
        const data = await res.json();
        if (data.stats) {
          setStats({
            myApis: data.stats.totalApis || 0,
            avgUptime: data.stats.globalUptime || 100,
            activeAlerts: data.stats.activeIncidents || 0,
            checksToday: data.stats.checksToday || 0,
          });
        }
        if (data.events?.length) {
          setEvents(data.events.slice(0, 10));
        }
      } catch {
        // Keep defaults
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    {
      label: 'My APIs',
      value: stats.myApis,
      icon: <Server size={20} />,
      color: 'var(--accent)',
      bgColor: 'rgba(59,130,246,0.1)',
    },
    {
      label: 'Avg Uptime',
      value: `${stats.avgUptime}%`,
      icon: <TrendingUp size={20} />,
      color: 'var(--success)',
      bgColor: 'rgba(16,185,129,0.1)',
    },
    {
      label: 'Active Alerts',
      value: stats.activeAlerts,
      icon: <AlertTriangle size={20} />,
      color: 'var(--warning)',
      bgColor: 'rgba(245,158,11,0.1)',
    },
    {
      label: 'Checks Today',
      value: stats.checksToday,
      icon: <Activity size={20} />,
      color: 'var(--accent)',
      bgColor: 'rgba(59,130,246,0.1)',
    },
  ];

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHrs = Math.floor(diffMins / 60);
      if (diffHrs < 24) return `${diffHrs}h ago`;
      return `${Math.floor(diffHrs / 24)}d ago`;
    } catch {
      return '';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'var(--error)';
      case 'medium':
        return 'var(--warning)';
      case 'low':
        return 'var(--text-secondary)';
      default:
        return 'var(--text-tertiary)';
    }
  };

  const getSeverityDot = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'dot-down';
      case 'medium':
        return 'dot-slow';
      default:
        return 'dot-up';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Monitor your APIs and respond to incidents
          </p>
        </div>
        <Link
          href="/dashboard/apis/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition hover:opacity-90"
          style={{ background: 'var(--accent)' }}
        >
          <Plus size={16} />
          Add API
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border p-4 sm:p-5 transition-all"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                {card.label}
              </span>
              <div
                className="flex items-center justify-center rounded-lg"
                style={{ background: card.bgColor, color: card.color, width: 36, height: 36 }}
              >
                {card.icon}
              </div>
            </div>
            <div
              className="text-2xl sm:text-3xl font-bold"
              style={{ color: card.color }}
            >
              {loading ? (
                <span className="inline-block w-16 h-8 rounded animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
              ) : (
                card.value
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State / CTA */}
      {stats.myApis === 0 && !loading && (
        <div
          className="rounded-xl border p-6 sm:p-8 mb-8 text-center"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border)',
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(59,130,246,0.1)' }}
          >
            <Server size={28} style={{ color: 'var(--accent)' }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Add Your First API
          </h2>
          <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Start monitoring your APIs in seconds. Get real-time alerts, AI-powered diagnostics, and failure predictions.
          </p>
          <Link
            href="/dashboard/apis/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: 'var(--accent)' }}
          >
            <Plus size={18} />
            Add Your First API
          </Link>
        </div>
      )}

      {/* Recent Alerts / Events */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{
          background: 'var(--bg-card)',
          borderColor: 'var(--border)',
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />
            <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              Recent Alerts
            </h2>
          </div>
          {events.length > 0 && (
            <span
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--warning)' }}
            >
              {events.length} events
            </span>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 rounded-lg animate-pulse"
                  style={{ background: 'var(--bg-secondary)' }}
                />
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {events.map((event, i) => (
                <div
                  key={event.id || i}
                  className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-white/[0.02]"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <span
                    className={`dot ${getSeverityDot(event.severity)} mt-1.5 flex-shrink-0`}
                    style={{ width: 8, height: 8 }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="text-sm font-medium truncate"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {event.api_name}
                      </span>
                      <span
                        className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          background: `${getSeverityColor(event.severity)}15`,
                          color: getSeverityColor(event.severity),
                        }}
                      >
                        {event.severity}
                      </span>
                    </div>
                    <p
                      className="text-xs truncate"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {event.error_summary || 'No details available'}
                    </p>
                  </div>
                  <span
                    className="text-[11px] flex-shrink-0 flex items-center gap-1 mt-0.5"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    <Clock size={11} />
                    {formatTime(event.sent_at)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center">
              <CheckCircle
                size={40}
                className="mx-auto mb-3"
                style={{ color: 'var(--success)' }}
              />
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                All systems operational
              </p>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                No recent alerts to display
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {[
          {
            title: 'Load Testing',
            desc: 'Stress test your APIs with real traffic',
            href: '/dashboard/load-testing',
            icon: <Activity size={18} />,
            color: 'var(--accent)',
          },
          {
            title: 'API Certify',
            desc: 'Get your API certified on the marketplace',
            href: '/certify',
            icon: <Shield size={18} />,
            color: 'var(--success)',
          },
          {
            title: 'View Billing',
            desc: 'Manage your subscription and payments',
            href: '/pricing',
            icon: <CreditCard size={18} />,
            color: 'var(--warning)',
          },
        ].map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="group rounded-xl border p-5 transition-all hover:border-[var(--accent)]/40"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="flex items-center justify-center rounded-lg"
                style={{
                  background: `${action.color}15`,
                  color: action.color,
                  width: 32,
                  height: 32,
                }}
              >
                {action.icon}
              </div>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {action.title}
              </span>
              <ArrowRight
                size={14}
                className="ml-auto opacity-0 -translate-x-1 transition-all group-hover:opacity-60 group-hover:translate-x-0"
                style={{ color: 'var(--text-tertiary)' }}
              />
            </div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {action.desc}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
