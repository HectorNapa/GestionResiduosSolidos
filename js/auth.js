class AuthSystem {
    constructor() {
        this.users = [
            {
                id: 1,
                username: 'admin',
                password: 'admin123',
                type: 'admin',
                name: 'Administrador Sistema',
                email: 'admin@ecogestion.com',
                permissions: ['all']
            },
            {
                id: 2,
                username: 'operador1',
                password: 'op123',
                type: 'operator',
                name: 'Carlos Rodríguez',
                email: 'carlos@ecogestion.com',
                permissions: ['collection', 'routes', 'manifests', 'plant']
            },
            {
                id: 3,
                username: 'cliente1',
                password: 'cl123',
                type: 'client',
                name: 'Empresa ABC S.A.',
                email: 'contacto@empresaabc.com',
                permissions: ['services', 'tracking', 'invoices']
            }
        ];
        
        this.initLoginForm();
    }

    initLoginForm() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
    }

    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const userType = document.getElementById('user-type').value;

        const user = this.validateCredentials(username, password, userType);
        
        if (user) {
            this.loginSuccess(user);
        } else {
            this.showLoginError('Credenciales inválidas');
        }
    }

    validateCredentials(username, password, userType) {
        return this.users.find(user => 
            user.username === username && 
            user.password === password && 
            user.type === userType
        );
    }

    loginSuccess(user) {
        app.currentUser = user;
        document.getElementById('user-info').textContent = `${user.name} (${this.getUserTypeLabel(user.type)})`;
        app.hideLoginScreen();
        app.showMainApp();
        
        this.showNotification('Inicio de sesión exitoso', 'success');
        this.clearLoginForm();
    }

    showLoginError(message) {
        this.showNotification(message, 'error');
    }

    clearLoginForm() {
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    }

    getUserTypeLabel(type) {
        const labels = {
            'admin': 'Administrador',
            'operator': 'Operador',
            'client': 'Cliente'
        };
        return labels[type] || 'Desconocido';
    }

    showNotification(message, type = 'info') {
        const existingNotification = document.getElementById('notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform ${this.getNotificationClasses(type)}`;
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="${this.getNotificationIcon(type)} mr-2"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-xl">&times;</button>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    getNotificationClasses(type) {
        const classes = {
            'success': 'bg-green-500 text-white',
            'error': 'bg-red-500 text-white',
            'warning': 'bg-yellow-500 text-white',
            'info': 'bg-blue-500 text-white'
        };
        return classes[type] || classes.info;
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'fas fa-check-circle',
            'error': 'fas fa-exclamation-circle',
            'warning': 'fas fa-exclamation-triangle',
            'info': 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    hasPermission(permission) {
        if (!app.currentUser) return false;
        if (app.currentUser.permissions.includes('all')) return true;
        return app.currentUser.permissions.includes(permission);
    }

    logout() {
        app.currentUser = null;
        document.getElementById('main-app').classList.add('hidden');
        app.showLoginScreen();
        this.showNotification('Sesión cerrada exitosamente', 'info');
    }
}

const authSystem = new AuthSystem();