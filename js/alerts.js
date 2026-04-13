/* ============================================
   Alerts Page
   ============================================ */

const AlertsPage = {
    activeTab: 'active',

    init() {
        this.render();
        this.bindEvents();
    },

    render() {
        this.renderAlerts();
        this.renderAlertRules();
    },

    getAlerts() {
        return App.getAlerts();
    },

    renderAlerts() {
        const container = document.getElementById('alertsList');
        if (!container) return;

        const alerts = this.getAlerts();
        const filtered = this.activeTab === 'active'
            ? alerts.filter(a => !a.resolved)
            : alerts.filter(a => a.resolved);

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-regular fa-bell-slash"></i>
                    <div class="empty-state-title">${this.activeTab === 'active' ? 'No active alerts' : 'No resolved alerts'}</div>
                    <div class="empty-state-desc">${this.activeTab === 'active' ? 'All systems are running smoothly.' : 'Resolved alerts will appear here.'}</div>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.sort((a, b) => b.time - a.time).map(alert => `
            <div class="alert-item ${alert.type} fade-in">
                <div class="alert-icon ${alert.type}">
                    <i class="fa-solid ${this.getAlertIcon(alert.type)}"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-description">${alert.description}</div>
                    <div class="alert-time">${App.timeAgo(alert.time)}</div>
                </div>
                ${!alert.resolved ? `
                    <button class="btn btn-sm btn-secondary" onclick="AlertsPage.resolveAlert(${alert.id})">
                        <i class="fa-solid fa-check"></i> Resolve
                    </button>
                ` : `
                    <span style="font-size:0.75rem;color:var(--success);font-weight:500;">
                        <i class="fa-solid fa-circle-check"></i> Resolved
                    </span>
                `}
            </div>
        `).join('');

        // Update counts
        document.getElementById('activeAlertCount').textContent = alerts.filter(a => !a.resolved).length;
        document.getElementById('resolvedAlertCount').textContent = alerts.filter(a => a.resolved).length;
    },

    getAlertIcon(type) {
        switch (type) {
            case 'critical': return 'fa-circle-exclamation';
            case 'warning': return 'fa-triangle-exclamation';
            case 'info': return 'fa-circle-info';
            case 'resolved': return 'fa-circle-check';
            default: return 'fa-bell';
        }
    },

    renderAlertRules() {
        const container = document.getElementById('alertRulesList');
        if (!container) return;

        const settings = App.getSettings();
        const rules = [
            {
                id: 'response-time',
                name: 'Response Time Threshold',
                description: `Alert when response time exceeds ${settings.responseTimeThreshold}ms`,
                enabled: true,
                value: settings.responseTimeThreshold,
                unit: 'ms'
            },
            {
                id: 'error-rate',
                name: 'Error Rate Threshold',
                description: `Alert when error rate exceeds ${settings.errorRateThreshold}%`,
                enabled: true,
                value: settings.errorRateThreshold,
                unit: '%'
            },
            {
                id: 'downtime',
                name: 'Downtime Detection',
                description: 'Alert immediately when any endpoint goes down',
                enabled: true,
                value: null,
                unit: ''
            }
        ];

        container.innerHTML = rules.map(rule => `
            <div class="settings-row">
                <div class="settings-row-label">
                    <div class="settings-row-name">${rule.name}</div>
                    <div class="settings-row-desc">${rule.description}</div>
                </div>
                <div style="display:flex;align-items:center;gap:12px;">
                    ${rule.value !== null ? `
                        <input type="range" class="range-slider" min="${rule.unit === 'ms' ? 100 : 1}" max="${rule.unit === 'ms' ? 2000 : 20}" step="${rule.unit === 'ms' ? 50 : 0.5}" value="${rule.value}" onchange="AlertsPage.updateRule('${rule.id}', this.value)">
                        <span style="font-family:monospace;font-size:0.85rem;min-width:50px;text-align:right;">${rule.value}${rule.unit}</span>
                    ` : ''}
                    <label class="toggle">
                        <input type="checkbox" ${rule.enabled ? 'checked' : ''} onchange="AlertsPage.toggleRule('${rule.id}', this.checked)">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </div>
        `).join('');
    },

    bindEvents() {
        // Tabs
        document.querySelectorAll('[data-alert-tab]').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('[data-alert-tab]').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.activeTab = tab.dataset.alertTab;
                this.renderAlerts();
            });
        });
    },

    resolveAlert(id) {
        const alerts = this.getAlerts();
        const alert = alerts.find(a => a.id === id);
        if (alert) {
            alert.resolved = true;
            alert.type = 'resolved';
            App.saveAlerts(alerts);
            this.renderAlerts();
        }
    },

    updateRule(ruleId, value) {
        const settings = App.getSettings();
        if (ruleId === 'response-time') {
            settings.responseTimeThreshold = parseInt(value);
        } else if (ruleId === 'error-rate') {
            settings.errorRateThreshold = parseFloat(value);
        }
        App.saveSettings(settings);
        this.renderAlertRules();
    },

    toggleRule(ruleId, enabled) {
        // In a real app, this would enable/disable the rule
        console.log(`Rule ${ruleId} ${enabled ? 'enabled' : 'disabled'}`);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    AlertsPage.init();
});
