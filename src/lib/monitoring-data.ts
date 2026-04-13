import {
  MonitoredEndpoint,
  LogEntry,
  AlertRule,
  AlertEvent,
  AppSettings,
  DashboardMetrics,
  HttpMethod,
  EndpointStatus,
} from './monitoring-types';

const STORAGE_KEYS = {
  endpoints: 'monitoring_endpoints',
  logs: 'monitoring_logs',
  alertRules: 'monitoring_alert_rules',
  alertEvents: 'monitoring_alert_events',
  settings: 'monitoring_settings',
  initialized: 'monitoring_initialized',
};

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomStatus(): EndpointStatus {
  const r = Math.random();
  if (r < 0.8) return 'up';
  if (r < 0.93) return 'degraded';
  return 'down';
}

function randomHttpCode(status: EndpointStatus): number {
  if (status === 'up') return randomBetween(200, 299);
  if (status === 'degraded') return randomBetween(400, 499);
  return randomBetween(500, 599);
}

const DEFAULT_ENDPOINTS: MonitoredEndpoint[] = [
  {
    id: 'ep-1',
    name: 'User API',
    url: 'https://api.example.com/v1/users',
    method: 'GET',
    status: 'up',
    responseTime: 142,
    uptime: 99.95,
    lastChecked: new Date().toISOString(),
    totalRequests: 245891,
    errorCount: 123,
    avgResponseTime: 138,
    statusCode: 200,
  },
  {
    id: 'ep-2',
    name: 'Payment Gateway',
    url: 'https://api.example.com/v2/payments',
    method: 'POST',
    status: 'up',
    responseTime: 287,
    uptime: 99.87,
    lastChecked: new Date().toISOString(),
    totalRequests: 89432,
    errorCount: 156,
    avgResponseTime: 295,
    statusCode: 200,
  },
  {
    id: 'ep-3',
    name: 'Auth Service',
    url: 'https://auth.example.com/token',
    method: 'POST',
    status: 'degraded',
    responseTime: 523,
    uptime: 98.42,
    lastChecked: new Date().toISOString(),
    totalRequests: 156789,
    errorCount: 2467,
    avgResponseTime: 489,
    statusCode: 503,
  },
  {
    id: 'ep-4',
    name: 'Product Catalog',
    url: 'https://api.example.com/v1/products',
    method: 'GET',
    status: 'up',
    responseTime: 89,
    uptime: 99.99,
    lastChecked: new Date().toISOString(),
    totalRequests: 567234,
    errorCount: 57,
    avgResponseTime: 92,
    statusCode: 200,
  },
  {
    id: 'ep-5',
    name: 'Search Engine',
    url: 'https://search.example.com/api/query',
    method: 'GET',
    status: 'up',
    responseTime: 195,
    uptime: 99.91,
    lastChecked: new Date().toISOString(),
    totalRequests: 342156,
    errorCount: 308,
    avgResponseTime: 201,
    statusCode: 200,
  },
  {
    id: 'ep-6',
    name: 'Notification Service',
    url: 'https://notify.example.com/v1/send',
    method: 'POST',
    status: 'down',
    responseTime: 5000,
    uptime: 94.56,
    lastChecked: new Date().toISOString(),
    totalRequests: 78923,
    errorCount: 4289,
    avgResponseTime: 3450,
    statusCode: 502,
  },
  {
    id: 'ep-7',
    name: 'Analytics API',
    url: 'https://analytics.example.com/v2/events',
    method: 'POST',
    status: 'up',
    responseTime: 167,
    uptime: 99.78,
    lastChecked: new Date().toISOString(),
    totalRequests: 1234567,
    errorCount: 2721,
    avgResponseTime: 175,
    statusCode: 200,
  },
  {
    id: 'ep-8',
    name: 'CDN Edge Check',
    url: 'https://cdn.example.com/health',
    method: 'GET',
    status: 'up',
    responseTime: 23,
    uptime: 99.99,
    lastChecked: new Date().toISOString(),
    totalRequests: 4567890,
    errorCount: 46,
    avgResponseTime: 25,
    statusCode: 200,
  },
];

const DEFAULT_ALERT_RULES: AlertRule[] = [
  {
    id: 'ar-1',
    name: 'High Response Time',
    type: 'response_time',
    enabled: true,
    threshold: 500,
    unit: 'ms',
    endpointName: 'All Endpoints',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    lastTriggered: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'ar-2',
    name: 'Error Rate Spike',
    type: 'error_rate',
    enabled: true,
    threshold: 5,
    unit: '%',
    endpointName: 'All Endpoints',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    lastTriggered: new Date(Date.now() - 7200000).toISOString(),
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
  },
  {
    id: 'ar-4',
    name: 'Auth Service Latency',
    type: 'response_time',
    enabled: true,
    threshold: 300,
    unit: 'ms',
    endpointId: 'ep-3',
    endpointName: 'Auth Service',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    lastTriggered: new Date(Date.now() - 1800000).toISOString(),
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
    lastTriggered: new Date(Date.now() - 900000).toISOString(),
  },
];

const DEFAULT_SETTINGS: AppSettings = {
  checkInterval: 30,
  notifications: {
    email: true,
    webhook: false,
    slack: true,
    emailUrl: 'alerts@example.com',
    webhookUrl: '',
    slackUrl: 'https://hooks.slack.com/services/T00/B00/xxx',
  },
  dataRetention: 30,
  theme: 'dark',
};

function generateInitialLogs(endpoints: MonitoredEndpoint[]): LogEntry[] {
  const logs: LogEntry[] = [];
  const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE'];
  const now = Date.now();

  for (let i = 0; i < 200; i++) {
    const endpoint = endpoints[randomBetween(0, endpoints.length - 1)];
    const statusCode = endpoint.status === 'up'
      ? [200, 201, 204][randomBetween(0, 2)]
      : endpoint.status === 'degraded'
        ? [400, 401, 403, 408, 429, 503][randomBetween(0, 5)]
        : [500, 502, 503, 504][randomBetween(0, 3)];

    const isError = statusCode >= 400;
    const timeAgo = randomBetween(0, 86400000 * 7);

    logs.push({
      id: generateId(),
      endpointId: endpoint.id,
      endpointName: endpoint.name,
      url: endpoint.url,
      method: methods[randomBetween(0, methods.length - 1)],
      statusCode,
      responseTime: endpoint.status === 'down' ? randomBetween(2000, 5000) : randomBetween(20, 600),
      timestamp: new Date(now - timeAgo).toISOString(),
      isError,
      errorMessage: isError ? getErrorForCode(statusCode) : undefined,
    });
  }

  logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return logs;
}

function getErrorForCode(code: number): string {
  const errors: Record<number, string> = {
    400: 'Bad Request: Invalid parameters',
    401: 'Unauthorized: Authentication required',
    403: 'Forbidden: Insufficient permissions',
    404: 'Not Found: Resource does not exist',
    408: 'Request Timeout: Server did not respond in time',
    429: 'Too Many Requests: Rate limit exceeded',
    500: 'Internal Server Error: Unexpected condition',
    502: 'Bad Gateway: Invalid upstream response',
    503: 'Service Unavailable: Server is overloaded',
    504: 'Gateway Timeout: Upstream server timeout',
  };
  return errors[code] || `HTTP Error ${code}`;
}

function generateInitialAlertEvents(): AlertEvent[] {
  return [
    {
      id: generateId(),
      ruleId: 'ar-1',
      ruleName: 'High Response Time',
      type: 'response_time',
      message: 'Auth Service response time exceeded 500ms (current: 523ms)',
      severity: 'warning',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      acknowledged: false,
      endpointName: 'Auth Service',
    },
    {
      id: generateId(),
      ruleId: 'ar-2',
      ruleName: 'Error Rate Spike',
      type: 'error_rate',
      message: 'Notification Service error rate reached 12.3% (threshold: 5%)',
      severity: 'critical',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      acknowledged: false,
      endpointName: 'Notification Service',
    },
    {
      id: generateId(),
      ruleId: 'ar-3',
      ruleName: 'Service Downtime',
      type: 'downtime',
      message: 'Notification Service has been down for 5 minutes',
      severity: 'critical',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      acknowledged: true,
      endpointName: 'Notification Service',
    },
    {
      id: generateId(),
      ruleId: 'ar-5',
      ruleName: '5xx Error Detection',
      type: 'status_code',
      message: 'Payment Gateway returned HTTP 502',
      severity: 'warning',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      acknowledged: true,
      endpointName: 'Payment Gateway',
    },
    {
      id: generateId(),
      ruleId: 'ar-4',
      ruleName: 'Auth Service Latency',
      type: 'response_time',
      message: 'Auth Service latency exceeded 300ms (current: 489ms)',
      severity: 'warning',
      timestamp: new Date(Date.now() - 21600000).toISOString(),
      acknowledged: true,
      endpointName: 'Auth Service',
    },
  ];
}

export function initializeData(): void {
  if (typeof window === 'undefined') return;
  const initialized = localStorage.getItem(STORAGE_KEYS.initialized);
  if (initialized) return;

  localStorage.setItem(STORAGE_KEYS.endpoints, JSON.stringify(DEFAULT_ENDPOINTS));
  const logs = generateInitialLogs(DEFAULT_ENDPOINTS);
  localStorage.setItem(STORAGE_KEYS.logs, JSON.stringify(logs));
  localStorage.setItem(STORAGE_KEYS.alertRules, JSON.stringify(DEFAULT_ALERT_RULES));
  localStorage.setItem(STORAGE_KEYS.alertEvents, JSON.stringify(generateInitialAlertEvents()));
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(DEFAULT_SETTINGS));
  localStorage.setItem(STORAGE_KEYS.initialized, 'true');
}

// --- Getters ---

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

  const totalRequests = endpoints.reduce((sum, ep) => sum + ep.totalRequests, 0);
  const totalErrors = endpoints.reduce((sum, ep) => sum + ep.errorCount, 0);
  const healthyCount = endpoints.filter((ep) => ep.status === 'up').length;
  const degradedCount = endpoints.filter((ep) => ep.status === 'degraded').length;
  const downCount = endpoints.filter((ep) => ep.status === 'down').length;
  const avgResponseTime = Math.round(
    endpoints.reduce((sum, ep) => sum + ep.avgResponseTime, 0) / endpoints.length
  );
  const overallUptime = Math.round(
    endpoints.reduce((sum, ep) => sum + ep.uptime, 0) / endpoints.length * 100
  ) / 100;

  const sortedTimes = logs
    .map((l) => l.responseTime)
    .sort((a, b) => a - b);
  const p95Index = Math.floor(sortedTimes.length * 0.95);
  const p95ResponseTime = sortedTimes[p95Index] || 0;

  return {
    totalEndpoints: endpoints.length,
    healthyEndpoints: healthyCount,
    degradedEndpoints: degradedCount,
    downEndpoints: downCount,
    totalRequests,
    totalErrors,
    avgResponseTime,
    p95ResponseTime,
    errorRate: totalRequests > 0 ? Math.round((totalErrors / totalRequests) * 10000) / 100 : 0,
    overallUptime,
  };
}

// --- Setters ---

export function saveEndpoints(endpoints: MonitoredEndpoint[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.endpoints, JSON.stringify(endpoints));
}

export function saveLogs(logs: LogEntry[]): void {
  if (typeof window === 'undefined') return;
  // Keep max 500 logs
  const trimmed = logs.slice(0, 500);
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

// --- Simulation ---

export function simulateEndpointUpdate(): MonitoredEndpoint[] {
  const endpoints = getEndpoints();
  const updated = endpoints.map((ep) => {
    const jitter = randomBetween(-20, 20);
    let newStatus = ep.status;
    let newResponseTime = Math.max(10, ep.responseTime + jitter);
    let newStatusCode = ep.statusCode;

    // Occasionally flip status (low probability)
    const flipChance = Math.random();
    if (flipChance < 0.03) {
      newStatus = randomStatus();
      newStatusCode = randomHttpCode(newStatus);
      newResponseTime = newStatus === 'down' ? randomBetween(2000, 5000) : newStatus === 'degraded' ? randomBetween(300, 800) : randomBetween(20, 300);
    } else if (newStatus === 'up') {
      newStatusCode = randomBetween(200, 299);
      newResponseTime = randomBetween(Math.max(10, ep.avgResponseTime - 50), ep.avgResponseTime + 80);
    } else if (newStatus === 'degraded') {
      newStatusCode = [400, 408, 429, 503][randomBetween(0, 3)];
      newResponseTime = randomBetween(300, 900);
    } else {
      newStatusCode = [500, 502, 503, 504][randomBetween(0, 3)];
      newResponseTime = randomBetween(2000, 5000);
    }

    const newRequestCount = ep.totalRequests + randomBetween(0, 10);
    const newErrorCount = newStatusCode >= 400 ? ep.errorCount + 1 : ep.errorCount;

    return {
      ...ep,
      status: newStatus,
      responseTime: newResponseTime,
      statusCode: newStatusCode,
      lastChecked: new Date().toISOString(),
      totalRequests: newRequestCount,
      errorCount: newErrorCount,
    };
  });

  saveEndpoints(updated);
  return updated;
}

export function addSimulatedLog(): LogEntry[] {
  const endpoints = getEndpoints();
  const logs = getLogs();
  const endpoint = endpoints[randomBetween(0, endpoints.length - 1)];
  const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE'];
  const isError = endpoint.status !== 'up' && Math.random() < 0.5;
  const statusCode = isError
    ? (endpoint.status === 'down' ? [500, 502, 503, 504][randomBetween(0, 3)] : [400, 408, 429, 503][randomBetween(0, 3)])
    : [200, 201, 204][randomBetween(0, 2)];

  const newLog: LogEntry = {
    id: generateId(),
    endpointId: endpoint.id,
    endpointName: endpoint.name,
    url: endpoint.url,
    method: methods[randomBetween(0, methods.length - 1)],
    statusCode,
    responseTime: endpoint.status === 'down' ? randomBetween(2000, 5000) : randomBetween(20, 400),
    timestamp: new Date().toISOString(),
    isError,
    errorMessage: isError ? getErrorForCode(statusCode) : undefined,
  };

  const updatedLogs = [newLog, ...logs];
  saveLogs(updatedLogs);
  return updatedLogs;
}

export function addEndpoint(endpoint: Omit<MonitoredEndpoint, 'id' | 'lastChecked' | 'totalRequests' | 'errorCount' | 'avgResponseTime' | 'statusCode'>): MonitoredEndpoint[] {
  const endpoints = getEndpoints();
  const newEndpoint: MonitoredEndpoint = {
    ...endpoint,
    id: 'ep-' + generateId(),
    statusCode: 200,
    lastChecked: new Date().toISOString(),
    totalRequests: 0,
    errorCount: 0,
    avgResponseTime: endpoint.responseTime,
  };
  const updated = [...endpoints, newEndpoint];
  saveEndpoints(updated);
  return updated;
}

export function deleteEndpoint(id: string): MonitoredEndpoint[] {
  const endpoints = getEndpoints().filter((ep) => ep.id !== id);
  saveEndpoints(endpoints);
  return endpoints;
}

export function getResponseTimeHistory(endpointId?: string): { time: string; value: number }[] {
  const logs = getLogs();
  const filtered = endpointId ? logs.filter((l) => l.endpointId === endpointId) : logs;
  const last50 = filtered.slice(0, 50).reverse();
  return last50.map((log, i) => ({
    time: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    value: log.responseTime,
  }));
}

export function getHourlyRequestCounts(): { hour: string; success: number; error: number }[] {
  const logs = getLogs().slice(0, 200);
  const counts: Record<string, { success: number; error: number }> = {};

  logs.forEach((log) => {
    const date = new Date(log.timestamp);
    const hour = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:00`;
    if (!counts[hour]) counts[hour] = { success: 0, error: 0 };
    if (log.isError) counts[hour].error++;
    else counts[hour].success++;
  });

  return Object.entries(counts).map(([hour, data]) => ({ hour, ...data })).slice(-12);
}

export function getStatusCodeDistribution(): { code: string; count: number; color: string }[] {
  const logs = getLogs().slice(0, 200);
  const counts: Record<string, number> = {};
  logs.forEach((log) => {
    const range = log.statusCode < 300 ? '2xx' : log.statusCode < 400 ? '3xx' : log.statusCode < 500 ? '4xx' : '5xx';
    counts[range] = (counts[range] || 0) + 1;
  });
  const colors: Record<string, string> = { '2xx': '#10b981', '3xx': '#3b82f6', '4xx': '#f59e0b', '5xx': '#ef4444' };
  return Object.entries(counts)
    .map(([code, count]) => ({ code, count, color: colors[code] || '#6b7280' }))
    .sort((a, b) => b.count - a.count);
}

export function acknowledgeAlert(eventId: string): AlertEvent[] {
  const events = getAlertEvents().map((e) =>
    e.id === eventId ? { ...e, acknowledged: true } : e
  );
  saveAlertEvents(events);
  return events;
}
