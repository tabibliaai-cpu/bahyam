export type EndpointStatus = 'up' | 'down' | 'degraded';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export interface MonitoredEndpoint {
  id: string;
  name: string;
  url: string;
  method: HttpMethod;
  status: EndpointStatus;
  responseTime: number; // ms
  uptime: number; // percentage 0-100
  lastChecked: string; // ISO timestamp
  totalRequests: number;
  errorCount: number;
  avgResponseTime: number;
  statusCode: number;
}

export interface LogEntry {
  id: string;
  endpointId: string;
  endpointName: string;
  url: string;
  method: HttpMethod;
  statusCode: number;
  responseTime: number;
  timestamp: string;
  isError: boolean;
  errorMessage?: string;
  payload?: string;
}

export interface AlertRule {
  id: string;
  name: string;
  type: 'response_time' | 'error_rate' | 'downtime' | 'status_code';
  enabled: boolean;
  threshold: number;
  unit: string;
  endpointId?: string;
  endpointName?: string;
  createdAt: string;
  lastTriggered?: string;
}

export interface AlertEvent {
  id: string;
  ruleId: string;
  ruleName: string;
  type: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  acknowledged: boolean;
  endpointName?: string;
}

export interface AppSettings {
  checkInterval: number; // seconds
  notifications: {
    email: boolean;
    webhook: boolean;
    slack: boolean;
    emailUrl: string;
    webhookUrl: string;
    slackUrl: string;
  };
  dataRetention: number; // days
  theme: 'dark' | 'light';
}

export interface DashboardMetrics {
  totalEndpoints: number;
  healthyEndpoints: number;
  degradedEndpoints: number;
  downEndpoints: number;
  totalRequests: number;
  totalErrors: number;
  avgResponseTime: number;
  p95ResponseTime: number;
  errorRate: number;
  overallUptime: number;
}

export type ViewType = 'dashboard' | 'endpoints' | 'logs' | 'alerts' | 'settings';
