'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Trash2,
  ExternalLink,
  Clock,
  ArrowUpDown,
  X,
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
import {
  type MonitoredEndpoint,
  type HttpMethod,
  type EndpointStatus,
} from '@/lib/monitoring-types';
import {
  getEndpoints,
  addEndpoint,
  deleteEndpoint,
  simulateEndpointUpdate,
} from '@/lib/monitoring-data';
import { useToast } from '@/hooks/use-toast';

function StatusDot({ status }: { status: string }) {
  const color = status === 'up' ? 'bg-emerald-400' : status === 'degraded' ? 'bg-amber-400' : 'bg-red-400';
  return <span className={`w-2.5 h-2.5 rounded-full ${color} shrink-0`} />;
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
  return (
    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${colors[method] || colors.GET}`}>
      {method}
    </span>
  );
}

export function EndpointsView() {
  const [endpoints, setEndpoints] = useState<MonitoredEndpoint[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [newEndpoint, setNewEndpoint] = useState({
    name: '',
    url: '',
    method: 'GET' as HttpMethod,
    status: 'up' as EndpointStatus,
    responseTime: 100,
    uptime: 99.99,
  });
  const { toast } = useToast();

  const refreshData = useCallback(() => {
    const updated = simulateEndpointUpdate();
    setEndpoints(updated);
  }, []);

  useEffect(() => {
    setEndpoints(getEndpoints());
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const filtered = endpoints.filter((ep) => {
    const matchesSearch = ep.name.toLowerCase().includes(search.toLowerCase()) ||
      ep.url.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ep.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAdd = () => {
    if (!newEndpoint.name.trim() || !newEndpoint.url.trim()) {
      toast({ title: 'Validation Error', description: 'Name and URL are required.', variant: 'destructive' });
      return;
    }
    const updated = addEndpoint(newEndpoint);
    setEndpoints(updated);
    setAddDialogOpen(false);
    setNewEndpoint({ name: '', url: '', method: 'GET', status: 'up', responseTime: 100, uptime: 99.99 });
    toast({ title: 'Endpoint Added', description: `${newEndpoint.name} is now being monitored.` });
  };

  const handleDelete = (id: string) => {
    const ep = endpoints.find((e) => e.id === id);
    const updated = deleteEndpoint(id);
    setEndpoints(updated);
    setDeleteConfirmId(null);
    toast({ title: 'Endpoint Removed', description: `${ep?.name || 'Endpoint'} has been removed.` });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search endpoints..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-36 h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
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

      {/* Count */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{filtered.length} of {endpoints.length} endpoints</span>
      </div>

      {/* Endpoint Cards (Mobile) */}
      <div className="md:hidden space-y-3">
        {filtered.map((ep) => (
          <Card key={ep.id} className="bg-card border-border">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <StatusDot status={ep.status} />
                  <span className="text-sm font-medium text-foreground truncate">{ep.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={ep.status} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteConfirmId(ep.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <MethodBadge method={ep.method} />
                  <span className="text-xs text-muted-foreground font-mono truncate ml-2">{ep.url}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground">Response</p>
                    <p className={`text-xs font-semibold font-mono ${ep.responseTime > 500 ? 'text-red-400' : ep.responseTime > 300 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {ep.responseTime}ms
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground">Uptime</p>
                    <p className="text-xs font-semibold text-foreground">{ep.uptime}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground">Requests</p>
                    <p className="text-xs font-semibold text-foreground">{ep.totalRequests.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  Last checked: {new Date(ep.lastChecked).toLocaleTimeString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Endpoint Table (Desktop) */}
      <div className="hidden md:block">
        <Card className="bg-card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Endpoint</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Method</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Response Time</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Uptime</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Requests</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Last Checked</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ep) => (
                  <tr key={ep.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StatusDot status={ep.status} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate max-w-[180px]">{ep.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[180px]">{ep.url}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <MethodBadge method={ep.method} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={ep.status} />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-mono font-semibold ${ep.responseTime > 500 ? 'text-red-400' : ep.responseTime > 300 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {ep.responseTime}ms
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-semibold ${ep.uptime >= 99.9 ? 'text-emerald-400' : ep.uptime >= 99 ? 'text-amber-400' : 'text-red-400'}`}>
                        {ep.uptime}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-foreground">{ep.totalRequests.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">
                        {new Date(ep.lastChecked).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteConfirmId(ep.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Add Endpoint Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Endpoint</DialogTitle>
            <DialogDescription>Add a new API endpoint to monitor.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="ep-name">Name</Label>
              <Input
                id="ep-name"
                placeholder="My API Endpoint"
                value={newEndpoint.name}
                onChange={(e) => setNewEndpoint({ ...newEndpoint, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ep-url">URL</Label>
              <Input
                id="ep-url"
                placeholder="https://api.example.com/health"
                value={newEndpoint.url}
                onChange={(e) => setNewEndpoint({ ...newEndpoint, url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Method</Label>
              <Select
                value={newEndpoint.method}
                onValueChange={(v) => setNewEndpoint({ ...newEndpoint, method: v as HttpMethod })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                  <SelectItem value="HEAD">HEAD</SelectItem>
                </SelectContent>
              </Select>
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
            <DialogDescription>
              Are you sure you want to remove this endpoint? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
