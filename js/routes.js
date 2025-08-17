window.routesModule = {
    routes: [
        {
            id: 1,
            name: 'Ruta Norte A',
            code: 'R-001',
            vehicle: 'Camión C-001',
            driver: 'Carlos Rodríguez',
            helper: 'Ana García',
            date: '2024-01-16',
            startTime: '08:00',
            estimatedDuration: '4 horas',
            status: 'Programada',
            collectionPoints: [
                { address: 'Av. Principal 123', client: 'Empresa ABC', wasteType: 'Orgánico', estimated: '2.5 m³' },
                { address: 'Calle Norte 456', client: 'Oficinas XYZ', wasteType: 'Reciclable', estimated: '1.8 m³' },
                { address: 'Av. Central 789', client: 'Hotel Plaza', wasteType: 'Orgánico', estimated: '3.2 m³' }
            ]
        },
        {
            id: 2,
            name: 'Ruta Centro B',
            code: 'R-002',
            vehicle: 'Camión C-002',
            driver: 'Luis Martínez',
            helper: 'Pedro Silva',
            date: '2024-01-16',
            startTime: '13:00',
            estimatedDuration: '3.5 horas',
            status: 'En Progreso',
            collectionPoints: [
                { address: 'Plaza Mayor 100', client: 'Restaurante Central', wasteType: 'Orgánico', estimated: '4.1 m³' },
                { address: 'Calle Comercio 250', client: 'Tienda Moderna', wasteType: 'Reciclable', estimated: '0.8 m³' }
            ]
        }
    ],

    vehicles: [
        { id: 1, code: 'C-001', brand: 'Mercedes', model: 'Actros', capacity: '15 m³', status: 'Disponible' },
        { id: 2, code: 'C-002', brand: 'Volvo', model: 'FH', capacity: '18 m³', status: 'En Ruta' },
        { id: 3, code: 'C-003', brand: 'Scania', model: 'R450', capacity: '20 m³', status: 'Mantenimiento' }
    ],

    drivers: [
        { id: 1, name: 'Carlos Rodríguez', license: 'A-12345', status: 'Disponible' },
        { id: 2, name: 'Luis Martínez', license: 'A-67890', status: 'En Ruta' },
        { id: 3, name: 'Miguel Torres', license: 'A-11223', status: 'Disponible' }
    ],

    load() {
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

            <!-- Route Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-blue-100">Rutas Hoy</p>
                            <p class="text-3xl font-bold">${this.getTodayRoutesCount()}</p>
                        </div>
                        <i class="fas fa-route text-4xl text-blue-200"></i>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-green-100">Completadas</p>
                            <p class="text-3xl font-bold">${this.getCompletedRoutesCount()}</p>
                        </div>
                        <i class="fas fa-check-circle text-4xl text-green-200"></i>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-yellow-100">En Progreso</p>
                            <p class="text-3xl font-bold">${this.getInProgressRoutesCount()}</p>
                        </div>
                        <i class="fas fa-truck text-4xl text-yellow-200"></i>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-purple-100">Vehículos Activos</p>
                            <p class="text-3xl font-bold">${this.getActiveVehiclesCount()}</p>
                        </div>
                        <i class="fas fa-truck-moving text-4xl text-purple-200"></i>
                    </div>
                </div>
            </div>

            <!-- Tabs Navigation -->
            <div class="mb-6">
                <nav class="flex space-x-8">
                    <a href="#" onclick="routesModule.showTab('routes')" id="routes-tab" 
                       class="tab-link active border-b-2 border-blue-500 text-blue-600 py-2 px-1 font-medium">
                        Rutas del Día
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

            <!-- Tab Content -->
            <div id="tab-content">
                <!-- Content will be loaded here -->
            </div>
        `;

        this.showTab('routes');
    },

    showTab(tabName) {
        // Update tab navigation
        document.querySelectorAll('.tab-link').forEach(tab => {
            tab.classList.remove('active', 'border-b-2', 'border-blue-500', 'text-blue-600');
            tab.classList.add('text-gray-500', 'hover:text-gray-700');
        });

        const activeTab = document.getElementById(`${tabName}-tab`);
        activeTab.classList.add('active', 'border-b-2', 'border-blue-500', 'text-blue-600');
        activeTab.classList.remove('text-gray-500', 'hover:text-gray-700');

        // Load tab content
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

    loadRoutesTab(container) {
        container.innerHTML = `
            <div class="bg-white rounded-lg shadow">
                <div class="p-6 border-b">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-semibold">Rutas del Día - ${this.formatDate(new Date())}</h3>
                        <div class="flex space-x-2">
                            <button onclick="routesModule.optimizeRoutes()" class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                                <i class="fas fa-magic mr-1"></i>Optimizar
                            </button>
                            <button onclick="routesModule.exportRoutes()" class="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
                                <i class="fas fa-download mr-1"></i>Exportar
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="p-6 space-y-6">
                    ${this.routes.map(route => `
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
                                            <span>${route.vehicle}</span>
                                        </div>
                                        <div class="flex items-center">
                                            <i class="fas fa-user mr-2"></i>
                                            <span>${route.driver}</span>
                                        </div>
                                        <div class="flex items-center">
                                            <i class="fas fa-clock mr-2"></i>
                                            <span>${route.startTime} - ${route.estimatedDuration}</span>
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
                    `).join('')}
                </div>
            </div>
        `;
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
                                            <div>
                                                <div class="font-medium">${vehicle.brand} ${vehicle.model}</div>
                                            </div>
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

    // Helper methods
    getTodayRoutesCount() {
        return this.routes.length;
    },

    getCompletedRoutesCount() {
        return this.routes.filter(r => r.status === 'Completada').length;
    },

    getInProgressRoutesCount() {
        return this.routes.filter(r => r.status === 'En Progreso').length;
    },

    getActiveVehiclesCount() {
        return this.vehicles.filter(v => v.status === 'En Ruta').length;
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
            'Programada': 'bg-blue-100 text-blue-800',
            'En Progreso': 'bg-yellow-100 text-yellow-800',
            'Completada': 'bg-green-100 text-green-800',
            'Cancelada': 'bg-red-100 text-red-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    },

    getVehicleStatusClass(status) {
        const classes = {
            'Disponible': 'bg-green-100 text-green-800',
            'En Ruta': 'bg-blue-100 text-blue-800',
            'Mantenimiento': 'bg-red-100 text-red-800',
            'Fuera de Servicio': 'bg-gray-100 text-gray-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    },

    getDriverStatusClass(status) {
        const classes = {
            'Disponible': 'bg-green-100 text-green-800',
            'En Ruta': 'bg-blue-100 text-blue-800',
            'Descanso': 'bg-yellow-100 text-yellow-800',
            'No Disponible': 'bg-red-100 text-red-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    },

    formatDate(date) {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('es-ES', options);
    },

    saveNewRoute() {
        const newRoute = {
            id: this.routes.length + 1,
            name: document.getElementById('route-name').value,
            code: document.getElementById('route-code').value,
            vehicle: document.getElementById('route-vehicle').value,
            driver: document.getElementById('route-driver').value,
            helper: document.getElementById('route-helper').value,
            date: document.getElementById('route-date').value,
            startTime: document.getElementById('route-start-time').value,
            estimatedDuration: document.getElementById('route-estimated-duration').value,
            status: 'Programada',
            collectionPoints: []
        };
        this.routes.push(newRoute);
        this.loadRoutesTab(document.getElementById('tab-content'));
        authSystem.showNotification('Ruta creada exitosamente', 'success');
    },

    viewRoute(id) {
        const route = this.routes.find(r => r.id === id);
        if (!route) return;

        const modalHTML = `
            <div id="view-route-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 w-full max-w-lg">
                    <h3 class="text-lg font-semibold mb-4">Detalles de la Ruta</h3>
                    <div>
                        <p><strong>Nombre:</strong> ${route.name}</p>
                        <p><strong>Código:</strong> ${route.code}</p>
                        <p><strong>Vehículo:</strong> ${route.vehicle}</p>
                        <p><strong>Conductor:</strong> ${route.driver}</p>
                        <p><strong>Ayudante:</strong> ${route.helper}</p>
                        <p><strong>Fecha:</strong> ${route.date}</p>
                        <p><strong>Hora de Inicio:</strong> ${route.startTime}</p>
                        <p><strong>Duración Estimada:</strong> ${route.estimatedDuration}</p>
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
                                    ${this.vehicles.map(v => `<option value="${v.code}" ${route.vehicle === v.code ? 'selected' : ''}>${v.brand} ${v.model} (${v.code})</option>`).join('')}
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
                                <input type="text" id="edit-route-helper" class="w-full px-3 py-2 border rounded-lg" value="${route.helper}">
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
                                <label class="block text-sm font-medium text-gray-700">Duración Estimada</label>
                                <input type="text" id="edit-route-estimated-duration" class="w-full px-3 py-2 border rounded-lg" value="${route.estimatedDuration}" required>
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

        const updatedRoute = {
            id: id,
            name: document.getElementById('edit-route-name').value,
            code: document.getElementById('edit-route-code').value,
            vehicle: document.getElementById('edit-route-vehicle').value,
            driver: document.getElementById('edit-route-driver').value,
            helper: document.getElementById('edit-route-helper').value,
            date: document.getElementById('edit-route-date').value,
            startTime: document.getElementById('edit-route-start-time').value,
            estimatedDuration: document.getElementById('edit-route-estimated-duration').value,
            status: this.routes[routeIndex].status,
            collectionPoints: this.routes[routeIndex].collectionPoints
        };

        this.routes[routeIndex] = updatedRoute;
        this.loadRoutesTab(document.getElementById('tab-content'));
        authSystem.showNotification('Ruta actualizada exitosamente', 'success');
    },

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
        authSystem.showNotification('Exportando rutas...', 'info');
    },

    runOptimization() {
        authSystem.showNotification('Ejecutando optimización...', 'info');
        setTimeout(() => {
            authSystem.showNotification('Optimización completada', 'success');
        }, 3000);
    },

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
            id: id,
            code: document.getElementById('edit-vehicle-code').value,
            brand: document.getElementById('edit-vehicle-brand').value,
            model: document.getElementById('edit-vehicle-model').value,
            capacity: document.getElementById('edit-vehicle-capacity').value,
            status: document.getElementById('edit-vehicle-status').value
        };

        this.vehicles[vehicleIndex] = updatedVehicle;
        this.loadVehiclesTab(document.getElementById('tab-content'));
        authSystem.showNotification('Vehículo actualizado exitosamente', 'success');
    },

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
            id: id,
            name: document.getElementById('edit-driver-name').value,
            license: document.getElementById('edit-driver-license').value,
            status: document.getElementById('edit-driver-status').value
        };

        this.drivers[driverIndex] = updatedDriver;
        this.loadVehiclesTab(document.getElementById('tab-content'));
        authSystem.showNotification('Conductor actualizado exitosamente', 'success');
    },

    showAddCollectionPointModal(routeId) {
        const allCollectionPoints = this.routes.flatMap(r => r.collectionPoints);
        const approvedServices = servicesModule.getApprovedServices();

        const availableServices = approvedServices.filter(service => {
            return !allCollectionPoints.some(point => point.address === service.address && point.client === service.clientName);
        });

        const modalHTML = `
            <div id="add-collection-point-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 w-full max-w-lg">
                    <h3 class="text-lg font-semibold mb-4">Añadir Punto de Recolección</h3>
                    <form id="add-collection-point-form">
                        <div class="space-y-2">
                            ${availableServices.map(service => `
                                <label class="flex items-center">
                                    <input type="checkbox" class="mr-2" name="service" value="${service.id}">
                                    <span>${service.clientName} - ${service.address}</span>
                                </label>
                            `).join('')}
                        </div>
                        <div class="flex justify-end space-x-4 mt-6">
                            <button type="button" onclick="document.getElementById('add-collection-point-modal').remove()" class="px-4 py-2 border rounded-lg">Cancelar</button>
                            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg">Añadir Puntos</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const form = document.getElementById('add-collection-point-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCollectionPoints(routeId);
            document.getElementById('add-collection-point-modal').remove();
        });
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
                    estimated: service.estimatedVolume
                };
                route.collectionPoints.push(newCollectionPoint);
            }
        });

        this.loadRoutesTab(document.getElementById('tab-content'));
        authSystem.showNotification('Puntos de recolección añadidos exitosamente', 'success');
    },

    showNewRouteModal() {
        const availableVehicles = this.vehicles.filter(v => v.status === 'Disponible');
        const availableDrivers = this.drivers.filter(d => d.status === 'Disponible');

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
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Vehículo</label>
                                <select id="route-vehicle" class="w-full px-3 py-2 border rounded-lg" required>
                                    ${availableVehicles.map(v => `<option value="${v.code}">${v.brand} ${v.model} (${v.code})</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Conductor</label>
                                <select id="route-driver" class="w-full px-3 py-2 border rounded-lg" required>
                                    ${availableDrivers.map(d => `<option value="${d.name}">${d.name}</option>`).join('')}
                                </select>
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
                                <label class="block text-sm font-medium text-gray-700">Duración Estimada</label>
                                <input type="text" id="route-estimated-duration" class="w-full px-3 py-2 border rounded-lg" required>
                            </div>
                        </div>
                        <div class="flex justify-end space-x-4 mt-6">
                            <button type="button" onclick="document.getElementById('new-route-modal').remove()" class="px-4 py-2 border rounded-lg">Cancelar</button>
                            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg">Crear Ruta</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const form = document.getElementById('new-route-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveNewRoute();
            document.getElementById('new-route-modal').remove();
        });
    }
};