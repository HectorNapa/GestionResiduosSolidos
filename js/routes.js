// routes.js
window.routesModule = {
    // ====== Datos iniciales (se sobreescriben desde localStorage si existen) ======
    routes: [
        {
            id: 1,
            name: 'Ruta Norte A',
            code: 'R-001',
            vehicle: 'C-001', // usamos el CÓDIGO del vehículo
            driver: 'Carlos Rodríguez',
            helper: 'Ana García',
            date: new Date().toISOString().split('T')[0], // Hoy
            startTime: '08:00',
            estimatedDuration: 4, // horas (número)
            status: 'En Progreso',
            collectionPoints: [
                { address: 'Av. Principal 123', client: 'Empresa ABC', wasteType: 'Orgánico', estimated: '2.5 m³' },
                { address: 'Calle Norte 456',   client: 'Oficinas XYZ',  wasteType: 'Reciclable', estimated: '1.8 m³' },
                { address: 'Av. Central 789',   client: 'Hotel Plaza',   wasteType: 'Orgánico', estimated: '3.2 m³' }
            ]
        },
        {
            id: 2,
            name: 'Ruta Centro B',
            code: 'R-002',
            vehicle: 'C-002',
            driver: 'Luis Martínez',
            helper: 'Pedro Silva',
            date: '2024-01-16',
            startTime: '13:00',
            estimatedDuration: 3.5, // horas
            status: 'En Progreso',
            collectionPoints: [
                { address: 'Plaza Mayor 100',   client: 'Restaurante Central', wasteType: 'Orgánico',   estimated: '4.1 m³' },
                { address: 'Calle Comercio 250', client: 'Tienda Moderna',      wasteType: 'Reciclable', estimated: '0.8 m³' }
            ]
        },
        {
            id: 3,
            name: 'Ruta Sur Industrial',
            code: 'R-003',
            vehicle: 'C-001',
            driver: 'Carlos Rodríguez',
            helper: 'María López',
            date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Mañana
            startTime: '07:30',
            estimatedDuration: 5,
            status: 'Programada',
            collectionPoints: [
                { address: 'Zona Industrial 1 Lote 15', client: 'Industrias Metal', wasteType: 'Peligroso', estimated: '1.2 m³' },
                { address: 'Zona Industrial 2 Lote 8', client: 'Fábrica Textil', wasteType: 'Reciclable', estimated: '3.5 m³' },
                { address: 'Zona Industrial 3 Lote 22', client: 'Procesadora Alimentos', wasteType: 'Orgánico', estimated: '2.8 m³' }
            ]
        },
        {
            id: 4,
            name: 'Ruta Comercial Este',
            code: 'R-004',
            vehicle: 'C-002',
            driver: 'Carlos Rodríguez',
            helper: 'Ana García',
            date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Ayer
            startTime: '14:00',
            estimatedDuration: 3,
            status: 'Completada',
            collectionPoints: [
                { address: 'Centro Comercial Plaza', client: 'Mall Plaza', wasteType: 'Mixtos', estimated: '5.2 m³' },
                { address: 'Oficinas Torre Norte', client: 'Corporativo ABC', wasteType: 'Papel', estimated: '1.5 m³' }
            ]
        }
    ],

    vehicles: [
        { id: 1, code: 'C-001', brand: 'Mercedes', model: 'Actros', capacity: '15 m³', status: 'Disponible' },
        { id: 2, code: 'C-002', brand: 'Volvo',    model: 'FH',     capacity: '18 m³', status: 'En Ruta' },
        { id: 3, code: 'C-003', brand: 'Scania',   model: 'R450',   capacity: '20 m³', status: 'Mantenimiento' }
    ],

    drivers: [
        { id: 1, name: 'Carlos Rodríguez', license: 'A-12345', status: 'Disponible' },
        { id: 2, name: 'Luis Martínez',    license: 'A-67890', status: 'En Ruta' },
        { id: 3, name: 'Miguel Torres',    license: 'A-11223', status: 'Disponible' }
    ],

    // ====== Estado de filtros ======
    routesFilterMode: 'today',        // 'today' | 'all'
    routesStatusFilter: 'Todos',      // 'Todos' | 'Programada' | 'En Progreso' | 'Completada' | 'Cancelada'

    // ====== Persistencia ======
    loadRoutesFromStorage() {
        try {
            const raw = localStorage.getItem('ecogestion_routes');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) this.routes = parsed;
            }
        } catch (e) { /* ignore */ }
    },

    saveAll() {
        try { localStorage.setItem('ecogestion_routes', JSON.stringify(this.routes)); } catch(e) {}
    },

    ensureLoaded() {
        if (!this._loaded) {
            this.loadRoutesFromStorage();
            this._loaded = true;
        }
    },

    // ====== Helpers de tiempo / duración / conflicto ======
    parseDurationHours(d) {
        if (typeof d === 'number') return d;
        if (d == null) return 1;
        const s = String(d).replace(',', '.');
        const num = parseFloat(s.match(/(\d+(\.\d+)?)/)?.[0]);
        return isNaN(num) ? 1 : num;
    },

    timeToMinutes(hhmm) {
        const [h, m] = String(hhmm || '').split(':').map(x => parseInt(x, 10));
        if (isNaN(h) || isNaN(m)) return NaN;
        return h * 60 + m;
    },

    findVehicleConflict(vehicleCode, date, startTime, durationHours, excludeId = null) {
        const start = this.timeToMinutes(startTime);
        const end   = start + Math.round(durationHours * 60);
        if (isNaN(start) || isNaN(end)) return null;

        for (const r of this.routes) {
            if (excludeId && r.id === excludeId) continue;
            if (r.vehicle !== vehicleCode) continue;
            if (r.date !== date) continue;

            const rStart = this.timeToMinutes(r.startTime);
            const rDur   = this.parseDurationHours(r.estimatedDuration);
            const rEnd   = rStart + Math.round(rDur * 60);
            if (isNaN(rStart) || isNaN(rEnd)) continue;

            if (start < rEnd && rStart < end) {
                return r;
            }
        }
        return null;
    },

    formatDuration(h) {
        const n = this.parseDurationHours(h);
        return n === 1 ? '1 hora' : `${n} horas`;
    },

    // Vehículos: utilidades de etiqueta
    getVehicleByCode(code) {
        return this.vehicles.find(v => v.code === code);
    },

    getVehicleLabelByCode(code) {
        const v = this.getVehicleByCode(code);
        return v ? `${v.brand} ${v.model} (${v.code})` : code || '—';
    },

    // ====== UI principal ======
    load() {
        this.ensureLoaded();
        
        // Detectar si el usuario actual es operador
        const currentUser = app?.currentUser;
        if (currentUser && currentUser.type === 'operator') {
            this.loadOperatorView();
            return;
        }

        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="mb-6">
                <div class="flex justify-between items-center">
                    <h1 class="text-3xl font-bold text-gray-800">Planificación de Rutas</h1>
                    <button onclick="routesModule.showNewRouteModal()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                        <i class="fas fa-plus mr-2"></i>Nueva Ruta
                    </button>
                </div>
                <p class="text-gray-600">Organiza y gestiona las rutas de recolección</p>
            </div>

            <!-- Resumen -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-blue-100">Rutas Hoy</p>
                            <p class="text-3xl font-bold" id="metric-routes-today">${this.getTodayRoutesCount()}</p>
                        </div>
                        <i class="fas fa-route text-4xl text-blue-200"></i>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-green-100">Completadas</p>
                            <p class="text-3xl font-bold" id="metric-routes-completed">${this.getCompletedRoutesCount()}</p>
                        </div>
                        <i class="fas fa-check-circle text-4xl text-green-200"></i>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-yellow-100">En Progreso</p>
                            <p class="text-3xl font-bold" id="metric-routes-inprogress">${this.getInProgressRoutesCount()}</p>
                        </div>
                        <i class="fas fa-truck text-4xl text-yellow-200"></i>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-purple-100">Vehículos Activos</p>
                            <p class="text-3xl font-bold" id="metric-vehicles-active">${this.getActiveVehiclesCount()}</p>
                        </div>
                        <i class="fas fa-truck-moving text-4xl text-purple-200"></i>
                    </div>
                </div>
            </div>

            <!-- Tabs -->
            <div class="mb-6">
                <nav class="flex space-x-8">
                    <a href="#" onclick="routesModule.showTab('routes')" id="routes-tab" 
                       class="tab-link active border-b-2 border-blue-500 text-blue-600 py-2 px-1 font-medium">
                        Rutas
                    </a>
                    <a href="#" onclick="routesModule.showTab('vehicles')" id="vehicles-tab"
                       class="tab-link text-gray-500 hover:text-gray-700 py-2 px-1 font-medium">
                        Vehículos
                    </a>
                    <a href="#" onclick="routesModule.showTab('optimization')" id="optimization-tab"
                       class="tab-link text-gray-500 hover:text-gray-700 py-2 px-1 font-medium">
                        Optimización
                    </a>
                </nav>
            </div>

            <!-- Contenido de pestaña -->
            <div id="tab-content"></div>
        `;

        this.showTab('routes');
        this.updateSummaryCards(); // asegurar métricas correctas al cargar
    },

    // ====== VISTA ESPECÍFICA PARA OPERADORES ======
    loadOperatorView() {
        const contentArea = document.getElementById('content-area');
        const currentUser = app?.currentUser;
        
        // Obtener rutas asignadas al operador
        const myRoutes = this.getOperatorRoutes(currentUser);
        
        contentArea.innerHTML = `
            <div class="mb-6">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-800">Mis Rutas</h1>
                        <p class="text-gray-600">Gestiona tus rutas asignadas - ${currentUser.name}</p>
                    </div>
                    <div class="mt-4 md:mt-0 flex items-center space-x-3">
                        <span class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                            <i class="fas fa-truck text-xs mr-1"></i>Operador Activo
                        </span>
                        <button onclick="routesModule.loadOperatorView()" 
                                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                            <i class="fas fa-sync-alt mr-2"></i>Actualizar
                        </button>
                    </div>
                </div>
            </div>

            <!-- KPIs del Operador -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                ${this.renderOperatorRouteKpis(myRoutes)}
            </div>

            <!-- Filtros y acciones -->
            <div class="bg-white p-4 rounded-lg shadow mb-6">
                <div class="flex flex-wrap gap-4 items-center">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Filtrar por fecha</label>
                        <select id="operator-date-filter" onchange="routesModule.filterOperatorRoutes()" 
                                class="px-3 py-2 border rounded-lg">
                            <option value="today">Hoy</option>
                            <option value="tomorrow">Mañana</option>
                            <option value="week">Esta semana</option>
                            <option value="all">Todas</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                        <select id="operator-status-filter" onchange="routesModule.filterOperatorRoutes()" 
                                class="px-3 py-2 border rounded-lg">
                            <option value="all">Todos los estados</option>
                            <option value="Programada">Programadas</option>
                            <option value="En Progreso">En Progreso</option>
                            <option value="Completada">Completadas</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Lista de rutas del operador -->
            <div class="bg-white rounded-lg shadow">
                <div class="p-6 border-b">
                    <h3 class="text-lg font-semibold">Mis Rutas Asignadas</h3>
                </div>
                <div id="operator-routes-container">
                    ${this.renderOperatorRoutes(myRoutes)}
                </div>
            </div>
        `;
    },

    // Obtener rutas asignadas al operador actual
    getOperatorRoutes(currentUser) {
        if (!currentUser) return [];
        
        // Filtrar rutas donde el operador aparece como driver
        return this.routes.filter(route => 
            route.driver === currentUser.name || 
            route.driver === currentUser.id ||
            route.assignedOperator === currentUser.id
        );
    },

    renderOperatorRouteKpis(routes) {
        const today = new Date().toISOString().split('T')[0];
        const todayRoutes = routes.filter(r => r.date === today);
        const inProgress = routes.filter(r => r.status === 'En Progreso');
        const completed = routes.filter(r => r.status === 'Completada');

        const kpis = [
            {
                title: 'Rutas Hoy',
                value: todayRoutes.length,
                subtitle: 'Asignadas',
                icon: 'fa-calendar-day',
                color: 'blue'
            },
            {
                title: 'En Progreso',
                value: inProgress.length,
                subtitle: 'Activas ahora',
                icon: 'fa-truck',
                color: 'yellow'
            },
            {
                title: 'Completadas',
                value: completed.length,
                subtitle: 'Total histórico',
                icon: 'fa-check-circle',
                color: 'green'
            }
        ];

        return kpis.map(kpi => `
            <div class="bg-white p-6 rounded-lg shadow border-l-4 border-${kpi.color}-500">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-${kpi.color}-600 text-sm font-medium">${kpi.title}</p>
                        <p class="text-3xl font-bold text-gray-900">${kpi.value}</p>
                        <p class="text-gray-500 text-xs mt-1">${kpi.subtitle}</p>
                    </div>
                    <div class="p-3 bg-${kpi.color}-100 rounded-full">
                        <i class="fas ${kpi.icon} text-${kpi.color}-600 text-xl"></i>
                    </div>
                </div>
            </div>
        `).join('');
    },

    renderOperatorRoutes(routes) {
        if (routes.length === 0) {
            return `
                <div class="p-8 text-center">
                    <i class="fas fa-route text-gray-300 text-6xl mb-4"></i>
                    <h3 class="text-xl font-medium text-gray-900 mb-2">No hay rutas asignadas</h3>
                    <p class="text-gray-500">No tienes rutas asignadas en este momento.</p>
                </div>
            `;
        }

        return `
            <div class="divide-y divide-gray-200">
                ${routes.map(route => this.renderOperatorRouteCard(route)).join('')}
            </div>
        `;
    },

    renderOperatorRouteCard(route) {
        const statusColors = {
            'Programada': 'blue',
            'En Progreso': 'yellow',
            'Completada': 'green',
            'Pausada': 'red'
        };
        const color = statusColors[route.status] || 'gray';

        return `
            <div class="p-6 hover:bg-gray-50 transition-colors">
                <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div class="flex-1">
                        <div class="flex items-center space-x-4 mb-3">
                            <h4 class="text-lg font-semibold text-gray-900">${route.name}</h4>
                            <span class="px-3 py-1 text-sm rounded-full bg-${color}-100 text-${color}-800">
                                ${route.status}
                            </span>
                            <span class="text-sm text-gray-500">ID: ${route.code}</span>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                                <i class="fas fa-calendar mr-2 text-blue-500"></i>
                                <strong>Fecha:</strong> ${this.formatDate(route.date)}
                            </div>
                            <div>
                                <i class="fas fa-clock mr-2 text-green-500"></i>
                                <strong>Inicio:</strong> ${route.startTime}
                            </div>
                            <div>
                                <i class="fas fa-truck mr-2 text-purple-500"></i>
                                <strong>Vehículo:</strong> ${this.getVehicleDisplayName(route.vehicle)}
                            </div>
                        </div>

                        <div class="mt-3">
                            <div class="flex items-center text-sm text-gray-600">
                                <i class="fas fa-map-marker-alt mr-2 text-red-500"></i>
                                <strong>Puntos de recolección:</strong> 
                                <span class="ml-2">${route.collectionPoints?.length || 0} paradas</span>
                            </div>
                        </div>
                    </div>

                    <div class="mt-4 lg:mt-0 lg:ml-6 flex flex-col space-y-2">
                        ${this.renderOperatorRouteActions(route)}
                    </div>
                </div>

                <!-- Puntos de recolección (expandible) -->
                <div class="mt-4">
                    <button onclick="routesModule.toggleRouteDetails('route-${route.id}')" 
                            class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        <i class="fas fa-chevron-down mr-1"></i>Ver detalles de paradas
                    </button>
                    <div id="route-${route.id}-details" class="hidden mt-3 bg-gray-50 p-4 rounded-lg">
                        ${this.renderCollectionPoints(route.collectionPoints)}
                    </div>
                </div>
            </div>
        `;
    },

    renderOperatorRouteActions(route) {
        const actions = [];

        if (route.status === 'Programada') {
            actions.push(`
                <button onclick="routesModule.startRoute(${route.id})" 
                        class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm">
                    <i class="fas fa-play mr-2"></i>Iniciar Ruta
                </button>
            `);
        }

        if (route.status === 'En Progreso') {
            actions.push(`
                <button onclick="routesModule.continueRoute(${route.id})" 
                        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                    <i class="fas fa-truck mr-2"></i>Continuar
                </button>
            `);
            actions.push(`
                <button onclick="routesModule.pauseRoute(${route.id})" 
                        class="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 text-sm">
                    <i class="fas fa-pause mr-2"></i>Pausar
                </button>
            `);
        }

        if (route.status === 'Pausada') {
            actions.push(`
                <button onclick="routesModule.resumeRoute(${route.id})" 
                        class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm">
                    <i class="fas fa-play mr-2"></i>Reanudar
                </button>
            `);
        }

        // Acciones siempre disponibles
        actions.push(`
            <button onclick="routesModule.viewRouteDetails(${route.id})" 
                    class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm">
                <i class="fas fa-eye mr-2"></i>Ver Detalles
            </button>
        `);

        return actions.join('');
    },

    renderCollectionPoints(points) {
        if (!points || points.length === 0) {
            return '<p class="text-gray-500">No hay puntos de recolección definidos.</p>';
        }

        return `
            <div class="space-y-2">
                ${points.map((point, index) => `
                    <div class="flex items-center justify-between p-3 bg-white rounded border">
                        <div class="flex items-center space-x-3">
                            <span class="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                ${index + 1}
                            </span>
                            <div>
                                <p class="font-medium">${point.client}</p>
                                <p class="text-sm text-gray-600">${point.address}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="px-2 py-1 text-xs rounded-full ${this.getWasteTypeColorClass(point.wasteType)}">
                                ${point.wasteType}
                            </span>
                            <p class="text-sm text-gray-600 mt-1">${point.estimated}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // Funciones de acción para operadores
    startRoute(routeId) {
        const route = this.routes.find(r => r.id === routeId);
        if (!route) return;

        if (confirm(`¿Iniciar la ruta "${route.name}"?`)) {
            route.status = 'En Progreso';
            route.startedAt = new Date().toISOString();
            this.saveAll();
            authSystem?.showNotification?.(`Ruta "${route.name}" iniciada`, 'success');
            this.loadOperatorView();
        }
    },

    continueRoute(routeId) {
        // Redirigir al módulo de recolección
        app.loadModule('collection');
        authSystem?.showNotification?.('Redirigiendo al módulo de recolección...', 'info');
    },

    pauseRoute(routeId) {
        const route = this.routes.find(r => r.id === routeId);
        if (!route) return;

        if (confirm(`¿Pausar la ruta "${route.name}"?`)) {
            route.status = 'Pausada';
            route.pausedAt = new Date().toISOString();
            this.saveAll();
            authSystem?.showNotification?.(`Ruta "${route.name}" pausada`, 'warning');
            this.loadOperatorView();
        }
    },

    resumeRoute(routeId) {
        const route = this.routes.find(r => r.id === routeId);
        if (!route) return;

        if (confirm(`¿Reanudar la ruta "${route.name}"?`)) {
            route.status = 'En Progreso';
            route.resumedAt = new Date().toISOString();
            this.saveAll();
            authSystem?.showNotification?.(`Ruta "${route.name}" reanudada`, 'success');
            this.loadOperatorView();
        }
    },

    viewRouteDetails(routeId) {
        // Mostrar modal con detalles completos de la ruta
        const route = this.routes.find(r => r.id === routeId);
        if (!route) return;

        const modalHtml = `
            <div id="route-details-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-xl font-semibold">Detalles de Ruta: ${route.name}</h3>
                        <button onclick="document.getElementById('route-details-modal').remove()" 
                                class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    ${this.renderRouteDetailsContent(route)}
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    renderRouteDetailsContent(route) {
        return `
            <div class="space-y-6">
                <!-- Información general -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h4 class="font-semibold mb-3">Información General</h4>
                        <div class="space-y-2 text-sm">
                            <p><strong>Código:</strong> ${route.code}</p>
                            <p><strong>Fecha:</strong> ${this.formatDate(route.date)}</p>
                            <p><strong>Hora de inicio:</strong> ${route.startTime}</p>
                            <p><strong>Duración estimada:</strong> ${route.estimatedDuration} horas</p>
                            <p><strong>Estado:</strong> <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">${route.status}</span></p>
                        </div>
                    </div>
                    
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h4 class="font-semibold mb-3">Equipo Asignado</h4>
                        <div class="space-y-2 text-sm">
                            <p><strong>Conductor:</strong> ${route.driver}</p>
                            <p><strong>Ayudante:</strong> ${route.helper}</p>
                            <p><strong>Vehículo:</strong> ${this.getVehicleDisplayName(route.vehicle)}</p>
                        </div>
                    </div>
                </div>

                <!-- Puntos de recolección -->
                <div>
                    <h4 class="font-semibold mb-3">Puntos de Recolección</h4>
                    ${this.renderCollectionPoints(route.collectionPoints)}
                </div>

                <!-- Acciones -->
                <div class="flex justify-end space-x-3 pt-4 border-t">
                    <button onclick="document.getElementById('route-details-modal').remove()" 
                            class="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">
                        Cerrar
                    </button>
                    ${route.status === 'En Progreso' ? `
                        <button onclick="routesModule.continueRoute(${route.id}); document.getElementById('route-details-modal').remove();" 
                                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Ir a Recolección
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    },

    // Filtros para vista de operador
    filterOperatorRoutes() {
        const dateFilter = document.getElementById('operator-date-filter')?.value;
        const statusFilter = document.getElementById('operator-status-filter')?.value;
        const currentUser = app?.currentUser;
        
        let routes = this.getOperatorRoutes(currentUser);
        
        // Filtrar por fecha
        if (dateFilter !== 'all') {
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];
            
            if (dateFilter === 'today') {
                routes = routes.filter(r => r.date === todayStr);
            } else if (dateFilter === 'tomorrow') {
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                const tomorrowStr = tomorrow.toISOString().split('T')[0];
                routes = routes.filter(r => r.date === tomorrowStr);
            } else if (dateFilter === 'week') {
                const endOfWeek = new Date(today);
                endOfWeek.setDate(endOfWeek.getDate() + 7);
                routes = routes.filter(r => r.date >= todayStr && r.date <= endOfWeek.toISOString().split('T')[0]);
            }
        }
        
        // Filtrar por estado
        if (statusFilter !== 'all') {
            routes = routes.filter(r => r.status === statusFilter);
        }
        
        // Actualizar la vista
        const container = document.getElementById('operator-routes-container');
        if (container) {
            container.innerHTML = this.renderOperatorRoutes(routes);
        }
    },

    toggleRouteDetails(elementId) {
        const element = document.getElementById(elementId + '-details');
        const button = element?.parentElement.querySelector('button i');
        
        if (element) {
            element.classList.toggle('hidden');
            if (button) {
                button.className = element.classList.contains('hidden') 
                    ? 'fas fa-chevron-down mr-1' 
                    : 'fas fa-chevron-up mr-1';
            }
        }
    },

    // Utilidades
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    },

    getWasteTypeColorClass(wasteType) {
        const classes = {
            'Orgánico': 'bg-green-100 text-green-800',
            'Reciclable': 'bg-blue-100 text-blue-800',
            'No Reciclable': 'bg-gray-100 text-gray-800',
            'Peligroso': 'bg-red-100 text-red-800',
            'Mixtos': 'bg-purple-100 text-purple-800'
        };
        return classes[wasteType] || 'bg-gray-100 text-gray-800';
    },

    showTab(tabName) {
        document.querySelectorAll('.tab-link').forEach(tab => {
            tab.classList.remove('active', 'border-b-2', 'border-blue-500', 'text-blue-600');
            tab.classList.add('text-gray-500', 'hover:text-gray-700');
        });

        const activeTab = document.getElementById(`${tabName}-tab`);
        activeTab.classList.add('active', 'border-b-2', 'border-blue-500', 'text-blue-600');
        activeTab.classList.remove('text-gray-500', 'hover:text-gray-700');

        const tabContent = document.getElementById('tab-content');
        switch(tabName) {
            case 'routes':
                this.loadRoutesTab(tabContent);
                break;
            case 'vehicles':
                this.loadVehiclesTab(tabContent);
                break;
            case 'optimization':
                this.loadOptimizationTab(tabContent);
                break;
        }
    },

    // ====== Filtros ======
    getFilteredRoutes() {
        const todayStr = new Date().toISOString().slice(0,10);
        let list = [...this.routes];

        if (this.routesFilterMode === 'today') {
            list = list.filter(r => r.date === todayStr);
        }

        if (this.routesStatusFilter && this.routesStatusFilter !== 'Todos') {
            list = list.filter(r => r.status === this.routesStatusFilter);
        }

        return list;
    },

    onFilterChange() {
        const modeSel   = document.getElementById('filter-mode');
        const statusSel = document.getElementById('filter-status');
        if (modeSel)   this.routesFilterMode  = modeSel.value;
        if (statusSel) this.routesStatusFilter = statusSel.value;
        this.renderRoutesList();
    },

    renderRoutesList() {
        const listEl = document.getElementById('routes-list');
        if (!listEl) return;

        const routesToRender = this.getFilteredRoutes();

        if (!routesToRender.length) {
            listEl.innerHTML = `
                <div class="p-6 text-center text-gray-500 bg-white rounded-lg border">
                    No hay rutas para los filtros seleccionados.
                </div>
            `;
            return;
        }

        listEl.innerHTML = routesToRender.map(route => `
            <div class="border rounded-lg p-4 ${this.getRouteStatusBorderClass(route.status)}">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex-1">
                        <div class="flex items-center space-x-3 mb-2">
                            <h4 class="text-lg font-semibold">${route.name}</h4>
                            <span class="text-sm text-gray-500">${route.code}</span>
                            <span class="px-2 py-1 text-xs rounded-full ${this.getStatusClass(route.status)}">
                                ${route.status}
                            </span>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div class="flex items-center">
                                <i class="fas fa-truck mr-2"></i>
                                <span>${this.getVehicleLabelByCode(route.vehicle)}</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-user mr-2"></i>
                                <span>${route.driver}</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-clock mr-2"></i>
                                <span>${route.date} · ${route.startTime} · ${this.formatDuration(route.estimatedDuration)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="routesModule.viewRoute(${route.id})" 
                                class="text-blue-600 hover:text-blue-900" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="routesModule.editRoute(${route.id})" 
                                class="text-green-600 hover:text-green-900" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="routesModule.trackRoute(${route.id})" 
                                class="text-yellow-600 hover:text-yellow-900" title="Rastrear">
                            <i class="fas fa-map-marker-alt"></i>
                        </button>
                        <button onclick="routesModule.showAddCollectionPointModal(${route.id})" 
                                class="text-purple-600 hover:text-purple-900" title="Añadir Punto de Recolección">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                
                <div class="bg-gray-50 rounded-lg p-3">
                    <h5 class="font-medium mb-2">Puntos de Recolección (${route.collectionPoints.length})</h5>
                    <div class="space-y-2">
                        ${route.collectionPoints.map((point, index) => `
                            <div class="flex items-center justify-between text-sm">
                                <div class="flex items-center space-x-3">
                                    <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                        ${index + 1}
                                    </span>
                                    <div>
                                        <div class="font-medium">${point.client}</div>
                                        <div class="text-gray-600">${point.address}</div>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <div class="text-gray-900">${point.estimated}</div>
                                    <div class="text-gray-500">${point.wasteType}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    },

    loadRoutesTab(container) {
        const statuses = ['Todos', 'Programada', 'En Progreso', 'Completada', 'Cancelada'];

        container.innerHTML = `
            <div class="bg-white rounded-lg shadow">
                <div class="p-6 border-b">
                    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <h3 class="text-lg font-semibold">Listado de Rutas</h3>
                        <div class="flex flex-col sm:flex-row gap-3">
                            <div>
                                <label class="block text-xs text-gray-500 mb-1">Mostrar</label>
                                <select id="filter-mode" onchange="routesModule.onFilterChange()"
                                        class="w-44 px-3 py-2 border rounded-lg">
                                    <option value="today" ${this.routesFilterMode === 'today' ? 'selected' : ''}>Rutas de hoy</option>
                                    <option value="all" ${this.routesFilterMode === 'all' ? 'selected' : ''}>Todas las rutas</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs text-gray-500 mb-1">Estado</label>
                                <select id="filter-status" onchange="routesModule.onFilterChange()"
                                        class="w-44 px-3 py-2 border rounded-lg">
                                    ${statuses.map(s => `<option value="${s}" ${this.routesStatusFilter === s ? 'selected' : ''}>${s}</option>`).join('')}
                                </select>
                            </div>
                            <div class="flex items-end">
                                <button onclick="routesModule.optimizeRoutes()" class="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700">
                                    <i class="fas fa-magic mr-1"></i>Optimizar
                                </button>
                                <button onclick="routesModule.exportRoutes()" class="ml-2 bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700">
                                    <i class="fas fa-download mr-1"></i>Exportar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="p-6 space-y-6" id="routes-list">
                    <!-- aquí se renderiza la lista -->
                </div>
            </div>
        `;

        this.renderRoutesList();
    },

    loadVehiclesTab(container) {
        container.innerHTML = `
            <div class="bg-white rounded-lg shadow">
                <div class="p-6 border-b">
                    <h3 class="text-lg font-semibold">Gestión de Vehículos</h3>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehículo</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacidad</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asignado a</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            ${this.vehicles.map(vehicle => {
                                const assignedRoute = this.routes.find(r => r.vehicle === vehicle.code);
                                return `
                                    <tr>
                                        <td class="px-6 py-4 whitespace-nowrap font-medium">${vehicle.code}</td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="font-medium">${vehicle.brand} ${vehicle.model}</div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">${vehicle.capacity}</td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span class="px-2 py-1 text-xs rounded-full ${this.getVehicleStatusClass(vehicle.status)}">
                                                ${vehicle.status}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            ${assignedRoute ? `${assignedRoute.name} (${assignedRoute.driver})` : 'No asignado'}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button onclick="routesModule.viewVehicle(${vehicle.id})" class="text-blue-600 hover:text-blue-900 mr-2">Ver</button>
                                            <button onclick="routesModule.editVehicle(${vehicle.id})" class="text-green-600 hover:text-green-900">Editar</button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="mt-6 bg-white rounded-lg shadow">
                <div class="p-6 border-b">
                    <h3 class="text-lg font-semibold">Gestión de Conductores</h3>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Licencia</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ruta Asignada</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            ${this.drivers.map(driver => {
                                const assignedRoute = this.routes.find(r => r.driver === driver.name);
                                return `
                                    <tr>
                                        <td class="px-6 py-4 whitespace-nowrap font-medium">${driver.name}</td>
                                        <td class="px-6 py-4 whitespace-nowrap">${driver.license}</td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span class="px-2 py-1 text-xs rounded-full ${this.getDriverStatusClass(driver.status)}">
                                                ${driver.status}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            ${assignedRoute ? assignedRoute.name : 'No asignado'}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button onclick="routesModule.viewDriver(${driver.id})" class="text-blue-600 hover:text-blue-900 mr-2">Ver</button>
                                            <button onclick="routesModule.editDriver(${driver.id})" class="text-green-600 hover:text-green-900">Editar</button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    loadOptimizationTab(container) {
        container.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold mb-4">Optimización de Rutas</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Criterio de Optimización</label>
                            <select class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                <option>Distancia Mínima</option>
                                <option>Tiempo Mínimo</option>
                                <option>Combustible Mínimo</option>
                                <option>Capacidad Máxima</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Restricciones</label>
                            <div class="space-y-2">
                                <label class="flex items-center">
                                    <input type="checkbox" class="mr-2" checked>
                                    <span class="text-sm">Respetar horarios de clientes</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" class="mr-2" checked>
                                    <span class="text-sm">Considerar capacidad de vehículos</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" class="mr-2">
                                    <span class="text-sm">Evitar tráfico pesado</span>
                                </label>
                            </div>
                        </div>
                        <button onclick="routesModule.runOptimization()" 
                                class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                            <i class="fas fa-magic mr-2"></i>Ejecutar Optimización
                        </button>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold mb-4">Métricas de Rendimiento</h3>
                    <div class="space-y-4">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">Distancia Total Planificada:</span>
                            <span class="font-medium">245 km</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">Tiempo Estimado Total:</span>
                            <span class="font-medium">12.5 horas</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">Combustible Estimado:</span>
                            <span class="font-medium">98 litros</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">Eficiencia de Carga:</span>
                            <span class="font-medium text-green-600">87%</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">Costo Operacional:</span>
                            <span class="font-medium">$450</span>
                        </div>
                    </div>
                </div>

                <div class="lg:col-span-2 bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold mb-4">Mapa de Rutas</h3>
                    <div class="bg-gray-200 h-96 rounded-lg flex items-center justify-center">
                        <div class="text-center text-gray-500">
                            <i class="fas fa-map text-4xl mb-2"></i>
                            <p>Mapa interactivo de rutas optimizadas</p>
                            <p class="text-sm">Integración con Google Maps o similar</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // ====== Métricas / estilos ======
    getTodayRoutesCount() {
        const today = new Date().toISOString().slice(0,10);
        return this.routes.filter(r => r.date === today).length;
    },

    getCompletedRoutesCount() {
        return this.routes.filter(r => r.status === 'Completada').length;
    },

    getInProgressRoutesCount() {
        return this.routes.filter(r => r.status === 'En Progreso').length;
    },

    getActiveVehiclesCount() {
        // Un vehículo se considera "activo" si está asignado a una ruta que está "En Progreso".
        const activeVehicleCodes = this.routes
            .filter(r => r.status === 'En Progreso')
            .map(r => r.vehicle);
        // Se usa un Set para contar solo los vehículos únicos.
        return new Set(activeVehicleCodes).size;
    },

    // NUEVO: refresca las 4 tarjetas
    updateSummaryCards() {
        const elToday      = document.getElementById('metric-routes-today');
        const elCompleted  = document.getElementById('metric-routes-completed');
        const elInProgress = document.getElementById('metric-routes-inprogress');
        const elActiveVeh  = document.getElementById('metric-vehicles-active');

        if (elToday)      elToday.textContent     = this.getTodayRoutesCount();
        if (elCompleted)  elCompleted.textContent = this.getCompletedRoutesCount();
        if (elInProgress) elInProgress.textContent= this.getInProgressRoutesCount();
        if (elActiveVeh)  elActiveVeh.textContent = this.getActiveVehiclesCount();
    },

    getRouteStatusBorderClass(status) {
        const classes = {
            'Programada': 'border-blue-200',
            'En Progreso': 'border-yellow-200',
            'Completada': 'border-green-200',
            'Cancelada': 'border-red-200'
        };
        return classes[status] || 'border-gray-200';
    },

    getStatusClass(status) {
        const classes = {
            'Programada':  'bg-blue-100 text-blue-800',
            'En Progreso': 'bg-yellow-100 text-yellow-800',
            'Completada':  'bg-green-100 text-green-800',
            'Cancelada':   'bg-red-100 text-red-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    },

    getVehicleStatusClass(status) {
        const classes = {
            'Disponible':     'bg-green-100 text-green-800',
            'En Ruta':        'bg-blue-100 text-blue-800',
            'Mantenimiento':  'bg-red-100 text-red-800',
            'Fuera de Servicio': 'bg-gray-100 text-gray-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    },

    getDriverStatusClass(status) {
        const classes = {
            'Disponible':    'bg-green-100 text-green-800',
            'En Ruta':       'bg-blue-100 text-blue-800',
            'Descanso':      'bg-yellow-100 text-yellow-800',
            'No Disponible': 'bg-red-100 text-red-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    },

    formatDate(date) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('es-ES', options);
    },

    // ====== CRUD de Rutas ======
    showNewRouteModal() {
        if (!this.vehicles || !Array.isArray(this.vehicles)) this.vehicles = [];
        if (!this.drivers  || !Array.isArray(this.drivers))  this.drivers  = [];

        const hasVehicles = this.vehicles.length > 0;
        const hasDrivers  = this.drivers.length  > 0;

        const vehicleOptions = hasVehicles
            ? this.vehicles.map(v => `
                <option value="${v.code}">
                    ${v.brand} ${v.model} (${v.code}) · ${v.status}
                </option>`).join('')
            : '';

        const driverOptions = hasDrivers
            ? this.drivers.map(d => `<option value="${d.name}">${d.name}</option>`).join('')
            : '';

        const modalHTML = `
            <div id="new-route-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 w-full max-w-lg">
                    <h3 class="text-lg font-semibold mb-4">Nueva Ruta</h3>
                    <form id="new-route-form">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Nombre de la Ruta</label>
                                <input type="text" id="route-name" class="w-full px-3 py-2 border rounded-lg" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Código de Ruta</label>
                                <input type="text" id="route-code" class="w-full px-3 py-2 border rounded-lg" required>
                            </div>

                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-gray-700">Vehículo</label>
                                ${hasVehicles ? `
                                    <select id="route-vehicle" class="w-full px-3 py-2 border rounded-lg" required>
                                        ${vehicleOptions}
                                    </select>
                                ` : `
                                    <div class="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                                        No hay vehículos cargados. Agrega vehículos en la pestaña “Vehículos”.
                                    </div>
                                `}
                            </div>

                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-gray-700">Conductor</label>
                                ${hasDrivers ? `
                                    <select id="route-driver" class="w-full px-3 py-2 border rounded-lg" required>
                                        ${driverOptions}
                                    </select>
                                ` : `
                                    <div class="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                                        No hay conductores cargados. Agrega conductores en la pestaña “Vehículos”.
                                    </div>
                                `}
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700">Ayudante</label>
                                <input type="text" id="route-helper" class="w-full px-3 py-2 border rounded-lg">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Fecha</label>
                                <input type="date" id="route-date" class="w-full px-3 py-2 border rounded-lg" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Hora de Inicio</label>
                                <input type="time" id="route-start-time" class="w-full px-3 py-2 border rounded-lg" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Duración Estimada (horas)</label>
                                <input type="number" id="route-estimated-duration" class="w-full px-3 py-2 border rounded-lg"
                                       min="0.5" step="0.5" placeholder="4" required>
                            </div>
                        </div>

                        <div class="flex justify-end space-x-4 mt-6">
                            <button type="button" onclick="document.getElementById('new-route-modal').remove()" class="px-4 py-2 border rounded-lg">Cancelar</button>
                            <button type="submit" id="btn-create-route" class="px-4 py-2 bg-blue-600 text-white rounded-lg" ${hasVehicles && hasDrivers ? '' : 'disabled'}>
                                Crear Ruta
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const dateInp = document.getElementById('route-date');
        if (dateInp) dateInp.min = new Date().toISOString().slice(0,10);

        const form = document.getElementById('new-route-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveNewRoute();
            document.getElementById('new-route-modal').remove();
        });
    },

    saveNewRoute() {
        const name = (document.getElementById('route-name')?.value || '').trim();
        const code = (document.getElementById('route-code')?.value || '').trim();
        const veh  = (document.getElementById('route-vehicle')?.value || '').trim();
        const drv  = (document.getElementById('route-driver')?.value || '').trim();
        const help = (document.getElementById('route-helper')?.value || '').trim();
        const date = (document.getElementById('route-date')?.value || '').trim();
        const time = (document.getElementById('route-start-time')?.value || '').trim();
        const durI = document.getElementById('route-estimated-duration')?.value;

        if (!name || !code || !veh || !drv || !date || !time || !durI) {
            authSystem.showNotification('Completa los campos obligatorios', 'error');
            return;
        }

        const dur = this.parseDurationHours(durI);
        if (!isFinite(dur) || dur <= 0) {
            authSystem.showNotification('Duración inválida. Usa un número de horas mayor a 0.', 'error');
            return;
        }

        const conflict = this.findVehicleConflict(veh, date, time, dur, null);
        if (conflict) {
            authSystem.showNotification(
                `Choque de horario para el vehículo ${veh} con la ruta "${conflict.name}" (${conflict.code}) a las ${conflict.startTime}.`,
                'error'
            );
            return;
        }

        const newRoute = {
            id: this.routes.length > 0 ? Math.max(...this.routes.map(r => r.id)) + 1 : 1,
            name, code,
            vehicle: veh,
            driver: drv,
            helper: help,
            date,
            startTime: time,
            estimatedDuration: dur,
            status: 'Programada',
            collectionPoints: []
        };

        this.routes.push(newRoute);
        this.saveAll();
        this.renderRoutesList();     // mantiene los filtros visibles
        this.updateSummaryCards();   // <— REFRESCA TARJETAS
        authSystem.showNotification('Ruta creada exitosamente', 'success');
    },

    viewRoute(id) {
        const route = this.routes.find(r => r.id === id);
        if (!route) return;

        const modalHTML = `
            <div id="view-route-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 w-full max-w-lg">
                    <h3 class="text-lg font-semibold mb-4">Detalles de la Ruta</h3>
                    <div class="space-y-1">
                        <p><strong>Nombre:</strong> ${route.name}</p>
                        <p><strong>Código:</strong> ${route.code}</p>
                        <p><strong>Vehículo:</strong> ${this.getVehicleLabelByCode(route.vehicle)}</p>
                        <p><strong>Conductor:</strong> ${route.driver}</p>
                        <p><strong>Ayudante:</strong> ${route.helper || '—'}</p>
                        <p><strong>Fecha:</strong> ${route.date}</p>
                        <p><strong>Hora de Inicio:</strong> ${route.startTime}</p>
                        <p><strong>Duración Estimada:</strong> ${this.formatDuration(route.estimatedDuration)}</p>
                        <p><strong>Estado:</strong> ${route.status}</p>
                    </div>
                    <div class="flex justify-end mt-6">
                        <button type="button" onclick="document.getElementById('view-route-modal').remove()" class="px-4 py-2 border rounded-lg">Cerrar</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    editRoute(id) {
        const route = this.routes.find(r => r.id === id);
        if (!route) return;

        const modalHTML = `
            <div id="edit-route-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 w-full max-w-lg">
                    <h3 class="text-lg font-semibold mb-4">Editar Ruta</h3>
                    <form id="edit-route-form">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Nombre de la Ruta</label>
                                <input type="text" id="edit-route-name" class="w-full px-3 py-2 border rounded-lg" value="${route.name}" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Código de Ruta</label>
                                <input type="text" id="edit-route-code" class="w-full px-3 py-2 border rounded-lg" value="${route.code}" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Vehículo</label>
                                <select id="edit-route-vehicle" class="w-full px-3 py-2 border rounded-lg" required>
                                    ${this.vehicles.map(v => `
                                        <option value="${v.code}" ${route.vehicle === v.code ? 'selected' : ''}>
                                            ${v.brand} ${v.model} (${v.code}) · ${v.status}
                                        </option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Conductor</label>
                                <select id="edit-route-driver" class="w-full px-3 py-2 border rounded-lg" required>
                                    ${this.drivers.map(d => `<option value="${d.name}" ${route.driver === d.name ? 'selected' : ''}>${d.name}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Ayudante</label>
                                <input type="text" id="edit-route-helper" class="w-full px-3 py-2 border rounded-lg" value="${route.helper || ''}">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Fecha</label>
                                <input type="date" id="edit-route-date" class="w-full px-3 py-2 border rounded-lg" value="${route.date}" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Hora de Inicio</label>
                                <input type="time" id="edit-route-start-time" class="w-full px-3 py-2 border rounded-lg" value="${route.startTime}" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Duración Estimada (horas)</label>
                                <input type="number" id="edit-route-estimated-duration" class="w-full px-3 py-2 border rounded-lg" value="${this.parseDurationHours(route.estimatedDuration)}" min="0.5" step="0.5" required>
                            </div>
                        </div>
                        <div class="flex justify-end space-x-4 mt-6">
                            <button type="button" onclick="document.getElementById('edit-route-modal').remove()" class="px-4 py-2 border rounded-lg">Cancelar</button>
                            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg">Guardar Cambios</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const form = document.getElementById('edit-route-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateRoute(id);
            document.getElementById('edit-route-modal').remove();
        });
    },

    updateRoute(id) {
        const routeIndex = this.routes.findIndex(r => r.id === id);
        if (routeIndex === -1) return;

        const veh  = (document.getElementById('edit-route-vehicle')?.value || '').trim();
        const date = (document.getElementById('edit-route-date')?.value || '').trim();
        const time = (document.getElementById('edit-route-start-time')?.value || '').trim();
        const durI = document.getElementById('edit-route-estimated-duration')?.value;

        const dur  = this.parseDurationHours(durI);
        if (!isFinite(dur) || dur <= 0) {
            authSystem.showNotification('Duración inválida. Usa un número de horas mayor a 0.', 'error');
            return;
        }

        const conflict = this.findVehicleConflict(veh, date, time, dur, id);
        if (conflict) {
            authSystem.showNotification(
                `Choque de horario para el vehículo ${veh} con la ruta "${conflict.name}" (${conflict.code}) a las ${conflict.startTime}.`,
                'error'
            );
            return;
        }

        const updatedRoute = {
            id,
            name: document.getElementById('edit-route-name').value,
            code: document.getElementById('edit-route-code').value,
            vehicle: veh,
            driver: document.getElementById('edit-route-driver').value,
            helper: document.getElementById('edit-route-helper').value,
            date,
            startTime: time,
            estimatedDuration: dur,
            status: this.routes[routeIndex].status,
            collectionPoints: this.routes[routeIndex].collectionPoints
        };

        this.routes[routeIndex] = updatedRoute;
        this.saveAll();
        this.renderRoutesList();
        this.updateSummaryCards(); // <— REFRESCA TARJETAS
        authSystem.showNotification('Ruta actualizada exitosamente', 'success');
    },

    // ====== Otras acciones ======
    trackRoute(id) {
        authSystem.showNotification('Rastreando ruta...', 'info');
    },

    optimizeRoutes() {
        authSystem.showNotification('Optimizando rutas...', 'info');
        setTimeout(() => {
            authSystem.showNotification('Rutas optimizadas exitosamente', 'success');
        }, 2000);
    },

    exportRoutes() {
        const routesToExport = this.getFilteredRoutes();

        if (routesToExport.length === 0) {
            authSystem.showNotification('No hay rutas para exportar con los filtros actuales.', 'warning');
            return;
        }

        // Definir las cabeceras del CSV
        const headers = [
            'ID', 'Nombre', 'Codigo', 'Vehiculo', 'Conductor', 'Ayudante',
            'Fecha', 'Hora de Inicio', 'Duracion Estimada (h)', 'Estado',
            'Puntos de Recoleccion'
        ];

        // Convertir cada ruta a una fila de CSV
        const csvRows = routesToExport.map(route => {
            // Convertir los puntos de recolección en un solo string
            const collectionPointsStr = route.collectionPoints
                .map(p => `[${p.client} en ${p.address} - ${p.estimated} ${p.wasteType}]`)
                .join('; ');

            const row = [
                route.id,
                `"${(route.name || '').replace(/"/g, '"')}"`,
                `"${(route.code || '').replace(/"/g, '"')}"`,
                `"${(route.vehicle || '').replace(/"/g, '"')}"`,
                `"${(route.driver || '').replace(/"/g, '"')}"`,
                `"${(route.helper || '').replace(/"/g, '"')}"`,
                route.date,
                route.startTime,
                route.estimatedDuration,
                route.status,
                `"${collectionPointsStr.replace(/"/g, '"')}"` // Escapar comillas dobles
            ];
            return row.join(',');
        });

        // Unir cabeceras y filas
        const csvContent = [headers.join(','), ...csvRows].join('\n');

        // Crear un Blob y simular el clic para descargar
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');

        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            const today = new Date().toISOString().slice(0, 10);
            link.setAttribute('href', url);
            link.setAttribute('download', `export_rutas_${today}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            authSystem.showNotification('Rutas exportadas exitosamente.', 'success');
        } else {
            authSystem.showNotification('La exportación automática no es compatible con este navegador.', 'error');
        }
    },

    runOptimization() {
        authSystem.showNotification('Ejecutando optimización...', 'info');
        setTimeout(() => {
            authSystem.showNotification('Optimización completada', 'success');
        }, 3000);
    },

    // ====== Vehículos ======
    viewVehicle(id) {
        const vehicle = this.vehicles.find(v => v.id === id);
        if (!vehicle) return;

        const modalHTML = `
            <div id="view-vehicle-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 w-full max-w-lg">
                    <h3 class="text-lg font-semibold mb-4">Detalles del Vehículo</h3>
                    <div>
                        <p><strong>Código:</strong> ${vehicle.code}</p>
                        <p><strong>Marca:</strong> ${vehicle.brand}</p>
                        <p><strong>Modelo:</strong> ${vehicle.model}</p>
                        <p><strong>Capacidad:</strong> ${vehicle.capacity}</p>
                        <p><strong>Estado:</strong> ${vehicle.status}</p>
                    </div>
                    <div class="flex justify-end mt-6">
                        <button type="button" onclick="document.getElementById('view-vehicle-modal').remove()" class="px-4 py-2 border rounded-lg">Cerrar</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    editVehicle(id) {
        const vehicle = this.vehicles.find(v => v.id === id);
        if (!vehicle) return;

        const modalHTML = `
            <div id="edit-vehicle-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 w-full max-w-lg">
                    <h3 class="text-lg font-semibold mb-4">Editar Vehículo</h3>
                    <form id="edit-vehicle-form">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Código</label>
                                <input type="text" id="edit-vehicle-code" class="w-full px-3 py-2 border rounded-lg" value="${vehicle.code}" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Marca</label>
                                <input type="text" id="edit-vehicle-brand" class="w-full px-3 py-2 border rounded-lg" value="${vehicle.brand}" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Modelo</label>
                                <input type="text" id="edit-vehicle-model" class="w-full px-3 py-2 border rounded-lg" value="${vehicle.model}" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Capacidad</label>
                                <input type="text" id="edit-vehicle-capacity" class="w-full px-3 py-2 border rounded-lg" value="${vehicle.capacity}" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Estado</label>
                                <select id="edit-vehicle-status" class="w-full px-3 py-2 border rounded-lg" required>
                                    <option value="Disponible" ${vehicle.status === 'Disponible' ? 'selected' : ''}>Disponible</option>
                                    <option value="En Ruta" ${vehicle.status === 'En Ruta' ? 'selected' : ''}>En Ruta</option>
                                    <option value="Mantenimiento" ${vehicle.status === 'Mantenimiento' ? 'selected' : ''}>Mantenimiento</option>
                                    <option value="Fuera de Servicio" ${vehicle.status === 'Fuera de Servicio' ? 'selected' : ''}>Fuera de Servicio</option>
                                </select>
                            </div>
                        </div>
                        <div class="flex justify-end space-x-4 mt-6">
                            <button type="button" onclick="document.getElementById('edit-vehicle-modal').remove()" class="px-4 py-2 border rounded-lg">Cancelar</button>
                            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg">Guardar Cambios</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const form = document.getElementById('edit-vehicle-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateVehicle(id);
            document.getElementById('edit-vehicle-modal').remove();
        });
    },

    updateVehicle(id) {
        const vehicleIndex = this.vehicles.findIndex(v => v.id === id);
        if (vehicleIndex === -1) return;

        const updatedVehicle = {
            id,
            code: document.getElementById('edit-vehicle-code').value,
            brand: document.getElementById('edit-vehicle-brand').value,
            model: document.getElementById('edit-vehicle-model').value,
            capacity: document.getElementById('edit-vehicle-capacity').value,
            status: document.getElementById('edit-vehicle-status').value
        };

        this.vehicles[vehicleIndex] = updatedVehicle;
        this.loadVehiclesTab(document.getElementById('tab-content'));
        this.updateSummaryCards(); // <— REFRESCA TARJETAS (vehículos activos)
        authSystem.showNotification('Vehículo actualizado exitosamente', 'success');
    },

    // ====== Conductores ======
    viewDriver(id) {
        const driver = this.drivers.find(d => d.id === id);
        if (!driver) return;

        const modalHTML = `
            <div id="view-driver-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 w-full max-w-lg">
                    <h3 class="text-lg font-semibold mb-4">Detalles del Conductor</h3>
                    <div>
                        <p><strong>Nombre:</strong> ${driver.name}</p>
                        <p><strong>Licencia:</strong> ${driver.license}</p>
                        <p><strong>Estado:</strong> ${driver.status}</p>
                    </div>
                    <div class="flex justify-end mt-6">
                        <button type="button" onclick="document.getElementById('view-driver-modal').remove()" class="px-4 py-2 border rounded-lg">Cerrar</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    editDriver(id) {
        const driver = this.drivers.find(d => d.id === id);
        if (!driver) return;

        const modalHTML = `
            <div id="edit-driver-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 w-full max-w-lg">
                    <h3 class="text-lg font-semibold mb-4">Editar Conductor</h3>
                    <form id="edit-driver-form">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Nombre</label>
                                <input type="text" id="edit-driver-name" class="w-full px-3 py-2 border rounded-lg" value="${driver.name}" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Licencia</label>
                                <input type="text" id="edit-driver-license" class="w-full px-3 py-2 border rounded-lg" value="${driver.license}" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Estado</label>
                                <select id="edit-driver-status" class="w-full px-3 py-2 border rounded-lg" required>
                                    <option value="Disponible" ${driver.status === 'Disponible' ? 'selected' : ''}>Disponible</option>
                                    <option value="En Ruta" ${driver.status === 'En Ruta' ? 'selected' : ''}>En Ruta</option>
                                    <option value="Descanso" ${driver.status === 'Descanso' ? 'selected' : ''}>Descanso</option>
                                    <option value="No Disponible" ${driver.status === 'No Disponible' ? 'selected' : ''}>No Disponible</option>
                                </select>
                            </div>
                        </div>
                        <div class="flex justify-end space-x-4 mt-6">
                            <button type="button" onclick="document.getElementById('edit-driver-modal').remove()" class="px-4 py-2 border rounded-lg">Cancelar</button>
                            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg">Guardar Cambios</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const form = document.getElementById('edit-driver-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateDriver(id);
            document.getElementById('edit-driver-modal').remove();
        });
    },

    updateDriver(id) {
        const driverIndex = this.drivers.findIndex(d => d.id === id);
        if (driverIndex === -1) return;

        const updatedDriver = {
            id,
            name: document.getElementById('edit-driver-name').value,
            license: document.getElementById('edit-driver-license').value,
            status: document.getElementById('edit-driver-status').value
        };

        this.drivers[driverIndex] = updatedDriver;
        this.loadVehiclesTab(document.getElementById('tab-content'));
        authSystem.showNotification('Conductor actualizado exitosamente', 'success');
    },

    // ====== Puntos de recolección ======
    showAddCollectionPointModal(routeId) {
        if (!window.servicesModule || typeof servicesModule.getApprovedServices !== 'function') {
            const modalWarn = `
                <div id="add-collection-point-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div class="bg-white rounded-lg p-6 w-full max-w-lg">
                        <h3 class="text-lg font-semibold mb-4">Añadir Punto de Recolección</h3>
                        <p class="text-sm text-red-600">No se encontró el módulo de Servicios o la función getApprovedServices(). Verifica que <strong>services.js</strong> esté cargado antes que <strong>routes.js</strong>.</p>
                        <div class="flex justify-end mt-6">
                            <button type="button" onclick="document.getElementById('add-collection-point-modal').remove()" class="px-4 py-2 border rounded-lg">Cerrar</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalWarn);
            return;
        }

        const allCollectionPoints = this.routes.flatMap(r => r.collectionPoints);
        const approvedServices = servicesModule.getApprovedServices();

        const availableServices = approvedServices.filter(service => {
            return !allCollectionPoints.some(point => point.address === service.address && point.client === service.clientName);
        });

        const modalHTML = `
            <div id="add-collection-point-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 w-full max-w-lg">
                    <h3 class="text-lg font-semibold mb-4">Añadir Punto de Recolección</h3>
                    ${availableServices.length ? `
                        <form id="add-collection-point-form">
                            <div class="space-y-2 max-h-72 overflow-auto pr-1">
                                ${availableServices.map(service => `
                                    <label class="flex items-center">
                                        <input type="checkbox" class="mr-2" name="service" value="${service.id}">
                                        <span>${service.clientName} — ${service.address} <span class="text-xs text-gray-500">(${service.wasteType}, ${service.estimatedVolume} ${service.volumeUnit || 'm³'})</span></span>
                                    </label>
                                `).join('')}
                            </div>
                            <div class="flex justify-end space-x-4 mt-6">
                                <button type="button" onclick="document.getElementById('add-collection-point-modal').remove()" class="px-4 py-2 border rounded-lg">Cancelar</button>
                                <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg">Añadir Puntos</button>
                            </div>
                        </form>
                    ` : `
                        <div class="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                            No hay solicitudes <strong>aprobadas</strong> disponibles para asignar.
                        </div>
                        <div class="flex justify-end mt-6">
                            <button type="button" onclick="document.getElementById('add-collection-point-modal').remove()" class="px-4 py-2 border rounded-lg">Cerrar</button>
                        </div>
                    `}
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const form = document.getElementById('add-collection-point-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveCollectionPoints(routeId);
                document.getElementById('add-collection-point-modal').remove();
            });
        }
    },

    saveCollectionPoints(routeId) {
        const route = this.routes.find(r => r.id === routeId);
        if (!route) return;

        const selectedServices = Array.from(document.querySelectorAll('#add-collection-point-form input[name="service"]:checked'))
            .map(checkbox => parseInt(checkbox.value));

        selectedServices.forEach(serviceId => {
            const service = servicesModule.services.find(s => s.id === serviceId);
            if (service) {
                const newCollectionPoint = {
                    address: service.address,
                    client: service.clientName,
                    wasteType: service.wasteType,
                    estimated: `${service.estimatedVolume} ${service.volumeUnit || 'm³'}`
                };
                route.collectionPoints.push(newCollectionPoint);
            }
        });

        this.saveAll();
        this.renderRoutesList();
        authSystem.showNotification('Puntos de recolección añadidos exitosamente', 'success');
    }
};
