'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  RefreshCw,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  type LogEntry,
  type HttpMethod,
} from '@/lib/monitoring-types';
import {
  getLogs,
  getEndpoints,
  addSimulatedLog,
} from '@/lib/monitoring-data';

function StatusIcon({ code }: { code: number }) {
  if (code >= 200 && code < 300) return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
  if (code >= 400 && code < 500) return <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />;
  return <XCircle className="w-4 h-4 text-red-400 shrink-0" />;
}

function StatusCodeBadge({ code }: { code: number }) {
  let variant: 'default' | 'secondary' | 'destructive' = 'default';
  if (code >= 400) variant = code >= 500 ? 'destructive' : 'secondary';
  return (
    <span
      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
        code < 300 ? 'bg-emerald-500/20 text-emerald-400' :
        code < 400 ? 'bg-blue-500/20 text-blue-400' :
        code < 500 ? 'bg-amber-500/20 text-amber-400' :
        'bg-red-500/20 text-red-400'
      }`}
    >
      {code}
    </span>
  );
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: 'bg-emerald-500/20 text-emerald-400',
    POST: 'bg-blue-500/20 text-blue-400',
    PUT: 'bg-amber-500/20 text-amber-400',
    DELETE: 'bg-red-500/20 text-red-400',
    PATCH: 'bg-purple-500/20 text-purple-400',
  };
  return (
    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${colors[method] || 'bg-gray-500/20 text-gray-400'}`}>
      {method}
    </span>
  );
}

export function LogsView() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [endpointFilter, setEndpointFilter] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const refreshData = useCallback(() => {
    setRefreshing(true);
    const newLogs = addSimulatedLog();
    setLogs(newLogs.slice(0, 100));
    setTimeout(() => setRefreshing(false), 300);
  }, []);

  useEffect(() => {
    setLogs(getLogs().slice(0, 100));
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(refreshData, 4000);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshData]);

  const endpoints = typeof window !== 'undefined' ? getEndpoints() : [];

  const filtered = logs.filter((log) => {
    const matchesSearch = !search ||
      log.endpointName.toLowerCase().includes(search.toLowerCase()) ||
      log.url.toLowerCase().includes(search.toLowerCase()) ||
      log.errorMessage?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'success' && log.statusCode < 400) ||
      (statusFilter === 'client_error' && log.statusCode >= 400 && log.statusCode < 500) ||
      (statusFilter === 'server_error' && log.statusCode >= 500);
    const matchesEndpoint = endpointFilter === 'all' || log.endpointId === endpointFilter;
    return matchesSearch && matchesStatus && matchesEndpoint;
  });

  const successCount = filtered.filter((l) => l.statusCode < 400).length;
  const errorCount = filtered.filter((l) => l.statusCode >= 400).length;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="success">2xx Success</SelectItem>
              <SelectItem value="client_error">4xx Client Error</SelectItem>
              <SelectItem value="server_error">5xx Server Error</SelectItem>
            </SelectContent>
          </Select>
          <Select value={endpointFilter} onValueChange={setEndpointFilter}>
            <SelectTrigger className="w-full sm:w-48 h-9">
              <SelectValue placeholder="Endpoint" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Endpoints</SelectItem>
              {endpoints.map((ep) => (
                <SelectItem key={ep.id} value={ep.id}>{ep.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Checkbox
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={(checked) => setAutoRefresh(checked === true)}
            />
            <Label htmlFor="auto-refresh" className="text-xs text-muted-foreground cursor-pointer">
              Auto-refresh
            </Label>
          </div>
          <Button variant="outline" size="sm" onClick={refreshData} className="gap-1.5">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>{filtered.length} log entries</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {successCount} success
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          {errorCount} errors
        </span>
      </div>

      {/* Log Entries */}
      <div className="space-y-1.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
        {filtered.map((log) => (
          <Card key={log.id} className="bg-card border-border hover:border-border/80 transition-colors">
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <StatusIcon code={log.statusCode} />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{log.endpointName}</span>
                    <MethodBadge method={log.method} />
                    <StatusCodeBadge code={log.statusCode} />
                    <span className={`text-xs font-mono ${
                      log.responseTime > 1000 ? 'text-red-400' : log.responseTime > 500 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {log.responseTime}ms
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono truncate">{log.url}</p>
                  {log.errorMessage && (
                    <p className="text-xs text-red-400/80 mt-1">{log.errorMessage}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                  <Clock className="w-3 h-3" />
                  {new Date(log.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Search className="w-8 h-8 mb-3 opacity-40" />
            <p className="text-sm">No logs found</p>
            <p className="text-xs mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
