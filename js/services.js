window.servicesModule = {
    services: [],

    // ========== INIT & STORAGE ==========
    init() {
        this.loadSavedServices();
    },

    loadSavedServices() {
        try {
            const savedServices = localStorage.getItem('ecogestion_services');
            if (savedServices) {
                this.services = JSON.parse(savedServices);
            } else {
                // datos demo
                this.services = [
                    {
                        id: 1,
                        clientId: 1,
                        clientName: 'Empresa ABC S.A.',
                        clientEmail: 'contacto@abc.com',
                        clientPhone: '+(57) 300 000 000',
                        address: 'Av. Principal 123, Zona Norte',
                        wasteType: 'Orgánico',
                        estimatedVolume: '2.5',
                        volumeUnit: 'm3',
                        requestedDate: '2024-01-16',
                        preferredTime: '',
                        specificTime: '',
                        priority: 'Media',
                        accessNotes: '',
                        status: 'Pendiente de Aprobación',
                        createdDate: '2024-01-15',
                        createdBy: 1
                    },
                    {
                        id: 2,
                        clientId: 1,
                        clientName: 'Industrias XYZ',
                        clientEmail: 'logistica@xyz.com',
                        clientPhone: '+(57) 320 000 000',
                        address: 'Calle Secundaria 456, Centro',
                        wasteType: 'Reciclable',
                        estimatedVolume: '5.0',
                        volumeUnit: 'm3',
                        requestedDate: '2024-01-17',
                        preferredTime: 'morning',
                        specificTime: '',
                        priority: 'Alta',
                        accessNotes: '',
                        status: 'Programado',
                        createdDate: '2024-01-14',
                        createdBy: 1,
                        schedule: {
                            collectionDate: '2024-01-17',
                            collectionTime: '10:30',
                            estimatedDuration: '2',
                            equipmentRequired: 'Camión compactador',
                            personnelRequired: '1 operador + 1 ayudante',
                            schedulePriority: 'Alta'
                        }
                    },
                    // Servicios para el cliente de prueba (cliente1 - id: 3)
                    {
                        id: 3,
                        clientId: 3,
                        clientName: 'Empresa ABC S.A.',
                        clientEmail: 'contacto@empresaabc.com',
                        clientPhone: '+(57) 300 123 4567',
                        address: 'Av. Siempreviva 742, Springfield, Bogotá',
                        wasteType: 'Reciclable',
                        estimatedVolume: '3.2',
                        volumeUnit: 'm3',
                        requestedDate: new Date().toISOString().split('T')[0], // Hoy
                        preferredTime: 'morning',
                        specificTime: '09:00',
                        priority: 'Alta',
                        accessNotes: 'Portería principal, preguntar por el supervisor',
                        status: 'Programado',
                        createdDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Hace 2 días
                        createdBy: 3,
                        schedule: {
                            collectionDate: new Date().toISOString().split('T')[0],
                            collectionTime: '09:00',
                            estimatedDuration: '1.5',
                            equipmentRequired: 'Camión estándar',
                            personnelRequired: '1 operador + 1 ayudante',
                            schedulePriority: 'Alta'
                        }
                    },
                    {
                        id: 4,
                        clientId: 3,
                        clientName: 'Empresa ABC S.A.',
                        clientEmail: 'contacto@empresaabc.com',
                        clientPhone: '+(57) 300 123 4567',
                        address: 'Av. Siempreviva 742, Springfield, Bogotá',
                        wasteType: 'Peligroso',
                        estimatedVolume: '1.8',
                        volumeUnit: 'm3',
                        requestedDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Mañana
                        preferredTime: 'specific',
                        specificTime: '14:30',
                        priority: 'Urgente',
                        accessNotes: 'Requiere equipo especializado',
                        status: 'En Proceso',
                        createdDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Ayer
                        createdBy: 3,
                        schedule: {
                            collectionDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                            collectionTime: '14:30',
                            estimatedDuration: '2.5',
                            equipmentRequired: 'Camión especializado',
                            personnelRequired: 'Equipo especializado',
                            schedulePriority: 'Urgente'
                        }
                    },
                    {
                        id: 5,
                        clientId: 3,
                        clientName: 'Empresa ABC S.A.',
                        clientEmail: 'contacto@empresaabc.com',
                        clientPhone: '+(57) 300 123 4567',
                        address: 'Av. Siempreviva 742, Springfield, Bogotá',
                        wasteType: 'Orgánico',
                        estimatedVolume: '4.5',
                        volumeUnit: 'm3',
                        requestedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Hace 5 días
                        preferredTime: 'afternoon',
                        specificTime: '',
                        priority: 'Media',
                        accessNotes: '',
                        status: 'Completado',
                        createdDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Hace 7 días
                        createdBy: 3
                    },
                    // Servicios adicionales para pruebas de operador con estados variados
                    {
                        id: 6,
                        clientId: 1,
                        clientName: 'Hospital Central',
                        clientEmail: 'residuos@hospitalcentral.com',
                        clientPhone: '+(57) 310 555 0001',
                        address: 'Calle 26 #47-15, Bogotá',
                        wasteType: 'Peligroso',
                        estimatedVolume: '2.0',
                        volumeUnit: 'm3',
                        requestedDate: new Date().toISOString().split('T')[0],
                        preferredTime: 'morning',
                        specificTime: '08:00',
                        priority: 'Urgente',
                        accessNotes: 'Coordinar con seguridad hospitalaria',
                        status: 'En Ruta',
                        createdDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        createdBy: 1,
                        assignedOperator: 'Carlos Rodríguez',
                        operatorId: 4,
                        schedule: {
                            collectionDate: new Date().toISOString().split('T')[0],
                            collectionTime: '08:00',
                            estimatedDuration: '1.5',
                            equipmentRequired: 'Camión especializado',
                            personnelRequired: 'Equipo especializado + 1 supervisor',
                            schedulePriority: 'Urgente'
                        }
                    },
                    {
                        id: 7,
                        clientId: 2,
                        clientName: 'Supermercado FreshMart',
                        clientEmail: 'operaciones@freshmart.com',
                        clientPhone: '+(57) 320 555 0002',
                        address: 'Av. El Dorado #68-45, Bogotá',
                        wasteType: 'Orgánico',
                        estimatedVolume: '3.5',
                        volumeUnit: 'm3',
                        requestedDate: new Date().toISOString().split('T')[0],
                        preferredTime: 'afternoon',
                        specificTime: '15:30',
                        priority: 'Media',
                        accessNotes: 'Entrada por el muelle de carga',
                        status: 'Recolectado',
                        createdDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        createdBy: 2,
                        assignedOperator: 'Carlos Rodríguez',
                        operatorId: 4,
                        schedule: {
                            collectionDate: new Date().toISOString().split('T')[0],
                            collectionTime: '15:30',
                            estimatedDuration: '1.0',
                            equipmentRequired: 'Camión compactador',
                            personnelRequired: '1 operador + 1 ayudante',
                            schedulePriority: 'Media'
                        }
                    },
                    {
                        id: 8,
                        clientId: 3,
                        clientName: 'Fábrica EcoTech',
                        clientEmail: 'produccion@ecotech.com',
                        clientPhone: '+(57) 315 555 0003',
                        address: 'Zona Industrial Sur, Km 12 Autopista Sur',
                        wasteType: 'Industrial',
                        estimatedVolume: '8.0',
                        volumeUnit: 'm3',
                        requestedDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        preferredTime: 'morning',
                        specificTime: '09:00',
                        priority: 'Alta',
                        accessNotes: 'Recoger en área de almacenamiento temporal',
                        status: 'Programado',
                        createdDate: new Date().toISOString().split('T')[0],
                        createdBy: 3,
                        assignedOperator: 'Carlos Rodríguez',
                        operatorId: 4,
                        schedule: {
                            collectionDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                            collectionTime: '09:00',
                            estimatedDuration: '2.5',
                            equipmentRequired: 'Camión de carga pesada',
                            personnelRequired: '1 operador + 2 ayudantes',
                            schedulePriority: 'Alta'
                        }
                    }
                ];
                this.saveServices();
            }
        } catch (error) {
            console.error('Error al cargar servicios guardados:', error);
            this.services = [];
            this.saveServices();
        }
    },

    saveServices() {
        try {
            localStorage.setItem('ecogestion_services', JSON.stringify(this.services));
        } catch (error) {
            console.error('Error al guardar servicios:', error);
        }
    },

    getApprovedServices() {
        return this.services.filter(s => s.status === 'Aprobado');
    },

    // ========== VISTA LISTA ==========
    load() {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="mb-6">
                <div class="flex justify-between items-center">
                    <h1 class="text-3xl font-bold text-gray-800">Gestión de Solicitudes</h1>
                    <button onclick="servicesModule.loadNewService()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                        <i class="fas fa-plus mr-2"></i>Nueva Solicitud
                    </button>
                </div>
                <p class="text-gray-600">Administra las solicitudes de recolección de residuos</p>
            </div>

            <div class="bg-white p-4 rounded-lg shadow mb-6">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                        <select id="status-filter" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                            <option value="">Todos</option>
                            <option value="Pendiente de Aprobación">Pendiente de Aprobación</option>
                            <option value="Aprobado">Aprobado</option>
                            <option value="Rechazado">Rechazado</option>
                            <option value="Programado">Programado</option>
                            <option value="En Ruta">En Ruta</option>
                            <option value="En Proceso">En Proceso</option>
                            <option value="Recolectado">Recolectado</option>
                            <option value="En Tránsito">En Tránsito</option>
                            <option value="Completado">Completado</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Residuo</label>
                        <select id="waste-type-filter" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                            <option value="">Todos</option>
                            <option value="Orgánico">Orgánico</option>
                            <option value="Reciclable">Reciclable</option>
                            <option value="No Reciclable">No Reciclable</option>
                            <option value="Peligroso">Peligroso</option>
                            <option value="Electrónicos">Electrónicos</option>
                            <option value="Construcción">Construcción</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
                        <input type="date" id="date-from-filter" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
                        <input type="date" id="date-to-filter" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                    </div>
                </div>
                <div class="mt-4">
                    <button onclick="servicesModule.applyFilters()" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                        <i class="fas fa-filter mr-2"></i>Aplicar Filtros
                    </button>
                    <button onclick="servicesModule.clearFilters()" class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 ml-2">
                        <i class="fas fa-times mr-2"></i>Limpiar
                    </button>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo Residuo</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Volumen Est.</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Solicitada</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioridad</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200" id="services-table-body"></tbody>
                    </table>
                </div>
            </div>
        `;
        this.loadServicesTable();
    },

    loadServicesTable() {
        const tbody = document.getElementById('services-table-body');
        tbody.innerHTML = this.services.map(service => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #${String(service.id).padStart(3,'0')}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                        <div class="text-sm font-medium text-gray-900">${service.clientName}</div>
                        <div class="text-sm text-gray-500">${service.address}</div>
                        <div class="text-xs text-gray-400">${service.clientEmail ?? ''}</div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs rounded-full ${this.getWasteTypeClass(service.wasteType)}">
                        ${service.wasteType}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${service.estimatedVolume} ${service.volumeUnit || 'm³'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${this.formatDate(service.requestedDate)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs rounded-full ${this.getStatusClass(service.status)}">
                        ${service.status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs rounded-full ${this.getPriorityClass(service.priority || 'Media')}">
                        ${service.priority || 'Media'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                        <button onclick="servicesModule.viewService(${service.id})" 
                                class="text-blue-600 hover:text-blue-900" title="Ver">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${service.status === 'Pendiente de Aprobación' ? `
                            <button onclick="servicesModule.approveService(${service.id})" 
                                    class="text-green-600 hover:text-green-900" title="Aprobar">
                                <i class="fas fa-check"></i>
                            </button>
                            <button onclick="servicesModule.showRejectionModal(${service.id})" 
                                    class="text-red-600 hover:text-red-900" title="Rechazar">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : `
                            <button onclick="servicesModule.editService(${service.id})" 
                                    class="text-green-600 hover:text-green-900" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="servicesModule.scheduleService(${service.id})" 
                                    class="text-yellow-600 hover:text-yellow-900" title="Programar">
                                <i class="fas fa-calendar-plus"></i>
                            </button>
                        `}
                        <button onclick="servicesModule.deleteService(${service.id})" 
                                class="text-red-600 hover:text-red-900" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    // ========== NUEVA SOLICITUD ==========
    loadNewService() {
        const contentArea = document.getElementById('content-area');
        const currentUser = app.currentUser;
        const isClientUser = currentUser && currentUser.type === 'client';
        
        // Determinar título y descripción según el tipo de usuario
        const title = isClientUser ? 
            'Nueva Solicitud de Servicio' : 
            'Nueva Solicitud de Servicio (Admin)';
        const description = isClientUser ? 
            'Solicite nuestros servicios de recolección de residuos' : 
            'Crea una solicitud a nombre de un cliente';

        contentArea.innerHTML = `
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-gray-800">${title}</h1>
                <p class="text-gray-600">${description}</p>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                ${!isClientUser ? `
                <div class="mb-6 border rounded-lg p-4 bg-gray-50">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Buscar cliente por email</label>
                    <div class="flex">
                        <input id="client-email-search" type="email" class="flex-1 px-3 py-2 border rounded-l-lg focus:outline-none focus:border-blue-500" placeholder="cliente@dominio.com">
                        <button id="search-client-btn" class="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700">Buscar</button>
                    </div>
                    <p class="text-xs text-gray-500 mt-2">Si el cliente no existe, podrás crearlo desde aquí.</p>
                </div>
                ` : ''}

                <form id="new-service-form" class="space-y-6">
                    <input type="hidden" id="selected-client-id">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Nombre del Cliente *</label>
                            <input type="text" id="client-name" class="w-full px-3 py-2 border rounded-lg ${!isClientUser ? 'bg-gray-100' : ''}" required ${!isClientUser ? 'readonly' : ''}>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                            <input type="email" id="client-email" class="w-full px-3 py-2 border rounded-lg ${!isClientUser ? 'bg-gray-100' : ''}" required ${!isClientUser ? 'readonly' : ''}>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono *</label>
                            <input type="tel" id="client-phone" class="w-full px-3 py-2 border rounded-lg ${!isClientUser ? 'bg-gray-100' : ''}" required ${!isClientUser ? 'readonly' : ''}>
                        </div>

                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Dirección Completa ${!isClientUser ? '(Editable)' : ''} *</label>
                            <textarea id="client-address" rows="3" class="w-full px-3 py-2 border rounded-lg" required></textarea>
                        </div>
                    </div>

                    <h3 class="text-lg font-semibold text-gray-800 border-b pb-2 mt-6">Detalles del Servicio</h3>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Residuo *</label>
                            <select id="waste-type" required class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                <option value="">Seleccionar tipo</option>
                                <option value="Orgánico">Orgánico</option>
                                <option value="Reciclable">Reciclable (Papel, Cartón, Plástico, Metal)</option>
                                <option value="No Reciclable">No Reciclable</option>
                                <option value="Peligroso">Peligroso (Químicos, Baterías, etc.)</option>
                                <option value="Electrónicos">Residuos Electrónicos</option>
                                <option value="Construcción">Residuos de Construcción</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Volumen Estimado *</label>
                            <div class="flex">
                                <input type="number" id="estimated-volume" required step="0.1" min="0.1"
                                       class="flex-1 px-3 py-2 border rounded-l-lg focus:outline-none focus:border-blue-500"
                                       placeholder="0.0">
                                <select id="volume-unit" class="px-3 py-2 border-l-0 border rounded-r-lg focus:outline-none focus:border-blue-500">
                                    <option value="m3">m³</option>
                                    <option value="kg">kg</option>
                                    <option value="ton">Toneladas</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Solicitada *</label>
                            <input type="date" id="requested-date" required class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Hora Preferida</label>
                            <select id="preferred-time" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                <option value="">Sin preferencia</option>
                                <option value="morning">Mañana (8:00 - 12:00)</option>
                                <option value="afternoon">Tarde (12:00 - 18:00)</option>
                                <option value="specific">Hora específica</option>
                            </select>
                        </div>

                        <div id="specific-time-container" class="hidden">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Hora Específica *</label>
                            <input type="time" id="specific-time" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
                            <select id="priority" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                <option value="Baja">Baja</option>
                                <option value="Media" selected>Media</option>
                                <option value="Alta">Alta</option>
                                <option value="Urgente">Urgente</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Contacto en Sitio *</label>
                            <input type="text" id="site-contact-name" class="w-full px-3 py-2 border rounded-lg" placeholder="Nombre y apellido" required>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono de Contacto en Sitio *</label>
                            <input type="tel" id="site-contact-phone" class="w-full px-3 py-2 border rounded-lg" placeholder="+(xx) xxxx-xxxx" required>
                        </div>

                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Instrucciones de Acceso / Referencias</label>
                            <textarea id="access-notes" rows="3" class="w-full px-3 py-2 border rounded-lg" placeholder="Portería, piso, referencias, etc."></textarea>
                        </div>

                        <div id="hazardous-container" class="md:col-span-2 hidden border rounded-lg p-4">
                            <h4 class="font-semibold mb-3">Datos para Residuos Peligrosos</h4>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Descripción/Nombre químico *</label>
                                    <input type="text" id="hazardous-desc" class="w-full px-3 py-2 border rounded-lg">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">N° ONU (UN)</label>
                                    <input type="text" id="hazardous-un" class="w-full px-3 py-2 border rounded-lg" placeholder="Ej. UN 1203">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">URL/Ref. Hoja de Seguridad</label>
                                    <input type="url" id="hazardous-sds" class="w-full px-3 py-2 border rounded-lg" placeholder="https://...">
                                </div>
                            </div>
                            <p class="text-xs text-gray-500 mt-2">* Obligatorio si el residuo es “Peligroso”.</p>
                        </div>
                    </div>

                    <div class="flex justify-end space-x-4 pt-6 border-t">
                        <button type="button" onclick="${isClientUser ? 'app.loadModule(\"dashboard\")' : 'app.loadModule(\"services\")'}" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancelar</button>
                        <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <i class="fas fa-save mr-2"></i>Crear Solicitud
                        </button>
                    </div>
                </form>
            </div>
        `;
        this.initNewServiceForm();
        
        // Si es un cliente logueado, pre-llenar automáticamente su información
        if (isClientUser) {
            this._fillClientFields(currentUser);
        }
    },

    initNewServiceForm() {
        const form = document.getElementById('new-service-form');
        const preferredTimeSelect = document.getElementById('preferred-time');
        const specificTimeContainer = document.getElementById('specific-time-container');
        const wasteType = document.getElementById('waste-type');
        const hazardousContainer = document.getElementById('hazardous-container');

        // Fecha mínima = hoy
        document.getElementById('requested-date').min = new Date().toISOString().split('T')[0];

        preferredTimeSelect.addEventListener('change', function () {
            specificTimeContainer.classList.toggle('hidden', this.value !== 'specific');
        });
        wasteType.addEventListener('change', function () {
            hazardousContainer.classList.toggle('hidden', this.value !== 'Peligroso');
        });

        // Buscar por email (solo para admins)
        const searchBtn = document.getElementById('search-client-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                const email = (document.getElementById('client-email-search').value || '').trim().toLowerCase();
                this._handleFindClientByEmail(email);
            });
        }

        // Callback cuando se crea un usuario
        if (window.app) {
            app.onUserCreated = (user) => {
                if (!user || user.type !== 'client') return;
                this._fillClientFields(user);
                authSystem?.showNotification?.('Cliente creado y seleccionado. Puede completar la solicitud.', 'success');
            };
        }

        // Submit
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveNewService();
        });
    },

    // Helpers de clientes/validación
    _getClientsFromUsers() {
        try {
            let users = [];
            if (window.app && Array.isArray(app.mockUsers)) {
                users = app.mockUsers;
            } else {
                users = JSON.parse(localStorage.getItem('ecogestion_users') || '[]');
            }
            return users.filter(u => u.type === 'client' && u.status !== 'Inactivo');
        } catch {
            return [];
        }
    },
    _fillClientFields(c) {
        document.getElementById('selected-client-id').value = c.id || '';
        document.getElementById('client-name').value = c.name || '';
        document.getElementById('client-email').value = c.email || '';
        document.getElementById('client-phone').value = c.phone || ''; // Asumiendo que el usuario tiene un campo 'phone'
        document.getElementById('client-address').value = c.address || '';
    },
    _clearClientFields() {
        document.getElementById('selected-client-id').value = '';
        document.getElementById('client-name').value = '';
        document.getElementById('client-email').value = '';
        document.getElementById('client-phone').value = '';
        document.getElementById('client-address').value = '';
    },
    _handleFindClientByEmail(email) {
        const emailRegex = /^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/;
        if (!emailRegex.test(email)) {
            authSystem?.showNotification?.('Ingrese un email válido', 'error');
            return;
        }
        const clients = this._getClientsFromUsers();
        const found = clients.find(c => (c.email || '').toLowerCase() === email);
        if (found) {
            this._fillClientFields(found);
            authSystem?.showNotification?.('Cliente encontrado. Puede verificar los datos.', 'success');
        } else {
            this._promptCreateClient(email);
        }
    },
    _promptCreateClient(email) {
        const modal = document.createElement('div');
        modal.id = 'create-client-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 class="text-lg font-semibold mb-3">Cliente no encontrado</h3>
                <p class="text-gray-700 mb-4">No existe un usuario con el email <strong>${email}</strong>.</p>
                <p class="text-sm text-gray-600 mb-6">¿Deseas crearlo con rol <strong>Cliente</strong> y volver para completar la solicitud?</p>
                <div class="flex justify-end space-x-3">
                    <button id="cancel-create-client" class="px-4 py-2 border rounded-lg">Cancelar</button>
                    <button id="confirm-create-client" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Crear Usuario</button>
                </div>
            </div>`;
        document.body.appendChild(modal);

        modal.querySelector('#cancel-create-client').onclick = () => modal.remove();
        modal.querySelector('#confirm-create-client').onclick = () => {
            modal.remove();
            if (window.app && typeof app.showNewUserModal === 'function') {
                app.showNewUserModal({ email, type: 'client', lockType: true });
            } else {
                authSystem?.showNotification?.('No se encontró el gestor de usuarios', 'error');
            }
        };
    },

    validateNewServiceForm(data) {
        const errors = [];
        const emailRegex = /^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/;
        const currentUser = app?.currentUser;
        const isClientUser = currentUser && currentUser.type === 'client';

        // Para usuarios clientes, no validamos clientId ya que se obtiene automáticamente
        if (!isClientUser && !data.clientId) {
            errors.push('Busque y seleccione un cliente por su email.');
        }
        
        if (!data.clientName?.trim()) errors.push('Nombre del cliente es obligatorio.');
        if (!emailRegex.test(data.clientEmail || '')) errors.push('Email del cliente inválido.');
        if (!data.clientPhone?.trim()) errors.push('Teléfono del cliente es obligatorio.');
        if (!data.address?.trim()) errors.push('Dirección del cliente es obligatoria.');

        if (!data.wasteType) errors.push('Seleccione el tipo de residuo.');
        if (!data.estimatedVolume || Number(data.estimatedVolume) <= 0) errors.push('Ingrese un volumen estimado válido.');
        if (!data.requestedDate) errors.push('Seleccione la fecha solicitada.');

        if (data.preferredTime === 'specific' && !data.specificTime) {
            errors.push('Debe indicar la hora específica.');
        }

        if (data.wasteType === 'Peligroso') {
            if (!data.hazardousDesc?.trim()) errors.push('Para residuos peligrosos, la descripción/nombre químico es obligatoria.');
        }

        if (!data.siteContactName?.trim()) errors.push('El contacto en sitio es obligatorio.');
        if (!data.siteContactPhone?.trim()) errors.push('El teléfono del contacto en sitio es obligatorio.');

        return { ok: errors.length === 0, errors };
    },

    saveNewService() {
        const currentUser = app?.currentUser || { id: 'admin' };
        const isClientUser = currentUser && currentUser.type === 'client';
        
        const formData = {
            clientId: isClientUser ? currentUser.id : document.getElementById('selected-client-id').value,
            clientName: document.getElementById('client-name').value.trim(),
            clientEmail: document.getElementById('client-email').value.trim(),
            clientPhone: document.getElementById('client-phone').value.trim(),
            address: document.getElementById('client-address').value.trim(),

            wasteType: document.getElementById('waste-type').value,
            estimatedVolume: document.getElementById('estimated-volume').value,
            volumeUnit: document.getElementById('volume-unit').value,
            requestedDate: document.getElementById('requested-date').value,
            preferredTime: document.getElementById('preferred-time').value,
            specificTime: document.getElementById('specific-time')?.value || '',
            priority: document.getElementById('priority').value,

            siteContactName: document.getElementById('site-contact-name').value.trim(),
            siteContactPhone: document.getElementById('site-contact-phone').value.trim(),
            accessNotes: document.getElementById('access-notes').value.trim(),

            hazardousDesc: document.getElementById('hazardous-desc')?.value.trim() || '',
            hazardousUN: document.getElementById('hazardous-un')?.value.trim() || '',
            hazardousSDS: document.getElementById('hazardous-sds')?.value.trim() || '',

            status: 'Pendiente de Aprobación',
            createdDate: new Date().toISOString().split('T')[0],
            createdBy: currentUser.id
        };

        const v = this.validateNewServiceForm(formData);
        if (!v.ok) {
            authSystem?.showNotification?.(v.errors[0], 'error');
            return;
        }

        this.createService(formData);
    },

    createService(formData) {
        const newService = {
            id: this.generateServiceId(),
            ...formData
        };
        this.services.push(newService);
        this.saveServices();

        authSystem?.showNotification?.('Solicitud creada exitosamente', 'success');
        
        // Determinar a dónde dirigir según el tipo de usuario
        const currentUser = app?.currentUser;
        const isClientUser = currentUser && currentUser.type === 'client';
        
        if (isClientUser) {
            // Para clientes, volver al dashboard
            setTimeout(() => {
                app.loadModule('dashboard');
            }, 1500);
        } else {
            // Para admins, volver al listado de servicios
            this.load();
        }
    },

    // ========== APROBAR / RECHAZAR ==========
    approveService(serviceId) {
        const s = this.services.find(x => x.id === serviceId);
        if (!s) return authSystem?.showNotification?.('Servicio no encontrado', 'error');
        s.status = 'Aprobado';
        s.approvedDate = new Date().toISOString().split('T')[0];
        s.approvedBy = app?.currentUser?.id || 'admin';
        this.saveServices();
        this.loadServicesTable();
        authSystem?.showNotification?.('Solicitud aprobada', 'success');
    },

    showRejectionModal(serviceId) {
        const s = this.services.find(x => x.id === serviceId);
        if (!s) return;

        const modalHTML = `
            <div id="rejection-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 w-96 max-w-md">
                    <div class="flex items-center mb-4">
                        <i class="fas fa-exclamation-triangle text-red-500 text-2xl mr-3"></i>
                        <h3 class="text-lg font-semibold text-gray-900">Rechazar Solicitud</h3>
                    </div>
                    <div class="mb-4">
                        <p class="text-gray-700 mb-2">¿Seguro que deseas rechazar la solicitud #${String(s.id).padStart(3,'0')}?</p>
                        <div class="bg-gray-50 p-3 rounded border text-sm text-gray-600">
                            <p><strong>Cliente:</strong> ${s.clientName}</p>
                            <p><strong>Servicio:</strong> ${s.wasteType}</p>
                            <p><strong>Fecha:</strong> ${s.requestedDate}</p>
                        </div>
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Motivo (opcional)</label>
                        <textarea id="rejection-message" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-red-500" rows="3" placeholder="Explica por qué se rechaza..."></textarea>
                    </div>
                    <div class="flex justify-end space-x-3">
                        <button id="cancel-rejection" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
                        <button id="confirm-rejection" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Rechazar</button>
                    </div>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modal = document.getElementById('rejection-modal');
        const cancelBtn = document.getElementById('cancel-rejection');
        const confirmBtn = document.getElementById('confirm-rejection');

        cancelBtn.addEventListener('click', () => modal.remove());
        confirmBtn.addEventListener('click', () => {
            const msg = document.getElementById('rejection-message').value.trim();
            this.rejectService(serviceId, msg);
            modal.remove();
        });
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        document.addEventListener('keydown', function esc(e) {
            if (e.key === 'Escape') { modal.remove(); document.removeEventListener('keydown', esc); }
        });
    },

    rejectService(serviceId, message = '') {
        const s = this.services.find(x => x.id === serviceId);
        if (!s) return authSystem?.showNotification?.('Servicio no encontrado', 'error');
        s.status = 'Rechazado';
        s.rejectedDate = new Date().toISOString().split('T')[0];
        s.rejectedBy = app?.currentUser?.id || 'admin';
        s.rejectionMessage = message;
        this.saveServices();
        this.loadServicesTable();
        authSystem?.showNotification?.('Solicitud rechazada', 'warning');
    },

    // ========== DETALLE / EDICIÓN ==========
    viewService(id) {
        const s = this.services.find(x => x.id === id);
        if (!s) return;

        const currentUser = app?.currentUser;
        const isClient = currentUser?.type === 'client';
        const backAction = isClient ? "app.loadModule('my-services')" : "servicesModule.load()";

        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="mb-6 flex justify-between items-center">
                <div>
                    <h1 class="text-3xl font-bold text-gray-800">Servicio #${String(s.id).padStart(3,'0')}</h1>
                    <p class="text-gray-600">Información completa de la solicitud</p>
                </div>
                <button onclick="${backAction}" class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                    <i class="fas fa-arrow-left mr-2"></i>Volver
                </button>
            </div>

            <div class="bg-white rounded-lg shadow p-6 space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-3">
                        <h3 class="text-lg font-semibold border-b pb-2">Cliente</h3>
                        <p><span class="font-medium">Nombre:</span> ${s.clientName}</p>
                        <p><span class="font-medium">Email:</span> ${s.clientEmail || '—'}</p>
                        <p><span class="font-medium">Teléfono:</span> ${s.clientPhone || '—'}</p>
                        <p><span class="font-medium">Dirección:</span> ${s.address}</p>
                    </div>
                    <div class="space-y-3">
                        <h3 class="text-lg font-semibold border-b pb-2">Servicio</h3>
                        <p><span class="font-medium">Tipo:</span> ${s.wasteType}</p>
                        <p><span class="font-medium">Volumen:</span> ${s.estimatedVolume} ${s.volumeUnit || 'm³'}</p>
                        <p><span class="font-medium">Fecha solicitada:</span> ${this.formatDate(s.requestedDate)}</p>
                        <p><span class="font-medium">Hora preferida:</span> ${this.formatPreferredTime(s.preferredTime, s.specificTime)}</p>
                        <p><span class="font-medium">Prioridad:</span> ${s.priority || 'Media'}</p>
                    </div>

                    <div class="space-y-3">
                        <h3 class="text-lg font-semibold border-b pb-2">Estado</h3>
                        <p><span class="font-medium">Estado:</span> <span class="px-2 py-1 text-xs rounded-full ${this.getStatusClass(s.status)}">${s.status}</span></p>
                        ${s.approvedDate ? `<p><span class="font-medium">Aprobado:</span> ${this.formatDate(s.approvedDate)}</p>` : ''}
                        ${s.rejectedDate ? `<p><span class="font-medium">Rechazado:</span> ${this.formatDate(s.rejectedDate)}</p>` : ''}
                        ${s.rejectionMessage ? `<p class="text-red-600 text-sm"><span class="font-medium">Motivo:</span> ${s.rejectionMessage}</p>` : ''}
                    </div>

                    <div class="space-y-3">
                        <h3 class="text-lg font-semibold border-b pb-2">Extras</h3>
                        <p><span class="font-medium">Contacto en sitio:</span> ${s.siteContactName || '—'}</p>
                        <p><span class="font-medium">Tel. contacto en sitio:</span> ${s.siteContactPhone || '—'}</p>
                        <p><span class="font-medium">Acceso / Referencias:</span> ${s.accessNotes || '—'}</p>
                        ${s.wasteType === 'Peligroso' ? `
                            <div class="p-3 bg-red-50 rounded">
                                <p class="font-medium text-red-700">Datos de Peligrosos</p>
                                <p><span class="font-medium">Descripción:</span> ${s.hazardousDesc || '—'}</p>
                                <p><span class="font-medium">UN:</span> ${s.hazardousUN || '—'}</p>
                                <p><span class="font-medium">SDS:</span> ${s.hazardousSDS || '—'}</p>
                            </div>` : ''
                        }
                    </div>
                </div>

                ${!isClient ? `
                <div class="pt-6 border-t flex flex-wrap gap-3">
                    ${s.status === 'Pendiente de Aprobación' ? `
                        <button onclick="servicesModule.approveService(${s.id})" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                            <i class="fas fa-check mr-2"></i>Aprobar
                        </button>
                        <button onclick="servicesModule.showRejectionModal(${s.id})" class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                            <i class="fas fa-times mr-2"></i>Rechazar
                        </button>
                    ` : `
                        <button onclick="servicesModule.editService(${s.id})" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                            <i class="fas fa-edit mr-2"></i>Editar
                        </button>
                        <button onclick="servicesModule.scheduleService(${s.id})" class="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700">
                            <i class="fas fa-calendar-plus mr-2"></i>Programar
                        </button>
                    `}
                    <button onclick="servicesModule.deleteService(${s.id})" class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                        <i class="fas fa-trash mr-2"></i>Eliminar
                    </button>
                </div>
                ` : ''}
            </div>
        `;
    },

    editService(id) {
        const s = this.services.find(x => x.id === id);
        if (!s) return;
        const contentArea = document.getElementById('content-area');

        contentArea.innerHTML = `
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-gray-800">Editar Servicio #${String(s.id).padStart(3,'0')}</h1>
                <p class="text-gray-600">Modifica los detalles de la solicitud</p>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <form id="edit-service-form" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Nombre del Cliente *</label>
                            <input type="text" id="edit-client-name" required class="w-full px-3 py-2 border rounded-lg" value="${s.clientName}">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono *</label>
                            <input type="tel" id="edit-client-phone" required class="w-full px-3 py-2 border rounded-lg" value="${s.clientPhone || ''}">
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Dirección *</label>
                            <textarea id="edit-client-address" required rows="3" class="w-full px-3 py-2 border rounded-lg">${s.address}</textarea>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Residuo *</label>
                            <select id="edit-waste-type" required class="w-full px-3 py-2 border rounded-lg">
                                <option value="Orgánico" ${s.wasteType==='Orgánico'?'selected':''}>Orgánico</option>
                                <option value="Reciclable" ${s.wasteType==='Reciclable'?'selected':''}>Reciclable</option>
                                <option value="No Reciclable" ${s.wasteType==='No Reciclable'?'selected':''}>No Reciclable</option>
                                <option value="Peligroso" ${s.wasteType==='Peligroso'?'selected':''}>Peligroso</option>
                                <option value="Electrónicos" ${s.wasteType==='Electrónicos'?'selected':''}>Electrónicos</option>
                                <option value="Construcción" ${s.wasteType==='Construcción'?'selected':''}>Construcción</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Volumen Estimado *</label>
                            <div class="flex">
                                <input type="number" id="edit-estimated-volume" required step="0.1" min="0.1" class="flex-1 px-3 py-2 border rounded-l-lg" value="${s.estimatedVolume}">
                                <select id="edit-volume-unit" class="px-3 py-2 border-l-0 border rounded-r-lg">
                                    <option value="m3" ${(s.volumeUnit||'m3')==='m3'?'selected':''}>m³</option>
                                    <option value="kg" ${s.volumeUnit==='kg'?'selected':''}>kg</option>
                                    <option value="ton" ${s.volumeUnit==='ton'?'selected':''}>Toneladas</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Solicitada *</label>
                            <input type="date" id="edit-requested-date" required class="w-full px-3 py-2 border rounded-lg" value="${s.requestedDate}">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Hora Preferida</label>
                            <select id="edit-preferred-time" class="w-full px-3 py-2 border rounded-lg">
                                <option value="" ${!s.preferredTime?'selected':''}>Sin preferencia</option>
                                <option value="morning" ${s.preferredTime==='morning'?'selected':''}>Mañana</option>
                                <option value="afternoon" ${s.preferredTime==='afternoon'?'selected':''}>Tarde</option>
                                <option value="specific" ${s.preferredTime==='specific'?'selected':''}>Hora específica</option>
                            </select>
                        </div>

                        <div id="edit-specific-time-container" class="${s.preferredTime==='specific'?'':'hidden'}">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Hora Específica</label>
                            <input type="time" id="edit-specific-time" class="w-full px-3 py-2 border rounded-lg" value="${s.specificTime || ''}">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                            <select id="edit-status" class="w-full px-3 py-2 border rounded-lg">
                                ${['Pendiente de Aprobación','Aprobado','Rechazado','Programado','En Proceso','Completado']
                                    .map(st => `<option value="${st}" ${s.status===st?'selected':''}>${st}</option>`).join('')}
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
                            <select id="edit-priority" class="w-full px-3 py-2 border rounded-lg">
                                ${['Baja','Media','Alta','Urgente'].map(p => `<option value="${p}" ${ (s.priority||'Media')===p?'selected':''}>${p}</option>`).join('')}
                            </select>
                        </div>

                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
                            <textarea id="edit-access-notes" rows="3" class="w-full px-3 py-2 border rounded-lg">${s.accessNotes || ''}</textarea>
                        </div>

                        <div id="edit-hazardous-container" class="md:col-span-2 ${s.wasteType==='Peligroso'?'':'hidden'} border rounded-lg p-4">
                            <h4 class="font-semibold mb-3">Datos de Peligrosos</h4>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
                                    <input type="text" id="edit-hazardous-desc" class="w-full px-3 py-2 border rounded-lg" value="${s.hazardousDesc || ''}">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">UN</label>
                                    <input type="text" id="edit-hazardous-un" class="w-full px-3 py-2 border rounded-lg" value="${s.hazardousUN || ''}">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">SDS</label>
                                    <input type="url" id="edit-hazardous-sds" class="w-full px-3 py-2 border rounded-lg" value="${s.hazardousSDS || ''}">
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-end space-x-4 pt-6 border-t">
                        <button type="button" onclick="${(app?.currentUser?.type === 'client') ? "app.loadModule('my-services')" : `servicesModule.viewService(${s.id})`}" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancelar</button>
                        <button type="submit" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                            <i class="fas fa-save mr-2"></i>Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        `;

        // listeners
        const form = document.getElementById('edit-service-form');
        const pt = document.getElementById('edit-preferred-time');
        const stc = document.getElementById('edit-specific-time-container');
        const wt = document.getElementById('edit-waste-type');
        const hz = document.getElementById('edit-hazardous-container');

        pt.addEventListener('change', function(){
            stc.classList.toggle('hidden', this.value !== 'specific');
        });
        wt.addEventListener('change', function(){
            hz.classList.toggle('hidden', this.value !== 'Peligroso');
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEditedService(s.id);
        });
    },

    saveEditedService(id) {
        const idx = this.services.findIndex(x => x.id === id);
        if (idx === -1) return;

        const s = this.services[idx];
        const payload = {
            clientName: document.getElementById('edit-client-name').value.trim(),
            clientPhone: document.getElementById('edit-client-phone').value.trim(),
            address: document.getElementById('edit-client-address').value.trim(),
            wasteType: document.getElementById('edit-waste-type').value,
            estimatedVolume: document.getElementById('edit-estimated-volume').value,
            volumeUnit: document.getElementById('edit-volume-unit').value,
            requestedDate: document.getElementById('edit-requested-date').value,
            preferredTime: document.getElementById('edit-preferred-time').value,
            specificTime: document.getElementById('edit-specific-time')?.value || '',
            status: document.getElementById('edit-status').value,
            priority: document.getElementById('edit-priority').value,
            accessNotes: document.getElementById('edit-access-notes').value,
            hazardousDesc: document.getElementById('edit-hazardous-desc')?.value || '',
            hazardousUN: document.getElementById('edit-hazardous-un')?.value || '',
            hazardousSDS: document.getElementById('edit-hazardous-sds')?.value || ''
        };

        // Validación rápida
        if (!payload.clientName) return authSystem?.showNotification?.('Nombre del cliente es obligatorio', 'error');
        if (!payload.address) return authSystem?.showNotification?.('Dirección obligatoria', 'error');
        if (!payload.requestedDate) return authSystem?.showNotification?.('Fecha solicitada obligatoria', 'error');
        if (payload.preferredTime === 'specific' && !payload.specificTime) {
            return authSystem?.showNotification?.('Debe indicar la hora específica', 'error');
        }
        if (payload.wasteType === 'Peligroso' && !payload.hazardousDesc) {
            return authSystem?.showNotification?.('Descripción de peligroso es obligatoria', 'error');
        }

        this.services[idx] = { ...s, ...payload };
        this.saveServices();
        authSystem?.showNotification?.('Servicio actualizado', 'success');
        this.viewService(id);
    },

    // ========== PROGRAMAR ==========
    scheduleService(id) {
        const s = this.services.find(x => x.id === id);
        if (!s) return;
        const contentArea = document.getElementById('content-area');

        contentArea.innerHTML = `
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-gray-800">Programar Servicio #${String(s.id).padStart(3,'0')}</h1>
                <p class="text-gray-600">Configura la fecha y hora para la recolección</p>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <div class="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400">
                    <p class="text-sm text-blue-700">
                        <strong>Cliente:</strong> ${s.clientName}<br>
                        <strong>Tipo:</strong> ${s.wasteType} — <strong>Volumen:</strong> ${s.estimatedVolume} ${s.volumeUnit || 'm³'}
                    </p>
                </div>

                <form id="schedule-service-form" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Fecha de Recolección *</label>
                            <input type="date" id="collection-date" required class="w-full px-3 py-2 border rounded-lg" min="${new Date().toISOString().split('T')[0]}">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Hora de Recolección *</label>
                            <input type="time" id="collection-time" required class="w-full px-3 py-2 border rounded-lg" value="08:00">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Duración Estimada (horas)</label>
                            <input type="number" id="estimated-duration" min="0.5" max="8" step="0.5" class="w-full px-3 py-2 border rounded-lg" value="2">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Equipo Requerido</label>
                            <select id="equipment-required" class="w-full px-3 py-2 border rounded-lg">
                                <option value="Camión estándar">Camión estándar</option>
                                <option value="Camión compactador">Camión compactador</option>
                                <option value="Camión con grúa">Camión con grúa</option>
                                <option value="Camión especializado">Camión especializado</option>
                                <option value="Múltiples equipos">Múltiples equipos</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Personal Requerido</label>
                            <select id="personnel-required" class="w-full px-3 py-2 border rounded-lg">
                                <option value="1 operador">1 operador</option>
                                <option value="1 operador + 1 ayudante">1 operador + 1 ayudante</option>
                                <option value="1 operador + 2 ayudantes">1 operador + 2 ayudantes</option>
                                <option value="Equipo especializado">Equipo especializado</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Prioridad de Programación</label>
                            <select id="schedule-priority" class="w-full px-3 py-2 border rounded-lg">
                                <option value="Normal">Normal</option>
                                <option value="Alta">Alta</option>
                                <option value="Urgente">Urgente</option>
                            </select>
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Instrucciones Especiales</label>
                            <textarea id="special-instructions" rows="4" class="w-full px-3 py-2 border rounded-lg" placeholder="Accesos, horarios de carga, etc."></textarea>
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Notas de Programación</label>
                            <textarea id="schedule-notes" rows="3" class="w-full px-3 py-2 border rounded-lg"></textarea>
                        </div>
                    </div>

                    <div class="flex justify-end space-x-4 pt-6 border-t">
                        <button type="button" onclick="${(app?.currentUser?.type === 'client') ? "app.loadModule('my-services')" : `servicesModule.viewService(${s.id})`}" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancelar</button>
                        <button type="submit" class="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                            <i class="fas fa-calendar-check mr-2"></i>Confirmar Programación
                        </button>
                    </div>
                </form>
            </div>
        `;

        const form = document.getElementById('schedule-service-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveScheduledService(id);
        });
    },

    saveScheduledService(id) {
        const idx = this.services.findIndex(x => x.id === id);
        if (idx === -1) return;

        const scheduleData = {
            collectionDate: document.getElementById('collection-date').value,
            collectionTime: document.getElementById('collection-time').value,
            estimatedDuration: document.getElementById('estimated-duration').value,
            equipmentRequired: document.getElementById('equipment-required').value,
            personnelRequired: document.getElementById('personnel-required').value,
            schedulePriority: document.getElementById('schedule-priority').value,
            specialInstructions: document.getElementById('special-instructions').value,
            scheduleNotes: document.getElementById('schedule-notes').value,
            scheduledAt: new Date().toISOString(),
            scheduledBy: app?.currentUser?.id || 'admin'
        };

        this.services[idx] = { ...this.services[idx], status: 'Programado', schedule: scheduleData };
        this.saveServices();
        authSystem?.showNotification?.('Servicio programado exitosamente', 'success');
        this.viewService(id);
    },

    // ========== ELIMINAR ==========
    deleteService(id) {
        const s = this.services.find(x => x.id === id);
        if (!s) return;

        const modalHTML = `
            <div id="delete-confirmation-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                    <div class="mt-3 text-center">
                        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                            <i class="fas fa-exclamation-triangle text-red-600 text-xl"></i>
                        </div>
                        <h3 class="text-lg font-medium text-gray-900 mt-4">Confirmar Eliminación</h3>
                        <div class="mt-2 px-7 py-3">
                            <p class="text-sm text-gray-500">¿Eliminar la solicitud #${String(s.id).padStart(3,'0')}?</p>
                            <div class="mt-3 p-3 bg-gray-50 rounded-lg text-left">
                                <p class="text-sm font-medium text-gray-700">${s.clientName}</p>
                                <p class="text-sm text-gray-600">${s.wasteType} - ${s.estimatedVolume} ${s.volumeUnit || 'm³'}</p>
                            </div>
                            <p class="text-sm text-red-600 mt-2 font-medium">Esta acción no se puede deshacer.</p>
                        </div>
                        <div class="items-center px-4 py-3">
                            <div class="flex justify-center space-x-3">
                                <button id="cancel-delete" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">Cancelar</button>
                                <button id="confirm-delete" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                                    <i class="fas fa-trash mr-2"></i>Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modal = document.getElementById('delete-confirmation-modal');
        modal.querySelector('#cancel-delete').onclick = () => modal.remove();
        modal.querySelector('#confirm-delete').onclick = () => {
            this.services = this.services.filter(x => x.id !== id);
            this.saveServices();
            modal.remove();
            this.loadServicesTable();
            authSystem?.showNotification?.('Solicitud eliminada', 'success');
        };
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    },

    // ========== FILTROS ==========
    applyFilters() {
        const statusFilter = document.getElementById('status-filter').value;
        const wasteTypeFilter = document.getElementById('waste-type-filter').value;
        const dateFromFilter = document.getElementById('date-from-filter').value;
        const dateToFilter = document.getElementById('date-to-filter').value;

        let filtered = [...this.services];
        if (statusFilter) filtered = filtered.filter(s => s.status === statusFilter);
        if (wasteTypeFilter) filtered = filtered.filter(s => s.wasteType === wasteTypeFilter);
        if (dateFromFilter) filtered = filtered.filter(s => s.requestedDate >= dateFromFilter);
        if (dateToFilter) filtered = filtered.filter(s => s.requestedDate <= dateToFilter);

        this.displayFilteredServices(filtered);
        authSystem?.showNotification?.(`Se encontraron ${filtered.length} solicitudes`, 'info');
    },
    clearFilters() {
        document.getElementById('status-filter').value = '';
        document.getElementById('waste-type-filter').value = '';
        document.getElementById('date-from-filter').value = '';
        document.getElementById('date-to-filter').value = '';
        this.loadServicesTable();
        authSystem?.showNotification?.('Filtros limpiados', 'info');
    },
    displayFilteredServices(list) {
        const tbody = document.getElementById('services-table-body');
        tbody.innerHTML = list.map(service => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#${String(service.id).padStart(3,'0')}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                        <div class="text-sm font-medium text-gray-900">${service.clientName}</div>
                        <div class="text-sm text-gray-500">${service.address}</div>
                        <div class="text-xs text-gray-400">${service.clientEmail ?? ''}</div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs rounded-full ${this.getWasteTypeClass(service.wasteType)}">${service.wasteType}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${service.estimatedVolume} ${service.volumeUnit || 'm³'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${this.formatDate(service.requestedDate)}</td>
                <td class="px-6 py-4 whitespace-nowrap"><span class="px-2 py-1 text-xs rounded-full ${this.getStatusClass(service.status)}">${service.status}</span></td>
                <td class="px-6 py-4 whitespace-nowrap"><span class="px-2 py-1 text-xs rounded-full ${this.getPriorityClass(service.priority || 'Media')}">${service.priority || 'Media'}</span></td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                        <button onclick="servicesModule.viewService(${service.id})" class="text-blue-600 hover:text-blue-900" title="Ver"><i class="fas fa-eye"></i></button>
                        ${service.status === 'Pendiente de Aprobación' ? `
                            <button onclick="servicesModule.approveService(${service.id})" class="text-green-600 hover:text-green-900" title="Aprobar"><i class="fas fa-check"></i></button>
                            <button onclick="servicesModule.showRejectionModal(${service.id})" class="text-red-600 hover:text-red-900" title="Rechazar"><i class="fas fa-times"></i></button>
                        ` : `
                            <button onclick="servicesModule.editService(${service.id})" class="text-green-600 hover:text-green-900" title="Editar"><i class="fas fa-edit"></i></button>
                            <button onclick="servicesModule.scheduleService(${service.id})" class="text-yellow-600 hover:text-yellow-900" title="Programar"><i class="fas fa-calendar-plus"></i></button>
                        `}
                        <button onclick="servicesModule.deleteService(${service.id})" class="text-red-600 hover:text-red-900" title="Eliminar"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    // ========== UTILIDADES ==========
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
    },
    getStatusClass(status) {
        const classes = {
            'Pendiente': 'bg-yellow-100 text-yellow-800',
            'Pendiente de Aprobación': 'bg-yellow-100 text-yellow-800',
            'Aprobado': 'bg-blue-100 text-blue-800',
            'Rechazado': 'bg-red-100 text-red-800',
            'Programado': 'bg-blue-100 text-blue-800',
            'En Ruta': 'bg-cyan-100 text-cyan-800',
            'En Proceso': 'bg-orange-100 text-orange-800',
            'Recolectado': 'bg-purple-100 text-purple-800',
            'En Tránsito': 'bg-indigo-100 text-indigo-800',
            'Completado': 'bg-green-100 text-green-800',
            'Cancelado': 'bg-red-100 text-red-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    },
    getPriorityClass(priority) {
        const classes = {
            'Baja': 'bg-gray-100 text-gray-800',
            'Media': 'bg-yellow-100 text-yellow-800',
            'Alta': 'bg-orange-100 text-orange-800',
            'Urgente': 'bg-red-100 text-red-800'
        };
        return classes[priority] || 'bg-gray-100 text-gray-800';
    },
    formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    },
    formatPreferredTime(preferredTime, specificTime) {
        if (!preferredTime) return 'Sin preferencia';
        if (preferredTime === 'morning') return 'Mañana (8:00 - 12:00)';
        if (preferredTime === 'afternoon') return 'Tarde (12:00 - 18:00)';
        if (preferredTime === 'specific' && specificTime) return `Hora específica: ${specificTime}`;
        return 'Hora específica';
    },
    generateServiceId() {
        return this.services.length > 0 ? Math.max(...this.services.map(s => s.id)) + 1 : 1;
    },

    // ========== GESTIÓN DE ESTADOS PARA OPERADORES ==========
    
    // Cambiar estado de un servicio (para operadores en campo)
    updateServiceStatus(serviceId, newStatus, additionalData = {}) {
        const serviceIndex = this.services.findIndex(s => s.id === serviceId);
        if (serviceIndex === -1) {
            throw new Error('Servicio no encontrado');
        }

        const service = this.services[serviceIndex];
        const currentUser = app?.currentUser;
        
        // Validar que el operador puede cambiar este estado
        if (currentUser?.type === 'operator' && !this.canOperatorChangeStatus(service, newStatus)) {
            throw new Error('No tienes permisos para cambiar a este estado');
        }

        // Actualizar estado y metadata
        service.status = newStatus;
        service.lastStatusUpdate = new Date().toISOString();
        service.lastUpdatedBy = currentUser?.name || 'Sistema';

        // Agregar datos específicos según el estado
        switch (newStatus) {
            case 'En Ruta':
                service.startedRoute = new Date().toISOString();
                service.operatorId = currentUser?.id;
                break;
            case 'En Proceso':
                service.arrivedAt = new Date().toISOString();
                service.checkInLocation = additionalData.location;
                break;
            case 'Recolectado':
                service.collectedAt = new Date().toISOString();
                service.actualWeight = additionalData.weight;
                service.actualVolume = additionalData.volume;
                service.collectionNotes = additionalData.notes;
                service.clientSignature = additionalData.signature;
                service.evidencePhotos = additionalData.photos;
                break;
            case 'En Tránsito':
                service.departedAt = new Date().toISOString();
                service.destinationPlant = additionalData.plant;
                break;
            case 'Completado':
                service.completedAt = new Date().toISOString();
                service.finalDisposition = additionalData.disposition;
                break;
        }

        // Guardar cambios
        this.saveServices();
        
        return service;
    },

    // Verificar si un operador puede cambiar a un estado específico
    canOperatorChangeStatus(service, newStatus) {
        const currentStatus = service.status;
        
        // Transiciones permitidas para operadores
        const allowedTransitions = {
            'Programado': ['En Ruta'],
            'En Ruta': ['En Proceso'],
            'En Proceso': ['Recolectado'],
            'Recolectado': ['En Tránsito'],
            'En Tránsito': ['Completado']
        };

        return allowedTransitions[currentStatus]?.includes(newStatus) || false;
    },

    // Función auxiliar para operadores: marcar servicio como "En Ruta"
    startServiceCollection(serviceId) {
        try {
            const service = this.updateServiceStatus(serviceId, 'En Ruta');
            authSystem?.showNotification?.(`Servicio #${String(serviceId).padStart(3, '0')} marcado como "En Ruta"`, 'success');
            return service;
        } catch (error) {
            authSystem?.showNotification?.(error.message, 'error');
            throw error;
        }
    },

    // Función auxiliar para operadores: marcar llegada al punto
    checkInAtService(serviceId, location = null) {
        try {
            const additionalData = {};
            if (location) {
                additionalData.location = location;
            }
            
            const service = this.updateServiceStatus(serviceId, 'En Proceso', additionalData);
            authSystem?.showNotification?.(`Check-in registrado en servicio #${String(serviceId).padStart(3, '0')}`, 'success');
            return service;
        } catch (error) {
            authSystem?.showNotification?.(error.message, 'error');
            throw error;
        }
    },

    // Función auxiliar para operadores: completar recolección
    completeCollection(serviceId, collectionData) {
        try {
            const service = this.updateServiceStatus(serviceId, 'Recolectado', collectionData);
            authSystem?.showNotification?.(`Recolección completada para servicio #${String(serviceId).padStart(3, '0')}`, 'success');
            return service;
        } catch (error) {
            authSystem?.showNotification?.(error.message, 'error');
            throw error;
        }
    },

    // Obtener servicios asignados a un operador específico
    getOperatorServices(operatorId) {
        return this.services.filter(service => 
            service.assignedOperator === operatorId || 
            service.operatorId === operatorId ||
            service.createdBy === operatorId
        );
    },

    // Obtener servicios en estados activos para un operador
    getActiveOperatorServices(operatorId) {
        const activeStatuses = ['Programado', 'En Ruta', 'En Proceso', 'Recolectado', 'En Tránsito'];
        return this.getOperatorServices(operatorId).filter(service => 
            activeStatuses.includes(service.status)
        );
    }
};

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', function() {
    servicesModule.init();
});
