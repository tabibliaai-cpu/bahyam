/* ============================================
   App Core - Shared Data & Navigation
   ============================================ */

const App = {
    // Initialize demo data
    init() {
        this.initData();
        this.initNavigation();
        this.applyTheme();
    },

    // Seed demo data if not present
    initData() {
        if (!localStorage.getItem('bh_endpoints')) {
            const endpoints = [
                { id: 1, name: 'Auth API', url: '/api/v1/auth/login', method: 'POST', status: 'up', avgResponseTime: 142, uptime: 99.97, lastChecked: Date.now() },
                { id: 2, name: 'User Profile', url: '/api/v1/users/profile', method: 'GET', status: 'up', avgResponseTime: 89, uptime: 99.99, lastChecked: Date.now() },
                { id: 3, name: 'Payment Gateway', url: '/api/v1/payments/process', method: 'POST', status: 'degraded', avgResponseTime: 890, uptime: 98.2, lastChecked: Date.now() },
                { id: 4, name: 'Search Engine', url: '/api/v1/search/query', method: 'GET', status: 'up', avgResponseTime: 210, uptime: 99.95, lastChecked: Date.now() },
                { id: 5, name: 'Notification Service', url: '/api/v1/notifications/send', method: 'POST', status: 'up', avgResponseTime: 67, uptime: 99.99, lastChecked: Date.now() },
                { id: 6, name: 'Analytics API', url: '/api/v1/analytics/events', method: 'POST', status: 'down', avgResponseTime: 0, uptime: 94.5, lastChecked: Date.now() },
                { id: 7, name: 'File Upload', url: '/api/v1/files/upload', method: 'POST', status: 'up', avgResponseTime: 450, uptime: 99.8, lastChecked: Date.now() },
                { id: 8, name: 'Chat WebSocket', url: '/api/v1/chat/connect', method: 'GET', status: 'up', avgResponseTime: 34, uptime: 99.99, lastChecked: Date.now() },
            ];
            localStorage.setItem('bh_endpoints', JSON.stringify(endpoints));
        }

        if (!localStorage.getItem('bh_alerts')) {
            const alerts = [
                { id: 1, type: 'critical', title: 'Analytics API is DOWN', description: 'The analytics endpoint has been unresponsive for 5 minutes.', time: Date.now() - 300000, resolved: false },
                { id: 2, type: 'warning', title: 'Payment Gateway Slow Response', description: 'Average response time exceeded 800ms threshold.', time: Date.now() - 600000, resolved: false },
                { id: 3, type: 'warning', title: 'High Error Rate on Auth API', description: 'Error rate reached 4.2% in the last 15 minutes.', time: Date.now() - 1800000, resolved: false },
                { id: 4, type: 'info', title: 'Deployment Completed', description: 'Version 2.4.1 deployed successfully to production.', time: Date.now() - 3600000, resolved: true },
                { id: 5, type: 'resolved', title: 'Search API Recovery', description: 'Search API recovered after brief degradation.', time: Date.now() - 7200000, resolved: true },
            ];
            localStorage.setItem('bh_alerts', JSON.stringify(alerts));
        }

        if (!localStorage.getItem('bh_logs')) {
            const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
            const endpoints = ['/api/v1/auth/login', '/api/v1/users/profile', '/api/v1/payments/process', '/api/v1/search/query', '/api/v1/notifications/send', '/api/v1/analytics/events', '/api/v1/files/upload', '/api/v1/chat/connect'];
            const statusCodes = [200, 200, 200, 200, 200, 200, 201, 204, 301, 400, 401, 403, 404, 429, 500, 502, 503];
            const logs = [];

            for (let i = 0; i < 100; i++) {
                const code = statusCodes[Math.floor(Math.random() * statusCodes.length)];
                const method = methods[Math.floor(Math.random() * methods.length)];
                const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
                const responseTime = code >= 500 ? 0 : Math.floor(Math.random() * 2000) + 10;
                logs.push({
                    id: i + 1,
                    timestamp: Date.now() - (i * 30000 + Math.floor(Math.random() * 30000)),
                    method: method,
                    url: endpoint,
                    statusCode: code,
                    responseTime: responseTime,
                    userAgent: 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36'
                });
            }
            localStorage.setItem('bh_logs', JSON.stringify(logs));
        }

        if (!localStorage.getItem('bh_settings')) {
            const settings = {
                theme: 'dark',
                checkInterval: 60,
                emailNotifications: true,
                email: 'admin@bahyam.com',
                slackNotifications: false,
                slackWebhook: '',
                webhookNotifications: false,
                webhookUrl: '',
                responseTimeThreshold: 500,
                errorRateThreshold: 5,
                dataRetention: 30,
                autoRefresh: true
            };
            localStorage.setItem('bh_settings', JSON.stringify(settings));
        }

        if (!localStorage.getItem('bh_metrics')) {
            this.generateMetrics();
        }
    },

    generateMetrics() {
        const now = Date.now();
        const hours = [];
        const responseTimes = [];
        const requestCounts = [];
        const errorRates = [];

        for (let i = 23; i >= 0; i--) {
            const hour = new Date(now - i * 3600000);
            hours.push(hour.getHours() + ':00');
            responseTimes.push(Math.floor(Math.random() * 300) + 50 + (i < 3 ? 200 : 0));
            requestCounts.push(Math.floor(Math.random() * 5000) + 1000);
            errorRates.push(Math.max(0, (Math.random() * 5 - 1.5 + (i < 2 ? 3 : 0))).toFixed(2));
        }

        localStorage.setItem('bh_metrics', JSON.stringify({
            labels: hours,
            responseTimes,
            requestCounts,
            errorRates
        }));
    },

    getEndpoints() {
        return JSON.parse(localStorage.getItem('bh_endpoints') || '[]');
    },

    saveEndpoints(endpoints) {
        localStorage.setItem('bh_endpoints', JSON.stringify(endpoints));
    },

    getAlerts() {
        return JSON.parse(localStorage.getItem('bh_alerts') || '[]');
    },

    saveAlerts(alerts) {
        localStorage.setItem('bh_alerts', JSON.stringify(alerts));
    },

    getLogs() {
        return JSON.parse(localStorage.getItem('bh_logs') || '[]');
    },

    saveLogs(logs) {
        localStorage.setItem('bh_logs', JSON.stringify(logs));
    },

    getSettings() {
        return JSON.parse(localStorage.getItem('bh_settings') || '{}');
    },

    saveSettings(settings) {
        localStorage.setItem('bh_settings', JSON.stringify(settings));
    },

    getMetrics() {
        return JSON.parse(localStorage.getItem('bh_metrics') || '{}');
    },

    initNavigation() {
        const toggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');

        if (toggle) {
            toggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
                overlay.classList.toggle('active');
            });
        }

        if (overlay) {
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
            });
        }

        // Set active nav item
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-item').forEach(item => {
            const href = item.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                item.classList.add('active');
            }
        });
    },

    applyTheme() {
        const settings = this.getSettings();
        const theme = settings.theme || 'dark';
        document.documentElement.setAttribute('data-theme', theme);
    },

    toggleTheme() {
        const settings = this.getSettings();
        settings.theme = settings.theme === 'dark' ? 'light' : 'dark';
        this.saveSettings(settings);
        this.applyTheme();
    },

    // Utility: format time ago
    timeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    },

    // Utility: format number with commas
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    // Simulate live data updates
    startLiveUpdates(callback) {
        return setInterval(() => {
            callback();
        }, 5000);
    },

    // Add random variation to metric
    varyMetric(base, variance) {
        return Math.max(0, base + (Math.random() - 0.5) * variance);
    },

    // Generate uptime bar data (90 days)
    generateUptimeData(uptimePercent) {
        const data = [];
        const healthyThreshold = uptimePercent / 100;
        for (let i = 0; i < 90; i++) {
            const rand = Math.random();
            if (rand < healthyThreshold * 0.95) {
                data.push('up');
            } else if (rand < healthyThreshold) {
                data.push('degraded');
            } else {
                data.push('down');
            }
        }
        return data;
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
