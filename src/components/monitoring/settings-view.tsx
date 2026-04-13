'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Settings,
  Bell,
  Clock,
  Database,
  Palette,
  Mail,
  Webhook,
  MessageSquare,
  Save,
  Key,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Shield,
  Radio,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  type AppSettings,
  type GlobalApiKey,
} from '@/lib/monitoring-types';
import {
  getSettings,
  saveSettings,
  getGlobalApiKeys,
  addGlobalApiKey,
  deleteGlobalApiKey,
  updateGlobalApiKey,
  resetAllData,
  cleanupOldData,
} from '@/lib/monitoring-data';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';

export function SettingsView() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [checkInterval, setCheckInterval] = useState('30');
  const [dataRetention, setDataRetention] = useState('30');
  const [theme, setThemeValue] = useState('dark');
  const [timeout, setTimeout_] = useState('10000');
  const [concurrent, setConcurrent] = useState('3');
  const { toast } = useToast();
  const { setTheme } = useTheme();

  // API Keys state
  const [apiKeys, setApiKeys] = useState<GlobalApiKey[]>([]);
  const [showAddKey, setShowAddKey] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [newKey, setNewKey] = useState({
    name: '',
    key: '',
    type: 'bearer' as GlobalApiKey['type'],
    headerName: 'Authorization',
    prefix: 'Bearer ',
  });

  const refreshData = useCallback(() => {
    const s = getSettings();
    setSettings(s);
    setCheckInterval(String(s.checkInterval));
    setDataRetention(String(s.dataRetention));
    setThemeValue(s.theme);
    setTimeout_(String(s.requestTimeout || 10000));
    setConcurrent(String(s.maxConcurrentChecks || 3));
    setApiKeys(getGlobalApiKeys());
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const updateNotification = (key: string, value: boolean) => {
    if (!settings) return;
    setSettings({ ...settings, notifications: { ...settings.notifications, [key]: value } });
  };

  const updateNotificationUrl = (key: string, value: string) => {
    if (!settings) return;
    setSettings({ ...settings, notifications: { ...settings.notifications, [key]: value } });
  };

  const handleSave = () => {
    if (!settings) return;
    const updated = {
      ...settings,
      checkInterval: parseInt(checkInterval),
      dataRetention: parseInt(dataRetention),
      theme: themeValue as 'dark' | 'light',
      requestTimeout: parseInt(timeout) || 10000,
      maxConcurrentChecks: parseInt(concurrent) || 3,
    };
    saveSettings(updated);
    setSettings(updated);
    setTheme(themeValue);
    toast({ title: 'Settings Saved', description: 'Your changes have been applied.' });
  };

  const handleCleanup = () => {
    cleanupOldData();
    toast({ title: 'Cleanup Complete', description: 'Old logs and alerts have been removed.' });
  };

  const handleReset = () => {
    resetAllData();
    refreshData();
    toast({ title: 'Data Reset', description: 'All data has been reset to defaults.' });
  };

  // API Key handlers
  const handleAddKey = () => {
    if (!newKey.name.trim() || !newKey.key.trim()) {
      toast({ title: 'Validation Error', description: 'Name and Key are required.', variant: 'destructive' });
      return;
    }
    addGlobalApiKey(newKey);
    setApiKeys(getGlobalApiKeys());
    setShowAddKey(false);
    setNewKey({ name: '', key: '', type: 'bearer', headerName: 'Authorization', prefix: 'Bearer ' });
    toast({ title: 'API Key Added', description: `${newKey.name} has been saved.` });
  };

  const handleDeleteKey = (id: string) => {
    deleteGlobalApiKey(id);
    setApiKeys(getGlobalApiKeys());
    toast({ title: 'API Key Deleted' });
  };

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!settings) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Live Monitoring Toggle */}
      <Card className={`bg-card border ${settings.monitoringEnabled ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${settings.monitoringEnabled ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                <Radio className={`w-4 h-4 ${settings.monitoringEnabled ? 'text-emerald-400' : 'text-red-400'}`} />
              </div>
              <div>
                <CardTitle className="text-sm">Live Monitoring</CardTitle>
                <CardDescription className="text-xs">
                  {settings.monitoringEnabled ? 'Real HTTP requests are being made to your endpoints' : 'Monitoring is paused - no requests will be made'}
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={settings.monitoringEnabled}
              onCheckedChange={checked => {
                const updated = { ...settings, monitoringEnabled: checked };
                setSettings(updated);
                saveSettings(updated);
                toast({ title: checked ? 'Monitoring Enabled' : 'Monitoring Paused' });
              }}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Global API Keys */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Key className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-sm">Global API Keys</CardTitle>
                <CardDescription className="text-xs">Manage API keys used for authenticated endpoint checks</CardDescription>
              </div>
            </div>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowAddKey(true)}>
              <Plus className="w-3.5 h-3.5" /> Add Key
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {apiKeys.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              No API keys configured. Add keys to authenticate with your endpoints.
            </p>
          )}
          {apiKeys.map(key => {
            const isVisible = visibleKeys.has(key.id);
            return (
              <div key={key.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <Key className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{key.name}</span>
                    <Badge variant="outline" className="text-[9px]">{key.type}</Badge>
                    <Badge variant="outline" className="text-[9px] font-mono">{key.headerName}</Badge>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground truncate">
                    {key.prefix}{isVisible ? key.key : key.masked}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleKeyVisibility(key.id)}>
                    {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteKey(key.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Check Interval & Performance */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-sm">Check Configuration</CardTitle>
              <CardDescription className="text-xs">Control how endpoints are monitored</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Check Interval</Label>
              <Select value={checkInterval} onValueChange={setCheckInterval}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">Every 10s</SelectItem>
                  <SelectItem value="15">Every 15s</SelectItem>
                  <SelectItem value="30">Every 30s</SelectItem>
                  <SelectItem value="60">Every 1min</SelectItem>
                  <SelectItem value="300">Every 5min</SelectItem>
                  <SelectItem value="600">Every 10min</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Timeout (ms)</Label>
              <Select value={timeout} onValueChange={setTimeout_}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="5000">5s</SelectItem>
                  <SelectItem value="10000">10s</SelectItem>
                  <SelectItem value="15000">15s</SelectItem>
                  <SelectItem value="30000">30s</SelectItem>
                  <SelectItem value="60000">60s</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Max Concurrent</Label>
              <Select value={concurrent} onValueChange={setConcurrent}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Lower intervals = faster detection but more requests to your endpoints.
          </p>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Bell className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-sm">Notifications</CardTitle>
              <CardDescription className="text-xs">Configure how you receive alerts</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /><Label className="text-sm">Email</Label></div>
              <Switch checked={settings.notifications.email} onCheckedChange={c => updateNotification('email', c)} />
            </div>
            {settings.notifications.email && <Input placeholder="alerts@example.com" value={settings.notifications.emailUrl} onChange={e => updateNotificationUrl('emailUrl', e.target.value)} className="h-8 text-sm" />}
          </div>
          <Separator className="bg-border" />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Webhook className="w-4 h-4 text-muted-foreground" /><Label className="text-sm">Webhook</Label></div>
              <Switch checked={settings.notifications.webhook} onCheckedChange={c => updateNotification('webhook', c)} />
            </div>
            {settings.notifications.webhook && <Input placeholder="https://your-webhook-url.com/api/notify" value={settings.notifications.webhookUrl} onChange={e => updateNotificationUrl('webhookUrl', e.target.value)} className="h-8 text-sm font-mono" />}
          </div>
          <Separator className="bg-border" />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-muted-foreground" /><Label className="text-sm">Slack</Label></div>
              <Switch checked={settings.notifications.slack} onCheckedChange={c => updateNotification('slack', c)} />
            </div>
            {settings.notifications.slack && <Input placeholder="https://hooks.slack.com/services/..." value={settings.notifications.slackUrl} onChange={e => updateNotificationUrl('slackUrl', e.target.value)} className="h-8 text-sm font-mono" />}
          </div>
        </CardContent>
      </Card>

      {/* Data & Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Database className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-sm">Data Retention</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={dataRetention} onValueChange={setDataRetention}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={handleCleanup}>
              <RotateCcw className="w-3 h-3" /> Clean Old Data Now
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Palette className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-sm">Appearance</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Select value={themeValue} onValueChange={setThemeValue}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Dark Mode</SelectItem>
                <SelectItem value="light">Light Mode</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Save & Reset */}
      <div className="flex justify-between pt-2">
        <Button variant="destructive" onClick={handleReset} className="gap-1.5">
          <RotateCcw className="w-4 h-4" /> Reset All Data
        </Button>
        <Button onClick={handleSave} className="gap-2 min-w-[140px]">
          <Save className="w-4 h-4" /> Save Changes
        </Button>
      </div>

      {/* Add API Key Dialog */}
      <Dialog open={showAddKey} onOpenChange={setShowAddKey}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Global API Key</DialogTitle>
            <DialogDescription>This key will be available to assign to any endpoint for authentication.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Key Name</Label>
              <Input placeholder="e.g. Production API Key" value={newKey.name} onChange={e => setNewKey({ ...newKey, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Key Value</Label>
              <Input type="password" placeholder="sk-xxxxx..." value={newKey.key} onChange={e => setNewKey({ ...newKey, key: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={newKey.type} onValueChange={v => {
                  const type = v as GlobalApiKey['type'];
                  const defaults: Record<string, { headerName: string; prefix: string }> = {
                    bearer: { headerName: 'Authorization', prefix: 'Bearer ' },
                    api_key: { headerName: 'X-API-Key', prefix: '' },
                    basic: { headerName: 'Authorization', prefix: '' },
                    custom: { headerName: 'X-Custom-Key', prefix: '' },
                  };
                  const d = defaults[type] || { headerName: '', prefix: '' };
                  setNewKey({ ...newKey, type, headerName: d.headerName, prefix: d.prefix });
                }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bearer">Bearer Token</SelectItem>
                    <SelectItem value="api_key">API Key (Header)</SelectItem>
                    <SelectItem value="basic">Basic Auth</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Header Name</Label>
                <Input placeholder="Authorization" value={newKey.headerName} onChange={e => setNewKey({ ...newKey, headerName: e.target.value })} />
              </div>
            </div>
            {newKey.type !== 'basic' && (
              <div className="space-y-2">
                <Label>Prefix</Label>
                <Input placeholder="Bearer " value={newKey.prefix} onChange={e => setNewKey({ ...newKey, prefix: e.target.value })} />
                <p className="text-[11px] text-muted-foreground">Added before the key value in the header</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddKey(false)}>Cancel</Button>
            <Button onClick={handleAddKey}>Add Key</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
