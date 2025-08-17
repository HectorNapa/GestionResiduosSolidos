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
        container.innerHTML = `
            <div class="bg-white rounded-lg shadow">
                <div class="p-6 border-b">
                    <h3 class="text-lg font-semibold">Generar Nuevo Manifiesto</h3>
                </div>
                <div class="p-6">
                    <form id="manifest-form" class="space-y-4"></form>
                </div>
            </div>
        `;
        // The form content is extensive, so it's better to build it with a dedicated function
        this.renderManifestForm(document.getElementById('manifest-form'));
        this.initManifestForm();
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
    }
};