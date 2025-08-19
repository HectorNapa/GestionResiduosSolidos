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
        contentArea.innerHTML = `
            <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-2xl font-bold mb-6">Mis Servicios</h2>
                <p class="text-gray-600">Vista de ejemplo. (Implementada en services.js para clientes)</p>
            </div>
        `;
    }
    loadInvoices() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;
        contentArea.innerHTML = `
            <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-2xl font-bold mb-6">Mis Facturas</h2>
                <p class="text-gray-600">Vista de ejemplo.</p>
            </div>
        `;
    }
    loadTracking() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;
        contentArea.innerHTML = `
            <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-2xl font-bold mb-6">Seguimiento</h2>
                <p class="text-gray-600">Vista de ejemplo.</p>
            </div>
        `;
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