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
                            <h1 class="text-3xl font-bold text-gray-800" data-translate="admin-dashboard">Dashboard Administrativo</h1>
                            <p class="text-gray-600 mt-1" data-translate="admin-dashboard-subtitle">Panel de control del sistema de gestión de residuos</p>
                            <div class="flex items-center mt-2 text-sm text-gray-500">
                                <i class="fas fa-clock mr-2"></i>
                                <span data-translate="last-update">Última actualización</span>: ${new Date().toLocaleString(window.translationManager?.currentLanguage === 'en' ? 'en-US' : 'es-ES')}</span>
                                <span class="ml-4 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                    <i class="fas fa-circle text-xs mr-1"></i><span data-translate="system-operational">Sistema Operativo</span>
                                </span>
                            </div>
                        </div>
                        <div class="mt-4 lg:mt-0 flex items-center space-x-3">
                            <button onclick="dashboardModule.loadAdminDashboard()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200">
                                <i class="fas fa-sync-alt mr-2"></i><span data-translate="refresh">Actualizar</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Tarjetas de Tipos de Residuos -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    ${this.renderWasteTypeCards(data.charts.wasteTypes)}
                </div>

                <!-- Gráfico de Recolecciones por Tipo de Residuo -->
                <div class="bg-white p-6 rounded-lg shadow mb-8">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold" data-translate="collections-by-waste-type">Recolecciones por Tipo de Residuo</h3>
                        <div class="flex items-center space-x-2">
                            <select class="text-sm border rounded px-2 py-1">
                                <option data-translate="last-week">Última semana</option>
                                <option data-translate="last-month">Último mes</option>
                                <option data-translate="last-quarter">Último trimestre</option>
                            </select>
                        </div>
                    </div>
                    <div class="h-80" id="wasteTypeChartContainer">
                        <canvas id="wasteTypeChart"></canvas>
                    </div>
                </div>

            `;

            this.initCharts(data.charts);
            
            // Aplicar traducciones después de cargar el contenido
            if (window.translationManager) {
                translationManager.applyTranslations();
            }

        } catch (error) {
            console.error('Error loading admin dashboard:', error);
            contentArea.innerHTML = `<div class="p-6 text-center bg-red-50 text-red-700 rounded-lg"><h3 class="font-bold" data-translate="error-loading-dashboard">Error al Cargar el Dashboard</h3><p>${error.message}</p></div>`;
        }
    },

    renderKpiCards(kpis) {
        const kpiData = [
            { title: 'collections-today', value: kpis.collectionsToday, icon: 'fa-truck', color: 'from-blue-500 to-blue-600' },
            { title: 'processed-today', value: `${kpis.processedToday.toFixed(2)} <span class="text-lg">Ton</span>`, icon: 'fa-recycle', color: 'from-green-500 to-green-600' },
            { title: 'active-routes', value: kpis.activeRoutes, icon: 'fa-route', color: 'from-yellow-500 to-yellow-600' },
            { title: 'active-alerts', value: kpis.activeAlerts, icon: 'fa-exclamation-triangle', color: 'from-purple-500 to-purple-600' }
        ];

        return kpiData.map(kpi => `
            <div class="bg-gradient-to-r ${kpi.color} p-6 rounded-lg text-white"><div class="flex items-center justify-between">
                <div>
                    <p class="text-sm" data-translate="${kpi.title}">${t(kpi.title)}</p>
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
        // Datos simulados más realistas para el gráfico
        const wasteTypes = {
            'Orgánico': 45.2,
            'Reciclable': 28.7,
            'No Reciclable': 15.3,
            'Peligroso': 8.1,
            'Electrónico': 2.7
        };
        
        // Si hay datos reales de recepciones, usarlos; si no, usar datos simulados
        if (receptions && receptions.length > 0) {
            const summary = receptions.reduce((acc, curr) => {
                (curr.classifications || []).forEach(c => {
                    acc[c.type] = (acc[c.type] || 0) + parseFloat(c.weight || 0);
                });
                return acc;
            }, {});
            
            // Si hay datos reales, usarlos; si no, combinar con datos simulados
            if (Object.keys(summary).length > 0) {
                return { 
                    labels: Object.keys(summary), 
                    data: Object.values(summary) 
                };
            }
        }
        
        // Usar datos simulados si no hay datos reales
        return { 
            labels: Object.keys(wasteTypes), 
            data: Object.values(wasteTypes) 
        };
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
            const wasteTypeContainer = document.getElementById('wasteTypeChartContainer');
            if (wasteTypeContainer) {
                wasteTypeContainer.innerHTML = '<p class="text-center text-red-500 p-4">(Error: Librería Chart.js no cargada)</p>';
            }
            return;
        }

        // Inicializar gráfico de tipos de residuo
        const wasteTypeCtx = document.getElementById('wasteTypeChart');
        if (wasteTypeCtx && chartData.wasteTypes && chartData.wasteTypes.labels.length > 0) {
            this.chartInstances.wasteType = new Chart(wasteTypeCtx, {
                type: 'doughnut',
                data: { 
                    labels: chartData.wasteTypes.labels, 
                    datasets: [{ 
                        data: chartData.wasteTypes.data, 
                        backgroundColor: [
                            '#10B981', // Verde para Orgánico
                            '#3B82F6', // Azul para Reciclable
                            '#F59E0B', // Amarillo para No Reciclable
                            '#EF4444', // Rojo para Peligroso
                            '#6366F1'  // Púrpura para Electrónico
                        ],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }] 
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false, 
                    plugins: { 
                        legend: { 
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true,
                                font: {
                                    size: 12
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${label}: ${value} Ton (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        } else if (wasteTypeCtx) {
            wasteTypeCtx.parentElement.innerHTML = '<div class="flex items-center justify-center h-full"><p class="text-center text-gray-500">No hay datos de clasificación para mostrar.</p></div>';
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
                <div class="bg-gradient-to-r from-green-500 to-blue-600 text-white p-10 rounded-xl mb-8 shadow-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-5xl font-bold mb-2" data-translate="hello">¡Hola</h1>
                            <h2 class="text-3xl font-semibold mb-4">${currentUser.name}!</h2>
                            <p class="text-xl text-green-100" data-translate="service-working-perfectly">Tu servicio de recolección está funcionando perfectamente</p>
                        </div>
                        <div class="text-center">
                            <div class="bg-white bg-opacity-20 rounded-full p-6 mb-4">
                                <i class="fas fa-leaf text-6xl"></i>
                            </div>
                            <p class="text-xl font-semibold text-green-100" data-translate="title">EcoGestión</p>
                        </div>
                    </div>
                </div>

                <!-- Gráfico de Recolecciones por Tipo de Residuo -->
                <div class="bg-white p-8 rounded-lg shadow mb-8">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-2xl font-bold text-gray-800" data-translate="collections-by-waste-type">Recolecciones por Tipo de Residuo</h3>
                                                 <div class="flex items-center space-x-3">
                             <label class="text-lg font-semibold text-gray-700">Filtrar por período:</label>
                             <select id="client-waste-period-filter" class="text-lg border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none bg-white shadow-sm" onchange="dashboardModule.updateClientWasteChart()">
                                 <option value="all" data-translate="all-collections">Todas las recolecciones</option>
                                 <option value="1" data-translate="today">Hoy</option>
                                 <option value="7" data-translate="last-week">Última semana</option>
                                 <option value="30" data-translate="last-30-days">Últimos 30 días</option>
                                 <option value="90" data-translate="last-3-months">Últimos 3 meses</option>
                                 <option value="365" data-translate="last-year">Último año</option>
                             </select>
                         </div>
                    </div>
                    <div class="h-80" id="clientWasteTypeChartContainer">
                        <canvas id="clientWasteTypeChart"></canvas>
                    </div>
                    <div id="clientWasteTypeStats" class="mt-4">
                        <!-- Aquí se mostrarán las estadísticas de cantidades -->
                    </div>
                </div>

            `;

            // Inicializar el gráfico de tipos de residuo del cliente
            this.initClientWasteChart(currentUser);
            
            // Aplicar traducciones después de cargar el contenido
            if (window.translationManager) {
                translationManager.applyTranslations();
            }

        } catch (error) {
            console.error('Error loading client dashboard:', error);
            contentArea.innerHTML = `
                <div class="p-6 text-center bg-red-50 text-red-700 rounded-lg">
                    <h3 class="font-bold" data-translate="error-loading-dashboard">Error al Cargar el Dashboard</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    },

    // ========= FUNCIONES PARA EL GRÁFICO DE TIPOS DE RESIDUO DEL CLIENTE =========
    
    getClientWasteTypeChartData(currentUser, period = 'all') {
        console.log('getClientWasteTypeChartData - Usuario:', currentUser);
        console.log('getClientWasteTypeChartData - Período:', period);
        
        // Obtener servicios del cliente
        let clientServices = app.getClientServices(currentUser.id);
        console.log('Servicios obtenidos de app.getClientServices:', clientServices);
        
        // Si no hay servicios, crear algunos datos de prueba para demostración
        if (!clientServices || clientServices.length === 0) {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const lastWeek = new Date(today);
            lastWeek.setDate(lastWeek.getDate() - 7);
            const lastMonth = new Date(today);
            lastMonth.setDate(lastMonth.getDate() - 30);
            
            clientServices = [
                {
                    id: 1,
                    clientId: currentUser.id,
                    wasteType: 'Orgánico',
                    estimatedVolume: 2.5,
                    createdDate: today.toISOString(),
                    status: 'Completado'
                },
                {
                    id: 2,
                    clientId: currentUser.id,
                    wasteType: 'Reciclable',
                    estimatedVolume: 1.8,
                    createdDate: yesterday.toISOString(),
                    status: 'Completado'
                },
                {
                    id: 3,
                    clientId: currentUser.id,
                    wasteType: 'No Reciclable',
                    estimatedVolume: 3.2,
                    createdDate: lastWeek.toISOString(),
                    status: 'Completado'
                },
                {
                    id: 4,
                    clientId: currentUser.id,
                    wasteType: 'Peligroso',
                    estimatedVolume: 0.8,
                    createdDate: lastMonth.toISOString(),
                    status: 'Completado'
                },
                {
                    id: 5,
                    clientId: currentUser.id,
                    wasteType: 'Electrónico',
                    estimatedVolume: 1.2,
                    createdDate: lastMonth.toISOString(),
                    status: 'Completado'
                }
            ];
            console.log('Datos de prueba creados:', clientServices);
        }

        // Filtrar por período si se especifica
        let filteredServices = clientServices;
        if (period !== 'all') {
            let days = 0;
            
            // Convertir los valores de período a días
            if (typeof period === 'string') {
                switch (period) {
                    case 'today':
                        days = 1;
                        break;
                    case 'week':
                        days = 7;
                        break;
                    case 'month':
                        days = 30;
                        break;
                    case 'year':
                        days = 365;
                        break;
                    default:
                        days = parseInt(period) || 0;
                }
            } else {
                days = parseInt(period) || 0;
            }
            
            if (days > 0) {
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - days);
                console.log('Fecha de corte para filtro:', cutoffDate);
                filteredServices = clientServices.filter(service => 
                    new Date(service.createdDate) >= cutoffDate
                );
                console.log('Servicios después del filtro:', filteredServices);
            }
        }

        // Si no hay servicios después del filtro, mostrar mensaje especial
        if (filteredServices.length === 0 && period !== 'all') {
            const periodLabels = {
                'today': 'hoy',
                'week': 'esta semana',
                'month': 'este mes',
                'year': 'este año'
            };
            const periodLabel = periodLabels[period] || 'el período seleccionado';
            
            console.log('No hay servicios filtrados para el período:', period);
            console.log('Servicios originales:', clientServices.length);
            console.log('Servicios filtrados:', filteredServices.length);
            
            return { 
                labels: [`Sin recolecciones en ${periodLabel}`], 
                data: [1],
                stats: {},
                noDataMessage: `No se encontraron recolecciones en ${periodLabel}. Intenta con un período diferente.`
            };
        }

        // Agrupar por tipo de residuo
        const wasteTypeStats = {};
        filteredServices.forEach(service => {
            const wasteType = service.wasteType || 'Sin especificar';
            if (!wasteTypeStats[wasteType]) {
                wasteTypeStats[wasteType] = {
                    count: 0,
                    volume: 0
                };
            }
            wasteTypeStats[wasteType].count++;
            wasteTypeStats[wasteType].volume += parseFloat(service.estimatedVolume || 0);
        });

        // Convertir a arrays para el gráfico
        const labels = Object.keys(wasteTypeStats);
        const data = labels.map(type => wasteTypeStats[type].count);

        const result = { labels, data, stats: wasteTypeStats };
        console.log('Resultado final de getClientWasteTypeChartData:', result);
        return result;
    },

    initClientWasteChart(currentUser) {
        this.initClientWasteChartWithPeriod(currentUser, 'all');
    },

    initClientWasteChartWithPeriod(currentUser, period) {
        this.destroyExistingCharts();
        
        if (typeof Chart === 'undefined') {
            const container = document.getElementById('clientWasteTypeChartContainer');
            if (container) {
                container.innerHTML = '<p class="text-center text-red-500 p-4">(Error: Librería Chart.js no cargada)</p>';
            }
            return;
        }

        const chartData = this.getClientWasteTypeChartData(currentUser, period);
        const ctx = document.getElementById('clientWasteTypeChart');
        
        if (ctx && chartData.labels.length > 0) {
            this.chartInstances.clientWasteType = new Chart(ctx, {
                type: 'doughnut',
                data: { 
                    labels: chartData.labels, 
                    datasets: [{ 
                        data: chartData.data, 
                        backgroundColor: [
                            '#10B981', // Verde para Orgánico
                            '#3B82F6', // Azul para Reciclable
                            '#F59E0B', // Amarillo para No Reciclable
                            '#EF4444', // Rojo para Peligroso
                            '#6366F1', // Púrpura para Electrónicos
                            '#8B5CF6', // Violeta para Construcción
                            '#6B7280'  // Gris para Sin especificar
                        ],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }] 
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false, 
                    plugins: { 
                        legend: { 
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true,
                                font: {
                                    size: 12
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${label}: ${value} recolecciones (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
            
            // Renderizar tabla de estadísticas
            this.renderClientWasteTypeStats(chartData.stats, chartData.noDataMessage);
        } else if (ctx) {
            ctx.parentElement.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full p-8">
                    <div class="bg-gray-100 rounded-full w-16 h-16 mb-4 flex items-center justify-center">
                        <i class="fas fa-chart-pie text-2xl text-gray-400"></i>
                    </div>
                    <h4 class="text-lg font-semibold text-gray-700 mb-2">Sin datos de recolección</h4>
                    <p class="text-gray-500 text-center">No se encontraron recolecciones para mostrar en el gráfico</p>
                </div>
            `;
        }
    },

    updateClientWasteChart() {
        const currentUser = app.currentUser;
        if (!currentUser) return;

        const periodFilter = document.getElementById('client-waste-period-filter');
        const period = periodFilter ? periodFilter.value : 'all';
        
        // Obtener datos filtrados para las estadísticas
        const chartData = this.getClientWasteTypeChartData(currentUser, period);
        
        // Destruir el gráfico existente
        if (this.chartInstances.clientWasteType) {
            this.chartInstances.clientWasteType.destroy();
            delete this.chartInstances.clientWasteType;
        }

        // Crear nuevo gráfico con los datos filtrados
        this.initClientWasteChartWithPeriod(currentUser, period);
        
        // Actualizar estadísticas con los datos filtrados
        this.renderClientWasteTypeStats(chartData.stats, chartData.noDataMessage);
    },

    renderClientWasteTypeStats(stats, noDataMessage = null) {
        const statsContainer = document.getElementById('clientWasteTypeStats');
        if (!statsContainer) return;

        if (!stats || Object.keys(stats).length === 0) {
            const message = noDataMessage || "No se encontraron recolecciones en el período seleccionado";
            const icon = noDataMessage ? "fa-search" : "fa-chart-pie";
            const iconColor = noDataMessage ? "text-yellow-600" : "text-blue-600";
            const bgColor = noDataMessage ? "bg-yellow-100" : "bg-blue-100";
            
            statsContainer.innerHTML = `
                <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-12 shadow-lg text-center">
                    <div class="mb-6">
                        <div class="${bgColor} rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                            <i class="fas ${icon} text-3xl ${iconColor}"></i>
                        </div>
                        <h4 class="text-2xl font-bold text-gray-800 mb-2">No hay datos disponibles</h4>
                        <p class="text-gray-600 text-lg">${message}</p>
                    </div>
                    <div class="bg-white rounded-lg p-6 shadow-sm">
                        <div class="flex items-center justify-center space-x-8">
                            <div class="text-center">
                                <div class="text-3xl font-bold text-gray-400">0</div>
                                <div class="text-sm text-gray-500">Servicios</div>
                            </div>
                            <div class="w-px h-12 bg-gray-300"></div>
                            <div class="text-center">
                                <div class="text-3xl font-bold text-gray-400">0.0</div>
                                <div class="text-sm text-gray-500">m³</div>
                            </div>
                        </div>
                    </div>
                    <div class="mt-6">
                        <p class="text-sm text-gray-500">
                            <i class="fas fa-info-circle mr-2"></i>
                            Intenta cambiar el período de filtro o contacta al administrador
                        </p>
                    </div>
                </div>
            `;
            return;
        }

        const totalServices = Object.values(stats).reduce((sum, stat) => sum + stat.count, 0);
        const totalVolume = Object.values(stats).reduce((sum, stat) => sum + stat.volume, 0);

        // Colores para cada tipo de residuo
        const wasteTypeColors = {
            'Orgánico': 'bg-green-100 text-green-800 border-green-200',
            'Reciclable': 'bg-blue-100 text-blue-800 border-blue-200',
            'No Reciclable': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Peligroso': 'bg-red-100 text-red-800 border-red-200',
            'Electrónico': 'bg-purple-100 text-purple-800 border-purple-200'
        };

        const statsHTML = `
            <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 shadow-lg">
                <div class="text-center mb-8">
                    <h4 class="text-3xl font-bold text-gray-800 mb-6">Resumen de Cantidades</h4>
                    <div class="flex flex-wrap justify-center gap-3">
                        <button onclick="dashboardModule.filterStatsByPeriod('today')" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg">
                            <i class="fas fa-calendar-day mr-2"></i>Hoy
                        </button>
                        <button onclick="dashboardModule.filterStatsByPeriod('week')" class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg">
                            <i class="fas fa-calendar-week mr-2"></i>Semana
                        </button>
                        <button onclick="dashboardModule.filterStatsByPeriod('month')" class="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-semibold text-lg">
                            <i class="fas fa-calendar-alt mr-2"></i>Mes
                        </button>
                        <button onclick="dashboardModule.filterStatsByPeriod('year')" class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold text-lg">
                            <i class="fas fa-calendar mr-2"></i>Año
                        </button>
                        <button onclick="dashboardModule.filterStatsByPeriod('all')" class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold text-lg">
                            <i class="fas fa-infinity mr-2"></i>Todos
                        </button>
                    </div>
                </div>
                
                                 <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                     <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
                         <div class="text-center">
                             <div class="text-5xl font-bold mb-2">${totalServices}</div>
                             <div class="text-xl font-semibold mb-4">Total de Servicios</div>
                             <div class="text-4xl opacity-75">
                                 <i class="fas fa-recycle"></i>
                             </div>
                         </div>
                     </div>
                     <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
                         <div class="text-center">
                             <div class="text-5xl font-bold mb-2">${totalVolume.toFixed(1)}</div>
                             <div class="text-xl font-semibold mb-4">Volumen Total (m³)</div>
                             <div class="text-4xl opacity-75">
                                 <i class="fas fa-weight-hanging"></i>
                             </div>
                         </div>
                     </div>
                 </div>
                
                                 <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                     ${Object.entries(stats).map(([wasteType, data]) => {
                         const percentage = totalServices > 0 ? ((data.count / totalServices) * 100).toFixed(1) : '0.0';
                         
                         // Definir colores e iconos para cada tipo (igual que en admin)
                         const wasteTypeConfig = {
                             'Orgánico': { 
                                 color: 'from-green-500 to-green-600', 
                                 icon: 'fa-leaf',
                                 unit: 'Servicios',
                                 description: 'Residuos biodegradables'
                             },
                             'Reciclable': { 
                                 color: 'from-blue-500 to-blue-600', 
                                 icon: 'fa-recycle',
                                 unit: 'Servicios',
                                 description: 'Materiales reutilizables'
                             },
                             'No Reciclable': { 
                                 color: 'from-gray-500 to-gray-600', 
                                 icon: 'fa-trash',
                                 unit: 'Servicios',
                                 description: 'Residuos generales'
                             },
                             'Peligroso': { 
                                 color: 'from-red-500 to-red-600', 
                                 icon: 'fa-exclamation-triangle',
                                 unit: 'Servicios',
                                 description: 'Materiales tóxicos'
                             },
                             'Electrónico': { 
                                 color: 'from-purple-500 to-purple-600', 
                                 icon: 'fa-microchip',
                                 unit: 'Servicios',
                                 description: 'Desechos electrónicos'
                             }
                         };
                         
                         const config = wasteTypeConfig[wasteType] || { 
                             color: 'from-gray-500 to-gray-600', 
                             icon: 'fa-box',
                             unit: 'Servicios',
                             description: 'Sin especificar'
                         };
                         
                                                   return `
                              <div class="bg-gradient-to-r ${config.color} p-6 rounded-lg text-white relative overflow-hidden">
                                  <div class="absolute top-0 right-0 -mt-4 -mr-4 opacity-20">
                                      <i class="fas ${config.icon} text-6xl"></i>
                                  </div>
                                  <div class="relative text-center">
                                      <div class="mb-3">
                                          <p class="text-lg font-semibold opacity-90 mb-1">${wasteType}</p>
                                          <i class="fas ${config.icon} text-2xl opacity-75"></i>
                                      </div>
                                      <div class="mb-3">
                                          <p class="text-4xl font-bold">${data.count}</p>
                                          <p class="text-sm opacity-90">${config.unit}</p>
                                      </div>
                                      <div class="text-xs opacity-90">
                                          <p>${data.volume.toFixed(1)} m³</p>
                                          <p>${percentage}% del total</p>
                                      </div>
                                  </div>
                              </div>
                          `;
                     }).join('')}
                 </div>
            </div>
        `;

        statsContainer.innerHTML = statsHTML;
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

    renderWasteTypeCards(wasteTypes) {
        const wasteTypeData = [
            { 
                title: 'Orgánico', 
                value: wasteTypes.data[0] || 0, 
                icon: 'fa-leaf', 
                color: 'from-green-500 to-green-600',
                unit: 'Ton',
                description: 'Residuos biodegradables'
            },
            { 
                title: 'Reciclable', 
                value: wasteTypes.data[1] || 0, 
                icon: 'fa-recycle', 
                color: 'from-blue-500 to-blue-600',
                unit: 'Ton',
                description: 'Materiales reutilizables'
            },
            { 
                title: 'No Reciclable', 
                value: wasteTypes.data[2] || 0, 
                icon: 'fa-trash', 
                color: 'from-gray-500 to-gray-600',
                unit: 'Ton',
                description: 'Residuos generales'
            },
            { 
                title: 'Peligroso', 
                value: wasteTypes.data[3] || 0, 
                icon: 'fa-exclamation-triangle', 
                color: 'from-red-500 to-red-600',
                unit: 'Ton',
                description: 'Materiales tóxicos'
            },
            { 
                title: 'Electrónico', 
                value: wasteTypes.data[4] || 0, 
                icon: 'fa-microchip', 
                color: 'from-purple-500 to-purple-600',
                unit: 'Ton',
                description: 'Desechos electrónicos'
            }
        ];

        return wasteTypeData.map(waste => `
            <div class="bg-gradient-to-r ${waste.color} p-6 rounded-lg text-white relative overflow-hidden">
                <div class="absolute top-0 right-0 -mt-4 -mr-4 opacity-20">
                    <i class="fas ${waste.icon} text-6xl"></i>
                </div>
                <div class="relative">
                    <div class="flex items-center justify-between mb-2">
                        <p class="text-sm font-medium opacity-90">${waste.title}</p>
                        <i class="fas ${waste.icon} text-xl opacity-75"></i>
                    </div>
                    <div class="flex items-end justify-between">
                        <div>
                            <p class="text-3xl font-bold">${waste.value.toFixed(1)} <span class="text-lg">${waste.unit}</span></p>
                            <p class="text-xs opacity-90 mt-1">${waste.description}</p>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    },

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
                subtitle: 'Técnicos en campo',
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
    },

    // ========= FUNCIÓN PARA FILTRAR ESTADÍSTICAS POR PERÍODO =========
    filterStatsByPeriod(period) {
        const currentUser = app.currentUser;
        if (!currentUser) return;

        console.log('Filtrando por período:', period);
        console.log('Usuario actual:', currentUser);

        // Obtener datos filtrados
        const chartData = this.getClientWasteTypeChartData(currentUser, period);
        
        console.log('Datos del gráfico:', chartData);
        
        // Actualizar el gráfico
        if (this.chartInstances.clientWasteType) {
            this.chartInstances.clientWasteType.destroy();
            delete this.chartInstances.clientWasteType;
        }
        
        // Crear nuevo gráfico con los datos filtrados
        this.initClientWasteChartWithPeriod(currentUser, period);
        
        // Actualizar estadísticas con los datos filtrados
        this.renderClientWasteTypeStats(chartData.stats, chartData.noDataMessage);

        // Mostrar notificación del filtro aplicado
        const periodLabels = {
            'today': 'Hoy',
            'week': 'Esta semana',
            'month': 'Este mes',
            'year': 'Este año',
            'all': 'Todos los períodos'
        };
        
        authSystem?.showNotification?.(`Filtro aplicado: ${periodLabels[period]}`, 'info');
    }
};