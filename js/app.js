class WasteManagementApp {
    constructor() {
        this.currentUser = null;
        this.currentModule = 'dashboard';
        this.init();
    }

    init() {
        this.showLoadingScreen();
        setTimeout(() => {
            this.hideLoadingScreen();
            
            // Verificar si ya hay una sesión activa
            if (this.currentUser) {
                // Si hay usuario, mostrar la aplicación principal
                this.showMainApp();
            } else {
                // Si no hay usuario, mostrar pantalla de login
                this.showLoginScreen();
            }
        }, 2000);
    }

    showLoadingScreen() {
        const progressBar = document.getElementById('progress-bar');
        let progress = 0;
        const interval = setInterval(() => {
            progress += 2;
            progressBar.style.width = progress + '%';
            if (progress >= 100) {
                clearInterval(interval);
            }
        }, 40);
    }

    hideLoadingScreen() {
        document.getElementById('loading-screen').classList.add('hidden');
    }

    showLoginScreen() {
        document.getElementById('login-screen').classList.remove('hidden');
    }

    hideLoginScreen() {
        document.getElementById('login-screen').classList.add('hidden');
    }

    showMainApp() {
        document.getElementById('main-app').classList.remove('hidden');
        this.loadMenu();
        this.loadDashboard();
    }

    loadMenu() {
        const menuItems = document.getElementById('menu-items');
        const userType = this.currentUser.type;
        
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
        } else if (userType === 'client') {
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
                <a href="#" onclick="app.loadModule('${item.module}')" 
                   class="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded transition-colors">
                    <i class="${item.icon} mr-3"></i>
                    ${item.label}
                </a>
            </li>
        `).join('');
    }

    loadModule(moduleName) {
        // Verificar autenticación antes de cargar cualquier módulo
        if (!this.requireAuth()) {
            return;
        }

        this.currentModule = moduleName;
        const contentArea = document.getElementById('content-area');
        
        switch(moduleName) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'services':
                this.loadServices();
                break;
            case 'new-service':
                this.loadNewService();
                break;
            case 'routes':
                this.loadRoutes();
                break;
            case 'collection':
                this.loadCollection();
                break;
            case 'manifests':
                this.loadManifests();
                break;
            case 'plant':
                this.loadPlant();
                break;
            case 'reports':
                this.loadReports();
                break;
            case 'disposal':
                this.loadDisposal();
                break;
            case 'users':
                this.loadUsers();
                break;
            case 'my-services':
                this.loadMyServices();
                break;
            case 'invoices':
                this.loadInvoices();
                break;
            case 'tracking':
                this.loadTracking();
                break;
            default:
                contentArea.innerHTML = '<div class="text-center py-8"><h2 class="text-2xl">Módulo en desarrollo</h2></div>';
        }
    }

    // Verificar que el usuario esté autenticado
    requireAuth() {
        if (!this.currentUser) {
            this.showLoginScreen();
            authSystem.showNotification('Debe iniciar sesión para acceder a esta función', 'error');
            return false;
        }
        return true;
    }

    loadDashboard() {
        if (window.dashboardModule) {
            window.dashboardModule.load(this.currentUser.type);
        }
    }

    loadServices() {
        if (window.servicesModule) {
            window.servicesModule.load();
        }
    }

    loadNewService() {
        if (window.servicesModule) {
            window.servicesModule.loadNewService();
        }
    }

    loadRoutes() {
        if (window.routesModule) {
            window.routesModule.load();
        }
    }

    loadCollection() {
        if (window.collectionModule) {
            window.collectionModule.load();
        }
    }

    loadManifests() {
        if (window.manifestsModule) {
            window.manifestsModule.load();
        }
    }

    loadPlant() {
        if (window.plantModule) {
            window.plantModule.load();
        }
    }

    loadReports() {
        if (window.reportsModule) {
            window.reportsModule.load();
        }
    }

    loadDisposal() {
        if (window.disposalModule) {
            window.disposalModule.load();
        }
    }

    loadUsers() {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-2xl font-bold mb-6">Gestión de Usuarios</h2>
                <div class="mb-4">
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
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200" id="users-table-body">
                            <!-- Users will be loaded here -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        this.loadUsersData();
    }

    loadUsersData() {
        const mockUsers = [
            {id: 1, name: 'Juan Pérez', email: 'juan@example.com', type: 'admin', status: 'Activo'},
            {id: 2, name: 'María García', email: 'maria@example.com', type: 'operator', status: 'Activo'},
            {id: 3, name: 'Carlos López', email: 'carlos@example.com', type: 'client', status: 'Activo'}
        ];

        const tbody = document.getElementById('users-table-body');
        tbody.innerHTML = mockUsers.map(user => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">${user.name}</td>
                <td class="px-6 py-4 whitespace-nowrap">${user.email}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs rounded-full ${this.getUserTypeClass(user.type)}">
                        ${this.getUserTypeLabel(user.type)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        ${user.status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-blue-600 hover:text-blue-900 mr-2">Editar</button>
                    <button class="text-red-600 hover:text-red-900">Desactivar</button>
                </td>
            </tr>
        `).join('');
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

    loadMyServices() {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-2xl font-bold mb-6">Mis Servicios</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <h3 class="font-semibold text-blue-800">Servicios Activos</h3>
                        <p class="text-2xl font-bold text-blue-600">3</p>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg">
                        <h3 class="font-semibold text-green-800">Completados</h3>
                        <p class="text-2xl font-bold text-green-600">15</p>
                    </div>
                    <div class="bg-yellow-50 p-4 rounded-lg">
                        <h3 class="font-semibold text-yellow-800">Pendientes</h3>
                        <p class="text-2xl font-bold text-yellow-600">2</p>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full bg-white">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo Residuo</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Volumen</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            <tr>
                                <td class="px-6 py-4 whitespace-nowrap">2024-01-15</td>
                                <td class="px-6 py-4 whitespace-nowrap">Orgánico</td>
                                <td class="px-6 py-4 whitespace-nowrap">2.5 m³</td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Completado</span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <button class="text-blue-600 hover:text-blue-900">Ver Detalles</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    loadInvoices() {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-2xl font-bold mb-6">Mis Facturas</h2>
                <div class="overflow-x-auto">
                    <table class="min-w-full bg-white">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            <tr>
                                <td class="px-6 py-4 whitespace-nowrap">FAC-001</td>
                                <td class="px-6 py-4 whitespace-nowrap">2024-01-15</td>
                                <td class="px-6 py-4 whitespace-nowrap">$250.00</td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Pagada</span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <button class="text-blue-600 hover:text-blue-900 mr-2">Ver</button>
                                    <button class="text-green-600 hover:text-green-900">Descargar</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    loadTracking() {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-2xl font-bold mb-6">Seguimiento de Servicios</h2>
                <div class="mb-6">
                    <div class="bg-blue-50 border-l-4 border-blue-400 p-4">
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <i class="fas fa-info-circle text-blue-400"></i>
                            </div>
                            <div class="ml-3">
                                <p class="text-sm text-blue-700">
                                    Próxima recolección programada: <strong>Mañana 8:00 AM</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <h3 class="text-lg font-semibold mb-4">Estado Actual</h3>
                        <div class="space-y-4">
                            <div class="flex items-center">
                                <div class="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                                <span>Solicitud Recibida</span>
                            </div>
                            <div class="flex items-center">
                                <div class="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                                <span>Ruta Planificada</span>
                            </div>
                            <div class="flex items-center">
                                <div class="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                                <span>En Ruta</span>
                            </div>
                            <div class="flex items-center">
                                <div class="w-4 h-4 bg-gray-300 rounded-full mr-3"></div>
                                <span>Recolección Pendiente</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold mb-4">Mapa de Seguimiento</h3>
                        <div class="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                            <p class="text-gray-500">Mapa de seguimiento en tiempo real</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

const app = new WasteManagementApp();

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('logout-btn').addEventListener('click', function() {
        // Usar el sistema de autenticación para cerrar sesión
        authSystem.logout();
    });
});