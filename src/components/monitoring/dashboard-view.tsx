'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  AlertTriangle,
  Server,
  Clock,
  Zap,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Radio,
  Power,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  type MonitoredEndpoint,
  type DashboardMetrics,
} from '@/lib/monitoring-types';
import {
  getEndpoints,
  getDashboardMetrics,
  getResponseTimeHistory,
  getHourlyRequestCounts,
  getStatusCodeDistribution,
  runLiveChecks,
  runSingleCheck,
  getSettings,
  resetAllData,
  toggleEndpoint,
  deleteEndpoint,
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
  const [responseTimeData, setResponseTimeData] = useState<{ time: string; value: number; isLive: boolean }[]>([]);
  const [requestCounts, setRequestCounts] = useState<{ hour: string; success: number; error: number }[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<{ code: string; count: number; color: string }[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [settings, setSettings] = useState(getSettings());
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const refreshData = useCallback(async () => {
    setEndpoints(getEndpoints());
    setMetrics(getDashboardMetrics());
    setResponseTimeData(getResponseTimeHistory());
    setRequestCounts(getHourlyRequestCounts());
    setStatusDistribution(getStatusCodeDistribution());
    setSettings(getSettings());
  }, []);

  const runChecks = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    try {
      await runLiveChecks();
      refreshData();
    } catch {
      // silently handle
    }
    setIsRunning(false);
  }, [isRunning, refreshData]);

  const handleQuickCheck = async (endpointId: string) => {
    const result = await runSingleCheck(endpointId);
    if (result.endpoint) {
      setEndpoints(prev => prev.map(ep => ep.id === endpointId ? result.endpoint! : ep));
      setMetrics(getDashboardMetrics());
      setResponseTimeData(getResponseTimeHistory());
      setRequestCounts(getHourlyRequestCounts());
      setStatusDistribution(getStatusCodeDistribution());
    }
  };

  const handleToggleEndpoint = async (endpointId: string) => {
    toggleEndpoint(endpointId);
    refreshData();
  };

  const handleReset = () => {
    resetAllData();
    refreshData();
    setResetDialogOpen(false);
  };

  // Auto-refresh based on settings interval
  useEffect(() => {
    refreshData();
    if (!settings.monitoringEnabled) return;
    const interval = setInterval(() => {
      runChecks();
    }, (settings.checkInterval || 30) * 1000);
    return () => clearInterval(interval);
  }, [settings.checkInterval, settings.monitoringEnabled, refreshData, runChecks]);

  if (!metrics) return null;

  const statCards = [
    {
      title: 'Monitored Endpoints',
      value: metrics.enabledEndpoints,
      icon: Server,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      subtitle: `${metrics.totalEndpoints} total / ${metrics.healthyEndpoints} healthy`,
    },
    {
      title: 'Avg Response Time',
      value: `${metrics.avgResponseTime}ms`,
      icon: Clock,
      color: metrics.avgResponseTime > 1000 ? 'text-red-400' : metrics.avgResponseTime > 500 ? 'text-amber-400' : 'text-emerald-400',
      bg: metrics.avgResponseTime > 1000 ? 'bg-red-500/10' : metrics.avgResponseTime > 500 ? 'bg-amber-500/10' : 'bg-emerald-500/10',
      subtitle: `P95: ${metrics.p95ResponseTime}ms`,
    },
    {
      title: 'Error Rate',
      value: `${metrics.errorRate}%`,
      icon: AlertTriangle,
      color: metrics.errorRate > 5 ? 'text-red-400' : metrics.errorRate > 1 ? 'text-amber-400' : 'text-emerald-400',
      bg: metrics.errorRate > 5 ? 'bg-red-500/10' : metrics.errorRate > 1 ? 'bg-amber-500/10' : 'bg-emerald-500/10',
      subtitle: `${metrics.totalErrors} errors / ${metrics.totalRequests} checks`,
    },
    {
      title: 'Overall Uptime',
      value: `${metrics.overallUptime}%`,
      icon: Activity,
      color: metrics.overallUptime >= 99.9 ? 'text-emerald-400' : metrics.overallUptime >= 99 ? 'text-amber-400' : 'text-red-400',
      bg: metrics.overallUptime >= 99.9 ? 'bg-emerald-500/10' : metrics.overallUptime >= 99 ? 'bg-amber-500/10' : 'bg-red-500/10',
      subtitle: `SSL issues: ${metrics.sslIssues}`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${settings.monitoringEnabled ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-muted bg-muted/50'}`}>
            {settings.monitoringEnabled ? <Radio className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-muted-foreground" />}
            <span className={`text-xs font-medium ${settings.monitoringEnabled ? 'text-emerald-400' : 'text-muted-foreground'}`}>
              {settings.monitoringEnabled ? 'Live Monitoring Active' : 'Monitoring Paused'}
            </span>
            <span className="text-[10px] text-muted-foreground">({settings.checkInterval}s interval)</span>
          </div>
          <Badge variant="outline" className="text-[10px] gap-1">
            <Zap className="w-3 h-3 text-emerald-400" />
            {metrics.liveChecks} live checks
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button onClick={runChecks} disabled={isRunning || !settings.monitoringEnabled} size="sm" className="gap-1.5">
            {isRunning ? (
              <><RotateCcw className="w-3.5 h-3.5 animate-spin" /> Checking...</>
            ) : (
              <><Play className="w-3.5 h-3.5" /> Run Checks Now</>
            )}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive" onClick={() => setResetDialogOpen(true)}>
            <Trash2 className="w-3.5 h-3.5" />
            Reset
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(card => (
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
        <Card className="xl:col-span-2 bg-card border-border">
          <CardHeader className="pb-2 px-4 lg:px-6 pt-4 lg:pt-6">
            <CardTitle className="text-sm font-semibold">Response Time (Live)</CardTitle>
            <CardDescription className="text-xs">Last 50 real HTTP checks across all endpoints</CardDescription>
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
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px', color: '#fff' }} />
                  <Area type="monotone" dataKey="value" stroke="#10b981" fill="url(#responseGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2 px-4 lg:px-6 pt-4 lg:pt-6">
            <CardTitle className="text-sm font-semibold">Status Codes</CardTitle>
            <CardDescription className="text-xs">Distribution by HTTP status category</CardDescription>
          </CardHeader>
          <CardContent className="pb-4 lg:pb-6">
            <div className="h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="count">
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {statusDistribution.map(item => (
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
          <CardDescription className="text-xs">Success vs error requests over time (live data)</CardDescription>
        </CardHeader>
        <CardContent className="px-2 lg:px-4 pb-4 lg:pb-6">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={requestCounts}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px', color: '#fff' }} />
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {endpoints.map(ep => (
            <Card key={ep.id} className="bg-card border-border hover:border-border/80 transition-all hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <StatusDot status={ep.status} />
                    <span className="text-sm font-medium text-foreground truncate">{ep.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={ep.status} />
                    <Badge variant="outline" className={`text-[9px] px-1.5 ${ep.enabled ? 'border-emerald-500/30 text-emerald-400' : 'border-muted text-muted-foreground'}`}>
                      {ep.enabled ? 'LIVE' : 'OFF'}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Response</span>
                    <span className={`text-xs font-mono font-semibold ${ep.responseTime > 1000 ? 'text-red-400' : ep.responseTime > 500 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {ep.totalChecks > 0 ? `${ep.responseTime}ms` : '--'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Uptime</span>
                    <span className={`text-xs font-semibold ${ep.uptime >= 99.9 ? 'text-emerald-400' : ep.uptime >= 99 ? 'text-amber-400' : 'text-red-400'}`}>
                      {ep.totalChecks > 0 ? `${ep.uptime}%` : '--'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Checks</span>
                    <span className="text-xs font-mono text-muted-foreground">{ep.totalChecks} ({ep.errorCount} err)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">SSL/DNS</span>
                    <div className="flex items-center gap-1">
                      {ep.totalChecks > 0 ? (
                        <>
                          {ep.sslValid ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> : <ShieldAlert className="w-3.5 h-3.5 text-red-400" />}
                          {ep.dnsResolved ? <Shield className="w-3.5 h-3.5 text-emerald-400" /> : <ShieldAlert className="w-3.5 h-3.5 text-red-400" />}
                        </>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">Not checked</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-[10px] text-muted-foreground truncate font-mono mb-2">{ep.url}</p>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="outline" className="flex-1 h-7 text-[10px] gap-1" onClick={() => handleQuickCheck(ep.id)}>
                      <Play className="w-3 h-3" /> Quick Check
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7" onClick={() => handleToggleEndpoint(ep.id)}>
                      {ep.enabled ? <Pause className="w-3 h-3 text-amber-400" /> : <Power className="w-3 h-3 text-muted-foreground" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Reset Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="bg-card border-border sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset All Data</DialogTitle>
            <DialogDescription>
              This will clear all endpoints, logs, alerts, API keys, and settings. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReset}>Reset Everything</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
