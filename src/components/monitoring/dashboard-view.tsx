'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Server,
  Clock,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  type MonitoredEndpoint,
  type DashboardMetrics,
  type LogEntry,
} from '@/lib/monitoring-types';
import {
  getEndpoints,
  getDashboardMetrics,
  getResponseTimeHistory,
  getHourlyRequestCounts,
  getStatusCodeDistribution,
  simulateEndpointUpdate,
} from '@/lib/monitoring-data';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

function StatusIcon({ status }: { status: string }) {
  if (status === 'up') return <Zap className="w-4 h-4 text-emerald-400" />;
  if (status === 'degraded') return <AlertTriangle className="w-4 h-4 text-amber-400" />;
  return <AlertTriangle className="w-4 h-4 text-red-400" />;
}

function StatusDot({ status }: { status: string }) {
  const color = status === 'up' ? 'bg-emerald-400' : status === 'degraded' ? 'bg-amber-400' : 'bg-red-400';
  return <span className={`w-2.5 h-2.5 rounded-full ${color} ${status === 'up' ? 'animate-pulse' : ''}`} />;
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
    up: 'default',
    degraded: 'secondary',
    down: 'destructive',
  };
  const labels: Record<string, string> = { up: 'UP', degraded: 'DEGRADED', down: 'DOWN' };
  return <Badge variant={variants[status]} className="text-[10px] font-bold px-2">{labels[status]}</Badge>;
}

export function DashboardView() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [endpoints, setEndpoints] = useState<MonitoredEndpoint[]>([]);
  const [responseTimeData, setResponseTimeData] = useState<{ time: string; value: number }[]>([]);
  const [requestCounts, setRequestCounts] = useState<{ hour: string; success: number; error: number }[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<{ code: string; count: number; color: string }[]>([]);
  const [tick, setTick] = useState(0);

  const refreshData = useCallback(() => {
    const updatedEndpoints = simulateEndpointUpdate();
    setEndpoints(updatedEndpoints);
    setMetrics(getDashboardMetrics());
    setResponseTimeData(getResponseTimeHistory());
    setRequestCounts(getHourlyRequestCounts());
    setStatusDistribution(getStatusCodeDistribution());
  }, []);

  useEffect(() => {
    refreshData();
    const interval = setInterval(() => {
      refreshData();
      setTick((t) => t + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, [refreshData]);

  if (!metrics) return null;

  const statCards = [
    {
      title: 'Total Endpoints',
      value: metrics.totalEndpoints,
      icon: Server,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      subtitle: `${metrics.healthyEndpoints} healthy`,
    },
    {
      title: 'Avg Response Time',
      value: `${metrics.avgResponseTime}ms`,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      subtitle: `P95: ${metrics.p95ResponseTime}ms`,
      trend: metrics.avgResponseTime > 200 ? 'up' : 'down',
    },
    {
      title: 'Error Rate',
      value: `${metrics.errorRate}%`,
      icon: AlertTriangle,
      color: metrics.errorRate > 2 ? 'text-red-400' : 'text-emerald-400',
      bg: metrics.errorRate > 2 ? 'bg-red-500/10' : 'bg-emerald-500/10',
      subtitle: `${metrics.totalErrors.toLocaleString()} errors`,
    },
    {
      title: 'Overall Uptime',
      value: `${metrics.overallUptime}%`,
      icon: Activity,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      subtitle: 'Last 30 days',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.title} className="bg-card border-border hover:border-border/80 transition-colors">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">{card.title}</p>
                  <p className="text-2xl font-bold text-foreground">{card.value}</p>
                  <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center shrink-0`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Response Time Chart */}
        <Card className="xl:col-span-2 bg-card border-border">
          <CardHeader className="pb-2 px-4 lg:px-6 pt-4 lg:pt-6">
            <CardTitle className="text-sm font-semibold">Response Time</CardTitle>
            <CardDescription className="text-xs">Last 50 requests across all endpoints</CardDescription>
          </CardHeader>
          <CardContent className="px-2 lg:px-4 pb-4 lg:pb-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={responseTimeData}>
                  <defs>
                    <linearGradient id="responseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} width={50} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15,23,42,0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#10b981" fill="url(#responseGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 px-4 lg:px-6 pt-4 lg:pt-6">
            <CardTitle className="text-sm font-semibold">Status Codes</CardTitle>
            <CardDescription className="text-xs">Distribution by category</CardDescription>
          </CardHeader>
          <CardContent className="pb-4 lg:pb-6">
            <div className="h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15,23,42,0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {statusDistribution.map((item) => (
                <div key={item.code} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.code}</span>
                  <span className="text-xs font-semibold text-foreground">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests Chart */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2 px-4 lg:px-6 pt-4 lg:pt-6">
          <CardTitle className="text-sm font-semibold">Request Volume</CardTitle>
          <CardDescription className="text-xs">Success vs error requests over time</CardDescription>
        </CardHeader>
        <CardContent className="px-2 lg:px-4 pb-4 lg:pb-6">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={requestCounts}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15,23,42,0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="success" fill="#10b981" radius={[2, 2, 0, 0]} name="Success" />
                <Bar dataKey="error" fill="#ef4444" radius={[2, 2, 0, 0]} name="Error" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Endpoint Status Grid */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Endpoint Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {endpoints.map((ep) => (
            <Card key={ep.id} className="bg-card border-border hover:border-border/80 transition-all hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <StatusDot status={ep.status} />
                    <span className="text-sm font-medium text-foreground truncate">{ep.name}</span>
                  </div>
                  <StatusBadge status={ep.status} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Response</span>
                    <span className={`text-xs font-mono font-semibold ${ep.responseTime > 500 ? 'text-red-400' : ep.responseTime > 300 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {ep.responseTime}ms
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Uptime</span>
                    <span className={`text-xs font-semibold ${ep.uptime >= 99.9 ? 'text-emerald-400' : ep.uptime >= 99 ? 'text-amber-400' : 'text-red-400'}`}>
                      {ep.uptime}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Method</span>
                    <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {ep.method}
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-[10px] text-muted-foreground truncate font-mono">{ep.url}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
