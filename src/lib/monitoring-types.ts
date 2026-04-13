export type EndpointStatus = 'up' | 'down' | 'degraded';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export type AuthType = 'none' | 'bearer' | 'api_key_header' | 'api_key_query' | 'basic';

export interface AuthConfig {
  type: AuthType;
  headerName?: string;    // e.g. 'X-API-Key', 'Authorization'
  headerValue?: string;   // e.g. 'sk-xxxxx', 'Bearer xxxxx'
  queryParam?: string;    // e.g. 'api_key'
  username?: string;      // for basic auth
  password?: string;      // for basic auth
}

export interface GlobalApiKey {
  id: string;
  name: string;
  key: string;            // the actual key value
  type: 'bearer' | 'api_key' | 'basic' | 'custom';
  headerName: string;     // e.g. 'Authorization', 'X-API-Key'
  prefix?: string;        // e.g. 'Bearer ', 'ApiKey '
  masked: string;         // displayed version: 'sk-****xxxx'
  createdAt: string;
}

export interface MonitoredEndpoint {
  id: string;
  name: string;
  url: string;
  method: HttpMethod;
  status: EndpointStatus;
  responseTime: number;     // ms - last measured
  uptime: number;           // percentage 0-100
  lastChecked: string;      // ISO timestamp
  totalRequests: number;
  errorCount: number;
  avgResponseTime: number;
  statusCode: number;
  enabled: boolean;         // whether live monitoring is active
  auth?: AuthConfig;        // per-endpoint auth override
  globalKeyId?: string;     // reference to a global API key
  expectedStatus?: number;  // expected status code (default 200)
  timeout?: number;         // request timeout in ms (default 10000)
  headers?: Record<string, string>; // custom headers
  body?: string;            // request body for POST/PUT/PATCH
  lastError?: string;       // last error message from live check
  consecutiveFailures: number; // track for downtime detection
  totalChecks: number;
  totalSuccesses: number;
  sslValid: boolean;
  dnsResolved: boolean;
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
  responseBody?: string;       // first 500 chars of response body
  requestHeaders?: string;     // sent headers summary
  responseHeaders?: string;    // received headers summary
  sslValid: boolean;
  dnsResolved: boolean;
  isLive: boolean;             // true = from real HTTP fetch, false = simulated
}

export interface AlertRule {
  id: string;
  name: string;
  type: 'response_time' | 'error_rate' | 'downtime' | 'status_code' | 'ssl_expiry' | 'consecutive_errors';
  enabled: boolean;
  threshold: number;
  unit: string;
  endpointId?: string;       // null/undefined = applies to all
  endpointName?: string;
  createdAt: string;
  lastTriggered?: string;
  cooldownMinutes: number;   // prevent duplicate alerts
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
  endpointId?: string;
  resolved?: boolean;
  resolvedAt?: string;
}

export interface AppSettings {
  checkInterval: number;       // seconds
  notifications: {
    email: boolean;
    webhook: boolean;
    slack: boolean;
    emailUrl: string;
    webhookUrl: string;
    slackUrl: string;
  };
  dataRetention: number;       // days
  theme: 'dark' | 'light';
  globalApiKey: string;        // default global API key (for simple use)
  globalAuthType: AuthType;
  globalAuthHeader: string;    // e.g. 'X-API-Key'
  globalAuthPrefix: string;    // e.g. 'Bearer '
  monitoringEnabled: boolean;  // master switch for live monitoring
  liveMode: boolean;           // true = real HTTP requests, false = demo mode
  maxConcurrentChecks: number; // parallel check limit
  requestTimeout: number;      // default timeout in ms
}

export interface DashboardMetrics {
  totalEndpoints: number;
  enabledEndpoints: number;
  healthyEndpoints: number;
  degradedEndpoints: number;
  downEndpoints: number;
  totalRequests: number;
  totalErrors: number;
  avgResponseTime: number;
  p95ResponseTime: number;
  errorRate: number;
  overallUptime: number;
  liveChecks: number;          // how many checks were live vs simulated
  sslIssues: number;
  lastCheckTime: string;
}

export interface CheckResult {
  endpointId: string;
  success: boolean;
  statusCode: number;
  responseTime: number;
  error?: string;
  responseBody?: string;
  sslValid: boolean;
  dnsResolved: boolean;
}

export type ViewType = 'dashboard' | 'endpoints' | 'logs' | 'alerts' | 'settings' | 'api_keys';
