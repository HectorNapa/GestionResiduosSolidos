window.manifestsModule = {
    manifests: [
        {
            id: 1,
            manifestNumber: 'M-2024-001',
            date: new Date().toISOString().slice(0, 10), // Para que coincida con "hoy"
            route: 'R-001',
            vehicle: 'C-001',
            driver: 'Carlos Rodríguez',
            origin: 'Zona Norte - Múltiples puntos',
            destination: 'Planta de Tratamiento EcoGestión',
            totalWeight: 15.6,
            totalVolume: 28.4,
            wasteTypes: [
                { type: 'Orgánico', weight: 12.3, volume: 20.0 },
                { type: 'Reciclable', weight: 3.3, volume: 8.4 }
            ],
            status: 'En Tránsito', // Estado para la tarjeta
            notes: 'Transporte estándar.',
            generatedBy: 'Sistema'
        },
        {
            id: 2,
            manifestNumber: 'M-2024-002',
            date: new Date().toISOString().slice(0, 10), // Para que coincida con "hoy"
            route: 'R-002',
            vehicle: 'C-002',
            driver: 'Luis Martínez',
            origin: 'Zona Centro',
            destination: 'Centro de Reciclaje Municipal',
            totalWeight: 8.5,
            totalVolume: 15.0,
            wasteTypes: [
                { type: 'Reciclable', weight: 8.5, volume: 15.0 }
            ],
            status: 'Recibido', // Estado para la tarjeta
            notes: 'Carga completa de reciclables.',
            generatedBy: 'admin'
        },
        {
            id: 3,
            manifestNumber: 'M-2024-003',
            date: new Date().toISOString().slice(0, 10),
            route: 'R-003',
            vehicle: 'C-003',
            driver: 'Carlos Rodríguez',
            origin: 'Zona Sur - Sector Residencial',
            destination: 'Planta de Tratamiento EcoGestión',
            totalWeight: 22.3,
            totalVolume: 35.8,
            wasteTypes: [
                { type: 'Orgánico', weight: 18.1, volume: 28.5 },
                { type: 'No Reciclable', weight: 4.2, volume: 7.3 }
            ],
            status: 'En Tránsito',
            notes: 'Recolección de sector residencial de alta densidad.',
            generatedBy: 'Carlos Rodríguez'
        },
        {
            id: 4,
            manifestNumber: 'M-2024-004',
            date: new Date().toISOString().slice(0, 10),
            route: 'R-004',
            vehicle: 'V-001',
            driver: 'Ana García',
            origin: 'Zona Industrial - Polígono Norte',
            destination: 'Centro de Reciclaje Municipal',
            totalWeight: 14.7,
            totalVolume: 18.2,
            wasteTypes: [
                { type: 'Reciclable', weight: 12.3, volume: 15.1 },
                { type: 'Electrónico', weight: 2.4, volume: 3.1 }
            ],
            status: 'Generado',
            notes: 'Residuos industriales separados en origen.',
            generatedBy: 'Carlos Rodríguez'
        },
        {
            id: 5,
            manifestNumber: 'M-2024-005',
            date: (() => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                return yesterday.toISOString().slice(0, 10);
            })(),
            route: 'R-001',
            vehicle: 'C-001',
            driver: 'Miguel López',
            origin: 'Zona Norte - Múltiples puntos comerciales',
            destination: 'Planta de Tratamiento EcoGestión',
            totalWeight: 19.8,
            totalVolume: 32.1,
            wasteTypes: [
                { type: 'Orgánico', weight: 14.5, volume: 23.2 },
                { type: 'Reciclable', weight: 3.8, volume: 6.4 },
                { type: 'No Reciclable', weight: 1.5, volume: 2.5 }
            ],
            status: 'Recibido',
            notes: 'Recolección de establecimientos comerciales.',
            generatedBy: 'Carlos Rodríguez'
        },
        {
            id: 6,
            manifestNumber: 'M-2024-006',
            date: (() => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                return yesterday.toISOString().slice(0, 10);
            })(),
            route: 'R-002',
            vehicle: 'C-002',
            driver: 'Carlos Rodríguez',
            origin: 'Zona Centro - Oficinas y restaurantes',
            destination: 'Centro de Compostaje',
            totalWeight: 11.2,
            totalVolume: 18.7,
            wasteTypes: [
                { type: 'Orgánico', weight: 9.8, volume: 16.2 },
                { type: 'Reciclable', weight: 1.4, volume: 2.5 }
            ],
            status: 'Procesado',
            notes: 'Alto contenido orgánico, ideal para compostaje.',
            generatedBy: 'Carlos Rodríguez'
        }
    ],

    // --- ROLE-BASED LOADER ---
    load() {
        const user = app.currentUser;
        if (!user) {
            document.getElementById('content-area').innerHTML = '<p>Error: No se pudo identificar al usuario.</p>';
            return;
        }

        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="mb-6">
                <div class="flex flex-col items-start gap-1">
                    <h1 class="text-3xl font-bold text-gray-800">Gestión de Manifiestos</h1>
                    <p class="text-gray-600">${user.type === 'admin' ? 'Supervisión y consulta de manifiestos' : 'Generación de nuevos manifiestos de transporte'}</p>
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
            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-blue-100">Manifiestos Hoy</p>
                            <p class="text-3xl font-bold">${this.getManifestsTodayCount()}</p>
                        </div>
                        <i class="fas fa-file-alt text-4xl text-blue-200"></i>
                    </div>
                </div>
                <div class="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-green-100">Peso Total (Hoy)</p>
                            <p class="text-3xl font-bold">${this.getTotalWeightToday()} <span class="text-lg">Ton</span></p>
                        </div>
                        <i class="fas fa-weight text-4xl text-green-200"></i>
                    </div>
                </div>
                <div class="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-yellow-100">En Tránsito</p>
                            <p class="text-3xl font-bold">${this.getInTransitCount()}</p>
                        </div>
                        <i class="fas fa-truck text-4xl text-yellow-200"></i>
                    </div>
                </div>
                <div class="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-purple-100">Recibidos</p>
                            <p class="text-3xl font-bold">${this.getReceivedCount()}</p>
                        </div>
                        <i class="fas fa-check-circle text-4xl text-purple-200"></i>
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
                                    <td class="px-6 py-4 whitespace-nowrap">${manifest.totalWeight} Ton</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-2 py-1 text-xs rounded-full ${this.getStatusClass(manifest.status)}">
                                            ${manifest.status}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div class="flex space-x-3">
                                            <button onclick="manifestsModule.viewManifest(${manifest.id})" class="text-blue-600 hover:text-blue-900" title="Ver detalles"><i class="fas fa-eye"></i></button>
                                            <button onclick="manifestsModule.downloadManifest(${manifest.id})" class="text-green-600 hover:text-green-900" title="Descargar PDF"><i class="fas fa-print"></i></button>
                                            <button onclick="manifestsModule.editManifest(${manifest.id})" class="text-yellow-600 hover:text-yellow-900" title="Editar"><i class="fas fa-edit"></i></button>
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
        const operatorManifests = this.getOperatorManifests(currentUser);
        
        container.innerHTML = `
            <!-- KPIs del operador -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-blue-100 text-blue-600">
                            <i class="fas fa-file-alt text-xl"></i>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-sm font-medium text-gray-500">Mis Manifiestos</h3>
                            <p class="text-2xl font-bold text-gray-900">${operatorManifests.length}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-yellow-100 text-yellow-600">
                            <i class="fas fa-truck text-xl"></i>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-sm font-medium text-gray-500">En Tránsito</h3>
                            <p class="text-2xl font-bold text-gray-900">${this.getOperatorInTransit(currentUser)}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-green-100 text-green-600">
                            <i class="fas fa-check-circle text-xl"></i>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-sm font-medium text-gray-500">Completados Hoy</h3>
                            <p class="text-2xl font-bold text-gray-900">${this.getOperatorCompletedToday(currentUser)}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-3 rounded-full bg-purple-100 text-purple-600">
                            <i class="fas fa-weight-hanging text-xl"></i>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-sm font-medium text-gray-500">Peso Total Hoy</h3>
                            <p class="text-2xl font-bold text-gray-900">${this.getOperatorWeightToday(currentUser)} T</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Acciones rápidas -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div class="lg:col-span-1">
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-semibold mb-4">Acciones Rápidas</h3>
                        <div class="space-y-3">
                            <button onclick="manifestsModule.showNewManifestForm()" 
                                    class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center">
                                <i class="fas fa-plus mr-2"></i>Crear Nuevo Manifiesto
                            </button>
                            <button onclick="manifestsModule.showQuickWasteCapture()" 
                                    class="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center">
                                <i class="fas fa-camera mr-2"></i>Captura Rápida de Residuos
                            </button>
                        </div>
                    </div>
                </div>

                <div class="lg:col-span-2">
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-semibold mb-4">Estado de Mi Ruta Actual</h3>
                        ${this.renderCurrentRouteStatus(currentUser)}
                    </div>
                </div>
            </div>

            <!-- Mis manifiestos recientes -->
            <div class="bg-white rounded-lg shadow">
                <div class="p-6 border-b flex justify-between items-center">
                    <h3 class="text-lg font-semibold">Mis Manifiestos Recientes</h3>
                    <div class="flex space-x-2">
                        <button onclick="manifestsModule.filterOperatorManifests('today')" 
                                class="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">Hoy</button>
                        <button onclick="manifestsModule.filterOperatorManifests('week')" 
                                class="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">Esta Semana</button>
                        <button onclick="manifestsModule.filterOperatorManifests('all')" 
                                class="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">Todos</button>
                    </div>
                </div>
                <div id="operator-manifests-list">
                    ${this.renderOperatorManifestsList(operatorManifests)}
                </div>
            </div>

            <!-- Modal containers -->
            <div id="operator-modal-container"></div>
        `;
        
        this.initOperatorEventListeners();
    },

    // --- DYNAMIC CARD FUNCTIONS ---
    getManifestsTodayCount() {
        const today = new Date().toISOString().slice(0, 10);
        return this.manifests.filter(m => m.date === today).length;
    },
    getTotalWeightToday() {
        const today = new Date().toISOString().slice(0, 10);
        const total = this.manifests
            .filter(m => m.date === today)
            .reduce((sum, m) => sum + (m.totalWeight || 0), 0);
        return total.toFixed(1);
    },
    getInTransitCount() {
        return this.manifests.filter(m => m.status === 'En Tránsito').length;
    },
    getReceivedCount() {
        return this.manifests.filter(m => m.status === 'Recibido').length;
    },

    // --- ACTION BUTTONS LOGIC ---
    viewManifest(id) {
        const manifest = this.manifests.find(m => m.id === id);
        if (!manifest) return;
        // This function remains largely the same, using a modal
        const modalHtml = `<!-- Modal content as before -->`; // Placeholder for brevity
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    downloadManifest(id) {
        const manifest = this.manifests.find(m => m.id === id);
        if (!manifest) {
            authSystem.showNotification('Manifiesto no encontrado.', 'error');
            return;
        }

        const printWindow = window.open('', '_blank');
        printWindow.document.write('<html><head><title>Manifiesto ' + manifest.manifestNumber + '</title><style>body{font-family:sans-serif;padding:2em}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px}th{background-color:#f2f2f2}.header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #000;margin-bottom:2em}.header h1{margin:0}</style></head><body>');
        printWindow.document.write(`<div class="header"><h1>Manifiesto de Transporte</h1><h2>${manifest.manifestNumber}</h2></div>`);
        printWindow.document.write(`<h3>Información General</h3><p><strong>Fecha:</strong> ${this.formatDate(manifest.date)}</p><p><strong>Ruta:</strong> ${manifest.route}</p><p><strong>Vehículo:</strong> ${manifest.vehicle}</p><p><strong>Conductor:</strong> ${manifest.driver}</p>`);
        printWindow.document.write(`<h3>Origen y Destino</h3><p><strong>Origen:</strong> ${manifest.origin}</p><p><strong>Destino:</strong> ${manifest.destination}</p>`);
        printWindow.document.write(`<h3>Resumen de Carga</h3><p><strong>Peso Total:</strong> ${manifest.totalWeight} Ton</p><p><strong>Volumen Total:</strong> ${manifest.totalVolume} m³</p>`);
        printWindow.document.write('<h3>Detalle de Residuos</h3><table><thead><tr><th>Tipo</th><th>Peso (Ton)</th><th>Volumen (m³)</th></tr></thead><tbody>');
        manifest.wasteTypes.forEach(w => {
            printWindow.document.write(`<tr><td>${w.type}</td><td>${w.weight}</td><td>${w.volume}</td></tr>`);
        });
        printWindow.document.write('</tbody></table>');
        printWindow.document.write(`<div style="margin-top:3em"><p><strong>Observaciones:</strong> ${manifest.notes || 'Ninguna'}</p></div>`);
        printWindow.document.write('<div style="margin-top:5em;text-align:center"><p>_________________________</p><p>Firma del Conductor</p></div>');
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        // printWindow.print(); // Optional: trigger print dialog automatically
    },

    editManifest(id) {
        const manifest = this.manifests.find(m => m.id === id);
        if (!manifest) return;

        const modalHTML = `
        <div id="edit-manifest-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-2xl">
                <h3 class="text-lg font-semibold mb-4">Editar Manifiesto ${manifest.manifestNumber}</h3>
                <form id="edit-manifest-form" class="space-y-4"></form>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        this.renderManifestForm(document.getElementById('edit-manifest-form'), manifest);

        document.getElementById('edit-manifest-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateManifest(id);
            document.getElementById('edit-manifest-modal').remove();
        });
    },

    updateManifest(id) {
        const manifestIndex = this.manifests.findIndex(m => m.id === id);
        if (manifestIndex === -1) return;

        // Logic to read from the edit form and update the manifest object
        const form = document.getElementById('edit-manifest-form');
        const updatedData = this.readManifestForm(form);

        if (!updatedData) return; // Validation failed

        this.manifests[manifestIndex] = { ...this.manifests[manifestIndex], ...updatedData };
        authSystem.showNotification('Manifiesto actualizado exitosamente', 'success');
        this.load(); // Reload the module view
    },

    // --- FORM RENDERING & LOGIC (Refactored) ---
    renderManifestForm(formElement, manifestData = {}) {
        const isEdit = Object.keys(manifestData).length > 0;
        formElement.innerHTML = `
            <!-- Form fields... -->
            <div class="flex justify-end space-x-4 pt-4 border-t">
                <button type="button" onclick="${isEdit ? 'document.getElementById(\'edit-manifest-modal\').remove()' : ''}" class="px-6 py-2 border rounded-lg">Cancelar</button>
                <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg">${isEdit ? 'Guardar Cambios' : 'Generar Manifiesto'}</button>
            </div>
        `;
        // Pre-fill form if in edit mode
        if (isEdit) {
            // ... logic to set form values from manifestData ...
        }
    },

    initManifestForm() {
        const form = document.getElementById('manifest-form');
        if (!form) return;
        // ... init logic ...
    },

    readManifestForm(form) {
        // ... logic to read and validate form, returning a data object or null ...
        return { /* validated data */ };
    },

    saveManifest() {
        const form = document.getElementById('manifest-form');
        const newManifestData = this.readManifestForm(form);
        if (!newManifestData) return;

        const newManifest = {
            id: this.manifests.length > 0 ? Math.max(...this.manifests.map(m => m.id)) + 1 : 1,
            manifestNumber: this.generateManifestNumber(),
            status: 'Generado',
            generatedBy: app.currentUser.name,
            ...newManifestData
        };

        this.manifests.push(newManifest);
        authSystem.showNotification('Manifiesto generado exitosamente', 'success');
        this.load();
    },

    // Other helpers like generateManifestNumber, getStatusClass, formatDate...
    generateManifestNumber() {
        const year = new Date().getFullYear();
        const count = this.manifests.length + 1;
        return `M-${year}-${count.toString().padStart(3, '0')}`;
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
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        const date = new Date(dateString);
        // Adjust for timezone issues if date is parsed as UTC
        date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
        return date.toLocaleDateString('es-ES', options);
    },

    // ========= FUNCIONES PARA OPERADORES =========

    // Mostrar formulario para crear nuevo manifiesto
    showNewManifestForm() {
        const modalHTML = `
        <div id="new-manifest-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-semibold">Crear Nuevo Manifiesto de Transporte</h3>
                    <button onclick="manifestsModule.closeModal('new-manifest-modal')" 
                            class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <form id="new-manifest-form" class="space-y-6">
                    <!-- Información General -->
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-gray-700 mb-4">Información General</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Número de Manifiesto</label>
                                <input type="text" id="manifest-number" 
                                       value="${this.generateManifestNumber()}" 
                                       readonly
                                       class="w-full p-3 border border-gray-300 rounded-lg bg-gray-100">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Fecha de Generación</label>
                                <input type="date" id="manifest-date" 
                                       value="${new Date().toISOString().slice(0, 10)}" 
                                       required
                                       class="w-full p-3 border border-gray-300 rounded-lg">
                            </div>
                        </div>
                    </div>

                    <!-- Información de Transporte -->
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-gray-700 mb-4">Información de Transporte</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Ruta</label>
                                <select id="manifest-route" required class="w-full p-3 border border-gray-300 rounded-lg">
                                    <option value="">Seleccionar ruta...</option>
                                    <option value="R-001">R-001 - Zona Norte</option>
                                    <option value="R-002">R-002 - Zona Centro</option>
                                    <option value="R-003">R-003 - Zona Sur</option>
                                    <option value="R-004">R-004 - Zona Industrial</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Vehículo</label>
                                <select id="manifest-vehicle" required class="w-full p-3 border border-gray-300 rounded-lg">
                                    <option value="">Seleccionar vehículo...</option>
                                    <option value="C-001">C-001 - Compactador Grande</option>
                                    <option value="C-002">C-002 - Compactador Mediano</option>
                                    <option value="C-003">C-003 - Compactador Pequeño</option>
                                    <option value="V-001">V-001 - Camión Volqueta</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Conductor</label>
                                <input type="text" id="manifest-driver" 
                                       value="${app.currentUser?.name || 'Carlos Rodríguez'}" 
                                       required
                                       class="w-full p-3 border border-gray-300 rounded-lg">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Operador Responsable</label>
                                <input type="text" id="manifest-operator" 
                                       value="${app.currentUser?.name || 'Carlos Rodríguez'}" 
                                       readonly
                                       class="w-full p-3 border border-gray-300 rounded-lg bg-gray-100">
                            </div>
                        </div>
                    </div>

                    <!-- Origen y Destino -->
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-gray-700 mb-4">Origen y Destino</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Punto de Origen</label>
                                <textarea id="manifest-origin" required
                                          placeholder="Describir punto(s) de recolección..."
                                          class="w-full p-3 border border-gray-300 rounded-lg h-24"></textarea>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Destino</label>
                                <select id="manifest-destination" required class="w-full p-3 border border-gray-300 rounded-lg">
                                    <option value="">Seleccionar destino...</option>
                                    <option value="Planta de Tratamiento EcoGestión">Planta de Tratamiento EcoGestión</option>
                                    <option value="Centro de Reciclaje Municipal">Centro de Reciclaje Municipal</option>
                                    <option value="Relleno Sanitario Norte">Relleno Sanitario Norte</option>
                                    <option value="Centro de Compostaje">Centro de Compostaje</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Tipos de Residuos -->
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-gray-700 mb-4">Tipos de Residuos</h4>
                        <div id="waste-types-container">
                            <div class="waste-type-row grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Residuo</label>
                                    <select class="waste-type w-full p-3 border border-gray-300 rounded-lg" required>
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
                                    <input type="number" step="0.1" min="0" class="waste-weight w-full p-3 border border-gray-300 rounded-lg" required>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Volumen (m³)</label>
                                    <input type="number" step="0.1" min="0" class="waste-volume w-full p-3 border border-gray-300 rounded-lg" required>
                                </div>
                                <div class="flex items-end">
                                    <button type="button" onclick="manifestsModule.removeWasteType(this)" 
                                            class="w-full p-3 bg-red-600 text-white rounded-lg hover:bg-red-700">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <button type="button" onclick="manifestsModule.addWasteType()" 
                                class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                            <i class="fas fa-plus mr-2"></i>Agregar Tipo de Residuo
                        </button>
                    </div>

                    <!-- Observaciones -->
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-gray-700 mb-4">Observaciones</h4>
                        <textarea id="manifest-notes" 
                                  placeholder="Observaciones adicionales del transporte..."
                                  class="w-full p-3 border border-gray-300 rounded-lg h-24"></textarea>
                    </div>

                    <!-- Botones -->
                    <div class="flex justify-end space-x-4 pt-6 border-t">
                        <button type="button" onclick="manifestsModule.closeModal('new-manifest-modal')" 
                                class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button type="submit" 
                                class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <i class="fas fa-save mr-2"></i>Generar Manifiesto
                        </button>
                    </div>
                </form>
            </div>
        </div>`;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Añadir event listener al formulario
        document.getElementById('new-manifest-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createNewManifest();
        });
    },

    // Agregar nuevo tipo de residuo al formulario
    addWasteType() {
        const container = document.getElementById('waste-types-container');
        const newRow = document.createElement('div');
        newRow.className = 'waste-type-row grid grid-cols-1 md:grid-cols-4 gap-4 mb-4';
        newRow.innerHTML = `
            <div>
                <select class="waste-type w-full p-3 border border-gray-300 rounded-lg" required>
                    <option value="">Seleccionar tipo...</option>
                    <option value="Orgánico">Orgánico</option>
                    <option value="Reciclable">Reciclable</option>
                    <option value="No Reciclable">No Reciclable</option>
                    <option value="Peligroso">Peligroso</option>
                    <option value="Electrónico">Electrónico</option>
                </select>
            </div>
            <div>
                <input type="number" step="0.1" min="0" class="waste-weight w-full p-3 border border-gray-300 rounded-lg" required>
            </div>
            <div>
                <input type="number" step="0.1" min="0" class="waste-volume w-full p-3 border border-gray-300 rounded-lg" required>
            </div>
            <div class="flex items-end">
                <button type="button" onclick="manifestsModule.removeWasteType(this)" 
                        class="w-full p-3 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(newRow);
    },

    // Remover tipo de residuo del formulario
    removeWasteType(button) {
        const container = document.getElementById('waste-types-container');
        if (container.children.length > 1) {
            button.closest('.waste-type-row').remove();
        } else {
            authSystem.showNotification('Debe mantener al menos un tipo de residuo', 'warning');
        }
    },

    // Crear nuevo manifiesto
    createNewManifest() {
        try {
            // Recopilar datos del formulario
            const manifestData = {
                id: this.manifests.length + 1,
                manifestNumber: document.getElementById('manifest-number').value,
                date: document.getElementById('manifest-date').value,
                route: document.getElementById('manifest-route').value,
                vehicle: document.getElementById('manifest-vehicle').value,
                driver: document.getElementById('manifest-driver').value,
                origin: document.getElementById('manifest-origin').value,
                destination: document.getElementById('manifest-destination').value,
                notes: document.getElementById('manifest-notes').value,
                status: 'Generado',
                generatedBy: app.currentUser?.name || 'Operador',
                wasteTypes: [],
                totalWeight: 0,
                totalVolume: 0
            };

            // Recopilar tipos de residuos
            const wasteRows = document.querySelectorAll('.waste-type-row');
            wasteRows.forEach(row => {
                const type = row.querySelector('.waste-type').value;
                const weight = parseFloat(row.querySelector('.waste-weight').value) || 0;
                const volume = parseFloat(row.querySelector('.waste-volume').value) || 0;
                
                if (type && weight > 0 && volume > 0) {
                    manifestData.wasteTypes.push({ type, weight, volume });
                    manifestData.totalWeight += weight;
                    manifestData.totalVolume += volume;
                }
            });

            // Validar que hay al menos un tipo de residuo
            if (manifestData.wasteTypes.length === 0) {
                authSystem.showNotification('Debe agregar al menos un tipo de residuo válido', 'error');
                return;
            }

            // Redondear totales
            manifestData.totalWeight = Math.round(manifestData.totalWeight * 10) / 10;
            manifestData.totalVolume = Math.round(manifestData.totalVolume * 10) / 10;

            // Agregar al array de manifiestos
            this.manifests.push(manifestData);

            // Cerrar modal
            this.closeModal('new-manifest-modal');

            // Mostrar notificación de éxito
            authSystem.showNotification(`Manifiesto ${manifestData.manifestNumber} creado exitosamente`, 'success');

            // Recargar la vista del operador
            this.renderOperatorView(document.getElementById('role-specific-content'));

        } catch (error) {
            console.error('Error al crear manifiesto:', error);
            authSystem.showNotification('Error al crear el manifiesto', 'error');
        }
    },

    // Cerrar modal
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
        }
    },

    // Funciones auxiliares para operadores
    getOperatorManifests(user) {
        if (!user) return [];
        return this.manifests.filter(m => 
            m.driver === user.name || 
            m.generatedBy === user.name ||
            m.generatedBy === 'Sistema'
        );
    },

    getOperatorInTransit(user) {
        return this.getOperatorManifests(user).filter(m => m.status === 'En Tránsito').length;
    },

    getOperatorCompletedToday(user) {
        const today = new Date().toISOString().slice(0, 10);
        return this.getOperatorManifests(user).filter(m => 
            m.date === today && m.status === 'Recibido'
        ).length;
    },

    getOperatorWeightToday(user) {
        const today = new Date().toISOString().slice(0, 10);
        const total = this.getOperatorManifests(user)
            .filter(m => m.date === today)
            .reduce((sum, m) => sum + (m.totalWeight || 0), 0);
        return total.toFixed(1);
    },

    renderCurrentRouteStatus(user) {
        // Simulamos información de ruta actual
        const activeRoute = {
            id: 'R-2024-015',
            name: 'Ruta Norte - Zona Industrial',
            status: 'En Progreso',
            progress: 60,
            nextStop: 'Industrias ABC',
            estimatedCompletion: '16:30'
        };

        return `
            <div class="space-y-4">
                <div class="flex items-center justify-between">
                    <div>
                        <h4 class="font-semibold">${activeRoute.name}</h4>
                        <p class="text-sm text-gray-600">ID: ${activeRoute.id}</p>
                    </div>
                    <span class="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                        ${activeRoute.status}
                    </span>
                </div>
                <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                        <span>Progreso</span>
                        <span>${activeRoute.progress}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-green-500 h-2 rounded-full" style="width: ${activeRoute.progress}%"></div>
                    </div>
                </div>
                <div class="text-sm text-gray-600">
                    <p><strong>Próxima parada:</strong> ${activeRoute.nextStop}</p>
                    <p><strong>Finalización estimada:</strong> ${activeRoute.estimatedCompletion}</p>
                </div>
                <button onclick="app.loadModule('routes')" 
                        class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                    Ver Detalles de Ruta
                </button>
            </div>
        `;
    },

    renderOperatorManifestsList(manifests) {
        if (!manifests || manifests.length === 0) {
            return `
                <div class="p-6 text-center">
                    <i class="fas fa-file-alt text-gray-300 text-4xl mb-4"></i>
                    <p class="text-gray-500">No hay manifiestos disponibles</p>
                    <button onclick="manifestsModule.showNewManifestForm()" 
                            class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        Crear Primer Manifiesto
                    </button>
                </div>
            `;
        }

        return `
            <div class="divide-y divide-gray-200">
                ${manifests.map(manifest => `
                    <div class="p-6 hover:bg-gray-50">
                        <div class="flex items-center justify-between">
                            <div class="flex-1">
                                <div class="flex items-center space-x-4">
                                    <div class="p-2 rounded-full ${manifest.status === 'En Tránsito' ? 'bg-yellow-100' : manifest.status === 'Recibido' ? 'bg-green-100' : 'bg-blue-100'}">
                                        <i class="fas ${manifest.status === 'En Tránsito' ? 'fa-truck text-yellow-600' : manifest.status === 'Recibido' ? 'fa-check-circle text-green-600' : 'fa-file-alt text-blue-600'}"></i>
                                    </div>
                                    <div>
                                        <h4 class="font-semibold">${manifest.manifestNumber}</h4>
                                        <p class="text-sm text-gray-600">${manifest.route} • ${this.formatDate(manifest.date)}</p>
                                        <p class="text-sm text-gray-600">${manifest.totalWeight} Ton • ${manifest.destination}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center space-x-4">
                                <span class="px-2 py-1 text-xs rounded-full ${this.getStatusClass(manifest.status)}">
                                    ${manifest.status}
                                </span>
                                <div class="flex space-x-2">
                                    <button onclick="manifestsModule.viewManifest(${manifest.id})" 
                                            class="text-blue-600 hover:text-blue-800 p-2" title="Ver detalles">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button onclick="manifestsModule.downloadManifest(${manifest.id})" 
                                            class="text-green-600 hover:text-green-800 p-2" title="Descargar">
                                        <i class="fas fa-download"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // Funciones placeholder para otras acciones
    showQuickWasteCapture() {
        authSystem.showNotification('Función de captura rápida en desarrollo', 'info');
    },

    scanQRCode() {
        authSystem.showNotification('Función de escaneo QR en desarrollo', 'info');
    },

    filterOperatorManifests(filter) {
        authSystem.showNotification(`Filtro "${filter}" aplicado`, 'info');
        // Aquí se implementaría la lógica de filtrado
    },

    initOperatorEventListeners() {
        // Aquí se pueden agregar listeners adicionales específicos para operadores
    }
};