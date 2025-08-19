// js/app.js
class WasteManagementApp {
    constructor() {
        // Estado base
        this.currentUser = null;
        this.currentModule = 'dashboard';

        // Callback para cuando se crean usuarios
        this.onUserCreated = null; // callback que puede usar servicesModule

        // Iniciar
        this.init();
    }

    // ========= BOOT =========
    init() {
        // Los usuarios se cargan automáticamente en auth.js

        // Mostrar loader breve
        this.showLoadingScreen();
        setTimeout(() => {
            this.hideLoadingScreen();

            // Intentar restaurar sesión desde localStorage
            try {
                const saved = localStorage.getItem('ecogestion_current_user');
                if (saved) {
                    this.currentUser = JSON.parse(saved);
                }
            } catch (e) { console.warn('No se pudo restaurar sesión:', e); }

            if (this.currentUser) {
                this.showMainApp();
                this.enforceTemporaryPassword(); // forzar cambio si aplica
            } else {
                this.showLoginScreen();
            }
        }, 600);
    }

    // ========= LOADING =========
    showLoadingScreen() {
        const progressBar = document.getElementById('progress-bar');
        let progress = 0;
        this._progressTimer = setInterval(() => {
            progress += 3;
            if (progressBar) progressBar.style.width = progress + '%';
            if (progress >= 100) {
                clearInterval(this._progressTimer);
            }
        }, 30);
    }
    hideLoadingScreen() {
        const el = document.getElementById('loading-screen');
        if (el) el.classList.add('hidden');
    }

    // ========= VISTAS BASE =========
    showLoginScreen() {
        const login = document.getElementById('login-screen');
        const main = document.getElementById('main-app');
        if (login) login.classList.remove('hidden');
        if (main) main.classList.add('hidden');
    }
    hideLoginScreen() {
        const login = document.getElementById('login-screen');
        if (login) login.classList.add('hidden');
    }
    showMainApp() {
        this.hideLoginScreen();
        const main = document.getElementById('main-app');
        if (main) main.classList.remove('hidden');

        // Top bar info
        this.updateUserInfoBar();

        // Botón de salir
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn && !logoutBtn._bound) {
            logoutBtn.addEventListener('click', () => {
                // Si tienes authSystem con logout, úsalo. Si no, hacemos manual:
                if (window.authSystem && typeof authSystem.logout === 'function') {
                    authSystem.logout();
                } else {
                    this.handleLogout();
                }
            });
            logoutBtn._bound = true;
        }

        // Menú e inicio
        this.loadMenu();
        this.loadDashboard();
    }
    updateUserInfoBar() {
        const info = document.getElementById('user-info');
        if (!info || !this.currentUser) return;
        const role = this.getUserTypeLabel(this.currentUser.type);
        info.textContent = `${this.currentUser.name} — ${role}`;
    }

    // ========= NAVEGACIÓN =========
    loadMenu() {
        const menuItems = document.getElementById('menu-items');
        if (!menuItems || !this.currentUser) return;

        const userType = this.currentUser.type || 'client';
        let menuConfig = [];

        if (userType === 'admin') {
            menuConfig = [
                {icon: 'fas fa-tachometer-alt', label: 'Dashboard', module: 'dashboard'},
                {icon: 'fas fa-clipboard-list', label: 'Solicitudes', module: 'services'},
                {icon: 'fas fa-route', label: 'Rutas', module: 'routes'},
                {icon: 'fas fa-truck', label: 'Recolección', module: 'collection'},
                {icon: 'fas fa-file-alt', label: 'Manifiestos', module: 'manifests'},
                {icon: 'fas fa-industry', label: 'Planta', module: 'plant'},
                {icon: 'fas fa-chart-bar', label: 'Reportes', module: 'reports'},
                {icon: 'fas fa-trash-alt', label: 'Disposición', module: 'disposal'},
                {icon: 'fas fa-users', label: 'Usuarios', module: 'users'},
                {icon: 'fas fa-cog', label: 'Configuración', module: 'config'}
            ];
        } else if (userType === 'operator') {
            menuConfig = [
                {icon: 'fas fa-tachometer-alt', label: 'Dashboard', module: 'dashboard'},
                {icon: 'fas fa-route', label: 'Mis Rutas', module: 'routes'},
                {icon: 'fas fa-truck', label: 'Recolección', module: 'collection'},
                {icon: 'fas fa-file-alt', label: 'Manifiestos', module: 'manifests'},
                {icon: 'fas fa-industry', label: 'Recepción', module: 'plant'}
            ];
        } else { // client
            menuConfig = [
                {icon: 'fas fa-tachometer-alt', label: 'Inicio', module: 'dashboard'},
                {icon: 'fas fa-plus-circle', label: 'Nueva Solicitud', module: 'new-service'},
                {icon: 'fas fa-history', label: 'Mis Servicios', module: 'my-services'},
                {icon: 'fas fa-file-invoice', label: 'Facturas', module: 'invoices'},
                {icon: 'fas fa-map-marker-alt', label: 'Seguimiento', module: 'tracking'}
            ];
        }

        menuItems.innerHTML = menuConfig.map(item => `
            <li>
                <a href="#" id="nav-${item.module}" onclick="app.loadModule('${item.module}')"
                   class="nav-link flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded transition-colors duration-200">
                    <i class="${item.icon} mr-3"></i>${item.label}
                </a>
            </li>
        `).join('');
    }

    loadModule(moduleName) {
        if (!this.requireAuth()) return;

        // --- START: HIGHLIGHTING LOGIC ---
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('bg-gray-700', 'text-white');
            link.classList.add('text-gray-300');
        });

        // Add active class to the current link
        const activeLink = document.getElementById(`nav-${moduleName}`);
        if (activeLink) {
            activeLink.classList.add('bg-gray-700', 'text-white');
            activeLink.classList.remove('text-gray-300');
        }
        // --- END: HIGHLIGHTING LOGIC ---

        this.currentModule = moduleName;
        const contentArea = document.getElementById('content-area');

        switch(moduleName) {
            case 'dashboard': this.loadDashboard(); break;
            case 'services': this.loadServices(); break;
            case 'new-service': this.loadNewService(); break;
            case 'routes': this.loadRoutes(); break;
            case 'collection': this.loadCollection(); break;
            case 'manifests': this.loadManifests(); break;
            case 'plant': this.loadPlant(); break;
            case 'reports': this.loadReports(); break;
            case 'disposal': this.loadDisposal(); break;
            case 'users': this.loadUsers(); break;
            case 'my-services': this.loadMyServices(); break;
            case 'invoices': this.loadInvoices(); break;
            case 'tracking': this.loadTracking(); break;
            case 'config': this.loadConfig(); break;
            default:
                if (contentArea) {
                    contentArea.innerHTML = '<div class="text-center py-8"><h2 class="text-2xl">Módulo en desarrollo</h2></div>';
                }
        }
    }

    requireAuth() {
        if (!this.currentUser) {
            this.showLoginScreen();
            if (window.authSystem && typeof authSystem.showNotification === 'function') {
                authSystem.showNotification('Debe iniciar sesión para acceder a esta función', 'error');
            }
            return false;
        }
        return true;
    }

    // ========= CARGADORES DE MÓDULOS (delegan a otros archivos si existen) =========
    loadDashboard() {
        if (window.dashboardModule && typeof window.dashboardModule.load === 'function') {
            window.dashboardModule.load(this.currentUser?.type || 'client');
        } else {
            const contentArea = document.getElementById('content-area');
            if (contentArea) {
                contentArea.innerHTML = `<div class="bg-white rounded-lg shadow p-6">
                    <h2 class="text-2xl font-bold mb-2">Dashboard</h2>
                    <p class="text-gray-600">Contenido del dashboard...</p>
                </div>`;
            }
        }
    }
    loadServices() { if (window.servicesModule?.load) window.servicesModule.load(); }
    loadNewService() { if (window.servicesModule?.loadNewService) window.servicesModule.loadNewService(); }
    loadRoutes() { if (window.routesModule?.load) window.routesModule.load(); }
    loadCollection() { if (window.collectionModule?.load) window.collectionModule.load(); }
    loadManifests() { if (window.manifestsModule?.load) window.manifestsModule.load(); }
    loadPlant() { if (window.plantModule?.load) window.plantModule.load(); }
    loadReports() { if (window.reportsModule?.load) window.reportsModule.load(); }
    loadDisposal() { if (window.disposalModule?.load) window.disposalModule.load(); }

    // Vistas cliente (si se usan)
    loadMyServices() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;
        
        const currentUser = this.currentUser;
        if (!currentUser || currentUser.type !== 'client') {
            contentArea.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-lock text-6xl text-gray-400 mb-4"></i>
                    <h2 class="text-2xl text-gray-600">Acceso Restringido</h2>
                    <p class="text-gray-500">Esta sección es solo para clientes.</p>
                </div>
            `;
            return;
        }

        // Obtener servicios del cliente actual
        const clientServices = this.getClientServices(currentUser.id);
        
        contentArea.innerHTML = `
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-gray-800">Mis Servicios</h1>
                <p class="text-gray-600">Historial y estado de sus solicitudes de recolección</p>
            </div>

            <!-- Resumen de servicios -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                ${this.renderServiceSummaryCards(clientServices)}
            </div>

            <!-- Filtros simples -->
            <div class="bg-white p-4 rounded-lg shadow mb-6">
                <div class="flex flex-wrap gap-4 items-center">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                        <select id="client-status-filter" class="px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                            <option value="">Todos</option>
                            <option value="Pendiente de Aprobación">Pendiente</option>
                            <option value="Aprobado">Aprobado</option>
                            <option value="Programado">Programado</option>
                            <option value="En Proceso">En Proceso</option>
                            <option value="Completado">Completado</option>
                            <option value="Rechazado">Rechazado</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Últimos</label>
                        <select id="client-period-filter" class="px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                            <option value="">Todos</option>
                            <option value="30">Últimos 30 días</option>
                            <option value="90">Últimos 3 meses</option>
                            <option value="365">Último año</option>
                        </select>
                    </div>
                    <div class="flex items-end">
                        <button onclick="app.applyClientFilters()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                            <i class="fas fa-filter mr-2"></i>Aplicar
                        </button>
                    </div>
                </div>
            </div>

            <!-- Lista de servicios -->
            <div class="bg-white rounded-lg shadow overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solicitud</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Volumen</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200" id="client-services-table-body">
                            ${this.renderClientServicesTable(clientServices)}
                        </tbody>
                    </table>
                </div>
                ${clientServices.length === 0 ? `
                    <div class="text-center py-12">
                        <i class="fas fa-clipboard-list text-6xl text-gray-300 mb-4"></i>
                        <h3 class="text-xl font-medium text-gray-900 mb-2">No hay servicios registrados</h3>
                        <p class="text-gray-500 mb-6">Aún no ha solicitado ningún servicio de recolección.</p>
                        <button onclick="app.loadModule('new-service')" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                            <i class="fas fa-plus mr-2"></i>Solicitar Primer Servicio
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }
    loadInvoices() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;
        
        const currentUser = this.currentUser;
        if (!currentUser || currentUser.type !== 'client') {
            contentArea.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-lock text-6xl text-gray-400 mb-4"></i>
                    <h2 class="text-2xl text-gray-600">Acceso Restringido</h2>
                    <p class="text-gray-500">Esta sección es solo para clientes.</p>
                </div>
            `;
            return;
        }

        // Obtener facturas del cliente actual
        const clientInvoices = this.getClientInvoices(currentUser.id);
        
        contentArea.innerHTML = `
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-gray-800">Mis Facturas</h1>
                <p class="text-gray-600">Historial de facturación y estado de pagos</p>
            </div>

            <!-- Resumen de facturación -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                ${this.renderInvoiceSummaryCards(clientInvoices)}
            </div>

            <!-- Filtros -->
            <div class="bg-white p-4 rounded-lg shadow mb-6">
                <div class="flex flex-wrap gap-4 items-center">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                        <select id="invoice-status-filter" class="px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                            <option value="">Todos</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="Pagada">Pagada</option>
                            <option value="Vencida">Vencida</option>
                            <option value="Cancelada">Cancelada</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Período</label>
                        <select id="invoice-period-filter" class="px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                            <option value="">Todos</option>
                            <option value="30">Últimos 30 días</option>
                            <option value="90">Últimos 3 meses</option>
                            <option value="180">Últimos 6 meses</option>
                            <option value="365">Último año</option>
                        </select>
                    </div>
                    <div class="flex items-end">
                        <button onclick="app.applyInvoiceFilters()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mr-2">
                            <i class="fas fa-filter mr-2"></i>Aplicar
                        </button>
                        <button onclick="app.downloadInvoiceReport()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                            <i class="fas fa-download mr-2"></i>Reporte
                        </button>
                    </div>
                </div>
            </div>

            <!-- Lista de facturas -->
            <div class="bg-white rounded-lg shadow overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Factura</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Servicio</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vencimiento</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200" id="invoices-table-body">
                            ${this.renderInvoicesTable(clientInvoices)}
                        </tbody>
                    </table>
                </div>
                ${clientInvoices.length === 0 ? `
                    <div class="text-center py-12">
                        <i class="fas fa-file-invoice-dollar text-6xl text-gray-300 mb-4"></i>
                        <h3 class="text-xl font-medium text-gray-900 mb-2">No hay facturas registradas</h3>
                        <p class="text-gray-500 mb-6">Las facturas aparecerán aquí una vez que complete servicios.</p>
                        <button onclick="app.loadModule('new-service')" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                            <i class="fas fa-plus mr-2"></i>Solicitar Servicio
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }
    loadTracking() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;
        
        const currentUser = this.currentUser;
        if (!currentUser || currentUser.type !== 'client') {
            contentArea.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-lock text-6xl text-gray-400 mb-4"></i>
                    <h2 class="text-2xl text-gray-600">Acceso Restringido</h2>
                    <p class="text-gray-500">Esta sección es solo para clientes.</p>
                </div>
            `;
            return;
        }

        // Obtener servicios activos del cliente (Programado, En Proceso)
        const activeServices = this.getActiveServicesForTracking(currentUser.id);
        
        contentArea.innerHTML = `
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-gray-800">Seguimiento en Tiempo Real</h1>
                <p class="text-gray-600">Ubicación y estado de sus servicios de recolección activos</p>
            </div>

            <!-- Selector de servicio activo -->
            <div class="bg-white p-4 rounded-lg shadow mb-6">
                <div class="flex flex-wrap gap-4 items-center">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Servicio a Seguir</label>
                        <select id="tracking-service-selector" onchange="app.selectServiceForTracking(this.value)" 
                                class="px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                            ${activeServices.length === 0 ? 
                                '<option value="">No hay servicios activos</option>' :
                                activeServices.map(service => 
                                    `<option value="${service.id}">Servicio #${String(service.id).padStart(3, '0')} - ${service.wasteType}</option>`
                                ).join('')
                            }
                        </select>
                    </div>
                    <div class="flex items-end space-x-2">
                        <button onclick="app.refreshTracking()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                            <i class="fas fa-sync-alt mr-2"></i>Actualizar
                        </button>
                        <button id="auto-refresh-btn" onclick="app.toggleAutoRefresh()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                            <i class="fas fa-play mr-2"></i>Auto-actualizar
                        </button>
                    </div>
                </div>
            </div>

            ${activeServices.length === 0 ? `
                <!-- Estado sin servicios activos -->
                <div class="bg-white rounded-lg shadow p-8">
                    <div class="text-center">
                        <i class="fas fa-map-marker-alt text-6xl text-gray-300 mb-4"></i>
                        <h3 class="text-xl font-medium text-gray-900 mb-2">No hay servicios activos para seguir</h3>
                        <p class="text-gray-500 mb-6">Los servicios aparecerán aquí cuando estén programados o en proceso.</p>
                        <div class="space-x-4">
                            <button onclick="app.loadModule('new-service')" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                                <i class="fas fa-plus mr-2"></i>Solicitar Servicio
                            </button>
                            <button onclick="app.loadModule('my-services')" class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700">
                                <i class="fas fa-list mr-2"></i>Ver Mis Servicios
                            </button>
                        </div>
                    </div>
                </div>
            ` : `
                <!-- Vista principal de seguimiento -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Mapa de seguimiento -->
                    <div class="lg:col-span-2">
                        <div class="bg-white rounded-lg shadow overflow-hidden">
                            <div class="p-4 border-b bg-gray-50">
                                <div class="flex justify-between items-center">
                                    <h3 class="text-lg font-semibold">Ubicación del Vehículo</h3>
                                    <div class="flex items-center space-x-2">
                                        <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                        <span class="text-sm text-green-600 font-medium">En línea</span>
                                    </div>
                                </div>
                            </div>
                            <div id="tracking-map" class="h-96 bg-gray-100 relative">
                                ${this.renderTrackingMap()}
                            </div>
                        </div>
                    </div>

                    <!-- Panel de información -->
                    <div class="space-y-6">
                        <!-- Estado actual -->
                        <div class="bg-white rounded-lg shadow p-6">
                            <h4 class="text-lg font-semibold mb-4">Estado Actual</h4>
                            <div id="current-status" class="space-y-3">
                                ${this.renderCurrentStatus(activeServices[0])}
                            </div>
                        </div>

                        <!-- Estimaciones -->
                        <div class="bg-white rounded-lg shadow p-6">
                            <h4 class="text-lg font-semibold mb-4">Estimaciones</h4>
                            <div id="estimations" class="space-y-3">
                                ${this.renderEstimations(activeServices[0])}
                            </div>
                        </div>

                        <!-- Información del vehículo -->
                        <div class="bg-white rounded-lg shadow p-6">
                            <h4 class="text-lg font-semibold mb-4">Vehículo Asignado</h4>
                            <div id="vehicle-info" class="space-y-3">
                                ${this.renderVehicleInfo(activeServices[0])}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Timeline de eventos -->
                <div class="mt-6 bg-white rounded-lg shadow">
                    <div class="p-6 border-b">
                        <h3 class="text-lg font-semibold">Timeline del Servicio</h3>
                    </div>
                    <div class="p-6">
                        <div id="service-timeline">
                            ${this.renderServiceTimeline(activeServices[0])}
                        </div>
                    </div>
                </div>
            `}
        `;

        // Iniciar auto-refresh si hay servicios activos
        if (activeServices.length > 0) {
            this.initializeTracking(activeServices[0]);
        }
    }

    // ========= USUARIOS (ADMIN) =========
    loadUsers() {
        if (!this.requireAuth()) return;

        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        contentArea.innerHTML = `
            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold">Gestión de Usuarios</h2>
                    <button onclick="app.showNewUserModal()" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        <i class="fas fa-plus mr-2"></i>Nuevo Usuario
                    </button>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full bg-white">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200" id="users-table-body"></tbody>
                    </table>
                </div>
            </div>
        `;
        this.loadUsersData();
    }

    loadUsersData() {
        // garantizar que tenemos usuarios
        const users = authSystem.getAllUsers();
        const tbody = document.getElementById('users-table-body');
        if (!tbody) return;

        tbody.innerHTML = users.map(user => `
            <tr data-user-id="${user.id}" class="${user.status === 'Inactivo' ? 'bg-gray-50 opacity-75' : ''}">
                <td class="px-6 py-4 whitespace-nowrap" ${user.address ? `title="Dirección: ${user.address}"` : ''}>${user.name}${user.status === 'Inactivo' ? ' <span class="text-gray-500 text-xs">(Desactivado)</span>' : ''}</td>
                <td class="px-6 py-4 whitespace-nowrap">${user.email}</td>
                <td class="px-6 py-4 whitespace-nowrap">${user.phone || '<span class="text-gray-400">No registrado</span>'}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs rounded-full ${this.getUserTypeClass(user.type)}">
                        ${this.getUserTypeLabel(user.type)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs rounded-full ${user.status === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${user.status || 'Activo'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="app.editUser(${user.id})" class="text-blue-600 hover:text-blue-900 mr-2">
                        <i class="fas fa-edit mr-1"></i>Editar
                    </button>
                    <button onclick="app.deactivateUser(${user.id})" class="${user.status === 'Activo' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}">
                        <i class="fas ${user.status === 'Activo' ? 'fa-user-slash' : 'fa-user-check'} mr-1"></i>${user.status === 'Activo' ? 'Desactivar' : 'Activar'}
                    </button>
                </td>
            </tr>
        `).join('');
    }

    editUser(userId) {
        const user = authSystem.getUserById(userId);
        if (user) {
            this.showNewUserModal(user);
        }
    }

    deactivateUser(userId) {
        try {
            const user = authSystem.getUserById(userId);
            if (!user) {
                authSystem.showNotification('Usuario no encontrado', 'error');
                return;
            }
            
            const newStatus = user.status === 'Activo' ? 'Inactivo' : 'Activo';
            const action = newStatus === 'Activo' ? 'activar' : 'desactivar';
            
            if (confirm(`¿Está seguro de que desea ${action} a este usuario?`)) {
                authSystem.changeUserStatus(userId, newStatus);
                authSystem.showNotification(`Usuario ${action}do exitosamente`, 'success');
                this.loadUsersData();
            }
        } catch (error) {
            authSystem.showNotification(error.message, 'error');
        }
    }

    getUserTypeClass(type) {
        const classes = {
            'admin': 'bg-purple-100 text-purple-800',
            'operator': 'bg-blue-100 text-blue-800',
            'client': 'bg-gray-100 text-gray-800'
        };
        return classes[type] || 'bg-gray-100 text-gray-800';
    }
    getUserTypeLabel(type) {
        const labels = {
            'admin': 'Administrador',
            'operator': 'Operador',
            'client': 'Cliente'
        };
        return labels[type] || 'Desconocido';
    }

    // ========= CREACIÓN DE USUARIO (modal) =========
    showNewUserModal(prefill = {}) {
        const isEdit = prefill.id != null;
        const { id = null, email = '', type = 'client', lockType = false, name = '', address = '', phone = '' } = prefill;
        const modalHTML = `
            <div id="new-user-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 w-full max-w-lg">
                    <h3 class="text-lg font-semibold mb-4">${isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                    <form id="new-user-form">
                        <input type="hidden" id="new-user-id" value="${id || ''}">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Nombre o Empresa</label>
                                <input type="text" id="new-user-name" class="w-full px-3 py-2 border rounded-lg" required value="${name}" placeholder="Ej: Juan Pérez o Constructora XYZ">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Email</label>
                                <input type="email" id="new-user-email" class="w-full px-3 py-2 border rounded-lg" required value="${email}" placeholder="ejemplo@correo.com">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Teléfono</label>
                                <input type="tel" id="new-user-phone" class="w-full px-3 py-2 border rounded-lg" value="${phone}" placeholder="Ej: 3001234567">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Tipo de Usuario</label>
                                <select id="new-user-type" class="w-full px-3 py-2 border rounded-lg" required ${lockType ? 'disabled' : ''}>
                                    <option value="admin" ${type==='admin'?'selected':''}>Administrador</option>
                                    <option value="operator" ${type==='operator'?'selected':''}>Operador</option>
                                    <option value="client" ${type==='client'?'selected':''}>Cliente</option>
                                </select>
                            </div>
                            <div id="address-field-container" class="md:col-span-2" style="display: ${type === 'client' ? 'block' : 'none'};">
                                <label class="block text-sm font-medium text-gray-700">Dirección Completa</label>
                                <input type="text" id="new-user-address" class="w-full px-3 py-2 border rounded-lg" value="${address}" placeholder="Ej: Av. Siempreviva 742, Springfield">
                            </div>
                        </div>
                        <div class="flex justify-end space-x-4 mt-6">
                            <button type="button" onclick="document.getElementById('new-user-modal').remove()" class="px-4 py-2 border rounded-lg">Cancelar</button>
                            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg">${isEdit ? 'Guardar Cambios' : 'Crear Usuario'}</button>
                        </div>
                    </form>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const userTypeSelect = document.getElementById('new-user-type');
        const addressContainer = document.getElementById('address-field-container');
        
        userTypeSelect.addEventListener('change', (e) => {
            if (e.target.value === 'client') {
                addressContainer.style.display = 'block';
            } else {
                addressContainer.style.display = 'none';
            }
        });

        document.getElementById('new-user-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const userId = document.getElementById('new-user-id').value;
            const userData = {
                name: document.getElementById('new-user-name').value.trim(),
                email: document.getElementById('new-user-email').value.trim(),
                phone: document.getElementById('new-user-phone').value.trim(),
                type: lockType ? type : document.getElementById('new-user-type').value,
                address: document.getElementById('new-user-address').value.trim()
            };
            if (userId) {
                userData.id = parseInt(userId, 10);
            }
            this.saveNewUser(userData);
            document.getElementById('new-user-modal').remove();
        });
    }

    saveNewUser(userData) {
        const { id, name, email, type, address, phone } = userData;

        if (!/^\S+@\S+\.\S+$/.test(email.toLowerCase())) {
            window.authSystem?.showNotification?.('Por favor, ingrese un email válido.', 'error');
            return;
        }

        try {
            if (id) { // Editar usuario existente
                const updateData = {
                    username: email.split('@')[0], // Generar username desde email
                    name,
                    email,
                    type,
                    phone,
                };
                
                if (type === 'client') {
                    updateData.address = address;
                }

                authSystem.updateUser(id, updateData);
                window.authSystem?.showNotification?.('Usuario actualizado correctamente.', 'success');
                this.loadUsersData?.();
            } else { // Crear nuevo usuario
                const tempPassword = this.generateTemporaryPassword();
                const newUserData = {
                    username: email.split('@')[0], // Generar username desde email
                    password: tempPassword,
                    name,
                    email,
                    type,
                    phone,
                    isTemporaryPassword: true,
                    status: 'Activo'
                };
                
                if (type === 'client') {
                    newUserData.address = address;
                }

                const newUser = authSystem.addUser(newUserData);
                
                // Mostrar el modal inmediatamente
                this.showWelcomeEmailModal(email, tempPassword, type);
                
                // Actualizar la lista de usuarios después
                setTimeout(() => {
                    this.loadUsersData?.();
                }, 200);
                
                window.authSystem?.showNotification?.('Usuario creado exitosamente.', 'success');
                
                if (typeof this.onUserCreated === 'function') {
                    try { this.onUserCreated(newUser); } catch (e) { console.warn(e); }
                }
            }
        } catch (error) {
            window.authSystem?.showNotification?.(error.message, 'error');
            return;
        }
    }

    // ========= CONFIGURACIÓN (ADMIN) =========
    loadConfig() {
        if (!this.requireAuth()) return;
        
        // Verificar permisos de admin
        if (this.currentUser.type !== 'admin') {
            const contentArea = document.getElementById('content-area');
            if (contentArea) {
                contentArea.innerHTML = `
                    <div class="text-center py-8">
                        <i class="fas fa-lock text-6xl text-gray-400 mb-4"></i>
                        <h2 class="text-2xl text-gray-600">Acceso Restringido</h2>
                        <p class="text-gray-500">Solo los administradores pueden acceder a la configuración del sistema.</p>
                    </div>
                `;
            }
            return;
        }

        // Cargar módulo de configuración
        if (typeof window.configModule !== 'undefined') {
            window.configModule.load();
        } else {
            const contentArea = document.getElementById('content-area');
            if (contentArea) {
                contentArea.innerHTML = `
                    <div class="text-center py-8">
                        <i class="fas fa-exclamation-triangle text-6xl text-yellow-400 mb-4"></i>
                        <h2 class="text-2xl text-gray-600">Módulo no Disponible</h2>
                        <p class="text-gray-500">El módulo de configuración no está cargado.</p>
                    </div>
                `;
            }
        }
    }

    // ========= FLUJO LOGIN / LOGOUT =========
    handleLoginSuccess(user) {
        // Método pensado para que auth.js lo invoque tras login correcto
        this.currentUser = user;
        try { localStorage.setItem('ecogestion_current_user', JSON.stringify(user)); } catch {}
        this.showMainApp();
        this.enforceTemporaryPassword();
    }
    handleLogout() {
        this.currentUser = null;
        try { localStorage.removeItem('ecogestion_current_user'); } catch {}
        this.showLoginScreen();
        window.authSystem?.showNotification?.('Sesión cerrada', 'info');
    }

    // Forzar cambio de contraseña si es temporal (para clientes, como pediste)
    enforceTemporaryPassword() {
        const u = this.currentUser;
        if (!u || !u.isTemporaryPassword) return;

        // Solo obligamos a clientes (tal como lo vienes usando en servicesModule)
        if (u.type !== 'client') return;

        // Modal bloqueante
        const modalHTML = `
            <div id="force-change-modal" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 w-full max-w-md">
                    <div class="flex items-center mb-4">
                        <i class="fas fa-exclamation-triangle text-yellow-500 text-2xl mr-3"></i>
                        <h3 class="text-lg font-semibold text-gray-900">Contraseña temporal</h3>
                    </div>
                    <p class="text-gray-700 mb-4">Por seguridad debes cambiar tu contraseña antes de continuar.</p>
                    <div class="flex justify-end gap-3">
                        <button id="force-logout" class="px-4 py-2 border rounded-lg">Cerrar sesión</button>
                        <button id="force-change-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg">Cambiar ahora</button>
                    </div>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modal = document.getElementById('force-change-modal');
        const btnChange = document.getElementById('force-change-btn');
        const btnLogout = document.getElementById('force-logout');

        btnChange.addEventListener('click', () => {
            modal.remove();
            // usamos la UI de cambio de password de servicesModule que ya tienes
            if (window.servicesModule && typeof servicesModule.showChangePasswordForm === 'function') {
                servicesModule.showChangePasswordForm();
            } else {
                window.authSystem?.showNotification?.('Pantalla de cambio de contraseña no disponible', 'error');
            }
        });
        btnLogout.addEventListener('click', () => {
            modal.remove();
            this.handleLogout();
        });
    }

    // ========= PERSISTENCIA DE USUARIOS =========
    // Los usuarios ahora se gestionan centralmente en auth.js

    // ========= UTILIDADES =========
    resetUserData() {
        if (confirm("¿Está seguro de que desea borrar todos los datos de usuario y restaurar los valores iniciales? Esta acción no se puede deshacer.")) {
            localStorage.removeItem('ecogestion_users');
            localStorage.removeItem('ecogestion_session');
            location.reload();
        }
    }

    resetServicesData() {
        if (confirm("¿Está seguro de que desea restaurar los servicios de ejemplo? Esto eliminará todos los servicios actuales.")) {
            localStorage.removeItem('ecogestion_services');
            authSystem?.showNotification?.('Datos de servicios restaurados. Recargue la página para ver los cambios.', 'success');
            setTimeout(() => {
                location.reload();
            }, 2000);
        }
    }

    generateTemporaryPassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let pwd = '';
        for (let i = 0; i < 10; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length));
        return pwd;
    }

    showWelcomeEmailModal(email, tempPassword, type) {
        console.log('🔔 Mostrando modal de bienvenida para:', email, 'Tipo:', type);
        
        // Remover modal existente si hay uno
        const existingModal = document.getElementById('welcome-email-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const typeLabels = {
            'admin': 'Administrador',
            'operator': 'Operador',
            'client': 'Cliente'
        };

        const modalHTML = `
        <div id="welcome-email-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-lg p-6 w-full max-w-lg">
                <div class="flex items-center mb-4">
                    <i class="fas fa-user-plus text-green-500 text-2xl mr-3"></i>
                    <h3 class="text-lg font-semibold">Usuario Creado Exitosamente</h3>
                </div>
                
                <div class="mb-4">
                    <p class="text-gray-600">Se ha creado un nuevo usuario. Proporciona estas credenciales para su primer ingreso:</p>
                </div>
                
                <div class="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span class="font-medium text-gray-700">Email:</span>
                            <span class="text-blue-600 font-mono">${email}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="font-medium text-gray-700">Contraseña Temporal:</span>
                            <span class="text-red-600 font-mono bg-red-50 px-2 py-1 rounded">${tempPassword}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="font-medium text-gray-700">Tipo de Usuario:</span>
                            <span class="text-gray-800">${typeLabels[type] || type}</span>
                        </div>
                    </div>
                </div>
                
                <div class="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mb-6">
                    <p class="text-sm text-yellow-800">
                        <i class="fas fa-exclamation-triangle mr-2"></i>
                        <strong>Importante:</strong> El usuario deberá cambiar esta contraseña en su primer inicio de sesión.
                    </p>
                </div>
                
                <div class="flex justify-between">
                    <button type="button" onclick="app.copyCredentials('${email}', '${tempPassword}')" 
                            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <i class="fas fa-copy mr-2"></i>Copiar Credenciales
                    </button>
                    <button type="button" onclick="document.getElementById('welcome-email-modal').remove()" 
                            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>`;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Verificar que el modal se insertó correctamente
        const insertedModal = document.getElementById('welcome-email-modal');
        if (insertedModal) {
            console.log('✅ Modal de bienvenida insertado correctamente');
            // Forzar que aparezca por encima de todo
            insertedModal.style.zIndex = '9999';
        } else {
            console.error('❌ Error: No se pudo insertar el modal de bienvenida');
            // Fallback: mostrar alert si el modal falla
            alert(`Usuario creado exitosamente\n\nEmail: ${email}\nContraseña: ${tempPassword}\nTipo: ${type}\n\nNota: Debe cambiar la contraseña en el primer ingreso.`);
        }
    }

    copyCredentials(email, password) {
        const text = `Credenciales de Acceso EcoGestión\n\nEmail: ${email}\nContraseña: ${password}\n\nNota: Debe cambiar la contraseña en el primer inicio de sesión.`;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                authSystem.showNotification('Credenciales copiadas al portapapeles', 'success');
            }).catch(() => {
                this.fallbackCopyText(text);
            });
        } else {
            this.fallbackCopyText(text);
        }
    }

    fallbackCopyText(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            authSystem.showNotification('Credenciales copiadas al portapapeles', 'success');
        } catch (err) {
            authSystem.showNotification('No se pudo copiar. Anote las credenciales manualmente.', 'warning');
        }
        
        document.body.removeChild(textArea);
    }

    // ========= MÉTODOS PARA "MIS SERVICIOS" (CLIENTES) =========
    getClientServices(clientId) {
        if (!window.servicesModule || !servicesModule.services) return [];
        
        // Filtrar servicios del cliente actual
        return servicesModule.services.filter(service => 
            service.clientId == clientId || service.createdBy == clientId
        ).sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    }

    renderServiceSummaryCards(services) {
        const total = services.length;
        const pending = services.filter(s => s.status === 'Pendiente de Aprobación').length;
        const inProgress = services.filter(s => ['Aprobado', 'Programado', 'En Proceso'].includes(s.status)).length;
        const completed = services.filter(s => s.status === 'Completado').length;

        const cards = [
            { title: 'Total Solicitudes', value: total, icon: 'fa-clipboard-list', color: 'blue' },
            { title: 'Pendientes', value: pending, icon: 'fa-clock', color: 'yellow' },
            { title: 'En Proceso', value: inProgress, icon: 'fa-spinner', color: 'orange' },
            { title: 'Completados', value: completed, icon: 'fa-check-circle', color: 'green' }
        ];

        return cards.map(card => `
            <div class="bg-white p-6 rounded-lg shadow border-l-4 border-${card.color}-500">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-${card.color}-600 text-sm font-medium">${card.title}</p>
                        <p class="text-2xl font-bold text-gray-900">${card.value}</p>
                    </div>
                    <div class="p-3 bg-${card.color}-100 rounded-full">
                        <i class="fas ${card.icon} text-${card.color}-600 text-xl"></i>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderClientServicesTable(services) {
        if (services.length === 0) return '';

        return services.map(service => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                        <div class="text-sm font-medium text-gray-900">#${String(service.id).padStart(3, '0')}</div>
                        <div class="text-xs text-gray-500">Creado: ${this.formatDate(service.createdDate)}</div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${this.formatDate(service.requestedDate)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs rounded-full ${this.getWasteTypeClass(service.wasteType)}">
                        ${service.wasteType}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${service.estimatedVolume} ${service.volumeUnit || 'm³'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs rounded-full ${this.getStatusClass(service.status)}">
                        ${service.status}
                    </span>
                    ${service.status === 'Programado' && service.schedule ? `
                        <div class="text-xs text-gray-500 mt-1">
                            <i class="fas fa-calendar mr-1"></i>${service.schedule.collectionDate} ${service.schedule.collectionTime}
                        </div>
                    ` : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="app.viewClientService(${service.id})" 
                            class="text-blue-600 hover:text-blue-900 mr-3" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${(service.status === 'Programado' || service.status === 'En Proceso') ? `
                        <button onclick="app.trackService(${service.id})" 
                                class="text-green-600 hover:text-green-900" title="Seguimiento GPS">
                            <i class="fas fa-map-marker-alt"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `).join('');
    }

    // Métodos auxiliares reutilizando lógica de servicesModule
    getWasteTypeClass(type) {
        const classes = {
            'Orgánico': 'bg-green-100 text-green-800',
            'Reciclable': 'bg-blue-100 text-blue-800',
            'No Reciclable': 'bg-gray-100 text-gray-800',
            'Peligroso': 'bg-red-100 text-red-800',
            'Electrónicos': 'bg-purple-100 text-purple-800',
            'Construcción': 'bg-yellow-100 text-yellow-800'
        };
        return classes[type] || 'bg-gray-100 text-gray-800';
    }

    getStatusClass(status) {
        const classes = {
            'Pendiente de Aprobación': 'bg-yellow-100 text-yellow-800',
            'Aprobado': 'bg-blue-100 text-blue-800',
            'Rechazado': 'bg-red-100 text-red-800',
            'Programado': 'bg-blue-100 text-blue-800',
            'En Proceso': 'bg-orange-100 text-orange-800',
            'Completado': 'bg-green-100 text-green-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    }

    formatDate(dateString) {
        if (!dateString) return '—';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }

    // Filtros para "Mis Servicios"
    applyClientFilters() {
        const statusFilter = document.getElementById('client-status-filter')?.value || '';
        const periodFilter = document.getElementById('client-period-filter')?.value || '';
        
        const currentUser = this.currentUser;
        if (!currentUser) return;

        let services = this.getClientServices(currentUser.id);

        // Aplicar filtro de estado
        if (statusFilter) {
            services = services.filter(s => s.status === statusFilter);
        }

        // Aplicar filtro de período
        if (periodFilter) {
            const days = parseInt(periodFilter);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            services = services.filter(s => new Date(s.createdDate) >= cutoffDate);
        }

        // Actualizar tabla
        const tbody = document.getElementById('client-services-table-body');
        if (tbody) {
            tbody.innerHTML = this.renderClientServicesTable(services);
        }

        authSystem?.showNotification?.(`Se encontraron ${services.length} servicios`, 'info');
    }

    // Ver detalles de un servicio desde la vista del cliente
    viewClientService(serviceId) {
        if (window.servicesModule && typeof servicesModule.viewService === 'function') {
            servicesModule.viewService(serviceId);
        }
    }

    // Función para rastrear un servicio específico
    trackService(serviceId) {
        // Verificar que el servicio sea rastreable
        const currentUser = this.currentUser;
        const services = this.getActiveServicesForTracking(currentUser.id);
        const serviceToTrack = services.find(s => s.id == serviceId);
        
        if (!serviceToTrack) {
            authSystem?.showNotification?.('Este servicio no está disponible para seguimiento', 'warning');
            return;
        }
        
        // Cambiar a la sección de seguimiento
        this.loadModule('tracking');
        
        // Esperar un momento para que se cargue la interfaz y luego seleccionar el servicio
        setTimeout(() => {
            this.selectServiceForTracking(serviceId);
        }, 100);
    }

    // ========= MÉTODOS PARA "FACTURAS" (CLIENTES) =========
    getClientInvoices(clientId) {
        // Simular facturas basadas en servicios completados del cliente
        const clientServices = this.getClientServices(clientId);
        const invoices = [];
        
        // Crear facturas para servicios completados y algunos en proceso
        clientServices.forEach((service, index) => {
            if (['Completado', 'Programado', 'En Proceso'].includes(service.status)) {
                const invoiceDate = new Date(service.requestedDate);
                invoiceDate.setDate(invoiceDate.getDate() + (service.status === 'Completado' ? 3 : -5));
                
                const dueDate = new Date(invoiceDate);
                dueDate.setDate(dueDate.getDate() + 30); // 30 días para pagar
                
                const amount = this.calculateServiceAmount(service);
                const isOverdue = new Date() > dueDate;
                
                let status = 'Pendiente';
                if (service.status === 'Completado' && Math.random() > 0.3) {
                    status = 'Pagada';
                } else if (isOverdue && status === 'Pendiente') {
                    status = 'Vencida';
                }

                invoices.push({
                    id: `FAC-${(1000 + index).toString()}`,
                    serviceId: service.id,
                    clientId: clientId,
                    invoiceDate: invoiceDate.toISOString().split('T')[0],
                    dueDate: dueDate.toISOString().split('T')[0],
                    amount: amount,
                    status: status,
                    serviceDescription: `${service.wasteType} - ${service.estimatedVolume} ${service.volumeUnit}`,
                    paymentMethod: status === 'Pagada' ? ['Transferencia', 'Efectivo', 'Cheque'][Math.floor(Math.random() * 3)] : null,
                    paidDate: status === 'Pagada' ? new Date(dueDate.getTime() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null
                });
            }
        });
        
        return invoices.sort((a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate));
    }

    calculateServiceAmount(service) {
        // Calcular costo basado en tipo de residuo y volumen
        const baseRates = {
            'Orgánico': 15000,
            'Reciclable': 12000,
            'No Reciclable': 18000,
            'Peligroso': 45000,
            'Electrónicos': 25000,
            'Construcción': 35000
        };
        
        const baseRate = baseRates[service.wasteType] || 15000;
        const volume = parseFloat(service.estimatedVolume) || 1;
        const volumeMultiplier = service.volumeUnit === 'ton' ? 1000 : (service.volumeUnit === 'kg' ? 1 : 100);
        
        let amount = baseRate + (volume * volumeMultiplier * 500);
        
        // Aplicar recargo por prioridad
        if (service.priority === 'Alta') amount *= 1.2;
        if (service.priority === 'Urgente') amount *= 1.5;
        
        return Math.round(amount);
    }

    renderInvoiceSummaryCards(invoices) {
        const total = invoices.length;
        const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
        const pending = invoices.filter(inv => inv.status === 'Pendiente').length;
        const pendingAmount = invoices.filter(inv => inv.status === 'Pendiente').reduce((sum, inv) => sum + inv.amount, 0);
        const overdue = invoices.filter(inv => inv.status === 'Vencida').length;
        const overdueAmount = invoices.filter(inv => inv.status === 'Vencida').reduce((sum, inv) => sum + inv.amount, 0);
        const paid = invoices.filter(inv => inv.status === 'Pagada').length;

        const cards = [
            { 
                title: 'Total Facturas', 
                value: total, 
                subtitle: `$${this.formatCurrency(totalAmount)}`,
                icon: 'fa-file-invoice-dollar', 
                color: 'blue' 
            },
            { 
                title: 'Pendientes', 
                value: pending, 
                subtitle: `$${this.formatCurrency(pendingAmount)}`,
                icon: 'fa-clock', 
                color: 'yellow' 
            },
            { 
                title: 'Vencidas', 
                value: overdue, 
                subtitle: `$${this.formatCurrency(overdueAmount)}`,
                icon: 'fa-exclamation-triangle', 
                color: 'red' 
            },
            { 
                title: 'Pagadas', 
                value: paid, 
                subtitle: 'Al día',
                icon: 'fa-check-circle', 
                color: 'green' 
            }
        ];

        return cards.map(card => `
            <div class="bg-white p-6 rounded-lg shadow border-l-4 border-${card.color}-500">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-${card.color}-600 text-sm font-medium">${card.title}</p>
                        <p class="text-2xl font-bold text-gray-900">${card.value}</p>
                        <p class="text-sm text-gray-500">${card.subtitle}</p>
                    </div>
                    <div class="p-3 bg-${card.color}-100 rounded-full">
                        <i class="fas ${card.icon} text-${card.color}-600 text-xl"></i>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderInvoicesTable(invoices) {
        if (invoices.length === 0) return '';

        return invoices.map(invoice => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                        <div class="text-sm font-medium text-gray-900">${invoice.id}</div>
                        <div class="text-xs text-gray-500">Servicio #${String(invoice.serviceId).padStart(3, '0')}</div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${this.formatDate(invoice.invoiceDate)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${invoice.serviceDescription}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">$${this.formatCurrency(invoice.amount)}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${this.formatDate(invoice.dueDate)}
                    ${this.isOverdue(invoice.dueDate) && invoice.status !== 'Pagada' ? 
                        '<div class="text-xs text-red-600 font-medium">¡Vencida!</div>' : ''
                    }
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs rounded-full ${this.getInvoiceStatusClass(invoice.status)}">
                        ${invoice.status}
                    </span>
                    ${invoice.status === 'Pagada' && invoice.paidDate ? `
                        <div class="text-xs text-gray-500 mt-1">Pagada: ${this.formatDate(invoice.paidDate)}</div>
                    ` : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="app.viewInvoiceDetails('${invoice.id}')" 
                            class="text-blue-600 hover:text-blue-900 mr-3" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="app.downloadInvoicePDF('${invoice.id}')" 
                            class="text-green-600 hover:text-green-900 mr-3" title="Descargar PDF">
                        <i class="fas fa-file-pdf"></i>
                    </button>
                    ${invoice.status === 'Pendiente' || invoice.status === 'Vencida' ? `
                        <button onclick="app.payInvoice('${invoice.id}')" 
                                class="text-purple-600 hover:text-purple-900" title="Reportar pago">
                            <i class="fas fa-credit-card"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `).join('');
    }

    getInvoiceStatusClass(status) {
        const classes = {
            'Pendiente': 'bg-yellow-100 text-yellow-800',
            'Pagada': 'bg-green-100 text-green-800',
            'Vencida': 'bg-red-100 text-red-800',
            'Cancelada': 'bg-gray-100 text-gray-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-CO', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    isOverdue(dueDate) {
        return new Date() > new Date(dueDate);
    }

    // Filtros para facturas
    applyInvoiceFilters() {
        const statusFilter = document.getElementById('invoice-status-filter')?.value || '';
        const periodFilter = document.getElementById('invoice-period-filter')?.value || '';
        
        const currentUser = this.currentUser;
        if (!currentUser) return;

        let invoices = this.getClientInvoices(currentUser.id);

        // Aplicar filtro de estado
        if (statusFilter) {
            invoices = invoices.filter(inv => inv.status === statusFilter);
        }

        // Aplicar filtro de período
        if (periodFilter) {
            const days = parseInt(periodFilter);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            invoices = invoices.filter(inv => new Date(inv.invoiceDate) >= cutoffDate);
        }

        // Actualizar tabla
        const tbody = document.getElementById('invoices-table-body');
        if (tbody) {
            tbody.innerHTML = this.renderInvoicesTable(invoices);
        }

        authSystem?.showNotification?.(`Se encontraron ${invoices.length} facturas`, 'info');
    }

    // Acciones de facturas
    viewInvoiceDetails(invoiceId) {
        const currentUser = this.currentUser;
        const invoices = this.getClientInvoices(currentUser.id);
        const invoice = invoices.find(inv => inv.id === invoiceId);
        
        if (!invoice) return;

        const modalHTML = `
            <div id="invoice-details-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-full overflow-y-auto">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-xl font-bold text-gray-900">Detalles de Factura ${invoice.id}</h3>
                        <button onclick="document.getElementById('invoice-details-modal').remove()" 
                                class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 class="font-semibold text-gray-800 mb-3">Información de Factura</h4>
                            <div class="space-y-2 text-sm">
                                <p><span class="font-medium">Número:</span> ${invoice.id}</p>
                                <p><span class="font-medium">Fecha de emisión:</span> ${this.formatDate(invoice.invoiceDate)}</p>
                                <p><span class="font-medium">Fecha de vencimiento:</span> ${this.formatDate(invoice.dueDate)}</p>
                                <p><span class="font-medium">Estado:</span> 
                                    <span class="px-2 py-1 text-xs rounded-full ${this.getInvoiceStatusClass(invoice.status)}">
                                        ${invoice.status}
                                    </span>
                                </p>
                                ${invoice.paidDate ? `<p><span class="font-medium">Fecha de pago:</span> ${this.formatDate(invoice.paidDate)}</p>` : ''}
                                ${invoice.paymentMethod ? `<p><span class="font-medium">Método de pago:</span> ${invoice.paymentMethod}</p>` : ''}
                            </div>
                        </div>

                        <div>
                            <h4 class="font-semibold text-gray-800 mb-3">Detalles del Servicio</h4>
                            <div class="space-y-2 text-sm">
                                <p><span class="font-medium">Servicio #:</span> ${String(invoice.serviceId).padStart(3, '0')}</p>
                                <p><span class="font-medium">Descripción:</span> ${invoice.serviceDescription}</p>
                            </div>
                        </div>
                    </div>

                    <div class="mt-6 pt-6 border-t">
                        <div class="flex justify-between items-center text-lg">
                            <span class="font-semibold">Total a pagar:</span>
                            <span class="font-bold text-2xl text-blue-600">$${this.formatCurrency(invoice.amount)}</span>
                        </div>
                    </div>

                    <div class="mt-6 flex justify-end space-x-3">
                        <button onclick="app.downloadInvoicePDF('${invoice.id}')" 
                                class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                            <i class="fas fa-download mr-2"></i>Descargar PDF
                        </button>
                        ${invoice.status !== 'Pagada' ? `
                            <button onclick="app.payInvoice('${invoice.id}'); document.getElementById('invoice-details-modal').remove();" 
                                    class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                                <i class="fas fa-credit-card mr-2"></i>Reportar Pago
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    downloadInvoicePDF(invoiceId) {
        // Simular descarga de PDF
        authSystem?.showNotification?.(`Descargando factura ${invoiceId}...`, 'info');
        
        setTimeout(() => {
            authSystem?.showNotification?.(`Factura ${invoiceId} descargada exitosamente`, 'success');
        }, 2000);
    }

    downloadInvoiceReport() {
        authSystem?.showNotification?.('Generando reporte de facturas...', 'info');
        
        setTimeout(() => {
            authSystem?.showNotification?.('Reporte de facturas descargado exitosamente', 'success');
        }, 2000);
    }

    payInvoice(invoiceId) {
        if (confirm('¿Confirma que ha realizado el pago de esta factura?')) {
            authSystem?.showNotification?.('Pago reportado. Se verificará en 24-48 horas.', 'success');
            
            // Aquí podrías actualizar el estado en una base de datos real
            setTimeout(() => {
                this.loadInvoices(); // Recargar para mostrar cambios
            }, 1000);
        }
    }

    // ========= MÉTODOS PARA "SEGUIMIENTO" (CLIENTES) =========
    getActiveServicesForTracking(clientId) {
        const clientServices = this.getClientServices(clientId);
        return clientServices.filter(service => 
            ['Programado', 'En Proceso'].includes(service.status)
        );
    }

    renderTrackingMap() {
        // Simular un mapa con marcadores
        return `
            <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 relative">
                <!-- Ubicación del cliente -->
                <div class="absolute top-4 left-4 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm">
                    <i class="fas fa-map-marker-alt mr-2"></i>Su Ubicación
                </div>
                
                <!-- Ruta simulada -->
                <svg class="absolute inset-0 w-full h-full" viewBox="0 0 400 300">
                    <!-- Línea de ruta -->
                    <path d="M 50 250 Q 200 150 350 100" stroke="#3B82F6" stroke-width="3" fill="none" stroke-dasharray="10,5"/>
                    
                    <!-- Marcador del cliente -->
                    <circle cx="50" cy="250" r="8" fill="#3B82F6"/>
                    <text x="50" y="270" text-anchor="middle" class="text-xs fill-gray-600">Cliente</text>
                    
                    <!-- Marcador del vehículo (animado) -->
                    <circle cx="200" cy="150" r="10" fill="#10B981" class="animate-pulse">
                        <animateMotion dur="20s" repeatCount="indefinite" 
                                       path="M 50 250 Q 200 150 350 100"/>
                    </circle>
                    
                    <!-- Destino -->
                    <circle cx="350" cy="100" r="8" fill="#F59E0B"/>
                    <text x="350" y="85" text-anchor="middle" class="text-xs fill-gray-600">Planta</text>
                </svg>
                
                <!-- Panel de información del mapa -->
                <div class="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg max-w-xs">
                    <div class="flex items-center space-x-3">
                        <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <div>
                            <p class="font-medium text-sm">Vehículo ECO-003</p>
                            <p class="text-xs text-gray-500">Velocidad: 45 km/h</p>
                            <p class="text-xs text-gray-500">Última actualización: hace 30 seg</p>
                        </div>
                    </div>
                </div>
                
                <!-- Controles del mapa -->
                <div class="absolute top-4 right-4 space-y-2">
                    <button class="bg-white p-2 rounded shadow hover:bg-gray-50" title="Zoom in">
                        <i class="fas fa-plus text-gray-600"></i>
                    </button>
                    <button class="bg-white p-2 rounded shadow hover:bg-gray-50" title="Zoom out">
                        <i class="fas fa-minus text-gray-600"></i>
                    </button>
                    <button class="bg-white p-2 rounded shadow hover:bg-gray-50" title="Centrar">
                        <i class="fas fa-crosshairs text-gray-600"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderCurrentStatus(service) {
        if (!service) return '';
        
        const statusInfo = this.getServiceStatusInfo(service);
        
        return `
            <div class="flex items-center space-x-3 p-3 bg-${statusInfo.color}-50 rounded-lg">
                <div class="p-2 bg-${statusInfo.color}-100 rounded-full">
                    <i class="fas ${statusInfo.icon} text-${statusInfo.color}-600"></i>
                </div>
                <div>
                    <p class="font-medium text-gray-900">${statusInfo.title}</p>
                    <p class="text-sm text-gray-600">${statusInfo.description}</p>
                </div>
            </div>
            
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span class="text-gray-600">Servicio:</span>
                    <span class="font-medium">#${String(service.id).padStart(3, '0')}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Tipo:</span>
                    <span class="font-medium">${service.wasteType}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Volumen:</span>
                    <span class="font-medium">${service.estimatedVolume} ${service.volumeUnit}</span>
                </div>
                ${service.schedule ? `
                    <div class="flex justify-between">
                        <span class="text-gray-600">Programado:</span>
                        <span class="font-medium">${service.schedule.collectionDate} ${service.schedule.collectionTime}</span>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderEstimations(service) {
        if (!service) return '';
        
        const now = new Date();
        const scheduledTime = service.schedule ? 
            new Date(`${service.schedule.collectionDate}T${service.schedule.collectionTime}`) : 
            new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 horas por defecto
        
        const estimatedArrival = new Date(scheduledTime.getTime() + Math.random() * 30 * 60 * 1000); // ±30 min
        const estimatedCompletion = new Date(estimatedArrival.getTime() + 45 * 60 * 1000); // +45 min
        
        return `
            <div class="space-y-3">
                <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div class="flex items-center space-x-2">
                        <i class="fas fa-clock text-blue-600"></i>
                        <span class="text-sm font-medium">Llegada estimada</span>
                    </div>
                    <span class="font-bold text-blue-600">${this.formatTime(estimatedArrival)}</span>
                </div>
                
                <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div class="flex items-center space-x-2">
                        <i class="fas fa-check-circle text-green-600"></i>
                        <span class="text-sm font-medium">Finalización estimada</span>
                    </div>
                    <span class="font-bold text-green-600">${this.formatTime(estimatedCompletion)}</span>
                </div>
                
                <div class="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div class="flex items-center space-x-2">
                        <i class="fas fa-route text-yellow-600"></i>
                        <span class="text-sm font-medium">Distancia restante</span>
                    </div>
                    <span class="font-bold text-yellow-600">${(Math.random() * 15 + 2).toFixed(1)} km</span>
                </div>
            </div>
        `;
    }

    renderVehicleInfo(service) {
        if (!service) return '';
        
        const vehicles = ['ECO-001', 'ECO-002', 'ECO-003', 'ECO-004'];
        const drivers = ['Carlos Rodríguez', 'María García', 'Luis Martinez', 'Ana López'];
        const selectedVehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
        const selectedDriver = drivers[Math.floor(Math.random() * drivers.length)];
        
        return `
            <div class="space-y-3">
                <div class="flex items-center space-x-3">
                    <div class="p-2 bg-blue-100 rounded-full">
                        <i class="fas fa-truck text-blue-600"></i>
                    </div>
                    <div>
                        <p class="font-medium">${selectedVehicle}</p>
                        <p class="text-sm text-gray-600">Camión Compactador</p>
                    </div>
                </div>
                
                <div class="flex items-center space-x-3">
                    <div class="p-2 bg-green-100 rounded-full">
                        <i class="fas fa-user text-green-600"></i>
                    </div>
                    <div>
                        <p class="font-medium">${selectedDriver}</p>
                        <p class="text-sm text-gray-600">Conductor Principal</p>
                    </div>
                </div>
                
                <div class="pt-3 border-t space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span class="text-gray-600">Capacidad:</span>
                        <span class="font-medium">85%</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Último servicio:</span>
                        <span class="font-medium">10:30 AM</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Servicios hoy:</span>
                        <span class="font-medium">3 de 6</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderServiceTimeline(service) {
        if (!service) return '';
        
        const now = new Date();
        const events = [
            {
                title: 'Solicitud creada',
                time: service.createdDate,
                status: 'completed',
                icon: 'fa-file-plus',
                description: 'Su solicitud fue registrada en el sistema'
            },
            {
                title: 'Solicitud aprobada',
                time: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: 'completed',
                icon: 'fa-check',
                description: 'Su solicitud fue revisada y aprobada'
            },
            {
                title: 'Servicio programado',
                time: service.schedule?.collectionDate || service.requestedDate,
                status: 'completed',
                icon: 'fa-calendar-check',
                description: 'Se asignó vehículo y conductor'
            },
            {
                title: 'Vehículo en ruta',
                time: 'En tiempo real',
                status: 'current',
                icon: 'fa-truck',
                description: 'El vehículo se dirige a su ubicación'
            },
            {
                title: 'Recolección iniciada',
                time: 'Pendiente',
                status: 'pending',
                icon: 'fa-play-circle',
                description: 'Inicio de la recolección de residuos'
            },
            {
                title: 'Recolección completada',
                time: 'Pendiente',
                status: 'pending',
                icon: 'fa-check-circle',
                description: 'Finalización y traslado a planta'
            }
        ];

        return `
            <div class="space-y-4">
                ${events.map((event, index) => `
                    <div class="flex items-start space-x-4">
                        <div class="flex flex-col items-center">
                            <div class="p-2 rounded-full ${this.getTimelineStatusClass(event.status)}">
                                <i class="fas ${event.icon} text-sm"></i>
                            </div>
                            ${index < events.length - 1 ? `
                                <div class="w-px h-8 ${event.status === 'completed' ? 'bg-green-300' : 'bg-gray-300'} mt-2"></div>
                            ` : ''}
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between">
                                <p class="font-medium text-gray-900">${event.title}</p>
                                <span class="text-sm text-gray-500">
                                    ${event.time === 'En tiempo real' ? event.time : 
                                      event.time === 'Pendiente' ? event.time :
                                      this.formatDate(event.time)}
                                </span>
                            </div>
                            <p class="text-sm text-gray-600 mt-1">${event.description}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getServiceStatusInfo(service) {
        const statusMap = {
            'Programado': {
                color: 'blue',
                icon: 'fa-calendar-check',
                title: 'Servicio Programado',
                description: 'El vehículo se dirige a su ubicación'
            },
            'En Proceso': {
                color: 'orange',
                icon: 'fa-spinner',
                title: 'Recolección en Proceso',
                description: 'Se está realizando la recolección'
            }
        };
        
        return statusMap[service.status] || statusMap['Programado'];
    }

    getTimelineStatusClass(status) {
        const classes = {
            'completed': 'bg-green-100 text-green-600',
            'current': 'bg-blue-100 text-blue-600 ring-4 ring-blue-50',
            'pending': 'bg-gray-100 text-gray-400'
        };
        return classes[status] || classes['pending'];
    }

    formatTime(date) {
        return date.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    }

    // Variables para auto-refresh
    trackingInterval = null;
    autoRefreshEnabled = false;

    initializeTracking(service) {
        // Configuración inicial del seguimiento
        this.currentTrackedService = service;
    }

    selectServiceForTracking(serviceId) {
        if (!serviceId) return;
        
        const currentUser = this.currentUser;
        const services = this.getActiveServicesForTracking(currentUser.id);
        const selectedService = services.find(s => s.id == serviceId);
        
        if (selectedService) {
            this.currentTrackedService = selectedService;
            this.updateTrackingDisplay(selectedService);
            authSystem?.showNotification?.(`Siguiendo servicio #${String(selectedService.id).padStart(3, '0')}`, 'info');
        }
    }

    updateTrackingDisplay(service) {
        // Actualizar estado actual
        const statusElement = document.getElementById('current-status');
        if (statusElement) {
            statusElement.innerHTML = this.renderCurrentStatus(service);
        }
        
        // Actualizar estimaciones
        const estimationsElement = document.getElementById('estimations');
        if (estimationsElement) {
            estimationsElement.innerHTML = this.renderEstimations(service);
        }
        
        // Actualizar info del vehículo
        const vehicleInfoElement = document.getElementById('vehicle-info');
        if (vehicleInfoElement) {
            vehicleInfoElement.innerHTML = this.renderVehicleInfo(service);
        }
        
        // Actualizar timeline
        const timelineElement = document.getElementById('service-timeline');
        if (timelineElement) {
            timelineElement.innerHTML = this.renderServiceTimeline(service);
        }
    }

    refreshTracking() {
        if (this.currentTrackedService) {
            this.updateTrackingDisplay(this.currentTrackedService);
            authSystem?.showNotification?.('Información actualizada', 'success');
        }
    }

    toggleAutoRefresh() {
        const btn = document.getElementById('auto-refresh-btn');
        if (!btn) return;
        
        if (this.autoRefreshEnabled) {
            // Detener auto-refresh
            if (this.trackingInterval) {
                clearInterval(this.trackingInterval);
                this.trackingInterval = null;
            }
            this.autoRefreshEnabled = false;
            btn.innerHTML = '<i class="fas fa-play mr-2"></i>Auto-actualizar';
            btn.className = 'bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700';
            authSystem?.showNotification?.('Auto-actualización desactivada', 'info');
        } else {
            // Iniciar auto-refresh
            this.trackingInterval = setInterval(() => {
                this.refreshTracking();
            }, 10000); // Cada 10 segundos
            
            this.autoRefreshEnabled = true;
            btn.innerHTML = '<i class="fas fa-pause mr-2"></i>Detener';
            btn.className = 'bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700';
            authSystem?.showNotification?.('Auto-actualización activada (cada 10s)', 'success');
        }
    }
}

// Instancia global
window.app = new WasteManagementApp();

// Listener básico por si el DOM aún no estaba listo
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn && !logoutBtn._bound) {
        logoutBtn.addEventListener('click', () => {
            if (window.authSystem?.logout) authSystem.logout();
            else window.app.handleLogout();
        });
        logoutBtn._bound = true;
    }
});