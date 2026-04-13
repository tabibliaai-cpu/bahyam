'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  BellOff,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Trash2,
  Plus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
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
  type AlertRule,
  type AlertEvent,
} from '@/lib/monitoring-types';
import {
  getAlertRules,
  getAlertEvents,
  getEndpoints,
  saveAlertRules,
  acknowledgeAlert,
  deleteAlertEvent,
  addAlertRule,
  deleteAlertRule,
} from '@/lib/monitoring-data';
import { useToast } from '@/hooks/use-toast';

function SeverityIcon({ severity }: { severity: string }) {
  if (severity === 'critical') return <XCircle className="w-4 h-4 text-red-400" />;
  if (severity === 'warning') return <AlertTriangle className="w-4 h-4 text-amber-400" />;
  return <Info className="w-4 h-4 text-blue-400" />;
}

function SeverityBadge({ severity }: { severity: string }) {
  const variants: Record<string, 'destructive' | 'secondary' | 'default'> = { critical: 'destructive', warning: 'secondary', info: 'default' };
  return <Badge variant={variants[severity]} className="text-[10px] font-bold px-2">{severity.toUpperCase()}</Badge>;
}

function RuleTypeIcon({ type }: { type: string }) {
  if (type === 'response_time') return <Clock className="w-4 h-4 text-amber-400" />;
  if (type === 'error_rate') return <AlertTriangle className="w-4 h-4 text-red-400" />;
  if (type === 'downtime') return <XCircle className="w-4 h-4 text-red-400" />;
  if (type === 'ssl_expiry') return <ShieldIcon className="w-4 h-4 text-purple-400" />;
  return <Info className="w-4 h-4 text-blue-400" />;
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function formatTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function AlertsView() {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [events, setEvents] = useState<AlertEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'rules' | 'history'>('history');
  const [addRuleOpen, setAddRuleOpen] = useState(false);
  const { toast } = useToast();

  const [newRule, setNewRule] = useState({
    name: '',
    type: 'response_time' as AlertRule['type'],
    threshold: 500,
    unit: 'ms',
    endpointId: '',
    cooldownMinutes: 5,
  });

  const refreshData = useCallback(() => {
    setRules(getAlertRules());
    setEvents(getAlertEvents());
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const endpoints = getEndpoints();

  const toggleRule = (ruleId: string) => {
    const updated = rules.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r);
    saveAlertRules(updated);
    setRules(updated);
    const rule = rules.find(r => r.id === ruleId);
    toast({ title: rule?.enabled ? 'Alert Disabled' : 'Alert Enabled', description: `${rule?.name} has been ${rule?.enabled ? 'disabled' : 'enabled'}.` });
  };

  const handleAcknowledge = (eventId: string) => {
    const updated = acknowledgeAlert(eventId);
    setEvents(updated);
    toast({ title: 'Alert Acknowledged', description: 'The alert has been marked as acknowledged.' });
  };

  const handleDeleteEvent = (eventId: string) => {
    const updated = deleteAlertEvent(eventId);
    setEvents(updated);
    toast({ title: 'Alert Deleted' });
  };

  const handleAddRule = () => {
    if (!newRule.name.trim()) {
      toast({ title: 'Validation Error', description: 'Rule name is required.', variant: 'destructive' });
      return;
    }
    const endpoint = endpoints.find(ep => ep.id === newRule.endpointId);
    const updated = addAlertRule({
      ...newRule,
      enabled: true,
      endpointName: endpoint?.name || 'All Endpoints',
      endpointId: newRule.endpointId || undefined,
    });
    setRules(updated);
    setAddRuleOpen(false);
    setNewRule({ name: '', type: 'response_time', threshold: 500, unit: 'ms', endpointId: '', cooldownMinutes: 5 });
    toast({ title: 'Rule Created', description: `${newRule.name} has been added.` });
  };

  const handleDeleteRule = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    const updated = deleteAlertRule(ruleId);
    setRules(updated);
    toast({ title: 'Rule Deleted', description: `${rule?.name || 'Rule'} has been removed.` });
  };

  const unacknowledgedEvents = events.filter(e => !e.acknowledged);
  const acknowledgedEvents = events.filter(e => e.acknowledged);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{unacknowledgedEvents.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active Alerts</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-400">{unacknowledgedEvents.filter(e => e.severity === 'warning').length}</div>
            <p className="text-xs text-muted-foreground mt-1">Warnings</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{rules.filter(r => r.enabled).length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active Rules</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{unacknowledgedEvents.filter(e => e.severity === 'critical').length}</div>
            <p className="text-xs text-muted-foreground mt-1">Critical</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-lg w-fit">
        <Button variant={activeTab === 'history' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab('history')} className="gap-1.5 text-xs">
          <Bell className="w-3.5 h-3.5" />
          Alert History
          {unacknowledgedEvents.length > 0 && (
            <Badge variant="destructive" className="h-4 min-w-[16px] text-[9px] px-1">{unacknowledgedEvents.length}</Badge>
          )}
        </Button>
        <Button variant={activeTab === 'rules' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab('rules')} className="gap-1.5 text-xs">
          <BellOff className="w-3.5 h-3.5" />
          Alert Rules
        </Button>
      </div>

      {/* Alert History */}
      {activeTab === 'history' && (
        <div className="space-y-2">
          {unacknowledgedEvents.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                Active Alerts ({unacknowledgedEvents.length})
              </h3>
              {unacknowledgedEvents.map(event => (
                <Card key={event.id} className="bg-card border-red-500/20 hover:border-red-500/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <SeverityIcon severity={event.severity} />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-foreground">{event.ruleName}</span>
                          <SeverityBadge severity={event.severity} />
                          {event.endpointName && <Badge variant="outline" className="text-[10px]">{event.endpointName}</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">{event.message}</p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />{formatTimeAgo(event.timestamp)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="outline" size="sm" onClick={() => handleAcknowledge(event.id)} className="shrink-0 gap-1.5 text-xs">
                          <CheckCircle className="w-3.5 h-3.5" /> Ack
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteEvent(event.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {acknowledgedEvents.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4">Acknowledged ({acknowledgedEvents.length})</h3>
              {acknowledgedEvents.map(event => (
                <Card key={event.id} className="bg-card border-border opacity-70">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <SeverityIcon severity={event.severity} />
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium text-foreground">{event.ruleName}</span>
                          <SeverityBadge severity={event.severity} />
                        </div>
                        <p className="text-[11px] text-muted-foreground">{event.message}</p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />{formatTimeAgo(event.timestamp)}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteEvent(event.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {events.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <CheckCircle className="w-10 h-10 mb-3 text-emerald-400 opacity-40" />
              <p className="text-sm">No alerts</p>
              <p className="text-xs mt-1">Everything looks good! Alerts will appear here when rules are triggered by live checks.</p>
            </div>
          )}
        </div>
      )}

      {/* Alert Rules */}
      {activeTab === 'rules' && (
        <div className="space-y-2">
          {rules.map(rule => (
            <Card key={rule.id} className={`bg-card border-border transition-colors ${rule.enabled ? '' : 'opacity-60'}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <RuleTypeIcon type={rule.type} />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">{rule.name}</span>
                      <Badge variant="outline" className="text-[10px]">{rule.type.replace(/_/g, ' ')}</Badge>
                      {rule.endpointName && <Badge variant="outline" className="text-[10px]">{rule.endpointName}</Badge>}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Threshold: <strong className="text-foreground">{rule.threshold}{rule.unit}</strong></span>
                      <span>Cooldown: <strong className="text-foreground">{rule.cooldownMinutes}m</strong></span>
                      {rule.lastTriggered && (
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Last: {formatTimeAgo(rule.lastTriggered)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} />
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive ml-1" onClick={() => handleDeleteRule(rule.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button variant="outline" onClick={() => setAddRuleOpen(true)} className="w-full gap-1.5">
            <Plus className="w-4 h-4" /> Create Alert Rule
          </Button>
        </div>
      )}

      {/* Add Rule Dialog */}
      <Dialog open={addRuleOpen} onOpenChange={setAddRuleOpen}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Alert Rule</DialogTitle>
            <DialogDescription>Define a new condition that triggers alerts.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Rule Name</Label>
              <Input placeholder="My Alert Rule" value={newRule.name} onChange={e => setNewRule({ ...newRule, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={newRule.type} onValueChange={v => {
                  const type = v as AlertRule['type'];
                  const defaults: Record<string, { threshold: number; unit: string }> = {
                    response_time: { threshold: 500, unit: 'ms' },
                    error_rate: { threshold: 10, unit: '%' },
                    downtime: { threshold: 60, unit: 's' },
                    status_code: { threshold: 500, unit: 'status' },
                    consecutive_errors: { threshold: 3, unit: 'errors' },
                    ssl_expiry: { threshold: 0, unit: 'any' },
                  };
                  const d = defaults[type] || { threshold: 0, unit: '' };
                  setNewRule({ ...newRule, type, threshold: d.threshold, unit: d.unit });
                }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="response_time">Response Time</SelectItem>
                    <SelectItem value="error_rate">Error Rate</SelectItem>
                    <SelectItem value="downtime">Downtime</SelectItem>
                    <SelectItem value="status_code">Status Code</SelectItem>
                    <SelectItem value="consecutive_errors">Consecutive Errors</SelectItem>
                    <SelectItem value="ssl_expiry">SSL Certificate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Threshold</Label>
                <Input type="number" value={newRule.threshold} onChange={e => setNewRule({ ...newRule, threshold: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Endpoint</Label>
              <Select value={newRule.endpointId || '__all__'} onValueChange={v => setNewRule({ ...newRule, endpointId: v === '__all__' ? '' : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Endpoints</SelectItem>
                  {endpoints.map(ep => (
                    <SelectItem key={ep.id} value={ep.id}>{ep.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cooldown (minutes)</Label>
              <Input type="number" value={newRule.cooldownMinutes} onChange={e => setNewRule({ ...newRule, cooldownMinutes: parseInt(e.target.value) || 5 })} />
              <p className="text-[11px] text-muted-foreground">Minimum time between duplicate alerts for this rule</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddRuleOpen(false)}>Cancel</Button>
            <Button onClick={handleAddRule}>Create Rule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
