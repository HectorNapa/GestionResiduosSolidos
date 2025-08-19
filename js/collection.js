window.collectionModule = {
    collections: [
        {
            id: 1,
            routeId: 1,
            clientName: 'Empresa ABC S.A.',
            address: 'Av. Principal 123',
            wasteType: 'Orgánico',
            estimatedVolume: '2.5',
            actualVolume: '2.8',
            collectionDate: '2024-01-15',
            collectionTime: '09:30',
            status: 'Completado',
            operator: 'Carlos Rodríguez',
            vehicle: 'C-001',
            weight: '1.2',
            photos: ['evidence1.jpg', 'evidence2.jpg'],
            clientSignature: true,
            notes: 'Recolección sin inconvenientes'
        }
    ],

    // ========== NUEVAS FUNCIONALIDADES ==========
    
    // Gestión de turnos y estado del operador
    operatorShifts: [],
    currentShift: null,
    offlineQueue: [],
    isOffline: false,
    
    // Control de vehículos múltiples
    vehicleLicenseMap: {
        'A-12345': ['C-001', 'C-002'], // Carlos puede manejar ambos
        'A-67890': ['C-002', 'C-003'], // Luis puede manejar C-002 y C-003
        'A-11223': ['C-001', 'C-003']  // Miguel puede manejar C-001 y C-003
    },

    // Sistema de pesaje automático
    weighingIntegration: {
        connected: false,
        lastReading: null,
        autoCapture: true
    },

    // Comunicaciones y notificaciones
    notifications: [],
    pendingRouteChanges: [],

    // --- Main loader based on user role ---
    load() {
        const user = app.currentUser;
        if (!user) {
            document.getElementById('content-area').innerHTML = '<p>Error: No se pudo identificar al usuario.</p>';
            return;
        }

        // Inicializar sistemas avanzados para operadores
        if (user.type === 'operator') {
            this.init();
        }

        const contentArea = document.getElementById('content-area');
        // Render common header and stats for both roles
        contentArea.innerHTML = `
            <div class="mb-6">
                <div class="flex flex-col items-start gap-1">
                    <h1 class="text-3xl font-bold text-gray-800">Recolección y Progreso</h1>
                    <p class="text-gray-600">${user.type === 'admin' ? 'Supervisión de progreso de rutas' : 'Registro de recolecciones en campo'}</p>
                </div>
            </div>

            <!-- Quick Stats (visible for both roles) -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-blue-100">Recolecciones Hoy</p>
                            <p class="text-3xl font-bold">12</p>
                        </div>
                        <i class="fas fa-clipboard-check text-4xl text-blue-200"></i>
                    </div>
                </div>
                <div class="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-green-100">Volumen Total</p>
                            <p class="text-3xl font-bold">45.2 <span class="text-lg">m³</span></p>
                        </div>
                        <i class="fas fa-cubes text-4xl text-green-200"></i>
                    </div>
                </div>
                <div class="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-yellow-100">Peso Total</p>
                            <p class="text-3xl font-bold">28.4 <span class="text-lg">Ton</span></p>
                        </div>
                        <i class="fas fa-weight text-4xl text-yellow-200"></i>
                    </div>
                </div>
                <div class="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-purple-100">Eficiencia</p>
                            <p class="text-3xl font-bold">94%</p>
                        </div>
                        <i class="fas fa-chart-line text-4xl text-purple-200"></i>
                    </div>
                </div>
            </div>

            <!-- Role-specific content will be injected here -->
            <div id="role-specific-content"></div>
        `;

        const roleSpecificContent = document.getElementById('role-specific-content');
        if (user.type === 'admin') {
            this.renderAdminView(roleSpecificContent);
        } else { // 'operator' and any other role
            this.renderOperatorView(roleSpecificContent);
        }
    },

    // --- Admin View: Route Progress Table ---
    renderAdminView(container) {
        // Check if routesModule is available
        if (typeof window.routesModule === 'undefined' || typeof window.routesModule.getFilteredRoutes === 'undefined') {
            container.innerHTML = `<div class="p-4 text-center text-red-500 bg-red-50 rounded-lg border border-red-200">Error: El módulo de rutas no está cargado.</div>`;
            return;
        }

        const routes = window.routesModule.routes || [];
        
        if (routes.length === 0) {
            container.innerHTML = `<div class="p-6 text-center text-gray-500 bg-white rounded-lg border">No hay rutas creadas en el sistema.</div>`;
            return;
        }

        container.innerHTML = `
            <div class="bg-white rounded-lg shadow">
                <div class="p-6 border-b">
                    <h3 class="text-lg font-semibold">Progreso de Rutas en Tiempo Real</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ruta</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehículo</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conductor</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progreso</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            ${routes.map(route => {
                                const completedPoints = this.collections.filter(c => c.routeId === route.id && c.status === 'Completado').length;
                                const totalPoints = route.collectionPoints.length;
                                const progress = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

                                return `
                                    <tr>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="font-medium">${route.name}</div>
                                            <div class="text-sm text-gray-500">${route.code}</div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${window.routesModule.getVehicleLabelByCode(route.vehicle)}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${route.driver}</td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="flex items-center">
                                                <div class="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                                    <div class="bg-blue-600 h-2.5 rounded-full" style="width: ${progress}%"></div>
                                                </div>
                                                <span class="text-sm font-medium">${progress}%</span>
                                            </div>
                                            <div class="text-xs text-gray-500">${completedPoints} de ${totalPoints} puntos completados</div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span class="px-2 py-1 text-xs rounded-full ${window.routesModule.getStatusClass(route.status)}">
                                                ${route.status}
                                            </span>
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

    // --- Operator View: Collection Form ---
    renderOperatorView(container) {
        const currentUser = app?.currentUser;
        const activeRoutes = this.getOperatorActiveRoutes(currentUser);
        
        container.innerHTML = `
            <!-- Estado actual y acciones rápidas -->
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                <div class="lg:col-span-3 bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold mb-4">Mi Estado Actual</h3>
                    ${this.renderOperatorStatus(currentUser, activeRoutes)}
                </div>
                <div class="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <h4 class="font-semibold text-blue-900 mb-3">Acciones Rápidas</h4>
                    <div class="space-y-2">
                        <button onclick="collectionModule.startShift()" 
                                class="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm">
                            <i class="fas fa-play mr-2"></i>Iniciar Turno
                        </button>
                        <button onclick="collectionModule.checkCurrentLocation()" 
                                class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                            <i class="fas fa-map-marker-alt mr-2"></i>Mi Ubicación
                        </button>
                        <button onclick="collectionModule.reportIncident()" 
                                class="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 text-sm">
                            <i class="fas fa-exclamation-triangle mr-2"></i>Reportar Incidente
                        </button>
                        <button onclick="collectionModule.modifyRoute()" 
                                class="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm">
                            <i class="fas fa-route mr-2"></i>Modificar Ruta
                        </button>
                        <button onclick="collectionModule.connectToWeighingSystem()" 
                                class="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm">
                            <i class="fas fa-weight mr-2"></i>Conectar Báscula
                        </button>
                        <button onclick="collectionModule.showNotificationsPanel()" 
                                class="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm">
                            <i class="fas fa-bell mr-2"></i>Ver Notificaciones
                        </button>
                    </div>
                </div>
            </div>

            <!-- Workflow de recolección -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Panel de ruta activa -->
                <div class="bg-white rounded-lg shadow">
                    <div class="p-6 border-b">
                        <div class="flex justify-between items-center">
                            <h3 class="text-lg font-semibold">Ruta Activa</h3>
                            <span class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                En progreso
                            </span>
                        </div>
                    </div>
                    <div class="p-6">
                        ${this.renderActiveRouteDetails(activeRoutes[0])}
                    </div>
                </div>

                <!-- Registro de recolección -->
                <div class="bg-white rounded-lg shadow">
                    <div class="p-6 border-b">
                        <h3 class="text-lg font-semibold">Registrar Recolección</h3>
                    </div>
                    <div class="p-6">
                        ${this.renderCollectionForm()}
                    </div>
                </div>
            </div>

            <!-- Lista de puntos de recolección -->
            <div class="mt-6 bg-white rounded-lg shadow">
                <div class="p-6 border-b">
                    <h3 class="text-lg font-semibold">Puntos de Recolección Pendientes</h3>
                </div>
                <div class="p-6">
                    ${this.renderCollectionPoints(activeRoutes[0])}
                </div>
            </div>
        `;

        // Inicializar event listeners
        this.initializeOperatorEventListeners();
    },

    getOperatorActiveRoutes(user) {
        if (!user || !window.routesModule) return [];
        
        return window.routesModule.routes.filter(route => 
            route.driver === user.name && 
            (route.status === 'En Progreso' || route.status === 'Programada')
        );
    },

    renderOperatorStatus(user, activeRoutes) {
        if (activeRoutes.length === 0) {
            return `
                <div class="text-center py-8">
                    <i class="fas fa-clock text-gray-300 text-4xl mb-4"></i>
                    <h4 class="text-lg font-medium text-gray-900 mb-2">Sin rutas activas</h4>
                    <p class="text-gray-500">No tienes rutas asignadas en este momento.</p>
                    <button onclick="app.loadModule('routes')" 
                            class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        Ver Mis Rutas
                    </button>
                </div>
            `;
        }

        const activeRoute = activeRoutes[0];
        const completedPoints = activeRoute.collectionPoints?.filter(p => p.status === 'Completado').length || 0;
        const totalPoints = activeRoute.collectionPoints?.length || 0;
        const progress = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

        return `
            <div class="space-y-4">
                <div class="flex items-center justify-between">
                    <div>
                        <h4 class="text-lg font-semibold">${activeRoute.name}</h4>
                        <p class="text-sm text-gray-600">Vehículo: ${activeRoute.vehicle} | Inicio: ${activeRoute.startTime}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-2xl font-bold text-blue-600">${progress}%</p>
                        <p class="text-sm text-gray-500">Completado</p>
                    </div>
                </div>
                
                <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                        <span>Progreso de recolección</span>
                        <span>${completedPoints}/${totalPoints} puntos</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-blue-500 h-2 rounded-full transition-all duration-300" style="width: ${progress}%"></div>
                    </div>
                </div>

                <div class="grid grid-cols-3 gap-4 text-center">
                    <div class="bg-green-50 p-3 rounded-lg">
                        <p class="text-2xl font-bold text-green-600">${completedPoints}</p>
                        <p class="text-xs text-green-600">Completados</p>
                    </div>
                    <div class="bg-yellow-50 p-3 rounded-lg">
                        <p class="text-2xl font-bold text-yellow-600">${totalPoints - completedPoints}</p>
                        <p class="text-xs text-yellow-600">Pendientes</p>
                    </div>
                    <div class="bg-blue-50 p-3 rounded-lg">
                        <p class="text-2xl font-bold text-blue-600">${activeRoute.estimatedDuration}h</p>
                        <p class="text-xs text-blue-600">Duración est.</p>
                    </div>
                </div>
            </div>
        `;
    },

    renderActiveRouteDetails(route) {
        if (!route) {
            return `
                <div class="text-center py-8">
                    <i class="fas fa-route text-gray-300 text-4xl mb-4"></i>
                    <p class="text-gray-500">No hay rutas activas</p>
                </div>
            `;
        }

        const nextPoint = route.collectionPoints?.find(p => p.status !== 'Completado');
        
        return `
            <div class="space-y-4">
                ${nextPoint ? `
                    <div class="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border">
                        <h4 class="font-semibold text-gray-900 mb-2">Próxima Parada</h4>
                        <div class="space-y-2">
                            <p class="font-medium">${nextPoint.client}</p>
                            <p class="text-sm text-gray-600">${nextPoint.address}</p>
                            <div class="flex justify-between items-center">
                                <span class="px-2 py-1 text-xs rounded-full ${this.getWasteTypeColorClass(nextPoint.wasteType)}">
                                    ${nextPoint.wasteType}
                                </span>
                                <span class="text-sm text-gray-600">${nextPoint.estimated}</span>
                            </div>
                        </div>
                        <div class="mt-3 flex space-x-2">
                            <button onclick="collectionModule.navigateToPoint('${nextPoint.address}')" 
                                    class="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">
                                <i class="fas fa-directions mr-1"></i>Navegar
                            </button>
                            <button onclick="collectionModule.checkInAtPoint('${nextPoint.id || 0}')" 
                                    class="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700">
                                <i class="fas fa-map-marker-alt mr-1"></i>Check-in
                            </button>
                        </div>
                    </div>
                ` : `
                    <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div class="flex items-center">
                            <i class="fas fa-check-circle text-green-600 text-xl mr-3"></i>
                            <div>
                                <h4 class="font-semibold text-green-900">Ruta Completada</h4>
                                <p class="text-sm text-green-700">Todos los puntos de recolección han sido procesados</p>
                            </div>
                        </div>
                    </div>
                `}
                
                <div class="space-y-2">
                    <h5 class="font-medium">Información de la ruta</h5>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span class="text-gray-500">Código:</span>
                            <span class="ml-2 font-medium">${route.code}</span>
                        </div>
                        <div>
                            <span class="text-gray-500">Vehículo:</span>
                            <span class="ml-2 font-medium">${route.vehicle}</span>
                        </div>
                        <div>
                            <span class="text-gray-500">Ayudante:</span>
                            <span class="ml-2 font-medium">${route.helper}</span>
                        </div>
                        <div>
                            <span class="text-gray-500">Fecha:</span>
                            <span class="ml-2 font-medium">${route.date}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderCollectionForm() {
        return `
            <form id="collection-form" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Punto de recolección *</label>
                        <select id="collection-point-select" required class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                            <option value="">Seleccionar punto</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de residuo *</label>
                        <select id="waste-type-select" required class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                            <option value="">Auto-detectado</option>
                            <option value="Orgánico">Orgánico</option>
                            <option value="Reciclable">Reciclable</option>
                            <option value="No Reciclable">No Reciclable</option>
                            <option value="Peligroso">Peligroso</option>
                            <option value="Mixtos">Mixtos</option>
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Peso real (kg) *</label>
                        <input type="number" id="actual-weight" step="0.1" min="0" required 
                               class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                               placeholder="Peso en kilogramos">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Volumen real (m³)</label>
                        <input type="number" id="actual-volume" step="0.1" min="0" 
                               class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                               placeholder="Volumen en metros cúbicos">
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                    <textarea id="collection-notes" rows="3" 
                              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                              placeholder="Observaciones sobre la recolección (opcional)"></textarea>
                </div>

                <div class="space-y-3">
                    <div class="flex items-center">
                        <input type="checkbox" id="client-signature" class="mr-3">
                        <label for="client-signature" class="text-sm text-gray-700">Firma del cliente obtenida</label>
                    </div>
                    
                    <div class="flex items-center">
                        <input type="checkbox" id="photos-taken" class="mr-3">
                        <label for="photos-taken" class="text-sm text-gray-700">Fotos de evidencia tomadas</label>
                    </div>
                </div>

                <div class="flex space-x-3 pt-4">
                    <button type="submit" class="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                        <i class="fas fa-check mr-2"></i>Completar Recolección
                    </button>
                    <button type="button" onclick="collectionModule.postponeCollection()" 
                            class="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700">
                        <i class="fas fa-clock mr-2"></i>Posponer
                    </button>
                </div>
            </form>
        `;
    },

    renderCollectionPoints(route) {
        if (!route || !route.collectionPoints) {
            return `
                <div class="text-center py-8">
                    <i class="fas fa-map-marker-alt text-gray-300 text-4xl mb-4"></i>
                    <p class="text-gray-500">No hay puntos de recolección asignados</p>
                </div>
            `;
        }

        return `
            <div class="space-y-4">
                ${route.collectionPoints.map((point, index) => `
                    <div class="flex items-center justify-between p-4 border rounded-lg ${point.status === 'Completado' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}">
                        <div class="flex items-center space-x-4">
                            <div class="w-8 h-8 rounded-full flex items-center justify-center ${point.status === 'Completado' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}">
                                ${point.status === 'Completado' ? '<i class="fas fa-check text-xs"></i>' : `<span class="text-sm font-bold">${index + 1}</span>`}
                            </div>
                            <div>
                                <h4 class="font-medium">${point.client}</h4>
                                <p class="text-sm text-gray-600">${point.address}</p>
                                <div class="flex items-center space-x-2 mt-1">
                                    <span class="px-2 py-1 text-xs rounded-full ${this.getWasteTypeColorClass(point.wasteType)}">
                                        ${point.wasteType}
                                    </span>
                                    <span class="text-xs text-gray-500">${point.estimated}</span>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col items-end space-y-2">
                            <span class="px-3 py-1 text-xs rounded-full ${point.status === 'Completado' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}">
                                ${point.status || 'Pendiente'}
                            </span>
                            ${point.status !== 'Completado' ? `
                                <button onclick="collectionModule.startCollection(${index})" 
                                        class="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700">
                                    Iniciar
                                </button>
                            ` : `
                                <span class="text-xs text-green-600">
                                    <i class="fas fa-clock mr-1"></i>${point.completedTime || 'Completado'}
                                </span>
                            `}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    initializeOperatorEventListeners() {
        // Form submission
        const form = document.getElementById('collection-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitCollection();
            });
        }

        // Auto-populate collection points
        this.populateCollectionPoints();
    },

    populateCollectionPoints() {
        const currentUser = app?.currentUser;
        const activeRoutes = this.getOperatorActiveRoutes(currentUser);
        const select = document.getElementById('collection-point-select');
        
        if (select && activeRoutes.length > 0) {
            const route = activeRoutes[0];
            const pendingPoints = route.collectionPoints?.filter(p => p.status !== 'Completado') || [];
            
            select.innerHTML = '<option value="">Seleccionar punto</option>' + 
                pendingPoints.map((point, index) => 
                    `<option value="${index}">${point.client} - ${point.address}</option>`
                ).join('');
        }
    },

    // Funciones de acción del operador
    startShift() {
        authSystem?.showNotification?.('Turno iniciado - ¡Buen trabajo!', 'success');
    },

    checkCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude.toFixed(4);
                    const lng = position.coords.longitude.toFixed(4);
                    authSystem?.showNotification?.(`Ubicación: ${lat}, ${lng}`, 'info');
                },
                () => {
                    authSystem?.showNotification?.('No se pudo obtener la ubicación', 'warning');
                }
            );
        } else {
            authSystem?.showNotification?.('Geolocalización no disponible', 'warning');
        }
    },

    reportIncident() {
        const description = prompt('Describe el incidente:');
        if (description) {
            authSystem?.showNotification?.('Incidente reportado correctamente', 'warning');
            // Aquí se podría enviar al sistema de gestión
        }
    },

    navigateToPoint(address) {
        const encodedAddress = encodeURIComponent(address);
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
        window.open(googleMapsUrl, '_blank');
        authSystem?.showNotification?.('Abriendo navegación GPS...', 'info');
    },

    checkInAtPoint(pointId) {
        authSystem?.showNotification?.('Check-in registrado exitosamente', 'success');
        // Actualizar estado del punto
    },

    startCollection(pointIndex) {
        const select = document.getElementById('collection-point-select');
        if (select) {
            select.value = pointIndex;
            select.scrollIntoView({ behavior: 'smooth' });
        }
        authSystem?.showNotification?.('Punto seleccionado para recolección', 'info');
    },

    submitCollection() {
        const formData = {
            pointIndex: document.getElementById('collection-point-select').value,
            wasteType: document.getElementById('waste-type-select').value,
            weight: document.getElementById('actual-weight').value,
            volume: document.getElementById('actual-volume').value,
            notes: document.getElementById('collection-notes').value,
            clientSignature: document.getElementById('client-signature').checked,
            photosTaken: document.getElementById('photos-taken').checked
        };

        if (!formData.pointIndex || !formData.weight) {
            authSystem?.showNotification?.('Complete los campos obligatorios', 'warning');
            return;
        }

        // Simular guardado de recolección
        const collection = {
            id: Date.now(),
            ...formData,
            timestamp: new Date().toISOString(),
            operator: app?.currentUser?.name,
            status: 'Completado',
            estimatedWeight: '2.5', // Ejemplo de peso estimado
            actualWeight: formData.weight
        };

        // Realizar verificaciones de calidad si están habilitadas
        if (this.qualitySettings && this.qualitySettings.alertOnAnomalies) {
            const qualityResult = this.performQualityChecks(collection);
            
            if (!qualityResult.passed) {
                this.showQualityReport(qualityResult);
                return; // No proceder hasta revisar calidad
            }
        }

        this.collections.push(collection);
        
        // Actualizar estado del punto en la ruta
        this.updateCollectionPointStatus(formData.pointIndex);
        
        // Guardar offline si es necesario
        if (this.isOffline) {
            this.offlineQueue.push({
                type: 'collection',
                data: collection,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('ecogestion_offline_queue', JSON.stringify(this.offlineQueue));
            authSystem?.showNotification?.('Recolección guardada offline - Se sincronizará cuando haya conexión', 'warning');
        } else {
            authSystem?.showNotification?.('Recolección registrada exitosamente', 'success');
        }
        
        // Limpiar formulario
        document.getElementById('collection-form').reset();
        
        // Recargar vista
        setTimeout(() => {
            this.load();
        }, 1000);
    },

    updateCollectionPointStatus(pointIndex) {
        const currentUser = app?.currentUser;
        const activeRoutes = this.getOperatorActiveRoutes(currentUser);
        
        if (activeRoutes.length > 0 && activeRoutes[0].collectionPoints) {
            const point = activeRoutes[0].collectionPoints[pointIndex];
            if (point) {
                point.status = 'Completado';
                point.completedTime = new Date().toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
                
                // Guardar en routesModule si está disponible
                if (window.routesModule && typeof window.routesModule.saveAll === 'function') {
                    window.routesModule.saveAll();
                }
            }
        }
    },

    postponeCollection() {
        const reason = prompt('Motivo del aplazamiento:');
        if (reason) {
            authSystem?.showNotification?.('Recolección pospuesta', 'warning');
        }
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

    // ========== GESTIÓN AVANZADA DE TURNO ==========
    
    initShiftManagement() {
        // Cargar datos desde localStorage
        this.loadShiftsFromStorage();
        this.initOfflineDetection();
        this.loadVehicleLicenseData();
    },

    loadShiftsFromStorage() {
        try {
            const shifts = localStorage.getItem('ecogestion_shifts');
            if (shifts) {
                this.operatorShifts = JSON.parse(shifts);
            }
            const currentShift = localStorage.getItem('ecogestion_current_shift');
            if (currentShift) {
                this.currentShift = JSON.parse(currentShift);
            }
        } catch (e) {
            console.warn('Error loading shifts from storage:', e);
        }
    },

    saveShiftsToStorage() {
        try {
            localStorage.setItem('ecogestion_shifts', JSON.stringify(this.operatorShifts));
            if (this.currentShift) {
                localStorage.setItem('ecogestion_current_shift', JSON.stringify(this.currentShift));
            } else {
                localStorage.removeItem('ecogestion_current_shift');
            }
        } catch (e) {
            console.error('Error saving shifts to storage:', e);
        }
    },

    initOfflineDetection() {
        // Detectar estado offline/online
        window.addEventListener('online', () => {
            this.isOffline = false;
            this.syncOfflineData();
            authSystem?.showNotification?.('Conexión restaurada - Sincronizando datos...', 'success');
        });

        window.addEventListener('offline', () => {
            this.isOffline = true;
            authSystem?.showNotification?.('Modo offline activado', 'warning');
        });

        this.isOffline = !navigator.onLine;
    },

    syncOfflineData() {
        if (this.offlineQueue.length > 0) {
            // Procesar cola offline
            this.offlineQueue.forEach(item => {
                this.processOfflineItem(item);
            });
            this.offlineQueue = [];
            localStorage.removeItem('ecogestion_offline_queue');
        }
    },

    processOfflineItem(item) {
        // Procesar elemento de la cola offline
        if (item.type === 'collection') {
            this.collections.push(item.data);
        } else if (item.type === 'route_change') {
            this.notifyRouteChange(item.data);
        }
        // Agregar más tipos según necesidad
    },

    getAvailableVehiclesForOperator(operatorLicense) {
        return this.vehicleLicenseMap[operatorLicense] || [];
    },

    loadVehicleLicenseData() {
        // Cargar datos de licencias desde localStorage si existen
        try {
            const saved = localStorage.getItem('ecogestion_vehicle_licenses');
            if (saved) {
                this.vehicleLicenseMap = { ...this.vehicleLicenseMap, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.warn('Error loading vehicle license data:', e);
        }
    },

    // ========== GESTIÓN DE TURNO AVANZADA ==========

    showAdvancedShiftStart() {
        const currentUser = app?.currentUser;
        if (!currentUser) return;

        const availableVehicles = this.getAvailableVehiclesForOperator(currentUser.license || 'A-12345');
        
        const modalHTML = `
            <div id="shift-start-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 w-full max-w-md">
                    <h3 class="text-lg font-semibold mb-4">Iniciar Turno</h3>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Vehículo Asignado</label>
                            <select id="shift-vehicle" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                <option value="">Seleccionar vehículo</option>
                                ${availableVehicles.map(code => {
                                    const vehicle = window.routesModule?.getVehicleByCode(code);
                                    return `<option value="${code}">${vehicle ? `${vehicle.brand} ${vehicle.model} (${code})` : code}</option>`;
                                }).join('')}
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Kilometraje Inicial</label>
                            <input type="number" id="shift-initial-km" 
                                   class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                   placeholder="Ej: 125430">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Inspección Pre-viaje</label>
                            <div class="space-y-2">
                                <label class="flex items-center">
                                    <input type="checkbox" id="check-tires" class="mr-2">
                                    <span class="text-sm">Llantas en buen estado</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" id="check-brakes" class="mr-2">
                                    <span class="text-sm">Frenos funcionando</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" id="check-lights" class="mr-2">
                                    <span class="text-sm">Luces operativas</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" id="check-fuel" class="mr-2">
                                    <span class="text-sm">Nivel de combustible adecuado</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" id="check-equipment" class="mr-2">
                                    <span class="text-sm">Equipos de seguridad completos</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                            <textarea id="shift-notes" rows="3" 
                                      class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                      placeholder="Observaciones adicionales..."></textarea>
                        </div>
                    </div>

                    <div class="flex justify-end space-x-4 pt-4 border-t mt-4">
                        <button onclick="document.getElementById('shift-start-modal').remove()" 
                                class="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button onclick="collectionModule.confirmStartShift()" 
                                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                            <i class="fas fa-play mr-2"></i>Iniciar Turno
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    confirmStartShift() {
        const vehicle = document.getElementById('shift-vehicle').value;
        const initialKm = document.getElementById('shift-initial-km').value;
        const checks = {
            tires: document.getElementById('check-tires').checked,
            brakes: document.getElementById('check-brakes').checked,
            lights: document.getElementById('check-lights').checked,
            fuel: document.getElementById('check-fuel').checked,
            equipment: document.getElementById('check-equipment').checked
        };
        const notes = document.getElementById('shift-notes').value;

        if (!vehicle) {
            authSystem?.showNotification?.('Debe seleccionar un vehículo', 'warning');
            return;
        }

        const allChecked = Object.values(checks).every(check => check);
        if (!allChecked) {
            authSystem?.showNotification?.('Debe completar toda la inspección pre-viaje', 'warning');
            return;
        }

        // Obtener ubicación actual
        this.getCurrentLocation((location) => {
            const shift = {
                id: Date.now(),
                operator: app?.currentUser?.name,
                vehicle: vehicle,
                startTime: new Date().toISOString(),
                startLocation: location,
                initialKm: parseFloat(initialKm) || 0,
                preFlightCheck: checks,
                notes: notes,
                status: 'active'
            };

            this.currentShift = shift;
            this.operatorShifts.push(shift);
            this.saveShiftsToStorage();

            document.getElementById('shift-start-modal').remove();
            authSystem?.showNotification?.('Turno iniciado correctamente', 'success');
            
            // Recargar la vista para mostrar el turno activo
            this.load();
        });
    },

    getCurrentLocation(callback) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    callback({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        timestamp: new Date().toISOString()
                    });
                },
                (error) => {
                    console.warn('Error getting location:', error);
                    callback({
                        lat: null,
                        lng: null,
                        error: error.message,
                        timestamp: new Date().toISOString()
                    });
                }
            );
        } else {
            callback({
                lat: null,
                lng: null,
                error: 'Geolocalización no disponible',
                timestamp: new Date().toISOString()
            });
        }
    },

    // ========== INTEGRACIÓN CON PESAJE AUTOMÁTICO ==========

    connectToWeighingSystem() {
        // Simular conexión con sistema de pesaje
        this.weighingIntegration.connected = true;
        authSystem?.showNotification?.('Conectado al sistema de pesaje', 'success');
        
        // Simular lectura automática cada 5 segundos
        if (this.weighingIntegration.autoCapture) {
            this.startAutoWeightCapture();
        }
    },

    startAutoWeightCapture() {
        setInterval(() => {
            if (this.weighingIntegration.connected && this.weighingIntegration.autoCapture) {
                // Simular lectura aleatoria
                const weight = (Math.random() * 5 + 0.5).toFixed(1);
                this.weighingIntegration.lastReading = {
                    weight: parseFloat(weight),
                    timestamp: new Date().toISOString(),
                    unit: 'kg'
                };
                
                // Auto-llenar el campo de peso si existe
                const weightInput = document.getElementById('actual-weight');
                if (weightInput && this.weighingIntegration.autoCapture) {
                    weightInput.value = weight;
                    weightInput.classList.add('bg-green-50', 'border-green-300');
                    
                    // Mostrar indicador de captura automática
                    const indicator = document.createElement('span');
                    indicator.className = 'text-xs text-green-600 ml-2';
                    indicator.innerHTML = '<i class="fas fa-check-circle mr-1"></i>Auto-capturado';
                    weightInput.parentNode.appendChild(indicator);
                    
                    setTimeout(() => {
                        weightInput.classList.remove('bg-green-50', 'border-green-300');
                        indicator?.remove();
                    }, 3000);
                }
            }
        }, 5000);
    },

    // ========== GESTIÓN DE INCIDENTES ==========

    showIncidentReport() {
        const modalHTML = `
            <div id="incident-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 w-full max-w-lg">
                    <h3 class="text-lg font-semibold mb-4">Reportar Incidente</h3>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Incidente</label>
                            <select id="incident-type" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                <option value="">Seleccionar tipo</option>
                                <option value="vehicle_breakdown">Avería del vehículo</option>
                                <option value="accident">Accidente</option>
                                <option value="customer_issue">Problema con cliente</option>
                                <option value="hazardous_waste">Residuos peligrosos no declarados</option>
                                <option value="route_blocked">Ruta bloqueada</option>
                                <option value="equipment_failure">Falla de equipo</option>
                                <option value="safety_concern">Problema de seguridad</option>
                                <option value="other">Otro</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Severidad</label>
                            <select id="incident-severity" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                <option value="low">Baja - No afecta operaciones</option>
                                <option value="medium">Media - Retraso menor</option>
                                <option value="high">Alta - Operación suspendida</option>
                                <option value="critical">Crítica - Emergencia</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Descripción del Incidente</label>
                            <textarea id="incident-description" rows="4" 
                                      class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                      placeholder="Describe el incidente en detalle..."></textarea>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                            <input type="text" id="incident-location" 
                                   class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                   placeholder="Dirección o descripción del lugar">
                            <button type="button" onclick="collectionModule.captureIncidentLocation()" 
                                    class="mt-2 text-sm text-blue-600 hover:text-blue-800">
                                <i class="fas fa-map-marker-alt mr-1"></i>Usar ubicación actual
                            </button>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Fotos del Incidente</label>
                            <input type="file" id="incident-photos" multiple accept="image/*" 
                                   class="w-full px-3 py-2 border rounded-lg">
                        </div>
                    </div>

                    <div class="flex justify-end space-x-4 pt-4 border-t mt-4">
                        <button onclick="document.getElementById('incident-modal').remove()" 
                                class="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button onclick="collectionModule.submitIncidentReport()" 
                                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                            <i class="fas fa-exclamation-triangle mr-2"></i>Reportar Incidente
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    captureIncidentLocation() {
        this.getCurrentLocation((location) => {
            const locationInput = document.getElementById('incident-location');
            if (location.lat && location.lng) {
                locationInput.value = `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
                authSystem?.showNotification?.('Ubicación capturada', 'success');
            } else {
                authSystem?.showNotification?.('No se pudo obtener la ubicación', 'warning');
            }
        });
    },

    submitIncidentReport() {
        const incidentData = {
            id: Date.now(),
            type: document.getElementById('incident-type').value,
            severity: document.getElementById('incident-severity').value,
            description: document.getElementById('incident-description').value,
            location: document.getElementById('incident-location').value,
            operator: app?.currentUser?.name,
            timestamp: new Date().toISOString(),
            shift: this.currentShift?.id,
            vehicle: this.currentShift?.vehicle
        };

        if (!incidentData.type || !incidentData.description) {
            authSystem?.showNotification?.('Complete los campos requeridos', 'warning');
            return;
        }

        // Guardar incidente (offline si es necesario)
        if (this.isOffline) {
            this.offlineQueue.push({
                type: 'incident',
                data: incidentData,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('ecogestion_offline_queue', JSON.stringify(this.offlineQueue));
        } else {
            this.saveIncident(incidentData);
        }

        // Notificar al administrador si es severidad alta o crítica
        if (['high', 'critical'].includes(incidentData.severity)) {
            this.notifyAdminIncident(incidentData);
        }

        document.getElementById('incident-modal').remove();
        authSystem?.showNotification?.('Incidente reportado correctamente', 'success');
    },

    saveIncident(incidentData) {
        // Guardar en localStorage (simular envío al servidor)
        try {
            const incidents = JSON.parse(localStorage.getItem('ecogestion_incidents') || '[]');
            incidents.push(incidentData);
            localStorage.setItem('ecogestion_incidents', JSON.stringify(incidents));
        } catch (e) {
            console.error('Error saving incident:', e);
        }
    },

    notifyAdminIncident(incidentData) {
        // Simular notificación al administrador
        const adminNotification = {
            id: Date.now(),
            type: 'incident_alert',
            severity: incidentData.severity,
            operator: incidentData.operator,
            message: `Incidente ${incidentData.severity} reportado: ${incidentData.type}`,
            timestamp: new Date().toISOString(),
            data: incidentData
        };

        // Guardar notificación para el admin
        try {
            const notifications = JSON.parse(localStorage.getItem('ecogestion_admin_notifications') || '[]');
            notifications.push(adminNotification);
            localStorage.setItem('ecogestion_admin_notifications', JSON.stringify(notifications));
        } catch (e) {
            console.error('Error saving admin notification:', e);
        }
    },

    // ========== MODIFICACIÓN DE RUTAS CON NOTIFICACIÓN AL ADMIN ==========

    requestRouteModification() {
        const currentUser = app?.currentUser;
        const activeRoutes = this.getOperatorActiveRoutes(currentUser);
        
        if (activeRoutes.length === 0) {
            authSystem?.showNotification?.('No hay rutas activas para modificar', 'warning');
            return;
        }

        const modalHTML = `
            <div id="route-modification-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 w-full max-w-lg">
                    <h3 class="text-lg font-semibold mb-4">Solicitar Modificación de Ruta</h3>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Ruta Actual</label>
                            <input type="text" value="${activeRoutes[0].name} (${activeRoutes[0].code})" 
                                   class="w-full px-3 py-2 border rounded-lg bg-gray-100" readonly>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Modificación</label>
                            <select id="modification-type" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                <option value="">Seleccionar tipo</option>
                                <option value="add_stop">Agregar parada</option>
                                <option value="remove_stop">Eliminar parada</option>
                                <option value="change_order">Cambiar orden de paradas</option>
                                <option value="change_time">Modificar horarios</option>
                                <option value="emergency_detour">Desvío de emergencia</option>
                                <option value="other">Otro</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Justificación</label>
                            <textarea id="modification-reason" rows="4" 
                                      class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                      placeholder="Explique por qué necesita esta modificación..."></textarea>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Urgencia</label>
                            <select id="modification-urgency" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                <option value="low">Baja - Puede esperar</option>
                                <option value="medium">Media - Necesaria hoy</option>
                                <option value="high">Alta - Inmediata</option>
                            </select>
                        </div>
                    </div>

                    <div class="flex justify-end space-x-4 pt-4 border-t mt-4">
                        <button onclick="document.getElementById('route-modification-modal').remove()" 
                                class="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button onclick="collectionModule.submitRouteModification()" 
                                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <i class="fas fa-paper-plane mr-2"></i>Enviar Solicitud
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    submitRouteModification() {
        const currentUser = app?.currentUser;
        const activeRoutes = this.getOperatorActiveRoutes(currentUser);
        
        const modificationData = {
            id: Date.now(),
            routeId: activeRoutes[0].id,
            routeName: activeRoutes[0].name,
            type: document.getElementById('modification-type').value,
            reason: document.getElementById('modification-reason').value,
            urgency: document.getElementById('modification-urgency').value,
            operator: currentUser?.name,
            timestamp: new Date().toISOString(),
            status: 'pending'
        };

        if (!modificationData.type || !modificationData.reason) {
            authSystem?.showNotification?.('Complete todos los campos requeridos', 'warning');
            return;
        }

        // Guardar solicitud
        if (this.isOffline) {
            this.offlineQueue.push({
                type: 'route_modification',
                data: modificationData,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('ecogestion_offline_queue', JSON.stringify(this.offlineQueue));
        } else {
            this.saveRouteModification(modificationData);
        }

        // Notificar al administrador
        this.notifyAdminRouteChange(modificationData);

        document.getElementById('route-modification-modal').remove();
        authSystem?.showNotification?.('Solicitud enviada al administrador', 'success');
    },

    saveRouteModification(modificationData) {
        try {
            const modifications = JSON.parse(localStorage.getItem('ecogestion_route_modifications') || '[]');
            modifications.push(modificationData);
            localStorage.setItem('ecogestion_route_modifications', JSON.stringify(modifications));
        } catch (e) {
            console.error('Error saving route modification:', e);
        }
    },

    notifyAdminRouteChange(modificationData) {
        const adminNotification = {
            id: Date.now(),
            type: 'route_modification_request',
            urgency: modificationData.urgency,
            operator: modificationData.operator,
            message: `Solicitud de modificación de ruta: ${modificationData.type}`,
            timestamp: new Date().toISOString(),
            data: modificationData
        };

        try {
            const notifications = JSON.parse(localStorage.getItem('ecogestion_admin_notifications') || '[]');
            notifications.push(adminNotification);
            localStorage.setItem('ecogestion_admin_notifications', JSON.stringify(notifications));
        } catch (e) {
            console.error('Error saving admin notification:', e);
        }
    },

    // Actualizar la función startShift para usar la nueva funcionalidad
    startShift() {
        this.showAdvancedShiftStart();
    },

    // Actualizar reportIncident para usar el nuevo modal
    reportIncident() {
        this.showIncidentReport();
    },

    // Agregar nueva función para modificar rutas
    modifyRoute() {
        this.requestRouteModification();
    },

    // ========== SISTEMA DE COMUNICACIONES Y NOTIFICACIONES ==========

    initCommunicationSystem() {
        // Cargar notificaciones desde localStorage
        this.loadNotifications();
        
        // Configurar polling para nuevas notificaciones cada 30 segundos
        setInterval(() => {
            this.checkForNewNotifications();
        }, 30000);

        // Mostrar indicador de notificaciones si hay pendientes
        this.updateNotificationBadge();
    },

    loadNotifications() {
        try {
            const notifications = localStorage.getItem('ecogestion_operator_notifications');
            if (notifications) {
                this.notifications = JSON.parse(notifications);
            }
        } catch (e) {
            console.warn('Error loading notifications:', e);
        }
    },

    saveNotifications() {
        try {
            localStorage.setItem('ecogestion_operator_notifications', JSON.stringify(this.notifications));
        } catch (e) {
            console.error('Error saving notifications:', e);
        }
    },

    checkForNewNotifications() {
        // Simular recepción de notificaciones del administrador
        try {
            const adminNotifications = JSON.parse(localStorage.getItem('ecogestion_admin_notifications') || '[]');
            const currentUser = app?.currentUser;
            
            // Filtrar notificaciones dirigidas a este operador
            const newNotifications = adminNotifications.filter(notification => {
                return notification.operator === currentUser?.name && 
                       !this.notifications.some(existing => existing.id === notification.id);
            });

            if (newNotifications.length > 0) {
                this.notifications.push(...newNotifications);
                this.saveNotifications();
                this.updateNotificationBadge();
                
                // Mostrar notificación emergente para mensajes urgentes
                newNotifications.forEach(notification => {
                    if (notification.urgency === 'high' || notification.type === 'incident_alert') {
                        this.showUrgentNotification(notification);
                    }
                });
            }
        } catch (e) {
            console.warn('Error checking for new notifications:', e);
        }
    },

    updateNotificationBadge() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        
        // Buscar o crear badge de notificaciones
        let badge = document.getElementById('notification-badge');
        if (!badge && unreadCount > 0) {
            badge = document.createElement('span');
            badge.id = 'notification-badge';
            badge.className = 'fixed top-4 right-4 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold z-50';
            document.body.appendChild(badge);
        }
        
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    },

    showUrgentNotification(notification) {
        const urgentModal = `
            <div id="urgent-notification-${notification.id}" class="fixed inset-0 bg-red-900 bg-opacity-75 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 w-full max-w-md border-l-4 border-red-500">
                    <div class="flex items-center mb-4">
                        <i class="fas fa-exclamation-triangle text-red-500 text-2xl mr-3"></i>
                        <h3 class="text-lg font-semibold text-red-900">Notificación Urgente</h3>
                    </div>
                    
                    <div class="mb-4">
                        <p class="font-medium text-gray-900">${notification.message}</p>
                        <p class="text-sm text-gray-600 mt-2">${new Date(notification.timestamp).toLocaleString('es-ES')}</p>
                    </div>

                    <div class="flex justify-end space-x-3">
                        <button onclick="collectionModule.dismissUrgentNotification('${notification.id}')" 
                                class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                            Entendido
                        </button>
                        <button onclick="collectionModule.respondToNotification('${notification.id}')" 
                                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                            Responder
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', urgentModal);
        
        // Auto-dismiss después de 30 segundos si no se responde
        setTimeout(() => {
            const modal = document.getElementById(`urgent-notification-${notification.id}`);
            if (modal) {
                modal.remove();
            }
        }, 30000);
    },

    dismissUrgentNotification(notificationId) {
        // Marcar como leída
        const notification = this.notifications.find(n => n.id == notificationId);
        if (notification) {
            notification.read = true;
            this.saveNotifications();
            this.updateNotificationBadge();
        }
        
        // Remover modal
        const modal = document.getElementById(`urgent-notification-${notificationId}`);
        if (modal) {
            modal.remove();
        }
    },

    respondToNotification(notificationId) {
        const notification = this.notifications.find(n => n.id == notificationId);
        if (!notification) return;

        const responseModal = `
            <div id="response-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 w-full max-w-lg">
                    <h3 class="text-lg font-semibold mb-4">Responder a Notificación</h3>
                    
                    <div class="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p class="text-sm text-gray-600">Mensaje original:</p>
                        <p class="font-medium">${notification.message}</p>
                    </div>

                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Su respuesta:</label>
                            <textarea id="response-text" rows="4" 
                                      class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                      placeholder="Escriba su respuesta..."></textarea>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Prioridad de respuesta:</label>
                            <select id="response-priority" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                <option value="normal">Normal</option>
                                <option value="urgent">Urgente</option>
                            </select>
                        </div>
                    </div>

                    <div class="flex justify-end space-x-4 pt-4 border-t mt-4">
                        <button onclick="collectionModule.cancelResponse()" 
                                class="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button onclick="collectionModule.sendResponse('${notificationId}')" 
                                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Enviar Respuesta
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Remover modal de notificación urgente
        const urgentModal = document.getElementById(`urgent-notification-${notificationId}`);
        if (urgentModal) {
            urgentModal.remove();
        }

        document.body.insertAdjacentHTML('beforeend', responseModal);
    },

    sendResponse(notificationId) {
        const responseText = document.getElementById('response-text').value;
        const priority = document.getElementById('response-priority').value;

        if (!responseText.trim()) {
            authSystem?.showNotification?.('Debe escribir una respuesta', 'warning');
            return;
        }

        const response = {
            id: Date.now(),
            originalNotificationId: notificationId,
            from: app?.currentUser?.name,
            to: 'admin',
            message: responseText,
            priority: priority,
            timestamp: new Date().toISOString(),
            type: 'operator_response'
        };

        // Guardar respuesta para el administrador
        try {
            const adminResponses = JSON.parse(localStorage.getItem('ecogestion_admin_responses') || '[]');
            adminResponses.push(response);
            localStorage.setItem('ecogestion_admin_responses', JSON.stringify(adminResponses));
        } catch (e) {
            console.error('Error saving response:', e);
        }

        // Marcar notificación original como leída
        const notification = this.notifications.find(n => n.id == notificationId);
        if (notification) {
            notification.read = true;
            notification.responded = true;
            this.saveNotifications();
            this.updateNotificationBadge();
        }

        document.getElementById('response-modal').remove();
        authSystem?.showNotification?.('Respuesta enviada al administrador', 'success');
    },

    cancelResponse() {
        document.getElementById('response-modal').remove();
    },

    showNotificationsPanel() {
        const panelHTML = `
            <div id="notifications-panel" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg w-full max-w-2xl max-h-96 overflow-hidden">
                    <div class="p-6 border-b">
                        <div class="flex justify-between items-center">
                            <h3 class="text-lg font-semibold">Notificaciones</h3>
                            <button onclick="collectionModule.closeNotificationsPanel()" 
                                    class="text-gray-400 hover:text-gray-600">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="overflow-y-auto max-h-80">
                        ${this.renderNotificationsList()}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', panelHTML);
        
        // Marcar todas como leídas al abrir el panel
        this.notifications.forEach(n => n.read = true);
        this.saveNotifications();
        this.updateNotificationBadge();
    },

    renderNotificationsList() {
        if (this.notifications.length === 0) {
            return `
                <div class="p-6 text-center text-gray-500">
                    <i class="fas fa-inbox text-4xl mb-4"></i>
                    <p>No hay notificaciones</p>
                </div>
            `;
        }

        const sortedNotifications = this.notifications.sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        return `
            <div class="divide-y divide-gray-200">
                ${sortedNotifications.map(notification => `
                    <div class="p-4 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}">
                        <div class="flex items-start space-x-3">
                            <div class="p-2 rounded-full ${this.getNotificationTypeColor(notification.type)}">
                                <i class="fas ${this.getNotificationIcon(notification.type)} text-sm"></i>
                            </div>
                            <div class="flex-1">
                                <p class="font-medium text-gray-900">${notification.message}</p>
                                <p class="text-sm text-gray-500">${new Date(notification.timestamp).toLocaleString('es-ES')}</p>
                                ${notification.urgency === 'high' ? '<span class="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 rounded mt-1">Urgente</span>' : ''}
                                ${notification.responded ? '<span class="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded mt-1">Respondido</span>' : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    getNotificationTypeColor(type) {
        const colors = {
            'incident_alert': 'bg-red-100',
            'route_modification_request': 'bg-blue-100',
            'system_message': 'bg-green-100',
            'warning': 'bg-yellow-100'
        };
        return colors[type] || 'bg-gray-100';
    },

    getNotificationIcon(type) {
        const icons = {
            'incident_alert': 'fa-exclamation-triangle text-red-600',
            'route_modification_request': 'fa-route text-blue-600',
            'system_message': 'fa-info-circle text-green-600',
            'warning': 'fa-exclamation text-yellow-600'
        };
        return icons[type] || 'fa-bell text-gray-600';
    },

    closeNotificationsPanel() {
        const panel = document.getElementById('notifications-panel');
        if (panel) {
            panel.remove();
        }
    },

    // ========== CONTROL DE CALIDAD Y VERIFICACIONES AUTOMÁTICAS ==========

    initQualityControl() {
        // Cargar configuración de calidad
        this.loadQualitySettings();
    },

    loadQualitySettings() {
        try {
            const settings = localStorage.getItem('ecogestion_quality_settings');
            if (settings) {
                this.qualitySettings = JSON.parse(settings);
            } else {
                // Configuración por defecto
                this.qualitySettings = {
                    maxWeightVariation: 20, // 20% de variación permitida
                    requirePhotos: true,
                    requireSignature: true,
                    autoVerifyWeights: true,
                    alertOnAnomalies: true
                };
            }
        } catch (e) {
            console.warn('Error loading quality settings:', e);
        }
    },

    performQualityChecks(collectionData) {
        const checks = {
            weightVariation: this.checkWeightVariation(collectionData),
            photosPresent: this.checkPhotosPresent(collectionData),
            signaturePresent: this.checkSignaturePresent(collectionData),
            wasteClassification: this.checkWasteClassification(collectionData)
        };

        const passedChecks = Object.values(checks).filter(check => check.passed).length;
        const totalChecks = Object.keys(checks).length;
        const qualityScore = Math.round((passedChecks / totalChecks) * 100);

        return {
            score: qualityScore,
            checks: checks,
            passed: qualityScore >= 80 // 80% mínimo para aprobar
        };
    },

    checkWeightVariation(collectionData) {
        const estimated = parseFloat(collectionData.estimatedWeight || 0);
        const actual = parseFloat(collectionData.actualWeight || 0);
        
        if (estimated === 0) {
            return { passed: true, message: 'Sin peso estimado para comparar' };
        }

        const variation = Math.abs((actual - estimated) / estimated) * 100;
        const passed = variation <= this.qualitySettings.maxWeightVariation;

        return {
            passed: passed,
            variation: variation.toFixed(1),
            message: passed ? 
                `Variación aceptable: ${variation.toFixed(1)}%` : 
                `Variación excesiva: ${variation.toFixed(1)}% (máximo ${this.qualitySettings.maxWeightVariation}%)`
        };
    },

    checkPhotosPresent(collectionData) {
        const hasPhotos = collectionData.photos && collectionData.photos.length > 0;
        return {
            passed: !this.qualitySettings.requirePhotos || hasPhotos,
            message: hasPhotos ? 'Fotos de evidencia presentes' : 'Faltan fotos de evidencia'
        };
    },

    checkSignaturePresent(collectionData) {
        const hasSignature = collectionData.clientSignature || collectionData.signature;
        return {
            passed: !this.qualitySettings.requireSignature || hasSignature,
            message: hasSignature ? 'Firma del cliente presente' : 'Falta firma del cliente'
        };
    },

    checkWasteClassification(collectionData) {
        const hasClassification = collectionData.wasteType && collectionData.wasteType !== '';
        return {
            passed: hasClassification,
            message: hasClassification ? 'Clasificación de residuos correcta' : 'Falta clasificación de residuos'
        };
    },

    showQualityReport(qualityResult) {
        const reportHTML = `
            <div id="quality-report-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 w-full max-w-lg">
                    <h3 class="text-lg font-semibold mb-4">Reporte de Calidad</h3>
                    
                    <div class="mb-6">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-sm font-medium">Puntuación de Calidad</span>
                            <span class="text-2xl font-bold ${qualityResult.score >= 80 ? 'text-green-600' : 'text-red-600'}">${qualityResult.score}%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-${qualityResult.score >= 80 ? 'green' : 'red'}-500 h-2 rounded-full" style="width: ${qualityResult.score}%"></div>
                        </div>
                    </div>

                    <div class="space-y-3">
                        ${Object.entries(qualityResult.checks).map(([key, check]) => `
                            <div class="flex items-center space-x-3">
                                <i class="fas ${check.passed ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500'}"></i>
                                <div class="flex-1">
                                    <p class="text-sm font-medium">${this.getCheckLabel(key)}</p>
                                    <p class="text-xs text-gray-600">${check.message}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="flex justify-end space-x-4 pt-4 border-t mt-4">
                        <button onclick="document.getElementById('quality-report-modal').remove()" 
                                class="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">
                            Cerrar
                        </button>
                        ${!qualityResult.passed ? `
                            <button onclick="collectionModule.requestQualityReview()" 
                                    class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                                Solicitar Revisión
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', reportHTML);
    },

    getCheckLabel(checkKey) {
        const labels = {
            weightVariation: 'Variación de Peso',
            photosPresent: 'Evidencia Fotográfica',
            signaturePresent: 'Firma del Cliente',
            wasteClassification: 'Clasificación de Residuos'
        };
        return labels[checkKey] || checkKey;
    },

    requestQualityReview() {
        authSystem?.showNotification?.('Solicitud de revisión enviada al supervisor', 'info');
        document.getElementById('quality-report-modal').remove();
    },

    // Inicializar todos los sistemas cuando se carga el módulo
    init() {
        this.initShiftManagement();
        this.initCommunicationSystem();
        this.initQualityControl();
    }
};
