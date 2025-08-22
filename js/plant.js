window.plantModule = {
    receptions: [
        {
            id: 1,
            manifestNumber: 'M-2024-001',
            arrivalDate: '2024-08-17',
            arrivalTime: '14:30',
            vehicle: 'C-001',
            driver: 'Carlos Rodríguez',
            totalWeight: 15.6,
            declaredWeight: 15.6,
            status: 'Procesado',
            classifications: [
                { type: 'Orgánico', weight: 12.3, destination: 'Compostaje' },
                { type: 'Reciclable', weight: 3.3, destination: 'Centro de Reciclaje' }
            ],
            operator: 'María González',
            notes: 'Material en buenas condiciones'
        },
        {
            id: 2,
            manifestNumber: 'M-2024-002',
            arrivalDate: new Date().toISOString().slice(0, 10),
            arrivalTime: '10:15',
            vehicle: 'C-002',
            driver: 'Luis Martínez',
            totalWeight: 8.7,
            declaredWeight: 8.5,
            status: 'Procesado',
            classifications: [
                { type: 'Reciclable', weight: 8.7, destination: 'Centro de Reciclaje' }
            ],
            operator: 'Carlos Rodríguez',
            notes: 'Peso verificado superior al declarado por +200kg. Material en excelente estado.'
        },
        {
            id: 3,
            manifestNumber: 'M-2024-005',
            arrivalDate: (() => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                return yesterday.toISOString().slice(0, 10);
            })(),
            arrivalTime: '16:45',
            vehicle: 'C-001',
            driver: 'Miguel López',
            totalWeight: 19.8,
            declaredWeight: 19.8,
            status: 'Procesado',
            classifications: [
                { type: 'Orgánico', weight: 14.5, destination: 'Compostaje' },
                { type: 'Reciclable', weight: 3.8, destination: 'Centro de Reciclaje' },
                { type: 'No Reciclable', weight: 1.5, destination: 'Relleno Sanitario' }
            ],
            operator: 'Carlos Rodríguez',
            notes: 'Carga mixta bien separada en origen. Excelente trabajo de recolección.'
        },
        {
            id: 4,
            manifestNumber: 'M-2024-006',
            arrivalDate: (() => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                return yesterday.toISOString().slice(0, 10);
            })(),
            arrivalTime: '09:20',
            vehicle: 'C-002',
            driver: 'Carlos Rodríguez',
            totalWeight: 11.2,
            declaredWeight: 11.2,
            status: 'Procesado',
            classifications: [
                { type: 'Orgánico', weight: 9.8, destination: 'Compostaje' },
                { type: 'Reciclable', weight: 1.4, destination: 'Centro de Reciclaje' }
            ],
            operator: 'María González',
            notes: 'Alto porcentaje de materia orgánica, ideal para compostaje industrial.'
        },
        {
            id: 5,
            manifestNumber: 'M-2024-007',
            arrivalDate: new Date().toISOString().slice(0, 10),
            arrivalTime: '08:00',
            vehicle: 'V-001',
            driver: 'Ana García',
            totalWeight: 25.4,
            declaredWeight: 25.0,
            status: 'En Proceso',
            classifications: [
                { type: 'Orgánico', weight: 18.2, destination: 'Compostaje' },
                { type: 'Reciclable', weight: 5.1, destination: 'Centro de Reciclaje' },
                { type: 'No Reciclable', weight: 2.1, destination: 'Relleno Sanitario' }
            ],
            operator: 'Carlos Rodríguez',
            notes: 'Carga de gran volumen en proceso de clasificación final.'
        }
    ],

    // This object will now be populated dynamically
    processingCapacity: {
        current: 0,
        maximum: 200, // Ton
        organic: 0,
        recyclable: 0,
        nonRecyclable: 0
    },

    // --- ROLE-BASED LOADER ---
    load() {
        this.calculateInitialCapacity(); // Calculate current capacity before rendering

        const user = app.currentUser;
        if (!user) {
            document.getElementById('content-area').innerHTML = '<p>Error: No se pudo identificar al usuario.</p>';
            return;
        }

        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="mb-6">
                <div class="flex flex-col items-start gap-1">
                    <h1 class="text-3xl font-bold text-gray-800">Recepción y Manejo en Planta</h1>
                    <p class="text-gray-600">${user.type === 'admin' ? 'Supervisión de capacidad y recepciones' : 'Registro de recepción de cargas'}</p>
                </div>
            </div>
            <div id="role-specific-content"></div>
        `;

        const roleContainer = document.getElementById('role-specific-content');
        if (user.type === 'admin') {
            this.renderAdminView(roleContainer);
        } else {
            this.renderOperatorView(roleContainer);
        }
    },

    // --- ADMIN VIEW ---
    renderAdminView(container) {
        container.innerHTML = `
            <!-- Capacity Status -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-blue-100">Capacidad Ocupada</p>
                            <p class="text-3xl font-bold">${this.processingCapacity.current}%</p>
                        </div>
                        <i class="fas fa-tachometer-alt text-4xl text-blue-200"></i>
                    </div>
                    <div class="mt-2">
                        <div class="w-full bg-blue-700 rounded-full h-2">
                            <div class="bg-white h-2 rounded-full" style="width: ${this.processingCapacity.current}%"></div>
                        </div>
                    </div>
                </div>
                <div class="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
                    <div><p class="text-green-100">Orgánico (Ton)</p><p class="text-3xl font-bold">${this.processingCapacity.organic.toFixed(1)}</p></div>
                </div>
                <div class="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-lg text-white">
                    <div><p class="text-yellow-100">Reciclable (Ton)</p><p class="text-3xl font-bold">${this.processingCapacity.recyclable.toFixed(1)}</p></div>
                </div>
                <div class="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-lg text-white">
                    <div><p class="text-red-100">No Reciclable (Ton)</p><p class="text-3xl font-bold">${this.processingCapacity.nonRecyclable.toFixed(1)}</p></div>
                </div>
            </div>

            <!-- Recent Receptions Table -->
            <div class="bg-white rounded-lg shadow">
                <div class="p-6 border-b"><h3 class="text-lg font-semibold">Historial de Recepciones</h3></div>
                <div class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manifiesto</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha/Hora</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peso Total</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            ${this.receptions.map(reception => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 whitespace-nowrap font-medium">${reception.manifestNumber}</td>
                                    <td class="px-6 py-4 whitespace-nowrap"><div class="text-sm"><div>${this.formatDate(reception.arrivalDate)}</div><div class="text-gray-500">${reception.arrivalTime}</div></div></td>
                                    <td class="px-6 py-4 whitespace-nowrap">${reception.totalWeight} Ton</td>
                                    <td class="px-6 py-4 whitespace-nowrap"><span class="px-2 py-1 text-xs rounded-full ${this.getStatusClass(reception.status)}">${reception.status}</span></td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div class="flex space-x-3">
                                            <button onclick="plantModule.viewReception(${reception.id})" class="text-blue-600 hover:text-blue-900" title="Ver detalles"><i class="fas fa-eye"></i></button>
                                            <button onclick="plantModule.generateReport(${reception.id})" class="text-green-600 hover:text-green-900" title="Generar reporte"><i class="fas fa-print"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    // --- OPERATOR VIEW ---
    renderOperatorView(container) {
        const currentUser = app?.currentUser;
        
        container.innerHTML = `
            <!-- Acciones principales -->
            <div class="grid grid-cols-1 gap-6 mb-6">
                <!-- Formulario de nueva recepción -->
                <div class="bg-white rounded-lg shadow">
                    <div class="p-6 border-b">
                        <div class="flex justify-between items-center">
                            <h3 class="text-lg font-semibold">Nueva Recepción de Residuos</h3>
                        </div>
                    </div>
                    <div class="p-6">
                        <form id="reception-form" class="space-y-4"></form>
                    </div>
                </div>
            </div>

            <!-- Solicitudes Asignadas -->
            <div class="bg-white rounded-lg shadow">
                <div class="p-6 border-b">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-semibold">Solicitudes Asignadas</h3>
                        <div class="flex space-x-2">
                            <button onclick="plantModule.filterOperatorServices('today')" 
                                    class="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">Hoy</button>
                            <button onclick="plantModule.filterOperatorServices('week')" 
                                    class="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">Esta Semana</button>
                            <button onclick="plantModule.filterOperatorServices('all')" 
                                    class="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">Todas</button>
                        </div>
                    </div>
                </div>
                <div id="operator-services-list">
                    ${this.renderOperatorServicesList()}
                </div>
            </div>

            <!-- Modal containers -->
            <div id="plant-modal-container"></div>
        `;
        
        this.renderReceptionForm(document.getElementById('reception-form'));
        this.initReceptionForm();
        
        // Verificar que servicesModule esté disponible
        this.verifyServicesModule();
        
        // Aplicar estilos a la tabla inicial
        setTimeout(() => {
            this.applyTableStyles();
        }, 100);
    },

    // --- DYNAMIC DATA & ACTIONS ---
    calculateInitialCapacity() {
        this.processingCapacity.organic = 0;
        this.processingCapacity.recyclable = 0;
        this.processingCapacity.nonRecyclable = 0;

        this.receptions.forEach(rec => {
            rec.classifications.forEach(cl => {
                const weight = parseFloat(cl.weight) || 0;
                if (cl.type === 'Orgánico') this.processingCapacity.organic += weight;
                if (cl.type === 'Reciclable') this.processingCapacity.recyclable += weight;
                if (cl.type === 'No Reciclable') this.processingCapacity.nonRecyclable += weight;
            });
        });

        const total = this.processingCapacity.organic + this.processingCapacity.recyclable + this.processingCapacity.nonRecyclable;
        this.processingCapacity.current = this.processingCapacity.maximum > 0 ? Math.round((total / this.processingCapacity.maximum) * 100) : 0;
    },

    viewReception(id) {
        const reception = this.receptions.find(r => r.id === id);
        if (!reception) return;

        const modalHtml = `
        <div id="view-reception-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-2xl">
                <div class="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 class="text-xl font-semibold">Detalles de Recepción: ${reception.manifestNumber}</h3>
                    <button onclick="document.getElementById('view-reception-modal').remove()" class="text-gray-500 hover:text-gray-800">&times;</button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><strong>Fecha/Hora:</strong> ${this.formatDate(reception.arrivalDate)} ${reception.arrivalTime}</div>
                    <div><strong>Vehículo:</strong> ${reception.vehicle}</div>
                    <div><strong>Conductor:</strong> ${reception.driver}</div>
                    <div><strong>Peso Total:</strong> ${reception.totalWeight} Ton</div>
                    <div><strong>Operador:</strong> ${reception.operator}</div>
                    <div><strong>Estado:</strong> ${reception.status}</div>
                </div>
                <div class="mt-4 border-t pt-4">
                    <h4 class="font-semibold mb-2">Clasificación</h4>
                    <table class="min-w-full text-sm"><thead><tr><th class="text-left">Tipo</th><th class="text-left">Peso</th><th class="text-left">Destino</th></tr></thead><tbody>
                    ${reception.classifications.map(c => `<tr><td>${c.type}</td><td>${c.weight} Ton</td><td>${c.destination}</td></tr>`).join('')}
                    </tbody></table>
                </div>
                 <div class="mt-4 border-t pt-4 text-sm">
                    <h4 class="font-semibold mb-2">Notas</h4>
                    <p>${reception.notes || 'Sin observaciones'}</p>
                </div>
                <div class="flex justify-end mt-6">
                    <button onclick="document.getElementById('view-reception-modal').remove()" class="px-4 py-2 border rounded-lg">Cerrar</button>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    generateReport(id) {
        const reception = this.receptions.find(r => r.id === id);
        if (!reception) return;

        const printWindow = window.open('', '_blank');
        printWindow.document.write('<html><head><title>Reporte de Recepción ' + reception.manifestNumber + '</title><style>body{font-family:sans-serif;padding:2em}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px}th{background-color:#f2f2f2}.header h1{margin:0}</style></head><body>');
        printWindow.document.write(`<div class="header"><h1>Reporte de Recepción</h1><h2>${reception.manifestNumber}</h2></div>`);
        printWindow.document.write(`<p><strong>Fecha y Hora de Llegada:</strong> ${this.formatDate(reception.arrivalDate)} ${reception.arrivalTime}</p>`);
        printWindow.document.write(`<p><strong>Peso Total Registrado:</strong> ${reception.totalWeight} Ton</p>`);
        printWindow.document.write('<h3>Clasificación de Materiales</h3><table><thead><tr><th>Tipo</th><th>Peso (Ton)</th><th>Destino</th></tr></thead><tbody>');
        reception.classifications.forEach(c => { printWindow.document.write(`<tr><td>${c.type}</td><td>${c.weight}</td><td>${c.destination}</td></tr>`); });
        printWindow.document.write('</tbody></table>');
        printWindow.document.write(`<p><strong>Operador de Planta:</strong> ${reception.operator}</p><p><strong>Notas:</strong> ${reception.notes || 'N/A'}</p>`);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
    },

    // --- FORM & HELPER FUNCTIONS (mostly unchanged) ---
    renderReceptionForm(formElement) {
        if (!formElement) return;
        
        formElement.innerHTML = `
            <!-- Información del Manifiesto -->
            <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-700 mb-4">Información del Manifiesto</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Número de Manifiesto</label>
                        <input type="text" id="reception-manifest" 
                               placeholder="M-2024-001" 
                               required
                               class="w-full p-3 border border-gray-300 rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Fecha y Hora de Llegada</label>
                        <input type="datetime-local" id="reception-datetime" 
                               value="${new Date().toISOString().slice(0, 16)}" 
                               required
                               class="w-full p-3 border border-gray-300 rounded-lg">
                    </div>
                </div>
            </div>

            <!-- Información del Vehículo -->
            <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-700 mb-4">Información del Transporte</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Vehículo</label>
                        <input type="text" id="reception-vehicle" 
                               placeholder="C-001" 
                               required
                               class="w-full p-3 border border-gray-300 rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Conductor</label>
                        <input type="text" id="reception-driver" 
                               placeholder="Nombre del conductor" 
                               required
                               class="w-full p-3 border border-gray-300 rounded-lg">
                    </div>
                </div>
            </div>

            <!-- Pesaje y Clasificación -->
            <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-700 mb-4">Pesaje y Clasificación</h4>
                <div class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Peso Total Declarado (Ton)</label>
                            <input type="number" step="0.1" min="0" id="reception-declared-weight" 
                                   placeholder="15.6" 
                                   required
                                   class="w-full p-3 border border-gray-300 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Peso Total Verificado (Ton)</label>
                            <input type="number" step="0.1" min="0" id="reception-verified-weight" 
                                   placeholder="15.8" 
                                   required
                                   class="w-full p-3 border border-gray-300 rounded-lg">
                        </div>
                    </div>

                    <!-- Clasificaciones -->
                    <div>
                        <h5 class="font-medium text-gray-700 mb-3">Clasificación por Tipo de Residuo</h5>
                        <div id="classifications-container">
                            <div class="classification-row grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Residuo</label>
                                    <select class="classification-type w-full p-3 border border-gray-300 rounded-lg" required>
                                        <option value="">Seleccionar tipo...</option>
                                        <option value="Orgánico">Orgánico</option>
                                        <option value="Reciclable">Reciclable</option>
                                        <option value="No Reciclable">No Reciclable</option>
                                        <option value="Peligroso">Peligroso</option>
                                        <option value="Electrónico">Electrónico</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Peso (Ton)</label>
                                    <input type="number" step="0.1" min="0" class="classification-weight w-full p-3 border border-gray-300 rounded-lg" required>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Destino Final</label>
                                    <select class="classification-destination w-full p-3 border border-gray-300 rounded-lg" required>
                                        <option value="">Seleccionar destino...</option>
                                        <option value="Compostaje">Compostaje</option>
                                        <option value="Centro de Reciclaje">Centro de Reciclaje</option>
                                        <option value="Relleno Sanitario">Relleno Sanitario</option>
                                        <option value="Tratamiento Especial">Tratamiento Especial</option>
                                    </select>
                                </div>
                                <div class="flex items-end">
                                    <button type="button" onclick="plantModule.removeClassification(this)" 
                                            class="w-full p-3 bg-red-600 text-white rounded-lg hover:bg-red-700">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <button type="button" onclick="plantModule.addClassification()" 
                                class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                            <i class="fas fa-plus mr-2"></i>Agregar Clasificación
                        </button>
                    </div>
                </div>
            </div>

            <!-- Estado y Observaciones -->
            <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-700 mb-4">Estado y Observaciones</h4>
                <div class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Estado de la Recepción</label>
                            <select id="reception-status" required class="w-full p-3 border border-gray-300 rounded-lg">
                                <option value="">Seleccionar estado...</option>
                                <option value="Recibido">Recibido</option>
                                <option value="En Proceso">En Proceso</option>
                                <option value="Procesado">Procesado</option>
                                <option value="Rechazado">Rechazado</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Operador Responsable</label>
                            <input type="text" id="reception-operator" 
                                   value="${app.currentUser?.name || 'Operador de Planta'}" 
                                   required readonly
                                   class="w-full p-3 border border-gray-300 rounded-lg bg-gray-100">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
                        <textarea id="reception-notes" 
                                  placeholder="Condiciones del material, incidencias, observaciones generales..."
                                  class="w-full p-3 border border-gray-300 rounded-lg h-24"></textarea>
                    </div>
                </div>
            </div>

            <!-- Botones -->
            <div class="flex justify-end space-x-4 pt-6 border-t">
                <button type="button" onclick="plantModule.clearForm()" 
                        class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    Limpiar Formulario
                </button>
                <button type="submit" 
                        class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <i class="fas fa-save mr-2"></i>Registrar Recepción
                </button>
            </div>
        `;
    },

    initReceptionForm() {
        const form = document.getElementById('reception-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveReception();
        });

        // Auto-completar información del manifiesto si se ingresa el número
        const manifestInput = document.getElementById('reception-manifest');
        if (manifestInput) {
            manifestInput.addEventListener('blur', () => {
                this.autoFillManifestInfo(manifestInput.value);
            });
        }
    },

    saveReception() {
        try {
            // Recopilar datos del formulario
            const receptionData = {
                id: this.receptions.length + 1,
                manifestNumber: document.getElementById('reception-manifest').value,
                arrivalDate: document.getElementById('reception-datetime').value.split('T')[0],
                arrivalTime: document.getElementById('reception-datetime').value.split('T')[1],
                vehicle: document.getElementById('reception-vehicle').value,
                driver: document.getElementById('reception-driver').value,
                declaredWeight: parseFloat(document.getElementById('reception-declared-weight').value) || 0,
                totalWeight: parseFloat(document.getElementById('reception-verified-weight').value) || 0,
                status: document.getElementById('reception-status').value,
                operator: document.getElementById('reception-operator').value,
                notes: document.getElementById('reception-notes').value,
                classifications: []
            };

            // Recopilar clasificaciones
            const classRows = document.querySelectorAll('.classification-row');
            classRows.forEach(row => {
                const type = row.querySelector('.classification-type').value;
                const weight = parseFloat(row.querySelector('.classification-weight').value) || 0;
                const destination = row.querySelector('.classification-destination').value;
                
                if (type && weight > 0 && destination) {
                    receptionData.classifications.push({ type, weight, destination });
                }
            });

            // Validar que hay al menos una clasificación
            if (receptionData.classifications.length === 0) {
                authSystem.showNotification('Debe agregar al menos una clasificación válida', 'error');
                return;
            }

            // Validar que el peso total coincide con las clasificaciones
            const totalClassifiedWeight = receptionData.classifications.reduce((sum, c) => sum + c.weight, 0);
            const tolerance = 0.1; // 100kg de tolerancia
            if (Math.abs(totalClassifiedWeight - receptionData.totalWeight) > tolerance) {
                authSystem.showNotification(`El peso total (${receptionData.totalWeight}T) no coincide con las clasificaciones (${totalClassifiedWeight.toFixed(1)}T)`, 'warning');
            }

            // Agregar al array de recepciones
            this.receptions.push(receptionData);

            // Actualizar capacidad de la planta
            this.calculateInitialCapacity();

            // Mostrar notificación de éxito
            authSystem.showNotification(`Recepción ${receptionData.manifestNumber} registrada exitosamente`, 'success');

            // Limpiar formulario
            this.clearForm();

            // Recargar la vista
            this.load();

        } catch (error) {
            console.error('Error al guardar recepción:', error);
            authSystem.showNotification('Error al registrar la recepción', 'error');
        }
    },
    // ... other helpers ...
    getStatusClass(status) {
        const classes = {
            'Procesado': 'bg-green-100 text-green-800',
            'En Proceso': 'bg-yellow-100 text-yellow-800',
            'Recibido': 'bg-blue-100 text-blue-800',
            'Rechazado': 'bg-red-100 text-red-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    },
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        const date = new Date(dateString);
        date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
        return date.toLocaleDateString('es-ES', options);
    },

    // ========= FUNCIONES AUXILIARES PARA OPERADORES =========

    // Agregar nueva clasificación al formulario
    addClassification() {
        const container = document.getElementById('classifications-container');
        const newRow = document.createElement('div');
        newRow.className = 'classification-row grid grid-cols-1 md:grid-cols-4 gap-4 mb-4';
        newRow.innerHTML = `
            <div>
                <select class="classification-type w-full p-3 border border-gray-300 rounded-lg" required>
                    <option value="">Seleccionar tipo...</option>
                    <option value="Orgánico">Orgánico</option>
                    <option value="Reciclable">Reciclable</option>
                    <option value="No Reciclable">No Reciclable</option>
                    <option value="Peligroso">Peligroso</option>
                    <option value="Electrónico">Electrónico</option>
                </select>
            </div>
            <div>
                <input type="number" step="0.1" min="0" class="classification-weight w-full p-3 border border-gray-300 rounded-lg" required>
            </div>
            <div>
                <select class="classification-destination w-full p-3 border border-gray-300 rounded-lg" required>
                    <option value="">Seleccionar destino...</option>
                    <option value="Compostaje">Compostaje</option>
                    <option value="Centro de Reciclaje">Centro de Reciclaje</option>
                    <option value="Relleno Sanitario">Relleno Sanitario</option>
                    <option value="Tratamiento Especial">Tratamiento Especial</option>
                </select>
            </div>
            <div class="flex items-end">
                <button type="button" onclick="plantModule.removeClassification(this)" 
                        class="w-full p-3 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(newRow);
    },

    // Remover clasificación del formulario
    removeClassification(button) {
        const container = document.getElementById('classifications-container');
        if (container.children.length > 1) {
            button.closest('.classification-row').remove();
        } else {
            authSystem.showNotification('Debe mantener al menos una clasificación', 'warning');
        }
    },

    // Limpiar formulario
    clearForm() {
        const form = document.getElementById('reception-form');
        if (form) {
            form.reset();
            // Restaurar valor por defecto de fecha y hora
            document.getElementById('reception-datetime').value = new Date().toISOString().slice(0, 16);
            document.getElementById('reception-operator').value = app.currentUser?.name || 'Operador de Planta';
            
            // Mantener solo una clasificación
            const container = document.getElementById('classifications-container');
            while (container.children.length > 1) {
                container.removeChild(container.lastChild);
            }
        }
    },

    // Auto-completar información del manifiesto
    autoFillManifestInfo(manifestNumber) {
        if (!manifestNumber) return;
        
        // Buscar el manifiesto en el módulo de manifiestos
        const manifest = window.manifestsModule?.manifests?.find(m => 
            m.manifestNumber === manifestNumber
        );
        
        if (manifest) {
            document.getElementById('reception-vehicle').value = manifest.vehicle || '';
            document.getElementById('reception-driver').value = manifest.driver || '';
            document.getElementById('reception-declared-weight').value = manifest.totalWeight || '';
            document.getElementById('reception-verified-weight').value = manifest.totalWeight || '';
            
            authSystem.showNotification('Información del manifiesto completada automáticamente', 'info');
        }
    },



    renderOperatorReceptionsList(receptions) {
        if (!receptions || receptions.length === 0) {
            return `
                <div class="p-6 text-center">
                    <i class="fas fa-truck text-gray-300 text-4xl mb-4"></i>
                    <p class="text-gray-500">No hay recepciones registradas</p>
                </div>
            `;
        }

        return `
            <div class="divide-y divide-gray-200">
                ${receptions.map(reception => `
                    <div class="p-6 hover:bg-gray-50">
                        <div class="flex items-center justify-between">
                            <div class="flex-1">
                                <div class="flex items-center space-x-4">
                                    <div class="p-2 rounded-full ${reception.status === 'Procesado' ? 'bg-green-100' : reception.status === 'En Proceso' ? 'bg-yellow-100' : 'bg-blue-100'}">
                                        <i class="fas ${reception.status === 'Procesado' ? 'fa-check-circle text-green-600' : reception.status === 'En Proceso' ? 'fa-clock text-yellow-600' : 'fa-truck text-blue-600'}"></i>
                                    </div>
                                    <div>
                                        <h4 class="font-semibold">${reception.manifestNumber}</h4>
                                        <p class="text-sm text-gray-600">${reception.vehicle} • ${this.formatDate(reception.arrivalDate)} ${reception.arrivalTime}</p>
                                        <p class="text-sm text-gray-600">${reception.totalWeight} Ton • Conductor: ${reception.driver}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center space-x-4">
                                <span class="px-2 py-1 text-xs rounded-full ${this.getStatusClass(reception.status)}">
                                    ${reception.status}
                                </span>
                                <div class="flex space-x-2">
                                    <button onclick="plantModule.viewReception(${reception.id})" 
                                            class="text-blue-600 hover:text-blue-800 p-2" title="Ver detalles">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button onclick="plantModule.generateReport(${reception.id})" 
                                            class="text-green-600 hover:text-green-800 p-2" title="Generar reporte">
                                        <i class="fas fa-print"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // Funciones de acción adicionales
    showQuickReceptionForm() {
        authSystem.showNotification('Función de recepción rápida en desarrollo', 'info');
    },

    quickReception(manifestNumber) {
        document.getElementById('reception-manifest').value = manifestNumber;
        this.autoFillManifestInfo(manifestNumber);
        authSystem.showNotification(`Información de ${manifestNumber} cargada en el formulario`, 'info');
    },

    filterReceptions(filter) {
        authSystem.showNotification(`Filtro "${filter}" aplicado`, 'info');
        // Aquí se implementaría la lógica de filtrado
    },

    // ========= FUNCIONES PARA SOLICITUDES DEL OPERADOR =========

    // Obtener servicios asignados al operador actual
    getOperatorServices() {
        const currentUser = app?.currentUser;
        if (!currentUser) {
            console.warn('No hay usuario actual');
            return [];
        }
        
        if (!window.servicesModule) {
            console.warn('servicesModule no está disponible');
            return [];
        }

        const services = window.servicesModule.getOperatorServices(currentUser) || [];
        console.log('Servicios del operador:', services);
        return services;
    },

    // Renderizar lista de servicios del operador
    renderOperatorServicesList() {
        const services = this.getOperatorServices();
        
        if (!services || services.length === 0) {
            return `
                <div class="p-6 text-center">
                    <i class="fas fa-clipboard-list text-gray-300 text-4xl mb-4"></i>
                    <p class="text-gray-500">No hay solicitudes asignadas</p>
                    <p class="text-sm text-gray-400 mt-2">Las solicitudes aparecerán aquí cuando te sean asignadas</p>
                </div>
            `;
        }

        return `
            <div class="overflow-x-auto">
                <table class="min-w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitud</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de Residuo</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${services.map(service => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="flex items-center">
                                        <div class="p-2 rounded-full ${this.getServiceStatusColor(service.status)} mr-3">
                                            <i class="fas ${this.getServiceStatusIcon(service.status)}"></i>
                                        </div>
                                        <div class="text-sm font-medium text-gray-900">#${String(service.id).padStart(3, '0')}</div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm font-medium text-gray-900">${service.clientName}</div>
                                    <div class="text-sm text-gray-500">${service.address}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-900">${service.wasteType}</div>
                                    <div class="text-sm text-gray-500">${service.estimatedVolume} ${service.volumeUnit}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    ${this.formatDate(service.requestedDate)}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-2 py-1 text-xs rounded-full ${this.getServiceStatusClass(service.status)}">
                                        ${service.status}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div class="flex space-x-2">
                                        <button onclick="plantModule.viewService(${service.id})" 
                                                class="text-blue-600 hover:text-blue-800 p-2" title="Ver detalles">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        ${this.renderServiceActionButtons(service)}
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    // Obtener color de fondo para el estado del servicio
    getServiceStatusColor(status) {
        const colors = {
            'Pendiente de Aprobación': 'bg-gray-100',
            'Aprobado': 'bg-blue-100',
            'Programado': 'bg-yellow-100',
            'En Ruta': 'bg-orange-100',
            'En Proceso': 'bg-purple-100',
            'Recolectado': 'bg-green-100',
            'En Tránsito': 'bg-indigo-100',
            'Completado': 'bg-green-100',
            'Rechazado': 'bg-red-100',
            'Cancelado': 'bg-gray-100'
        };
        return colors[status] || 'bg-gray-100';
    },

    // Obtener icono para el estado del servicio
    getServiceStatusIcon(status) {
        const icons = {
            'Pendiente de Aprobación': 'fa-clock text-gray-600',
            'Aprobado': 'fa-check text-blue-600',
            'Programado': 'fa-calendar text-yellow-600',
            'En Ruta': 'fa-truck text-orange-600',
            'En Proceso': 'fa-cogs text-purple-600',
            'Recolectado': 'fa-check-circle text-green-600',
            'En Tránsito': 'fa-shipping-fast text-indigo-600',
            'Completado': 'fa-flag-checkered text-green-600',
            'Rechazado': 'fa-times text-red-600',
            'Cancelado': 'fa-ban text-gray-600'
        };
        return icons[status] || 'fa-question text-gray-600';
    },

    // Obtener clase CSS para el estado del servicio
    getServiceStatusClass(status) {
        const classes = {
            'Pendiente de Aprobación': 'bg-gray-100 text-gray-800',
            'Aprobado': 'bg-blue-100 text-blue-800',
            'Programado': 'bg-yellow-100 text-yellow-800',
            'En Ruta': 'bg-orange-100 text-orange-800',
            'En Proceso': 'bg-purple-100 text-purple-800',
            'Recolectado': 'bg-green-100 text-green-800',
            'En Tránsito': 'bg-indigo-100 text-indigo-800',
            'Completado': 'bg-green-100 text-green-800',
            'Rechazado': 'bg-red-100 text-red-800',
            'Cancelado': 'bg-gray-100 text-gray-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    },

    // Renderizar botones de acción según el estado del servicio
    renderServiceActionButtons(service) {
        const buttons = [];
        
        // Botón para iniciar recolección (cuando está programado)
        if (service.status === 'Programado') {
            buttons.push(`
                <button onclick="plantModule.startServiceCollection(${service.id})" 
                        class="text-blue-600 hover:text-blue-800 p-2" title="Iniciar Recolección">
                    <i class="fas fa-play"></i>
                </button>
            `);
        }
        
        // Botón para hacer check-in (cuando está en ruta)
        if (service.status === 'En Ruta') {
            buttons.push(`
                <button onclick="plantModule.checkInAtService(${service.id})" 
                        class="text-yellow-600 hover:text-yellow-800 p-2" title="Check-in en Ubicación">
                    <i class="fas fa-map-marker-alt"></i>
                </button>
            `);
        }
        
        // Botón para confirmar recolección (cuando está en proceso)
        if (service.status === 'En Proceso') {
            buttons.push(`
                <button onclick="plantModule.confirmCollection(${service.id})" 
                        class="text-green-600 hover:text-green-800 p-2" title="Confirmar Recolección">
                    <i class="fas fa-check"></i>
                </button>
            `);
        }
        
        // Botón para iniciar tránsito (cuando está recolectado)
        if (service.status === 'Recolectado') {
            buttons.push(`
                <button onclick="plantModule.startTransit(${service.id})" 
                        class="text-indigo-600 hover:text-indigo-800 p-2" title="Iniciar Tránsito">
                    <i class="fas fa-shipping-fast"></i>
                </button>
            `);
        }
        
        // Botón para completar servicio (cuando está en tránsito)
        if (service.status === 'En Tránsito') {
            buttons.push(`
                <button onclick="plantModule.completeService(${service.id})" 
                        class="text-purple-600 hover:text-purple-800 p-2" title="Completar Servicio">
                    <i class="fas fa-flag-checkered"></i>
                </button>
            `);
        }

        return buttons.join('');
    },

    confirmCollection(serviceId) {
        if (window.servicesModule && typeof window.servicesModule.completeCollection === 'function') {
            try {
                // Usar la función completeCollection que maneja mejor los datos de recolección
                window.servicesModule.completeCollection(serviceId, {
                    weight: 0, // Se puede agregar un modal para capturar estos datos
                    volume: 0,
                    notes: 'Recolección confirmada por operador',
                    signature: 'Confirmado',
                    photos: []
                });
                
                // Recargar la lista después de la acción
                setTimeout(() => {
                    const container = document.getElementById('operator-services-list');
                    if (container) {
                        container.innerHTML = this.renderOperatorServicesList();
                        this.applyTableStyles();
                    }
                }, 500);
            } catch (error) {
                console.error('Error al confirmar recolección:', error);
                authSystem.showNotification('Error al confirmar la recolección: ' + error.message, 'error');
            }
        } else {
            authSystem.showNotification('Función de confirmar recolección no disponible', 'info');
        }
    },

    // Filtrar servicios del operador
    filterOperatorServices(filter) {
        const container = document.getElementById('operator-services-list');
        if (!container) return;

        let services = this.getOperatorServices();
        
        if (filter === 'today') {
            const today = new Date().toISOString().split('T')[0];
            services = services.filter(s => s.requestedDate === today);
        } else if (filter === 'week') {
            const today = new Date();
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            services = services.filter(s => {
                const serviceDate = new Date(s.requestedDate);
                return serviceDate >= weekAgo && serviceDate <= today;
            });
        }
        // 'all' muestra todos los servicios

        // Actualizar la vista
        container.innerHTML = this.renderFilteredServices(services);
        
        // Aplicar estilos adicionales para mejorar la tabla
        this.applyTableStyles();
        
        authSystem.showNotification(`Filtro "${filter}" aplicado`, 'info');
    },

    // Aplicar estilos adicionales a la tabla
    applyTableStyles() {
        const table = document.querySelector('#operator-services-list table');
        if (table) {
            // Asegurar que la tabla tenga scroll horizontal en dispositivos móviles
            table.style.minWidth = '800px';
            table.style.width = 'auto';
            table.style.tableLayout = 'auto';
            
            // Mejorar la legibilidad de las celdas
            const cells = table.querySelectorAll('td, th');
            cells.forEach(cell => {
                cell.style.verticalAlign = 'top';
                cell.style.padding = '12px 16px';
                cell.style.borderBottom = '1px solid #e5e7eb';
                cell.style.whiteSpace = 'nowrap';
            });
            
            // Asegurar que los botones de acción sean consistentes
            const actionButtons = table.querySelectorAll('button');
            actionButtons.forEach(button => {
                button.style.minWidth = '32px';
                button.style.minHeight = '32px';
                button.style.display = 'inline-flex';
                button.style.alignItems = 'center';
                button.style.justifyContent = 'center';
                button.style.borderRadius = '6px';
                button.style.transition = 'all 0.2s ease';
            });
            
            // Mejorar el header de la tabla
            const headerCells = table.querySelectorAll('th');
            headerCells.forEach(cell => {
                cell.style.backgroundColor = '#f9fafb';
                cell.style.fontWeight = '600';
                cell.style.textTransform = 'uppercase';
                cell.style.letterSpacing = '0.05em';
                cell.style.borderBottom = '2px solid #e5e7eb';
            });
            
            // Asegurar que el contenedor tenga scroll horizontal y se ajuste al contenido
            const container = document.getElementById('operator-services-list');
            if (container) {
                container.style.overflowX = 'auto';
                container.style.overflowY = 'hidden';
                container.style.width = '100%';
                container.style.maxWidth = '100%';
                container.style.display = 'block';
                container.style.margin = '0';
                container.style.padding = '0';
            }
            
            // Optimizar el ancho de la tabla
            this.optimizeTableWidth();
            
            // Agregar listener para redimensionamiento de ventana
            this.handleTableResponsive();
        }
    },

    // Optimizar el ancho de la tabla para eliminar espacios innecesarios
    optimizeTableWidth() {
        const table = document.querySelector('#operator-services-list table');
        const container = document.getElementById('operator-services-list');
        
        if (!table || !container) return;
        
        // Calcular el ancho real necesario para la tabla
        const tableWidth = table.scrollWidth;
        const containerWidth = container.clientWidth;
        
        // Si la tabla es más pequeña que el contenedor, ajustar el ancho
        if (tableWidth < containerWidth && window.innerWidth >= 768) {
            table.style.width = '100%';
            table.style.minWidth = 'auto';
        } else {
            table.style.width = 'auto';
            table.style.minWidth = '800px';
        }
    },

    // Verificar que servicesModule esté disponible y funcionando
    verifyServicesModule() {
        console.log('Verificando servicesModule...');
        console.log('window.servicesModule:', window.servicesModule);
        
        if (!window.servicesModule) {
            console.error('servicesModule no está disponible');
            authSystem.showNotification('Error: Módulo de servicios no disponible', 'error');
            return false;
        }
        
        if (typeof window.servicesModule.getOperatorServices !== 'function') {
            console.error('getOperatorServices no está disponible');
            authSystem.showNotification('Error: Función getOperatorServices no disponible', 'error');
            return false;
        }
        
        if (typeof window.servicesModule.completeCollection !== 'function') {
            console.error('completeCollection no está disponible');
            authSystem.showNotification('Error: Función completeCollection no disponible', 'error');
            return false;
        }
        
        console.log('servicesModule verificado correctamente');
        return true;
    },

    // Manejar la responsividad de la tabla
    handleTableResponsive() {
        const container = document.getElementById('operator-services-list');
        if (!container) return;
        
        const handleResize = () => {
            const table = container.querySelector('table');
            if (!table) return;
            
            if (window.innerWidth < 768) {
                // En móviles, ajustar el ancho mínimo
                table.style.minWidth = '600px';
                table.style.width = '100%';
            } else {
                // En desktop, ajustar el ancho para que se adapte al contenido
                table.style.minWidth = '800px';
                table.style.width = 'auto';
            }
            
            // Ajustar el contenedor para que se adapte al contenido de la tabla
            container.style.width = '100%';
            container.style.maxWidth = '100%';
            
            // Optimizar el ancho después del redimensionamiento
            setTimeout(() => {
                this.optimizeTableWidth();
            }, 100);
        };
        
        // Aplicar al cargar
        handleResize();
        
        // Aplicar al redimensionar
        window.addEventListener('resize', handleResize);
    },

    // Renderizar servicios filtrados
    renderFilteredServices(services) {
        if (!services || services.length === 0) {
            return `
                <div class="p-6 text-center">
                    <i class="fas fa-filter text-gray-300 text-4xl mb-4"></i>
                    <p class="text-gray-500">No hay solicitudes con el filtro aplicado</p>
                </div>
            `;
        }

        return `
            <div class="overflow-x-auto">
                <table class="min-w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitud</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de Residuo</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${services.map(service => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="flex items-center">
                                        <div class="p-2 rounded-full ${this.getServiceStatusColor(service.status)} mr-3">
                                            <i class="fas ${this.getServiceStatusIcon(service.status)}"></i>
                                        </div>
                                        <div class="text-sm font-medium text-gray-900">#${String(service.id).padStart(3, '0')}</div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm font-medium text-gray-900">${service.clientName}</div>
                                    <div class="text-sm text-gray-500">${service.address}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-900">${service.wasteType}</div>
                                    <div class="text-sm text-gray-500">${service.estimatedVolume} ${service.volumeUnit}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    ${this.formatDate(service.requestedDate)}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-2 py-1 text-xs rounded-full ${this.getServiceStatusClass(service.status)}">
                                        ${service.status}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div class="flex space-x-2">
                                        <button onclick="plantModule.viewService(${service.id})" 
                                                class="text-blue-600 hover:text-blue-800 p-2" title="Ver detalles">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        ${this.renderServiceActionButtons(service)}
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    // Funciones de acción para servicios
    viewService(serviceId) {
        if (window.servicesModule && typeof window.servicesModule.viewService === 'function') {
            window.servicesModule.viewService(serviceId);
        } else {
            authSystem.showNotification('Función de visualización de servicio no disponible', 'info');
        }
    },

    startServiceCollection(serviceId) {
        if (window.servicesModule && typeof window.servicesModule.startServiceCollection === 'function') {
            window.servicesModule.startServiceCollection(serviceId);
            // Recargar la lista después de la acción
            setTimeout(() => {
                const container = document.getElementById('operator-services-list');
                if (container) {
                    container.innerHTML = this.renderOperatorServicesList();
                }
            }, 500);
        } else {
            authSystem.showNotification('Función de inicio de recolección no disponible', 'info');
        }
    },

    checkInAtService(serviceId) {
        if (window.servicesModule && typeof window.servicesModule.checkInAtService === 'function') {
            window.servicesModule.checkInAtService(serviceId);
            // Recargar la lista después de la acción
            setTimeout(() => {
                const container = document.getElementById('operator-services-list');
                if (container) {
                    container.innerHTML = this.renderOperatorServicesList();
                }
            }, 500);
        } else {
            authSystem.showNotification('Función de check-in no disponible', 'info');
        }
    },

    completeCollection(serviceId) {
        if (window.servicesModule && typeof window.servicesModule.completeCollection === 'function') {
            window.servicesModule.completeCollection(serviceId);
            // Recargar la lista después de la acción
            setTimeout(() => {
                const container = document.getElementById('operator-services-list');
                if (container) {
                    container.innerHTML = this.renderOperatorServicesList();
                }
            }, 500);
        } else {
            authSystem.showNotification('Función de completar recolección no disponible', 'info');
        }
    },

    startTransit(serviceId) {
        if (window.servicesModule && typeof window.servicesModule.updateServiceStatus === 'function') {
            window.servicesModule.updateServiceStatus(serviceId, 'En Tránsito');
            authSystem.showNotification('Servicio marcado como "En Tránsito"', 'success');
            // Recargar la lista después de la acción
            setTimeout(() => {
                const container = document.getElementById('operator-services-list');
                if (container) {
                    container.innerHTML = this.renderOperatorServicesList();
                }
            }, 500);
        } else {
            authSystem.showNotification('Función de inicio de tránsito no disponible', 'info');
        }
    },

    completeService(serviceId) {
        if (window.servicesModule && typeof window.servicesModule.updateServiceStatus === 'function') {
            window.servicesModule.updateServiceStatus(serviceId, 'Completado');
            authSystem.showNotification('Servicio marcado como "Completado"', 'success');
            // Recargar la lista después de la acción
            setTimeout(() => {
                const container = document.getElementById('operator-services-list');
                if (container) {
                    container.innerHTML = this.renderOperatorServicesList();
                }
            }, 500);
        } else {
            authSystem.showNotification('Función de completar servicio no disponible', 'info');
        }
    }
};