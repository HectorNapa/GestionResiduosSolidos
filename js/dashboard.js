window.dashboardModule = {
    chartInstances: {},

    load() {
        // Determinar qué dashboard cargar según el tipo de usuario
        const currentUser = app.currentUser;
        if (!currentUser) {
            this.loadGenericDashboard();
            return;
        }

        switch (currentUser.type) {
            case 'admin':
                this.loadAdminDashboard();
                break;
            case 'operator':
                this.loadOperatorDashboard();
                break;
            case 'client':
                this.loadClientDashboard();
                break;
            default:
                this.loadGenericDashboard();
        }
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
    },

    // ========= DASHBOARD PARA CLIENTES =========
    async loadClientDashboard() {
        const contentArea = document.getElementById('content-area');
        const currentUser = app.currentUser;
        
        try {
            contentArea.innerHTML = '<div class="p-6 text-center"><i class="fas fa-spinner fa-spin text-3xl text-blue-600"></i><p>Cargando información de cliente...</p></div>';
            await new Promise(resolve => setTimeout(resolve, 100));

            const clientData = this.getClientDashboardData(currentUser);

            contentArea.innerHTML = `
                <div class="mb-6">
                    <h1 class="text-3xl font-bold text-gray-800">Bienvenido, ${currentUser.name}</h1>
                    <p class="text-gray-600">Panel de información de servicios de recolección</p>
                </div>

                <!-- KPIs del Cliente -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    ${this.renderClientKpiCards(clientData.kpis)}
                </div>

                <!-- Información Principal -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <!-- Recolecciones de Hoy -->
                    <div class="bg-white p-6 rounded-lg shadow">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold">Recolecciones de Hoy</h3>
                            <i class="fas fa-truck text-blue-500 text-xl"></i>
                        </div>
                        ${this.renderTodayCollections(clientData.todayCollections)}
                    </div>

                    <!-- Rutas Activas -->
                    <div class="bg-white p-6 rounded-lg shadow">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold">Rutas Activas</h3>
                            <i class="fas fa-route text-green-500 text-xl"></i>
                        </div>
                        ${this.renderActiveRoutes(clientData.activeRoutes)}
                    </div>
                </div>

                <!-- Alertas y Próximos Servicios -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Alertas del Cliente -->
                    <div class="bg-white p-6 rounded-lg shadow">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold">Alertas y Notificaciones</h3>
                            <i class="fas fa-bell text-yellow-500 text-xl"></i>
                        </div>
                        ${this.renderClientAlerts(clientData.alerts)}
                    </div>

                    <!-- Próximos Servicios -->
                    <div class="bg-white p-6 rounded-lg shadow">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold">Próximos Servicios</h3>
                            <i class="fas fa-calendar-alt text-purple-500 text-xl"></i>
                        </div>
                        ${this.renderUpcomingServices(clientData.upcomingServices)}
                    </div>
                </div>
            `;

        } catch (error) {
            console.error('Error loading client dashboard:', error);
            contentArea.innerHTML = `
                <div class="p-6 text-center bg-red-50 text-red-700 rounded-lg">
                    <h3 class="font-bold">Error al Cargar el Dashboard</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    },

    // Datos simulados para el dashboard del cliente
    getClientDashboardData(currentUser) {
        const today = new Date();
        const todayStr = today.toDateString();
        
        return {
            kpis: {
                totalCollections: 15,
                pendingServices: 2,
                completedThisMonth: 8,
                nextCollection: '2 días'
            },
            todayCollections: [
                {
                    id: 1,
                    time: '09:30 AM',
                    type: 'Papel y Cartón',
                    status: 'completado',
                    weight: '45.2 kg',
                    truck: 'ECO-001'
                },
                {
                    id: 2,
                    time: '02:15 PM',
                    type: 'Plásticos',
                    status: 'en_ruta',
                    estimatedTime: '30 min',
                    truck: 'ECO-003'
                }
            ],
            activeRoutes: [
                {
                    id: 'R-2024-001',
                    vehicle: 'ECO-003',
                    driver: 'Carlos Rodríguez',
                    status: 'En camino',
                    estimatedArrival: '14:45',
                    progress: 75
                }
            ],
            alerts: [
                {
                    type: 'info',
                    title: 'Recolección Programada',
                    message: 'Su próxima recolección está programada para mañana a las 9:00 AM',
                    time: '1 hora'
                },
                {
                    type: 'warning',
                    title: 'Factura Pendiente',
                    message: 'Tiene una factura pendiente de pago del mes anterior',
                    time: '2 días'
                }
            ],
            upcomingServices: [
                {
                    date: 'Mañana',
                    time: '09:00 AM',
                    type: 'Recolección Regular',
                    materials: 'Residuos Orgánicos'
                },
                {
                    date: 'Viernes',
                    time: '10:30 AM',
                    type: 'Recolección Especial',
                    materials: 'Materiales Reciclables'
                },
                {
                    date: 'Lunes',
                    time: '08:00 AM',
                    type: 'Recolección Regular',
                    materials: 'Residuos Generales'
                }
            ]
        };
    },

    renderClientKpiCards(kpis) {
        const cards = [
            {
                title: 'Total Recolecciones',
                value: kpis.totalCollections,
                icon: 'fa-recycle',
                color: 'blue',
                subtitle: 'Este mes'
            },
            {
                title: 'Servicios Pendientes',
                value: kpis.pendingServices,
                icon: 'fa-clock',
                color: 'yellow',
                subtitle: 'Por atender'
            },
            {
                title: 'Completadas',
                value: kpis.completedThisMonth,
                icon: 'fa-check-circle',
                color: 'green',
                subtitle: 'Este mes'
            },
            {
                title: 'Próxima Recolección',
                value: kpis.nextCollection,
                icon: 'fa-calendar',
                color: 'purple',
                subtitle: 'Tiempo estimado'
            }
        ];

        return cards.map(card => `
            <div class="bg-white p-6 rounded-lg shadow border-l-4 border-${card.color}-500">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-${card.color}-600 text-sm font-medium">${card.title}</p>
                        <p class="text-2xl font-bold text-gray-900">${card.value}</p>
                        <p class="text-gray-500 text-xs">${card.subtitle}</p>
                    </div>
                    <div class="p-3 bg-${card.color}-100 rounded-full">
                        <i class="fas ${card.icon} text-${card.color}-600 text-xl"></i>
                    </div>
                </div>
            </div>
        `).join('');
    },

    renderTodayCollections(collections) {
        if (!collections || collections.length === 0) {
            return `
                <div class="text-center py-8">
                    <i class="fas fa-truck text-gray-300 text-4xl mb-4"></i>
                    <p class="text-gray-500">No hay recolecciones programadas para hoy</p>
                </div>
            `;
        }

        return `
            <div class="space-y-4">
                ${collections.map(collection => `
                    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div class="flex items-center space-x-4">
                            <div class="p-2 rounded-full ${collection.status === 'completado' ? 'bg-green-100' : 'bg-blue-100'}">
                                <i class="fas ${collection.status === 'completado' ? 'fa-check' : 'fa-truck'} ${collection.status === 'completado' ? 'text-green-600' : 'text-blue-600'}"></i>
                            </div>
                            <div>
                                <p class="font-medium">${collection.type}</p>
                                <p class="text-sm text-gray-500">
                                    ${collection.status === 'completado' ? 
                                        `Completado a las ${collection.time} - ${collection.weight}` : 
                                        `Estimado en ${collection.estimatedTime}`
                                    }
                                </p>
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="px-2 py-1 text-xs rounded-full ${collection.status === 'completado' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}">
                                ${collection.status === 'completado' ? 'Completado' : 'En Ruta'}
                            </span>
                            <p class="text-xs text-gray-500 mt-1">Vehículo: ${collection.truck}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderActiveRoutes(routes) {
        if (!routes || routes.length === 0) {
            return `
                <div class="text-center py-8">
                    <i class="fas fa-route text-gray-300 text-4xl mb-4"></i>
                    <p class="text-gray-500">No hay rutas activas en este momento</p>
                </div>
            `;
        }

        return `
            <div class="space-y-4">
                ${routes.map(route => `
                    <div class="p-4 bg-gray-50 rounded-lg">
                        <div class="flex items-center justify-between mb-3">
                            <div>
                                <p class="font-medium">Ruta ${route.id}</p>
                                <p class="text-sm text-gray-500">Conductor: ${route.driver}</p>
                            </div>
                            <span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                ${route.status}
                            </span>
                        </div>
                        <div class="space-y-2">
                            <div class="flex justify-between text-sm">
                                <span>Vehículo: ${route.vehicle}</span>
                                <span>ETA: ${route.estimatedArrival}</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="bg-green-500 h-2 rounded-full" style="width: ${route.progress}%"></div>
                            </div>
                            <p class="text-xs text-gray-500">Progreso: ${route.progress}%</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderClientAlerts(alerts) {
        if (!alerts || alerts.length === 0) {
            return `
                <div class="text-center py-8">
                    <i class="fas fa-bell-slash text-gray-300 text-4xl mb-4"></i>
                    <p class="text-gray-500">No hay alertas en este momento</p>
                </div>
            `;
        }

        return `
            <div class="space-y-4">
                ${alerts.map(alert => `
                    <div class="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div class="p-2 rounded-full ${alert.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'}">
                            <i class="fas ${alert.type === 'warning' ? 'fa-exclamation-triangle text-yellow-600' : 'fa-info-circle text-blue-600'}"></i>
                        </div>
                        <div class="flex-1">
                            <p class="font-medium">${alert.title}</p>
                            <p class="text-sm text-gray-600">${alert.message}</p>
                            <p class="text-xs text-gray-500 mt-1">Hace ${alert.time}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderUpcomingServices(services) {
        if (!services || services.length === 0) {
            return `
                <div class="text-center py-8">
                    <i class="fas fa-calendar-times text-gray-300 text-4xl mb-4"></i>
                    <p class="text-gray-500">No hay servicios programados</p>
                </div>
            `;
        }

        return `
            <div class="space-y-4">
                ${services.map(service => `
                    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div class="flex items-center space-x-4">
                            <div class="p-2 bg-purple-100 rounded-full">
                                <i class="fas fa-calendar text-purple-600"></i>
                            </div>
                            <div>
                                <p class="font-medium">${service.type}</p>
                                <p class="text-sm text-gray-500">${service.materials}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="font-medium">${service.date}</p>
                            <p class="text-sm text-gray-500">${service.time}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // Dashboard completo para operadores
    async loadOperatorDashboard() {
        const contentArea = document.getElementById('content-area');
        const currentUser = app.currentUser;
        
        try {
            contentArea.innerHTML = '<div class="p-6 text-center"><i class="fas fa-spinner fa-spin text-3xl text-blue-600"></i><p>Cargando panel operativo...</p></div>';
            await new Promise(resolve => setTimeout(resolve, 100));

            const operatorData = this.getOperatorDashboardData(currentUser);

            contentArea.innerHTML = `
                <div class="mb-6">
                    <div class="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 class="text-3xl font-bold text-gray-800">Dashboard Operativo</h1>
                            <p class="text-gray-600">Bienvenido, ${currentUser.name} - Panel de trabajo de campo</p>
                        </div>
                        <div class="mt-4 md:mt-0 flex items-center space-x-3">
                            <span class="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                                <i class="fas fa-circle text-xs mr-1"></i>En Servicio
                            </span>
                            <button id="refresh-dashboard" onclick="dashboardModule.loadOperatorDashboard()" 
                                    class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                                <i class="fas fa-sync-alt mr-2"></i>Actualizar
                            </button>
                        </div>
                    </div>
                </div>

                <!-- KPIs del Operador -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    ${this.renderOperatorKpiCards(operatorData.kpis)}
                </div>

                <!-- Información Principal -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <!-- Ruta Activa -->
                    <div class="lg:col-span-2 bg-white rounded-lg shadow">
                        <div class="p-6 border-b">
                            <div class="flex items-center justify-between">
                                <h3 class="text-lg font-semibold">Mi Ruta Activa</h3>
                                <i class="fas fa-route text-blue-500 text-xl"></i>
                            </div>
                        </div>
                        <div class="p-6">
                            ${this.renderActiveRoute(operatorData.activeRoute)}
                        </div>
                    </div>

                    <!-- Próximas Tareas -->
                    <div class="bg-white rounded-lg shadow">
                        <div class="p-6 border-b">
                            <div class="flex items-center justify-between">
                                <h3 class="text-lg font-semibold">Próximas Tareas</h3>
                                <i class="fas fa-tasks text-green-500 text-xl"></i>
                            </div>
                        </div>
                        <div class="p-6">
                            ${this.renderUpcomingTasks(operatorData.upcomingTasks)}
                        </div>
                    </div>
                </div>

                <!-- Sección inferior -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Recolecciones Recientes -->
                    <div class="bg-white rounded-lg shadow">
                        <div class="p-6 border-b">
                            <div class="flex items-center justify-between">
                                <h3 class="text-lg font-semibold">Recolecciones Recientes</h3>
                                <i class="fas fa-clipboard-check text-purple-500 text-xl"></i>
                            </div>
                        </div>
                        <div class="p-6">
                            ${this.renderRecentCollections(operatorData.recentCollections)}
                        </div>
                    </div>

                    <!-- Alertas y Notificaciones -->
                    <div class="bg-white rounded-lg shadow">
                        <div class="p-6 border-b">
                            <div class="flex items-center justify-between">
                                <h3 class="text-lg font-semibold">Alertas Operativas</h3>
                                <i class="fas fa-exclamation-triangle text-yellow-500 text-xl"></i>
                            </div>
                        </div>
                        <div class="p-6">
                            ${this.renderOperatorAlerts(operatorData.alerts)}
                        </div>
                    </div>
                </div>
            `;

        } catch (error) {
            console.error('Error loading operator dashboard:', error);
            contentArea.innerHTML = `
                <div class="p-6 text-center bg-red-50 text-red-700 rounded-lg">
                    <h3 class="font-bold">Error al Cargar el Dashboard</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    },

    // ========= FUNCIONES ESPECÍFICAS PARA EL DASHBOARD DEL OPERADOR =========

    getOperatorDashboardData(currentUser) {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        // Simular datos del operador basados en el contexto del proyecto
        return {
            kpis: {
                routesAssigned: 2,
                collectionsCompleted: 5,
                collectionsPending: 3,
                kilometersToday: 45.2,
                averageTimePerCollection: 35,
                totalWeightCollected: 1250
            },
            activeRoute: {
                id: 'R-2024-015',
                name: 'Ruta Norte - Zona Industrial',
                status: 'En Progreso',
                progress: 60,
                currentStop: 3,
                totalStops: 5,
                estimatedCompletion: '16:30',
                nextClient: 'Industrias ABC',
                nextAddress: 'Carrera 15 #45-30, Zona Industrial',
                distanceToNext: 2.3
            },
            upcomingTasks: [
                {
                    time: '14:30',
                    client: 'Industrias ABC',
                    type: 'Reciclables',
                    priority: 'Alta',
                    estimatedWeight: '300 kg'
                },
                {
                    time: '15:15',
                    client: 'Empresa XYZ',
                    type: 'Orgánicos',
                    priority: 'Media',
                    estimatedWeight: '150 kg'
                },
                {
                    time: '16:00',
                    client: 'Centro Comercial',
                    type: 'Mixtos',
                    priority: 'Media',
                    estimatedWeight: '450 kg'
                }
            ],
            recentCollections: [
                {
                    time: '13:45',
                    client: 'Restaurante El Buen Sabor',
                    type: 'Orgánicos',
                    weight: '85 kg',
                    status: 'Completado'
                },
                {
                    time: '12:30',
                    client: 'Oficinas Torres',
                    type: 'Papel',
                    weight: '120 kg',
                    status: 'Completado'
                },
                {
                    time: '11:15',
                    client: 'Supermercado La Economía',
                    type: 'Mixtos',
                    weight: '280 kg',
                    status: 'Completado'
                }
            ],
            alerts: [
                {
                    type: 'warning',
                    message: 'Vehículo ECO-003 requiere mantenimiento en 500 km',
                    time: '30 min'
                },
                {
                    type: 'info',
                    message: 'Nueva ruta asignada para mañana 08:00 AM',
                    time: '1 hora'
                },
                {
                    type: 'success',
                    message: 'Meta diaria de recolección alcanzada',
                    time: '2 horas'
                }
            ]
        };
    },

    renderOperatorKpiCards(kpis) {
        const cards = [
            {
                title: 'Rutas Asignadas',
                value: kpis.routesAssigned,
                subtitle: 'Hoy',
                icon: 'fa-route',
                color: 'blue',
                trend: null
            },
            {
                title: 'Recolecciones',
                value: `${kpis.collectionsCompleted}/${kpis.collectionsCompleted + kpis.collectionsPending}`,
                subtitle: 'Completadas/Total',
                icon: 'fa-clipboard-check',
                color: 'green',
                trend: 'up'
            },
            {
                title: 'Kilómetros',
                value: `${kpis.kilometersToday} km`,
                subtitle: 'Recorridos hoy',
                icon: 'fa-road',
                color: 'purple',
                trend: null
            },
            {
                title: 'Peso Total',
                value: `${(kpis.totalWeightCollected / 1000).toFixed(1)} Ton`,
                subtitle: 'Recolectado hoy',
                icon: 'fa-weight-hanging',
                color: 'yellow',
                trend: 'up'
            }
        ];

        return cards.map(card => `
            <div class="bg-white p-6 rounded-lg shadow border-l-4 border-${card.color}-500">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-${card.color}-600 text-sm font-medium">${card.title}</p>
                        <p class="text-2xl font-bold text-gray-900">${card.value}</p>
                        <div class="flex items-center mt-1">
                            <p class="text-gray-500 text-xs">${card.subtitle}</p>
                            ${card.trend ? `
                                <i class="fas fa-arrow-${card.trend} text-${card.trend === 'up' ? 'green' : 'red'}-500 text-xs ml-2"></i>
                            ` : ''}
                        </div>
                    </div>
                    <div class="p-3 bg-${card.color}-100 rounded-full">
                        <i class="fas ${card.icon} text-${card.color}-600 text-xl"></i>
                    </div>
                </div>
            </div>
        `).join('');
    },

    renderActiveRoute(route) {
        if (!route) {
            return `
                <div class="text-center py-8">
                    <i class="fas fa-route text-gray-300 text-4xl mb-4"></i>
                    <p class="text-gray-500">No hay rutas activas en este momento</p>
                    <button onclick="app.loadModule('routes')" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        Ver Mis Rutas
                    </button>
                </div>
            `;
        }

        return `
            <div class="space-y-4">
                <!-- Información de la ruta -->
                <div class="flex items-center justify-between">
                    <div>
                        <h4 class="font-semibold text-lg">${route.name}</h4>
                        <p class="text-sm text-gray-600">ID: ${route.id}</p>
                    </div>
                    <span class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        ${route.status}
                    </span>
                </div>

                <!-- Progreso de la ruta -->
                <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                        <span>Progreso de ruta</span>
                        <span>${route.progress}% - Parada ${route.currentStop}/${route.totalStops}</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-blue-500 h-2 rounded-full transition-all duration-300" style="width: ${route.progress}%"></div>
                    </div>
                </div>

                <!-- Próxima parada -->
                <div class="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg">
                    <div class="flex items-center justify-between mb-2">
                        <h5 class="font-medium text-gray-900">Próxima Parada</h5>
                        <span class="text-sm text-blue-600 font-medium">${route.distanceToNext} km</span>
                    </div>
                    <p class="font-semibold">${route.nextClient}</p>
                    <p class="text-sm text-gray-600">${route.nextAddress}</p>
                    <div class="flex justify-between items-center mt-3">
                        <span class="text-sm text-gray-500">Completar antes de: ${route.estimatedCompletion}</span>
                        <button onclick="dashboardModule.navigateToNext('${route.id}')" 
                                class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                            <i class="fas fa-directions mr-1"></i>Navegar
                        </button>
                    </div>
                </div>

                <!-- Acciones rápidas -->
                <div class="flex space-x-3">
                    <button onclick="app.loadModule('collection')" 
                            class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        <i class="fas fa-truck mr-2"></i>Ir a Recolección
                    </button>
                    <button onclick="app.loadModule('routes')" 
                            class="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                        <i class="fas fa-list mr-2"></i>Ver Detalles
                    </button>
                </div>
            </div>
        `;
    },

    renderUpcomingTasks(tasks) {
        if (!tasks || tasks.length === 0) {
            return `
                <div class="text-center py-8">
                    <i class="fas fa-calendar-check text-gray-300 text-4xl mb-4"></i>
                    <p class="text-gray-500">No hay tareas pendientes</p>
                </div>
            `;
        }

        return `
            <div class="space-y-4">
                ${tasks.map(task => `
                    <div class="border-l-4 border-${this.getPriorityColor(task.priority)}-500 pl-4 py-2">
                        <div class="flex justify-between items-start">
                            <div>
                                <p class="font-medium">${task.client}</p>
                                <p class="text-sm text-gray-600">${task.type} - ${task.estimatedWeight}</p>
                            </div>
                            <div class="text-right">
                                <span class="text-sm font-medium">${task.time}</span>
                                <br>
                                <span class="px-2 py-1 text-xs rounded-full bg-${this.getPriorityColor(task.priority)}-100 text-${this.getPriorityColor(task.priority)}-800">
                                    ${task.priority}
                                </span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderRecentCollections(collections) {
        if (!collections || collections.length === 0) {
            return `
                <div class="text-center py-8">
                    <i class="fas fa-clipboard-list text-gray-300 text-4xl mb-4"></i>
                    <p class="text-gray-500">No hay recolecciones recientes</p>
                </div>
            `;
        }

        return `
            <div class="space-y-4">
                ${collections.map(collection => `
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div class="flex items-center space-x-3">
                            <div class="p-2 bg-green-100 rounded-full">
                                <i class="fas fa-check text-green-600"></i>
                            </div>
                            <div>
                                <p class="font-medium">${collection.client}</p>
                                <p class="text-sm text-gray-600">${collection.type} - ${collection.weight}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-sm font-medium">${collection.time}</p>
                            <span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                ${collection.status}
                            </span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderOperatorAlerts(alerts) {
        if (!alerts || alerts.length === 0) {
            return `
                <div class="text-center py-8">
                    <i class="fas fa-bell-slash text-gray-300 text-4xl mb-4"></i>
                    <p class="text-gray-500">No hay alertas en este momento</p>
                </div>
            `;
        }

        return `
            <div class="space-y-4">
                ${alerts.map(alert => `
                    <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div class="p-2 rounded-full ${this.getAlertTypeColor(alert.type)}">
                            <i class="fas ${this.getAlertIcon(alert.type)} text-sm"></i>
                        </div>
                        <div class="flex-1">
                            <p class="text-sm font-medium">${alert.message}</p>
                            <p class="text-xs text-gray-500 mt-1">Hace ${alert.time}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // Funciones auxiliares
    getPriorityColor(priority) {
        const colors = {
            'Alta': 'red',
            'Media': 'yellow',
            'Baja': 'green'
        };
        return colors[priority] || 'gray';
    },

    getAlertTypeColor(type) {
        const colors = {
            'warning': 'bg-yellow-100',
            'info': 'bg-blue-100',
            'success': 'bg-green-100',
            'error': 'bg-red-100'
        };
        return colors[type] || 'bg-gray-100';
    },

    getAlertIcon(type) {
        const icons = {
            'warning': 'fa-exclamation-triangle text-yellow-600',
            'info': 'fa-info-circle text-blue-600',
            'success': 'fa-check-circle text-green-600',
            'error': 'fa-times-circle text-red-600'
        };
        return icons[type] || 'fa-bell text-gray-600';
    },

    // Funciones de acción
    navigateToNext(routeId) {
        authSystem?.showNotification?.('Abriendo navegación GPS...', 'info');
        // Aquí se podría integrar con Google Maps, Waze, etc.
    },

    loadGenericDashboard() {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-tachometer-alt text-6xl text-gray-400 mb-4"></i>
                <h2 class="text-2xl font-bold text-gray-800 mb-2">Dashboard</h2>
                <p class="text-gray-600">Bienvenido al sistema de gestión de residuos</p>
            </div>
        `;
    }
};