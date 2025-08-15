window.manifestsModule = {
    manifests: [
        {
            id: 1,
            manifestNumber: 'M-2024-001',
            date: '2024-01-15',
            route: 'R-001',
            vehicle: 'C-001',
            driver: 'Carlos Rodríguez',
            origin: 'Zona Norte - Múltiples puntos',
            destination: 'Planta de Tratamiento EcoGestión',
            totalWeight: '15.6',
            totalVolume: '28.4',
            wasteTypes: [
                { type: 'Orgánico', weight: '12.3', percentage: '78.8' },
                { type: 'Reciclable', weight: '3.3', percentage: '21.2' }
            ],
            status: 'Generado',
            generatedBy: 'Sistema',
            collections: [
                { client: 'Empresa ABC', weight: '2.8', type: 'Orgánico' },
                { client: 'Hotel Plaza', weight: '8.9', type: 'Orgánico' },
                { client: 'Oficinas XYZ', weight: '3.9', type: 'Reciclable' }
            ]
        }
    ],

    load() {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="mb-6">
                <div class="flex justify-between items-center">
                    <h1 class="text-3xl font-bold text-gray-800">Gestión de Manifiestos</h1>
                    <div class="flex space-x-2">
                        <button onclick="manifestsModule.generateManifest()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                            <i class="fas fa-plus mr-2"></i>Generar Manifiesto
                        </button>
                        <button onclick="manifestsModule.importData()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
                            <i class="fas fa-upload mr-2"></i>Importar Datos
                        </button>
                    </div>
                </div>
                <p class="text-gray-600">Documenta el transporte de residuos desde la recolección hasta la planta</p>
            </div>

            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-blue-100">Manifiestos Hoy</p>
                            <p class="text-3xl font-bold">8</p>
                        </div>
                        <i class="fas fa-file-alt text-4xl text-blue-200"></i>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-green-100">Peso Total</p>
                            <p class="text-3xl font-bold">124.8 <span class="text-lg">Ton</span></p>
                        </div>
                        <i class="fas fa-weight text-4xl text-green-200"></i>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-yellow-100">En Tránsito</p>
                            <p class="text-3xl font-bold">3</p>
                        </div>
                        <i class="fas fa-truck text-4xl text-yellow-200"></i>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-purple-100">Recibidos</p>
                            <p class="text-3xl font-bold">5</p>
                        </div>
                        <i class="fas fa-check-circle text-4xl text-purple-200"></i>
                    </div>
                </div>
            </div>

            <!-- Manifest Generator -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div class="lg:col-span-2 bg-white rounded-lg shadow">
                    <div class="p-6 border-b">
                        <h3 class="text-lg font-semibold">Generar Nuevo Manifiesto</h3>
                    </div>
                    <div class="p-6">
                        <form id="manifest-form" class="space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Ruta *</label>
                                    <select id="manifest-route" required class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                        <option value="">Seleccionar ruta</option>
                                        <option value="R-001">R-001 - Ruta Norte A</option>
                                        <option value="R-002">R-002 - Ruta Centro B</option>
                                        <option value="R-003">R-003 - Ruta Sur C</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Transporte *</label>
                                    <input type="date" id="transport-date" required 
                                           class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Vehículo *</label>
                                    <select id="manifest-vehicle" required class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                        <option value="">Seleccionar vehículo</option>
                                        <option value="C-001">C-001 - Mercedes Actros</option>
                                        <option value="C-002">C-002 - Volvo FH</option>
                                        <option value="C-003">C-003 - Scania R450</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Conductor *</label>
                                    <select id="manifest-driver" required class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                        <option value="">Seleccionar conductor</option>
                                        <option value="carlos">Carlos Rodríguez</option>
                                        <option value="luis">Luis Martínez</option>
                                        <option value="miguel">Miguel Torres</option>
                                    </select>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Punto de Origen *</label>
                                    <input type="text" id="origin-point" required 
                                           class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                           placeholder="Dirección o zona de origen">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Destino *</label>
                                    <select id="destination" required class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                        <option value="">Seleccionar destino</option>
                                        <option value="planta-principal">Planta Principal EcoGestión</option>
                                        <option value="centro-reciclaje">Centro de Reciclaje Norte</option>
                                        <option value="relleno-sanitario">Relleno Sanitario Municipal</option>
                                        <option value="planta-tratamiento">Planta de Tratamiento Especial</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Waste Details Section -->
                            <div class="border-t pt-4">
                                <h4 class="font-medium mb-3">Detalles de Residuos</h4>
                                <div id="waste-details">
                                    <div class="waste-item grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                                        <select class="px-3 py-2 border rounded-lg">
                                            <option value="organico">Orgánico</option>
                                            <option value="reciclable">Reciclable</option>
                                            <option value="no-reciclable">No Reciclable</option>
                                            <option value="peligroso">Peligroso</option>
                                        </select>
                                        <input type="number" placeholder="Peso (Ton)" step="0.1" class="px-3 py-2 border rounded-lg">
                                        <input type="number" placeholder="Volumen (m³)" step="0.1" class="px-3 py-2 border rounded-lg">
                                        <button type="button" onclick="this.parentElement.remove()" class="bg-red-500 text-white px-3 py-2 rounded-lg">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                                <button type="button" onclick="manifestsModule.addWasteItem()" 
                                        class="bg-green-600 text-white px-3 py-1 rounded text-sm">
                                    <i class="fas fa-plus mr-1"></i>Agregar Tipo de Residuo
                                </button>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                                <textarea id="manifest-notes" rows="3"
                                          class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                          placeholder="Observaciones especiales para el transporte..."></textarea>
                            </div>

                            <div class="flex justify-end space-x-4 pt-4 border-t">
                                <button type="button" onclick="manifestsModule.previewManifest()" 
                                        class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                                    <i class="fas fa-eye mr-2"></i>Vista Previa
                                </button>
                                <button type="submit" 
                                        class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    <i class="fas fa-file-alt mr-2"></i>Generar Manifiesto
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Recent Manifests -->
                <div class="bg-white rounded-lg shadow">
                    <div class="p-4 border-b">
                        <h3 class="font-semibold">Manifiestos Recientes</h3>
                    </div>
                    <div class="p-4 space-y-3">
                        ${this.manifests.map(manifest => `
                            <div class="border rounded-lg p-3">
                                <div class="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 class="font-medium text-sm">${manifest.manifestNumber}</h4>
                                        <p class="text-xs text-gray-600">${this.formatDate(manifest.date)}</p>
                                    </div>
                                    <span class="px-2 py-1 text-xs rounded-full ${this.getStatusClass(manifest.status)}">
                                        ${manifest.status}
                                    </span>
                                </div>
                                <div class="text-xs text-gray-600 space-y-1">
                                    <div>Ruta: ${manifest.route}</div>
                                    <div>Peso: ${manifest.totalWeight} Ton</div>
                                    <div>Conductor: ${manifest.driver}</div>
                                </div>
                                <div class="mt-2 flex space-x-2">
                                    <button onclick="manifestsModule.viewManifest(${manifest.id})" 
                                            class="text-blue-600 hover:text-blue-900 text-xs">
                                        <i class="fas fa-eye mr-1"></i>Ver
                                    </button>
                                    <button onclick="manifestsModule.downloadManifest(${manifest.id})" 
                                            class="text-green-600 hover:text-green-900 text-xs">
                                        <i class="fas fa-download mr-1"></i>PDF
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Manifests Table -->
            <div class="bg-white rounded-lg shadow">
                <div class="p-6 border-b">
                    <h3 class="text-lg font-semibold">Lista de Manifiestos</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ruta</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conductor</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peso Total</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            ${this.manifests.map(manifest => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 whitespace-nowrap font-medium">${manifest.manifestNumber}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">${this.formatDate(manifest.date)}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">${manifest.route}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">${manifest.driver}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">${manifest.totalWeight} Ton</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-2 py-1 text-xs rounded-full ${this.getStatusClass(manifest.status)}">
                                            ${manifest.status}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div class="flex space-x-2">
                                            <button onclick="manifestsModule.viewManifest(${manifest.id})" 
                                                    class="text-blue-600 hover:text-blue-900" title="Ver detalles">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                            <button onclick="manifestsModule.downloadManifest(${manifest.id})" 
                                                    class="text-green-600 hover:text-green-900" title="Descargar PDF">
                                                <i class="fas fa-download"></i>
                                            </button>
                                            <button onclick="manifestsModule.editManifest(${manifest.id})" 
                                                    class="text-yellow-600 hover:text-yellow-900" title="Editar">
                                                <i class="fas fa-edit"></i>
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

        this.initManifestForm();
    },

    initManifestForm() {
        const form = document.getElementById('manifest-form');
        const today = new Date().toISOString().split('T')[0];
        
        document.getElementById('transport-date').value = today;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveManifest();
        });
    },

    addWasteItem() {
        const wasteDetails = document.getElementById('waste-details');
        const newItem = document.createElement('div');
        newItem.className = 'waste-item grid grid-cols-1 md:grid-cols-4 gap-2 mb-2';
        newItem.innerHTML = `
            <select class="px-3 py-2 border rounded-lg">
                <option value="organico">Orgánico</option>
                <option value="reciclable">Reciclable</option>
                <option value="no-reciclable">No Reciclable</option>
                <option value="peligroso">Peligroso</option>
            </select>
            <input type="number" placeholder="Peso (Ton)" step="0.1" class="px-3 py-2 border rounded-lg">
            <input type="number" placeholder="Volumen (m³)" step="0.1" class="px-3 py-2 border rounded-lg">
            <button type="button" onclick="this.parentElement.remove()" class="bg-red-500 text-white px-3 py-2 rounded-lg">
                <i class="fas fa-trash"></i>
            </button>
        `;
        wasteDetails.appendChild(newItem);
    },

    saveManifest() {
        const formData = {
            route: document.getElementById('manifest-route').value,
            transportDate: document.getElementById('transport-date').value,
            vehicle: document.getElementById('manifest-vehicle').value,
            driver: document.getElementById('manifest-driver').value,
            origin: document.getElementById('origin-point').value,
            destination: document.getElementById('destination').value,
            notes: document.getElementById('manifest-notes').value
        };

        // Validate required fields
        if (!formData.route || !formData.transportDate || !formData.vehicle || !formData.driver) {
            authSystem.showNotification('Por favor completa todos los campos requeridos', 'error');
            return;
        }

        // Collect waste items
        const wasteItems = [];
        document.querySelectorAll('.waste-item').forEach(item => {
            const selects = item.querySelectorAll('select');
            const inputs = item.querySelectorAll('input');
            if (inputs[0].value && inputs[1].value) {
                wasteItems.push({
                    type: selects[0].value,
                    weight: parseFloat(inputs[0].value),
                    volume: parseFloat(inputs[1].value)
                });
            }
        });

        if (wasteItems.length === 0) {
            authSystem.showNotification('Debe agregar al menos un tipo de residuo', 'error');
            return;
        }

        // Calculate totals
        const totalWeight = wasteItems.reduce((sum, item) => sum + item.weight, 0);
        const totalVolume = wasteItems.reduce((sum, item) => sum + item.volume, 0);

        // Generate manifest number
        const manifestNumber = this.generateManifestNumber();

        const newManifest = {
            id: this.manifests.length + 1,
            manifestNumber,
            date: formData.transportDate,
            route: formData.route,
            vehicle: formData.vehicle,
            driver: formData.driver,
            origin: formData.origin,
            destination: formData.destination,
            totalWeight: totalWeight.toFixed(1),
            totalVolume: totalVolume.toFixed(1),
            wasteTypes: wasteItems,
            status: 'Generado',
            generatedBy: app.currentUser.name,
            notes: formData.notes,
            createdAt: new Date().toISOString()
        };

        this.manifests.push(newManifest);

        authSystem.showNotification('Manifiesto generado exitosamente', 'success');
        
        // Reset form
        document.getElementById('manifest-form').reset();
        document.getElementById('waste-details').innerHTML = `
            <div class="waste-item grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                <select class="px-3 py-2 border rounded-lg">
                    <option value="organico">Orgánico</option>
                    <option value="reciclable">Reciclable</option>
                    <option value="no-reciclable">No Reciclable</option>
                    <option value="peligroso">Peligroso</option>
                </select>
                <input type="number" placeholder="Peso (Ton)" step="0.1" class="px-3 py-2 border rounded-lg">
                <input type="number" placeholder="Volumen (m³)" step="0.1" class="px-3 py-2 border rounded-lg">
                <button type="button" onclick="this.parentElement.remove()" class="bg-red-500 text-white px-3 py-2 rounded-lg">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // Reload the page to show updated data
        this.load();
    },

    generateManifestNumber() {
        const year = new Date().getFullYear();
        const count = this.manifests.length + 1;
        return `M-${year}-${count.toString().padStart(3, '0')}`;
    },

    previewManifest() {
        authSystem.showNotification('Vista previa del manifiesto en desarrollo', 'info');
    },

    viewManifest(id) {
        const manifest = this.manifests.find(m => m.id === id);
        if (!manifest) return;

        // Create modal for manifest details
        const modalHtml = `
            <div id="manifest-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full m-4 max-h-screen overflow-y-auto">
                    <div class="p-6 border-b">
                        <div class="flex justify-between items-center">
                            <h2 class="text-2xl font-bold">Manifiesto ${manifest.manifestNumber}</h2>
                            <button onclick="document.getElementById('manifest-modal').remove()" 
                                    class="text-gray-500 hover:text-gray-700">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>
                    </div>
                    <div class="p-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <h3 class="font-semibold mb-2">Información de Transporte</h3>
                                <div class="space-y-2 text-sm">
                                    <div><strong>Fecha:</strong> ${this.formatDate(manifest.date)}</div>
                                    <div><strong>Ruta:</strong> ${manifest.route}</div>
                                    <div><strong>Vehículo:</strong> ${manifest.vehicle}</div>
                                    <div><strong>Conductor:</strong> ${manifest.driver}</div>
                                </div>
                            </div>
                            <div>
                                <h3 class="font-semibold mb-2">Origen y Destino</h3>
                                <div class="space-y-2 text-sm">
                                    <div><strong>Origen:</strong> ${manifest.origin}</div>
                                    <div><strong>Destino:</strong> ${manifest.destination}</div>
                                    <div><strong>Peso Total:</strong> ${manifest.totalWeight} Ton</div>
                                    <div><strong>Volumen Total:</strong> ${manifest.totalVolume} m³</div>
                                </div>
                            </div>
                        </div>
                        <div class="mb-6">
                            <h3 class="font-semibold mb-2">Tipos de Residuos</h3>
                            <div class="overflow-x-auto">
                                <table class="min-w-full border">
                                    <thead class="bg-gray-50">
                                        <tr>
                                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Peso (Ton)</th>
                                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Volumen (m³)</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-200">
                                        ${manifest.wasteTypes ? manifest.wasteTypes.map(waste => `
                                            <tr>
                                                <td class="px-4 py-2">${waste.type}</td>
                                                <td class="px-4 py-2">${waste.weight}</td>
                                                <td class="px-4 py-2">${waste.volume || 'N/A'}</td>
                                            </tr>
                                        `).join('') : ''}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="flex justify-end space-x-2">
                            <button onclick="manifestsModule.downloadManifest(${manifest.id})" 
                                    class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                                <i class="fas fa-download mr-2"></i>Descargar PDF
                            </button>
                            <button onclick="manifestsModule.editManifest(${manifest.id})" 
                                    class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                <i class="fas fa-edit mr-2"></i>Editar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    downloadManifest(id) {
        authSystem.showNotification('Generando PDF del manifiesto...', 'info');
        setTimeout(() => {
            authSystem.showNotification('PDF del manifiesto descargado', 'success');
        }, 1500);
    },

    editManifest(id) {
        authSystem.showNotification('Función de edición de manifiesto en desarrollo', 'info');
    },

    generateManifest() {
        // Scroll to form
        document.getElementById('manifest-form').scrollIntoView({ behavior: 'smooth' });
        authSystem.showNotification('Complete el formulario para generar un nuevo manifiesto', 'info');
    },

    importData() {
        authSystem.showNotification('Función de importación de datos en desarrollo', 'info');
    },

    getStatusClass(status) {
        const classes = {
            'Generado': 'bg-blue-100 text-blue-800',
            'En Tránsito': 'bg-yellow-100 text-yellow-800',
            'Recibido': 'bg-green-100 text-green-800',
            'Cancelado': 'bg-red-100 text-red-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    },

    formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }
};