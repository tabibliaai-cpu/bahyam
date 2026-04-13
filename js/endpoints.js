/* ============================================
   Endpoints Page
   ============================================ */

const EndpointsPage = {
    filter: 'all',
    searchQuery: '',

    init() {
        this.render();
        this.bindEvents();
    },

    render() {
        this.renderTable();
    },

    getFilteredEndpoints() {
        let endpoints = App.getEndpoints();

        if (this.filter !== 'all') {
            endpoints = endpoints.filter(e => e.status === this.filter);
        }

        if (this.searchQuery) {
            const q = this.searchQuery.toLowerCase();
            endpoints = endpoints.filter(e =>
                e.name.toLowerCase().includes(q) ||
                e.url.toLowerCase().includes(q) ||
                e.method.toLowerCase().includes(q)
            );
        }

        return endpoints;
    },

    renderTable() {
        const tbody = document.getElementById('endpointsTableBody');
        if (!tbody) return;

        const endpoints = this.getFilteredEndpoints();

        if (endpoints.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7">
                        <div class="empty-state">
                            <i class="fa-regular fa-folder-open"></i>
                            <div class="empty-state-title">No endpoints found</div>
                            <div class="empty-state-desc">Try adjusting your filters or add a new endpoint.</div>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = endpoints.map(ep => {
            const rtClass = ep.status === 'down' ? 'slow' : ep.avgResponseTime < 200 ? 'fast' : ep.avgResponseTime < 500 ? 'medium' : 'slow';
            return `
                <tr>
                    <td><span class="method-badge ${ep.method.toLowerCase()}">${ep.method}</span></td>
                    <td>
                        <div style="font-weight:600;margin-bottom:2px;">${ep.name}</div>
                        <div class="endpoint-url">${ep.url}</div>
                    </td>
                    <td><span class="status-dot ${ep.status}">${ep.status.charAt(0).toUpperCase() + ep.status.slice(1)}</span></td>
                    <td><span class="response-time ${rtClass}">${ep.status === 'down' ? 'Timeout' : ep.avgResponseTime + 'ms'}</span></td>
                    <td style="font-weight:600;">${ep.uptime}%</td>
                    <td style="font-size:0.78rem;color:var(--text-muted);">${App.timeAgo(ep.lastChecked)}</td>
                    <td>
                        <div style="display:flex;gap:6px;">
                            <button class="btn-icon" onclick="EndpointsPage.checkEndpoint(${ep.id})" title="Check Now">
                                <i class="fa-solid fa-rotate"></i>
                            </button>
                            <button class="btn-icon" onclick="EndpointsPage.deleteEndpoint(${ep.id})" title="Delete">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // Update counts
        const all = App.getEndpoints();
        document.getElementById('countAll').textContent = all.length;
        document.getElementById('countUp').textContent = all.filter(e => e.status === 'up').length;
        document.getElementById('countDegraded').textContent = all.filter(e => e.status === 'degraded').length;
        document.getElementById('countDown').textContent = all.filter(e => e.status === 'down').length;
    },

    bindEvents() {
        // Filter chips
        document.querySelectorAll('[data-filter]').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('[data-filter]').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.filter = chip.dataset.filter;
                this.renderTable();
            });
        });

        // Search
        const searchInput = document.getElementById('endpointSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.renderTable();
            });
        }

        // Add endpoint button
        const addBtn = document.getElementById('addEndpointBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openModal());
        }

        // Modal close
        const modal = document.getElementById('addEndpointModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeModal();
            });
        }

        const closeBtn = document.getElementById('closeModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        // Form submit
        const form = document.getElementById('addEndpointForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addEndpoint();
            });
        }
    },

    openModal() {
        const modal = document.getElementById('addEndpointModal');
        if (modal) modal.classList.add('active');
    },

    closeModal() {
        const modal = document.getElementById('addEndpointModal');
        if (modal) modal.classList.remove('active');
    },

    addEndpoint() {
        const name = document.getElementById('epName').value.trim();
        const url = document.getElementById('epUrl').value.trim();
        const method = document.getElementById('epMethod').value;

        if (!name || !url) return;

        const endpoints = App.getEndpoints();
        const newId = endpoints.length > 0 ? Math.max(...endpoints.map(e => e.id)) + 1 : 1;

        endpoints.push({
            id: newId,
            name,
            url,
            method,
            status: 'up',
            avgResponseTime: Math.floor(Math.random() * 200) + 50,
            uptime: 100.0,
            lastChecked: Date.now()
        });

        App.saveEndpoints(endpoints);
        this.closeModal();
        this.renderTable();
        document.getElementById('addEndpointForm').reset();
    },

    checkEndpoint(id) {
        const endpoints = App.getEndpoints();
        const ep = endpoints.find(e => e.id === id);
        if (!ep) return;

        // Simulate checking
        ep.avgResponseTime = Math.floor(Math.random() * 500) + 20;
        ep.lastChecked = Date.now();
        ep.status = Math.random() > 0.1 ? 'up' : 'degraded';

        App.saveEndpoints(endpoints);
        this.renderTable();
    },

    deleteEndpoint(id) {
        let endpoints = App.getEndpoints();
        endpoints = endpoints.filter(e => e.id !== id);
        App.saveEndpoints(endpoints);
        this.renderTable();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    EndpointsPage.init();
});
