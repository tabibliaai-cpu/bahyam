import {
  MonitoredEndpoint,
  LogEntry,
  AlertRule,
  AlertEvent,
  AppSettings,
  DashboardMetrics,
  HttpMethod,
  EndpointStatus,
  GlobalApiKey,
  AuthConfig,
  CheckResult,
} from './monitoring-types';

const STORAGE_KEYS = {
  endpoints: 'monitoring_endpoints',
  logs: 'monitoring_logs',
  alertRules: 'monitoring_alert_rules',
  alertEvents: 'monitoring_alert_events',
  settings: 'monitoring_settings',
  initialized: 'monitoring_initialized',
  globalApiKeys: 'monitoring_api_keys',
};

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

// ─── Auth Header Builder ───────────────────────────────────────────────

export function buildAuthHeaders(auth?: AuthConfig, globalKey?: GlobalApiKey): Record<string, string> {
  const headers: Record<string, string> = {};

  // Per-endpoint auth takes priority
  if (auth) {
    switch (auth.type) {
      case 'bearer':
        headers['Authorization'] = auth.headerValue || '';
        break;
      case 'api_key_header':
        if (auth.headerName) headers[auth.headerName] = auth.headerValue || '';
        break;
      case 'basic':
        if (auth.username && auth.password) {
          headers['Authorization'] = 'Basic ' + btoa(`${auth.username}:${auth.password}`);
        }
        break;
      case 'api_key_query':
        // handled in URL
        break;
    }
  }

  // Fall back to global key if no per-endpoint auth
  if (!auth || auth.type === 'none') {
    if (globalKey) {
      if (globalKey.type === 'bearer') {
        headers['Authorization'] = `${globalKey.prefix || 'Bearer '}${globalKey.key}`;
      } else if (globalKey.type === 'api_key') {
        headers[globalKey.headerName] = `${globalKey.prefix || ''}${globalKey.key}`;
      } else if (globalKey.type === 'basic' && globalKey.key.includes(':')) {
        headers['Authorization'] = 'Basic ' + btoa(globalKey.key);
      } else if (globalKey.type === 'custom') {
        headers[globalKey.headerName] = `${globalKey.prefix || ''}${globalKey.key}`;
      }
    }
  }

  return headers;
}

// ─── Live HTTP Check Engine ────────────────────────────────────────────

export async function performLiveCheck(endpoint: MonitoredEndpoint, globalKey?: GlobalApiKey): Promise<CheckResult> {
  const startTime = performance.now();

  try {
    const url = new URL(endpoint.url);

    // Add API key as query param if configured
    if (endpoint.auth?.type === 'api_key_query' && endpoint.auth.queryParam) {
      url.searchParams.set(endpoint.auth.queryParam, endpoint.auth.headerValue || '');
    }

    const authHeaders = buildAuthHeaders(endpoint.auth, globalKey);
    const customHeaders = endpoint.headers || {};
    const allHeaders: Record<string, string> = {
      'Accept': 'application/json, text/html, */*',
      'User-Agent': 'Bahyam-API-Monitor/1.0',
      ...authHeaders,
      ...customHeaders,
    };

    const controller = new AbortController();
    const timeout = endpoint.timeout || 10000;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const fetchOptions: RequestInit = {
      method: endpoint.method,
      headers: allHeaders,
      signal: controller.signal,
      mode: 'cors',
    };

    // Add body for methods that support it
    if (['POST', 'PUT', 'PATCH'].includes(endpoint.method) && endpoint.body) {
      fetchOptions.body = endpoint.body;
      if (!fetchOptions.headers['Content-Type']) {
        (fetchOptions.headers as Record<string, string>)['Content-Type'] = 'application/json';
      }
    }

    const response = await fetch(url.toString(), fetchOptions);
    clearTimeout(timeoutId);

    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);

    let responseBody: string | undefined;
    try {
      const text = await response.text();
      responseBody = text.substring(0, 500);
    } catch {
      responseBody = undefined;
    }

    let sslValid = true;
    let dnsResolved = true;

    return {
      endpointId: endpoint.id,
      success: response.ok,
      statusCode: response.status,
      responseTime,
      responseBody,
      sslValid,
      dnsResolved,
    };
  } catch (error: unknown) {
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);
    const err = error as Error;

    let statusCode = 0;
    let errorMessage = err.message || 'Unknown error';
    let sslValid = true;
    let dnsResolved = true;

    if (err.name === 'AbortError') {
      statusCode = 408;
      errorMessage = `Request timeout after ${endpoint.timeout || 10000}ms`;
    } else if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
      statusCode = 503;
      errorMessage = 'Network error - could not reach the endpoint. Check URL, CORS policy, or DNS.';
      dnsResolved = false;
    } else if (err.message?.includes('CORS') || err.message?.includes('cross-origin')) {
      statusCode = 0;
      errorMessage = 'CORS policy blocked the request. The target server does not allow cross-origin requests.';
    } else if (err.message?.includes('SSL') || err.message?.includes('certificate')) {
      statusCode = 496;
      errorMessage = `SSL/TLS Error: ${err.message}`;
      sslValid = false;
    } else if (err.message?.includes('ENOTFOUND') || err.message?.includes('DNS')) {
      statusCode = 502;
      errorMessage = `DNS resolution failed for ${endpoint.url}`;
      dnsResolved = false;
    } else if (err.message?.includes('ECONNREFUSED')) {
      statusCode = 503;
      errorMessage = 'Connection refused - the server is not accepting connections';
    }

    return {
      endpointId: endpoint.id,
      success: false,
      statusCode,
      responseTime,
      error: errorMessage,
      sslValid,
      dnsResolved,
    };
  }
}

// ─── Process Check Result & Update Endpoint ────────────────────────────

export function processCheckResult(endpoint: MonitoredEndpoint, result: CheckResult): {
  updatedEndpoint: MonitoredEndpoint;
  newLog: LogEntry;
  newAlerts: AlertEvent[];
} {
  const now = new Date().toISOString();

  // Determine status
  let newStatus: EndpointStatus = 'up';
  if (!result.success || result.statusCode >= 500) {
    newStatus = 'down';
  } else if (result.statusCode >= 400 || result.responseTime > 1000) {
    newStatus = 'degraded';
  }

  // Update consecutive failures
  const newConsecutiveFailures = result.success ? 0 : endpoint.consecutiveFailures + 1;

  // Calculate uptime based on history
  const totalChecks = endpoint.totalChecks + 1;
  const totalSuccesses = endpoint.totalSuccesses + (result.success ? 1 : 0);
  const calculatedUptime = totalChecks > 0 ? Math.round((totalSuccesses / totalChecks) * 10000) / 100 : 99.99;

  // Running average response time
  const alpha = 0.3;
  const newAvgResponseTime = Math.round(
    endpoint.avgResponseTime * (1 - alpha) + result.responseTime * alpha
  );

  const expectedStatus = endpoint.expectedStatus || 200;
  const isError = result.statusCode === 0 || result.statusCode >= 400 ||
    result.statusCode !== expectedStatus;

  const updatedEndpoint: MonitoredEndpoint = {
    ...endpoint,
    status: newStatus,
    responseTime: result.responseTime,
    statusCode: result.statusCode || 503,
    lastChecked: now,
    totalRequests: endpoint.totalRequests + 1,
    errorCount: endpoint.errorCount + (isError ? 1 : 0),
    avgResponseTime: newAvgResponseTime,
    uptime: calculatedUptime,
    lastError: result.error || (isError ? `HTTP ${result.statusCode}` : undefined),
    consecutiveFailures: newConsecutiveFailures,
    totalChecks,
    totalSuccesses,
    sslValid: result.sslValid,
    dnsResolved: result.dnsResolved,
  };

  const newLog: LogEntry = {
    id: generateId(),
    endpointId: endpoint.id,
    endpointName: endpoint.name,
    url: endpoint.url,
    method: endpoint.method,
    statusCode: result.statusCode || 503,
    responseTime: result.responseTime,
    timestamp: now,
    isError,
    errorMessage: result.error || (isError ? `HTTP ${result.statusCode}` : undefined),
    responseBody: result.responseBody,
    sslValid: result.sslValid,
    dnsResolved: result.dnsResolved,
    isLive: true,
  };

  // Evaluate alert rules
  const newAlerts = evaluateAlertRules(updatedEndpoint, result);

  return { updatedEndpoint, newLog, newAlerts };
}

// ─── Alert Rule Evaluation Engine ──────────────────────────────────────

function evaluateAlertRules(endpoint: MonitoredEndpoint, result: CheckResult): AlertEvent[] {
  if (typeof window === 'undefined') return [];
  const rules = getAlertRules().filter(r => r.enabled);
  const events: AlertEvent[] = [];
  const existingEvents = getAlertEvents();

  for (const rule of rules) {
    if (rule.endpointId && rule.endpointId !== endpoint.id) continue;

    let triggered = false;
    let message = '';
    let severity: 'critical' | 'warning' | 'info' = 'warning';

    switch (rule.type) {
      case 'response_time':
        if (result.responseTime > rule.threshold) {
          triggered = true;
          message = `${endpoint.name} response time exceeded ${rule.threshold}${rule.unit} (current: ${result.responseTime}ms)`;
          severity = result.responseTime > rule.threshold * 2 ? 'critical' : 'warning';
        }
        break;

      case 'error_rate': {
        const errorRate = endpoint.totalChecks > 0
          ? (endpoint.errorCount / endpoint.totalChecks) * 100
          : 0;
        if (errorRate > rule.threshold) {
          triggered = true;
          message = `${endpoint.name} error rate reached ${errorRate.toFixed(1)}% (threshold: ${rule.threshold}%)`;
          severity = errorRate > rule.threshold * 2 ? 'critical' : 'warning';
        }
        break;
      }

      case 'downtime':
        if (endpoint.consecutiveFailures > 0) {
          const downSeconds = endpoint.consecutiveFailures * (getSettings().checkInterval || 30);
          if (downSeconds > rule.threshold) {
            triggered = true;
            message = `${endpoint.name} has been down for ${Math.round(downSeconds / 60)} minutes (${endpoint.consecutiveFailures} consecutive failures)`;
            severity = 'critical';
          }
        }
        break;

      case 'status_code':
        if (result.statusCode >= rule.threshold) {
          triggered = true;
          message = `${endpoint.name} returned HTTP ${result.statusCode} (threshold: ${rule.threshold}+)`;
          severity = result.statusCode >= 500 ? 'critical' : 'warning';
        }
        break;

      case 'consecutive_errors':
        if (endpoint.consecutiveFailures >= rule.threshold) {
          triggered = true;
          message = `${endpoint.name} has ${endpoint.consecutiveFailures} consecutive errors (threshold: ${rule.threshold})`;
          severity = endpoint.consecutiveFailures >= rule.threshold * 2 ? 'critical' : 'warning';
        }
        break;

      case 'ssl_expiry':
        if (!result.sslValid) {
          triggered = true;
          message = `${endpoint.name} has an SSL/TLS certificate issue`;
          severity = 'critical';
        }
        break;
    }

    if (triggered) {
      // Check cooldown to prevent alert spam
      const cooldownMs = (rule.cooldownMinutes || 5) * 60 * 1000;
      const recentEvent = existingEvents.find(
        e => e.ruleId === rule.id && e.endpointId === endpoint.id && !e.acknowledged &&
          Date.now() - new Date(e.timestamp).getTime() < cooldownMs
      );
      if (recentEvent) continue;

      events.push({
        id: generateId(),
        ruleId: rule.id,
        ruleName: rule.name,
        type: rule.type,
        message,
        severity,
        timestamp: new Date().toISOString(),
        acknowledged: false,
        endpointName: endpoint.name,
        endpointId: endpoint.id,
      });
    }
  }

  return events;
}

// ─── Global API Keys Management ────────────────────────────────────────

export function getGlobalApiKeys(): GlobalApiKey[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.globalApiKeys);
  return data ? JSON.parse(data) : [];
}

export function saveGlobalApiKeys(keys: GlobalApiKey[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.globalApiKeys, JSON.stringify(keys));
}

export function addGlobalApiKey(key: Omit<GlobalApiKey, 'id' | 'masked' | 'createdAt'>): GlobalApiKey {
  const fullKey = key.key;
  const masked = fullKey.length > 8
    ? fullKey.substring(0, 4) + '****' + fullKey.substring(fullKey.length - 4)
    : '****';
  const newKey: GlobalApiKey = {
    ...key,
    id: 'key-' + generateId(),
    masked,
    createdAt: new Date().toISOString(),
  };
  const keys = getGlobalApiKeys();
  keys.push(newKey);
  saveGlobalApiKeys(keys);
  return newKey;
}

export function updateGlobalApiKey(id: string, updates: Partial<GlobalApiKey>): GlobalApiKey[] {
  const keys = getGlobalApiKeys().map(k => {
    if (k.id === id) {
      const updated = { ...k, ...updates };
      if (updates.key) {
        const fullKey = updates.key;
        updated.masked = fullKey.length > 8
          ? fullKey.substring(0, 4) + '****' + fullKey.substring(fullKey.length - 4)
          : '****';
      }
      return updated;
    }
    return k;
  });
  saveGlobalApiKeys(keys);
  return keys;
}

export function deleteGlobalApiKey(id: string): GlobalApiKey[] {
  const keys = getGlobalApiKeys().filter(k => k.id !== id);
  saveGlobalApiKeys(keys);
  return keys;
}

export function getGlobalApiKeyById(id: string): GlobalApiKey | undefined {
  return getGlobalApiKeys().find(k => k.id === id);
}

// ─── Default Data ──────────────────────────────────────────────────────

const DEFAULT_ENDPOINTS: MonitoredEndpoint[] = [
  {
    id: 'ep-1',
    name: 'JSONPlaceholder API',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    method: 'GET',
    status: 'up',
    responseTime: 0,
    uptime: 100,
    lastChecked: new Date().toISOString(),
    totalRequests: 0,
    errorCount: 0,
    avgResponseTime: 0,
    statusCode: 0,
    enabled: true,
    expectedStatus: 200,
    timeout: 10000,
    consecutiveFailures: 0,
    totalChecks: 0,
    totalSuccesses: 0,
    sslValid: true,
    dnsResolved: true,
  },
  {
    id: 'ep-2',
    name: 'HTTPBin Status Check',
    url: 'https://httpbin.org/status/200',
    method: 'GET',
    status: 'up',
    responseTime: 0,
    uptime: 100,
    lastChecked: new Date().toISOString(),
    totalRequests: 0,
    errorCount: 0,
    avgResponseTime: 0,
    statusCode: 0,
    enabled: true,
    expectedStatus: 200,
    timeout: 10000,
    consecutiveFailures: 0,
    totalChecks: 0,
    totalSuccesses: 0,
    sslValid: true,
    dnsResolved: true,
  },
  {
    id: 'ep-3',
    name: 'Cat Facts API',
    url: 'https://catfact.ninja/fact',
    method: 'GET',
    status: 'up',
    responseTime: 0,
    uptime: 100,
    lastChecked: new Date().toISOString(),
    totalRequests: 0,
    errorCount: 0,
    avgResponseTime: 0,
    statusCode: 0,
    enabled: true,
    expectedStatus: 200,
    timeout: 10000,
    consecutiveFailures: 0,
    totalChecks: 0,
    totalSuccesses: 0,
    sslValid: true,
    dnsResolved: true,
  },
  {
    id: 'ep-4',
    name: 'GitHub API Rate Limit',
    url: 'https://api.github.com/rate_limit',
    method: 'GET',
    status: 'up',
    responseTime: 0,
    uptime: 100,
    lastChecked: new Date().toISOString(),
    totalRequests: 0,
    errorCount: 0,
    avgResponseTime: 0,
    statusCode: 0,
    enabled: true,
    expectedStatus: 200,
    timeout: 10000,
    consecutiveFailures: 0,
    totalChecks: 0,
    totalSuccesses: 0,
    sslValid: true,
    dnsResolved: true,
  },
  {
    id: 'ep-5',
    name: 'DummyJSON Products',
    url: 'https://dummyjson.com/products/1',
    method: 'GET',
    status: 'up',
    responseTime: 0,
    uptime: 100,
    lastChecked: new Date().toISOString(),
    totalRequests: 0,
    errorCount: 0,
    avgResponseTime: 0,
    statusCode: 0,
    enabled: false,
    expectedStatus: 200,
    timeout: 10000,
    consecutiveFailures: 0,
    totalChecks: 0,
    totalSuccesses: 0,
    sslValid: true,
    dnsResolved: true,
  },
  {
    id: 'ep-6',
    name: 'OpenWeather Sample',
    url: 'https://api.open-meteo.com/v1/forecast?latitude=35.69&longitude=51.39&current_weather=true',
    method: 'GET',
    status: 'up',
    responseTime: 0,
    uptime: 100,
    lastChecked: new Date().toISOString(),
    totalRequests: 0,
    errorCount: 0,
    avgResponseTime: 0,
    statusCode: 0,
    enabled: false,
    expectedStatus: 200,
    timeout: 15000,
    consecutiveFailures: 0,
    totalChecks: 0,
    totalSuccesses: 0,
    sslValid: true,
    dnsResolved: true,
  },
];

const DEFAULT_ALERT_RULES: AlertRule[] = [
  {
    id: 'ar-1',
    name: 'High Response Time',
    type: 'response_time',
    enabled: true,
    threshold: 2000,
    unit: 'ms',
    endpointName: 'All Endpoints',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    cooldownMinutes: 5,
  },
  {
    id: 'ar-2',
    name: 'Error Rate Spike',
    type: 'error_rate',
    enabled: true,
    threshold: 10,
    unit: '%',
    endpointName: 'All Endpoints',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    cooldownMinutes: 10,
  },
  {
    id: 'ar-3',
    name: 'Service Downtime',
    type: 'downtime',
    enabled: true,
    threshold: 60,
    unit: 'seconds',
    endpointName: 'All Endpoints',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    cooldownMinutes: 5,
  },
  {
    id: 'ar-4',
    name: 'Consecutive Errors',
    type: 'consecutive_errors',
    enabled: true,
    threshold: 3,
    unit: 'errors',
    endpointName: 'All Endpoints',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    cooldownMinutes: 10,
  },
  {
    id: 'ar-5',
    name: '5xx Error Detection',
    type: 'status_code',
    enabled: true,
    threshold: 500,
    unit: 'status code',
    endpointName: 'All Endpoints',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    cooldownMinutes: 5,
  },
  {
    id: 'ar-6',
    name: 'SSL Certificate Issue',
    type: 'ssl_expiry',
    enabled: true,
    threshold: 0,
    unit: 'any',
    endpointName: 'All Endpoints',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    cooldownMinutes: 30,
  },
];

const DEFAULT_SETTINGS: AppSettings = {
  checkInterval: 30,
  notifications: {
    email: false,
    webhook: false,
    slack: false,
    emailUrl: '',
    webhookUrl: '',
    slackUrl: '',
  },
  dataRetention: 30,
  theme: 'dark',
  globalApiKey: '',
  globalAuthType: 'none',
  globalAuthHeader: 'X-API-Key',
  globalAuthPrefix: '',
  monitoringEnabled: true,
  liveMode: true,
  maxConcurrentChecks: 3,
  requestTimeout: 10000,
};

// ─── Initialize ────────────────────────────────────────────────────────

export function initializeData(): void {
  if (typeof window === 'undefined') return;
  const initialized = localStorage.getItem(STORAGE_KEYS.initialized);
  if (initialized) return;

  localStorage.setItem(STORAGE_KEYS.endpoints, JSON.stringify(DEFAULT_ENDPOINTS));
  localStorage.setItem(STORAGE_KEYS.logs, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.alertRules, JSON.stringify(DEFAULT_ALERT_RULES));
  localStorage.setItem(STORAGE_KEYS.alertEvents, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(DEFAULT_SETTINGS));
  localStorage.setItem(STORAGE_KEYS.globalApiKeys, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.initialized, 'v2-live');
}

// ─── Reset to defaults ─────────────────────────────────────────────────

export function resetAllData(): void {
  if (typeof window === 'undefined') return;
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  initializeData();
}

// ─── Getters ───────────────────────────────────────────────────────────

export function getEndpoints(): MonitoredEndpoint[] {
  if (typeof window === 'undefined') return DEFAULT_ENDPOINTS;
  const data = localStorage.getItem(STORAGE_KEYS.endpoints);
  return data ? JSON.parse(data) : DEFAULT_ENDPOINTS;
}

export function getLogs(): LogEntry[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.logs);
  return data ? JSON.parse(data) : [];
}

export function getAlertRules(): AlertRule[] {
  if (typeof window === 'undefined') return DEFAULT_ALERT_RULES;
  const data = localStorage.getItem(STORAGE_KEYS.alertRules);
  return data ? JSON.parse(data) : DEFAULT_ALERT_RULES;
}

export function getAlertEvents(): AlertEvent[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.alertEvents);
  return data ? JSON.parse(data) : [];
}

export function getSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  const data = localStorage.getItem(STORAGE_KEYS.settings);
  return data ? JSON.parse(data) : DEFAULT_SETTINGS;
}

export function getDashboardMetrics(): DashboardMetrics {
  const endpoints = getEndpoints();
  const logs = getLogs().slice(0, 100);

  const enabledEndpoints = endpoints.filter(ep => ep.enabled);
  const totalRequests = endpoints.reduce((sum, ep) => sum + ep.totalRequests, 0);
  const totalErrors = endpoints.reduce((sum, ep) => sum + ep.errorCount, 0);
  const healthyCount = enabledEndpoints.filter(ep => ep.status === 'up').length;
  const degradedCount = enabledEndpoints.filter(ep => ep.status === 'degraded').length;
  const downCount = enabledEndpoints.filter(ep => ep.status === 'down').length;

  const avgResponseTime = enabledEndpoints.length > 0
    ? Math.round(enabledEndpoints.reduce((sum, ep) => sum + ep.avgResponseTime, 0) / enabledEndpoints.length)
    : 0;

  const overallUptime = enabledEndpoints.length > 0
    ? Math.round(enabledEndpoints.reduce((sum, ep) => sum + ep.uptime, 0) / enabledEndpoints.length * 100) / 100
    : 100;

  const sortedTimes = logs
    .filter(l => l.isLive)
    .map(l => l.responseTime)
    .sort((a, b) => a - b);
  const p95Index = Math.floor(sortedTimes.length * 0.95);
  const p95ResponseTime = sortedTimes[p95Index] || 0;

  const liveChecks = logs.filter(l => l.isLive).length;
  const sslIssues = enabledEndpoints.filter(ep => !ep.sslValid).length;

  const lastCheckTime = endpoints.reduce((latest, ep) => {
    const t = new Date(ep.lastChecked).getTime();
    return t > latest ? t : latest;
  }, 0);

  return {
    totalEndpoints: endpoints.length,
    enabledEndpoints: enabledEndpoints.length,
    healthyEndpoints: healthyCount,
    degradedEndpoints: degradedCount,
    downEndpoints: downCount,
    totalRequests,
    totalErrors,
    avgResponseTime,
    p95ResponseTime,
    errorRate: totalRequests > 0 ? Math.round((totalErrors / totalRequests) * 10000) / 100 : 0,
    overallUptime,
    liveChecks,
    sslIssues,
    lastCheckTime: lastCheckTime > 0 ? new Date(lastCheckTime).toISOString() : new Date().toISOString(),
  };
}

// ─── Setters ───────────────────────────────────────────────────────────

export function saveEndpoints(endpoints: MonitoredEndpoint[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.endpoints, JSON.stringify(endpoints));
}

export function saveLogs(logs: LogEntry[]): void {
  if (typeof window === 'undefined') return;
  const trimmed = logs.slice(0, 1000);
  localStorage.setItem(STORAGE_KEYS.logs, JSON.stringify(trimmed));
}

export function saveAlertRules(rules: AlertRule[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.alertRules, JSON.stringify(rules));
}

export function saveAlertEvents(events: AlertEvent[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.alertEvents, JSON.stringify(events));
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}

// ─── Run All Live Checks (Batch) ───────────────────────────────────────

export async function runLiveChecks(): Promise<{
  endpoints: MonitoredEndpoint[];
  logs: LogEntry[];
  alerts: AlertEvent[];
}> {
  const endpoints = getEndpoints();
  const settings = getSettings();
  const enabledEndpoints = endpoints.filter(ep => ep.enabled);

  if (enabledEndpoints.length === 0 || !settings.monitoringEnabled) {
    return { endpoints, logs: getLogs(), alerts: getAlertEvents() };
  }

  const maxConcurrent = settings.maxConcurrentChecks || 3;
  let updatedEndpoints = [...endpoints];
  const newLogs: LogEntry[] = [];
  const allNewAlerts: AlertEvent[] = [];

  // Process in batches
  for (let i = 0; i < enabledEndpoints.length; i += maxConcurrent) {
    const batch = enabledEndpoints.slice(i, i + maxConcurrent);
    const results = await Promise.all(
      batch.map(async (ep) => {
        const globalKey = ep.globalKeyId ? getGlobalApiKeyById(ep.globalKeyId) : undefined;
        const result = await performLiveCheck(ep, globalKey);
        return { endpoint: ep, result };
      })
    );

    for (const { endpoint, result } of results) {
      const { updatedEndpoint, newLog, newAlerts } = processCheckResult(endpoint, result);
      const idx = updatedEndpoints.findIndex(e => e.id === endpoint.id);
      if (idx !== -1) {
        updatedEndpoints[idx] = updatedEndpoint;
      }
      newLogs.push(newLog);
      allNewAlerts.push(...newAlerts);
    }
  }

  // Persist everything
  saveEndpoints(updatedEndpoints);
  const existingLogs = getLogs();
  saveLogs([...newLogs, ...existingLogs]);
  if (allNewAlerts.length > 0) {
    const existingAlerts = getAlertEvents();
    saveAlertEvents([...allNewAlerts, ...existingAlerts]);
  }

  return {
    endpoints: updatedEndpoints,
    logs: getLogs(),
    alerts: getAlertEvents(),
  };
}

// ─── Run Single Endpoint Check ─────────────────────────────────────────

export async function runSingleCheck(endpointId: string): Promise<{
  endpoint: MonitoredEndpoint | null;
  log: LogEntry | null;
  alerts: AlertEvent[];
}> {
  const endpoints = getEndpoints();
  const endpoint = endpoints.find(ep => ep.id === endpointId);
  if (!endpoint) return { endpoint: null, log: null, alerts: [] };

  const globalKey = endpoint.globalKeyId ? getGlobalApiKeyById(endpoint.globalKeyId) : undefined;
  const result = await performLiveCheck(endpoint, globalKey);
  const { updatedEndpoint, newLog, newAlerts } = processCheckResult(endpoint, result);

  const updatedEndpoints = endpoints.map(ep => ep.id === endpointId ? updatedEndpoint : ep);
  saveEndpoints(updatedEndpoints);

  const logs = getLogs();
  saveLogs([newLog, ...logs]);

  if (newAlerts.length > 0) {
    const existingAlerts = getAlertEvents();
    saveAlertEvents([...newAlerts, ...existingAlerts]);
  }

  return { endpoint: updatedEndpoint, log: newLog, alerts: newAlerts };
}

// ─── CRUD Operations ───────────────────────────────────────────────────

export function addEndpoint(endpoint: Omit<MonitoredEndpoint,
  'id' | 'lastChecked' | 'totalRequests' | 'errorCount' | 'avgResponseTime' |
  'statusCode' | 'consecutiveFailures' | 'totalChecks' | 'totalSuccesses' | 'sslValid' | 'dnsResolved'
>): MonitoredEndpoint[] {
  const endpoints = getEndpoints();
  const newEndpoint: MonitoredEndpoint = {
    ...endpoint,
    id: 'ep-' + generateId(),
    statusCode: 0,
    lastChecked: new Date().toISOString(),
    totalRequests: 0,
    errorCount: 0,
    avgResponseTime: 0,
    consecutiveFailures: 0,
    totalChecks: 0,
    totalSuccesses: 0,
    sslValid: true,
    dnsResolved: true,
  };
  const updated = [...endpoints, newEndpoint];
  saveEndpoints(updated);
  return updated;
}

export function updateEndpoint(id: string, updates: Partial<MonitoredEndpoint>): MonitoredEndpoint[] {
  const endpoints = getEndpoints().map(ep => ep.id === id ? { ...ep, ...updates } : ep);
  saveEndpoints(endpoints);
  return endpoints;
}

export function toggleEndpoint(id: string): MonitoredEndpoint[] {
  const endpoints = getEndpoints().map(ep =>
    ep.id === id ? { ...ep, enabled: !ep.enabled } : ep
  );
  saveEndpoints(endpoints);
  return endpoints;
}

export function deleteEndpoint(id: string): MonitoredEndpoint[] {
  const endpoints = getEndpoints().filter(ep => ep.id !== id);
  saveEndpoints(endpoints);
  return endpoints;
}

export function acknowledgeAlert(eventId: string): AlertEvent[] {
  const events = getAlertEvents().map(e =>
    e.id === eventId ? { ...e, acknowledged: true } : e
  );
  saveAlertEvents(events);
  return events;
}

export function deleteAlertEvent(eventId: string): AlertEvent[] {
  const events = getAlertEvents().filter(e => e.id !== eventId);
  saveAlertEvents(events);
  return events;
}

export function addAlertRule(rule: Omit<AlertRule, 'id' | 'createdAt'>): AlertRule[] {
  const rules = getAlertRules();
  const newRule: AlertRule = {
    ...rule,
    id: 'ar-' + generateId(),
    createdAt: new Date().toISOString(),
  };
  saveAlertRules([...rules, newRule]);
  return [...rules, newRule];
}

export function deleteAlertRule(ruleId: string): AlertRule[] {
  const rules = getAlertRules().filter(r => r.id !== ruleId);
  saveAlertRules(rules);
  return rules;
}

// ─── Chart Data Helpers ────────────────────────────────────────────────

export function getResponseTimeHistory(endpointId?: string): { time: string; value: number; isLive: boolean }[] {
  const logs = getLogs();
  const filtered = endpointId ? logs.filter(l => l.endpointId === endpointId) : logs;
  const last50 = filtered.slice(0, 50).reverse();
  return last50.map(log => ({
    time: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    value: log.responseTime,
    isLive: log.isLive,
  }));
}

export function getHourlyRequestCounts(): { hour: string; success: number; error: number }[] {
  const logs = getLogs().slice(0, 500);
  const counts: Record<string, { success: number; error: number }> = {};

  logs.forEach(log => {
    const date = new Date(log.timestamp);
    const hour = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:00`;
    if (!counts[hour]) counts[hour] = { success: 0, error: 0 };
    if (log.isError) counts[hour].error++;
    else counts[hour].success++;
  });

  return Object.entries(counts).map(([hour, data]) => ({ hour, ...data })).slice(-12);
}

export function getStatusCodeDistribution(): { code: string; count: number; color: string }[] {
  const logs = getLogs().slice(0, 500);
  const counts: Record<string, number> = {};
  logs.forEach(log => {
    if (log.statusCode === 0) {
      counts['ERR'] = (counts['ERR'] || 0) + 1;
    } else {
      const range = log.statusCode < 300 ? '2xx' : log.statusCode < 400 ? '3xx' : log.statusCode < 500 ? '4xx' : '5xx';
      counts[range] = (counts[range] || 0) + 1;
    }
  });
  const colors: Record<string, string> = {
    '2xx': '#10b981', '3xx': '#3b82f6', '4xx': '#f59e0b', '5xx': '#ef4444', 'ERR': '#6b7280',
  };
  return Object.entries(counts)
    .map(([code, count]) => ({ code, count, color: colors[code] || '#6b7280' }))
    .sort((a, b) => b.count - a.count);
}

// ─── Data Cleanup (Retention) ──────────────────────────────────────────

export function cleanupOldData(): void {
  const settings = getSettings();
  const retentionMs = settings.dataRetention * 86400000;
  const cutoff = Date.now() - retentionMs;

  // Clean logs
  const logs = getLogs().filter(l => new Date(l.timestamp).getTime() > cutoff);
  saveLogs(logs);

  // Clean acknowledged alert events older than retention
  const alerts = getAlertEvents().filter(e =>
    !e.acknowledged || new Date(e.timestamp).getTime() > cutoff
  );
  saveAlertEvents(alerts);
}
