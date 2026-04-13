/* ============================================
   Logs Page
   ============================================ */

const LogsPage = {
    filter: 'all',
    searchQuery: '',

    init() {
        this.render();
        this.bindEvents();
        this.startAutoRefresh();
    },

    render() {
        this.renderLogs();
    },

    getFilteredLogs() {
        let logs = App.getLogs();

        if (this.filter !== 'all') {
            if (this.filter === '2xx') {
                logs = logs.filter(l => l.statusCode >= 200 && l.statusCode < 300);
            } else if (this.filter === '4xx') {
                logs = logs.filter(l => l.statusCode >= 400 && l.statusCode < 500);
            } else if (this.filter === '5xx') {
                logs = logs.filter(l => l.statusCode >= 500);
            }
        }

        if (this.searchQuery) {
            const q = this.searchQuery.toLowerCase();
            logs = logs.filter(l =>
                l.url.toLowerCase().includes(q) ||
                l.method.toLowerCase().includes(q) ||
                l.statusCode.toString().includes(q)
            );
        }

        return logs;
    },

    renderLogs() {
        const container = document.getElementById('logsContainer');
        if (!container) return;

        const logs = this.getFilteredLogs().slice(0, 50);

        if (logs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-regular fa-file-lines"></i>
                    <div class="empty-state-title">No log entries found</div>
                    <div class="empty-state-desc">Try adjusting your filters.</div>
                </div>
            `;
            return;
        }

        container.innerHTML = logs.map(log => {
            const time = new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const statusClass = log.statusCode >= 500 ? 's5xx' : log.statusCode >= 400 ? 's4xx' : 's2xx';
            const rtClass = log.responseTime < 200 ? 'fast' : log.responseTime < 500 ? 'medium' : 'slow';
            const rtDisplay = log.responseTime === 0 ? 'Timeout' : log.responseTime + 'ms';

            return `
                <div class="log-entry">
                    <span class="log-time">${time}</span>
                    <span class="log-method method-badge ${log.method.toLowerCase()}" style="font-size:0.7rem;">${log.method}</span>
                    <span class="endpoint-url">${log.url}</span>
                    <span class="status-code ${statusClass}">${log.statusCode}</span>
                    <span class="response-time ${rtClass}">${rtDisplay}</span>
                    <span style="font-size:0.72rem;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${log.userAgent}">${log.userAgent}</span>
                </div>
            `;
        }).join('');

        // Update counts
        const all = App.getLogs();
        document.getElementById('logCount').textContent = logs.length + ' entries';
    },

    bindEvents() {
        // Filter chips
        document.querySelectorAll('[data-log-filter]').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('[data-log-filter]').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.filter = chip.dataset.logFilter;
                this.renderLogs();
            });
        });

        // Search
        const searchInput = document.getElementById('logSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.renderLogs();
            });
        }

        // Refresh button
        const refreshBtn = document.getElementById('refreshLogs');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.generateNewLogs();
                this.renderLogs();
            });
        }

        // Clear logs button
        const clearBtn = document.getElementById('clearLogs');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                App.saveLogs([]);
                this.renderLogs();
            });
        }
    },

    generateNewLogs() {
        const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
        const endpoints = ['/api/v1/auth/login', '/api/v1/users/profile', '/api/v1/payments/process', '/api/v1/search/query', '/api/v1/notifications/send', '/api/v1/analytics/events', '/api/v1/files/upload', '/api/v1/chat/connect'];
        const statusCodes = [200, 200, 200, 200, 200, 200, 201, 204, 400, 401, 404, 429, 500, 502];
        const logs = App.getLogs();

        // Add 3 new random logs
        for (let i = 0; i < 3; i++) {
            const code = statusCodes[Math.floor(Math.random() * statusCodes.length)];
            logs.unshift({
                id: logs.length + 1 + i,
                timestamp: Date.now() - i * 2000,
                method: methods[Math.floor(Math.random() * methods.length)],
                url: endpoints[Math.floor(Math.random() * endpoints.length)],
                statusCode: code,
                responseTime: code >= 500 ? 0 : Math.floor(Math.random() * 2000) + 10,
                userAgent: 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36'
            });
        }

        // Keep last 200 entries
        App.saveLogs(logs.slice(0, 200));
    },

    startAutoRefresh() {
        setInterval(() => {
            this.generateNewLogs();
            this.renderLogs();
        }, 10000);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    LogsPage.init();
});
