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
        this.checkExistingSession();
        
        // Verificar expiración de sesión cada 5 minutos
        setInterval(() => {
            this.checkSessionExpiry();
        }, 5 * 60 * 1000);
    }

    // Verificar si hay una sesión activa al cargar la página
    checkExistingSession() {
        const savedSession = this.getSavedSession();
        if (savedSession && savedSession.user && savedSession.timestamp) {
            // Verificar si la sesión no ha expirado (24 horas)
            const sessionAge = Date.now() - savedSession.timestamp;
            const maxSessionAge = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
            
            if (sessionAge < maxSessionAge) {
                // Restaurar la sesión
                this.restoreSession(savedSession.user);
            } else {
                // Sesión expirada, limpiar
                this.clearSavedSession();
            }
        }
    }

    // Guardar sesión en localStorage
    saveSession(user) {
        const sessionData = {
            user: user,
            timestamp: Date.now()
        };
        localStorage.setItem('ecogestion_session', JSON.stringify(sessionData));
    }

    // Obtener sesión guardada
    getSavedSession() {
        try {
            const sessionData = localStorage.getItem('ecogestion_session');
            return sessionData ? JSON.parse(sessionData) : null;
        } catch (error) {
            console.error('Error al leer la sesión guardada:', error);
            return null;
        }
    }

    // Limpiar sesión guardada
    clearSavedSession() {
        localStorage.removeItem('ecogestion_session');
    }

    // Restaurar sesión
    restoreSession(user) {
        app.currentUser = user;
        document.getElementById('user-info').textContent = `${user.name} (${this.getUserTypeLabel(user.type)})`;
        app.hideLoginScreen();
        app.showMainApp();
        
        this.showNotification('Sesión restaurada automáticamente', 'info');
        
        // Mostrar información de la sesión
        this.showSessionInfo();
    }

    // Mostrar información de la sesión
    showSessionInfo() {
        const savedSession = this.getSavedSession();
        if (savedSession) {
            const sessionAge = Date.now() - savedSession.timestamp;
            const maxSessionAge = 24 * 60 * 60 * 1000; // 24 horas
            const remainingTime = maxSessionAge - sessionAge;
            const remainingHours = Math.floor(remainingTime / (60 * 60 * 1000));
            
            if (remainingHours > 0) {
                this.showNotification(`Sesión activa por ${remainingHours} horas más`, 'info');
            }
        }
    }

    // Verificar si la sesión está por expirar
    checkSessionExpiry() {
        const savedSession = this.getSavedSession();
        if (savedSession) {
            const sessionAge = Date.now() - savedSession.timestamp;
            const maxSessionAge = 24 * 60 * 60 * 1000;
            const remainingTime = maxSessionAge - sessionAge;
            const remainingHours = Math.floor(remainingTime / (60 * 60 * 1000));
            
            // Mostrar advertencia cuando queden menos de 2 horas
            if (remainingHours <= 2 && remainingHours > 0) {
                this.showNotification(`Su sesión expirará en ${remainingHours} hora(s). Considere guardar su trabajo.`, 'warning');
            }
            
            // Cerrar sesión automáticamente cuando expire
            if (remainingTime <= 0) {
                this.logout();
                this.showNotification('Su sesión ha expirado por inactividad', 'error');
            }
        }
    }

    initLoginForm() {
        const loginForm = document.getElementById('login-form');
        const emailInput = document.getElementById('email');
        
        if (loginForm) {
            // Validación en tiempo real para el email
            emailInput.addEventListener('blur', () => {
                const email = emailInput.value.trim();
                if (email && !this.isValidEmail(email)) {
                    this.showFieldError(emailInput, 'Formato de email inválido');
                } else {
                    this.clearFieldError(emailInput);
                }
            });

            // Limpiar error cuando el usuario empiece a escribir
            emailInput.addEventListener('input', () => {
                this.clearFieldError(emailInput);
            });

            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
    }

    handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const userType = document.getElementById('user-type').value;

        // Validar formato de email
        if (!this.isValidEmail(email)) {
            this.showLoginError('Por favor, ingrese un email válido');
            return;
        }

        // Validar que la contraseña no esté vacía
        if (!password.trim()) {
            this.showLoginError('Por favor, ingrese su contraseña');
            return;
        }

        const user = this.validateCredentials(email, password, userType);
        
        if (user) {
            this.loginSuccess(user);
        } else {
            // Verificar si el email existe para dar un mensaje más específico
            const emailExists = this.users.some(user => user.email === email);
            if (emailExists) {
                this.showLoginError('Contraseña incorrecta para este email');
            } else {
                this.showLoginError('Email no registrado en el sistema');
            }
        }
    }

    // Validar formato de email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Mostrar error en un campo específico
    showFieldError(inputElement, message) {
        // Remover error previo si existe
        this.clearFieldError(inputElement);
        
        // Agregar clase de error
        inputElement.classList.add('border-red-500');
        
        // Crear y mostrar mensaje de error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'text-red-500 text-xs mt-1';
        errorDiv.textContent = message;
        errorDiv.id = `${inputElement.id}-error`;
        
        inputElement.parentNode.appendChild(errorDiv);
    }

    // Limpiar error de un campo específico
    clearFieldError(inputElement) {
        inputElement.classList.remove('border-red-500');
        const errorDiv = inputElement.parentNode.querySelector(`#${inputElement.id}-error`);
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    validateCredentials(email, password, userType) {
        return this.users.find(user => 
            user.email === email && 
            user.password === password && 
            user.type === userType
        );
    }

    loginSuccess(user) {
        app.currentUser = user;
        document.getElementById('user-info').textContent = `${user.name} (${this.getUserTypeLabel(user.type)})`;
        app.hideLoginScreen();
        app.showMainApp();
        
        // Guardar sesión en localStorage
        this.saveSession(user);
        
        this.showNotification('Inicio de sesión exitoso', 'success');
        this.clearLoginForm();
    }

    showLoginError(message) {
        this.showNotification(message, 'error');
    }

    clearLoginForm() {
        document.getElementById('email').value = '';
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
        
        // Limpiar sesión guardada
        this.clearSavedSession();
        
        this.showNotification('Sesión cerrada exitosamente', 'info');
    }
}

const authSystem = new AuthSystem();