window.servicesModule = {
    services: [
        {
            id: 1,
            clientName: 'Empresa ABC S.A.',
            address: 'Av. Principal 123, Zona Norte',
            wasteType: 'Orgánico',
            estimatedVolume: '2.5',
            requestedDate: '2024-01-16',
            status: 'Pendiente',
            priority: 'Media',
            createdDate: '2024-01-15'
        },
        {
            id: 2,
            clientName: 'Industrias XYZ',
            address: 'Calle Secundaria 456, Centro',
            wasteType: 'Reciclable',
            estimatedVolume: '5.0',
            requestedDate: '2024-01-17',
            status: 'Programado',
            priority: 'Alta',
            createdDate: '2024-01-14'
        }
    ],

    load() {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="mb-6">
                <div class="flex justify-between items-center">
                    <h1 class="text-3xl font-bold text-gray-800">Gestión de Solicitudes</h1>
                    <button onclick="servicesModule.showNewServiceModal()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                        <i class="fas fa-plus mr-2"></i>Nueva Solicitud
                    </button>
                </div>
                <p class="text-gray-600">Administra las solicitudes de recolección de residuos</p>
            </div>

            <!-- Filters -->
            <div class="bg-white p-4 rounded-lg shadow mb-6">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                        <select id="status-filter" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                            <option value="">Todos</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="Programado">Programado</option>
                            <option value="En Proceso">En Proceso</option>
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

            <!-- Services Table -->
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
                        <tbody class="divide-y divide-gray-200" id="services-table-body">
                            <!-- Services will be loaded here -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        this.loadServicesTable();
    },

    loadNewService() {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-gray-800">Nueva Solicitud de Servicio</h1>
                <p class="text-gray-600">Ingresa los detalles para la nueva solicitud de recolección</p>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <form id="new-service-form" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Nombre del Cliente *
                            </label>
                            <input type="text" id="client-name" required 
                                   class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                   placeholder="Nombre de la empresa o persona">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Teléfono de Contacto *
                            </label>
                            <input type="tel" id="client-phone" required 
                                   class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                   placeholder="(555) 123-4567">
                        </div>

                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Dirección Completa *
                            </label>
                            <textarea id="client-address" required rows="3"
                                      class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                      placeholder="Dirección completa con referencias"></textarea>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de Residuo *
                            </label>
                            <select id="waste-type" required 
                                    class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
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
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Volumen Estimado *
                            </label>
                            <div class="flex">
                                <input type="number" id="estimated-volume" required step="0.1" min="0"
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
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Fecha Solicitada *
                            </label>
                            <input type="date" id="requested-date" required 
                                   class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Hora Preferida
                            </label>
                            <select id="preferred-time" 
                                    class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                <option value="">Sin preferencia</option>
                                <option value="morning">Mañana (8:00 AM - 12:00 PM)</option>
                                <option value="afternoon">Tarde (12:00 PM - 6:00 PM)</option>
                                <option value="specific">Hora específica</option>
                            </select>
                        </div>

                        <div id="specific-time-container" class="hidden">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Hora Específica
                            </label>
                            <input type="time" id="specific-time" 
                                   class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Prioridad
                            </label>
                            <select id="priority" 
                                    class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                <option value="Baja">Baja</option>
                                <option value="Media" selected>Media</option>
                                <option value="Alta">Alta</option>
                                <option value="Urgente">Urgente</option>
                            </select>
                        </div>

                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Observaciones Adicionales
                            </label>
                            <textarea id="additional-notes" rows="4"
                                      class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                      placeholder="Información adicional, instrucciones especiales, etc."></textarea>
                        </div>

                        <div class="md:col-span-2">
                            <div class="bg-blue-50 border-l-4 border-blue-400 p-4">
                                <div class="flex">
                                    <div class="flex-shrink-0">
                                        <i class="fas fa-info-circle text-blue-400"></i>
                                    </div>
                                    <div class="ml-3">
                                        <p class="text-sm text-blue-700">
                                            <strong>Nota:</strong> Las solicitudes se procesan en orden de llegada. Para residuos peligrosos, 
                                            se requiere información adicional sobre el tipo específico de material.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-end space-x-4 pt-6 border-t">
                        <button type="button" onclick="app.loadModule('dashboard')" 
                                class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button type="submit" 
                                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <i class="fas fa-save mr-2"></i>Guardar Solicitud
                        </button>
                    </div>
                </form>
            </div>
        `;

        this.initNewServiceForm();
    },

    initNewServiceForm() {
        const form = document.getElementById('new-service-form');
        const preferredTimeSelect = document.getElementById('preferred-time');
        const specificTimeContainer = document.getElementById('specific-time-container');

        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('requested-date').min = today;

        // Handle specific time selection
        preferredTimeSelect.addEventListener('change', function() {
            if (this.value === 'specific') {
                specificTimeContainer.classList.remove('hidden');
            } else {
                specificTimeContainer.classList.add('hidden');
            }
        });

        // Handle form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveNewService();
        });
    },

    saveNewService() {
        const formData = {
            clientName: document.getElementById('client-name').value,
            clientPhone: document.getElementById('client-phone').value,
            address: document.getElementById('client-address').value,
            wasteType: document.getElementById('waste-type').value,
            estimatedVolume: document.getElementById('estimated-volume').value,
            volumeUnit: document.getElementById('volume-unit').value,
            requestedDate: document.getElementById('requested-date').value,
            preferredTime: document.getElementById('preferred-time').value,
            specificTime: document.getElementById('specific-time').value,
            priority: document.getElementById('priority').value,
            additionalNotes: document.getElementById('additional-notes').value,
            status: 'Pendiente',
            createdDate: new Date().toISOString().split('T')[0]
        };

        // Generate new ID
        const newId = this.services.length > 0 ? Math.max(...this.services.map(s => s.id)) + 1 : 1;
        
        const newService = {
            id: newId,
            ...formData
        };

        this.services.push(newService);

        // Show success message
        authSystem.showNotification('Solicitud creada exitosamente', 'success');

        // Redirect to services list
        app.loadModule('services');
    },

    loadServicesTable() {
        const tbody = document.getElementById('services-table-body');
        
        tbody.innerHTML = this.services.map(service => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #${service.id.toString().padStart(3, '0')}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                        <div class="text-sm font-medium text-gray-900">${service.clientName}</div>
                        <div class="text-sm text-gray-500">${service.address}</div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs rounded-full ${this.getWasteTypeClass(service.wasteType)}">
                        ${service.wasteType}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${service.estimatedVolume} m³
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
                    <span class="px-2 py-1 text-xs rounded-full ${this.getPriorityClass(service.priority)}">
                        ${service.priority}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                        <button onclick="servicesModule.viewService(${service.id})" 
                                class="text-blue-600 hover:text-blue-900" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="servicesModule.editService(${service.id})" 
                                class="text-green-600 hover:text-green-900" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="servicesModule.scheduleService(${service.id})" 
                                class="text-yellow-600 hover:text-yellow-900" title="Programar">
                            <i class="fas fa-calendar-plus"></i>
                        </button>
                        <button onclick="servicesModule.deleteService(${service.id})" 
                                class="text-red-600 hover:text-red-900" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

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
            'Programado': 'bg-blue-100 text-blue-800',
            'En Proceso': 'bg-orange-100 text-orange-800',
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

    viewService(id) {
        const service = this.services.find(s => s.id === id);
        if (!service) return;

        // TODO: Implement service detail view
        authSystem.showNotification('Función de visualización en desarrollo', 'info');
    },

    editService(id) {
        const service = this.services.find(s => s.id === id);
        if (!service) return;

        // TODO: Implement service editing
        authSystem.showNotification('Función de edición en desarrollo', 'info');
    },

    scheduleService(id) {
        const service = this.services.find(s => s.id === id);
        if (!service) return;

        service.status = 'Programado';
        this.loadServicesTable();
        authSystem.showNotification('Servicio programado exitosamente', 'success');
    },

    deleteService(id) {
        if (confirm('¿Está seguro de que desea eliminar esta solicitud?')) {
            this.services = this.services.filter(s => s.id !== id);
            this.loadServicesTable();
            authSystem.showNotification('Solicitud eliminada', 'success');
        }
    },

    applyFilters() {
        // TODO: Implement filtering logic
        authSystem.showNotification('Filtros aplicados', 'info');
    },

    clearFilters() {
        document.getElementById('status-filter').value = '';
        document.getElementById('waste-type-filter').value = '';
        document.getElementById('date-from-filter').value = '';
        document.getElementById('date-to-filter').value = '';
        this.loadServicesTable();
        authSystem.showNotification('Filtros limpiados', 'info');
    }
};