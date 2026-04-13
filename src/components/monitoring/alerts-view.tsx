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
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  type AlertRule,
  type AlertEvent,
} from '@/lib/monitoring-types';
import {
  getAlertRules,
  getAlertEvents,
  saveAlertRules,
  acknowledgeAlert,
} from '@/lib/monitoring-data';
import { useToast } from '@/hooks/use-toast';

function SeverityIcon({ severity }: { severity: string }) {
  if (severity === 'critical') return <XCircle className="w-4 h-4 text-red-400" />;
  if (severity === 'warning') return <AlertTriangle className="w-4 h-4 text-amber-400" />;
  return <Info className="w-4 h-4 text-blue-400" />;
}

function SeverityBadge({ severity }: { severity: string }) {
  const variants: Record<string, 'destructive' | 'secondary' | 'default'> = {
    critical: 'destructive',
    warning: 'secondary',
    info: 'default',
  };
  return <Badge variant={variants[severity]} className="text-[10px] font-bold px-2">{severity.toUpperCase()}</Badge>;
}

function RuleTypeIcon({ type }: { type: string }) {
  if (type === 'response_time') return <Clock className="w-4 h-4 text-amber-400" />;
  if (type === 'error_rate') return <AlertTriangle className="w-4 h-4 text-red-400" />;
  if (type === 'downtime') return <XCircle className="w-4 h-4 text-red-400" />;
  return <Info className="w-4 h-4 text-blue-400" />;
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
  const { toast } = useToast();

  const refreshData = useCallback(() => {
    setRules(getAlertRules());
    setEvents(getAlertEvents());
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const toggleRule = (ruleId: string) => {
    const updated = rules.map((r) =>
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r
    );
    saveAlertRules(updated);
    setRules(updated);
    const rule = rules.find((r) => r.id === ruleId);
    toast({
      title: rule?.enabled ? 'Alert Disabled' : 'Alert Enabled',
      description: `${rule?.name} has been ${rule?.enabled ? 'disabled' : 'enabled'}.`,
    });
  };

  const handleAcknowledge = (eventId: string) => {
    const updated = acknowledgeAlert(eventId);
    setEvents(updated);
    toast({ title: 'Alert Acknowledged', description: 'The alert has been marked as acknowledged.' });
  };

  const unacknowledgedEvents = events.filter((e) => !e.acknowledged);
  const acknowledgedEvents = events.filter((e) => e.acknowledged);

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
            <div className="text-2xl font-bold text-amber-400">
              {unacknowledgedEvents.filter((e) => e.severity === 'warning').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Warnings</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{rules.filter((r) => r.enabled).length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active Rules</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{acknowledgedEvents.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Acknowledged</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-lg w-fit">
        <Button
          variant={activeTab === 'history' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('history')}
          className="gap-1.5 text-xs"
        >
          <Bell className="w-3.5 h-3.5" />
          Alert History
          {unacknowledgedEvents.length > 0 && (
            <Badge variant="destructive" className="h-4 min-w-[16px] text-[9px] px-1">{unacknowledgedEvents.length}</Badge>
          )}
        </Button>
        <Button
          variant={activeTab === 'rules' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('rules')}
          className="gap-1.5 text-xs"
        >
          <BellOff className="w-3.5 h-3.5" />
          Alert Rules
        </Button>
      </div>

      {/* Alert History */}
      {activeTab === 'history' && (
        <div className="space-y-2">
          {/* Unacknowledged */}
          {unacknowledgedEvents.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                Active Alerts ({unacknowledgedEvents.length})
              </h3>
              {unacknowledgedEvents.map((event) => (
                <Card key={event.id} className="bg-card border-red-500/20 hover:border-red-500/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <SeverityIcon severity={event.severity} />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-foreground">{event.ruleName}</span>
                          <SeverityBadge severity={event.severity} />
                          {event.endpointName && (
                            <Badge variant="outline" className="text-[10px]">{event.endpointName}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{event.message}</p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(event.timestamp)}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAcknowledge(event.id)}
                        className="shrink-0 gap-1.5 text-xs"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Acknowledge
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Acknowledged */}
          {acknowledgedEvents.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4">
                Acknowledged ({acknowledgedEvents.length})
              </h3>
              {acknowledgedEvents.map((event) => (
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
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(event.timestamp)}
                        </p>
                      </div>
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
              <p className="text-xs mt-1">Everything looks good!</p>
            </div>
          )}
        </div>
      )}

      {/* Alert Rules */}
      {activeTab === 'rules' && (
        <div className="space-y-2">
          {rules.map((rule) => (
            <Card key={rule.id} className={`bg-card border-border transition-colors ${rule.enabled ? '' : 'opacity-60'}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <RuleTypeIcon type={rule.type} />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">{rule.name}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {rule.type.replace('_', ' ')}
                      </Badge>
                      {rule.endpointName && (
                        <Badge variant="outline" className="text-[10px]">{rule.endpointName}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Threshold: <strong className="text-foreground">{rule.threshold}{rule.unit}</strong></span>
                      {rule.lastTriggered && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Last triggered: {formatTimeAgo(rule.lastTriggered)}
                        </span>
                      )}
                    </div>
                  </div>
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={() => toggleRule(rule.id)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
