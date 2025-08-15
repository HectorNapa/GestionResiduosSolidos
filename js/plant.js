window.plantModule = {
    receptions: [
        {
            id: 1,
            manifestNumber: 'M-2024-001',
            arrivalDate: '2024-01-15',
            arrivalTime: '14:30',
            vehicle: 'C-001',
            driver: 'Carlos Rodríguez',
            totalWeight: '15.6',
            status: 'Procesado',
            classifications: [
                { type: 'Orgánico', weight: '12.3', destination: 'Compostaje' },
                { type: 'Reciclable', weight: '3.3', destination: 'Centro de Reciclaje' }
            ],
            operator: 'María González',
            notes: 'Material en buenas condiciones'
        }
    ],

    processingCapacity: {
        current: 85,
        maximum: 200,
        organic: 45,
        recyclable: 25,
        nonRecyclable: 15
    },

    load() {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="mb-6">
                <div class="flex justify-between items-center">
                    <h1 class="text-3xl font-bold text-gray-800">Recepción y Manejo en Planta</h1>
                    <button onclick="plantModule.showReceptionModal()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                        <i class="fas fa-plus mr-2"></i>Nueva Recepción
                    </button>
                </div>
                <p class="text-gray-600">Gestiona la recepción, clasificación y procesamiento de residuos</p>
            </div>

            <!-- Capacity Status -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-blue-100">Capacidad Actual</p>
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
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-green-100">Orgánico</p>
                            <p class="text-3xl font-bold">${this.processingCapacity.organic} <span class="text-lg">Ton</span></p>
                        </div>
                        <i class="fas fa-leaf text-4xl text-green-200"></i>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-yellow-100">Reciclable</p>
                            <p class="text-3xl font-bold">${this.processingCapacity.recyclable} <span class="text-lg">Ton</span></p>
                        </div>
                        <i class="fas fa-recycle text-4xl text-yellow-200"></i>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-red-100">No Reciclable</p>
                            <p class="text-3xl font-bold">${this.processingCapacity.nonRecyclable} <span class="text-lg">Ton</span></p>
                        </div>
                        <i class="fas fa-trash text-4xl text-red-200"></i>
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Reception Form -->
                <div class="lg:col-span-2 bg-white rounded-lg shadow">
                    <div class="p-6 border-b">
                        <h3 class="text-lg font-semibold">Registro de Recepción</h3>
                    </div>
                    <div class="p-6">
                        <form id="reception-form" class="space-y-4">
                            <!-- Manifest Information -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Número de Manifiesto *</label>
                                    <input type="text" id="manifest-number" required 
                                           class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                           placeholder="M-2024-XXX">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Vehículo</label>
                                    <input type="text" id="vehicle-code" 
                                           class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                           placeholder="Código del vehículo" readonly>
                                </div>
                            </div>

                            <!-- Arrival Information -->
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Llegada *</label>
                                    <input type="date" id="arrival-date" required 
                                           class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Hora de Llegada *</label>
                                    <input type="time" id="arrival-time" required 
                                           class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Peso Total (Ton) *</label>
                                    <input type="number" id="total-weight" required step="0.1" min="0" 
                                           class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                </div>
                            </div>

                            <!-- Classification Section -->
                            <div class="border-t pt-4">
                                <h4 class="font-medium mb-3">Clasificación de Residuos</h4>
                                <div id="classification-details">
                                    <div class="classification-item grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                                        <select class="px-3 py-2 border rounded-lg waste-type">
                                            <option value="organico">Orgánico</option>
                                            <option value="reciclable">Reciclable</option>
                                            <option value="no-reciclable">No Reciclable</option>
                                            <option value="peligroso">Peligroso</option>
                                        </select>
                                        <input type="number" placeholder="Peso (Ton)" step="0.1" class="px-3 py-2 border rounded-lg waste-weight">
                                        <select class="px-3 py-2 border rounded-lg destination">
                                            <option value="compostaje">Compostaje</option>
                                            <option value="reciclaje">Centro de Reciclaje</option>
                                            <option value="relleno">Relleno Sanitario</option>
                                            <option value="incineracion">Incineración</option>
                                            <option value="tratamiento-especial">Tratamiento Especial</option>
                                        </select>
                                        <button type="button" onclick="this.parentElement.remove()" class="bg-red-500 text-white px-3 py-2 rounded-lg">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                                <button type="button" onclick="plantModule.addClassificationItem()" 
                                        class="bg-green-600 text-white px-3 py-1 rounded text-sm">
                                    <i class="fas fa-plus mr-1"></i>Agregar Clasificación
                                </button>
                            </div>

                            <!-- Quality Control -->
                            <div class="border-t pt-4">
                                <h4 class="font-medium mb-3">Control de Calidad</h4>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Estado del Material</label>
                                        <select id="material-condition" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                            <option value="excelente">Excelente</option>
                                            <option value="bueno">Bueno</option>
                                            <option value="regular">Regular</option>
                                            <option value="malo">Malo</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Nivel de Contaminación</label>
                                        <select id="contamination-level" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                            <option value="bajo">Bajo</option>
                                            <option value="medio">Medio</option>
                                            <option value="alto">Alto</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <!-- Photos and Evidence -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Evidencia Fotográfica</label>
                                <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                    <i class="fas fa-camera text-3xl text-gray-400 mb-2"></i>
                                    <p class="text-gray-600">Fotos del estado del material recibido</p>
                                    <input type="file" id="evidence-photos" multiple accept="image/*" class="hidden">
                                </div>
                            </div>

                            <!-- Notes -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                                <textarea id="reception-notes" rows="3" 
                                          class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                          placeholder="Observaciones sobre la recepción y clasificación..."></textarea>
                            </div>

                            <!-- Form Actions -->
                            <div class="flex justify-end space-x-4 pt-4 border-t">
                                <button type="button" onclick="plantModule.generateReceiptDocument()" 
                                        class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                                    <i class="fas fa-file-alt mr-2"></i>Generar Recibo
                                </button>
                                <button type="submit" 
                                        class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    <i class="fas fa-save mr-2"></i>Registrar Recepción
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Sidebar -->
                <div class="space-y-6">
                    <!-- Recent Receptions -->
                    <div class="bg-white rounded-lg shadow">
                        <div class="p-4 border-b">
                            <h3 class="font-semibold">Recepciones de Hoy</h3>
                        </div>
                        <div class="p-4 space-y-3">
                            ${this.receptions.map(reception => `
                                <div class="border rounded-lg p-3">
                                    <div class="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 class="font-medium text-sm">${reception.manifestNumber}</h4>
                                            <p class="text-xs text-gray-600">${reception.arrivalTime}</p>
                                        </div>
                                        <span class="px-2 py-1 text-xs rounded-full ${this.getStatusClass(reception.status)}">
                                            ${reception.status}
                                        </span>
                                    </div>
                                    <div class="text-xs text-gray-600 space-y-1">
                                        <div>Vehículo: ${reception.vehicle}</div>
                                        <div>Peso: ${reception.totalWeight} Ton</div>
                                        <div>Operador: ${reception.operator}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Capacity Alert -->
                    <div class="bg-white rounded-lg shadow">
                        <div class="p-4 border-b">
                            <h3 class="font-semibold">Estado de Capacidad</h3>
                        </div>
                        <div class="p-4">
                            <div class="mb-4">
                                <div class="flex justify-between text-sm mb-1">
                                    <span>Capacidad Utilizada</span>
                                    <span>${this.processingCapacity.current}%</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-blue-600 h-2 rounded-full" style="width: ${this.processingCapacity.current}%"></div>
                                </div>
                            </div>
                            ${this.processingCapacity.current > 90 ? `
                                <div class="bg-red-50 border-l-4 border-red-400 p-3 text-sm">
                                    <p class="text-red-700">⚠️ Capacidad crítica alcanzada</p>
                                </div>
                            ` : this.processingCapacity.current > 75 ? `
                                <div class="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm">
                                    <p class="text-yellow-700">⚠️ Capacidad alta</p>
                                </div>
                            ` : `
                                <div class="bg-green-50 border-l-4 border-green-400 p-3 text-sm">
                                    <p class="text-green-700">✓ Capacidad disponible</p>
                                </div>
                            `}
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="bg-white rounded-lg shadow">
                        <div class="p-4 border-b">
                            <h3 class="font-semibold">Acciones Rápidas</h3>
                        </div>
                        <div class="p-4 space-y-2">
                            <button onclick="plantModule.viewDailyReport()" 
                                    class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 text-sm">
                                <i class="fas fa-chart-bar mr-2"></i>Reporte Diario
                            </button>
                            <button onclick="plantModule.scheduleDisposal()" 
                                    class="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 text-sm">
                                <i class="fas fa-truck mr-2"></i>Programar Disposición
                            </button>
                            <button onclick="plantModule.emergencyAlert()" 
                                    class="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 text-sm">
                                <i class="fas fa-exclamation-triangle mr-2"></i>Alerta de Emergencia
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Receptions Table -->
            <div class="mt-6 bg-white rounded-lg shadow">
                <div class="p-6 border-b">
                    <h3 class="text-lg font-semibold">Historial de Recepciones</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manifiesto</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha/Hora</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehículo</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peso Total</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operador</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            ${this.receptions.map(reception => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 whitespace-nowrap font-medium">${reception.manifestNumber}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="text-sm">
                                            <div>${this.formatDate(reception.arrivalDate)}</div>
                                            <div class="text-gray-500">${reception.arrivalTime}</div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">${reception.vehicle}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">${reception.totalWeight} Ton</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-2 py-1 text-xs rounded-full ${this.getStatusClass(reception.status)}">
                                            ${reception.status}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">${reception.operator}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div class="flex space-x-2">
                                            <button onclick="plantModule.viewReception(${reception.id})" 
                                                    class="text-blue-600 hover:text-blue-900" title="Ver detalles">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                            <button onclick="plantModule.generateReport(${reception.id})" 
                                                    class="text-green-600 hover:text-green-900" title="Generar reporte">
                                                <i class="fas fa-file-alt"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        this.initReceptionForm();
    },

    initReceptionForm() {
        const form = document.getElementById('reception-form');
        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toTimeString().slice(0, 5);

        document.getElementById('arrival-date').value = today;
        document.getElementById('arrival-time').value = now;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveReception();
        });

        // Auto-populate vehicle info when manifest is entered
        document.getElementById('manifest-number').addEventListener('blur', (e) => {
            this.loadManifestData(e.target.value);
        });
    },

    loadManifestData(manifestNumber) {
        // Simulate loading manifest data
        if (manifestNumber === 'M-2024-001') {
            document.getElementById('vehicle-code').value = 'C-001';
            authSystem.showNotification('Datos del manifiesto cargados', 'success');
        }
    },

    addClassificationItem() {
        const classificationDetails = document.getElementById('classification-details');
        const newItem = document.createElement('div');
        newItem.className = 'classification-item grid grid-cols-1 md:grid-cols-4 gap-2 mb-2';
        newItem.innerHTML = `
            <select class="px-3 py-2 border rounded-lg waste-type">
                <option value="organico">Orgánico</option>
                <option value="reciclable">Reciclable</option>
                <option value="no-reciclable">No Reciclable</option>
                <option value="peligroso">Peligroso</option>
            </select>
            <input type="number" placeholder="Peso (Ton)" step="0.1" class="px-3 py-2 border rounded-lg waste-weight">
            <select class="px-3 py-2 border rounded-lg destination">
                <option value="compostaje">Compostaje</option>
                <option value="reciclaje">Centro de Reciclaje</option>
                <option value="relleno">Relleno Sanitario</option>
                <option value="incineracion">Incineración</option>
                <option value="tratamiento-especial">Tratamiento Especial</option>
            </select>
            <button type="button" onclick="this.parentElement.remove()" class="bg-red-500 text-white px-3 py-2 rounded-lg">
                <i class="fas fa-trash"></i>
            </button>
        `;
        classificationDetails.appendChild(newItem);
    },

    saveReception() {
        const formData = {
            manifestNumber: document.getElementById('manifest-number').value,
            vehicleCode: document.getElementById('vehicle-code').value,
            arrivalDate: document.getElementById('arrival-date').value,
            arrivalTime: document.getElementById('arrival-time').value,
            totalWeight: document.getElementById('total-weight').value,
            materialCondition: document.getElementById('material-condition').value,
            contaminationLevel: document.getElementById('contamination-level').value,
            notes: document.getElementById('reception-notes').value
        };

        // Validate required fields
        if (!formData.manifestNumber || !formData.arrivalDate || !formData.arrivalTime || !formData.totalWeight) {
            authSystem.showNotification('Por favor completa todos los campos requeridos', 'error');
            return;
        }

        // Collect classification data
        const classifications = [];
        document.querySelectorAll('.classification-item').forEach(item => {
            const wasteType = item.querySelector('.waste-type').value;
            const weight = item.querySelector('.waste-weight').value;
            const destination = item.querySelector('.destination').value;
            
            if (weight) {
                classifications.push({
                    type: wasteType,
                    weight: parseFloat(weight),
                    destination: destination
                });
            }
        });

        if (classifications.length === 0) {
            authSystem.showNotification('Debe agregar al menos una clasificación de residuo', 'error');
            return;
        }

        // Validate total weight matches classifications
        const classificationTotal = classifications.reduce((sum, item) => sum + item.weight, 0);
        const totalWeight = parseFloat(formData.totalWeight);
        
        if (Math.abs(classificationTotal - totalWeight) > 0.1) {
            authSystem.showNotification('El peso total no coincide con la suma de las clasificaciones', 'error');
            return;
        }

        const newReception = {
            id: this.receptions.length + 1,
            ...formData,
            classifications,
            status: 'Procesado',
            operator: app.currentUser.name,
            processedAt: new Date().toISOString()
        };

        this.receptions.push(newReception);

        // Update processing capacity
        this.updateCapacity(classifications);

        authSystem.showNotification('Recepción registrada exitosamente', 'success');
        
        // Reset form
        document.getElementById('reception-form').reset();
        document.getElementById('classification-details').innerHTML = `
            <div class="classification-item grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                <select class="px-3 py-2 border rounded-lg waste-type">
                    <option value="organico">Orgánico</option>
                    <option value="reciclable">Reciclable</option>
                    <option value="no-reciclable">No Reciclable</option>
                    <option value="peligroso">Peligroso</option>
                </select>
                <input type="number" placeholder="Peso (Ton)" step="0.1" class="px-3 py-2 border rounded-lg waste-weight">
                <select class="px-3 py-2 border rounded-lg destination">
                    <option value="compostaje">Compostaje</option>
                    <option value="reciclaje">Centro de Reciclaje</option>
                    <option value="relleno">Relleno Sanitario</option>
                    <option value="incineracion">Incineración</option>
                    <option value="tratamiento-especial">Tratamiento Especial</option>
                </select>
                <button type="button" onclick="this.parentElement.remove()" class="bg-red-500 text-white px-3 py-2 rounded-lg">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // Reload the page
        this.load();
    },

    updateCapacity(classifications) {
        classifications.forEach(classification => {
            switch(classification.type) {
                case 'organico':
                    this.processingCapacity.organic += classification.weight;
                    break;
                case 'reciclable':
                    this.processingCapacity.recyclable += classification.weight;
                    break;
                case 'no-reciclable':
                    this.processingCapacity.nonRecyclable += classification.weight;
                    break;
            }
        });

        // Recalculate current percentage
        const total = this.processingCapacity.organic + this.processingCapacity.recyclable + this.processingCapacity.nonRecyclable;
        this.processingCapacity.current = Math.round((total / this.processingCapacity.maximum) * 100);
    },

    generateReceiptDocument() {
        authSystem.showNotification('Generando documento de recibo...', 'info');
        setTimeout(() => {
            authSystem.showNotification('Documento de recibo generado', 'success');
        }, 1500);
    },

    viewReception(id) {
        const reception = this.receptions.find(r => r.id === id);
        if (!reception) return;

        authSystem.showNotification('Función de visualización de recepción en desarrollo', 'info');
    },

    generateReport(id) {
        authSystem.showNotification('Generando reporte de recepción...', 'info');
        setTimeout(() => {
            authSystem.showNotification('Reporte generado exitosamente', 'success');
        }, 1500);
    },

    viewDailyReport() {
        authSystem.showNotification('Generando reporte diario...', 'info');
        setTimeout(() => {
            authSystem.showNotification('Reporte diario generado', 'success');
        }, 2000);
    },

    scheduleDisposal() {
        authSystem.showNotification('Función de programación de disposición en desarrollo', 'info');
    },

    emergencyAlert() {
        if (confirm('¿Está seguro de que desea activar una alerta de emergencia?')) {
            authSystem.showNotification('🚨 Alerta de emergencia activada', 'error');
        }
    },

    showReceptionModal() {
        // Scroll to form
        document.getElementById('reception-form').scrollIntoView({ behavior: 'smooth' });
        authSystem.showNotification('Complete el formulario para registrar una nueva recepción', 'info');
    },

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
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }
};