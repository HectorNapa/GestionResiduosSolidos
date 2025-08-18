window.dashboardModule = {
    chartInstances: {},

    load() {
        this.loadAdminDashboard();
    },

    async loadAdminDashboard() {
        const contentArea = document.getElementById('content-area');
        try {
            contentArea.innerHTML = '<div class="p-6 text-center"><i class="fas fa-spinner fa-spin text-3xl text-blue-600"></i><p>Cargando datos del dashboard...</p></div>';
            await new Promise(resolve => setTimeout(resolve, 100));

            const data = this.getAdminDashboardData();

            contentArea.innerHTML = `
                <div class="mb-6">
                    <h1 class="text-3xl font-bold text-gray-800">Dashboard Administrativo</h1>
                    <p class="text-gray-600">Panel de control del sistema de gestión de residuos</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">${this.renderKpiCards(data.kpis)}</div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div class="bg-white p-6 rounded-lg shadow h-96"><h3 class="text-lg font-semibold mb-4">Recolecciones por Tipo de Residuo (Ton)</h3><div id="wasteTypeChartContainer"><canvas id="wasteTypeChart"></canvas></div></div>
                    <div class="bg-white p-6 rounded-lg shadow h-96"><h3 class="text-lg font-semibold mb-4">Recolección de la Última Semana (Ton)</h3><div id="dailyTrendChartContainer"><canvas id="dailyTrendChart"></canvas></div></div>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="bg-white p-6 rounded-lg shadow"><h3 class="text-lg font-semibold mb-4">Actividades Recientes</h3>${this.renderActivityFeed(data.activity)}</div>
                    <div class="bg-white p-6 rounded-lg shadow"><h3 class="text-lg font-semibold mb-4">Alertas del Sistema</h3>${this.renderAlerts(data.alerts)}</div>
                </div>
            `;

            this.initCharts(data.charts);
        } catch (error) {
            console.error('Error loading admin dashboard:', error);
            contentArea.innerHTML = `<div class="p-6 text-center bg-red-50 text-red-700 rounded-lg"><h3 class="font-bold">Error al Cargar el Dashboard</h3><p>${error.message}</p></div>`;
        }
    },

    renderKpiCards(kpis) {
        const kpiData = [
            { title: 'Recolecciones Hoy', value: kpis.collectionsToday, icon: 'fa-truck', color: 'from-blue-500 to-blue-600' },
            { title: 'Procesado Hoy', value: `${kpis.processedToday.toFixed(2)} <span class="text-lg">Ton</span>`, icon: 'fa-recycle', color: 'from-green-500 to-green-600' },
            { title: 'Rutas Activas', value: kpis.activeRoutes, icon: 'fa-route', color: 'from-yellow-500 to-yellow-600' },
            { title: 'Alertas Activas', value: kpis.activeAlerts, icon: 'fa-exclamation-triangle', color: 'from-purple-500 to-purple-600' }
        ];

        return kpiData.map(kpi => `
            <div class="bg-gradient-to-r ${kpi.color} p-6 rounded-lg text-white"><div class="flex items-center justify-between">
                <div>
                    <p class="text-sm">${kpi.title}</p>
                    <p class="text-3xl font-bold">${kpi.value}</p>
                </div>
                <i class="fas ${kpi.icon} text-4xl opacity-75"></i>
            </div></div>
        `).join('');
    },

    renderActivityFeed(activities) {
        if (activities.length === 0) return '<p class="text-sm text-gray-500">No hay actividad reciente.</p>';
        const iconMap = { route: 'fa-route', collection: 'fa-clipboard-check', manifest: 'fa-file-alt', plant: 'fa-industry' };
        const colorMap = { route: 'text-blue-500', collection: 'text-green-500', manifest: 'text-purple-500', plant: 'text-yellow-500' };
        return `<div class="space-y-4">${activities.map(act => `
            <div class="flex items-center"><div class="w-10 text-center"><i class="fas ${iconMap[act.type] || 'fa-info-circle'} ${colorMap[act.type] || 'text-gray-500'}"></i></div>
                <div class="ml-3"><p class="text-sm font-medium">${act.text}</p><p class="text-xs text-gray-500">${this.timeAgo(act.timestamp)}</p></div>
            </div>`).join('')}
        </div>`;
    },

    renderAlerts(alerts) {
        if (alerts.length === 0) return '<p class="text-sm text-gray-500">No hay alertas en el sistema.</p>';
        const iconMap = { high: 'fa-exclamation-triangle', medium: 'fa-clock', low: 'fa-info-circle' };
        const colorMap = { high: 'text-red-500', medium: 'text-yellow-500', low: 'text-blue-500' };
        const borderMap = { high: 'border-red-500', medium: 'border-yellow-500', low: 'border-blue-500' };
        return `<div class="space-y-4">${alerts.map(alert => `
            <div class="flex items-center p-3 bg-gray-50 rounded-lg border-l-4 ${borderMap[alert.priority]}">
                <i class="fas ${iconMap[alert.priority]} ${colorMap[alert.priority]} mr-3"></i>
                <div><p class="text-sm font-medium">${alert.text}</p></div>
            </div>`).join('')}
        </div>`;
    },

    getAdminDashboardData() {
        const todayStr = new Date().toISOString().slice(0, 10);
        const collections = window.collectionModule?.collections || [];
        const routes = window.routesModule?.routes || [];
        const plantReceptions = window.plantModule?.receptions || [];
        const vehicles = window.routesModule?.vehicles || [];

        const alerts = this.getSystemAlerts(vehicles, plantReceptions);
        const kpis = {
            collectionsToday: collections.filter(c => c.collectionDate === todayStr).length,
            processedToday: plantReceptions.filter(p => p.arrivalDate === todayStr).reduce((sum, p) => sum + parseFloat(p.totalWeight || 0), 0),
            activeRoutes: routes.filter(r => r.status === 'En Progreso').length,
            activeAlerts: alerts.length
        };

        const charts = {
            wasteTypes: this.getWasteTypeChartData(plantReceptions),
            dailyTrend: this.getDailyTrendChartData(collections)
        };

        const activity = this.getRecentActivity(routes, collections, plantReceptions).slice(0, 4);

        return { kpis, charts, activity, alerts };
    },

    getWasteTypeChartData(receptions) {
        const summary = (receptions || []).reduce((acc, curr) => {
            (curr.classifications || []).forEach(c => {
                acc[c.type] = (acc[c.type] || 0) + parseFloat(c.weight || 0);
            });
            return acc;
        }, {});
        return { labels: Object.keys(summary), data: Object.values(summary) };
    },

    getDailyTrendChartData(collections) {
        const trend = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dayStr = d.toLocaleDateString('es-ES', { weekday: 'short' });
            trend[dayStr] = 0;
        }
        (collections || []).forEach(c => {
            const collectionDate = new Date(c.collectionDate);
            const today = new Date();
            const diffDays = Math.round((today - collectionDate) / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays < 7) {
                const dayStr = collectionDate.toLocaleDateString('es-ES', { weekday: 'short' });
                if (trend.hasOwnProperty(dayStr)) {
                    trend[dayStr] += parseFloat(c.weight || 0);
                }
            }
        });
        return { labels: Object.keys(trend), data: Object.values(trend) };
    },

    getRecentActivity(routes, collections, receptions) {
        let activities = [];
        (routes || []).forEach(r => { if(r.status === 'Completada') activities.push({ type: 'route', text: `Ruta ${r.name} completada`, timestamp: new Date() }); });
        (collections || []).forEach(c => activities.push({ type: 'collection', text: `Recolección en ${c.clientName}`, timestamp: new Date(c.collectionDate) }));
        (receptions || []).forEach(p => activities.push({ type: 'plant', text: `Recepción de manifiesto ${p.manifestNumber}`, timestamp: new Date(p.arrivalDate) }));
        return activities.sort((a, b) => b.timestamp - a.timestamp);
    },

    getSystemAlerts(vehicles, receptions) {
        let alerts = [];
        (vehicles || []).forEach(v => { if(v.status === 'Mantenimiento') alerts.push({ text: `Vehículo ${v.code} en mantenimiento`, priority: 'high' }); });
        const plantCapacity = window.plantModule?.processingCapacity?.current || 0;
        if (plantCapacity > 90) alerts.push({ text: `Capacidad de planta al ${plantCapacity}%`, priority: 'high' });
        else if (plantCapacity > 75) alerts.push({ text: `Capacidad de planta al ${plantCapacity}%`, priority: 'medium' });
        return alerts;
    },

    initCharts(chartData) {
        this.destroyExistingCharts();
        if (typeof Chart === 'undefined') {
            document.getElementById('wasteTypeChartContainer').innerHTML = '<p class="text-center text-red-500 p-4">(Error: Librería Chart.js no cargada)</p>';
            document.getElementById('dailyTrendChartContainer').innerHTML = '<p class="text-center text-red-500 p-4">(Error: Librería Chart.js no cargada)</p>';
            return;
        }

        const wasteTypeCtx = document.getElementById('wasteTypeChart');
        if (wasteTypeCtx && chartData.wasteTypes.labels.length > 0) {
            this.chartInstances.wasteType = new Chart(wasteTypeCtx, {
                type: 'doughnut',
                data: { labels: chartData.wasteTypes.labels, datasets: [{ data: chartData.wasteTypes.data, backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#6366F1'] }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
            });
        } else if (wasteTypeCtx) {
            wasteTypeCtx.parentElement.innerHTML = '<div class="flex items-center justify-center h-full"><p class="text-center text-gray-500">No hay datos de clasificación para mostrar.</p></div>';
        }

        const dailyTrendCtx = document.getElementById('dailyTrendChart');
        if (dailyTrendCtx && chartData.dailyTrend.data.some(d => d > 0)) {
            this.chartInstances.dailyTrend = new Chart(dailyTrendCtx, {
                type: 'line',
                data: { labels: chartData.dailyTrend.labels, datasets: [{ label: 'Toneladas', data: chartData.dailyTrend.data, borderColor: '#3B82F6', tension: 0.1, fill: true }] },
                options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
            });
        } else if (dailyTrendCtx) {
            dailyTrendCtx.parentElement.innerHTML = '<div class="flex items-center justify-center h-full"><p class="text-center text-gray-500">No hay datos de recolección en la última semana.</p></div>';
        }
    },

    destroyExistingCharts() {
        Object.values(this.chartInstances).forEach(chart => chart?.destroy());
        this.chartInstances = {};
    },

    timeAgo(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 0) return 'en el futuro';
        let interval = seconds / 31536000;
        if (interval > 1) return `hace ${Math.floor(interval)} años`;
        interval = seconds / 2592000;
        if (interval > 1) return `hace ${Math.floor(interval)} meses`;
        interval = seconds / 86400;
        if (interval > 1) return `hace ${Math.floor(interval)} días`;
        interval = seconds / 3600;
        if (interval > 1) return `hace ${Math.floor(interval)} horas`;
        interval = seconds / 60;
        if (interval > 1) return `hace ${Math.floor(interval)} minutos`;
        return `hace ${Math.floor(seconds)} segundos`;
    }
};