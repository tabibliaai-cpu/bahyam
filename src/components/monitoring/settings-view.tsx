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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  type AppSettings,
} from '@/lib/monitoring-types';
import {
  getSettings,
  saveSettings,
} from '@/lib/monitoring-data';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';

export function SettingsView() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [checkInterval, setCheckInterval] = useState('30');
  const [dataRetention, setDataRetention] = useState('30');
  const [theme, setThemeValue] = useState('dark');
  const { toast } = useToast();
  const { theme: currentTheme, setTheme } = useTheme();

  useEffect(() => {
    const s = getSettings();
    setSettings(s);
    setCheckInterval(String(s.checkInterval));
    setDataRetention(String(s.dataRetention));
    setThemeValue(s.theme);
  }, []);

  const updateNotification = (key: string, value: boolean) => {
    if (!settings) return;
    setSettings({
      ...settings,
      notifications: { ...settings.notifications, [key]: value },
    });
  };

  const updateNotificationUrl = (key: string, value: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      notifications: { ...settings.notifications, [key]: value },
    });
  };

  const handleSave = () => {
    if (!settings) return;
    const updated = {
      ...settings,
      checkInterval: parseInt(checkInterval),
      dataRetention: parseInt(dataRetention),
      theme: themeValue as 'dark' | 'light',
    };
    saveSettings(updated);
    setSettings(updated);
    setTheme(themeValue);
    toast({ title: 'Settings Saved', description: 'Your changes have been applied.' });
  };

  if (!settings) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Check Interval */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-sm">Check Interval</CardTitle>
              <CardDescription className="text-xs">How often endpoints are monitored</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={checkInterval} onValueChange={setCheckInterval}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">Every 10 seconds</SelectItem>
              <SelectItem value="15">Every 15 seconds</SelectItem>
              <SelectItem value="30">Every 30 seconds</SelectItem>
              <SelectItem value="60">Every 1 minute</SelectItem>
              <SelectItem value="300">Every 5 minutes</SelectItem>
              <SelectItem value="600">Every 10 minutes</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground">
            Lower intervals provide faster detection but increase system load.
          </p>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
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
          {/* Email */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm">Email Notifications</Label>
              </div>
              <Switch
                checked={settings.notifications.email}
                onCheckedChange={(checked) => updateNotification('email', checked)}
              />
            </div>
            {settings.notifications.email && (
              <Input
                placeholder="alerts@example.com"
                value={settings.notifications.emailUrl}
                onChange={(e) => updateNotificationUrl('emailUrl', e.target.value)}
                className="h-8 text-sm"
              />
            )}
          </div>

          <Separator className="bg-border" />

          {/* Webhook */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Webhook className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm">Webhook Notifications</Label>
              </div>
              <Switch
                checked={settings.notifications.webhook}
                onCheckedChange={(checked) => updateNotification('webhook', checked)}
              />
            </div>
            {settings.notifications.webhook && (
              <Input
                placeholder="https://your-webhook-url.com/api/notify"
                value={settings.notifications.webhookUrl}
                onChange={(e) => updateNotificationUrl('webhookUrl', e.target.value)}
                className="h-8 text-sm font-mono"
              />
            )}
          </div>

          <Separator className="bg-border" />

          {/* Slack */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm">Slack Notifications</Label>
              </div>
              <Switch
                checked={settings.notifications.slack}
                onCheckedChange={(checked) => updateNotification('slack', checked)}
              />
            </div>
            {settings.notifications.slack && (
              <Input
                placeholder="https://hooks.slack.com/services/..."
                value={settings.notifications.slackUrl}
                onChange={(e) => updateNotificationUrl('slackUrl', e.target.value)}
                className="h-8 text-sm font-mono"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Retention */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Database className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-sm">Data Retention</CardTitle>
              <CardDescription className="text-xs">How long to keep monitoring data</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={dataRetention} onValueChange={setDataRetention}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="14">14 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="60">60 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground">
            Older data will be automatically cleaned up based on this setting.
          </p>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Palette className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-sm">Appearance</CardTitle>
              <CardDescription className="text-xs">Customize the dashboard theme</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={themeValue} onValueChange={setThemeValue}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dark">Dark Mode</SelectItem>
              <SelectItem value="light">Light Mode</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} className="gap-2 min-w-[140px]">
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
