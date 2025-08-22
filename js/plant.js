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

            <!-- Historial de Recepciones -->
            <div class="bg-white rounded-lg shadow">
                <div class="p-6 border-b">
                                        <div class="flex justify-between items-center">
                        <h3 class="text-lg font-semibold">Historial de Recepciones</h3>
                        <div class="flex items-center space-x-3">
                            <input type="date" id="reception-date-filter" 
                                   class="px-3 py-1 text-sm border rounded focus:outline-none focus:border-blue-500"
                                   placeholder="Filtrar por fecha">
                            <input type="text" id="reception-manifest-filter" 
                                   class="px-3 py-1 text-sm border rounded focus:outline-none focus:border-blue-500"
                                   placeholder="Filtrar por manifiesto">
                            <button onclick="plantModule.filterReceptionHistory()" 
                                    class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                                <i class="fas fa-search mr-1"></i>Buscar
                            </button>
                            <button onclick="plantModule.clearReceptionFilters()" 
                                    class="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600">
                                <i class="fas fa-times mr-1"></i>Limpiar
                            </button>
                        </div>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manifiesto</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha/Hora</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehículo</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peso Total</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200" id="reception-history-table">
                            ${this.renderReceptionHistoryRows()}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Modal containers -->
            <div id="plant-modal-container"></div>
        `;
        
        this.renderReceptionForm(document.getElementById('reception-form'));
        this.initReceptionForm();
        

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
                                            <div><strong>Técnico:</strong> ${reception.operator}</div>
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
                        printWindow.document.write(`<p><strong>Técnico de Planta:</strong> ${reception.operator}</p><p><strong>Notas:</strong> ${reception.notes || 'N/A'}</p>`);
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
                            <input type="hidden" id="reception-status" value="Procesado">
                            <div class="w-full p-3 border border-gray-300 rounded-lg bg-gray-100">
                                <span class="text-gray-700 font-medium">Procesado</span>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Técnico Responsable</label>
                            <input type="text" id="reception-operator" 
                                                                        value="${app.currentUser?.name || 'Técnico de Planta'}" 
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

            // Actualizar la tabla de historial
            this.updateReceptionHistoryTable();

            // Mostrar notificación de éxito
            authSystem.showNotification(`Recepción ${receptionData.manifestNumber} registrada exitosamente`, 'success');

            // Limpiar formulario
            this.clearForm();

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
    updateReceptionHistoryTable() {
        const tableBody = document.getElementById('reception-history-table');
        if (tableBody) {
            tableBody.innerHTML = this.renderReceptionHistoryRows();
        }
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
            document.getElementById('reception-operator').value = app.currentUser?.name || 'Técnico de Planta';
            
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



    renderReceptionHistoryRows() {
        if (!this.receptions || this.receptions.length === 0) {
            return `
                <tr>
                    <td colspan="5" class="px-6 py-8 text-center">
                        <i class="fas fa-truck text-gray-300 text-4xl mb-4"></i>
                        <p class="text-gray-500">No hay recepciones registradas</p>
                    </td>
                </tr>
            `;
        }

        return this.receptions.map(reception => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap font-medium">${reception.manifestNumber}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm">
                        <div>${this.formatDate(reception.arrivalDate)}</div>
                        <div class="text-gray-500">${reception.arrivalTime}</div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${reception.vehicle}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${reception.totalWeight} Ton</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-3">
                        <button onclick="plantModule.viewReception(${reception.id})" 
                                class="text-blue-600 hover:text-blue-900" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="plantModule.editReception(${reception.id})" 
                                class="text-yellow-600 hover:text-yellow-900" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="plantModule.printReception(${reception.id})" 
                                class="text-purple-600 hover:text-purple-900" title="Imprimir">
                            <i class="fas fa-print"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
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

    filterReceptionHistory() {
        const dateFilter = document.getElementById('reception-date-filter').value;
        const manifestFilter = document.getElementById('reception-manifest-filter').value;
        const tableBody = document.getElementById('reception-history-table');
        
        if (!tableBody) return;
        
        let filteredReceptions = this.receptions;
        
        // Filtrar por fecha
        if (dateFilter) {
            filteredReceptions = filteredReceptions.filter(reception => 
                reception.arrivalDate === dateFilter
            );
        }
        
        // Filtrar por manifiesto
        if (manifestFilter) {
            filteredReceptions = filteredReceptions.filter(reception => 
                reception.manifestNumber.toLowerCase().includes(manifestFilter.toLowerCase())
            );
        }
        
        // Renderizar las filas filtradas
        if (filteredReceptions.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-8 text-center">
                        <i class="fas fa-search text-gray-300 text-4xl mb-4"></i>
                        <p class="text-gray-500">No se encontraron recepciones con los filtros aplicados</p>
                    </td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = filteredReceptions.map(reception => `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap font-medium">${reception.manifestNumber}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm">
                            <div>${this.formatDate(reception.arrivalDate)}</div>
                            <div class="text-gray-500">${reception.arrivalTime}</div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">${reception.vehicle}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">${reception.totalWeight} Ton</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div class="flex space-x-3">
                            <button onclick="plantModule.viewReception(${reception.id})" 
                                    class="text-blue-600 hover:text-blue-900" title="Ver detalles">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button onclick="plantModule.editReception(${reception.id})" 
                                    class="text-yellow-600 hover:text-yellow-900" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="plantModule.printReception(${reception.id})" 
                                    class="text-purple-600 hover:text-purple-900" title="Imprimir">
                                <i class="fas fa-print"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
        
        const filterText = [];
        if (dateFilter) filterText.push(`fecha: ${dateFilter}`);
        if (manifestFilter) filterText.push(`manifiesto: ${manifestFilter}`);
        
        authSystem.showNotification(`Filtro aplicado: ${filterText.length > 0 ? filterText.join(', ') : 'Todos'}`, 'info');
    },

    clearReceptionFilters() {
        document.getElementById('reception-date-filter').value = '';
        document.getElementById('reception-manifest-filter').value = '';
        this.updateReceptionHistoryTable();
        authSystem.showNotification('Filtros limpiados', 'info');
    },

    editReception(id) {
        const reception = this.receptions.find(r => r.id === id);
        if (!reception) return;

        const modalHtml = `
        <div id="edit-reception-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
                <div class="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 class="text-xl font-semibold">Editar Recepción: ${reception.manifestNumber}</h3>
                    <button onclick="document.getElementById('edit-reception-modal').remove()" class="text-gray-500 hover:text-gray-800">&times;</button>
                </div>
                <form id="edit-reception-form" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Número de Manifiesto</label>
                            <input type="text" value="${reception.manifestNumber}" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500" readonly>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Llegada</label>
                            <input type="date" value="${reception.arrivalDate}" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Hora de Llegada</label>
                            <input type="time" value="${reception.arrivalTime}" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Vehículo</label>
                            <input type="text" value="${reception.vehicle}" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Conductor</label>
                            <input type="text" value="${reception.driver}" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Peso Total (Ton)</label>
                            <input type="number" step="0.1" value="${reception.totalWeight}" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                            <select class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                <option value="Pendiente" ${reception.status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                                <option value="En Proceso" ${reception.status === 'En Proceso' ? 'selected' : ''}>En Proceso</option>
                                <option value="Procesado" ${reception.status === 'Procesado' ? 'selected' : ''}>Procesado</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                        <textarea rows="3" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">${reception.notes || ''}</textarea>
                    </div>
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" onclick="document.getElementById('edit-reception-modal').remove()" class="px-4 py-2 border rounded-lg hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    printReception(id) {
        const reception = this.receptions.find(r => r.id === id);
        if (!reception) return;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Recepción ${reception.manifestNumber}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                    .header h1 { margin: 0; color: #333; }
                    .header h2 { margin: 5px 0; color: #666; }
                    .info-section { margin-bottom: 20px; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
                    .info-item { margin-bottom: 10px; }
                    .info-label { font-weight: bold; color: #333; }
                    .info-value { color: #666; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    .notes { margin-top: 20px; padding: 10px; background-color: #f9f9f9; border-left: 4px solid #333; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Recepción de Residuos</h1>
                    <h2>Manifiesto: ${reception.manifestNumber}</h2>
                    <p>Fecha de impresión: ${new Date().toLocaleDateString()}</p>
                </div>
                
                <div class="info-section">
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Fecha y Hora:</span>
                            <span class="info-value">${this.formatDate(reception.arrivalDate)} ${reception.arrivalTime}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Vehículo:</span>
                            <span class="info-value">${reception.vehicle}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Conductor:</span>
                            <span class="info-value">${reception.driver}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Peso Total:</span>
                            <span class="info-value">${reception.totalWeight} Ton</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Estado:</span>
                            <span class="info-value">${reception.status}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Técnico:</span>
                            <span class="info-value">${reception.operator}</span>
                        </div>
                    </div>
                </div>
                
                <div class="info-section">
                    <h3>Clasificación de Materiales</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Tipo de Residuo</th>
                                <th>Peso (Ton)</th>
                                <th>Destino</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${reception.classifications.map(c => `
                                <tr>
                                    <td>${c.type}</td>
                                    <td>${c.weight}</td>
                                    <td>${c.destination}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                ${reception.notes ? `
                    <div class="notes">
                        <h3>Notas y Observaciones</h3>
                        <p>${reception.notes}</p>
                    </div>
                ` : ''}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    },

    filterReceptions(filter) {
        authSystem.showNotification(`Filtro "${filter}" aplicado`, 'info');
        // Aquí se implementaría la lógica de filtrado
    },






};