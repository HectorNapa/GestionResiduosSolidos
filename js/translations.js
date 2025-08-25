// Sistema de traducciones para EcoGestión
class TranslationManager {
    constructor() {
        this.currentLanguage = 'es'; // Idioma por defecto
        this.translations = {
            es: {
                // Login page
                language: 'Idioma:',
                title: 'EcoGestión',
                subtitle: 'Sistema de Gestión de Residuos',
                email: 'Email',
                password: 'Contraseña',
                'user-type': 'Tipo de Usuario',
                admin: 'Administrador',
                technician: 'Técnico',
                client: 'Cliente',
                login: 'Iniciar Sesión',
                'select-company': 'Seleccionar Empresa',
                'company-placeholder': 'Seleccione una empresa',
                
                // Navigation
                logout: 'Salir',
                'main-menu': 'Menú Principal',
                
                // Dashboard
                welcome: 'Bienvenido',
                'quick-actions': 'Acciones Rápidas',
                'request-service': 'Solicitar Servicio',
                'my-collections': 'Mis Recolecciones',
                billing: 'Facturación',
                contact: 'Contacto',
                'next-collection': 'Próxima Recolección',
                'service-status': 'Estado del Servicio',
                'collections-by-waste-type': 'Recolecciones por Tipo de Residuo',
                'all-collections': 'Todas las recolecciones',
                'last-30-days': 'Últimos 30 días',
                'last-3-months': 'Últimos 3 meses',
                'last-year': 'Último año',
                'admin-dashboard': 'Dashboard Administrativo',
                'admin-dashboard-subtitle': 'Panel de control del sistema de gestión de residuos',
                'last-update': 'Última actualización',
                'system-operational': 'Sistema Operativo',
                'collections-today': 'Recolecciones Hoy',
                'processed-today': 'Procesado Hoy',
                'active-routes': 'Rutas Activas',
                'active-alerts': 'Alertas Activas',
                'hello': '¡Hola',
                'service-working-perfectly': 'Tu servicio de recolección está funcionando perfectamente',
                'last-week': 'Última semana',
                'last-month': 'Último mes',
                'last-quarter': 'Último trimestre',
                
                // Menu
                home: 'Inicio',
                'new-service': 'Nuevo Servicio',
                'my-services': 'Mis Servicios',
                invoices: 'Facturas',
                documents: 'Documentos',
                users: 'Usuarios',
                collections: 'Recolecciones',
                routes: 'Rutas',
                plant: 'Planta',
                disposal: 'Disposición',
                reports: 'Reportes',
                services: 'Solicitudes',

                
                // Common
                save: 'Guardar',
                cancel: 'Cancelar',
                edit: 'Editar',
                delete: 'Eliminar',
                view: 'Ver',
                add: 'Agregar',
                search: 'Buscar',
                filter: 'Filtrar',
                'no-data': 'No hay datos disponibles',
                loading: 'Cargando...',
                error: 'Error',
                success: 'Éxito',
                confirm: 'Confirmar',
                back: 'Volver',
                export: 'Exportar',
                refresh: 'Actualizar',
                'module-in-development': 'Módulo en desarrollo',
                'error-loading-dashboard': 'Error al Cargar el Dashboard',
                'print': 'Imprimir',
                'print-service': 'Imprimir Solicitud',
                'print-invoice': 'Imprimir Factura',
                'actions': 'Acciones',
                
                // Status
                pending: 'Pendiente',
                'in-process': 'En Proceso',
                completed: 'Completado',
                cancelled: 'Cancelado',
                overdue: 'Vencido',
                paid: 'Pagado',
                
                // Waste types
                'organic-waste': 'Residuos Orgánicos',
                'inorganic-waste': 'Residuos Inorgánicos',
                'hazardous-waste': 'Residuos Peligrosos',
                'recyclable-waste': 'Residuos Reciclables',
                'special-waste': 'Residuos Especiales'
            },
            en: {
                // Login page
                language: 'Language:',
                title: 'EcoManagement',
                subtitle: 'Solid Waste Management System',
                email: 'Email',
                password: 'Password',
                'user-type': 'User Type',
                admin: 'Administrator',
                technician: 'Technician',
                client: 'Client',
                login: 'Login',
                'select-company': 'Select Company',
                'company-placeholder': 'Select a company',
                
                // Navigation
                logout: 'Logout',
                'main-menu': 'Main Menu',
                
                // Dashboard
                welcome: 'Welcome',
                'quick-actions': 'Quick Actions',
                'request-service': 'Request Service',
                'my-collections': 'My Collections',
                billing: 'Billing',
                contact: 'Contact',
                'next-collection': 'Next Collection',
                'service-status': 'Service Status',
                'collections-by-waste-type': 'Collections by Waste Type',
                'all-collections': 'All collections',
                'last-30-days': 'Last 30 days',
                'last-3-months': 'Last 3 months',
                'last-year': 'Last year',
                'admin-dashboard': 'Administrative Dashboard',
                'admin-dashboard-subtitle': 'Waste management system control panel',
                'last-update': 'Last update',
                'system-operational': 'System Operational',
                'collections-today': 'Collections Today',
                'processed-today': 'Processed Today',
                'active-routes': 'Active Routes',
                'active-alerts': 'Active Alerts',
                'hello': 'Hello',
                'service-working-perfectly': 'Your collection service is working perfectly',
                'last-week': 'Last week',
                'last-month': 'Last month',
                'last-quarter': 'Last quarter',
                
                // Menu
                home: 'Home',
                'new-service': 'New Service',
                'my-services': 'My Services',
                invoices: 'Invoices',
                documents: 'Documents',
                users: 'Users',
                collections: 'Collections',
                routes: 'Routes',
                plant: 'Plant',
                disposal: 'Disposal',
                reports: 'Reports',
                services: 'Requests',

                
                // Common
                save: 'Save',
                cancel: 'Cancel',
                edit: 'Edit',
                delete: 'Delete',
                view: 'View',
                add: 'Add',
                search: 'Search',
                filter: 'Filter',
                'no-data': 'No data available',
                loading: 'Loading...',
                error: 'Error',
                success: 'Success',
                confirm: 'Confirm',
                back: 'Back',
                export: 'Export',
                refresh: 'Refresh',
                'module-in-development': 'Module in development',
                'error-loading-dashboard': 'Error Loading Dashboard',
                'print': 'Print',
                'print-service': 'Print Request',
                'print-invoice': 'Print Invoice',
                'actions': 'Actions',
                
                // Status
                pending: 'Pending',
                'in-process': 'In Process',
                completed: 'Completed',
                cancelled: 'Cancelled',
                overdue: 'Overdue',
                paid: 'Paid',
                
                // Waste types
                'organic-waste': 'Organic Waste',
                'inorganic-waste': 'Inorganic Waste',
                'hazardous-waste': 'Hazardous Waste',
                'recyclable-waste': 'Recyclable Waste',
                'special-waste': 'Special Waste'
            }
        };
        
        this.init();
    }
    
    init() {
        // Cargar idioma guardado en localStorage
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage && this.translations[savedLanguage]) {
            this.currentLanguage = savedLanguage;
        }
        
        // Configurar el selector de idioma
        this.setupLanguageSelector();
        
        // Aplicar traducciones iniciales
        this.applyTranslations();
    }
    
    setupLanguageSelector() {
        const selector = document.getElementById('language-selector');
        if (selector) {
            selector.value = this.currentLanguage;
            selector.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
        }
    }
    
    setLanguage(language) {
        if (this.translations[language]) {
            this.currentLanguage = language;
            localStorage.setItem('language', language);
            this.applyTranslations();
        }
    }
    
    getText(key) {
        const translation = this.translations[this.currentLanguage];
        return translation[key] || key;
    }
    
    applyTranslations() {
        // Traducir elementos con data-translate
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = this.getText(key);
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.placeholder) {
                    element.placeholder = translation;
                }
            } else if (element.tagName === 'OPTION') {
                element.textContent = translation;
            } else {
                element.textContent = translation;
            }
        });
        
        // Actualizar el selector de idioma
        const selector = document.getElementById('language-selector');
        if (selector) {
            selector.value = this.currentLanguage;
        }
    }
    
    // Método para traducir texto dinámicamente
    translate(key) {
        return this.getText(key);
    }
}

// Crear instancia global
const translationManager = new TranslationManager();

// Función global para traducción
function t(key) {
    return translationManager.translate(key);
}
