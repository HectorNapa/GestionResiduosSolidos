window.servicesModule = {
    services: [],

    // Inicializar el módulo y cargar datos guardados
    init() {
        this.loadSavedServices();
    },

    // Cargar servicios guardados en localStorage
    loadSavedServices() {
        try {
            const savedServices = localStorage.getItem('ecogestion_services');
            if (savedServices) {
                this.services = JSON.parse(savedServices);
            } else {
                // Si no hay datos guardados, usar datos por defecto
                this.services = [
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
                ];
                this.saveServices();
            }
        } catch (error) {
            console.error('Error al cargar servicios guardados:', error);
            // En caso de error, usar datos por defecto
            this.services = [];
        }
    },

    // Guardar servicios en localStorage
    saveServices() {
        try {
            localStorage.setItem('ecogestion_services', JSON.stringify(this.services));
        } catch (error) {
            console.error('Error al guardar servicios:', error);
        }
    },

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

            <!-- Filters -->
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
        const currentUser = app.currentUser;
        
        contentArea.innerHTML = `
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-gray-800">Nueva Solicitud de Servicio</h1>
                <p class="text-gray-600">Ingresa los detalles para la nueva solicitud de recolección</p>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <form id="new-service-form" class="space-y-6">
                        <!-- Información del Cliente (Pre-llenada para clientes) -->
                        <div class="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
                            <div class="flex">
                                <div class="flex-shrink-0">
                                    <i class="fas fa-user-check text-green-400"></i>
                                </div>
                                <div class="ml-3">
                                    <p class="text-sm text-green-700">
                                        <strong>Cliente:</strong> ${currentUser.name} (${currentUser.email})
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre del Cliente
                                </label>
                                <input type="text" id="client-name" readonly 
                                       class="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-600"
                                       value="${currentUser.name}">
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Teléfono de Contacto
                                </label>
                                <input type="tel" id="client-phone" readonly 
                                       class="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-600"
                                       value="${currentUser.phone || ''}">
                            </div>

                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Dirección Completa
                                </label>
                                <textarea id="client-address" readonly rows="3"
                                          class="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-600">${currentUser.address || ''}</textarea>
                            </div>
                        </div>

                    <!-- Información del Servicio -->
                    <div class="md:col-span-2">
                        <h3 class="text-lg font-semibold text-gray-800 border-b pb-2 mt-6">Detalles del Servicio</h3>
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

                    <div class="flex justify-end space-x-4 pt-6 border-t">
                        <button type="button" onclick="app.loadModule('services')"
                                class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button type="submit" 
                                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <i class="fas fa-save mr-2"></i>Crear Solicitud
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
        const currentUser = app.currentUser;
        
        let formData = {
            clientEmail: currentUser.email,
            clientCedula: currentUser.cedula || '',
            clientName: currentUser.name,
            clientPhone: currentUser.phone || '',
            address: currentUser.address || '',
            wasteType: document.getElementById('waste-type').value,
            estimatedVolume: document.getElementById('estimated-volume').value,
            volumeUnit: document.getElementById('volume-unit').value,
            requestedDate: document.getElementById('requested-date').value,
            preferredTime: document.getElementById('preferred-time').value,
            specificTime: document.getElementById('specific-time').value,
            priority: document.getElementById('priority').value,
            additionalNotes: document.getElementById('additional-notes').value,
            status: 'Pendiente de Aprobación',
            createdDate: new Date().toISOString().split('T')[0],
            createdBy: currentUser.id
        };

        this.createService(formData);
    },

    createService(formData) {
        const newService = {
            id: this.generateServiceId(),
            clientId: app.currentUser.id,
            clientName: formData.clientName,
            clientEmail: formData.clientEmail,
            clientPhone: formData.clientPhone,
            address: formData.address,
            wasteType: formData.wasteType,
            estimatedVolume: formData.estimatedVolume,
            volumeUnit: formData.volumeUnit,
            requestedDate: formData.requestedDate,
            preferredTime: formData.preferredTime,
            specificTime: formData.specificTime,
            priority: formData.priority,
            additionalNotes: formData.additionalNotes,
            status: formData.status,
            createdDate: formData.createdDate,
            createdBy: formData.createdBy
        };

        this.services.push(newService);
        this.saveServices();

        // Mostrar mensaje de éxito
        authSystem.showNotification('Solicitud creada exitosamente', 'success');

        // Redirigir a la vista de cliente
        this.loadClientView();
    },

    // Aprobar solicitud
    approveService(serviceId) {
        const service = this.services.find(s => s.id === serviceId);
        if (!service) {
            authSystem.showNotification('Servicio no encontrado', 'error');
            return;
        }

        service.status = 'Aprobado';
        service.approvedDate = new Date().toISOString().split('T')[0];
        service.approvedBy = app.currentUser ? app.currentUser.id : 'admin';
        
        this.saveServices();
        
        // Notificar al cliente
        this.notifyClientServiceApproved(service);
        
        // Mostrar mensaje de éxito
        authSystem.showNotification('Solicitud aprobada exitosamente', 'success');
        
        // Recargar la tabla
        this.loadServicesTable();
    },

    // Rechazar solicitud
    rejectService(serviceId, rejectionMessage = '') {
        const service = this.services.find(s => s.id === serviceId);
        if (!service) {
            authSystem.showNotification('Servicio no encontrado', 'error');
            return;
        }

        service.status = 'Rechazado';
        service.rejectedDate = new Date().toISOString().split('T')[0];
        service.rejectedBy = app.currentUser ? app.currentUser.id : 'admin';
        service.rejectionMessage = rejectionMessage;
        
        this.saveServices();
        
        // Notificar al cliente
        this.notifyClientServiceRejected(service, rejectionMessage);
        
        // Mostrar mensaje de éxito
        authSystem.showNotification('Solicitud rechazada', 'warning');
        
        // Recargar la tabla
        this.loadServicesTable();
    },

    // Mostrar modal de rechazo
    showRejectionModal(serviceId) {
        const service = this.services.find(s => s.id === serviceId);
        if (!service) return;

        const modalHTML = `
            <div id="rejection-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 w-96 max-w-md">
                    <div class="flex items-center mb-4">
                        <i class="fas fa-exclamation-triangle text-red-500 text-2xl mr-3"></i>
                        <h3 class="text-lg font-semibold text-gray-900">Rechazar Solicitud</h3>
                    </div>
                    
                    <div class="mb-4">
                        <p class="text-gray-700 mb-2">¿Estás seguro de que quieres rechazar esta solicitud?</p>
                        <div class="bg-gray-50 p-3 rounded border">
                            <p class="text-sm text-gray-600"><strong>Cliente:</strong> ${service.clientName}</p>
                            <p class="text-sm text-gray-600"><strong>Servicio:</strong> ${service.wasteType}</p>
                            <p class="text-sm text-gray-600"><strong>Fecha:</strong> ${service.requestedDate}</p>
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Mensaje de rechazo (opcional)
                        </label>
                        <textarea id="rejection-message" 
                                  class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-red-500"
                                  rows="3"
                                  placeholder="Explica por qué se rechaza la solicitud..."></textarea>
                    </div>
                    
                    <div class="flex justify-end space-x-3">
                        <button id="cancel-rejection" 
                                class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button id="confirm-rejection" 
                                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                            Rechazar
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Insertar modal en el DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Event listeners
        const modal = document.getElementById('rejection-modal');
        const cancelBtn = document.getElementById('cancel-rejection');
        const confirmBtn = document.getElementById('confirm-rejection');
        const messageInput = document.getElementById('rejection-message');

        // Cancelar
        cancelBtn.addEventListener('click', () => {
            modal.remove();
        });

        // Confirmar rechazo
        confirmBtn.addEventListener('click', () => {
            const message = messageInput.value.trim();
            this.rejectService(serviceId, message);
            modal.remove();
        });

        // Cerrar al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Cerrar con Escape
        document.addEventListener('keydown', function closeOnEscape(e) {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', closeOnEscape);
            }
        });
    },

    // Notificar al cliente que su solicitud fue aprobada
    notifyClientServiceApproved(service) {
        const message = `¡Excelente! Tu solicitud de servicio ha sido APROBADA.

📋 Detalles del servicio:
• Tipo: ${service.wasteType}
• Fecha solicitada: ${service.requestedDate}
• Estado: Aprobado

Nos pondremos en contacto contigo pronto para coordinar la recolección.

¡Gracias por confiar en EcoGestión! 🌱`;

        // Para pruebas, mostrar en consola
        console.log('Notificación para cliente (APROBADO):', message);
        
        // Aquí se podría implementar envío de email o WhatsApp real
        // Por ahora solo se muestra en consola
    },

    // Notificar al cliente que su solicitud fue rechazada
    notifyClientServiceRejected(service, rejectionMessage) {
        let message = `Tu solicitud de servicio ha sido RECHAZADA.

📋 Detalles del servicio:
• Tipo: ${service.wasteType}
• Fecha solicitada: ${service.requestedDate}
• Estado: Rechazado`;

        if (rejectionMessage) {
            message += `

📝 Motivo del rechazo:
${rejectionMessage}`;
        }

        message += `

💡 Puedes editar tu solicitud y volver a enviarla desde tu cuenta.

¡Gracias por tu comprensión! 🌱`;

        // Para pruebas, mostrar en consola
        console.log('Notificación para cliente (RECHAZADO):', message);
        
        // Aquí se podría implementar envío de email o WhatsApp real
        // Por ahora solo se muestra en consola
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
            'Cancelado': 'bg-red-100 text-red-800',
            'Pendiente de Aprobación': 'bg-yellow-100 text-yellow-800'
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

        const currentUser = app.currentUser;
        const isClient = currentUser && currentUser.type === 'client';
        const isAdmin = currentUser && currentUser.type === 'admin';

        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="mb-6">
                <div class="flex justify-between items-center">
                    <h1 class="text-3xl font-bold text-gray-800">Detalles del Servicio #${service.id.toString().padStart(3, '0')}</h1>
                    <button onclick="${isClient ? 'servicesModule.loadClientView()' : 'servicesModule.load()'}" class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center">
                        <i class="fas fa-arrow-left mr-2"></i>Volver
                    </button>
                </div>
                <p class="text-gray-600">Información completa de la solicitud de servicio</p>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Información del Cliente -->
                    <div class="space-y-4">
                        <h3 class="text-lg font-semibold text-gray-800 border-b pb-2">Información del Cliente</h3>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Nombre del Cliente</label>
                            <p class="text-sm text-gray-900 mt-1">${service.clientName}</p>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Email</label>
                            <p class="text-sm text-gray-900 mt-1">${service.clientEmail || 'No especificado'}</p>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Teléfono</label>
                            <p class="text-sm text-gray-900 mt-1">${service.clientPhone || 'No especificado'}</p>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Dirección</label>
                            <p class="text-sm text-gray-900 mt-1">${service.address}</p>
                        </div>
                    </div>

                    <!-- Detalles del Servicio -->
                    <div class="space-y-4">
                        <h3 class="text-lg font-semibold text-gray-800 border-b pb-2">Detalles del Servicio</h3>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Tipo de Residuo</label>
                            <span class="inline-block px-2 py-1 text-xs rounded-full mt-1 ${this.getWasteTypeClass(service.wasteType)}">
                                ${service.wasteType}
                            </span>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Volumen Estimado</label>
                            <p class="text-sm text-gray-900 mt-1">${service.estimatedVolume} ${service.volumeUnit || 'm³'}</p>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Fecha Solicitada</label>
                            <p class="text-sm text-gray-900 mt-1">${this.formatDate(service.requestedDate)}</p>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Hora Preferida</label>
                            <p class="text-sm text-gray-900 mt-1">${this.formatPreferredTime(service.preferredTime, service.specificTime)}</p>
                        </div>
                    </div>

                    <!-- Estado y Prioridad -->
                    <div class="space-y-4">
                        <h3 class="text-lg font-semibold text-gray-800 border-b pb-2">Estado y Prioridad</h3>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Estado Actual</label>
                            <span class="inline-block px-2 py-1 text-xs rounded-full mt-1 ${this.getStatusClass(service.status)}">
                                ${service.status}
                            </span>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Prioridad</label>
                            <span class="inline-block px-2 py-1 text-xs rounded-full mt-1 ${this.getPriorityClass(service.priority)}">
                                ${service.priority}
                            </span>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Fecha de Creación</label>
                            <p class="text-sm text-gray-900 mt-1">${this.formatDate(service.createdDate)}</p>
                        </div>

                        ${service.approvedDate ? `
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Fecha de Aprobación</label>
                                <p class="text-sm text-green-600 mt-1">${this.formatDate(service.approvedDate)}</p>
                            </div>
                        ` : ''}

                        ${service.rejectedDate ? `
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Fecha de Rechazo</label>
                                <p class="text-sm text-red-600 mt-1">${this.formatDate(service.rejectedDate)}</p>
                            </div>
                        ` : ''}

                        ${service.revisedDate ? `
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Fecha de Revisión</label>
                                <p class="text-sm text-blue-600 mt-1">${this.formatDate(service.revisedDate)}</p>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Observaciones y Mensajes -->
                    <div class="space-y-4">
                        <h3 class="text-lg font-semibold text-gray-800 border-b pb-2">Observaciones y Mensajes</h3>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Notas Adicionales</label>
                            <p class="text-sm text-gray-900 mt-1">${service.additionalNotes || 'Sin observaciones adicionales'}</p>
                        </div>

                        ${service.rejectionMessage ? `
                            <div>
                                <label class="block text-sm font-medium text-red-700">Motivo del Rechazo</label>
                                <p class="text-sm text-red-600 mt-1">${service.rejectionMessage}</p>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Acciones -->
                <div class="mt-8 pt-6 border-t border-gray-200">
                    <div class="flex justify-between items-center">
                        <div class="flex space-x-3">
                            ${isAdmin && service.status === 'Pendiente de Aprobación' ? `
                                <button onclick="servicesModule.approveService(${service.id})" 
                                        class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
                                    <i class="fas fa-check mr-2"></i>Aprobar
                                </button>
                                <button onclick="servicesModule.showRejectionModal(${service.id})" 
                                        class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center">
                                    <i class="fas fa-times mr-2"></i>Rechazar
                                </button>
                            ` : ''}

                            ${isClient && service.status === 'Rechazado' ? `
                                <button onclick="servicesModule.editService(${service.id})" 
                                        class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
                                    <i class="fas fa-edit mr-2"></i>Editar y Reenviar
                                </button>
                            ` : ''}

                            ${isClient && service.status === 'Pendiente de Aprobación' ? `
                                <button onclick="servicesModule.editService(${service.id})" 
                                        class="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center">
                                    <i class="fas fa-edit mr-2"></i>Editar
                                </button>
                            ` : ''}

                            ${isAdmin && service.status !== 'Pendiente de Aprobación' ? `
                                <button onclick="servicesModule.editService(${service.id})" 
                                        class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
                                    <i class="fas fa-edit mr-2"></i>Editar
                                </button>
                                <button onclick="servicesModule.scheduleService(${service.id})" 
                                        class="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center">
                                    <i class="fas fa-calendar-plus mr-2"></i>Programar
                                </button>
                            ` : ''}
                        </div>
                        
                        ${isAdmin ? `
                            <button onclick="servicesModule.deleteService(${service.id})" 
                                    class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center">
                                <i class="fas fa-trash mr-2"></i>Eliminar
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    },

    editService(id) {
        const service = this.services.find(s => s.id === id);
        if (!service) return;

        const currentUser = app.currentUser;
        const isClient = currentUser && currentUser.type === 'client';
        const isAdmin = currentUser && currentUser.type === 'admin';

        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-gray-800">Editar Servicio #${service.id.toString().padStart(3, '0')}</h1>
                <p class="text-gray-600">Modifica los detalles de la solicitud de recolección</p>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <form id="edit-service-form" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Nombre del Cliente *
                            </label>
                            <input type="text" id="edit-client-name" required 
                                   class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                   value="${service.clientName}" ${isClient ? 'readonly' : ''}>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Teléfono de Contacto *
                            </label>
                            <input type="tel" id="edit-client-phone" required 
                                   class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                   value="${service.clientPhone || ''}" ${isClient ? 'readonly' : ''}>
                        </div>

                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Dirección Completa *
                            </label>
                            <textarea id="edit-client-address" required rows="3"
                                      class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                      ${isClient ? 'readonly' : ''}>${service.address}</textarea>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de Residuo *
                            </label>
                            <select id="edit-waste-type" required 
                                    class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                <option value="Orgánico" ${service.wasteType === 'Orgánico' ? 'selected' : ''}>Orgánico</option>
                                <option value="Reciclable" ${service.wasteType === 'Reciclable' ? 'selected' : ''}>Reciclable (Papel, Cartón, Plástico, Metal)</option>
                                <option value="No Reciclable" ${service.wasteType === 'No Reciclable' ? 'selected' : ''}>No Reciclable</option>
                                <option value="Peligroso" ${service.wasteType === 'Peligroso' ? 'selected' : ''}>Peligroso (Químicos, Baterías, etc.)</option>
                                <option value="Electrónicos" ${service.wasteType === 'Electrónicos' ? 'selected' : ''}>Residuos Electrónicos</option>
                                <option value="Construcción" ${service.wasteType === 'Construcción' ? 'selected' : ''}>Residuos de Construcción</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Volumen Estimado *
                            </label>
                            <div class="flex">
                                <input type="number" id="edit-estimated-volume" required step="0.1" min="0"
                                       class="flex-1 px-3 py-2 border rounded-l-lg focus:outline-none focus:border-blue-500"
                                       value="${service.estimatedVolume}">
                                <select id="edit-volume-unit" class="px-3 py-2 border-l-0 border rounded-r-lg focus:outline-none focus:border-blue-500">
                                    <option value="m3" ${(service.volumeUnit || 'm3') === 'm3' ? 'selected' : ''}>m³</option>
                                    <option value="kg" ${service.volumeUnit === 'kg' ? 'selected' : ''}>kg</option>
                                    <option value="ton" ${service.volumeUnit === 'ton' ? 'selected' : ''}>Toneladas</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Fecha Solicitada *
                            </label>
                            <input type="date" id="edit-requested-date" required 
                                   class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                   value="${service.requestedDate}">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Hora Preferida
                            </label>
                            <select id="edit-preferred-time" 
                                    class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                <option value="" ${!service.preferredTime ? 'selected' : ''}>Sin preferencia</option>
                                <option value="morning" ${service.preferredTime === 'morning' ? 'selected' : ''}>Mañana (8:00 AM - 12:00 PM)</option>
                                <option value="afternoon" ${service.preferredTime === 'afternoon' ? 'selected' : ''}>Tarde (12:00 PM - 6:00 PM)</option>
                                <option value="specific" ${service.preferredTime === 'specific' ? 'selected' : ''}>Hora específica</option>
                            </select>
                        </div>

                        <div id="edit-specific-time-container" class="${service.preferredTime === 'specific' ? '' : 'hidden'}">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Hora Específica
                            </label>
                            <input type="time" id="edit-specific-time" 
                                   class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                   value="${service.specificTime || ''}">
                        </div>

                        ${isAdmin ? `
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Estado
                                </label>
                                <select id="edit-status" 
                                        class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                    <option value="Pendiente de Aprobación" ${service.status === 'Pendiente de Aprobación' ? 'selected' : ''}>Pendiente de Aprobación</option>
                                    <option value="Aprobado" ${service.status === 'Aprobado' ? 'selected' : ''}>Aprobado</option>
                                    <option value="Rechazado" ${service.status === 'Rechazado' ? 'selected' : ''}>Rechazado</option>
                                    <option value="Programado" ${service.status === 'Programado' ? 'selected' : ''}>Programado</option>
                                    <option value="En Proceso" ${service.status === 'En Proceso' ? 'selected' : ''}>En Proceso</option>
                                    <option value="Completado" ${service.status === 'Completado' ? 'selected' : ''}>Completado</option>
                                </select>
                            </div>
                        ` : ''}

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Prioridad
                            </label>
                            <select id="edit-priority" 
                                    class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                <option value="Baja" ${service.priority === 'Baja' ? 'selected' : ''}>Baja</option>
                                <option value="Media" ${service.priority === 'Media' ? 'selected' : ''}>Media</option>
                                <option value="Alta" ${service.priority === 'Alta' ? 'selected' : ''}>Alta</option>
                                <option value="Urgente" ${service.priority === 'Urgente' ? 'selected' : ''}>Urgente</option>
                            </select>
                        </div>

                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Observaciones Adicionales
                            </label>
                            <textarea id="edit-additional-notes" rows="4"
                                      class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                      placeholder="Información adicional, instrucciones especiales, etc.">${service.additionalNotes || ''}</textarea>
                        </div>

                        ${isClient && service.status === 'Rechazado' ? `
                            <div class="md:col-span-2">
                                <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                                    <div class="flex">
                                        <div class="flex-shrink-0">
                                            <i class="fas fa-exclamation-triangle text-yellow-400"></i>
                                        </div>
                                        <div class="ml-3">
                                            <p class="text-sm text-yellow-700">
                                                <strong>Nota:</strong> Al editar esta solicitud rechazada, se enviará automáticamente para nueva aprobación.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    </div>

                    <div class="flex justify-end space-x-4 pt-6 border-t">
                        <button type="button" onclick="servicesModule.viewService(${service.id})" 
                                class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button type="submit" 
                                class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                            <i class="fas fa-save mr-2"></i>Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        `;

        this.initEditServiceForm(service.id);
    },

    initEditServiceForm(serviceId) {
        const form = document.getElementById('edit-service-form');
        const preferredTimeSelect = document.getElementById('edit-preferred-time');
        const specificTimeContainer = document.getElementById('edit-specific-time-container');

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
            this.saveEditedService(serviceId);
        });
    },

    saveEditedService(serviceId) {
        const serviceIndex = this.services.findIndex(s => s.id === serviceId);
        if (serviceIndex === -1) return;

        const currentUser = app.currentUser;
        const isClient = currentUser && currentUser.type === 'client';

        const formData = {
            clientName: document.getElementById('edit-client-name').value,
            clientPhone: document.getElementById('edit-client-phone').value,
            address: document.getElementById('edit-client-address').value,
            wasteType: document.getElementById('edit-waste-type').value,
            estimatedVolume: document.getElementById('edit-estimated-volume').value,
            volumeUnit: document.getElementById('edit-volume-unit').value,
            requestedDate: document.getElementById('edit-requested-date').value,
            preferredTime: document.getElementById('edit-preferred-time').value,
            specificTime: document.getElementById('edit-specific-time').value,
            priority: document.getElementById('edit-priority').value,
            additionalNotes: document.getElementById('edit-additional-notes').value
        };

        // Si es admin, incluir el estado del formulario
        if (!isClient) {
            formData.status = document.getElementById('edit-status').value;
        }

        // Si es un cliente editando una solicitud rechazada, cambiar estado
        if (isClient) {
            const originalService = this.services[serviceIndex];
            if (originalService.status === 'Rechazado') {
                formData.status = 'Pendiente de Aprobación';
                formData.revisedDate = new Date().toISOString().split('T')[0];
                formData.revisedBy = currentUser.id;
                
                // Notificar al admin sobre la revisión
                this.notifyAdminServiceRevised(this.services[serviceIndex], formData);
            }
        }

        // Update the service
        this.services[serviceIndex] = {
            ...this.services[serviceIndex],
            ...formData
        };
        this.saveServices(); // Guardar los servicios actualizados

        // Show success message
        const message = currentUser && currentUser.type === 'client' && formData.status === 'Pendiente de Aprobación'
            ? 'Solicitud editada y enviada para aprobación exitosamente'
            : 'Servicio actualizado exitosamente';
        authSystem.showNotification(message, 'success');

        // Redirect to service detail view
        this.viewService(serviceId);
    },

    // Notificar al admin sobre solicitud revisada
    notifyAdminServiceRevised(originalService, revisedData) {
        const notificationMessage = `Solicitud revisada por cliente: ${revisedData.clientName} (${revisedData.wasteType})`;
        
        // Mostrar notificación al admin
        if (app.currentUser && app.currentUser.type === 'admin') {
            authSystem.showNotification(notificationMessage, 'info');
        }

        // También mostrar en la consola para debugging
        console.log('Solicitud revisada:', {
            original: originalService,
            revised: revisedData
        });
    },

    scheduleService(id) {
        const service = this.services.find(s => s.id === id);
        if (!service) return;

        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-gray-800">Programar Servicio #${service.id.toString().padStart(3, '0')}</h1>
                <p class="text-gray-600">Configura la fecha y hora para la recolección del servicio</p>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <div class="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <i class="fas fa-info-circle text-blue-400"></i>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm text-blue-700">
                                <strong>Cliente:</strong> ${service.clientName}<br>
                                <strong>Tipo de Residuo:</strong> ${service.wasteType}<br>
                                <strong>Volumen:</strong> ${service.estimatedVolume} ${service.volumeUnit || 'm³'}
                            </p>
                        </div>
                    </div>
                </div>

                <form id="schedule-service-form" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Fecha de Recolección *
                            </label>
                            <input type="date" id="collection-date" required 
                                   class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                   min="${new Date().toISOString().split('T')[0]}">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Hora de Recolección *
                            </label>
                            <input type="time" id="collection-time" required 
                                   class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                   value="08:00">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Duración Estimada (horas)
                            </label>
                            <input type="number" id="estimated-duration" min="0.5" max="8" step="0.5"
                                   class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                   value="2" placeholder="2">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Equipo Requerido
                            </label>
                            <select id="equipment-required" 
                                    class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                <option value="Camión estándar">Camión estándar</option>
                                <option value="Camión compactador">Camión compactador</option>
                                <option value="Camión con grúa">Camión con grúa</option>
                                <option value="Camión especializado">Camión especializado</option>
                                <option value="Múltiples equipos">Múltiples equipos</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Personal Requerido
                            </label>
                            <select id="personnel-required" 
                                    class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                <option value="1 operador">1 operador</option>
                                <option value="1 operador + 1 ayudante">1 operador + 1 ayudante</option>
                                <option value="1 operador + 2 ayudantes">1 operador + 2 ayudantes</option>
                                <option value="Equipo especializado">Equipo especializado</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Prioridad de Programación
                            </label>
                            <select id="schedule-priority" 
                                    class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                <option value="Normal">Normal</option>
                                <option value="Alta">Alta</option>
                                <option value="Urgente">Urgente</option>
                            </select>
                        </div>

                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Instrucciones Especiales
                            </label>
                            <textarea id="special-instructions" rows="4"
                                      class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                      placeholder="Instrucciones especiales para el equipo de recolección, acceso al sitio, etc."></textarea>
                        </div>

                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Notas de Programación
                            </label>
                            <textarea id="schedule-notes" rows="3"
                                      class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                      placeholder="Notas adicionales sobre la programación del servicio"></textarea>
                        </div>
                    </div>

                    <div class="flex justify-end space-x-4 pt-6 border-t">
                        <button type="button" onclick="servicesModule.viewService(${service.id})" 
                                class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button type="submit" 
                                class="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                            <i class="fas fa-calendar-check mr-2"></i>Confirmar Programación
                        </button>
                    </div>
                </form>
            </div>
        `;

        this.initScheduleServiceForm(service.id);
    },

    initScheduleServiceForm(serviceId) {
        const form = document.getElementById('schedule-service-form');
        
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('collection-date').min = today;

        // Handle form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveScheduledService(serviceId);
        });
    },

    saveScheduledService(serviceId) {
        const serviceIndex = this.services.findIndex(s => s.id === serviceId);
        if (serviceIndex === -1) return;

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
            scheduledBy: 'Usuario actual' // TODO: Get from auth system
        };

        // Update the service
        this.services[serviceIndex] = {
            ...this.services[serviceIndex],
            status: 'Programado',
            schedule: scheduleData
        };
        this.saveServices(); // Guardar los servicios actualizados

        // Show success message
        authSystem.showNotification('Servicio programado exitosamente', 'success');

        // Redirect to service detail view
        this.viewService(serviceId);
    },

    formatPreferredTime(preferredTime, specificTime) {
        if (!preferredTime) return 'Sin preferencia';
        if (preferredTime === 'morning') return 'Mañana (8:00 AM - 12:00 PM)';
        if (preferredTime === 'afternoon') return 'Tarde (12:00 PM - 6:00 PM)';
        if (preferredTime === 'specific' && specificTime) return `Hora específica: ${specificTime}`;
        return 'Hora específica';
    },

    deleteService(id) {
        const service = this.services.find(s => s.id === id);
        if (!service) return;

        // Show confirmation modal
        const contentArea = document.getElementById('content-area');
        const modalHTML = `
            <div id="delete-confirmation-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                    <div class="mt-3 text-center">
                        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                            <i class="fas fa-exclamation-triangle text-red-600 text-xl"></i>
                        </div>
                        <h3 class="text-lg font-medium text-gray-900 mt-4">Confirmar Eliminación</h3>
                        <div class="mt-2 px-7 py-3">
                            <p class="text-sm text-gray-500">
                                ¿Está seguro de que desea eliminar la solicitud de servicio?
                            </p>
                            <div class="mt-3 p-3 bg-gray-50 rounded-lg text-left">
                                <p class="text-sm font-medium text-gray-700">Servicio #${service.id.toString().padStart(3, '0')}</p>
                                <p class="text-sm text-gray-600">${service.clientName}</p>
                                <p class="text-sm text-gray-600">${service.wasteType} - ${service.estimatedVolume} ${service.volumeUnit || 'm³'}</p>
                            </div>
                            <p class="text-sm text-red-600 mt-2 font-medium">
                                Esta acción no se puede deshacer.
                            </p>
                        </div>
                        <div class="items-center px-4 py-3">
                            <div class="flex justify-center space-x-3">
                                <button id="cancel-delete" 
                                        class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300">
                                    Cancelar
                                </button>
                                <button id="confirm-delete" 
                                        class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500">
                                    <i class="fas fa-trash mr-2"></i>Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal to the page
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Get modal elements
        const modal = document.getElementById('delete-confirmation-modal');
        const cancelBtn = document.getElementById('cancel-delete');
        const confirmBtn = document.getElementById('confirm-delete');

        // Handle cancel button
        cancelBtn.addEventListener('click', () => {
            modal.remove();
        });

        // Handle confirm button
        confirmBtn.addEventListener('click', () => {
            // Remove the service
            this.services = this.services.filter(s => s.id !== id);
            this.saveServices(); // Guardar los servicios actualizados
            
            // Remove modal
            modal.remove();
            
            // Refresh the table
            this.loadServicesTable();
            
            // Show success notification
            authSystem.showNotification('Solicitud eliminada exitosamente', 'success');
        });

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', function closeOnEscape(e) {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', closeOnEscape);
            }
        });
    },

    applyFilters() {
        const statusFilter = document.getElementById('status-filter').value;
        const wasteTypeFilter = document.getElementById('waste-type-filter').value;
        const dateFromFilter = document.getElementById('date-from-filter').value;
        const dateToFilter = document.getElementById('date-to-filter').value;

        let filteredServices = [...this.services];

        // Filtrar por estado
        if (statusFilter) {
            filteredServices = filteredServices.filter(service => service.status === statusFilter);
        }

        // Filtrar por tipo de residuo
        if (wasteTypeFilter) {
            filteredServices = filteredServices.filter(service => service.wasteType === wasteTypeFilter);
        }

        // Filtrar por fecha desde
        if (dateFromFilter) {
            filteredServices = filteredServices.filter(service => service.requestedDate >= dateFromFilter);
        }

        // Filtrar por fecha hasta
        if (dateToFilter) {
            filteredServices = filteredServices.filter(service => service.requestedDate <= dateToFilter);
        }

        // Mostrar servicios filtrados
        this.displayFilteredServices(filteredServices);
        
        authSystem.showNotification(`Se encontraron ${filteredServices.length} solicitudes`, 'info');
    },

    // Mostrar servicios filtrados
    displayFilteredServices(filteredServices) {
        const tbody = document.getElementById('services-table-body');
        
        tbody.innerHTML = filteredServices.map(service => `
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

    // Aplicar filtros para cliente
    applyClientFilters() {
        const statusFilter = document.getElementById('client-status-filter').value;
        const wasteTypeFilter = document.getElementById('client-waste-type-filter').value;
        const dateFromFilter = document.getElementById('client-date-from-filter').value;

        const currentUser = app.currentUser;
        if (!currentUser || currentUser.type !== 'client') return;

        // Filtrar servicios del cliente actual
        let clientServices = this.services.filter(service => 
            service.clientId === currentUser.id || service.clientEmail === currentUser.email
        );

        // Aplicar filtros
        if (statusFilter) {
            clientServices = clientServices.filter(service => service.status === statusFilter);
        }

        if (wasteTypeFilter) {
            clientServices = clientServices.filter(service => service.wasteType === wasteTypeFilter);
        }

        if (dateFromFilter) {
            clientServices = clientServices.filter(service => service.requestedDate >= dateFromFilter);
        }

        // Mostrar servicios filtrados
        this.displayFilteredClientServices(clientServices);
        
        authSystem.showNotification(`Se encontraron ${clientServices.length} solicitudes`, 'info');
    },

    // Mostrar servicios filtrados del cliente
    displayFilteredClientServices(filteredServices) {
        const tbody = document.getElementById('client-services-table-body');
        
        tbody.innerHTML = filteredServices.map(service => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #${service.id.toString().padStart(3, '0')}
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
                        
                        ${service.status === 'Rechazado' ? `
                            <button onclick="servicesModule.editService(${service.id})" 
                                    class="text-green-600 hover:text-green-900" title="Editar y Reenviar">
                                <i class="fas fa-edit"></i>
                            </button>
                        ` : ''}
                        
                        ${service.status === 'Pendiente de Aprobación' ? `
                            <button onclick="servicesModule.editService(${service.id})" 
                                    class="text-yellow-600 hover:text-yellow-900" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    },

    // Limpiar filtros para cliente
    clearClientFilters() {
        document.getElementById('client-status-filter').value = '';
        document.getElementById('client-waste-type-filter').value = '';
        document.getElementById('client-date-from-filter').value = '';
        this.loadClientServicesTable();
        authSystem.showNotification('Filtros limpiados', 'info');
    },

    // Método para cargar la vista principal según el tipo de usuario
    loadMainView() {
        const currentUser = app.currentUser;
        
        if (!currentUser) {
            authSystem.showNotification('Debe iniciar sesión', 'error');
            return;
        }

        if (currentUser.type === 'client') {
            this.loadClientView();
            
            // Mostrar información de contraseña temporal si es necesario
            setTimeout(() => {
                this.showTemporaryPasswordInfo();
            }, 1000);
        } else {
            this.load();
        }
    },

    // Método para manejar la navegación desde el menú
    handleNavigation(moduleName) {
        if (moduleName === 'services') {
            this.loadMainView();
        } else {
            // Para otros módulos, usar el sistema de navegación principal
            if (window.app && window.app.loadModule) {
                window.app.loadModule(moduleName);
            }
        }
    },

    // Mostrar información de contraseña temporal para clientes
    showTemporaryPasswordInfo() {
        const currentUser = app.currentUser;
        if (!currentUser || currentUser.type !== 'client' || !currentUser.isTemporaryPassword) {
            return;
        }

        const modalHTML = `
            <div id="temp-password-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 w-96 max-w-md">
                    <div class="flex items-center mb-4">
                        <i class="fas fa-exclamation-triangle text-yellow-500 text-2xl mr-3"></i>
                        <h3 class="text-lg font-semibold text-gray-900">Contraseña Temporal</h3>
                    </div>
                    
                    <div class="mb-4">
                        <p class="text-gray-700 mb-2">Tienes una contraseña temporal. Por seguridad, se recomienda cambiarla.</p>
                        <div class="bg-yellow-50 p-3 rounded border">
                            <p class="text-sm text-gray-600"><strong>Email:</strong> ${currentUser.email}</p>
                            <p class="text-sm text-gray-600"><strong>Estado:</strong> Contraseña temporal</p>
                        </div>
                    </div>
                    
                    <div class="flex justify-end space-x-3">
                        <button id="change-password-btn" 
                                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Cambiar Contraseña
                        </button>
                        <button id="close-temp-password" 
                                class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Insertar modal en el DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Event listeners
        const modal = document.getElementById('temp-password-modal');
        const changePasswordBtn = document.getElementById('change-password-btn');
        const closeBtn = document.getElementById('close-temp-password');

        // Cambiar contraseña
        changePasswordBtn.addEventListener('click', () => {
            modal.remove();
            this.showChangePasswordForm();
        });

        // Cerrar
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });

        // Cerrar al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Cerrar con Escape
        document.addEventListener('keydown', function closeOnEscape(e) {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', closeOnEscape);
            }
        });
    },

    // Mostrar formulario para cambiar contraseña
    showChangePasswordForm() {
        const currentUser = app.currentUser;
        if (!currentUser || currentUser.type !== 'client') return;

        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-gray-800">Cambiar Contraseña</h1>
                <p class="text-gray-600">Cambia tu contraseña temporal por una nueva</p>
            </div>

            <div class="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
                <form id="change-password-form" class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Contraseña Actual
                        </label>
                        <input type="password" id="current-password" required 
                               class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                               placeholder="Ingresa tu contraseña actual">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Nueva Contraseña
                        </label>
                        <input type="password" id="new-password" required 
                               class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                               placeholder="Ingresa tu nueva contraseña">
                        <p class="text-xs text-gray-500 mt-1">Mínimo 8 caracteres</p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Confirmar Nueva Contraseña
                        </label>
                        <input type="password" id="confirm-password" required 
                               class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                               placeholder="Confirma tu nueva contraseña">
                    </div>

                    <div class="flex justify-end space-x-4 pt-6 border-t">
                        <button type="button" onclick="servicesModule.loadClientView()" 
                                class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button type="submit" 
                                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <i class="fas fa-key mr-2"></i>Cambiar Contraseña
                        </button>
                    </div>
                </form>
            </div>
        `;

        this.initChangePasswordForm();
    },

    // Inicializar formulario de cambio de contraseña
    initChangePasswordForm() {
        const form = document.getElementById('change-password-form');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handlePasswordChange();
        });
    },

    // Manejar cambio de contraseña
    handlePasswordChange() {
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // Validaciones
        if (newPassword.length < 8) {
            authSystem.showNotification('La nueva contraseña debe tener al menos 8 caracteres', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            authSystem.showNotification('Las nuevas contraseñas no coinciden', 'error');
            return;
        }

        // Lógica para cambiar la contraseña (usar authSystem)
        if (window.authSystem) {
            const success = window.authSystem.changePassword(app.currentUser.email, currentPassword, newPassword);
            if (success) {
                authSystem.showNotification('Contraseña cambiada exitosamente', 'success');
                this.loadClientView();
            } else {
                authSystem.showNotification('La contraseña actual es incorrecta', 'error');
            }
        }
    },
    generateServiceId() {
        return this.services.length > 0 ? Math.max(...this.services.map(s => s.id)) + 1 : 1;
    },

    getApprovedServices() {
        return this.services.filter(service => service.status === 'Aprobado');
    }
};

// Inicializar el módulo cuando se cargue
document.addEventListener('DOMContentLoaded', function() {
    servicesModule.init();
});
