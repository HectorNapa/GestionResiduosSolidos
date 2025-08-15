window.dashboardModule = {
    chartInstances: {},

    load(userType) {
        const contentArea = document.getElementById('content-area');
        
        if (userType === 'admin') {
            this.loadAdminDashboard();
        } else if (userType === 'operator') {
            this.loadOperatorDashboard();
        } else if (userType === 'client') {
            this.loadClientDashboard();
        }
    },

    loadAdminDashboard() {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-gray-800">Dashboard Administrativo</h1>
                <p class="text-gray-600">Panel de control del sistema de gestión de residuos</p>
            </div>

            <!-- KPI Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-blue-100">Recolecciones Hoy</p>
                            <p class="text-3xl font-bold">24</p>
                        </div>
                        <i class="fas fa-truck text-4xl text-blue-200"></i>
                    </div>
                    <div class="mt-4">
                        <span class="text-green-200">↗ +12%</span>
                        <span class="text-blue-100 text-sm ml-2">vs ayer</span>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-green-100">Residuos Procesados</p>
                            <p class="text-3xl font-bold">156.7 <span class="text-lg">Ton</span></p>
                        </div>
                        <i class="fas fa-recycle text-4xl text-green-200"></i>
                    </div>
                    <div class="mt-4">
                        <span class="text-green-200">↗ +8%</span>
                        <span class="text-green-100 text-sm ml-2">esta semana</span>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-yellow-100">Rutas Activas</p>
                            <p class="text-3xl font-bold">8</p>
                        </div>
                        <i class="fas fa-route text-4xl text-yellow-200"></i>
                    </div>
                    <div class="mt-4">
                        <span class="text-yellow-100">2 completadas</span>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-purple-100">Clientes Activos</p>
                            <p class="text-3xl font-bold">127</p>
                        </div>
                        <i class="fas fa-users text-4xl text-purple-200"></i>
                    </div>
                    <div class="mt-4">
                        <span class="text-green-200">↗ +3</span>
                        <span class="text-purple-100 text-sm ml-2">nuevos</span>
                    </div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div class="bg-white p-6 rounded-lg shadow">
                    <h3 class="text-lg font-semibold mb-4">Recolecciones por Tipo de Residuo</h3>
                    <canvas id="wasteTypeChart" width="400" height="200"></canvas>
                </div>

                <div class="bg-white p-6 rounded-lg shadow">
                    <h3 class="text-lg font-semibold mb-4">Tendencia Mensual de Recolección</h3>
                    <canvas id="monthlyTrendChart" width="400" height="200"></canvas>
                </div>
            </div>

            <!-- Recent Activities and Alerts -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-white p-6 rounded-lg shadow">
                    <h3 class="text-lg font-semibold mb-4">Actividades Recientes</h3>
                    <div class="space-y-4">
                        <div class="flex items-center p-3 bg-blue-50 rounded-lg">
                            <i class="fas fa-truck text-blue-500 mr-3"></i>
                            <div class="flex-1">
                                <p class="text-sm font-medium">Ruta R-001 completada</p>
                                <p class="text-xs text-gray-500">Hace 15 minutos</p>
                            </div>
                        </div>
                        <div class="flex items-center p-3 bg-green-50 rounded-lg">
                            <i class="fas fa-check-circle text-green-500 mr-3"></i>
                            <div class="flex-1">
                                <p class="text-sm font-medium">Manifiesto M-2024-001 generado</p>
                                <p class="text-xs text-gray-500">Hace 1 hora</p>
                            </div>
                        </div>
                        <div class="flex items-center p-3 bg-yellow-50 rounded-lg">
                            <i class="fas fa-clipboard-list text-yellow-500 mr-3"></i>
                            <div class="flex-1">
                                <p class="text-sm font-medium">Nueva solicitud recibida</p>
                                <p class="text-xs text-gray-500">Hace 2 horas</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-lg shadow">
                    <h3 class="text-lg font-semibold mb-4">Alertas del Sistema</h3>
                    <div class="space-y-4">
                        <div class="flex items-center p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                            <i class="fas fa-exclamation-triangle text-red-500 mr-3"></i>
                            <div class="flex-1">
                                <p class="text-sm font-medium">Vehículo V-003 requiere mantenimiento</p>
                                <p class="text-xs text-gray-500">Prioridad Alta</p>
                            </div>
                        </div>
                        <div class="flex items-center p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                            <i class="fas fa-clock text-yellow-500 mr-3"></i>
                            <div class="flex-1">
                                <p class="text-sm font-medium">Ruta R-005 con retraso</p>
                                <p class="text-xs text-gray-500">15 min de retraso</p>
                            </div>
                        </div>
                        <div class="flex items-center p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                            <i class="fas fa-info-circle text-blue-500 mr-3"></i>
                            <div class="flex-1">
                                <p class="text-sm font-medium">Capacidad de planta al 85%</p>
                                <p class="text-xs text-gray-500">Información</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => {
            this.initCharts();
        }, 100);
    },

    loadOperatorDashboard() {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-gray-800">Dashboard Operador</h1>
                <p class="text-gray-600">Panel de control para operaciones de campo</p>
            </div>

            <!-- Operator KPIs -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-blue-100">Mis Rutas Hoy</p>
                            <p class="text-3xl font-bold">3</p>
                        </div>
                        <i class="fas fa-route text-4xl text-blue-200"></i>
                    </div>
                    <div class="mt-4">
                        <span class="text-blue-100 text-sm">1 completada</span>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-green-100">Recolectado Hoy</p>
                            <p class="text-3xl font-bold">8.5 <span class="text-lg">Ton</span></p>
                        </div>
                        <i class="fas fa-weight text-4xl text-green-200"></i>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-yellow-100">Pendientes</p>
                            <p class="text-3xl font-bold">5</p>
                        </div>
                        <i class="fas fa-clock text-4xl text-yellow-200"></i>
                    </div>
                </div>
            </div>

            <!-- Today's Routes -->
            <div class="bg-white rounded-lg shadow p-6 mb-6">
                <h3 class="text-lg font-semibold mb-4">Rutas del Día</h3>
                <div class="space-y-4">
                    <div class="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg">
                        <div class="flex justify-between items-center">
                            <div>
                                <h4 class="font-medium">Ruta R-001 - Zona Norte</h4>
                                <p class="text-sm text-gray-600">8:00 AM - 12:00 PM | 6 puntos</p>
                            </div>
                            <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Completada</span>
                        </div>
                    </div>
                    <div class="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                        <div class="flex justify-between items-center">
                            <div>
                                <h4 class="font-medium">Ruta R-005 - Centro</h4>
                                <p class="text-sm text-gray-600">1:00 PM - 4:00 PM | 4 puntos</p>
                            </div>
                            <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">En Progreso</span>
                        </div>
                    </div>
                    <div class="border-l-4 border-gray-300 bg-gray-50 p-4 rounded-r-lg">
                        <div class="flex justify-between items-center">
                            <div>
                                <h4 class="font-medium">Ruta R-008 - Sur</h4>
                                <p class="text-sm text-gray-600">4:30 PM - 7:00 PM | 5 puntos</p>
                            </div>
                            <span class="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">Pendiente</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold mb-4">Acciones Rápidas</h3>
                    <div class="space-y-3">
                        <button onclick="app.loadModule('collection')" class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 flex items-center">
                            <i class="fas fa-plus mr-2"></i>Registrar Recolección
                        </button>
                        <button onclick="app.loadModule('manifests')" class="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 flex items-center">
                            <i class="fas fa-file-alt mr-2"></i>Generar Manifiesto
                        </button>
                        <button class="w-full bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700 flex items-center">
                            <i class="fas fa-camera mr-2"></i>Subir Evidencia
                        </button>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold mb-4">Estado del Vehículo</h3>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span>Combustible:</span>
                            <span class="text-green-600 font-medium">85%</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Kilometraje:</span>
                            <span>45,230 km</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Último Mantenimiento:</span>
                            <span>05/01/2024</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Estado:</span>
                            <span class="text-green-600 font-medium">Operativo</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    loadClientDashboard() {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-gray-800">Bienvenido ${app.currentUser.name}</h1>
                <p class="text-gray-600">Panel de control de servicios de gestión de residuos</p>
            </div>

            <!-- Client KPIs -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-blue-100">Servicios Este Mes</p>
                            <p class="text-3xl font-bold">4</p>
                        </div>
                        <i class="fas fa-calendar text-4xl text-blue-200"></i>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-green-100">Residuos Gestionados</p>
                            <p class="text-3xl font-bold">12.8 <span class="text-lg">Ton</span></p>
                        </div>
                        <i class="fas fa-recycle text-4xl text-green-200"></i>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-yellow-100">Próximo Servicio</p>
                            <p class="text-lg font-bold">Mañana</p>
                        </div>
                        <i class="fas fa-clock text-4xl text-yellow-200"></i>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-purple-100">Ahorro CO2</p>
                            <p class="text-3xl font-bold">2.4 <span class="text-lg">Ton</span></p>
                        </div>
                        <i class="fas fa-leaf text-4xl text-purple-200"></i>
                    </div>
                </div>
            </div>

            <!-- Service Status and Quick Actions -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold mb-4">Estado de Servicios</h3>
                    <div class="space-y-4">
                        <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div class="flex items-center">
                                <i class="fas fa-check-circle text-green-500 mr-3"></i>
                                <div>
                                    <p class="font-medium">Recolección Orgánicos</p>
                                    <p class="text-sm text-gray-600">15 Enero 2024</p>
                                </div>
                            </div>
                            <span class="text-green-600 font-medium">Completado</span>
                        </div>
                        <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div class="flex items-center">
                                <i class="fas fa-truck text-blue-500 mr-3"></i>
                                <div>
                                    <p class="font-medium">Recolección Reciclables</p>
                                    <p class="text-sm text-gray-600">Programado para mañana 8:00 AM</p>
                                </div>
                            </div>
                            <span class="text-blue-600 font-medium">En Ruta</span>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold mb-4">Acciones Rápidas</h3>
                    <div class="grid grid-cols-2 gap-3">
                        <button onclick="app.loadModule('new-service')" class="bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 flex flex-col items-center">
                            <i class="fas fa-plus text-2xl mb-2"></i>
                            <span class="text-sm">Nueva Solicitud</span>
                        </button>
                        <button onclick="app.loadModule('tracking')" class="bg-green-600 text-white py-3 px-4 rounded hover:bg-green-700 flex flex-col items-center">
                            <i class="fas fa-map-marker-alt text-2xl mb-2"></i>
                            <span class="text-sm">Seguimiento</span>
                        </button>
                        <button onclick="app.loadModule('invoices')" class="bg-yellow-600 text-white py-3 px-4 rounded hover:bg-yellow-700 flex flex-col items-center">
                            <i class="fas fa-file-invoice text-2xl mb-2"></i>
                            <span class="text-sm">Facturas</span>
                        </button>
                        <button onclick="app.loadModule('my-services')" class="bg-purple-600 text-white py-3 px-4 rounded hover:bg-purple-700 flex flex-col items-center">
                            <i class="fas fa-history text-2xl mb-2"></i>
                            <span class="text-sm">Historial</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Recent Invoices and Environmental Impact -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold mb-4">Facturas Recientes</h3>
                    <div class="space-y-3">
                        <div class="flex justify-between items-center p-3 border rounded-lg">
                            <div>
                                <p class="font-medium">FAC-2024-001</p>
                                <p class="text-sm text-gray-600">15 Enero 2024</p>
                            </div>
                            <div class="text-right">
                                <p class="font-medium">$250.00</p>
                                <span class="text-green-600 text-sm">Pagada</span>
                            </div>
                        </div>
                        <div class="flex justify-between items-center p-3 border rounded-lg">
                            <div>
                                <p class="font-medium">FAC-2024-002</p>
                                <p class="text-sm text-gray-600">01 Febrero 2024</p>
                            </div>
                            <div class="text-right">
                                <p class="font-medium">$320.00</p>
                                <span class="text-yellow-600 text-sm">Pendiente</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold mb-4">Impacto Ambiental</h3>
                    <div class="space-y-4">
                        <div class="flex items-center">
                            <i class="fas fa-recycle text-green-500 text-xl mr-3"></i>
                            <div>
                                <p class="font-medium">Material Reciclado</p>
                                <p class="text-sm text-gray-600">8.2 Ton este mes</p>
                            </div>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-leaf text-green-500 text-xl mr-3"></i>
                            <div>
                                <p class="font-medium">CO2 Reducido</p>
                                <p class="text-sm text-gray-600">2.4 Ton de emisiones evitadas</p>
                            </div>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-tree text-green-500 text-xl mr-3"></i>
                            <div>
                                <p class="font-medium">Equivalente</p>
                                <p class="text-sm text-gray-600">12 árboles plantados</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    initCharts() {
        this.destroyExistingCharts();
        
        // Waste Type Chart
        const wasteTypeCtx = document.getElementById('wasteTypeChart');
        if (wasteTypeCtx) {
            this.chartInstances.wasteType = new Chart(wasteTypeCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Orgánico', 'Reciclable', 'No Reciclable', 'Peligroso'],
                    datasets: [{
                        data: [45, 30, 20, 5],
                        backgroundColor: [
                            '#10B981',
                            '#3B82F6',
                            '#F59E0B',
                            '#EF4444'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }

        // Monthly Trend Chart
        const monthlyTrendCtx = document.getElementById('monthlyTrendChart');
        if (monthlyTrendCtx) {
            this.chartInstances.monthlyTrend = new Chart(monthlyTrendCtx, {
                type: 'line',
                data: {
                    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Toneladas',
                        data: [120, 135, 110, 158, 142, 167],
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    },

    destroyExistingCharts() {
        Object.values(this.chartInstances).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.chartInstances = {};
    }
};