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
                username: 'tecnico1',
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
                permissions: ['services', 'tracking', 'invoices'],
                phone: '+(57) 300 123 4567',
                address: 'Av. Siempreviva 742, Springfield, Bogotá',
                status: 'Activo'
            }
        ];
        
        // Cargar usuarios desde localStorage al inicializar
        this.loadUsersFromLocalStorage();
        
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
        const togglePasswordBtn = document.getElementById('toggle-password');
        const passwordInput = document.getElementById('password');
        
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

            // Funcionalidad mostrar/ocultar contraseña
            if (togglePasswordBtn && passwordInput) {
                togglePasswordBtn.addEventListener('click', () => {
                    const isPassword = passwordInput.type === 'password';
                    const icon = togglePasswordBtn.querySelector('i');
                    
                    if (isPassword) {
                        passwordInput.type = 'text';
                        icon.className = 'fas fa-eye-slash text-gray-600 hover:text-gray-800 transition-colors';
                        togglePasswordBtn.title = 'Ocultar contraseña';
                    } else {
                        passwordInput.type = 'password';
                        icon.className = 'fas fa-eye text-gray-600 hover:text-gray-800 transition-colors';
                        togglePasswordBtn.title = 'Mostrar contraseña';
                    }
                });
                
                // Tooltip inicial
                togglePasswordBtn.title = 'Mostrar contraseña';
            }

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

        try {
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
        } catch (error) {
            // Manejar errores de usuario desactivado
            this.showLoginError(error.message);
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
        const user = this.users.find(user => 
            (user.email === email || user.username === email) && 
            user.password === password && 
            user.type === userType
        );
        
        // Verificar que el usuario esté activo
        if (user && user.status === 'Inactivo') {
            throw new Error('Usuario desactivado. Contacte al administrador.');
        }
        
        return user;
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
            'operator': 'Técnico',
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

    // ========= GESTIÓN DE USUARIOS =========

    // Cargar usuarios desde localStorage
    loadUsersFromLocalStorage() {
        try {
            const saved = localStorage.getItem('ecogestion_users');
            if (saved) {
                const savedUsers = JSON.parse(saved);
                // Combinar usuarios por defecto con usuarios guardados, evitando duplicados
                this.mergeUsers(savedUsers);
            } else {
                // Si no hay usuarios guardados, guardar los usuarios por defecto
                this.saveUsersToLocalStorage();
            }
        } catch (e) {
            console.warn('Error cargando usuarios desde localStorage:', e);
            // Mantener usuarios por defecto y guardarlos
            this.saveUsersToLocalStorage();
        }
    }

    // Combinar usuarios evitando duplicados (preservar usuarios por defecto)
    mergeUsers(savedUsers) {
        const defaultUsernames = this.users.map(u => u.username);
        
        // Agregar usuarios guardados que no existan en los usuarios por defecto
        savedUsers.forEach(savedUser => {
            if (!defaultUsernames.includes(savedUser.username)) {
                this.users.push(savedUser);
            } else {
                // Actualizar usuarios por defecto con cambios guardados (excepto credenciales críticas)
                const defaultUserIndex = this.users.findIndex(u => u.username === savedUser.username);
                if (defaultUserIndex !== -1) {
                    // Preservar username y password originales para usuarios por defecto
                    this.users[defaultUserIndex] = {
                        ...this.users[defaultUserIndex],
                        name: savedUser.name || this.users[defaultUserIndex].name,
                        email: savedUser.email || this.users[defaultUserIndex].email
                    };
                }
            }
        });
    }

    // Guardar usuarios en localStorage
    saveUsersToLocalStorage() {
        try {
            localStorage.setItem('ecogestion_users', JSON.stringify(this.users || []));
        } catch (e) {
            console.error('Error guardando usuarios en localStorage:', e);
        }
    }

    // Obtener todos los usuarios
    getAllUsers() {
        return [...this.users]; // Retornar copia para evitar modificaciones directas
    }

    // Obtener usuario por ID
    getUserById(id) {
        return this.users.find(u => u.id === id);
    }

    // Verificar si un email ya existe (excluyendo un ID específico)
    emailExists(email, excludeId = null) {
        const lowerCaseEmail = email.toLowerCase();
        return this.users.some(u => u.email.toLowerCase() === lowerCaseEmail && u.id !== excludeId);
    }

    // Verificar si un username ya existe (excluyendo un ID específico)
    usernameExists(username, excludeId = null) {
        const lowerCaseUsername = username.toLowerCase();
        return this.users.some(u => u.username.toLowerCase() === lowerCaseUsername && u.id !== excludeId);
    }

    // Agregar nuevo usuario
    addUser(userData) {
        console.log('📝 Creando usuario con datos:', userData);
        
        // Validar datos requeridos
        if (!userData.username || !userData.password || !userData.name || !userData.email || !userData.type) {
            throw new Error('Todos los campos son requeridos');
        }

        // Validar formato de email
        if (!this.isValidEmail(userData.email)) {
            throw new Error('Formato de email inválido');
        }

        // Verificar duplicados
        if (this.emailExists(userData.email)) {
            throw new Error('Ya existe un usuario con este email');
        }

        if (this.usernameExists(userData.username)) {
            throw new Error('Ya existe un usuario con este nombre de usuario');
        }

        // Generar nuevo ID
        const newId = this.users.length > 0 ? Math.max(...this.users.map(u => u.id)) + 1 : 1;

        // Crear nuevo usuario
        const newUser = {
            id: newId,
            username: userData.username,
            password: userData.password,
            name: userData.name,
            email: userData.email,
            type: userData.type,
            permissions: this.getDefaultPermissions(userData.type),
            created: new Date().toISOString(),
            lastLogin: null,
            // Campos adicionales opcionales
            phone: userData.phone || '',
            address: userData.address || '',
            isTemporaryPassword: userData.isTemporaryPassword || false,
            status: userData.status || 'Activo'
        };

        // Agregar a la lista
        this.users.push(newUser);
        
        // Guardar en localStorage
        this.saveUsersToLocalStorage();

        console.log('✅ Usuario creado exitosamente:', newUser);
        return newUser;
    }

    // Actualizar usuario existente
    updateUser(id, userData) {
        const userIndex = this.users.findIndex(u => u.id === id);
        if (userIndex === -1) {
            throw new Error('Usuario no encontrado');
        }

        // Validar datos requeridos
        if (!userData.username || !userData.name || !userData.email || !userData.type) {
            throw new Error('Todos los campos son requeridos');
        }

        // Validar formato de email
        if (!this.isValidEmail(userData.email)) {
            throw new Error('Formato de email inválido');
        }

        // Verificar duplicados (excluyendo el usuario actual)
        if (this.emailExists(userData.email, id)) {
            throw new Error('Ya existe otro usuario con este email');
        }

        if (this.usernameExists(userData.username, id)) {
            throw new Error('Ya existe otro usuario con este nombre de usuario');
        }

        // Actualizar usuario
        const updatedUser = {
            ...this.users[userIndex],
            username: userData.username,
            name: userData.name,
            email: userData.email,
            type: userData.type,
            permissions: this.getDefaultPermissions(userData.type),
            updated: new Date().toISOString(),
            // Campos adicionales opcionales
            phone: userData.phone !== undefined ? userData.phone : this.users[userIndex].phone,
            address: userData.address !== undefined ? userData.address : this.users[userIndex].address,
            status: userData.status !== undefined ? userData.status : this.users[userIndex].status
        };

        // Actualizar password solo si se proporciona
        if (userData.password && userData.password.trim()) {
            updatedUser.password = userData.password;
        }

        this.users[userIndex] = updatedUser;
        
        // Guardar en localStorage
        this.saveUsersToLocalStorage();

        return updatedUser;
    }

    // Eliminar usuario
    deleteUser(id) {
        // No permitir eliminar usuarios por defecto críticos
        const defaultUserIds = [1, 2, 3]; // admin, tecnico1, cliente1
        if (defaultUserIds.includes(id)) {
            throw new Error('No se puede eliminar este usuario del sistema');
        }

        const userIndex = this.users.findIndex(u => u.id === id);
        if (userIndex === -1) {
            throw new Error('Usuario no encontrado');
        }

        // Verificar si es el usuario actualmente logueado
        if (app.currentUser && app.currentUser.id === id) {
            throw new Error('No puedes eliminar tu propio usuario mientras tienes una sesión activa');
        }

        // Eliminar usuario
        this.users.splice(userIndex, 1);
        
        // Guardar en localStorage
        this.saveUsersToLocalStorage();

        return true;
    }

    // Cambiar estado de usuario (Activo/Inactivo)
    changeUserStatus(id, newStatus) {
        const userIndex = this.users.findIndex(u => u.id === id);
        if (userIndex === -1) {
            throw new Error('Usuario no encontrado');
        }

        // No permitir desactivar el usuario actualmente logueado
        if (app.currentUser && app.currentUser.id === id && newStatus === 'Inactivo') {
            throw new Error('No puedes desactivar tu propio usuario mientras tienes una sesión activa');
        }

        // Actualizar estado
        this.users[userIndex].status = newStatus;
        this.users[userIndex].updated = new Date().toISOString();
        
        // Guardar en localStorage
        this.saveUsersToLocalStorage();

        console.log(`🔄 Estado de usuario ${id} cambiado a: ${newStatus}`);
        return this.users[userIndex];
    }

    // Obtener permisos por defecto según el tipo de usuario
    getDefaultPermissions(userType) {
        const permissions = {
            'admin': ['all'],
            'operator': ['collection', 'routes', 'manifests', 'plant'],
            'client': ['services', 'tracking', 'invoices']
        };
        return permissions[userType] || [];
    }

    // Validar credenciales de usuario (para el login)
    validateUserCredentials(emailOrUsername, password, userType) {
        return this.users.find(user => 
            (user.email === emailOrUsername || user.username === emailOrUsername) && 
            user.password === password && 
            user.type === userType
        );
    }
}

const authSystem = new AuthSystem();