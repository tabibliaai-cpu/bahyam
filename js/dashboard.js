/* ============================================
   Dashboard
   ============================================ */

const Dashboard = {
    charts: {},

    init() {
        this.renderStats();
        this.renderResponseTimeChart();
        this.renderRequestVolumeChart();
        this.renderUptimeBars();
        this.renderRecentAlerts();
        this.startLiveUpdates();
    },

    renderStats() {
        const endpoints = App.getEndpoints();
        const metrics = App.getMetrics();

        const totalEndpoints = endpoints.length;
        const healthyCount = endpoints.filter(e => e.status === 'up').length;
        const degradedCount = endpoints.filter(e => e.status === 'degraded').length;
        const downCount = endpoints.filter(e => e.status === 'down').length;
        const avgResponseTime = Math.round(
            endpoints.filter(e => e.status !== 'down').reduce((sum, e) => sum + e.avgResponseTime, 0) /
            Math.max(1, endpoints.filter(e => e.status !== 'down').length)
        );
        const totalRequests = metrics.requestCounts ? metrics.requestCounts.reduce((a, b) => a + b, 0) : 0;
        const avgErrorRate = metrics.errorRates ? (metrics.errorRates.reduce((a, b) => a + parseFloat(b), 0) / metrics.errorRates.length) : 0;
        const overallUptime = (endpoints.reduce((sum, e) => sum + e.uptime, 0) / Math.max(1, endpoints.length)).toFixed(2);

        this.updateStatCard('stat-endpoints', totalEndpoints, null);
        this.updateStatCard('stat-healthy', healthyCount, `${healthyCount} of ${totalEndpoints} operational`, 'up');
        this.updateStatCard('stat-degraded', degradedCount, degradedCount > 0 ? 'Needs attention' : 'All good', degradedCount > 0 ? 'down' : 'up');
        this.updateStatCard('stat-down', downCount, downCount > 0 ? 'Critical!' : 'No outages', downCount > 0 ? 'down' : 'up');
        this.updateStatCard('stat-response', avgResponseTime + 'ms', avgResponseTime > 500 ? 'Above target' : 'Within target', avgResponseTime > 500 ? 'down' : 'up');
        this.updateStatCard('stat-requests', App.formatNumber(totalRequests), 'Last 24 hours', 'up');
        this.updateStatCard('stat-errors', avgErrorRate.toFixed(1) + '%', avgErrorRate > 3 ? 'High error rate' : 'Normal range', avgErrorRate > 3 ? 'down' : 'up');
        this.updateStatCard('stat-uptime', overallUptime + '%', '30-day average', parseFloat(overallUptime) > 99 ? 'up' : 'down');
    },

    updateStatCard(id, value, change, direction) {
        const valueEl = document.getElementById(id);
        const changeEl = document.getElementById(id + '-change');
        if (valueEl) valueEl.textContent = value;
        if (changeEl) {
            changeEl.textContent = change || '';
            changeEl.className = 'stat-card-change ' + (direction || 'up');
        }
    },

    renderResponseTimeChart() {
        const ctx = document.getElementById('responseTimeChart');
        if (!ctx) return;
        const metrics = App.getMetrics();

        if (this.charts.responseTime) this.charts.responseTime.destroy();

        this.charts.responseTime = new Chart(ctx, {
            type: 'line',
            data: {
                labels: metrics.labels || [],
                datasets: [{
                    label: 'Avg Response Time (ms)',
                    data: metrics.responseTimes || [],
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.08)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: '#6366f1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1a2035',
                        titleColor: '#e2e8f0',
                        bodyColor: '#8892a8',
                        borderColor: '#2a3654',
                        borderWidth: 1,
                        cornerRadius: 8,
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: (ctx) => `${ctx.parsed.y} ms`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(42, 54, 84, 0.3)', drawBorder: false },
                        ticks: { color: '#5a6478', font: { size: 11 }, maxTicksLimit: 12 }
                    },
                    y: {
                        grid: { color: 'rgba(42, 54, 84, 0.3)', drawBorder: false },
                        ticks: { color: '#5a6478', font: { size: 11 }, callback: (v) => v + 'ms' },
                        beginAtZero: true
                    }
                }
            }
        });
    },

    renderRequestVolumeChart() {
        const ctx = document.getElementById('requestVolumeChart');
        if (!ctx) return;
        const metrics = App.getMetrics();

        if (this.charts.requestVolume) this.charts.requestVolume.destroy();

        this.charts.requestVolume = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: metrics.labels || [],
                datasets: [{
                    label: 'Requests',
                    data: metrics.requestCounts || [],
                    backgroundColor: 'rgba(16, 185, 129, 0.6)',
                    borderColor: '#10b981',
                    borderWidth: 1,
                    borderRadius: 3,
                    barPercentage: 0.6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1a2035',
                        titleColor: '#e2e8f0',
                        bodyColor: '#8892a8',
                        borderColor: '#2a3654',
                        borderWidth: 1,
                        cornerRadius: 8,
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: (ctx) => App.formatNumber(ctx.parsed.y) + ' requests'
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#5a6478', font: { size: 11 }, maxTicksLimit: 12 }
                    },
                    y: {
                        grid: { color: 'rgba(42, 54, 84, 0.3)', drawBorder: false },
                        ticks: {
                            color: '#5a6478',
                            font: { size: 11 },
                            callback: (v) => v >= 1000 ? (v / 1000) + 'k' : v
                        },
                        beginAtZero: true
                    }
                }
            }
        });
    },

    renderUptimeBars() {
        const container = document.getElementById('uptimeBars');
        if (!container) return;

        const endpoints = App.getEndpoints();
        let html = '';

        endpoints.forEach(ep => {
            const data = App.generateUptimeData(ep.uptime);
            html += `
                <div class="mb-4">
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-sm font-medium">${ep.name}</span>
                        <span class="text-xs text-[var(--text-muted)]">${ep.uptime}% uptime</span>
                    </div>
                    <div class="uptime-bar">
                        ${data.map(d => `<div class="uptime-bar-item ${d}" title="${d}"></div>`).join('')}
                    </div>
                </div>
            `;
        });

        html += `
            <div class="uptime-legend">
                <div class="uptime-legend-item">
                    <div class="uptime-legend-dot" style="background: var(--success)"></div>
                    Operational
                </div>
                <div class="uptime-legend-item">
                    <div class="uptime-legend-dot" style="background: var(--warning)"></div>
                    Degraded
                </div>
                <div class="uptime-legend-item">
                    <div class="uptime-legend-dot" style="background: var(--danger)"></div>
                    Down
                </div>
            </div>
        `;

        container.innerHTML = html;
    },

    renderRecentAlerts() {
        const container = document.getElementById('recentAlerts');
        if (!container) return;

        const alerts = App.getAlerts().filter(a => !a.resolved).slice(0, 4);
        if (alerts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-regular fa-bell-slash"></i>
                    <div class="empty-state-title">No active alerts</div>
                    <div class="empty-state-desc">All systems are running smoothly.</div>
                </div>
            `;
            return;
        }

        container.innerHTML = alerts.map(alert => `
            <div class="alert-item ${alert.type}">
                <div class="alert-icon ${alert.type}">
                    <i class="fa-solid ${alert.type === 'critical' ? 'fa-circle-exclamation' : alert.type === 'warning' ? 'fa-triangle-exclamation' : 'fa-circle-info'}"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-description">${alert.description}</div>
                    <div class="alert-time">${App.timeAgo(alert.time)}</div>
                </div>
            </div>
        `).join('');
    },

    startLiveUpdates() {
        setInterval(() => {
            this.simulateUpdate();
        }, 8000);
    },

    simulateUpdate() {
        const endpoints = App.getEndpoints();
        endpoints.forEach(ep => {
            if (ep.status === 'down' && Math.random() > 0.85) {
                ep.status = 'up';
                ep.avgResponseTime = Math.floor(Math.random() * 200) + 50;
            } else if (ep.status === 'up' && Math.random() > 0.95) {
                ep.status = 'degraded';
                ep.avgResponseTime = Math.floor(Math.random() * 500) + 500;
            } else if (ep.status === 'degraded' && Math.random() > 0.8) {
                ep.status = 'up';
                ep.avgResponseTime = Math.floor(Math.random() * 200) + 50;
            }

            if (ep.status !== 'down') {
                ep.avgResponseTime = Math.max(10, ep.avgResponseTime + Math.floor((Math.random() - 0.5) * 40));
            }
            ep.lastChecked = Date.now();
        });

        App.saveEndpoints(endpoints);

        // Update metrics slightly
        const metrics = App.getMetrics();
        if (metrics.responseTimes) {
            metrics.responseTimes = metrics.responseTimes.map(rt =>
                Math.max(10, rt + Math.floor((Math.random() - 0.5) * 30))
            );
            metrics.requestCounts = metrics.requestCounts.map(rc =>
                Math.max(100, rc + Math.floor((Math.random() - 0.5) * 200))
            );
            metrics.errorRates = metrics.errorRates.map(er =>
                Math.max(0, (parseFloat(er) + (Math.random() - 0.5) * 0.3)).toFixed(2)
            );
            localStorage.setItem('bh_metrics', JSON.stringify(metrics));
        }

        // Refresh UI
        this.renderStats();
        if (this.charts.responseTime) {
            this.charts.responseTime.data.datasets[0].data = metrics.responseTimes;
            this.charts.responseTime.update('none');
        }
        if (this.charts.requestVolume) {
            this.charts.requestVolume.data.datasets[0].data = metrics.requestCounts;
            this.charts.requestVolume.update('none');
        }
        this.renderRecentAlerts();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Dashboard.init();
});
