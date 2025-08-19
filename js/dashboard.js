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
                <!-- Encabezado con información de tiempo real -->
                <div class="mb-8">
                    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h1 class="text-3xl font-bold text-gray-800">Dashboard Administrativo</h1>
                            <p class="text-gray-600 mt-1">Panel de control del sistema de gestión de residuos</p>
                            <div class="flex items-center mt-2 text-sm text-gray-500">
                                <i class="fas fa-clock mr-2"></i>
                                <span>Última actualización: ${new Date().toLocaleString('es-ES')}</span>
                                <span class="ml-4 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                    <i class="fas fa-circle text-xs mr-1"></i>Sistema Operativo
                                </span>
                            </div>
                        </div>
                        <div class="mt-4 lg:mt-0 flex items-center space-x-3">
                            <button onclick="dashboardModule.exportDashboard()" class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200">
                                <i class="fas fa-download mr-2"></i>Exportar
                            </button>
                            <button onclick="dashboardModule.loadAdminDashboard()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200">
                                <i class="fas fa-sync-alt mr-2"></i>Actualizar
                            </button>
                        </div>
                    </div>
                </div>

                <!-- KPIs principales -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    ${this.renderEnhancedKpiCards(data.kpis)}
                </div>

                <!-- Resumen operacional -->
                <div class="bg-white rounded-lg shadow p-6 mb-8">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-lg font-semibold text-gray-900">Resumen Operacional de Hoy</h3>
                        <div class="flex items-center space-x-2">
                            <span class="text-sm text-gray-500">Estado del día:</span>
                            <span class="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Normal</span>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        ${this.renderOperationalSummary(data.operational)}
                    </div>
                </div>

                <!-- Gráficos y análisis -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div class="bg-white p-6 rounded-lg shadow">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold">Recolecciones por Tipo de Residuo</h3>
                            <div class="flex items-center space-x-2">
                                <select class="text-sm border rounded px-2 py-1">
                                    <option>Última semana</option>
                                    <option>Último mes</option>
                                    <option>Último trimestre</option>
                                </select>
                            </div>
                        </div>
                        <div class="h-80" id="wasteTypeChartContainer">
                            <canvas id="wasteTypeChart"></canvas>
                        </div>
                    </div>
                    <div class="bg-white p-6 rounded-lg shadow">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold">Tendencia de Recolección</h3>
                            <div class="flex items-center space-x-2">
                                <i class="fas fa-chart-line text-blue-500"></i>
                                <span class="text-sm text-gray-500">Últimos 7 días</span>
                            </div>
                        </div>
                        <div class="h-80" id="dailyTrendChartContainer">
                            <canvas id="dailyTrendChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Panel de control operativo -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <!-- Estado de vehículos -->
                    <div class="bg-white rounded-lg shadow">
                        <div class="p-6 border-b border-gray-200">
                            <div class="flex items-center justify-between">
                                <h3 class="text-lg font-semibold">Estado de Vehículos</h3>
                                <i class="fas fa-truck text-blue-500 text-xl"></i>
                            </div>
                        </div>
                        <div class="p-6">
                            ${this.renderVehicleStatus(data.vehicles)}
                        </div>
                    </div>

                    <!-- Personal en campo -->
                    <div class="bg-white rounded-lg shadow">
                        <div class="p-6 border-b border-gray-200">
                            <div class="flex items-center justify-between">
                                <h3 class="text-lg font-semibold">Personal en Campo</h3>
                                <i class="fas fa-users text-green-500 text-xl"></i>
                            </div>
                        </div>
                        <div class="p-6">
                            ${this.renderFieldStaff(data.staff)}
                        </div>
                    </div>

                    <!-- Rendimiento de rutas -->
                    <div class="bg-white rounded-lg shadow">
                        <div class="p-6 border-b border-gray-200">
                            <div class="flex items-center justify-between">
                                <h3 class="text-lg font-semibold">Rendimiento de Rutas</h3>
                                <i class="fas fa-route text-purple-500 text-xl"></i>
                            </div>
                        </div>
                        <div class="p-6">
                            ${this.renderRoutePerformance(data.routes)}
                        </div>
                    </div>
                </div>

                <!-- Sección inferior: Actividades y alertas -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Feed de actividades -->
                    <div class="bg-white rounded-lg shadow">
                        <div class="p-6 border-b border-gray-200">
                            <div class="flex items-center justify-between">
                                <h3 class="text-lg font-semibold">Actividades Recientes</h3>
                                <button onclick="app.loadModule('reports')" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                    Ver todas
                                </button>
                            </div>
                        </div>
                        <div class="p-6">
                            ${this.renderEnhancedActivityFeed(data.activity)}
                        </div>
                    </div>

                    <!-- Centro de alertas -->
                    <div class="bg-white rounded-lg shadow">
                        <div class="p-6 border-b border-gray-200">
                            <div class="flex items-center justify-between">
                                <h3 class="text-lg font-semibold">Centro de Alertas</h3>
                                <div class="flex items-center space-x-2">
                                    <span class="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                        ${data.alerts.filter(a => a.priority === 'high').length} Alta
                                    </span>
                                    <span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                        ${data.alerts.filter(a => a.priority === 'medium').length} Media
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="p-6">
                            ${this.renderEnhancedAlerts(data.alerts)}
                        </div>
                    </div>
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
        const users = window.authSystem?.getAllUsers() || [];

        const alerts = this.getSystemAlerts(vehicles, plantReceptions);
        const kpis = {
            collectionsToday: collections.filter(c => c.collectionDate === todayStr).length,
            processedToday: plantReceptions.filter(p => p.arrivalDate === todayStr).reduce((sum, p) => sum + parseFloat(p.totalWeight || 0), 0),
            activeRoutes: routes.filter(r => r.status === 'En Progreso').length,
            activeAlerts: alerts.length,
            totalRevenue: 125340.50,
            efficiency: 94.2,
            completionRate: 98.5,
            customerSatisfaction: 4.7
        };

        const operational = {
            routesCompleted: routes.filter(r => r.status === 'Completada').length,
            routesInProgress: routes.filter(r => r.status === 'En Progreso').length,
            routesPending: routes.filter(r => r.status === 'Programada').length,
            totalVolume: collections.reduce((sum, c) => sum + parseFloat(c.weight || 0), 0),
            averageTime: 45.3,
            fuelConsumption: 234.5,
            maintenanceAlerts: vehicles.filter(v => v.status === 'Mantenimiento').length,
            operatorsActive: users.filter(u => u.type === 'operator' && u.status === 'Activo').length
        };

        const vehicleData = this.getVehicleStatusData(vehicles);
        const staffData = this.getFieldStaffData(users);
        const routePerformance = this.getRoutePerformanceData(routes);

        const charts = {
            wasteTypes: this.getWasteTypeChartData(plantReceptions),
            dailyTrend: this.getDailyTrendChartData(collections)
        };

        const activity = this.getRecentActivity(routes, collections, plantReceptions).slice(0, 6);

        return { 
            kpis, 
            operational, 
            vehicles: vehicleData, 
            staff: staffData, 
            routes: routePerformance, 
            charts, 
            activity, 
            alerts 
        };
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
                <!-- Encabezado de Bienvenida -->
                <div class="bg-gradient-to-r from-green-500 to-blue-600 text-white p-8 rounded-lg mb-8">
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-3xl font-bold">¡Hola, ${currentUser.name}!</h1>
                            <p class="text-green-100 mt-2">Tu servicio de recolección está funcionando perfectamente</p>
                        </div>
                        <div class="text-center">
                            <div class="bg-white bg-opacity-20 rounded-full p-4 mb-2">
                                <i class="fas fa-leaf text-4xl"></i>
                            </div>
                            <p class="text-sm text-green-100">EcoGestión</p>
                        </div>
                    </div>
                </div>

                <!-- Acciones Rápidas -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onclick="app.loadModule('new-service')">
                        <div class="text-center">
                            <div class="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <i class="fas fa-plus text-blue-600 text-2xl"></i>
                            </div>
                            <h3 class="font-semibold text-gray-800">Solicitar Servicio</h3>
                            <p class="text-sm text-gray-600 mt-2">Nueva recolección</p>
                        </div>
                    </div>
                    
                    <div class="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onclick="app.loadModule('my-services')">
                        <div class="text-center">
                            <div class="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <i class="fas fa-truck text-green-600 text-2xl"></i>
                            </div>
                            <h3 class="font-semibold text-gray-800">Mis Recolecciones</h3>
                            <p class="text-sm text-gray-600 mt-2">Ver historial</p>
                        </div>
                    </div>
                    
                    <div class="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onclick="app.loadModule('invoices')">
                        <div class="text-center">
                            <div class="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <i class="fas fa-file-invoice-dollar text-purple-600 text-2xl"></i>
                            </div>
                            <h3 class="font-semibold text-gray-800">Facturación</h3>
                            <p class="text-sm text-gray-600 mt-2">Pagos y facturas</p>
                        </div>
                    </div>
                    
                    <div class="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onclick="window.open('tel:+573001234567')">
                        <div class="text-center">
                            <div class="bg-yellow-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <i class="fas fa-phone text-yellow-600 text-2xl"></i>
                            </div>
                            <h3 class="font-semibold text-gray-800">Contacto</h3>
                            <p class="text-sm text-gray-600 mt-2">Soporte directo</p>
                        </div>
                    </div>
                </div>

                <!-- Estado Actual -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Próxima Recolección -->
                    <div class="bg-white p-6 rounded-lg shadow">
                        <div class="flex items-center mb-4">
                            <div class="bg-blue-100 rounded-full p-3 mr-4">
                                <i class="fas fa-calendar-check text-blue-600 text-xl"></i>
                            </div>
                            <div>
                                <h3 class="text-lg font-semibold text-gray-800">Próxima Recolección</h3>
                                <p class="text-gray-600 text-sm">Tu siguiente servicio programado</p>
                            </div>
                        </div>
                        ${this.renderNextCollection()}
                    </div>

                    <!-- Estado del Servicio -->
                    <div class="bg-white p-6 rounded-lg shadow">
                        <div class="flex items-center mb-4">
                            <div class="bg-green-100 rounded-full p-3 mr-4">
                                <i class="fas fa-check-circle text-green-600 text-xl"></i>
                            </div>
                            <div>
                                <h3 class="text-lg font-semibold text-gray-800">Estado del Servicio</h3>
                                <p class="text-gray-600 text-sm">Información de tu cuenta</p>
                            </div>
                        </div>
                        ${this.renderServiceStatus(currentUser)}
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
                    type: 'warning',
                    message: 'Retraso en ruta R-003 por tráfico intenso',
                    time: '45 min'
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

    // Funciones para el dashboard simplificado del cliente
    renderNextCollection() {
        const nextCollection = {
            date: 'Mañana',
            time: '09:00 AM',
            type: 'Recolección Regular',
            status: 'confirmado'
        };

        return `
            <div class="space-y-4">
                <div class="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div class="flex items-center space-x-4">
                        <div class="p-2 bg-blue-100 rounded-full">
                            <i class="fas fa-truck text-blue-600"></i>
                        </div>
                        <div>
                            <p class="font-semibold text-gray-800">${nextCollection.type}</p>
                            <p class="text-sm text-gray-600">${nextCollection.date} a las ${nextCollection.time}</p>
                        </div>
                    </div>
                    <span class="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                        Confirmado
                    </span>
                </div>
                <div class="text-center">
                    <button onclick="app.loadModule('new-service')" 
                            class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        ¿Necesitas un servicio adicional?
                    </button>
                </div>
            </div>
        `;
    },

    renderServiceStatus(user) {
        return `
            <div class="space-y-4">
                <div class="flex items-center justify-between">
                    <span class="text-gray-600">Estado de cuenta:</span>
                    <span class="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Al día</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-gray-600">Último servicio:</span>
                    <span class="text-gray-800 font-medium">Hace 3 días</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-gray-600">Servicios este mes:</span>
                    <span class="text-gray-800 font-medium">8 completados</span>
                </div>
                <div class="pt-4 border-t">
                    <div class="flex items-center justify-between">
                        <span class="text-gray-600">Teléfono de emergencia:</span>
                        <a href="tel:+573001234567" class="text-blue-600 hover:text-blue-800 font-medium">
                            300 123 4567
                        </a>
                    </div>
                </div>
            </div>
        `;
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
    },

    // ========== FUNCIONES MEJORADAS PARA DASHBOARD ADMIN ==========

    renderEnhancedKpiCards(kpis) {
        const kpiData = [
            { 
                title: 'Recolecciones Hoy', 
                value: kpis.collectionsToday, 
                icon: 'fa-truck', 
                color: 'from-blue-500 to-blue-600',
                change: '+12%',
                changeType: 'up'
            },
            { 
                title: 'Procesado Hoy', 
                value: `${kpis.processedToday.toFixed(1)}`, 
                unit: 'Ton',
                icon: 'fa-recycle', 
                color: 'from-green-500 to-green-600',
                change: '+8%',
                changeType: 'up'
            },
            { 
                title: 'Rutas Activas', 
                value: kpis.activeRoutes, 
                icon: 'fa-route', 
                color: 'from-yellow-500 to-yellow-600',
                change: '-2%',
                changeType: 'down'
            },
            { 
                title: 'Eficiencia General', 
                value: `${kpis.efficiency}%`, 
                icon: 'fa-chart-line', 
                color: 'from-purple-500 to-purple-600',
                change: '+3%',
                changeType: 'up'
            }
        ];

        return kpiData.map(kpi => `
            <div class="bg-gradient-to-r ${kpi.color} p-6 rounded-lg text-white relative overflow-hidden">
                <div class="absolute top-0 right-0 -mt-4 -mr-4 opacity-20">
                    <i class="fas ${kpi.icon} text-6xl"></i>
                </div>
                <div class="relative">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-sm font-medium opacity-90">${kpi.title}</p>
                        <i class="fas ${kpi.icon} text-xl opacity-75"></i>
                    </div>
                    <div class="flex items-end justify-between">
                        <div>
                            <p class="text-3xl font-bold">${kpi.value}${kpi.unit ? ` <span class="text-lg">${kpi.unit}</span>` : ''}</p>
                            <div class="flex items-center mt-1">
                                <i class="fas fa-arrow-${kpi.changeType} text-xs mr-1"></i>
                                <span class="text-xs opacity-90">${kpi.change} vs ayer</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    renderOperationalSummary(operational) {
        const summaryData = [
            {
                title: 'Rutas Completadas',
                value: operational.routesCompleted,
                total: operational.routesCompleted + operational.routesInProgress + operational.routesPending,
                icon: 'fa-check-circle',
                color: 'green'
            },
            {
                title: 'Volumen Total',
                value: `${(operational.totalVolume / 1000).toFixed(1)} Ton`,
                subtitle: 'Recolectado hoy',
                icon: 'fa-weight-hanging',
                color: 'blue'
            },
            {
                title: 'Tiempo Promedio',
                value: `${operational.averageTime} min`,
                subtitle: 'Por recolección',
                icon: 'fa-clock',
                color: 'yellow'
            },
            {
                title: 'Personal Activo',
                value: operational.operatorsActive,
                subtitle: 'Operadores en campo',
                icon: 'fa-users',
                color: 'purple'
            }
        ];

        return summaryData.map(item => `
            <div class="text-center">
                <div class="p-4 bg-${item.color}-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <i class="fas ${item.icon} text-${item.color}-600 text-2xl"></i>
                </div>
                <h4 class="font-semibold text-gray-900">${item.value}</h4>
                <p class="text-sm text-gray-600">${item.subtitle || item.title}</p>
                ${item.total ? `
                    <div class="mt-2 bg-gray-200 rounded-full h-2">
                        <div class="bg-${item.color}-500 h-2 rounded-full" style="width: ${(item.value / item.total * 100)}%"></div>
                    </div>
                ` : ''}
            </div>
        `).join('');
    },

    renderVehicleStatus(vehicles) {
        const statusData = [
            { status: 'En Servicio', count: 8, color: 'green', icon: 'fa-truck' },
            { status: 'Disponible', count: 3, color: 'blue', icon: 'fa-truck' },
            { status: 'Mantenimiento', count: 2, color: 'yellow', icon: 'fa-wrench' },
            { status: 'Fuera de Servicio', count: 1, color: 'red', icon: 'fa-times-circle' }
        ];

        return `
            <div class="space-y-4">
                ${statusData.map(item => `
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <div class="p-2 bg-${item.color}-100 rounded-full">
                                <i class="fas ${item.icon} text-${item.color}-600"></i>
                            </div>
                            <span class="text-sm font-medium">${item.status}</span>
                        </div>
                        <span class="font-bold text-gray-900">${item.count}</span>
                    </div>
                `).join('')}
                <div class="pt-4 border-t">
                    <button onclick="app.loadModule('routes')" class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                        Ver Flota Completa
                    </button>
                </div>
            </div>
        `;
    },

    renderFieldStaff(staff) {
        const operatorStats = [
            { name: 'Carlos Rodríguez', route: 'Ruta Norte', status: 'En Servicio', progress: 75 },
            { name: 'Ana García', route: 'Ruta Centro', status: 'En Servicio', progress: 60 },
            { name: 'Luis Martínez', route: 'Ruta Sur', status: 'En Descanso', progress: 100 },
            { name: 'María López', route: 'Ruta Este', status: 'En Servicio', progress: 40 }
        ];

        return `
            <div class="space-y-4">
                ${operatorStats.map(op => `
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium">${op.name}</p>
                            <p class="text-xs text-gray-500">${op.route}</p>
                        </div>
                        <div class="text-right">
                            <span class="px-2 py-1 text-xs rounded-full ${op.status === 'En Servicio' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                                ${op.status}
                            </span>
                            <div class="w-16 bg-gray-200 rounded-full h-1 mt-1">
                                <div class="bg-blue-500 h-1 rounded-full" style="width: ${op.progress}%"></div>
                            </div>
                        </div>
                    </div>
                `).join('')}
                <div class="pt-4 border-t">
                    <button onclick="app.loadModule('users')" class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                        Gestionar Personal
                    </button>
                </div>
            </div>
        `;
    },

    renderRoutePerformance(routes) {
        const performanceData = [
            { metric: 'Tiempo Promedio', value: '45 min', target: '40 min', percentage: 88 },
            { metric: 'Combustible/Km', value: '0.25 L', target: '0.22 L', percentage: 92 },
            { metric: 'Puntos/Hora', value: '4.2', target: '4.5', percentage: 93 },
            { metric: 'Satisfacción', value: '4.7/5', target: '4.5/5', percentage: 100 }
        ];

        return `
            <div class="space-y-4">
                ${performanceData.map(metric => `
                    <div>
                        <div class="flex justify-between text-sm mb-1">
                            <span class="font-medium">${metric.metric}</span>
                            <span class="text-gray-600">${metric.value}</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-purple-500 h-2 rounded-full" style="width: ${metric.percentage}%"></div>
                        </div>
                        <div class="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Meta: ${metric.target}</span>
                            <span>${metric.percentage}%</span>
                        </div>
                    </div>
                `).join('')}
                <div class="pt-4 border-t">
                    <button onclick="app.loadModule('reports')" class="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">
                        Ver Análisis Completo
                    </button>
                </div>
            </div>
        `;
    },

    renderEnhancedActivityFeed(activities) {
        if (activities.length === 0) return '<p class="text-sm text-gray-500 text-center py-8">No hay actividad reciente.</p>';
        
        const iconMap = { 
            route: 'fa-route', 
            collection: 'fa-clipboard-check', 
            manifest: 'fa-file-alt', 
            plant: 'fa-industry',
            user: 'fa-user',
            maintenance: 'fa-wrench'
        };
        const colorMap = { 
            route: 'text-blue-500', 
            collection: 'text-green-500', 
            manifest: 'text-purple-500', 
            plant: 'text-yellow-500',
            user: 'text-indigo-500',
            maintenance: 'text-red-500'
        };
        
        return `
            <div class="space-y-4 max-h-80 overflow-y-auto">
                ${activities.map(act => `
                    <div class="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div class="p-2 rounded-full bg-gray-100">
                            <i class="fas ${iconMap[act.type] || 'fa-info-circle'} ${colorMap[act.type] || 'text-gray-500'}"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-gray-900">${act.text}</p>
                            <div class="flex items-center justify-between mt-1">
                                <p class="text-xs text-gray-500">${this.timeAgo(act.timestamp)}</p>
                                <span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                                    ${act.priority || 'Normal'}
                                </span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderEnhancedAlerts(alerts) {
        if (alerts.length === 0) return '<p class="text-sm text-gray-500 text-center py-8">No hay alertas en el sistema.</p>';
        
        const iconMap = { 
            high: 'fa-exclamation-triangle', 
            medium: 'fa-clock', 
            low: 'fa-info-circle' 
        };
        const colorMap = { 
            high: 'text-red-500', 
            medium: 'text-yellow-500', 
            low: 'text-blue-500' 
        };
        const bgMap = { 
            high: 'bg-red-50 border-red-200', 
            medium: 'bg-yellow-50 border-yellow-200', 
            low: 'bg-blue-50 border-blue-200' 
        };
        
        return `
            <div class="space-y-4 max-h-80 overflow-y-auto">
                ${alerts.map(alert => `
                    <div class="flex items-start space-x-4 p-4 border rounded-lg ${bgMap[alert.priority]}">
                        <div class="p-2 rounded-full bg-white">
                            <i class="fas ${iconMap[alert.priority]} ${colorMap[alert.priority]}"></i>
                        </div>
                        <div class="flex-1">
                            <div class="flex items-start justify-between">
                                <div>
                                    <p class="text-sm font-medium text-gray-900">${alert.text}</p>
                                    <p class="text-xs text-gray-500 mt-1">Hace 2 horas</p>
                                </div>
                                <div class="flex space-x-2 ml-4">
                                    <button class="text-gray-400 hover:text-gray-600">
                                        <i class="fas fa-times text-xs"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
                <div class="text-center pt-4 border-t">
                    <button onclick="dashboardModule.clearAllAlerts()" class="text-gray-600 hover:text-gray-800 text-sm">
                        Marcar todas como leídas
                    </button>
                </div>
            </div>
        `;
    },

    // Datos auxiliares para las nuevas secciones
    getVehicleStatusData(vehicles) {
        return {
            active: 8,
            available: 3,
            maintenance: 2,
            outOfService: 1
        };
    },

    getFieldStaffData(users) {
        return {
            operators: users.filter(u => u.type === 'operator'),
            activeToday: 12,
            onBreak: 2,
            totalHours: 96
        };
    },

    getRoutePerformanceData(routes) {
        return {
            averageTime: 45,
            fuelEfficiency: 0.25,
            pointsPerHour: 4.2,
            satisfaction: 4.7
        };
    },

    // Funciones de acción para el dashboard
    exportDashboard() {
        authSystem?.showNotification?.('Exportando dashboard...', 'info');
        setTimeout(() => {
            authSystem?.showNotification?.('Dashboard exportado exitosamente', 'success');
        }, 2000);
    },

    clearAllAlerts() {
        authSystem?.showNotification?.('Todas las alertas han sido marcadas como leídas', 'success');
        this.loadAdminDashboard();
    }
};