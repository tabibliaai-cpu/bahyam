'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Trash2,
  Clock,
  Power,
  Play,
  Key,
  ShieldCheck,
  ShieldAlert,
  Settings2,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  type MonitoredEndpoint,
  type HttpMethod,
  type EndpointStatus,
  type AuthType,
  type GlobalApiKey,
} from '@/lib/monitoring-types';
import {
  getEndpoints,
  addEndpoint,
  deleteEndpoint,
  updateEndpoint,
  toggleEndpoint,
  runSingleCheck,
  getGlobalApiKeys,
} from '@/lib/monitoring-data';
import { useToast } from '@/hooks/use-toast';

function StatusDot({ status }: { status: string }) {
  const color = status === 'up' ? 'bg-emerald-400' : status === 'degraded' ? 'bg-amber-400' : 'bg-red-400';
  return <span className={`w-2.5 h-2.5 rounded-full ${color} shrink-0`} />;
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, 'default' | 'secondary' | 'destructive'> = { up: 'default', degraded: 'secondary', down: 'destructive' };
  const labels: Record<string, string> = { up: 'UP', degraded: 'DEGRADED', down: 'DOWN' };
  return <Badge variant={variants[status]} className="text-[10px] font-bold px-2">{labels[status]}</Badge>;
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: 'bg-emerald-500/20 text-emerald-400',
    POST: 'bg-blue-500/20 text-blue-400',
    PUT: 'bg-amber-500/20 text-amber-400',
    DELETE: 'bg-red-500/20 text-red-400',
    PATCH: 'bg-purple-500/20 text-purple-400',
    HEAD: 'bg-gray-500/20 text-gray-400',
    OPTIONS: 'bg-gray-500/20 text-gray-400',
  };
  return <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${colors[method] || colors.GET}`}>{method}</span>;
}

export function EndpointsView() {
  const [endpoints, setEndpoints] = useState<MonitoredEndpoint[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [globalKeys, setGlobalKeys] = useState<GlobalApiKey[]>([]);
  const { toast } = useToast();

  const [newEndpoint, setNewEndpoint] = useState({
    name: '',
    url: '',
    method: 'GET' as HttpMethod,
    status: 'up' as EndpointStatus,
    responseTime: 100,
    uptime: 100,
    enabled: true,
    expectedStatus: 200,
    timeout: 10000,
    authType: 'none' as AuthType,
    globalKeyId: '',
    body: '',
    headers: '',
  });

  const refreshData = useCallback(() => {
    setEndpoints(getEndpoints());
    setGlobalKeys(getGlobalApiKeys());
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const filtered = endpoints.filter(ep => {
    const matchesSearch = ep.name.toLowerCase().includes(search.toLowerCase()) || ep.url.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ep.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAdd = () => {
    if (!newEndpoint.name.trim() || !newEndpoint.url.trim()) {
      toast({ title: 'Validation Error', description: 'Name and URL are required.', variant: 'destructive' });
      return;
    }

    const authConfig = newEndpoint.authType !== 'none' ? {
      type: newEndpoint.authType as AuthType,
      headerName: 'Authorization',
      headerValue: '',
    } : undefined;

    const headersObj: Record<string, string> = {};
    if (newEndpoint.headers.trim()) {
      newEndpoint.headers.split('\n').forEach(line => {
        const [key, ...val] = line.split(':');
        if (key && val.length) headersObj[key.trim()] = val.join(':').trim();
      });
    }

    const updated = addEndpoint({
      ...newEndpoint,
      auth: authConfig,
      globalKeyId: newEndpoint.globalKeyId || undefined,
      headers: Object.keys(headersObj).length > 0 ? headersObj : undefined,
      body: newEndpoint.body || undefined,
    });

    setEndpoints(updated);
    setAddDialogOpen(false);
    setNewEndpoint({
      name: '', url: '', method: 'GET', status: 'up', responseTime: 100, uptime: 100,
      enabled: true, expectedStatus: 200, timeout: 10000, authType: 'none', globalKeyId: '', body: '', headers: '',
    });
    toast({ title: 'Endpoint Added', description: `${newEndpoint.name} is now being monitored.` });
  };

  const handleDelete = (id: string) => {
    const ep = endpoints.find(e => e.id === id);
    const updated = deleteEndpoint(id);
    setEndpoints(updated);
    setDeleteConfirmId(null);
    toast({ title: 'Endpoint Removed', description: `${ep?.name || 'Endpoint'} has been removed.` });
  };

  const handleToggle = (id: string) => {
    toggleEndpoint(id);
    refreshData();
  };

  const handleQuickCheck = async (id: string) => {
    setCheckingId(id);
    try {
      const result = await runSingleCheck(id);
      if (result.endpoint) {
        setEndpoints(prev => prev.map(ep => ep.id === id ? result.endpoint! : ep));
      }
      toast({
        title: result.endpoint ? 'Check Complete' : 'Check Failed',
        description: result.endpoint
          ? `${result.endpoint.name}: ${result.endpoint.statusCode} (${result.endpoint.responseTime}ms)`
          : 'Could not perform check',
        variant: result.endpoint?.statusCode && result.endpoint.statusCode >= 400 ? 'destructive' : 'default',
      });
    } catch {
      toast({ title: 'Check Error', description: 'Failed to perform the check.', variant: 'destructive' });
    }
    setCheckingId(null);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search endpoints..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-36 h-9"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="up">UP</SelectItem>
              <SelectItem value="degraded">Degraded</SelectItem>
              <SelectItem value="down">Down</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} size="sm" className="gap-1.5 shrink-0">
          <Plus className="w-4 h-4" />
          Add Endpoint
        </Button>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{filtered.length} of {endpoints.length} endpoints</span>
        <span className="text-muted-foreground/50">|</span>
        <span>{endpoints.filter(e => e.enabled).length} enabled</span>
      </div>

      {/* Endpoint Cards */}
      <div className="space-y-3">
        {filtered.map(ep => (
          <Card key={ep.id} className={`bg-card border-border hover:border-border/80 transition-colors ${!ep.enabled ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <StatusDot status={ep.status} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground truncate">{ep.name}</span>
                      <MethodBadge method={ep.method} />
                      <StatusBadge status={ep.status} />
                      <Badge variant="outline" className={`text-[9px] px-1.5 ${ep.enabled ? 'border-emerald-500/30 text-emerald-400' : 'border-muted text-muted-foreground'}`}>
                        {ep.enabled ? 'LIVE' : 'PAUSED'}
                      </Badge>
                      {ep.globalKeyId && <Badge variant="outline" className="text-[9px] px-1.5 gap-0.5"><Key className="w-2.5 h-2.5" /> Key</Badge>}
                      {ep.auth?.type !== 'none' && ep.auth?.type && <Badge variant="outline" className="text-[9px] px-1.5">Auth: {ep.auth.type}</Badge>}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono truncate mt-1">{ep.url}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleQuickCheck(ep.id)} disabled={checkingId === ep.id}>
                    {checkingId === ep.id ? <Clock className="w-4 h-4 animate-spin" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggle(ep.id)}>
                    {ep.enabled ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Power className="w-3.5 h-3.5 text-muted-foreground" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteConfirmId(ep.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-3 border-t border-border">
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground">Response</p>
                  <p className={`text-xs font-semibold font-mono ${ep.responseTime > 1000 ? 'text-red-400' : ep.responseTime > 500 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {ep.totalChecks > 0 ? `${ep.responseTime}ms` : '--'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground">Uptime</p>
                  <p className={`text-xs font-semibold ${ep.uptime >= 99.9 ? 'text-emerald-400' : ep.uptime >= 99 ? 'text-amber-400' : 'text-red-400'}`}>
                    {ep.totalChecks > 0 ? `${ep.uptime}%` : '--'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground">Checks</p>
                  <p className="text-xs font-semibold text-foreground">{ep.totalChecks}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground">Errors</p>
                  <p className="text-xs font-semibold text-foreground">{ep.errorCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground">SSL</p>
                  <div className="flex justify-center">
                    {ep.totalChecks > 0 ? (ep.sslValid ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> : <ShieldAlert className="w-3.5 h-3.5 text-red-400" />) : <span className="text-[10px]">--</span>}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground">Last</p>
                  <p className="text-[10px] text-muted-foreground">
                    {ep.totalChecks > 0 ? new Date(ep.lastChecked).toLocaleTimeString() : 'Never'}
                  </p>
                </div>
              </div>

              {ep.lastError && ep.status !== 'up' && (
                <div className="mt-2 px-2 py-1.5 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-400 font-mono truncate">
                  {ep.lastError}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Search className="w-8 h-8 mb-3 opacity-40" />
            <p className="text-sm">No endpoints found</p>
            <p className="text-xs mt-1">Add an endpoint to start monitoring</p>
          </div>
        )}
      </div>

      {/* Add Endpoint Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="bg-card border-border sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Endpoint</DialogTitle>
            <DialogDescription>Configure an API endpoint for live monitoring.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="ep-name">Name</Label>
              <Input id="ep-name" placeholder="My API Endpoint" value={newEndpoint.name} onChange={e => setNewEndpoint({ ...newEndpoint, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ep-url">URL</Label>
              <Input id="ep-url" placeholder="https://api.example.com/health" value={newEndpoint.url} onChange={e => setNewEndpoint({ ...newEndpoint, url: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Method</Label>
                <Select value={newEndpoint.method} onValueChange={v => setNewEndpoint({ ...newEndpoint, method: v as HttpMethod })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Expected Status</Label>
                <Input type="number" value={newEndpoint.expectedStatus} onChange={e => setNewEndpoint({ ...newEndpoint, expectedStatus: parseInt(e.target.value) || 200 })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Timeout (ms)</Label>
              <Input type="number" value={newEndpoint.timeout} onChange={e => setNewEndpoint({ ...newEndpoint, timeout: parseInt(e.target.value) || 10000 })} />
            </div>

            <Separator className="bg-border" />

            {/* Auth Section */}
            <div>
              <Label className="text-sm font-semibold">Authentication</Label>
              <p className="text-[11px] text-muted-foreground mb-2">Select a global API key or configure endpoint-specific auth</p>
              <Select value={newEndpoint.globalKeyId || '__none__'} onValueChange={v => setNewEndpoint({ ...newEndpoint, globalKeyId: v === '__none__' ? '' : v, authType: 'none' })}>
                <SelectTrigger><SelectValue placeholder="Select Global API Key" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No Global Key</SelectItem>
                  {globalKeys.map(k => (
                    <SelectItem key={k.id} value={k.id}>{k.name} ({k.masked})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(['POST', 'PUT', 'PATCH'] as HttpMethod[]).includes(newEndpoint.method) && (
              <div className="space-y-2">
                <Label>Request Body (JSON)</Label>
                <textarea className="w-full h-20 bg-muted border border-border rounded-md px-3 py-2 text-xs font-mono resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500" placeholder='{"key": "value"}' value={newEndpoint.body} onChange={e => setNewEndpoint({ ...newEndpoint, body: e.target.value })} />
              </div>
            )}

            <div className="space-y-2">
              <Label>Custom Headers (one per line: Key: Value)</Label>
              <textarea className="w-full h-16 bg-muted border border-border rounded-md px-3 py-2 text-xs font-mono resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500" placeholder="X-Custom-Header: value&#10;Accept: application/json" value={newEndpoint.headers} onChange={e => setNewEndpoint({ ...newEndpoint, headers: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Endpoint</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="bg-card border-border sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Endpoint</DialogTitle>
            <DialogDescription>Are you sure? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Pause({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
    </svg>
  );
}
