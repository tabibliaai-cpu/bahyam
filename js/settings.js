/* ============================================
   Settings Page
   ============================================ */

const SettingsPage = {
    init() {
        this.render();
        this.bindEvents();
    },

    render() {
        this.renderSettings();
    },

    renderSettings() {
        const settings = App.getSettings();

        // Theme
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) themeToggle.checked = settings.theme === 'light';

        // Check interval
        const intervalSlider = document.getElementById('checkInterval');
        const intervalValue = document.getElementById('checkIntervalValue');
        if (intervalSlider) {
            intervalSlider.value = settings.checkInterval;
            if (intervalValue) intervalValue.textContent = settings.checkInterval + 's';
        }

        // Auto refresh
        const autoRefresh = document.getElementById('autoRefresh');
        if (autoRefresh) autoRefresh.checked = settings.autoRefresh;

        // Notifications
        const emailNotif = document.getElementById('emailNotif');
        if (emailNotif) emailNotif.checked = settings.emailNotifications;

        const emailInput = document.getElementById('emailInput');
        if (emailInput) emailInput.value = settings.email || '';

        const slackNotif = document.getElementById('slackNotif');
        if (slackNotif) slackNotif.checked = settings.slackNotifications;

        const slackInput = document.getElementById('slackInput');
        if (slackInput) slackInput.value = settings.slackWebhook || '';

        const webhookNotif = document.getElementById('webhookNotif');
        if (webhookNotif) webhookNotif.checked = settings.webhookNotifications;

        const webhookInput = document.getElementById('webhookInput');
        if (webhookInput) webhookInput.value = settings.webhookUrl || '';

        // Data retention
        const retentionSelect = document.getElementById('dataRetention');
        if (retentionSelect) retentionSelect.value = settings.dataRetention || 30;
    },

    bindEvents() {
        // Theme
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('change', () => {
                App.toggleTheme();
            });
        }

        // Check interval
        const intervalSlider = document.getElementById('checkInterval');
        if (intervalSlider) {
            intervalSlider.addEventListener('input', (e) => {
                document.getElementById('checkIntervalValue').textContent = e.target.value + 's';
                const settings = App.getSettings();
                settings.checkInterval = parseInt(e.target.value);
                App.saveSettings(settings);
            });
        }

        // Auto refresh
        const autoRefresh = document.getElementById('autoRefresh');
        if (autoRefresh) {
            autoRefresh.addEventListener('change', (e) => {
                const settings = App.getSettings();
                settings.autoRefresh = e.target.checked;
                App.saveSettings(settings);
            });
        }

        // Email notifications
        const emailNotif = document.getElementById('emailNotif');
        if (emailNotif) {
            emailNotif.addEventListener('change', (e) => {
                const settings = App.getSettings();
                settings.emailNotifications = e.target.checked;
                App.saveSettings(settings);
            });
        }

        const emailInput = document.getElementById('emailInput');
        if (emailInput) {
            emailInput.addEventListener('change', (e) => {
                const settings = App.getSettings();
                settings.email = e.target.value;
                App.saveSettings(settings);
            });
        }

        // Slack
        const slackNotif = document.getElementById('slackNotif');
        if (slackNotif) {
            slackNotif.addEventListener('change', (e) => {
                const settings = App.getSettings();
                settings.slackNotifications = e.target.checked;
                App.saveSettings(settings);
            });
        }

        const slackInput = document.getElementById('slackInput');
        if (slackInput) {
            slackInput.addEventListener('change', (e) => {
                const settings = App.getSettings();
                settings.slackWebhook = e.target.value;
                App.saveSettings(settings);
            });
        }

        // Webhook
        const webhookNotif = document.getElementById('webhookNotif');
        if (webhookNotif) {
            webhookNotif.addEventListener('change', (e) => {
                const settings = App.getSettings();
                settings.webhookNotifications = e.target.checked;
                App.saveSettings(settings);
            });
        }

        const webhookInput = document.getElementById('webhookInput');
        if (webhookInput) {
            webhookInput.addEventListener('change', (e) => {
                const settings = App.getSettings();
                settings.webhookUrl = e.target.value;
                App.saveSettings(settings);
            });
        }

        // Data retention
        const retentionSelect = document.getElementById('dataRetention');
        if (retentionSelect) {
            retentionSelect.addEventListener('change', (e) => {
                const settings = App.getSettings();
                settings.dataRetention = parseInt(e.target.value);
                App.saveSettings(settings);
            });
        }

        // Reset data button
        const resetBtn = document.getElementById('resetData');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset all monitoring data? This action cannot be undone.')) {
                    localStorage.removeItem('bh_endpoints');
                    localStorage.removeItem('bh_alerts');
                    localStorage.removeItem('bh_logs');
                    localStorage.removeItem('bh_metrics');
                    localStorage.removeItem('bh_settings');
                    App.initData();
                    this.render();
                    alert('All data has been reset successfully.');
                }
            });
        }

        // Export data button
        const exportBtn = document.getElementById('exportData');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                const data = {
                    endpoints: App.getEndpoints(),
                    alerts: App.getAlerts(),
                    logs: App.getLogs(),
                    metrics: App.getMetrics(),
                    settings: App.getSettings(),
                    exportedAt: new Date().toISOString()
                };

                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `bahyam-monitor-export-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
            });
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    SettingsPage.init();
});
